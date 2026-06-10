export type EvidenceStatus = "pass" | "fail" | "unknown" | "blocked";

export type VerificationDepth = "command_verified" | "manual_verified" | "self_reported" | "contradicted";

export type EvidenceConfidence = "high" | "medium" | "low";

export type PrivacyTier = "local_only" | "redacted_share" | "full_disclosure";

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
  verification_depth?: VerificationDepth;
  confidence?: EvidenceConfidence;
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

export type AccountabilityVerdict = "ACCOUNTABLE" | "PARTIAL" | "UNACCOUNTED";

export interface AccountabilityDimension {
  id: string;
  label: string;
  score: number;
  weight: number;
  detail: string;
  hard_gate_failed: boolean;
}

export interface AccountabilityScore {
  composite: number;
  verdict: AccountabilityVerdict;
  dimensions: AccountabilityDimension[];
  hard_gates_passed: boolean;
  hard_gate_failures: string[];
}

export type DashboardLang = "zh" | "en";

export interface DashboardLocale {
  lang: DashboardLang;
  htmlLang: string;
  pageTitle: string;
  schemaPurpose: string;

  // Header
  headerProgressMap: string;
  headerGeneratedAt: string;

  // Home page
  kickerJournal: string;
  kickerCleanRoom: string;
  homeTitleLine1: string;
  homeTitleLine2: string;
  homeTitleLine3: string;
  flipToCompleted: string;
  seeEvidence: string;
  todayProgress: string;
  milestonesLabel: string;
  progressDone: string;
  statMilestones: string;
  statVerified: string;
  statBlockers: string;

  // Home progress caption
  homeProgressCaption: (milestoneProgress: string, currentStage: string) => string;

  // Blocker text
  blockerNone: string;
  blockerSome: (count: number) => string;

  // Completed pages
  kickerCompleted: string;
  completedPageOf: (page: number, total: number) => string;
  whatThisPageCompleted: string;
  noCompletedPages: string;
  noCompletedPagesStory: string;
  kickerAwaitingRecord: string;
  awaitingProof: string;
  whereToStart: string;
  whereToStartNote: string;
  backToProgress: string;
  previousPage: string;
  nextCompleted: string;
  seeEvidenceShort: string;

  // Evidence & handoff pages
  kickerEvidence: string;
  kickerVerificationState: string;
  evidenceCards: string;
  noEvidenceRecorded: string;
  kickerNextPage: string;
  kickerHandoff: string;
  continueFromHere: string;
  handoffFooterNote: string;

  // Detail pages
  kickerCleanRoomStructure: string;
  kickerDetail: string;
  cleanRoomStructure: string;
  sourceRecords: string;
  noSourceRecords: string;
  captureRecordsCount: (count: number) => string;
  kickerRelationshipTrace: string;
  kickerOptional: string;
  relationshipTrace: string;
  noRelationshipEdges: string;
  achievementLedger: string;
  noAchievements: string;

  // Page controls
  navProgress: string;
  navCompleted: string;
  navEvidence: string;
  navDetail: string;
  navAriaLabel: string;

  // Status text
  statusPass: string;
  statusFail: string;
  statusBlocked: string;
  statusUnknown: string;

  // Node type labels
  nodeGoal: string;
  nodeTask: string;
  nodeDecision: string;
  nodeArtifact: string;
  nodeEvidence: string;
  nodeBlocker: string;
  nodeAchievement: string;
  nodeNextStep: string;

  // Event titles (titleForEvent)
  eventGoal: string;
  eventDecision: string;
  eventArtifact: string;
  eventVerificationPrefix: string;
  eventVerificationFallback: string;
  eventBlocker: string;
  eventCompletion: string;
  eventActionPrefix: string;
  eventActionFallback: string;

  // Stage names (currentStageFor)
  stageDemoReady: string;
  stageGoalUndefined: string;
  stageAwaitingImplementation: string;
  stageAwaitingArtifact: string;
  stageAwaitingEvidence: string;
  stageDemoAlmostReady: string;
  stageHandoffPending: string;

  // Milestones
  milestoneGoalDefined: string;
  milestoneGoalDetail: string;
  milestoneImplStarted: string;
  milestoneImplDetail: string;
  milestoneArtifactCreated: string;
  milestoneArtifactDetail: string;
  milestoneEvidenceCollected: string;
  milestoneEvidenceDetail: string;
  milestoneDemoReady: string;
  milestoneDemoReadyDetail: string;
  milestoneDemoNotYet: string;
  milestoneHandoffReady: string;
  milestoneHandoffReadyDetail: string;
  milestoneHandoffNotYet: string;

  // Next step titles (used in node title)
  nextStepLabel: string;

  // nextStepsForNodes text
  nextStepFixFailed: (detail: string) => string;
  nextStepUnblock: (detail: string) => string;
  nextStepAddEvidence: (detail: string) => string;
  nextStepAddVerification: string;
  nextStepConsolidate: string;

  // Narrative
  narrativeNoGoal: string;
  narrativeTemplate: (completed: number, total: number, stage: string, evidencePassed: number, nextStep: string) => string;

  // Dashboard narrative (wraps the above with cleaned next step)
  dashboardNarrativeContinue: string;

  // Story copy for nodes (storyCopyForNode)
  storyGoalTitle: string;
  storyGoalDetailPrefix: string;
  storyGoalFallback: string;
  storyGoalKind: string;

  storyDecisionTitle: string;
  storyDecisionFallback: string;
  storyDecisionKind: string;

  storyArtifactDashboardTitle: string;
  storyArtifactDashboardDetail: string;
  storyArtifactTitle: string;
  storyArtifactFallback: string;
  storyArtifactKind: string;

  storyEvidenceTypecheckTitle: string;
  storyEvidenceTypecheckDetail: string;
  storyEvidenceBuildTitle: string;
  storyEvidenceBuildDetail: string;
  storyEvidenceTestAutoTitle: string;
  storyEvidenceTestAutoDetail: string;
  storyEvidenceTestManualTitle: string;
  storyEvidenceTestManualDetail: string;
  storyEvidencePassTitle: string;
  storyEvidenceUnconfirmedTitle: string;
  storyEvidenceFallback: string;
  storyEvidenceKind: string;

  storyBlockerTitle: string;
  storyBlockerFallback: string;
  storyBlockerKind: string;

  storyNextStepTitle: string;
  storyNextStepFallback: string;
  storyNextStepKind: string;

  storyBuildTitle: string;
  storyBuildFallback: string;
  storyBuildKind: string;

  storyTestTitle: string;
  storyTestFallback: string;

  storyTaskScanTitle: string;
  storyTaskScanFallback: string;
  storyTaskJournalTitle: string;
  storyTaskJournalFallback: string;
  storyTaskDemoTitle: string;
  storyTaskDemoFallback: string;

  storyPhaseCompleteTitle: string;
  storyDefaultTitle: string;
  storyDefaultFallback: string;
  storyPushKind: string;

  // storyCopyForAchievement fallback
  achievementTypecheckTitle: string;
  achievementTypecheckDetail: string;
  achievementBuildTitle: string;
  achievementBuildDetail: string;
  achievementTestTitle: string;
  achievementTestDetail: string;
  achievementFallbackTitle: string;
  achievementFallbackDetail: string;
  achievementProgressKind: string;

  // dashboardNextStep fallback
  dashboardNextStepFallback: string;

  // progressProofTitle
  proofGoalTitle: string;
  proofDecisionTitle: string;
  proofArtifactJournalTitle: string;
  proofArtifactTitle: string;
  proofEvidenceAutoTitle: string;
  proofEvidenceManualTitle: string;
  proofEvidenceStructureTitle: string;
  proofEvidenceBuildTitle: string;
  proofEvidenceTitle: string;
  proofBlockerTitle: string;
  proofNextStepTitle: string;
  proofScanTitle: string;
  proofJournalTitle: string;
  proofDemoTitle: string;
  proofCoreTitle: string;
  proofFallbackTitle: (page: number) => string;

  // progressProofDetail
  proofGoalDetail: string;
  proofDecisionDetail: string;
  proofArtifactJournalDetail: string;
  proofArtifactDetail: string;
  proofEvidenceAutoDetail: string;
  proofEvidenceManualDetail: string;
  proofEvidenceStructureDetail: string;
  proofEvidenceBuildDetail: string;
  proofEvidenceDetail: string;
  proofBlockerDetail: string;
  proofNextStepDetail: string;
  proofScanDetail: string;
  proofJournalDetail: string;
  proofDemoDetail: string;
  proofCoreDetail: string;
  proofFallbackDetail: (page: number) => string;

  // cleanDashboardText replacements
  cleanVerifyPassed: string;
  cleanVerifyEntryFound: string;
  cleanChangeSummary: string;
  cleanProjectCheck: string;
  cleanJournal: string;
  cleanProjectContent: string;
  cleanToolName: string;
  cleanToolLabel: string;
  cleanCoreLabel: string;
}

