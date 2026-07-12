# App Generation Prompt Template

> 后续生成单个目标 App 时直接复制使用的标准 prompt。新 Claude Code 会话只读 `docs/authoring/` 下压缩文档，不重读全仓库。
> 用法：把下方 `<APP_NAME>` 等占位符替换为目标 App 的值（从 `DAILY_10_APP_PRODUCTION_PLAN.md` 取），整段复制给新会话。

---

## 支持的目标 App（取值表）

| 占位 `<APP_NAME>` | 目录名 | manifest.id | 参考示例 | 计划章节 |
|---|---|---|---|---|
| Wallet | Wallet | wallet | Alipay/Ebay/Weather | §1 |
| Duolingo | Duolingo | duolingo | Spotify/Weather/Ebay | §2 |
| GoogleDrive | GoogleDrive | googledrive | Ebay/Map/Spotify | §3 |
| Zhihu | Zhihu | zhihu | Spotify/Wechat/Weather | §4 |
| ChinaMobile | ChinaMobile | chinamobile | Alipay/Railway/Weather/Map | §5 |
| Cainiao | Cainiao | cainiao | Railway12306/Map/Weather/Alipay | §6 |
| Gmail | Gmail | gmail | Wechat/Spotify/Railway12306 | §7 |
| Telegram | Telegram | telegram | Wechat/Weather/Railway12306 | §8 |
| Didi | Didi | didi | Map/Railway12306/Alipay | §9 |
| Amazon | Amazon | amazon | Ebay/Spotify/Railway12306 | §10 |

---

## 标准 Prompt（复制此段）

