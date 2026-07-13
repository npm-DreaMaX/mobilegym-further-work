"""
在淘宝中收集优惠券，将商品加入购物车，去结算页使用该优惠券，提交订单。

Operate task (L4 hybrid): claim a coupon, add a product to cart, go to checkout,
apply the coupon, and create an order.
"""
from __future__ import annotations

import random
from typing import Any

from bench_env.task.taobao.app import (
    Taobao, TAOBAO_CART_CHANGES, TAOBAO_COUPON_CHANGES, TAOBAO_CHECKOUT_CHANGES,
)
from bench_env.task.base import BaseTask
from bench_env.task.judge import JudgeInput


def _coupon_description(state: dict, coupon_id: str) -> str:
    """Build a human-readable coupon description from the state."""
    coupons = state.get("coupons", {})
    coupon = coupons.get(coupon_id, {})
    name = coupon.get("name", "")
    if name:
        return name
    threshold = coupon.get("threshold", 0)
    discount = coupon.get("discount", 0)
    ctype = coupon.get("type", "platform")
    shop_id = coupon.get("shopId", "")
    if ctype == "shop" and shop_id:
        shop_name = ""
        shops = state.get("shops", {})
        if shop_id in shops:
            shop_name = shops[shop_id].get("name", "")
        prefix = f"{shop_name} " if shop_name else ""
        if threshold:
            return f"{prefix}满{threshold}减{discount}元店铺券"
        return f"{prefix}减{discount}元店铺券"
    if threshold:
        return f"满{threshold}减{discount}元平台券"
    return f"减{discount}元券"


def _sample_unclaimed_coupon(env_state: dict, rng: random.Random) -> dict:
    """
    Pick an unclaimed coupon and a matching product with stock.

    Returns ``{"coupon_id": ..., "product_id": ..., "sku_id": ..., "quantity": ...}``.

    The coupon must NOT already be claimed by the user.  For shop coupons,
    preference is given to a product from the same shop.  Falls back to a
    hard-coded default when nothing suitable is found.
    """
    taobao_state = env_state.get("apps", {}).get("taobao", {})
    taobao = Taobao(taobao_state)

    available_coupons = taobao_state.get("coupons", {})

    # ---- Find unclaimed coupons (no entry in userCoupons) ----
    unclaimed_ids = [
        cid for cid in available_coupons
        if taobao.get_user_coupon(cid) is None
    ]
    if not unclaimed_ids:
        return {
            "coupon_id": "coupon_tmall",
            "product_id": "p10",
            "sku_id": "sku_p10_standard",
            "quantity": 1,
        }

    # Shuffle so we explore different combinations across task instances
    rng.shuffle(unclaimed_ids)

    # ---- Try shop coupons — pick a product from the same shop ----
    for cid in unclaimed_ids:
        coupon = available_coupons[cid]
        if coupon.get("type") != "shop":
            continue
        shop_id = coupon.get("shopId")
        if not shop_id:
            continue
        for p in taobao.products.values():
            if not p.get("enabled", True):
                continue
            if p.get("shopId") != shop_id:
                continue
            skus = taobao.get_product_skus(p["id"])
            good_skus = [
                s for s in skus
                if s.get("enabled", True) and s.get("stock", 0) > 0
            ]
            if good_skus:
                sku = rng.choice(good_skus)
                return {
                    "coupon_id": cid,
                    "product_id": p["id"],
                    "sku_id": sku["id"],
                    "quantity": rng.randint(1, 2),
                }

    # ---- Fallback: any unclaimed coupon + any product with stock ----
    cid = unclaimed_ids[0]
    for p in taobao.products.values():
        if not p.get("enabled", True):
            continue
        skus = taobao.get_product_skus(p["id"])
        good_skus = [
            s for s in skus
            if s.get("enabled", True) and s.get("stock", 0) > 0
        ]
        if good_skus:
            sku = rng.choice(good_skus)
            return {
                "coupon_id": cid,
                "product_id": p["id"],
                "sku_id": sku["id"],
                "quantity": rng.randint(1, 2),
            }

    # ---- Hard fallback ----
    return {
        "coupon_id": "coupon_tmall",
        "product_id": "p10",
        "sku_id": "sku_p10_standard",
        "quantity": 1,
    }


