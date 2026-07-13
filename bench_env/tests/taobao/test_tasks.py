"""
Offline judge tests for Taobao benchmark tasks.
"""
import json
from pathlib import Path
import pytest

_DEFAULTS_PATH = Path(__file__).parent.parent.parent.parent / "apps" / "Taobao" / "data" / "defaults.json"
with open(_DEFAULTS_PATH, "r") as f:
    DEFAULTS = json.load(f)


def _make_state(overrides: dict = None) -> dict:
    base = {
        "profile": DEFAULTS["profile"], "settings": DEFAULTS["settings"],
        "products": DEFAULTS["products"], "skus": DEFAULTS["skus"],
        "categories": DEFAULTS["categories"], "brands": DEFAULTS["brands"],
        "shops": DEFAULTS["shops"], "cart": list(DEFAULTS["cart"]),
        "userCoupons": list(DEFAULTS["userCoupons"]), "addresses": list(DEFAULTS["addresses"]),
        "checkoutDraft": {"items": [], "addressId": None, "couponId": None, "shippingMethod": None},
        "orders": list(DEFAULTS["orders"]), "logistics": dict(DEFAULTS["logistics"]),
        "refundRequests": [], "reviews": list(DEFAULTS["reviews"]),
        "favoriteIds": list(DEFAULTS["favoriteIds"]),
        "search": {"current": {"query": "", "sortOption": "comprehensive", "categoryId": None, "brandId": None, "priceMin": "", "priceMax": "", "freeShippingOnly": False, "shopId": None, "minRating": "", "resultsCount": 0}, "history": [], "openedProductIds": []},
        "openedProductIds": [], "recentlyViewed": [],
        "coupons": DEFAULTS["coupons"],
    }
    if overrides:
        for k, v in overrides.items():
            if isinstance(v, dict) and isinstance(base.get(k), dict):
                base[k] = {**base[k], **v}
            elif isinstance(v, list) and isinstance(base.get(k), list):
                base[k] = v
            else:
                base[k] = v
    return base


def make_ji(init: dict, curr: dict, answer: str = None):
    return type("JI", (), {
        "apps_init": {"taobao": init}, "apps": {"taobao": curr},
        "os_init": {"time": 1_000_000_000_000}, "os": {"time": 1_000_000_000_001},
        "route_init": {}, "route": {}, "answer": answer or "",
    })()


def _import_task(name: str):
    mod = __import__(f"bench_env.task.taobao.defs.{name}", fromlist=[name])
    return getattr(mod, name)


# ============================================================
# Positive tests
# ============================================================

