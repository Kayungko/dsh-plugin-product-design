# 安装指南

把 `dsh-plugin-product-design` 部署进 DSH Desktop profile、验证它、再卸载。安装器是复制式的，刻意不跑 `pnpm install`——运行中 profile 的 lockfile 与 market 管理的版本保持不动。

## 前置条件

- DSH Desktop，宿主带 `@deepseek-ai/dsh-skill-filesystem`（peer dependency 范围 `>=0.1.2-0 <0.2.0`）
- PowerShell 7+（`pwsh`）在 `PATH`
- 默认 profile 在 `~/.dsh/profiles/desktop`（profile 在别处时用 `-Profile` 覆盖）

## 安装

在仓库根目录：

```powershell
pwsh install.ps1
```

然后**重启 DSH Desktop** 加载 bundle。重启后 `/product-design` 是唯一用户入口；9 个 `pd-*` 子技能模型可见、命令列表隐藏。

### 安装器做了什么

1. **备份。** 把 profile 的 `package.json`（以及存在时的 `.package-map.json`）复制到 `<source>/backups/<yyyyMMdd-HHmmss>/`。每次运行都产生新的时间戳备份。
2. **复制文件。** `package.json`、`cordis.patch.yml`、`index.mjs`、`skills.mjs`、`README.md`、`LICENSE` 在 `<profile>/node_modules/dsh-plugin-product-design/` 下原位覆盖。（原位覆盖而非先删后建：Windows 拒绝删除任何进程的当前工作目录，且宿主把模块留在内存里时覆盖仍然可用。）
3. **复制内容目录。** `skills/`、`references/`、`scripts/`、`templates/` **先删后拷**，保证重跑幂等——往已存在目录里 Copy-Item 会嵌套出 `skills\skills` 并留下陈旧文件。
4. **登记进 profile manifest。** 写入 `dependencies["dsh-plugin-product-design"] = "file:<绝对源路径>"`，并把包追加进 `dsh.profile.bundles`（仅一次）。
5. **记账。** 若 `<profile>/node_modules/.package-map.json` 存在且还没有本插件条目，补一条（只增不改）。

脚本总是先 `Set-Location` 到自身目录——不要把目标目录当当前目录来跑它。

选项：

```powershell
pwsh install.ps1 -Source <plugin dir>   # 从另一份 checkout 安装
pwsh install.ps1 -Profile <profile dir> # 非默认 profile
```

## 验证

重启后，在仓库根目录跑安装态集成验证：

```powershell
node verify-installed.mjs
```

它对着**真实**安装副本与**真实**宿主 provider 包检查三件事：

1. **登记** — profile 下存在插件目录；manifest 依赖是 `file:` 说明符；bundle 列在 `dsh.profile.bundles`。
2. **文件完整** — 11 条必需的 shell/规则/脚本/模板路径，加全部 10 个技能目录、每个都有 `SKILL.md`。
3. **宿主集成** — 从 DSH Desktop 自己的 `node_modules` 加载 `FileSystemSkillProvider`，指向已安装的 `skills/` 目录，断言**恰好发现预期的 10 个技能**、全部带 `provider: 'product-design'` 标记、每个技能正文都能从目录资源基加载。

退出码 `0` 表示安装健康。非默认位置的选项：

```powershell
node verify-installed.mjs --profile <profile dir> --app-node-modules <host node_modules dir>
```

默认 `--app-node-modules` 是 `%LOCALAPPDATA%\Programs\DSHDesktop\DSH Desktop\resources\app.asar.unpacked\node_modules`。

仓库内的开发自检（安装前）：

```powershell
npm run check   # node --check 全部脚本
npm test        # node --test 单元套件（mock 宿主）
```

## 卸载

```powershell
pwsh install.ps1 -Uninstall
```

从 `dsh.profile.bundles` 移除 bundle 条目、删掉 `dependencies` 条目、删除 `<profile>/node_modules/dsh-plugin-product-design/`。重启 DSH Desktop 生效。技能随插件一起从目录消失；状态目录 `~/.dsh/product-design/`（用户上下文与已存资产）**不**被卸载触碰。

## 安装后布局

```text
~/.dsh/profiles/desktop/
├─ package.json                          # profile manifest：dependencies + dsh.profile.bundles
└─ node_modules/
   ├─ .package-map.json                  # pnpm 记账（只增条目）
   └─ dsh-plugin-product-design/
      ├─ package.json
      ├─ cordis.patch.yml
      ├─ index.mjs
      ├─ skills.mjs
      ├─ README.md
      ├─ LICENSE
      ├─ skills/                         # 10 个技能 bundle
      ├─ references/                     # 4 个插件级规则文档
      ├─ scripts/bootstrap-prototype.mjs
      └─ templates/prototype/            # Vite + React starter
```

运行时状态独立于 profile 存放：

```text
~/.dsh/product-design/
├─ user-context.md
└─ assets/
```

## 排错

| 症状 | 可能原因 | 处理 |
|---|---|---|
| 会话目录里看不到技能 | 安装后没重启 DSH Desktop | 重启 DSH Desktop |
| 重启后仍看不到 | bundle 未登记 | 跑 `node verify-installed.mjs`；检查 profile `package.json` 的 `dsh.profile.bundles` |
| 宿主日志：`skills not mounted, dsh-skill-filesystem unavailable` | 宿主缺 skill-provider 包（旧版 DSH） | 升级 DSH Desktop；插件已优雅降级，本仓库无需动作 |
| 安装失败：`profile manifest not found` | `-Profile` 路径错 | `-Profile` 指向含 profile `package.json` 的目录 |
| 安装失败：`plugin source not found` | `-Source` 缺 `package.json` | 在仓库根目录跑，或修正 `-Source` |
| 验证：`host dsh-skill-filesystem resolvable` FAIL | DSH 装在非默认位置 | 给 `verify-installed.mjs` 传 `--app-node-modules` |
| 编辑后技能内容陈旧 | 改在仓库而非安装副本 | 重跑 `pwsh install.ps1`（幂等）；或直接编辑已安装 `skills/` 走热加载 |
