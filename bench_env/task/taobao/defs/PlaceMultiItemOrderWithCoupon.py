"""
Select multiple items in cart, claim and apply a coupon, place the order.

Operate task (L4): multi-item order with coupon workflow.
"""
from __future__ import annotations

import random
from typing import Any

from bench_env.task.taobao.app import (
    Taobao,
    TAOBAO_CHECKOUT_CHANGES,
    TAOBAO_ORDER_CHANGES,
)
from bench_env.task.base import BaseTask
from bench_env.task.judge import JudgeInput


def _sample_multi_item_scenario(env_state: dict, rng: random.Random) -> dict:
    """
    Pick 2-3 cart items with different productIds and an applicable, unclaimed coupon.

    Returns:
        dict with target_cart_item_ids (list[str]) and coupon_id (str).
    """
    taobao_state = env_state.get("apps", {}).get("taobao", {})
    taobao = Taobao(taobao_state)

    cart = taobao.cart

    # Filter items whose SKU has stock > 0
    in_stock = [
        ci for ci in cart
        if (taobao.get_sku_stock(ci.get("skuId", "")) or 0) > 0
    ]
    if not in_stock:
        in_stock = cart

    # Pick 2-3 items with different productIds when possible
    seen_product_ids: set[str] = set()
    picked: list[dict] = []

    # Prefer items already selected
    candidates = [ci for ci in in_stock if ci.get("selected", False)]
    if len(candidates) < 2:
        candidates = in_stock

    rng.shuffle(candidates)
    for ci in candidates:
        if len(picked) >= 3:
            break
        pid = ci.get("productId", "")
        if pid not in seen_product_ids:
            picked.append(ci)
            seen_product_ids.add(pid)

    # Ensure at least 2 items
    if len(picked) < 2:
        picked = in_stock[:2]
        if len(picked) < 2:
            picked = cart[:2]

    target_ids = [ci["id"] for ci in picked]

    # Find an unclaimed, applicable coupon
    product_ids = list(seen_product_ids) if seen_product_ids else [ci.get("productId", "") for ci in picked]
    subtotal = sum(
        ci.get("unitPrice", 0) * ci.get("quantity", 1) for ci in picked
    )

    # Determine which coupons the user has already claimed (including used ones)
    claimed_ids = {uc.get("couponId") for uc in taobao.user_coupons}

    coupon_id = ""
    for cid in taobao.state.get("coupons", {}):
        if cid in claimed_ids:
            continue
        if taobao.is_coupon_applicable(cid, subtotal, product_ids):
            coupon_id = cid
            break

    result: dict[str, Any] = {
        "target_cart_item_ids": target_ids,
        "coupon_id": coupon_id,
    }
    return result


