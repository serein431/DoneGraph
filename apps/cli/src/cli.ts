#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import {
  appendDoneGraphEvent,
  buildDoneGraphArtifacts,
  ensureWorkspace,
  pathsForWorkspace,
  readDoneGraphEvents
} from "./donegraphStorage.js";
import { buildCaptureEvents, buildRecapEvents, buildRecapEventsFromAnalysis } from "@donegraph/core";
import type { AccountabilityVerdict, DashboardLang, DoneGraphEvent, DoneGraphEventMetadata, DoneGraphEventType, DoneGraphPlatform, DoneGraphSafeSnapshot, EvidenceStatus, RecapAnalysis, RecapCommit, RecapTestResult } from "@donegraph/core";

interface SessionMemoryEntry {
  session_id: string;
  goal: string;
  verdict: AccountabilityVerdict;
  composite: number;
  progress_percent: number;
  evidence_passed: number;
  blockers: number;
  timestamp: string;
}

interface CrossSessionMemory {
  version: "1";
  sessions: SessionMemoryEntry[];
}

function memoryPath(): string {
  const home = process.env["HOME"] ?? process.env["USERPROFILE"] ?? ".";
  return path.join(home, ".donegraph", "memory.json");
}

function readMemory(): CrossSessionMemory {
  const filePath = memoryPath();
  if (!fs.existsSync(filePath)) return { version: "1", sessions: [] };
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as CrossSessionMemory;
    if (parsed.version === "1" && Array.isArray(parsed.sessions)) return parsed;
  } catch {
    // fall through
  }
  return { version: "1", sessions: [] };
}

function writeMemory(memory: CrossSessionMemory): void {
  const dir = path.dirname(memoryPath());
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(memoryPath(), `${JSON.stringify(memory, null, 2)}\n`, "utf8");
}

function sessionIdFor(goal: string, timestamp: string): string {
  return crypto.createHash("sha256").update(`${goal}|${timestamp}`).digest("hex").slice(0, 12);
}

function printMemoryInsights(memory: CrossSessionMemory, write: WriteLine): void {
  if (memory.sessions.length === 0) return;
  const recent = memory.sessions.slice(-5);
  write("");
  write(`Cross-session memory: ${memory.sessions.length} previous session(s).`);
  const avgScore = Math.round(recent.reduce((sum, s) => sum + s.composite, 0) / recent.length);
  write(`  Recent accountability average: ${avgScore}/100`);
  const blockerSessions = recent.filter((s) => s.blockers > 0);
  if (blockerSessions.length > 0) {
    write(`  ${blockerSessions.length}/${recent.length} recent sessions had blockers.`);
  }
  const lastSession = memory.sessions[memory.sessions.length - 1]!;
  write(`  Last session: "${lastSession.goal}" — ${lastSession.verdict} (${lastSession.composite}/100)`);
}

type WriteLine = (line: string) => void;

interface RunCliOptions {
  cwd?: string;
  now?: () => string;
  uuid?: () => string;
  write?: WriteLine;
  openFile?: (filePath: string) => void;
  fetch?: typeof fetch;
}

interface ParsedCommand {
  command: string;
  workspacePath: string;
  options: Map<string, string | true>;
  positionals: string[];
}

interface CaptureFingerprintStore {
  version: "1.0.0";
  generatedAt: string;
  files: Record<string, string>;
}

const eventTypes = new Set<DoneGraphEventType>([
  "goal",
  "decision",
  "action",
  "artifact",
  "verification",
  "blocker",
  "completion"
]);

const platforms = new Set<DoneGraphPlatform>(["codex", "claude", "cursor", "generic"]);
const statuses = new Set<EvidenceStatus>(["pass", "fail", "unknown", "blocked"]);
const booleanOptions = new Set(["blocked", "fail", "no-open", "pass", "unknown", "verify"]);

const shortcutCommands = new Map<string, DoneGraphEventType>([
  ["action", "action"],
  ["artifact", "artifact"],
  ["block", "blocker"],
  ["checkpoint", "action"],
  ["decide", "decision"],
  ["done", "completion"],
  ["proof", "verification"],
  ["verify", "verification"]
]);