const zhLocale: DashboardLocale = {
  lang: "zh",
  htmlLang: "zh-CN",
  pageTitle: "DoneGraph 进度手账",
  schemaPurpose: "洁净室重写的 AI 协作进度图，用来记录目标、动作、产物、证据、决策、阻塞、成就和下一步。",

  headerProgressMap: "完成进度地图",
  headerGeneratedAt: "生成于",

  kickerJournal: "进度手账",
  kickerCleanRoom: "洁净室重写",
  homeTitleLine1: "DoneGraph",
  homeTitleLine2: "进度岛",
  homeTitleLine3: "手账",
  flipToCompleted: "翻到完成页",
  seeEvidence: "看看证据",
  todayProgress: "今日进度",
  milestonesLabel: "个里程碑",
  progressDone: "已完成",
  statMilestones: "里程碑",
  statVerified: "已验证",
  statBlockers: "阻塞",

  homeProgressCaption: (mp, stage) =>
    `首页先给一个安定的答案：已经走完 ${mp} 个里程碑，当前阶段是「${stage}」。`,
  blockerNone: "这一轮暂时没有阻塞，可以安心往前翻。",
  blockerSome: (count) => `还有 ${count} 个阻塞需要先处理。`,

  kickerCompleted: "完成",
  completedPageOf: (page, total) => `第 ${page} / ${total} 页`,
  whatThisPageCompleted: "这一页完成了什么",
  noCompletedPages: "还没有可翻看的完成页",
  noCompletedPagesStory: "等下一次记录目标、产物或验证结果后，这里会自动长出新的进度页。",
  kickerAwaitingRecord: "等待记录",
  awaitingProof: "待证明",
  whereToStart: "从哪里开始",
  whereToStartNote: "先把这轮协作真正完成的一步写进 DoneGraph，手账就会从这里继续翻下去。",
  backToProgress: "回到进度",
  previousPage: "上一页",
  nextCompleted: "下一条完成",
  seeEvidenceShort: "看证据",

  kickerEvidence: "证据",
  kickerVerificationState: "验证状态",
  evidenceCards: "证据贴纸",
  noEvidenceRecorded: "还没有记录验证证据。",
  kickerNextPage: "下一页",
  kickerHandoff: "交接",
  continueFromHere: "从这里继续",
  handoffFooterNote: "下一轮 AI 继续之前，先读这一页就能知道该从哪里接上。",

  kickerCleanRoomStructure: "洁净室结构",
  kickerDetail: "细节",
  cleanRoomStructure: "洁净室结构",
  sourceRecords: "来源记录",
  noSourceRecords: "当前记录来自手动事件。",
  captureRecordsCount: (count) => `${count} 条捕获记录`,
  kickerRelationshipTrace: "关系线索",
  kickerOptional: "可选",
  relationshipTrace: "关系线索",
  noRelationshipEdges: "还没有关系连线。",
  achievementLedger: "成就账本",
  noAchievements: "还没有成就记录。",

  navProgress: "进度",
  navCompleted: "完成",
  navEvidence: "证据",
  navDetail: "细节",
  navAriaLabel: "手账页",

  statusPass: "已证明",
  statusFail: "待修复",
  statusBlocked: "被阻塞",
  statusUnknown: "待证明",

  nodeGoal: "目标",
  nodeTask: "任务",
  nodeDecision: "决策",
  nodeArtifact: "产物",
  nodeEvidence: "证据",
  nodeBlocker: "阻塞",
  nodeAchievement: "成就",
  nodeNextStep: "下一步",

  eventGoal: "任务目标",
  eventDecision: "关键决策",
  eventArtifact: "产物确认",
  eventVerificationPrefix: "验证：",
  eventVerificationFallback: "验证证据",
  eventBlocker: "阻塞项",
  eventCompletion: "阶段完成",
  eventActionPrefix: "执行：",
  eventActionFallback: "推进动作",

  stageDemoReady: "可以交付演示",
  stageGoalUndefined: "目标还没定",
  stageAwaitingImplementation: "等待开始实现",
  stageAwaitingArtifact: "等待产物出现",
  stageAwaitingEvidence: "等待证据验证",
  stageDemoAlmostReady: "演示还差收尾",
  stageHandoffPending: "交接还要整理",

  milestoneGoalDefined: "目标已确定",
  milestoneGoalDetail: "还没有记录这轮协作的目标。",
  milestoneImplStarted: "实现已启动",
  milestoneImplDetail: "还没有记录实现动作或关键决策。",
  milestoneArtifactCreated: "产物已出现",
  milestoneArtifactDetail: "还没有记录 README、代码、插件或演示产物。",
  milestoneEvidenceCollected: "证据已收集",
  milestoneEvidenceDetail: "还没有记录可判断的验证证据。",
  milestoneDemoReady: "演示已可用",
  milestoneDemoReadyDetail: "已有完成记录和通过证据。",
  milestoneDemoNotYet: "还需要一条阶段完成记录，把进度变成可演示成果。",
  milestoneHandoffReady: "交接已清楚",
  milestoneHandoffReadyDetail: "下一轮可以直接接着已完成成果继续。",
  milestoneHandoffNotYet: "还需要把下一步、风险或验证缺口写清楚。",

  nextStepLabel: "下一步",

  nextStepFixFailed: (detail) => `先修复失败验证：${detail}`,
  nextStepUnblock: (detail) => `先解除阻塞：${detail}`,
  nextStepAddEvidence: (detail) => `补充可判断证据：${detail}`,
  nextStepAddVerification: "为本轮产物补充至少一条 verification 记录，说明用什么命令证明它可用。",
  nextStepConsolidate: "把已通过的证据固化到 README、测试或下一轮任务清单，然后开启下一阶段目标。",

  narrativeNoGoal: "DoneGraph 还没有任务目标。",
  narrativeTemplate: (completed, total, stage, evidencePassed, nextStep) =>
    `这轮协作已经走完 ${completed} / ${total} 个里程碑，当前阶段是「${stage}」，并沉淀 ${evidencePassed} 条通过证据。下一步是：${nextStep}`,

  dashboardNarrativeContinue: "继续记录下一段协作。",

  storyGoalTitle: "把目标说清楚",
  storyGoalDetailPrefix: "这轮协作先确定了方向：",
  storyGoalFallback: "要完成的事情已经被写下来。",
  storyGoalKind: "目标",

  storyDecisionTitle: "做出一个关键选择",
  storyDecisionFallback: "这一步把后面的路线定得更清楚。",
  storyDecisionKind: "决策",

  storyArtifactDashboardTitle: "做出可以翻看的进度手账",
  storyArtifactDashboardDetail: "进展被整理成一页页可以打开的手账，不再只是一段聊天记录。",
  storyArtifactTitle: "留下了可交付成果",
  storyArtifactFallback: "这一步把协作里的想法变成了可以继续使用的东西。",
  storyArtifactKind: "产物",

  storyEvidenceTypecheckTitle: "确认结构没有松动",
  storyEvidenceTypecheckDetail: "类型和接口检查已经过了一遍，后面可以更安心地继续接。",
  storyEvidenceBuildTitle: "把成果打包到可运行状态",
  storyEvidenceBuildDetail: "项目可以完整生成成果，说明这轮工作已经不只是想法。",
  storyEvidenceTestAutoTitle: "自动检查跑过核心流程",
  storyEvidenceTestAutoDetail: "自动验证已经帮你扫过核心流程，这一步说明基础行为没有明显断掉。",
  storyEvidenceTestManualTitle: "关键流程检查已经通过",
  storyEvidenceTestManualDetail: "这条手动证明把关键流程确认了一遍，可以放心算进已完成进度。",
  storyEvidencePassTitle: "留下一条可靠证据",
  storyEvidenceUnconfirmedTitle: "留下一条待确认线索",
  storyEvidenceFallback: "这一步用来说明当前进展是否站得住。",
  storyEvidenceKind: "验证",

  storyBlockerTitle: "发现需要先处理的阻塞",
  storyBlockerFallback: "这里需要先停一下，把卡住的地方处理掉。",
  storyBlockerKind: "阻塞",

  storyNextStepTitle: "下一步已经写清楚",
  storyNextStepFallback: "下一轮可以从这里接着走。",
  storyNextStepKind: "下一步",

  storyBuildTitle: "把核心工具推进到可运行",
  storyBuildFallback: "DoneGraph 的主要流程已经成形，可以继续围绕体验打磨。",
  storyBuildKind: "推进",

  storyTestTitle: "让核心流程先跑稳",
  storyTestFallback: "这一步让项目从想法继续往可验证的成果靠近。",

  storyTaskScanTitle: "整理协作起点",
  storyTaskScanFallback: "这一步把散在上下文整理成可以继续推进的起点。",
  storyTaskJournalTitle: "做出可翻看的手账首页",
  storyTaskJournalFallback: "这一步把进度变成可以打开和翻看的手账首页。",
  storyTaskDemoTitle: "完成演示接力",
  storyTaskDemoFallback: "这一步把完成进度、证据和下一步接力整理到一起。",

  storyPhaseCompleteTitle: "完成一个阶段",
  storyDefaultTitle: "推进了一步",
  storyDefaultFallback: "这一步让任务继续往前走。",
  storyPushKind: "推进",

  achievementTypecheckTitle: "确认结构没有松动",
  achievementTypecheckDetail: "类型和接口检查已经过了一遍，后面可以更安心地继续接。",
  achievementBuildTitle: "把成果打包到可运行状态",
  achievementBuildDetail: "项目可以完整生成成果，说明这轮工作已经不只是想法。",
  achievementTestTitle: "确认关键流程跑得稳",
  achievementTestDetail: "核心行为已经真实检查过，这一步可以算进已完成的进度。",
  achievementFallbackTitle: "完成一段进展",
  achievementFallbackDetail: "这一步让任务继续往前走。",
  achievementProgressKind: "进展",

  dashboardNextStepFallback: "把已完成的进展固定下来，再开启下一阶段目标。",

  proofGoalTitle: "方向已经落到纸上",
  proofDecisionTitle: "路线已经选定",
  proofArtifactJournalTitle: "可以打开的成果已经出现",
  proofArtifactTitle: "交付物已经落地",
  proofEvidenceAutoTitle: "自动验证已经扫过",
  proofEvidenceManualTitle: "手动证明已经补上",
  proofEvidenceStructureTitle: "类型结构已经稳住",
  proofEvidenceBuildTitle: "构建结果已经过关",
  proofEvidenceTitle: "验证让进度站得住",
  proofBlockerTitle: "风险已经被看见",
  proofNextStepTitle: "接力点已经清楚",
  proofScanTitle: "起点已经整理出来",
  proofJournalTitle: "手账已经翻得开",
  proofDemoTitle: "演示线索已经接上",
  proofCoreTitle: "核心流程已经推进",
  proofFallbackTitle: (page) => `第 ${page} 页也算数`,

  proofGoalDetail: "目标页证明这轮协作已经有了共同坐标，后面的动作、产物和验证才知道往哪里靠。",
  proofDecisionDetail: "决策页记录路线选择，下一次接手时不用重新猜为什么这么做。",
  proofArtifactJournalDetail: "这页说明成果已经变成能打开、能翻看、能交给别人理解的东西。",
  proofArtifactDetail: "这页说明协作不只停在讨论里，已经留下了可以继续使用的交付物。",
  proofEvidenceAutoDetail: "自动验证已经帮你扫过一遍基础流程，这页说明机器可重复检查的部分已经留下记录。",
  proofEvidenceManualDetail: "这条手动证明把最后确认补上，说明它不是自动扫描里的同一条进展。",
  proofEvidenceStructureDetail: "这页说明类型和接口已经对齐，后面继续接功能时不容易踩到结构问题。",
  proofEvidenceBuildDetail: "这页说明成果已经能完整生成，演示和交付可以继续往前走。",
  proofEvidenceDetail: "验证页说明这一步不是口头完成，而是已经有证据支撑，可以安心算进进度。",
  proofBlockerDetail: "阻塞页把卡点摆到明面上，避免下一轮继续在同一个地方打转。",
  proofNextStepDetail: "接力页把下一步放在这里，让后面的人能直接续上。",
  proofScanDetail: "这页把散在上下文收成一个起点，后面翻到这里时，能知道这轮协作从哪里开始。",
  proofJournalDetail: "这页说明进度已经从聊天里走出来，变成能打开、能翻看、能给别人看的首页。",
  proofDemoDetail: "这页把完成进度、证据和接力点收在一起，演示时能讲清楚已经走到哪里。",
  proofCoreDetail: "这页说明核心流程已经往可用状态推进，后面可以把注意力放到体验和收尾。",
  proofFallbackDetail: (page) => `第 ${page} 页记录的是一次具体推进。它不需要变成报告，只要能让人看见任务确实往前走了一格。`,

  cleanVerifyPassed: "真实检查已经通过",
  cleanVerifyEntryFound: "已经找到可以证明进展的检查入口。",
  cleanChangeSummary: "这些变化已经被整理成一条可以继续追的进展。",
  cleanProjectCheck: "一次项目检查",
  cleanJournal: "进度手账",
  cleanProjectContent: "相关项目内容",
  cleanToolName: "DoneGraph 工具",
  cleanToolLabel: "工具",
  cleanCoreLabel: "核心",
};

