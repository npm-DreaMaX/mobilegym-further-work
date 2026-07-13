"""
Taobao App accessor for benchmark tasks.

Provides Taobao(BaseApp) with typed properties, filter/search helpers,
answer builders, and shared expected_changes constants.
"""
from __future__ import annotations

from typing import Any, TYPE_CHECKING
from bench_env.task.base import BaseApp

if TYPE_CHECKING:
    from bench_env.task.base import BaseTask


# ============================================================
# Shared sampler data
# ============================================================

SEARCH_QUERIES = [
    "手机", "耳机", "华为", "苹果", "耐克", "阿迪达斯", "兰蔻", "戴森",
    "茅台", "三只松鼠", "三体", "瑜伽垫", "登山包", "行李箱", "电饭煲", "热水器",
    "SK-II", "优衣库", "小米", "美的", "香水", "精华", "跑鞋",
]

SORT_OPTIONS = ["comprehensive", "sales", "priceAsc", "priceDesc", "rating"]

CATEGORY_IDS = ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"]

BRAND_IDS = ["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b10", "b12", "b14", "b15", "b16", "b17"]

REFUND_REASONS = ["不喜欢/不想要", "商品与描述不符", "质量问题", "发错货", "其他"]

REVIEW_TAGS = ["质量好", "性价比高", "物流快", "包装精美", "卖家服务好", "穿着舒适", "效果好", "味道好"]

# ============================================================
# Expected changes constants
# ============================================================

TAOBAO_SEARCH_CHANGES = [
    "search.current",
    "search.history",
    "recentlyViewed",
    "openedProductIds",
]

TAOBAO_CART_CHANGES = [
    "cart",
]

TAOBAO_ORDER_CHANGES = [
    "orders",
    "cart",
    "skus",
    "userCoupons",
    "checkoutDraft",
]

TAOBAO_FAVORITE_CHANGES = [
    "favoriteIds",
]

TAOBAO_ADDRESS_CHANGES = [
    "addresses",
]

TAOBAO_COUPON_CHANGES = [
    "userCoupons",
    "checkoutDraft",
]

TAOBAO_REVIEW_CHANGES = [
    "reviews",
    "orders",
]

TAOBAO_REFUND_CHANGES = [
    "refundRequests",
    "orders",
]

TAOBAO_CHECKOUT_CHANGES = [
    "checkoutDraft",
    "orders",
    "cart",
    "skus",
    "userCoupons",
]

# ============================================================
# Taobao App Accessor
# ============================================================


