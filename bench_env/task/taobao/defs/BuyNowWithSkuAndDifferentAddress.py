"""
Open a product detail, select a SKU, use Buy Now, choose a non-default address,
place the order. Cart should remain unchanged.

Hybrid operate task (L4): product detail + SKU selection + Buy Now checkout
with address selection.
"""
from __future__ import annotations

import random
from typing import Any

from bench_env.task.taobao.app import (
    Taobao,
    TAOBAO_ORDER_CHANGES,
)
from bench_env.task.base import BaseTask
from bench_env.task.judge import JudgeInput


def _sample_buy_now(env_state: dict, rng: random.Random) -> dict:
    """
    Pick an enabled product with at least one enabled SKU in stock,
    and a non-default address.

    Returns:
        dict with product_id, sku_id, quantity (int), address_id.
    """
    taobao_state = env_state.get("apps", {}).get("taobao", {})
    taobao = Taobao(taobao_state)

    # Find enabled products with at least one enabled SKU in stock
    candidates: list[tuple[dict, list[dict]]] = []
    for p in taobao.products.values():
        if not p.get("enabled", True):
            continue
        skus = taobao.get_product_skus(p["id"])
        good_skus = [
            s for s in skus
            if s.get("enabled", True) and s.get("stock", 0) > 0
        ]
        if good_skus:
            candidates.append((p, good_skus))

    # Find a non-default address
    non_default_addresses = [
        a for a in taobao.addresses if not a.get("isDefault", False)
    ]

    if candidates and non_default_addresses:
        product, good_skus = rng.choice(candidates)
        sku = rng.choice(good_skus)
        address = rng.choice(non_default_addresses)
        return {
            "product_id": product["id"],
            "sku_id": sku["id"],
            "quantity": 1,
            "address_id": address["id"],
        }

    # Fallback: Sony WH-1000XM5, black SKU, second address, qty 1
    return {
        "product_id": "p3",
        "sku_id": "sku_p3_black",
        "quantity": 1,
        "address_id": "addr2",
    }


