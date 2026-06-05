# Design System: DoneGraph Pixel Farm Board

## 1. Visual Theme & Atmosphere

DoneGraph should feel like an original pixel farm task board for serious AI work: tactile wood signs, seed-packet evidence cards, field-row structure, and a warm harvest rhythm. The dashboard is a handoff board that celebrates completed progress first, not a technical report. Density is relaxed on the first page and progressively denser on later pages. Motion is short CSS-only step motion.

## 2. Color Palette & Roles

- **Pixel Sky** (#8FCDE6) — Upper atmosphere and outdoor context.
- **Field Green** (#6FA05B) — Primary page atmosphere below the sky line.
- **Tilled Soil** (#8B5A32) — Ground rows, depth, and earthy structure.
- **Wood Sign** (#C98A44) — Main sign surfaces, tabs, and controls.
- **Fence Dark** (#6B3F24) — Chunky borders, shadows, and pixel outlines.
- **Seed Paper** (#FFE8A3) — Primary content panels and note cards.
- **Sprout Green** (#91C85F) — Passed evidence and growth accents.
- **Berry Red** (#C55B43) — Failed or blocked evidence emphasis.

## 3. Typography Rules

- **Display:** Avenir Next, Trebuchet MS, rounded system sans fallback. Heavy, compact, and sign-like.
- **Body:** Avenir Next or rounded system sans. Relaxed line height with 65ch reading width.
- **Mono:** SFMono-Regular or Menlo for commands, IDs, timestamps, and edge indices.
- **Banned:** Inter, generic serif fonts, pure black text, neon glows, oversized gradient headlines, and direct game UI copies.

## 4. Component Stylings

- **Board Shell:** A two-panel farm board with chunky wood borders, field texture, and bottom page controls.
- **Progress Page:** The first view prioritizes one large completion number, a pixel sign status, completed count, evidence count, and blockers.
- **Completed Cards:** Finished work appears like harvested seed packets with small status stamps.
- **Evidence Badges:** Small tactile stamps. Passed evidence is sprout green, blocked or failed evidence is berry red, unknown evidence is amber.
- **Technical Details:** Clean-room schema and relationship trace live on later pages, never as the first emotional impression.
- **Code Chips:** Small seed-paper strips with mono text and quiet dashed borders.

## 5. Layout Principles

Use a grid-first farm-board spread with two panels on desktop and a single stacked flow on mobile. Collapse below 860px. Every element occupies its own spatial zone; no overlapping text. The first viewport must emphasize progress and completion, not schema or relationship metadata.

## 6. Motion & Interaction

Use CSS-only transform and opacity animations. Page changes use short step timing and opacity only. Cards settle with staggered delays. No layout-affecting animation, no custom cursor, no scroll prompts.

## 7. Anti-Patterns

Never use emoji, Inter, pure black, neon purple or blue gradients, heavy corporate dashboard chrome, centered generic heroes, fake stock imagery, or official game assets. The style is inspired by cozy pixel farming interfaces, but all shapes, copy, layout, and implementation remain DoneGraph-owned.
