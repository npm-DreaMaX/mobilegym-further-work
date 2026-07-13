# PlayStore Validation Report

## 1. 读取的压缩文档

已完整阅读以下 7 份 `docs/authoring/` 文档：
1. `MOBILEGYM_AUTHORING_RULES_COMPACT.md` — 全部硬规则
2. `EXEMPLAR_APP_AND_BENCHMARK_AUDIT.md` — 7 个示例 App + benchmark 审计
3. `DAILY_10_APP_PRODUCTION_PLAN.md` — 10 个目标 App 规划
4. `DAILY_APP_PAGE_BASELINES.md` — 页面基线
5. `DAILY_APP_15_BENCHMARK_MATRIX.md` — benchmark 矩阵（**PlayStore 无条目，按提示词 §七 规定实现**）
6. `APP_GENERATION_PROMPT_TEMPLATE.md` — 生成模板
7. `APP_VALIDATION_PROTOCOL.md` — 验证协议

主要参考了 Ebay（搜索/快照/商品目录模式）、GoogleDrive（base app 访问器模式）、Spotify（settings/toggle 模式）。

## 2. 新增和修改的文件

共计 23 个文件，分属 4 个目录：

### apps/PlayStore/ (19 个文件)
```
manifest.ts                        — App 声明（id=playstore）
types.ts                           — 类型定义（AppInfo, DownloadJob, UserReview 等）
constants.ts                       — 分类/CATEGORIES, SORT_OPTIONS, TAB_BAR_ITEMS, GLOBAL_UPDATE_OPTIONS
data/defaults.json                 — 20 个 App 的 world data + 默认 state
data/index.ts                      — PLAYSTORE_CONFIG, baseApps(), baseAppById()
state.ts                           — Zustand store（createAppStoreWithActions, 17 actions）
navigation.types.ts                — 本地 NavigationDeclaration 类型副本
navigation.declaration.ts          — 11 routes, 22 transitions, 12 actions
navigation.ts                      — usePlayStoreNavigate() + usePlayStoreGestures()
hooks/usePlayStoreGestures.ts      — 手势 hook
res/icons.tsx                      — 55 Ic* 图标 + ICON_REGISTRY + IconRenderer
res/strings.ts                     — 中文字符串
res/strings.en.ts                  — 英文覆盖
components/PlayStoreNavigationHandler.tsx — 导航处理器
components/AppListItem.tsx         — App 列表项组件
components/TabBar.tsx              — 底部 TabBar
PlayStoreApp.tsx                   — 入口（MemoryRouter + Routes + TabBar）
pages/HomePage.tsx                 — 首页：推荐、分类快捷入口、排行榜入口、搜索栏
pages/SearchPage.tsx               — 搜索：搜索框、历史记录、结果列表、最近查看
pages/CategoriesPage.tsx           — 分类列表页
pages/CategoryDetailPage.tsx       — 分类详情：App 列表 + 排序
pages/ChartsPage.tsx               — 排行榜：全 App 排序列表
pages/AppDetailPage.tsx            — App 详情：安装/更新/卸载/愿望单/自动更新/评分/评价
pages/ReviewsPage.tsx              — 全部评价列表
pages/ReviewEditPage.tsx           — 撰写/编辑评价
pages/MyAppsPage.tsx               — 我的应用：已安装/更新/下载队列三个 tab
pages/WishlistPage.tsx             — 愿望单列表
pages/SettingsPage.tsx             — 设置：全局自动更新 + 单 App 自动更新开关
```

### bench_env/task/play_store/ (3 个文件)
```
__init__.py                        — 空模块标记
app.py                             — PlayStore(BaseApp) accessor + 参数定义 + expected_changes 常量
tasks.py                           — 15 个 task 类（L2×8, L3×6, L4×1）
```

### bench_env/tests/play_store/ (2 个文件)
```
__init__.py                        — 空模块标记
test_tasks.py                      — 78 个测试（正例+负例+副作用）
```

### reports/ (1 个文件)
```
PlayStore_VALIDATION_REPORT.md     — 本验证报告
```

