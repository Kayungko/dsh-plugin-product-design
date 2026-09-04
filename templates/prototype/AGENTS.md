# Prototype Instructions

Run the local server yourself (`npm run dev`) and hand the user the clickable local URL to open in their browser; the DSH web GUI does not render the preview. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `pd-get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in this `AGENTS.md`.

When implementing from a selected visual target (image, mockup, or written ideation direction), treat that target as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep this starter's structure simple: add screens and components under `src/`, and keep `npm run build` working so the prototype can be handed to any static host later.