const enLocale: DashboardLocale = {
  lang: "en",
  htmlLang: "en",
  pageTitle: "DoneGraph Progress Journal",
  schemaPurpose: "A clean-room AI collaboration progress graph that records goals, actions, artifacts, evidence, decisions, blockers, achievements, and next steps.",

  headerProgressMap: "Progress Map",
  headerGeneratedAt: "Generated",

  kickerJournal: "Progress Journal",
  kickerCleanRoom: "Clean-Room",
  homeTitleLine1: "DoneGraph",
  homeTitleLine2: "Progress",
  homeTitleLine3: "Journal",
  flipToCompleted: "See Completed",
  seeEvidence: "See Evidence",
  todayProgress: "Today's Progress",
  milestonesLabel: "milestones",
  progressDone: "Done",
  statMilestones: "Milestones",
  statVerified: "Verified",
  statBlockers: "Blockers",

  homeProgressCaption: (mp, stage) =>
    `Here is the quick answer: ${mp} milestones reached so far. Current stage: "${stage}".`,
  blockerNone: "No blockers right now -- safe to keep going.",
  blockerSome: (count) => `${count} blocker${count === 1 ? "" : "s"} to resolve first.`,

  kickerCompleted: "Completed",
  completedPageOf: (page, total) => `Page ${page} / ${total}`,
  whatThisPageCompleted: "What got done here",
  noCompletedPages: "No completed pages yet",
  noCompletedPagesStory: "Once a goal, artifact, or verification is recorded, new progress pages will appear here automatically.",
  kickerAwaitingRecord: "Awaiting record",
  awaitingProof: "Pending",
  whereToStart: "Where to start",
  whereToStartNote: "Record one real completed step in DoneGraph, and the journal will pick up from here.",
  backToProgress: "Back to Progress",
  previousPage: "Previous",
  nextCompleted: "Next Completed",
  seeEvidenceShort: "Evidence",

  kickerEvidence: "Evidence",
  kickerVerificationState: "Verification State",
  evidenceCards: "Evidence Cards",
  noEvidenceRecorded: "No verification evidence recorded yet.",
  kickerNextPage: "Next Page",
  kickerHandoff: "Handoff",
  continueFromHere: "Continue From Here",
  handoffFooterNote: "Before the next AI picks up, reading this page is enough to know where to resume.",

  kickerCleanRoomStructure: "Clean-Room Structure",
  kickerDetail: "Detail",
  cleanRoomStructure: "Clean-Room Structure",
  sourceRecords: "Source Records",
  noSourceRecords: "Current records come from manual events.",
  captureRecordsCount: (count) => `${count} captured record${count === 1 ? "" : "s"}`,
  kickerRelationshipTrace: "Relationship Trace",
  kickerOptional: "Optional",
  relationshipTrace: "Relationship Trace",
  noRelationshipEdges: "No relationship edges yet.",
  achievementLedger: "Achievement Ledger",
  noAchievements: "No achievements recorded yet.",

  navProgress: "Progress",
  navCompleted: "Completed",
  navEvidence: "Evidence",
  navDetail: "Detail",
  navAriaLabel: "Journal pages",

  statusPass: "Verified",
  statusFail: "Needs Fix",
  statusBlocked: "Blocked",
  statusUnknown: "Pending",

  nodeGoal: "Goal",
  nodeTask: "Task",
  nodeDecision: "Decision",
  nodeArtifact: "Artifact",
  nodeEvidence: "Evidence",
  nodeBlocker: "Blocker",
  nodeAchievement: "Achievement",
  nodeNextStep: "Next Step",

  eventGoal: "Goal",
  eventDecision: "Key Decision",
  eventArtifact: "Artifact Confirmed",
  eventVerificationPrefix: "Verify: ",
  eventVerificationFallback: "Verification Evidence",
  eventBlocker: "Blocker",
  eventCompletion: "Phase complete",
  eventActionPrefix: "Action: ",
  eventActionFallback: "Progress Action",

  stageDemoReady: "Demo-ready",
  stageGoalUndefined: "Goal not set",
  stageAwaitingImplementation: "Awaiting implementation",
  stageAwaitingArtifact: "Awaiting artifact",
  stageAwaitingEvidence: "Awaiting evidence",
  stageDemoAlmostReady: "Demo almost ready",
  stageHandoffPending: "Handoff pending",

  milestoneGoalDefined: "Goal defined",
  milestoneGoalDetail: "No goal recorded for this round yet.",
  milestoneImplStarted: "Implementation started",
  milestoneImplDetail: "No implementation actions or key decisions recorded yet.",
  milestoneArtifactCreated: "Artifact created",
  milestoneArtifactDetail: "No README, code, plugin, or demo artifact recorded yet.",
  milestoneEvidenceCollected: "Evidence collected",
  milestoneEvidenceDetail: "No verifiable evidence recorded yet.",
  milestoneDemoReady: "Demo ready",
  milestoneDemoReadyDetail: "Completion record and passing evidence are in place.",
  milestoneDemoNotYet: "A phase-completion record is still needed to turn progress into a demonstrable result.",
  milestoneHandoffReady: "Handoff clear",
  milestoneHandoffReadyDetail: "The next round can pick up directly from completed work.",
  milestoneHandoffNotYet: "Next steps, risks, or verification gaps still need to be documented.",

  nextStepLabel: "Next Step",

  nextStepFixFailed: (detail) => `Fix the failing verification first: ${detail}`,
  nextStepUnblock: (detail) => `Resolve the blocker first: ${detail}`,
  nextStepAddEvidence: (detail) => `Add verifiable evidence: ${detail}`,
  nextStepAddVerification: "Add at least one verification record explaining which command proves the artifact works.",
  nextStepConsolidate: "Lock in the passing evidence to the README, tests, or next-round task list, then start the next goal.",

  narrativeNoGoal: "DoneGraph has no goal set yet.",
  narrativeTemplate: (completed, total, stage, evidencePassed, nextStep) =>
    `This round has reached ${completed} / ${total} milestones. Current stage: "${stage}", with ${evidencePassed} piece${evidencePassed === 1 ? "" : "s"} of passing evidence. Next step: ${nextStep}`,

  dashboardNarrativeContinue: "Continue recording the next round.",

  storyGoalTitle: "Goal made clear",
  storyGoalDetailPrefix: "This round started by locking in the direction: ",
  storyGoalFallback: "The objective has been written down.",
  storyGoalKind: "Goal",

  storyDecisionTitle: "Key choice made",
  storyDecisionFallback: "This step clarified the path forward.",
  storyDecisionKind: "Decision",

  storyArtifactDashboardTitle: "Built a browsable progress journal",
  storyArtifactDashboardDetail: "Progress has been organized into pages you can open and browse, not just a chat log.",
  storyArtifactTitle: "Deliverable produced",
  storyArtifactFallback: "This step turned ideas from the collaboration into something reusable.",
  storyArtifactKind: "Artifact",

  storyEvidenceTypecheckTitle: "Type structure verified intact",
  storyEvidenceTypecheckDetail: "Types and interfaces have been checked -- safe to keep building on top.",
  storyEvidenceBuildTitle: "Build confirmed runnable",
  storyEvidenceBuildDetail: "The project generates a full build, proving this round is beyond just ideas.",
  storyEvidenceTestAutoTitle: "Auto-check ran core flows",
  storyEvidenceTestAutoDetail: "Automated verification swept through core flows, confirming nothing is obviously broken.",
  storyEvidenceTestManualTitle: "Key flow check passed",
  storyEvidenceTestManualDetail: "This manual proof confirmed the key flow once over -- safe to count toward completed progress.",
  storyEvidencePassTitle: "Solid evidence recorded",
  storyEvidenceUnconfirmedTitle: "Unconfirmed lead recorded",
  storyEvidenceFallback: "This step helps judge whether current progress stands up.",
  storyEvidenceKind: "Verification",

  storyBlockerTitle: "Blocker surfaced",
  storyBlockerFallback: "Pause here and clear the obstacle before moving on.",
  storyBlockerKind: "Blocker",

  storyNextStepTitle: "Next step documented",
  storyNextStepFallback: "The next round can pick up from here.",
  storyNextStepKind: "Next Step",

  storyBuildTitle: "Core tool pushed to runnable state",
  storyBuildFallback: "The main flow is in shape -- ready for experience polish.",
  storyBuildKind: "Progress",

  storyTestTitle: "Core flow stabilized",
  storyTestFallback: "This step moved the project from idea toward verifiable result.",

  storyTaskScanTitle: "Collaboration starting point organized",
  storyTaskScanFallback: "Scattered context has been gathered into a starting point for further progress.",
  storyTaskJournalTitle: "Built a browsable journal front page",
  storyTaskJournalFallback: "Progress is now something you can open and flip through.",
  storyTaskDemoTitle: "Demo relay completed",
  storyTaskDemoFallback: "Completed progress, evidence, and next-step relay are organized together.",

  storyPhaseCompleteTitle: "Phase completed",
  storyDefaultTitle: "Moved forward one step",
  storyDefaultFallback: "This step keeps the task moving.",
  storyPushKind: "Progress",

  achievementTypecheckTitle: "Type structure verified intact",
  achievementTypecheckDetail: "Types and interfaces have been checked -- safe to keep building on top.",
  achievementBuildTitle: "Build confirmed runnable",
  achievementBuildDetail: "The project generates a full build, proving this round is beyond just ideas.",
  achievementTestTitle: "Key flow confirmed stable",
  achievementTestDetail: "Core behavior has been verified for real -- this step counts toward completed progress.",
  achievementFallbackTitle: "Progress recorded",
  achievementFallbackDetail: "This step keeps the task moving.",
  achievementProgressKind: "Progress",

  dashboardNextStepFallback: "Lock in completed progress, then start the next goal.",

  proofGoalTitle: "Direction is on paper",
  proofDecisionTitle: "Route has been chosen",
  proofArtifactJournalTitle: "A browsable result has appeared",
  proofArtifactTitle: "Deliverable has landed",
  proofEvidenceAutoTitle: "Auto-verification swept through",
  proofEvidenceManualTitle: "Manual proof filled in",
  proofEvidenceStructureTitle: "Type structure held firm",
  proofEvidenceBuildTitle: "Build result passed",
  proofEvidenceTitle: "Verification makes progress stand",
  proofBlockerTitle: "Risk has been made visible",
  proofNextStepTitle: "Relay point is clear",
  proofScanTitle: "Starting point organized",
  proofJournalTitle: "Journal can be flipped open",
  proofDemoTitle: "Demo thread connected",
  proofCoreTitle: "Core flow has advanced",
  proofFallbackTitle: (page) => `Page ${page} counts too`,

  proofGoalDetail: "The goal page proves this round of collaboration has a shared coordinate -- actions, artifacts, and verifications know where to aim.",
  proofDecisionDetail: "The decision page records the route choice, so the next person does not have to guess why.",
  proofArtifactJournalDetail: "This page shows the result has become something you can open, browse, and hand to someone else.",
  proofArtifactDetail: "This page shows the collaboration went beyond talk -- a reusable deliverable has been produced.",
  proofEvidenceAutoDetail: "Automated verification swept through the basics. This page proves machine-repeatable checks have been recorded.",
  proofEvidenceManualDetail: "This manual proof filled in the final confirmation -- it is not the same progress as an automated scan.",
  proofEvidenceStructureDetail: "This page shows types and interfaces are aligned, reducing the risk of structural issues when building further.",
  proofEvidenceBuildDetail: "This page shows the build completes successfully -- demo and delivery can keep moving forward.",
  proofEvidenceDetail: "The verification page shows this step was not just words -- evidence backs it up, safe to count toward progress.",
  proofBlockerDetail: "The blocker page surfaces the obstacle openly, preventing the next round from spinning in the same spot.",
  proofNextStepDetail: "The relay page leaves the next step here so the next person can pick up directly.",
  proofScanDetail: "This page gathers scattered context into a starting point, so anyone flipping back can see where this round began.",
  proofJournalDetail: "This page shows progress has left the chat and become something you can open, browse, and share.",
  proofDemoDetail: "This page collects completed progress, evidence, and relay points together -- ready for a clear demo.",
  proofCoreDetail: "This page shows the core flow has advanced toward a usable state -- attention can shift to experience and wrap-up.",
  proofFallbackDetail: (page) => `Page ${page} records a concrete step forward. It does not need to be a report -- it just needs to show the task moved one square ahead.`,

  cleanVerifyPassed: "Real check already passed",
  cleanVerifyEntryFound: "Found a verification entry that can prove progress.",
  cleanChangeSummary: "These changes have been organized into a trackable progress item.",
  cleanProjectCheck: "a project check",
  cleanJournal: "progress journal",
  cleanProjectContent: "related project content",
  cleanToolName: "DoneGraph tool",
  cleanToolLabel: "tool",
  cleanCoreLabel: "core",
};

function getLocale(lang: DashboardLang): DashboardLocale {
  return lang === "en" ? enLocale : zhLocale;
}

export interface DoneGraph {
  version: "2";
  schema: DoneGraphSchemaInfo;
  generated_at: string;
  goal: string;
  platform: DoneGraphPlatform;
  privacy_tier: PrivacyTier;
  narrative: string;
  ai_analysis?: {
    story: string;
    risks: string[];
    insights: string[];
  };
  summary: DoneGraphSummary;
  accountability: AccountabilityScore;
  nodes: DoneGraphNode[];
  edges: DoneGraphEdge[];
  milestones: DoneGraphMilestone[];
  achievements: DoneGraphAchievement[];
  next_steps: string[];
}

export interface DoneGraphSafeSnapshotItem {
  title: string;
  detail: string;
  status: EvidenceStatus;
}

export interface DoneGraphSafeSnapshotWorkItem extends DoneGraphSafeSnapshotItem {
  type: DoneGraphNodeType;
  signal?: string;
}

export interface DoneGraphSafeSnapshotRadioSegment {
  title: string;
  line: string;
}