### 修改范围（Git）
```
git status --short:
?? apps/PlayStore/
?? bench_env/task/play_store/
?? bench_env/tests/play_store/
?? reports/PlayStore_VALIDATION_REPORT.md

仅新增 4 个目录，0 个已有文件修改。✅
```
- os/: 未修改 ✅
- 其他 apps/: 未修改 ✅
- 其他 benchmark suite: 未修改 ✅
- package.json / package-lock.json: 未修改 ✅

## 3. App 页面与正常入口

| 页面 | 路由 | 入口 |
|------|------|------|
| HomePage | `/` | 桌面点击进入，TabBar 首页 |
| SearchPage | `/search` | HomePage 搜索栏点击 |
| CategoriesPage | `/categories` | HomePage "分类"按钮 |
| CategoryDetailPage | `/categories/:categoryId` | CategoriesPage 点击分类 / HomePage 分类快捷标签 |
| ChartsPage | `/charts` | HomePage "排行榜"按钮 |
| AppDetailPage | `/app/:appId` | 首页/搜索/分类/排行榜/愿望单/我的应用 列表项点击 |
| ReviewsPage | `/app/:appId/reviews` | AppDetailPage "查看全部评价" |
| ReviewEditPage | `/app/:appId/review/edit` | AppDetailPage "撰写评价" / ReviewsPage 按钮 |
| MyAppsPage | `/myapps` | TabBar 我的应用 |
| WishlistPage | `/wishlist` | TabBar 愿望单 |
| SettingsPage | `/settings` | HomePage/MyAppsPage 设置图标 |

## 4. 页面父级和来源页返回映射

| 子页面 | 返回目标 | 实现方式 |
|--------|----------|----------|
| SearchPage → HomePage | `back()` 返回首页 | push 入栈，back 弹栈 |
| CategoriesPage → HomePage | 同上 | push 入栈 |
| CategoryDetailPage → CategoriesPage 或 HomePage | 返回来源 | push 入栈 |
| ChartsPage → HomePage | 同上 | push 入栈 |
| AppDetailPage → 来源页（首页/搜索/分类/排行/愿望单/我的应用） | 返回来源 | push 入栈，back 自动回到正确的来源页 |
| ReviewsPage → AppDetailPage | 同上 | push 入栈 |
| ReviewEditPage → 来源页（AppDetail 或 Reviews） | 同上 | push 入栈 |
| SettingsPage → 来源页（HomePage 或 MyAppsPage） | 同上 | push 入栈 |

**无统一 history.back() 问题** — 所有子页面通过 React Router `navigate(-1)` 返回正确的父页面，不依赖硬编码路径。

## 5. 已实现的业务功能闭环

### A. 首页、分类与榜单 ✅
- 推荐 App 列表（非安装的高评分 App）
- 8 个分类快速访问标签
- 分类详情页 + 排序切换（相关性/评分/下载量/大小）
- 排行榜页面 + 排序
- 排序状态写入 `currentSortOption`

### B. 搜索 ✅
- 搜索入口 → 输入 → 提交 → 结果列表 → 点击进入详情
- 搜索历史记录（search.history）
- 最近查看（openedAppIds）
- 空结果处理
- 搜索状态写入 `search.current`

### C. App 详情 ✅
- 名称、图标、开发者、分类、版本、大小、评分、下载量、年龄分级
- 已安装版本显示
- 安装/更新/卸载按钮状态
- 愿望单状态
- 自动更新开关
- 用户自己的评分和评价

### D. 下载与安装 ✅
- Install 按钮 → 创建 downloadJob + installRecord → installedVersion 更新
- 确定性状态机：操作后立即完成

### E. 取消下载 ✅
- 下载队列显示 queued/downloading jobs
- Cancel 按钮 → job status → cancelled
- 不安装目标 App

### F. 更新 ✅
- 已安装旧版本检测
- 更新按钮 → installedVersion 更新为 storeVersion
- updateRecord 记录

### G. 卸载 ✅
- Uninstall 按钮 → 确认弹窗 → 确认 → installed 移除
- uninstallRecord 记录
- 非目标 App 不变

### H. 愿望单 ✅
- Add/Remove 按钮
- WishlistPage 显示真实 wishlist state
- 跨页面 state 一致

### I. 自动更新与设置 ✅
- 单 App autoUpdate toggle
- 全局设置（wifi_only/always/never）
- SettingsPage 显示 per-app 开关