class CollectCouponAndApplyAtCheckout(BaseTask):
    """Claim a coupon, add product to cart, checkout with coupon, place order."""

    templates = [
        '在淘宝中收集优惠券{coupon_desc}，将商品{sku_desc}({quantity}件)加入购物车并勾选，'
        '去结算页使用该优惠券，提交订单',
    ]
    apps = ["taobao"]
    scope = "S3"
    objective = "hybrid"
    composition = "sequential"
    difficulty = "L4"
    capabilities = ["nav", "cart", "coupon", "checkout"]
    max_steps = 45

    parameters = {
        "_coupon_product": {
            "sampler": _sample_unclaimed_coupon,
            "fields": {
                "coupon_id": "coupon_id",
                "product_id": "product_id",
                "sku_id": "sku_id",
                "quantity": "quantity",
            },
        },
        "coupon_id": {
            "type": "string",
            "default": "coupon_tmall",
        },
        "product_id": {
            "type": "string",
            "default": "p10",
        },
        "sku_id": {
            "type": "string",
            "default": "sku_p10_standard",
        },
        "quantity": {
            "type": "int",
            "min": 1,
            "max": 3,
            "default": 1,
        },
    }

    expected_changes = (
        TAOBAO_CART_CHANGES
        + TAOBAO_COUPON_CHANGES
        + TAOBAO_CHECKOUT_CHANGES
    )

    # -----------------------------------------------------------------
    # Post-sample: resolve display-only params + save initial order IDs
    # -----------------------------------------------------------------

    async def _post_sample(self, env: Any) -> None:
        """Resolve display-only params after sampling."""
        state = await env.get_state()
        taobao_state = state.get("apps", {}).get("taobao", {})
        taobao = Taobao(taobao_state)

        # Sku description (product title)
        product = taobao.get_product(self.p.product_id)
        self.params["sku_desc"] = (
            product.get("title", self.p.product_id)
            if product
            else self.p.product_id
        )

        # Coupon description
        self.params["coupon_desc"] = _coupon_description(taobao_state, self.p.coupon_id)

        # Save initial order IDs for new-order detection
        self.params["_initial_order_ids"] = {o["id"] for o in taobao.orders}

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        taobao = Taobao(input.apps.get("taobao", {}))
        taobao_init = Taobao(input.apps_init.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        # ---- Resolve initial order IDs ----
        initial_order_ids: set[str] = self.params.get("_initial_order_ids")
        if not initial_order_ids:
            # Fallback: compute from apps_init
            init = Taobao(input.apps_init.get("taobao", {}))
            initial_order_ids = {o["id"] for o in init.orders}

        # ----------------------------------------------------------------
        # 1. Coupon is claimed by the user
        # ----------------------------------------------------------------
        claimed = taobao.is_coupon_claimed(self.p.coupon_id)
        checks.append({
            "field": "coupon.claimed",
            "expected": True,
            "actual": claimed,
            "passed": claimed,
        })

        # ----------------------------------------------------------------
        # 2. Target SKU is in cart, selected, correct quantity & unit price
        # ----------------------------------------------------------------
        cart_item = taobao.get_cart_item_by_sku(self.p.sku_id)
        sku = taobao_init.get_sku(self.p.sku_id)
        expected_price = sku.get("price", 0) if sku else 0

        checks.append({
            "field": "cart.item_exists",
            "expected": True,
            "actual": cart_item is not None,
            "passed": cart_item is not None,
        })

        if cart_item:
            qty_ok = cart_item.get("quantity") == self.p.quantity
            checks.append({
                "field": "cart.item_quantity",
                "expected": self.p.quantity,
                "actual": cart_item.get("quantity"),
                "passed": qty_ok,
            })

            selected_ok = cart_item.get("selected", False)
            checks.append({
                "field": "cart.item_selected",
                "expected": True,
                "actual": selected_ok,
                "passed": selected_ok,
            })

            price_ok = cart_item.get("unitPrice") == expected_price
            checks.append({
                "field": "cart.item_unit_price",
                "expected": expected_price,
                "actual": cart_item.get("unitPrice"),
                "passed": price_ok,
            })

        # ----------------------------------------------------------------
        # 3. Checkout draft references the coupon
        # ----------------------------------------------------------------
        draft = taobao.checkout_draft
        draft_coupon_id = (
            draft.get("couponSnapshot", {}).get("couponId")
            if draft else None
        )
        draft_coupon_ok = draft is not None and draft_coupon_id == self.p.coupon_id
        checks.append({
            "field": "checkout.coupon",
            "expected": self.p.coupon_id,
            "actual": draft_coupon_id,
            "passed": draft_coupon_ok,
        })

        # ----------------------------------------------------------------
        # 4. A new order was created
        # ----------------------------------------------------------------
        new_order = taobao.find_new_order(initial_order_ids)
        order_created = new_order is not None
        checks.append({
            "field": "order.created",
            "expected": True,
            "actual": order_created,
            "passed": order_created,
        })

        # ----------------------------------------------------------------
        # 5. The coupon is now used
        # ----------------------------------------------------------------
        coupon_used = taobao.is_coupon_used(self.p.coupon_id)
        checks.append({
            "field": "coupon.used",
            "expected": True,
            "actual": coupon_used,
            "passed": coupon_used,
        })

        # ----------------------------------------------------------------
        # 6. Order payable matches calculated amount
        # ----------------------------------------------------------------
        if new_order:
            selected_ids = [ci["id"] for ci in taobao.cart if ci.get("selected")]
            if selected_ids:
                calc = taobao.calculate_payable(selected_ids, self.p.coupon_id)
                payable_ok = calc is not None and new_order.get("payable") == calc["payable"]
            else:
                # Fallback: reconstruct from order items and coupon definition
                expected_subtotal = sum(
                    item.get("unitPrice", 0) * item.get("quantity", 1)
                    for item in new_order.get("items", [])
                )
                expected_shipping = new_order.get("shippingFee", new_order.get("shipping", 0))
                coupon_def = taobao_init.get_available_coupon(self.p.coupon_id)
                expected_discount = (
                    coupon_def.get("discount", 0)
                    if coupon_def and expected_subtotal >= coupon_def.get("threshold", 0)
                    else 0
                )
                expected_payable = expected_subtotal + expected_shipping - expected_discount
                payable_ok = new_order.get("payable") == expected_payable

            checks.append({
                "field": "order.payable",
                "expected": "Matches calculated payable",
                "actual": new_order.get("payable"),
                "passed": payable_ok,
            })

        return checks
