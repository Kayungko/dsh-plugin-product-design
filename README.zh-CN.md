<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/banner-dark.svg">
  <img src="./assets/banner-light.svg" alt="product-design" width="600">
</picture>

**Brief · Explore · Build · QA — DeepSeek Harness 的 Product Design 工作流插件**

[![DSH 0.1.2-alpha.1 实测](https://img.shields.io/badge/DSH-0.1.2--alpha.1%20实测-16A34A?style=for-the-badge)](docs/PROTOCOL.md)
[![Node.js](https://img.shields.io/badge/Node.js-%5E22.19%20%7C%20%3E%3D24-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](package.json)
[![13 个单元测试](https://img.shields.io/badge/tests-13%20unit-0EA5E9?style=for-the-badge)](test/smoke.test.mjs)
[![MIT](https://img.shields.io/badge/license-MIT-7C3AED?style=for-the-badge)](LICENSE)

[这是什么](#这是什么) · [快速开始](#快速开始) · [十个技能](#十个技能) · [工作流闸门](#工作流闸门最关键的一节) · [架构设计](docs/ARCHITECTURE.md) · [主机契约](docs/PROTOCOL.md) · [更新日志](CHANGELOG.md) · [English](README.md)

</div>

---

## 这是什么

**只有一个入口 `/product-design`——任何设计类请求都会被路由进一套有纪律的工作流：**

```text
/product-design 给习惯养成应用做一个 onboarding 流程
```

背后发生的事：入口技能分析需求后路由到 9 个专注的 `pd-*` 子技能——最小设计简报、三个差异化视觉方向、证据化的研究与审计、忠实的 URL 克隆、响应式前端构建，以及交付前的**硬闸门 design-qa**——任何一步没过，都不许叫"完成"。

- 这是一个**纯技能** DSH 插件：不注册模型工具、不挂客户端模块——全部表面是隔离 provider 上的 10 个技能；
- 技能**编辑热加载**、不遮蔽项目/用户技能、随插件卸载一起消失；
- 证据驱动是契约：截图先检视后采纳，禁止假资产；
- 前提只有一条：**DSH Desktop 已经装好并能启动**（插件不会替你启动宿主）。

> 📌 主机契约已在 **DSH 0.1.2-alpha.1** 实测；13 个单元测试 + 安装态集成验证全部通过（判据见 [主机契约](docs/PROTOCOL.md)）。

> 📌 本插件是对 Codex 官方 Product Design 插件**工作流方法论的原创重写**（原文内容为 OpenAI Proprietary，未复制其文案与代码），与 OpenAI 无关联——见 [许可与来源](#许可与来源)。

## 快速开始

### 前置条件

- DSH Desktop（主机契约按 0.1.2-alpha.1 验证）；
- Node.js `^22.19.0 || >=24`（宿主运行时通常已满足）；
- PowerShell（部署脚本是 `.ps1`）。

### 安装（一条命令）

```powershell
git clone https://github.com/Kayungko/dsh-plugin-product-design.git
cd dsh-plugin-product-design
pwsh install.ps1
```

脚本把插件复制进 profile 的 `node_modules/`（不跑 `pnpm install`、不碰 lockfile），并在 profile manifest 登记依赖与 bundle——**改前全部自动备份**到 `backups/<时间戳>/`。

装完**重启 DSH Desktop**，任何会话都能看到十个技能。

> 💡 重复执行是安全的：文件覆盖幂等，manifest 登记自动去重。

### 验证

重启后，把这句发给任意会话：

`/product-design 给桌面宠物应用画一个设置页`

路由器会确认需求、跑简报闸门（问最小设计问题），并且在视觉目标存在之前**给出三个方向而不是直接写代码** ✅

卸载：`pwsh install.ps1 -Uninstall`（同样重启后生效）。

## 十个技能

| Skill | 角色 |
|---|---|
| `product-design` | 唯一用户入口（`/product-design`）：分析需求并路由；只路由不干活；"No Visual Target, No Build" |
| `pd-get-context` | 最小设计简报闸门 |
| `pd-user-context` | 持久化产品/设计上下文（`~/.dsh/product-design/`） |
| `pd-research` | 证据化 UX 桌面研究 |
| `pd-ideate` | 三个差异化视觉方向（有图像生成工具出图，否则结构化文字方向） |
| `pd-image-to-code` | 选定视觉目标 → 忠实交互前端 |
| `pd-url-to-code` | 线上 URL → 本地前端克隆（证据先行） |
| `pd-audit` | 产品流审计（用户面向，截图证据） |
| `pd-design-qa` | 内部 QA 闸门（`passed` / `blocked`） |
| `pd-share` | 部署分享（用户选定目标后执行） |

9 个 `pd-*` 子技能对模型可见、但在用户命令列表隐藏（`user-invocable: false`）——由模型自动路由。

## 工作流闸门（最关键的一节）

```text
显式唤起 / 设计类请求
  → pd-user-context preflight
  ├─ 审计 / 批评：pd-audit 直达（不过简报闸门；截图证据内联报告）
  └─ 设计 / 构建 / 克隆 / 重设计 / 研究：
      → pd-get-context（最小简报：设计目标 + 期望的用户结果）
        ├─ 无视觉目标：pd-ideate 出 3 个方向 → 用户选 1 → pd-image-to-code
        ├─ 克隆线上页：pd-url-to-code（先取证、只按证据构建）
        ├─ 重设计（"Like <URL>"）：截图取证 → pd-ideate
        └─ 用户痛点研究：pd-research
  交付前：pd-design-qa 硬闸门（design-qa.md：final result 为 passed 才可交付）
  分享：pd-share（用户选定目标后才部署）
```

- **No Visual Target, No Build**——没有视觉目标不写代码；"go for it / 做个假设"不豁免三方向流程；
- **design-qa 硬闸门**——`design-qa.md` 不存在或 `final result` 不是 `passed`，不得按"完成"交付；
- **禁假资产**——div art / CSS art / 手写 SVG / emoji 一律不得顶替真实图标与图片；
- **证据规则**——审计只用当轮采集的证据；截图先检视后采纳。

## 沟通协议

每次最终回复：结果先行、非技术语言、**恰好一个下一步**收尾。完整规则见 [references/communication-protocol.md](references/communication-protocol.md)。

## 能力边界（DSH 适配）

| 能力 | 现状 |
|---|---|
| 浏览器取证 | 默认 Playwright（经 shell，首次使用会提示安装），或用户自备浏览器 MCP；都不可用时如实报告，不伪造证据 |
| 图像生成 | 会话接入了图像生成工具则出图；否则 `pd-ideate` 产出结构化文字方向并明示降级 |
| 预览 | 本地起 `npm run dev`，把 `http://127.0.0.1:<port>` 交给用户在浏览器打开（DSH Web GUI 不渲染预览） |
| 托管分享 | 用户选定目标（本机已认证的静态托管 CLI 等）后才部署 |

## 配置（cordis.yml / patch）

```yaml
- id: product-design-runtime
  name: 'dsh-plugin-product-design'
  config:
    enabled: true
```

`enabled: false` 时跳过技能挂载，但 bundle 仍 provide `productDesign` 描述符。见 [架构设计](docs/ARCHITECTURE.md)。

技能状态目录：`~/.dsh/product-design/user-context.md` + `assets/`（`$DSH_HOME/product-design/`，可用 `--state-dir` 覆盖）。

---

## 给开发者

模块分层、挂载拓扑与降级策略见 **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**。本节只留速查。

### 开发与测试

```powershell
npm run check                        # node --check 全部脚本
npm test                             # 13 个单元测试（mock 宿主）
# 安装进 profile 后（见快速开始）：
node verify-installed.mjs            # 安装态集成验证：真实宿主 provider 发现 10 个技能
```

### 目录

```text
dsh-plugin-product-design/
├── index.mjs               cordis 入口 · 装配（fire-and-forget 技能挂载）
├── skills.mjs              隔离技能 provider（动态 import，降级为 warning）
├── skills/                 10 个技能：1 入口 + 9 个 pd-*（各含 SKILL.md，部分含 references/scripts）
├── references/             4 个插件级共享规则
├── scripts/bootstrap-prototype.mjs  从模板创建新原型
├── templates/prototype/    原创极简 Vite + React starter
├── cordis.patch.yml        隔离插件组挂载描述
├── install.ps1             部署脚本（复制式安装 + 自动备份）
├── verify-installed.mjs    安装态集成验证
├── test/smoke.test.mjs     13 个单元测试
├── assets/                 品牌 banner（亮/暗）
└── docs/                   ARCHITECTURE.md · PROTOCOL.md · SKILLS.md · INSTALLATION.md
```

## 文档

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — 架构设计：为什么是纯技能插件、挂载拓扑、降级策略
- **[docs/PROTOCOL.md](docs/PROTOCOL.md)** — 工作流闸门与主机契约实测参考（注入面、技能挂载契约、能力边界、验证记录）
- **[docs/SKILLS.md](docs/SKILLS.md)** — 技能参考：目录、路由规则、典型链条、逐技能契约、共享规则索引
- **[docs/INSTALLATION.md](docs/INSTALLATION.md)** — 安装指南：安装器行为、验证判据、卸载语义、安装后布局、排错
- **[CHANGELOG.md](CHANGELOG.md)** — 版本更新日志
- **[references/](references/)** — 技能实际加载的 4 个共享规则文件

## 许可与来源

本插件代码 [MIT](LICENSE)。工作流方法论（简报闸门 → 三方向 → 构建 → QA 闸门、证据化审计等）受 Codex 官方 Product Design 插件启发；本仓库全部文案、脚本与模板为**原创重写**，未复制 OpenAI 的专有内容（其源未公开、许可为 Proprietary）。本插件与 OpenAI 无关联。

运行时依赖的 `@deepseek-ai/*` 宿主包归 DeepSeek Harness 官方所有与许可，不在本仓库许可范围内。
