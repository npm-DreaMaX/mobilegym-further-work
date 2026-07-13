"""
在淘宝搜索，对比前两个商品，判断哪个更便宜且有货，回答更便宜的商品全名。

Hybrid query task (L4): search, open two product details, compare price/shipping/stock,
report which product is cheaper.
"""
from __future__ import annotations

import random
from typing import Any

from bench_env.task.taobao.app import (
    Taobao, TAOBAO_SEARCH_CHANGES,
    SEARCH_QUERIES,
)
from bench_env.task.common_tasks import AnswerTask, build_answer_checks, match_value
from bench_env.task.judge import JudgeInput


def _sample_two_products(env_state: dict, rng: random.Random) -> dict:
    """
    Pick a search query that returns at least 2 enabled products with
    different prices, and return both product IDs and the query.
    """
    taobao_state = env_state.get("apps", {}).get("taobao", {})
    taobao = Taobao(taobao_state)

    # Try each query from SEARCH_QUERIES
    for query in SEARCH_QUERIES:
        results = taobao.filter_products(query=query)
        enabled = [p for p in results if p.get("enabled", True)]
        if len(enabled) >= 2:
            # Pick 2 products with different prices
            chosen = rng.sample(enabled, min(len(enabled), 5))
            for i in range(len(chosen)):
                for j in range(i + 1, len(chosen)):
                    if chosen[i].get("price", 0) != chosen[j].get("price", 0):
                        return {
                            "query": query,
                            "product_a_id": chosen[i]["id"],
                            "product_b_id": chosen[j]["id"],
                        }
            # All same price - still use first two
            return {
                "query": query,
                "product_a_id": chosen[0]["id"],
                "product_b_id": chosen[1]["id"],
            }

    # Fallback
    return {
        "query": "三只松鼠",
        "product_a_id": "p10",
        "product_b_id": "p11",
    }


def _compute_cheaper_product(
    taobao: Taobao,
    product_a_id: str,
    product_b_id: str,
) -> str | None:
    """Compare two products and return the title of the cheaper one.

    Comparison priority:
      1. Free shipping is cheaper than non-free-shipping (all else being equal).
      2. Lower total price (product price) is cheaper.
      3. If one is out of stock for all SKUs, the other is cheaper.
    """
    product_a = taobao.get_product(product_a_id)
    product_b = taobao.get_product(product_b_id)

    if not product_a and not product_b:
        return None
    if not product_a:
        return product_b.get("title", "") if product_b else None
    if not product_b:
        return product_a.get("title", "") if product_a else None

    # Check stock availability
    skus_a = taobao.get_product_skus(product_a_id)
    skus_b = taobao.get_product_skus(product_b_id)
    a_in_stock = any(s.get("stock", 0) > 0 for s in skus_a)
    b_in_stock = any(s.get("stock", 0) > 0 for s in skus_b)

    if a_in_stock and not b_in_stock:
        return product_a.get("title", "")
    if b_in_stock and not a_in_stock:
        return product_b.get("title", "")

    # Both in stock or both out of stock — compare by price
    price_a = product_a.get("price", 0)
    price_b = product_b.get("price", 0)
    free_a = product_a.get("freeShipping", False)
    free_b = product_b.get("freeShipping", False)

    # If product A has free shipping and B doesn't (or vice versa with same price),
    # free shipping is cheaper.
    if free_a and not free_b and price_a <= price_b:
        return product_a.get("title", "")
    if free_b and not free_a and price_b <= price_a:
        return product_b.get("title", "")

    # Otherwise, cheaper by price
    if price_a < price_b:
        return product_a.get("title", "")
    return product_b.get("title", "")


class CompareTwoProductsAndReportCheaper(AnswerTask):
    """Compare two products and report which is cheaper."""

    templates = [
        '在淘宝搜索"{query}"，分别打开前两个商品「{product_a_title}」和「{product_b_title}」的详情页并选择合适的规格，结合包邮、库存和价格，判断哪个商品更便宜且有货，回答更便宜的商品全名',
    ]
    apps = ["taobao"]
    scope = "S3"
    objective = "hybrid"
    composition = "deep_dive"
    difficulty = "L4"
    capabilities = ["search", "filter", "extract", "reasoning", "compare"]
    max_steps = 45

    parameters = {
        "_two_products": {
            "sampler": _sample_two_products,
            "fields": {
                "query": "query",
                "product_a_id": "product_a_id",
                "product_b_id": "product_b_id",
            },
        },
        "query": {
            "type": "string",
            "default": "三只松鼠",
        },
        "product_a_id": {
            "type": "string",
            "default": "p10",
        },
        "product_b_id": {
            "type": "string",
            "default": "p11",
        },
        "product_a_title": {
            "type": "string",
            "default": "",
        },
        "product_b_title": {
            "type": "string",
            "default": "",
        },
    }

    expected_changes = TAOBAO_SEARCH_CHANGES

    answer_fields = [
        {"type": "text", "label": "更便宜的商品"},
    ]

    # -----------------------------------------------------------------
    # Post-sample: resolve display-only params
    # -----------------------------------------------------------------

    async def _post_sample(self, env: Any) -> None:
        """Resolve product titles after sampling."""
        state = await env.get_state()
        taobao_state = state.get("apps", {}).get("taobao", {})
        taobao = Taobao(taobao_state)

        pa = taobao.get_product(self.p.product_a_id)
        pb = taobao.get_product(self.p.product_b_id)
        self.params["product_a_title"] = pa.get("title", "") if pa else self.p.product_a_id
        self.params["product_b_title"] = pb.get("title", "") if pb else self.p.product_b_id

    # -----------------------------------------------------------------
    # Answer (ground truth)
    # -----------------------------------------------------------------

    def get_answer(self, input: JudgeInput) -> Any:
        """Compute cheaper product title from initial state."""
        taobao_init = Taobao(input.apps_init.get("taobao", {}))
        return _compute_cheaper_product(
            taobao_init,
            self.p.product_a_id,
            self.p.product_b_id,
        )

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        taobao = Taobao(input.apps.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        # 1. Search was performed with the query
        searched = taobao.check_searched(query=self.p.query)
        checks.append({
            "field": "search.performed",
            "expected": True,
            "actual": searched,
            "passed": searched,
        })

        # 2. Both products were opened
        a_opened = taobao.check_product_opened(self.p.product_a_id)
        b_opened = taobao.check_product_opened(self.p.product_b_id)
        checks.append({
            "field": "product_a.opened",
            "expected": True,
            "actual": a_opened,
            "passed": a_opened,
        })
        checks.append({
            "field": "product_b.opened",
            "expected": True,
            "actual": b_opened,
            "passed": b_opened,
        })

        # 3. Answer check
        expected = self.get_answer(input)
        checks.extend(build_answer_checks(expected, input.answer))

        return checks