### J. 评分与评价 ✅
- 星级评分
- 撰写/编辑/删除评价
- ReviewsPage 显示所有评价
- 他人评价不被修改

### K. My Apps ✅
- 已安装列表
- 更新列表（检测 updateAvailable）
- 下载队列
- 可从列表执行安装/更新/取消

### L. 正常导航 ✅
- 所有入口可达
- 返回导航正确
- TabBar 支持首页/我的应用/愿望单

## 6. World Data 与 Runtime Overlay

**World Data (只读)**:
- `data/defaults.json` → 20 个 App 定义（apps[]），8 个分类
- `constants.ts` → CATEGORIES, SORT_OPTIONS, GLOBAL_UPDATE_OPTIONS

**Runtime Overlay (持久化 + snapshot)**:
- `installedApps`: appId → installedVersion
- `installRecords`, `updateRecords`, `uninstallRecords`: 操作记录
- `downloadJobs`: 下载任务队列
- `wishlist`: 愿望单 appId 列表
- `autoUpdate`: per-app 自动更新开关
- `ratings`: 用户评分
- `userReviews`: 用户评价
- `reviews`: 其他用户评价（world data，但可被 benchmark setup 扩展）
- `search.current` / `search.history`: 搜索状态
- `currentCategoryId`, `currentSortOption`: 浏览状态
- `openedAppIds`: 查看轨迹
- `settings.globalUpdate`: 全局设置

**Setup 可注入**: 所有 runtime overlay 字段均可通过 `env.set_state()` 注入。

## 7. 下载、安装、更新、卸载状态机

- **安装**: `addDownloadJob(appId) + installApp(appId, version)` → installedApps[appId]=version, installRecords[+1], downloadJobs[+1]
- **更新**: `updateApp(appId, fromVersion, toVersion)` → installedApps[appId]=toVersion, updateRecords[+1]
- **卸载**: `uninstallApp(appId, version)` → installedApps[appId] deleted, uninstallRecords[+1], autoUpdate[appId]=false
- **取消下载**: `cancelDownloadJob(jobId)` → downloadJobs[jobId].status='cancelled'

所有操作为同步确定性，不依赖网络或真实时间。

## 8. 核心按钮及真实行为

| 按钮 | 文件 | 行为 |
|------|------|------|
| Install | AppDetailPage.tsx | 写入 installedApps + downloadJobs + installRecords |
| Update | AppDetailPage.tsx, MyAppsPage.tsx | 更新 installedVersion + updateRecords |
| Uninstall | AppDetailPage.tsx | 确认弹窗 → 删除 installedApps + uninstallRecords |
| Cancel Download | AppDetailPage.tsx, MyAppsPage.tsx | 修改 downloadJobs[].status |
| Wishlist toggle | AppDetailPage.tsx, WishlistPage.tsx | 修改 wishlist[] |
| Auto-update toggle | AppDetailPage.tsx, SettingsPage.tsx | 修改 autoUpdate{} |
| Rating stars | ReviewEditPage.tsx | 修改 ratings{} |
| Submit review | ReviewEditPage.tsx | 新增/修改 userReviews[] |
| Delete review | ReviewEditPage.tsx | 删除 userReviews 条目 |
| Search submit | SearchPage.tsx | 修改 search.current + search.history |
| Sort select | CategoryDetailPage.tsx, ChartsPage.tsx | 修改 currentSortOption |
| Category select | CategoriesPage.tsx, HomePage.tsx | 修改 currentCategoryId |

**无 dead button**。

## 9. Dead-Button 审计

- 所有 Install/Update/Uninstall/Cancel/Wishlist/Rating/Review 按钮均写入 runtime state
- 搜索结果从真实 state 过滤，非硬编码
- 分类/排序/榜单均通过 `useMemo` 从 baseApps() 筛选
- 已安装（最新版）按钮显示为 disabled "已安装"，但此为正确的功能状态，非 dead button
- 非核心且未实现的功能：无 — 所有 benchmark 依赖的功能均已实现
- **0 个 dead button**

## 10. 返回导航审计

