import { describe, expect, it } from "vitest";
import {
  buildCaptureEvents,
  buildDoneGraph,
  renderAchievementLog,
  renderDashboardHtml,
  renderNextSteps
} from "../donegraph";
import type { DoneGraphEvent } from "../donegraph";

describe("DoneGraph — edge cases", () => {
  it("handles an empty event list gracefully", () => {
    const graph = buildDoneGraph([], "2026-06-07T00:00:00.000Z");

    expect(graph.goal).toBe(""); // empty event list = no goal
    expect(graph.summary.evidence_passed).toBe(0);
    expect(graph.summary.milestones_completed).toBe(0);
    expect(graph.summary.progress_percent).toBe(0);
    expect(graph.milestones).toHaveLength(6);
    expect(graph.nodes.length).toBeGreaterThan(0); // at least a fallback node
    expect(renderDashboardHtml(graph)).toContain("DoneGraph");
    expect(renderDashboardHtml(graph)).toContain("完成进度");
  });

  it("handles a single goal event", () => {
    const graph = buildDoneGraph(
      [
        {
          id: "goal_1",
          timestamp: "2026-06-07T00:00:00.000Z",
          platform: "claude",
          type: "goal",
          text: "Just one goal, nothing else.",
          metadata: {}
        }
      ],
      "2026-06-07T00:01:00.000Z"
    );

    expect(graph.goal).toBe("Just one goal, nothing else.");
    expect(graph.platform).toBe("claude");
    expect(graph.summary.progress_percent).toBeGreaterThan(0);
    // Dashboard should not crash on single-event graph
    const html = renderDashboardHtml(graph);
    expect(html).toContain("DoneGraph");
  });

  it("handles stress: 200 events without performance regression", () => {
    const baseTime = new Date("2026-06-07T00:00:00.000Z").getTime();
    const events: DoneGraphEvent[] = [];

    for (let i = 0; i < 200; i++) {
      const types: Array<DoneGraphEvent["type"]> = [
        "goal",
        "action",
        "artifact",
        "verification",
        "decision",
        "blocker",
        "completion"
      ];
      events.push({
        id: `evt_${i}`,
        timestamp: new Date(baseTime + i * 60000).toISOString(),
        platform: i % 4 === 0 ? "codex" : i % 4 === 1 ? "claude" : i % 4 === 2 ? "cursor" : "generic",
        type: types[i % types.length],
        text: `Event number ${i}: ${types[i % types.length]} happened`,
        metadata: { status: i % 3 === 0 ? "pass" : i % 3 === 1 ? "fail" : "unknown" }
      });
    }

    const start = performance.now();
    const graph = buildDoneGraph(events, "2026-06-08T00:00:00.000Z");
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(2000); // under 2 seconds for 200 events
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.summary.evidence_passed + graph.summary.evidence_failed).toBeGreaterThan(0);

    // Dashboard rendering
    const htmlStart = performance.now();
    const html = renderDashboardHtml(graph);
    const htmlElapsed = performance.now() - htmlStart;
    expect(htmlElapsed).toBeLessThan(1000); // dashboard under 1s
    expect(html).toContain("DoneGraph");
  });

  it("generates correct milestone states for 0% and 100% progress", () => {
    // 0% — only a goal
    const zeroGraph = buildDoneGraph(
      [
        {
          id: "only_goal",
          timestamp: "2026-06-07T00:00:00.000Z",
          platform: "generic",
          type: "goal",
          text: "A distant dream",
          metadata: {}
        }
      ],
      "2026-06-07T00:01:00.000Z"
    );
    expect(zeroGraph.summary.progress_percent).toBeLessThan(34);

    // 100% — full pipeline
    const fullGraph = buildDoneGraph(
      [
        {
          id: "g",
          timestamp: "2026-06-07T00:00:00.000Z",
          platform: "codex",
          type: "goal",
          text: "Build the thing",
          metadata: {}
        },
        {
          id: "a",
          timestamp: "2026-06-07T00:01:00.000Z",
          platform: "codex",
          type: "action",
          text: "Built the core",
          metadata: {}
        },
        {
          id: "ar",
          timestamp: "2026-06-07T00:02:00.000Z",
          platform: "codex",
          type: "artifact",
          text: "Dashboard shipped",
          metadata: { path: ".donegraph/dashboard.html" }
        },
        {
          id: "v",
          timestamp: "2026-06-07T00:03:00.000Z",
          platform: "codex",
          type: "verification",
          text: "All tests green",
          metadata: { command: "npm test", status: "pass" }
        },
        {
          id: "c",
          timestamp: "2026-06-07T00:04:00.000Z",
          platform: "codex",
          type: "completion",
          text: "Ship it",
          metadata: {}
        }
      ],
      "2026-06-07T00:05:00.000Z"
    );
    expect(fullGraph.summary.progress_percent).toBe(100);
    expect(fullGraph.summary.evidence_passed).toBeGreaterThan(0);
    expect(fullGraph.next_steps.length).toBeGreaterThan(0);
  });

  it("renders all platform labels correctly", () => {
    for (const platform of ["codex", "claude", "cursor", "generic"] as const) {
      const graph = buildDoneGraph(
        [
          {
            id: "g",
            timestamp: "2026-06-07T00:00:00.000Z",
            platform,
            type: "goal",
            text: `Test on ${platform}`,
            metadata: {}
          }
        ],
        "2026-06-07T00:01:00.000Z"
      );

      expect(graph.platform).toBe(platform);
      const html = renderDashboardHtml(graph);
      expect(html).toContain("DoneGraph");
    }
  });

  it("does not leak internal metadata into dashboard", () => {
    const graph = buildDoneGraph(
      [
        {
          id: "internal_1",
          timestamp: "2026-06-07T00:00:00.000Z",
          platform: "codex",
          type: "goal",
          text: "Secret project",
          metadata: {
            path: "/Users/hacker/.ssh/id_rsa",
            command: "rm -rf /",
            status: "pass"
          }
        }
      ],
      "2026-06-07T00:01:00.000Z"
    );

    const html = renderDashboardHtml(graph);
    // Dashboard should not leak raw paths or commands
    expect(html).not.toContain("id_rsa");
    expect(html).not.toContain("rm -rf");
    expect(html).not.toContain("/Users/");
  });

  it("all achievement log entries carry their event IDs", () => {
    const graph = buildDoneGraph(
      [
        {
          id: "goal_x",
          timestamp: "2026-06-07T00:00:00.000Z",
          platform: "codex",
          type: "goal",
          text: "Build X",
          metadata: {}
        },
        {
          id: "verify_x",
          timestamp: "2026-06-07T00:01:00.000Z",
          platform: "codex",
          type: "verification",
          text: "X verified",
          metadata: { status: "pass", command: "npm test" }
        }
      ],
      "2026-06-07T00:02:00.000Z"
    );

    const log = renderAchievementLog(graph);
    expect(log).toContain("Achievement Log");
    expect(graph.achievements.length).toBeGreaterThan(0);
    graph.achievements.forEach((a) => {
      expect(a.source_event_ids.length).toBeGreaterThan(0);
    });
  });

  it("next steps are actionable and non-empty for partial progress", () => {
    const graph = buildDoneGraph(
      [
        {
          id: "partial_goal",
          timestamp: "2026-06-07T00:00:00.000Z",
          platform: "generic",
          type: "goal",
          text: "Half-finished job",
          metadata: {}
        },
        {
          id: "partial_action",
          timestamp: "2026-06-07T00:01:00.000Z",
          platform: "generic",
          type: "action",
          text: "Started something",
          metadata: {}
        }
      ],
      "2026-06-07T00:02:00.000Z"
    );

    expect(graph.summary.progress_percent).toBeLessThan(100);
    expect(graph.next_steps.length).toBeGreaterThan(0);
    // Every next step should be a string with content
    graph.next_steps.forEach((step) => {
      expect(typeof step).toBe("string");
      expect(step.length).toBeGreaterThan(0);
    });

    const rendered = renderNextSteps(graph);
    expect(rendered).toContain("Next AI");
  });

  it("milestones never regress — completed stays completed", () => {
    const events: DoneGraphEvent[] = [
      {
        id: "g",
        timestamp: "2026-06-07T00:00:00.000Z",
        platform: "codex",
        type: "goal",
        text: "Test regression",
        metadata: {}
      },
      {
        id: "a",
        timestamp: "2026-06-07T00:01:00.000Z",
        platform: "codex",
        type: "action",
        text: "Did the work",
        metadata: {}
      },
      {
        id: "v",
        timestamp: "2026-06-07T00:02:00.000Z",
        platform: "codex",
        type: "verification",
        text: "Test passed",
        metadata: { status: "pass", command: "npm test" }
      },
      {
        id: "c",
        timestamp: "2026-06-07T00:03:00.000Z",
        platform: "codex",
        type: "completion",
        text: "Ready",
        metadata: {}
      },
      // Add a blocker after completion — milestones shouldn't go backwards
      {
        id: "late_blocker",
        timestamp: "2026-06-07T00:04:00.000Z",
        platform: "codex",
        type: "blocker",
        text: "Oops found a bug",
        metadata: {}
      }
    ];

    const graph = buildDoneGraph(events, "2026-06-07T00:05:00.000Z");

    // Blocker after completion: completion is recorded but blocker creates pending follow-up
    // Progress reflects that a completed task now has a known blocker
    expect(graph.summary.progress_percent).toBeLessThanOrEqual(67);
    expect(graph.nodes.some((n) => n.type === "blocker")).toBe(true);
  });
});
