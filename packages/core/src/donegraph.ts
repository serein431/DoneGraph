export type EvidenceStatus = "pass" | "fail" | "unknown" | "blocked";

export type DoneGraphPlatform = "codex" | "claude" | "cursor" | "generic";

export type DoneGraphEventType =
  | "goal"
  | "decision"
  | "action"
  | "artifact"
  | "verification"
  | "blocker"
  | "completion";

export type DoneGraphNodeType =
  | "goal"
  | "task"
  | "decision"
  | "artifact"
  | "evidence"
  | "blocker"
  | "achievement"
  | "next_step";

export type DoneGraphEdgeLabel =
  | "belongs_to_goal"
  | "continues_as"
  | "produced"
  | "verified_by"
  | "blocked_by"
  | "decided_by"
  | "needs_followup"
  | "supersedes";

export interface DoneGraphSchemaInfo {
  name: "DoneGraph";
  purpose: string;
  node_types: DoneGraphNodeType[];
  edge_labels: DoneGraphEdgeLabel[];
  clean_room: true;
}

export interface DoneGraphEventMetadata {
  path?: string;
  command?: string;
  status?: EvidenceStatus;
  source?: string;
}

export interface DoneGraphEvent {
  id: string;
  timestamp: string;
  platform: DoneGraphPlatform;
  type: DoneGraphEventType;
  text: string;
  metadata: DoneGraphEventMetadata;
}

export interface DoneGraphNode {
  id: string;
  type: DoneGraphNodeType;
  title: string;
  detail: string;
  status: EvidenceStatus;
  source_event_ids: string[];
  metadata: DoneGraphEventMetadata;
}

export interface DoneGraphEdge {
  from: string;
  to: string;
  label: DoneGraphEdgeLabel;
}

export interface DoneGraphAchievement {
  id: string;
  title: string;
  detail: string;
  status: EvidenceStatus;
  source_event_ids: string[];
}

export interface DoneGraphSummary {
  total_events: number;
  completed_count: number;
  evidence_passed: number;
  evidence_failed: number;
  evidence_unknown: number;
  evidence_blocked: number;
  blockers: number;
  next_steps: number;
  progress_percent: number;
}

export interface DoneGraph {
  version: "1";
  schema: DoneGraphSchemaInfo;
  generated_at: string;
  goal: string;
  platform: DoneGraphPlatform;
  narrative: string;
  summary: DoneGraphSummary;
  nodes: DoneGraphNode[];
  edges: DoneGraphEdge[];
  achievements: DoneGraphAchievement[];
  next_steps: string[];
}

export interface DoneGraphCaptureInput {
  platform: DoneGraphPlatform;
  goal?: string;
  projectName?: string;
  changedFiles: string[];
  packageScripts: string[];
  existingEvents: DoneGraphEvent[];
  now: () => string;
  uuid: () => string;
}

const doneGraphSchema: DoneGraphSchemaInfo = {
  name: "DoneGraph",
  purpose: "Clean-room AI collaboration progress graph for goals, actions, artifacts, evidence, decisions, blockers, achievements, and next steps.",
  node_types: ["goal", "task", "decision", "artifact", "evidence", "blocker", "achievement", "next_step"],
  edge_labels: [
    "belongs_to_goal",
    "continues_as",
    "produced",
    "verified_by",
    "blocked_by",
    "decided_by",
    "needs_followup",
    "supersedes"
  ],
  clean_room: true
};

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function statusForEvent(event: DoneGraphEvent): EvidenceStatus {
  if (event.metadata.status) return event.metadata.status;
  if (event.type === "blocker") return "blocked";
  if (event.type === "completion") return "pass";
  if (event.type === "verification") return "unknown";
  return "pass";
}

function nodeTypeForEvent(event: DoneGraphEvent): DoneGraphNodeType {
  if (event.type === "goal") return "goal";
  if (event.type === "decision") return "decision";
  if (event.type === "artifact") return "artifact";
  if (event.type === "verification") return "evidence";
  if (event.type === "blocker") return "blocker";
  if (event.type === "completion") return "task";
  return "task";
}

