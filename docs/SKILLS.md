# 技能参考

`dsh-plugin-product-design` 随附 10 个技能：1 个用户面向的路由入口 + 9 个模型可见的子工作流。权威来源是 `skills/` 下各 `SKILL.md`；本文是地图。

## 目录

| 技能 | 目录 | 用户命令 | 角色 |
|---|---|---|---|
| `product-design` | `skills/index/` | `/product-design`（唯一） | 分析请求并路由到正确的子工作流；只路由不干活 |
| `pd-get-context` | `skills/get-context/` | — | 最小设计简报闸门 |
| `pd-user-context` | `skills/user-context/` | — | 持久化产品/设计上下文 |
| `pd-research` | `skills/research/` | — | 证据化 UX 桌面研究 |
| `pd-ideate` | `skills/ideate/` | — | 三个差异化视觉方向 |
| `pd-image-to-code` | `skills/image-to-code/` | — | 选定视觉目标 → 忠实交互前端 |
| `pd-url-to-code` | `skills/url-to-code/` | — | 线上 URL → 本地前端克隆，证据先行 |
| `pd-audit` | `skills/audit/` | — | 用户面向的产品流审计，截图证据 |
| `pd-design-qa` | `skills/design-qa/` | — | 构建交付前的内部 QA 闸门 |
| `pd-share` | `skills/share/` | — | 用户选定目标后部署/分享原型 |

9 个 `pd-*` 技能都带 `user-invocable: false`：不占用用户命令列表，但模型可以加载——经路由指令，或直接由自然语言触发（如「审计这个注册流程」）。

## 路由规则（product-design）

路由器只决定下一步去哪个技能，从不做那个技能的活。

| 请求形态 | 路由 |
|---|---|
| 审计 / 评审 / 批评 / 评估既有体验 | **直达** `pd-audit`（先不过简报闸门）；若同一请求还要求构建，先审计再继续正常流程 |
| 克隆或复刻线上 URL | 直达 `pd-url-to-code` |
| 重设计 / 改进 /「Like \<URL\>」 | `pd-get-context` → 截图取证当前站点 → `pd-ideate` |
| 视觉构思 / 出方向 | `pd-get-context`（简报回放）→ `pd-ideate` |
| 无视觉目标的新应用 / 原型 / UI 构建 | `pd-get-context` → 回放假设 → `pd-ideate`（3 方向）→ 用户选 1 → `pd-image-to-code` |
| 设置 / 保存 / 召回产品上下文，「你能做什么？」 | `pd-user-context` |
| 分享 / 部署 / 发布原型 | `pd-share` |
| 任何工作流启动（shell 可用时） | 先跑 `pd-user-context` 的 preflight 脚本 |

路由器硬规则：

- **No Visual Target, No Build。** 没有 URL、截图、frame、mockup 或代码目标，就不脚手架、不改文件、不起服务，直到选定方向。`Go for it`、`做个假设`、甚至一份完整的简报都**不豁免**。
- 用户点名某个专注技能时，精确加载那个技能——绝不用「相关」技能顶替。
- 依赖取证的工作若无取证路径：告知用户一次，提供基于文字的降级方案，经同意才继续，且绝不声称降级结果已验证。

## 典型链条

```text
从零构建：
  pd-user-context preflight → pd-get-context → pd-ideate（3 方向）
  → 用户选 1 → pd-image-to-code → pd-design-qa（闸门）→ 交付 → pd-share（可选）

克隆线上页：
  pd-user-context preflight → pd-get-context → pd-url-to-code（证据先行）
  → pd-design-qa（闸门）→ 交付

重设计既有站点：
  pd-get-context → 截图取证当前站点 → pd-ideate →（构建链条）

审计 / 批评：
  pd-user-context preflight → pd-audit → 截图内联报告

用户痛点研究：
  pd-user-context preflight → pd-research → 排序后的研究简报
```

## 逐个技能参考

### `pd-get-context` — 最小设计简报闸门

在设计/构建/克隆/重设计请求的开头运行。只有当设计目标或期望的用户结果不清楚时才提问；已回答的问题绝不重问。两项都清楚时，用一段简短说明回放简报 + 默认值并**在同一轮继续**——回放不是审批请求。硬边界：任一缺失时不实现、不脚手架、不起服务、不写文件。长构建前发一条设定预期的说明；小改动、审计、研究、设置、分享请求跳过。

### `pd-user-context` — 持久化上下文

掌管 `~/.dsh/product-design/user-context.md` + `assets/`。在提供 onboarding 或声称任何东西「已为未来会话保存」之前，必须验证 shell 可用与状态目录可写；否则不提供 saved-context onboarding，技能明示这一点。保存条目遵循固定分类结构（8 个分类；空时 `status: not provided`），图片在 `assets/` 里用描述性文件名，秘密/凭据永不保存。Preflight：`node scripts/user-context-preflight.mjs`（输出 JSON payload）。设置流程在 `references/onboarding.md`。

### `pd-research` — UX 桌面研究

针对具名产品做新鲜、有出处的当前用户问题扫描：重述范围 → 经会话 web 工具扫公开来源（Reddit、X/HN、Stack Overflow、GitHub issues、论坛）→ 内部来源仅在用户提供访问时用 → 聚类到七类摩擦中信号最高的问题 → 按严重度 / 频率 / 置信度 / 杠杆排序 → 讲清一个产品故事。产出：executive read（5–7 句）、带证据与建议动作的排序问题、来源地图、以及 fix-this-week / this-quarter / needs-research 机会地图。不从个例过度外推。

### `pd-ideate` — 三个视觉方向

