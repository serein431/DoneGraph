import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  buildDoneGraph,
  buildSafeSnapshot,
  type DoneGraphEvent,
  type DoneGraphEventType,
  type DoneGraphPlatform,
  type EvidenceStatus
} from "@donegraph/core";

function resolveWorkspace(): string {
  return process.env["DONEGRAPH_WORKSPACE"] ?? process.cwd();
}

function sessionPath(workspace: string): string {
  return path.join(workspace, ".donegraph", "session.jsonl");
}

function readEvents(workspace: string): DoneGraphEvent[] {
  const filePath = sessionPath(workspace);
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean);
  const events: DoneGraphEvent[] = [];
  for (const line of lines) {
    try {
      const parsed = JSON.parse(line) as DoneGraphEvent;
      if (parsed.id && parsed.timestamp && parsed.type) events.push(parsed);
    } catch {
      // skip malformed lines
    }
  }
  return events;
}

function appendEvent(workspace: string, event: DoneGraphEvent): void {
  const dir = path.join(workspace, ".donegraph");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(sessionPath(workspace), `${JSON.stringify(event)}\n`, "utf8");
}

export function createDoneGraphMcpServer(): McpServer {
  const server = new McpServer({
    name: "donegraph",
    version: "0.1.0"
  });

  server.tool(
    "donegraph_get_status",
    "Get the current accountability verdict, composite score, and progress for this workspace.",
    {},
    async () => {
      const workspace = resolveWorkspace();
      const events = readEvents(workspace);
      if (events.length === 0) {
        return { content: [{ type: "text", text: JSON.stringify({ status: "no_session", message: "No DoneGraph session found. Run donegraph start first." }) }] };
      }
      const graph = buildDoneGraph(events);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            goal: graph.goal,
            progress_percent: graph.summary.progress_percent,
            accountability_verdict: graph.accountability.verdict,
            accountability_score: graph.accountability.composite,
            milestones: `${graph.summary.milestones_completed}/${graph.summary.milestones_total}`,
            evidence_passed: graph.summary.evidence_passed,
            blockers: graph.summary.blockers,
            next_steps: graph.next_steps
          }, null, 2)
        }]
      };
    }
  );

  server.tool(
    "donegraph_get_accountability",
    "Get the full 6-dimension accountability score breakdown with dimension details and hard gate status.",
    {},
    async () => {
      const workspace = resolveWorkspace();
      const events = readEvents(workspace);
      if (events.length === 0) {
        return { content: [{ type: "text", text: '{"error": "No DoneGraph session found."}' }] };
      }
      const graph = buildDoneGraph(events);
      return { content: [{ type: "text", text: JSON.stringify(graph.accountability, null, 2) }] };
    }
  );

  server.tool(
    "donegraph_get_graph",
    "Get the full DoneGraph including nodes, edges, milestones, achievements, accountability, and next steps.",
    {},
    async () => {
      const workspace = resolveWorkspace();
      const events = readEvents(workspace);
      if (events.length === 0) {
        return { content: [{ type: "text", text: '{"error": "No DoneGraph session found."}' }] };
      }
      const graph = buildDoneGraph(events);
      return { content: [{ type: "text", text: JSON.stringify(graph, null, 2) }] };
    }
  );

  server.tool(
    "donegraph_get_evidence",
    "Get all evidence nodes with their verification depth and confidence levels.",
    {},
    async () => {
      const workspace = resolveWorkspace();
      const events = readEvents(workspace);
      if (events.length === 0) {
        return { content: [{ type: "text", text: '{"evidence": []}' }] };
      }
      const graph = buildDoneGraph(events);
      const evidence = graph.nodes
        .filter((n) => n.type === "evidence")
        .map((n) => ({
          id: n.id,
          title: n.title,
          detail: n.detail,
          status: n.status,
          verification_depth: n.metadata.verification_depth ?? "self_reported",
          confidence: n.metadata.confidence ?? "low",
          command: n.metadata.command
        }));
      return { content: [{ type: "text", text: JSON.stringify({ evidence }, null, 2) }] };
    }
  );

  server.tool(
    "donegraph_record_event",
    "Record a new event in the DoneGraph session. Use this to log goals, checkpoints, proof, decisions, artifacts, blockers, or completion.",
    {
      type: z.enum(["goal", "decision", "action", "artifact", "verification", "blocker", "completion"]).describe("Event type"),
      text: z.string().describe("Description of the event"),
      platform: z.enum(["codex", "claude", "cursor", "generic"]).default("generic").describe("AI platform"),
      command: z.string().optional().describe("Command that was run (for verification events)"),
      path: z.string().optional().describe("File path related to this event"),
      status: z.enum(["pass", "fail", "unknown", "blocked"]).optional().describe("Evidence status (for verification events)")
    },
    async (args) => {
      const workspace = resolveWorkspace();
      const event: DoneGraphEvent = {
        id: `evt_${crypto.randomUUID()}`,
        timestamp: new Date().toISOString(),
        platform: args.platform as DoneGraphPlatform,
        type: args.type as DoneGraphEventType,
        text: args.text,
        metadata: {
          ...(args.command ? { command: args.command } : {}),
          ...(args.path ? { path: args.path } : {}),
          ...(args.status ? { status: args.status as EvidenceStatus } : {})
        }
      };
      appendEvent(workspace, event);
      const events = readEvents(workspace);
      const graph = buildDoneGraph(events);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            recorded: true,
            event_id: event.id,
            total_events: events.length,
            progress_percent: graph.summary.progress_percent,
            accountability_verdict: graph.accountability.verdict
          }, null, 2)
        }]
      };
    }
  );

  server.tool(
    "donegraph_get_next_steps",
    "Get the actionable next steps for the current session.",
    {},
    async () => {
      const workspace = resolveWorkspace();
      const events = readEvents(workspace);
      if (events.length === 0) {
        return { content: [{ type: "text", text: '{"next_steps": ["Start a DoneGraph session with donegraph start"]}' }] };
      }
      const graph = buildDoneGraph(events);
      return { content: [{ type: "text", text: JSON.stringify({ next_steps: graph.next_steps, current_stage: graph.summary.current_stage }, null, 2) }] };
    }
  );

  return server;
}

export async function main(): Promise<void> {
  const server = createDoneGraphMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
