"""
打开商品详情页，选择SKU规格，回答该规格的单价。

Grounded query task (L3): open a product detail, select a specific SKU,
report its unit price.
"""
from __future__ import annotations

import random
from typing import Any

from bench_env.task.taobao.app import (
    Taobao,
    SEARCH_QUERIES,
)
from bench_env.task.common_tasks import AnswerTask, build_answer_checks
from bench_env.task.judge import JudgeInput


def _sku_attrs_text(sku: dict) -> str:
    """Build human-readable SKU attributes text, e.g. '256GB 黑色'."""
    attrs = sku.get("attributes", {})
    if not attrs:
        return "默认规格"
    return " ".join(f"{v}" for v in attrs.values())


def _sample_product_and_sku(env_state: dict, rng: random.Random) -> dict:
    """
    Pick a product with at least one enabled SKU, then pick one SKU.
    Returns {"product_id": ..., "product_title": ..., "sku_id": ...}.
    """
    taobao_state = env_state.get("apps", {}).get("taobao", {})
    taobao = Taobao(taobao_state)

    enabled_products = [p for p in taobao.products.values() if p.get("enabled", True)]
    # Filter to products that have at least one enabled SKU
    candidates = []
    for p in enabled_products:
        skus = taobao.get_product_skus(p["id"])
        enabled_skus = [s for s in skus if s.get("enabled", True)]
        if enabled_skus:
            candidates.append((p, enabled_skus))

    if not candidates:
        return {
            "product_id": "p7",
            "product_title": "兰蔻小黑瓶精华肌底液50ml",
            "sku_id": "sku_p7_50ml",
        }

    product, available_skus = rng.choice(candidates)
    sku = rng.choice(available_skus)
    return {
        "product_id": product["id"],
        "product_title": product.get("title", ""),
        "sku_id": sku["id"],
    }


class SelectSkuAndReportUnitPrice(AnswerTask):
    """Select a SKU on a product detail page and report its unit price."""

    templates = [
        '打开商品「{product_title}」的详情页，选择{sku_attrs_text}，查看并回答该规格的单价是多少元',
    ]
    apps = ["taobao"]
    scope = "S2"
    objective = "query"
    composition = "deep_dive"
    difficulty = "L3"
    capabilities = ["nav", "extract"]
    max_steps = 30

    parameters = {
        "_product_sku": {
            "sampler": _sample_product_and_sku,
            "fields": {
                "product_id": "product_id",
                "product_title": "product_title",
                "sku_id": "sku_id",
            },
        },
        "product_id": {
            "type": "string",
            "default": "p7",
        },
        "product_title": {
            "type": "string",
            "default": "兰蔻小黑瓶精华肌底液50ml",
        },
        "sku_id": {
            "type": "string",
            "default": "sku_p7_50ml",
        },
    }

    expected_changes = [
        "openedProductIds",
        "recentlyViewed",
    ]

    answer_fields = [
        {"type": "number", "label": "单价(元)"},
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
    # Answer (ground truth)
    # -----------------------------------------------------------------

    def get_answer(self, input: JudgeInput) -> Any:
        """Read SKU price from initial state."""
        taobao_init = Taobao(input.apps_init.get("taobao", {}))
        price = taobao_init.get_sku_price(self.p.sku_id)
        return price

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        taobao = Taobao(input.apps.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        # 1. Product detail page was opened
        opened = taobao.check_product_opened(self.p.product_id)
        checks.append({
            "field": "product.opened",
            "expected": True,
            "actual": opened,
            "passed": opened,
        })

        # 2. Answer check (SKU price)
        expected = self.get_answer(input)
        checks.extend(build_answer_checks(expected, input.answer))

        return checks
