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

function renderNode(node: DoneGraphNode, index: number): string {
  return [
    `<article class="node ${escapeHtml(node.type)} ${escapeHtml(statusLabel(node.status))}">`,
    `<div class="node-top"><span>${String(index + 1).padStart(2, "0")}</span><b>${escapeHtml(node.type)}</b></div>`,
    `<h3>${escapeHtml(node.title)}</h3>`,
    `<p>${escapeHtml(node.detail)}</p>`,
    node.metadata.path ? `<code>${escapeHtml(node.metadata.path)}</code>` : "",
    node.metadata.command ? `<code>${escapeHtml(node.metadata.command)}</code>` : "",
    "</article>"
  ].join("");
}

export function renderDashboardHtml(graph: DoneGraph): string {
  const nodes = graph.nodes.map(renderNode).join("\n");
  const achievements = graph.achievements
    .map((item) => `<li><span>${escapeHtml(statusLabel(item.status))}</span>${escapeHtml(item.title)}</li>`)
    .join("\n");
  const nextSteps = graph.next_steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("\n");

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DoneGraph Dashboard</title>
  <style>
    :root {
      --ink: #151713;
      --paper: #f4f1e8;
      --surface: #fbfaf4;
      --line: #2b2d26;
      --muted: #74766f;
      --accent: #c54524;
      --proof: #2f6f4e;
      --warn: #ac7b15;
      --risk: #9e332b;
    }
    * { box-sizing: border-box; }
    html, body {
      overflow-x: hidden;
    }
    body {
      margin: 0;
      min-width: 320px;
      color: var(--ink);
      background:
        linear-gradient(90deg, rgba(21, 23, 19, .06) 1px, transparent 1px),
        linear-gradient(rgba(21, 23, 19, .05) 1px, transparent 1px),
        var(--paper);
      background-size: 34px 34px;
      font-family: "Avenir Next", "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", sans-serif;
      text-rendering: geometricPrecision;
    }
    main { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) 360px; min-height: 100vh; overflow-x: hidden; }
    .stage { min-width: 0; padding: 30px; border-right: 2px solid var(--line); overflow-x: hidden; }
    .side { min-width: 0; padding: 24px; background: rgba(251, 250, 244, .92); }
    .topline { display: flex; justify-content: space-between; gap: 18px; color: var(--muted); font-size: 12px; letter-spacing: .12em; text-transform: uppercase; }
    h1 { max-width: 9ch; margin: 52px 0 20px; font-size: clamp(70px, 12vw, 168px); line-height: .78; font-weight: 560; letter-spacing: 0; text-transform: uppercase; overflow-wrap: anywhere; }
    .story { max-width: min(850px, 100%); font-size: clamp(22px, 3vw, 38px); line-height: 1.13; overflow-wrap: anywhere; word-break: break-all; }
    .metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 34px 0; }
    .metric { min-height: 112px; padding: 14px; border: 1px solid var(--line); background: var(--surface); }
    .metric span { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: .1em; }
    .metric strong { display: block; margin-top: 20px; font-size: 42px; line-height: .9; font-variant-numeric: tabular-nums; }
    .graph { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; align-items: stretch; }
    .node { min-width: 0; min-height: 210px; display: grid; align-content: start; gap: 12px; padding: 15px; border: 1px solid var(--line); background: var(--surface); box-shadow: 8px 8px 0 rgba(21, 23, 19, .055); overflow: hidden; }
    .node.goal { background: #efe7d0; }
    .node.evidence.passed, .node.task.passed, .node.artifact.passed { background: #e8efe1; }
    .node.failed, .node.blocked { background: #f1dcd5; }
    .node.unknown { background: #f7edcf; }
    .node-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .node-top span { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid currentColor; font-weight: 820; font-variant-numeric: tabular-nums; }
    .node-top b { color: var(--accent); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; }
    h3 { margin: 0; font-size: 22px; line-height: 1; overflow-wrap: anywhere; }
    p { margin: 0; color: var(--muted); line-height: 1.5; overflow-wrap: anywhere; }
    code { display: block; padding: 8px; background: rgba(21, 23, 19, .08); font: 12px "SFMono-Regular", Menlo, monospace; overflow-wrap: anywhere; }
    .panel { margin-bottom: 18px; padding: 16px; border: 1px solid var(--line); background: var(--surface); }
    .panel h2 { margin: 0 0 14px; font-size: 25px; line-height: 1; }
    .panel ul { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
    .panel li { padding-bottom: 10px; border-bottom: 1px solid rgba(21, 23, 19, .16); line-height: 1.45; }
    .panel li:last-child { padding-bottom: 0; border-bottom: 0; }
    .panel li span { display: inline-block; margin-right: 8px; color: var(--proof); font-size: 11px; letter-spacing: .09em; text-transform: uppercase; }
    .footer-note { color: var(--muted); font-size: 12px; line-height: 1.5; }
    @media (max-width: 1100px) {
      main, .graph { grid-template-columns: 1fr; }
      .stage { border-right: 0; border-bottom: 2px solid var(--line); }
      .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
    @media (max-width: 560px) {
      .stage, .side { padding: 16px; }
      .metrics { grid-template-columns: 1fr; }
      h1 { margin-top: 36px; font-size: 64px; }
      .topline { flex-wrap: wrap; }
      .story { width: calc(100vw - 32px); max-width: calc(100vw - 32px); }
    }
  </style>
</head>
<body>
  <main>
    <section class="stage">
      <div class="topline"><span>DONEGRAPH / AI CO-WORK TRACE</span><span>${escapeHtml(graph.platform)}</span></div>
      <h1>Done Task Map</h1>
      <p class="story">${escapeHtml(graph.narrative)}</p>
      <div class="metrics">
        <div class="metric"><span>Progress</span><strong>${graph.summary.progress_percent}%</strong></div>
        <div class="metric"><span>Completed</span><strong>${graph.summary.completed_count}</strong></div>
        <div class="metric"><span>Evidence Pass</span><strong>${graph.summary.evidence_passed}</strong></div>
        <div class="metric"><span>Blockers</span><strong>${graph.summary.blockers}</strong></div>
      </div>
      <section class="graph" aria-label="DoneGraph task graph">
        ${nodes}
      </section>
    </section>
    <aside class="side">
      <section class="panel">
        <h2>成就账本</h2>
        <ul>${achievements || "<li>还没有完成信号。</li>"}</ul>
      </section>
      <section class="panel">
        <h2>下一轮接力</h2>
        <ul>${nextSteps}</ul>
      </section>
      <p class="footer-note">Generated at ${escapeHtml(graph.generated_at)} from .donegraph/session.jsonl. This dashboard is static and can be opened without a server.</p>
    </aside>
  </main>
</body>
</html>`;
}
