"""
在购物车中，选择特定商品，取消其他商品，修改数量，然后去结算预览。

Operate task (L3): update cart item selection states and quantity,
then go to checkout preview.
"""
from __future__ import annotations

import random
from typing import Any

from bench_env.task.taobao.app import (
    Taobao, TAOBAO_CART_CHANGES, TAOBAO_CHECKOUT_CHANGES,
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


def _sample_two_cart_items(env_state: dict, rng: random.Random) -> dict:
    """
    Pick two cart items with stock > 1 for the selection task.
    Returns target_item_a_id, target_item_b_id, quantity_a.
    """
    taobao_state = env_state.get("apps", {}).get("taobao", {})
    taobao = Taobao(taobao_state)

    cart = taobao.cart
    if len(cart) < 2:
        return {"target_item_a_id": "ci1", "target_item_b_id": "ci2", "quantity_a": 2}

    # Filter to items whose SKU has stock > 1
    candidates = []
    for ci in cart:
        sku = taobao.get_sku(ci["skuId"])
        if sku and sku.get("stock", 0) > 1:
            candidates.append(ci)

    if len(candidates) < 2:
        return {"target_item_a_id": "ci1", "target_item_b_id": "ci2", "quantity_a": 2}

    chosen = rng.sample(candidates, 2)
    item_a = chosen[0]

    # Choose a quantity for item A different from its current quantity,
    # up to min(3, stock)
    current_qty = item_a.get("quantity", 1)
    sku_a = taobao.get_sku(item_a["skuId"])
    max_qty = min(3, sku_a.get("stock", 3)) if sku_a else 3
    possible_qty = [q for q in range(1, max_qty + 1) if q != current_qty]
    new_qty = rng.choice(possible_qty) if possible_qty else max_qty

    return {
        "target_item_a_id": item_a["id"],
        "target_item_b_id": chosen[1]["id"],
        "quantity_a": new_qty,
    }


class UpdateCartSelectionAndQuantity(BaseTask):
    """Select two specific cart items, deselect others, change quantity of one, go to checkout."""

    templates = [
        '在购物车中，只勾选商品A({target_a_desc})和商品B({target_b_desc})，取消其他商品的勾选，把商品A的数量改为{quantity_a}件，去结算预览确认',
    ]
    apps = ["taobao"]
    scope = "S2"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["nav", "cart", "checkout"]
    max_steps = 30

    parameters = {
        "_cart_items": {
            "sampler": _sample_two_cart_items,
            "fields": {
                "target_item_a_id": "target_item_a_id",
                "target_item_b_id": "target_item_b_id",
                "quantity_a": "quantity_a",
            },
        },
        "target_item_a_id": {
            "type": "string",
            "default": "ci1",
        },
        "target_item_b_id": {
            "type": "string",
            "default": "ci2",
        },
        "quantity_a": {
            "type": "int",
            "min": 1,
            "max": 3,
            "default": 2,
        },
        "target_a_desc": {
            "type": "string",
            "default": "",
        },
        "target_b_desc": {
            "type": "string",
            "default": "",
        },
    }

    expected_changes = TAOBAO_CART_CHANGES + TAOBAO_CHECKOUT_CHANGES

    optimal_paths: list[list[Any]] = [
        [
            "tab.cart",
            "cart.item.select.toggle",
            {"id": "cart.item.select.toggle", "params": {"id": "{target_item_a_id}"}},
            {"id": "cart.item.select.toggle", "params": {"id": "{target_item_b_id}"}},
            {"id": "cart.item.quantity.change", "params": {"id": "{target_item_a_id}"}},
            "cart.checkout",
            "checkout.base",
        ],
    ]

    # -----------------------------------------------------------------
    # Post-sample: resolve display-only params
    # -----------------------------------------------------------------

    async def _post_sample(self, env: Any) -> None:
        """Resolve target descriptions after sampling."""
        state = await env.get_state()
        taobao_state = state.get("apps", {}).get("taobao", {})
        taobao = Taobao(taobao_state)

        ci_a = taobao.get_cart_item(self.p.target_item_a_id)
        ci_b = taobao.get_cart_item(self.p.target_item_b_id)

        self.params["target_a_desc"] = (
            _cart_item_desc(taobao, ci_a) if ci_a else self.p.target_item_a_id
        )
        self.params["target_b_desc"] = (
            _cart_item_desc(taobao, ci_b) if ci_b else self.p.target_item_b_id
        )

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        init = Taobao(input.apps_init.get("taobao", {}))
        taobao = Taobao(input.apps.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        target_ids = {self.p.target_item_a_id, self.p.target_item_b_id}

        # 1. Target item A exists in cart, is selected, quantity matches
        ci_a = taobao.get_cart_item(self.p.target_item_a_id)
        if ci_a is not None:
            checks.append({
                "field": "cart.target_a.exists",
                "expected": True,
                "actual": True,
                "passed": True,
            })
            selected_a = ci_a.get("selected", False)
            checks.append({
                "field": "cart.target_a.selected",
                "expected": True,
                "actual": selected_a,
                "passed": selected_a,
            })
            qty_a_ok = ci_a.get("quantity") == self.p.quantity_a
            checks.append({
                "field": "cart.target_a.quantity",
                "expected": self.p.quantity_a,
                "actual": ci_a.get("quantity"),
                "passed": qty_a_ok,
            })
        else:
            checks.append({
                "field": "cart.target_a.exists",
                "expected": True,
                "actual": False,
                "passed": False,
            })

        # 2. Target item B exists in cart, is selected
        ci_b = taobao.get_cart_item(self.p.target_item_b_id)
        if ci_b is not None:
            checks.append({
                "field": "cart.target_b.exists",
                "expected": True,
                "actual": True,
                "passed": True,
            })
            selected_b = ci_b.get("selected", False)
            checks.append({
                "field": "cart.target_b.selected",
                "expected": True,
                "actual": selected_b,
                "passed": selected_b,
            })
        else:
            checks.append({
                "field": "cart.target_b.exists",
                "expected": True,
                "actual": False,
                "passed": False,
            })

        # 3. All non-target items are deselected
        non_target_deselected = all(
            not ci.get("selected", False)
            for ci in taobao.cart
            if ci["id"] not in target_ids
        )
        checks.append({
            "field": "cart.non_target_deselected",
            "expected": True,
            "actual": non_target_deselected,
            "passed": non_target_deselected,
        })

        # 4. Non-target items unchanged in quantity and unitPrice
        items_unchanged = True
        for ci_init in init.cart:
            if ci_init["id"] in target_ids:
                continue
            ci_curr = taobao.get_cart_item(ci_init["id"])
            if ci_curr is None:
                items_unchanged = False
                break
            if (ci_init.get("quantity") != ci_curr.get("quantity")
                    or ci_init.get("unitPrice") != ci_curr.get("unitPrice")):
                items_unchanged = False
                break
        checks.append({
            "field": "cart.other_items_unchanged",
            "expected": True,
            "actual": items_unchanged,
            "passed": items_unchanged,
        })

        # 5. Checkout draft contains both target item IDs
        draft = taobao.checkout_draft
        draft_items = draft.get("items", []) if draft else []
        draft_cart_ids = {
            item.get("cartItemId")
            for item in draft_items
            if item.get("cartItemId")
        }
        contains_a = self.p.target_item_a_id in draft_cart_ids
        contains_b = self.p.target_item_b_id in draft_cart_ids
        checks.append({
            "field": "checkout.contains_target_a",
            "expected": True,
            "actual": contains_a,
            "passed": contains_a,
        })
        checks.append({
            "field": "checkout.contains_target_b",
            "expected": True,
            "actual": contains_b,
            "passed": contains_b,
        })

        # 6. Checkout draft only contains target items
        only_targets = len(draft_items) > 0 and draft_cart_ids == target_ids
        checks.append({
            "field": "checkout.only_targets",
            "expected": True,
            "actual": only_targets,
            "passed": only_targets,
        })

        return checks
