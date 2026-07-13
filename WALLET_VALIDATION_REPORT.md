# Wallet App 验证报告

## 1. 基本信息

- **App 名称**：Wallet（卡包）
- **manifest.id**：`wallet`
- **源码目录**：`apps/Wallet/`
- **Benchmark suite**：`bench_env/task/wallet/`
- **分支**：`app-wallet`
- **验证日期**：2026-07-13
- **限制遵守**：未切换分支、未 merge、未 rebase、未 push；未修改 `public/cdn`、`os/**`、其他 App、package 文件或核心框架。

## 2. 重构结果

Wallet 已从演示型页面重构为可通过普通 click/tap 完成业务操作的卡包 App，使用单一持久化状态模型，并以稳定实体 ID 维护银行卡、交通卡、会员卡、优惠券、票券和兑换/充值记录。

### 2.1 页面与路由

| 页面 | 路径 |
|---|---|
| WalletHome | `/` |
| BankCards | `/bank-cards` |
| AddBankCard | `/bank-cards/add` |
| BankCardDetail | `/bank-cards/:id` |
| EditBankCard | `/bank-cards/:id/edit` |
| DeleteBankCard | `/bank-cards/:id/delete` |
| TransitCards | `/transit-cards` |
| AddTransitCard | `/transit-cards/add` |
| TransitCardDetail | `/transit-cards/:id` |
| MembershipCards | `/membership-cards` |
| AddMembership | `/membership-cards/add` |
| MembershipDetail | `/membership-cards/:id` |
| Rewards | `/rewards/:id` |
| Coupons | `/coupons` |
| AddCoupon | `/coupons/add` |
| CouponDetail | `/coupons/:id` |
| ExpiredTickets | `/expired-tickets` |
| ArchivedTickets | `/archived-tickets` |
| Search | `/search` |
| Bank code | `/code/bank/:id` |
| Transit code | `/code/transit/:id` |
| Membership code | `/code/membership/:id` |
| Coupon code | `/code/coupon/:id` |

### 2.2 显式父页面返回映射

| 子页面 | 显式父页面 |
|---|---|
| BankCardDetail | BankCards |
| AddBankCard | BankCards |
| EditBankCard | BankCardDetail |
| DeleteBankCard | BankCardDetail；确认删除后 BankCards |
| TransitCardDetail | TransitCards |
| AddTransitCard | TransitCards |
| MembershipDetail | MembershipCards |
| AddMembership | MembershipCards |
| Rewards | MembershipDetail |
| CouponDetail | Coupons |
| AddCoupon | Coupons |
| ExpiredTickets | WalletHome |
| ArchivedTickets | ExpiredTickets |
| Search | WalletHome |
| BarcodeOrQRCode | 对应的银行卡、交通卡、会员卡或优惠券详情 |

只有 `WalletHome` 在系统返回时允许退出 Wallet；其他页面由 `WalletNavigationHandler` 映射到明确父页面。

### 2.3 银行卡信息展示

银行卡列表显示：

- 发卡行
- 昵称
- 借记卡/信用卡类型
- 掩码卡号，例如 `•••• •••• •••• 4821`
- 可辨识后四位（包含在掩码卡号中）
- 默认卡标记
- 冻结标记

银行卡详情显示：

- 发卡行、昵称、持卡人
- 掩码卡号和独立后四位字段
- 借记卡/信用卡类型
- 默认状态和冻结状态
- 卡组织、验证方式、开卡时间、绑定设备等模拟元数据
- 设为默认、冻结/解冻、重命名、展示码、删除等可见操作入口

### 2.4 可点击业务功能

- 添加银行卡；设置默认卡；重命名；冻结/解冻；删除取消与确认
- 银行卡上移、下移、置顶
- 添加交通卡；充值 ¥50/¥100；查看充值记录
- 添加会员卡；显示会员编号；兑换奖励；查看兑换记录
- 添加优惠券；显示优惠券码；核销并阻止重复核销
- 将过期票券从 `tickets` 移到 `archivedTickets`；查看已归档列表
- 搜索真实卡片/优惠券/票券并打开对应详情
- 从对应详情打开确定性模拟二维码和条形码

## 3. 状态不变量与稳定 ID

- 存在银行卡时恰好一张默认卡。
- 设置新默认卡会清除旧默认状态。
- 删除默认卡时按剩余排序确定性选择替代卡。
- 冻结状态在列表、详情和搜索结果中来自同一持久化实体。
- 添加、重命名、排序、充值、兑换、核销和归档均持久化。
- 充值同时增加目标交通卡余额并新增一条匹配交易记录。
- 奖励兑换校验会员卡归属、积分余额与重复兑换；积分不会低于零。
- 优惠券不能重复核销。
- 归档操作从活动票券移除目标并只向归档列表添加一次。
- 新实体 ID 由同前缀现有最大数字后缀确定性递增，例如 `card-bank-004`；未使用 `Math.random`、时间戳或数组索引作为实体身份。

## 4. 恰好 15 个 Benchmark

