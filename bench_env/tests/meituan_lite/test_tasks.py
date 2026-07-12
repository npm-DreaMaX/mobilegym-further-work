"""
MeituanLite task correctness tests (offline judge, no simulator).

Covers: structural sanity for all 15 tasks, one positive judge per task,
and 7 negative scenarios for high-difficulty tasks (wrong qty / wrong remark /
no order / ordered-expensive / over-budget-ordered / wrong count / no-search).
"""

from __future__ import annotations

import copy
import inspect
from pathlib import Path
from typing import Any

import pytest

from bench_env.task.meituan_lite import tasks as _tasks_module
from bench_env.task.meituan_lite.app import (
    MeituanLite, compute_fees, SHOP_BY_ID, MEITUAN_ADDRESSES,
)
from bench_env.task.base import BaseTask
from bench_env.tests.conftest import make_judge_input

ALL_TASK_CLASSES: list[type[BaseTask]] = [
    obj for _, obj in inspect.getmembers(_tasks_module, inspect.isclass)
    if issubclass(obj, BaseTask) and obj is not BaseTask
    and obj.__module__ == _tasks_module.__name__
]
ALL_TASK_IDS = [cls.__name__ for cls in ALL_TASK_CLASSES]

TEST_OS_STATE = {"time": {"timestamp": 1752576000000}}
DEFAULT_ROUTE = {"app": "meituan-lite", "path": "/"}

_ADDR0 = MEITUAN_ADDRESSES[0]


def _base_state() -> dict[str, Any]:
    """Runtime store shape (mirrors initialState in apps/MeituanLite/state.ts)."""
    return {
        "addressId": "addr-1",
        "cart": [],
        "cartShopId": None,
        "orders": [],
        "paymentMethod": "balance",
        "userProfile": {"name": "小明", "phone": "138****8888", "balance": 128.5},
        "settings": {"utensils": 0, "defaultRemark": ""},
        "_temp": {"searchCurrent": None},
    }


def _sheet(answers: dict[str, Any], *, fields: list[dict] | None = None,
           submitted: bool = True) -> dict[str, Any]:
    return {"fields": fields or [{"type": "text", "label": "ans"}],
            "answers": answers, "submitted": submitted}


def _search(q: str, result_ids: list[str]) -> dict[str, Any]:
    return {"q": q, "resultShopIds": result_ids, "searched": True}


def _build_order(shop_id: str, lines: list[dict[str, Any]], *,
                 remark: str = "", utensils: int = 0,
                 method: str = "balance", status: str = "待支付") -> dict[str, Any]:
    shop = SHOP_BY_ID[shop_id]
    fees = compute_fees(shop, lines)
    items = []
    for ln in lines:
        p = MeituanLite.product_by_id(ln["productId"])
        items.append({"productId": ln["productId"], "name": p["name"],
                      "price": p["price"], "qty": ln["qty"], "packingFee": p["packingFee"]})
    return {
        "id": "MT-TEST-1", "shopId": shop_id, "shopName": shop["name"],
        "shopEmoji": shop["emoji"], "items": items,
        "subtotal": fees["subtotal"], "deliveryFee": fees["deliveryFee"],
        "packingFee": fees["packingFee"], "discount": fees["discount"],
        "totalPayable": fees["totalPayable"],
        "addressId": _ADDR0["id"], "addressDetail": _ADDR0["detail"],
        "contact": _ADDR0["contact"], "phone": _ADDR0["phone"],
        "paymentMethod": method, "remark": remark, "utensils": utensils,
        "createdAt": 1700000000, "status": status,
        "etaText": f'{shop["deliveryTime"]}分钟内送达',
    }


