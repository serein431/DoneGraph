import { describe, expect, it } from "vitest";
import { buildCaptureEvents, buildDoneGraph, renderAchievementLog, renderDashboardHtml, renderNextSteps } from "./donegraph";
import type { DoneGraphEvent } from "./donegraph";

const events: DoneGraphEvent[] = [
  {
    id: "evt_goal",
    timestamp: "2026-05-28T00:00:00.000Z",
    platform: "codex",
    type: "goal",
    text: "做一个 AI 协作进度图谱",
    metadata: {}
  },
  {
    id: "evt_action",
    timestamp: "2026-05-28T00:01:00.000Z",
    platform: "codex",
    type: "action",
    text: "实现 DoneGraph CLI",
    metadata: { command: "npm run build" }
  },
  {
    id: "evt_artifact",
    timestamp: "2026-05-28T00:02:00.000Z",
    platform: "codex",
    type: "artifact",
    text: "生成静态看板",
    metadata: { path: ".donegraph/dashboard.html" }
  },
  {
    id: "evt_verify",
    timestamp: "2026-05-28T00:03:00.000Z",
    platform: "codex",
    type: "verification",
    text: "类型检查通过",
    metadata: { command: "npm run typecheck", status: "pass" }
  }
];

function extractTagBody(html: string, tag: "script" | "style"): string {
  return html.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1] ?? "";
}