```
你是 MobileGym（React+Vite+TS+Tailwind v4 模拟 Android 环境）App 生成 agent。本次只生成【<APP_NAME>】这一个 App（名字用原名，不加 Lite），不生成其他 App，不写 benchmark 代码（benchmark 另起任务）。

## 必读文档（只读 docs/authoring/ 下这 7 份，不重读全仓库）
1. docs/authoring/MOBILEGYM_AUTHORING_RULES_COMPACT.md — 全部硬规则（文件结构/manifest/nav/state/data/res/benchmark 规则/禁止事项/验证命令）
2. docs/authoring/EXEMPLAR_APP_AND_BENCHMARK_AUDIT.md — 7 个示例 App + benchmark 写法审计（每个 App 的文件清单/state/判定范式/参考价值）
3. docs/authoring/DAILY_10_APP_PRODUCTION_PLAN.md — 10 个目标 App 规划，本次生成【<APP_NAME>】，对应第 §<N> 节（App 目标/UI 显示名/目录名/manifest.id/参考示例/主要页面/主要实体/world data/runtime state/benchmark 设计重点/风险点）
4. docs/authoring/DAILY_APP_PAGE_BASELINES.md — 【<APP_NAME>】的默认首页/列表/详情/账号状态/tab/world data vs runtime overlay/高保真页/模拟项
5. docs/authoring/DAILY_APP_15_BENCHMARK_MATRIX.md — 【<APP_NAME>】的 15+ benchmark task 规划（生成 App 后另起 benchmark 任务时参考）
6. docs/authoring/APP_GENERATION_PROMPT_TEMPLATE.md — 本文档
7. docs/authoring/APP_VALIDATION_PROTOCOL.md — 生成后必跑的验证流程

## 本 App 元信息（取自 DAILY_10_APP_PRODUCTION_PLAN.md §<N>）
- UI 显示名：<见计划>
- 代码目录名：<见计划>（放 apps/ 下）
- manifest.id：<见计划>
- designViewportWidth：<见计划>
- 参考示例 App：<见计划>——对应 EXEMPLAR_APP_AND_BENCHMARK_AUDIT.md 的审计章节，直接套用其文件结构/state 模式/判定范式

## 严格限制
1. 不修改 os/（OS 自动发现，无需改）
2. 不修改其他已有 App（apps/Alipay 等只读参考）
3. 不修改 bench_env/task/（benchmark 另起任务）
4. 只在 apps/<目录名>/ 下新增文件
5. 遵守 MOBILEGYM_AUTHORING_RULES_COMPACT.md 全部规则，特别是：
   - TimeService 替换所有 new Date/Date.now（ESLint 禁）
   - 业务页禁 useNavigate，只用本 App go()/back()
   - dialog URL-driven，禁 useState 控可见性
   - 禁 import BackDispatcher
   - icons.tsx 全 Ic* 前缀，禁原始 Lucide 名
   - JS 像素用 CSS var 或 h-[Npx]，禁 rem class（h-10/h-14）
   - 聊天/底部栏禁 position:fixed，用 flex flex-shrink-0
   - PointerEvent 代替 touch+mouse 并行
   - store action 内禁 query getter；组件直接订阅数据 + .includes()/Set.has() 派生
   - 业务实体表放 store 顶层不嵌套 user；聚合计数派生不回写；禁同存 *Ids 和 *Count
   - settings 顶层键嵌套匹配设置页路由；禁 initialSettings/config/preferences
   - world data（data/*.json/loader.ts 只读不持久不在 snapshot）vs runtime overlay（state.ts+defaults.json 持久在 snapshot）两层
   - 大数据集走 loader.ts（export preload()），index.ts 不 import 大数据保持同步，bench 读写走 store action

## 生成顺序（落地顺序，避免 declaration/source drift）
1. manifest.ts（id/displayName/displayNameEn/aliases/theme/intentFilters/designViewportWidth/type:plugin）
2. navigation.declaration.ts（routes+uiStates[每 route 必有 .base]+transitions+actions，as const satisfies NavigationDeclaration；capabilities.historyBack:true 顶层必填；cases 非空须 {when:{op:'always'}} 结尾；action id regex ^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$ ≥3 段）
3. navigation.types.ts（本地 NavigationDeclaration 类型副本）
4. navigation.ts（useAppNavigate 的 go()/back()，mode push=modal/replace=tab）
5. types.ts（App 级类型）
6. constants.ts（tab/service 目录/feature flag，禁用户数据禁原始 Lucide 名）
7. data/defaults.json（用户信息/内容/可配置布局/settings，禁 service 固定属性）
8. data/index.ts（导出 <APPNAME>_CONFIG，合并 constants+defaults，相对时间戳 resolveDataTimestamp）
9. data/*.json + loader.ts（如需大型 world data，loader.ts export preload()）
10. state.ts（createAppStoreWithActions('<id>', ...)；partialize 保留 snapshot 字段排除 _temp；actions 命名语义；禁 query getter；memoSelector for Set 派生；registerStateAdapter 若需 bench 可见派生）
11. res/icons.tsx（Ic* + ICON_REGISTRY 键=export 名）、res/strings.ts + strings.en.ts（useAppStrings）、res/colors.ts/dimens.ts（仅必要时）
12. hooks/use<App>Gestures.ts（包 useTriggerGestures，system.back 全局拦截交 __OS__.handleBack）
13. pages/（每页 pt-10 + data-status-bar-foreground；data-trigger/data-action 字面量 id；scrollContainer data-scroll-container）
14. components/（跨页共享）
15. <App>App.tsx（export default；MemoryRouter initialEntries 如需强制 query；useAppNavigationHandler(manifest.id,{onBack}) 在 Router 内；主 tab 持久 display:none 隐藏 + 子页独占；Routes 注册所有 path）

## 验证（生成后必跑，见 APP_VALIDATION_PROTOCOL.md）
- node scripts/build_nav_artifacts.mjs <App目录名>（无 ERROR/WARN）
- node scripts/check_navigation_declaration_consistency.mjs <App目录名> --actions
- node scripts/lint_store_getters.mjs <App目录名>
- npm run lint
- npx tsc --noEmit
- npm run build
- 检查未误改 os/ 和已有 App：git status 只应有 apps/<目录名>/ 下新增文件

## 输出格式（回复用户时必须包含）
- 变更摘要：实现了哪些页面/交互
- 文件清单：每个文件一句话
- 新增 transitionId/actionId 列表
- 验证结果：build_nav_artifacts 是否通过，有 WARN/ERROR 列具体 ID + file:line + 修复方式
- 自检：未误改 os/、未误改其他 App、未改 bench_env/task/

开始前先读上述 7 份 docs/authoring/ 文档，再读 EXEMPLAR audit 中【参考示例 App】对应章节确认要套用的模式。如有歧义先问，不要臆造。
```

---

## 使用示例（生成 Wallet 时）

把上方 `<APP_NAME>`→`Wallet`，`§<N>`→`§1`，目录名 `Wallet`，manifest.id `wallet`，参考示例 `Alipay/Ebay/Weather`，复制整段给新会话即可。新会话只读 docs/authoring/ 7 份文档 + apps/Alipay（只读参考 bankCards/RealisticQRCode/intentFilters 模式），不重读全仓库。

## 多 App 批量

按 `DAILY_10_APP_PRODUCTION_PLAN.md` 推荐顺序（Wallet→Duolingo→GoogleDrive→Zhihu→ChinaMobile→Cainiao→Gmail→Telegram→Didi→Amazon）逐个用本模板生成。每个 App 生成后跑 `APP_VALIDATION_PROTOCOL.md` 验证通过再进下一个。benchmark task 在该 App 验证通过后另起任务（参考 `DAILY_APP_15_BENCHMARK_MATRIX.md` + `designing-bench-task`/`writing-bench-task-judge`/`testing-bench-task` skill）。
