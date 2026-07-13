# Taobao (淘宝) Validation Report

## 读取的压缩文档
- MOBILEGYM_AUTHORING_RULES_COMPACT.md
- EXEMPLAR_APP_AND_BENCHMARK_AUDIT.md
- DAILY_10_APP_PRODUCTION_PLAN.md
- DAILY_APP_PAGE_BASELINES.md
- DAILY_APP_15_BENCHMARK_MATRIX.md
- APP_GENERATION_PROMPT_TEMPLATE.md
- APP_VALIDATION_PROTOCOL.md

## 文件列表

### apps/Taobao/ (核心App文件)
- manifest.ts — App注册（id: taobao, 显示名: 淘宝）
- TaobaoApp.tsx — 根组件 (MemoryRouter + 19 routes)
- navigation.declaration.ts — 19 routes, 30 transitions, 34 actions
- navigation.types.ts — 本地类型副本
- navigation.ts — go()/back() + useTaobaoGestures
- types.ts — 完整类型定义 (Product, Sku, CartItem, Coupon, Address, Order, etc.)
- state.ts — Zustand store (createAppStoreWithActions, 30+ actions)
- constants.ts — 结构性常量 (tabs, sort options, order status tabs)
- data/defaults.json — 世界数据 (24 products, 70+ SKUs, 8 categories, 6 shops, 19 brands, 5 coupons, 3 addresses, 6 orders, 4 logistics, 8 reviews)
- data/index.ts — TAOBAO_CONFIG导出 + resolveDataTimestamp
- res/icons.tsx — 60+ Ic* 图标
- res/strings.ts + strings.en.ts — 中英文字符串
- hooks/useTaobaoStrings.ts — i18n hook
- components/TaobaoNavigationHandler.tsx — 导航注册
- components/TabBar.tsx — 底部4标签栏
- pages/ — 19个页面组件 (4,424行总计)

### bench_env/task/taobao/ (Benchmark Suite)
- __init__.py
- app.py — Taobao(BaseApp) accessor (450行)
- defs/ — 15个任务定义文件

### bench_env/tests/taobao/ (Tests)
- __init__.py
- test_tasks.py — 18个测试用例 (8 positive + 10 negative)

## 页面映射与返回路径
| 页面 | Route | 入口 | 返回目标 |
|------|-------|------|----------|
| HomePage | / | Tab Home | - (仅根页面可退出App) |
| CategoriesPage | /categories | Tab Category | Tab Home |
| SearchPage | /search | Home search bar | 上一页 |
| ProductDetailPage | /item/:id | 搜索/分类/收藏 | 来源页 |
| CartPage | /cart | Tab Cart | 来源页 |
| CheckoutPage | /checkout | Cart checkout | Cart |
| PaymentPage | /payment/:orderId | Checkout submit | Orders |
| OrdersPage | /orders | Me orders | Me |
| OrderDetailPage | /order/:id | Orders | Orders |
| LogisticsPage | /logistics/:orderId | OrderDetail | OrderDetail |
| RefundPage | /refund/:orderId/:itemId | OrderDetail | OrderDetail |
| ReviewPage | /review/:orderId/:itemId | OrderDetail | OrderDetail |
| MePage | /me | Tab Me | - |
| FavoritesPage | /favorites | Me favorites | Me |
| CouponsPage | /coupons | Me coupons | Me |
| AddressesPage | /addresses | Me addresses | Me |
| AddressEditPage | /address/edit | Addresses add/edit | Addresses |
| SettingsPage | /settings | Me settings | Me |
| ShopPage | /shop/:id | ProductDetail | ProductDetail |

## 传统购物业务闭环
✅ 首页推荐和分类浏览
✅ 搜索（关键词+筛选+排序）
✅ 商品详情（多维度SKU选择、数量、加购、立即购买）
✅ 购物车（选择、数量修改、删除）
✅ 优惠券（领取、选择、门槛校验、金额计算）
✅ 地址簿（新增、编辑、删除、默认地址）
✅ 结算（商品确认→地址→优惠券→配送→金额→提交）
✅ 下单（库存扣减、优惠券消费、购物车清理）
✅ 模拟支付（pending_payment→paid）
✅ 订单管理（按状态查看、取消未发货）
✅ 物流追踪（承运公司、运单号、时间线）
✅ 确认收货
✅ 退款申请
✅ 商品评价（星级+文本+标签）
✅ 收藏管理

## 排除项
✅ 完全排除闪购、即时零售、外卖、买菜、药品即时送、同城小时达
✅ 无饿了么入口
✅ 无实时定位依赖
✅ 无线下门店功能

## World Data / Runtime Overlay
- World data: data/defaults.json (products, skus, categories, brands, shops, coupons定义)
- Runtime overlay: state.ts (cart, userCoupons, addresses, orders, reviews, favorites, search)
- 24 products, 70+ SKUs, 6 shops, 8 categories, 19 brands
- 至少10个多SKU商品 (p1, p2, p3, p5, p6, p7, p8, p12, p14, p15, p16, p17, p18, p19, p20, p23, p24)
- 4个已有cart items, 5张不同门槛/范围优惠券, 3个地址, 6个不同状态订单, 4条物流, 8条评价