function titleForEvent(event: DoneGraphEvent): string {
  if (event.type === "goal") return "任务目标";
  if (event.type === "decision") return "关键决策";
  if (event.type === "artifact") return "产物确认";
  if (event.type === "verification") return event.metadata.command ? `验证：${event.metadata.command}` : "验证证据";
  if (event.type === "blocker") return "阻塞项";
  if (event.type === "completion") return "阶段完成";
  return event.metadata.command ? `执行：${event.metadata.command}` : "推进动作";
}

function detailForEvent(event: DoneGraphEvent): string {
  const parts = [event.text];
  if (event.metadata.path && event.type !== "artifact") parts.push(`path=${event.metadata.path}`);
  if (event.metadata.command && event.type !== "verification" && event.type !== "action") {
    parts.push(`command=${event.metadata.command}`);
  }
  return normalizeText(parts.join(" "));
}

function nodeForEvent(event: DoneGraphEvent, index: number): DoneGraphNode {
  return {
    id: `node_${index + 1}_${event.type}`,
    type: nodeTypeForEvent(event),
    title: titleForEvent(event),
    detail: detailForEvent(event),
    status: statusForEvent(event),
    source_event_ids: [event.id],
    metadata: event.metadata
  };
}

function buildAchievements(nodes: DoneGraphNode[]): DoneGraphAchievement[] {
  return nodes
    .filter((node) => {
      if (node.type === "blocker" || node.type === "next_step") return false;
      if (node.type === "decision") return true;
      return node.status === "pass";
    })
    .map((node, index) => ({
      id: `achievement_${index + 1}`,
      title: node.title,
      detail: node.detail,
      status: node.status,
      source_event_ids: node.source_event_ids
    }));
}

function makeCaptureEvent(input: {
  index: number;
  type: DoneGraphEventType;
  text: string;
  platform: DoneGraphPlatform;
  now: () => string;
  uuid: () => string;
  metadata?: DoneGraphEventMetadata;
}): DoneGraphEvent {
  return {
    id: `dg_cap_${input.uuid()}_${input.index}`,
    timestamp: input.now(),
    platform: input.platform,
    type: input.type,
    text: input.text,
    metadata: input.metadata ?? {}
  };
}

function commandForScript(script: string): string {
  return script === "test" ? "npm test" : `npm run ${script}`;
}

export function buildCaptureEvents(input: DoneGraphCaptureInput): DoneGraphEvent[] {
  const events: DoneGraphEvent[] = [];
  const hasGoal = input.existingEvents.some((event) => event.type === "goal");
  const projectName = input.projectName?.trim() || "当前项目";
  const source = "clean-room-capture";

  if (!hasGoal && input.goal?.trim()) {
    events.push(
      makeCaptureEvent({
        index: events.length + 1,
        type: "goal",
        text: input.goal.trim(),
        platform: input.platform,
        now: input.now,
        uuid: input.uuid,
        metadata: {}
      })
    );
  }

  events.push(
    makeCaptureEvent({
      index: events.length + 1,
      type: "action",
      text: `自动扫描 ${projectName} 的本地上下文，生成协作进度起点。`,
      platform: input.platform,
      now: input.now,
      uuid: input.uuid,
      metadata: { source }
    })
  );

  const changedPreview = input.changedFiles.slice(0, 4).join(", ");
  events.push(
    makeCaptureEvent({
      index: events.length + 1,
      type: "artifact",
      text:
        input.changedFiles.length > 0
          ? `检测到 ${input.changedFiles.length} 个本地改动文件：${changedPreview}${input.changedFiles.length > 4 ? " ..." : ""}`
          : `记录 ${projectName} 的当前项目快照，尚未检测到 git 改动文件。`,
      platform: input.platform,
      now: input.now,
      uuid: input.uuid,
      metadata: {
        source,
        path: input.changedFiles[0]
      }
    })
  );

  const commands = input.packageScripts.slice(0, 3).map(commandForScript);
  events.push(
    makeCaptureEvent({
      index: events.length + 1,
      type: "verification",
      text:
        commands.length > 0
          ? `发现可用于证明进展的验证入口：${commands.join(", ")}。`
          : "尚未发现 package.json scripts，需要手动补充验证命令。",
      platform: input.platform,
      now: input.now,
      uuid: input.uuid,
      metadata: {
        source,
        command: commands[0],
        status: "unknown"
      }
    })
  );

  return events;
}