class BuyNowWithSkuAndDifferentAddress(BaseTask):
    """Select SKU, use Buy Now, choose non-default address, place order."""

    templates = [
        '在淘宝中打开商品{product_desc}，选择{sku_attrs_text}，使用"立即购买"，'
        '选择收货地址{address_desc}，提交订单（注意不要加入购物车）',
    ]
    apps = ["taobao"]
    scope = "S3"
    objective = "hybrid"
    composition = "sequential"
    difficulty = "L4"
    capabilities = ["nav", "search", "form_fill"]
    max_steps = 45

    parameters = {
        "_buy_now": {
            "sampler": _sample_buy_now,
            "fields": {
                "product_id": "product_id",
                "sku_id": "sku_id",
                "quantity": "quantity",
                "address_id": "address_id",
            },
        },
        "product_id": {
            "type": "string",
            "default": "p3",
            "description": "目标商品ID",
        },
        "sku_id": {
            "type": "string",
            "default": "sku_p3_black",
            "description": "目标SKU ID",
        },
        "quantity": {
            "type": "int",
            "min": 1,
            "max": 3,
            "default": 1,
            "description": "购买数量",
        },
        "product_desc": {
            "type": "string",
            "default": "",
            "description": "商品描述（模板用）",
        },
        "sku_attrs_text": {
            "type": "string",
            "default": "默认规格",
            "description": "SKU规格文字描述（模板用）",
        },
        "address_id": {
            "type": "string",
            "default": "addr2",
            "description": "收货地址ID（非默认地址）",
        },
        "address_desc": {
            "type": "string",
            "default": "",
            "description": "地址描述（模板用）",
        },
    }

    expected_changes = TAOBAO_ORDER_CHANGES + [
        "openedProductIds",
        "recentlyViewed",
    ]

    optimal_paths: list[list[Any]] = [
        [
            {"id": "search.item.open", "params": {"id": "{product_id}"}},
            "item.sku.select",
            "item.buyNow",
            "checkout.address.select",
            "checkout.submit",
        ],
    ]

    # -----------------------------------------------------------------
    # Post-sample: resolve display-only params
    # -----------------------------------------------------------------

    async def _post_sample(self, env: Any) -> None:
        """Resolve product description, SKU attrs text, address desc, and
        save initial order IDs."""
        state = await env.get_state()
        taobao_state = state.get("apps", {}).get("taobao", {})
        taobao = Taobao(taobao_state)

        # Resolve product description
        product = taobao.get_product(self.p.product_id)
        self.params["product_desc"] = (
            product.get("title", "") if product else self.p.product_id
        )

        # Resolve SKU attributes text
        sku = taobao.get_sku(self.p.sku_id)
        attrs = sku.get("attributes", {}) if sku else {}
        self.params["sku_attrs_text"] = (
            " ".join(v for v in attrs.values()) if attrs else "默认规格"
        )

        # Resolve address description (truncated to 20 chars for template)
        addr = taobao.get_address(self.p.address_id)
        if addr:
            full = (
                f"{addr.get('province', '')}"
                f"{addr.get('city', '')}"
                f"{addr.get('district', '')}"
                f"{addr.get('detail', '')}"
            )
            self.params["address_desc"] = full[:20]
        else:
            self.params["address_desc"] = self.p.address_id

        # Save initial order IDs for new-order detection
        initial_order_ids = {o["id"] for o in taobao.orders}
        self.params["_initial_order_ids"] = initial_order_ids

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        init = Taobao(input.apps_init.get("taobao", {}))
        taobao = Taobao(input.apps.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        # ---- 1. Product detail page was opened ----
        opened = taobao.check_product_opened(self.p.product_id)
        checks.append({
            "field": "product.opened",
            "expected": True,
            "actual": opened,
            "passed": opened,
        })

        # Derive initial order IDs from the initial state
        init_orders = input.apps_init.get("taobao", {}).get("orders", [])
        init_order_ids = {o["id"] for o in init_orders}

        # ---- 2. A new order was created ----
        new_order = taobao.find_new_order(init_order_ids)
        checks.append({
            "field": "order.new",
            "expected": "A new order was created",
            "actual": f"Order ID: {new_order['id']}" if new_order else "No new order found",
            "passed": new_order is not None,
        })

        if new_order is not None:
            # ---- 3. New order uses the specified address ----
            addr_snap = new_order.get("addressSnapshot", {})
            addr_match = addr_snap.get("id") == self.p.address_id
            checks.append({
                "field": "order.address",
                "expected": f"addressId={self.p.address_id}",
                "actual": f"addressId={addr_snap.get('id')}",
                "passed": addr_match,
            })

            # ---- 4. New order has the correct SKU ----
            order_sku_ids = {
                item.get("skuId", "")
                for item in new_order.get("items", [])
            }
            sku_match = self.p.sku_id in order_sku_ids
            checks.append({
                "field": "order.sku",
                "expected": f"skuId={self.p.sku_id} in order items",
                "actual": f"order SKUs={order_sku_ids}",
                "passed": sku_match,
            })

            # ---- 5. New order's item quantity matches ----
            total_qty = sum(
                item.get("quantity", 0)
                for item in new_order.get("items", [])
                if item.get("skuId") == self.p.sku_id
            )
            qty_match = total_qty == self.p.quantity
            checks.append({
                "field": "order.quantity",
                "expected": self.p.quantity,
                "actual": total_qty,
                "passed": qty_match,
            })

        # ---- 6. Cart is unchanged (same items, quantities, selection states) ----
        init_cart_sorted = sorted(init.cart, key=lambda ci: ci["id"])
        curr_cart_sorted = sorted(taobao.cart, key=lambda ci: ci["id"])
        cart_unchanged = (
            len(init.cart) == len(taobao.cart)
            and all(
                ci_init.get("id") == ci_curr.get("id")
                and ci_init.get("quantity") == ci_curr.get("quantity")
                and ci_init.get("selected") == ci_curr.get("selected")
                and ci_init.get("unitPrice") == ci_curr.get("unitPrice")
                for ci_init, ci_curr in zip(init_cart_sorted, curr_cart_sorted)
            )
        )
        checks.append({
            "field": "cart.unchanged",
            "expected": "Cart unchanged from initial state",
            "actual": "Cart unchanged" if cart_unchanged else "Cart changed",
            "passed": cart_unchanged,
        })

        # ---- 7. SKU stock was deducted by the ordered quantity ----
        sku = init.get_sku(self.p.sku_id)
        if sku is not None:
            init_stock = sku.get("stock", 0)
            curr_stock = taobao.get_sku_stock(self.p.sku_id) or 0
            stock_deducted = (init_stock - curr_stock) == self.p.quantity
            checks.append({
                "field": "sku.stock_deducted",
                "expected": (
                    f"Stock decreased by {self.p.quantity} "
                    f"(init={init_stock}, target={init_stock - self.p.quantity})"
                ),
                "actual": f"curr={curr_stock}, diff={init_stock - curr_stock}",
                "passed": stock_deducted,
            })
        else:
            checks.append({
                "field": "sku.stock_deducted",
                "expected": f"SKU {self.p.sku_id} exists in initial state",
                "actual": "SKU not found in initial state",
                "passed": False,
            })

        return checks
