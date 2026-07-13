"""
对订单中的特定商品申请退款。

Operate task (L4): initiate a refund for a specific item in an order
without creating duplicate refunds.
"""
from __future__ import annotations

import random
from typing import Any

from bench_env.task.taobao.app import (
    Taobao,
    TAOBAO_REFUND_CHANGES,
    REFUND_REASONS,
)
from bench_env.task.base import BaseTask
from bench_env.task.judge import JudgeInput


def _sample_refundable_item(env_state: dict, rng: random.Random) -> dict:
    """Pick a refundable order item and a reason for refund."""
    taobao_state = env_state.get("apps", {}).get("taobao", {})
    taobao = Taobao(taobao_state)

    refundable_statuses = {"received", "shipped", "paid", "pending"}
    for order in taobao.orders:
        if order.get("status") not in refundable_statuses:
            continue
        for item in order.get("items", []):
            if item.get("refundStatus") is None and item.get("reviewId") is None:
                reason = rng.choice(REFUND_REASONS)
                return {
                    "target_order_id": order["id"],
                    "target_order_item_id": item["id"],
                    "refund_reason": reason,
                }

    return {
        "target_order_id": "o1",
        "target_order_item_id": "oi2",
        "refund_reason": "不喜欢/不想要",
    }


class RequestRefundForSpecificOrderItem(BaseTask):
    """Initiate a refund for a specific item in an order."""

    templates = [
        '在淘宝中对订单「{order_desc}」中的一件商品申请退款，退款原因为：{refund_reason}。注意不要重复申请',
    ]
    apps = ["taobao"]
    scope = "S3"
    objective = "operate"
    composition = "atomic"
    difficulty = "L4"
    capabilities = ["nav", "create", "form_fill"]
    max_steps = 45

    parameters = {
        "_refundable_item": {
            "sampler": _sample_refundable_item,
            "fields": {
                "target_order_id": "target_order_id",
                "target_order_item_id": "target_order_item_id",
                "refund_reason": "refund_reason",
            },
        },
        "target_order_id": {
            "type": "string",
            "default": "o1",
            "description": "目标订单ID",
        },
        "target_order_item_id": {
            "type": "string",
            "default": "oi2",
            "description": "目标订单商品项ID",
        },
        "refund_reason": {
            "type": "string",
            "default": "不喜欢/不想要",
            "description": "退款原因",
        },
        "order_desc": {
            "type": "string",
            "default": "",
            "description": "订单描述（模板用）",
        },
    }

    expected_changes = TAOBAO_REFUND_CHANGES

    # -----------------------------------------------------------------
    # Post-sample: resolve display-only params
    # -----------------------------------------------------------------

    async def _post_sample(self, env: Any) -> None:
        """Resolve order_desc and verify item is still refundable."""
        state = await env.get_state()
        taobao_state = state.get("apps", {}).get("taobao", {})
        taobao = Taobao(taobao_state)

        order = taobao.get_order(self.p.target_order_id)
        if order:
            self.params["order_desc"] = f"订单{order.get('id', '')}"

        # If the target item already has a refund, override reason
        for o in taobao.orders:
            for item in o.get("items", []):
                if item["id"] == self.p.target_order_item_id:
                    if item.get("refundStatus") is not None:
                        self.params["refund_reason"] = "商品与描述不符"

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        init_taobao = Taobao(input.apps_init.get("taobao", {}))
        taobao = Taobao(input.apps.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        # Compute new refund requests from initial state
        init_refund_ids = {r["id"] for r in init_taobao.refund_requests}
        new_refunds = [
            r for r in taobao.refund_requests if r.get("id") not in init_refund_ids
        ]

        # 6. No duplicate refund — exactly 1 new refund request
        dup_ok = len(new_refunds) == 1
        checks.append({
            "field": "refund.unique",
            "expected": "Exactly 1 new refund request",
            "actual": f"{len(new_refunds)} new refund request(s) found",
            "passed": dup_ok,
        })

        if new_refunds:
            refund = new_refunds[0]

            # 1. A new refund request was created
            checks.append({
                "field": "refund.created",
                "expected": "A new refund request exists",
                "actual": f"Found refund id={refund.get('id', 'N/A')}",
                "passed": True,
            })

            # 2. The new refund request references target_order_id and target_order_item_id
            order_match = refund.get("orderId") == self.p.target_order_id
            item_match = refund.get("orderItemId") == self.p.target_order_item_id
            checks.append({
                "field": "refund.reference",
                "expected": (
                    f"orderId={self.p.target_order_id}, "
                    f"orderItemId={self.p.target_order_item_id}"
                ),
                "actual": (
                    f"orderId={refund.get('orderId')}, "
                    f"orderItemId={refund.get('orderItemId')}"
                ),
                "passed": order_match and item_match,
            })

            # 3. The refund request has a non-empty reason
            reason_ok = bool(refund.get("reason"))
            checks.append({
                "field": "refund.reason",
                "expected": "non-empty reason",
                "actual": f"reason={refund.get('reason')}",
                "passed": reason_ok,
            })

            # 4. The refund request has a valid status (e.g., "pending")
            status_ok = refund.get("status") in ("pending", "approved", "processing")
            checks.append({
                "field": "refund.status",
                "expected": "pending / approved / processing",
                "actual": f"status={refund.get('status')}",
                "passed": status_ok,
            })

            # 5. The order item's refundStatus is now set (not None)
            order = taobao.get_order(self.p.target_order_id)
            item_refund_set = False
            if order:
                for item in order.get("items", []):
                    if item.get("id") == self.p.target_order_item_id:
                        item_refund_set = item.get("refundStatus") is not None
                        break
            checks.append({
                "field": "order_item.refundStatus",
                "expected": "refundStatus should be set (not None)",
                "actual": (
                    f"refundStatus is set: {item_refund_set}"
                ),
                "passed": item_refund_set,
            })
        else:
            checks.append({
                "field": "refund.created",
                "expected": "A new refund request exists",
                "actual": "No new refund request found",
                "passed": False,
            })

        return checks