class PlaceMultiItemOrderWithCoupon(BaseTask):
    """Select multiple cart items, claim and apply a coupon, place the order."""

    templates = [
        '在淘宝购物车中勾选多个商品({count}件)，使用{coupon_desc}优惠券，合并提交订单',
    ]
    apps = ["taobao"]
    scope = "S3"
    objective = "operate"
    composition = "sequential"
    difficulty = "L4"
    capabilities = ["nav", "cart", "coupon", "form_fill"]
    max_steps = 45

    parameters = {
        "_multi_item": {
            "sampler": _sample_multi_item_scenario,
            "fields": {
                "target_cart_item_ids": "target_cart_item_ids",
                "coupon_id": "coupon_id",
            },
        },
        "target_cart_item_ids": {
            "type": "list",
            "default": ["ci1", "ci2"],
            "description": "购物车中要下单的商品ID列表",
        },
        "coupon_id": {
            "type": "string",
            "default": "coupon_tmall",
            "description": "优惠券ID",
        },
        "coupon_desc": {
            "type": "string",
            "default": "优惠券",
            "description": "优惠券描述（模板用）",
        },
    }

    expected_changes = TAOBAO_ORDER_CHANGES + TAOBAO_CHECKOUT_CHANGES

    optimal_paths: list[list[Any]] = [
        [
            "tab.cart",
            "cart.checkout",
            "checkout.coupon.select",
            "checkout.submit",
        ],
    ]

    # -----------------------------------------------------------------
    # Post-sample: resolve display-only params
    # -----------------------------------------------------------------

    async def _post_sample(self, env: Any) -> None:
        """Save initial order IDs and resolve coupon description."""
        state = await env.get_state()
        taobao_state = state.get("apps", {}).get("taobao", {})
        taobao = Taobao(taobao_state)

        # Save initial order IDs for new-order detection
        initial_order_ids = {o["id"] for o in taobao.orders}
        self.params["_initial_order_ids"] = initial_order_ids

        # Resolve coupon description for template rendering
        coupon = taobao.get_available_coupon(self.p.coupon_id)
        self.params["coupon_desc"] = (
            coupon.get("name", self.p.coupon_id) if coupon else self.p.coupon_id
        )

        # Compute item count for template
        self.params["count"] = len(self.p.target_cart_item_ids)

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        init = Taobao(input.apps_init.get("taobao", {}))
        taobao = Taobao(input.apps.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        # Derive initial order IDs from the initial state
        init_orders = input.apps_init.get("taobao", {}).get("orders", [])
        init_order_ids = {o["id"] for o in init_orders}

        # ---- 1. A new order was created ----
        new_order = taobao.find_new_order(init_order_ids)
        checks.append({
            "field": "order.new",
            "expected": "A new order was created",
            "actual": f"Order ID: {new_order['id']}" if new_order else "No new order found",
            "passed": new_order is not None,
        })

        if new_order is not None:
            items = new_order.get("items", [])

            # ---- 2. The new order has multiple items (>= 2) ----
            multi_item = len(items) >= 2
            checks.append({
                "field": "order.multi_item",
                "expected": ">= 2 items",
                "actual": f"{len(items)} item(s)",
                "passed": multi_item,
            })

            # ---- 3. Order items match target cart items (by productId) ----
            target_cart_items = [
                ci for ci in init.cart if ci["id"] in self.p.target_cart_item_ids
            ]
            target_product_ids = {ci.get("productId", "") for ci in target_cart_items}
            order_product_ids = {item.get("productId", "") for item in items}
            items_match = (
                bool(target_product_ids)
                and target_product_ids.issubset(order_product_ids)
            )
            checks.append({
                "field": "order.items_match",
                "expected": f"Order items include products {target_product_ids}",
                "actual": f"Order has products {order_product_ids}",
                "passed": items_match,
            })

            # ---- 4. Order has couponSnapshot with matching coupon_id ----
            if self.p.coupon_id:
                coupon_snap = new_order.get("couponSnapshot")
                coupon_match = (
                    coupon_snap is not None
                    and coupon_snap.get("couponId") == self.p.coupon_id
                )
                checks.append({
                    "field": "order.coupon_snapshot",
                    "expected": f"couponId={self.p.coupon_id}",
                    "actual": f"couponSnapshot={coupon_snap}",
                    "passed": coupon_match,
                })

            # ---- 5. The coupon is now marked as used ----
            if self.p.coupon_id:
                coupon_used = taobao.is_coupon_used(self.p.coupon_id)
                checks.append({
                    "field": "coupon.used",
                    "expected": True,
                    "actual": coupon_used,
                    "passed": coupon_used,
                })

            # ---- 6. Stock was deducted for SKUs in the order ----
            all_stock_deducted = True
            stock_details: list[str] = []
            for item in items:
                sku_id = item.get("skuId", "")
                qty = item.get("quantity", 0)
                init_stock = init.get_sku_stock(sku_id) or 0
                curr_stock = taobao.get_sku_stock(sku_id) or 0
                deducted = (init_stock - curr_stock) == qty
                if not deducted:
                    all_stock_deducted = False
                stock_details.append(
                    f"sku={sku_id}: init={init_stock} curr={curr_stock} "
                    f"ordered={qty} {'OK' if deducted else 'MISMATCH'}"
                )
            checks.append({
                "field": "order.stock_deducted",
                "expected": "All SKU stocks deducted by ordered quantity",
                "actual": "; ".join(stock_details),
                "passed": all_stock_deducted,
            })

            # ---- 7. Order status is one of pending/paid/confirmed ----
            status = new_order.get("status", "")
            valid_status = status in ("pending", "paid", "confirmed")
            checks.append({
                "field": "order.status",
                "expected": "One of: pending, paid, confirmed",
                "actual": status,
                "passed": valid_status,
            })

            # ---- 8. Order payable matches calculate_payable ----
            if self.p.coupon_id:
                payable_info = init.calculate_payable(
                    self.p.target_cart_item_ids, self.p.coupon_id
                )
            else:
                payable_info = init.calculate_payable(
                    self.p.target_cart_item_ids
                )
            if payable_info is not None:
                expected_payable = payable_info["payable"]
                actual_payable = new_order.get("payable", 0)
                payable_match = abs(actual_payable - expected_payable) < 0.01
                checks.append({
                    "field": "order.payable",
                    "expected": f"{expected_payable:.2f}",
                    "actual": f"{actual_payable:.2f}",
                    "passed": payable_match,
                })
            else:
                checks.append({
                    "field": "order.payable",
                    "expected": "Valid calculate_payable result",
                    "actual": "calculate_payable returned None",
                    "passed": False,
                })

        return checks
