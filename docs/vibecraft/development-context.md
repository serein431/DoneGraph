# VibeCraft Development Context

Last updated: 2026-06-03

This file records the durable product context for VibeCraft so future Agent work does not depend on chat memory.

## Current Status

- Product name: VibeCraft
- Chinese name: 灵感工坊
- Domain: https://vibecraft.bio
- Deployment status: live on Vercel. A header check on 2026-06-03 returned HTTP 200.
- Active repo branch: `codex/vibecraft-wiki-prototype` (legacy branch name; current restored UI is the live front-stage/workshop style)
- Product PRD: `docs/vibecraft/PRD.md` (updated from the original `vibecraft-prd.pdf` v0.1 source on 2026-06-04)
- Durable prototype: `docs/vibecraft/index.html`
- Generated product view: `.donegraph/vibecraft.html`

## Records Found

- Git commit `9e598b4 Add VibeCraft wiki prototype` added the first durable VibeCraft prototype to the original DoneGraph repo.
- The production site at `https://vibecraft.bio/` preserved a stronger front-stage and workshop version. On 2026-06-03, those live static artifacts were restored into `docs/vibecraft/` as the current design baseline.
- `README.md` and `READMEs/README.zh-CN.md` now point to the VibeCraft prototype.
- The original PRD was provided as `vibecraft-prd.pdf` and extracted into `docs/vibecraft/PRD.md`; preserve its 24-section structure when updating product requirements.
- A temporary earlier prototype workspace under `/tmp` is no longer present, so the stable source of truth is this repository, the restored production artifacts, and this context file.
- A local recovery copy also exists at `/Users/k/Documents/清客送/vibecraft/index.html`, but the original repo should be treated as the product repo.

## Product Positioning

VibeCraft is a public identity and learning layer for AI-era builders.

DoneGraph records what a human and an Agent did together. VibeCraft translates that record into a game-like, readable public profile: identity, skills, drops, public works, collaboration signals, and a portable Vibe Brain.

The core feeling is:

> Knowledge enters my head in a cute, strange, and understandable form.

The product should feel like "Build for Fun, Create for Happy" without becoming childish or unserious.

## Target Users

- Non-technical or semi-technical vibe-coding users who build with Codex, Claude Code, Cursor, or similar Agents.
- Creators who want their AI-assisted works to become a public identity instead of scattered chat logs.
- Hackathon builders and indie makers who need progress, proof, and collaboration signals to be legible.
- Users who value emotional reward and playful learning, but still expect a serious product surface.

## Aha Moment

The user gives a task to an Agent. The Agent finishes work and uploads a verified proof. The web profile updates automatically:

- a skill improves,
- a module unlocks,
- a drop appears,
- a public work is added,
- the user's community card becomes clearer,
- another builder can understand what this person is good at and invite them to collaborate.

The user does not need to read raw logs to feel progress.

## Core Loop

1. User visits the front stage and understands the world.
2. User chooses a public handle, for example `happy-builder.vibecraft.bio`.
3. Registration is Agent-only: the user copies an instruction into their Agent.
4. The Agent reads only authorized local context and returns a registration proof or authorization code.
5. The web side verifies the code and creates the user's initial Village Pass.
6. During later work, the Agent uploads completion proofs.
7. VibeCraft translates those proofs into skills, packs, drops, public works, radio notes, and Vibe Brain updates.

## Interaction Direction

The main visual and interaction reference is a cute voxel sandbox front stage plus an exploratory workshop. The live site is the design baseline.

Use these cues:

- bright voxel blocks,
- chunky borders and hard shadows,
- playful but legible hero copy,
- avatar and role selection,
- growth packs and receipt-driven unlocks,
- Vibe Bio as the public identity surface,
- voxel-like characters and world objects,
- progress as world activity, for example a task becomes a tree and the avatar chops it as development progresses.

Do not use official game assets. Do not show legal or asset disclaimers on the product page unless required by a release/legal page.

## Product Surfaces

- Front stage: explains the world, public handles, public works, and why VibeCraft exists.
- Workshop: profile editing, avatar, role, skills, drops, Agent receipts, and Vibe Brain state.
- Public bio: `username.vibecraft.bio`, showing the user's works, intro, role, skill tree, and collaboration signals.
- Community: people appear as character cards with levels, skill packs, and complementary collaboration invitations.
- Agent bridge: copyable command, registration proof, completion proof upload, sync status, and unlock rules.
- Vibe Radio: converts progress into short, ambient, emotionally rewarding updates.
- Vibe Brain: user-controlled portable memory layer. Users hold the download key and can grant scoped Agent access.

