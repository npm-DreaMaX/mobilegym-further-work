"""
MeituanLite (美团) task definitions.

15 tasks covering operate / query / hybrid:
  - operate (9): AddDishToCart, ModifyCartQuantity, RemoveCartItem,
    AddMultiDishToCart, SubmitOrderWithRemark, PlaceAndPayWithMethod,
    OrderUnderBudget, MaxDiscountTierOrder, MultiStepPlaceAndPayOrder,
    ConditionalBudgetOrder
  - query  (4): SearchShopMinOrder, SearchShopDeliveryInfo, SearchDishFindShop,
    CountShopsByCondition
  - hybrid (1): CompareAndOrderCheaper

All judging is deterministic code (no VLM): state-diff for operate tasks,
AnswerSheet grounded matching for query tasks (Path B: search-gate + per-slot
answer match), and composite before/after order checks. Price/amount/balance
are recomputed from the static catalog (apps/MeituanLite/data/defaults.json)
mirroring apps/MeituanLite/state.ts — never hard-coded.
"""
# -- Task Index (auto-generated, do not edit) --
# 15 tasks | L1×1 L2×4 L3×6 L4×4
#
# [L1] SearchShopMinOrder       打开美团，搜索"{shopName}"，在答题卡填写该商家的起送价（元）。
# [L2] AddDishToCart            打开美团，进入"{shopName}"，把"{productName}"加入购物车，数量为{quantity}，不要下单。
# [L2] ModifyCartQuantity       打开美团，进入"{shopName}"，把购物车里"{productName}"的数量改成{targetQty}，不要下单。
# [L2] RemoveCartItem           打开美团，进入"{shopName}"，把"{productName}"从购物车里删除，不要下单。
# [L2] SearchShopDeliveryInfo   打开美团，搜索"{shopName}"，在答题卡分别填写它的配送费（元）和预计配送时间（分钟）。
# [L3] AddMultiDishToCart       打开美团，进入"{shopName}"，把"{productName1}"加{quantity1}份、"{productName2}"加{quantity2}份到购物车，不要下单。
# [L3] SubmitOrderWithRemark    打开美团，进入"{shopName}"，把"{productName}"加{quantity}份，去结算，备注"{remark}"、选{utensils}份餐具，提交订单（先不支付）。
# [L3] PlaceAndPayWithMethod    打开美团，进入"{shopName}"，把"{productName}"加{quantity}份，去结算并提交订单，用{paymentMethodZh}支付。
# [L3] SearchDishFindShop       打开美团，搜索菜品"{dishName}"，在答题卡填写出售该菜品的商家名称。
# [L3] OrderUnderBudget         打开美团，进入"{shopName}"，点{quantity}份"{productName}"并提交订单，要求实付金额不超过{budget}元。
# [L3] CountShopsByCondition    打开美团，搜索"{keyword}"，在答题卡填写评分不低于{ratingThreshold}且配送费不超过{feeThreshold}元的商家数量。
# [L4] CompareAndOrderCheaper   打开美团。方案A：在"{shopNameA}"点{quantityA}份"{productNameA}"；方案B：在"{shopNameB}"点{quantityB}份"{productNameB}"。比较两者实付金额，选更便宜的下单，并在答题卡填写该方案的实付金额。
# [L4] MaxDiscountTierOrder     打开美团，进入"{shopName}"，点{quantity}份"{productName}"（正好达到满减档），去结算并提交订单（先不支付）。
# [L4] MultiStepPlaceAndPayOrder 打开美团，进入"{shopName}"，把"{productName}"加{quantity}份，去结算，备注"{remark}"、选{utensils}份餐具，提交订单并用{paymentMethodZh}支付。
# [L4] ConditionalBudgetOrder   打开美团，进入"{shopName}"，{productName}每份现价见店。若{quantity}份实付不超过{budget}元则下单，否则不下单。
# -- End Task Index --

from __future__ import annotations

from typing import Any

from bench_env.task.base import BaseTask
from bench_env.task.judge import JudgeInput
from bench_env.task.meituan_lite.app import (
    MeituanLite,
    MEITUAN_ADD_TO_CART_CHANGES,
    MEITUAN_ORDER_CHANGES,
    MEITUAN_PAY_CHANGES,
    MEITUAN_QUERY_CHANGES,
)

