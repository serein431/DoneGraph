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
import { buildCaptureEvents } from "@donegraph/core";
import type { DoneGraphEvent, DoneGraphEventMetadata, DoneGraphEventType, DoneGraphPlatform, EvidenceStatus } from "@donegraph/core";

type WriteLine = (line: string) => void;

interface RunCliOptions {
  cwd?: string;
  now?: () => string;
  uuid?: () => string;
  write?: WriteLine;
  openFile?: (filePath: string) => void;
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
    "  donegraph build [--workspace <path>]",
    "  donegraph dashboard [--workspace <path>] [--no-open]",
    "  donegraph summary [--workspace <path>]",
    "",
    "Examples:",
    "  donegraph start \"Ship the hackathon demo\" --platform codex",
    "  donegraph checkpoint \"Implemented CLI\" --command \"npm test\"",
    "  donegraph proof \"Tests passed\" --pass --command \"npm test\"",
    "  donegraph capture --goal \"Make AI progress visible\" --platform codex --verify",
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

  const shortcutType = shortcutCommands.get(parsed.command);
  if (shortcutType) {
    const defaultStatus = parsed.command === "block" ? "blocked" : undefined;
    const text = requireText(optionalString(parsed.options, "text") ?? positionalText(parsed.positionals), "Text");
    return recordEvent({
      parsed,
      type: shortcutType,
      text,
      metadata: metadataFrom(parsed.options, defaultStatus),
      now,
      uuid,
      write
    });
  }

  if (parsed.command === "build") {
    const { graph } = buildDoneGraphArtifacts(parsed.workspacePath, now());
    write(`Built DoneGraph with ${graph.nodes.length} nodes and ${graph.achievements.length} achievements.`);
    printArtifacts(write, parsed.workspacePath);
    return 0;
  }

  if (parsed.command === "dashboard") {
    const { paths } = buildDoneGraphArtifacts(parsed.workspacePath, now());
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
