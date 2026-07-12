"""
Cainiao (菜鸟) app state accessor + deterministic samplers.

The package / send-record / address / notification catalogs live in the app's
static default data (``apps/Cainiao/data/defaults.json``) and are loaded into
the runtime Zustand store on first mount. Samplers read from the on-disk
defaults (deterministic catalog) so sampled parameter values are guaranteed to
exist in the runtime store state (which is a clone of the same defaults).
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from bench_env.task.base import BaseApp

_DEFAULTS_PATH = (
    Path(__file__).resolve().parents[3]
    / "apps"
    / "Cainiao"
    / "data"
    / "defaults.json"
)
_DEFAULTS = json.loads(_DEFAULTS_PATH.read_text(encoding="utf-8"))

#: Full package catalog (incoming parcels) loaded from default data.
CAINIAO_PACKAGES: list[dict[str, Any]] = _DEFAULTS["packages"]
#: Address book loaded from default data.
CAINIAO_ADDRESSES: list[dict[str, Any]] = _DEFAULTS["addresses"]
#: Default address id from default data.
CAINIAO_DEFAULT_ADDRESS_ID: str | None = _DEFAULTS.get("defaultAddressId")


def _full_address(addr: dict[str, Any]) -> str:
    """Concatenate province/city/district/detail into one address string."""
    return "".join(
        str(addr.get(k) or "")
        for k in ("province", "city", "district", "detail")
    )


class Cainiao(BaseApp):
    """Cainiao state accessor.

    Usage::

        cn = Cainiao(input.apps["cainiao"],
                     init=input.apps_init["cainiao"])
        cn.packages          # current package list
        cn.send_records      # current send-record list
        cn.addresses         # current address book
        cn.default_address_id
        cn.settings          # settings dict
        cn.init.packages     # initial package list
    """

    # ── current-state properties ───────────────────────────────────────
    @property
    def packages(self) -> list[dict[str, Any]]:
        return self.get_list("packages")

    @property
    def send_records(self) -> list[dict[str, Any]]:
        return self.get_list("sendRecords")

    @property
    def addresses(self) -> list[dict[str, Any]]:
        return self.get_list("addresses")

    @property
    def notifications(self) -> list[dict[str, Any]]:
        return self.get_list("notifications")

    @property
    def settings(self) -> dict[str, Any]:
        value = self.get("settings")
        return value if isinstance(value, dict) else {}

    @property
    def user(self) -> dict[str, Any]:
        value = self.get("user")
        return value if isinstance(value, dict) else {}

    @property
    def default_address_id(self) -> str | None:
        value = self.get("defaultAddressId")
        return value if value is not None else None

    @property
    def search_current(self) -> dict[str, Any]:
        value = self.get("search.current")
        return value if isinstance(value, dict) else {}

    @property
    def viewed_package_id(self) -> str | None:
        """最近查看的包裹 id（易失浏览态，仅 benchmark 判定用）。"""
        value = self.get("_temp.lastViewedPackageId")
        return value if value else None

    # ── lookup helpers (current state) ────────────────────────────────
    def package_by_id(self, package_id: str) -> dict[str, Any] | None:
        for p in self.packages:
            if str(p.get("id") or "") == str(package_id):
                return p
        return None

    def address_by_id(self, address_id: str) -> dict[str, Any] | None:
        for a in self.addresses:
            if str(a.get("id") or "") == str(address_id):
                return a
        return None

    # ── samplers (static, deterministic over on-disk defaults) ─────────

    @staticmethod
    def sample_package(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample any package; returns {pkgId, pkg} where pkg = trackingNo."""
        p = rng.choice(CAINIAO_PACKAGES)
        return {"pkgId": p["id"], "pkg": p["trackingNo"]}

    @staticmethod
    def sample_package_with_eta(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a package that has an ETA (for eta / arrival questions)."""
        pool = [p for p in CAINIAO_PACKAGES if p.get("eta")]
        p = rng.choice(pool)
        return {"pkgId": p["id"], "pkg": p["trackingNo"]}

    @staticmethod
    def sample_package_with_pickup(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a package that has a pickup code (arrived at station).

        Returns {pkgId, pkg, recipientName} so CheckPickupCode can locate the
        package by recipient name (not by tracking-number search).
        """
        pool = [p for p in CAINIAO_PACKAGES if p.get("pickupCode")]
        p = rng.choice(pool)
        recipient = p.get("recipient") or {}
        return {
            "pkgId": p["id"],
            "pkg": p["trackingNo"],
            "recipientName": recipient.get("name") or "",
        }

    @staticmethod
    def sample_package_with_station(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a package that has station info."""
        pool = [p for p in CAINIAO_PACKAGES if p.get("station")]
        p = rng.choice(pool)
        return {"pkgId": p["id"], "pkg": p["trackingNo"]}

    @staticmethod
    def sample_two_packages_with_eta(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample two distinct packages (both with ETA) for comparison."""
        pool = [p for p in CAINIAO_PACKAGES if p.get("eta")]
        a, b = rng.sample(pool, 2)
        return {
            "pkgA": a["trackingNo"],
            "pkgB": b["trackingNo"],
            "pkgAId": a["id"],
            "pkgBId": b["id"],
        }

    @staticmethod
    def sample_address(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a non-default address for send / set-default tasks.

        Returns {addressId, recipientName, recipientPhone, recipientAddress}
        where recipientAddress is the concatenated full address string.
        """
        # Exclude the current default so the task always requires a change.
        pool = [
            a for a in CAINIAO_ADDRESSES
            if a.get("id") != CAINIAO_DEFAULT_ADDRESS_ID
        ]
        if not pool:
            pool = list(CAINIAO_ADDRESSES)
        a = rng.choice(pool)
        return {
            "addressId": a["id"],
            "recipientName": a["name"],
            "recipientPhone": a["phone"],
            "recipientAddress": _full_address(a),
        }

    @staticmethod
    def sample_keyword(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a search keyword (a full trackingNo) + the matched package id."""
        p = rng.choice(CAINIAO_PACKAGES)
        return {"keyword": p["trackingNo"], "pkgId": p["id"], "pkg": p["trackingNo"]}

    @staticmethod
    def sample_search_target(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Generate a unique arrived_station target for SearchPackage.

        Produces a tracking_no + pickup_code that do NOT exist in the static
        default catalog. The package itself is injected into runtime state by
        the task's ``_post_sample`` (see ``build_search_target_package``), so the
        pickup code is only discoverable by searching the tracking number and
        opening the package detail — never guessable from defaults or instruction.

        Returns {pkgId, trackingNo, pickupCode}.
        """
        existing_tn = {p.get("trackingNo") for p in CAINIAO_PACKAGES}
        while True:
            digits = "".join(str(rng.randint(0, 9)) for _ in range(13))
            tracking_no = f"SF{digits}"
            if tracking_no not in existing_tn:
                break
        shelf = rng.randint(1, 9)
        tier = rng.randint(1, 9)
        code = "".join(str(rng.randint(0, 9)) for _ in range(4))
        pickup_code = f"{shelf}-{tier}-{code}"
        return {
            "pkgId": "pkg-search-target",
            "trackingNo": tracking_no,
            "pickupCode": pickup_code,
        }

    @staticmethod
    def build_search_target_package(
        tracking_no: str, pickup_code: str, pkg_id: str = "pkg-search-target"
    ) -> dict[str, Any]:
        """Build the arrived_station package injected by SearchPackage setup.

        The pickup code lives only in ``pickupCode`` / ``station.pickupCode``
        (shown on the package detail page) and is intentionally NOT embedded in
        the event descriptions, so it cannot be read from the search-result card.
        """
        return {
            "id": pkg_id,
            "trackingNo": tracking_no,
            "carrierId": "sf",
            "carrierName": "顺丰速运",
            "status": "arrived_station",
            "statusLabel": "待取件",
            "recipient": {
                "name": "赵小明",
                "phone": "138****0088",
                "address": "深圳市南山区科技园1号",
            },
            "sender": {
                "name": "钱大山",
                "phone": "137****0099",
                "address": "北京市海淀区中关村2号",
            },
            "fromCity": "北京",
            "toCity": "深圳",
            "eta": "2026-07-13",
            "itemCategory": "日用百货",
            "weight": 1.2,
            "events": [
                {
                    "time": 1752576000000,
                    "location": "深圳·科技园菜鸟驿站",
                    "description": "包裹已到达驿站，凭取件码取件",
                    "status": "arrived_station",
                },
                {
                    "time": 1752403200000,
                    "location": "深圳南山转运中心",
                    "description": "快件已发往科技园驿站",
                    "status": "in_transit",
                },
                {
                    "time": 1752230400000,
                    "location": "北京·海淀揽收点",
                    "description": "顺丰速运已揽收",
                    "status": "pending_ship",
                },
            ],
            "station": {
                "name": "菜鸟驿站·科技园店",
                "address": "深圳市南山区科技园1号",
                "pickupCode": pickup_code,
                "businessHours": "09:00-21:00",
            },
            "pickupCode": pickup_code,
        }

    # ── answer computation helpers (read from initial state) ──────────

    @staticmethod
    def oldest_package_tracking_no(apps_init: dict[str, Any]) -> str | None:
        """Return the trackingNo of the package with the earliest pickup event.

        The oldest package = the one whose earliest logistics event (揽收,
        the last element in the newest-first ``events`` array) has the
        smallest timestamp.
        """
        packages = (apps_init.get("cainiao") or {}).get("packages") or []
        oldest: dict[str, Any] | None = None
        oldest_ts: int | None = None
        for p in packages:
            events = p.get("events") or []
            if not events:
                continue
            ts = events[-1].get("time")
            if ts is None:
                continue
            if oldest_ts is None or ts < oldest_ts:
                oldest_ts = ts
                oldest = p
        if oldest is None:
            return None
        return oldest.get("trackingNo")

    @staticmethod
    def earlier_arrival_tracking_no(
        apps_init: dict[str, Any], pkg_a_id: str, pkg_b_id: str
    ) -> str | None:
        """Return the trackingNo of whichever of A/B has the earlier ETA date."""
        packages = (apps_init.get("cainiao") or {}).get("packages") or []
        by_id = {p.get("id"): p for p in packages}
        a = by_id.get(pkg_a_id)
        b = by_id.get(pkg_b_id)
        if not a or not b:
            return None
        eta_a = a.get("eta") or ""
        eta_b = b.get("eta") or ""
        # ISO date strings compare lexicographically = chronologically.
        if eta_a <= eta_b:
            return a.get("trackingNo")
        return b.get("trackingNo")
