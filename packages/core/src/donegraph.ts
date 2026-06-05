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

export type DoneGraphMilestoneId =
  | "goal_defined"
  | "implementation_started"
  | "artifact_created"
  | "evidence_collected"
  | "demo_ready"
  | "handoff_ready";

export interface DoneGraphMilestone {
  id: DoneGraphMilestoneId;
  title: string;
  detail: string;
  status: EvidenceStatus;
  source_node_ids: string[];
}

export interface DoneGraphSummary {
  total_events: number;
  completed_count: number;
  milestones_completed: number;
  milestones_total: number;
  current_stage: string;
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
  milestones: DoneGraphMilestone[];
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

function categoryForChangedFile(filePath: string): string {
  const normalized = filePath.toLowerCase();
  if (
    normalized.includes("test") ||
    normalized.includes("spec") ||
    normalized.includes("__tests__") ||
    normalized.endsWith(".snap")
  ) {
    return "验证补强";
  }
  if (
    normalized === "readme.md" ||
    normalized.startsWith("readmes/") ||
    normalized.startsWith("docs/") ||
    normalized.endsWith("design.md") ||
    normalized.endsWith(".md")
  ) {
    return "产品说明";
  }
  if (
    normalized.startsWith("plugins/") ||
    normalized.includes("plugin.json") ||
    normalized.includes("marketplace.json") ||
    normalized.includes("install.sh")
  ) {
    return "插件交付";
  }
  if (normalized.startsWith("scripts/") || normalized.startsWith(".github/")) {
    return "工作流自动化";
  }
  if (normalized.startsWith("src/") || normalized.includes("/src/")) {
    return "功能实现";
  }
  return "项目文件";
}

function changedFileProgressText(changedFiles: string[], projectName: string): string {
  if (changedFiles.length === 0) {
    return `记录 ${projectName} 的当前项目快照，尚未检测到 git 改动文件。`;
  }
  const counts = new Map<string, number>();
  for (const file of changedFiles) {
    const category = categoryForChangedFile(file);
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  const categoryOrder = ["功能实现", "验证补强", "产品说明", "插件交付", "工作流自动化", "项目文件"];
  const summary = categoryOrder
    .filter((category) => counts.has(category))
    .map((category) => `${category} ${counts.get(category)} 个`)
    .join("、");
  const preview = changedFiles.slice(0, 4).join(", ");
  return `识别到 ${counts.size} 类项目进展：${summary}。代表文件：${preview}${changedFiles.length > 4 ? " ..." : ""}`;
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

  events.push(
    makeCaptureEvent({
      index: events.length + 1,
      type: "artifact",
      text: changedFileProgressText(input.changedFiles, projectName),
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

function milestone(
  id: DoneGraphMilestoneId,
  title: string,
  status: EvidenceStatus,
  detail: string,
  sourceNodes: DoneGraphNode[]
): DoneGraphMilestone {
  return {
    id,
    title,
    status,
    detail,
    source_node_ids: sourceNodes.map((node) => node.id)
  };
}

function milestoneStatusFromNodes(nodes: DoneGraphNode[]): EvidenceStatus {
  if (nodes.some((node) => node.status === "fail")) return "fail";
  if (nodes.some((node) => node.status === "blocked")) return "blocked";
  if (nodes.some((node) => node.status === "pass")) return "pass";
  return "unknown";
}

function buildMilestones(nodes: DoneGraphNode[]): DoneGraphMilestone[] {
  const goals = nodes.filter((node) => node.type === "goal");
  const implementation = nodes.filter((node) => node.type === "task" || node.type === "decision");
  const artifacts = nodes.filter((node) => node.type === "artifact");
  const evidence = nodes.filter((node) => node.type === "evidence");
  const completions = nodes.filter((node) => node.type === "task" && node.title === "阶段完成");
  const blockingNodes = nodes.filter(
    (node) => node.type === "blocker" || node.status === "blocked" || node.status === "fail"
  );

  const evidenceStatus = milestoneStatusFromNodes(evidence);
  const demoStatus =
    blockingNodes.length > 0
      ? milestoneStatusFromNodes(blockingNodes)
      : completions.length > 0 && evidence.some((node) => node.status === "pass")
        ? "pass"
        : "unknown";
  const handoffStatus =
    demoStatus === "pass" && !evidence.some((node) => node.status === "unknown") ? "pass" : demoStatus === "fail" || demoStatus === "blocked" ? demoStatus : "unknown";

  return [
    milestone(
      "goal_defined",
      "目标已确定",
      goals.length > 0 ? "pass" : "unknown",
      goals[0]?.detail ?? "还没有记录这轮协作的目标。",
      goals
    ),
    milestone(
      "implementation_started",
      "实现已启动",
      implementation.length > 0 ? milestoneStatusFromNodes(implementation) : "unknown",
      implementation[0]?.detail ?? "还没有记录实现动作或关键决策。",
      implementation
    ),
    milestone(
      "artifact_created",
      "产物已出现",
      artifacts.length > 0 ? milestoneStatusFromNodes(artifacts) : "unknown",
      artifacts[0]?.detail ?? "还没有记录 README、代码、插件或演示产物。",
      artifacts
    ),
    milestone(
      "evidence_collected",
      "证据已收集",
      evidence.length > 0 ? evidenceStatus : "unknown",
      evidence.find((node) => node.status === "pass")?.detail ?? evidence[0]?.detail ?? "还没有记录可判断的验证证据。",
      evidence
    ),
    milestone(
      "demo_ready",
      "演示已可用",
      demoStatus,
      demoStatus === "pass" ? completions[0]?.detail ?? "已有完成记录和通过证据。" : "还需要一条阶段完成记录，把进度变成可演示成果。",
      completions
    ),
    milestone(
      "handoff_ready",
      "交接已清楚",
      handoffStatus,
      handoffStatus === "pass" ? "下一轮可以直接接着已完成成果继续。" : "还需要把下一步、风险或验证缺口写清楚。",
      nodes.filter((node) => node.type === "next_step")
    )
  ];
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

function currentStageFor(milestones: DoneGraphMilestone[]): string {
  const firstOpen = milestones.find((item) => item.status !== "pass");
  if (!firstOpen) return "可以交付演示";
  if (firstOpen.id === "goal_defined") return "目标还没定";
  if (firstOpen.id === "implementation_started") return "等待开始实现";
  if (firstOpen.id === "artifact_created") return "等待产物出现";
  if (firstOpen.id === "evidence_collected") return "等待证据验证";
  if (firstOpen.id === "demo_ready") return "演示还差收尾";
  return "交接还要整理";
}

function summaryFor(nodes: DoneGraphNode[], totalEvents: number, nextSteps: string[], milestones: DoneGraphMilestone[]): DoneGraphSummary {
  const scoreable = nodes.filter((node) => node.type !== "next_step");
  const completed = scoreable.filter((node) => node.status === "pass").length;
  const completedMilestones = milestones.filter((item) => item.status === "pass").length;
  const progress = milestones.length === 0 ? 0 : Math.round((completedMilestones / milestones.length) * 100);
  return {
    total_events: totalEvents,
    completed_count: completed,
    milestones_completed: completedMilestones,
    milestones_total: milestones.length,
    current_stage: currentStageFor(milestones),
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
  return `这轮协作已经走完 ${graph.summary.milestones_completed} / ${graph.summary.milestones_total} 个里程碑，当前阶段是「${graph.summary.current_stage}」，并沉淀 ${graph.summary.evidence_passed} 条通过证据。下一步是：${graph.next_steps[0] ?? "继续记录协作事件"}`;
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
  const milestones = buildMilestones(allNodes);
  const edges = buildEdges(allNodes);
  const base = {
    version: "1" as const,
    schema: doneGraphSchema,
    generated_at: generatedAt,
    goal: goalEvent?.text ?? "",
    platform: goalEvent?.platform ?? sorted[0]?.platform ?? "generic",
    summary: summaryFor(allNodes, sorted.length, nextSteps, milestones),
    nodes: allNodes,
    edges,
    milestones,
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

interface DashboardStoryCopy {
  title: string;
  detail: string;
  kind: string;
}

interface DashboardProgressItem extends DashboardStoryCopy {
  status: EvidenceStatus;
}

function commandIntent(value: string | undefined): "test" | "typecheck" | "build" | "lint" | undefined {
  const normalized = value?.toLowerCase() ?? "";
  if (normalized.includes("typecheck") || normalized.includes("tsc")) return "typecheck";
  if (normalized.includes("build")) return "build";
  if (normalized.includes("lint")) return "lint";
  if (normalized.includes("test") || normalized.includes("vitest")) return "test";
  return undefined;
}

function cleanDashboardText(value: string | undefined, fallback: string): string {
  const cleaned = normalizeText(value ?? "")
    .replace(/真实运行验证命令并通过[:：]?\s*[\w\s:.-]+/gi, "真实检查已经通过")
    .replace(/发现可用于证明进展的验证入口[:：][^。]+。?/g, "已经找到可以证明进展的检查入口。")
    .replace(/代表文件[:：][^。；;]+[。；;]?/g, "这些变化已经被整理成一条可以继续追的进展。")
    .replace(/\bpath=[^\s，。；;]+/gi, "")
    .replace(/\bcommand=[^\s，。；;]+/gi, "")
    .replace(/\bnpm(?:\s+run)?\s+[\w:-]+/gi, "一次项目检查")
    .replace(/\.donegraph\/[^\s，。；;]+/gi, "进度手账")
    .replace(/\b(?:apps|packages|plugins|platforms|scripts|src|test|tests|READMEs?)\/[^\s，。；;]+/gi, "相关项目内容")
    .replace(/DoneGraph CLI/g, "DoneGraph 工具")
    .replace(/\bCLI\b/g, "工具")
    .replace(/命令优先的/g, "核心")
    .replace(/\s+/g, " ")
    .replace(/\s+([，。；])/g, "$1")
    .trim();
  return cleaned.length > 0 ? cleaned : fallback;
}

function storyCopyForNode(node: DoneGraphNode): DashboardStoryCopy {
  const intent = commandIntent(`${node.metadata.command ?? ""} ${node.title} ${node.detail}`);
  const path = node.metadata.path?.toLowerCase() ?? "";

  if (node.type === "goal") {
    return {
      title: "把目标说清楚",
      detail: `这轮协作先确定了方向：${cleanDashboardText(node.detail, "要完成的事情已经被写下来。")}`,
      kind: "目标"
    };
  }

  if (node.type === "decision") {
    return {
      title: "做出一个关键选择",
      detail: cleanDashboardText(node.detail, "这一步把后面的路线定得更清楚。"),
      kind: "决策"
    };
  }

  if (node.type === "artifact" && path.includes("dashboard")) {
    return {
      title: "做出可以翻看的进度手账",
      detail: "进展被整理成一页页可以打开的手账，不再只是一段聊天记录。",
      kind: "产物"
    };
  }

  if (node.type === "artifact") {
    return {
      title: "留下了可交付成果",
      detail: cleanDashboardText(node.detail, "这一步把协作里的想法变成了可以继续使用的东西。"),
      kind: "产物"
    };
  }

  if (node.type === "evidence" && intent === "typecheck") {
    return {
      title: "确认结构没有松动",
      detail: "类型和接口检查已经过了一遍，后面可以更安心地继续接。",
      kind: "验证"
    };
  }

  if (node.type === "evidence" && intent === "build") {
    return {
      title: "把成果打包到可运行状态",
      detail: "项目可以完整生成成果，说明这轮工作已经不只是想法。",
      kind: "验证"
    };
  }

  if (node.type === "evidence" && intent === "test") {
    if (node.metadata.source === "capture-verify") {
      return {
        title: "自动检查跑过核心流程",
        detail: "自动验证已经帮你扫过核心流程，这一步说明基础行为没有明显断掉。",
        kind: "验证"
      };
    }
    return {
      title: "关键流程检查已经通过",
      detail: "这条手动证明把关键流程确认了一遍，可以放心算进已完成进度。",
      kind: "验证"
    };
  }

  if (node.type === "evidence") {
    return {
      title: node.status === "pass" ? "留下一条可靠证据" : "留下一条待确认线索",
      detail: cleanDashboardText(node.detail, "这一步用来说明当前进展是否站得住。"),
      kind: "验证"
    };
  }

  if (node.type === "blocker") {
    return {
      title: "发现需要先处理的阻塞",
      detail: cleanDashboardText(node.detail, "这里需要先停一下，把卡住的地方处理掉。"),
      kind: "阻塞"
    };
  }

  if (node.type === "next_step") {
    return {
      title: "下一步已经写清楚",
      detail: cleanDashboardText(node.detail, "下一轮可以从这里接着走。"),
      kind: "下一步"
    };
  }

  if (intent === "build") {
    return {
      title: "把核心工具推进到可运行",
      detail: cleanDashboardText(node.detail, "DoneGraph 的主要流程已经成形，可以继续围绕体验打磨。"),
      kind: "推进"
    };
  }

  if (intent === "test") {
    return {
      title: "让核心流程先跑稳",
      detail: cleanDashboardText(node.detail, "这一步让项目从想法继续往可验证的成果靠近。"),
      kind: "推进"
    };
  }

  if (node.type === "task") {
    const raw = `${node.title} ${node.detail}`;
    if (raw.includes("自动扫描") || raw.includes("协作进度起点")) {
      return {
        title: "整理协作起点",
        detail: cleanDashboardText(node.detail, "这一步把散在上下文整理成可以继续推进的起点。"),
        kind: "推进"
      };
    }
    if (raw.includes("手账") || raw.includes("翻看") || raw.includes("首页")) {
      return {
        title: "做出可翻看的手账首页",
        detail: cleanDashboardText(node.detail, "这一步把进度变成可以打开和翻看的手账首页。"),
        kind: "推进"
      };
    }
    if (raw.includes("演示") || raw.includes("交接")) {
      return {
        title: "完成演示接力",
        detail: cleanDashboardText(node.detail, "这一步把完成进度、证据和下一步接力整理到一起。"),
        kind: "推进"
      };
    }
  }

  return {
    title: node.title === "阶段完成" ? "完成一个阶段" : "推进了一步",
    detail: cleanDashboardText(node.detail, "这一步让任务继续往前走。"),
    kind: "推进"
  };
}

function storyCopyForAchievement(item: DoneGraphAchievement, sourceNode: DoneGraphNode | undefined): DashboardStoryCopy {
  if (sourceNode) return storyCopyForNode(sourceNode);

  const raw = `${item.title} ${item.detail}`;
  const intent = commandIntent(raw);
  if (intent === "typecheck") {
    return { title: "确认结构没有松动", detail: "类型和接口检查已经过了一遍，后面可以更安心地继续接。", kind: "验证" };
  }
  if (intent === "build") {
    return { title: "把成果打包到可运行状态", detail: "项目可以完整生成成果，说明这轮工作已经不只是想法。", kind: "推进" };
  }
  if (intent === "test") {
    return { title: "确认关键流程跑得稳", detail: "核心行为已经真实检查过，这一步可以算进已完成的进度。", kind: "验证" };
  }
  return {
    title: cleanDashboardText(item.title, "完成一段进展"),
    detail: cleanDashboardText(item.detail, "这一步让任务继续往前走。"),
    kind: "进展"
  };
}

function dashboardNextStep(step: string): string {
  return cleanDashboardText(step, "把已完成的进展固定下来，再开启下一阶段目标。");
}

function progressProofTitle(item: DashboardStoryCopy, page: number): string {
  const raw = `${item.title} ${item.detail}`;
  if (item.kind === "目标") return "方向已经落到纸上";
  if (item.kind === "决策") return "路线已经选定";
  if (item.kind === "产物") return item.title.includes("手账") ? "可以打开的成果已经出现" : "交付物已经落地";
  if (item.kind === "验证" && item.title.includes("自动检查")) return "自动验证已经扫过";
  if (item.kind === "验证" && item.detail.includes("手动证明")) return "手动证明已经补上";
  if (item.kind === "验证" && item.title.includes("结构")) return "类型结构已经稳住";
  if (item.kind === "验证" && item.title.includes("打包")) return "构建结果已经过关";
  if (item.kind === "验证") return "验证让进度站得住";
  if (item.kind === "阻塞") return "风险已经被看见";
  if (item.kind === "下一步") return "接力点已经清楚";
  if (raw.includes("自动扫描") || raw.includes("协作进度起点")) return "起点已经整理出来";
  if (raw.includes("手账") || raw.includes("翻看") || raw.includes("首页")) return "手账已经翻得开";
  if (raw.includes("演示") || raw.includes("交接")) return "演示线索已经接上";
  if (item.title.includes("核心") || item.detail.includes("核心")) return "核心流程已经推进";
  return `第 ${page} 页也算数`;
}

function progressProofDetail(item: DashboardStoryCopy, page: number): string {
  const raw = `${item.title} ${item.detail}`;
  if (item.kind === "目标") {
    return "目标页证明这轮协作已经有了共同坐标，后面的动作、产物和验证才知道往哪里靠。";
  }
  if (item.kind === "决策") {
    return "决策页记录路线选择，下一次接手时不用重新猜为什么这么做。";
  }
  if (item.kind === "产物") {
    return item.title.includes("手账")
      ? "这页说明成果已经变成能打开、能翻看、能交给别人理解的东西。"
      : "这页说明协作不只停在讨论里，已经留下了可以继续使用的交付物。";
  }
  if (item.kind === "验证") {
    if (item.title.includes("自动检查")) {
      return "自动验证已经帮你扫过一遍基础流程，这页说明机器可重复检查的部分已经留下记录。";
    }
    if (item.detail.includes("手动证明")) {
      return "这条手动证明把最后确认补上，说明它不是自动扫描里的同一条进展。";
    }
    if (item.title.includes("结构")) {
      return "这页说明类型和接口已经对齐，后面继续接功能时不容易踩到结构问题。";
    }
    if (item.title.includes("打包")) {
      return "这页说明成果已经能完整生成，演示和交付可以继续往前走。";
    }
    return "验证页说明这一步不是口头完成，而是已经有证据支撑，可以安心算进进度。";
  }
  if (item.kind === "阻塞") {
    return "阻塞页把卡点摆到明面上，避免下一轮继续在同一个地方打转。";
  }
  if (item.kind === "下一步") {
    return "接力页把下一步放在这里，让后面的人能直接续上。";
  }
  if (raw.includes("自动扫描") || raw.includes("协作进度起点")) {
    return "这页把散在上下文收成一个起点，后面翻到这里时，能知道这轮协作从哪里开始。";
  }
  if (raw.includes("手账") || raw.includes("翻看") || raw.includes("首页")) {
    return "这页说明进度已经从聊天里走出来，变成能打开、能翻看、能给别人看的首页。";
  }
  if (raw.includes("演示") || raw.includes("交接")) {
    return "这页把完成进度、证据和接力点收在一起，演示时能讲清楚已经走到哪里。";
  }
  if (item.title.includes("核心") || item.detail.includes("核心")) {
    return "这页说明核心流程已经往可用状态推进，后面可以把注意力放到体验和收尾。";
  }
  return `第 ${page} 页记录的是一次具体推进。它不需要变成报告，只要能让人看见任务确实往前走了一格。`;
}

function dashboardNarrativeFor(graph: DoneGraph): string {
  const nextStep = graph.next_steps[0] ? dashboardNextStep(graph.next_steps[0]) : "继续记录下一段协作。";
  return `这轮协作已经走完 ${graph.summary.milestones_completed} / ${graph.summary.milestones_total} 个里程碑，当前阶段是「${graph.summary.current_stage}」，并沉淀 ${graph.summary.evidence_passed} 条通过证据。下一步是：${nextStep}`;
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
  const milestoneProgress = `${graph.summary.milestones_completed} / ${graph.summary.milestones_total}`;
  const nodeIndex = new Map(graph.nodes.map((node, index) => [node.id, index + 1]));
  const sourceNodeByEventId = new Map<string, DoneGraphNode>();
  for (const node of graph.nodes) {
    for (const eventId of node.source_event_ids) {
      if (!sourceNodeByEventId.has(eventId)) sourceNodeByEventId.set(eventId, node);
    }
  }
  const progressItems: DashboardProgressItem[] = graph.achievements.map((item) => {
    const sourceNode = item.source_event_ids.map((eventId) => sourceNodeByEventId.get(eventId)).find(Boolean);
    return {
      ...storyCopyForAchievement(item, sourceNode),
      status: item.status
    };
  });
  const progressSpreadCount = Math.max(progressItems.length, 1);
  const evidenceSpread = progressSpreadCount + 1;
  const detailSpread = progressSpreadCount + 2;
  const progressSpreads =
    progressItems.length > 0
      ? progressItems
          .map((item, index) => {
            const spread = index + 1;
            const page = index + 1;
            const previousTarget = page === 1 ? "0" : String(spread - 1);
            const nextTarget = page === progressItems.length ? String(evidenceSpread) : String(spread + 1);
            const nextLabel = page === progressItems.length ? "看证据" : "下一条完成";
            return `<section class="spread progress-spread" data-spread="${spread}" data-progress-page="${page}">
        <article class="page left progress-page">
          <div class="page-kicker"><span>完成</span><span>第 ${page} / ${progressItems.length} 页</span></div>
          <p class="progress-page-number">${String(page).padStart(2, "0")}</p>
          <h2>这一页完成了什么</h2>
          <h3>${escapeHtml(item.title)}</h3>
          <p class="progress-story">${escapeHtml(item.detail)}</p>
        </article>
        <article class="page right progress-proof-page">
          <div class="page-kicker"><span>${escapeHtml(item.kind)}</span><span>${escapeHtml(statusText(item.status))}</span></div>
          <h2>${escapeHtml(progressProofTitle(item, page))}</h2>
          <p class="soft-note">${escapeHtml(progressProofDetail(item, page))}</p>
          <div class="stamp ${escapeHtml(statusLabel(item.status))}">${escapeHtml(statusText(item.status))}</div>
          <div class="progress-pager">
            <button class="secondary" type="button" data-jump="${previousTarget}">${page === 1 ? "回到进度" : "上一页"}</button>
            <button type="button" data-jump="${nextTarget}">${nextLabel}</button>
          </div>
        </article>
      </section>`;
          })
          .join("\n\n")
      : `<section class="spread progress-spread" data-spread="1" data-progress-page="1">
        <article class="page left progress-page">
          <div class="page-kicker"><span>完成</span><span>第 1 / 1 页</span></div>
          <p class="progress-page-number">01</p>
          <h2>这一页完成了什么</h2>
          <h3>还没有可翻看的完成页</h3>
          <p class="progress-story">等下一次记录目标、产物或验证结果后，这里会自动长出新的进度页。</p>
        </article>
        <article class="page right progress-proof-page">
          <div class="page-kicker"><span>等待记录</span><span>待证明</span></div>
          <h2>从哪里开始</h2>
          <p class="soft-note">先把这轮协作真正完成的一步写进 DoneGraph，手账就会从这里继续翻下去。</p>
          <div class="progress-pager">
            <button class="secondary" type="button" data-jump="0">回到进度</button>
            <button type="button" data-jump="${evidenceSpread}">看证据</button>
          </div>
        </article>
      </section>`;
  const achievements = progressItems
    .map((item) => `<li><span>${escapeHtml(statusText(item.status))}</span>${escapeHtml(item.title)}</li>`)
    .join("\n");
  const evidenceCards = graph.nodes
    .filter((node) => node.type === "evidence")
    .map((node, index) => {
      const copy = storyCopyForNode(node);
      return `<article class="proof-card ${escapeHtml(statusLabel(node.status))}" style="--delay: ${index * 80}ms"><span>${escapeHtml(statusText(node.status))}</span><strong>${escapeHtml(copy.title)}</strong><p>${escapeHtml(copy.detail)}</p></article>`;
    })
    .join("\n");
  const nextSteps = graph.next_steps.map((step) => `<li>${escapeHtml(dashboardNextStep(step))}</li>`).join("\n");
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
      perspective: 2200px;
      transform-style: preserve-3d;
      isolation: isolate;
      overflow: visible;
    }
    .journal-stage::before,
    .journal-stage::after {
      content: "";
      position: absolute;
      pointer-events: none;
    }
    .journal-stage::before {
      inset: -18px -14px 18px;
      z-index: 0;
      border-radius: 42px;
      background:
        linear-gradient(90deg, rgba(142, 88, 48, .22), rgba(255, 243, 213, .42) 8%, rgba(255, 243, 213, .32) 92%, rgba(142, 88, 48, .20)),
        linear-gradient(180deg, rgba(255, 252, 239, .72), rgba(219, 185, 118, .34));
      box-shadow:
        0 30px 0 rgba(196, 143, 73, .22),
        0 48px 78px rgba(85, 59, 34, .22);
    }
    .journal-stage::after {
      left: 5%;
      right: 5%;
      bottom: -28px;
      z-index: 1;
      height: 42px;
      border-radius: 50%;
      background: radial-gradient(ellipse at center, rgba(70, 48, 25, .22), transparent 72%);
      filter: blur(8px);
    }
    .book-spine {
      position: absolute;
      top: -4px;
      bottom: 18px;
      left: 50%;
      z-index: 6;
      width: 34px;
      pointer-events: none;
      transform: translateX(-50%) translateZ(28px);
      border-radius: 999px;
      background:
        linear-gradient(90deg, transparent, rgba(89, 61, 34, .24) 22%, rgba(255, 251, 233, .65) 48%, rgba(89, 61, 34, .20) 76%, transparent),
        repeating-linear-gradient(180deg, rgba(121, 79, 39, .16) 0 1px, transparent 1px 14px);
      box-shadow:
        inset 8px 0 14px rgba(98, 67, 35, .14),
        inset -8px 0 12px rgba(255, 255, 255, .38),
        0 0 28px rgba(84, 58, 31, .16);
    }
    .turn-page {
      position: absolute;
      top: 10px;
      bottom: 34px;
      left: calc(50% + 8px);
      z-index: 12;
      width: calc(50% - 18px);
      pointer-events: none;
      opacity: 0;
      transform: rotateY(0deg) translateZ(34px);
      transform-origin: left center;
      transform-style: preserve-3d;
      backface-visibility: visible;
      border: 1px solid rgba(121, 79, 39, .16);
      border-radius: 10px 34px 34px 10px;
      background:
        linear-gradient(90deg, rgba(113, 78, 41, .18), transparent 12%, rgba(255, 255, 255, .28) 52%, rgba(211, 170, 102, .16)),
        linear-gradient(180deg, rgba(255, 253, 242, .98), rgba(255, 242, 205, .98));
      box-shadow:
        -14px 0 26px rgba(81, 56, 30, .20),
        22px 20px 44px rgba(84, 58, 31, .16);
    }
    .turn-page::before {
      content: "";
      position: absolute;
      inset: 14px;
      border: 1px dashed rgba(121, 79, 39, .10);
      border-radius: 8px 24px 24px 8px;
      background:
        repeating-linear-gradient(180deg, transparent 0 35px, rgba(121, 79, 39, .045) 35px 36px);
    }
    .journal-stage.turning-forward .turn-page {
      animation: page-turn-forward .86s cubic-bezier(.18, .76, .2, 1);
    }
    .journal-stage.turning-backward .turn-page {
      left: 10px;
      transform-origin: right center;
      border-radius: 34px 10px 10px 34px;
      animation: page-turn-backward .86s cubic-bezier(.18, .76, .2, 1);
    }
    .journal-stage.turning .turn-page {
      opacity: 1;
    }
    .spread {
      grid-area: 1 / 1;
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 12px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(4px) scale(.998);
      filter: saturate(.96);
      overflow: visible;
      transition: opacity .24s ease, transform .34s cubic-bezier(.2, .8, .2, 1), filter .24s ease;
    }
    .spread.active {
      z-index: 3;
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
      filter: none;
    }
    .page {
      position: relative;
      z-index: 1;
      min-width: 0;
      min-height: 740px;
      padding: clamp(24px, 3.2vw, 44px);
      border: 1px solid rgba(78, 92, 64, .2);
      background:
        linear-gradient(90deg, rgba(160, 118, 69, .10), transparent 26px),
        linear-gradient(180deg, rgba(255, 248, 228, .98), rgba(255, 243, 204, .96));
      border-radius: 34px;
      box-shadow:
        0 2px 0 rgba(255, 252, 237, .84),
        0 18px 0 rgba(228, 190, 122, .28),
        0 30px 58px var(--shadow);
      overflow: hidden;
    }
    .page.left {
      border-radius: 34px 15px 15px 34px;
      transform: rotateY(.8deg);
      transform-origin: right center;
    }
    .page.right {
      border-radius: 15px 34px 34px 15px;
      transform: rotateY(-.8deg);
      transform-origin: left center;
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
      background:
        linear-gradient(90deg, transparent, rgba(98, 74, 42, .16)),
        repeating-linear-gradient(180deg, transparent 0 16px, rgba(121, 79, 39, .035) 16px 17px);
    }
    .page.right::before {
      left: -1px;
      background:
        linear-gradient(270deg, transparent, rgba(98, 74, 42, .14)),
        repeating-linear-gradient(180deg, transparent 0 16px, rgba(121, 79, 39, .035) 16px 17px);
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
    .home-progress-row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: 14px;
      padding: 14px;
      border: 1px solid rgba(121, 79, 39, .13);
      border-radius: 24px;
      background: rgba(255, 249, 233, .72);
      box-shadow: 0 7px 0 rgba(213, 169, 110, .18);
    }
    .home-progress-row .progress-caption {
      max-width: none;
      margin: 0;
      text-align: left;
    }
    .home-map .progress-orb {
      z-index: 2;
      width: clamp(92px, 12vw, 136px);
      margin: 0;
      background:
        radial-gradient(circle at center, var(--paper) 0 50%, transparent 51%),
        conic-gradient(var(--teal) 0 ${graph.summary.progress_percent * 3.6}deg, rgba(255, 255, 255, .42) 0deg);
      box-shadow: inset 0 0 0 8px rgba(255, 249, 233, .72), 0 8px 0 rgba(213, 169, 110, .24), 0 16px 24px rgba(91, 63, 32, .12);
    }
    .home-map .progress-orb strong {
      font-size: clamp(30px, 4vw, 48px);
      letter-spacing: -2px;
    }
    .home-map .progress-orb span {
      bottom: 21%;
      font-size: 9px;
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
    .progress-page,
    .progress-proof-page {
      display: flex;
      flex-direction: column;
    }
    .progress-page-number {
      width: max-content;
      margin: 8px 0 28px;
      padding: 10px 16px;
      border: 1px solid rgba(121, 79, 39, .16);
      border-radius: 20px;
      background: rgba(255, 248, 228, .78);
      color: var(--clay);
      font: 900 clamp(42px, 5vw, 70px)/.9 "SFMono-Regular", Menlo, monospace;
      box-shadow: 0 8px 0 rgba(213, 169, 110, .18);
    }
    .progress-page h3 {
      max-width: 13ch;
      margin: 14px 0 16px;
      color: var(--moss);
      font-size: clamp(32px, 4.2vw, 58px);
      line-height: .98;
      letter-spacing: 0;
    }
    .progress-story {
      max-width: 34ch;
      margin: 0;
      color: #634d31;
      font-size: clamp(18px, 2vw, 25px);
      line-height: 1.42;
    }
    .progress-proof-page .soft-note {
      margin-top: 12px;
      font-size: clamp(16px, 1.6vw, 20px);
    }
    .progress-proof-page .stamp {
      width: max-content;
      max-width: 100%;
      margin-top: 18px;
      padding: 10px 14px;
      border-radius: 999px;
      font-size: 13px;
      letter-spacing: .08em;
    }
    .progress-pager {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 24px;
    }
    .progress-pager button {
      min-height: 46px;
      padding: 10px 15px;
      border: 1px solid rgba(121, 79, 39, .18);
      border-radius: 18px;
      background: var(--teal);
      color: #fffdf3;
      font: inherit;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 6px 0 #0f8f86, 0 12px 22px rgba(29, 190, 176, .18);
    }
    .progress-pager button.secondary {
      background: #fff7dc;
      color: var(--ink);
      box-shadow: 0 6px 0 var(--button-shadow), 0 12px 22px rgba(91, 63, 32, .10);
    }
    .proof-grid,
    .node-grid {
      display: grid;
      gap: 12px;
    }
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
    .proof-card strong {
      font-size: 18px;
      line-height: 1.15;
    }
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
    @keyframes page-turn-forward {
      0% {
        opacity: 1;
        transform: rotateY(0deg) translateZ(34px);
        filter: brightness(1.02);
      }
      8% {
        opacity: 1;
      }
      42% {
        opacity: 1;
        transform: rotateY(-86deg) translateZ(48px) translateX(-4px);
        filter: brightness(.96);
        box-shadow: -32px 0 42px rgba(81, 56, 30, .28), 22px 20px 44px rgba(84, 58, 31, .14);
      }
      68% {
        opacity: .92;
        transform: rotateY(-146deg) translateZ(30px) translateX(-8px);
        filter: brightness(.9);
      }
      100% {
        opacity: 0;
        transform: rotateY(-178deg) translateZ(18px) translateX(-10px);
        filter: brightness(.92);
      }
    }
    @keyframes page-turn-backward {
      0% {
        opacity: 1;
        transform: rotateY(0deg) translateZ(34px);
        filter: brightness(1.02);
      }
      8% {
        opacity: 1;
      }
      42% {
        opacity: 1;
        transform: rotateY(86deg) translateZ(48px) translateX(4px);
        filter: brightness(.96);
        box-shadow: 32px 0 42px rgba(81, 56, 30, .28), -22px 20px 44px rgba(84, 58, 31, .14);
      }
      68% {
        opacity: .92;
        transform: rotateY(146deg) translateZ(30px) translateX(8px);
        filter: brightness(.9);
      }
      100% {
        opacity: 0;
        transform: rotateY(178deg) translateZ(18px) translateX(10px);
        filter: brightness(.92);
      }
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
      .spread, .proof-card, .journal-card, .turn-page, .island-ground, .island-scene::before, .island-scene::after { animation: none; transition: none; }
    }
    @media (max-width: 640px) {
      .journal-stage { min-height: auto; }
      .journal-stage::before,
      .journal-stage::after,
      .book-spine,
      .turn-page {
        display: none;
      }
      .spread, .spread.active {
        position: static;
        display: none;
        grid-template-columns: 1fr;
        transform: none;
      }
      .spread.active { display: grid; }
      .page {
        min-height: auto;
        transform: none;
        border-radius: 24px;
      }
      .page.left::after, .page.right::before { display: none; }
    }
    @media (min-width: 641px) and (max-width: 759px) {
      .journal-shell {
        width: min(100vw - 18px, 1380px);
        padding-block: 14px;
      }
      .journal-top {
        gap: 8px;
        font-size: 10px;
      }
      .journal-top span {
        min-height: 30px;
        padding: 7px 9px;
      }
      .journal-stage {
        min-height: 636px;
      }
      .journal-stage::before {
        inset: -12px -8px 12px;
        border-radius: 32px;
      }
      .spread {
        gap: 8px;
      }
      .page {
        min-height: 616px;
        padding: 18px;
      }
      .book-spine {
        width: 24px;
        bottom: 12px;
      }
      .turn-page {
        top: 8px;
        bottom: 24px;
        left: calc(50% + 5px);
        width: calc(50% - 11px);
      }
      .home-title {
        font-size: clamp(38px, 5.6vw, 44px);
        line-height: .94;
      }
      .story {
        font-size: 14px;
        line-height: 1.45;
      }
      .home-actions button {
        min-height: 42px;
        padding: 9px 12px;
      }
      .island-scene {
        min-height: 274px;
      }
      .island-ground {
        width: min(82%, 290px);
      }
      .path-dot {
        width: 34px;
        height: 34px;
        border-radius: 12px;
        font-size: 10px;
      }
      .tiny-house {
        width: 54px;
        height: 43px;
      }
      .tiny-house::before {
        width: 66px;
        height: 33px;
        top: -18px;
      }
      .tiny-house::after {
        left: 21px;
        width: 15px;
        height: 21px;
      }
      .tiny-tree {
        width: 34px;
        height: 56px;
      }
      .home-progress-row {
        gap: 10px;
        padding: 10px;
      }
      .home-map .progress-orb {
        width: 78px;
      }
      .home-stat-strip {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 6px;
      }
      .home-stat {
        min-height: 68px;
        padding: 10px;
      }
      .home-stat strong {
        font-size: 23px;
      }
      .progress-caption {
        margin-bottom: 12px;
        font-size: 13px;
      }
    }
    @media (max-width: 820px) {
      .metric-grid, .home-stat-strip { grid-template-columns: 1fr; }
      h1 { font-size: 48px; }
      .progress-orb { width: min(100%, 280px); }
      .island-scene { min-height: 360px; }
      .home-map .progress-orb { width: 88px; }
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
        width: 104px;
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
      <div class="book-spine" aria-hidden="true"></div>
      <div class="turn-page" aria-hidden="true"></div>
      <section class="spread active home-spread" data-spread="0">
        <article class="page left home-copy">
          <div>
          <div class="page-kicker"><span>进度手账</span><span>洁净室重写</span></div>
          <h1 class="home-title"><span>DoneGraph</span><span>进度岛</span><span>手账</span></h1>
          <p class="story">${escapeHtml(dashboardNarrativeFor(graph))}</p>
          <div class="home-actions">
            <button type="button" data-jump="1">翻到完成页</button>
            <button class="secondary" type="button" data-jump="${evidenceSpread}">看看证据</button>
          </div>
          </div>
          <div class="soft-note">${escapeHtml(blockerText)}</div>
        </article>
        <article class="page right home-map">
          <div class="page-kicker"><span>今日进度</span><span>${milestoneProgress} 个里程碑</span></div>
          <div class="island-scene" aria-hidden="true">
            <div class="island-ground">
              <div class="path-ribbon"></div>
              <div class="tiny-house"></div>
              <div class="tiny-tree"></div>
              <div class="path-dot dot-one">01</div>
              <div class="path-dot dot-two">02</div>
              <div class="path-dot dot-three">03</div>
              <div class="path-dot dot-four">${String(Math.max(1, Math.min(99, graph.summary.milestones_completed))).padStart(2, "0")}</div>
            </div>
          </div>
          <div class="home-progress-row">
            <div class="progress-orb" aria-label="完成进度 ${graph.summary.progress_percent}%"><strong>${graph.summary.progress_percent}%</strong><span>已完成</span></div>
            <p class="progress-caption">首页先给一个安定的答案：已经走完 ${milestoneProgress} 个里程碑，当前阶段是「${escapeHtml(graph.summary.current_stage)}」。</p>
          </div>
          <div class="home-stat-strip">
            <div class="home-stat"><span>里程碑</span><strong>${milestoneProgress}</strong></div>
            <div class="home-stat"><span>已验证</span><strong>${graph.summary.evidence_passed}</strong></div>
            <div class="home-stat"><span>阻塞</span><strong>${graph.summary.blockers}</strong></div>
          </div>
        </article>
      </section>

      ${progressSpreads}

      <section class="spread" data-spread="${evidenceSpread}">
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

      <section class="spread" data-spread="${detailSpread}">
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
      <button type="button" data-target="${evidenceSpread}">证据</button>
      <button type="button" data-target="${detailSpread}">细节</button>
    </nav>
  </main>
  <script>
    const spreads = Array.from(document.querySelectorAll(".spread"));
    const buttons = Array.from(document.querySelectorAll(".page-controls button"));
    const jumpButtons = Array.from(document.querySelectorAll("[data-jump]"));
    const journalStage = document.querySelector(".journal-stage");
    let turnTimers = [];
    function clearTurnTimers() {
      turnTimers.forEach((timer) => window.clearTimeout(timer));
      turnTimers = [];
    }
    function setActiveSpread(target) {
      spreads.forEach((spread) => {
        spread.classList.toggle("active", spread.dataset.spread === target);
      });
      buttons.forEach((button) => {
        button.classList.toggle("active", button.dataset.target === target);
      });
    }
    function showSpread(target) {
      const current = document.querySelector(".spread.active")?.dataset.spread;
      if (current === target) return;
      clearTurnTimers();
      const direction = Number(target) > Number(current || 0) ? "forward" : "backward";
      journalStage?.classList.remove("turning", "turning-forward", "turning-backward");
      void journalStage?.offsetWidth;
      journalStage?.classList.add("turning", \`turning-\${direction}\`);
      journalStage?.scrollIntoView({ block: "start", behavior: "smooth" });
      const switchTimer = window.setTimeout(() => setActiveSpread(target), 220);
      turnTimers.push(switchTimer);
      turnTimers.push(window.setTimeout(() => {
        journalStage?.classList.remove("turning", "turning-forward", "turning-backward");
      }, 860));
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
