---
name: pd-ideate
description: "Generate three distinct visual directions for a Product Design brief, as generated images when an image-generation tool is connected or as structured text directions otherwise. Use when the user asks for design variants, visual exploration, remixes, or concept directions from provided context."
---

# Ideate

You're tasked with generating design directions for a user's idea.

Follow the shared Product Design routing guidance in [$pd-index](../index/SKILL.md).

## Critical Overrides

- Refer to the plugin router [$pd-index](../index/SKILL.md) before proceeding.
- Follow [$critical-overrides](../../references/critical-overrides.md).

## User Context

Before starting, load [$pd-user-context](../user-context/SKILL.md) and run its preflight script when local shell access is available.

Use provided product URLs, design files, screenshots, reference images, codebase paths, Storybook links, tokens, design systems, brand assets, and component refs to align the directions to the design brief.

Do not inspect every saved reference. Inspect only what the current task needs.

## Workflow

Do not generate directions until `$pd-get-context` has satisfied the minimum required design brief.

Before generating:

1. Understand the brief.

- Identify the target: component, screen, feature/workflow, or broad product idea.
- Identify the intended user, product surface, and goal.
- Preserve hard constraints from the user.
- Run `$pd-get-context` if the minimum required design brief isn't satisfied.

2. Resolve context.

- Use provided files, screenshots, links, and visible references.
- In a local workspace, look for nearby design documentation and other local visual context.
- Check likely design context folders such as `user-context`, `storybook/`, `.storybook/`, `design-system/`, `design-systems/`, `tokens/`, `components/`, `app/`, and generated prototype roots.
- In an existing project, look for existing product screenshots, similar flows, Storybook captures, design tokens, and component references before generating. Ask if the user can provide example screens similar to the one they are building if the existing app isn't accessible.

3. Inspect references directly.

- Look at screenshots, images, design frames, app surfaces, or other visual references before generating. Use the session's image reading capability for local image files.
- Do not infer from filenames alone.
- If a named local path or reference is not visible, stop and ask the user to confirm the path, attach the file, start the local app, or point to the correct workspace.

4. Decide the variation mode.

- If useful local design context exists and the user has not asked for a new style, stay within that existing direction.
- If no useful design context exists, or the user asks for broad exploration, vary both concept and visual system.
- For a specific component or existing surface, vary structure, interaction, hierarchy, and emphasis before varying brand style.
- For a broad product idea, explore three meaningfully different product directions.

5. Choose target dimensions.

- Pick the dimensions that best match the user's request and any provided visual reference.
- Mobile app: `390 x 844`.
- Tablet app: `834 x 1194`.
- Desktop app, dashboard, admin, or SaaS: `1440 x 1024`.
- Landing or marketing page: `1440` wide and scrollable.
- Modal, panel, widget, or component: natural container size.
- Provided screenshot, design frame, mockup, or reference image: match its dimensions and aspect ratio when the user wants to continue from that visual.
- Avoid crowding. Make the design fit the chosen dimensions cleanly, with realistic spacing, readable type, and no clipped content.

6. Check for access gaps.

- If a reference or file cannot be accessed because of permissions, missing paths, or suspiciously empty results, stop.
- Name the gap clearly and ask whether to troubleshoot access or continue without that source.
- Do not generate directions while silently ignoring a named reference.

7. Decide the generation mode.

- If an image-generation tool is connected to this session, generate three independent images, one per direction.
- Otherwise produce three structured text directions. Say once, plainly, that no image-generation tool is connected, and do not pretend the text directions are rendered mockups.

## Generation Rules (images)

When generating images:

- Generate exactly three independent images unless the user overrides the count.
- Launch each generation independently. Do not batch generations into one combined image.
- Each direction must be its own result. Do not put multiple ideas in one image.
- Give each direction a distinct, descriptive name before generation, but do not call them `option 1/2/3` and do not put planned numeric labels in generation prompts. Parallel results can arrive in a different order from the requests.
- Number options only after all generated-image results are present in the conversation. The only authoritative option order is the order those results are displayed. Ignore planned concept order, request order, batch order, and array indexes.
- Attach provided screenshots, files, app captures, and visual source material as moodboard inspiration when the tool accepts image input.
- When mock data includes dates or time-sensitive information, resolve the exact current date and include it so visible dates are plausible.
- Preserve hard constraints from the brief in every image.
- Only claim a visual reference was attached if the generation call actually received it. If you cannot attach it, say so and ask whether to continue text-only.

## Generation Rules (text directions)

When no image-generation tool is connected, each text direction must be concrete enough to build and compare:

- Direction name and one-line concept.
- Layout strategy: structure of the primary screen, hierarchy, and what stays off-screen.
- Information hierarchy: primary action, supporting actions, and content order.
- Palette and mood: 3-5 named colors with roles, plus light/dark stance.
- Typography: two or fewer fonts with roles, anchored to 14-16px body text.
- Key states worth prototyping: empty, loading, error, success where relevant.
- Why this direction is meaningfully different from the other two.

## Design Quality Bar (both modes)

- Design a focused primary screen, not a feature inventory. Show the hero use case, one clear primary action, and only one or two supporting actions or content areas. Let the rest of the product exist off-screen.
- Layout priority: spacing/grouping/typography first, then simple dividers, then subtle surface tints, then borders, then shadows last and sparingly.
- Do not default to a centered "app card" on a contrasting page background. Do not put cards inside cards. Do not make every list item its own card.
- Do not make up extraneous features just to fill a UI.
- For mobile app concepts, describe or output app content only — no device bezel, notch, status bar, or home indicator.

## Feedback Loop

If the user gives feedback after seeing directions, generate revised directions with that feedback.

If the user selects a direction and gives feedback, generate a revised direction with that feedback before build.

If the user likes parts of more than one direction, combine those choices into a new direction and show it before build.

## Output

Wait until all requested directions exist before sending the final message that asks the user to choose.

Number the returned directions in the order they appear in the conversation (first = 1, second = 2, third = 3). Do not name or describe the directions again in the selection message. For the default three, send only:

`Which direction should I build: 1, 2, or 3? Or tell me what you'd like to refine or personalize first.`

Adjust the numbers only if the user requested a different count.

If the user chooses a number, acknowledge the chosen direction before routing to `$pd-image-to-code`, for example: `Building direction 2!` Do not ask for confirmation when the mapping is clear.

After generating directions, stop for the user's selection before any build work begins. The selected direction is the visual target for `$pd-image-to-code`.

Done means the requested number of distinct directions exist and the user has been asked to select one.
