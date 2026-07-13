# Wallet App 验证报告

## 1. 基本信息

- **App 名称**: Wallet（卡包）
- **manifest.id**: `wallet`
- **目录**: `apps/Wallet/`
- **suite**: `bench_env/task/wallet/`
- **测试分支**: `app-wallet`
- **报告日期**: 2026-07-13

## 2. 页面与功能

### 2.1 页面

| 页面 | 路径 | 说明 |
|---|---|---|
| 首页 | `/` | 卡片列表、搜索、类型筛选 |
| 卡片详情 | `/card/:id` | 查看详情、设默认、重命名、冻结/解冻、删除、展示付款码 |
| 付款码 | `/card/:id/code` | 二维码展示 |
| 添加银行卡 | `/add/bank` | 表单：发卡行、持卡人、后四位、昵称、卡号 |
| 添加交通卡 | `/add/transit` | 选择城市 |
| 添加会员卡 | `/add/membership` | 品牌、会员编号、积分 |
| 添加优惠券 | `/add/coupon` | 商家、券码、面值、有效期 |
| 卡片排序 | `/sort` | 上移/下移 |
| 优惠券列表 | `/coupons` | 查看/核销 |
| 过期票券 | `/tickets` | 查看/归档 |
| 已归档票券 | `/archived` | 归档后列表 |
| 我的 | `/me` | 统计入口 |
| 设置 | `/settings` | 通知、主题 |

### 2.2 核心功能

- 银行卡 CRUD（添加、重命名、冻结/解冻、删除、设默认）
- 卡片排序（持久化 sortOrder）
- 交通卡添加与充值（余额 + 交易记录）
- 会员卡添加与积分兑换（积分扣减 + 兑换记录）
- 优惠券添加与核销（redeemed 状态）
- 过期票券归档（tickets → archivedTickets）
- 搜索会员卡并回答会员编号
- 二维码/条码展示

## 3. 15 个 Benchmark

| # | Task ID | 目标 | 判定方式 | 预期副作用 |
|---|---|---|---|---|
| 1 | `wallet.AddBankCard` | 添加指定银行卡 | `check_goals` | `cards[+1]` |
| 2 | `wallet.SetDefaultCard` | 设置默认卡 | `CriteriaTask` | `defaultCardId`, `cards[].isDefault` |
| 3 | `wallet.RenameCard` | 重命名银行卡 | `check_goals` | `cards[].name` |
| 4 | `wallet.FreezeCard` | 冻结银行卡 | `CriteriaTask` | `cards[].frozen` |
| 5 | `wallet.UnfreezeCard` | 解冻已冻结银行卡 | `CriteriaTask` | `cards[].frozen` |
| 6 | `wallet.DeleteCard` | 删除银行卡（经详情+确认） | `check_goals` | `cards[-=id]` |
| 7 | `wallet.SortCards` | 将指定卡移到首位 | `check_goals` | `cards` 顺序 |
| 8 | `wallet.AddTransitCard` | 添加指定城市交通卡 | `check_goals` | `cards[+1]` |
| 9 | `wallet.RechargeTransitCard` | 为交通卡充值 | `check_goals` | `cards[].balance`, `transactions[+1]` |
| 10 | `wallet.AddMembershipCard` | 添加指定品牌会员卡 | `check_goals` | `cards[+1]` |
| 11 | `wallet.RedeemReward` | 用会员卡积分兑换奖励 | `check_goals` | `cards[].points`, `redeemedRewards[+1]` |
| 12 | `wallet.AddCoupon` | 添加指定商家优惠券 | `check_goals` | `coupons[+1]` |
| 13 | `wallet.RedeemCoupon` | 核销指定优惠券 | `check_goals` | `coupons[].redeemed` |
| 14 | `wallet.ArchiveExpiredTicket` | 归档指定过期票券 | `check_goals` | `tickets[-=id]`, `archivedTickets[+1]` |
| 15 | `wallet.SearchMembershipNumber` | 搜索会员卡并回答会员编号 | `AnswerTask` + route | `searchHistory` |

## 4. UI 操作路径

