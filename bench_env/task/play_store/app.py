"""
PlayStore app state accessor + deterministic samplers.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from bench_env.task.base import BaseApp

_DEFAULTS_PATH = (
    Path(__file__).resolve().parents[3]
    / "apps"
    / "PlayStore"
    / "data"
    / "defaults.json"
)
_DEFAULTS = json.loads(_DEFAULTS_PATH.read_text(encoding="utf-8"))

PLAYSTORE_APPS: list[dict[str, Any]] = _DEFAULTS["apps"]
INSTALLED_APPS_DEFAULT: dict[str, str] = _DEFAULTS["installedApps"]


class PlayStore(BaseApp):
    """PlayStore state accessor."""

    # ---- Top-level state accessors ----

    @property
    def installed_apps(self) -> dict[str, str]:
        value = self.get("installedApps")
        return value if isinstance(value, dict) else {}

    @property
    def install_records(self) -> list[dict[str, Any]]:
        return self.get_list("installRecords")

    @property
    def update_records(self) -> list[dict[str, Any]]:
        return self.get_list("updateRecords")

    @property
    def uninstall_records(self) -> list[dict[str, Any]]:
        return self.get_list("uninstallRecords")

    @property
    def download_jobs(self) -> list[dict[str, Any]]:
        return self.get_list("downloadJobs")

    @property
    def wishlist(self) -> list[str]:
        value = self.get("wishlist")
        return value if isinstance(value, list) else []

    @property
    def auto_update(self) -> dict[str, bool]:
        value = self.get("autoUpdate")
        return value if isinstance(value, dict) else {}

    @property
    def ratings(self) -> dict[str, int]:
        value = self.get("ratings")
        return value if isinstance(value, dict) else {}

    @property
    def user_reviews(self) -> list[dict[str, Any]]:
        return self.get_list("userReviews")

    @property
    def reviews(self) -> list[dict[str, Any]]:
        return self.get_list("reviews")

    @property
    def search_current(self) -> dict[str, Any]:
        value = self.get("search.current")
        return value if isinstance(value, dict) else {}

    @property
    def search_history(self) -> list[dict[str, Any]]:
        return self.get_list("search.history")

    @property
    def current_category_id(self) -> str | None:
        return self.get("currentCategoryId")

    @property
    def current_sort_option(self) -> str:
        return self.get("currentSortOption") or "relevance"

    @property
    def opened_app_ids(self) -> list[str]:
        value = self.get("openedAppIds")
        return value if isinstance(value, list) else []

    @property
    def settings(self) -> dict[str, Any]:
        value = self.get("settings")
        return value if isinstance(value, dict) else {}

    # ---- Derived helpers ----

    def is_installed(self, app_id: str) -> bool:
        return app_id in self.installed_apps

    def installed_version(self, app_id: str) -> str | None:
        return self.installed_apps.get(app_id)

    def is_wishlisted(self, app_id: str) -> bool:
        return app_id in self.wishlist

    def has_update(self, app_id: str, store_version: str) -> bool:
        installed = self.installed_version(app_id)
        return installed is not None and installed != store_version

    def auto_update_enabled(self, app_id: str) -> bool:
        return self.auto_update.get(app_id, False)

    def user_rating(self, app_id: str) -> int | None:
        return self.ratings.get(app_id)

    def user_review_for(self, app_id: str) -> dict[str, Any] | None:
        for r in self.user_reviews:
            if r.get("appId") == app_id:
                return r
        return None

    def active_download_job(self, app_id: str) -> dict[str, Any] | None:
        for j in self.download_jobs:
            if j.get("appId") == app_id and j.get("status") in ("queued", "downloading"):
                return j
        return None


# ---- Parameter definitions ----

PLAYSTORE_SEARCH_PARAM: dict[str, Any] = {
    "type": "enum",
    "values": {
        "Spotify": "com.spotify.music",
        "Duolingo": "com.duolingo",
        "Google Drive": "com.google.drive",
        "Calm": "com.calm.meditation",
        "Evernote": "com.evernote.app",
        "Canva": "com.canva.editor",
        "Notion": "com.notion.app",
        "Zoom": "com.zoom.meeting",
        "Minecraft": "com.mojang.minecraft",
        "TikTok": "com.tiktok.app",
        "Uber": "com.uber.ride",
        "Tripadvisor": "com.tripadvisor.app",
    },
    "default": "com.spotify.music",
    "description": "PlayStore 搜索目标 App",
}

PLAYSTORE_INSTALLED_APP_PARAM: dict[str, Any] = {
    "type": "enum",
    "values": {
        "Spotify": "com.spotify.music",
        "Duolingo": "com.duolingo",
        "Google Drive": "com.google.drive",
        "NetEase Cloud Music": "com.netease.cloudmusic",
    },
    "default": "com.spotify.music",
    "description": "已安装的 App",
}

PLAYSTORE_UPDATABLE_APP_PARAM: dict[str, Any] = {
    "type": "enum",
    "values": {
        "Spotify (8.9.0 → 8.10.0)": "com.spotify.music",
        "Duolingo (5.160.0 → 5.165.0)": "com.duolingo",
        "Google Drive (2.24.0 → 2.26.0)": "com.google.drive",
        "WeChat (8.0.50 → 8.0.52)": "com.tencent.mm",
        "X/Twitter (10.50.0 → 10.55.0)": "com.twitter.android",
        "NetEase Cloud Music (9.2.0 → 9.5.0)": "com.netease.cloudmusic",
        "Adobe Lightroom (9.5.0 → 10.0.0)": "com.adobe.lightroom",
    },
    "default": "com.spotify.music",
    "description": "有可更新版本的 App",
}

PLAYSTORE_CATEGORY_PARAM: dict[str, Any] = {
    "type": "enum",
    "values": {
        "工具": "tools",
        "教育": "education",
        "社交": "social",
        "音乐": "music",
        "摄影": "photography",
        "游戏": "games",
        "效率": "productivity",
        "出行": "travel",
    },
    "default": "tools",
    "description": "分类",
}

PLAYSTORE_SORT_PARAM: dict[str, Any] = {
    "type": "enum",
    "values": {
        "相关性": "relevance",
        "评分": "rating",
        "下载量": "downloads",
        "安装包大小": "size",
    },
    "default": "relevance",
    "description": "排序方式",
}

PLAYSTORE_RATING_PARAM: dict[str, Any] = {
    "type": "enum",
    "values": {"1 星": 1, "2 星": 2, "3 星": 3, "4 星": 4, "5 星": 5},
    "default": 4,
    "description": "评分星级",
}

PLAYSTORE_GLOBAL_UPDATE_PARAM: dict[str, Any] = {
    "type": "enum",
    "values": {
        "仅 Wi-Fi": "wifi_only",
        "始终": "always",
        "从不": "never",
    },
    "default": "wifi_only",
    "description": "全局自动更新设置",
}

# ---- Expected changes constants ----

PLAYSTORE_INSTALL_CHANGES = [
    "installedApps",
    "installRecords",
    "downloadJobs",
]

PLAYSTORE_UPDATE_CHANGES = [
    "installedApps",
    "updateRecords",
]

PLAYSTORE_UNINSTALL_CHANGES = [
    "installedApps",
    "uninstallRecords",
    "autoUpdate",
]

PLAYSTORE_CANCEL_CHANGES = [
    "downloadJobs",
]

PLAYSTORE_WISHLIST_CHANGES = [
    "wishlist",
]

PLAYSTORE_AUTOUPDATE_CHANGES = [
    "autoUpdate",
]

PLAYSTORE_RATING_CHANGES = [
    "ratings",
    "userReviews",
]

PLAYSTORE_REVIEW_CHANGES = [
    "userReviews",
]

PLAYSTORE_SEARCH_CHANGES = [
    "search.current",
    "search.history",
    "openedAppIds",
    "currentCategoryId",
    "currentSortOption",
]

PLAYSTORE_SETTINGS_CHANGES = [
    "settings",
]


# ---- Helpers ----

def store_app(app_id: str) -> dict[str, Any] | None:
    """Find an app in the store catalog."""
    for a in PLAYSTORE_APPS:
        if a["id"] == app_id:
            return a
    return None


def store_app_name(app_id: str) -> str:
    """Get display name for an app."""
    a = store_app(app_id)
    return a["name"] if a else app_id


def apps_in_category(category_id: str) -> list[dict[str, Any]]:
    return [a for a in PLAYSTORE_APPS if a["categoryId"] == category_id]


def top_rated_in_category(category_id: str) -> dict[str, Any] | None:
    apps = apps_in_category(category_id)
    if not apps:
        return None
    return max(apps, key=lambda a: a["rating"])
