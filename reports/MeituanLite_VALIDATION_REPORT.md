# MeituanLite Benchmark Suite — Validation Report

**Date:** 2026-07-12 · **Branch:** `daily-10-apps` · **Suite:** `bench_env/task/meituan_lite/` (15 tasks)

## 1. Summary of work

Extended the MeituanLite benchmark suite from a single trivial task to **15 high-difficulty, parameterized tasks** covering operate / query / hybrid objectives. The MeituanLite app itself was **not redesigned or rewritten** — only minimal state-trajectory fixes were applied to support query-process verification. App display name changed to Chinese **"美团"** (per the overriding instruction).

### Difficulty distribution (meets spec: L1≤1, L2 3-4, L3≥6, L4≥4)

| Task | Level | Objective | Composition |
|---|---|---|---|
| SearchShopMinOrder | L1 | query | atomic |
| AddDishToCart | L2 | operate | atomic |
| ModifyCartQuantity | L2 | operate | atomic |
| RemoveCartItem | L2 | operate | atomic |
| SearchShopDeliveryInfo | L2 | query | atomic |
| AddMultiDishToCart | L3 | operate | sequential |
| SubmitOrderWithRemark | L3 | operate+calc | sequential |
| PlaceAndPayWithMethod | L3 | operate+calc | sequential |
| SearchDishFindShop | L3 | query | sequential |
| OrderUnderBudget | L3 | operate+calc | sequential |
| CountShopsByCondition | L3 | query+calc+multi-cond | sequential |
| CompareAndOrderCheaper | L4 | hybrid+calc | sequential |
| MaxDiscountTierOrder | L4 | operate+calc | sequential |
| MultiStepPlaceAndPayOrder | L4 | operate+calc | sequential |
| ConditionalBudgetOrder | L4 | operate (conditional) | deep_dive |

**Totals:** L1=1, L2=4, L3=6, L4=4. Operate=9, query=4, hybrid=1 (several tasks are operate+calc or query+calc). ≥half multi-step (12/15). ≥5 cross-page (all L3/L4 shop→cart→checkout/order flow). ≥4 multi-condition (CountShopsByCondition, ConditionalBudgetOrder, OrderUnderBudget, MaxDiscountTierOrder). ≥3 price/fee/calc (SubmitOrderWithRemark, PlaceAndPayWithMethod, OrderUnderBudget, MaxDiscountTierOrder, CompareAndOrderCheaper).

### Coverage checklist

search shop ✓ (1,5,9) · search dish ✓ (9) · multi-filter/sort → met via multi-condition count (11) · view shop info ✓ (1,5) · add dish by qty ✓ (2,6) · modify cart qty ✓ (3) · delete cart item ✓ (4) · spec/note ✓ (remark+utensils on 7,14) · calc amounts ✓ (7,8,10,13,14) · choose optimal coupon → met via满减 tier calc (13) · budget-constrained ✓ (10,15) · select address → default addr-1 (documented out of scope) · select delivery time → shop default eta (out of scope) · submit order (real record) ✓ (7,8,10,12,13,14,15) · order history ✓ (old-orders-unchanged checks) · conditional operate ✓ (15) · multi-condition count ✓ (11) · compare two prices ✓ (12).

## 2. Key-button audit

### Real buttons (state mutated → judge state path)

| Button | Page | State mutated | Judge path |
|---|---|---|---|
| Search input / hot keywords / shop card | SearchPage | `_temp.searchCurrent` | `apps.meituan-lite._temp.searchCurrent` (always_ignore; query-process evidence) |
| Add-to-cart (dish +) | ShopDetailPage | `cart`, `cartShopId` | `apps.meituan-lite.cart`, `.cartShopId` |
| Cart qty +/− | CartPage | `cart[].qty` | `apps.meituan-lite.cart` |
| Cart delete (qty→0) | CartPage | `cart` (filtered) | `apps.meituan-lite.cart` |
| Submit order | CheckoutPage | `orders` (+new), `cart`→[], `cartShopId`→null | `apps.meituan-lite.orders`, `.cart`, `.cartShopId` |
| Payment method select | Checkout/Payment | `paymentMethod` | `apps.meituan-lite.paymentMethod` |
| Pay (markOrderPaid) | Payment success | `orders[].status`, `userProfile.balance` (if balance) | `apps.meituan-lite.orders`, `.userProfile` |
| Remark input | Checkout (local) | flows into `submitOrder` → `orders[].remark` | `apps.meituan-lite.orders[].remark` |
| Utensils selector | Checkout (local) | flows into `submitOrder` → `orders[].utensils` | `apps.meituan-lite.orders[].utensils` |

### Dead buttons (documented, NOT fixed — out of minimal scope)

| Button | Why dead | Why not fixed |
|---|---|---|
| `setAddress` (address select) | No address-list UI wired to the action | No task requires changing address; all orders use default `addr-1`. Select-address coverage is documented as unmet-by-design. |
| `removeOrder` (cancel order) | Cancel button absent on OrderDetailPage | No task requires cancelling an existing order; all order tasks create **new** orders and verify old orders unchanged. |
| OrderDetailPage "去支付" (待支付) | No pay-from-detail button | Pay tasks use the in-flow submit→pay path, not injected 待支付 orders. |
| Coupons / specs / filter-sort / delivery-time | No UI for these | Coverage intent met via满减 discount calc, remark/utensils, search+multi-condition count. None are needed by any task's ground truth. |

### Dead-button fixes applied (minimal, state-trajectory only)

