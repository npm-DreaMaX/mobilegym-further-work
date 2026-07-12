# MobileGym Authoring Rules — Compact Reference

> 将项目规范压缩为批量生成 App / Benchmark 必须遵守的规则。每条规则标注来源。
> 来源简写：`MC`=module-contract.md, `AGENTS`=AGENTS.md, `DECL`=navigation/declaration.md, `ACT`=navigation/actions.md, `SM`=state/model.md, `ARCH`=architecture.md, `README_zh`=README_zh.md, `TAG`=TASK_AUTHORING_GUIDE.md, `TCS`=TASK_CODE_SPEC.md, `TTG`=TASK_TESTING_GUIDE.md, `GM`=GROUNDED_MODE.md, `REF`=REFERENCE.md。

---

## 1. App 文件结构 (MC §File layout + AGENTS §Apps Layer)

```
apps/<Name>/
├── manifest.ts                 # 必须，唯一注册文件
├── <Name>App.tsx                # 必须，export default，文件名 *App.tsx
├── navigation.declaration.ts   # 必须，as const satisfies NavigationDeclaration
├── navigation.ts                # 必须，go()/back()
├── navigation.types.ts         # 必须，本地 NavigationDeclaration 类型副本
├── state.ts                     # 可选，createAppStore[WithActions] / createVolatileAppStore
├── types.ts                     # App 级类型
├── constants.ts                 # 结构常量（tab/service/feature/flag）
├── context/<Name>Context.tsx    # 可选
├── hooks/use<Name>Gestures.ts   # App 专属手势 hook
├── hooks/use<Name>Strings.ts    # i18n hook
├── res/                         # icons.tsx(用图标时必须) / colors.ts / dimens.ts / strings.ts / strings.en.ts / colors.states.ts / anim.ts
├── assets/                      # 二进制资源，Vite import，不要放 public/
├── data/
│   ├── defaults.json            # 可替换初始状态
│   ├── index.ts                 # 合并常量+defaults，导出 <APPNAME>_CONFIG（保持同步）
│   ├── *.json / loader.ts       # 大型 world data（可选，loader.ts 必须 export preload()）
├── pages/                       # 页面组件
└── components/                  # 共享组件
```

- 第三方 App 放 `apps/`，系统 App 放 `system/`，OS 一视同仁。
- **新增 App 不需要改任何 OS 层文件**（OS 通过 `import.meta.glob` 自动发现）。（AGENTS §Adding a New App）
- `constants.ts` 只放结构配置：tab 定义、service/feature 目录、布局参数、feature flag。**不放**用户数据、**不放**原始 Lucide 名。（AGENTS §constants.ts）
- `data/defaults.json` 放可替换初始状态：用户信息、内容数据、用户可配置布局、用户设置。**不放**service 固定属性、**不放**原始图标名字符串。（AGENTS §data/defaults.json）
- `data/index.ts` 合并 constants + defaults，导出 `<APPNAME>_CONFIG`；保持同步；**不**硬编码 settings、**不**定义常量、**不**声明类型。（MC §data/，SM §Large world data）
- 每个页面最外层 `pt-10`；chrome 前景色非默认时声明 `data-status-bar-foreground="dark|light"`；底部手势条前景不同时声明 `data-navigation-bar-foreground`。（AGENTS §UI）
- 聊天页/底部操作栏 **禁止 `position: fixed`**，用 flex `flex-shrink-0` + adjustResize。（AGENTS §UI，MC §6）

## 2. manifest.ts 规则 (MC §manifest.ts，AGENTS §Adding a New App)

- `id` = appId = localStorage key = snapshot key，小写无空格唯一。
- 目录名可 ≠ `id`（`apps/Wechat/` → `id:'wechat'`），OS 按 manifest 路径自动映射。
- `displayNameEn` 自动注入 OS i18n 字典（`patchAppNames`），**不要**改 `os/i18n/en.ts`。
- `aliases` 数组自动注入系统别名表，**不要**改 OS 层。
- `theme.colors`（Tier-1）注入为 CSS var（`--app-primary` 等），Tailwind class `text-app-primary` 在 `app.css` 接线。必需键：`primary/primaryDark/background/surface/textPrimary/textSecondary/border/statusBarForeground/navigationBarForeground`；`onPrimary` 可选。暗色覆盖用 `theme.colorsDark`（同键，仅变化的）。
- `intentFilters` 声明可接收的 intent；`queries` 声明可发出的 intent（OS 静态可知外部 surface）。支付收银台类 App 应声明 `ACTION_PAY`（参考 Alipay `alipays` scheme）。
- `designViewportWidth`（如 360/412）为 CSS-zoom 显示缩放锚点。
- `type`: `'plugin'`（日常 App）/ `'system'`（系统 App）。
- 注册一个 App 只需 `manifest.ts` + `*App.tsx`。

