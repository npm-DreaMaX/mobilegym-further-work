"""MeituanLite App accessor + samplers + answer/check helpers.

Runtime store shape (apps/meituan-lite, persisted):
    addressId, cart:[{productId,qty}], cartShopId, orders:[...],
    paymentMethod, userProfile:{name,phone,balance}, settings:{utensils,defaultRemark},
    _temp:{ searchCurrent:{q,resultShopIds,searched}|None }   (volatile, always_ignore)

Shop / product catalog lives in static defaults.json (NOT in the runtime store);
judges must recompute prices from the catalog, never hard-code amounts.
"""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any

from bench_env.task.base import BaseApp
from bench_env.task.common_tasks import match_value

# ── static catalog (only app.py may read the App base JSON) ──────────────

_DEFAULTS_PATH = Path(__file__).resolve().parents[3] / "apps" / "MeituanLite" / "data" / "defaults.json"
_DEFAULTS = json.loads(_DEFAULTS_PATH.read_text(encoding="utf-8"))

MEITUAN_SHOPS: list[dict[str, Any]] = _DEFAULTS["shops"]
MEITUAN_ADDRESSES: list[dict[str, Any]] = _DEFAULTS["addresses"]
MEITUAN_USER_PROFILE: dict[str, Any] = _DEFAULTS["userProfile"]

# structural fee constant (mirrors apps/MeituanLite/constants.ts MEITUAN_LITE_CONSTANTS)
FREE_DELIVERY_THRESHOLD = 30

MEITUAN_QTY_CHOICES = [2, 3, 4]  # qty >= 2 forces multiple "+" taps
MEITUAN_REMARK_POOL = ["不要辣", "少冰少糖", "多放葱花", "餐具不用", "打包分开", "少油少盐"]
MEITUAN_UTENSILS_CHOICES = [1, 2, 3]  # != 0 to make the choice meaningful
MEITUAN_PAY_METHODS_NON_DEFAULT = ["bankcard", "wechat", "alipay"]
MEITUAN_PAY_METHOD_ZH = {
    "balance": "余额支付", "bankcard": "银行卡",
    "wechat": "微信支付", "alipay": "支付宝",
}

SHOP_BY_ID: dict[str, dict[str, Any]] = {s["id"]: s for s in MEITUAN_SHOPS}
PRODUCT_BY_ID: dict[str, dict[str, Any]] = {}
for _s in MEITUAN_SHOPS:
    for _p in _s["products"]:
        PRODUCT_BY_ID[_p["id"]] = _p
del _s, _p

# ── expected_changes constants (shared across tasks) ─────────────────────

MEITUAN_ADD_TO_CART_CHANGES = ["cart", "cartShopId"]
MEITUAN_ORDER_CHANGES = ["orders", "cart", "cartShopId"]
MEITUAN_PAY_CHANGES = ["orders", "cart", "cartShopId", "paymentMethod", "userProfile"]
# query tasks only touch _temp.searchCurrent (always_ignore) + answer_sheet (always_ignore)
MEITUAN_QUERY_CHANGES: list[str] = []


# ── pure price recomputation (mirrors apps/MeituanLite/state.ts) ─────────


def compute_discount(promotions: list[dict[str, Any]], subtotal: float) -> float:
    """满减: pick the highest threshold whose rule is met; 0 if none."""
    if subtotal <= 0:
        return 0
    for promo in promotions:
        if promo.get("type") != "满减" or not promo.get("rules"):
            continue
        rules = sorted(promo["rules"], key=lambda r: r["threshold"], reverse=True)
        for r in rules:
            if subtotal >= r["threshold"]:
                return float(r["discount"])
    return 0


def compute_fees(shop: dict[str, Any], lines: list[dict[str, Any]]) -> dict[str, float]:
    """lines: list of {productId, qty}. Returns subtotal/packingFee/deliveryFee/discount/totalPayable."""
    subtotal = 0.0
    packing = 0.0
    for it in lines:
        p = PRODUCT_BY_ID[it["productId"]]
        q = int(it["qty"])
        subtotal += p["price"] * q
        packing += p["packingFee"] * q
    if subtotal <= 0:
        delivery = 0.0
    elif subtotal >= FREE_DELIVERY_THRESHOLD:
        delivery = 0.0
    else:
        delivery = float(shop["deliveryFee"])
    discount = compute_discount(shop["promotions"], subtotal)
    total = max(0.0, subtotal + delivery + packing - discount)
    return {
        "subtotal": subtotal,
        "packingFee": packing,
        "deliveryFee": delivery,
        "discount": discount,
        "totalPayable": total,
    }


