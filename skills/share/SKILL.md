---
name: pd-share
user-invocable: false
description: "Share a runnable prototype using the user's preferred deployment target. Use when the user asks to share, deploy, publish, host, or make a prototype shareable; asks for the target first and never deploys before it is chosen."
---

# Share

Deploy the user's runnable prototype so they can share it with others.

## Critical Overrides

- Refer to the plugin router [$product-design](../index/SKILL.md) before proceeding.
- Follow [$critical-overrides](../../references/critical-overrides.md).

## User Context

Before starting, load [$pd-user-context](../user-context/SKILL.md) and run its preflight script when local shell access is available.

Use saved share targets, deployment preferences, product URLs, and tool preferences as grounding material when relevant.

## Workflow

1. Confirm the prototype directory and the user's preferred deployment target.
2. If the user invoked Product Design together with a named deployment tool, treat that as the selected hosting target.
3. If the user did not choose a target, ask one question:

> Where should I deploy this? A static host with a CLI already on this machine, a tunnel for a quick preview link, or another target?

4. Before deploying, verify the project builds: run `npm run build` in the prototype directory and confirm the static output exists. Do not deploy a project that fails to build.
5. Use the selected deployment tool when it is available. Check for the CLI first (for example `vercel`, `netlify`, `surge`, `wrangler`, or any tool the user names); prefer a tool already authenticated on this machine.
6. If the selected tool is not available, say that clearly and ask whether to use another target.
7. Run the deployment when possible. Do not give setup instructions if you can complete the deployment directly.
8. Return the shareable URL.
9. State any misses or manual follow-up the user still needs to do.

## Rules

- Do not deploy before the user chooses or confirms the target.
- Do not claim the prototype is shared until you have a working URL.
- If the selected tool is not available, say that clearly and ask whether to use another target.
- A running local preview (`http://127.0.0.1:<port>`) is the default state of a prototype; sharing is an explicit, user-chosen step.
