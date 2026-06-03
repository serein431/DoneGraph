import { describe, expect, it } from "vitest";
import {
  buildVibeCraftAuthCode,
  buildVibeCraftRegistrationPrompt,
  buildVibeCraftRegistrationProof,
  normalizeVibeCraftHandle,
  validateVibeCraftRegistrationProof
} from "./vibecraft";

describe("VibeCraft registration proof", () => {
  it("normalizes public handles for username.vibecraft.bio routes", () => {
    expect(normalizeVibeCraftHandle("  Happy Builder!! ")).toBe("happy-builder");
    expect(normalizeVibeCraftHandle("")).toBe("happy-builder");
  });

  it("builds a deterministic Agent registration proof", () => {
    const proof = buildVibeCraftRegistrationProof({
      builderName: "Mina",
      handle: "Mina Lab",
      role: "Knowledge Explorer",
      intro: "I build with Agents.",
      sourceAgent: "codex",
      issuedAt: "2026-06-03T00:00:00.000Z"
    });

    expect(proof).toMatchObject({
      schema_version: "vibecraft.registration.v1",
      profile_handle: "mina-lab",
      builder_name: "Mina",
      initial_level: "Village Pass L1",
      source_agent: "codex"
    });
    expect(proof.authorization_code).toBe(buildVibeCraftAuthCode("mina-lab", "2026-06-03T00:00:00.000Z"));
    expect(proof.authorized_scopes).toContain("donegraph.read");
    expect(proof.skill_seeds.map((seed) => seed.id)).toContain("knowledge-crafting");
  });

  it("validates registration proofs against the current challenge", () => {
    const proof = buildVibeCraftRegistrationProof({
      builderName: "Mina",
      handle: "Mina Lab",
      role: "Knowledge Explorer",
      intro: "I build with Agents."
    });

    expect(validateVibeCraftRegistrationProof(proof, "mina-lab")).toEqual({ ok: true });
    expect(validateVibeCraftRegistrationProof({ ...proof, profile_handle: "other" }, "mina-lab")).toMatchObject({
      ok: false
    });
    expect(validateVibeCraftRegistrationProof({ ...proof, authorized_scopes: ["public_profile.write"] })).toMatchObject({
      ok: false
    });
  });

  it("renders the copyable Agent registration prompt", () => {
    const prompt = buildVibeCraftRegistrationPrompt({
      builderName: "Mina",
      handle: "Mina Lab",
      role: "Knowledge Explorer",
      intro: "I build with Agents."
    });

    expect(prompt).toContain("You are registering my VibeCraft profile.");
    expect(prompt).toContain("vibecraft.registration.v1");
    expect(prompt).toContain("VC-AUTH-MINALAB");
  });
});

