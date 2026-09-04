<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/banner-dark.svg">
  <img src="./assets/banner-light.svg" alt="product-design" width="600">
</picture>

**Brief · Explore · Build · QA — a Product Design workflow plugin for DeepSeek Harness**

[![DSH 0.1.2-alpha.1 verified](https://img.shields.io/badge/DSH-0.1.2--alpha.1%20verified-16A34A?style=for-the-badge)](docs/PROTOCOL.md)
[![Node.js](https://img.shields.io/badge/Node.js-%5E22.19%20%7C%20%3E%3D24-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](package.json)
[![13 unit tests](https://img.shields.io/badge/tests-13%20unit-0EA5E9?style=for-the-badge)](test/smoke.test.mjs)
[![MIT](https://img.shields.io/badge/license-MIT-7C3AED?style=for-the-badge)](LICENSE)

[What is this](#what-is-this) · [Quick start](#quick-start) · [The ten skills](#the-ten-skills) · [Workflow gates](#the-workflow-gates-the-important-part) · [Architecture](docs/ARCHITECTURE.md) · [Host contract](docs/PROTOCOL.md) · [Changelog](CHANGELOG.md) · [中文](README.zh-CN.md)

</div>

---

## What is this

**One entry point — `/product-design` — and every design-flavored request is routed through a disciplined workflow:**

```text
/product-design I need an onboarding flow for a habit-tracking app
```

What happens behind the scenes: the entry skill analyzes the request and routes it to one of nine focused `pd-*` sub-skills — a minimum design brief, three distinct visual directions, evidence-grounded research and audits, faithful URL cloning, responsive frontend builds, and a blocking design-QA gate before anything may be called "done".

- A **skill-only** DSH plugin: no model tools, no client modules — the entire surface is ten skills on an isolated provider;
- Skills **hot-reload on edit**, never shadow project/user skills, and disappear together with the plugin on uninstall;
- Evidence-driven by contract: screenshots are inspected before adoption, fake assets are forbidden;
- One prerequisite: **DSH Desktop is installed and starts** (the plugin never launches the host for you).

> 📌 Host contract verified on **DSH 0.1.2-alpha.1**; 13 unit tests plus an installed-location integration check pass (criteria in [Host contract](docs/PROTOCOL.md)).

> 📌 This plugin is an **original rewrite** of the workflow methodology popularized by Codex's official Product Design plugin (whose source is OpenAI Proprietary; no text or code copied). No affiliation with OpenAI — see [License & provenance](#license--provenance).

## Quick start

### Prerequisites

- DSH Desktop (contract verified on 0.1.2-alpha.1);
- Node.js `^22.19.0 || >=24` (the host runtime usually satisfies this already);
- PowerShell (the deploy script is `.ps1`).

### Install (one command)

```powershell
git clone https://github.com/Kayungko/dsh-plugin-product-design.git
cd dsh-plugin-product-design
pwsh install.ps1
```

The script copies the plugin into the profile's `node_modules/` (no `pnpm install`, the lockfile stays untouched) and registers the dependency + bundle in the profile manifest — **everything is backed up first** into `backups/<timestamp>/`.

**Restart DSH Desktop** afterwards — the ten skills are then visible in every session.

> 💡 Re-running is safe: file copies are idempotent and manifest registration de-duplicates.

### Verify

After the restart, send this to any session:

`/product-design sketch a settings page for a desktop pet app`

The router acknowledges, runs the brief gate (asks the minimum design questions) and — once a visual target exists — proposes three directions instead of jumping to code ✅

Uninstall: `pwsh install.ps1 -Uninstall` (also takes effect after restart).

## The ten skills

| Skill | Role |
|---|---|
| `product-design` | The single user entry (`/product-design`): analyzes and routes; routes only, never executes; "No Visual Target, No Build" |
| `pd-get-context` | Minimum design-brief gate |
| `pd-user-context` | Persistent product/design context (`~/.dsh/product-design/`) |
| `pd-research` | Evidence-grounded UX desktop research |
| `pd-ideate` | Three distinct visual directions (images when a generation tool is available, structured text otherwise) |
| `pd-image-to-code` | Chosen visual target → faithful interactive frontend |
| `pd-url-to-code` | Live URL → local frontend clone (evidence first) |
| `pd-audit` | Product-flow audit (user-facing, screenshot evidence) |
| `pd-design-qa` | Internal QA gate (`passed` / `blocked`) |
| `pd-share` | Deploy/share (only after the user picks a target) |

The nine `pd-*` sub-skills are model-visible but hidden from the user command list (`user-invocable: false`) — the model routes to them automatically.

## The workflow gates (the important part)

```text
explicit invoke / design-flavored request
  → pd-user-context preflight
  ├─ audit / critique: pd-audit directly (no brief gate; screenshot evidence inlined in the report)
  └─ design / build / clone / redesign / research:
      → pd-get-context (minimum brief: design goal + expected user outcome)
        ├─ no visual target: pd-ideate → 3 directions → user picks 1 → pd-image-to-code
        ├─ clone a live page: pd-url-to-code (evidence first, build only on evidence)
        ├─ redesign ("Like <URL>"): screenshot evidence → pd-ideate
        └─ user-pain research: pd-research
  before handoff: pd-design-qa hard gate (design-qa.md: only `passed` may ship)
  share: pd-share (only after the user selects a target)
```

- **No Visual Target, No Build** — no code without a visual target; "go for it / just assume" does not waive the three-direction flow;
- **design-qa hard gate** — if `design-qa.md` is missing or `final result` is not `passed`, the work may not be delivered as "done";
- **No fake assets** — div art / CSS art / hand-written SVG / emoji may never stand in for real icons or images;
- **Evidence rule** — audits use only evidence collected in the same turn; screenshots are inspected before adoption.

## Communication protocol

Every final reply: result first, non-technical language, and **exactly one next step** at the end. Full rules in [references/communication-protocol.md](references/communication-protocol.md).

## Capability boundaries (DSH adaptation)

| Capability | Status |
|---|---|
| Browser evidence | Playwright by default (via shell; first use prompts to install), or a user-supplied browser MCP; if neither is available, report honestly — never fabricate evidence |
| Image generation | Uses the session's image tool when present; otherwise `pd-ideate` emits structured text directions and states the degradation |
| Preview | Starts `npm run dev` locally and hands `http://127.0.0.1:<port>` to the user (the DSH Web GUI renders no preview) |
| Hosted sharing | Deploys only after the user selects a target (an authenticated static-hosting CLI on this machine, etc.) |

## Configuration (cordis.yml / patch)

```yaml
- id: product-design-runtime
  name: 'dsh-plugin-product-design'
  config:
    enabled: true
```

`enabled: false` skips the skill mount while the bundle still provides its `productDesign` descriptor. See [Architecture](docs/ARCHITECTURE.md).

Skill state directory: `~/.dsh/product-design/user-context.md` + `assets/` (`$DSH_HOME/product-design/`, overridable with `--state-dir`).

---

## For developers

Module layering, mount topology and the degradation strategy live in **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**. Quick reference only here.

### Development & tests

```powershell
npm run check                        # node --check every script
npm test                             # 13 unit tests (mocked host)
# after installing into a profile (see Quick start):
node verify-installed.mjs            # installed-location integration check: real host provider discovers 10 skills
```

### Directory

```text
dsh-plugin-product-design/
├── index.mjs               cordis entry · wiring (fire-and-forget skill mount)
├── skills.mjs              isolated skill provider (dynamic import, degrades to warning)
├── skills/                 10 skills: 1 entry + 9 pd-* (SKILL.md each; some with references/scripts)
├── references/             4 plugin-wide shared rules
├── scripts/bootstrap-prototype.mjs  create a new prototype from the template
├── templates/prototype/    original minimal Vite + React starter
├── cordis.patch.yml        isolated plugin-group mount descriptor
├── install.ps1             deploy script (copy-based install + automatic backups)
├── verify-installed.mjs    installed-location integration check
├── test/smoke.test.mjs     13 unit tests
├── assets/                 brand banners (light/dark)
└── docs/                   ARCHITECTURE.md · PROTOCOL.md · SKILLS.md · INSTALLATION.md
```

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — architecture: why skill-only, mount topology, degradation strategy
- **[docs/PROTOCOL.md](docs/PROTOCOL.md)** — workflow gates & host contract, field-tested (injection surface, skill-mount contract, capability boundaries, verification records)
- **[docs/SKILLS.md](docs/SKILLS.md)** — skill reference: catalog, routing rules, typical chains, per-skill contracts, shared rule index
- **[docs/INSTALLATION.md](docs/INSTALLATION.md)** — installation guide: installer behavior, verification criteria, uninstall semantics, installed layout, troubleshooting
- **[CHANGELOG.md](CHANGELOG.md)** — release history
- **[references/](references/)** — the four shared rule files the skills actually load

## License & provenance

This plugin is [MIT](LICENSE). The workflow methodology (brief gate → three directions → build → QA gate, evidence-grounded audits) is inspired by Codex's official Product Design plugin; all text, scripts and templates in this repository are an **original rewrite** — no OpenAI proprietary content copied (their source is unpublished, licensed Proprietary). No affiliation with OpenAI.

The `@deepseek-ai/*` host packages it runs against belong to and are licensed by DeepSeek Harness; they are not covered by this repository's license.
