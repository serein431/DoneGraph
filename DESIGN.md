# Design System: DoneGraph Progress Journal

## 1. Visual Theme & Atmosphere

DoneGraph should feel like a calm progress journal for serious AI work: soft, tactile, organized, and restorative. The dashboard is a handoff diary that celebrates completed progress first, not a technical report. Density is relaxed on the first page and progressively denser on later pages. Motion is gentle CSS-only page turning.

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

- **Journal Shell:** A two-page book spread with a warm spine, softly curled pages, and bottom page controls.
- **Progress Page:** The first view prioritizes one large completion number, a tactile progress track, completed count, evidence count, and blockers.
- **Completed Cards:** Finished work appears like collected journal entries with small status stamps.
- **Evidence Badges:** Small tactile stamps. Passed evidence is moss, blocked or failed evidence is clay, unknown evidence is pollen.
- **Technical Details:** Clean-room schema and relationship trace live on later pages, never as the first emotional impression.
- **Code Chips:** Small shell-paper strips with mono text and quiet borders.

## 5. Layout Principles

Use a grid-first journal spread with two pages on desktop and a single stacked page flow on mobile. Collapse below 860px. Every element occupies its own spatial zone; no overlapping text. The first viewport must emphasize progress and completion, not schema or relationship metadata.

## 6. Motion & Interaction

Use CSS-only transform and opacity animations. Page changes use rotateY and opacity only. Cards settle softly with staggered delays. No layout-affecting animation, no custom cursor, no scroll prompts.

## 7. Anti-Patterns

Never use emoji, Inter, pure black, neon purple or blue gradients, heavy corporate dashboard chrome, centered generic heroes, fake stock imagery, or official game assets. The style is inspired by cozy farming-journal pacing, but all shapes, copy, layout, and implementation remain DoneGraph-owned.
