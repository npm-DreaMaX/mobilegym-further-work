"""
MeituanLite (美团Lite) task definitions.
"""
# -- Task Index (auto-generated, do not edit) --
# 1 task | L2×1
#
# [L2] AddDishToCart  请打开美团Lite，在 {shopName} 中把 {productName} 加入购物车，数量为 {quantity}，不要下单。
# -- End Task Index --

from __future__ import annotations

from typing import Any

from bench_env.task.base import BaseTask
from bench_env.task.judge import JudgeInput
from bench_env.task.meituan_lite.app import MeituanLite


class AddDishToCart(BaseTask):
    """在指定商家中把指定商品加入购物车，达到指定数量，且不下单。

    参数从 MeituanLite 默认数据里采样一个商家、一个商品、一个数量。
    setup 保证初始购物车 / 订单为空；check_goals 确定性检查购物车内容、
    数量、所属商家，并确认订单没有新增。
    """

    templates = [
        "请打开美团Lite，在 {shopName} 中把 {productName} 加入购物车，数量为 {quantity}，不要下单。",
    ]
    apps = ["meituan-lite"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    max_steps = 30
    capabilities = ["nav", "operate"]

    parameters = {
        "shopId": {"type": "string", "default": "shop-1"},
        "shopName": {"type": "string", "default": "老王家常炒饭"},
        "productId": {"type": "string", "default": "p1-1"},
        "productName": {"type": "string", "default": "招牌蛋炒饭"},
        "quantity": {"type": "int", "default": 2},
        "_target": {
            "sampler": MeituanLite.sample_target,
            "fields": {
                "shopId": "shopId",
                "shopName": "shopName",
                "productId": "productId",
                "productName": "productName",
                "quantity": "quantity",
            },
        },
    }

    # 加入购物车只会改动 cart 与 cartShopId；orders / userProfile 等不应变化。
    expected_changes = ["cart", "cartShopId"]

    async def _prepare(self, env) -> None:
        """显式保证初始购物车与订单为空（默认数据已为空，此处确保确定性）。"""
        await env.set_state(
            {
                "apps": {
                    "meituan-lite": {
                        "cart": [],
                        "cartShopId": None,
                        "orders": [],
                    }
                }
            },
            deep=True,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        mt = MeituanLite(
            input.apps.get("meituan-lite") or {},
            init=input.apps_init.get("meituan-lite") or {},
        )

        target_product = str(self.p.productId)
        target_shop = str(self.p.shopId)
        target_qty = int(self.p.quantity)

        item = mt.cart_item_for(target_product)
        cart_qty = int(item["qty"]) if item else 0

        init_order_count = len(mt.init.orders)
        curr_order_count = len(mt.orders)

        return [
            {
                "field": "cart_contains_product",
                "expected": f"cart contains product '{target_product}'",
                "actual": item,
                "passed": item is not None,
            },
            {
                "field": "cart_quantity",
                "expected": target_qty,
                "actual": cart_qty,
                "passed": item is not None and cart_qty == target_qty,
            },
            {
                "field": "cart_shop_id",
                "expected": target_shop,
                "actual": mt.cart_shop_id,
                "passed": mt.cart_shop_id == target_shop,
            },
            {
                "field": "no_new_orders",
                "expected": init_order_count,
                "actual": curr_order_count,
                "passed": curr_order_count == init_order_count,
            },
        ]
