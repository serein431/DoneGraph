import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runDoneGraphCli } from "./cli";
import { readDoneGraphEvents } from "./donegraphStorage";

function tempWorkspace(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "donegraph-cli-"));
}

describe("donegraph CLI", () => {
  it("starts a session and writes the artifact contract", async () => {
    const workspace = tempWorkspace();
    const output: string[] = [];

    const code = await runDoneGraphCli(["start", "Ship hackathon demo", "--platform", "codex"], {
      cwd: workspace,
      write: (line) => output.push(line),
      now: () => "2026-05-28T00:00:00.000Z",
      uuid: () => "goal"
    });

    expect(code).toBe(0);
    expect(readDoneGraphEvents(workspace)[0]).toMatchObject({
      type: "goal",
      platform: "codex",
      text: "Ship hackathon demo"
    });
    expect(fs.existsSync(path.join(workspace, ".donegraph", "session.jsonl"))).toBe(true);
    expect(fs.existsSync(path.join(workspace, ".donegraph", "task-graph.json"))).toBe(true);
    expect(fs.existsSync(path.join(workspace, ".donegraph", "dashboard.html"))).toBe(true);
    expect(output.join("\n")).toContain("DoneGraph started");
  });

  it("accepts the slash-command friendly shortcut syntax", async () => {
    const workspace = tempWorkspace();

    await runDoneGraphCli(["start", "Ship", "a", "clean", "plugin", "--platform=codex"], {
      cwd: workspace,
      write: () => undefined,
      now: () => "2026-05-28T00:00:00.000Z",
      uuid: () => "goal"
    });
    await runDoneGraphCli(["checkpoint", "Implemented", "installer", "--command", "npm test"], {
      cwd: workspace,
      write: () => undefined,
      now: () => "2026-05-28T00:01:00.000Z",
      uuid: () => "action"
    });
    await runDoneGraphCli(["proof", "Tests passed", "--pass", "--command", "npm test"], {
      cwd: workspace,
      write: () => undefined,
      now: () => "2026-05-28T00:02:00.000Z",
      uuid: () => "proof"
    });
    await runDoneGraphCli(["done", "Ready for demo"], {
      cwd: workspace,
      write: () => undefined,
      now: () => "2026-05-28T00:03:00.000Z",
      uuid: () => "done"
    });

    expect(readDoneGraphEvents(workspace)).toMatchObject([
      { type: "goal", text: "Ship a clean plugin", platform: "codex" },
      { type: "action", text: "Implemented installer", metadata: { command: "npm test" } },
      { type: "verification", text: "Tests passed", metadata: { command: "npm test", status: "pass" } },
      { type: "completion", text: "Ready for demo" }
    ]);
  });

  it("accepts positional record type and text", async () => {
    const workspace = tempWorkspace();

    await runDoneGraphCli(["record", "decision", "Use slash commands as the primary UX"], {
      cwd: workspace,
      write: () => undefined,
      now: () => "2026-05-28T00:00:00.000Z",
      uuid: () => "decision"
    });

    expect(readDoneGraphEvents(workspace)[0]).toMatchObject({
      type: "decision",
      text: "Use slash commands as the primary UX"
    });
  });

  it("records verification and prints a summary", async () => {
    const workspace = tempWorkspace();
    const output: string[] = [];

    await runDoneGraphCli(["start", "Build task graph", "--platform", "claude"], {
      cwd: workspace,
      write: () => undefined,
      now: () => "2026-05-28T00:00:00.000Z",
      uuid: () => "goal"
    });
    await runDoneGraphCli(
      [
        "record",
        "--type",
        "verification",
        "--text",
        "Tests passed",
        "--status",
        "pass",
        "--command",
        "npm test"
      ],
      {
        cwd: workspace,
        write: () => undefined,
        now: () => "2026-05-28T00:01:00.000Z",
        uuid: () => "verify"
      }
    );
    const code = await runDoneGraphCli(["summary"], {
      cwd: workspace,
      write: (line) => output.push(line),
      now: () => "2026-05-28T00:02:00.000Z"
    });

    expect(code).toBe(0);
    expect(output.join("\n")).toContain("Build task graph");
    expect(output.join("\n")).toContain("Next steps:");
    expect(fs.readFileSync(path.join(workspace, ".donegraph", "achievement-log.md"), "utf8")).toContain(
      "验证：npm test"
    );
  });

  it("builds a dashboard without opening it when requested", async () => {
    const workspace = tempWorkspace();
    const output: string[] = [];
    let opened = false;

    await runDoneGraphCli(["start", "Dashboard demo"], {
      cwd: workspace,
      write: () => undefined,
      now: () => "2026-05-28T00:00:00.000Z",
      uuid: () => "goal"
    });
    const code = await runDoneGraphCli(["dashboard", "--no-open"], {
      cwd: workspace,
      write: (line) => output.push(line),
      openFile: () => {
        opened = true;
      }
    });

    expect(code).toBe(0);
    expect(opened).toBe(false);
    expect(output.join("\n")).toContain("dashboard.html");
  });

  it("auto-captures project context into DoneGraph events", async () => {
    const workspace = tempWorkspace();
    fs.writeFileSync(
      path.join(workspace, "package.json"),
      JSON.stringify({ name: "demo-donegraph", scripts: { test: "vitest run", build: "tsc" } }, null, 2)
    );
    fs.mkdirSync(path.join(workspace, "src"));
    fs.writeFileSync(path.join(workspace, "src", "index.ts"), "export const ok = true;\n");
    const output: string[] = [];

    const code = await runDoneGraphCli(["capture", "--goal", "Make AI work visible", "--platform", "codex"], {
      cwd: workspace,
      write: (line) => output.push(line),
      now: () => "2026-05-28T00:05:00.000Z",
      uuid: () => "capture"
    });

    const events = readDoneGraphEvents(workspace);
    expect(code).toBe(0);
    expect(events.map((event) => event.type)).toEqual(["goal", "action", "artifact", "verification"]);
    expect(events.every((event) => event.metadata.source === "clean-room-capture" || event.type === "goal")).toBe(true);
    expect(output.join("\n")).toContain("Captured 4 context events");
    expect(fs.readFileSync(path.join(workspace, ".donegraph", "task-graph.json"), "utf8")).toContain(
      "belongs_to_goal"
    );
  });
});