## 核心按钮行为审计
✅ 所有搜索/筛选/排序/SKU选择/加购/购买/收藏/购物车/优惠券/地址/结算/提交/支付/取消/收货/物流/退款/评价按钮均调用真实store action
✅ 未发现dead button
✅ 无console.log/alert/toast替代真实操作
✅ 所有子页面显式返回父页面，无统一navigate(-1)

## 15个Benchmark Task

| # | Task ID | Difficulty | Objective |
|---|---------|------------|-----------|
| 1 | SearchFilterSortAndReportSeller | L3 | hybrid query |
| 2 | SelectSkuAndReportUnitPrice | L3 | grounded query |
| 3 | CompareTwoProductsAndReportCheaper | L4 | hybrid query |
| 4 | AddSpecificSkuToCart | L2 | operate |
| 5 | UpdateCartSelectionAndQuantity | L3 | operate |
| 6 | RemoveOneCartItemWithoutAffectingOthers | L3 | operate |
| 7 | CollectCouponAndApplyAtCheckout | L4 | hybrid operate |
| 8 | CalculateCheckoutPayable | L4 | grounded hybrid query |
| 9 | AddAddressAndUseAtCheckout | L4 | operate |
| 10 | PlaceMultiItemOrderWithCoupon | L4 | operate |
| 11 | BuyNowWithSkuAndDifferentAddress | L4 | hybrid operate |
| 12 | CancelUnshippedOrderAndRestoreState | L4 | operate |
| 13 | TrackOrderAndReportLatestLogistics | L3 | grounded query |
| 14 | ConfirmReceiptThenReviewProduct | L4 | hybrid operate |
| 15 | RequestRefundForSpecificOrderItem | L4 | operate |

统计：
- ≥3 grounded query: ✅ (tasks 2, 8, 13)
- ≥4 hybrid: ✅ (tasks 1, 3, 7, 8, 11, 14)
- ≥8 operate: ✅ (tasks 4-7, 9-12, 14, 15)
- ≥10 tasks需要4步以上: ✅
- ≥5 tasks需要7步以上: ✅
- ≥5 tasks检查副作用: ✅
- ≥5 L4 tasks: ✅ (8个L4)

## 判题标准
- Query tasks: 检查搜索/筛选/SKU/打开记录 + AnswerSheet submitted + match_value
- Operate tasks: 检查稳定实体ID + 精确state delta + 非目标项不变
- Hybrid tasks: 同时检查UI过程 + 最终state/答案
- 新增记录: initial/final ID diff
- 所有task使用确定性code judge，无VLM judge

## 自动验证结果

| 验证项 | 结果 |
|--------|------|
| build_nav_artifacts | ✅ PASS (0 errors) |
| action schema | ✅ PASS (0 schema errors) |
| npm run build | ✅ PASS |
| tsc --noEmit (Taobao) | ✅ PASS (0 errors) |
| lint_store_getters | ✅ PASS (无问题) |
| ESLint (Taobao) | ⚠️ 2 warnings (exhaustive-deps, minor) |
| Python task registry | ✅ 15 tasks registered |
| pytest offline (18 tests) | ✅ 18 passed |
| git status | ✅ 仅新增文件在允许目录 |

## Human Smoke Test
Dev server运行在 http://localhost:4192

Smoke test模板:
1. 搜索+筛选+排序: `python -m bench_env.run --task-id taobao.SearchFilterSortAndReportSeller --agent human --env-url http://localhost:4192`
2. SKU加购: `python -m bench_env.run --task-id taobao.SelectSkuAndReportUnitPrice --agent human --env-url http://localhost:4192`
3. 优惠券+结算: `python -m bench_env.run --task-id taobao.CalculateCheckoutPayable --agent human --env-url http://localhost:4192`
4. 地址+下单: `python -m bench_env.run --task-id taobao.AddAddressAndUseAtCheckout --agent human --env-url http://localhost:4192`
5. 多商品下单: `python -m bench_env.run --task-id taobao.PlaceMultiItemOrderWithCoupon --agent human --env-url http://localhost:4192`
6. 取消订单: `python -m bench_env.run --task-id taobao.CancelUnshippedOrderAndRestoreState --agent human --env-url http://localhost:4192`
7. 物流+评价+退款: `python -m bench_env.run --task-id taobao.ConfirmReceiptThenReviewProduct --agent human --env-url http://localhost:4192`

GUI model agent模板:
`python -m bench_env.run --task-id taobao.<TaskClass> --agent <agent_name> --model-name <model> --env-url http://localhost:4192`

**状态**: Human smoke test未实际执行（代码环境无GUI），但所有UI路径已验证可达，模板已提供。

## 修改范围合规
✅ 仅修改: apps/Taobao/, bench_env/task/taobao/, bench_env/tests/taobao/, reports/
✅ 未修改: os/, docs/authoring/, .claude/, package.json, 已有App, 已有benchmark suite
✅ 共享注册文件无需修改（OS自动发现）
✅ 使用MobileGym原项目机制（createAppStoreWithActions, useAppNavigationHandler, navigation.declaration, BaseTask/CriteriaTask/AnswerTask）

## 已知问题
- ESLint warnings (exhaustive-deps): 2个手动审查确认安全的警告
- 部分声明action/transition未在代码中以data-trigger/data-action形式使用（WARN，属正常：通过go()编程式使用）
- 图片占位（灰度方块，非真实商品图）
