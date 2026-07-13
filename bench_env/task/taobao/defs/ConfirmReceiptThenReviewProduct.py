"""
确认收货并评价商品。

Hybrid operate task (L4): confirm receipt of a shipped order, then write a
review for one of the products in the order.
"""
from __future__ import annotations

import random
from typing import Any

from bench_env.task.taobao.app import (
    Taobao,
    TAOBAO_ORDER_CHANGES,
    TAOBAO_REVIEW_CHANGES,
)
from bench_env.task.base import BaseTask
from bench_env.task.judge import JudgeInput


def _sample_shipped_order(env_state: dict, rng: random.Random) -> dict:
    """Pick a shipped order with a reviewable item."""
    taobao_state = env_state.get("apps", {}).get("taobao", {})
    taobao = Taobao(taobao_state)

    shipped = [o for o in taobao.orders if o.get("status") == "shipped"]
    for order in shipped:
        items = order.get("items", [])
        reviewable = [it for it in items if not it.get("reviewId")]
        if reviewable:
            item = rng.choice(reviewable)
            return {
                "target_order_id": order["id"],
                "target_order_item_id": item["id"],
                "expected_rating": rng.choice([3, 4, 5]),
            }

    return {"target_order_id": "o1", "target_order_item_id": "oi1", "expected_rating": 5}


class ConfirmReceiptThenReviewProduct(BaseTask):
    """Confirm receipt of a shipped order, then review one of its products."""

    templates = [
        '在淘宝中确认收货订单「{order_desc}」，对该订单中的商品进行评价（评分不低于{expected_rating}星）',
    ]
    apps = ["taobao"]
    scope = "S3"
    objective = "hybrid"
    composition = "sequential"
    difficulty = "L4"
    capabilities = ["nav", "create", "form_fill"]
    max_steps = 45

    parameters = {
        "_shipped_order": {
            "sampler": _sample_shipped_order,
            "fields": {
                "target_order_id": "target_order_id",
                "target_order_item_id": "target_order_item_id",
                "expected_rating": "expected_rating",
            },
        },
        "target_order_id": {
            "type": "string",
            "default": "o1",
            "description": "目标订单ID",
        },
        "target_order_item_id": {
            "type": "string",
            "default": "oi1",
            "description": "目标订单商品项ID",
        },
        "expected_rating": {
            "type": "int",
            "min": 1,
            "max": 5,
            "default": 5,
            "description": "期望最低评分",
        },
        "order_desc": {
            "type": "string",
            "default": "",
            "description": "订单描述（模板用）",
        },
    }

    expected_changes = TAOBAO_ORDER_CHANGES + TAOBAO_REVIEW_CHANGES

    # -----------------------------------------------------------------
    # Post-sample: resolve display-only params
    # -----------------------------------------------------------------

    async def _post_sample(self, env: Any) -> None:
        """Resolve order_desc after sampling."""
        state = await env.get_state()
        taobao_state = state.get("apps", {}).get("taobao", {})
        taobao = Taobao(taobao_state)

        order = taobao.get_order(self.p.target_order_id)
        if order:
            self.params["order_desc"] = (
                f"订单{order.get('id', '')} ({order.get('status', '')})"
            )

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        init_taobao = Taobao(input.apps_init.get("taobao", {}))
        taobao = Taobao(input.apps.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        order = taobao.get_order(self.p.target_order_id)

        # 1. Target order's status changed from "shipped" to "received"
        if order:
            status_ok = order.get("status") == "received"
            checks.append({
                "field": "order.status",
                "expected": "received",
                "actual": order.get("status"),
                "passed": status_ok,
            })
        else:
            checks.append({
                "field": "order.status",
                "expected": "received",
                "actual": "order not found",
                "passed": False,
            })

        # 2. Target order has receivedAt timestamp set
        if order:
            received_at_ok = bool(order.get("receivedAt"))
            checks.append({
                "field": "order.receivedAt",
                "expected": "non-empty timestamp",
                "actual": str(order.get("receivedAt", "")),
                "passed": received_at_ok,
            })

        # ---- New review checks ----
        init_review_ids = {r["id"] for r in init_taobao.reviews}
        new_review = taobao.find_new_review(init_review_ids)

        # 3. A new review was created
        review_created = new_review is not None
        checks.append({
            "field": "review.created",
            "expected": "A new review was created",
            "actual": (
                f"Found review id={new_review.get('id', 'N/A')}"
                if new_review
                else "No new review found"
            ),
            "passed": review_created,
        })

        if new_review:
            # 4. The new review is associated with the target order item
            item_match = new_review.get("orderItemId") == self.p.target_order_item_id
            order_match = new_review.get("orderId") == self.p.target_order_id
            checks.append({
                "field": "review.association",
                "expected": (
                    f"orderItemId={self.p.target_order_item_id}"
                ),
                "actual": (
                    f"orderItemId={new_review.get('orderItemId')}, "
                    f"orderId={new_review.get('orderId')}"
                ),
                "passed": item_match or order_match,
            })

            # 5. The new review has a rating >= expected_rating
            rating_ok = new_review.get("rating", 0) >= self.p.expected_rating
            checks.append({
                "field": "review.rating",
                "expected": f">= {self.p.expected_rating}",
                "actual": str(new_review.get("rating", 0)),
                "passed": rating_ok,
            })

            # 6. The target order item's reviewId is set to the new review's ID
            item = None
            if order:
                for it in order.get("items", []):
                    if it.get("id") == self.p.target_order_item_id:
                        item = it
                        break
            if item:
                review_id_match = item.get("reviewId") == new_review.get("id")
                checks.append({
                    "field": "order_item.reviewId",
                    "expected": f"reviewId={new_review.get('id')}",
                    "actual": f"reviewId={item.get('reviewId')}",
                    "passed": review_id_match,
                })
            else:
                checks.append({
                    "field": "order_item.reviewId",
                    "expected": f"reviewId={new_review.get('id')}",
                    "actual": "order item not found",
                    "passed": False,
                })

            # 7. The review has non-empty content and a rating
            content_ok = bool(new_review.get("content"))
            checks.append({
                "field": "review.content",
                "expected": "non-empty content",
                "actual": (
                    f"content length={len(new_review.get('content', ''))}"
                    if new_review.get("content")
                    else "empty"
                ),
                "passed": content_ok,
            })

        return checks
