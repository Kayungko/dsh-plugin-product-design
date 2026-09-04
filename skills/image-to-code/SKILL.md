---
name: pd-image-to-code
user-invocable: false
description: "Implement a selected image, screenshot, mockup, or named ideation direction as a faithful, responsive frontend. Use after the user has chosen a visual target; not for briefless builds."
---

# Image to Code

You're tasked with translating the selected visual target into a high-quality, interactive website or web app.

## Critical Overrides

- Refer to the plugin router [$product-design](../index/SKILL.md) before proceeding.
- Follow [$critical-overrides](../../references/critical-overrides.md).

## User Context

Before starting, load [$pd-user-context](../user-context/SKILL.md) and run its preflight script when local shell access is available.

Use saved product URLs, design files, screenshots, reference images, codebase paths, Storybook links, tokens, design systems, brand assets, and component refs as grounding material when relevant.

Do not inspect every saved reference. Inspect only what the current task needs.

## Workflow

CRITICAL: THIS IS NOT GUIDANCE. THIS IS A CHECKLIST TO COMPLETE.

1. Do not start unless you have a selected image, screenshot, mockup, generated result, or named `$pd-ideate` direction to recreate. A written brief alone is not enough.

2. Resolve the exact selected visual target before building.

    - If the user selected a numbered `$pd-ideate` option, use the Nth displayed result from the most recent ideation set. Do not use the original concept planning order.
    - A selected image attachment, screenshot, mockup, or design frame reference is stronger than a bare ordinal. Prefer that exact reference when available.
    - If the selected result cannot be resolved unambiguously, stop before implementation and ask the user to name the concept or reattach/select the image. Never guess and build a nearby option.
    - For a text direction, the written direction spec is the visual target; treat its layout, palette, typography, and hierarchy statements as the design contract.

3. If the provided design is a mobile viewport, build a mobile-first app layout. If it's unclear, default to desktop.

4. Review the reference design and catalog every image asset in it. Zoom in so you can catch every asset that needs sourcing.

    Examples include:

    - Hero images including full bleed image backgrounds
    - Featured article imagery
    - Thumbnails
    - Decorative illustrations
    - Textures and background motifs
    - Logos
    - Product images
    - Avatars

    Asset sourcing rules:

    - CRITICAL RULE: Do not create custom div art, CSS art, inline SVGs, handcrafted SVGs, HTML element drawings, div/span shapes, CSS drawings, gradients, emoji, or text glyphs instead of real icons and image assets ever. Use real source assets, an image-generation tool when one is connected, and the closest matching open-source icon library for icons.
    - If no image-generation tool is connected and no real asset is available, use the closest freely licensed substitute and record the substitution plainly in the handoff. Do not silently fake it.
    - If text is part of an image asset, keep it in the image asset. Do not crop the background and recreate that text with HTML/CSS overlays unless the source clearly shows editable UI text sitting on top of the image.
    - Do not use generic placeholders where the reference implies custom visual content.
    - Generated or substitute assets must share the same art direction, palette, rendering style, and design language as the reference.

### Parallel asset production

After cataloging and measuring the reference assets, you may spawn up to three asset subagents while the main agent builds the app structure.

Give each subagent one asset task at a time with its reference crop, exact dimensions, focal point, style, output path, and consuming component. Asset subagents source, inspect, save, and report the asset path only. They must not edit source code, run the browser, or deploy.

Prioritize critical above-the-fold assets first, then reuse agents for supporting assets. Do not delegate standard UI icons or supplied brand logos.

5. Define all sections of the page. For each section, meticulously measure the layout, spacing between elements, and the size and space of the elements themselves.

6. Find freely available fonts that match the target design.

7. Find a freely available icon library that matches the target design. Do not default to any single library. Search for the best match.

    Rules:

    - CRITICAL RULE: Do not create custom inline SVGs, handcrafted SVGs, HTML element drawings, div/span shapes, CSS drawings, gradients, emoji, or text glyphs. Use real assets, a connected image-generation tool, and the closest matching icon library.

8. Build the app starting with [local-prototype-preflight](../../references/local-prototype-preflight.md). Unless the user asks for a static mock, full production behavior, or a different scope, bring the app or website to life with:

    - Working navigation, links, tabs, menus, and primary CTAs.
    - Functional inputs, filters, toggles, selections, and forms shown in the main experience.
    - Visible UI states: hover, focus, selected, open/closed, loading, empty, and success where relevant.
    - The main task, conversion path, or user journey working from start to finish when the product has one.

    Controls outside the core experience may be visual-only. Do not build auth, persistence, backend/API calls, integrations, or exhaustive edge cases unless requested.

    Rules:

    - Place every sourced asset into its position before proceeding. Replace all placeholders, including CSS/SVG placeholders, before proceeding.
    - Do not leave controls in the core experience as static chrome. Do not create new pages or routes unless the user asks for them.

9. Run the local app.

10. Capture the local app following the Capture Capability rule in [$critical-overrides](../../references/critical-overrides.md).

11. Run [$pd-design-qa](../design-qa/SKILL.md) as the blocking build gate.

    Steps:

    - Open the reference image and the latest prototype screenshot before writing the QA report.
    - Compare the same viewport and the same interaction state. If they do not match, capture the missing view first.
    - Save the QA report as `design-qa.md` in the project root.
    - Fix P0/P1/P2 issues, capture the app again, and repeat until the QA report says `final result: passed`.
    - Do not keep looping on P3 polish. Include any remaining P3s as follow-up iteration notes.
    - If source capture, prototype capture, or visual comparison is blocked, stop. `design-qa.md` must say `final result: blocked`.
    - Do not hand off as done unless `design-qa.md` exists and says `final result: passed`.
    - If no capture path exists at all, write the blocked report, tell the user plainly that the build is not visually verified, and hand off only if the user explicitly accepts that evidence limit.

12. Handoff the app or website.

    - Keep the prototype running locally.
    - Hand the user the clickable local URL and ask them to open it in their browser.
    - After the preview handoff, use the shared build handoff from [critical-overrides](../../references/critical-overrides.md#build-handoff-dsh). Do not add a different completion message.
