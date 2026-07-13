"""
从购物车中删除一个指定商品，不影响其他商品。

Operate task (L3): remove one cart item without affecting other items
or SKU stock.
"""
from __future__ import annotations

import random
from typing import Any

from bench_env.task.taobao.app import (
    Taobao, TAOBAO_CART_CHANGES,
)
from bench_env.task.base import BaseTask
from bench_env.task.judge import JudgeInput


def _cart_item_desc(taobao: Taobao, cart_item: dict) -> str:
    """Build a human-readable description for a cart item."""
    product = taobao.get_product(cart_item.get("productId", ""))
    title = product.get("title", "") if product else ""
    sku = taobao.get_sku(cart_item.get("skuId", ""))
    if sku:
        attrs = sku.get("attributes", {})
        if attrs:
            return f"{title} ({' '.join(str(v) for v in attrs.values())})"
    return title or cart_item.get("id", "")


def _sample_cart_item_to_remove(env_state: dict, rng: random.Random) -> dict:
    """
    Pick a cart item with stock > 0 (so it won't be auto-removed by the system).
    Returns target_cart_item_id.
    """
    taobao_state = env_state.get("apps", {}).get("taobao", {})
    taobao = Taobao(taobao_state)

    cart = taobao.cart
    candidates = []
    for ci in cart:
        sku = taobao.get_sku(ci["skuId"])
        if sku and sku.get("stock", 0) > 0:
            candidates.append(ci)

    if not candidates:
        return {"target_cart_item_id": "ci1"}

    chosen = rng.choice(candidates)
    return {"target_cart_item_id": chosen["id"]}


class RemoveOneCartItemWithoutAffectingOthers(BaseTask):
    """Remove one specific cart item without affecting other cart items."""

    templates = [
        '在购物车中，把{target_desc}删除，不要影响购物车中其他商品',
    ]
    apps = ["taobao"]
    scope = "S2"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["nav", "cart"]
    max_steps = 30

    parameters = {
        "_cart_item": {
            "sampler": _sample_cart_item_to_remove,
            "fields": {
                "target_cart_item_id": "target_cart_item_id",
            },
        },
        "target_cart_item_id": {
            "type": "string",
            "default": "ci1",
        },
        "target_desc": {
            "type": "string",
            "default": "",
        },
    }

    expected_changes = TAOBAO_CART_CHANGES

    optimal_paths: list[list[Any]] = [
        [
            "tab.cart",
            {"id": "cart.item.delete", "params": {"id": "{target_cart_item_id}"}},
        ],
    ]

    # -----------------------------------------------------------------
    # Post-sample: resolve display-only params
    # -----------------------------------------------------------------

    async def _post_sample(self, env: Any) -> None:
        """Resolve target description after sampling."""
        state = await env.get_state()
        taobao_state = state.get("apps", {}).get("taobao", {})
        taobao = Taobao(taobao_state)

        ci = taobao.get_cart_item(self.p.target_cart_item_id)
        self.params["target_desc"] = (
            _cart_item_desc(taobao, ci) if ci else self.p.target_cart_item_id
        )

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        init = Taobao(input.apps_init.get("taobao", {}))
        taobao = Taobao(input.apps.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        # Get target SKU ID from init state
        target_init = init.get_cart_item(self.p.target_cart_item_id)
        target_sku_id = target_init.get("skuId", "") if target_init else ""

        # 1. Target cart item no longer exists in cart
        target_removed = taobao.get_cart_item(self.p.target_cart_item_id) is None
        checks.append({
            "field": "cart.target_removed",
            "expected": True,
            "actual": target_removed,
            "passed": target_removed,
        })

        # 2. All initial cart items (except target) still exist with same properties
        items_unchanged = True
        for ci_init in init.cart:
            if ci_init["id"] == self.p.target_cart_item_id:
                continue
            ci_curr = taobao.get_cart_item(ci_init["id"])
            if ci_curr is None:
                items_unchanged = False
                continue
            if (ci_init.get("quantity") != ci_curr.get("quantity")
                    or ci_init.get("selected") != ci_curr.get("selected")
                    or ci_init.get("unitPrice") != ci_curr.get("unitPrice")
                    or ci_init.get("productId") != ci_curr.get("productId")
                    or ci_init.get("skuId") != ci_curr.get("skuId")):
                items_unchanged = False
        checks.append({
            "field": "cart.other_items_unchanged",
            "expected": True,
            "actual": items_unchanged,
            "passed": items_unchanged,
        })

        # 3. No new cart items added (count check)
        init_count = len(init.cart)
        curr_count = len(taobao.cart)
        count_ok = curr_count == init_count - 1
        checks.append({
            "field": "cart.count",
            "expected": init_count - 1,
            "actual": curr_count,
            "passed": count_ok,
        })

        # 4. Stock of the removed SKU is unchanged
        if target_sku_id:
            init_stock = init.get_sku_stock(target_sku_id)
            curr_stock = taobao.get_sku_stock(target_sku_id)
            stock_ok = init_stock == curr_stock
            checks.append({
                "field": "sku.stock_unchanged",
                "expected": init_stock,
                "actual": curr_stock,
                "passed": stock_ok,
            })

        return checks
