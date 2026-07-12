# App Validation Protocol

> 每个 App 生成后的验证流程。目标：确认能 build、nav graph 一致、store 无 query getter、未误改 os/ 与已有 App、benchmark suite 可被框架发现。
> 命令前提：conda 环境（Python 用 conda），Node/npm 默认。App 目录名 = `apps/<Name>/`，CLI 传 `<Name>`（如 `Wallet`）。

---

## 1. 静态检查（必跑，无 ERROR/WARN 才算过）

### 1.1 Navigation artifacts（最关键）

```bash
node scripts/build_nav_artifacts.mjs <Name>
```

- 一致性检查 + schema nav graph + action tasks，一次跑完。
- **判读规则**：输出有 `ERROR` → 必须修；有 `WARN` → 必须看具体 ID 并修复或说明。**不接受只看 summary count**。
- 有问题时按输出给的 transitionId/actionId/file:line 定位。常见错误：
  - route 无 base state 或 base state id 不以 `.base` 结尾 → 改 uiStates
  - `cases` 非空未以 `{ when:{op:'always'} }` 结尾 → 补结尾
  - action id 不符 regex `^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$`（≥3 段无 `-_`）→ 改 id
  - transition 缺 `to`/`from`/`mode`/`ui` → 补字段
  - route path 在 `<Routes>` 未注册 → 在 `<App>App.tsx` 注册
  - `scrollContainers` 同名多滚动器 → 改 name
- 修完重跑直到无 ERROR/WARN。
- 如需 data graph：`node scripts/build_nav_artifacts.mjs <Name> --data data/index.ts`

### 1.2 Declaration-source consistency

```bash
node scripts/check_navigation_declaration_consistency.mjs <Name> --actions
```

- 验 declaration 与源码（`<App>App.tsx` Routes、bind 位 id 字面量）一致。有 ERROR 看具体 ID 修。

### 1.3 Store getter lint

```bash
node scripts/lint_store_getters.mjs <Name>
```

- 检测 state.ts 内 query-style getter 或组件订阅 store 函数引用（违反 SM §Store actions）。有报告 → 改为组件直接订阅数据 + `.includes()`/`Set.has()` 或 `memoSelector` 返回 `Set`。

### 1.4 ESLint

```bash
npm run lint
```

- 重点抓：bare `Date.now()`、任何 `new Date(...)`、业务页 `useNavigate()`/`navigate()`。有 → 走 `TimeService`（`now`/`getDate`/`fromTimestamp`/`fromLocalParts`/`parseToTimestamp`/`realNow`）和本 App `go()`/`back()`。

### 1.5 Type check（大改必跑）

```bash
npx tsc --noEmit
```

- 新增 App 属大改，必跑。小修可靠 IDE，但新增 App 不算小修。

## 2. Build（必跑）

```bash
npm run build
```

- Vite 生产构建。失败看报错（通常是 import 路径、TS 类型、Tailwind class 笔误）。build 过 = App 可被 OS `import.meta.glob` 发现且无编译错误。

## 3. OS 自动发现确认

新增 App 无需改 OS。确认方式：

```bash
# manifest + entry 应能被发现
ls apps/<Name>/manifest.ts apps/<Name>/*App.tsx
# state.ts 若有应自动注册
ls apps/<Name>/state.ts
```

- `*App.tsx` 必须 `export default`，文件名以 `App.tsx` 结尾。
- `manifest.ts` 必须 `export const manifest: AppManifest`，`id` = localStorage key = snapshot key。

启动 dev server 人工确认 App 出现在桌面/可启动：

```bash
npm run dev   # 或 npm run build && npm run preview -- --port 4173
# 浏览器打开，确认 <App> 图标在桌面，点击能进入首页
```

## 4. Snapshot 可见性（runtime overlay 落对）

dev server 跑起来后，在浏览器 console：

```js
// App 应出现在 apps 下，state 为 defaults.json 合并后的形状
window.__SIM__.getState().apps.<appId>
// reset 后应回到 defaults
window.__SIM__.reset()
```

- 确认业务实体表在顶层（非嵌套 `user` 下）、`_temp` 不落 localStorage（reload 后消失）、`settings` 嵌套匹配设置页路由。
- 确认 world data（`data/*.json` 大数据集）**不**出现在 snapshot（只在 runtime overlay + store action 暴露的部分可见）。

## 5. 误改检查（严格遵守边界）

### 5.1 未误改 os/

```bash
git status os/
# 期望：空（无改动）
git diff os/   # 期望空
```

- 若有改动 → 说明违规依赖了 OS 层。回退：`git checkout -- os/`。新增 App 不应需要任何 os/ 改动（OS 自动发现）。

### 5.2 未误改已有 App

```bash
git status apps/
# 期望：只有 apps/<Name>/ 下新增文件，其他 apps/* 无改动
git diff -- apps/ ':!apps/<Name>'   # 期望空
```

- 若改了其他 App → 回退：`git checkout -- apps/<OtherApp>`。参考只读，不改。

### 5.3 未误改 bench_env

