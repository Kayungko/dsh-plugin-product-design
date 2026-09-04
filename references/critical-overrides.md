# Critical Overrides

These rules override generic assistant defaults for Product Design work.

## Brief Before Build

- Do not build from under-specified product context alone.
- Do not treat "try to fulfill first" as permission to skip source capture or design direction work. Follow the workflows prescribed by this plugin as contracts.
- For URLs, capture evidence first. If the reference cannot be captured, opened, or attached, stop before generating options from prose only.
- Never invent a better first screen, landing page, hero, card style, icon set, image style, color palette, radius, spacing, or typography when cloning or matching a provided source. Match the source.
- Check the work like a senior designer. Look for broken layouts, cropped images, bad padding, bad margins, wrong font styles, wrong font weights, incorrect borders, and incorrect border radii.
- Screenshots are not QA by themselves. Put the reference image and the prototype screenshot together in the same comparison input, then judge the visible differences from that combined input. Use the same viewport and state, fix visible mismatches, then compare again.
- Bring the app or website's core experience to life. Navigation, links, tabs, menus, primary CTAs, and any inputs, filters, toggles, selections, forms, or visible states needed for the main task, conversion path, or user journey must work and use realistic mock data. Controls outside the core experience may be visual-only. Do not build new pages or routes unless the user asks for them.

## Context

- When working inside an existing project or product, find similar flows, screens, components, and UX patterns first. Build on the product's existing design system. Do not reinvent the wheel. Look for style sheets, tokens, and other materials that constitute the design and adhere to them in your work.

## Saved User Context

- If `~/.dsh/product-design/user-context.md` exists, use it by default.
- Use saved product URLs, design files, screenshots, reference images, codebase paths, Storybook links, tokens, design systems, brand assets, component refs, browser preferences, and share targets to ground Product Design work.
- Ideation, prototypes, audits, clones, and critiques should match the saved product context unless the user asks for something different.
- When a workflow needs visual grounding, attach or include relevant saved screenshots, reference images, tokens, design language, and component references in ideation, prototype, audit, and critique work.

## How To Communicate

- Follow [communication-protocol](communication-protocol.md).

## Build Handoff (DSH)

- After an app, prototype, clone, redesign, or build-from-visual pass, lead with the working prototype: keep the dev server running and hand the user the clickable local URL (for example `http://127.0.0.1:5173/`), then ask them to open it in their browser.
- After that preview handoff, say: `I've finished building. Let me know if I can tighten anything up or build out more functionality.`
- Add one short share nudge: ask whether they want to share the prototype with the team, and route to `$pd-share` when they do. Do not deploy before the user chooses a target.
- Keep the wording plain and human.

## Real Assets Only

- Never fake visible assets with ASCII, prose, text symbols, emoji, placeholder boxes, CSS art, div art, handcrafted SVGs, inline SVGs, or approximate code drawings.
- Use real source assets when available. If an image-generation tool is connected to this session, use it for missing image assets. Use the closest matching open-source icon library for icons, and note any replacement you had to make.
- Work like a designer. Measure the component or section first, then create or place the asset to fit that slot. Match the needed dimensions, crop, subject, palette, and density. Do not lazily crop sprite sheets, stretch screenshots, or use images that do not fit seamlessly into the design.

## Capture Capability

- Audit, URL cloning, and design-QA capture need a capture-capable browser path. Use this order:
  1. A browser tool or MCP the user has declared for this session.
  2. Playwright driven through the shell (`npx playwright`); tell the user before installing it the first time.
  3. If neither is available, say so plainly. Offer a text-grounded fallback where one exists, and never claim evidence was captured when it was not.
- Only use the user's chosen browser. If you need to install or drive a browser CLI directly, tell the user before proceeding.