## Expression Rules

The product copy must sound complete, rigorous, and public-facing.

Use:

- "Agent registration"
- "completion proof"
- "public profile"
- "skill pack"
- "collaboration signal"
- "portable memory"
- "verified progress"

Avoid:

- rough internal phrases from planning notes
- exposing PRD or internal documents on the product page
- explaining too much implementation detail to normal users
- putting disclaimers about Minecraft or official assets in visible marketing UI

## Current Implementation Notes

- `docs/vibecraft/index.html` is a standalone prototype that demonstrates Agent-only registration, public handle updates, proof sync, Vibe Radio, and Vibe Brain.
- Agent-only registration now has a durable MVP contract: `vibecraft.registration.v1`, deterministic `VC-AUTH-*` codes, authorized scopes, initial skill seeds, and proof validation helpers in `packages/core/src/vibecraft.ts`.
- `docs/vibecraft/index.html` and `docs/vibecraft/vibecraft-demo.html` were restored from the live site and should be treated as the current product experience.
- `docs/vibecraft/vibecraft-demo.html` now mirrors the Agent-only registration loop in the workshop: copy an Agent command, paste the returned `vibecraft.registration.v1` proof, verify the deterministic authorization code, then unlock the initial Village Pass and identity seed pack.
- `docs/vibecraft/vibecraft-demo.html` now starts with a real Phaser-powered playable world instead of a static map: the player can move, select world locations, chop the Goal Tree, collect drops, play Vibe Radio, and open Vibe Lens.
- The playable world now reads the saved Village Pass state from `vibecraft:onboarding`: unregistered visitors can explore Spawn, Radio, and Vibe Lens, while Goal Tree, Knowledge Mine, Crafting Table, Brain Vault, and Village collaboration unlock only after Agent proof verification.
- The live world HUD includes a Stardew-like Daybook layer that shows pass status, Goal Tree health, collected drops, and the latest world event note. The game can open the Agent registration region directly through `vibecraft:open-register`.
- Vibe Radio is now a real in-world module with stations, dynamic episode text, a radio log, waveform animation, and Daybook recaps generated from profile/pass state, Goal Tree progress, and collected drops.
- Agent registration must tolerate common Agent return shapes: a plain `VC-AUTH` code, a code broken by whitespace/newlines, or a JSON proof. Bare auth codes should validate against stable registration challenge candidates instead of failing after harmless page state changes.
- Agent registration accepts both common Agent return formats: a plain/natural-language `VC-AUTH-*` authorization code or a fenced/full `vibecraft.registration.v1` JSON proof. Pasting the original command back into the proof field is rejected with a clear user-facing message.
- `docs/vibecraft/vibecraft-agent-bridge.js` now exposes the same Agent registration contract for browser/plugin integration: `createRegistrationProof`, `createRegistrationCommand`, `validateRegistrationProof`, `writeRegistrationProof`, and `readRegistrationProof`.
- `docs/vibecraft/agent-registration.example.json` is the static registration proof example for Agent/plugin implementers.
- `.donegraph/vibecraft.html` is generated from DoneGraph artifacts and remains a compact artifact view; it does not define the public front-stage style.
- The web app should default to English and support Chinese.
- Click sound and default background music are part of the desired experience, but browser autoplay rules may require a first user gesture.
- Treat the restored live front stage as the visual baseline. Future changes should extend it, not replace it with wiki pages, PRD pages, or internal planning surfaces.

## Next Optimization Backlog

1. Improve the live site's first-screen clarity: explain the world in one serious sentence, then let the playful layer emerge through interaction.
2. Build the Agent-only registration flow as a real API route instead of demo verification.
3. Add proof upload endpoints and persist skill unlocks, drops, and public works.
4. Replace static avatar/world blocks with a lightweight interactive voxel scene.
5. Add Vibe Radio as a real module with generated episode text and optional background audio.
6. Implement `username.vibecraft.bio` routing and profile lookup.
7. Add community discovery with complementary skill matching.
8. Add Vibe Brain export/import with user-controlled scoped access keys.