## 3. `<Name>App.tsx` 入口规则 (MC §`<Name>App.tsx`，AGENTS)

- 文件名必须以 `App.tsx` 结尾；组件 `export default`（glob `apps/*/*App.tsx`）。
- 包 `MemoryRouter`；home tab 需强制 query param 时设 `initialEntries`（如 `['/?tab=recommend']`）。（DECL §Home routes）
- `useAppNavigationHandler(manifest.id, { onBack })` 必须在 `MemoryRouter` **内部**调用：注册 navigator（AppNavigatorRegistry）、back handler（priority 100）、lifecycle（AppLifecycle），并维护 shadow `HistoryTracker` 支持 `popTo`。
- 布局："主 tab 持久 + 子页独占"；后台 App 保持 mounted（`display:none` 隐藏）。（AGENTS §OS Layer）
- `navigation.declaration.ts` 中每条新 path 必须在 `<Routes>` 注册，否则 React Router 抛 `No routes matched`。
- **业务页禁止 `useNavigate()`/`navigate()`**（ESLint + CI grep 强制），只用本 App `go()`/`back()`。
- `openApp`: 新 Task 用 `replace=true`，已有 Task 用 `replace=false`；`startActivity({newTask:true})` 推新 Activity。
- Foreign-task 隔离：`task.rootAppId !== appId` 时跳过 app 级注册，只用 activity 级 navigator。

## 4. navigation.declaration.ts 规则 (DECL，ACT)

- route 必需字段：`path`、`component`、`params`、`entryPoint`（`home`/`deepLink`/`both`/`none`，默认 `none`）、`uiStates`、`queryParams`、`scrollContainers`、`description`。恰好一个 route `entryPoint:'home'`。
- **`uiStates` 必填**，禁止空 `uiStates: []`；首项为 base state，其 `id` 必须以 `.base` 结尾；每 route 至多一个 base state。
- 需强制离散 query param 的 route 上禁止有 base state——改 `queryParam` 或拆 route。
- `queryParams` 用于无界/动态 key；`uiStates` 枚举有界离散维度。
- `scrollContainers`：单一主滚动器用 `name:'main'`；多个并滚动需不同 name（同名静默覆盖）。
- transition 必需字段：`id`、`from`、`to`（有 `cases` 时 `to` 为 fallback，不可省）、`search`、`searchParams`、`params`、`mode`、`label`、`ui`（gesture ∈ `tap|longPress|doubleTap|back`）。
- `from` 语法：uiState id / route path（route 无 base state 时禁止，须用 FromConstraint）/ `'*'`（仅作参数级通配 `{ path:'/x', search:{tab:'*'} }` 内部，否则反模式）/ FromConstraint / 数组。同 path 离散移动须 FromConstraint；tab 切换 `from` 不得含自身目标 route。
- `cases` 非空必须以 `{ when:{op:'always'} }` 结尾（CI 强制）；`when` ops：`exists/eq/in/match/gt/gte/lt/lte/and/or/not/always`。
- `search` 优先级 > `searchParams`；`searchParams` 在 target route 的 `queryParams` 中则为动态，否则为 `.switch` 式离散维度。
- actions 在 `uiStates[].actions[]`。必需：`id`（regex `^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$`，≥3 段，无 `-`/`_`，App 内唯一）、`label`、`behavior`（`toggle|select|input|submit|other`）。`behavior='input'`（须含 `value`）和 `scope='item'`（须含 ≥1 string|number 对象标识字段）的 `paramsSchema` 由 CI 强制。
- `select` 同前缀互斥（radio 语义）；`toggle` 一控件一 id（无独立 enable/disable）。
- 顶层 `capabilities.historyBack: boolean` 必填，显式设置。
- 整个声明 `as const satisfies NavigationDeclaration`；每 App 保留**本地** `navigation.types.ts` 副本。

## 5. navigation.ts / go() / back() / popTo 规则 (DECL §Runtime API，AGENTS)