# ── App accessor ─────────────────────────────────────────────────────────


class MeituanLite(BaseApp):
    """Accessor for apps/meituan-lite runtime state."""

    # ── state properties ──
    @property
    def cart(self) -> list[dict[str, Any]]:
        return self.get_list("cart")

    @property
    def cart_shop_id(self) -> str | None:
        v = self.get("cartShopId")
        return v if v is not None else None

    @property
    def orders(self) -> list[dict[str, Any]]:
        return self.get_list("orders")

    @property
    def address_id(self) -> str:
        return str(self.get("addressId"))

    @property
    def payment_method(self) -> str:
        return str(self.get("paymentMethod"))

    @property
    def balance(self) -> float:
        return float(self.get("userProfile.balance") or 0)

    @property
    def init_balance(self) -> float:
        if not self.has_init:
            return self.balance
        return float(self.init.get("userProfile", {}).get("balance") or 0)

    @property
    def search_current(self) -> dict[str, Any] | None:
        return self.get("_temp.searchCurrent")

    # ── data methods ──
    @staticmethod
    def shop_by_id(shop_id: str) -> dict[str, Any]:
        s = SHOP_BY_ID.get(shop_id)
        if s is None:
            raise ValueError(f"unknown shop id: {shop_id}")
        return s

    @staticmethod
    def product_by_id(product_id: str) -> dict[str, Any]:
        p = PRODUCT_BY_ID.get(product_id)
        if p is None:
            raise ValueError(f"unknown product id: {product_id}")
        return p

    def cart_item_for(self, product_id: str) -> dict[str, Any] | None:
        for ci in self.cart:
            if ci.get("productId") == product_id:
                return ci
        return None

    @property
    def new_orders(self) -> list[dict[str, Any]]:
        """orders in current not present in init (by id)."""
        init_ids = set()
        if self.has_init:
            for o in self.init.get("orders") or []:
                init_ids.add(o.get("id"))
        return [o for o in self.orders if o.get("id") not in init_ids]

    # ── answer methods ──
    @staticmethod
    def shop_min_order(shop_id: str) -> int:
        return int(MeituanLite.shop_by_id(shop_id)["minOrder"])

    @staticmethod
    def shop_delivery_info(shop_id: str) -> dict[str, float]:
        s = MeituanLite.shop_by_id(shop_id)
        return {"deliveryFee": float(s["deliveryFee"]), "deliveryTime": float(s["deliveryTime"])}

    @staticmethod
    def shop_name(shop_id: str) -> str:
        return str(MeituanLite.shop_by_id(shop_id)["name"])

    @staticmethod
    def order_total(shop_id: str, lines: list[dict[str, Any]]) -> float:
        return compute_fees(MeituanLite.shop_by_id(shop_id), lines)["totalPayable"]

    @staticmethod
    def count_shops_by_condition(rating_min: float, fee_max: float) -> int:
        n = 0
        for s in MEITUAN_SHOPS:
            if float(s["rating"]) >= rating_min and float(s["deliveryFee"]) <= fee_max:
                n += 1
        return n

    # ── check methods (each returns one dict) ──
    def check_searched(self, *, exact_q: str | None = None, found_shop_id: str | None = None,
                       field: str = "search.performed") -> dict[str, Any]:
        cur = self.search_current
        searched = bool(cur and cur.get("searched"))
        ok = searched
        if exact_q is not None and ok:
            q_match = str(cur.get("q", "")).strip().lower() == str(exact_q).strip().lower()
            ok = ok and q_match
        if found_shop_id is not None and ok:
            ids = cur.get("resultShopIds") or []
            ok = ok and (found_shop_id in ids)
        return {
            "field": field,
            "expected": {"searched": True, "exact_q": exact_q, "found_shop_id": found_shop_id},
            "actual": cur,
            "passed": ok,
        }

    def check_cart_exact(self, expected_items: list[dict[str, Any]],
                         expected_shop_id: str, *, field: str = "cart.exact") -> dict[str, Any]:
        exp_map = {it["productId"]: int(it["qty"]) for it in expected_items}
        cur_map = {it.get("productId"): int(it.get("qty", 0)) for it in self.cart}
        same_keys = set(exp_map) == set(cur_map)
        same_qty = same_keys and all(cur_map.get(pid) == q for pid, q in exp_map.items())
        shop_ok = self.cart_shop_id == expected_shop_id
        return {
            "field": field,
            "expected": {"shopId": expected_shop_id, "items": exp_map},
            "actual": {"shopId": self.cart_shop_id, "items": cur_map},
            "passed": bool(same_qty and shop_ok),
        }

    def check_cart_has(self, product_id: str, qty: int, *,
                       field: str = "cart.has_product") -> dict[str, Any]:
        item = self.cart_item_for(product_id)
        actual_qty = int(item["qty"]) if item else 0
        return {
            "field": field,
            "expected": {"productId": product_id, "qty": qty},
            "actual": {"productId": product_id, "qty": actual_qty},
            "passed": item is not None and actual_qty == qty,
        }

    def check_cart_cleared(self, *, field: str = "cart.cleared") -> dict[str, Any]:
        cleared = len(self.cart) == 0 and self.cart_shop_id is None
        return {
            "field": field,
            "expected": {"cart": [], "cartShopId": None},
            "actual": {"cart": self.cart, "cartShopId": self.cart_shop_id},
            "passed": cleared,
        }

    def check_old_orders_unchanged(self, *, field: str = "orders.old_unchanged") -> dict[str, Any]:
        if not self.has_init:
            return {"field": field, "expected": "init orders present", "actual": None, "passed": False}
        init_ids = {o.get("id"): o for o in self.init.get("orders") or []}
        curr_ids = {o.get("id"): o for o in self.orders}
        unchanged = all(o_id in curr_ids and curr_ids[o_id] == o for o_id, o in init_ids.items())
        return {
            "field": field,
            "expected": f"{len(init_ids)} old orders unchanged",
            "actual": f"{len(init_ids.keys() & curr_ids.keys())} present",
            "passed": unchanged,
        }

    def check_balance_after_pay(self, method: str, order_total: float,
                                *, field: str = "userProfile.balance") -> dict[str, Any]:
        expected = self.init_balance - (order_total if method == "balance" else 0)
        actual = self.balance
        return {
            "field": field,
            "expected": round(expected, 2),
            "actual": round(actual, 2),
            "passed": math.isclose(expected, actual, abs_tol=0.005),
        }

    def check_answer_sheet(self, expected: Any, input: Any, *,
                           field_labels: list[str] | None = None) -> list[dict[str, Any]]:
        """Read apps.answer_sheet, match each expected value per slot.

        expected: scalar (slot 0) or dict {slot: value} or list [v0, v1, ...].
        """
        sheet = input.apps.get("answer_sheet") or {}
        submitted = bool(sheet.get("submitted"))
        answers = sheet.get("answers") or {}

        if isinstance(expected, dict):
            items = list(expected.values())
            slots = list(expected.keys())
        elif isinstance(expected, (list, tuple)):
            items = list(expected)
            slots = [str(i) for i in range(len(items))]
        else:
            items = [expected]
            slots = ["0"]

        checks: list[dict[str, Any]] = []
        for i, exp in enumerate(items):
            actual = answers.get(str(i))
            label = field_labels[i] if field_labels and i < len(field_labels) else slots[i]
            ok = bool(actual not in (None, "") and match_value(exp, str(actual)))
            checks.append({
                "field": f"answer_sheet.{label}",
                "expected": exp,
                "actual": actual,
                "passed": ok,
            })
        checks.append({
            "field": "answer_sheet.submitted",
            "expected": True,
            "actual": submitted,
            "passed": submitted is True,
        })
        return checks

    # ── composite order check (returns multiple atomic checks) ──
    def check_new_order(self, expected: dict[str, Any]) -> list[dict[str, Any]]:
        """expected keys (all optional except shop_id/items):
        shop_id, items:[{productId,qty}], remark, utensils, payment_method, status,
        check_amount:bool, check_balance:bool.
        """
        new = self.new_orders
        order = new[0] if len(new) == 1 else None
        one_new = len(new) == 1
        checks: list[dict[str, Any]] = [{
            "field": "orders.new_count",
            "expected": 1,
            "actual": len(new),
            "passed": one_new,
        }]

        shop_id = expected.get("shop_id")
        items = expected.get("items") or []
        exp_items_map = {it["productId"]: int(it["qty"]) for it in items}

        def o(field, exp, act, passed):
            return {"field": field, "expected": exp, "actual": act, "passed": passed}

        checks.append(o("new_order.shop", shop_id,
                        order.get("shopId") if order else None,
                        bool(order and order.get("shopId") == shop_id)))

        if order:
            cur_items = {it.get("productId"): int(it.get("qty", 0)) for it in order.get("items") or []}
            same = set(exp_items_map) == set(cur_items) and all(
                cur_items.get(pid) == q for pid, q in exp_items_map.items())
        else:
            cur_items = {}
            same = False
        checks.append(o("new_order.items_exact", exp_items_map, cur_items, bool(order and same)))

        if expected.get("check_amount"):
            if order and shop_id:
                fees = compute_fees(self.shop_by_id(shop_id), items)
                amt_ok = math.isclose(float(order.get("totalPayable", 0)), fees["totalPayable"], abs_tol=0.005)
                act = order.get("totalPayable")
                exp = round(fees["totalPayable"], 2)
            else:
                act, exp, amt_ok = (order.get("totalPayable") if order else None), None, False
            checks.append(o("new_order.amount", exp, act, bool(order and amt_ok)))

        if expected.get("remark") is not None:
            checks.append(o("new_order.remark", expected.get("remark"),
                            order.get("remark") if order else None,
                            bool(order and order.get("remark") == expected.get("remark"))))

        if expected.get("utensils") is not None:
            checks.append(o("new_order.utensils", expected.get("utensils"),
                            order.get("utensils") if order else None,
                            bool(order and order.get("utensils") == expected.get("utensils"))))

        if expected.get("payment_method") is not None:
            checks.append(o("new_order.payment_method", expected.get("payment_method"),
                            order.get("paymentMethod") if order else None,
                            bool(order and order.get("paymentMethod") == expected.get("payment_method"))))

        if expected.get("status") is not None:
            checks.append(o("new_order.status", expected.get("status"),
                            order.get("status") if order else None,
                            bool(order and order.get("status") == expected.get("status"))))

        if expected.get("check_balance") and order and expected.get("payment_method"):
            checks.append(self.check_balance_after_pay(
                expected.get("payment_method"), float(order.get("totalPayable", 0))))

        return checks

    # ── setup helpers (return state patches; do NOT take env) ──
    @staticmethod
    def prepare_state_empty_cart() -> dict[str, Any]:
        """Patch that guarantees a clean cart + no orders (deterministic init)."""
        return {"cart": [], "cartShopId": None, "orders": []}

    @staticmethod
    def prepare_state_cart(shop_id: str, cart_items: list[dict[str, Any]]) -> dict[str, Any]:
        """Patch that pre-fills the cart with the given items under one shop."""
        return {"cart": cart_items, "cartShopId": shop_id, "orders": []}

    # ── samplers (staticmethod, fn(env_state, rng) -> dict) ──
    @staticmethod
    def sample_target(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        shop = rng.choice(MEITUAN_SHOPS)
        product = rng.choice(shop["products"])
        quantity = int(rng.choice(MEITUAN_QTY_CHOICES))
        return {"shopId": shop["id"], "shopName": shop["name"],
                "productId": product["id"], "productName": product["name"], "quantity": quantity}

    @staticmethod
    def sample_shop(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        shop = rng.choice(MEITUAN_SHOPS)
        return {"shopId": shop["id"], "shopName": shop["name"]}

    @staticmethod
    def sample_cart_modify(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        shop = rng.choice(MEITUAN_SHOPS)
        product = rng.choice(shop["products"])
        q1, q2 = rng.sample(MEITUAN_QTY_CHOICES, 2)
        return {"shopId": shop["id"], "shopName": shop["name"],
                "productId": product["id"], "productName": product["name"],
                "initialQty": int(q1), "targetQty": int(q2)}

    @staticmethod
    def sample_cart_remove(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        shop = next(s for s in MEITUAN_SHOPS if len(s["products"]) >= 3)
        picked = rng.sample(shop["products"], 3)
        remove_p = picked[0]
        keep = [{"productId": picked[1]["id"], "productName": picked[1]["name"], "qty": int(rng.choice(MEITUAN_QTY_CHOICES))},
                {"productId": picked[2]["id"], "productName": picked[2]["name"], "qty": int(rng.choice(MEITUAN_QTY_CHOICES))}]
        return {"shopId": shop["id"], "shopName": shop["name"],
                "removeProductId": remove_p["id"], "removeProductName": remove_p["name"],
                "keepItems": keep}

    @staticmethod
    def sample_two_products(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        shop = next(s for s in MEITUAN_SHOPS if len(s["products"]) >= 2)
        p1, p2 = rng.sample(shop["products"], 2)
        q1, q2 = int(rng.choice(MEITUAN_QTY_CHOICES)), int(rng.choice(MEITUAN_QTY_CHOICES))
        return {"shopId": shop["id"], "shopName": shop["name"],
                "productId1": p1["id"], "productName1": p1["name"], "quantity1": q1,
                "productId2": p2["id"], "productName2": p2["name"], "quantity2": q2}

    @staticmethod
    def sample_order_remark(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        shop = rng.choice(MEITUAN_SHOPS)
        product = rng.choice(shop["products"])
        return {"shopId": shop["id"], "shopName": shop["name"],
                "productId": product["id"], "productName": product["name"],
                "quantity": int(rng.choice(MEITUAN_QTY_CHOICES)),
                "remark": rng.choice(MEITUAN_REMARK_POOL),
                "utensils": int(rng.choice(MEITUAN_UTENSILS_CHOICES))}

    @staticmethod
    def sample_pay_method(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        shop = rng.choice(MEITUAN_SHOPS)
        product = rng.choice(shop["products"])
        method = rng.choice(MEITUAN_PAY_METHODS_NON_DEFAULT)
        return {"shopId": shop["id"], "shopName": shop["name"],
                "productId": product["id"], "productName": product["name"],
                "quantity": int(rng.choice(MEITUAN_QTY_CHOICES)),
                "paymentMethod": method, "paymentMethodZh": MEITUAN_PAY_METHOD_ZH[method]}

    @staticmethod
    def sample_unique_dish(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        # product name appears in exactly one shop's products and not in any shop name/tag
        candidates = []
        for p in PRODUCT_BY_ID.values():
            name = p["name"]
            shops_with = {s["id"] for s in MEITUAN_SHOPS
                          if any(pr["name"] == name for pr in s["products"])}
            if len(shops_with) != 1:
                continue
            if any(name.lower() in s["name"].lower() or
                   any(name.lower() in t.lower() for t in s["tags"]) for s in MEITUAN_SHOPS):
                continue
            candidates.append(p)
        if not candidates:
            raise ValueError("no unique dish name found")
        p = rng.choice(candidates)
        shop = next(s for s in MEITUAN_SHOPS if any(pr["id"] == p["id"] for pr in s["products"]))
        return {"dishName": p["name"], "shopId": shop["id"], "shopName": shop["name"]}

    @staticmethod
    def sample_budget_order(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        shop = rng.choice(MEITUAN_SHOPS)
        product = rng.choice(shop["products"])
        qty = int(rng.choice(MEITUAN_QTY_CHOICES))
        total = MeituanLite.order_total(shop["id"], [{"productId": product["id"], "qty": qty}])
        budget = math.ceil(total)
        return {"shopId": shop["id"], "shopName": shop["name"],
                "productId": product["id"], "productName": product["name"],
                "quantity": qty, "budget": budget, "totalPayable": round(total, 2)}

    @staticmethod
    def sample_count_condition(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        ratings = [4.4, 4.5, 4.6, 4.7, 4.8]
        fees = [2, 3, 4]
        for _ in range(50):
            r = rng.choice(ratings)
            f = rng.choice(fees)
            count = MeituanLite.count_shops_by_condition(r, f)
            if 1 <= count <= 5:
                return {"keyword": "满减", "ratingThreshold": r,
                        "feeThreshold": f, "expectedCount": count}
        raise ValueError("no valid count condition")

    @staticmethod
    def sample_compare_configs(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        configs = []
        for _ in range(2):
            shop = rng.choice(MEITUAN_SHOPS)
            product = rng.choice(shop["products"])
            qty = int(rng.choice(MEITUAN_QTY_CHOICES))
            total = MeituanLite.order_total(shop["id"], [{"productId": product["id"], "qty": qty}])
            configs.append({"shopId": shop["id"], "shopName": shop["name"],
                            "productId": product["id"], "productName": product["name"],
                            "quantity": qty, "totalPayable": round(total, 2)})
        a, b = configs
        if math.isclose(a["totalPayable"], b["totalPayable"]):
            a["quantity"] += 1
            a["totalPayable"] = round(
                MeituanLite.order_total(a["shopId"], [{"productId": a["productId"], "qty": a["quantity"]}]), 2)
        cheaper = a if a["totalPayable"] < b["totalPayable"] else b
        return {
            "shopA": a["shopId"], "shopNameA": a["shopName"],
            "productIdA": a["productId"], "productNameA": a["productName"],
            "quantityA": a["quantity"], "totalA": a["totalPayable"],
            "shopB": b["shopId"], "shopNameB": b["shopName"],
            "productIdB": b["productId"], "productNameB": b["productName"],
            "quantityB": b["quantity"], "totalB": b["totalPayable"],
            "cheaperShopId": cheaper["shopId"], "cheaperShopName": cheaper["shopName"],
            "cheaperProductId": cheaper["productId"], "cheaperProductName": cheaper["productName"],
            "cheaperQuantity": cheaper["quantity"], "cheaperTotal": cheaper["totalPayable"],
        }

    @staticmethod
    def sample_discount_tier(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        shops_with_promo = [s for s in MEITUAN_SHOPS
                            if any(p.get("type") == "满减" and p.get("rules") for p in s["promotions"])]
        for _ in range(50):
            shop = rng.choice(shops_with_promo)
            product = rng.choice(shop["products"])
            promo = next(p for p in shop["promotions"] if p.get("type") == "满减")
            rule = rng.choice(promo["rules"])
            threshold = rule["threshold"]
            k = max(1, math.ceil(threshold / product["price"]))
            if product["price"] * (k - 1) >= threshold:
                k -= 1
            if product["price"] * k < threshold:
                k += 1
            if k < 2:
                continue
            fees = compute_fees(shop, [{"productId": product["id"], "qty": k}])
            if fees["discount"] > 0:
                return {"shopId": shop["id"], "shopName": shop["name"],
                        "productId": product["id"], "productName": product["name"],
                        "quantity": k, "expectedDiscount": round(fees["discount"], 2),
                        "expectedTotal": round(fees["totalPayable"], 2)}
        raise ValueError("no valid discount tier")

    @staticmethod
    def sample_full_order(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        shop = rng.choice(MEITUAN_SHOPS)
        product = rng.choice(shop["products"])
        method = rng.choice(["balance"] + MEITUAN_PAY_METHODS_NON_DEFAULT)
        return {"shopId": shop["id"], "shopName": shop["name"],
                "productId": product["id"], "productName": product["name"],
                "quantity": int(rng.choice(MEITUAN_QTY_CHOICES)),
                "remark": rng.choice(MEITUAN_REMARK_POOL),
                "utensils": int(rng.choice(MEITUAN_UTENSILS_CHOICES)),
                "paymentMethod": method, "paymentMethodZh": MEITUAN_PAY_METHOD_ZH[method]}

    @staticmethod
    def sample_conditional_budget(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        shop = rng.choice(MEITUAN_SHOPS)
        product = rng.choice(shop["products"])
        qty = int(rng.choice(MEITUAN_QTY_CHOICES))
        total = MeituanLite.order_total(shop["id"], [{"productId": product["id"], "qty": qty}])
        should_order = bool(rng.getrandbits(1))
        if should_order:
            budget = math.ceil(total)  # total <= budget
        else:
            budget = max(0, math.ceil(total) - 1)  # total > budget
        return {"shopId": shop["id"], "shopName": shop["name"],
                "productId": product["id"], "productName": product["name"],
                "quantity": qty, "budget": budget, "shouldOrder": should_order,
                "totalPayable": round(total, 2)}