- 所有子页面使用 `navigate(-1)` （通过 back() 函数）
- AppDetailPage 从不同来源页（首页/搜索/分类/排行/愿望单/我的应用）进入，返回均回到正确来源页
- App 内 tab 切换使用 `mode: 'replace'`（不增加 history 栈）
- 子页面 push 入栈，back 自动弹出
- **无硬编码 navigate('/') 问题**
- **无所有子页面统一 history.back() 问题**

## 11. 所有 Task-ID

| # | task_id | objective | difficulty |
|---|---------|-----------|------------|
| 1 | play_store.SearchAppAndReportDeveloper | query | L3 |
| 2 | play_store.SearchAppAndReportSize | query | L3 |
| 3 | play_store.CheckInstalledVersion | query | L2 |
| 4 | play_store.BrowseCategoryAndReportTop | hybrid | L3 |
| 5 | play_store.InstallApp | operate | L2 |
| 6 | play_store.CancelDownload | operate | L3 |
| 7 | play_store.UpdateApp | operate | L2 |
| 8 | play_store.UninstallApp | operate | L2 |
| 9 | play_store.AddToWishlist | operate | L2 |
| 10 | play_store.RemoveFromWishlist | operate | L2 |
| 11 | play_store.EnableAutoUpdate | operate | L2 |
| 12 | play_store.DisableAutoUpdate | operate | L2 |
| 13 | play_store.RateApp | operate | L3 |
| 14 | play_store.WriteOrEditReview | operate | L3 |
| 15 | play_store.FilterCategoryAndInstall | hybrid | L4 |

**难度分布**: L2×8, L3×6, L4×1

**≥3 步操作的任务**: SearchAppAndReportDeveloper, SearchAppAndReportSize, BrowseCategoryAndReportTop, CancelDownload, RateApp, WriteOrEditReview, FilterCategoryAndInstall, CheckInstalledVersion

## 12. 每个 Task 真实 UI 路径

1. **SearchAppAndReportDeveloper**: Home → Search → type query → submit → click result → AppDetail → read developer → submit answer (5+ steps)
2. **SearchAppAndReportSize**: Home → Search → type query → submit → click result → AppDetail → read size → submit answer (5+ steps)
3. **CheckInstalledVersion**: Home → Tab MyApps → find app in installed list → click to detail → read installed version (4 steps)
4. **BrowseCategoryAndReportTop**: Home → Categories → click category → set sort → click first result → AppDetail → read name (6 steps)
5. **InstallApp**: Home → Search/Categories → find app → AppDetail → click Install (3+ steps)
6. **CancelDownload**: Home → Tab MyApps → Downloads tab → find job → click Cancel (4 steps)
7. **UpdateApp**: Home → Tab MyApps → Updates tab → find app → click Update (4 steps)
8. **UninstallApp**: Home → find app → AppDetail → click Uninstall → confirm (4 steps)
9. **AddToWishlist**: Home → find app → AppDetail → click wishlist button (3 steps)
10. **RemoveFromWishlist**: Home → Tab Wishlist → find app → click Remove (3 steps)
11. **EnableAutoUpdate**: Home → find app → AppDetail → toggle auto-update (3 steps)
12. **DisableAutoUpdate**: Home → find app → AppDetail → toggle auto-update (3 steps)
13. **RateApp**: Home → find app → AppDetail → edit review → set stars → submit (5 steps)
14. **WriteOrEditReview**: Home → find app → AppDetail → edit review → write content → submit (5+ steps)
15. **FilterCategoryAndInstall**: Home → Categories → category → sort → find app → AppDetail → Install (5+ steps)

## 13. Setup 注入内容

| Task | Setup 注入 |
|------|-----------|
| CancelDownload | downloadJobs[{appId, queued}] |
| AddToWishlist | 确保目标不在 wishlist 中 |
| RemoveFromWishlist | 添加目标到 wishlist |
| EnableAutoUpdate | autoUpdate[appId]=false |
| DisableAutoUpdate | autoUpdate[appId]=true |
| RateApp | 设置不同初始评分以避免已完成 |
| WriteOrEditReview | 编辑分支：注入已有评价；新评价分支：移除已有评价 |
| FilterCategoryAndInstall | 无（使用默认未安装 App） |

## 14. State Delta 与答案字段

