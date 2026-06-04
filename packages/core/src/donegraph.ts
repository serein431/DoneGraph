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
  purpose: "洁净室重写的 AI 协作进度图，用来记录目标、动作、产物、证据、决策、阻塞、成就和下一步。",
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
  if (status === "pass") return "已证明";
  if (status === "fail") return "待修复";
  if (status === "blocked") return "被阻塞";
  return "待证明";
}

function nodeTypeText(type: DoneGraphNodeType): string {
  const labels: Record<DoneGraphNodeType, string> = {
    goal: "目标",
    task: "任务",
    decision: "决策",
    artifact: "产物",
    evidence: "证据",
    blocker: "阻塞",
    achievement: "成就",
    next_step: "下一步"
  };
  return labels[type];
}

function renderNode(node: DoneGraphNode, index: number): string {
  return [
    `<article class="journal-card ${escapeHtml(node.type)} ${escapeHtml(statusLabel(node.status))}" style="--delay: ${index * 70}ms">`,
    `<div class="card-cap"><span class="card-number">${String(index + 1).padStart(2, "0")}</span><span class="card-kind">${escapeHtml(nodeTypeText(node.type))}</span></div>`,
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
    .map((item) => `<li><span>${escapeHtml(statusText(item.status))}</span>${escapeHtml(item.title)}</li>`)
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
    .map(([source, count]) => `<li><span>${escapeHtml(source)}</span>${count} 条捕获记录</li>`)
    .join("\n");
  const blockerText =
    graph.summary.blockers === 0 ? "这一轮暂时没有阻塞，可以安心往前翻。" : `还有 ${graph.summary.blockers} 个阻塞需要先处理。`;

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DoneGraph 进度手账</title>
  <style>
    :root {
      --meadow: #dbeed5;
      --field: #f7f0d0;
      --paper: #fff9e9;
      --page: #fff3d5;
      --page-deep: #ecd99e;
      --ink: #56391f;
      --muted: #806a4e;
      --moss: #4f926c;
      --mint: #83c999;
      --teal: #1dbeb0;
      --clay: #c9784b;
      --amber: #e9bd66;
      --cream-line: rgba(118, 79, 39, .18);
      --shadow: rgba(91, 63, 32, .18);
      --button-shadow: #d5a96e;
    }
    * { box-sizing: border-box; }
    html, body { overflow-x: hidden; }
    body {
      margin: 0;
      min-width: 320px;
      color: var(--ink);
      background:
        radial-gradient(ellipse at 18% 12%, rgba(255, 249, 233, .92), transparent 32rem),
        radial-gradient(ellipse at 76% 10%, rgba(29, 190, 176, .18), transparent 24rem),
        radial-gradient(ellipse at 50% 100%, rgba(233, 189, 102, .34), transparent 40rem),
        linear-gradient(180deg, var(--meadow) 0%, #eef5d8 44%, var(--field) 100%);
      font-family: "Nunito", "Zen Maru Gothic", "Avenir Next", "PingFang SC", "Hiragino Sans GB", sans-serif;
      text-rendering: geometricPrecision;
    }
    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: .28;
      background-image:
        radial-gradient(circle at 20% 20%, rgba(121, 79, 39, .10) 0 1px, transparent 1px 22px),
        linear-gradient(120deg, rgba(79, 146, 108, .07) 0 1px, transparent 1px 30px);
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
    .journal-stage::after {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 5;
      border-radius: 34px;
      pointer-events: none;
      opacity: 0;
      transform: translateX(-22%) rotateY(-74deg);
      transform-origin: left center;
      background:
        linear-gradient(90deg, rgba(255, 249, 233, .92), rgba(255, 243, 213, .34)),
        radial-gradient(ellipse at 25% 50%, rgba(121, 79, 39, .12), transparent 42%);
      box-shadow: 24px 0 44px rgba(91, 63, 32, .12);
    }
    .journal-stage.turning::after {
      animation: page-turn .72s cubic-bezier(.18, .82, .2, 1);
    }
    .spread {
      grid-area: 1 / 1;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 18px;
      opacity: 0;
      pointer-events: none;
      transform: rotateY(10deg) translateX(20px) scale(.992);
      transform-origin: center right;
      filter: blur(1px);
      transition: opacity .42s ease, transform .68s cubic-bezier(.2, .8, .2, 1), filter .42s ease;
    }
    .spread.active {
      opacity: 1;
      pointer-events: auto;
      transform: rotateY(0) translateX(0) scale(1);
      filter: none;
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
      box-shadow: 0 28px 0 rgba(213, 169, 110, .26), 0 36px 72px var(--shadow);
      overflow: hidden;
    }
    .page::before {
      content: "";
      position: absolute;
      inset: 12px;
      border: 1px dashed rgba(121, 79, 39, .12);
      border-radius: 26px;
      pointer-events: none;
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
      color: #6d5638;
      font-size: clamp(17px, 1.8vw, 23px);
      line-height: 1.42;
      overflow-wrap: anywhere;
    }
    .home-copy {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 28px;
    }
    .home-title {
      margin-bottom: 22px;
      color: var(--ink);
      font-size: clamp(54px, 7vw, 106px);
      line-height: .9;
      text-shadow: 0 6px 0 rgba(213, 169, 110, .22);
    }
    .home-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 24px;
    }
    .home-actions button {
      min-height: 48px;
      padding: 12px 18px;
      border: 1px solid rgba(121, 79, 39, .2);
      border-radius: 22px;
      background: var(--teal);
      color: #fffdf3;
      font: inherit;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 7px 0 #0f8f86, 0 14px 22px rgba(29, 190, 176, .18);
      transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
    }
    .home-actions button.secondary {
      background: #fff7dc;
      color: var(--ink);
      box-shadow: 0 7px 0 var(--button-shadow), 0 14px 22px rgba(121, 79, 39, .12);
    }
    .home-actions button:hover {
      transform: translateY(-2px);
      filter: saturate(1.08);
    }
    .home-actions button:active {
      transform: translateY(4px);
      box-shadow: 0 3px 0 #0f8f86, 0 8px 16px rgba(29, 190, 176, .14);
    }
    .home-actions button.secondary:active {
      box-shadow: 0 3px 0 var(--button-shadow), 0 8px 16px rgba(121, 79, 39, .10);
    }
    .home-map {
      display: grid;
      align-content: space-between;
      gap: 18px;
      background:
        radial-gradient(circle at 20% 18%, rgba(255, 255, 255, .72), transparent 9rem),
        radial-gradient(circle at 78% 24%, rgba(131, 201, 153, .34), transparent 11rem),
        linear-gradient(180deg, #fff8df, #f6e7b7);
    }
    .island-scene {
      position: relative;
      min-height: 430px;
      border-radius: 32px;
      background:
        radial-gradient(ellipse at 50% 62%, rgba(131, 201, 153, .26) 0 39%, transparent 40%),
        linear-gradient(180deg, rgba(255, 255, 255, .36), rgba(255, 249, 233, .2));
      overflow: hidden;
    }
    .island-scene::before,
    .island-scene::after {
      content: "";
      position: absolute;
      border-radius: 999px;
      background: rgba(255, 255, 255, .72);
      animation: cloud-drift 8s ease-in-out infinite alternate;
    }
    .island-scene::before { width: 150px; height: 42px; left: 9%; top: 12%; }
    .island-scene::after { width: 108px; height: 34px; right: 12%; top: 20%; animation-delay: -2s; }
    .island-ground {
      position: absolute;
      left: 50%;
      top: 56%;
      width: min(82%, 440px);
      aspect-ratio: 1.32;
      transform: translate(-50%, -50%) rotate(-3deg);
      border: 3px solid rgba(121, 79, 39, .10);
      border-radius: 48% 52% 44% 56% / 58% 48% 52% 42%;
      background:
        radial-gradient(circle at 38% 44%, rgba(255, 249, 233, .62) 0 10%, transparent 11%),
        radial-gradient(circle at 68% 58%, rgba(29, 190, 176, .20) 0 12%, transparent 13%),
        linear-gradient(135deg, #a8d88c, #79c991 54%, #52ae7b);
      box-shadow: inset 0 -18px 0 rgba(56, 126, 83, .16), 0 26px 0 rgba(213, 169, 110, .28), 0 38px 48px rgba(91, 63, 32, .15);
      animation: island-bob 5s ease-in-out infinite;
    }
    .path-ribbon {
      position: absolute;
      left: 13%;
      right: 12%;
      top: 52%;
      height: 58px;
      border-top: 8px dotted rgba(121, 79, 39, .32);
      border-radius: 50%;
      transform: rotate(9deg);
    }
    .path-dot {
      position: absolute;
      width: 46px;
      height: 46px;
      display: grid;
      place-items: center;
      border-radius: 18px;
      background: var(--paper);
      color: var(--ink);
      font: 900 13px "SFMono-Regular", Menlo, monospace;
      box-shadow: 0 6px 0 rgba(213, 169, 110, .5), 0 12px 16px rgba(91, 63, 32, .14);
    }
    .dot-one { left: 17%; top: 59%; }
    .dot-two { left: 38%; top: 43%; }
    .dot-three { right: 30%; top: 55%; }
    .dot-four { right: 13%; top: 35%; }
    .tiny-house {
      position: absolute;
      left: 31%;
      top: 24%;
      width: 74px;
      height: 58px;
      border-radius: 20px 20px 16px 16px;
      background: #fff4cf;
      box-shadow: 0 8px 0 rgba(121, 79, 39, .12);
    }
    .tiny-house::before {
      content: "";
      position: absolute;
      left: -8px;
      top: -26px;
      width: 90px;
      height: 46px;
      border-radius: 26px 26px 8px 8px;
      background: var(--clay);
      transform: rotate(-4deg);
    }
    .tiny-house::after {
      content: "";
      position: absolute;
      left: 28px;
      bottom: 0;
      width: 20px;
      height: 28px;
      border-radius: 10px 10px 0 0;
      background: #8f653d;
    }
    .tiny-tree {
      position: absolute;
      right: 24%;
      top: 25%;
      width: 46px;
      height: 76px;
      border-radius: 999px 999px 22px 22px;
      background: #2f9267;
      box-shadow: -28px 34px 0 -8px #4cae72;
    }
    .tiny-tree::after {
      content: "";
      position: absolute;
      left: 17px;
      bottom: -20px;
      width: 12px;
      height: 32px;
      border-radius: 8px;
      background: #8b6038;
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
        conic-gradient(var(--teal) 0 ${graph.summary.progress_percent * 3.6}deg, rgba(79, 146, 108, .16) 0deg);
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
    .home-map .progress-orb {
      z-index: 2;
      width: min(58%, 238px);
      margin: 250px auto 0;
      background:
        radial-gradient(circle at center, var(--paper) 0 50%, transparent 51%),
        conic-gradient(var(--teal) 0 ${graph.summary.progress_percent * 3.6}deg, rgba(255, 255, 255, .42) 0deg);
      box-shadow: inset 0 0 0 12px rgba(255, 249, 233, .72), 0 14px 0 rgba(213, 169, 110, .30), 0 24px 34px rgba(91, 63, 32, .14);
    }
    .home-map .progress-orb strong {
      font-size: clamp(48px, 7vw, 78px);
      letter-spacing: -3px;
    }
    .home-map .progress-orb span {
      bottom: 25%;
      font-size: 11px;
    }
    .home-stat-strip {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      position: relative;
      z-index: 1;
    }
    .home-stat {
      min-height: 88px;
      padding: 14px;
      border: 1px solid rgba(121, 79, 39, .14);
      border-radius: 22px;
      background: rgba(255, 249, 233, .78);
      box-shadow: 0 6px 0 rgba(213, 169, 110, .22);
    }
    .home-stat span {
      color: var(--muted);
      font-size: 12px;
      font-weight: 800;
    }
    .home-stat strong {
      display: block;
      margin-top: 10px;
      color: var(--moss);
      font: 900 34px/1 "SFMono-Regular", Menlo, monospace;
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
      border: 1px solid rgba(121, 79, 39, .18);
      border-radius: 18px;
      background: #fff7dc;
      color: var(--ink);
      font: inherit;
      font-size: 13px;
      font-weight: 900;
      letter-spacing: .05em;
      text-transform: uppercase;
      cursor: pointer;
      box-shadow: 0 6px 0 var(--button-shadow), 0 12px 22px rgba(91, 63, 32, .10);
      transition: transform .18s ease, background .18s ease, box-shadow .18s ease;
    }
    .page-controls button:hover { transform: translateY(-2px); }
    .page-controls button:active {
      transform: translateY(4px);
      box-shadow: 0 2px 0 var(--button-shadow), 0 8px 16px rgba(91, 63, 32, .08);
    }
    .page-controls button.active {
      background: var(--teal);
      color: #fffdf3;
      box-shadow: 0 6px 0 #0f8f86, 0 12px 22px rgba(29, 190, 176, .18);
    }
    @keyframes page-turn {
      0% { opacity: 0; transform: translateX(-26%) rotateY(-78deg); }
      22% { opacity: .72; }
      100% { opacity: 0; transform: translateX(62%) rotateY(72deg); }
    }
    @keyframes page-settle {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes island-bob {
      0%, 100% { transform: translate(-50%, -50%) rotate(-3deg) translateY(0); }
      50% { transform: translate(-50%, -50%) rotate(-2deg) translateY(-8px); }
    }
    @keyframes cloud-drift {
      from { transform: translateX(-8px); }
      to { transform: translateX(12px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .spread, .achievement-card, .proof-card, .journal-card, .journal-stage::after, .island-ground, .island-scene::before, .island-scene::after { animation: none; transition: none; }
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
      .metric-grid, .home-stat-strip { grid-template-columns: 1fr; }
      h1 { font-size: 48px; }
      .progress-orb { width: min(100%, 280px); }
      .island-scene { min-height: 360px; }
      .home-map .progress-orb { margin-top: 210px; }
    }
    @media (min-width: 760px) and (max-width: 980px) {
      .home-spread,
      .home-spread.active {
        display: grid;
        grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr);
        gap: 14px;
      }
      .home-spread .page {
        min-height: 640px;
        padding: 24px;
      }
      .home-title {
        font-size: clamp(42px, 5.8vw, 52px);
        line-height: .94;
      }
      .home-actions button {
        min-height: 44px;
        padding: 10px 14px;
      }
      .island-scene {
        min-height: 330px;
      }
      .home-map .progress-orb {
        width: min(54%, 190px);
        margin-top: 194px;
      }
      .home-stat-strip {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .home-stat {
        min-height: 74px;
        padding: 12px;
      }
      .home-stat strong {
        font-size: 26px;
      }
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
      <span>完成进度地图</span>
      <span>${escapeHtml(graph.platform)}</span>
      <span>生成于 ${escapeHtml(graph.generated_at)}</span>
    </header>
    <section class="journal-stage" aria-live="polite">
      <section class="spread active home-spread" data-spread="0">
        <article class="page left home-copy">
          <div>
          <div class="page-kicker"><span>进度手账</span><span>洁净室重写</span></div>
          <h1 class="home-title"><span>DoneGraph</span><span>进度岛</span><span>手账</span></h1>
          <p class="story">${escapeHtml(graph.narrative)}</p>
          <div class="home-actions">
            <button type="button" data-jump="1">翻到完成页</button>
            <button class="secondary" type="button" data-jump="2">看看证据</button>
          </div>
          </div>
          <div class="soft-note">${escapeHtml(blockerText)}</div>
        </article>
        <article class="page right home-map">
          <div class="page-kicker"><span>今日进度</span><span>${graph.summary.completed_count} 个完成信号</span></div>
          <div class="island-scene" aria-hidden="true">
            <div class="island-ground">
              <div class="path-ribbon"></div>
              <div class="tiny-house"></div>
              <div class="tiny-tree"></div>
              <div class="path-dot dot-one">01</div>
              <div class="path-dot dot-two">02</div>
              <div class="path-dot dot-three">03</div>
              <div class="path-dot dot-four">${String(Math.max(1, Math.min(99, graph.summary.completed_count))).padStart(2, "0")}</div>
            </div>
            <div class="progress-orb" aria-label="完成进度 ${graph.summary.progress_percent}%"><strong>${graph.summary.progress_percent}%</strong><span>已完成</span></div>
          </div>
          <p class="progress-caption">首页先给一个安定的答案：做到哪里了，哪些已经落袋，下一页再慢慢翻。</p>
          <div class="home-stat-strip">
            <div class="home-stat"><span>已完成</span><strong>${graph.summary.completed_count}</strong></div>
            <div class="home-stat"><span>已验证</span><strong>${graph.summary.evidence_passed}</strong></div>
            <div class="home-stat"><span>阻塞</span><strong>${graph.summary.blockers}</strong></div>
          </div>
        </article>
      </section>

      <section class="spread" data-spread="1">
        <article class="page left">
          <div class="page-kicker"><span>进度详情</span><span>总览</span></div>
          <h2>进度刻度</h2>
          <div class="progress-orb" aria-label="完成进度 ${graph.summary.progress_percent}%"><strong>${graph.summary.progress_percent}%</strong><span>已完成</span></div>
          <p class="progress-caption">第一页只回答一件事：这轮你和 AI 已经一起完成了多少真实进展？</p>
          <div class="metric-grid">
            <div class="metric"><span>已完成</span><strong>${graph.summary.completed_count}</strong></div>
            <div class="metric"><span>已验证</span><strong>${graph.summary.evidence_passed}</strong></div>
            <div class="metric"><span>待确认</span><strong>${graph.summary.evidence_unknown}</strong></div>
            <div class="metric"><span>阻塞</span><strong>${graph.summary.blockers}</strong></div>
          </div>
        </article>
        <article class="page right">
          <div class="page-kicker"><span>完成清单</span><span>${graph.achievements.length} 条记录</span></div>
          <h2>收集到的进展</h2>
          <section class="achievement-list">${completedCards || "<p class=\"soft-note\">还没有记录已完成的进展。</p>"}</section>
        </article>
      </section>

      <section class="spread" data-spread="2">
        <article class="page left">
          <div class="page-kicker"><span>证据</span><span>验证状态</span></div>
          <h2>证据贴纸</h2>
          <section class="proof-grid">${evidenceCards || "<p class=\"soft-note\">还没有记录验证证据。</p>"}</section>
        </article>
        <article class="page right">
          <div class="page-kicker"><span>下一页</span><span>交接</span></div>
          <h2>从这里继续</h2>
          <ul class="ledger-list">${nextSteps}</ul>
          <p class="footer-note">下一轮 AI 继续之前，先读这一页就能知道该从哪里接上。</p>
        </article>
      </section>

      <section class="spread" data-spread="3">
        <article class="page left">
          <div class="page-kicker"><span>洁净室结构</span><span>细节</span></div>
          <h2>洁净室结构</h2>
          <p class="soft-note">${escapeHtml(graph.schema.purpose)}</p>
          <div class="badge-list">${schemaLabels}</div>
          <h3>来源记录</h3>
          <ul class="ledger-list">${sources || "<li>当前记录来自手动事件。</li>"}</ul>
        </article>
        <article class="page right">
          <div class="page-kicker"><span>关系线索</span><span>可选</span></div>
          <h2>关系线索</h2>
          <ul class="ledger-list edge-list">${relationshipTrace || "<li>还没有关系连线。</li>"}</ul>
          <h3>成就账本</h3>
          <ul class="ledger-list">${achievements || "<li>还没有成就记录。</li>"}</ul>
        </article>
      </section>
    </section>
    <nav class="page-controls" aria-label="手账页">
      <button class="active" type="button" data-target="0">进度</button>
      <button type="button" data-target="1">完成</button>
      <button type="button" data-target="2">证据</button>
      <button type="button" data-target="3">细节</button>
    </nav>
  </main>
  <script>
    const spreads = Array.from(document.querySelectorAll(".spread"));
    const buttons = Array.from(document.querySelectorAll(".page-controls button"));
    const jumpButtons = Array.from(document.querySelectorAll("[data-jump]"));
    const journalStage = document.querySelector(".journal-stage");
    function showSpread(target) {
      const current = document.querySelector(".spread.active")?.dataset.spread;
      if (current === target) return;
      journalStage?.classList.remove("turning");
      void journalStage?.offsetWidth;
      journalStage?.classList.add("turning");
      spreads.forEach((spread) => {
        spread.classList.toggle("active", spread.dataset.spread === target);
      });
      buttons.forEach((button) => {
        button.classList.toggle("active", button.dataset.target === target);
      });
      journalStage?.scrollIntoView({ block: "start", behavior: "smooth" });
      window.setTimeout(() => journalStage?.classList.remove("turning"), 760);
    }
    buttons.forEach((button) => {
      button.addEventListener("click", () => showSpread(button.dataset.target || "0"));
    });
    jumpButtons.forEach((button) => {
      button.addEventListener("click", () => showSpread(button.dataset.jump || "0"));
    });
  </script>
</body>
</html>`;
}