**Fix A (only fix):** SearchPage previously left no observable state trail, so query tasks could not verify the agent actually performed a search (an agent could guess the answer without searching). Added a volatile `_temp.searchCurrent` slot to `state.ts` (`submitSearch`/`clearSearch` actions) and wired a `useEffect` in `SearchPage.tsx` to record the query + result shop ids. This is **volatile** (excluded from localStorage by `createAppStoreWithActions`, always_ignore in the judge) — it exists solely as benchmark evidence that a search was executed. **No UI buttons were added, removed, or rewired; no app logic was rewritten.**

## 3. Per-task judge state paths

| Task | expected_changes | Primary checks |
|---|---|---|
| SearchShopMinOrder | `[]` | search performed + answer_sheet 起送价 |
| AddDishToCart | `[cart, cartShopId]` | cart_exact(shop,dish,qty) + old_orders_unchanged |
| ModifyCartQuantity | `[cart, cartShopId]` | cart_exact(target qty) |
| RemoveCartItem | `[cart, cartShopId]` | cart_exact(keep items) |
| SearchShopDeliveryInfo | `[]` | search performed + answer_sheet(配送费,配送时间) |
| AddMultiDishToCart | `[cart, cartShopId]` | cart_exact(2 lines) |
| SubmitOrderWithRemark | `[orders, cart, cartShopId]` | new_order(shop,items,remark,utensils,status=待支付,amount) + cart_cleared + old_unchanged |
| PlaceAndPayWithMethod | `[orders, cart, cartShopId, paymentMethod, userProfile]` | new_order(method,status=商家已接单,amount,balance) + cart_cleared + old_unchanged |
| SearchDishFindShop | `[]` | search performed + answer_sheet(商家名称) |
| OrderUnderBudget | `[orders, cart, cartShopId]` | new_order + totalPayable≤budget + cart_cleared + old_unchanged |
| CountShopsByCondition | `[]` | search(q=满减) + answer_sheet(count) |
| CompareAndOrderCheaper | `[orders, cart, cartShopId]` | new_order(cheaper shop/product/qty,amount) + cart_cleared + old_unchanged + answer_sheet(cheaper total) |
| MaxDiscountTierOrder | `[orders, cart, cartShopId]` | new_order(discount==expected,amount) + cart_cleared + old_unchanged |
| MultiStepPlaceAndPayOrder | `[orders, cart, cartShopId, paymentMethod, userProfile]` | new_order(remark,utensils,method,status=商家已接单,amount,balance) + cart_cleared + old_unchanged |
| ConditionalBudgetOrder | `[orders, cart, cartShopId]` | if should_order: new_order + within_budget + cart_cleared; else: new_count==0 + decision.no_order_over_budget |

Price math is recomputed from state in `app.py` (`compute_discount`, `compute_fees`) mirroring `state.ts` — **no hardcoded amounts**. AnswerSheet values use `match_value` (number extraction + `isclose`).

## 4. Validation results

| Check | Result |
|---|---|
| `node scripts/build_nav_artifacts.mjs MeituanLite` | ✅ schemaErrors=0, schemaWarnings=0, missingInDeclaration=0 |
| `npm run lint` | ✅ 0 errors (74 pre-existing warnings, none new; 0 store-getter anti-patterns) |
| `npx tsc --noEmit` | ✅ 0 errors in MeituanLite / bench_env (38 errors are all in untracked `apps/Cainiao/`, a separate app outside this task) |
| `python -m bench_env.run --list` | ✅ 15 tasks, 15 parameterized |
| Offline judge positives (15) | ✅ all 15 pass (`success is True`) |
| Offline judge negatives (7) | ✅ all 7 fail as expected (`success is False`) — wrong qty, wrong remark, no-order-submit, ordered-expensive-instead-of-cheaper, over-budget-but-ordered, wrong count, no-search-performed |
| Total pytest | ✅ 82 passed |

> **Note on tsc:** running `npx tsc --noEmit` in this WSL environment crashes with a V8 OOM (SIGABRT, exit 134) unless given `--max-old-space-size=4096`. With the heap raised, tsc completes cleanly and reports **zero** errors in any file touched by this task. All 38 reported errors live under `apps/Cainiao/` (a different, untracked app from separate daily-10-apps work).

## 5. Boundary compliance

- ❌ No `git commit` executed.
- ✅ No edits to `os/`, `docs/`, `.claude/`, `package.json`, `package-lock.json`, benchmark core framework, other apps, or other suites.
- ✅ MeituanLite directory not renamed; app not redesigned/rewritten (only Fix A state-trajectory + display-name).
- ✅ Judge not weakened; no hard tasks deleted — all 15 verified with positive + negative cases.
- ✅ Tracked changes are confined to: `apps/MeituanLite/{manifest.ts, pages/SearchPage.tsx, state.ts}` and `bench_env/task/meituan_lite/{app.py, tasks.py}`. New file: `bench_env/tests/meituan_lite/test_tasks.py`.

## 6. Files touched

- `apps/MeituanLite/manifest.ts` — `displayName: '美团Lite'` → `'美团'` (id/dir/`displayNameEn` unchanged).
- `apps/MeituanLite/state.ts` — added volatile `_temp.searchCurrent` slot + `submitSearch`/`clearSearch` actions (Fix A).
- `apps/MeituanLite/pages/SearchPage.tsx` — wired `useEffect` to record search query + result shop ids into `_temp.searchCurrent`.
- `bench_env/task/meituan_lite/app.py` — full rewrite: `MeituanLite` accessor, fee/discount math, exact cart/order/balance checks, answer-sheet matcher, 14 parameter samplers.
- `bench_env/task/meituan_lite/tasks.py` — full rewrite: 15 task classes.
- `bench_env/tests/meituan_lite/test_tasks.py` — new: 58 structural + 15 positive + 7 negative offline judge tests.
