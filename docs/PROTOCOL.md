# 工作流闸门与主机契约（实测版）

> 本文是「插件对宿主的全部假设」与「工作流契约的全部判据」的实测参考。改挂载方式、接新宿主版本或质疑某条闸门时，先读这里。架构分层见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 1. 宿主注入面（cordis）

- `cordis.patch.yml` 以**隔离插件组**挂载：`@deepseek-ai/cordis-plugin-group` + `group: true` + `isolate: { productDesign: true }`——插件故障不波及宿主，宿主异常也不被插件放大；
- `index.mjs` 的 `apply(ctx, input)` 消费 `input.enabled`（默认 `true`），并 `ctx.provide('productDesign', { version: VERSION, enabled })`——描述符**必然存在**，与技能挂载成败无关；
- 插件不 `inject` 任何宿主服务（`export const inject = []`）：纯技能形态对宿主零索取，只索取一个可选的 skill-filesystem 包（见 §2）。

## 2. 技能挂载契约（实测）

| 项 | 值 | 语义 |
|---|---|---|
| `providerName` | `'product-design'` | 永不与 DSH 默认 `filesystem` provider 冲突 |
| `includeDefaultRoots` | `false` | 不见项目/用户技能根——不遮蔽、不重复 |
| `customSkillDirs` | `[<bundle>/skills]` | 只见本包 10 个技能 |
| 热加载 | ✅ | 目录 watcher 生效，编辑 SKILL.md 免重启 |
| 卸载对称 | ✅ | 随插件卸载从技能目录消失 |

降级判据：`@deepseek-ai/dsh-skill-filesystem` 动态 import 失败或 `ctx.plugin(...)` 抛错 → **一条 warning，bundle 存活**（peerDependencies 声明 `>=0.1.2-0 <0.2.0`，缺失即降级，不拖垮宿主）。

实测：`verify-installed.mjs` 在安装态用真实 `@deepseek-ai/dsh-skill-filesystem` 包 + mock ctx，provider 发现 **10 个技能**（1 入口 + 9 子技能），子技能 `user-invocable: false` 生效。

## 3. 工作流契约（核心）

闸门是技能正文里的硬规则，也是本插件与"随便写代码"的分界线。判据如下：

| 契约 | 判据 | 执行点 |
|---|---|---|
| 简报闸门 | 设计目标 + 期望的用户结果两项不齐，不得进入构建；回放后同轮继续 | `pd-get-context` |
| No Visual Target, No Build | 没有视觉目标不写代码；"go for it / 做个假设"**不豁免**三方向流程 | `product-design` 路由 + `pd-ideate` |
| 三方向探索 | 无视觉目标时出 3 个差异化方向，用户选 1 才构建 | `pd-ideate` |
| design-qa 硬闸门 | `design-qa.md` 不存在或 `final result` ≠ `passed` → 不得按"完成"交付 | `pd-design-qa` |
| 禁假资产 | div art / CSS art / 手写 SVG / emoji 不得顶替真实图标与图片 | 全部构建类技能 |
| 证据规则 | 审计只用当轮采集的证据；截图**先检视后采纳** | `pd-audit` / `pd-research` / `pd-url-to-code` |

路由判据（入口技能）：显式唤起或设计类请求先过 `pd-user-context` preflight；审计/批评**直达 `pd-audit`，不过简报闸门**（与构建并存时先审计再继续正常流程）；其余设计类请求过简报闸门后按目标形态分流——无视觉目标走三方向、克隆线上页走 `pd-url-to-code`（证据先行）、"Like \<URL\>" 重设计先截图取证、痛点研究走 `pd-research`；交付前一律过 design-qa；`pd-share` 只在用户选定目标后执行。

## 4. 沟通协议

- 结果先行：最终回复第一句是结论；
- 非技术语言：面向用户不暴露工具名/内部路径；
- **恰好一个下一步**收尾：不多给选项堆，不少给悬空句。

完整规则见 [../references/communication-protocol.md](../references/communication-protocol.md)；另三个共享规则（关键覆盖、存量代码编辑、本原型预检）在同目录按需加载。

## 5. 宿主能力边界（实测）

| 能力 | 首选 | 降级 | 红线 |
|---|---|---|---|
| 浏览器取证 | Playwright（经 shell，首次提示安装） | 用户自备浏览器 MCP | 都不可用 → 如实报告，**不伪造证据** |
| 图像生成 | 会话图像工具 | `pd-ideate` 结构化文字方向并明示降级 | 不拿会话主模型顶替图像工具 |
| 预览 | 本地 `npm run dev`，交 `http://127.0.0.1:<port>` | —（DSH Web GUI 不渲染预览） | 不承诺宿主内预览 |
| 托管分享 | 用户选定目标（本机已认证静态托管 CLI 等） | 不部署 | 未选定目标不得部署 |

## 6. 用户上下文契约

- 状态目录：`~/.dsh/product-design/`（`$DSH_HOME/product-design/`，脚本支持 `--state-dir` 覆盖）；
- `user-context.md` 持久化产品/设计上下文，`pd-user-context` 技能在路由前 preflight 读取；
- 随附 Node 脚本（`skills/user-context/scripts/`）做初始化与预检，`npm run check` 语法覆盖；脚本缺失或失败不阻断路由——降级为无上下文运行。

## 7. 已知边界

- DSH Web GUI 不渲染本地预览，预览链接只能交给用户在外部浏览器打开；
- 图像生成能力取决于会话是否接入图像工具，插件本身不携带生成密钥；
- Playwright 首装需要用户确认，未安装时取证路径走浏览器 MCP 或如实降级；
- 技能面路由依赖模型对技能正文的遵循——闸门是"模型契约"而非代码强制，design-qa 的 `passed` 由执行会话写出。

## 8. 验证记录

| 项 | 结果 | 判据 |
|---|---|---|
| 单元测试 | 13/13 通过 | `npm test`（mock 宿主，覆盖路由/挂载配置/脚本语法面） |
| 安装态集成 | 通过 | `verify-installed.mjs`：真实宿主包 + mock ctx，provider 发现 10 技能 |
| 宿主版本 | DSH 0.1.2-alpha.1 | 安装 → 重启 → 技能目录可见 → 入口路由可用 |
| 部署对称 | 通过 | `install.ps1` 复制式安装 + 自动备份；`-Uninstall` 对称卸载 |
