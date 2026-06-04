import fs from "node:fs";
import path from "node:path";
import {
  buildDoneGraph,
  renderAchievementLog,
  renderDashboardHtml,
  renderNextSteps
} from "@donegraph/core";
import type { DoneGraph, DoneGraphEvent, DoneGraphEventType, DoneGraphPlatform } from "@donegraph/core";

export interface DoneGraphPaths {
  workspace: string;
  dir: string;
  sessionLog: string;
  graphJson: string;
  achievementLog: string;
  nextSteps: string;
  dashboardHtml: string;
  fingerprintsJson: string;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isDoneGraphEvent(value: unknown): value is DoneGraphEvent {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || typeof value.timestamp !== "string" || typeof value.text !== "string") {
    return false;
  }
  if (!platforms.has(value.platform as DoneGraphPlatform)) return false;
  if (!eventTypes.has(value.type as DoneGraphEventType)) return false;
  return isRecord(value.metadata);
}

export function pathsForWorkspace(workspacePath: string): DoneGraphPaths {
  const workspace = path.resolve(workspacePath);
  return {
    workspace,
    dir: path.join(workspace, ".donegraph"),
    sessionLog: path.join(workspace, ".donegraph", "session.jsonl"),
    graphJson: path.join(workspace, ".donegraph", "task-graph.json"),
    achievementLog: path.join(workspace, ".donegraph", "achievement-log.md"),
    nextSteps: path.join(workspace, ".donegraph", "next-steps.md"),
    dashboardHtml: path.join(workspace, ".donegraph", "dashboard.html"),
    fingerprintsJson: path.join(workspace, ".donegraph", "fingerprints.json")
  };
}

export function ensureWorkspace(workspacePath: string): DoneGraphPaths {
  const paths = pathsForWorkspace(workspacePath);
  if (!fs.existsSync(paths.workspace)) {
    throw new Error(`Workspace does not exist: ${paths.workspace}`);
  }
  fs.mkdirSync(paths.dir, { recursive: true });
  return paths;
}

export function appendDoneGraphEvent(workspacePath: string, event: DoneGraphEvent): DoneGraphPaths {
  const paths = ensureWorkspace(workspacePath);
  fs.appendFileSync(paths.sessionLog, `${JSON.stringify(event)}\n`, "utf8");
  return paths;
}

export function readDoneGraphEvents(workspacePath: string): DoneGraphEvent[] {
  const paths = ensureWorkspace(workspacePath);
  if (!fs.existsSync(paths.sessionLog)) return [];
  return fs
    .readFileSync(paths.sessionLog, "utf8")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      const parsed = JSON.parse(line) as unknown;
      if (!isDoneGraphEvent(parsed)) {
        throw new Error(`Invalid DoneGraph event at ${paths.sessionLog}:${index + 1}`);
      }
      return parsed;
    });
}

export function writeDoneGraphArtifacts(workspacePath: string, graph: DoneGraph): DoneGraphPaths {
  const paths = ensureWorkspace(workspacePath);
  fs.writeFileSync(paths.graphJson, `${JSON.stringify(graph, null, 2)}\n`, "utf8");
  fs.writeFileSync(paths.achievementLog, renderAchievementLog(graph), "utf8");
  fs.writeFileSync(paths.nextSteps, renderNextSteps(graph), "utf8");
  fs.writeFileSync(paths.dashboardHtml, renderDashboardHtml(graph), "utf8");
  return paths;
}

export function buildDoneGraphArtifacts(workspacePath: string, generatedAt = new Date().toISOString()): {
  graph: DoneGraph;
  paths: DoneGraphPaths;
} {
  const events = readDoneGraphEvents(workspacePath);
  const graph = buildDoneGraph(events, generatedAt);
  const paths = writeDoneGraphArtifacts(workspacePath, graph);
  return { graph, paths };
}
