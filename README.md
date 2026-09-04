# dsh-plugin-product-design

DeepSeek Harness（DSH Desktop）上的 **Product Design 工作流套件**：把早期的产品想法，
经过最小设计简报、三个差异化视觉方向、证据化的审计与研究、忠实的 URL 克隆、
响应式前端构建，一路带到 **design-qa 硬闸门** 之后的交付。

插件以 **10 个 `pd-*` skills** 的形式进入每个会话的技能目录，不注册任何模型工具、
斜杠命令或客户端模块——纯技能、可热更新、随插件卸载消失。

> 本插件是对 Codex 官方 Product Design 插件**工作流方法论的原创重写**
> （原文内容为 OpenAI Proprietary，未复制其文案与代码），与 OpenAI 无关联。
> 详见下方「来源与许可」。

## 安装

```powershell
pwsh install.ps1            # 复制进 ~/.dsh/profiles/desktop 并登记 manifest（自动备份）
pwsh install.ps1 -Uninstall # 移除
```

安装后 **重启 DSH Desktop**。重启后每个会话的技能目录都会列出 `pd-*` 技能；
`/pd-index` 是路由入口，也可以直接用自然语言触发（如"审计这个注册流程"）。

开发自检：

```powershell
npm run check   # node --check 全部脚本
npm test        # node --test 单元测试（mock 宿主）
node verify-installed.mjs   # 安装态集成验证（真实宿主 provider 发现 10 个技能）
```

## 工作流

```
显式唤起 / 设计类请求
  → pd-user-context preflight（~/.dsh/product-design/user-context.md）
  → pd-get-context（最小简报：设计目标 + 期望的用户结果，回放后同轮继续）
    ├─ 无视觉目标：pd-ideate 出 3 个方向 → 用户选 1 → pd-image-to-code
    ├─ 克隆线上页：pd-url-to-code（先取证、只按证据构建）
    ├─ 重设计（"Like <URL>"）：截图取证 → pd-ideate
    ├─ 审计 / 批评：pd-audit（截图证据内联报告）
    └─ 用户痛点研究：pd-research
  构建完成前：pd-design-qa 硬闸门（design-qa.md：final result: passed 才可交付）
  分享：pd-share（用户选定目标后才部署）
```

| Skill | 角色 |
|---|---|
| `pd-index` | 路由器：只路由不干活；"No Visual Target, No Build" |
| `pd-get-context` | 最小设计简报闸门 |
| `pd-user-context` | 持久化产品/设计上下文（`~/.dsh/product-design/`） |
| `pd-research` | 证据化 UX 桌面研究 |
| `pd-ideate` | 三个差异化视觉方向（有图像生成工具出图，否则结构化文字方向） |
| `pd-image-to-code` | 选定视觉目标 → 忠实交互前端 |
| `pd-url-to-code` | 线上 URL → 本地前端克隆（证据先行） |
| `pd-audit` | 产品流审计（用户面向，截图证据） |
| `pd-design-qa` | 内部 QA 闸门（`passed`/`blocked`） |
| `pd-share` | 部署分享（用户选定目标后执行） |

## 关键契约

- **No Visual Target, No Build**：没有视觉目标不写代码；"go for it / 做个假设"不豁免三方向流程。
- **design-qa 硬闸门**：`design-qa.md` 不存在或 `final result` 不是 `passed`，不得按"完成"交付。
- **禁假资产**：禁止 div art / CSS art / 手写 SVG / emoji 顶替真实图标与图片。
- **证据规则**：审计只用当轮采集的证据；截图先检视后采纳。
- **沟通协议**：结果先行、非技术语言、每次最终回复以恰好一个下一步收尾。

## 能力边界（DSH 适配）

| 能力 | 现状 |
|---|---|
| 浏览器取证 | 默认 Playwright（经 shell，首次使用会提示安装），或用户自备浏览器 MCP；都不可用时如实报告，不伪造证据 |
| 图像生成 | 会话接入了图像生成工具则出图；否则 `pd-ideate` 产出结构化文字方向并明示降级 |
| 预览 | 本地起 `npm run dev`，把 `http://127.0.0.1:<port>` 交给用户在浏览器打开（DSH Web GUI 不渲染预览） |
| 托管分享 | 用户选定目标（本机已认证的静态托管 CLI 等）后才部署 |

## 结构

```
plugin-product-design/
├─ package.json              # dsh.bundle.patch → cordis.patch.yml
├─ cordis.patch.yml          # 隔离 cordis-plugin-group
├─ index.mjs                 # apply(ctx)：挂载隔离 skill provider
├─ skills.mjs                # providerName 'product-design'，仅服务本包 skills/
├─ skills/                   # 10 个 pd-* 技能（各含 SKILL.md，部分含 references/scripts）
├─ references/               # 4 个插件级共享规则
├─ scripts/bootstrap-prototype.mjs   # 从模板创建新原型
├─ templates/prototype/      # 原创极简 Vite + React starter
├─ install.ps1               # 复制式部署（备份 + manifest 登记）
├─ test/smoke.test.mjs       # 单元测试（node --test）
└─ verify-installed.mjs      # 安装态集成验证
```

技能状态目录：`~/.dsh/product-design/user-context.md` + `assets/`
（`$DSH_HOME/product-design/`，可用 `--state-dir` 覆盖）。

## 来源与许可

工作流方法论（简报闸门 → 三方向 → 构建 → QA 闸门、证据化审计等）受 Codex 官方
Product Design 插件启发；本仓库全部文案、脚本与模板为**原创重写**，未复制
OpenAI 的专有内容（其源未公开、许可为 Proprietary）。本插件与 OpenAI 无关联。

插件壳的挂载模式与 `dsh-plugin-task-coordinator` 同源
（隔离 `@deepseek-ai/dsh-skill-filesystem` provider）。

License: [MIT](LICENSE)