def _mt(input: JudgeInput) -> MeituanLite:
    return MeituanLite(
        input.apps.get("meituan-lite") or {},
        init=input.apps_init.get("meituan-lite") or {},
    )


# ────────────────────────────── L1 ──────────────────────────────


class SearchShopMinOrder(BaseTask):
    """搜索指定商家并在答题卡填写其起送价（query, L1）。"""

    templates = [
        '打开美团，搜索"{shopName}"，在答题卡填写该商家的起送价（元）。',
        '在美团里搜索商家"{shopName}"，把它的起送价（元）填进答题卡。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L1"
    capabilities = ["nav", "search", "extract"]
    answer_fields = [{"type": "number", "label": "起送价", "hint": "单位：元"}]

    parameters = {
        "shopId": {"type": "string", "default": "shop-1"},
        "shopName": {"type": "string", "default": "老王家常炒饭"},
        "_target": {
            "sampler": MeituanLite.sample_shop,
            "fields": {"shopId": "shopId", "shopName": "shopName"},
        },
    }
    expected_changes = MEITUAN_QUERY_CHANGES

    def get_answer(self, input: JudgeInput) -> Any:
        return MeituanLite.shop_min_order(str(self.p.shopId))

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        mt = _mt(input)
        checks = [mt.check_searched(found_shop_id=str(self.p.shopId))]
        checks += mt.check_answer_sheet(self.get_answer(input), input, field_labels=["起送价"])
        return checks


# ────────────────────────────── L2 ──────────────────────────────


class AddDishToCart(BaseTask):
    """在指定商家加入指定商品达到指定数量，且不下单（operate, L2）。"""

    templates = [
        '打开美团，进入"{shopName}"，把"{productName}"加入购物车，数量为{quantity}，不要下单。',
        '在美团的"{shopName}"里加{quantity}份"{productName}"到购物车（先不下单）。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 30
    capabilities = ["nav", "operate"]
    parameters = {
        "shopId": {"type": "string", "default": "shop-1"},
        "shopName": {"type": "string", "default": "老王家常炒饭"},
        "productId": {"type": "string", "default": "p1-1"},
        "productName": {"type": "string", "default": "招牌蛋炒饭"},
        "quantity": {"type": "int", "default": 2},
        "_target": {
            "sampler": MeituanLite.sample_target,
            "fields": {
                "shopId": "shopId", "shopName": "shopName",
                "productId": "productId", "productName": "productName",
                "quantity": "quantity",
            },
        },
    }
    expected_changes = MEITUAN_ADD_TO_CART_CHANGES

    async def _prepare(self, env) -> None:
        await env.set_state(
            {"apps": {"meituan-lite": MeituanLite.prepare_state_empty_cart()}},
            deep=True,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        mt = _mt(input)
        items = [{"productId": str(self.p.productId), "qty": int(self.p.quantity)}]
        return [
            mt.check_cart_exact(items, str(self.p.shopId)),
            mt.check_old_orders_unchanged(),
        ]


class ModifyCartQuantity(BaseTask):
    """预设购物车，把指定商品数量改成目标值（operate, L2）。"""

    templates = [
        '打开美团，进入"{shopName}"，把购物车里"{productName}"的数量改成{targetQty}，不要下单。',
        '在美团的"{shopName}"里，将购物车中"{productName}"调整为{targetQty}份（先不下单）。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 30
    capabilities = ["nav", "operate"]
    parameters = {
        "shopId": {"type": "string", "default": "shop-1"},
        "shopName": {"type": "string", "default": "老王家常炒饭"},
        "productId": {"type": "string", "default": "p1-1"},
        "productName": {"type": "string", "default": "招牌蛋炒饭"},
        "initialQty": {"type": "int", "default": 2},
        "targetQty": {"type": "int", "default": 3},
        "_target": {
            "sampler": MeituanLite.sample_cart_modify,
            "fields": {
                "shopId": "shopId", "shopName": "shopName",
                "productId": "productId", "productName": "productName",
                "initialQty": "initialQty", "targetQty": "targetQty",
            },
        },
    }
    expected_changes = MEITUAN_ADD_TO_CART_CHANGES

    async def _post_sample(self, env) -> None:
        cart = [{"productId": str(self.p.productId), "qty": int(self.p.initialQty)}]
        await env.set_state(
            {"apps": {"meituan-lite": MeituanLite.prepare_state_cart(str(self.p.shopId), cart)}},
            deep=True,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        mt = _mt(input)
        items = [{"productId": str(self.p.productId), "qty": int(self.p.targetQty)}]
        return [
            mt.check_cart_exact(items, str(self.p.shopId)),
            mt.check_old_orders_unchanged(),
        ]


class RemoveCartItem(BaseTask):
    """预设多商品购物车，删除指定商品且其余不变（operate, L2）。"""

    templates = [
        '打开美团，进入"{shopName}"，把"{productName}"从购物车里删除，不要下单。',
        '在美团的"{shopName}"里，将购物车中的"{productName}"移除（先不下单）。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 30
    capabilities = ["nav", "operate", "delete"]
    parameters = {
        "shopId": {"type": "string", "default": "shop-1"},
        "shopName": {"type": "string", "default": "老王家常炒饭"},
        "productId": {"type": "string", "default": "p1-1"},
        "productName": {"type": "string", "default": "招牌蛋炒饭"},
        "keepItems": {"type": "string", "default": "[]"},
        "_target": {
            "sampler": MeituanLite.sample_cart_remove,
            "fields": {
                "shopId": "shopId", "shopName": "shopName",
                "removeProductId": "productId", "removeProductName": "productName",
                "keepItems": "keepItems",
            },
        },
    }
    expected_changes = MEITUAN_ADD_TO_CART_CHANGES

    async def _post_sample(self, env) -> None:
        keep = self.p.keepItems
        if isinstance(keep, str):
            import json as _json
            keep = _json.loads(keep)
        cart = [{"productId": str(self.p.productId), "qty": 1}] + [
            {"productId": str(k["productId"]), "qty": int(k["qty"])} for k in keep
        ]
        await env.set_state(
            {"apps": {"meituan-lite": MeituanLite.prepare_state_cart(str(self.p.shopId), cart)}},
            deep=True,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        mt = _mt(input)
        keep = self.p.keepItems
        if isinstance(keep, str):
            import json as _json
            keep = _json.loads(keep)
        expected = [{"productId": str(k["productId"]), "qty": int(k["qty"])} for k in keep]
        return [
            mt.check_cart_exact(expected, str(self.p.shopId)),
            mt.check_old_orders_unchanged(),
        ]


class SearchShopDeliveryInfo(BaseTask):
    """搜索指定商家，填写配送费和预计配送时间（query, L2, 多字段）。"""

    templates = [
        '打开美团，搜索"{shopName}"，在答题卡分别填写它的配送费（元）和预计配送时间（分钟）。',
        '在美团搜索"{shopName}"，把它的配送费（元）与预计送达时间（分钟）填进答题卡。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["nav", "search", "extract"]
    answer_fields = [
        {"type": "number", "label": "配送费", "hint": "单位：元"},
        {"type": "number", "label": "预计配送时间", "hint": "单位：分钟"},
    ]

    parameters = {
        "shopId": {"type": "string", "default": "shop-1"},
        "shopName": {"type": "string", "default": "老王家常炒饭"},
        "_target": {
            "sampler": MeituanLite.sample_shop,
            "fields": {"shopId": "shopId", "shopName": "shopName"},
        },
    }
    expected_changes = MEITUAN_QUERY_CHANGES

    def get_answer(self, input: JudgeInput) -> Any:
        info = MeituanLite.shop_delivery_info(str(self.p.shopId))
        return {"配送费": info["deliveryFee"], "配送时间": info["deliveryTime"]}

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        mt = _mt(input)
        checks = [mt.check_searched(found_shop_id=str(self.p.shopId))]
        checks += mt.check_answer_sheet(
            self.get_answer(input), input, field_labels=["配送费", "预计配送时间"])
        return checks


# ────────────────────────────── L3 ──────────────────────────────


class AddMultiDishToCart(BaseTask):
    """同店两菜各指定数量加入购物车，且不下单（operate, L3, 多条件）。"""

    templates = [
        '打开美团，进入"{shopName}"，把"{productName1}"加{quantity1}份、"{productName2}"加{quantity2}份到购物车，不要下单。',
        '在美团的"{shopName}"里，将"{productName1}"×{quantity1}与"{productName2}"×{quantity2}加入购物车（先不下单）。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    max_steps = 45
    capabilities = ["nav", "operate"]
    parameters = {
        "shopId": {"type": "string", "default": "shop-1"},
        "shopName": {"type": "string", "default": "老王家常炒饭"},
        "productId1": {"type": "string", "default": "p1-1"},
        "productName1": {"type": "string", "default": "招牌蛋炒饭"},
        "quantity1": {"type": "int", "default": 2},
        "productId2": {"type": "string", "default": "p1-2"},
        "productName2": {"type": "string", "default": "扬州炒饭"},
        "quantity2": {"type": "int", "default": 3},
        "_target": {
            "sampler": MeituanLite.sample_two_products,
            "fields": {
                "shopId": "shopId", "shopName": "shopName",
                "productId1": "productId1", "productName1": "productName1", "quantity1": "quantity1",
                "productId2": "productId2", "productName2": "productName2", "quantity2": "quantity2",
            },
        },
    }
    expected_changes = MEITUAN_ADD_TO_CART_CHANGES

    async def _prepare(self, env) -> None:
        await env.set_state(
            {"apps": {"meituan-lite": MeituanLite.prepare_state_empty_cart()}},
            deep=True,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        mt = _mt(input)
        items = [
            {"productId": str(self.p.productId1), "qty": int(self.p.quantity1)},
            {"productId": str(self.p.productId2), "qty": int(self.p.quantity2)},
        ]
        return [
            mt.check_cart_exact(items, str(self.p.shopId)),
            mt.check_old_orders_unchanged(),
        ]


class SubmitOrderWithRemark(BaseTask):
    """选菜→结算→填备注+餐具→提交订单（不支付），重算金额（operate, L3, calc）。"""

    templates = [
        '打开美团，进入"{shopName}"，把"{productName}"加{quantity}份，去结算，备注"{remark}"、选{utensils}份餐具，提交订单（先不支付）。',
        '在美团的"{shopName}"里加{quantity}份"{productName}"，进入结算页，备注填"{remark}"、餐具选{utensils}份，提交订单但暂不支付。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    max_steps = 45
    capabilities = ["nav", "operate", "finance"]
    parameters = {
        "shopId": {"type": "string", "default": "shop-1"},
        "shopName": {"type": "string", "default": "老王家常炒饭"},
        "productId": {"type": "string", "default": "p1-1"},
        "productName": {"type": "string", "default": "招牌蛋炒饭"},
        "quantity": {"type": "int", "default": 2},
        "remark": {"type": "string", "default": "不要辣"},
        "utensils": {"type": "int", "default": 1},
        "_target": {
            "sampler": MeituanLite.sample_order_remark,
            "fields": {
                "shopId": "shopId", "shopName": "shopName",
                "productId": "productId", "productName": "productName",
                "quantity": "quantity", "remark": "remark", "utensils": "utensils",
            },
        },
    }
    expected_changes = MEITUAN_ORDER_CHANGES

    async def _prepare(self, env) -> None:
        await env.set_state(
            {"apps": {"meituan-lite": MeituanLite.prepare_state_empty_cart()}},
            deep=True,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        mt = _mt(input)
        items = [{"productId": str(self.p.productId), "qty": int(self.p.quantity)}]
        checks = mt.check_new_order({
            "shop_id": str(self.p.shopId), "items": items,
            "remark": str(self.p.remark), "utensils": int(self.p.utensils),
            "status": "待支付", "check_amount": True,
        })
        checks.append(mt.check_cart_cleared())
        checks.append(mt.check_old_orders_unchanged())
        return checks


class PlaceAndPayWithMethod(BaseTask):
    """选菜→结算→提交→用指定（非默认）方式支付，重算余额（operate, L3, calc）。"""

    templates = [
        '打开美团，进入"{shopName}"，把"{productName}"加{quantity}份，去结算并提交订单，用{paymentMethodZh}支付。',
        '在美团的"{shopName}"里加{quantity}份"{productName}"，结算下单后用{paymentMethodZh}完成支付。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    max_steps = 45
    capabilities = ["nav", "operate", "finance"]
    parameters = {
        "shopId": {"type": "string", "default": "shop-1"},
        "shopName": {"type": "string", "default": "老王家常炒饭"},
        "productId": {"type": "string", "default": "p1-1"},
        "productName": {"type": "string", "default": "招牌蛋炒饭"},
        "quantity": {"type": "int", "default": 2},
        "paymentMethod": {"type": "string", "default": "wechat"},
        "paymentMethodZh": {"type": "string", "default": "微信支付"},
        "_target": {
            "sampler": MeituanLite.sample_pay_method,
            "fields": {
                "shopId": "shopId", "shopName": "shopName",
                "productId": "productId", "productName": "productName",
                "quantity": "quantity",
                "paymentMethod": "paymentMethod", "paymentMethodZh": "paymentMethodZh",
            },
        },
    }
    expected_changes = MEITUAN_PAY_CHANGES

    async def _prepare(self, env) -> None:
        await env.set_state(
            {"apps": {"meituan-lite": MeituanLite.prepare_state_empty_cart()}},
            deep=True,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        mt = _mt(input)
        items = [{"productId": str(self.p.productId), "qty": int(self.p.quantity)}]
        method = str(self.p.paymentMethod)
        checks = mt.check_new_order({
            "shop_id": str(self.p.shopId), "items": items,
            "payment_method": method, "status": "商家已接单",
            "check_amount": True, "check_balance": True,
        })
        checks.append(mt.check_cart_cleared())
        checks.append(mt.check_old_orders_unchanged())
        return checks


class SearchDishFindShop(BaseTask):
    """搜索唯一菜品名，填写出售它的商家（query, L3）。"""

    templates = [
        '打开美团，搜索菜品"{dishName}"，在答题卡填写出售该菜品的商家名称。',
        '在美团里搜索"{dishName}"，把卖这道菜的商家名称填进答题卡。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L3"
    max_steps = 45
    capabilities = ["nav", "search", "extract"]
    answer_fields = [{"type": "text", "label": "商家名称"}]

    parameters = {
        "dishName": {"type": "string", "default": "招牌珍珠奶茶"},
        "shopId": {"type": "string", "default": "shop-2"},
        "shopName": {"type": "string", "default": "甜甜奶茶屋"},
        "_target": {
            "sampler": MeituanLite.sample_unique_dish,
            "fields": {"dishName": "dishName", "shopId": "shopId", "shopName": "shopName"},
        },
    }
    expected_changes = MEITUAN_QUERY_CHANGES

    def get_answer(self, input: JudgeInput) -> Any:
        return str(self.p.shopName)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        mt = _mt(input)
        checks = [mt.check_searched(found_shop_id=str(self.p.shopId))]
        checks += mt.check_answer_sheet(self.get_answer(input), input, field_labels=["商家名称"])
        return checks


class OrderUnderBudget(BaseTask):
    """点指定数量并下单，实付不超过预算，重算金额（operate, L3, calc）。"""

    templates = [
        '打开美团，进入"{shopName}"，点{quantity}份"{productName}"并提交订单，要求实付金额不超过{budget}元。',
        '在美团的"{shopName}"里下单{quantity}份"{productName}"，实付需≤{budget}元。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    max_steps = 45
    capabilities = ["nav", "operate", "finance", "reasoning"]
    parameters = {
        "shopId": {"type": "string", "default": "shop-1"},
        "shopName": {"type": "string", "default": "老王家常炒饭"},
        "productId": {"type": "string", "default": "p1-1"},
        "productName": {"type": "string", "default": "招牌蛋炒饭"},
        "quantity": {"type": "int", "default": 2},
        "budget": {"type": "int", "default": 40},
        "totalPayable": {"type": "float", "default": 38.0},
        "_target": {
            "sampler": MeituanLite.sample_budget_order,
            "fields": {
                "shopId": "shopId", "shopName": "shopName",
                "productId": "productId", "productName": "productName",
                "quantity": "quantity", "budget": "budget", "totalPayable": "totalPayable",
            },
        },
    }
    expected_changes = MEITUAN_ORDER_CHANGES

    async def _prepare(self, env) -> None:
        await env.set_state(
            {"apps": {"meituan-lite": MeituanLite.prepare_state_empty_cart()}},
            deep=True,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        mt = _mt(input)
        items = [{"productId": str(self.p.productId), "qty": int(self.p.quantity)}]
        checks = mt.check_new_order({
            "shop_id": str(self.p.shopId), "items": items,
            "status": "待支付", "check_amount": True,
        })
        new = mt.new_orders
        order = new[0] if len(new) == 1 else None
        budget = float(self.p.budget)
        checks.append({
            "field": "new_order.within_budget",
            "expected": f"totalPayable <= {budget}",
            "actual": order.get("totalPayable") if order else None,
            "passed": bool(order and float(order.get("totalPayable", 0)) <= budget + 1e-6),
        })
        checks.append(mt.check_cart_cleared())
        checks.append(mt.check_old_orders_unchanged())
        return checks


class CountShopsByCondition(BaseTask):
    """搜索"满减"，数满足评分≥r且配送费≤f的商家数（query, L3, 多条件, calc）。"""

    templates = [
        '打开美团，搜索"{keyword}"，在答题卡填写评分不低于{ratingThreshold}且配送费不超过{feeThreshold}元的商家数量。',
        '在美团搜索"{keyword}"，统计其中评分≥{ratingThreshold}、配送费≤{feeThreshold}元的商家个数并填入答题卡。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L3"
    max_steps = 45
    capabilities = ["nav", "search", "extract", "reasoning"]
    answer_fields = [{"type": "number", "label": "商家数量"}]

    parameters = {
        "keyword": {"type": "string", "default": "满减"},
        "ratingThreshold": {"type": "float", "default": 4.6},
        "feeThreshold": {"type": "float", "default": 3},
        "expectedCount": {"type": "int", "default": 4},
        "_target": {
            "sampler": MeituanLite.sample_count_condition,
            "fields": {
                "keyword": "keyword", "ratingThreshold": "ratingThreshold",
                "feeThreshold": "feeThreshold", "expectedCount": "expectedCount",
            },
        },
    }
    expected_changes = MEITUAN_QUERY_CHANGES

    def get_answer(self, input: JudgeInput) -> Any:
        return int(self.p.expectedCount)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        mt = _mt(input)
        checks = [mt.check_searched(exact_q=str(self.p.keyword))]
        checks += mt.check_answer_sheet(self.get_answer(input), input, field_labels=["商家数量"])
        return checks


# ────────────────────────────── L4 ──────────────────────────────


class CompareAndOrderCheaper(BaseTask):
    """比较两方案实付，下单更便宜者并填金额（hybrid, L4, calc）。"""

    templates = [
        '打开美团。方案A：在"{shopNameA}"点{quantityA}份"{productNameA}"；方案B：在"{shopNameB}"点{quantityB}份"{productNameB}"。比较两者实付金额，选更便宜的下单，并在答题卡填写该方案的实付金额。',
        '在美团里：A方案="{shopNameA}"的"{productNameA}"×{quantityA}，B方案="{shopNameB}"的"{productNameB}"×{quantityB}。下单更省的那个，并把它的实付金额填进答题卡。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "hybrid"
    composition = "sequential"
    difficulty = "L4"
    max_steps = 60
    capabilities = ["nav", "operate", "finance", "reasoning"]
    answer_fields = [{"type": "number", "label": "更便宜方案的实付金额", "hint": "单位：元"}]

    parameters = {
        "shopA": {"type": "string", "default": "shop-1"},
        "shopNameA": {"type": "string", "default": "老王家常炒饭"},
        "productIdA": {"type": "string", "default": "p1-1"},
        "productNameA": {"type": "string", "default": "招牌蛋炒饭"},
        "quantityA": {"type": "int", "default": 2},
        "shopB": {"type": "string", "default": "shop-2"},
        "shopNameB": {"type": "string", "default": "甜甜奶茶屋"},
        "productIdB": {"type": "string", "default": "p2-1"},
        "productNameB": {"type": "string", "default": "招牌珍珠奶茶"},
        "quantityB": {"type": "int", "default": 3},
        "cheaperShopId": {"type": "string", "default": "shop-2"},
        "cheaperShopName": {"type": "string", "default": "甜甜奶茶屋"},
        "cheaperProductId": {"type": "string", "default": "p2-1"},
        "cheaperProductName": {"type": "string", "default": "招牌珍珠奶茶"},
        "cheaperQuantity": {"type": "int", "default": 3},
        "cheaperTotal": {"type": "float", "default": 36.0},
        "_target": {
            "sampler": MeituanLite.sample_compare_configs,
            "fields": {
                "shopA": "shopA", "shopNameA": "shopNameA",
                "productIdA": "productIdA", "productNameA": "productNameA", "quantityA": "quantityA",
                "shopB": "shopB", "shopNameB": "shopNameB",
                "productIdB": "productIdB", "productNameB": "productNameB", "quantityB": "quantityB",
                "cheaperShopId": "cheaperShopId", "cheaperShopName": "cheaperShopName",
                "cheaperProductId": "cheaperProductId", "cheaperProductName": "cheaperProductName",
                "cheaperQuantity": "cheaperQuantity", "cheaperTotal": "cheaperTotal",
            },
        },
    }
    expected_changes = MEITUAN_ORDER_CHANGES

    async def _prepare(self, env) -> None:
        await env.set_state(
            {"apps": {"meituan-lite": MeituanLite.prepare_state_empty_cart()}},
            deep=True,
        )

    def get_answer(self, input: JudgeInput) -> Any:
        return float(self.p.cheaperTotal)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        mt = _mt(input)
        items = [{"productId": str(self.p.cheaperProductId), "qty": int(self.p.cheaperQuantity)}]
        checks = mt.check_new_order({
            "shop_id": str(self.p.cheaperShopId), "items": items,
            "status": "待支付", "check_amount": True,
        })
        checks.append(mt.check_cart_cleared())
        checks.append(mt.check_old_orders_unchanged())
        checks += mt.check_answer_sheet(self.get_answer(input), input, field_labels=["更便宜方案的实付金额"])
        return checks


class MaxDiscountTierOrder(BaseTask):
    """选数量正好跨满减档，下单，重算优惠与金额（operate, L4, calc）。"""

    templates = [
        '打开美团，进入"{shopName}"，点{quantity}份"{productName}"（正好达到满减档），去结算并提交订单（先不支付）。',
        '在美团的"{shopName}"里下单{quantity}份"{productName}"，使订单刚好享受满减优惠（提交订单但暂不支付）。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L4"
    max_steps = 60
    capabilities = ["nav", "operate", "finance", "reasoning"]
    parameters = {
        "shopId": {"type": "string", "default": "shop-1"},
        "shopName": {"type": "string", "default": "老王家常炒饭"},
        "productId": {"type": "string", "default": "p1-1"},
        "productName": {"type": "string", "default": "招牌蛋炒饭"},
        "quantity": {"type": "int", "default": 4},
        "expectedDiscount": {"type": "float", "default": 15.0},
        "expectedTotal": {"type": "float", "default": 53.0},
        "_target": {
            "sampler": MeituanLite.sample_discount_tier,
            "fields": {
                "shopId": "shopId", "shopName": "shopName",
                "productId": "productId", "productName": "productName",
                "quantity": "quantity", "expectedDiscount": "expectedDiscount",
                "expectedTotal": "expectedTotal",
            },
        },
    }
    expected_changes = MEITUAN_ORDER_CHANGES

    async def _prepare(self, env) -> None:
        await env.set_state(
            {"apps": {"meituan-lite": MeituanLite.prepare_state_empty_cart()}},
            deep=True,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        import math
        mt = _mt(input)
        items = [{"productId": str(self.p.productId), "qty": int(self.p.quantity)}]
        checks = mt.check_new_order({
            "shop_id": str(self.p.shopId), "items": items,
            "status": "待支付", "check_amount": True,
        })
        new = mt.new_orders
        order = new[0] if len(new) == 1 else None
        exp_disc = float(self.p.expectedDiscount)
        checks.append({
            "field": "new_order.discount",
            "expected": exp_disc,
            "actual": order.get("discount") if order else None,
            "passed": bool(order and math.isclose(float(order.get("discount", 0)), exp_disc, abs_tol=0.005)),
        })
        checks.append(mt.check_cart_cleared())
        checks.append(mt.check_old_orders_unchanged())
        return checks


class MultiStepPlaceAndPayOrder(BaseTask):
    """完整流程：选菜→结算→备注+餐具→支付，重算余额（operate, L4, calc）。"""

    templates = [
        '打开美团，进入"{shopName}"，把"{productName}"加{quantity}份，去结算，备注"{remark}"、选{utensils}份餐具，提交订单并用{paymentMethodZh}支付。',
        '在美团的"{shopName}"里加{quantity}份"{productName}"，结算时备注"{remark}"、餐具{utensils}份，下单后用{paymentMethodZh}付款。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L4"
    max_steps = 60
    capabilities = ["nav", "operate", "finance"]
    parameters = {
        "shopId": {"type": "string", "default": "shop-1"},
        "shopName": {"type": "string", "default": "老王家常炒饭"},
        "productId": {"type": "string", "default": "p1-1"},
        "productName": {"type": "string", "default": "招牌蛋炒饭"},
        "quantity": {"type": "int", "default": 2},
        "remark": {"type": "string", "default": "不要辣"},
        "utensils": {"type": "int", "default": 1},
        "paymentMethod": {"type": "string", "default": "balance"},
        "paymentMethodZh": {"type": "string", "default": "余额支付"},
        "_target": {
            "sampler": MeituanLite.sample_full_order,
            "fields": {
                "shopId": "shopId", "shopName": "shopName",
                "productId": "productId", "productName": "productName",
                "quantity": "quantity", "remark": "remark", "utensils": "utensils",
                "paymentMethod": "paymentMethod", "paymentMethodZh": "paymentMethodZh",
            },
        },
    }
    expected_changes = MEITUAN_PAY_CHANGES

    async def _prepare(self, env) -> None:
        await env.set_state(
            {"apps": {"meituan-lite": MeituanLite.prepare_state_empty_cart()}},
            deep=True,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        mt = _mt(input)
        items = [{"productId": str(self.p.productId), "qty": int(self.p.quantity)}]
        method = str(self.p.paymentMethod)
        checks = mt.check_new_order({
            "shop_id": str(self.p.shopId), "items": items,
            "remark": str(self.p.remark), "utensils": int(self.p.utensils),
            "payment_method": method, "status": "商家已接单",
            "check_amount": True, "check_balance": True,
        })
        checks.append(mt.check_cart_cleared())
        checks.append(mt.check_old_orders_unchanged())
        return checks


class ConditionalBudgetOrder(BaseTask):
    """按预算条件决定是否下单（operate, L4, 条件分支, calc）。"""

    templates = [
        '打开美团，进入"{shopName}"，{productName}每份现价见店。若{quantity}份实付不超过{budget}元则下单，否则不下单。',
        '在美团的"{shopName}"里查看"{productName}"价格：若{quantity}份的实付≤{budget}元就提交订单，否则不要下单。',
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "operate"
    composition = "deep_dive"
    difficulty = "L4"
    max_steps = 60
    capabilities = ["nav", "operate", "finance", "reasoning"]
    parameters = {
        "shopId": {"type": "string", "default": "shop-1"},
        "shopName": {"type": "string", "default": "老王家常炒饭"},
        "productId": {"type": "string", "default": "p1-1"},
        "productName": {"type": "string", "default": "招牌蛋炒饭"},
        "quantity": {"type": "int", "default": 2},
        "budget": {"type": "int", "default": 40},
        "totalPayable": {"type": "float", "default": 38.0},
        "_target": {
            "sampler": MeituanLite.sample_conditional_budget,
            "fields": {
                "shopId": "shopId", "shopName": "shopName",
                "productId": "productId", "productName": "productName",
                "quantity": "quantity", "budget": "budget", "totalPayable": "totalPayable",
            },
        },
    }
    expected_changes = MEITUAN_ORDER_CHANGES

    async def _prepare(self, env) -> None:
        await env.set_state(
            {"apps": {"meituan-lite": MeituanLite.prepare_state_empty_cart()}},
            deep=True,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        import math
        mt = _mt(input)
        items = [{"productId": str(self.p.productId), "qty": int(self.p.quantity)}]
        budget = float(self.p.budget)
        total = float(self.p.totalPayable)
        should_order = total <= budget + 1e-6
        new = mt.new_orders
        if should_order:
            order = new[0] if len(new) == 1 else None
            checks = mt.check_new_order({
                "shop_id": str(self.p.shopId), "items": items,
                "status": "待支付", "check_amount": True,
            })
            checks.append({
                "field": "new_order.within_budget",
                "expected": f"totalPayable <= {budget}",
                "actual": order.get("totalPayable") if order else None,
                "passed": bool(order and float(order.get("totalPayable", 0)) <= budget + 1e-6),
            })
            checks.append(mt.check_cart_cleared())
            checks.append(mt.check_old_orders_unchanged())
        else:
            checks = [{
                "field": "orders.new_count",
                "expected": 0,
                "actual": len(new),
                "passed": len(new) == 0,
            }, {
                "field": "decision.no_order_over_budget",
                "expected": f"total {total} > budget {budget} → no order",
                "actual": f"{len(new)} new order(s)",
                "passed": len(new) == 0,
            }]
        return checks