describe("DoneGraph core", () => {
  it("builds a graph with achievements, evidence, and handoff steps", () => {
    const graph = buildDoneGraph(events, "2026-05-28T00:04:00.000Z");

    expect(graph.goal).toBe("做一个 AI 协作进度图谱");
    expect(graph.platform).toBe("codex");
    expect(graph.summary.evidence_passed).toBe(1);
    expect(graph.summary.milestones_total).toBe(6);
    expect(graph.summary.milestones_completed).toBe(4);
    expect(graph.summary.current_stage).toBe("演示还差收尾");
    expect(graph.summary.progress_percent).toBe(67);
    expect(graph.milestones.map((milestone) => milestone.title)).toEqual([
      "目标已确定",
      "实现已启动",
      "产物已出现",
      "证据已收集",
      "演示已可用",
      "交接已清楚"
    ]);
    expect(graph.milestones.find((milestone) => milestone.id === "demo_ready")).toMatchObject({
      status: "unknown",
      detail: "还需要一条阶段完成记录，把进度变成可演示成果。"
    });
    expect(graph.achievements.map((item) => item.title)).toContain("验证：npm run typecheck");
    expect(graph.nodes.some((node) => node.type === "next_step")).toBe(true);
    expect(graph.narrative).toContain("下一步");
  });

  it("turns failed evidence into the next handoff step", () => {
    const graph = buildDoneGraph([
      ...events,
      {
        id: "evt_failed",
        timestamp: "2026-05-28T00:04:00.000Z",
        platform: "codex",
        type: "verification",
        text: "移动端 Dashboard 文本溢出",
        metadata: { status: "fail" }
      }
    ]);

    expect(graph.next_steps[0]).toContain("先修复失败验证");
    expect(graph.summary.evidence_failed).toBe(1);
  });

  it("keeps similar verification progress pages distinct", () => {
    const graph = buildDoneGraph([
      ...events,
      {
        id: "evt_auto_verify",
        timestamp: "2026-05-28T00:04:00.000Z",
        platform: "codex",
        type: "verification",
        text: "真实运行验证命令并通过：npm test",
        metadata: { command: "npm test", status: "pass", source: "capture-verify" }
      },
      {
        id: "evt_manual_verify",
        timestamp: "2026-05-28T00:05:00.000Z",
        platform: "codex",
        type: "verification",
        text: "关键流程检查已经通过",
        metadata: { command: "npm test", status: "pass" }
      }
    ]);

    const html = renderDashboardHtml(graph);

    expect(html).toContain("自动检查跑过核心流程");
    expect(html).toContain("手动证明已经补上");
    expect(html).toContain("自动验证已经帮你扫过");
    expect(html).toContain("这条手动证明");
  });

  it("makes right-side progress pages tell different completion stories", () => {
    const graph = buildDoneGraph([
      {
        id: "evt_goal",
        timestamp: "2026-05-28T00:00:00.000Z",
        platform: "codex",
        type: "goal",
        text: "做一个能看见 AI 协作进度的黑客松演示",
        metadata: {}
      },
      {
        id: "evt_scan",
        timestamp: "2026-05-28T00:01:00.000Z",
        platform: "codex",
        type: "action",
        text: "自动扫描 donegraph-workspace 的本地上下文，生成协作进度起点。",
        metadata: {}
      },
      {
        id: "evt_journal",
        timestamp: "2026-05-28T00:02:00.000Z",
        platform: "codex",
        type: "action",
        text: "生成可以翻看的进度手账首页",
        metadata: {}
      },
      {
        id: "evt_demo",
        timestamp: "2026-05-28T00:03:00.000Z",
        platform: "codex",
        type: "completion",
        text: "演示现在能展示完成进度、验证证据和下一步交接",
        metadata: {}
      }
    ]);

    const html = renderDashboardHtml(graph);
    expect(html).toContain("progress-card-grid");
    expect(html).toContain("progress-card");
    const cardTitles = Array.from(
      html.matchAll(/<article class="progress-card[^"]*"[^>]*>.*?<strong>([^<]+)<\/strong>/g),
      (match) => match[1]
    );
    expect(cardTitles.length).toBeGreaterThanOrEqual(3);
    expect(html).toContain("整理协作起点");
    expect(html).toContain("做出可翻看的手账首页");
    expect(html).toContain("完成演示接力");
  });

  it("keeps the journal scene and motion deterministic while copy changes", () => {
    const firstGraph = buildDoneGraph(events, "2026-05-28T00:04:00.000Z");
    const secondGraph = buildDoneGraph(
      events.map((event, index) => ({
        ...event,
        id: `${event.id}_alt`,
        text: [`整理一次新的协作目标`, `推进另一段体验打磨`, `留下另一份可交付成果`, `另一条检查已经通过`][index] ?? event.text
      })),
      "2026-05-28T00:04:00.000Z"
    );

    const firstHtml = renderDashboardHtml(firstGraph);
    const secondHtml = renderDashboardHtml(secondGraph);

    expect(extractTagBody(firstHtml, "style")).toBe(extractTagBody(secondHtml, "style"));
    expect(firstHtml).toContain('<meta name="donegraph-template-contract" content="fixed-journal-scene-v1" />');
    expect(firstHtml).toContain('<meta name="donegraph-dynamic-surface" content="copy-only-v1" />');
    expect(firstHtml).toContain('data-template-contract="fixed-journal-scene-v1"');
    expect(firstHtml).toContain('data-dynamic-surface="copy-only-v1"');
    expect(firstHtml).toContain("--motion-page-turn-duration: .86s;");
    expect(firstHtml).toContain("--motion-page-settle-duration: .56s;");
    expect(firstHtml).toContain("--scene-cloud-drift-duration: 8s;");
    expect(firstHtml).toContain("--scene-island-bob-duration: 5s;");
    expect(extractTagBody(firstHtml, "script")).not.toMatch(/Math\.random|Date\.now|crypto\./);
    expect(extractTagBody(firstHtml, "style")).not.toMatch(/Math\.random|Date\.now|crypto\./);
  });

  it("renders markdown and static dashboard artifacts", () => {
    const graph = buildDoneGraph(events, "2026-05-28T00:04:00.000Z");

    expect(renderAchievementLog(graph)).toContain("DoneGraph Achievement Log");
    expect(renderNextSteps(graph)).toContain("Give This To The Next AI");
    expect(renderDashboardHtml(graph)).toContain("完成进度地图");
    expect(renderDashboardHtml(graph)).toContain("<span>DoneGraph</span><span>进度岛</span><span>手账</span>");
    expect(renderDashboardHtml(graph)).toContain("翻到完成页");
    expect(renderDashboardHtml(graph)).toContain("journalStage?.classList.add(\"turning\", `turning-${direction}`)");
    expect(renderDashboardHtml(graph)).toContain("<div class=\"book-spine\" aria-hidden=\"true\"></div>");
    expect(renderDashboardHtml(graph)).toContain("<div class=\"turn-page\" aria-hidden=\"true\"></div>");
    expect(renderDashboardHtml(graph)).toContain("const pageSwitchDelayMs = 220;");
    expect(renderDashboardHtml(graph)).toContain("window.setTimeout(() => setActiveSpread(target), pageSwitchDelayMs);");
    expect(renderDashboardHtml(graph)).toContain("overflow: visible;");
    expect(renderDashboardHtml(graph)).toContain("display: none;");
    expect(renderDashboardHtml(graph)).toContain("<div class=\"home-progress-row\">");
    expect(renderDashboardHtml(graph)).not.toContain("</div>\n            <div class=\"progress-orb\" aria-label=\"完成进度");
    expect(renderDashboardHtml(graph)).toContain("class=\"spread progress-spread\"");
    expect(renderDashboardHtml(graph)).toContain("data-progress-page=\"1\"");
    expect(renderDashboardHtml(graph)).not.toContain("achievement-list");
    expect(renderDashboardHtml(graph)).not.toContain("npm test");
    expect(renderDashboardHtml(graph)).not.toContain("npm run");
    expect(renderDashboardHtml(graph)).not.toContain("path=");
    expect(renderDashboardHtml(graph)).not.toContain(".donegraph");
    expect(renderDashboardHtml(graph)).not.toContain("<code>");
    expect(renderDashboardHtml(graph)).toContain("4 / 6 个里程碑");
    expect(renderDashboardHtml(graph)).toContain("演示还差收尾");
    expect(renderDashboardHtml(graph)).toContain("这一页完成了什么");
    expect(renderDashboardHtml(graph)).toContain("方向已经落到纸上");
    expect(renderDashboardHtml(graph)).toContain("核心流程已经推进");
    expect(renderDashboardHtml(graph)).toContain("可以打开的成果已经出现");
    expect(renderDashboardHtml(graph)).toContain("类型结构已经稳住");
    expect(renderDashboardHtml(graph)).not.toContain("这一页只保留对人有用的答案");
    expect(renderDashboardHtml(graph)).not.toContain("packages/core");
    expect(renderDashboardHtml(graph)).toContain("data-target=\"1\">完成");
    expect(renderDashboardHtml(graph)).toContain("洁净室结构");
    expect(renderDashboardHtml(graph)).toContain("verified_by");
    expect(renderDashboardHtml(graph)).toContain("生成于 2026-05-28T00:04:00.000Z");
  });

  it("uses clean-room collaboration edges instead of code graph relationships", () => {
    const graph = buildDoneGraph(events, "2026-05-28T00:04:00.000Z");

    expect(graph.edges.map((edge) => edge.label)).toEqual(
      expect.arrayContaining(["belongs_to_goal", "produced", "verified_by", "continues_as"])
    );
    expect(graph.edges.map((edge) => edge.label)).not.toEqual(expect.arrayContaining(["imports", "calls"]));
    expect(graph.schema.purpose).toContain("accountability graph");
  });

  it("builds automatic context capture events without external graph input", () => {
    const captured = buildCaptureEvents({
      platform: "codex",
      goal: "Ship standalone DoneGraph",
      projectName: "donegraph-workspace",
      changedFiles: ["packages/core/src/donegraph.ts", "packages/core/src/donegraph.test.ts", "README.md"],
      packageScripts: ["test", "typecheck", "build"],
      existingEvents: [],
      now: () => "2026-05-28T00:05:00.000Z",
      uuid: () => "capture"
    });

    expect(captured.map((event) => event.type)).toEqual(["goal", "action", "artifact", "verification"]);
    expect(captured[1]?.metadata.source).toBe("clean-room-capture");
    expect(captured[2]?.text).toContain("功能实现 1 个");
    expect(captured[2]?.text).toContain("验证补强 1 个");
    expect(captured[2]?.text).toContain("产品说明 1 个");
    expect(captured[3]?.metadata.status).toBe("unknown");
  });

  it("surfaces capture sources and relationship labels in the dashboard", () => {
    const graph = buildDoneGraph(
      buildCaptureEvents({
        platform: "codex",
        goal: "Make progress visible",
        projectName: "donegraph-workspace",
        changedFiles: ["README.md"],
        packageScripts: ["test"],
        existingEvents: [],
        now: () => "2026-05-28T00:05:00.000Z",
        uuid: () => "capture"
      }),
      "2026-05-28T00:06:00.000Z"
    );

    const html = renderDashboardHtml(graph);

    expect(html).toContain("clean-room-capture");
    expect(html).toContain("关系线索");
    expect(html).toContain("belongs_to_goal");
    expect(html).not.toContain("npm test");
    expect(html).not.toContain("npm run");
  });
});