class Taobao(BaseApp):
    """Accessor for Taobao app state."""

    app_id = "taobao"

    # ---- Basic accessors ----

    @property
    def products(self) -> dict[str, dict]:
        return self._state.get("products", {})

    @property
    def skus(self) -> dict[str, dict]:
        return self._state.get("skus", {})

    @property
    def categories(self) -> dict[str, dict]:
        return self._state.get("categories", {})

    @property
    def brands(self) -> dict[str, dict]:
        return self._state.get("brands", {})

    @property
    def shops(self) -> dict[str, dict]:
        return self._state.get("shops", {})

    @property
    def cart(self) -> list[dict]:
        return self._state.get("cart", [])

    @property
    def user_coupons(self) -> list[dict]:
        return self._state.get("userCoupons", [])

    @property
    def addresses(self) -> list[dict]:
        return self._state.get("addresses", [])

    @property
    def orders(self) -> list[dict]:
        return self._state.get("orders", [])

    @property
    def logistics(self) -> dict[str, dict]:
        return self._state.get("logistics", {})

    @property
    def refund_requests(self) -> list[dict]:
        return self._state.get("refundRequests", [])

    @property
    def reviews(self) -> list[dict]:
        return self._state.get("reviews", [])

    @property
    def favorite_ids(self) -> list[str]:
        return self._state.get("favoriteIds", [])

    @property
    def search_current(self) -> dict:
        return self._state.get("search", {}).get("current", {})

    @property
    def search_history(self) -> list[dict]:
        return self._state.get("search", {}).get("history", [])

    @property
    def opened_product_ids(self) -> list[str]:
        return self._state.get("openedProductIds", [])

    @property
    def checkout_draft(self) -> dict:
        return self._state.get("checkoutDraft", {})

    @property
    def profile(self) -> dict:
        return self._state.get("profile", {})

    # ---- Product helpers ----

    def get_product(self, product_id: str) -> dict | None:
        return self.products.get(product_id)

    def get_sku(self, sku_id: str) -> dict | None:
        return self.skus.get(sku_id)

    def get_product_skus(self, product_id: str) -> list[dict]:
        product = self.get_product(product_id)
        if not product:
            return []
        return [self.skus[sid] for sid in product.get("skuIds", []) if sid in self.skus]

    def get_sku_price(self, sku_id: str) -> float | None:
        sku = self.get_sku(sku_id)
        return sku["price"] if sku else None

    def get_sku_stock(self, sku_id: str) -> int | None:
        sku = self.get_sku(sku_id)
        return sku["stock"] if sku else None

    # ---- Search / Filter helpers (mirror TS search logic) ----

    @staticmethod
    def _normalize(text: str) -> str:
        return text.lower().replace(" ", "")

    def filter_products(
        self,
        query: str = "",
        category_id: str | None = None,
        brand_id: str | None = None,
        shop_id: str | None = None,
        free_shipping_only: bool = False,
        price_min: float | None = None,
        price_max: float | None = None,
        min_rating: float | None = None,
    ) -> list[dict]:
        """Filter products matching criteria (mirrors frontend logic)."""
        results = []
        q = self._normalize(query) if query else ""
        for pid, p in self.products.items():
            if not p.get("enabled", True):
                continue
            if category_id and p.get("categoryId") != category_id:
                continue
            if brand_id and p.get("brandId") != brand_id:
                continue
            if shop_id and p.get("shopId") != shop_id:
                continue
            if free_shipping_only and not p.get("freeShipping", False):
                continue
            price = p.get("price", 0)
            if price_min is not None and price < price_min:
                continue
            if price_max is not None and price > price_max:
                continue
            if min_rating is not None and p.get("rating", 0) < min_rating:
                continue
            if q:
                brand_name = self.brands.get(p.get("brandId", ""), {}).get("name", "")
                cat_name = self.categories.get(p.get("categoryId", ""), {}).get("name", "")
                shop_name = self.shops.get(p.get("shopId", ""), {}).get("name", "")
                haystack = self._normalize(
                    f"{p.get('title', '')} {brand_name} {cat_name} {shop_name}"
                )
                if q not in haystack:
                    continue
            results.append(p)
        return results

    def sort_products(self, products: list[dict], sort_option: str) -> list[dict]:
        """Sort products by option."""
        if sort_option == "priceAsc":
            return sorted(products, key=lambda p: p.get("price", 0))
        elif sort_option == "priceDesc":
            return sorted(products, key=lambda p: p.get("price", 0), reverse=True)
        elif sort_option == "sales":
            return sorted(products, key=lambda p: p.get("sales", 0), reverse=True)
        elif sort_option == "rating":
            return sorted(products, key=lambda p: p.get("rating", 0), reverse=True)
        return products  # comprehensive - maintain order

    def search_products(
        self,
        query: str = "",
        sort_option: str = "comprehensive",
        **filters,
    ) -> list[dict]:
        """Full search: filter + sort."""
        filtered = self.filter_products(query=query, **filters)
        return self.sort_products(filtered, sort_option)

    # ---- Search snapshot helpers ----

    def find_latest_snapshot(self, query: str = "", **filters) -> dict | None:
        """Find the latest search history snapshot matching criteria."""
        for snap in reversed(self.search_history):
            if query and snap.get("query") != query:
                continue
            match = True
            for key, val in filters.items():
                state_key = self._FILTER_KEY_MAP.get(key, key)
                if snap.get(state_key) != val:
                    match = False
                    break
            if match:
                return snap
        return None

    # Map snake_case filter keys to camelCase state keys
    _FILTER_KEY_MAP = {
        "free_shipping_only": "freeShippingOnly",
        "brand_id": "brandId",
        "category_id": "categoryId",
        "shop_id": "shopId",
        "price_min": "priceMin",
        "price_max": "priceMax",
        "min_rating": "minRating",
        "sort_option": "sortOption",
    }

    def check_searched(
        self, query: str = "", sort_option: str | None = None, **filters
    ) -> bool:
        """Check if search was performed with given criteria."""
        cur = self.search_current
        if query and cur.get("query") != query:
            return False
        if sort_option and cur.get("sortOption") != sort_option:
            return False
        for key, val in filters.items():
            state_key = self._FILTER_KEY_MAP.get(key, key)
            if cur.get(state_key) != val:
                return False
        # Also check history
        snap = self.find_latest_snapshot(query=query, **filters)
        if snap is not None:
            if sort_option and snap.get("sortOption") != sort_option:
                return False
            return True
        return bool(query and cur.get("query") == query)

    def check_product_opened(self, product_id: str) -> bool:
        """Check if a product detail page was opened."""
        return product_id in self.opened_product_ids

    # ---- Cart helpers ----

    def get_cart_item(self, cart_item_id: str) -> dict | None:
        for ci in self.cart:
            if ci.get("id") == cart_item_id:
                return ci
        return None

    def get_cart_item_by_sku(self, sku_id: str) -> dict | None:
        for ci in self.cart:
            if ci.get("skuId") == sku_id:
                return ci
        return None

    def count_selected_cart_items(self) -> int:
        return sum(1 for ci in self.cart if ci.get("selected"))

    def get_selected_cart_total(self) -> float:
        return sum(
            ci.get("unitPrice", 0) * ci.get("quantity", 0)
            for ci in self.cart
            if ci.get("selected")
        )

    # ---- Coupon helpers ----

    def get_available_coupon(self, coupon_id: str) -> dict | None:
        """Get coupon definition from config."""
        return self._state.get("coupons", {}).get(coupon_id)

    def get_user_coupon(self, coupon_id: str) -> dict | None:
        for uc in self.user_coupons:
            if uc.get("couponId") == coupon_id:
                return uc
        return None

    def is_coupon_claimed(self, coupon_id: str) -> bool:
        uc = self.get_user_coupon(coupon_id)
        return uc is not None and not uc.get("used", False)

    def is_coupon_used(self, coupon_id: str) -> bool:
        uc = self.get_user_coupon(coupon_id)
        return uc is not None and uc.get("used", False)

    def is_coupon_applicable(
        self, coupon_id: str, subtotal: float, product_ids: list[str]
    ) -> bool:
        """Check if a coupon can be applied to given products and subtotal."""
        coupon = self.get_available_coupon(coupon_id)
        if not coupon:
            return False
        if subtotal < coupon.get("threshold", 0):
            return False
        if coupon.get("type") == "shop":
            shop_id = coupon.get("shopId")
            if shop_id:
                for pid in product_ids:
                    p = self.get_product(pid)
                    if p and p.get("shopId") != shop_id:
                        return False
        return True

    # ---- Address helpers ----

    def get_address(self, addr_id: str) -> dict | None:
        for a in self.addresses:
            if a.get("id") == addr_id:
                return a
        return None

    def get_default_address(self) -> dict | None:
        for a in self.addresses:
            if a.get("isDefault"):
                return a
        return None

    # ---- Order helpers ----

    def get_order(self, order_id: str) -> dict | None:
        for o in self.orders:
            if o.get("id") == order_id:
                return o
        return None

    def get_orders_by_status(self, status: str) -> list[dict]:
        return [o for o in self.orders if o.get("status") == status]

    def find_new_order(self, initial_order_ids: set[str]) -> dict | None:
        """Find a newly created order (not in initial set)."""
        for o in self.orders:
            if o.get("id") not in initial_order_ids:
                return o
        return None

    def find_new_review(self, initial_review_ids: set[str]) -> dict | None:
        """Find a newly created review."""
        for r in self.reviews:
            if r.get("id") not in initial_review_ids:
                return r
        return None

    def find_new_refund(self, initial_refund_ids: set[str]) -> dict | None:
        """Find a newly created refund request."""
        for rr in self.refund_requests:
            if rr.get("id") not in initial_refund_ids:
                return rr
        return None

    # ---- Logistics helpers ----

    def get_logistics(self, logistics_id: str) -> dict | None:
        return self.logistics.get(logistics_id)

    # ---- Checkout helpers ----

    def calculate_payable(
        self, cart_item_ids: list[str], coupon_id: str | None = None
    ) -> dict | None:
        """Calculate checkout totals for given cart items."""
        items = []
        subtotal = 0.0
        product_ids = set()
        for ci_id in cart_item_ids:
            ci = self.get_cart_item(ci_id)
            if not ci:
                return None
            qty = ci.get("quantity", 1)
            price = ci.get("unitPrice", 0)
            items.append({"cartItemId": ci_id, "quantity": qty, "unitPrice": price})
            subtotal += price * qty
            product_ids.add(ci.get("productId", ""))

        shipping = 0.0
        discount = 0.0

        if coupon_id:
            coupon = self.get_available_coupon(coupon_id)
            uc = self.get_user_coupon(coupon_id)
            if coupon and uc and not uc.get("used") and subtotal >= coupon.get("threshold", 0):
                if coupon.get("type") == "platform":
                    discount = coupon.get("discount", 0)
                elif coupon.get("type") == "shop":
                    shop_id = coupon.get("shopId")
                    all_match = all(
                        self.get_product(pid) and self.get_product(pid).get("shopId") == shop_id
                        for pid in product_ids
                    )
                    if all_match:
                        discount = coupon.get("discount", 0)

        return {
            "subtotal": subtotal,
            "shipping": shipping,
            "discount": discount,
            "payable": subtotal + shipping - discount,
            "items": items,
        }
