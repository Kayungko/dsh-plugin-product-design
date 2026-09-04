---
name: pd-url-to-code
description: "Clone a live URL as a runnable frontend-only local app. Use when the user asks to clone or recreate a page they own or have permission to recreate; capture evidence first, build only from evidence."
---

# URL To Code

If the user explicitly invokes this skill, continue.

Only continue when the user asks to clone or recreate the current site.

If the user says `like`, `better`, `redesign`, or `improve`, return to [$pd-index](../index/SKILL.md).

Clone `<target-url>` as a real interactive, frontend-only local app or website. The clone should look and interact like the source.

## Critical Overrides

- Refer to the plugin router [$pd-index](../index/SKILL.md) before proceeding.
- Follow [$critical-overrides](../../references/critical-overrides.md).

## User Context

Before starting, load [$pd-user-context](../user-context/SKILL.md) and run its preflight script when local shell access is available.

Use saved product URLs, design files, screenshots, reference images, codebase paths, Storybook links, tokens, design systems, brand assets, and component refs as grounding material when relevant.

Do not inspect every saved reference. Inspect only what the current task needs.

## Workflow

1. CRITICAL STEP: Warn the user that they must follow the target website's terms before proceeding. This workflow is only for apps and websites the user owns, or has permission to recreate.

2. Open the source URL using the Capture Capability rule in [$critical-overrides](../../references/critical-overrides.md).

3. Check that the page is correct.

- Do not continue if it shows the wrong page, a blocked page, a login page, a promo page, a loading screen, an error page, an app-install page, or an unrelated redirect.
- If the page is wrong, try again with another available capture path.
- If every capture path shows the wrong page, stop and tell the user what you can see.

4. Capture the source page carefully.

- Start at the top of the page.
- Scroll down in small steps.
- At each step, capture what is visible.
- Note any new sections, controls, sticky elements, animations, or lazy-loaded assets.
- Continue until the full page has been seen.
- Scroll back to the top and check whether anything changed.
- Repeat on mobile at `390 x 844`.

5. Gather everything needed to recreate the source from the captured page and its DOM/styles.

- Elements
- Components
- Text
- Links
- Buttons and controls
- States
- Images
- Icons
- Fonts
- Videos
- SVGs
- Style sheets
- Colors
- Spacing
- Layout sizes
- Responsive behavior

6. Find and test the page interactions.

- Use the screenshots and DOM evidence to find visible controls.
- Include navigation, buttons, links, inputs, menus, drawers, modals, tabs, carousels, hover states, sticky elements, and anything else the user can interact with.
- Test one control at a time.
- Return to the starting state before testing the next control.
- Save the result when the page visibly changes or the evidence shows a state change.

7. Copy the real assets from the source page.

- If the page loads the asset, treat it as available unless it cannot be accessed or saved.
- If an image, logo, icon, font, video, SVG, sprite, mask, cursor, or background image is used by the page, copy it locally.
- If an image asset cannot be copied, generate a replacement with a connected image-generation tool using a screenshot of the original, or use the closest freely licensed substitute and record it.
- If a font file cannot be copied, use the closest open source font match.
- If an icon or glyph cannot be copied, use the closest matching open source icon set. Do not default to any single library unless it is the closest match.
- Briefly note any asset, font, or icon you replaced and why.

8. Create the local app with [local-prototype-preflight](../../references/local-prototype-preflight.md).

9. Build only from what you captured, copied, or gathered from the source.

- Do not add new visual ideas.
- Do not use hotlinked source assets.
- Do not guess when source proof is available.

10. Run the local app.

11. Compare the local app against the original.

- Check desktop.
- Check mobile.
- Check every interaction you captured.
- Fix any obvious mismatch before running final QA.

12. Run [$pd-design-qa](../design-qa/SKILL.md) as the blocking build gate.

- Save the QA report as `design-qa.md` in the project root.
- Fix P0/P1/P2 issues, capture the app again, and repeat until the QA report says `final result: passed`.
- Do not keep looping on P3 polish. Include any remaining P3s as follow-up iteration notes.
- If source capture, prototype capture, or visual comparison is blocked, stop. `design-qa.md` must say `final result: blocked`.
- Do not hand off as done unless `design-qa.md` exists and says `final result: passed`.

13. Handoff the app or website.

- Keep the prototype running locally.
- Hand the user the clickable local URL and ask them to open it in their browser.
- After the preview handoff, use the shared build handoff from [critical-overrides](../../references/critical-overrides.md#build-handoff-dsh). Do not add a different completion message.

## Hard Rules

- Capture source evidence first. Do not scaffold, write app code, start a server, or create the local prototype until desktop capture, mobile capture, key states, and every required asset, icon, control mark, and font is captured or replaced.
- Do not hand off until every single interaction and state is captured from the target.
- Do not build from memory, screenshots alone, guessed CSS, generic assets, or prior chats.
- Do not implement a saved state without source screenshot plus the available DOM/style/layout evidence for that state.
- Do not use hotlinked source assets in the final app.
- Do not create temporary CSS icons, text glyphs, emoji marks, placeholder blocks, or handmade SVGs while "waiting" to resolve assets. Resolve assets first, then build.
- If no available capture path can produce valid source and prototype evidence, stop and report the design-qa blocker.