1. `wallet.AddBankCard`
2. `wallet.SetDefaultCard`
3. `wallet.RenameBankCard`
4. `wallet.FreezeBankCard`
5. `wallet.UnfreezeBankCard`
6. `wallet.DeleteBankCard`
7. `wallet.ReorderBankCards`
8. `wallet.AddTransitCard`
9. `wallet.RechargeTransitCard`
10. `wallet.AddMembershipCard`
11. `wallet.RedeemReward`
12. `wallet.AddCoupon`
13. `wallet.RedeemCoupon`
14. `wallet.ArchiveExpiredTicket`
15. `wallet.SearchMembershipNumber`

### 4.1 Judge 修复

- 将数据访问、采样器和精确 state-delta 棒性集中到 `bench_env/task/wallet/app.py`。
- 添加类任务检查“恰好新增一条”并验证目标字段，同时保护原有实体。
- 默认卡、重命名、冻解、删除和排序按稳定目标 ID 判定。
- 充值同时核对余额增量、目标卡和唯一新增交易记录。
- 奖励兑换同时核对积分扣减、非负约束和唯一兑换记录。
- 优惠券添加/核销与票券归档检查错误目标、重复操作及集合迁移。
- `SearchMembershipNumber` 检查精确查询、目标会员卡 ID、详情路由、搜索历史，以及 AnswerSheet 的答案与 `submitted=True`。

### 4.2 离线测试覆盖

`bench_env/tests/wallet/test_tasks.py` 固定检查 15 个 task ID，并包含：

- 每个 task 的正例和未操作反例。
- 充值的部分完成/错误目标反例。
- 奖励兑换的部分完成反例。
- 搜索任务的错误目标、错误答案、未提交、空答案反例。

## 5. 真实渲染 UI 验证

使用 Playwright 连接真实 Vite 模拟器，通过页面上的普通 click/tap 和输入控件驱动 Wallet。每个独立场景先执行模拟器 reset 并从 WalletHome 启动，避免复用旧 MemoryRouter 路由。

实际通过的场景：

1. 打开银行卡列表，看到 `•••• •••• •••• 8888`，进入详情看到后四位 `8888`。
2. 点击详情返回按钮回到 BankCards，未退出 Wallet。
3. 填写并提交新增银行卡，看到 `旅行卡` 和 `•••• •••• •••• 4821`；状态 ID 为 `card-bank-004`。
4. 将新卡设为唯一默认卡。
5. 冻结并解冻同一银行卡，状态与 UI 操作一致。
6. 删除页先取消返回详情，再确认删除并从列表消失。
7. 搜索“星巴克”，打开 `card-membership-001` 会员详情，状态记录精确搜索词、目标 ID 和详情路由。
8. 为北京一卡通充值 ¥50，余额增加 50 且新增一条金额为 50 的充值记录。
9. 核销优惠券后核销按钮消失；刷新后核销时间保持，不能重复核销。
10. 归档 `ticket-001` 后，它从 `tickets` 移至 `archivedTickets`；已归档页显示该票券，重复条目数保持 1。

UI 验证过程中发现并修复了两个真实运行问题：

- 模拟键盘打开时提交按钮点击被吞：共享按钮增加 `data-keep-keyboard="true"`。
- Search、MembershipDetail、TransitCardDetail、Rewards 的 Zustand selector 每次返回新数组导致 React `Maximum update depth exceeded`：改为订阅原始数组并通过 `useMemo` 派生。

最后一次 UI smoke 输出为 9 项 `PASS`（8 个主场景组 + 1 个重复归档探测），截图保存在本机 `/tmp/wallet-archived.png`。

## 6. 最终命令结果

| 检查项 | 命令 | 实际结果 |
|---|---|---|
| 真实 UI smoke | `python /tmp/wallet_ui_smoke.py` | 通过；9 项 PASS |
| Production build | `npm run build` | 通过；Vite 3367 modules transformed；仅仓库既有 chunk warning |
| ESLint | `npm run lint` | 通过，0 errors；全仓库 74 个既有 warnings，Wallet 无 warning |
| Navigation artifacts | `node scripts/build_nav_artifacts.mjs Wallet` | 通过；23 routes、49 transitions、20 actions；20/20 actions reachable；0 ERROR/WARN |
| Declaration consistency | `node scripts/check_navigation_declaration_consistency.mjs Wallet --actions` | 通过；missing/unused/mismatch/schema error/schema warning 均为 0 |
| Store getter lint | `node scripts/lint_store_getters.mjs Wallet` | 通过；未发现 anti-pattern |
| Offline judges | `python -m pytest bench_env/tests/wallet -m "not live" -q` | `52 passed in 1.45s` |
| Task discovery | `python -m bench_env.run --list` | `[wallet] (15 tasks, 15 parameterized)`，恰好 15 个 |
| TypeScript | `NODE_OPTIONS="--max-old-space-size=8192" npx tsc --noEmit --pretty false` | exit 2；Wallet 0 errors；`apps/Cainiao/**` 38 条既有错误（总输出 146 行），受范围限制未修改 |
| Diff formatting | `git diff --check` | 通过，无输出 |

说明：第一次将 `tsc` 与导航构建并行运行时进程收到 exit 137；随后单独重跑获得上表可复现结果。

## 7. 已知限制

- 全仓库 TypeScript 检查仍被 `apps/Cainiao/**` 的既有类型错误阻断；Wallet 自身没有 TypeScript 错误。
- 优惠券核销、积分兑换和付款码均为本地模拟业务，不连接真实支付/核销服务。
- 二维码/条形码是确定性模拟展示，不可用于真实支付。
