# Design System: DoneGraph Island Board

## 1. Visual Theme & Atmosphere

DoneGraph should feel like a calm island notice board for serious AI work: soft, tactile, organized, and lightly playful. The dashboard is a progress map, not a corporate analytics cockpit. Density is daily-app balanced, variance is offset and handcrafted, and motion is gentle CSS-only micro-motion.

## 2. Color Palette & Roles

- **Morning Mist** (#DDEEE5) — Primary page atmosphere and sky wash.
- **Shell Paper** (#FFF8E6) — Main paper surfaces and note cards.
- **Coconut Ink** (#24322B) — Primary text, never pure black.
- **Moss Line** (#527A5A) — Structural borders and calm emphasis.
- **Clay Stamp** (#C8784A) — Single accent for stamps, focus states, and active markers.
- **Lagoon Wash** (#8FB7BA) — Secondary supporting tone for route panels.
- **Pollen Note** (#F5D889) — Achievement and warning note tint.
- **Tide Muted** (#687C72) — Metadata, supporting text, and quiet labels.

## 3. Typography Rules

- **Display:** Outfit, Avenir Next, rounded sans fallback. Controlled scale, friendly weight, no shouting.
- **Body:** Avenir Next or rounded system sans. Relaxed line height with 65ch reading width.
- **Mono:** SFMono-Regular or Menlo for commands, IDs, timestamps, and edge indices.
- **Banned:** Inter, generic serif fonts, pure black text, neon glows, oversized gradient headlines.

## 4. Component Stylings

- **Hero:** Asymmetric notice-board composition with a small inline map tile near the headline. No centered landing-page hero.
- **Node Cards:** Rounded cork-board notes with soft paper fills, status stamps, and subtle transform-only float motion.
- **Evidence Badges:** Small tactile stamps. Passed evidence is moss, blocked or failed evidence is clay, unknown evidence is pollen.
- **Side Panels:** Ledger sheets with dashed inner rules, compact lists, and map-route labels.
- **Code Chips:** Small shell-paper strips with mono text and quiet borders.

## 5. Layout Principles

Use a grid-first layout with a wide progress board and a narrower handoff ledger. Collapse to one column below 980px. Every element occupies its own spatial zone; no overlapping text. Avoid generic three-equal-card feature rows.

## 6. Motion & Interaction

Use CSS-only transform and opacity animations. Cards float subtly with staggered delays. No layout-affecting animation, no custom cursor, no scroll prompts.

## 7. Anti-Patterns

Never use emoji, Inter, pure black, neon purple or blue gradients, heavy corporate dashboard chrome, centered generic heroes, fake stock imagery, or official Nintendo/Animal Crossing assets. The style is inspired by a cozy island interface mood, but all shapes, copy, layout, and implementation remain DoneGraph-owned.
