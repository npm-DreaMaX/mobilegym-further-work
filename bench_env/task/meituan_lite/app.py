"""
MeituanLite (美团Lite) app state accessor.

The shop / product catalog lives in the app's static default data
(``apps/MeituanLite/data/defaults.json``) and is NOT persisted in the
runtime Zustand store, so we load it directly from disk for parameter
sampling. The runtime store only holds cart / orders / userProfile /
settings / paymentMethod / addressId.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from bench_env.task.base import BaseApp

_DEFAULTS_PATH = (
    Path(__file__).resolve().parents[3]
    / "apps"
    / "MeituanLite"
    / "data"
    / "defaults.json"
)
_DEFAULTS = json.loads(_DEFAULTS_PATH.read_text(encoding="utf-8"))

#: Full shop catalog (with nested products) loaded from default data.
MEITUAN_SHOPS: list[dict[str, Any]] = _DEFAULTS["shops"]

#: Quantity choices sampled for AddDishToCart (>=2 so the agent must click +).
MEITUAN_QTY_CHOICES = [2, 3, 4]


class MeituanLite(BaseApp):
    """MeituanLite state accessor.

    Usage:
        mt = MeituanLite(input.apps["meituan-lite"],
                         init=input.apps_init["meituan-lite"])
        mt.cart            # current cart lines
        mt.cart_shop_id    # shop the cart belongs to
        mt.orders          # order list
        mt.init.orders     # initial order list
    """

    @property
    def cart(self) -> list[dict[str, Any]]:
        return self.get_list("cart")

    @property
    def cart_shop_id(self) -> str | None:
        value = self.get("cartShopId")
        return value if value is not None else None

    @property
    def orders(self) -> list[dict[str, Any]]:
        return self.get_list("orders")

    def cart_item_for(self, product_id: str) -> dict[str, Any] | None:
        """Return the cart line for *product_id*, or None if not in cart."""
        for item in self.cart:
            if str(item.get("productId") or "") == str(product_id):
                return item
        return None

    @staticmethod
    def sample_target(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a (shop, product, quantity) target from the default catalog.

        Returns a dict with shopId / shopName / productId / productName /
        quantity — used to populate the AddDishToCart task parameters.
        """
        shop = rng.choice(MEITUAN_SHOPS)
        product = rng.choice(shop["products"])
        quantity = int(rng.choice(MEITUAN_QTY_CHOICES))
        return {
            "shopId": shop["id"],
            "shopName": shop["name"],
            "productId": product["id"],
            "productName": product["name"],
            "quantity": quantity,
        }
