---
name: pd-audit
user-invocable: false
description: "Audit or critique a product flow, journey, funnel, onboarding/checkout/settings path, screen, or multi-step product experience by capturing screenshots first, then reporting UX, design, and accessibility findings inline from that evidence. Use when the user asks to audit, review, critique, inspect, assess, analyze, evaluate, or give feedback on a product experience."
---

# Audit

Use this skill when the user wants to audit, review, critique, inspect, assess, analyze, evaluate, or give feedback on a product flow, journey, funnel, onboarding path, checkout path, settings path, screen, or other product experience.

The output is not a loose opinion. The output is:

- Screenshots of the flow
- Those screenshots referenced inline in the report
- A numbered step list
- UX and design findings tied to steps or screenshots
- Accessibility risks tied to steps or screenshots
- Clear limits on what could not be checked from screenshots alone

## Critical Overrides

- Refer to the plugin router [$product-design](../index/SKILL.md) before proceeding.
- Follow [$critical-overrides](../../references/critical-overrides.md).

## User Context

Before starting, load [$pd-user-context](../user-context/SKILL.md) and run its preflight script when local shell access is available.

Use saved product URLs, design files, screenshots, reference images, codebase paths, Storybook links, tokens, design systems, brand assets, and component refs as grounding material when relevant.

Do not inspect every saved reference. Inspect only what the current task needs.

## Route

Before auditing:

1. Identify the product or surface.
2. Identify the flow or task.
3. Choose the capture path (Capture Capability rule in [$critical-overrides](../../references/critical-overrides.md)).
4. Capture the flow.
5. Save and inspect each screenshot.
6. Return the audit inline with the accepted screenshots.

Output rules:

- Default to a concise inline report with the accepted screenshots referenced in the chat.
- Saving screenshots and notes in the workspace is an internal implementation detail. Do not ask the user to choose a local folder.
- If a design-tool integration (for example a Figma MCP) is connected and the user explicitly asks for a board there, create it in addition to the inline report. Otherwise ask once: `Want me to plot this out in a design tool with the screenshots and notes?` only when such a tool is actually connected.

Capture rules:

- Follow the Capture Capability rule in [$critical-overrides](../../references/critical-overrides.md).
- If no capture path can capture valid screenshots or control the flow, stop and report the blocker.

Browser capture order:

1. Connect to the browser and use the current tab when it already shows the target.
2. Do not reload or navigate away unless the audit needs a fresh start.
3. Observe the visible state before acting.
4. Before each click, type, or key press, use the latest DOM snapshot to target one clear control.
5. After each action, take the cheapest fresh check that proves what changed: DOM for structure, screenshot for visual state.
6. Save and inspect the accepted screenshot before using it as audit evidence.

Evidence rules:

- Use only evidence captured in the current audit run.
- Do not use memory, prior chats, old traces, cached screenshots, or prior generated artifacts as audit evidence unless the user explicitly provides them.
- Do not audit until the product, flow, and capture path are known.
- Do not claim full accessibility compliance from screenshots alone.

## Capture And Audit The Flow

You are an expert design, UX, and accessibility auditor. For each step in the flow, capture what the user sees, observe how the screen behaves, inspect the screenshot, and write audit notes before moving on.

Follow [references/design-audit-framework.md](references/design-audit-framework.md) when deciding what to inspect and how to describe strengths, UX issues, accessibility risks, limits, and recommendations.

Screenshot source rule:

- Use the screenshot you actually saw.
- Save that exact screenshot to the local audit folder.
- Open or inspect the saved file before accepting it.
- If the saved file shows the wrong window, wrong state, blank page, crop, or loading screen, reject it and capture again.
- Do not replace a browser screenshot with an OS screenshot unless you first prove the saved file shows the same window and state.

For every step:

1. Move to the next step in the requested flow.
2. Wait until the screen is loaded and visually stable.
3. Check for loading spinners, blank areas, login walls, error pages, blocked states, cookie dialogs, and half-rendered content.
4. Capture the screenshot.
5. Inspect the screenshot before accepting it.
6. Reject the screenshot if it is blank, loading, cropped, blocked, or showing the wrong state.
7. Observe behavior that matters for the audit, such as navigation, focus, loading, validation, error handling, empty states, motion, and whether the next action is clear.
8. Write notes for that step.
9. In the notes, report strengths, UX issues, accessibility risks, and any limits that made the step difficult to audit.
10. Save accepted screenshots with numbered names, such as `01-start.png`, `02-form-filled.png`, and `03-confirmation.png`.
11. Inspect the saved screenshot file before handoff.
12. Keep each accepted screenshot and its notes together for the final inline report.

Default inline report:

- Reference accepted screenshots in flow order.
- Keep the report pithy: overall verdict, numbered steps, highest-impact changes, and evidence limits.
- Tie every finding to the screenshot or step that supports it.

Acceptance checks:

- Every important step in the requested flow has a valid screenshot or a named blocker.
- Screenshots are saved in order.
- Screenshots are referenced inline in the final report.
- Every note points to the screenshot or step it describes.
- Notes explain strengths, UX issues, accessibility risks, and evidence limits when those apply.
- Accessibility risks say what can be seen from screenshots and what still needs testing.
- The final screenshot set and notes are enough to support the requested audit.

Blockers:

- The flow cannot be completed.
- A required step cannot be screenshotted.
- The source changes in a way that makes the flow unclear.
- Screenshots cannot be saved or referenced inline.
- Notes cannot be written.
- The requested claim would require evidence that screenshots cannot provide.
- Do not claim an audit if the actual flow could not be accessed and captured. Help Center pages, web searches, and other indirect evidence are research, not an audit.

## Final Response

After the flow is captured and notes are written, list every step in the final response.

The final step list MUST include:

- step number
- short description of the step
- general health of that step

Also include where the full output was saved or placed.

Keep the language direct. Do not use broad design jargon when a plain phrase works.