function usage(): string {
  return [
    "Usage:",
    "  donegraph start <goal> [--platform codex|claude|cursor|generic] [--workspace <path>]",
    "  donegraph record <type> <text> [--path <file>] [--command <cmd>] [--status pass|fail|unknown|blocked] [--workspace <path>]",
    "  donegraph checkpoint <text> [--command <cmd>] [--workspace <path>]",
    "  donegraph proof <text> --pass|--fail|--unknown|--blocked [--command <cmd>] [--workspace <path>]",
    "  donegraph done <text> [--workspace <path>]",
    "  donegraph capture [--goal <goal>] [--platform codex|claude|cursor|generic] [--verify] [--workspace <path>]",
    "  donegraph snapshot [--workspace <path>]",
    "  donegraph publish [--target https://donegraph.space] [--upload-token <token>] [--workspace <path>]",
    "  donegraph build [--workspace <path>]",
    "  donegraph recap [--last <n>] [--since <time>] [--goal <goal>] [--lang en|zh] [--no-open] [--workspace <path>]",
    "  donegraph dashboard [--workspace <path>] [--no-open] [--lang en|zh]",
    "  donegraph summary [--workspace <path>]",
    "",
    "Examples:",
    "  donegraph start \"Ship the hackathon demo\" --platform codex",
    "  donegraph checkpoint \"Implemented CLI\" --command \"npm test\"",
    "  donegraph proof \"Tests passed\" --pass --command \"npm test\"",
    "  donegraph capture --goal \"Make AI progress visible\" --platform codex --verify",
    "  donegraph snapshot",
    "  DONEGRAPH_UPLOAD_TOKEN=<token> donegraph publish --target https://donegraph.space",
    "  donegraph done \"The demo is ready\"",
    "  donegraph dashboard --no-open"
  ].join("\n");
}

function readPackageJson(workspacePath: string): Record<string, unknown> | undefined {
  const packagePath = path.join(workspacePath, "package.json");
  if (!fs.existsSync(packagePath)) return undefined;
  try {
    return JSON.parse(fs.readFileSync(packagePath, "utf8")) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

function packageScriptsFor(workspacePath: string): string[] {
  const parsed = readPackageJson(workspacePath);
  const scripts = parsed?.scripts;
  if (!scripts || typeof scripts !== "object" || Array.isArray(scripts)) return [];
  const preferred = ["test", "typecheck", "build", "lint", "demo"];
  const names = Object.keys(scripts as Record<string, unknown>);
  return [
    ...preferred.filter((name) => names.includes(name)),
    ...names.filter((name) => !preferred.includes(name))
  ].slice(0, 5);
}

function commandForScript(script: string): string {
  return script === "test" ? "npm test" : `npm run ${script}`;
}

function projectNameFor(workspacePath: string): string | undefined {
  const parsed = readPackageJson(workspacePath);
  return typeof parsed?.name === "string" ? parsed.name : undefined;
}

function fallbackWorkspaceFiles(workspacePath: string): string[] {
  const ignored = new Set([".donegraph", ".git", "node_modules", "dist", "build", "coverage"]);
  const output: string[] = [];
  function walk(dir: string, depth: number): void {
    if (depth > 3 || output.length >= 30) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(absolute, depth + 1);
      } else if (entry.isFile()) {
        output.push(path.relative(workspacePath, absolute).replaceAll(path.sep, "/"));
      }
      if (output.length >= 30) break;
    }
  }
  walk(workspacePath, 0);
  return output.sort();
}