function nextStepsForNodes(nodes: DoneGraphNode[]): string[] {
  const failedEvidence = nodes.find((node) => node.type === "evidence" && node.status === "fail");
  if (failedEvidence) return [`先修复失败验证：${failedEvidence.detail}`];

  const blocker = nodes.find((node) => node.type === "blocker");
  if (blocker) return [`先解除阻塞：${blocker.detail}`];

  const unknownEvidence = nodes.find((node) => node.type === "evidence" && node.status === "unknown");
  if (unknownEvidence) return [`补充可判断证据：${unknownEvidence.detail}`];

  const hasEvidence = nodes.some((node) => node.type === "evidence");
  if (!hasEvidence) return ["为本轮产物补充至少一条 verification 记录，说明用什么命令证明它可用。"];

  return ["把已通过的证据固化到 README、测试或下一轮任务清单，然后开启下一阶段目标。"];
}

function summaryFor(nodes: DoneGraphNode[], totalEvents: number, nextSteps: string[]): DoneGraphSummary {
  const scoreable = nodes.filter((node) => node.type !== "next_step");
  const completed = scoreable.filter((node) => node.status === "pass").length;
  const progress = scoreable.length === 0 ? 0 : Math.round((completed / scoreable.length) * 100);
  return {
    total_events: totalEvents,
    completed_count: completed,
    evidence_passed: nodes.filter((node) => node.type === "evidence" && node.status === "pass").length,
    evidence_failed: nodes.filter((node) => node.type === "evidence" && node.status === "fail").length,
    evidence_unknown: nodes.filter((node) => node.type === "evidence" && node.status === "unknown").length,
    evidence_blocked: nodes.filter((node) => node.type === "evidence" && node.status === "blocked").length,
    blockers: nodes.filter((node) => node.type === "blocker").length,
    next_steps: nextSteps.length,
    progress_percent: progress
  };
}

function narrativeFor(graph: Pick<DoneGraph, "goal" | "summary" | "next_steps">): string {
  if (!graph.goal) return "DoneGraph 还没有任务目标。";
  return `这轮协作已经沉淀 ${graph.summary.completed_count} 个完成信号，${graph.summary.evidence_passed} 条通过证据。下一步是：${graph.next_steps[0] ?? "继续记录协作事件"}`;
}

function addEdge(edges: DoneGraphEdge[], seen: Set<string>, edge: DoneGraphEdge): void {
  if (edge.from === edge.to) return;
  const key = `${edge.from}|${edge.to}|${edge.label}`;
  if (seen.has(key)) return;
  seen.add(key);
  edges.push(edge);
}

function buildEdges(nodes: DoneGraphNode[]): DoneGraphEdge[] {
  const edges: DoneGraphEdge[] = [];
  const seen = new Set<string>();
  const goal = nodes.find((node) => node.type === "goal");
  if (goal) {
    for (const node of nodes) {
      if (node.id !== goal.id && node.type !== "next_step") {
        addEdge(edges, seen, { from: goal.id, to: node.id, label: "belongs_to_goal" });
      }
    }
  }

  for (let index = 1; index < nodes.length; index += 1) {
    const previous = nodes[index - 1];
    const current = nodes[index];
    if (!previous || !current) continue;
    addEdge(edges, seen, { from: previous.id, to: current.id, label: "continues_as" });

    if (previous.type === "task" && current.type === "artifact") {
      addEdge(edges, seen, { from: previous.id, to: current.id, label: "produced" });
    }
    if (previous.type === "artifact" && current.type === "evidence") {
      addEdge(edges, seen, { from: previous.id, to: current.id, label: "verified_by" });
    }
    if (previous.type === "decision" && current.type === "task") {
      addEdge(edges, seen, { from: previous.id, to: current.id, label: "decided_by" });
    }
    if (previous.type === "blocker" && current.type === "next_step") {
      addEdge(edges, seen, { from: previous.id, to: current.id, label: "needs_followup" });
    }
    if (previous.type === "blocker" && current.type !== "next_step") {
      addEdge(edges, seen, { from: current.id, to: previous.id, label: "blocked_by" });
    }
  }

  const nextStep = nodes.find((node) => node.type === "next_step");
  if (nextStep) {
    for (const node of nodes) {
      if (
        node.id !== nextStep.id &&
        (node.type === "blocker" || (node.type === "evidence" && node.status !== "pass"))
      ) {
        addEdge(edges, seen, { from: node.id, to: nextStep.id, label: "needs_followup" });
      }
    }
  }

  return edges;
}