- **添加银行卡**: 首页 → 右上角 + → 填写表单 → 保存
- **设置默认卡**: 首页 → 点击卡片 → 设为默认
- **重命名/冻结/解冻/删除**: 首页 → 点击卡片 → 对应操作 → 确认
- **排序**: 首页 → 右上角排序图标 → 移动 → 保存
- **添加交通卡**: 首页 → 添加交通卡 → 选择城市 → 保存
- **充值**: 点击交通卡 → 充值 → 输入金额 → 确认
- **添加会员卡/优惠券**: 首页 → 对应添加入口 → 填写 → 保存
- **兑换奖励**: 会员卡详情 → 选择奖励 → 兑换
- **核销优惠券**: 底部优惠 tab → 点击核销
- **归档票券**: 我的 → 过期票券 → 归档
- **搜索会员编号**: 首页搜索框 → 输入品牌 → 点击会员卡 → 查看会员编号

## 5. 初始状态

`apps/Wallet/data/defaults.json` 包含：
- 3 张银行卡（含默认卡、冻结卡）
- 1 张交通卡（北京一卡通，余额 42.5）
- 2 张会员卡（星巴克、海底捞，含积分）
- 2 张优惠券（1 未核销、1 已核销）
- 2 张过期票券
- 3 个可兑换奖励
- 1 条充值交易记录

## 6. State Delta 与 Judge 字段

- 添加类任务：`cards`/`coupons` 增加一条记录，judge 检查完整字段匹配。
- 修改类任务：`cards[].name`/`frozen`/`isDefault`，judge 检查对应字段。
- 排序任务：检查 `cards` 数组首项 ID。
- 充值任务：检查交通卡 `balance` 增加 + `transactions` 新增记录。
- 兑换任务：检查会员卡 `points` 减少 + `redeemedRewards` 新增。
- 核销任务：检查 `coupons[].redeemed` 为 True。
- 归档任务：检查票券从 `tickets` 移除并加入 `archivedTickets`。
- 查询任务：检查 `route`、`searchHistory`、`answer`。

## 7. Reset 策略

- 每个 task 独立 reset 通过 `env.reset(app_ids=["wallet"])` 完成。
- `defaults.json` 提供稳定初始态；samplers 从初始 cards/coupons/tickets/rewards 中采样。
- `CriteriaTask._invert_criteria` 确保目标状态 ≠ 初始状态（如默认卡/冻结反转）。

## 8. 测试结果

| 检查项 | 命令 | 结果 |
|---|---|---|
| Navigation artifacts | `node scripts/build_nav_artifacts.mjs Wallet` | 通过（0 ERROR） |
| Declaration consistency | `node scripts/check_navigation_declaration_consistency.mjs Wallet --actions` | 通过 |
| Store getter lint | `node scripts/lint_store_getters.mjs Wallet` | 通过 |
| ESLint | `npm run lint` | 通过（Wallet 无新增错误/警告） |
| TypeScript | `npx tsc --noEmit` | Wallet 无错误 |
| Production build | `npm run build` | 通过 |
| 离线 judge 测试 | `pytest bench_env/tests/wallet/test_tasks.py -q` | 51 passed, 1 skipped |
| 任务可发现 | `python -m bench_env.run --list \| grep wallet` | 15 个 task 可发现 |
| Preview smoke | `npm run preview -- --port 4173` + curl | HTTP 200 |
| git diff --check | `git diff --check` | 无问题 |

## 9. OPEN_APP 验证

- App 在 OS 中通过 `import.meta.glob` 自动发现，无需改 OS。
- `manifest.id = 'wallet'` 与 `bench_env/task/wallet` suite ID 一致。
- `python -m bench_env.run --list` 正确列出 `wallet.*` 任务。

## 10. Dead Button 审计

通过脚本扫描 `apps/Wallet/pages/` 内所有 `<button>`，确认每个按钮均绑定 `onClick` 或 `{...bindBack()}` 等事件处理器，无 dead button。

## 11. 已知限制

- `SearchMembershipNumber` 为查询任务，grounded 模式下需 Agent 正确填写 AnswerSheet；当前 judge 同时检查 route 与 searchHistory。
- 优惠券/票券未接入真实核销网关，均为本地状态模拟。
- 付款码为确定性模拟二维码，非真实支付。
