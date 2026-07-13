"""
搜索商品，选择指定规格和数量，加入购物车。

Operate task (L2): search for a product, select a specific SKU and quantity,
add to cart.
"""
from __future__ import annotations

import random
from typing import Any

from bench_env.task.taobao.app import (
    Taobao, TAOBAO_CART_CHANGES,
    SEARCH_QUERIES,
)
from bench_env.task.base import BaseTask
from bench_env.task.judge import JudgeInput


def _sku_attrs_text(sku: dict) -> str:
    """Build human-readable SKU attributes text."""
    attrs = sku.get("attributes", {})
    if not attrs:
        return "默认规格"
    return " ".join(f"{v}" for v in attrs.values())


def _sample_product_sku_for_cart(env_state: dict, rng: random.Random) -> dict:
    """
    Pick a product + SKU + query for adding to cart.
    The product should not already be in the cart.
    """
    taobao_state = env_state.get("apps", {}).get("taobao", {})
    taobao = Taobao(taobao_state)

    # IDs already in cart
    cart_sku_ids = {ci.get("skuId") for ci in taobao.cart}

    # Find an enabled product not in cart, with at least one enabled SKU in stock
    candidates = []
    for p in taobao.products.values():
        if not p.get("enabled", True):
            continue
        if any(ci.get("productId") == p["id"] for ci in taobao.cart):
            continue
        skus = taobao.get_product_skus(p["id"])
        good_skus = [
            s for s in skus
            if s.get("enabled", True) and s.get("stock", 0) > 0 and s["id"] not in cart_sku_ids
        ]
        if good_skus:
            candidates.append((p, good_skus))

    if candidates:
        product, good_skus = rng.choice(candidates)
        sku = rng.choice(good_skus)
        # Find a query that matches this product title
        query = product.get("title", "")[:2]
        return {
            "product_id": product["id"],
            "product_title": product.get("title", ""),
            "sku_id": sku["id"],
            "query": query,
        }

    # Fallback: use p3 (Sony WH-1000XM5) which isn't in cart by default
    return {
        "product_id": "p3",
        "product_title": "Sony WH-1000XM5 无线降噪耳机",
        "sku_id": "sku_p3_black",
        "query": "Sony",
    }


class AddSpecificSkuToCart(BaseTask):
    """Search, find product, select SKU, set quantity, add to cart."""

    templates = [
        '搜索"{query}"，找到商品「{product_title}」，选择{sku_attrs_text}，数量{quantity}件，加入购物车',
    ]
    apps = ["taobao"]
    scope = "S2"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["search", "nav", "cart"]
    max_steps = 30

    parameters = {
        "_product_sku": {
            "sampler": _sample_product_sku_for_cart,
            "fields": {
                "product_id": "product_id",
                "product_title": "product_title",
                "sku_id": "sku_id",
                "query": "query",
            },
        },
        "product_id": {
            "type": "string",
            "default": "p3",
        },
        "product_title": {
            "type": "string",
            "default": "Sony WH-1000XM5 无线降噪耳机",
        },
        "sku_id": {
            "type": "string",
            "default": "sku_p3_black",
        },
        "query": {
            "type": "string",
            "default": "Sony",
        },
        "quantity": {
            "type": "int",
            "min": 1,
            "max": 3,
            "default": 1,
        },
    }

    expected_changes = [
        *TAOBAO_CART_CHANGES,
        "openedProductIds",
        "recentlyViewed",
        "search.current",
        "search.history",
    ]

    # -----------------------------------------------------------------
    # Post-sample: resolve display-only params
    # -----------------------------------------------------------------

    async def _post_sample(self, env: Any) -> None:
        """Resolve sku_attrs_text after sampling."""
        state = await env.get_state()
        taobao_state = state.get("apps", {}).get("taobao", {})
        sku = taobao_state.get("skus", {}).get(self.p.sku_id, {})
        self.params["sku_attrs_text"] = _sku_attrs_text(sku)

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        taobao = Taobao(input.apps.get("taobao", {}))
        taobao_init = Taobao(input.apps_init.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        # 1. Product was opened
        opened = taobao.check_product_opened(self.p.product_id)
        checks.append({
            "field": "product.opened",
            "expected": True,
            "actual": opened,
            "passed": opened,
        })

        # 2. Cart contains the target SKU with correct quantity and unit price
        cart_item = taobao.get_cart_item_by_sku(self.p.sku_id)
        sku = taobao_init.get_sku(self.p.sku_id)  # price from init
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

            price_ok = cart_item.get("unitPrice") == expected_price
            checks.append({
                "field": "cart.item_unit_price",
                "expected": expected_price,
                "actual": cart_item.get("unitPrice"),
                "passed": price_ok,
            })

        # 3. Non-target cart items are unchanged (same count as init, ignoring the new item)
        init_cart_count = len(taobao_init.cart)
        init_cart_ids = {ci["id"] for ci in taobao_init.cart}
        curr_non_target = [ci for ci in taobao.cart if ci["id"] in init_cart_ids]
        unchanged = all(
            any(
                ci_init.get("quantity") == ci_curr.get("quantity")
                and ci_init.get("selected") == ci_curr.get("selected")
                and ci_init.get("unitPrice") == ci_curr.get("unitPrice")
                for ci_init in taobao_init.cart
                if ci_init["id"] == ci_curr["id"]
            )
            for ci_curr in curr_non_target
        )
        checks.append({
            "field": "cart.other_items_unchanged",
            "expected": True,
            "actual": unchanged,
            "passed": unchanged,
        })

        return checks
