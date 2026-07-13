"""
China Mobile (中国移动) app state accessor + deterministic samplers.

The runtime overlay (balance / usage / bills / subscribedServices / family
numbers / profile / payment methods / transactions / settings) lives in the
app's static default data (``apps/ChinaMobile/data/defaults.json``) and is
loaded into the runtime Zustand store on first mount. Samplers read from the
on-disk defaults so sampled parameter values are guaranteed to exist in the
runtime store state (which is a clone of the same defaults).

The fixed world catalogs (base plans, data packs) are mirrored here as small
module constants — these are *not* persisted in runtime state (state only
holds ``activePlanId`` / ``purchasedPacks``), so they are not "data already in
getState" and mirroring them is the established pattern (cf. Railway
HOT_ROUTE_CHOICES).
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from bench_env.task.base import BaseApp

_DEFAULTS_PATH = (
    Path(__file__).resolve().parents[3]
    / "apps"
    / "ChinaMobile"
    / "data"
    / "defaults.json"
)
_DEFAULTS = json.loads(_DEFAULTS_PATH.read_text(encoding="utf-8"))

#: Base-plan catalog (world data; mirrors apps/ChinaMobile/constants.ts PLANS).
CHINA_MOBILE_PLANS: list[dict[str, Any]] = [
    {"id": "plan-128", "name": "5G智享套餐-128元", "price": 128, "dataGb": 30, "voiceMin": 500},
    {"id": "plan-188", "name": "5G智享套餐-188元", "price": 188, "dataGb": 60, "voiceMin": 1000},
    {"id": "plan-238", "name": "5G智享套餐-238元", "price": 238, "dataGb": 100, "voiceMin": 1500},
    {"id": "plan-58", "name": "飞享套餐-58元", "price": 58, "dataGb": 10, "voiceMin": 100},
]
_PLAN_BY_ID = {p["id"]: p for p in CHINA_MOBILE_PLANS}
#: Default active plan id (the plan that is active after __SIM__.reset()).
CHINA_MOBILE_DEFAULT_ACTIVE_PLAN_ID: str = _DEFAULTS["activePlanId"]

#: Data-pack catalog (world data; mirrors apps/ChinaMobile/constants.ts DATA_PACKS).
CHINA_MOBILE_DATA_PACKS: list[dict[str, Any]] = [
    {"id": "pack-3gb", "name": "3GB流量日包", "dataGb": 3, "price": 5},
    {"id": "pack-10gb", "name": "10GB流量加油包", "dataGb": 10, "price": 15},
    {"id": "pack-20gb", "name": "20GB流量月包", "dataGb": 20, "price": 30},
    {"id": "pack-5gb7d", "name": "5GB流量7天包", "dataGb": 5, "price": 8},
]
_DATA_PACK_BY_ID = {p["id"]: p for p in CHINA_MOBILE_DATA_PACKS}

#: Default family numbers (for delete-task sampler).
CHINA_MOBILE_FAMILY_NUMBERS: list[dict[str, Any]] = _DEFAULTS["familyNumbers"]
#: Default subscribed services (for disable-task sampler).
CHINA_MOBILE_SERVICES: list[dict[str, Any]] = _DEFAULTS["subscribedServices"]
#: Default payment methods (for autopay-task sampler).
CHINA_MOBILE_PAYMENT_METHODS: list[dict[str, Any]] = _DEFAULTS["paymentMethods"]
#: Default profile email (to ensure update-email target differs).
CHINA_MOBILE_DEFAULT_EMAIL: str = _DEFAULTS["profile"]["email"]
#: Default unpaid (arrears) bill.
CHINA_MOBILE_UNPAID_BILL: dict[str, Any] | None = next(
    (b for b in _DEFAULTS["bills"] if b.get("status") == "unpaid"), None
)


def _round2(n: float) -> float:
    return round(n * 100) / 100


class ChinaMobile(BaseApp):
    """China Mobile state accessor.

    Usage::

        cm = ChinaMobile(input.apps["chinamobile"],
                         init=input.apps_init["chinamobile"])
        cm.balance              # current 话费余额
        cm.usage                # usage quota dict
        cm.active_plan_id       # current plan id
        cm.visited_pages        # _temp.visitedPages (page-visit markers)
        cm.init.balance         # initial balance
    """

    # ── current-state properties ───────────────────────────────────────
    @property
    def balance(self) -> float:
        v = self.get("balance")
        return float(v) if isinstance(v, (int, float)) else 0.0

    @property
    def usage(self) -> dict[str, Any]:
        v = self.get("usage")
        return v if isinstance(v, dict) else {}

    @property
    def active_plan_id(self) -> str:
        v = self.get("activePlanId")
        return v if isinstance(v, str) else ""

    @property
    def bills(self) -> list[dict[str, Any]]:
        return self.get_list("bills")

    @property
    def purchased_packs(self) -> list[dict[str, Any]]:
        return self.get_list("purchasedPacks")

    @property
    def subscribed_services(self) -> list[dict[str, Any]]:
        return self.get_list("subscribedServices")

    @property
    def roaming(self) -> dict[str, Any]:
        v = self.get("roaming")
        return v if isinstance(v, dict) else {}

    @property
    def autopay(self) -> dict[str, Any]:
        v = self.get("autopay")
        return v if isinstance(v, dict) else {}

    @property
    def family_numbers(self) -> list[dict[str, Any]]:
        return self.get_list("familyNumbers")

    @property
    def profile(self) -> dict[str, Any]:
        v = self.get("profile")
        return v if isinstance(v, dict) else {}

    @property
    def payment_methods(self) -> list[dict[str, Any]]:
        return self.get_list("paymentMethods")

    @property
    def transactions(self) -> list[dict[str, Any]]:
        return self.get_list("transactions")

    @property
    def settings(self) -> dict[str, Any]:
        v = self.get("settings")
        return v if isinstance(v, dict) else {}

    @property
    def visited_pages(self) -> list[str]:
        v = self.get("_temp.visitedPages")
        return [str(x) for x in v] if isinstance(v, list) else []

    # ── lookup helpers ────────────────────────────────────────────────
    def bill_by_id(self, bill_id: str) -> dict[str, Any] | None:
        for b in self.bills:
            if str(b.get("id") or "") == str(bill_id):
                return b
        return None

    def service_by_id(self, service_id: str) -> dict[str, Any] | None:
        for s in self.subscribed_services:
            if str(s.get("id") or "") == str(service_id):
                return s
        return None

    def family_by_id(self, family_id: str) -> dict[str, Any] | None:
        for f in self.family_numbers:
            if str(f.get("id") or "") == str(family_id):
                return f
        return None

    def family_by_phone(self, phone: str) -> dict[str, Any] | None:
        for f in self.family_numbers:
            if str(f.get("phone") or "") == str(phone):
                return f
        return None

    def payment_method_by_id(self, method_id: str) -> dict[str, Any] | None:
        for m in self.payment_methods:
            if str(m.get("id") or "") == str(method_id):
                return m
        return None

    # ── derived answers (computed from raw state) ─────────────────────
    @staticmethod
    def remaining_data_gb(state: dict[str, Any]) -> float:
        usage = state.get("usage") or {}
        packs = state.get("purchasedPacks") or []
        total = float(usage.get("dataTotalGb") or 0)
        used = float(usage.get("dataUsedGb") or 0)
        extra = sum(float(p.get("dataGb") or 0) for p in packs)
        return _round2(total + extra - used)

    @staticmethod
    def remaining_voice_min(state: dict[str, Any]) -> int:
        usage = state.get("usage") or {}
        total = int(usage.get("voiceTotalMin") or 0)
        used = int(usage.get("voiceUsedMin") or 0)
        return max(0, total - used)

    @staticmethod
    def active_plan_name(state: dict[str, Any]) -> str:
        plan_id = state.get("activePlanId")
        plan = _PLAN_BY_ID.get(plan_id) if isinstance(plan_id, str) else None
        return (plan or {}).get("name") or ""

    @staticmethod
    def current_bill_top_category(state: dict[str, Any]) -> str:
        bills = state.get("bills") or []
        current = next((b for b in bills if b.get("status") == "current"), None)
        items = (current or {}).get("items") or []
        if not items:
            return ""
        top = max(items, key=lambda i: float(i.get("amount") or 0))
        return str(top.get("category") or "")

    @staticmethod
    def unpaid_bill(state: dict[str, Any]) -> dict[str, Any] | None:
        bills = state.get("bills") or []
        return next((b for b in bills if b.get("status") == "unpaid"), None)

    # ── samplers (static, deterministic over on-disk defaults) ─────────

    @staticmethod
    def sample_arrears_bill(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample the unpaid (arrears) bill to pay off."""
        bill = CHINA_MOBILE_UNPAID_BILL
        return {
            "billId": bill["id"],
            "month": bill["month"],
            "amount": _round2(bill["total"]),
        }

    @staticmethod
    def sample_data_pack(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a purchasable data pack (defaults to the 10GB pack)."""
        pack = next((p for p in CHINA_MOBILE_DATA_PACKS if p["id"] == "pack-10gb"), CHINA_MOBILE_DATA_PACKS[1])
        return {"packId": pack["id"], "packName": pack["name"], "dataGb": pack["dataGb"], "price": pack["price"]}

    @staticmethod
    def sample_plan(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a base plan that is NOT the currently active one."""
        pool = [p for p in CHINA_MOBILE_PLANS if p["id"] != CHINA_MOBILE_DEFAULT_ACTIVE_PLAN_ID]
        p = rng.choice(pool)
        return {"planId": p["id"], "planName": p["name"]}

    @staticmethod
    def sample_service_to_disable(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a cancellable, currently-enabled value-added service to disable."""
        pool = [s for s in CHINA_MOBILE_SERVICES if s.get("cancellable") and s.get("enabled")]
        s = rng.choice(pool)
        return {"serviceId": s["id"], "serviceName": s["name"]}

    @staticmethod
    def sample_payment_method(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a payment method for auto-pay (excludes 话费余额 to force a real method)."""
        pool = [m for m in CHINA_MOBILE_PAYMENT_METHODS if m.get("type") != "balance"]
        if not pool:
            pool = list(CHINA_MOBILE_PAYMENT_METHODS)
        m = rng.choice(pool)
        label = m["label"] + (f"（尾号{m['tail']}）" if m.get("tail") else "")
        return {"methodId": m["id"], "methodLabel": label}

    @staticmethod
    def sample_family_to_add(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Generate a unique family number + nickname not in defaults."""
        existing = {f.get("phone") for f in CHINA_MOBILE_FAMILY_NUMBERS}
        while True:
            digits = "".join(str(rng.randint(0, 9)) for _ in range(11))
            phone = f"139{digits[3:]}"
            if phone not in existing:
                break
        nicknames = ["儿子", "女儿", "哥哥", "姐姐", "同事", "爷爷", "奶奶"]
        nickname = rng.choice(nicknames)
        return {"familyPhone": phone, "familyNickname": nickname}

    @staticmethod
    def sample_family_to_delete(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample an existing family number to delete (must go via confirm)."""
        f = rng.choice(CHINA_MOBILE_FAMILY_NUMBERS)
        return {"familyId": f["id"], "familyPhone": f["phone"], "familyNickname": f["nickname"]}

    @staticmethod
    def sample_email(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Generate a target email that differs from the default."""
        prefixes = ["zhangwei2026", "zw_mobile", "chinamobile.user", "zw188", "user_zhangwei"]
        suffixes = ["@163.com", "@126.com", "@139.com", "@qq.com", "@sohu.com"]
        while True:
            email = f"{rng.choice(prefixes)}{rng.randint(10, 99)}{rng.choice(suffixes)}"
            if email != CHINA_MOBILE_DEFAULT_EMAIL:
                return {"email": email}