def _input(init_mt: dict[str, Any], curr_mt: dict[str, Any], *,
           init_sheet: dict[str, Any] | None = None,
           curr_sheet: dict[str, Any] | None = None) -> Any:
    init_apps: dict[str, Any] = {"meituan-lite": init_mt}
    curr_apps: dict[str, Any] = {"meituan-lite": curr_mt}
    if init_sheet is not None:
        init_apps["answer_sheet"] = init_sheet
    if curr_sheet is not None:
        curr_apps["answer_sheet"] = curr_sheet
    return make_judge_input(
        {"apps": init_apps, "os": TEST_OS_STATE},
        {"apps": curr_apps, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )


def _eval(task: BaseTask, init_mt: dict[str, Any], curr_mt: dict[str, Any], **kw) -> Any:
    return task.evaluate(_input(init_mt, curr_mt, **kw))


# =============================================================================
# Structural tests (all 15)
# =============================================================================


class TestTaskDefinitions:
    @pytest.mark.parametrize("cls", ALL_TASK_CLASSES, ids=ALL_TASK_IDS)
    def test_instantiation(self, cls):
        task = cls()
        assert task.name == cls.__name__
        assert task.templates
        assert "meituan-lite" in task.apps

    @pytest.mark.parametrize("cls", ALL_TASK_CLASSES, ids=ALL_TASK_IDS)
    def test_description_renders(self, cls):
        task = cls()
        task._env_state = {"os": TEST_OS_STATE}
        desc = task.description
        assert desc
        assert "{" not in desc, f"unfilled placeholder in {cls.__name__}: {desc}"

    @pytest.mark.parametrize("cls", ALL_TASK_CLASSES, ids=ALL_TASK_IDS)
    def test_required_attrs(self, cls):
        assert cls.scope in ("S1", "S2", "S3")
        assert cls.objective in ("operate", "query", "hybrid")
        assert cls.composition in ("atomic", "sequential", "transfer", "deep_dive")
        assert cls.difficulty in ("L1", "L2", "L3", "L4")

    @pytest.mark.parametrize("cls", ALL_TASK_CLASSES, ids=ALL_TASK_IDS)
    def test_parameter_defaults_present(self, cls):
        for key, schema in cls.parameters.items():
            if key.startswith("_"):
                continue
            assert "default" in schema, f"{cls.__name__}.{key} missing default"


# =============================================================================
# Positive judge tests (one per task)
# =============================================================================


class TestPositiveJudges:
    def test_search_shop_min_order(self):
        t = _tasks_module.SearchShopMinOrder()
        t.params["shopId"] = "shop-2"; t.params["shopName"] = "甜甜奶茶屋"
        init = _base_state(); curr = _base_state()
        curr["_temp"]["searchCurrent"] = _search("甜甜奶茶屋", ["shop-2"])
        r = _eval(t, init, curr,
                  init_sheet=_sheet({}, submitted=False),
                  curr_sheet=_sheet({"0": "15"}, fields=[{"type": "number", "label": "起送价"}]))
        assert r.success, r.issues

    def test_add_dish_to_cart(self):
        t = _tasks_module.AddDishToCart()
        t.params["shopId"] = "shop-1"; t.params["productId"] = "p1-2"; t.params["quantity"] = 3
        init = _base_state(); curr = _base_state()
        curr["cart"] = [{"productId": "p1-2", "qty": 3}]; curr["cartShopId"] = "shop-1"
        r = _eval(t, init, curr)
        assert r.success, r.issues
        assert r.clean

    def test_modify_cart_quantity(self):
        t = _tasks_module.ModifyCartQuantity()
        t.params["shopId"] = "shop-1"; t.params["productId"] = "p1-2"
        t.params["initialQty"] = 2; t.params["targetQty"] = 4
        init = _base_state(); init["cart"] = [{"productId": "p1-2", "qty": 2}]; init["cartShopId"] = "shop-1"
        curr = _base_state(); curr["cart"] = [{"productId": "p1-2", "qty": 4}]; curr["cartShopId"] = "shop-1"
        r = _eval(t, init, curr)
        assert r.success, r.issues

    def test_remove_cart_item(self):
        t = _tasks_module.RemoveCartItem()
        t.params["shopId"] = "shop-1"; t.params["productId"] = "p1-2"
        t.params["keepItems"] = [{"productId": "p1-5", "productName": "香煎鸡腿", "qty": 2}]
        init = _base_state()
        init["cart"] = [{"productId": "p1-2", "qty": 1}, {"productId": "p1-5", "qty": 2}]
        init["cartShopId"] = "shop-1"
        curr = _base_state()
        curr["cart"] = [{"productId": "p1-5", "qty": 2}]; curr["cartShopId"] = "shop-1"
        r = _eval(t, init, curr)
        assert r.success, r.issues

    def test_search_shop_delivery_info(self):
        t = _tasks_module.SearchShopDeliveryInfo()
        t.params["shopId"] = "shop-3"; t.params["shopName"] = "川香麻辣烫"
        init = _base_state(); curr = _base_state()
        curr["_temp"]["searchCurrent"] = _search("川香麻辣烫", ["shop-3"])
        r = _eval(t, init, curr,
                  init_sheet=_sheet({}, submitted=False),
                  curr_sheet=_sheet({"0": "4", "1": "35"},
                                    fields=[{"type": "number", "label": "配送费"},
                                            {"type": "number", "label": "预计配送时间"}]))
        assert r.success, r.issues

    def test_add_multi_dish_to_cart(self):
        t = _tasks_module.AddMultiDishToCart()
        t.params["shopId"] = "shop-1"
        t.params["productId1"] = "p1-1"; t.params["quantity1"] = 2
        t.params["productId2"] = "p1-5"; t.params["quantity2"] = 3
        init = _base_state(); curr = _base_state()
        curr["cart"] = [{"productId": "p1-1", "qty": 2}, {"productId": "p1-5", "qty": 3}]
        curr["cartShopId"] = "shop-1"
        r = _eval(t, init, curr)
        assert r.success, r.issues

    def test_submit_order_with_remark(self):
        t = _tasks_module.SubmitOrderWithRemark()
        t.params["shopId"] = "shop-1"; t.params["productId"] = "p1-1"; t.params["quantity"] = 2
        t.params["remark"] = "不要辣"; t.params["utensils"] = 1
        init = _base_state(); curr = _base_state()
        curr["orders"] = [_build_order("shop-1", [{"productId": "p1-1", "qty": 2}],
                                       remark="不要辣", utensils=1, method="balance", status="待支付")]
        curr["cart"] = []; curr["cartShopId"] = None
        r = _eval(t, init, curr)
        assert r.success, r.issues
        assert r.clean

    def test_place_and_pay_with_method(self):
        t = _tasks_module.PlaceAndPayWithMethod()
        t.params["shopId"] = "shop-1"; t.params["productId"] = "p1-1"; t.params["quantity"] = 2
        t.params["paymentMethod"] = "wechat"; t.params["paymentMethodZh"] = "微信支付"
        init = _base_state(); curr = _base_state()
        curr["orders"] = [_build_order("shop-1", [{"productId": "p1-1", "qty": 2}],
                                       method="wechat", status="商家已接单")]
        curr["cart"] = []; curr["cartShopId"] = None
        curr["paymentMethod"] = "wechat"  # balance unchanged (method != balance)
        r = _eval(t, init, curr)
        assert r.success, r.issues
        assert r.clean

    def test_search_dish_find_shop(self):
        t = _tasks_module.SearchDishFindShop()
        t.params["dishName"] = "招牌珍珠奶茶"; t.params["shopId"] = "shop-2"; t.params["shopName"] = "甜甜奶茶屋"
        init = _base_state(); curr = _base_state()
        curr["_temp"]["searchCurrent"] = _search("招牌珍珠奶茶", ["shop-2"])
        r = _eval(t, init, curr,
                  init_sheet=_sheet({}, submitted=False),
                  curr_sheet=_sheet({"0": "甜甜奶茶屋"}, fields=[{"type": "text", "label": "商家名称"}]))
        assert r.success, r.issues

    def test_order_under_budget(self):
        t = _tasks_module.OrderUnderBudget()
        t.params["shopId"] = "shop-1"; t.params["productId"] = "p1-1"; t.params["quantity"] = 2
        t.params["budget"] = 31; t.params["totalPayable"] = 31.0
        init = _base_state(); curr = _base_state()
        curr["orders"] = [_build_order("shop-1", [{"productId": "p1-1", "qty": 2}], status="待支付")]
        curr["cart"] = []; curr["cartShopId"] = None
        r = _eval(t, init, curr)
        assert r.success, r.issues

    def test_count_shops_by_condition(self):
        t = _tasks_module.CountShopsByCondition()
        t.params["keyword"] = "满减"; t.params["ratingThreshold"] = 4.6
        t.params["feeThreshold"] = 3; t.params["expectedCount"] = 4
        init = _base_state(); curr = _base_state()
        curr["_temp"]["searchCurrent"] = _search("满减", [s["id"] for s in SHOP_BY_ID.values()])
        r = _eval(t, init, curr,
                  init_sheet=_sheet({}, submitted=False),
                  curr_sheet=_sheet({"0": "4"}, fields=[{"type": "number", "label": "商家数量"}]))
        assert r.success, r.issues

    def test_compare_and_order_cheaper(self):
        t = _tasks_module.CompareAndOrderCheaper()
        # A: shop-1 p1-1 x2 → 31 ; B: shop-2 p2-1 x2 → 24 (cheaper)
        t.params["shopA"] = "shop-1"; t.params["productIdA"] = "p1-1"; t.params["quantityA"] = 2
        t.params["shopB"] = "shop-2"; t.params["productIdB"] = "p2-1"; t.params["quantityB"] = 2
        t.params["cheaperShopId"] = "shop-2"; t.params["cheaperProductId"] = "p2-1"
        t.params["cheaperQuantity"] = 2; t.params["cheaperTotal"] = 24.0
        init = _base_state(); curr = _base_state()
        curr["orders"] = [_build_order("shop-2", [{"productId": "p2-1", "qty": 2}], status="待支付")]
        curr["cart"] = []; curr["cartShopId"] = None
        r = _eval(t, init, curr,
                  init_sheet=_sheet({}, submitted=False),
                  curr_sheet=_sheet({"0": "24"}, fields=[{"type": "number", "label": "更便宜方案的实付金额"}]))
        assert r.success, r.issues

    def test_max_discount_tier_order(self):
        t = _tasks_module.MaxDiscountTierOrder()
        t.params["shopId"] = "shop-1"; t.params["productId"] = "p1-1"; t.params["quantity"] = 4
        t.params["expectedDiscount"] = 15.0; t.params["expectedTotal"] = 53.0
        init = _base_state(); curr = _base_state()
        curr["orders"] = [_build_order("shop-1", [{"productId": "p1-1", "qty": 4}], status="待支付")]
        curr["cart"] = []; curr["cartShopId"] = None
        r = _eval(t, init, curr)
        assert r.success, r.issues

    def test_multi_step_place_and_pay_order(self):
        t = _tasks_module.MultiStepPlaceAndPayOrder()
        t.params["shopId"] = "shop-1"; t.params["productId"] = "p1-1"; t.params["quantity"] = 2
        t.params["remark"] = "少冰"; t.params["utensils"] = 2
        t.params["paymentMethod"] = "balance"; t.params["paymentMethodZh"] = "余额支付"
        init = _base_state(); curr = _base_state()
        order = _build_order("shop-1", [{"productId": "p1-1", "qty": 2}],
                             remark="少冰", utensils=2, method="balance", status="商家已接单")
        curr["orders"] = [order]
        curr["cart"] = []; curr["cartShopId"] = None
        curr["paymentMethod"] = "balance"
        curr["userProfile"]["balance"] = 128.5 - order["totalPayable"]  # balance deducted
        r = _eval(t, init, curr)
        assert r.success, r.issues
        assert r.clean

    def test_conditional_budget_order_should_order(self):
        t = _tasks_module.ConditionalBudgetOrder()
        t.params["shopId"] = "shop-1"; t.params["productId"] = "p1-1"; t.params["quantity"] = 2
        t.params["budget"] = 31; t.params["totalPayable"] = 31.0  # 31 <= 31 → should order
        init = _base_state(); curr = _base_state()
        curr["orders"] = [_build_order("shop-1", [{"productId": "p1-1", "qty": 2}], status="待支付")]
        curr["cart"] = []; curr["cartShopId"] = None
        r = _eval(t, init, curr)
        assert r.success, r.issues


# =============================================================================
# Negative judge tests (high-difficulty scenarios)
# =============================================================================


class TestNegativeJudges:
    def test_add_dish_wrong_qty_fails(self):
        t = _tasks_module.AddDishToCart()
        t.params["shopId"] = "shop-1"; t.params["productId"] = "p1-2"; t.params["quantity"] = 3
        init = _base_state(); curr = _base_state()
        curr["cart"] = [{"productId": "p1-2", "qty": 2}]; curr["cartShopId"] = "shop-1"  # wrong qty
        r = _eval(t, init, curr)
        assert not r.success

    def test_submit_order_wrong_remark_fails(self):
        t = _tasks_module.SubmitOrderWithRemark()
        t.params["shopId"] = "shop-1"; t.params["productId"] = "p1-1"; t.params["quantity"] = 2
        t.params["remark"] = "不要辣"; t.params["utensils"] = 1
        init = _base_state(); curr = _base_state()
        curr["orders"] = [_build_order("shop-1", [{"productId": "p1-1", "qty": 2}],
                                       remark="多辣", utensils=1, status="待支付")]
        curr["cart"] = []; curr["cartShopId"] = None
        r = _eval(t, init, curr)
        assert not r.success

    def test_submit_order_no_order_fails(self):
        t = _tasks_module.SubmitOrderWithRemark()
        t.params["shopId"] = "shop-1"; t.params["productId"] = "p1-1"; t.params["quantity"] = 2
        t.params["remark"] = "不要辣"; t.params["utensils"] = 1
        init = _base_state(); curr = _base_state()  # agent never submitted
        r = _eval(t, init, curr)
        assert not r.success

    def test_compare_ordered_expensive_fails(self):
        t = _tasks_module.CompareAndOrderCheaper()
        t.params["shopA"] = "shop-1"; t.params["productIdA"] = "p1-1"; t.params["quantityA"] = 2
        t.params["shopB"] = "shop-2"; t.params["productIdB"] = "p2-1"; t.params["quantityB"] = 2
        t.params["cheaperShopId"] = "shop-2"; t.params["cheaperProductId"] = "p2-1"
        t.params["cheaperQuantity"] = 2; t.params["cheaperTotal"] = 24.0
        init = _base_state(); curr = _base_state()
        # agent ordered the EXPENSIVE one (shop-1) — wrong
        curr["orders"] = [_build_order("shop-1", [{"productId": "p1-1", "qty": 2}], status="待支付")]
        curr["cart"] = []; curr["cartShopId"] = None
        r = _eval(t, init, curr,
                  init_sheet=_sheet({}, submitted=False),
                  curr_sheet=_sheet({"0": "24"}, fields=[{"type": "number", "label": "更便宜方案的实付金额"}]))
        assert not r.success

    def test_conditional_over_budget_but_ordered_fails(self):
        t = _tasks_module.ConditionalBudgetOrder()
        t.params["shopId"] = "shop-1"; t.params["productId"] = "p1-1"; t.params["quantity"] = 2
        t.params["budget"] = 30; t.params["totalPayable"] = 31.0  # 31 > 30 → must NOT order
        init = _base_state(); curr = _base_state()
        curr["orders"] = [_build_order("shop-1", [{"productId": "p1-1", "qty": 2}], status="待支付")]
        curr["cart"] = []; curr["cartShopId"] = None
        r = _eval(t, init, curr)
        assert not r.success

    def test_count_wrong_answer_fails(self):
        t = _tasks_module.CountShopsByCondition()
        t.params["keyword"] = "满减"; t.params["ratingThreshold"] = 4.6
        t.params["feeThreshold"] = 3; t.params["expectedCount"] = 4
        init = _base_state(); curr = _base_state()
        curr["_temp"]["searchCurrent"] = _search("满减", [s["id"] for s in SHOP_BY_ID.values()])
        r = _eval(t, init, curr,
                  init_sheet=_sheet({}, submitted=False),
                  curr_sheet=_sheet({"0": "3"}, fields=[{"type": "number", "label": "商家数量"}]))
        assert not r.success

    def test_query_no_search_fails(self):
        t = _tasks_module.SearchShopMinOrder()
        t.params["shopId"] = "shop-2"; t.params["shopName"] = "甜甜奶茶屋"
        init = _base_state(); curr = _base_state()  # searchCurrent stays None
        r = _eval(t, init, curr,
                  init_sheet=_sheet({}, submitted=False),
                  curr_sheet=_sheet({"0": "15"}, fields=[{"type": "number", "label": "起送价"}]))
        assert not r.success