```bash
git status bench_env/task/
# 期望：空（本次不写 benchmark）
```

- benchmark 另起任务，本次 App 生成不改 bench_env/task/。

### 5.4 改动范围确认

```bash
git status
# 期望全部新增文件都在 apps/<Name>/ 下（docs/authoring/ 除外，那是规划文档）
```

## 6. Benchmark 框架可发现（可选，benchmark 另起任务时跑）

如已另起 benchmark suite（`bench_env/task/<suite>/`）：

```bash
# conda 环境
python -m bench_env.run --list | grep <suite>
# 期望：列出 <suite>.<TaskClassName> 各任务
```

- 若有 `--list-online`：`python -m bench_env.run --list --list-online --env-url https://localhost:4173` 读 `__SIM__.getState()` 确认任务采样后参数指向 App 真实数据。
- 离线测试：`pytest bench_env/tests/test_<suite>.py -m "not live" -v`（需 conda）。

> 本协议聚焦 App 生成验证。benchmark suite 的验证（judge 正确性、采样契约、side effect 覆盖）见 `bench_env/docs/task/TASK_TESTING_GUIDE.md` + `testing-bench-task` skill。

## 7. 人工 smoke test（dev server 跑起来后）

必走流程，确认核心交互可达：

1. 桌面点击 App 图标 → 进首页（默认 tab/data 来自 defaults.json）。
2. 每个 main tab 切换 → `mode:replace`，URL 更新，state 不丢。
3. 进入子页 → `mode:push`，系统 back 键回上一页（URL 弹栈）。
4. 开一个 dialog/弹窗（如有）→ 经 `searchParams`，back 关闭弹窗而非回上一页。
5. 改一个 runtime overlay 字段（如点赞/收藏/发消息）→ `__SIM__.getState().apps.<appId>` 反映变化；reload 后持久字段还在、`_temp` 消失。
6. 键盘弹起（如有输入页）→ `data-adjust-resize` 容器收缩，`data-hide-on-keyboard` 元素隐藏，输入栏不被键盘盖住（非 fixed）。
7. `__SIM__.reset()` → 回默认态。

## 8. 失败时如何修复

| 症状 | 排查 | 修复 |
|---|---|---|
| `No routes matched location` | `navigation.declaration.ts` path 未在 `<App>App.tsx` `<Routes>` 注册 | 注册 `<Route>` |
| build_nav_artifacts ERROR on transition/action id | id 不符 regex / 缺字段 / from 反模式 | 改字面量 id、补 `to`/`mode`/`ui`、用 FromConstraint |
| ESLint Date.now/new Date | 直用了原生 Date | 换 `TimeService.now()`/`fromTimestamp` 等 |
| ESLint useNavigate | 业务页用了 react-router navigate | 换本 App `go()`/`back()` |
| lint_store_getters 报告 | state.ts 有 query getter 或组件订阅函数引用 | 改为订阅数据 + `.includes()`/`Set.has()` 或 `memoSelector` |
| tsc 类型错 | manifest/declaration 类型不匹配 | 检查 `navigation.types.ts` 副本与 declaration 一致 |
| build 失败 import 错 | 大数据集在 index.ts import | 移到 `loader.ts`，index.ts 保持同步 |
| App 不出现在桌面 | manifest.ts 无 `export const manifest` 或 entry 无 `export default` | 补 export，文件名 `*App.tsx` |
| snapshot 缺字段 | partialize 排除了业务字段 | partialize 保留 snapshot 应有字段 |
| dialog back 直穿 | 用 useState 控可见性 | 改 searchParams + `back()` |
| 键盘盖住输入栏 | `position:fixed;bottom:keyboardHeight` | 改 `flex-shrink-0` + `data-keep-keyboard` |

## 9. Validation Report（生成 App 后输出）

每次完成一个 App，在回复中输出：

```
## Validation Report — <App> (<目录名>, manifest.id=<id>)

### 静态检查
- build_nav_artifacts: [PASS/FAIL]  (无 ERROR/WARN / 具体 ID+file:line)
- declaration consistency: [PASS/FAIL]
- lint_store_getters: [PASS/FAIL]
- eslint (npm run lint): [PASS/FAIL]
- tsc --noEmit: [PASS/FAIL]

### Build
- npm run build: [PASS/FAIL]

### 边界
- os/ 未改动: [YES/NO]
- 其他 apps/ 未改动: [YES/NO]
- bench_env/task/ 未改动: [YES/NO]
- 改动范围: apps/<Name>/ 下新增 <N> 文件

### 运行
- dev/preview 启动: [YES/NO]
- App 出现在桌面可启动: [YES/NO]
- snapshot 可见 (apps.<id>): [YES/NO]
- __SIM__.reset() 回默认: [YES/NO]

### 人工 smoke
- [ ] 6 项核心交互可达（tab/子页/back/dialog/state 持久/键盘）

### 新增 ID
- transitionId: <列表>
- actionId: <列表>

### 遗留
- <若有未修 WARN 或已知限制，列明>
```

PASS 全绿 + 6 项 smoke 勾完 = App 可交付，可进下一个。