export interface DoneGraphSafeSnapshot {
  version: "2";
  kind: "donegraph.safe_snapshot";
  generated_at: string;
  goal: string;
  platform: DoneGraphPlatform;
  privacy: {
    tier: PrivacyTier;
    mode: "single_safe_snapshot";
    raw_session_included: false;
    uploaded_fields: string[];
    excluded_fields: string[];
    redactions: string[];
  };
  summary: DoneGraphSummary;
  accountability: AccountabilityScore;
  milestones: DoneGraphSafeSnapshotItem[];
  achievements: DoneGraphSafeSnapshotItem[];
  work_trail: DoneGraphSafeSnapshotWorkItem[];
  next_steps: string[];
  letter: {
    subject: string;
    body: string;
  };
  radio: {
    intro: string;
    segments: DoneGraphSafeSnapshotRadioSegment[];
  };
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

export interface RecapCommit {
  hash: string;
  message: string;
  timestamp: string;
  filesChanged: number;
}

export interface RecapTestResult {
  script: string;
  passed: boolean;
  duration_ms?: number;
}

export interface RecapInput {
  commits: RecapCommit[];
  changedFiles: string[];
  diffStat: string;
  testResults: RecapTestResult[];
  platform: DoneGraphPlatform;
  projectName?: string;
  goal?: string;
  now: () => string;
  uuid: () => string;
}

export interface RecapAnalysisItem {
  title: string;
  detail: string;
  type: "goal" | "decision" | "action" | "artifact" | "verification" | "blocker" | "completion";
  status?: "pass" | "fail" | "unknown" | "blocked";
}

export interface RecapAnalysis {
  version: "1";
  summary: string;
  story: string;
  items: RecapAnalysisItem[];
  risks: string[];
  insights: string[];
  next_steps: string[];
}

export function buildRecapEventsFromAnalysis(
  analysis: RecapAnalysis,
  testResults: RecapTestResult[],
  platform: DoneGraphPlatform,
  now: () => string,
  uuid: () => string
): DoneGraphEvent[] {
  const events: DoneGraphEvent[] = [];

  for (const item of analysis.items) {
    events.push({
      id: uuid(),
      timestamp: now(),
      platform,
      type: item.type,
      text: item.title,
      metadata: {
        ...(item.status ? { status: item.status } : {}),
        source: "ai-analysis"
      }
    });
  }

  for (const result of testResults) {
    events.push({
      id: uuid(),
      timestamp: now(),
      platform,
      type: "verification",
      text: `${result.script}: ${result.passed ? "passed" : "failed"}${result.duration_ms ? ` (${(result.duration_ms / 1000).toFixed(1)}s)` : ""}`,
      metadata: {
        command: result.script,
        status: result.passed ? "pass" : "fail",
        source: "recap-verify"
      }
    });
  }

  return events;
}

export function buildRecapEvents(input: RecapInput): DoneGraphEvent[] {
  const events: DoneGraphEvent[] = [];
  const { commits, changedFiles, testResults, platform, now, uuid } = input;

  const goalText = input.goal
    ?? (commits.length > 0
      ? commits.map((c) => c.message).join("; ")
      : "Work session recap");

  events.push({
    id: uuid(),
    timestamp: commits[0]?.timestamp ?? now(),
    platform,
    type: "goal",
    text: goalText,
    metadata: {}
  });

  for (const commit of commits) {
    events.push({
      id: uuid(),
      timestamp: commit.timestamp,
      platform,
      type: "action",
      text: commit.message,
      metadata: { source: "git-commit" }
    });
  }

  if (changedFiles.length > 0) {
    const fileGroups = new Map<string, string[]>();
    for (const file of changedFiles) {
      const dir = file.includes("/") ? file.split("/")[0]! : ".";
      if (!fileGroups.has(dir)) fileGroups.set(dir, []);
      fileGroups.get(dir)!.push(file);
    }
    const summary = Array.from(fileGroups.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5)
      .map(([dir, files]) => `${dir}/ (${files.length} files)`)
      .join(", ");
    events.push({
      id: uuid(),
      timestamp: now(),
      platform,
      type: "artifact",
      text: `${changedFiles.length} files changed: ${summary}`,
      metadata: { source: "git-diff" }
    });
  }

  for (const result of testResults) {
    events.push({
      id: uuid(),
      timestamp: now(),
      platform,
      type: "verification",
      text: `${result.script}: ${result.passed ? "passed" : "failed"}${result.duration_ms ? ` (${(result.duration_ms / 1000).toFixed(1)}s)` : ""}`,
      metadata: {
        command: result.script,
        status: result.passed ? "pass" : "fail",
        source: "recap-verify"
      }
    });
  }

  const allPassed = testResults.length > 0 && testResults.every((r) => r.passed);
  events.push({
    id: uuid(),
    timestamp: now(),
    platform,
    type: "completion",
    text: allPassed
      ? `Session complete: ${commits.length} commits, ${changedFiles.length} files, ${testResults.filter((r) => r.passed).length}/${testResults.length} checks passed`
      : testResults.length === 0
        ? `Session complete: ${commits.length} commits, ${changedFiles.length} files changed`
        : `Session complete with issues: ${testResults.filter((r) => !r.passed).length}/${testResults.length} checks failed`,
    metadata: {}
  });

  return events;
}

const doneGraphSchema: DoneGraphSchemaInfo = {
  name: "DoneGraph",
  purpose: "Clean-room AI collaboration accountability graph: goals, actions, artifacts, evidence, decisions, blockers, and next steps.",
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

export function redactDoneGraphText(value: string): string {
  return normalizeText(value)
    .replace(/(api[_-]?key|token|secret|password|passwd|authorization)\s*[:=]\s*["']?[^\s"',;]+/gi, "$1=[redacted]")
    .replace(/\bsk-[A-Za-z0-9_-]{12,}\b/g, "[redacted key]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted email]")
    .replace(/(?:\/Users|\/home)\/[^\s，。；;]+/g, "[local path]")
    .replace(/[A-Z]:\\[^\s，。；;]+/gi, "[local path]")
    .replace(/\bnpm(?:\s+run)?\s+[\w:-]+/gi, "project check")
    .replace(/\b(?:apps|packages|plugins|platforms|scripts|src|test|tests|READMEs?)\/[^\s，。；;]+/gi, "[project file]")
    .replace(/\.donegraph\/[^\s，。；;]+/gi, "[donegraph artifact]")
    .replace(/\s+/g, " ")
    .trim();
}

function safeSignalForCommand(command: string | undefined): string | undefined {
  const intent = commandIntent(command);
  if (intent === "typecheck") return "Type structure checked";
  if (intent === "build") return "Build path checked";
  if (intent === "lint") return "Quality check found";
  if (intent === "test") return "Test path checked";
  return command ? "Project check recorded" : undefined;
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

function computeAccountabilityScore(
  nodes: DoneGraphNode[],
  edges: DoneGraphEdge[],
  nextSteps: string[]
): AccountabilityScore {
  const hardGateFailures: string[] = [];

  const evidenceNodes = nodes.filter((n) => n.type === "evidence");
  const taskNodes = nodes.filter((n) => n.type === "task");
  const decisionNodes = nodes.filter((n) => n.type === "decision");
  const scoreableNodes = nodes.filter((n) => n.type !== "next_step" && n.type !== "goal");
  const completionNodes = taskNodes.filter((n) => n.title === "阶段完成" || n.title === "Phase complete");

  const verifiedByTargets = new Set(edges.filter((e) => e.label === "verified_by").map((e) => e.from));
  const nodesWithEvidence = scoreableNodes.filter((n) => verifiedByTargets.has(n.id)).length;
  const evidenceCoverageScore = scoreableNodes.length === 0 ? 0 : Math.round((nodesWithEvidence / scoreableNodes.length) * 100);

  const decidedByTargets = new Set(edges.filter((e) => e.label === "decided_by").map((e) => e.from));
  const tracedDecisions = decisionNodes.filter((n) => n.detail.trim().length > 0 && decidedByTargets.has(n.id)).length;
  const decisionScore = decisionNodes.length === 0 ? 100 : Math.round((tracedDecisions / decisionNodes.length) * 100);

  const hasPassEvidence = evidenceNodes.some((n) => n.status === "pass");
  const completionWithoutEvidence = completionNodes.length > 0 && !hasPassEvidence;
  if (completionWithoutEvidence) {
    hardGateFailures.push("Completion declared without any passing evidence");
  }
  const completionScore = completionNodes.length === 0 ? 50 : completionWithoutEvidence ? 0 : 100;

  const hasNextSteps = nextSteps.length > 0 && nextSteps.some((s) => s.trim().length > 0);
  const unresolvedUnknowns = evidenceNodes.filter((n) => n.status === "unknown").length;
  const unknownPenalty = Math.min(unresolvedUnknowns * 15, 60);
  const handoffScore = Math.max(0, (hasNextSteps ? 100 : 40) - unknownPenalty);

  let privacyLeaks = 0;
  for (const node of nodes) {
    const redacted = redactDoneGraphText(node.detail);
    if (redacted !== node.detail) privacyLeaks++;
  }
  const privacyScore = Math.max(0, 100 - privacyLeaks * 20);

  const incomingTargets = new Set(edges.map((e) => e.to));
  const nonGoalNodes = nodes.filter((n) => n.type !== "goal" && n.type !== "next_step");
  const connectedCount = nonGoalNodes.filter((n) => incomingTargets.has(n.id)).length;
  const coherenceScore = nonGoalNodes.length === 0 ? 100 : Math.round((connectedCount / nonGoalNodes.length) * 100);

  const dimensions: AccountabilityDimension[] = [
    { id: "evidence_coverage", label: "Evidence Coverage", score: evidenceCoverageScore, weight: 25, detail: `${nodesWithEvidence}/${scoreableNodes.length} nodes have linked evidence`, hard_gate_failed: false },
    { id: "decision_traceability", label: "Decision Traceability", score: decisionScore, weight: 15, detail: decisionNodes.length === 0 ? "No decisions recorded" : `${tracedDecisions}/${decisionNodes.length} decisions traced to downstream tasks`, hard_gate_failed: false },
    { id: "completion_integrity", label: "Completion Integrity", score: completionScore, weight: 25, detail: completionWithoutEvidence ? "Completion declared without passing evidence" : completionNodes.length === 0 ? "No completion events yet" : "Completion backed by evidence", hard_gate_failed: completionWithoutEvidence },
    { id: "handoff_quality", label: "Handoff Quality", score: handoffScore, weight: 15, detail: `${hasNextSteps ? "Next steps defined" : "No next steps"}${unresolvedUnknowns > 0 ? `, ${unresolvedUnknowns} unresolved unknowns` : ""}`, hard_gate_failed: false },
    { id: "privacy_safety", label: "Privacy Safety", score: privacyScore, weight: 10, detail: privacyLeaks === 0 ? "No privacy leaks detected" : `${privacyLeaks} nodes contain unredacted sensitive content`, hard_gate_failed: false },
    { id: "graph_coherence", label: "Graph Coherence", score: coherenceScore, weight: 10, detail: `${connectedCount}/${nonGoalNodes.length} non-goal nodes have incoming edges`, hard_gate_failed: false }
  ];

  const totalWeight = dimensions.reduce((sum, d) => sum + d.weight, 0);
  const composite = totalWeight === 0 ? 0 : Math.round(dimensions.reduce((sum, d) => sum + d.score * d.weight, 0) / totalWeight);
  const hardGatesPassed = hardGateFailures.length === 0;

  let verdict: AccountabilityVerdict;
  if (composite >= 80 && hardGatesPassed) verdict = "ACCOUNTABLE";
  else if (composite >= 50 && hardGatesPassed) verdict = "PARTIAL";
  else verdict = "UNACCOUNTED";

  return { composite, verdict, dimensions, hard_gates_passed: hardGatesPassed, hard_gate_failures: hardGateFailures };
}

function inferVerificationDepth(event: DoneGraphEvent): VerificationDepth {
  if (event.type !== "verification") return "self_reported";
  if (event.metadata.command && event.metadata.source === "capture-verify") return "command_verified";
  if (event.metadata.command) return "manual_verified";
  return "self_reported";
}

function confidenceForDepth(depth: VerificationDepth): EvidenceConfidence {
  if (depth === "command_verified") return "high";
  if (depth === "manual_verified") return "medium";
  return "low";
}

function detectContradictions(nodes: DoneGraphNode[]): void {
  const evidenceByCommand = new Map<string, DoneGraphNode[]>();
  for (const node of nodes) {
    if (node.type !== "evidence" || !node.metadata.command) continue;
    const key = node.metadata.command;
    if (!evidenceByCommand.has(key)) evidenceByCommand.set(key, []);
    evidenceByCommand.get(key)!.push(node);
  }
  for (const group of evidenceByCommand.values()) {
    if (group.length < 2) continue;
    const lastFail = [...group].reverse().find((n) => n.status === "fail");
    if (!lastFail) continue;
    for (const node of group) {
      if (node === lastFail) continue;
      if (node.status === "pass") {
        node.metadata.verification_depth = "contradicted";
        node.metadata.confidence = "low";
      }
    }
  }
}

export function buildDoneGraph(events: DoneGraphEvent[], generatedAt = new Date().toISOString()): DoneGraph {
  const sorted = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const goalEvent = sorted.find((event) => event.type === "goal");
  const enriched = sorted.map((event) => {
    if (!event.metadata.verification_depth) {
      const depth = inferVerificationDepth(event);
      return { ...event, metadata: { ...event.metadata, verification_depth: depth, confidence: event.metadata.confidence ?? confidenceForDepth(depth) } };
    }
    return event;
  });
  const nodes = enriched.map(nodeForEvent);
  detectContradictions(nodes);
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
  const accountability = computeAccountabilityScore(allNodes, edges, nextSteps);
  const base = {
    version: "2" as const,
    schema: doneGraphSchema,
    generated_at: generatedAt,
    goal: goalEvent?.text ?? "",
    platform: goalEvent?.platform ?? sorted[0]?.platform ?? "generic",
    privacy_tier: "local_only" as PrivacyTier,
    summary: summaryFor(allNodes, sorted.length, nextSteps, milestones),
    accountability,
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

function statusText(status: EvidenceStatus, locale: DashboardLocale = zhLocale): string {
  if (status === "pass") return locale.statusPass;
  if (status === "fail") return locale.statusFail;
  if (status === "blocked") return locale.statusBlocked;
  return locale.statusUnknown;
}

interface DashboardStoryCopy {
  title: string;
  detail: string;
  kind: string;
}

interface DashboardProgressItem extends DashboardStoryCopy {
  status: EvidenceStatus;
}

const DASHBOARD_TEMPLATE_CONTRACT = "fixed-journal-scene-v1";
const DASHBOARD_DYNAMIC_SURFACE = "copy-only-v1";
const DASHBOARD_PAGE_SWITCH_DELAY_MS = 220;
const DASHBOARD_PAGE_TURN_DURATION_MS = 860;

function commandIntent(value: string | undefined): "test" | "typecheck" | "build" | "lint" | undefined {
  const normalized = value?.toLowerCase() ?? "";
  if (normalized.includes("typecheck") || normalized.includes("tsc")) return "typecheck";
  if (normalized.includes("build")) return "build";
  if (normalized.includes("lint")) return "lint";
  if (normalized.includes("test") || normalized.includes("vitest")) return "test";
  return undefined;
}

function cleanDashboardText(value: string | undefined, fallback: string, locale: DashboardLocale = zhLocale): string {
  const cleaned = normalizeText(value ?? "")
    .replace(/真实运行验证命令并通过[:：]?\s*[\w\s:.-]+/gi, locale.cleanVerifyPassed)
    .replace(/发现可用于证明进展的验证入口[:：][^。]+。?/g, locale.cleanVerifyEntryFound)
    .replace(/代表文件[:：][^。；;]+[。；;]?/g, locale.cleanChangeSummary)
    .replace(/\bpath=[^\s，。；;]+/gi, "")
    .replace(/\bcommand=[^\s，。；;]+/gi, "")
    .replace(/\bnpm(?:\s+run)?\s+[\w:-]+/gi, locale.cleanProjectCheck)
    .replace(/\.donegraph\/[^\s，。；;]+/gi, locale.cleanJournal)
    .replace(/\b(?:apps|packages|plugins|platforms|scripts|src|test|tests|READMEs?)\/[^\s，。；;]+/gi, locale.cleanProjectContent)
    .replace(/DoneGraph CLI/g, locale.cleanToolName)
    .replace(/\bCLI\b/g, locale.cleanToolLabel)
    .replace(/命令优先的/g, locale.cleanCoreLabel)
    .replace(/\s+/g, " ")
    .replace(/\s+([，。；])/g, "$1")
    .trim();
  return cleaned.length > 0 ? cleaned : fallback;
}

function storyCopyForNode(node: DoneGraphNode, locale: DashboardLocale = zhLocale): DashboardStoryCopy {
  const intent = commandIntent(`${node.metadata.command ?? ""} ${node.title} ${node.detail}`);
  const path = node.metadata.path?.toLowerCase() ?? "";

  if (node.type === "goal") {
    return {
      title: locale.storyGoalTitle,
      detail: `${locale.storyGoalDetailPrefix}${cleanDashboardText(node.detail, locale.storyGoalFallback, locale)}`,
      kind: locale.storyGoalKind
    };
  }

  if (node.type === "decision") {
    return {
      title: locale.storyDecisionTitle,
      detail: cleanDashboardText(node.detail, locale.storyDecisionFallback, locale),
      kind: locale.storyDecisionKind
    };
  }

  if (node.type === "artifact" && path.includes("dashboard")) {
    return {
      title: locale.storyArtifactDashboardTitle,
      detail: locale.storyArtifactDashboardDetail,
      kind: locale.storyArtifactKind
    };
  }

  if (node.type === "artifact") {
    return {
      title: locale.storyArtifactTitle,
      detail: cleanDashboardText(node.detail, locale.storyArtifactFallback, locale),
      kind: locale.storyArtifactKind
    };
  }

  if (node.type === "evidence" && intent === "typecheck") {
    return {
      title: locale.storyEvidenceTypecheckTitle,
      detail: locale.storyEvidenceTypecheckDetail,
      kind: locale.storyEvidenceKind
    };
  }

  if (node.type === "evidence" && intent === "build") {
    return {
      title: locale.storyEvidenceBuildTitle,
      detail: locale.storyEvidenceBuildDetail,
      kind: locale.storyEvidenceKind
    };
  }

  if (node.type === "evidence" && intent === "test") {
    if (node.metadata.source === "capture-verify") {
      return {
        title: locale.storyEvidenceTestAutoTitle,
        detail: locale.storyEvidenceTestAutoDetail,
        kind: locale.storyEvidenceKind
      };
    }
    return {
      title: locale.storyEvidenceTestManualTitle,
      detail: locale.storyEvidenceTestManualDetail,
      kind: locale.storyEvidenceKind
    };
  }

  if (node.type === "evidence") {
    return {
      title: node.status === "pass" ? locale.storyEvidencePassTitle : locale.storyEvidenceUnconfirmedTitle,
      detail: cleanDashboardText(node.detail, locale.storyEvidenceFallback, locale),
      kind: locale.storyEvidenceKind
    };
  }

  if (node.type === "blocker") {
    return {
      title: locale.storyBlockerTitle,
      detail: cleanDashboardText(node.detail, locale.storyBlockerFallback, locale),
      kind: locale.storyBlockerKind
    };
  }

  if (node.type === "next_step") {
    return {
      title: locale.storyNextStepTitle,
      detail: cleanDashboardText(node.detail, locale.storyNextStepFallback, locale),
      kind: locale.storyNextStepKind
    };
  }

  if (intent === "build") {
    return {
      title: locale.storyBuildTitle,
      detail: cleanDashboardText(node.detail, locale.storyBuildFallback, locale),
      kind: locale.storyPushKind
    };
  }

  if (intent === "test") {
    return {
      title: locale.storyTestTitle,
      detail: cleanDashboardText(node.detail, locale.storyTestFallback, locale),
      kind: locale.storyPushKind
    };
  }

  if (node.metadata.source === "git-commit") {
    const msg = normalizeText(node.detail).replace(/^[a-f0-9]{6,40}\s+/i, "");
    const short = msg.length > 60 ? `${msg.slice(0, 57)}...` : msg;
    return {
      title: short || locale.storyDefaultTitle,
      detail: msg,
      kind: "commit"
    };
  }

  if (node.metadata.source === "git-diff") {
    return {
      title: locale.lang === "en" ? "Files changed" : "文件变更",
      detail: normalizeText(node.detail),
      kind: locale.lang === "en" ? "diff" : "变更"
    };
  }

  if (node.metadata.source === "recap-verify") {
    const cmd = node.metadata.command ?? "";
    const label = cmd.includes("test") ? (locale.lang === "en" ? "Tests" : "测试")
      : cmd.includes("typecheck") || cmd.includes("tsc") ? (locale.lang === "en" ? "Types" : "类型")
      : cmd.includes("build") ? (locale.lang === "en" ? "Build" : "构建")
      : cmd.includes("lint") ? (locale.lang === "en" ? "Lint" : "检查")
      : (locale.lang === "en" ? "Check" : "检查");
    return {
      title: `${label}: ${node.status === "pass" ? (locale.lang === "en" ? "passed" : "通过") : (locale.lang === "en" ? "failed" : "失败")}`,
      detail: normalizeText(node.detail),
      kind: locale.lang === "en" ? "check" : "验证"
    };
  }

  if (node.type === "task") {
    const raw = `${node.title} ${node.detail}`;
    if (raw.includes("自动扫描") || raw.includes("协作进度起点")) {
      return {
        title: locale.storyTaskScanTitle,
        detail: cleanDashboardText(node.detail, locale.storyTaskScanFallback, locale),
        kind: locale.storyPushKind
      };
    }
    if (raw.includes("手账") || raw.includes("翻看") || raw.includes("首页")) {
      return {
        title: locale.storyTaskJournalTitle,
        detail: cleanDashboardText(node.detail, locale.storyTaskJournalFallback, locale),
        kind: locale.storyPushKind
      };
    }
    if (raw.includes("演示") || raw.includes("交接")) {
      return {
        title: locale.storyTaskDemoTitle,
        detail: cleanDashboardText(node.detail, locale.storyTaskDemoFallback, locale),
        kind: locale.storyPushKind
      };
    }
  }

  return {
    title: node.title === "阶段完成" || node.title === "Phase complete" ? locale.storyPhaseCompleteTitle : locale.storyDefaultTitle,
    detail: cleanDashboardText(node.detail, locale.storyDefaultFallback, locale),
    kind: locale.storyPushKind
  };
}

function storyCopyForAchievement(item: DoneGraphAchievement, sourceNode: DoneGraphNode | undefined, locale: DashboardLocale = zhLocale): DashboardStoryCopy {
  if (sourceNode) return storyCopyForNode(sourceNode, locale);

  const raw = `${item.title} ${item.detail}`;
  const intent = commandIntent(raw);
  if (intent === "typecheck") {
    return { title: locale.achievementTypecheckTitle, detail: locale.achievementTypecheckDetail, kind: locale.storyEvidenceKind };
  }
  if (intent === "build") {
    return { title: locale.achievementBuildTitle, detail: locale.achievementBuildDetail, kind: locale.storyPushKind };
  }
  if (intent === "test") {
    return { title: locale.achievementTestTitle, detail: locale.achievementTestDetail, kind: locale.storyEvidenceKind };
  }
  return {
    title: cleanDashboardText(item.title, locale.achievementFallbackTitle, locale),
    detail: cleanDashboardText(item.detail, locale.achievementFallbackDetail, locale),
    kind: locale.achievementProgressKind
  };
}

function localizeStage(stage: string, locale: DashboardLocale): string {
  // The stage comes from currentStageFor() which always returns Chinese.
  // Map Chinese stage names to locale equivalents.
  if (stage === "可以交付演示") return locale.stageDemoReady;
  if (stage === "目标还没定") return locale.stageGoalUndefined;
  if (stage === "等待开始实现") return locale.stageAwaitingImplementation;
  if (stage === "等待产物出现") return locale.stageAwaitingArtifact;
  if (stage === "等待证据验证") return locale.stageAwaitingEvidence;
  if (stage === "演示还差收尾") return locale.stageDemoAlmostReady;
  if (stage === "交接还要整理") return locale.stageHandoffPending;
  return stage;
}

function localizeNextStep(step: string, locale: DashboardLocale): string {
  // Next steps come from nextStepsForNodes() which always returns Chinese.
  // Map known Chinese patterns to locale equivalents.
  if (step.startsWith("先修复失败验证：")) return locale.nextStepFixFailed(step.slice("先修复失败验证：".length));
  if (step.startsWith("先解除阻塞：")) return locale.nextStepUnblock(step.slice("先解除阻塞：".length));
  if (step.startsWith("补充可判断证据：")) return locale.nextStepAddEvidence(step.slice("补充可判断证据：".length));
  if (step === "为本轮产物补充至少一条 verification 记录，说明用什么命令证明它可用。") return locale.nextStepAddVerification;
  if (step === "把已通过的证据固化到 README、测试或下一轮任务清单，然后开启下一阶段目标。") return locale.nextStepConsolidate;
  return step;
}

function dashboardNextStep(step: string, locale: DashboardLocale = zhLocale): string {
  const localized = localizeNextStep(step, locale);
  return cleanDashboardText(localized, locale.dashboardNextStepFallback, locale);
}

function progressProofTitle(item: DashboardStoryCopy, page: number, locale: DashboardLocale = zhLocale): string {
  const raw = `${item.title} ${item.detail}`;
  if (item.kind === locale.storyGoalKind) return locale.proofGoalTitle;
  if (item.kind === locale.storyDecisionKind) return locale.proofDecisionTitle;
  if (item.kind === locale.storyArtifactKind) {
    return (item.title.includes("手账") || item.title.includes("journal") || item.title.includes("browsable"))
      ? locale.proofArtifactJournalTitle : locale.proofArtifactTitle;
  }
  if (item.kind === locale.storyEvidenceKind) {
    if (item.title.includes("自动检查") || item.title.includes("Auto-check")) return locale.proofEvidenceAutoTitle;
    if (item.detail.includes("手动证明") || item.detail.includes("manual proof")) return locale.proofEvidenceManualTitle;
    if (item.title.includes("结构") || item.title.includes("structure") || item.title.includes("Type")) return locale.proofEvidenceStructureTitle;
    if (item.title.includes("打包") || item.title.includes("Build") || item.title.includes("runnable")) return locale.proofEvidenceBuildTitle;
    return locale.proofEvidenceTitle;
  }
  if (item.kind === locale.storyBlockerKind) return locale.proofBlockerTitle;
  if (item.kind === locale.storyNextStepKind) return locale.proofNextStepTitle;
  if (raw.includes("自动扫描") || raw.includes("协作进度起点") || raw.includes("starting point") || raw.includes("Collaboration starting")) return locale.proofScanTitle;
  if (raw.includes("手账") || raw.includes("翻看") || raw.includes("首页") || raw.includes("journal") || raw.includes("browsable")) return locale.proofJournalTitle;
  if (raw.includes("演示") || raw.includes("交接") || raw.includes("demo") || raw.includes("Demo") || raw.includes("relay")) return locale.proofDemoTitle;
  if (item.title.includes("核心") || item.detail.includes("核心") || item.title.includes("Core") || item.detail.includes("core")) return locale.proofCoreTitle;
  return locale.proofFallbackTitle(page);
}

function progressProofDetail(item: DashboardStoryCopy, page: number, locale: DashboardLocale = zhLocale): string {
  const raw = `${item.title} ${item.detail}`;
  if (item.kind === locale.storyGoalKind) {
    return locale.proofGoalDetail;
  }
  if (item.kind === locale.storyDecisionKind) {
    return locale.proofDecisionDetail;
  }
  if (item.kind === locale.storyArtifactKind) {
    return (item.title.includes("手账") || item.title.includes("journal") || item.title.includes("browsable"))
      ? locale.proofArtifactJournalDetail
      : locale.proofArtifactDetail;
  }
  if (item.kind === locale.storyEvidenceKind) {
    if (item.title.includes("自动检查") || item.title.includes("Auto-check")) {
      return locale.proofEvidenceAutoDetail;
    }
    if (item.detail.includes("手动证明") || item.detail.includes("manual proof")) {
      return locale.proofEvidenceManualDetail;
    }
    if (item.title.includes("结构") || item.title.includes("structure") || item.title.includes("Type")) {
      return locale.proofEvidenceStructureDetail;
    }
    if (item.title.includes("打包") || item.title.includes("Build") || item.title.includes("runnable")) {
      return locale.proofEvidenceBuildDetail;
    }
    return locale.proofEvidenceDetail;
  }
  if (item.kind === locale.storyBlockerKind) {
    return locale.proofBlockerDetail;
  }
  if (item.kind === locale.storyNextStepKind) {
    return locale.proofNextStepDetail;
  }
  if (raw.includes("自动扫描") || raw.includes("协作进度起点") || raw.includes("starting point") || raw.includes("Collaboration starting")) {
    return locale.proofScanDetail;
  }
  if (raw.includes("手账") || raw.includes("翻看") || raw.includes("首页") || raw.includes("journal") || raw.includes("browsable")) {
    return locale.proofJournalDetail;
  }
  if (raw.includes("演示") || raw.includes("交接") || raw.includes("demo") || raw.includes("Demo") || raw.includes("relay")) {
    return locale.proofDemoDetail;
  }
  if (item.title.includes("核心") || item.detail.includes("核心") || item.title.includes("Core") || item.detail.includes("core")) {
    return locale.proofCoreDetail;
  }
  return locale.proofFallbackDetail(page);
}

function dashboardNarrativeFor(graph: DoneGraph, locale: DashboardLocale = zhLocale): string {
  const nextStep = graph.next_steps[0] ? dashboardNextStep(graph.next_steps[0], locale) : locale.dashboardNarrativeContinue;
  return locale.narrativeTemplate(
    graph.summary.milestones_completed,
    graph.summary.milestones_total,
    localizeStage(graph.summary.current_stage, locale),
    graph.summary.evidence_passed,
    nextStep
  );
}

function safeSnapshotItemForNode(node: DoneGraphNode): DoneGraphSafeSnapshotWorkItem {
  const copy = storyCopyForNode(node);
  return {
    type: node.type,
    title: redactDoneGraphText(copy.title),
    detail: redactDoneGraphText(copy.detail),
    status: node.status,
    signal: safeSignalForCommand(node.metadata.command)
  };
}

function safeSnapshotLetter(graph: DoneGraph, workTrail: DoneGraphSafeSnapshotWorkItem[]): { subject: string; body: string } {
  const goal = redactDoneGraphText(graph.goal || "this AI run");
  const strongestSignal =
    workTrail.find((item) => item.status === "pass" && item.signal)?.signal ??
    `${graph.summary.milestones_completed} of ${graph.summary.milestones_total} milestones are already visible`;
  const nextStep = redactDoneGraphText(graph.next_steps[0] ?? "continue from the last recorded step");
  const body = [
    "Hi, I saved the useful part of this AI session for you.",
    `The run was about: ${goal}.`,
    `I kept the trail small on purpose: ${workTrail.length} work moments, ${graph.summary.evidence_passed} passed checks, and ${graph.summary.blockers} blockers.`,
    `The strongest signal I can show safely is: ${strongestSignal}.`,
    `I did not include the raw chat, private file contents, local machine paths, or secret-looking values.`,
    `When you come back, begin here: ${nextStep}.`
  ].join("\n\n");
  return {
    subject: "Your AI work trail is ready",
    body
  };
}

function safeSnapshotRadio(graph: DoneGraph, workTrail: DoneGraphSafeSnapshotWorkItem[]): DoneGraphSafeSnapshot["radio"] {
  const segments = workTrail.slice(0, 4).map((item) => ({
    title: item.title,
    line:
      item.signal && item.status === "pass"
        ? `${item.detail} I kept the proof signal, not the private command.`
        : item.detail
  }));
  if (segments.length === 0) {
    segments.push({
      title: "I am waiting for the first trace",
      line: "Once the user runs an AI task, I can turn the useful part into a small, safe replay."
    });
  }
  segments.push({
    title: "The next handoff is already warm",
    line: redactDoneGraphText(graph.next_steps[0] ?? "The next step will appear here after the run has enough signal.")
  });
  return {
    intro: "A quiet agent radio script generated from the safe snapshot.",
    segments
  };
}

export function buildSafeSnapshot(graph: DoneGraph, generatedAt = graph.generated_at): DoneGraphSafeSnapshot {
  const workTrail = graph.nodes
    .filter((node) => node.type !== "next_step")
    .slice(0, 18)
    .map(safeSnapshotItemForNode);
  const achievements = graph.achievements.slice(0, 12).map((item) => ({
    title: redactDoneGraphText(item.title),
    detail: redactDoneGraphText(item.detail),
    status: item.status
  }));
  const milestones = graph.milestones.map((item) => ({
    title: redactDoneGraphText(item.title),
    detail: redactDoneGraphText(item.detail),
    status: item.status
  }));
  const nextSteps = graph.next_steps.map(redactDoneGraphText);

  return {
    version: "2",
    kind: "donegraph.safe_snapshot",
    generated_at: generatedAt,
    goal: redactDoneGraphText(graph.goal),
    platform: graph.platform,
    privacy: {
      tier: "redacted_share",
      mode: "single_safe_snapshot",
      raw_session_included: false,
      uploaded_fields: ["summary", "accountability", "milestones", "achievements", "work_trail", "next_steps", "letter", "radio"],
      excluded_fields: ["raw session log", "full chat", "file contents", "local machine paths", "secret-looking values"],
      redactions: ["local paths", "project file paths", "API keys", "tokens", "password-like values", "emails"]
    },
    summary: graph.summary,
    accountability: graph.accountability,
    milestones,
    achievements,
    work_trail: workTrail,
    next_steps: nextSteps,
    letter: safeSnapshotLetter(graph, workTrail),
    radio: safeSnapshotRadio(graph, workTrail)
  };
}

export function renderSafeSnapshotMarkdown(snapshot: DoneGraphSafeSnapshot): string {
  return [
    "# DoneGraph Safe Snapshot",
    "",
    `Generated: ${snapshot.generated_at}`,
    `Goal: ${snapshot.goal || "Not started"}`,
    "",
    "## Privacy Boundary",
    "",
    `- Mode: ${snapshot.privacy.mode}`,
    `- Raw session included: ${snapshot.privacy.raw_session_included ? "yes" : "no"}`,
    `- Excluded: ${snapshot.privacy.excluded_fields.join(", ")}`,
    "",
    "## Work Trail",
    "",
    ...snapshot.work_trail.map((item) => `- [${item.status}] ${item.title}: ${item.detail}${item.signal ? ` (${item.signal})` : ""}`),
    "",
    "## Letter",
    "",
    snapshot.letter.body,
    "",
    "## Radio",
    "",
    ...snapshot.radio.segments.map((item) => `- ${item.title}: ${item.line}`),
    ""
  ].join("\n");
}

function nodeTypeText(type: DoneGraphNodeType, locale: DashboardLocale = zhLocale): string {
  const labels: Record<DoneGraphNodeType, string> = {
    goal: locale.nodeGoal,
    task: locale.nodeTask,
    decision: locale.nodeDecision,
    artifact: locale.nodeArtifact,
    evidence: locale.nodeEvidence,
    blocker: locale.nodeBlocker,
    achievement: locale.nodeAchievement,
    next_step: locale.nodeNextStep
  };
  return labels[type];
}

function renderNode(node: DoneGraphNode, index: number, locale: DashboardLocale = zhLocale): string {
  return [
    `<article class="journal-card ${escapeHtml(node.type)} ${escapeHtml(statusLabel(node.status))}" style="--delay: ${index * 70}ms">`,
    `<div class="card-cap"><span class="card-number">${String(index + 1).padStart(2, "0")}</span><span class="card-kind">${escapeHtml(nodeTypeText(node.type, locale))}</span></div>`,
    `<h3>${escapeHtml(node.title)}</h3>`,
    `<p>${escapeHtml(node.detail)}</p>`,
    `<div class="stamp ${escapeHtml(statusLabel(node.status))}">${escapeHtml(statusText(node.status, locale))}</div>`,
    node.metadata.path ? `<code>${escapeHtml(node.metadata.path)}</code>` : "",
    node.metadata.command ? `<code>${escapeHtml(node.metadata.command)}</code>` : "",
    node.metadata.source ? `<small class="source">${escapeHtml(node.metadata.source)}</small>` : "",
    "</article>"
  ].join("");
}

export function renderDashboardHtml(graph: DoneGraph, lang: DashboardLang = "zh"): string {
  const locale = getLocale(lang);
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
      ...storyCopyForAchievement(item, sourceNode, locale),
      status: item.status
    };
  });
  const ITEMS_PER_PAGE = 6;
  const progressPages: DashboardProgressItem[][] = [];
  for (let i = 0; i < progressItems.length; i += ITEMS_PER_PAGE) {
    progressPages.push(progressItems.slice(i, i + ITEMS_PER_PAGE));
  }
  const progressSpreadCount = Math.max(progressPages.length, 1);
  const evidenceSpread = progressSpreadCount + 1;
  const detailSpread = progressSpreadCount + 2;
  const progressSpreads =
    progressPages.length > 0
      ? progressPages
          .map((pageItems, index) => {
            const spread = index + 1;
            const page = index + 1;
            const previousTarget = page === 1 ? "0" : String(spread - 1);
            const nextTarget = page === progressPages.length ? String(evidenceSpread) : String(spread + 1);
            const nextLabel = page === progressPages.length ? locale.seeEvidenceShort : locale.nextCompleted;
            const leftCards = pageItems.map((item, i) =>
              `<article class="progress-card ${escapeHtml(statusLabel(item.status))}" style="--delay: ${i * 60}ms"><span class="progress-card-num">${String(index * ITEMS_PER_PAGE + i + 1).padStart(2, "0")}</span><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p><span class="progress-card-badge">${escapeHtml(statusText(item.status, locale))}</span></article>`
            ).join("\n");
            const rightItems = pageItems.map((item, i) =>
              `<li class="proof-list-item"><span class="stamp-inline ${escapeHtml(statusLabel(item.status))}">${escapeHtml(statusText(item.status, locale))}</span> ${escapeHtml(progressProofTitle(item, index * ITEMS_PER_PAGE + i + 1, locale))}</li>`
            ).join("\n");
            return `<section class="spread progress-spread" data-spread="${spread}" data-progress-page="${page}">
        <article class="page left progress-page">
          <div class="page-kicker"><span>${escapeHtml(locale.kickerCompleted)}</span><span>${escapeHtml(locale.completedPageOf(page, progressPages.length))}</span></div>
          <h2>${escapeHtml(locale.whatThisPageCompleted)}</h2>
          <div class="progress-card-grid">${leftCards}</div>
        </article>
        <article class="page right progress-proof-page">
          <div class="page-kicker"><span>${escapeHtml(pageItems[0]?.kind ?? "")}</span><span>${pageItems.length} items</span></div>
          <h2>${escapeHtml(progressProofTitle(pageItems[0]!, page, locale))}</h2>
          <ul class="proof-list">${rightItems}</ul>
          <div class="progress-pager">
            <button class="secondary" type="button" data-jump="${previousTarget}">${page === 1 ? escapeHtml(locale.backToProgress) : escapeHtml(locale.previousPage)}</button>
            <button type="button" data-jump="${nextTarget}">${escapeHtml(nextLabel)}</button>
          </div>
        </article>
      </section>`;
          })
          .join("\n\n")
      : `<section class="spread progress-spread" data-spread="1" data-progress-page="1">
        <article class="page left progress-page">
          <div class="page-kicker"><span>${escapeHtml(locale.kickerCompleted)}</span><span>${escapeHtml(locale.completedPageOf(1, 1))}</span></div>
          <h2>${escapeHtml(locale.whatThisPageCompleted)}</h2>
          <h3>${escapeHtml(locale.noCompletedPages)}</h3>
          <p class="progress-story">${escapeHtml(locale.noCompletedPagesStory)}</p>
        </article>
        <article class="page right progress-proof-page">
          <div class="page-kicker"><span>${escapeHtml(locale.kickerAwaitingRecord)}</span><span>${escapeHtml(locale.awaitingProof)}</span></div>
          <h2>${escapeHtml(locale.whereToStart)}</h2>
          <p class="soft-note">${escapeHtml(locale.whereToStartNote)}</p>
          <div class="progress-pager">
            <button class="secondary" type="button" data-jump="0">${escapeHtml(locale.backToProgress)}</button>
            <button type="button" data-jump="${evidenceSpread}">${escapeHtml(locale.seeEvidenceShort)}</button>
          </div>
        </article>
      </section>`;
  const achievements = progressItems
    .map((item) => `<li><span>${escapeHtml(statusText(item.status, locale))}</span>${escapeHtml(item.title)}</li>`)
    .join("\n");
  const evidenceCards = graph.nodes
    .filter((node) => node.type === "evidence")
    .map((node, index) => {
      const copy = storyCopyForNode(node, locale);
      return `<article class="proof-card ${escapeHtml(statusLabel(node.status))}" style="--delay: ${index * 80}ms"><span>${escapeHtml(statusText(node.status, locale))}</span><strong>${escapeHtml(copy.title)}</strong><p>${escapeHtml(copy.detail)}</p></article>`;
    })
    .join("\n");
  const nextSteps = graph.next_steps.map((step) => `<li>${escapeHtml(dashboardNextStep(step, locale))}</li>`).join("\n");
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
    .map(([source, count]) => `<li><span>${escapeHtml(source)}</span>${escapeHtml(locale.captureRecordsCount(count))}</li>`)
    .join("\n");
  const blockerText =
    graph.summary.blockers === 0 ? locale.blockerNone : locale.blockerSome(graph.summary.blockers);

  return `<!doctype html>
<html lang="${locale.htmlLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="donegraph-template-contract" content="${DASHBOARD_TEMPLATE_CONTRACT}" />
  <meta name="donegraph-dynamic-surface" content="${DASHBOARD_DYNAMIC_SURFACE}" />
  <title>${escapeHtml(locale.pageTitle)}</title>
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
      --motion-page-turn-duration: .86s;
      --motion-page-settle-duration: .56s;
      --motion-page-switch-delay: 220ms;
      --scene-cloud-drift-duration: 8s;
      --scene-cloud-late-delay: -2s;
      --scene-island-bob-duration: 5s;
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
      min-height: auto;
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
      animation: page-turn-forward var(--motion-page-turn-duration) cubic-bezier(.18, .76, .2, 1);
    }
    .journal-stage.turning-backward .turn-page {
      left: 10px;
      transform-origin: right center;
      border-radius: 34px 10px 10px 34px;
      animation: page-turn-backward var(--motion-page-turn-duration) cubic-bezier(.18, .76, .2, 1);
    }
    .journal-stage.turning .turn-page {
      opacity: 1;
    }
    .spread {
      grid-area: 1 / 1;
      position: relative;
      z-index: 2;
      display: none;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 12px;
      opacity: 0;
      pointer-events: none;
      overflow: visible;
    }
    .spread.active {
      display: grid;
      z-index: 3;
      opacity: 1;
      pointer-events: auto;
      animation: spreadFadeIn .4s ease both;
    }
    @keyframes spreadFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .page {
      position: relative;
      z-index: 1;
      min-width: 0;
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
      color: #8a7b66;
      font-size: clamp(16px, 1.6vw, 20px);
      line-height: 1.6;
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    /* ── NPC 对话框 ────────────────────────────── */
    .npc-dialog {
      position: relative;
      margin: 14px 0;
      background: rgb(247, 243, 223);
      border: 2px solid #e8dcc8;
      border-radius: 24px;
      padding: 22px 26px 20px;
      box-shadow: 0 4px 0 #e0d0b0, 0 6px 18px rgba(61,52,40,.10);
      animation: animal-zoom-in .3s cubic-bezier(.34,1.56,.64,1) both;
    }
    .npc-dialog::before {
      content: "";
      position: absolute;
      top: -2px; left: 20px;
      width: 28px; height: 14px;
      background: rgb(247,243,223);
      border-left: 2px solid #e8dcc8;
      border-right: 2px solid #e8dcc8;
      border-top: 2px solid rgb(247,243,223);
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      transform: rotate(180deg) translateY(100%);
    }
    .npc-speaker {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
      padding: 3px 12px;
      border-radius: 99px;
      background: #19c8b9;
      color: #fff;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
    @keyframes animal-zoom-in {
      from { opacity: 0; transform: scale(.92) translateY(6px); }
      to   { opacity: 1; transform: scale(1)  translateY(0);    }
    }

    /* ── 打字机光标 ───────────────────────────── */
    .typewriter-cursor::after {
      content: "▋";
      animation: tw-blink 1s step-end infinite;
      color: var(--moss);
      margin-left: 2px;
    }
    @keyframes tw-blink { 50% { opacity: 0; } }

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
      padding: 12px 28px;
      border: 2px solid #d4a800;
      border-radius: 39.81px;
      background: #ffcc00;
      color: #725d42;
      font: inherit;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
      box-shadow: 0 5px 0 #d4a800;
      transition: transform .15s, box-shadow .15s;
    }
    .home-actions button.secondary {
      background: rgb(247,243,223);
      color: #725d42;
      border-color: rgba(114,93,66,.3);
      box-shadow: 0 5px 0 #e0d0b0;
    }
    .home-actions button:hover {
      transform: translateY(-2px);
      box-shadow: 0 7px 0 #d4a800;
    }
    .home-actions button.secondary:hover {
      box-shadow: 0 7px 0 #e0d0b0;
      background: #fffbee;
    }
    .home-actions button:active {
      transform: translateY(3px);
      box-shadow: 0 2px 0 #d4a800;
    }
    .home-actions button.secondary:active {
      box-shadow: 0 2px 0 #e0d0b0;
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
      min-height: 220px;
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
      animation: cloud-drift var(--scene-cloud-drift-duration) ease-in-out infinite alternate;
    }
    .island-scene::before { width: 150px; height: 42px; left: 9%; top: 12%; }
    .island-scene::after { width: 108px; height: 34px; right: 12%; top: 20%; animation-delay: var(--scene-cloud-late-delay); }
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
      animation: island-bob var(--scene-island-bob-duration) ease-in-out infinite;
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
      animation: page-settle var(--motion-page-settle-duration) ease both;
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
      padding: 10px 22px;
      border: 2px solid rgba(114, 93, 66, .25);
      border-radius: 39.81px;
      background: rgb(247,243,223);
      color: #725d42;
      font: inherit;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: .04em;
      cursor: pointer;
      box-shadow: 0 4px 0 #e0d0b0;
      transition: transform .15s, box-shadow .15s, background .15s;
    }
    .page-controls button:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #e0d0b0; }
    .page-controls button:active {
      transform: translateY(2px);
      box-shadow: 0 2px 0 #e0d0b0;
    }
    .page-controls button.active {
      background: #ffcc00;
      border-color: #d4a800;
      box-shadow: 0 4px 0 #d4a800;
      color: #725d42;
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
        min-height: auto;
      }
      .journal-stage::before {
        inset: -12px -8px 12px;
        border-radius: 32px;
      }
      .spread {
        gap: 8px;
      }
      .page {
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
    /* Accountability badge */
    .accountability-badge {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 20px;
      border-radius: 20px;
      background: rgba(255, 249, 233, .88);
      border: 1px solid rgba(121, 79, 39, .14);
      box-shadow: 0 4px 0 rgba(213, 169, 110, .16);
      position: relative;
      z-index: 1;
      margin-bottom: 10px;
    }
    .accountability-score {
      width: 56px;
      height: 56px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      font: 900 22px/1 "SFMono-Regular", Menlo, monospace;
      color: #fff;
      flex-shrink: 0;
    }
    .verdict-accountable .accountability-score { background: #19c8b9; box-shadow: 0 4px 0 #0fa898; }
    .verdict-partial .accountability-score { background: #f5c31c; color: #725d42; box-shadow: 0 4px 0 #d4a800; }
    .verdict-unaccounted .accountability-score { background: #e05a5a; box-shadow: 0 4px 0 #b83838; }
    .accountability-verdict {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .06em;
    }
    .accountability-label {
      display: block;
      font-size: 11px;
      font-weight: 600;
      color: var(--muted);
      letter-spacing: .04em;
      margin-top: 2px;
    }

    /* Progress card grid */
    .progress-card-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
    }
    .progress-card {
      display: grid;
      grid-template-columns: 32px 1fr auto;
      align-items: center;
      gap: 4px 10px;
      padding: 10px 14px;
      border-radius: 18px;
      background: rgb(247,243,223);
      border: 2px solid #e8dcc8;
      border-left: 5px solid var(--moss);
      box-shadow: 0 2px 0 #e0d0b0;
      transition: transform .2s, box-shadow .2s;
      animation: fadeSlideIn .35s cubic-bezier(.34,1.56,.64,1) both;
      animation-delay: var(--delay, 0ms);
    }
    .progress-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 0 #e0d0b0;
    }
    .progress-card:nth-child(6n+1) { border-left-color: #82d5bb; }
    .progress-card:nth-child(6n+2) { border-left-color: #889df0; }
    .progress-card:nth-child(6n+3) { border-left-color: #f8a6b2; }
    .progress-card:nth-child(6n+4) { border-left-color: #f7cd67; }
    .progress-card:nth-child(6n+5) { border-left-color: #e59266; }
    .progress-card:nth-child(6n+6) { border-left-color: #8ac68a; }
    @keyframes fadeSlideIn { from { opacity: 0; transform: translateX(-8px) scale(.97); } }
    .progress-card-num {
      grid-row: 1 / 3;
      align-self: center;
      text-align: center;
      color: var(--muted);
      font: 700 13px/1 "SFMono-Regular", Menlo, monospace;
      opacity: .6;
    }
    .progress-card strong {
      font-size: 14px;
      font-weight: 700;
      color: var(--ink);
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .progress-card p {
      grid-column: 2;
      margin: 0;
      font-size: 12px;
      color: var(--muted);
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .progress-card-badge {
      grid-row: 1 / 3;
      align-self: center;
      padding: 2px 7px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .progress-card.status-pass { border-left-color: var(--moss); }
    .progress-card.status-fail { border-left-color: #c45; }
    .progress-card.status-unknown { border-left-color: var(--amber); }
    .progress-card.status-pass .progress-card-badge { background: var(--meadow); color: #2d5a27; }
    .progress-card.status-fail .progress-card-badge { background: #fce4e4; color: #a33; }
    .progress-card.status-unknown .progress-card-badge { background: var(--field); color: #8a6d2d; }

    /* Proof list */
    .proof-list {
      list-style: none;
      padding: 0;
      margin: 12px 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .proof-list-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      color: #634d31;
      line-height: 1.3;
    }
    .stamp-inline {
      flex-shrink: 0;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .06em;
    }
    .stamp-inline.status-pass { background: var(--meadow); color: #2d5a27; }
    .stamp-inline.status-fail { background: #fce4e4; color: #a33; }
    .stamp-inline.status-unknown { background: var(--field); color: #8a6d2d; }

    /* AI analysis sections */
    .ai-insights, .ai-risks {
      margin: 12px 0 0;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.4;
    }
    .ai-insights { background: rgba(79, 146, 108, .1); }
    .ai-risks { background: rgba(201, 120, 75, .1); }
    .ai-insights h4, .ai-risks h4 {
      margin: 0 0 6px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .08em;
    }
    .ai-insights h4 { color: var(--moss); }
    .ai-risks h4 { color: var(--clay); }
    .ai-insights ul, .ai-risks ul {
      margin: 0;
      padding-left: 16px;
    }
    .ai-insights li, .ai-risks li {
      color: var(--ink);
      margin-bottom: 3px;
    }

    }

    /* ---- Animal Crossing / island-ui enhancements ---- */

    /* NPC dialog box (organic blob shape) */
    .npc-dialog {
      clip-path: url(#animal-dialog-clip);
      background: rgb(247, 243, 223);
      padding: 32px 36px 28px;
      margin: 16px 0;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.6;
      color: #8a7b66;
      animation: animal-zoom-in 0.3s ease;
    }
    .npc-dialog-inner {
      max-width: 58ch;
    }
    @keyframes animal-zoom-in {
      from { opacity: 0; transform: scale(0.92); }
      to { opacity: 1; transform: scale(1); }
    }

    /* Typewriter effect for NPC dialog text */
    .typewriter-text {
      overflow: hidden;
    }
    .typewriter-cursor::after {
      content: "\\25CB";
      animation: blink 1s step-end infinite;
      color: var(--moss);
    }
    @keyframes blink { 50% { opacity: 0; } }

    /* Progress card color cycling (Animal Crossing pastel palette) */
    .progress-card:nth-child(6n+1) { border-left-color: #82d5bb; }
    .progress-card:nth-child(6n+2) { border-left-color: #889df0; }
    .progress-card:nth-child(6n+3) { border-left-color: #f8a6b2; }
    .progress-card:nth-child(6n+4) { border-left-color: #f7cd67; }
    .progress-card:nth-child(6n+5) { border-left-color: #e59266; }
    .progress-card:nth-child(6n+6) { border-left-color: #8ac68a; }

    /* Accountability badge teal accent for ACCOUNTABLE */
    .verdict-accountable .accountability-score { background: #19c8b9; }
    .verdict-accountable .accountability-verdict { color: #19c8b9; }
    .verdict-partial .accountability-verdict { color: var(--clay); }
    .verdict-unaccounted .accountability-verdict { color: #c45; }

    /* Proof cards with Animal Crossing pastel backgrounds */
    .proof-card.passed,
    .proof-card.pass {
      background: rgba(130, 213, 187, .18);
      border: 2px solid #82d5bb;
      border-radius: 20px;
    }
    .proof-card.unknown {
      background: rgba(247, 205, 103, .18);
      border: 2px solid #f7cd67;
      border-radius: 20px;
    }
    .proof-card.failed,
    .proof-card.blocked {
      background: rgba(248, 166, 178, .18);
      border: 2px solid #f8a6b2;
      border-radius: 20px;
    }

    /* Page controls: pill-shaped Animal Crossing buttons */
    .page-controls button {
      border-radius: 39.81px;
      border: 2px solid rgba(114, 93, 66, 0.3);
      box-shadow: 0 4px 0 var(--button-shadow), 0 10px 18px rgba(91, 63, 32, .10);
      transition: all 0.2s;
    }
    .page-controls button:hover {
      border-color: rgba(114, 93, 66, 0.6);
      transform: translateY(-1px);
    }
    .page-controls button:active {
      box-shadow: 0 2px 0 var(--button-shadow), 0 6px 12px rgba(91, 63, 32, .08);
      transform: translateY(2px);
    }
    .page-controls button.active {
      border-color: #19c8b9;
      box-shadow: 0 4px 0 #0f8f86, 0 10px 18px rgba(29, 190, 176, .18);
    }

    /* Game-style session footer */
    .session-footer {
      text-align: center;
      padding: 24px 16px 32px;
      color: #8a7b66;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: .04em;
    }
    .session-footer-line {
      display: inline-block;
      padding: 8px 20px;
      border: 2px solid #e8dcc8;
      border-radius: 24px;
      background: rgba(247, 243, 223, .8);
      box-shadow: 0 3px 10px 0 rgba(61, 52, 40, 0.1);
    }
  </style>
</head>
<body>
  <svg style="position:absolute;width:0;height:0" aria-hidden="true">
    <clipPath id="animal-dialog-clip" clipPathUnits="objectBoundingBox">
      <path d="M0.501,0.005 L0.501,0.005 L0.523,0.005 L0.549,0.006 C0.704,0.01,0.796,0.017,0.825,0.027 L0.827,0.028 C0.872,0.045,0.939,0.044,0.978,0.17 C1,0.254,1,0.365,0.99,0.505 L0.988,0.513 C0.979,0.558,0.971,0.598,0.965,0.633 C0.956,0.689,0.979,0.77,0.964,0.865 C0.953,0.928,0.921,0.966,0.869,0.979 C0.821,0.986,0.773,0.992,0.726,0.995 L0.712,0.996 L0.694,0.997 C0.648,1,0.586,1,0.507,1 L0.501,1 L0.464,1 C0.385,1,0.325,0.998,0.283,0.995 C0.234,0.992,0.184,0.987,0.133,0.979 C0.081,0.966,0.05,0.928,0.039,0.865 C0.023,0.77,0.047,0.689,0.037,0.633 C0.031,0.595,0.023,0.552,0.013,0.505 C-0.006,0.365,-0.002,0.254,0.024,0.17 C0.064,0.045,0.13,0.045,0.174,0.028 L0.175,0.028 C0.204,0.017,0.303,0.009,0.474,0.005 L0.501,0.005"/>
    </clipPath>
  </svg>
  <main class="journal-shell" data-template-contract="${DASHBOARD_TEMPLATE_CONTRACT}" data-dynamic-surface="${DASHBOARD_DYNAMIC_SURFACE}">
    <header class="journal-top">
      <span>${escapeHtml(locale.headerProgressMap)}</span>
      <span>${escapeHtml(graph.platform)}</span>
      <span>${escapeHtml(locale.headerGeneratedAt)} ${escapeHtml(graph.generated_at)}</span>
    </header>
    <section class="journal-stage" aria-live="polite">
      <div class="book-spine" aria-hidden="true"></div>
      <div class="turn-page" aria-hidden="true"></div>
      <section class="spread active home-spread" data-spread="0">
        <article class="page left home-copy">
          <div>
          <div class="page-kicker"><span>${escapeHtml(locale.kickerJournal)}</span><span>${escapeHtml(locale.kickerCleanRoom)}</span></div>
          <h1 class="home-title"><span>${escapeHtml(locale.homeTitleLine1)}</span><span>${escapeHtml(locale.homeTitleLine2)}</span><span>${escapeHtml(locale.homeTitleLine3)}</span></h1>
          <div class="npc-dialog">
            <span class="npc-speaker">${locale.lang === "en" ? "DoneGraph" : "DoneGraph"}</span>
            <p class="story typewriter-text" id="npc-story-text">${escapeHtml(graph.ai_analysis?.story ?? dashboardNarrativeFor(graph, locale))}</p>
${graph.ai_analysis?.insights?.length ? `<div class="ai-insights"><h4>${locale.lang === "en" ? "Insights" : "洞察"}</h4><ul>${graph.ai_analysis.insights.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul></div>` : ""}
${graph.ai_analysis?.risks?.length ? `<div class="ai-risks"><h4>${locale.lang === "en" ? "Risks" : "风险"}</h4><ul>${graph.ai_analysis.risks.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul></div>` : ""}
          </div>
          <div class="home-actions">
            <button type="button" data-jump="1">${escapeHtml(locale.flipToCompleted)}</button>
            <button class="secondary" type="button" data-jump="${evidenceSpread}">${escapeHtml(locale.seeEvidence)}</button>
          </div>
          </div>
          <div class="soft-note">${escapeHtml(blockerText)}</div>
        </article>
        <article class="page right home-map">
          <div class="page-kicker"><span>${escapeHtml(locale.todayProgress)}</span><span>${milestoneProgress} ${escapeHtml(locale.milestonesLabel)}</span></div>
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
            <div class="progress-orb" aria-label="${escapeHtml(locale.headerProgressMap)} ${graph.summary.progress_percent}%"><strong>${graph.summary.progress_percent}%</strong><span>${escapeHtml(locale.progressDone)}</span></div>
            <p class="progress-caption">${escapeHtml(locale.homeProgressCaption(milestoneProgress, localizeStage(graph.summary.current_stage, locale)))}</p>
          </div>
          <div class="accountability-badge verdict-${graph.accountability.verdict.toLowerCase()}" aria-label="Accountability: ${graph.accountability.verdict}">
            <span class="accountability-score">${graph.accountability.composite}</span>
            <div>
              <span class="accountability-verdict">${graph.accountability.verdict}</span>
              <span class="accountability-label">Accountability Score</span>
            </div>
          </div>
          <div class="home-stat-strip">
            <div class="home-stat"><span>${escapeHtml(locale.statMilestones)}</span><strong>${milestoneProgress}</strong></div>
            <div class="home-stat"><span>${escapeHtml(locale.statVerified)}</span><strong>${graph.summary.evidence_passed}</strong></div>
            <div class="home-stat"><span>${escapeHtml(locale.statBlockers)}</span><strong>${graph.summary.blockers}</strong></div>
          </div>
        </article>
      </section>

      ${progressSpreads}

      <section class="spread" data-spread="${evidenceSpread}">
        <article class="page left">
          <div class="page-kicker"><span>${escapeHtml(locale.kickerEvidence)}</span><span>${escapeHtml(locale.kickerVerificationState)}</span></div>
          <h2>${escapeHtml(locale.evidenceCards)}</h2>
          <section class="proof-grid">${evidenceCards || `<p class="soft-note">${escapeHtml(locale.noEvidenceRecorded)}</p>`}</section>
        </article>
        <article class="page right">
          <div class="page-kicker"><span>${escapeHtml(locale.kickerNextPage)}</span><span>${escapeHtml(locale.kickerHandoff)}</span></div>
          <h2>${escapeHtml(locale.continueFromHere)}</h2>
          <ul class="ledger-list">${nextSteps}</ul>
          <p class="footer-note">${escapeHtml(locale.handoffFooterNote)}</p>
        </article>
      </section>

      <section class="spread" data-spread="${detailSpread}">
        <article class="page left">
          <div class="page-kicker"><span>${escapeHtml(locale.kickerCleanRoomStructure)}</span><span>${escapeHtml(locale.kickerDetail)}</span></div>
          <h2>${escapeHtml(locale.cleanRoomStructure)}</h2>
          <p class="soft-note">${escapeHtml(locale.schemaPurpose)}</p>
          <div class="badge-list">${schemaLabels}</div>
          <h3>${escapeHtml(locale.sourceRecords)}</h3>
          <ul class="ledger-list">${sources || `<li>${escapeHtml(locale.noSourceRecords)}</li>`}</ul>
        </article>
        <article class="page right">
          <div class="page-kicker"><span>${escapeHtml(locale.kickerRelationshipTrace)}</span><span>${escapeHtml(locale.kickerOptional)}</span></div>
          <h2>${escapeHtml(locale.relationshipTrace)}</h2>
          <ul class="ledger-list edge-list">${relationshipTrace || `<li>${escapeHtml(locale.noRelationshipEdges)}</li>`}</ul>
          <h3>${escapeHtml(locale.achievementLedger)}</h3>
          <ul class="ledger-list">${achievements || `<li>${escapeHtml(locale.noAchievements)}</li>`}</ul>
        </article>
      </section>
    </section>
    <nav class="page-controls" aria-label="${escapeHtml(locale.navAriaLabel)}">
      <button class="active" type="button" data-target="0">${escapeHtml(locale.navProgress)}</button>
      <button type="button" data-target="1">${escapeHtml(locale.navCompleted)}</button>
      <button type="button" data-target="${evidenceSpread}">${escapeHtml(locale.navEvidence)}</button>
      <button type="button" data-target="${detailSpread}">${escapeHtml(locale.navDetail)}</button>
    </nav>
  </main>
  <script>
    const pageSwitchDelayMs = ${DASHBOARD_PAGE_SWITCH_DELAY_MS};
    const pageTurnDurationMs = ${DASHBOARD_PAGE_TURN_DURATION_MS};
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
      const switchTimer = window.setTimeout(() => setActiveSpread(target), pageSwitchDelayMs);
      turnTimers.push(switchTimer);
      turnTimers.push(window.setTimeout(() => {
        journalStage?.classList.remove("turning", "turning-forward", "turning-backward");
      }, pageTurnDurationMs));
    }
    buttons.forEach((button) => {
      button.addEventListener("click", () => showSpread(button.dataset.target || "0"));
    });
    jumpButtons.forEach((button) => {
      button.addEventListener("click", () => showSpread(button.dataset.jump || "0"));
    });

    // Typewriter effect for NPC dialog
    const storyEl = document.getElementById("npc-story-text");
    if (storyEl) {
      const fullText = storyEl.textContent || "";
      storyEl.textContent = "";
      storyEl.classList.add("typewriter-cursor");
      let i = 0;
      const tw = setInterval(() => {
        storyEl.textContent = fullText.slice(0, ++i);
        if (i >= fullText.length) {
          clearInterval(tw);
          storyEl.classList.remove("typewriter-cursor");
        }
      }, 28);
    }

    // Bounce animation on progress cards when entering view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = "running";
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".progress-card").forEach((card) => {
      card.style.animationPlayState = "paused";
      observer.observe(card);
    });
  </script>
</body>
</html>`;
}
