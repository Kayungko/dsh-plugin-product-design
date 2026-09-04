---
name: product-design
description: "Single entry point for Product Design work in DSH. Use on explicit Product Design requests, or when the main goal is design exploration, visual directions, UX research, a flow audit or critique, faithfully cloning a visual source, building a prototype, prototype QA, or sharing a prototype. Load this skill first; it analyzes the request and routes to the right focused workflow."
---

# Skill Purpose

Route Product Design requests to the right Product Design skill. Use this plugin for an explicit Product Design mention, a direct Product Design request, or a request mainly about design exploration, faithful source cloning, audits, research, critique, or sharing. A request is not Product Design just because it mentions UI, a prototype, or visual style.

# Plugin Purpose

The Product Design plugin helps designers and other non-coders close the gap between product ideas and working software. It equips you to:

- Research ideas and pain points related to your product.
- Conduct product-flow audits grounded in captured screenshots.
- Generate distinctly new visual directions for your product.
- Clone existing product pages into lightweight local prototypes.
- Build lightweight or interactive prototypes to share with your team.

## Communication Style

Speak to the user in a warm, collaborative way, prioritizing pithy explanations over long walls of text and numerous bullet points. Refer to the [communication-protocol](../../references/communication-protocol.md) for relaying progress updates and handoff.

## Critical Overrides

- Follow [$critical-overrides](../../references/critical-overrides.md).

## Router Only

This index chooses the next Product Design skill. It does not do that skill's work.

If the user names a focused skill, read that exact skill first. Do not replace it with a related skill.

When a request matches `$pd-user-context`, `$pd-get-context`, `$pd-research`, `$pd-ideate`, `$pd-image-to-code`, `$pd-url-to-code`, `$pd-audit`, `$pd-design-qa`, or `$pd-share`, load the focused skill and follow it.

For requests to audit, review, critique, inspect, assess, analyze, evaluate, or give feedback on an existing product experience, load `$pd-audit` directly; do not load `$pd-get-context` first. If the same request also asks to build, fix, redesign, or implement afterward, run `$pd-audit` first, then continue through the appropriate normal workflow.

For visual ideation, `$pd-ideate` is the focused workflow. Use `$pd-get-context` to resolve the minimum brief and play back any defaults before `$pd-ideate` starts.

For clone or recreation of a live URL, load `$pd-url-to-code` directly.

For a redesign, improvement, or new site based on a URL, use `$pd-get-context` to confirm the redesign brief. `Like <URL>` means redesign, not clone. Capture the current site with screenshots, attach those screenshots to the `$pd-ideate` work, then execute `$pd-ideate`.

## Capability Check (DSH)

Product Design assumes local shell and filesystem access, which DSH sessions normally provide.

Capture-dependent work (`$pd-audit`, `$pd-url-to-code`, the QA capture step of builds) follows the Capture Capability rule in [$critical-overrides](../../references/critical-overrides.md). If no capture path is available after checking, tell the user once:

```text
No capture-capable browser is available in this session. I can still build a prototype grounded in your brief and references, but I cannot visually verify it, so fidelity and interaction polish may be lower. Continue with that fallback?
```

Only proceed after the user agrees. Do not claim the fallback is verified, open, or ready to share. This fallback applies to ideation and new prototypes. It does not apply to URL-to-code when browser capture is required.

## No Visual Target, No Build

For new app, prototype, redesign, or UI build requests without a URL, screenshot, design frame, mockup, source image, or existing code target:

- `$pd-ideate` is the focused workflow.
- Use `$pd-get-context` to resolve the minimum brief.
- Once the target and intended user outcome are clear, play back the assumptions and run `$pd-ideate` in the same turn.
- Show exactly three distinct directions and wait for the user to choose one.
- Do not scaffold, edit files, or start a server before a direction is selected.

`Full working version`, `no refs`, `go for it`, `make an assumption`, or a complete brief do not waive this.

## User Context

Use [$pd-user-context](../user-context/SKILL.md) when the user asks to:

- Set up Product Design
- Get started with Product Design
- Onboard with Product Design
- Save product or design sources
- See what Product Design remembers
- Update saved product or design context
- Remember a Product Design preference

Adjust the context-gathering request to match the user's request. First-time setup differs from updating existing context.

For setup-only requests, do not inspect the workspace, install dependencies, scaffold a prototype, generate images, run audits, or start implementation.

When answering "what can you do?", "how do I get started?", or similar broad Product Design questions, load `$pd-user-context` and follow its persistence availability check before offering saved-context onboarding.

Before routing to Product Design workflows, load [$pd-user-context](../user-context/SKILL.md) and run its preflight script when local shell access is available.

## Skills

Use this as the root routing guidance for Product Design plugin work. If several focused skills apply, sequence them in the order that creates the most useful design workflow. Keep this index as a router; do not perform focused workflow logic here.

### $pd-user-context

Preflight, save, or answer from Product Design setup context. Route here before Product Design workflows to load saved product and design sources, and for direct setup, get-started, onboarding, save, remember, recall, inspect, or customization requests. This skill owns Product Design plugin-scoped context and preference policy.

### $pd-get-context

Route here first for design, build, prototype, redesign, extend, or UI exploration work. Require only a clear design target and intended user outcome. Ask one targeted question only when one of those is missing; otherwise play back the brief and defaults, then continue without waiting for approval.

### $pd-research

Run fast, source-grounded UX research on current user problems for a named digital product. Route here for researching user pain, UX friction, onboarding issues, docs/help problems, developer experience friction, support pain, product workflow issues, or current user complaints.

### $pd-audit

Capture and review a product flow, journey, screen, or multi-step product experience from screenshots. Route here for user-facing audit, review, critique, inspect, assess, analyze, evaluate, or feedback requests. It reports UX, design, and accessibility findings tied to captured evidence; do not use `$pd-design-qa` for user-facing audits.

### $pd-ideate

Generate visual alternatives, remixes, or concept directions for a component, screen, feature, workflow, or product idea. Route here after `$pd-get-context` has played back the minimum brief and the user needs visual exploration, design variants, alternatives to an existing design, or idea discovery before choosing a visual target. Prefer this over prose-only ideation unless the user asks for prose.

### $pd-url-to-code

Clone a live URL as a runnable frontend-only local app. Load this alongside `$pd-get-context` when the user provides a production URL for a faithful local prototype or clone, but do not execute it until the minimum brief has been played back. It should not modify production code; stay in `$pd-get-context` when source selection is still unclear.

### $pd-image-to-code

Implement a selected visual target as a faithful, responsive, interactive frontend. Route here after `$pd-get-context` has played back the minimum brief and the user has chosen a generated mock, screenshot, design frame, mockup, reference image, or a named `$pd-ideate` direction. Do not start here when no visual target has been selected; use `$pd-get-context` and `$pd-ideate` first.

### $pd-share

Deploy a runnable prototype and return a shareable URL using the user's preferred target when available. Route here when the user asks to share, deploy, publish, host, or make a prototype shareable.

### $pd-design-qa

Compare a coded Product Design prototype against its source visual target before handoff. Route here only as an internal helper after a prototype, URL-to-code build, or image-to-code build has both a source visual and rendered implementation. Do not route broad UX critiques, audits, or product-flow reviews here; use `$pd-audit` instead.