- `useAppNavigate()` 暴露 `go` / `back`。`go(id, params?, options?)` 按 declaration + `cases` 解析 id 到 (target route, uiState, mode)。
- `options`: `{ mode?:'push'|'replace', popTo?:string, popToInclusive?:boolean, state? }`。
- tab/子 tab 切换 `mode:'replace'`；modal/drawer `mode:'push'（`back()` 关闭）。
- `back(n=1)` ≈ `history.go(-n)`，经 shadow `HistoryTracker` 使 `popTo` 确定性定位。
- 流程结束返回：`popTo('myapp.home', { popToInclusive:true })`。
- dialog/弹窗默认 URL-driven（`searchParams`），`back()`/`navigate(-1)` 关闭。**禁止 `useState` 控制 dialog 可见性**（back key 看不到 React state）。
- 离散 UI 状态变化（tab/modal/menu）必须经 `go()` + URL 更新，禁止纯 setState。

## 6. state.ts 规则 (SM §Three app-store factories，AGENTS §State)

- 工厂：`createAppStore`（持久无 actions）、`createAppStoreWithActions`（持久+actions，默认；自动从 `partialize` 排除函数和 `_temp`，自动注册 snapshot）、`createVolatileAppStore`（内存，仍注册 snapshot）。
- 工厂首参必须 = `manifest.id`，即默认 localStorage key（裸 id 无后缀）。
- `partialize` 必须保留所有出现在 snapshot 的业务实体字段；原则：**snapshot 里有的，`partialize` 必须有**（`_temp` 和函数除外）；自定义 `partialize` 必须保留默认对 `_temp` 的排除。
- `_temp` 顶层字段默认不落 localStorage，但仍出现在 `__SIM__.getState()`；`BaseTask.always_ignore` 含 `apps.*._temp`，副作用检查忽略之。loading/focus/drag 标志放这里，不放业务 state。
- `registerToServiceRegistry:false` 让 OS store 退出 `os.services` snapshot（如 Providers）。
- **禁止 store action 内定义 query getter**（`isLiked`/`isFollowing`/`getById`）；组件直接订阅数据（`s.likedPostIds`）+ `.includes()`/`Set.has()` 派生布尔，或用 `memoSelector` 返回 `Set`。`useShallow`+`useMemo` 包 getter 无效。`scripts/lint_store_getters.mjs` 检查。
- 派生值若需 bench 可见，物化为 state 字段或经 `registerStateAdapter(appId, fn)`（仅影响 `getState()` 输出，不影响 store 内读取）。
- 业务实体表（`posts`/`comments`/`chats`/`orders`/`drafts`）放 store 顶层，与 `user` 平级，不嵌套于 `user`；用户侧索引仅存 id（`user.commentIds: string[]`，非 `user.commentList: Comment[]`）。
- 聚合计数派生不回写：`display_likes = base_likes + (id∈user.likedPostIds?1:0)`；禁止同时持久化 `followingIds` 和 `followingCount`。
- settings：顶层 `settings` 键，类型 `<App>Settings`，嵌套结构与设置页路由一一对应；禁止 `initialSettings`/`config`/`preferences`（系统 Settings 例外）；禁止每叶子一个 setter 或整对象替换 setter，用 `Partial<AppSettings>` spread 或分类 updaters。
- 改 settings 结构是 load-bearing：同步 grep `bench_env/task/<app>/tasks.py` 和 `defs/*.py` 对应路径，同 commit 更新。（SM §Bench-facing path conventions）
- 存语义字段不存展示串（`{fromCity,toCity}` 非 `route:"上海-成都"`）。

## 7. world data / runtime overlay 规则 (SM §The two layers，ARCH)

- 两层：**world data**（大型只读公共实体，`data/*.json`/`loader.ts`，不持久化、不在 snapshot、bundled）vs **runtime overlay**（小型可变 per-env 状态，`state.ts`+`defaults.json`，持久化、在 `__SIM__.getState().apps.<appId>`、`__SIM__.reset()` 重置）。
- 视图层 base+overlay 合成，overlay 胜出：`{...base, ...overlay}`；overlay `null`=tombstone（隐藏 base）；overlay 缺省=base 透传。
- 实体同构：world 和 runtime **同 schema**；`base_<entity>(id)`（off-snapshot）vs `state.<entity>(id)`（overlay，in-snapshot）。overlay 必须存**完整实体**（不在缺失 overlay 上 partial deep-merge）。
- `__SIM__.setState({...}, {deep:true})` 是写命令：`object`=deep merge，`undefined`=no-op，`null`=tombstone，`array`=整替换，primitive=整替换。
- 大型 world data `loader.ts`：`index.ts` **不** import 大数据集（保持同步）；`loader.ts` 独立于 `index.ts`；大 JSON camelCase 名匹配 loader fn；`fetch(new URL('./xxx.json', import.meta.url))` 是 NetworkService 规则的**唯一**合法例外；每个 `loader.ts` 必须 export `preload(): Promise<void>`；命名 `load<ContentType>()`/`get<ContentType>Sync()`。
- bench 对大数据可见性取决于消费方式：store action（✅）/ hook（❌）/ service（❌）。bench 必须读写的字段要走 store action。

## 8. data/defaults.json 规则 (AGENTS §data，MC §data/)

- 必含：用户信息、内容数据、用户可配置布局、用户 settings。
- 禁含：service 固定属性（icon/color/label，属 `constants.ts`）、原始图标名字符串（必须 `Ic*` 前缀）。
- 相对时间戳须经 `resolveDataTimestamp` 解析（参考 Alipay `data/index.ts`）。
- `data/index.ts` 导出 `<APPNAME>_CONFIG`；accessor 优先 `base_*` 命名。

## 9. pages/components/hooks/res 组织方式 (MC，AGENTS)

- `pages/` 页面组件；`components/` 跨页共享组件；`hooks/` App 专属手势 + i18n hook。
- `res/icons.tsx`：所有别名 `Ic*` 前缀；`ICON_REGISTRY` 键 = export 名；**禁止** `ICON_REGISTRY` 或数据文件用原始 Lucide 名（`"CreditCard"` 是 bug，改数据层）；只 import 实际用到的图标。固定 JSX：`<IcCard size={22}/>`；数据驱动：`<IconRenderer name={item.icon}/>`，数据存 `"IcCard"`。
- `res/colors.ts`（可选）：仅 Tailwind 无法表达的色（品牌渐变/暗色切换）。标准色/一次性色直接 inline。
- `res/dimens.ts`（可选）：仅 3+ 处复用尺寸提取。一次性 inline。
- **JS 像素计算必须用 CSS var（`h-(--app-xxx)`）或 `h-[Npx]`，禁止 rem class（`h-10`/`h-14`）**——非 16px 默认字号导致 rem→px 漂移。
- `res/strings.ts`（可选）：`STR.foo` + `strings.en.ts` 覆盖；经 `useAppStrings(strings, stringsEn)` 读 `OsStateStore.settings.global.language`；禁止 JSX 散落字面量。

## 10. benchmark task 目录规则 (AGENTS §Benchmark，TAG §1.4，TCS §1)

- suite 在 `bench_env/task/<suite>/`：单 App（`wechat/`）/ 跨 App（`crossapp_commerce`）/ 功能类（`payment/`）。
- 每 suite：`tasks.py`（legacy 多任务）**或** `defs/<TaskName>.py`（一任务一文件，可共存，类名须唯一）；`app.py`（App accessor，`BaseApp` 子类）；`__init__.py`（仅模块标记）。
- `base.py` 提供 `BaseTask`/`BaseApp`/`CriteriaTask`/`AnswerTask`/`build_answer_checks`/`match_value`/`match_time`/`match_duration`；`judge.py` 共享工具；`utils.py` 跨 suite 纯函数。
- 跨 App suite 无自身 state，通常无 `app.py`，复用各 App 的 `check_*`/data/answer；缺失的 check 方法放对应单 App 的 `app.py`。
- App 类名 = `manifest.id` PascalCase，**不带 `App` 后缀**（`Wechat`、`Railway12306`）。
- task 类名须准确反映目标；`objective` 须匹配内容。
- 每个 task 直接继承 `BaseTask`/`CriteriaTask`/`AnswerTask`；禁止自定义基类/mixin/task 间继承。
- sampler（`sample_*`）作 `@staticmethod` 放 App 类；App 私有 sampler 数据放 `app.py` 模块级常量；通用 sampler 放 `utils.py`。
- `expected_changes` 常量命名 `<APP>_<ACTION>_CHANGES`，放对应 `app.py`。
- task_id 格式 `<suite>.<TaskClassName>`，`TaskRegistry` 扫 `tasks.py` + `defs/`。

## 11. description / setup / check_goals / get_answer 规则 (TAG §4.7/4.9/5.6，TCS §3/8/9/13)

- `description` = 渲染后的 `templates`（NL 目标含 `{param}` 槽）+ grounded 模式自动追加 AnswerSheet 说明。template 表达意图非步骤；`operate` 任务无输出的"查看"禁止；`AnswerTask` template 不得泄露答案（无 `{phone}`/`{income}`）；L3/L4 提供 ≥2 个答案相同的 template 变体。
- 元数据必填：`scope`（S1/S2/S3）、`objective`（operate/query/hybrid）、`composition`（atomic/sequential/transfer/deep_dive）、`difficulty`（L1–L4）、`capabilities`（1–4 tag）。`max_steps` 可选，合法值仅 `15/30/45/60`。`optimal_paths` 声明 transition/action id 序列。
- setup 生命周期：`reset → warm → _prepare → get_state → sample → _post_sample → get_observation`。`_prepare(env)` 在采样前（不能用 `self.p`）；优先 `defaults.json`，schema 耦合构造推到 App `prepare_state_with_*` helper，**禁止**硬编码数据替换。`_post_sample(env)` 在采样后；`CriteriaTask._invert_criteria(env)` 翻转目标（toggle/enum 需）。
- `check_goals(input) -> list[dict]`：组合 App `check_*` 调用 + 任务分支。每个 check dict = 一个语义目标（非一字段），必须含 `passed`（缺则框架抛 `ValueError`），`expected`/`actual` 须诊断性（禁止 `expected=True, actual=None`）。只查 Agent 行为；`operate` 只查最终态（导航目标例外）；有真实依赖时返回列表长度稳定（用 `passed:False` 占位）。
- CRUD 判定：Create=diff current\init；Delete=diff init\current；Modify=init 中定位、current 中验证；Query=读 init。App `check_*` 内 sampler 契约断言保持归因正确（sampler bug → `AssertionError` → `judge_error`，非 `passed=False`）。
- 铁律：`passed=False` 只出现在 Agent 能影响的判定里；非 Agent 失败走异常路径 → `judge_error`。
- `get_answer()` 返回 ground truth（非判定逻辑）；返回类型须匹配 `match_value` 语义（`int`/`float` 提数、`str` 子串、`re.Pattern` regex、`dict` per-slot）。平局/同义词用 `re.Pattern`。布尔答案不经 `match_value`——在 `check_goals` 内先检测否定。声明式 `answer` 类变量读 `input.apps_init`（纯查询）；改写 `get_answer()` 读 `input.apps` 取动作后答案。
- 数据源优先级：`getState()` runtime > App 离线数据文件 > 硬编码常量。参数声明优先级：`source` > `sampler` > 硬编码 `enum`。禁止把 `getState()` 已有的数据重复为 Python 常量。
- `expected_changes` 声明状态变化；之外为副作用 → `clean=False`。单 App 用相对路径；多 App 用 `appName.path`；已前缀的不变。`[field=value]`、`[+N]`、`[+=val]`/`[-=val]`、`._order`/`._relative_order` 路径形式。`CriteriaTask` 从 `criteria` 键（排除 `route`）自动派生。

## 12. AnswerSheet 使用规则 (GM)

- 两模式：**grounded**（默认 `--eval-mode grounded`，Agent 填 AnswerSheet 表单，框架读 UI state）/ **text**（`--eval-mode text`，Agent 调 `ANSWER`，`match_value` 模糊匹配）。
- 声明 `answer_fields` 启用 grounded。Runner 选路径：Path A（无自定义 `check_goals` → `build_grounded_checks`，逐字段匹配，**不**调 `check_goals`）vs Path B（有自定义 `check_goals` → AnswerSheet 值用 `", "` 拼成 `input.answer`，调 `task.evaluate()`）。
- 字段类型：`text`/`number`/`choice`（须 `options`）。选择优先级 `choice` > `number` > `text`。`repeatable:true` 变长列表；配 `compare:"set"` 无序。
- matcher（Path A）：`exact`（默认）、`number`（`math.isclose`）、`date`（`date_match_labels`）、`time`（`match_time` ±5min）、`duration`（`match_duration`）。
- 改写 `get_expected_response`：当 `get_answer()` 返回 `re.Pattern`（grounded 需精确值）、返回 `dict` 但 `answer_fields` 数量不匹配、或 `repeatable` 字段（返回 `[[v1,v2,...]]`）。
- 提交按钮是 toggle；`submitted=False` 即使答案对也失败。`apps.answer_sheet` 在 `BaseTask.always_ignore`（非副作用）。grounded 模式对 `answer_fields` 任务自动 +15 steps。`Controller.setup` 自动把 AnswerSheet 说明追加到 `description`，template 无需提及。
- 多字段同类型值在 Path B 有交叉污染风险（填错位置假阳性）；此类任务优先 Path A（不写自定义 `check_goals`）。
- `check_goals` 须兼容两模式：text=NL 回复；grounded=`", "` 拼接值。

## 13. side effect 检查规则 (SM §Side-effect，TAG §4.8/2.5，TCS §5/13)

- 检测：snapshot init → run → snapshot final → diff → 减 `expected_changes` → 余项=意外副作用（记为 `USE` 指标，强制 `clean=False`）。
- `expected_changes` 必须覆盖每个副作用（如查消息 → `conversations.lastReadAt`；转账/支付 → `transferDraft`/`transferReceipt`/`lastPaymentHint`；搜索 → `searchHistory`/`billSearchHistory`；收藏/点赞 → `favoriteIds`/`likedIds`）。
- 幂等/初态守卫：`CriteriaTask` 须保证初态 ≠ 目标态；toggle/enum 用 `_post_sample` + `_invert_criteria`；目标固定但等于默认也需翻转。`_invert_criteria` 跳过 `route`、callable criteria、含 `[` 的路径。
- 禁止防御式编码：无 `or {}`、无 `.get("key","")`、无 `"无法判断"` fallback、无 `try/except` fallback return。直接 `input.apps["xxx"]`（框架保证 dict）；缺键 → `KeyError` → `judge_error`。
- 环境数据问题 → `raise`；Agent 失败 → `passed=False`。App accessor 缺数据抛 `ValueError`（无 `""`/`None`）。
- 判定可靠性：错路径无假阳性；合理路径无假阴性；证据是最终态或稳定检查点；不绑死 path-specific 步骤；不把不稳定 trace 字段（`lastAccess`/`currentSelected`）当硬证据。
- 禁止 Python 重算已富化字段；先查 `data/index.ts`/`state.ts` 是否已有。

## 14. 验证命令 (AGENTS，DECL，README_zh)

```bash
npm run lint                                          # lint os/ + apps/
npx tsc --noEmit                                       # 大改时确认类型（小改靠 IDE）
node scripts/build_nav_artifacts.mjs <AppName>         # 一致性 + nav graph + action tasks
node scripts/build_nav_artifacts.mjs <AppName> --data data/index.ts   # 加 data graph
node scripts/build_nav_artifacts.mjs <AppName> --skip-tasks           # 仅 graph
node scripts/check_navigation_declaration_consistency.mjs <AppName> --actions
node scripts/lint_store_getters.mjs [AppName...]       # 检测 store query getter
npm run build && npm run preview -- --port 4173        # ≤8 并行
python -m bench_env.run --list                         # 列 task 模板
python -m bench_env.run --list --list-online --env-url <url>   # 读 __SIM__.getState()
python -m bench_env.run --task-id <suite>.<TaskClassName> --env-url <url> --agent <a> --model-name <m>
python -m bench_env.run --suite <suite> --parallel N --env-url <url> --agent <a>
python -m bench_env.run --eval-mode grounded|text --judge-mode state|vlm|auto ...
pytest bench_env/tests/ -m "not live" -v                # 离线
pytest bench_env/tests/test_<suite>.py -m "not live" -v
```

## 15. 禁止事项 (汇总)

- `new Date(...)`（任何形式，含参数化）、bare `Date.now()`（ESLint 禁，走 `TimeService`）。
- 业务页 `useNavigate()`/`navigate()`（ESLint + CI grep）。
- `useState` 控制 dialog 可见性。
- App 层 import `BackDispatcher`。
- 新增 App 时改 `os/`。
- `ICON_REGISTRY` 或数据文件用原始 Lucide 名。
- `navigator.geolocation`、`fetch` 外部 URL（用 `LocationService`/`NetworkService`，唯一例外 `loader.ts` 内 `fetch(new URL(...))`）。
- touch+mouse 并行逻辑（用 `PointerEvent`）。
- 聊天输入栏 `position: fixed; bottom: keyboardHeight`。
- 给无功能占位/禁用控件打 `data-trigger`/`data-action`。
- bind 位动态拼接 transition/action id（须字符串字面量）。
- 空 `uiStates: []`、base state 不以 `.base` 结尾、多 base state、强制离散 param route 上的 base state。
- 参数级通配外的 bare `from:'*'`。
- `cases` 非空无 `{ when:{op:'always'} }` 结尾。
- submit-then-back 建模为带硬编码 `to` 的 transition（应用 `action` `behavior:'submit'` + `back()`）。
- task 自定义基类/mixin/task 间继承；task 文件内模块级 helper（应放 `app.py`/`utils.py`）；task 类私有聚合方法（应泛化到 App）。
- 防御式编码（`or {}`/`.get("key","")`/`try/except` fallback/`input.apps.get("xxx",{})`）。
- `bench_env/task/` 内用 `datetime.date.today()`/`datetime.datetime.now()`/`time.time()`（用 `sim_today(os)`/`sim_datetime(os)`/`now_ms(os)`；格式化已存时间戳的 `datetime.datetime.fromtimestamp(ts)` 例外）。
- `@property def criteria`（须类变量）；`_XXX_MAP` 值映射（用 `values` dict）；否定翻转参数语义。
- AnswerTask template 泄露答案占位符；测试中裸 ground truth 作正答案；`answer="错误答案"` 全否定。
- `_prepare()` 硬编码数据替换控制难度（改 `defaults.json`）。
- settings 每叶子一 setter 或整对象替换；业务实体表嵌套于 `user`；同时持久化 `*Ids` 和 `*Count`；第三方 App 用 `preferences`/`initialSettings`/`config` 作 settings 键。
- task.py/defs.py 直接 `json.load` `apps/<App>/data/*.json`（仅 `app.py` 可读 base JSON）；把 `state.<entities>[id]` 当 resolved view；返回 `base_<entity>` 作答案。

## 16. TimeService / LocationService / NetworkService 替换规则 (AGENTS §State，MC §1，TCS §6)

- **TimeService** 替换所有 `Date`/`Date.now`：
  - `now()`/`getDate()` — 模拟时间（屏上时钟、数据时间戳、benchmark 状态检查）。
  - `realNow()` — 真实墙钟（debounce/动画/手势/cache TTL）。
  - `fromTimestamp(ts)` — 替换 `new Date(timestamp)`。
  - `fromLocalParts(y,m,d,...)` — 替换 `new Date(y,m,d,...)`。
  - `parseToTimestamp(str)` — 解析日期串（配 `fromTimestamp`）。
  - `bench_env/task/` 内：`datetime.date.today()`→`sim_today(os)`；`datetime.datetime.now()`→`sim_datetime(os)`；`time.time()`→`now_ms(os)`；`os_state` 无 `time` 则 `raise ValueError`。
- **LocationService** 替换 `navigator.geolocation`：`getSimulatedCoords()` → `LocationCoords | null`；benchmark 覆盖位置保证可复现。
- **NetworkService** 替换 `fetch`/外部 HTTP：`netJson`/`netFetch` 走同源 gateway + per-session cookie jar（避免 CORS）。
- 服务作为 `window.__OS__` 子属性访问（`__OS__.notifications`、`__OS__.keyboard`）。持久规则：数据持久，UI/runtime 不持久（refresh=restart）。`ClipboardService` 持久；`NotificationService`/`KeyboardService`/`PermissionService` 易失。
- `OsStateStore` 镜像 Android settings 模型（`os.settings.global`/`system`、`os.hardware`、`os.permissions`、`os.preferences`）；`build`/`telephony` 经 `managers/registry.ts` 覆盖（支持 bench 注入）。
- 禁止 App 直写 `os.hardware.wifi.enabled` 等，须经 Managers（`ConnectivityManager`/`BatteryManager`/`AudioManager`/`DisplayManager`），集中约束逻辑（飞行模式级联、音量/亮度钳制）。
- 共享内容（contacts/SMS/media）在 `os/providers/*Provider.ts`，各自持久 store，经 `ContentResolver.query/insert/update/delete` 访问；出现在 `__SIM__.getState().os.providers.*`。
