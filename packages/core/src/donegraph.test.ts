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

describe("DoneGraph core", () => {
  it("builds a graph with achievements, evidence, and handoff steps", () => {
    const graph = buildDoneGraph(events, "2026-05-28T00:04:00.000Z");

    expect(graph.goal).toBe("做一个 AI 协作进度图谱");
    expect(graph.platform).toBe("codex");
    expect(graph.summary.evidence_passed).toBe(1);
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

  it("renders markdown and static dashboard artifacts", () => {
    const graph = buildDoneGraph(events, "2026-05-28T00:04:00.000Z");

    expect(renderAchievementLog(graph)).toContain("DoneGraph Achievement Log");
    expect(renderNextSteps(graph)).toContain("Give This To The Next AI");
    expect(renderDashboardHtml(graph)).toContain("Done Task Map");
    expect(renderDashboardHtml(graph)).toContain("<span>DoneGraph</span><span>Progress</span><span>Journal</span>");
    expect(renderDashboardHtml(graph)).toContain("Collected Progress");
    expect(renderDashboardHtml(graph)).toContain("data-target=\"1\">Finished");
    expect(renderDashboardHtml(graph)).toContain("Clean-room Schema");
    expect(renderDashboardHtml(graph)).toContain("verified_by");
    expect(renderDashboardHtml(graph)).toContain("Generated 2026-05-28T00:04:00.000Z");
  });

  it("uses clean-room collaboration edges instead of code graph relationships", () => {
    const graph = buildDoneGraph(events, "2026-05-28T00:04:00.000Z");

    expect(graph.edges.map((edge) => edge.label)).toEqual(
      expect.arrayContaining(["belongs_to_goal", "produced", "verified_by", "continues_as"])
    );
    expect(graph.edges.map((edge) => edge.label)).not.toEqual(expect.arrayContaining(["imports", "calls"]));
    expect(graph.schema.purpose).toContain("AI collaboration progress");
  });

  it("builds automatic context capture events without external graph input", () => {
    const captured = buildCaptureEvents({
      platform: "codex",
      goal: "Ship standalone DoneGraph",
      projectName: "donegraph-workspace",
      changedFiles: ["packages/core/src/donegraph.ts", "apps/cli/src/cli.ts"],
      packageScripts: ["test", "typecheck", "build"],
      existingEvents: [],
      now: () => "2026-05-28T00:05:00.000Z",
      uuid: () => "capture"
    });

    expect(captured.map((event) => event.type)).toEqual(["goal", "action", "artifact", "verification"]);
    expect(captured[1]?.metadata.source).toBe("clean-room-capture");
    expect(captured[2]?.text).toContain("2 个本地改动文件");
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
    expect(html).toContain("Relationship Trace");
    expect(html).toContain("belongs_to_goal");
  });
});
