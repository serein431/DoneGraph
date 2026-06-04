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
    `<article class="journal-card ${escapeHtml(node.type)} ${escapeHtml(statusLabel(node.status))}" style="--delay: ${index * 70}ms">`,
    `<div class="card-cap"><span class="card-number">${String(index + 1).padStart(2, "0")}</span><span class="card-kind">${escapeHtml(node.type)}</span></div>`,
    `<h3>${escapeHtml(node.title)}</h3>`,
    `<p>${escapeHtml(node.detail)}</p>`,
    `<div class="stamp ${escapeHtml(statusLabel(node.status))}">${escapeHtml(statusText(node.status))}</div>`,
    node.metadata.path ? `<code>${escapeHtml(node.metadata.path)}</code>` : "",
    node.metadata.command ? `<code>${escapeHtml(node.metadata.command)}</code>` : "",
    node.metadata.source ? `<small class="source">${escapeHtml(node.metadata.source)}</small>` : "",
    "</article>"
  ].join("");
}

export function renderDashboardHtml(graph: DoneGraph): string {
  const nodes = graph.nodes.map(renderNode).join("\n");
  const nodeIndex = new Map(graph.nodes.map((node, index) => [node.id, index + 1]));
  const completedCards = graph.achievements
    .slice(0, 8)
    .map(
      (item, index) =>
        `<article class="achievement-card" style="--delay: ${index * 80}ms"><span>${escapeHtml(statusText(item.status))}</span><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p></article>`
    )
    .join("\n");
  const achievements = graph.achievements
    .map((item) => `<li><span>${escapeHtml(statusLabel(item.status))}</span>${escapeHtml(item.title)}</li>`)
    .join("\n");
  const evidenceCards = graph.nodes
    .filter((node) => node.type === "evidence")
    .map(
      (node, index) =>
        `<article class="proof-card ${escapeHtml(statusLabel(node.status))}" style="--delay: ${index * 80}ms"><span>${escapeHtml(statusText(node.status))}</span><strong>${escapeHtml(node.title)}</strong><p>${escapeHtml(node.detail)}</p>${node.metadata.command ? `<code>${escapeHtml(node.metadata.command)}</code>` : ""}</article>`
    )
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
  const blockerText =
    graph.summary.blockers === 0 ? "No blockers are holding this session back." : `${graph.summary.blockers} blocker${graph.summary.blockers === 1 ? "" : "s"} need attention.`;

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DoneGraph Dashboard</title>
  <style>
    :root {
      --meadow: #dcebd7;
      --field: #eef4dc;
      --paper: #fff8e4;
      --page: #fff3cc;
      --page-deep: #f0dca4;
      --ink: #2a3528;
      --muted: #73806d;
      --moss: #5e865f;
      --clay: #c9784b;
      --amber: #e9bd66;
      --cream-line: rgba(78, 92, 64, .18);
      --shadow: rgba(84, 98, 66, .18);
    }
    * { box-sizing: border-box; }
    html, body { overflow-x: hidden; }
    body {
      margin: 0;
      min-width: 320px;
      color: var(--ink);
      background:
        radial-gradient(ellipse at 20% 8%, rgba(255, 248, 228, .82), transparent 34rem),
        radial-gradient(ellipse at 78% 18%, rgba(233, 189, 102, .18), transparent 30rem),
        linear-gradient(180deg, var(--meadow) 0%, var(--field) 58%, #f5e8bd 100%);
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
        linear-gradient(120deg, rgba(94, 134, 95, .07) 0 1px, transparent 1px 28px),
        linear-gradient(60deg, rgba(42, 53, 40, .045) 0 1px, transparent 1px 34px);
      mask-image: linear-gradient(180deg, #000 0%, transparent 88%);
    }
    .journal-shell {
      width: min(1380px, calc(100vw - 32px));
      min-height: 100vh;
      display: grid;
      align-content: center;
      gap: 18px;
      margin: 0 auto;
      padding: clamp(18px, 3vw, 42px) 0;
    }
    .journal-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      color: var(--muted);
      font-size: 12px;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .journal-top span {
      min-height: 34px;
      display: inline-grid;
      place-items: center;
      padding: 8px 13px;
      border: 1px solid var(--cream-line);
      border-radius: 999px;
      background: rgba(255, 248, 228, .66);
    }
    .journal-stage {
      position: relative;
      display: grid;
      min-height: 760px;
      perspective: 1800px;
    }
    .spread {
      grid-area: 1 / 1;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 18px;
      opacity: 0;
      pointer-events: none;
      transform: rotateY(8deg) translateX(16px);
      transform-origin: center right;
      transition: opacity .42s ease, transform .62s cubic-bezier(.2, .8, .2, 1);
    }
    .spread.active {
      opacity: 1;
      pointer-events: auto;
      transform: rotateY(0) translateX(0);
    }
    .page {
      position: relative;
      min-width: 0;
      min-height: 740px;
      padding: clamp(24px, 3.2vw, 44px);
      border: 1px solid rgba(78, 92, 64, .2);
      background:
        linear-gradient(90deg, rgba(160, 118, 69, .10), transparent 26px),
        linear-gradient(180deg, rgba(255, 248, 228, .98), rgba(255, 243, 204, .96));
      border-radius: 34px;
      box-shadow: 0 28px 72px var(--shadow);
      overflow: hidden;
    }
    .page.left::after,
    .page.right::before {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      width: 42px;
      pointer-events: none;
    }
    .page.left::after {
      right: -1px;
      background: linear-gradient(90deg, transparent, rgba(98, 74, 42, .12));
    }
    .page.right::before {
      left: -1px;
      background: linear-gradient(270deg, transparent, rgba(98, 74, 42, .10));
    }
    .page-kicker {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      margin-bottom: 18px;
      color: var(--muted);
      font-size: 12px;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .page-kicker span {
      min-height: 30px;
      display: inline-grid;
      place-items: center;
      padding: 7px 12px;
      border: 1px solid rgba(94, 134, 95, .22);
      border-radius: 999px;
      background: rgba(255, 248, 228, .74);
    }
    h1 {
      margin: 0 0 18px;
      color: var(--ink);
      font-size: clamp(50px, 6.2vw, 94px);
      line-height: .92;
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
      max-width: 58ch;
      margin: 0;
      color: #455844;
      font-size: clamp(17px, 1.8vw, 23px);
      line-height: 1.42;
      overflow-wrap: anywhere;
    }
    .progress-orb {
      position: relative;
      width: min(100%, 360px);
      aspect-ratio: 1;
      display: grid;
      place-items: center;
      margin: 30px auto 16px;
      border-radius: 50%;
      background:
        radial-gradient(circle at center, var(--paper) 0 48%, transparent 49%),
        conic-gradient(var(--moss) 0 ${graph.summary.progress_percent * 3.6}deg, rgba(94, 134, 95, .16) 0deg);
      box-shadow: inset 0 0 0 16px rgba(255, 248, 228, .72), 0 24px 46px rgba(94, 134, 95, .16);
    }
    .progress-orb::after {
      content: "";
      position: absolute;
      inset: 30px;
      border: 1px dashed rgba(94, 134, 95, .28);
      border-radius: 50%;
    }
    .progress-orb strong {
      color: var(--moss);
      font: 900 clamp(70px, 10vw, 124px)/.85 "SFMono-Regular", Menlo, monospace;
      letter-spacing: -4px;
      z-index: 1;
    }
    .progress-orb span {
      position: absolute;
      bottom: 28%;
      z-index: 1;
      color: var(--muted);
      font-size: 12px;
      letter-spacing: .13em;
      text-transform: uppercase;
    }
    .soft-note {
      padding: 16px;
      border: 1px dashed rgba(94, 134, 95, .24);
      border-radius: 22px;
      background: rgba(255, 248, 228, .7);
      color: #4a5d48;
      line-height: 1.48;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-top: 20px;
    }
    .progress-caption {
      max-width: 46ch;
      margin: 0 auto 20px;
      color: var(--muted);
      text-align: center;
      line-height: 1.45;
    }
    .metric {
      min-height: 132px;
      padding: 18px;
      border: 1px solid rgba(94, 134, 95, .2);
      border-radius: 26px;
      background: rgba(255, 248, 228, .72);
    }
    .metric span {
      color: var(--muted);
      font-size: 12px;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .metric strong {
      display: block;
      margin-top: 24px;
      color: var(--moss);
      font: 850 48px/1 "SFMono-Regular", Menlo, monospace;
    }
    .achievement-list,
    .proof-grid,
    .node-grid {
      display: grid;
      gap: 12px;
    }
    .achievement-card,
    .proof-card,
    .journal-card {
      min-width: 0;
      display: grid;
      gap: 10px;
      padding: 16px;
      border: 1px solid rgba(78, 92, 64, .16);
      border-radius: 24px;
      background: rgba(255, 248, 228, .82);
      box-shadow: 0 14px 26px rgba(84, 98, 66, .08);
      animation: page-settle .56s ease both;
      animation-delay: var(--delay);
    }
    .achievement-card span,
    .proof-card span {
      width: max-content;
      max-width: 100%;
      padding: 6px 9px;
      border-radius: 999px;
      background: rgba(94, 134, 95, .12);
      color: var(--moss);
      font-size: 11px;
      font-weight: 850;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .achievement-card strong,
    .proof-card strong {
      font-size: 18px;
      line-height: 1.15;
    }
    .achievement-card p,
    .proof-card p,
    .journal-card p {
      margin: 0;
      color: var(--muted);
      line-height: 1.48;
      overflow-wrap: anywhere;
    }
    .proof-card.unknown span { color: #80631a; background: rgba(233, 189, 102, .24); }
    .proof-card.failed span,
    .proof-card.blocked span { color: #9e4f35; background: rgba(201, 120, 75, .16); }
    .card-cap {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .card-number {
      width: 38px;
      height: 38px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      background: var(--ink);
      color: var(--paper);
      font: 800 12px "SFMono-Regular", Menlo, monospace;
    }
    .card-kind {
      color: var(--moss);
      font-size: 11px;
      font-weight: 850;
      letter-spacing: .12em;
      text-transform: uppercase;
    }
    .stamp {
      width: max-content;
      max-width: 100%;
      padding: 6px 9px;
      border: 1px solid currentColor;
      border-radius: 999px;
      color: var(--moss);
      background: rgba(94, 134, 95, .10);
      font-size: 11px;
      font-weight: 850;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .stamp.failed, .stamp.blocked { color: #9e4f35; background: rgba(201, 120, 75, .14); }
    .stamp.unknown { color: #80631a; background: rgba(233, 189, 102, .26); }
    h2 {
      margin: 0 0 18px;
      font-size: clamp(30px, 4vw, 50px);
      line-height: 1;
      letter-spacing: 0;
    }
    h3 {
      margin: 0;
      font-size: 20px;
      line-height: 1.1;
      letter-spacing: 0;
      overflow-wrap: anywhere;
    }
    code {
      display: block;
      padding: 9px 10px;
      border: 1px dashed rgba(94, 134, 95, .26);
      border-radius: 14px;
      background: rgba(255, 248, 228, .72);
      color: #435b50;
      font: 12px "SFMono-Regular", Menlo, monospace;
      overflow-wrap: anywhere;
    }
    .source {
      width: max-content;
      max-width: 100%;
      padding: 6px 9px;
      border-radius: 999px;
      background: rgba(94, 134, 95, .10);
      color: #416147;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
      overflow-wrap: anywhere;
    }
    .ledger-list {
      display: grid;
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .ledger-list li {
      padding: 0 0 10px;
      border-bottom: 1px dashed rgba(94, 134, 95, .24);
      color: #3d5349;
      line-height: 1.45;
    }
    .ledger-list li:last-child { padding-bottom: 0; border-bottom: 0; }
    .ledger-list li span {
      display: inline-block;
      margin-right: 8px;
      color: var(--clay);
      font-size: 11px;
      font-weight: 850;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    .badge-list {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }
    .badge {
      max-width: 100%;
      padding: 7px 9px;
      border: 1px solid rgba(94, 134, 95, .20);
      border-radius: 999px;
      background: rgba(255, 248, 228, .76);
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
      margin: 0;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
    }
    .page-controls {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
    }
    .page-controls button {
      min-height: 44px;
      padding: 10px 16px;
      border: 1px solid rgba(94, 134, 95, .26);
      border-radius: 999px;
      background: rgba(255, 248, 228, .72);
      color: var(--ink);
      font: inherit;
      font-size: 13px;
      font-weight: 760;
      letter-spacing: .05em;
      text-transform: uppercase;
      cursor: pointer;
      transition: transform .18s ease, background .18s ease;
    }
    .page-controls button:active { transform: translateY(1px); }
    .page-controls button.active {
      background: var(--ink);
      color: var(--paper);
    }
    @keyframes page-settle {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .spread, .achievement-card, .proof-card, .journal-card { animation: none; transition: none; }
    }
    @media (max-width: 980px) {
      .journal-stage { min-height: auto; }
      .spread, .spread.active {
        position: static;
        display: none;
        grid-template-columns: 1fr;
        transform: none;
      }
      .spread.active { display: grid; }
      .page { min-height: auto; }
      .page.left::after, .page.right::before { display: none; }
    }
    @media (max-width: 820px) {
      .metric-grid { grid-template-columns: 1fr; }
      h1 { font-size: 48px; }
      .progress-orb { width: min(100%, 280px); }
    }
    @media (max-width: 560px) {
      .journal-shell { width: min(100vw - 20px, 1380px); padding-block: 10px; }
      .journal-top { display: grid; }
      .page { border-radius: 24px; padding: 18px; }
      h1 { font-size: 42px; }
    }
  </style>
</head>
<body>
  <main class="journal-shell">
    <header class="journal-top">
      <span>Done Task Map</span>
      <span>${escapeHtml(graph.platform)}</span>
      <span>Generated ${escapeHtml(graph.generated_at)}</span>
    </header>
    <section class="journal-stage" aria-live="polite">
      <section class="spread active" data-spread="0">
        <article class="page left">
          <div class="page-kicker"><span>Progress Journal</span><span>Clean-room</span></div>
          <h1><span>DoneGraph</span><span>Progress</span><span>Journal</span></h1>
          <p class="story">${escapeHtml(graph.narrative)}</p>
          <div class="soft-note">${escapeHtml(blockerText)}</div>
        </article>
        <article class="page right">
          <div class="progress-orb" aria-label="Progress ${graph.summary.progress_percent}%"><strong>${graph.summary.progress_percent}%</strong><span>complete</span></div>
          <p class="progress-caption">The first page only answers one question: how much real progress has this collaboration earned?</p>
          <div class="metric-grid">
            <div class="metric"><span>Completed</span><strong>${graph.summary.completed_count}</strong></div>
            <div class="metric"><span>Evidence Pass</span><strong>${graph.summary.evidence_passed}</strong></div>
            <div class="metric"><span>Unknown Proof</span><strong>${graph.summary.evidence_unknown}</strong></div>
            <div class="metric"><span>Blockers</span><strong>${graph.summary.blockers}</strong></div>
          </div>
        </article>
      </section>

      <section class="spread" data-spread="1">
        <article class="page left">
          <div class="page-kicker"><span>Finished Work</span><span>${graph.achievements.length} entries</span></div>
          <h2>Collected Progress</h2>
          <section class="achievement-list">${completedCards || "<p class=\"soft-note\">No completed work has been recorded yet.</p>"}</section>
        </article>
        <article class="page right">
          <div class="page-kicker"><span>All Notes</span><span>task memory</span></div>
          <h2>Work Pages</h2>
          <section class="node-grid">${nodes}</section>
        </article>
      </section>

      <section class="spread" data-spread="2">
        <article class="page left">
          <div class="page-kicker"><span>Proof</span><span>evidence state</span></div>
          <h2>Evidence Stamps</h2>
          <section class="proof-grid">${evidenceCards || "<p class=\"soft-note\">No verification evidence has been recorded yet.</p>"}</section>
        </article>
        <article class="page right">
          <div class="page-kicker"><span>Next Page</span><span>handoff</span></div>
          <h2>Continue Here</h2>
          <ul class="ledger-list">${nextSteps}</ul>
          <p class="footer-note">This page is what the next AI session should read before it continues the work.</p>
        </article>
      </section>

      <section class="spread" data-spread="3">
        <article class="page left">
          <div class="page-kicker"><span>Clean-room Schema</span><span>details</span></div>
          <h2>Clean-room Schema</h2>
          <p class="soft-note">${escapeHtml(graph.schema.purpose)}</p>
          <div class="badge-list">${schemaLabels}</div>
          <h3>Captured Sources</h3>
          <ul class="ledger-list">${sources || "<li>Current records came from manual events.</li>"}</ul>
        </article>
        <article class="page right">
          <div class="page-kicker"><span>Relationship Trace</span><span>optional</span></div>
          <h2>Relationship Trace</h2>
          <ul class="ledger-list edge-list">${relationshipTrace || "<li>No relationship edges yet.</li>"}</ul>
          <h3>Achievement Ledger</h3>
          <ul class="ledger-list">${achievements || "<li>No achievement entries yet.</li>"}</ul>
        </article>
      </section>
    </section>
    <nav class="page-controls" aria-label="Journal pages">
      <button class="active" type="button" data-target="0">Progress</button>
      <button type="button" data-target="1">Finished</button>
      <button type="button" data-target="2">Proof</button>
      <button type="button" data-target="3">Details</button>
    </nav>
  </main>
  <script>
    const spreads = Array.from(document.querySelectorAll(".spread"));
    const buttons = Array.from(document.querySelectorAll(".page-controls button"));
    const journalStage = document.querySelector(".journal-stage");
    function showSpread(target) {
      spreads.forEach((spread) => {
        spread.classList.toggle("active", spread.dataset.spread === target);
      });
      buttons.forEach((button) => {
        button.classList.toggle("active", button.dataset.target === target);
      });
      journalStage?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    buttons.forEach((button) => {
      button.addEventListener("click", () => showSpread(button.dataset.target || "0"));
    });
  </script>
</body>
</html>`;
}