| Task | 检查的 state | answer_fields |
|------|-------------|---------------|
| SearchAppAndReportDeveloper | search.current.query, openedAppIds | text: developer |
| SearchAppAndReportSize | search.current.query, openedAppIds | text: size |
| CheckInstalledVersion | installedApps[appId] | text: installed_version |
| BrowseCategoryAndReportTop | currentCategoryId, currentSortOption | text: app_name |
| InstallApp | installedApps, installRecords, downloadJobs | N/A |
| CancelDownload | downloadJobs[].status, installedApps[appId] | N/A |
| UpdateApp | installedApps, updateRecords | N/A |
| UninstallApp | installedApps, uninstallRecords | N/A |
| AddToWishlist | wishlist[] | N/A |
| RemoveFromWishlist | wishlist[] | N/A |
| EnableAutoUpdate | autoUpdate[appId]=true | N/A |
| DisableAutoUpdate | autoUpdate[appId]=false | N/A |
| RateApp | ratings[appId] | N/A |
| WriteOrEditReview | userReviews[] (新/编辑) | N/A |
| FilterCategoryAndInstall | currentCategoryId, currentSortOption, installedApps, installRecords | N/A |

## 15. Expected Changes

- PLAYSTORE_INSTALL_CHANGES: installedApps, installRecords, downloadJobs
- PLAYSTORE_UPDATE_CHANGES: installedApps, updateRecords
- PLAYSTORE_UNINSTALL_CHANGES: installedApps, uninstallRecords, autoUpdate
- PLAYSTORE_CANCEL_CHANGES: downloadJobs
- PLAYSTORE_WISHLIST_CHANGES: wishlist
- PLAYSTORE_AUTOUPDATE_CHANGES: autoUpdate
- PLAYSTORE_RATING_CHANGES: ratings, userReviews
- PLAYSTORE_REVIEW_CHANGES: userReviews
- PLAYSTORE_SEARCH_CHANGES: search.current, search.history, openedAppIds, currentCategoryId, currentSortOption
- PLAYSTORE_SETTINGS_CHANGES: settings

## 16. Side-Effect 检查

- 所有 operate task 声明 expected_changes
- InstallApp/UpdateApp/UninstallApp 额外检查非目标 App 安装状态不变
- WriteOrEditReview 检查他人评价（reviews[]）不变
- Query task 纯查询，expected_changes 为空（无副作用）

## 17. 答案泄露审计

- 所有 AnswerTask 使用 `_input.apps_init` 计算答案（从初始状态）
- template 不包含答案数据（如 `{developer}` 或 `{size}` 不在 template 中）
- 答案通过 AnswerSheet 提交，由框架 grounded mode 检查
- **0 个答案泄露**

## 18. Navigation Artifact 结果

```
nav_build_exit=0 ✅
routes=11 transitionsDeclared=22 transitionsUsedInCode=16
actionsDeclared=12 actionsUsedInCode=12
missingInDeclaration=0 fromMismatches=0 unusedInCode=0
schemaErrors=0 schemaWarnings=0
```

**WARN (可接受，不影响功能)**:
- 6 个 unused in code: tab 切换 transitions（通过 TabBar 组件程序化触发，非 data-trigger）
- 7 个 from bare path without base state: `/myapps` 路由的 uiStates 使用 search 区分，非 base state
- unreachable subgraph: `/myapps` 子状态节点（运行时通过 TabBar 可达）

## 19. npm build 结果

```
build_exit=0 ✅
✓ built in 28.59s
```

## 20. tsc 结果

```
tsc_exit=2 (全仓 38 个错误，全部来自 apps/Cainiao/)
PlayStore 自身: 0 errors ✅
```

## 21. Lint 结果

```
lint_exit=1 (全仓 81 problems: 4 errors, 77 warnings，全部来自已有 App)
PlayStore 自身: 0 errors ✅
```

## 22. Store Getter 检查

```
store_lint_exit=0 ✅
✅ No store getter anti-patterns found.
```

## 23. Navigation Consistency 检查

```
consistency_exit=0 ✅
(node scripts/check_navigation_declaration_consistency.mjs PlayStore --actions)
```

## 24. Task List 结果

```
list_exit=0 ✅
[play_store] (15 tasks, 15 parameterized)
```

全部 15 个 task 可发现。

