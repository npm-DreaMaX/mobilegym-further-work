"""
在淘宝搜索指定条件，筛选后打开商品详情页，回答店铺名称。

Hybrid query task (L3): search with filters, open a product, report the shop name.
"""
from __future__ import annotations

import random
from typing import Any

from bench_env.task.taobao.app import (
    Taobao, TAOBAO_SEARCH_CHANGES,
    SEARCH_QUERIES, BRAND_IDS, SORT_OPTIONS,
)
from bench_env.task.common_tasks import AnswerTask, build_answer_checks
from bench_env.task.judge import JudgeInput

_SORT_LABELS = {
    "comprehensive": "综合",
    "sales": "销量",
    "priceAsc": "价格升序",
    "priceDesc": "价格降序",
    "rating": "评分",
}


class SearchFilterSortAndReportSeller(AnswerTask):
    """Search, filter, sort, open product detail, report shop name."""

    templates = [
        '在淘宝搜索"{query}"，筛选品牌{brand_name}、价格{price_min}-{price_max}、只要包邮商品，按{sort_label}排序，找到满足全部条件的商品，打开详情页，回答这个商品是哪个店铺的',
    ]
    apps = ["taobao"]
    scope = "S2"
    objective = "hybrid"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["search", "filter", "extract", "sort"]
    max_steps = 30

    parameters = {
        "query": {
            "type": "enum",
            "values": SEARCH_QUERIES,
            "default": "耳机",
        },
        "brand_id": {
            "type": "enum",
            "values": BRAND_IDS,
            "default": "b3",
        },
        "price_min": {
            "type": "int",
            "min": 50,
            "max": 200,
            "default": 100,
        },
        "price_max": {
            "type": "int",
            "min": 500,
            "max": 2000,
            "default": 1500,
        },
        "sort_option": {
            "type": "enum",
            "values": SORT_OPTIONS,
            "default": "comprehensive",
        },
    }

    expected_changes = TAOBAO_SEARCH_CHANGES

    answer_fields = [
        {"type": "text", "label": "店铺名称"},
    ]

    # -----------------------------------------------------------------
    # Display helpers for template rendering
    # -----------------------------------------------------------------

    def _display_brand_name(self, brand_id: str, env_state: dict) -> str:
        """Look up brand name from state."""
        taobao_state = env_state.get("apps", {}).get("taobao", {})
        brand = taobao_state.get("brands", {}).get(brand_id, {})
        return brand.get("name", brand_id)

    def _display_sort_label(self, sort_option: str) -> str:
        return _SORT_LABELS.get(sort_option, sort_option)

    # -----------------------------------------------------------------
    # Post-sample: resolve display-only params
    # -----------------------------------------------------------------

    async def _post_sample(self, env: Any) -> None:
        """Resolve brand_name and sort_label after parameter sampling."""
        state = await env.get_state()
        taobao_state = state.get("apps", {}).get("taobao", {})
        brand = taobao_state.get("brands", {}).get(self.p.brand_id, {})
        self.params["brand_name"] = brand.get("name", self.p.brand_id)
        self.params["sort_label"] = _SORT_LABELS.get(self.p.sort_option, self.p.sort_option)

    # -----------------------------------------------------------------
    # Answer (ground truth)
    # -----------------------------------------------------------------

    def get_answer(self, input: JudgeInput) -> Any:
        """Compute expected shop name from initial state."""
        taobao_init = Taobao(input.apps_init.get("taobao", {}))
        results = taobao_init.search_products(
            query=self.p.query,
            brand_id=self.p.brand_id,
            price_min=float(self.p.price_min),
            price_max=float(self.p.price_max),
            free_shipping_only=True,
            sort_option=self.p.sort_option,
        )
        if not results:
            return None
        first = results[0]
        shop = taobao_init.shops.get(first.get("shopId", ""), {})
        return shop.get("name", "")

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        taobao = Taobao(input.apps.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        # 1. Search was performed with all filter criteria
        searched = taobao.check_searched(
            query=self.p.query,
            brand_id=self.p.brand_id,
            price_min=str(self.p.price_min),
            price_max=str(self.p.price_max),
            free_shipping_only=True,
            sort_option=self.p.sort_option,
        )
        checks.append({
            "field": "search.performed",
            "expected": True,
            "actual": searched,
            "passed": searched,
        })

        # 2. At least one matching product was opened
        results = taobao.search_products(
            query=self.p.query,
            brand_id=self.p.brand_id,
            price_min=float(self.p.price_min),
            price_max=float(self.p.price_max),
            free_shipping_only=True,
            sort_option=self.p.sort_option,
        )
        any_opened = any(
            taobao.check_product_opened(p["id"])
            for p in results
        )
        checks.append({
            "field": "product.opened",
            "expected": True,
            "actual": any_opened,
            "passed": any_opened,
        })

        # 3. Answer check
        expected = self.get_answer(input)
        checks.extend(build_answer_checks(expected, input.answer))

        return checks
