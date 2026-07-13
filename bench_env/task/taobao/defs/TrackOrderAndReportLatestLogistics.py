"""
在淘宝中查看订单的物流信息，回答快递公司和最新的物流动态。

Grounded query task (L3): the agent finds a shipped/received order with
logistics, views tracking info, reports the carrier and the latest
logistics event description.
"""
from __future__ import annotations

import random
from typing import Any

from bench_env.task.taobao.app import Taobao
from bench_env.task.common_tasks import AnswerTask, build_answer_checks
from bench_env.task.judge import JudgeInput


def _sample_order_with_logistics(env_state: dict, rng: random.Random) -> dict:
    """
    Pick an order that has a ``logisticsId`` set (shipped/delivered/received).

    Returns ``{"target_order_id": "<id>"}``.
    """
    taobao_state = env_state.get("apps", {}).get("taobao", {})
    taobao = Taobao(taobao_state)

    candidates = [o for o in taobao.orders if o.get("logisticsId")]
    if not candidates:
        return {"target_order_id": "o1"}

    order = rng.choice(candidates)
    return {"target_order_id": order["id"]}


class TrackOrderAndReportLatestLogistics(AnswerTask):
    """
    Find a shipped/received order with logistics, view tracking info,
    report the carrier and the latest logistics event.
    """

    templates = [
        '在淘宝中查看订单「{order_desc}」的物流信息，回答快递公司和最新的物流动态是什么',
    ]
    apps = ["taobao"]
    scope = "S2"
    objective = "query"
    composition = "deep_dive"
    difficulty = "L3"
    capabilities = ["nav", "extract"]
    max_steps = 30

    parameters = {
        "_target_order": {
            "sampler": _sample_order_with_logistics,
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

    expected_changes: list[str] = []

    answer_fields = [
        {"type": "text", "label": "快递公司"},
        {"type": "text", "label": "最新物流动态"},
    ]

    # -----------------------------------------------------------------
    # Post-sample: resolve display-only params
    # -----------------------------------------------------------------

    async def _post_sample(self, env: Any) -> None:
        """Resolve ``order_desc`` for template rendering."""
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
        else:
            self.params["order_desc"] = self.p.target_order_id

    # -----------------------------------------------------------------
    # Answer (ground truth)
    # -----------------------------------------------------------------

    def get_answer(self, input: JudgeInput) -> Any:
        """Return the carrier and latest logistics event description."""
        taobao_init = Taobao(input.apps_init.get("taobao", {}))
        order = taobao_init.get_order(self.p.target_order_id)
        if not order:
            return {"快递公司": "", "最新物流动态": ""}

        log_id = order.get("logisticsId")
        if not log_id:
            return {"快递公司": "", "最新物流动态": ""}

        logistics = taobao_init.get_logistics(log_id)
        if not logistics:
            return {"快递公司": "", "最新物流动态": ""}

        events = logistics.get("events", [])
        latest = events[-1] if events else {}
        return {
            "快递公司": logistics.get("carrier", ""),
            "最新物流动态": latest.get("description", ""),
        }

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        taobao = Taobao(input.apps.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        # 1. The target order exists and has a logisticsId
        order = taobao.get_order(self.p.target_order_id)
        checks.append({
            "field": "order.exists",
            "expected": True,
            "actual": order is not None,
            "passed": order is not None,
        })

        if order:
            log_id = order.get("logisticsId")
            checks.append({
                "field": "order.logisticsId",
                "expected": "non-null",
                "actual": log_id,
                "passed": bool(log_id),
            })

            # 2. The logistics object exists for that logisticsId
            if log_id:
                logistics = taobao.get_logistics(log_id)
                checks.append({
                    "field": "logistics.exists",
                    "expected": True,
                    "actual": logistics is not None,
                    "passed": logistics is not None,
                })

        # 3. Answer matches expected (carrier + latest event)
        expected = self.get_answer(input)
        checks.extend(build_answer_checks(expected, input.answer))

        return checks
