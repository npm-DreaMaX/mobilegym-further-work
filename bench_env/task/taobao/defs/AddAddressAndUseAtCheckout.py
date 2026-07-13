"""
Add a new address, set it as default, add a product to cart, go to checkout,
and select the new address.

Operate task (L4): full address management + cart + checkout workflow.
"""
from __future__ import annotations

from typing import Any

from bench_env.task.taobao.app import (
    Taobao,
    TAOBAO_ADDRESS_CHANGES,
    TAOBAO_CART_CHANGES,
)
from bench_env.task.base import BaseTask
from bench_env.task.judge import JudgeInput


class AddAddressAndUseAtCheckout(BaseTask):
    """Add a new default address, add product to cart, checkout with new address."""

    templates = [
        '新增一个收货地址：收货人{name}，手机{phone}，地址{province}{city}{district}{detail}，设为默认地址。把{target_sku_desc}加入购物车并勾选，去结算页把这个地址选上，确认订单预览',
    ]
    apps = ["taobao"]
    scope = "S3"
    objective = "operate"
    composition = "sequential"
    difficulty = "L4"
    capabilities = ["nav", "create", "form_fill"]
    max_steps = 45

    parameters = {
        "name": {
            "type": "string",
            "default": "赵六",
            "description": "收货人姓名",
        },
        "phone": {
            "type": "string",
            "pattern": r"1[3-9]\d{9}",
            "default": "13600000001",
            "description": "手机号",
        },
        "province": {
            "type": "string",
            "default": "江苏省",
            "description": "省份",
        },
        "city": {
            "type": "string",
            "default": "南京市",
            "description": "城市",
        },
        "district": {
            "type": "string",
            "default": "鼓楼区",
            "description": "区县",
        },
        "detail": {
            "type": "string",
            "default": "中山北路200号",
            "description": "详细地址",
        },
        "targetProductId": {
            "type": "string",
            "default": "p10",
            "description": "目标商品ID",
        },
        "targetSkuId": {
            "type": "string",
            "default": "sku_p10_standard",
            "description": "目标SKU ID",
        },
        "targetSkuDesc": {
            "type": "string",
            "default": "三只松鼠坚果大礼包",
            "description": "目标商品描述（模板用）",
        },
    }

    expected_changes = TAOBAO_ADDRESS_CHANGES + TAOBAO_CART_CHANGES + ["checkoutDraft"]

    optimal_paths: list[list[Any]] = [
        [
            "tab.me",
            "me.addresses.open",
            "address.add.open",
            "addressEdit.save",
            "tab.home",
            "home.search.open",
            {"id": "search.item.open", "params": {"id": "{targetProductId}"}},
            "item.addToCart",
            "tab.cart",
            "cart.item.select.toggle",
            "cart.checkout",
            "checkout.address.select",
            "checkout.base",
        ],
    ]

    # -----------------------------------------------------------------
    # Goal checks
    # -----------------------------------------------------------------

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        init = Taobao(input.apps_init.get("taobao", {}))
        taobao = Taobao(input.apps.get("taobao", {}))
        checks: list[dict[str, Any]] = []

        # ---- Determine new addresses (ids in current but not in init) ----
        init_addr_ids = {a["id"] for a in init.addresses}
        curr_addr_ids = {a["id"] for a in taobao.addresses}
        new_ids = curr_addr_ids - init_addr_ids

        # 1. New address exists with matching fields
        new_addr = None
        for nid in new_ids:
            a = taobao.get_address(nid)
            if a is not None:
                new_addr = a
                break

        if new_addr is not None:
            fields_match = (
                new_addr.get("name") == self.p.name
                and new_addr.get("phone") == self.p.phone
                and new_addr.get("province") == self.p.province
                and new_addr.get("city") == self.p.city
                and new_addr.get("district") == self.p.district
                and new_addr.get("detail") == self.p.detail
            )
            is_default = new_addr.get("isDefault", False)
            checks.append({
                "field": "address.new",
                "expected": f"name={self.p.name}, phone={self.p.phone}, "
                            f"addr={self.p.province}{self.p.city}{self.p.district}{self.p.detail}, "
                            f"isDefault=True",
                "actual": f"name={new_addr.get('name')}, phone={new_addr.get('phone')}, "
                          f"isDefault={is_default}",
                "passed": fields_match and is_default,
            })
        else:
            checks.append({
                "field": "address.new",
                "expected": "A new address was created",
                "actual": "No new address found",
                "passed": False,
            })

        # 2. Old default address is no longer default
        old_default = init.get_default_address()
        if old_default:
            curr_old = taobao.get_address(old_default["id"])
            if curr_old is not None:
                passed = not curr_old.get("isDefault", True)
                checks.append({
                    "field": "address.old_default",
                    "expected": "isDefault=False",
                    "actual": f"isDefault={curr_old.get('isDefault')}",
                    "passed": passed,
                })
            else:
                checks.append({
                    "field": "address.old_default",
                    "expected": "Old default address still present, isDefault=False",
                    "actual": "Old default address was deleted",
                    "passed": False,
                })

        # 3. Target product SKU is in cart and selected
        cart_item = taobao.get_cart_item_by_sku(self.p.targetSkuId)
        if cart_item is not None:
            checks.append({
                "field": "cart.target_selected",
                "expected": f"skuId={self.p.targetSkuId}, selected=True",
                "actual": f"selected={cart_item.get('selected')}",
                "passed": cart_item.get("selected", False),
            })
        else:
            checks.append({
                "field": "cart.target_selected",
                "expected": f"Cart item with skuId={self.p.targetSkuId} exists and is selected",
                "actual": "Cart item not found",
                "passed": False,
            })

        # 4. Checkout draft uses the new address
        draft = taobao.checkout_draft
        if draft and new_addr:
            draft_addr_id = draft.get("addressId")
            checks.append({
                "field": "checkout.address",
                "expected": f"addressId={new_addr['id']}",
                "actual": f"addressId={draft_addr_id}",
                "passed": draft_addr_id == new_addr["id"],
            })
        elif draft:
            checks.append({
                "field": "checkout.address",
                "expected": "Use the newly created address",
                "actual": f"addressId={draft.get('addressId')} (new address id unknown)",
                "passed": False,
            })
        else:
            checks.append({
                "field": "checkout.draft",
                "expected": "Checkout draft exists with addressId",
                "actual": "No checkout draft found",
                "passed": False,
            })

        # 5. Non-target addresses unchanged (excluding the new one)
        for init_addr in init.addresses:
            curr_addr = taobao.get_address(init_addr["id"])
            if curr_addr is not None:
                # Only check that non-default, non-new addresses are fully unchanged
                if not init_addr.get("isDefault"):
                    unchanged = (
                        curr_addr.get("name") == init_addr.get("name")
                        and curr_addr.get("phone") == init_addr.get("phone")
                        and curr_addr.get("province") == init_addr.get("province")
                        and curr_addr.get("city") == init_addr.get("city")
                        and curr_addr.get("district") == init_addr.get("district")
                        and curr_addr.get("detail") == init_addr.get("detail")
                    )
                    if not unchanged:
                        checks.append({
                            "field": f"address.{init_addr['id']}.unchanged",
                            "expected": init_addr,
                            "actual": curr_addr,
                            "passed": False,
                        })

        return checks