POSITIVE_CASES = [
    # ---- SelectSkuAndReportUnitPrice ----
    {
        "task": "SelectSkuAndReportUnitPrice",
        "params": {"product_id": "p1", "sku_id": "sku_p1_256_black"},
        "init": lambda: _make_state(),
        "curr": lambda s: {**s, "openedProductIds": ["p1"]},
        "answer": "8999",
    },
    # ---- SearchFilterSortAndReportSeller ----
    {
        "task": "SearchFilterSortAndReportSeller",
        "params": {"query": "手机", "brand_id": "b1", "price_min": 1000, "price_max": 10000, "sort_option": "priceAsc"},
        "init": lambda: _make_state(),
        "curr": lambda s: {
            **s,
            "search": {"current": {**s["search"]["current"], "query": "手机", "brandId": "b1", "priceMin": "1000", "priceMax": "10000", "freeShippingOnly": True, "sortOption": "priceAsc", "resultsCount": 2}, "history": [{"id": "1", "query": "手机", "brandId": "b1", "priceMin": "1000", "priceMax": "10000", "freeShippingOnly": True, "sortOption": "priceAsc", "resultsCount": 2, "firstProductId": "p1", "categoryId": None, "shopId": None, "minRating": ""}], "openedProductIds": []},
            "openedProductIds": ["p1"],
        },
        "answer": "数码旗舰店",
    },
    # ---- CompareTwoProductsAndReportCheaper ----
    {
        "task": "CompareTwoProductsAndReportCheaper",
        "params": {"query": "跑鞋", "product_a_id": "p5", "product_b_id": "p6"},
        "init": lambda: _make_state(),
        "curr": lambda s: {
            **s,
            "search": {"current": {**s["search"]["current"], "query": "跑鞋", "resultsCount": 2}, "history": [{"id": "1", "query": "跑鞋", "sortOption": "comprehensive", "resultsCount": 2, "firstProductId": "p6", "categoryId": None, "brandId": None, "priceMin": "", "priceMax": "", "freeShippingOnly": False, "shopId": None, "minRating": ""}], "openedProductIds": []},
            "openedProductIds": ["p6", "p5"],
        },
        "answer": "Adidas Ultraboost 23 跑步鞋",
    },
    # ---- AddSpecificSkuToCart ----
    {
        "task": "AddSpecificSkuToCart",
        "params": {"product_id": "p10", "sku_id": "sku_p10_standard", "quantity": 2},
        "init": lambda: _make_state(),
        "curr": lambda s: {
            **s,
            "cart": [*s["cart"], {"id": "cart_new", "productId": "p10", "skuId": "sku_p10_standard", "quantity": 2, "selected": True, "addedAt": 1_000_000_000_000, "unitPrice": 99}],
            "openedProductIds": ["p10"],
        },
    },
    # ---- UpdateCartSelectionAndQuantity ----
    {
        "task": "UpdateCartSelectionAndQuantity",
        "params": {
            "target_item_a_id": "cart_1", "target_item_b_id": "cart_2",
            "quantity_a": 3,
        },
        "init": lambda: _make_state(),
        "curr": lambda s: {
            **s,
            "cart": [
                {**s["cart"][0], "selected": True, "quantity": 3},
                {**s["cart"][1], "selected": True},
                {**s["cart"][2], "selected": False},
                {**s["cart"][3], "selected": False},
            ],
            "checkoutDraft": {"items": [
                {"cartItemId": s["cart"][0]["id"], "productId": s["cart"][0]["productId"], "skuId": s["cart"][0]["skuId"], "quantity": 3, "unitPrice": s["cart"][0]["unitPrice"]},
                {"cartItemId": s["cart"][1]["id"], "productId": s["cart"][1]["productId"], "skuId": s["cart"][1]["skuId"], "quantity": s["cart"][1]["quantity"], "unitPrice": s["cart"][1]["unitPrice"]},
            ], "addressId": s["addresses"][0]["id"], "couponId": None, "shippingMethod": "standard"},
        },
    },
    # ---- RemoveOneCartItemWithoutAffectingOthers ----
    {
        "task": "RemoveOneCartItemWithoutAffectingOthers",
        "params": {"target_cart_item_id": "cart_1"},
        "init": lambda: _make_state(),
        "curr": lambda s: {**s, "cart": [s["cart"][1], s["cart"][2], s["cart"][3]]},
    },
    # ---- CancelUnshippedOrderAndRestoreState ----
    {
        "task": "CancelUnshippedOrderAndRestoreState",
        "params": {"target_order_id": "order_3"},
        "init": lambda: _make_state(),
        "curr": lambda s: {
            **s,
            "orders": [{**o, "status": "cancelled", "cancelledAt": 1_000_000_000_000} if o["id"] == "order_3" else o for o in s["orders"]],
            "skus": {**s["skus"], "sku_p5_42": {**s["skus"]["sku_p5_42"], "stock": s["skus"]["sku_p5_42"]["stock"] + 1}},
        },
    },
    # ---- RequestRefundForSpecificOrderItem ----
    {
        "task": "RequestRefundForSpecificOrderItem",
        "params": {"target_order_id": "order_2", "target_order_item_id": "oi_2_1", "reason": "不喜欢/不想要", "note": "test"},
        "init": lambda: _make_state(),
        "curr": lambda s: {
            **s,
            "refundRequests": [{"id": "ref_test", "orderId": "order_2", "orderItemId": "oi_2_1", "skuId": "sku_p7_50ml", "reason": "不喜欢/不想要", "note": "test", "status": "pending", "createdAt": 1_000_000_000_000}],
            "orders": [{**o, "items": [{**oi, "refundStatus": "requested" if oi["id"] == "oi_2_1" else oi.get("refundStatus", "none")} for oi in o["items"]]} if o["id"] == "order_2" else o for o in s["orders"]],
        },
    },
]

# ============================================================
# Negative tests
# ============================================================

