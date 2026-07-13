"""
在购物车中选择指定商品，可选使用优惠券，去结算页查看并回答应付金额。

Grounded query task (L4 hybrid): select items in cart, optionally apply a
coupon, go to checkout, and report the payable amount.
"""
from __future__ import annotations

import random
from typing import Any

from bench_env.task.taobao.app import (
    Taobao, TAOBAO_CART_CHANGES,
)
from bench_env.task.common_tasks import AnswerTask, build_answer_checks
from bench_env.task.judge import JudgeInput


def _coupon_name(state: dict, coupon_id: str) -> str:
    """Build a short display name for a coupon."""
    coupons = state.get("coupons", {})
    coupon = coupons.get(coupon_id, {})
    name = coupon.get("name", "")
    if name:
        return name
    threshold = coupon.get("threshold", 0)
    discount = coupon.get("discount", 0)
    if threshold:
        return f"满{threshold}减{discount}元券"
    return f"减{discount}元券"


def _sample_checkout_scenario(env_state: dict, rng: random.Random) -> dict:
    """
    Pick cart items and optionally a claimed coupon for checkout.

    Returns ``{"target_cart_item_ids": [...], "coupon_id": "..." or ""}``.

    The coupon must already be claimed (but not used) by the user so that
    ``calculate_payable`` correctly reflects the discount.  Falls back to
    no coupon when nothing suitable is found.
    """
    taobao_state = env_state.get("apps", {}).get("taobao", {})
    taobao = Taobao(taobao_state)
    cart = taobao.cart

    if cart:
        # Pick 1–3 random items (bounded by actual cart size)
        count = min(rng.randint(1, 3), len(cart))
        items = rng.sample(cart, count)
        target_ids = [ci["id"] for ci in items]

        # ---- Optionally pick a *claimed* (but not used) coupon ----
        available_coupons = taobao_state.get("coupons", {})
        claimed_ids = [
            cid for cid in available_coupons
            if taobao.is_coupon_claimed(cid)
        ]
        coupon_id = ""
        if claimed_ids and rng.random() < 0.5:
            rng.shuffle(claimed_ids)
            subtotal = sum(
                ci.get("unitPrice", 0) * ci.get("quantity", 0)
                for ci in items
            )
            product_ids = [ci.get("productId", "") for ci in items]
            for cid in claimed_ids:
                if taobao.is_coupon_applicable(cid, subtotal, product_ids):
                    coupon_id = cid
                    break

        return {"target_cart_item_ids": target_ids, "coupon_id": coupon_id}

    # ---- Fallback (empty cart) ----
    return {"target_cart_item_ids": ["ci1", "ci2"], "coupon_id": ""}


class CalculateCheckoutPayable(AnswerTask):
    """Select cart items, optionally apply a coupon, go to checkout,
    and report the payable amount."""

    templates = [
        '在购物车中，只勾选指定的{count}个商品{coupon_text}，'
        '去结算页查看并回答应付总金额是多少元',
    ]
    apps = ["taobao"]
    scope = "S3"
    objective = "hybrid"
    composition = "deep_dive"
    difficulty = "L4"
    capabilities = ["nav", "cart", "checkout", "extract"]
    max_steps = 40

    parameters = {
        "_checkout_scenario": {
            "sampler": _sample_checkout_scenario,
            "fields": {
                "target_cart_item_ids": "target_cart_item_ids",
                "coupon_id": "coupon_id",
            },
        },
        "target_cart_item_ids": {
            "type": "array",
            "items": {"type": "string"},
            "default": ["ci1", "ci2"],
        },
        "coupon_id": {
            "type": "string",
            "default": "",
        },
    }

    expected_changes = TAOBAO_CART_CHANGES + ["checkoutDraft"]

    answer_fields = [
        {"type": "number", "label": "应付金额(元)"},
    ]

    # -----------------------------------------------------------------
    # Post-sample: resolve display-only params
    # -----------------------------------------------------------------

    async def _post_sample(self, env: Any) -> None:
        """Resolve display-only params after sampling."""
        state = await env.get_state()
        taobao_state = state.get("apps", {}).get("taobao", {})
        taobao = Taobao(taobao_state)

        self.params["count"] = len(self.p.target_cart_item_ids)

        if self.p.coupon_id:
            name = _coupon_name(taobao_state, self.p.coupon_id)
            self.params["coupon_text"] = f"，使用{name}"
            self.params["coupon_desc"] = name
        else:
            self.params["coupon_text"] = ""
            self.params["coupon_desc"] = ""

    # -----------------------------------------------------------------
    # Answer (ground truth)
    # -----------------------------------------------------------------

    def get_answer(self, input: JudgeInput) -> Any:
        """Compute expected payable from the initial state.

        The ``target_cart_item_ids`` reference items that exist in the
        initial cart (the sampler picks from them), so ``calculate_payable``
        finds them and returns the correct subtotal / discount / payable.
        """
        taobao_init = Taobao(input.apps_init.get("taobao", {}))
        calc = taobao_init.calculate_payable(
            self.p.target_cart_item_ids,
            self.p.coupon_id if self.p.coupon_id else None,
        )
        return calc["payable"] if calc else None

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        taobao = Taobao(input.apps.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        # 1. All target cart items are selected
        target_ids = list(self.p.target_cart_item_ids)
        all_selected = all(
            ci.get("selected", False)
            for ci in taobao.cart
            if ci["id"] in target_ids
        )
        checks.append({
            "field": "cart.target_all_selected",
            "expected": True,
            "actual": all_selected,
            "passed": all_selected,
        })

        # 2. If a coupon is set, checkout draft references that coupon
        if self.p.coupon_id:
            draft = taobao.checkout_draft
            draft_coupon_id = (
                draft.get("couponSnapshot", {}).get("couponId")
                if draft else None
            )
            draft_has_coupon = draft_coupon_id == self.p.coupon_id
            checks.append({
                "field": "checkout.coupon",
                "expected": self.p.coupon_id,
                "actual": draft_coupon_id,
                "passed": draft_has_coupon,
            })

        # 3. Answer matches expected payable
        expected = self.get_answer(input)
        checks.extend(build_answer_checks(expected, input.answer))

        return checks
