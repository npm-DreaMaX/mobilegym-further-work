"""
Cancel an unshipped order in Taobao and verify stock/coupon restoration.

Operate task (L4): the agent cancels an unshipped order.
Expect order status changes to 'cancelled', stock is restored,
coupon is restored, other orders intact.
"""
from __future__ import annotations

import random
from typing import Any

from bench_env.task.taobao.app import (
    Taobao,
    TAOBAO_ORDER_CHANGES,
    TAOBAO_COUPON_CHANGES,
)
from bench_env.task.base import BaseTask
from bench_env.task.judge import JudgeInput


def _sample_unshipped_order(env_state: dict, rng: random.Random) -> dict:
    """
    Pick an unshipped order (pending_payment / to_ship) randomly.

    Returns ``{"target_order_id": "<id>"}``.
    """
    taobao_state = env_state.get("apps", {}).get("taobao", {})
    taobao = Taobao(taobao_state)

    cancellable = [
        o for o in taobao.orders
        if o.get("status") in ("pending_payment", "to_ship")
    ]
    if not cancellable:
        return {"target_order_id": "o1"}

    order = rng.choice(cancellable)
    return {"target_order_id": order["id"]}


class CancelUnshippedOrderAndRestoreState(BaseTask):
    """Cancel an unshipped order and verify stock / coupon restoration."""

    templates = [
        '在淘宝中取消订单「{order_desc}」，取消后确认该订单已取消，且商品库存恢复',
    ]
    apps = ["taobao"]
    scope = "S2"
    objective = "operate"
    composition = "atomic"
    difficulty = "L4"
    capabilities = ["nav", "cancel"]
    max_steps = 30

    parameters = {
        "_target_order": {
            "sampler": _sample_unshipped_order,
            "fields": {
                "target_order_id": "target_order_id",
            },
        },
        "target_order_id": {
            "type": "string",
            "default": "o1",
        },
        "order_desc": {
            "type": "string",
            "default": "",
        },
    }

    expected_changes = TAOBAO_ORDER_CHANGES + TAOBAO_COUPON_CHANGES

    # -----------------------------------------------------------------
    # Post-sample: resolve display-only params and save initial state
    # -----------------------------------------------------------------

    async def _post_sample(self, env: Any) -> None:
        """Resolve ``order_desc`` and save initial SKU stocks."""
        state = await env.get_state()
        taobao_state = state.get("apps", {}).get("taobao", {})
        taobao = Taobao(taobao_state)
        order = taobao.get_order(self.p.target_order_id)

        if order:
            items = order.get("items", [])
            if items:
                titles = [it.get("productTitle", "") for it in items]
                self.params["order_desc"] = " ".join(titles)
            else:
                self.params["order_desc"] = order.get("id", self.p.target_order_id)

            # Save initial SKU stock levels (before cancellation) so that
            # stock restoration can be verified precisely.
            sku_stocks: dict[str, dict[str, int]] = {}
            for item in items:
                sku_id = item.get("skuId")
                qty = item.get("quantity", 0)
                sku = taobao.get_sku(sku_id)
                if sku:
                    sku_stocks[sku_id] = {
                        "stock": sku.get("stock", 0),
                        "quantity": qty,
                    }
            self.params["_init_sku_stocks"] = sku_stocks
        else:
            self.params["order_desc"] = self.p.target_order_id

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        taobao_init = Taobao(input.apps_init.get("taobao", {}))
        taobao = Taobao(input.apps.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        target_order = taobao.get_order(self.p.target_order_id)
        init_order = taobao_init.get_order(self.p.target_order_id)

        # 1. Target order exists and its status is "cancelled"
        if target_order is None:
            checks.append({
                "field": "order.exists",
                "expected": True,
                "actual": False,
                "passed": False,
            })
            return checks

        status = target_order.get("status", "")
        checks.append({
            "field": "order.status",
            "expected": "cancelled",
            "actual": status,
            "passed": status == "cancelled",
        })

        # 2. Target order has a cancelledAt timestamp set
        cancelled_at = target_order.get("cancelledAt")
        checks.append({
            "field": "order.cancelledAt",
            "expected": "non-null",
            "actual": cancelled_at,
            "passed": bool(cancelled_at),
        })

        # 3. Stock has been restored for each SKU in the order
        init_sku_stocks: dict[str, dict[str, int]] = self.params.get("_init_sku_stocks", {})
        if init_sku_stocks:
            for sku_id, info in init_sku_stocks.items():
                current_stock = taobao.get_sku_stock(sku_id)
                expected_stock = info["stock"] + info["quantity"]
                stock_ok = current_stock is not None and current_stock >= expected_stock
                checks.append({
                    "field": f"stock.{sku_id}.restored",
                    "expected": f">= {expected_stock}",
                    "actual": current_stock,
                    "passed": bool(stock_ok),
                })
        elif init_order:
            # Fallback: compare init vs current directly
            for item in init_order.get("items", []):
                sku_id = item.get("skuId")
                qty = item.get("quantity", 0)
                init_stock = taobao_init.get_sku_stock(sku_id)
                current_stock = taobao.get_sku_stock(sku_id)
                if init_stock is not None and current_stock is not None:
                    expected_stock = init_stock + qty
                    checks.append({
                        "field": f"stock.{sku_id}.restored",
                        "expected": f">= {expected_stock}",
                        "actual": current_stock,
                        "passed": current_stock >= expected_stock,
                    })

        # 4. If the order had a coupon, that coupon is now NOT used
        coupon_snapshot = target_order.get("couponSnapshot")
        if coupon_snapshot:
            coupon_id = coupon_snapshot.get("couponId")
            if coupon_id:
                is_used = taobao.is_coupon_used(coupon_id)
                checks.append({
                    "field": f"coupon.{coupon_id}.restored",
                    "expected": "not used",
                    "actual": f"used={is_used}",
                    "passed": not is_used,
                })

        # 5. Other orders (not the target) are unchanged in status and items
        for init_o in taobao_init.orders:
            if init_o["id"] == self.p.target_order_id:
                continue
            curr_o = taobao.get_order(init_o["id"])
            if curr_o is not None:
                status_unchanged = curr_o.get("status") == init_o.get("status")
                items_unchanged = curr_o.get("items") == init_o.get("items")
                unchanged = status_unchanged and items_unchanged
                if not unchanged:
                    checks.append({
                        "field": f"order.{init_o['id']}.unchanged",
                        "expected": f"status={init_o.get('status')}, items match init",
                        "actual": f"status={curr_o.get('status')}, "
                                  f"items_changed={not items_unchanged}",
                        "passed": False,
                    })

        return checks