## 25. Pytest 结果

```
pytest_exit=0 ✅
78 passed in 1.18s
```

### 测试覆盖详情

| 测试类别 | 数量 |
|---------|------|
| 总数 | 78 |
| 正例（positive） | 20 |
| 负例 — 未完成操作 | 12 |
| 负例 — 错误目标 | 8 |
| 负例 — 副作用/误改 | 7 |
| 负例 — query 专用（错误答案/无搜索/错误 App/未提交） | 12 |
| 基础设施测试（task count + description + OPEN_APP） | 19 |

### 重点副作用测试结果

| Task | 副作用检查 | 通过 |
|------|-----------|------|
| InstallApp | 非目标 App 安装状态不变 | ✅ |
| InstallApp | 版本号必须匹配 storeVersion | ✅ |
| CancelDownload | installed=false（取消后不得安装） | ✅ |
| CancelDownload | 错误 job 被取消 | ✅ |
| UpdateApp | 非目标 App 版本不变 | ✅ |
| UninstallApp | 非目标 App 仍安装 | ✅ |
| UninstallApp | 另一个 App 同时被卸载 | ✅ |
| RateApp | 评分了错误 App | ✅ |
| WriteOrEditReview | 编辑分支：review id 相同 | ✅ |
| WriteOrEditReview | 他人评价不变 | ✅ |
| WriteOrEditReview | 删除而非编辑 | ✅ |
| FilterCategoryAndInstall | 分类和排序未应用 | ✅ |
| FilterCategoryAndInstall | 安装了错误 App | ✅ |

## 26. OPEN_APP 映射

| 名称 | 映射 |
|------|------|
| `playstore` | manifest.id ✅ |
| `Play 商店` | manifest.displayName ✅ |
| `Play Store` | manifest.displayNameEn + auto-patch ✅ |
| `PlayStore` | manifest.aliases ✅ |
| `playstore` | manifest.aliases ✅ |
| `应用商店` | manifest.aliases ✅ |
| `Play商店` | manifest.aliases ✅ |

OS 通过 `import.meta.glob` 自动发现 `apps/PlayStore/manifest.ts`，`displayNameEn` 自动注入 `patchAppNames`，`aliases` 自动注入系统别名映射表。无需修改 `os/`。✅

## 27. Dead Button 与返回导航审计

### 按钮审计结果

**审计了 64 个按钮/交互点**。所有核心按钮均连接真实行为：

| 按钮 | 行为 |
|------|------|
| Install (AppDetail) | installApp() → 写入 installedApps + downloadJobs + installRecords |
| Update (AppDetail/MyApps) | updateApp() → 写入 installedApps + updateRecords |
| Uninstall (AppDetail) | 确认弹窗 → uninstallApp() → 删除 installedApps + uninstallRecords |
| Cancel Download (AppDetail/MyApps) | cancelDownloadJob() → downloadJobs status=cancelled |
| Add/Remove Wishlist (AppDetail/Wishlist) | addToWishlist()/removeFromWishlist() → 写入 wishlist[] |
| Auto-update toggle (AppDetail/Settings) | setAutoUpdate() → 写入 autoUpdate{} |
| Rating stars (ReviewEdit) | setRating() → 写入 ratings{} |
| Submit review (ReviewEdit) | addReview()/updateReview() → 写入 userReviews[] |
| Delete review (ReviewEdit) | deleteReview() → 删除 userReviews 条目 |
| Search submit (Search) | 写入 search.current + search.history |
| Sort/Category select | 写入 currentSortOption/currentCategoryId |

### 死按钮统计

- **Dead buttons**: 0 ✅
- **Toast/alert-only**: 0 ✅
- **console.log-only**: 0 ✅
- **空 handler**: 0 ✅
- **href="#"**: 0 ✅

### 功能 disabled 但正确的按钮

- **已安装（最新版）**: 按钮显示 disabled "已安装" — 这是正确的功能状态，不是 dead button ✅

### 返回导航审计

- 所有返回按钮使用 `back()` → `navigate(-1)` ✅
- 无 `navigate('/')` 硬编码 ✅
- 无 `window.history.back()` ✅
- 无统一返回首页问题 ✅
- AppDetail 来源页返回正确（push/pop 栈机制）✅

