# VibeCraft Development Context

Last updated: 2026-06-03

This file records the durable product context for VibeCraft so future Agent work does not depend on chat memory.

## Current Status

- Product name: VibeCraft
- Chinese name: 灵感工坊
- Domain: https://vibecraft.bio
- Deployment status: live on Vercel. A header check on 2026-06-03 returned HTTP 200.
- Active repo branch: `codex/vibecraft-wiki-prototype`
- Durable prototype: `docs/vibecraft/index.html`
- Generated product view: `.donegraph/vibecraft.html`

## Records Found

- Git commit `9e598b4 Add VibeCraft wiki prototype` added the first durable VibeCraft prototype to the original DoneGraph repo.
- `README.md` and `READMEs/README.zh-CN.md` now point to the VibeCraft prototype.
- A temporary earlier prototype workspace under `/tmp` is no longer present, so the stable source of truth is this repository plus this context file.
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

The main visual and interaction reference is a voxel sandbox world with a Minecraft Wiki-like information surface.

Use these cues:

- left navigation,
- article-style sections,
- compact tables,
- green section headers,
- readable encyclopedia density,
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

- rough internal phrases like "hackathon skill logic"
- exposing PRD or internal documents on the product page
- explaining too much implementation detail to normal users
- putting disclaimers about Minecraft or official assets in visible marketing UI

## Current Implementation Notes

- `docs/vibecraft/index.html` is a standalone prototype that demonstrates Agent-only registration, public handle updates, proof sync, Vibe Radio, and Vibe Brain.
- Agent-only registration now has a durable MVP contract: `vibecraft.registration.v1`, deterministic `VC-AUTH-*` codes, authorized scopes, initial skill seeds, and proof validation helpers in `packages/core/src/vibecraft.ts`.
- `.donegraph/vibecraft.html` is generated from DoneGraph artifacts and turns recorded Agent work into a wiki-style VibeCraft view.
- The web app should default to English and support Chinese.
- Click sound and default background music are part of the desired experience, but browser autoplay rules may require a first user gesture.

## Next Optimization Backlog

1. Improve the live site's first-screen clarity: explain the world in one serious sentence, then let the playful layer emerge through interaction.
2. Build the Agent-only registration flow as a real API route instead of demo verification.
3. Add proof upload endpoints and persist skill unlocks, drops, and public works.
4. Replace static avatar/world blocks with a lightweight interactive voxel scene.
5. Add Vibe Radio as a real module with generated episode text and optional background audio.
6. Implement `username.vibecraft.bio` routing and profile lookup.
7. Add community discovery with complementary skill matching.
8. Add Vibe Brain export/import with user-controlled scoped access keys.