export function buildDoneGraph(events: DoneGraphEvent[], generatedAt = new Date().toISOString()): DoneGraph {
  const sorted = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const goalEvent = sorted.find((event) => event.type === "goal");
  const nodes = sorted.map(nodeForEvent);
  const nextSteps = nextStepsForNodes(nodes);
  const nextStepNodes: DoneGraphNode[] = nextSteps.map((step, index) => ({
    id: `node_next_${index + 1}`,
    type: "next_step",
    title: "下一步",
    detail: step,
    status: "unknown",
    source_event_ids: [],
    metadata: {}
  }));
  const allNodes = [...nodes, ...nextStepNodes];
  const edges = buildEdges(allNodes);
  const base = {
    version: "1" as const,
    schema: doneGraphSchema,
    generated_at: generatedAt,
    goal: goalEvent?.text ?? "",
    platform: goalEvent?.platform ?? sorted[0]?.platform ?? "generic",
    summary: summaryFor(allNodes, sorted.length, nextSteps),
    nodes: allNodes,
    edges,
    achievements: buildAchievements(allNodes),
    next_steps: nextSteps
  };
  return {
    ...base,
    narrative: narrativeFor(base)
  };
}

export function renderAchievementLog(graph: DoneGraph): string {
  const lines = [
    "# DoneGraph Achievement Log",
    "",
    `Goal: ${graph.goal || "Not started"}`,
    "",
    `Progress: ${graph.summary.progress_percent}%`,
    "",
    "## Completed Together",
    ""
  ];
  if (graph.achievements.length === 0) {
    lines.push("- No achievements recorded yet.");
  } else {
    for (const item of graph.achievements) {
      lines.push(`- [${item.status}] ${item.title}: ${item.detail}`);
    }
  }
  lines.push("", "## Evidence", "");
  const evidence = graph.nodes.filter((node) => node.type === "evidence");
  if (evidence.length === 0) {
    lines.push("- No verification evidence recorded yet.");
  } else {
    for (const node of evidence) lines.push(`- [${node.status}] ${node.detail}`);
  }
  lines.push("", "## Open Thread", "");
  for (const step of graph.next_steps) lines.push(`- ${step}`);
  lines.push("");
  return lines.join("\n");
}

export function renderNextSteps(graph: DoneGraph): string {
  return [
    "# DoneGraph Next Steps",
    "",
    graph.narrative,
    "",
    "## Give This To The Next AI",
    "",
    ...graph.next_steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "## Current Evidence State",
    "",
    `- Passed: ${graph.summary.evidence_passed}`,
    `- Failed: ${graph.summary.evidence_failed}`,
    `- Unknown: ${graph.summary.evidence_unknown}`,
    `- Blocked: ${graph.summary.evidence_blocked}`,
    ""
  ].join("\n");
}

function statusLabel(status: EvidenceStatus): string {
  if (status === "pass") return "passed";
  if (status === "fail") return "failed";
  if (status === "blocked") return "blocked";
  return "unknown";
}

function statusText(status: EvidenceStatus): string {
  if (status === "pass") return "Proven";
  if (status === "fail") return "Needs repair";
  if (status === "blocked") return "Blocked";
  return "Needs proof";
}