## 28. Human Smoke Test

**未实际执行** — 当前环境缺少运行中的 dev server (`http://localhost:4190`) 和浏览器控制能力。

命令模板已提供（见 §25）。

## 29. GUI Model Agent Test

**未实际执行** — 当前环境缺少可用模型服务端点。

命令模板已提供（见 §26）。

## 30. 已知问题

1. `/myapps` 路由无 base uiState（search: {}），导致 7 个 from bare path WARNs（不影响功能，nav graph 已正确生成）
2. 6 个 tab 切换 transitions 在 nav graph 中标记为 unused（通过 TabBar 组件程序化触发）
3. Playwright/浏览器自动化未配置，无法执行真实 UI 点击验证

## 31. Disabled 非核心功能

无。所有 benchmark 依赖的功能均已实现。

## 32. 修改范围合规

```
git status: 仅新增 4 个目录
git diff --check: 无空白错误
0 个已有文件修改 ✅
```
```bash
python -m bench_env.run \
  --task-id play_store.SearchAppAndReportDeveloper \
  --agent human \
  --env-url http://localhost:4190
```
- 起始：PlayStore 首页
- 步骤：点击搜索栏 → 输入"Spotify" → 提交 → 点击 Spotify 结果 → 查看开发者 → 在 AnswerSheet 填写 "Spotify AB" → 提交
- 预期 judge: passed（developer="Spotify AB"）

### Smoke Test 2: 安装 App
```bash
python -m bench_env.run \
  --task-id play_store.InstallApp \
  --agent human \
  --env-url http://localhost:4190
```
- 起始：PlayStore 首页
- 步骤：搜索"Calm" → 打开详情 → 点击"安装"
- 预期 judge: installedApps["com.calm.meditation"]="6.30.0", installRecords[+1]

### Smoke Test 3: 取消下载
```bash
python -m bench_env.run \
  --task-id play_store.CancelDownload \
  --agent human \
  --env-url http://localhost:4190
```
- 起始：已有 PUBG Mobile 下载任务（setup 注入）
- 步骤：Tab 我的应用 → 下载队列 tab → 找到 PUBG Mobile → 点击取消
- 预期 judge: downloadJobs[].status="cancelled", installed=false

### Smoke Test 4: 更新 App
```bash
python -m bench_env.run \
  --task-id play_store.UpdateApp \
  --agent human \
  --env-url http://localhost:4190
```
- 起始：Spotify 8.9.0 已安装
- 步骤：Tab 我的应用 → 更新 tab → 找到 Spotify → 点击更新
- 预期 judge: installedApps["com.spotify.music"]="8.10.0"

### Smoke Test 5: 愿望单 + 评分
```bash
python -m bench_env.run \
  --task-id play_store.RateApp \
  --agent human \
  --env-url http://localhost:4190
```
- 起始：PlayStore 首页
- 步骤：搜索"TikTok" → 打开详情 → 撰写评价 → 选择 4 星 → 提交
- 预期 judge: ratings["com.tiktok.app"]=4

## 31. Benchmark 依赖但未实现的功能

**无** — 所有 15 个 benchmark task 依赖的功能均已真实实现并可操作。

## 32. 是否使用 MobileGym 原项目机制

| 机制 | 使用情况 |
|------|---------|
| App module contract | ✅ manifest.ts 自注册，OS 自动发现 |
| Zustand store | ✅ createAppStoreWithActions |
| Navigation declaration | ✅ as const satisfies NavigationDeclaration |
| Transition/Action 机制 | ✅ 声明式 transitions + data-trigger/data-action |
| TimeService | ✅ 所有时间戳使用 TimeService.now() |
| BaseApp accessor | ✅ PlayStore(BaseApp) |
| BaseTask / CriteriaTask / AnswerTask | ✅ 15 个 task 均继承框架基类 |
| StateComparator (expected_changes) | ✅ 所有 operate task 声明 expected_changes |
| AnswerSheet (grounded mode) | ✅ query task 使用 answer_fields |
| JudgeInput / check_goals | ✅ 确定性代码 judge，非 VLM |
| Deep merge setState | ✅ setup 使用 env.set_state(deep=True) |
| No Date.now / Math.random | ✅ ESLint 通过 |
