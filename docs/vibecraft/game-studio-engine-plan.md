# VibeCraft Game Studio Engine Plan

Last updated: 2026-06-04

This note records how VibeCraft should use the Game Studio plugin guidance to turn the current prototype into a genuinely playable browser-game experience.

## Plugin Route

Game Studio classifies VibeCraft as a 2D browser game with DOM overlays:

- Primary route: `game-studio` -> `phaser-2d-game`.
- UI route: `game-ui-frontend`.
- Asset route: `sprite-pipeline`.
- QA route: `game-playtest`.
- Future 3D route: `three-webgl-game` only for optional Vibe Brain, portal, or trophy-room scenes where depth is the main experience.

## Engine Decision

Use Phaser for the MVP runtime.

Why:

- VibeCraft is currently a top-down voxel sandbox world, not a true 3D camera game.
- The main verbs are move, inspect, chop, collect, unlock, sync proof, listen, scan, and visit.
- Phaser handles sprites, tilemaps, camera follow, tweens, particles, and scene lifecycle quickly.
- Long copy, registration forms, public profile text, radio logs, and proof upload surfaces should remain HTML/DOM overlays.

Do not switch the whole MVP to Three.js. Use Three.js later only when a scene needs real depth, lighting, orbit/third-person camera, GLB assets, or spatial memory visualization.

## Runtime Architecture

The current single playable scene should evolve into these modules:

```text
docs/vibecraft/
  vibecraft-demo.html
  vibecraft-game.css
  vibecraft-game.js
  vibecraft-agent-bridge.js
  game/
    state/
      world-state.js
      agent-proof-state.js
    content/
      world-map.js
      stations.js
      skill-packs.js
    scenes/
      BootScene.js
      TitleScene.js
      WorldScene.js
      BioVillageScene.js
    systems/
      movement-system.js
      goal-tree-system.js
      radio-system.js
      lens-system.js
      unlock-system.js
    view/
      sprite-factory.js
      tile-factory.js
      fx.js
```

For the next implementation pass, this can remain bundled in `vibecraft-game.js`, but the code should follow these boundaries.

## Key Playable Scenes

### 1. Front Stage / Title Scene

Purpose: The homepage should explain the world while visibly being alive.

Must move:

- voxel clouds drift across the sky,
- sunlight or lantern glow pulses gently,
- one avatar walks through the first viewport,
- background blocks parallax as the user scrolls,
- a portal or sign points into the Workshop.

DOM overlay:

- product name,
- one serious positioning sentence,
- primary CTA,
- language and audio controls.

### 2. Open World Workshop

Purpose: The user should feel they entered a small playable world, not a dashboard.

Must move:

- player walks with keyboard and click/tap target,
- camera follows the player,
- map locations are real interaction zones,
- locked zones have gates and feedback,
- NPCs idle or patrol,
- water, smoke, radio waves, and tree leaves animate.

Core locations:

- Spawn Camp,
- Goal Tree,
- Knowledge Mine,
- Crafting Table,
- Radio Tower,
- Vibe Lens Station,
- Brain Vault,
- Vibe Village.

### 3. Agent Registration Forge

Purpose: Registration is only completed by an Agent, but the web user can understand and execute the loop.

Must move:

- copied Agent command lights up a forge/portal,
- proof paste triggers validation particles,
- valid proof creates a Village Pass animation,
- invalid proof gives clear but calm feedback,
- unlocked identity card becomes part of the world.

DOM overlay:

- handle input,
- role/avatar selection,
- copyable Agent command,
- proof/code paste area,
- validation result.

### 4. Goal Tree Production Loop

Purpose: A real build task becomes a tree in the world.

Must move:

- tree health changes with Agent completion proof,
- avatar performs chop/hit animation,
- hit-stop and particles show progress,
- completion drops items, XP, sticker, and a public work entry,
- Daybook and Radio update from the same source of truth.

### 5. Vibe Radio

Purpose: Progress becomes emotional feedback and ambient learning.

Must move:

- Radio Tower broadcasts visible waves,
- station dial changes,
- waveform animates while playing,
- episodes are generated from the user's proof, skill, drops, and current objective.

Audio:

- background loop should start when allowed by the browser,
- all important clicks should have sound feedback,
- radio playback should be separate from global ambience volume.

### 6. Vibe Lens

Purpose: Camera-like interaction turns something seen into a cute knowledge sticker.

Must move:

- scan frame locks onto a target,
- target converts into a sticker or vocabulary block,
- result can enter inventory, Daybook, and public works.

MVP constraint:

- Begin with a browser-safe scan placeholder and optional camera permission.
- Do not block the core loop on real camera capture.

### 7. Vibe Village / Public Bio

Purpose: Public profiles should feel like people entering a village, not static cards.

Must move:

- each public profile appears as a character,
- role, level, skill packs, and collaboration signals are visible on approach,
- invite actions feel like visiting another builder,
- `username.vibecraft.bio` resolves to that builder's public bio.

## Asset Pipeline

For 2D production assets:

1. Approve one in-game still frame first.
2. Generate horizontal spritesheets for idle, walk, chop, celebrate, and scan.
3. Normalize scale and baseline across frames.
4. Keep anchors bottom-center.
5. Preview in the actual Phaser scene before approving.

Starter sprite states:

- avatar idle,
- avatar walk four directions,
- avatar chop,
- avatar celebrate,
- NPC idle,
- tree idle/hit/fall,
- radio tower pulse,
- item drop bounce,
- portal open/closed.

## UI Rules

- Keep the center of the playfield clear.
- Use one compact HUD cluster, not dashboard-like panels everywhere.
- Put long text in drawers, modals, or lower-priority panels.
- Do not show PRD, internal planning terms, or legal asset notes on the product surface.
- Public copy should sound complete, calm, and product-grade.
- Use English by default and allow Chinese switch.

## Implementation Sequence

1. Stabilize the current Phaser scene into a small world runtime: camera follow, real interaction zones, animated objects, and a clearer HUD.
2. Replace static/programmatic shapes with a first approved sprite and tile style.
3. Build the Title Scene as a moving homepage background, while keeping homepage copy in DOM.
4. Upgrade Agent Registration Forge with visible world-state unlock animation.
5. Upgrade Goal Tree and Vibe Radio so proof events visibly change the world.
6. Add Vibe Village as a playable public-profile scene.
7. Add optional Vibe Lens camera permission and sticker output.
8. Run Game Studio playtest checks on desktop and mobile before every deploy.

## QA Checklist

Before deployment, verify:

- the game boots into a useful first state,
- the first screen feels playable within a few seconds,
- the player can move with keyboard and pointer,
- interaction prompts appear only near relevant objects,
- HUD does not cover the main playfield,
- Agent registration succeeds with valid `VC-AUTH` and JSON proof formats,
- invalid registration explains the problem without internal jargon,
- Goal Tree progress visibly changes,
- Radio can play/switch station without breaking global audio,
- reduced-motion users are not forced through heavy animation,
- desktop and mobile screenshots are visually acceptable.