function renderNode(node: DoneGraphNode, index: number): string {
  return [
    `<article class="node-card ${escapeHtml(node.type)} ${escapeHtml(statusLabel(node.status))}" style="--delay: ${index * 80}ms">`,
    `<div class="node-cap"><span class="node-number">${String(index + 1).padStart(2, "0")}</span><span class="node-kind">${escapeHtml(node.type)}</span></div>`,
    `<div class="stamp ${escapeHtml(statusLabel(node.status))}">${escapeHtml(statusText(node.status))}</div>`,
    `<h3>${escapeHtml(node.title)}</h3>`,
    `<p>${escapeHtml(node.detail)}</p>`,
    node.metadata.path ? `<code>${escapeHtml(node.metadata.path)}</code>` : "",
    node.metadata.command ? `<code>${escapeHtml(node.metadata.command)}</code>` : "",
    node.metadata.source ? `<small class="source">${escapeHtml(node.metadata.source)}</small>` : "",
    "</article>"
  ].join("");
}

export function renderDashboardHtml(graph: DoneGraph): string {
  const nodes = graph.nodes.map(renderNode).join("\n");
  const nodeIndex = new Map(graph.nodes.map((node, index) => [node.id, index + 1]));
  const achievements = graph.achievements
    .map((item) => `<li><span>${escapeHtml(statusLabel(item.status))}</span>${escapeHtml(item.title)}</li>`)
    .join("\n");
  const nextSteps = graph.next_steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("\n");
  const schemaLabels = graph.schema.edge_labels
    .map((label) => `<span class="badge">${escapeHtml(label)}</span>`)
    .join("");
  const relationshipTrace = graph.edges
    .slice(0, 14)
    .map((edge) => {
      const from = String(nodeIndex.get(edge.from) ?? "?").padStart(2, "0");
      const to = String(nodeIndex.get(edge.to) ?? "?").padStart(2, "0");
      return `<li><span>${escapeHtml(edge.label)}</span><small>${escapeHtml(from)} -> ${escapeHtml(to)}</small></li>`;
    })
    .join("\n");
  const sourceCounts = graph.nodes.reduce((counts, node) => {
    if (!node.metadata.source) return counts;
    counts.set(node.metadata.source, (counts.get(node.metadata.source) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
  const sources = Array.from(sourceCounts.entries())
    .map(([source, count]) => `<li><span>${escapeHtml(source)}</span>${count} captured nodes</li>`)
    .join("\n");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DoneGraph Dashboard</title>
  <style>
    :root {
      --mist: #ddeee5;
      --sky: #cfe7df;
      --paper: #fff8e6;
      --paper-deep: #f6e6bd;
      --ink: #24322b;
      --muted: #687c72;
      --moss: #527a5a;
      --clay: #c8784a;
      --lagoon: #8fb7ba;
      --pollen: #f5d889;
      --rose: #e8b7a1;
      --line: rgba(36, 50, 43, .18);
      --shadow: rgba(63, 91, 71, .16);
    }
    * { box-sizing: border-box; }
    html, body { overflow-x: hidden; }
    body {
      margin: 0;
      min-width: 320px;
      color: var(--ink);
      background:
        radial-gradient(ellipse at 20% 10%, rgba(255, 248, 230, .78), transparent 34rem),
        linear-gradient(180deg, var(--mist) 0%, #edf5e7 46%, #f7edcf 100%);
      font-family: "Outfit", "Avenir Next", "Nunito Sans", "PingFang SC", "Hiragino Sans GB", sans-serif;
      text-rendering: geometricPrecision;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: .34;
      background-image:
        linear-gradient(120deg, rgba(82, 122, 90, .08) 0 1px, transparent 1px 24px),
        linear-gradient(60deg, rgba(36, 50, 43, .055) 0 1px, transparent 1px 28px);
      mask-image: linear-gradient(180deg, #000 0%, transparent 88%);
    }
    .island-shell {
      width: min(1480px, calc(100vw - 32px));
      min-height: 100vh;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(320px, 390px);
      gap: clamp(18px, 2.5vw, 34px);
      margin: 0 auto;
      padding: clamp(18px, 3vw, 42px) 0;
    }
    .stage, .side { min-width: 0; }
    .hero {
      position: relative;
      min-height: 330px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(180px, 280px);
      gap: clamp(18px, 4vw, 48px);
      align-items: end;
      padding: clamp(24px, 4vw, 48px);
      border: 1px solid rgba(82, 122, 90, .24);
      border-radius: 38px;
      background:
        linear-gradient(135deg, rgba(255, 248, 230, .96), rgba(255, 248, 230, .72)),
        linear-gradient(120deg, rgba(143, 183, 186, .34), rgba(245, 216, 137, .28));
      box-shadow: 0 28px 70px var(--shadow);
      overflow: hidden;
    }
    .hero::after {
      content: "";
      position: absolute;
      right: -28px;
      bottom: -38px;
      width: 62%;
      height: 120px;
      border-radius: 999px 999px 0 0;
      background: linear-gradient(90deg, rgba(82, 122, 90, .20), rgba(143, 183, 186, .26));
      transform: rotate(-2deg);
    }
    .topline {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      margin-bottom: 22px;
      color: var(--muted);
      font-size: 12px;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .topline span {
      min-height: 30px;
      display: inline-grid;
      place-items: center;
      padding: 7px 12px;
      border: 1px solid rgba(82, 122, 90, .24);
      border-radius: 999px;
      background: rgba(255, 248, 230, .72);
    }
    h1 {
      margin: 0 0 18px;
      color: var(--ink);
      font-size: clamp(54px, 8vw, 118px);
      line-height: .9;
      font-weight: 820;
      letter-spacing: 0;
      overflow-wrap: normal;
      word-break: keep-all;
    }
    h1 span {
      display: block;
      white-space: nowrap;
    }
    .story {
      max-width: 65ch;
      margin: 0;
      color: #395146;
      font-size: clamp(18px, 2.2vw, 27px);
      line-height: 1.34;
      overflow-wrap: anywhere;
    }
    .map-tile {
      position: relative;
      z-index: 1;
      min-height: 225px;
      align-self: stretch;
      border: 1px solid rgba(82, 122, 90, .22);
      border-radius: 34px;
      background:
        linear-gradient(150deg, rgba(143, 183, 186, .72), rgba(221, 238, 229, .88) 48%, rgba(245, 216, 137, .68)),
        var(--paper);
      box-shadow: inset 0 0 0 10px rgba(255, 248, 230, .45);
      overflow: hidden;
    }
    .map-tile::before,
    .map-tile::after {
      content: "";
      position: absolute;
      border-radius: 999px;
      background: rgba(82, 122, 90, .34);
      transform: rotate(-14deg);
    }
    .map-tile::before { width: 132px; height: 74px; left: 26px; top: 48px; }
    .map-tile::after { width: 96px; height: 56px; right: 30px; bottom: 42px; background: rgba(200, 120, 74, .26); }
    .map-pin {
      position: absolute;
      left: 50%;
      top: 48%;
      width: 54px;
      height: 54px;
      display: grid;
      place-items: center;
      border-radius: 18px 18px 18px 4px;
      background: var(--clay);
      color: var(--paper);
      font: 800 14px "SFMono-Regular", Menlo, monospace;
      transform: rotate(-10deg);
      box-shadow: 0 12px 28px rgba(159, 84, 49, .22);
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin: 18px 0;
    }
    .metric {
      min-height: 118px;
      padding: 16px;
      border: 1px solid rgba(82, 122, 90, .2);
      border-radius: 28px;
      background: rgba(255, 248, 230, .74);
      box-shadow: 0 18px 40px rgba(82, 122, 90, .09);
    }
    .metric span {
      color: var(--muted);
      font-size: 12px;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .metric strong {
      display: block;
      margin-top: 22px;
      color: var(--moss);
      font: 850 42px/1 "SFMono-Regular", Menlo, monospace;
    }
    .board {
      padding: clamp(16px, 2.3vw, 28px);
      border: 1px solid rgba(82, 122, 90, .22);
      border-radius: 38px;
      background:
        linear-gradient(180deg, rgba(255, 248, 230, .82), rgba(246, 230, 189, .55)),
        var(--paper);
      box-shadow: 0 30px 70px rgba(82, 122, 90, .12);
    }
    .board-head {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 18px;
    }
    .board-head h2 {
      margin: 0;
      font-size: clamp(28px, 4vw, 48px);
      line-height: 1;
      letter-spacing: 0;
    }
    .board-head p {
      max-width: 42ch;
      margin: 0;
      color: var(--muted);
      line-height: 1.45;
    }
    .graph {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      align-items: stretch;
    }
    .node-card {
      min-width: 0;
      min-height: 232px;
      display: grid;
      align-content: start;
      gap: 12px;
      padding: 18px;
      border: 1px solid rgba(36, 50, 43, .14);
      border-radius: 30px;
      background: rgba(255, 248, 230, .94);
      box-shadow: 0 18px 34px rgba(82, 122, 90, .12);
      overflow: hidden;
      animation: card-float 5.8s ease-in-out infinite;
      animation-delay: var(--delay);
      transform: translate3d(0, 0, 0);
    }
    .node-card:nth-child(2n) { transform: rotate(.35deg); }
    .node-card:nth-child(3n) { transform: rotate(-.45deg); }
    .node-card.goal { background: #fff2c7; }
    .node-card.evidence.passed, .node-card.task.passed, .node-card.artifact.passed { background: #eef6de; }
    .node-card.failed, .node-card.blocked { background: #f8ddd2; }
    .node-card.unknown { background: #fff0bc; }
    .node-cap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .node-number {
      width: 42px;
      height: 42px;
      display: grid;
      place-items: center;
      border-radius: 15px;
      background: var(--ink);
      color: var(--paper);
      font: 800 13px "SFMono-Regular", Menlo, monospace;
    }
    .node-kind {
      color: var(--moss);
      font-size: 11px;
      font-weight: 850;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .stamp {
      width: max-content;
      max-width: 100%;
      padding: 7px 10px;
      border: 1px solid currentColor;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 850;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .stamp.passed { color: var(--moss); background: rgba(82, 122, 90, .10); }
    .stamp.failed, .stamp.blocked { color: #9e4f35; background: rgba(200, 120, 74, .12); }
    .stamp.unknown { color: #8b6f24; background: rgba(245, 216, 137, .36); }
    h3 {
      margin: 0;
      font-size: 22px;
      line-height: 1.08;
      letter-spacing: 0;
      overflow-wrap: anywhere;
    }
    p {
      margin: 0;
      color: var(--muted);
      line-height: 1.5;
      overflow-wrap: anywhere;
    }
    code {
      display: block;
      padding: 9px 10px;
      border: 1px dashed rgba(82, 122, 90, .26);
      border-radius: 14px;
      background: rgba(255, 248, 230, .72);
      color: #435b50;
      font: 12px "SFMono-Regular", Menlo, monospace;
      overflow-wrap: anywhere;
    }
    .source {
      width: max-content;
      max-width: 100%;
      padding: 6px 9px;
      border-radius: 999px;
      background: rgba(143, 183, 186, .24);
      color: #41696c;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
      overflow-wrap: anywhere;
    }
    .side {
      display: grid;
      gap: 14px;
      align-content: start;
    }
    .panel {
      padding: 18px;
      border: 1px solid rgba(82, 122, 90, .22);
      border-radius: 30px;
      background:
        linear-gradient(180deg, rgba(255, 248, 230, .94), rgba(255, 248, 230, .76)),
        var(--paper);
      box-shadow: 0 18px 42px rgba(82, 122, 90, .10);
    }
    .panel.route { background: linear-gradient(180deg, rgba(221, 238, 229, .86), rgba(255, 248, 230, .82)); }
    .panel h2 {
      margin: 0 0 14px;
      font-size: 23px;
      line-height: 1;
      letter-spacing: 0;
    }
    .panel ul {
      display: grid;
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .panel li {
      padding: 0 0 10px;
      border-bottom: 1px dashed rgba(82, 122, 90, .23);
      color: #3d5349;
      line-height: 1.45;
    }
    .panel li:last-child { padding-bottom: 0; border-bottom: 0; }
    .panel li span {
      display: inline-block;
      margin-right: 8px;
      color: var(--clay);
      font-size: 11px;
      font-weight: 850;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .schema-line {
      margin: 0 0 12px;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.5;
    }
    .badge-list {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }
    .badge {
      max-width: 100%;
      padding: 7px 9px;
      border: 1px solid rgba(82, 122, 90, .20);
      border-radius: 999px;
      background: rgba(255, 248, 230, .76);
      color: #416147;
      font-size: 11px;
      font-weight: 800;
      line-height: 1;
      text-transform: uppercase;
      overflow-wrap: anywhere;
    }
    .edge-list li {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
    }
    .edge-list small {
      color: var(--muted);
      font: 12px "SFMono-Regular", Menlo, monospace;
      white-space: nowrap;
    }
    .footer-note {
      margin: 2px 6px 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
    }
    @keyframes card-float {
      0%, 100% { translate: 0 0; }
      50% { translate: 0 -4px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .node-card { animation: none; }
    }
    @media (max-width: 1180px) {
      .island-shell { grid-template-columns: 1fr; }
      .side { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .footer-note { grid-column: 1 / -1; }
    }
    @media (max-width: 820px) {
      .hero { grid-template-columns: 1fr; }
      .map-tile { min-height: 170px; }
      .metrics, .graph, .side { grid-template-columns: 1fr; }
      .board-head { display: grid; }
    }
    @media (max-width: 560px) {
      .island-shell { width: min(100vw - 20px, 1480px); padding-block: 10px; }
      .hero, .board, .panel { border-radius: 24px; padding: 16px; }
      h1 { font-size: 48px; }
      .story { font-size: 17px; }
      .metric { min-height: 96px; }
    }
  </style>
</head>
<body>
  <main class="island-shell">
    <section class="stage">
      <section class="hero">
        <div>
          <div class="topline"><span>Done Task Map</span><span>${escapeHtml(graph.platform)}</span><span>Clean-room</span></div>
          <h1><span>DoneGraph</span><span>Island</span><span>Board</span></h1>
          <p class="story">${escapeHtml(graph.narrative)}</p>
        </div>
        <div class="map-tile" aria-hidden="true"><div class="map-pin">${graph.summary.progress_percent}%</div></div>
      </section>
      <div class="metrics">
        <div class="metric"><span>Progress</span><strong>${graph.summary.progress_percent}%</strong></div>
        <div class="metric"><span>Completed</span><strong>${graph.summary.completed_count}</strong></div>
        <div class="metric"><span>Evidence Pass</span><strong>${graph.summary.evidence_passed}</strong></div>
        <div class="metric"><span>Blockers</span><strong>${graph.summary.blockers}</strong></div>
      </div>
      <section class="board">
        <div class="board-head">
          <h2>Progress Notes</h2>
          <p>Each note is a collaboration fact: a goal, action, artifact, proof, blocker, or handoff step.</p>
        </div>
        <section class="graph" aria-label="DoneGraph task graph">
          ${nodes}
        </section>
      </section>
    </section>
    <aside class="side">
      <section class="panel">
        <h2>Clean-room Schema</h2>
        <p class="schema-line">${escapeHtml(graph.schema.purpose)}</p>
        <div class="badge-list">${schemaLabels}</div>
      </section>
      <section class="panel route">
        <h2>Relationship Trace</h2>
        <ul class="edge-list">${relationshipTrace || "<li>还没有关系边。</li>"}</ul>
      </section>
      <section class="panel">
        <h2>成就账本</h2>
        <ul>${achievements || "<li>还没有完成信号。</li>"}</ul>
      </section>
      <section class="panel">
        <h2>下一轮接力</h2>
        <ul>${nextSteps}</ul>
      </section>
      <section class="panel">
        <h2>捕获来源</h2>
        <ul>${sources || "<li>当前记录来自手动事件。</li>"}</ul>
      </section>
      <p class="footer-note">Generated at ${escapeHtml(graph.generated_at)} from .donegraph/session.jsonl. This dashboard is static and can be opened without a server.</p>
    </aside>
  </main>
</body>
</html>`;
}
