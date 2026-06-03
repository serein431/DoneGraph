import type { DoneGraphPlatform } from "./donegraph.js";

export type VibeCraftRegistrationScope =
  | "local.skills.read"
  | "donegraph.read"
  | "public_profile.write"
  | "completion_proof.write";

export interface VibeCraftRegistrationInput {
  builderName: string;
  handle: string;
  role: string;
  intro: string;
  sourceAgent?: DoneGraphPlatform;
  authorizedScopes?: VibeCraftRegistrationScope[];
  issuedAt?: string;
}

export interface VibeCraftSkillSeed {
  id: string;
  label: string;
  level: number;
}

export interface VibeCraftRegistrationProof {
  schema_version: "vibecraft.registration.v1";
  profile_handle: string;
  builder_name: string;
  role: string;
  public_intro: string;
  source_agent: DoneGraphPlatform;
  authorization_code: string;
  authorized_scopes: VibeCraftRegistrationScope[];
  initial_level: "Village Pass L1";
  skill_seeds: VibeCraftSkillSeed[];
  issued_at: string;
}

export interface VibeCraftCompletionProof {
  schema_version: "vibecraft.proof.v1";
  source_agent: DoneGraphPlatform;
  profile_handle: string;
  status: "ready_to_sync" | "synced" | "needs_review";
  unlocked: string[];
  counts: {
    knowledge_blocks: number;
    skill_signals: number;
    public_works: number;
  };
}

export interface VibeCraftValidationResult {
  ok: boolean;
  reason?: string;
}

const defaultScopes: VibeCraftRegistrationScope[] = [
  "local.skills.read",
  "donegraph.read",
  "public_profile.write",
  "completion_proof.write"
];

function checksum(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
}

export function normalizeVibeCraftHandle(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "happy-builder"
  );
}

export function buildVibeCraftAuthCode(handle: string, issuedAt = "2026-06-03T00:00:00.000Z"): string {
  const normalized = normalizeVibeCraftHandle(handle);
  const compactHandle = normalized.toUpperCase().replace(/-/g, "");
  return `VC-AUTH-${compactHandle}-${checksum(`${normalized}:${issuedAt}`)}`;
}

export function buildVibeCraftRegistrationProof(input: VibeCraftRegistrationInput): VibeCraftRegistrationProof {
  const issuedAt = input.issuedAt ?? "2026-06-03T00:00:00.000Z";
  const profileHandle = normalizeVibeCraftHandle(input.handle);
  const sourceAgent = input.sourceAgent ?? "codex";
  return {
    schema_version: "vibecraft.registration.v1",
    profile_handle: profileHandle,
    builder_name: input.builderName.trim() || "Happy Builder",
    role: input.role.trim() || "Knowledge Explorer",
    public_intro: input.intro.trim() || "I turn strange build traces into useful little knowledge blocks.",
    source_agent: sourceAgent,
    authorization_code: buildVibeCraftAuthCode(profileHandle, issuedAt),
    authorized_scopes: input.authorizedScopes?.length ? input.authorizedScopes : defaultScopes,
    initial_level: "Village Pass L1",
    skill_seeds: [
      { id: "plain-language-translation", label: "Plain-language translation", level: 2 },
      { id: "agent-direction", label: "Agent direction", level: 1 },
      { id: "knowledge-crafting", label: "Knowledge crafting", level: 2 }
    ],
    issued_at: issuedAt
  };
}

export function buildVibeCraftRegistrationPrompt(input: VibeCraftRegistrationInput): string {
  const proof = buildVibeCraftRegistrationProof(input);
  return [
    "You are registering my VibeCraft profile.",
    "Only read local skills and project traces I explicitly authorize.",
    "IMPORTANT OUTPUT RULE: Reply with ONLY the VC-AUTH code on the first line, or ONLY the JSON proof. Do not explain.",
    `Builder name: ${proof.builder_name}`,
    `Village ID: ${proof.profile_handle}`,
    `Role: ${proof.role}`,
    `Public intro: ${proof.public_intro}`,
    `Authorized scopes: ${proof.authorized_scopes.join(", ")}`,
    `Fast path response: ${proof.authorization_code}`,
    "Alternative: return a vibecraft.registration.v1 JSON proof with this shape:",
    JSON.stringify(proof, null, 2)
  ].join("\n");
}

export function validateVibeCraftRegistrationProof(
  proof: Partial<VibeCraftRegistrationProof>,
  expectedHandle?: string
): VibeCraftValidationResult {
  if (proof.schema_version !== "vibecraft.registration.v1") return { ok: false, reason: "Unsupported schema version." };
  if (!proof.profile_handle) return { ok: false, reason: "Missing profile_handle." };
  if (expectedHandle && normalizeVibeCraftHandle(proof.profile_handle) !== normalizeVibeCraftHandle(expectedHandle)) {
    return { ok: false, reason: "Profile handle does not match the registration challenge." };
  }
  if (!proof.authorization_code?.startsWith("VC-AUTH-")) return { ok: false, reason: "Missing authorization code." };
  if (proof.authorization_code !== buildVibeCraftAuthCode(proof.profile_handle, proof.issued_at)) {
    return { ok: false, reason: "Authorization code does not match the registration challenge." };
  }
  if (!proof.authorized_scopes?.includes("donegraph.read")) {
    return { ok: false, reason: "Agent proof must include donegraph.read scope." };
  }
  if (!proof.skill_seeds?.length) return { ok: false, reason: "Missing initial skill seeds." };
  return { ok: true };
}
