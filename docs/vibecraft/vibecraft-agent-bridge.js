/* VibeCraft Agent Bridge v0.1
 * Local-first bridge for plugin installation and Agent receipt sync.
 * It stores only profile snapshots and receipts in browser localStorage.
 */
(function attachVibeCraftAgentBridge(global) {
  "use strict";

  const manifest = {
  "schema_version": "vibecraft.plugin.v1",
  "id": "vibecraft.local-skill-seed",
  "name": "Local Skill Seed",
  "version": "0.1.0",
  "display_name": {
    "en": "Local Skill Seed",
    "zh": "本地技能种子"
  },
  "install_surface": "web_local_first",
  "storage_keys": {
    "profile": "vibecraft:onboarding",
    "registration_proof": "vibecraft:registration-proof",
    "plugin_installation": "vibecraft:plugin-installation",
    "agent_receipt": "vibecraft:agent-receipt"
  },
  "permissions": [
    {
      "id": "skills.read_index",
      "label": "Read local Skill index",
      "scope": "local_read",
      "required": true,
      "plain": "只读取 Skill 名称、描述和入口，不读取原始隐私内容。"
    },
    {
      "id": "donegraph.read_receipt",
      "label": "Read DoneGraph completion drop",
      "scope": "local_read",
      "required": true,
      "plain": "读取 .donegraph/vibecraft.json 里的完成小票，用来生成成长状态。"
    },
    {
      "id": "profile.write_snapshot",
      "label": "Write public profile snapshot",
      "scope": "local_write",
      "required": true,
      "plain": "只写入浏览器本地身份卡、初始等级和可展示标签。"
    },
    {
      "id": "agent.write_receipt",
      "label": "Let Agent write completion drop",
      "scope": "agent_write",
      "required": true,
      "plain": "Agent 做完任务后写入标准完成凭证，Web 端再同步解锁。"
    },
    {
      "id": "brain.user_grant_key",
      "label": "User-granted Vibe Brain key",
      "scope": "user_grant",
      "required": false,
      "plain": "未来由用户生成 key，决定哪个 Agent 可以下载哪部分 Vibe Brain。"
    }
  ],
  "agent_entrypoints": {
    "local_receipt_file": ".donegraph/vibecraft.json",
    "browser_bridge": "/vibecraft-agent-bridge.js",
    "static_registration_example": "/agent-registration.example.json",
    "static_receipt_example": "/agent-receipt.example.json",
    "future_http_target": "POST /api/vibecraft/receipts"
  },
  "registration_contract": {
    "schema_version": "vibecraft.registration.v1",
    "default_issued_at": "2026-06-03T00:00:00.000Z",
    "required_fields": [
      "schema_version",
      "profile_handle",
      "builder_name",
      "role",
      "public_intro",
      "source_agent",
      "authorization_code",
      "authorized_scopes",
      "initial_level",
      "skill_seeds",
      "issued_at"
    ],
    "required_scope": "donegraph.read"
  },
  "receipt_contract": {
    "schema_version": "vibecraft.receipt.v1",
    "required_fields": [
      "schema_version",
      "id",
      "source_agent",
      "generated_at",
      "unlocked_pack_ids",
      "payload_counts",
      "starter_attributes"
    ],
    "accepted_event_types": [
      "goal",
      "action",
      "artifact",
      "verification",
      "completion"
    ]
  },
  "safety": {
    "raw_files_uploaded": false,
    "user_can_revoke": true,
    "note": "Local-first by default. Generated for codex; raw files stay in the user's workspace until the user grants a future cloud or Agent key."
  }
};
  const demoReceipt = {
  "schema_version": "vibecraft.receipt.v1",
  "id": "receipt_2026_06_02T13_45_13_767Z",
  "source_agent": "codex",
  "generated_at": "2026-06-02T13:45:13.767Z",
  "workspace_hint": ".donegraph/vibecraft.json",
  "profile_handle": null,
  "event_types": [
    "goal",
    "action",
    "artifact",
    "verification",
    "completion"
  ],
  "unlocked_pack_ids": [
    "pack_first_build",
    "pack_proof_miner",
    "pack_exploration_mine",
    "pack_crafting_table",
    "pack_brain_growth",
    "pack_village_match"
  ],
  "payload_counts": {
    "drops": 73,
    "knowledge_blocks": 73,
    "craft_cards": 3,
    "verified": 9,
    "achievements": 63
  },
  "starter_attributes": [
    {
      "id": "attr_happy_build",
      "label": "Happy Build",
      "level": 5,
      "max_level": 5,
      "evidence": "完成信号：63",
      "source_skill_id": "skill_happy_build"
    },
    {
      "id": "attr_trust_check",
      "label": "证据判断",
      "level": 5,
      "max_level": 5,
      "evidence": "验证记录：18",
      "source_skill_id": "skill_trust_check"
    },
    {
      "id": "attr_demo_memory",
      "label": "Demo 记忆点",
      "level": 4,
      "max_level": 5,
      "evidence": "记录中出现可爱/游戏/展示信号",
      "source_skill_id": "skill_demo_memory"
    },
    {
      "id": "attr_agent_command",
      "label": "Agent 指挥",
      "level": 3,
      "max_level": 5,
      "evidence": "记录中出现 Agent 或编码工具信号",
      "source_skill_id": "skill_agent_command"
    }
  ],
  "community_patch": {
    "starter_level": 5,
    "badges": [
      "首个 Build 包",
      "可信证据包",
      "知识矿洞包",
      "我懂了卡包",
      "Vibe Brain 包",
      "互补邀请包"
    ]
  },
  "proof": {
    "receipt_path": ".donegraph/vibecraft.json",
    "signature_hint": "Local demo uses unsigned completion drops; production should sign receipt.id + generated_at + payload hash."
  }
};
  const storageKeys = manifest.storage_keys;
  const registrationContract = manifest.registration_contract;
  const registrationScopes = [
    "local.skills.read",
    "donegraph.read",
    "public_profile.write",
    "completion_proof.write"
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function readJson(key, fallback) {
    try {
      const raw = global.localStorage && global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      if (!global.localStorage) return false;
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function checksum(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
  }

  function normalizeHandle(value) {
    return (
      (value || "")
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 32) || "happy-builder"
    );
  }

  function buildAuthCode(handle, issuedAt) {
    const safeHandle = normalizeHandle(handle);
    const safeIssuedAt = issuedAt || registrationContract.default_issued_at;
    return "VC-AUTH-" + safeHandle.toUpperCase().replace(/-/g, "") + "-" + checksum(safeHandle + ":" + safeIssuedAt);
  }

  function registrationSkillSeeds() {
    return [
      { id: "plain-language-translation", label: "Plain-language translation", level: 2 },
      { id: "agent-direction", label: "Agent direction", level: 1 },
      { id: "knowledge-crafting", label: "Knowledge crafting", level: 2 }
    ];
  }

  function createRegistrationProof(input) {
    const patch = input || {};
    const issuedAt = patch.issued_at || patch.issuedAt || registrationContract.default_issued_at;
    const handle = normalizeHandle(patch.profile_handle || patch.handle);
    const scopes = Array.isArray(patch.authorized_scopes)
      ? patch.authorized_scopes
      : Array.isArray(patch.authorizedScopes)
        ? patch.authorizedScopes
        : registrationScopes;
    const skillSeeds = Array.isArray(patch.skill_seeds) && patch.skill_seeds.length
      ? patch.skill_seeds
      : registrationSkillSeeds();
    return {
      schema_version: registrationContract.schema_version,
      profile_handle: handle,
      builder_name: (patch.builder_name || patch.builderName || "").trim() || "Happy Builder",
      role: (patch.role || "").trim() || "Knowledge Explorer",
      public_intro: (patch.public_intro || patch.intro || "").trim() || "I turn strange build traces into useful little knowledge blocks.",
      source_agent: String(patch.source_agent || patch.sourceAgent || "codex").trim(),
      authorization_code: buildAuthCode(handle, issuedAt),
      authorized_scopes: scopes,
      initial_level: "Village Pass L1",
      skill_seeds: skillSeeds,
      issued_at: issuedAt
    };
  }

  function createRegistrationCommand(input) {
    const proof = createRegistrationProof(input);
    return [
      "You are registering my VibeCraft profile.",
      "Only read local skills and project traces I explicitly authorize.",
      "IMPORTANT OUTPUT RULE: Reply with ONLY the VC-AUTH code on the first line, or ONLY the JSON proof. Do not explain.",
      "Builder name: " + proof.builder_name,
      "Village ID: " + proof.profile_handle,
      "Role: " + proof.role,
      "Public intro: " + proof.public_intro,
      "Authorized scopes: " + proof.authorized_scopes.join(", "),
      "Fast path response: " + proof.authorization_code,
      "Alternative: return a vibecraft.registration.v1 JSON proof with this shape:",
      JSON.stringify(proof, null, 2)
    ].join("\n");
  }

  function validateRegistrationProof(proof, expectedHandle) {
    if (!proof || typeof proof !== "object") return { ok: false, reason: "agentProofInvalidJson" };
    if (proof.schema_version !== registrationContract.schema_version) return { ok: false, reason: "agentProofInvalidSchema" };
    const missing = registrationContract.required_fields.filter((field) => {
      const value = proof[field];
      return value == null || value === "" || (Array.isArray(value) && value.length === 0);
    });
    if (missing.length) return { ok: false, reason: "agentProofInvalidSchema", missing };
    const handle = normalizeHandle(proof.profile_handle || "");
    if (expectedHandle && handle !== normalizeHandle(expectedHandle)) return { ok: false, reason: "agentProofHandleMismatch" };
    const issuedAt = typeof proof.issued_at === "string" && proof.issued_at ? proof.issued_at : registrationContract.default_issued_at;
    if (proof.authorization_code !== buildAuthCode(handle, issuedAt)) return { ok: false, reason: "agentProofAuthMismatch" };
    if (!Array.isArray(proof.authorized_scopes) || !proof.authorized_scopes.includes(registrationContract.required_scope)) {
      return { ok: false, reason: "agentProofScopeMissing" };
    }
    if (!Array.isArray(proof.skill_seeds) || proof.skill_seeds.length < 1) return { ok: false, reason: "agentProofSeedsMissing" };
    return { ok: true, proof: { ...proof, profile_handle: handle, issued_at: issuedAt } };
  }

  function writeRegistrationProof(proof, expectedHandle) {
    const checked = validateRegistrationProof(proof, expectedHandle);
    if (!checked.ok) return checked;
    return {
      ok: writeJson(storageKeys.registration_proof, checked.proof),
      proof: checked.proof
    };
  }

  function readRegistrationProof() {
    return readJson(storageKeys.registration_proof, null);
  }

  function validateReceipt(receipt) {
    const missing = manifest.receipt_contract.required_fields.filter((field) => {
      return receipt == null || receipt[field] == null;
    });
    const valid =
      receipt &&
      receipt.schema_version === manifest.receipt_contract.schema_version &&
      Array.isArray(receipt.unlocked_pack_ids) &&
      receipt.payload_counts &&
      typeof receipt.payload_counts === "object";
    return {
      ok: Boolean(valid && missing.length === 0),
      missing,
      schema_version: receipt && receipt.schema_version
    };
  }

  function createReceipt(input) {
    const receipt = clone(demoReceipt);
    const patch = input || {};
    receipt.generated_at = patch.generated_at || new Date().toISOString();
    if (typeof patch.id === "string") receipt.id = patch.id;
    if (typeof patch.source_agent === "string") receipt.source_agent = patch.source_agent;
    if (typeof patch.profile_handle === "string") receipt.profile_handle = patch.profile_handle;
    return receipt;
  }

  function readProfile() {
    return readJson(storageKeys.profile, {});
  }

  function writeProfile(profile) {
    return writeJson(storageKeys.profile, profile);
  }

  function installPlugin(input) {
    const profile = readProfile();
    const now = new Date().toISOString();
    const installation = {
      schema_version: "vibecraft.plugin-installation.v1",
      manifest_id: manifest.id,
      installed_at: now,
      permissions: manifest.permissions.map((permission) => permission.id),
      profile_handle: input && input.profile_handle ? input.profile_handle : profile.handle || null,
      installed: true,
      status: "installed"
    };
    const nextProfile = {
      ...profile,
      plugin_installed: true,
      plugin_manifest_id: manifest.id,
      plugin_installed_at: now,
      starter_confirmed: true,
      starter_attributes: clone(demoReceipt.starter_attributes),
      saved_at: now
    };
    writeJson(storageKeys.plugin_installation, installation);
    writeProfile(nextProfile);
    return { installation, profile: nextProfile };
  }

  function writeReceipt(receipt) {
    const checked = validateReceipt(receipt);
    if (!checked.ok) return { ok: false, validation: checked };
    return {
      ok: writeJson(storageKeys.agent_receipt, receipt),
      validation: checked,
      receipt
    };
  }

  function readReceipt() {
    return readJson(storageKeys.agent_receipt, null);
  }

  function applyReceipt(input) {
    const receipt = input || readReceipt() || createReceipt();
    const written = writeReceipt(receipt);
    if (!written.ok) return written;
    const now = new Date().toISOString();
    const profile = readProfile();
    const unlocked = Array.from(new Set(["pack_identity_seed", ...receipt.unlocked_pack_ids]));
    const nextProfile = {
      ...profile,
      plugin_installed: true,
      plugin_manifest_id: manifest.id,
      starter_confirmed: true,
      agent_synced: true,
      synced_receipt_id: receipt.id,
      starter_attributes: clone(receipt.starter_attributes || []),
      unlocked_packs: unlocked,
      agent_receipt_applied_at: now,
      saved_at: now
    };
    writeProfile(nextProfile);
    return {
      ok: true,
      validation: written.validation,
      receipt,
      profile: nextProfile
    };
  }

  global.VibeCraftAgentBridge = {
    manifest,
    storageKeys,
    normalizeHandle,
    buildAuthCode,
    createRegistrationProof,
    createRegistrationCommand,
    validateRegistrationProof,
    writeRegistrationProof,
    readRegistrationProof,
    createReceipt,
    validateReceipt,
    installPlugin,
    writeReceipt,
    readReceipt,
    applyReceipt,
    readProfile,
    writeProfile
  };
})(globalThis);