function changedFilesFor(workspacePath: string): string[] {
  try {
    const raw = execFileSync("git", ["-C", workspacePath, "status", "--short", "--untracked-files=normal"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    const files = raw
      .split(/\r?\n/)
      .map((line) => line.slice(3).trim())
      .filter(Boolean)
      .map((line) => line.replace(/^"|"$/g, ""))
      .filter((line) => !line.startsWith(".donegraph/"));
    return [...new Set(files)];
  } catch {
    return fallbackWorkspaceFiles(workspacePath);
  }
}

function recapReadGitLog(workspacePath: string, lastN: number, since?: string): RecapCommit[] {
  try {
    const args = ["-C", workspacePath, "log", `--max-count=${lastN}`, "--format=%H|%s|%aI|%an"];
    if (since) args.push(`--since=${since}`);
    const raw = execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return raw.split(/\r?\n/).filter(Boolean).map((line) => {
      const [hash = "", message = "", timestamp = ""] = line.split("|");
      let filesChanged = 0;
      try {
        const stat = execFileSync("git", ["-C", workspacePath, "diff", "--shortstat", `${hash}~1`, hash], {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"]
        });
        const match = stat.match(/(\d+) files? changed/);
        if (match) filesChanged = parseInt(match[1]!, 10);
      } catch { /* first commit or other edge case */ }
      return { hash, message, timestamp, filesChanged };
    });
  } catch {
    return [];
  }
}

function recapGitDiffStat(workspacePath: string, since?: string): string {
  try {
    if (since) {
      const raw = execFileSync("git", ["-C", workspacePath, "diff", "--stat", `HEAD@{${since}}`], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"]
      });
      return raw.trim();
    }
    const raw = execFileSync("git", ["-C", workspacePath, "diff", "--stat", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return raw.trim();
  } catch {
    return "";
  }
}

function fileContentHash(workspacePath: string, filePath: string): string | undefined {
  const absolute = path.join(workspacePath, filePath);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) return undefined;
  return crypto.createHash("sha256").update(fs.readFileSync(absolute)).digest("hex");
}

function readCaptureFingerprints(workspacePath: string): CaptureFingerprintStore | undefined {
  const filePath = pathsForWorkspace(workspacePath).fingerprintsJson;
  if (!fs.existsSync(filePath)) return undefined;
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8")) as CaptureFingerprintStore;
    if (parsed.version !== "1.0.0" || !parsed.files || typeof parsed.files !== "object") return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

function changedSinceLastCapture(workspacePath: string, files: string[]): string[] {
  const previous = readCaptureFingerprints(workspacePath);
  if (!previous) return files;
  return files.filter((filePath) => {
    const hash = fileContentHash(workspacePath, filePath);
    return hash !== previous.files[filePath];
  });
}

function writeCaptureFingerprints(workspacePath: string, files: string[], generatedAt: string): void {
  const paths = pathsForWorkspace(workspacePath);
  const hashes: Record<string, string> = {};
  for (const filePath of [...files].sort()) {
    const hash = fileContentHash(workspacePath, filePath);
    if (hash) hashes[filePath] = hash;
  }
  const store: CaptureFingerprintStore = {
    version: "1.0.0",
    generatedAt,
    files: hashes
  };
  fs.writeFileSync(paths.fingerprintsJson, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function parseArgs(argv: string[], cwd: string): ParsedCommand {
  const args = [...argv];
  const command = args.shift();
  if (!command || command === "--help" || command === "-h") {
    throw new Error(usage());
  }

  const options = new Map<string, string | true>();
  const positionals: string[] = [];
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (!key) continue;
    if (!key.startsWith("--")) {
      positionals.push(key);
      continue;
    }
    const equalIndex = key.indexOf("=");
    if (equalIndex > 2) {
      options.set(key.slice(2, equalIndex), key.slice(equalIndex + 1));
      continue;
    }
    const name = key.slice(2);
    const next = args[index + 1];
    if (booleanOptions.has(name)) {
      options.set(name, true);
    } else {
      if (!next || next.startsWith("--")) throw new Error(`Missing value for --${name}\n\n${usage()}`);
      options.set(name, next);
      index += 1;
    }
  }

  return {
    command,
    workspacePath: String(options.get("workspace") ?? cwd),
    options,
    positionals
  };
}

function requireString(options: Map<string, string | true>, key: string): string {
  const value = options.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`--${key} is required\n\n${usage()}`);
  }
  return value;
}

function optionalString(options: Map<string, string | true>, key: string): string | undefined {
  const value = options.get(key);
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function requireText(value: string | undefined, label: string): string {
  if (!value || value.trim().length === 0) throw new Error(`${label} is required\n\n${usage()}`);
  return value.trim();
}

function positionalText(positionals: string[], start = 0): string | undefined {
  const value = positionals.slice(start).join(" ").trim();
  return value.length > 0 ? value : undefined;
}

function platformFrom(value: string | undefined): DoneGraphPlatform {
  const platform = (value ?? "generic") as DoneGraphPlatform;
  if (!platforms.has(platform)) throw new Error(`Invalid platform: ${value}`);
  return platform;
}

function eventTypeFrom(value: string): DoneGraphEventType {
  const type = value as DoneGraphEventType;
  if (!eventTypes.has(type)) throw new Error(`Invalid event type: ${value}`);
  return type;
}

function statusFrom(value: string | undefined): EvidenceStatus | undefined {
  if (!value) return undefined;
  const status = value as EvidenceStatus;
  if (!statuses.has(status)) throw new Error(`Invalid status: ${value}`);
  return status;
}

function statusFromFlags(options: Map<string, string | true>): EvidenceStatus | undefined {
  const selected = Array.from(statuses).filter((status) => options.has(status));
  if (selected.length > 1) throw new Error(`Choose only one status flag: --pass, --fail, --unknown, or --blocked`);
  return selected[0];
}

function metadataFrom(options: Map<string, string | true>, defaultStatus?: EvidenceStatus): DoneGraphEventMetadata {
  return {
    path: optionalString(options, "path"),
    command: optionalString(options, "command"),
    status: statusFromFlags(options) ?? statusFrom(optionalString(options, "status")) ?? defaultStatus
  };
}

function platformForEvent(parsed: ParsedCommand): DoneGraphPlatform {
  const existing = readDoneGraphEvents(parsed.workspacePath);
  return platformFrom(optionalString(parsed.options, "platform") ?? existing[0]?.platform ?? "generic");
}

function recordEvent(input: {
  parsed: ParsedCommand;
  type: DoneGraphEventType;
  text: string;
  metadata: DoneGraphEventMetadata;
  now: () => string;
  uuid: () => string;
  write: WriteLine;
}): number {
  appendDoneGraphEvent(
    input.parsed.workspacePath,
    makeEvent({
      type: input.type,
      text: input.text,
      platform: platformForEvent(input.parsed),
      metadata: input.metadata,
      now: input.now,
      uuid: input.uuid
    })
  );
  const { graph } = buildDoneGraphArtifacts(input.parsed.workspacePath, input.now());
  input.write(`Recorded ${input.type}. Progress is now ${graph.summary.progress_percent}%.`);
  printArtifacts(input.write, input.parsed.workspacePath);
  return 0;
}

function makeEvent(input: {
  type: DoneGraphEventType;
  text: string;
  platform: DoneGraphPlatform;
  metadata: DoneGraphEventMetadata;
  now: () => string;
  uuid: () => string;
}): DoneGraphEvent {
  return {
    id: `dg_evt_${input.uuid()}`,
    timestamp: input.now(),
    platform: input.platform,
    type: input.type,
    text: input.text.trim(),
    metadata: input.metadata
  };
}

function runVerificationCommands(input: {
  workspacePath: string;
  platform: DoneGraphPlatform;
  packageScripts: string[];
  now: () => string;
  uuid: () => string;
}): DoneGraphEvent[] {
  return input.packageScripts.slice(0, 3).map((script, index) => {
    const command = commandForScript(script);
    let status: EvidenceStatus = "pass";
    try {
      execFileSync(command, {
        cwd: input.workspacePath,
        shell: true,
        stdio: "ignore"
      });
    } catch {
      status = "fail";
    }
    return makeEvent({
      type: "verification",
      text: status === "pass" ? `真实运行验证命令并通过：${command}` : `真实运行验证命令但失败：${command}`,
      platform: input.platform,
      metadata: {
        command,
        status,
        source: "capture-verify"
      },
      now: input.now,
      uuid: () => `${input.uuid()}_${index + 1}`
    });
  });
}

function openDashboardFile(filePath: string): void {
  const opener =
    process.platform === "darwin"
      ? { command: "open", args: [filePath] }
      : process.platform === "win32"
        ? { command: "cmd", args: ["/c", "start", "", filePath] }
        : { command: "xdg-open", args: [filePath] };
  const child = spawn(opener.command, opener.args, {
    detached: true,
    stdio: "ignore"
  });
  child.unref();
}

function printArtifacts(write: WriteLine, workspacePath: string): void {
  const paths = pathsForWorkspace(workspacePath);
  write(`DoneGraph artifacts written:`);
  write(`- ${paths.sessionLog}`);
  write(`- ${paths.graphJson}`);
  write(`- ${paths.achievementLog}`);
  write(`- ${paths.nextSteps}`);
  write(`- ${paths.dashboardHtml}`);
  write(`- ${paths.safeSnapshotJson}`);
}

async function publishSafeSnapshot(input: {
  target: string;
  snapshot: DoneGraphSafeSnapshot;
  uploadToken?: string;
  fetcher?: typeof fetch;
}): Promise<{ id?: string; url?: string; share_url?: string }> {
  const baseUrl = input.target.endsWith("/") ? input.target : `${input.target}/`;
  const endpoint = new URL("/api/snapshots", baseUrl);
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (input.uploadToken) headers["x-donegraph-upload-token"] = input.uploadToken;
  const response = await (input.fetcher ?? fetch)(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(input.snapshot)
  });
  const body = await response.text();
  let parsed: unknown;
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    parsed = { error: body };
  }
  if (!response.ok) {
    const error = parsed && typeof parsed === "object" && "error" in parsed ? String(parsed.error) : `HTTP ${response.status}`;
    throw new Error(error);
  }
  return parsed as { id?: string; url?: string; share_url?: string };
}

export async function runDoneGraphCli(argv: string[], options: RunCliOptions = {}): Promise<number> {
  const cwd = options.cwd ?? process.env.INIT_CWD ?? process.cwd();
  const write = options.write ?? ((line) => process.stdout.write(`${line}\n`));
  const now = options.now ?? (() => new Date().toISOString());
  const uuid = options.uuid ?? (() => crypto.randomUUID());
  const parsed = parseArgs(argv, cwd);
  ensureWorkspace(parsed.workspacePath);

  if (parsed.command === "start") {
    const goal = requireText(optionalString(parsed.options, "goal") ?? positionalText(parsed.positionals), "Goal");
    const platform = platformFrom(optionalString(parsed.options, "platform"));
    appendDoneGraphEvent(
      parsed.workspacePath,
      makeEvent({
        type: "goal",
        text: goal,
        platform,
        metadata: {},
        now,
        uuid
      })
    );
    const { graph } = buildDoneGraphArtifacts(parsed.workspacePath, now());
    write(`DoneGraph started for ${platform}: ${graph.goal}`);
    printArtifacts(write, parsed.workspacePath);
    printMemoryInsights(readMemory(), write);
    return 0;
  }

  if (parsed.command === "record") {
    const positionalType = eventTypes.has(parsed.positionals[0] as DoneGraphEventType)
      ? parsed.positionals[0]
      : undefined;
    const type = eventTypeFrom(requireText(optionalString(parsed.options, "type") ?? positionalType, "Event type"));
    const text = requireText(
      optionalString(parsed.options, "text") ?? positionalText(parsed.positionals, positionalType ? 1 : 0),
      "Text"
    );
    return recordEvent({
      parsed,
      type,
      text,
      metadata: metadataFrom(parsed.options),
      now,
      uuid,
      write
    });
  }

  if (parsed.command === "capture") {
    const platform = platformForEvent(parsed);
    const existingEvents = readDoneGraphEvents(parsed.workspacePath);
    const packageScripts = packageScriptsFor(parsed.workspacePath);
    const allChangedFiles = changedFilesFor(parsed.workspacePath);
    const changedFiles = changedSinceLastCapture(parsed.workspacePath, allChangedFiles);
    const hasExistingGoal = existingEvents.some((event) => event.type === "goal");
    const shouldVerify = parsed.options.has("verify");
    const capturedEvents = buildCaptureEvents({
      platform,
      goal: optionalString(parsed.options, "goal") ?? positionalText(parsed.positionals),
      projectName: projectNameFor(parsed.workspacePath),
      changedFiles,
      packageScripts,
      existingEvents,
      now,
      uuid
    }).filter(
      (event) =>
        (changedFiles.length > 0 || !hasExistingGoal || event.type === "goal") &&
        !(shouldVerify && event.type === "verification")
    );

    for (const event of capturedEvents) appendDoneGraphEvent(parsed.workspacePath, event);
    const verificationEvents = shouldVerify
      ? runVerificationCommands({
          workspacePath: parsed.workspacePath,
          platform,
          packageScripts,
          now,
          uuid
        })
      : [];
    for (const event of verificationEvents) appendDoneGraphEvent(parsed.workspacePath, event);
    const { graph } = buildDoneGraphArtifacts(parsed.workspacePath, now());
    writeCaptureFingerprints(parsed.workspacePath, allChangedFiles, now());
    if (capturedEvents.length === 0 && verificationEvents.length === 0) {
      write("No project file changes since last capture. Reused the existing progress graph.");
    }
    if (verificationEvents.length > 0) {
      write(`Verified ${verificationEvents.length} command${verificationEvents.length === 1 ? "" : "s"}.`);
    }
    write(`Captured ${capturedEvents.length} context events. Progress is now ${graph.summary.progress_percent}%.`);
    printArtifacts(write, parsed.workspacePath);
    return 0;
  }

  if (parsed.command === "snapshot") {
    const { graph, paths } = buildDoneGraphArtifacts(parsed.workspacePath, now());
    write(`Safe snapshot created for ${graph.goal || "this run"}.`);
    write("Privacy: raw session, full chat, file contents, local paths, and secret-looking values are excluded.");
    write(`Snapshot: ${paths.safeSnapshotJson}`);
    write(`Readable copy: ${paths.safeSnapshotMarkdown}`);
    return 0;
  }

  if (parsed.command === "publish") {
    const { paths } = buildDoneGraphArtifacts(parsed.workspacePath, now());
    const snapshot = JSON.parse(fs.readFileSync(paths.safeSnapshotJson, "utf8")) as DoneGraphSafeSnapshot;
    const target = optionalString(parsed.options, "target") ?? process.env.DONEGRAPH_TARGET ?? "https://donegraph.space";
    const uploadToken = optionalString(parsed.options, "upload-token") ?? process.env.DONEGRAPH_UPLOAD_TOKEN;
    try {
      const result = await publishSafeSnapshot({ target, snapshot, uploadToken, fetcher: options.fetch });
      const baseUrl = target.endsWith("/") ? target.slice(0, -1) : target;
      const shareUrl = result.share_url ?? result.url ?? (result.id ? `${baseUrl}/share?id=${encodeURIComponent(result.id)}` : `${baseUrl}/share`);
      write(`Safe snapshot published: ${shareUrl}`);
      return 0;
    } catch (error) {
      write(`Cloud upload did not finish: ${error instanceof Error ? error.message : String(error)}`);
      write(`Safe snapshot stayed local: ${paths.safeSnapshotJson}`);
      write(`Open ${target.replace(/\/$/, "")}/share and import that file for a local review.`);
      return 0;
    }
  }

  const shortcutType = shortcutCommands.get(parsed.command);
  if (shortcutType) {
    const defaultStatus = parsed.command === "block" ? "blocked" : undefined;
    const text = requireText(optionalString(parsed.options, "text") ?? positionalText(parsed.positionals), "Text");
    const result = recordEvent({
      parsed,
      type: shortcutType,
      text,
      metadata: metadataFrom(parsed.options, defaultStatus),
      now,
      uuid,
      write
    });
    if (parsed.command === "done") {
      const { graph } = buildDoneGraphArtifacts(parsed.workspacePath, now());
      const memory = readMemory();
      const timestamp = now();
      memory.sessions.push({
        session_id: sessionIdFor(graph.goal, timestamp),
        goal: graph.goal,
        verdict: graph.accountability.verdict,
        composite: graph.accountability.composite,
        progress_percent: graph.summary.progress_percent,
        evidence_passed: graph.summary.evidence_passed,
        blockers: graph.summary.blockers,
        timestamp
      });
      writeMemory(memory);
      write(`Session saved to cross-session memory (${memory.sessions.length} total).`);
    }
    return result;
  }

  if (parsed.command === "recap") {
    const langValue = optionalString(parsed.options, "lang");
    const dashboardLang: DashboardLang = langValue === "zh" ? "zh" : "en";
    const lastN = parseInt(optionalString(parsed.options, "last") ?? "20", 10);
    const since = optionalString(parsed.options, "since");
    const goal = optionalString(parsed.options, "goal");

    write("Scanning git history...");
    const commits = recapReadGitLog(parsed.workspacePath, lastN, since);
    const changedFiles = changedFilesFor(parsed.workspacePath);
    const diffStat = recapGitDiffStat(parsed.workspacePath, since);
    write(`  ${commits.length} commits, ${changedFiles.length} files changed`);

    write("Running project checks...");
    const scripts = packageScriptsFor(parsed.workspacePath).filter((s) => ["test", "typecheck", "build", "lint"].includes(s));
    const testResults: RecapTestResult[] = [];
    for (const script of scripts) {
      const cmd = commandForScript(script);
      write(`  Running ${cmd}...`);
      const start = Date.now();
      try {
        execFileSync("npm", script === "test" ? ["test"] : ["run", script], {
          cwd: parsed.workspacePath,
          stdio: "ignore",
          timeout: 120_000
        });
        testResults.push({ script: cmd, passed: true, duration_ms: Date.now() - start });
        write(`    PASS (${((Date.now() - start) / 1000).toFixed(1)}s)`);
      } catch {
        testResults.push({ script: cmd, passed: false, duration_ms: Date.now() - start });
        write(`    FAIL (${((Date.now() - start) / 1000).toFixed(1)}s)`);
      }
    }

    const platform = platformFrom(optionalString(parsed.options, "platform") ?? "generic");
    const analysisFile = optionalString(parsed.options, "analysis");
    let analysis: RecapAnalysis | undefined;

    if (analysisFile) {
      try {
        analysis = JSON.parse(fs.readFileSync(path.resolve(parsed.workspacePath, analysisFile), "utf8")) as RecapAnalysis;
        write(`Using AI analysis from ${analysisFile}`);
      } catch (err) {
        write(`Warning: could not read analysis file, falling back to rule-based recap`);
      }
    }

    let events: DoneGraphEvent[];
    if (analysis) {
      events = buildRecapEventsFromAnalysis(analysis, testResults, platform, now, uuid);
    } else {
      events = buildRecapEvents({
        commits,
        changedFiles,
        diffStat,
        testResults,
        platform,
        projectName: projectNameFor(parsed.workspacePath),
        goal,
        now,
        uuid
      });
    }

    for (const event of events) {
      appendDoneGraphEvent(parsed.workspacePath, event);
    }
    const { graph: rawGraph, paths } = buildDoneGraphArtifacts(parsed.workspacePath, now(), dashboardLang);
    const graph = analysis
      ? { ...rawGraph, ai_analysis: { story: analysis.story, risks: analysis.risks, insights: analysis.insights } }
      : rawGraph;
    if (analysis) {
      const artifactPath = path.join(parsed.workspacePath, ".donegraph", "dashboard.html");
      const { renderDashboardHtml } = await import("@donegraph/core");
      fs.writeFileSync(artifactPath, renderDashboardHtml(graph, dashboardLang), "utf8");
    }

    write("");
    write("=== RECAP ===");
    write("");
    write(`Goal: ${graph.goal}`);
    write(`Progress: ${graph.summary.progress_percent}%`);
    write(`Accountability: ${graph.accountability.verdict} (${graph.accountability.composite}/100)`);
    write("");
    if (commits.length > 0) {
      write(`Commits:`);
      for (const c of commits.slice(0, 8)) {
        write(`  ${c.hash.slice(0, 7)} ${c.message}`);
      }
      if (commits.length > 8) write(`  ... and ${commits.length - 8} more`);
      write("");
    }
    if (testResults.length > 0) {
      write(`Checks:`);
      for (const r of testResults) {
        write(`  ${r.passed ? "PASS" : "FAIL"} ${r.script}${r.duration_ms ? ` (${(r.duration_ms / 1000).toFixed(1)}s)` : ""}`);
      }
      write("");
    }
    write(`Score breakdown:`);
    for (const dim of graph.accountability.dimensions) {
      const bar = "█".repeat(Math.round(dim.score / 10)) + "░".repeat(10 - Math.round(dim.score / 10));
      write(`  ${bar} ${dim.score}  ${dim.label}`);
    }
    write("");

    const memory = readMemory();
    memory.sessions.push({
      session_id: sessionIdFor(graph.goal, now()),
      goal: graph.goal,
      verdict: graph.accountability.verdict,
      composite: graph.accountability.composite,
      progress_percent: graph.summary.progress_percent,
      evidence_passed: graph.summary.evidence_passed,
      blockers: graph.summary.blockers,
      timestamp: now()
    });
    writeMemory(memory);

    write(`Dashboard: ${paths.dashboardHtml}`);
    if (!parsed.options.has("no-open")) {
      (options.openFile ?? openDashboardFile)(paths.dashboardHtml);
    }
    return 0;
  }

  if (parsed.command === "build") {
    const { graph } = buildDoneGraphArtifacts(parsed.workspacePath, now());
    write(`Built DoneGraph with ${graph.nodes.length} nodes and ${graph.achievements.length} achievements.`);
    printArtifacts(write, parsed.workspacePath);
    return 0;
  }

  if (parsed.command === "dashboard") {
    const langValue = optionalString(parsed.options, "lang");
    const dashboardLang: DashboardLang | undefined = langValue === "en" ? "en" : langValue === "zh" ? "zh" : undefined;
    const { paths } = buildDoneGraphArtifacts(parsed.workspacePath, now(), dashboardLang);
    write(`DoneGraph dashboard: ${paths.dashboardHtml}`);
    if (!parsed.options.has("no-open")) {
      (options.openFile ?? openDashboardFile)(paths.dashboardHtml);
    }
    return 0;
  }

  if (parsed.command === "summary") {
    const { graph, paths } = buildDoneGraphArtifacts(parsed.workspacePath, now());
    write(`# DoneGraph Summary`);
    write("");
    write(`Goal: ${graph.goal || "Not started"}`);
    write("");
    write(graph.narrative);
    write("");
    write(`Accountability: ${graph.accountability.verdict} (${graph.accountability.composite}/100)`);
    for (const dim of graph.accountability.dimensions) {
      write(`  ${dim.label}: ${dim.score}/100 (weight ${dim.weight})${dim.hard_gate_failed ? " [HARD GATE FAILED]" : ""}`);
    }
    if (graph.accountability.hard_gate_failures.length > 0) {
      write(`  Hard gate failures: ${graph.accountability.hard_gate_failures.join(", ")}`);
    }
    write("");
    write(`Artifacts: ${paths.achievementLog}, ${paths.nextSteps}`);
    write("");
    write("Next steps:");
    graph.next_steps.forEach((step, index) => write(`${index + 1}. ${step}`));
    return 0;
  }

  throw new Error(`Unknown command: ${parsed.command}\n\n${usage()}`);
}

async function main(): Promise<void> {
  try {
    process.exitCode = await runDoneGraphCli(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

function isDirectCliInvocation(): boolean {
  if (!process.argv[1]) return false;
  if (import.meta.url === pathToFileURL(process.argv[1]).href) return true;
  return /[/\\]donegraph$/.test(process.argv[1]);
}

if (isDirectCliInvocation()) {
  void main();
}