NEGATIVE_CASES = [
    # Wrong answer
    {"task": "SelectSkuAndReportUnitPrice", "params": {"product_id": "p1", "sku_id": "sku_p1_256_black"},
     "init": lambda: _make_state(), "curr": lambda s: {**s, "openedProductIds": ["p1"]}, "answer": "9999"},
    # No product opened
    {"task": "SelectSkuAndReportUnitPrice", "params": {"product_id": "p1", "sku_id": "sku_p1_256_black"},
     "init": lambda: _make_state(), "curr": lambda s: s, "answer": "8999"},
    # Wrong SKU
    {"task": "AddSpecificSkuToCart", "params": {"product_id": "p10", "sku_id": "sku_p10_standard", "quantity": 1},
     "init": lambda: _make_state(), "curr": lambda s: {
         **s, "cart": [*s["cart"], {"id": "wrong", "productId": "p10", "skuId": "sku_p11_standard", "quantity": 1, "selected": True, "addedAt": 1_000_000_000_000, "unitPrice": 49}]}},
    # No changes
    {"task": "AddSpecificSkuToCart", "params": {"product_id": "p10", "sku_id": "sku_p10_standard", "quantity": 1},
     "init": lambda: _make_state(), "curr": lambda s: s},
    # Wrong cart item removed
    {"task": "RemoveOneCartItemWithoutAffectingOthers", "params": {"target_cart_item_id": "cart_1"},
     "init": lambda: _make_state(), "curr": lambda s: {**s, "cart": [s["cart"][0], s["cart"][1], s["cart"][3]]}},
    # All items still present (nothing removed)
    {"task": "RemoveOneCartItemWithoutAffectingOthers", "params": {"target_cart_item_id": "cart_1"},
     "init": lambda: _make_state(), "curr": lambda s: s},
    # Wrong order cancelled
    {"task": "CancelUnshippedOrderAndRestoreState", "params": {"target_order_id": "order_3"},
     "init": lambda: _make_state(), "curr": lambda s: {**s, "orders": [{**o, "status": "cancelled", "cancelledAt": 1_000_000_000_000} if o["id"] == "order_1" else o for o in s["orders"]]}},
    # Stock not restored
    {"task": "CancelUnshippedOrderAndRestoreState", "params": {"target_order_id": "order_3"},
     "init": lambda: _make_state(), "curr": lambda s: {**s, "orders": [{**o, "status": "cancelled", "cancelledAt": 1_000_000_000_000} if o["id"] == "order_3" else o for o in s["orders"]]}},
    # Wrong item refunded
    {"task": "RequestRefundForSpecificOrderItem", "params": {"target_order_id": "order_2", "target_order_item_id": "oi_2_1", "reason": "不喜欢/不想要", "note": ""},
     "init": lambda: _make_state(), "curr": lambda s: {
         **s, "refundRequests": [{"id": "ref_wrong", "orderId": "order_2", "orderItemId": "oi_2_2", "skuId": "sku_p8_50ml", "reason": "其他", "note": "", "status": "pending", "createdAt": 1_000_000_000_000}],
         "orders": [{**o, "items": [{**oi, "refundStatus": "requested" if oi["id"] == "oi_2_2" else oi.get("refundStatus", "none")} for oi in o["items"]]} if o["id"] == "order_2" else o for o in s["orders"]]}},
    # No search performed
    {"task": "SearchFilterSortAndReportSeller", "params": {"query": "手机", "brand_id": "b1", "price_min": 1000, "price_max": 10000, "sort_option": "priceAsc"},
     "init": lambda: _make_state(), "curr": lambda s: s, "answer": "数码旗舰店"},
]


# ============================================================
# Test functions
# ============================================================

def _resolve(val, init_state=None):
    if callable(val):
        try:
            return val(init_state) if init_state is not None else val()
        except TypeError:
            return val()
    return val


@pytest.mark.parametrize("case", POSITIVE_CASES, ids=[c["task"] for c in POSITIVE_CASES])
def test_positive(case):
    TaskClass = _import_task(case["task"])
    init_state = _make_state()
    curr_state = _resolve(case["curr"], init_state)
    answer = case.get("answer")

    task = TaskClass()
    # Set task parameters
    task.params.clear()
    task.params.update(case.get("params", {}))
    input_ = make_ji(init_state, curr_state, answer=answer)
    checks = task.check_goals(input_)

    all_passed = all(c.get("passed", False) for c in checks)
    if not all_passed:
        for c in checks:
            if not c.get("passed", False):
                print(f"  FAIL [{c.get('field', '?')}]: exp={c.get('expected')}, act={c.get('actual')}")
    assert all_passed, f"All checks should pass for {case['task']}"


@pytest.mark.parametrize("case", NEGATIVE_CASES, ids=[f"{c['task']}_neg{i}" for i, c in enumerate(NEGATIVE_CASES)])
def test_negative(case):
    TaskClass = _import_task(case["task"])
    init_state = _make_state()
    curr_state = _resolve(case["curr"], init_state)
    answer = case.get("answer")

    task = TaskClass()
    task.params.clear()
    task.params.update(case.get("params", {}))
    input_ = make_ji(init_state, curr_state, answer=answer)
    checks = task.check_goals(input_)

    all_passed = all(c.get("passed", False) for c in checks)
    assert not all_passed, f"At least one check should fail for negative case {case['task']}"
