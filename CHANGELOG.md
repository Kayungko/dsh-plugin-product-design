# 更新日志

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.1.4] - 2026-09-12

### Changed

- **宿主要求声明规范化**（五仓统一标准，权威文档 bridge 仓 `ECOSYSTEM.md §9`）：`@deepseek-ai/dsh-skill-filesystem` peerDep 扩为 `>=0.1.2-0 <0.2.0 || >=0.1.5-rc.1 <0.1.6`——semver 预发布规则下原范围不含 0.1.5-rc.1，市场/安装校验会误报 mismatch。运行时零变化；技能挂载面经漂移预检零破坏判定（2.0.9 活体目检归用户 GUI 检查单）。

## [0.1.3] - 2026-09-04

### Added

- **技能参考与安装指南**：新增 `docs/SKILLS.md`（技能目录、路由规则、典型链条、逐技能契约、共享规则索引）与 `docs/INSTALLATION.md`（安装器五步行为、验证三判据、卸载语义、安装后布局、排错表），自技能正文与安装器实现提炼。

### Fixed

- **路由图准确性**：审计/批评按 `skills/index/SKILL.md` 直达 `pd-audit`、不过简报闸门（与构建并存时先审计再继续正常流程）；修正双语 README 的闸门图与 `PROTOCOL.md` 路由判据表述。

## [0.1.2] - 2026-09-04

### Added

- **品牌资产**：新增 `assets/banner-light.svg` / `assets/banner-dark.svg`（P·D 正负形 monogram：正形为 D 轮廓、负形透出 P；透明画布、无背景底；一级文本全大写、二级文本经 `textLength` 与一级等宽），README 顶部以 `<picture>` 按系统偏好自动切换亮暗。

### Changed

- **文档迭代（对齐 dsh-plugin-task-coordinator 文档架构）**：`README.md` 重构为英文主版（徽章条 + 快速导航 +「What is this」+ 快速开始 + 技能面 + 工作流闸门 + 目录树 + 文档索引），原中文内容迁移并重构为 `README.zh-CN.md`；新增 `docs/ARCHITECTURE.md`（挂载拓扑、分层约束、降级策略）与 `docs/PROTOCOL.md`（工作流闸门与主机契约实测参考）；原 `assets/banner.svg` 更名 `banner-light.svg` 对齐命名；`package.json` 的 `files` 补录 `assets/`、`docs/`、`README.zh-CN.md`、`verify-installed.mjs`、`test/`。

### Fixed

- **措辞准确性**：技能面实为 1 个入口（`product-design`）+ 9 个 `pd-*` 子技能，修正 README 目录树、`ARCHITECTURE.md` 拓扑图、`skills.mjs` 与 `verify-installed.mjs` 注释/检查文案中「10 个 `pd-*`」的不准确表述。

## [0.1.1] - 2026-09-04

### Changed

- **收敛为单一用户入口**：路由技能改名 `pd-index` → `product-design`（命令 `/product-design`），描述改为"加载后分析需求并路由"；9 个子技能增加 `user-invocable: false`，退出用户命令列表但保留模型可见（AI 自动路由不变）。
- 子技能正文中的 `$pd-index` 路由引用同步改为 `$product-design`；测试 / 安装态验证 / README / 安装提示同步更新。

## [0.1.0] - 2026-09-04

### Added

- **首个版本**：10 个 `pd-*` 技能（路由 / 简报闸门 / 用户上下文 / 研究 / 视觉方向 / 图生码 / URL 克隆 / 审计 / 设计 QA / 分享），4 个共享规则文档，bootstrap 脚本与原创 Vite starter 模板，Node 化的用户上下文脚本。
- **隔离 `dsh-skill-filesystem` provider 挂载**：随插件安装/卸载、编辑免重启热加载、不遮蔽项目/用户技能。
- **部署与验证**：`install.ps1` 复制式部署（自动备份、幂等）+ `verify-installed.mjs` 安装态集成验证。
- 内容为原创重写（工作流方法论受 Codex Product Design 插件启发，未复制其专有内容）。

[Unreleased]: https://github.com/Kayungko/dsh-plugin-product-design/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/Kayungko/dsh-plugin-product-design/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/Kayungko/dsh-plugin-product-design/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/Kayungko/dsh-plugin-product-design/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Kayungko/dsh-plugin-product-design/releases/tag/v0.1.0