最小简报满足后恰好产出 3 个差异化方向。尺寸表：移动端 `390×844`、平板 `834×1194`、桌面/SaaS `1440×1024`、落地页 1440 宽可滚动、组件按自然尺寸、用户给的参考按其自身宽高比。有图像生成工具时：三个独立图像，每方向一张，prompt 用各自描述性命名（绝不叫「option 1/2/3」），编号在全部结果展示后按展示顺序赋予。没有时：三个结构化文字方向（概念、布局、层级、色板、字体 ≤2、关键状态、差异化）加一行 plain 文本的降级声明。质量线：一张聚焦的主屏，间距/字体优先于阴影，不默认居中 app 卡片，不卡片套卡片，移动端概念不画设备边框。选择消息固定为：`Which direction should I build: 1, 2, or 3? Or tell me what you'd like to refine or personalize first.`

### `pd-image-to-code` — 视觉目标 → 前端

是清单，不是指导。没有选定视觉目标拒绝开工（仅文字简报不算）。无歧义地解析选择——第 N 个**已展示**的构思结果、精确附件优于裸序数、文字方向规格作为设计契约；选择有歧义就停下构建。清点参考中所有图像资产（hero、缩略图、插画、logo、头像……），执行 Real Assets 规则，最多派 3 个资产子代理（只找/存/报告——绝不写码、开浏览器、部署）。核心体验做活（导航、输入、状态、真实 mock 数据的主旅程），外围控件只做视觉，不做未请求的页面或后端。然后：run → capture → `pd-design-qa` 闸门 → 带可点击本地 URL 交付。

### `pd-url-to-code` — 线上 URL → 本地克隆

以使用条款警示开头（只克隆用户拥有或可复刻的站点）。取证序列：确认对的页面 → 小步长从上到下滚动截图 → 在 `390×844` 移动端重复 → 从 DOM 与截图收集元素、文本、样式、资产、字体、响应式行为 → 逐个控件测试所有交互 → 真实资产复制到本地（不热链；替代物要记录）。**只按取证证据构建**——证据存在时不新增视觉想法、不猜测。硬规则：取证完成前不脚手架；「等资产」期间禁止临时 CSS/emoji/SVG 顶替。以同样的 compare → `pd-design-qa` 闸门 → 交付序列收尾。

### `pd-audit` — 用户面向的流程审计

产出不是意见：流程截图（内联引用）、编号步骤清单、绑定步骤/截图的 UX + 可访问性发现、以及截图能证明什么的明确边界。证据规则：只用当轮采集；每张截图先检视（空白/加载中/状态错误即拒）后采纳；编号文件名（`01-start.png`…）；不凭截图声称完整 WCAG 合规。框架（UX/可访问性/组合模式、lens、产出结构）在 `skills/audit/references/design-audit-framework.md`。间接证据（帮助中心页面、web 搜索）是研究，不是审计。

### `pd-design-qa` — 内部 QA 闸门

仅内部使用：交付前把源视觉目标与渲染实现对比；用户面向的批评走 `pd-audit`。要求两份产物都可打开、可比较——否则写 `design-qa.md` 且 `final result: blocked`。方法：同视口/状态/主题 → 两边都 capture → 判定前归一化裁切/密度 → 全视图加聚焦区域对比 → 五个**必备保真面**系统复查（字体/排版、间距/布局节奏、颜色/token、图像质量与资产保真、文案）。严重度：

| 严重度 | 含义 |
|---|---|
| `P0` | 阻断核心使用、严重可访问性失败、布局破碎 |
| `P1` | 用户会注意到的重大设计偏差或可用性回退 |
| `P2` | 中度漂移、状态不一致、响应式或可修复的打磨缺口 |
| `P3` | 小打磨；可留作后续 polish |

迭代循环：任何 P0–P2 发现都阻断，修复、重新 capture、重新对比，直到清零。`design-qa.md`（项目根）记录两份产物路径、视口、尺寸/密度归一化、全部证据、完整对比历史，以及恰好 `passed` 或 `blocked` 的 `final result`。构建只在 `passed` 时交付。完整 rubric 在 `skills/design-qa/references/qa-rubric.md`。

### `pd-share` — 部署与分享

确认原型目录与部署目标；若未选定，只问一个问题（本机静态托管 CLI / 隧道预览 / 其他）。部署前验证 `npm run build`，优先已认证 CLI（`vercel`、`netlify`、`surge`、`wrangler`……），直接部署而不是发配置说明，返回可分享 URL。用户选定目标前绝不部署；运行中的本地预览是原型的默认状态。

## 共享规则文档

插件级（`references/`，所有技能链接）：

| 文件 | 管辖 |
|---|---|
| `critical-overrides.md` | 简报先于构建、匹配源、仅真实资产、取证能力顺序（用户浏览器 MCP → shell 调 Playwright → 诚实文字降级）、saved-context 使用、DSH 构建交付措辞 |
| `communication-protocol.md` | 结果先行、不以工具名/路径开头、每次最终回复恰好一个下一步、DSH 预览交付 |
| `existing-codebase-edits.md` | 编辑既有应用：先检视、复用其设计系统、持久决策记入 `AGENTS.md` |
| `local-prototype-preflight.md` | 新原型走 `scripts/bootstrap-prototype.mjs`、`npm install`、早起 dev server、不硬编码端口 |

技能级：

| 文件 | 使用者 |
|---|---|
| `skills/audit/references/design-audit-framework.md` | `pd-audit` |
| `skills/design-qa/references/qa-rubric.md` | `pd-design-qa` |
| `skills/user-context/references/onboarding.md` | `pd-user-context` 设置流程 |
