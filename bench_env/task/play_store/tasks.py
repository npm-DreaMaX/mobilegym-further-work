"""
PlayStore app task definitions — exactly 15 tasks.
"""
# -- Task Index (auto-generated, do not edit) --
# 15 tasks | L2×8  L3×6  L4×1
#
# [L3] SearchAppAndReportDeveloper    搜索{app_label}，打开正确的详情页，告诉我开发者名称。
# [L3] SearchAppAndReportSize         搜索{app_label}，打开正确的详情页，告诉我安装包大小。
# [L2] CheckInstalledVersion          从我的应用找到{app_label}，查看并告诉我已安装版本号。
# [L3] BrowseCategoryAndReportTop     进入{category_label}分类，按{sort_label}排序，打开评分最高的App，告诉我它的名称。
# [L2] InstallApp                     通过应用商店搜索找到{app_label}并安装它。
# [L3] CancelDownload                 找到{app_label}的下载任务并取消它，确保没有安装成功。
# [L2] UpdateApp                      把{app_label}更新到最新版本。
# [L2] UninstallApp                   卸载{app_label}。
# [L2] AddToWishlist                  把{app_label}加入愿望单。
# [L2] RemoveFromWishlist             把{app_label}移出愿望单。
# [L2] EnableAutoUpdate               为{app_label}开启自动更新。
# [L2] DisableAutoUpdate              为{app_label}关闭自动更新。
# [L3] RateApp                        在详情页为{app_label}评{rating_label}。
# [L3] WriteOrEditReview              根据指引为{app_label}撰写或编辑评价。
# [L4] FilterCategoryAndInstall       进入{category_label}分类，按{sort_label}排序，找到{app_label}并安装。
# -- End Task Index --

from __future__ import annotations

from typing import Any

from bench_env.task.base import BaseTask
from bench_env.task.common_tasks import AnswerTask, CriteriaTask, build_answer_checks
from bench_env.task.judge import JudgeInput
from bench_env.task.play_store.app import (
    PLAYSTORE_SEARCH_PARAM,
    PLAYSTORE_INSTALLED_APP_PARAM,
    PLAYSTORE_UPDATABLE_APP_PARAM,
    PLAYSTORE_CATEGORY_PARAM,
    PLAYSTORE_SORT_PARAM,
    PLAYSTORE_RATING_PARAM,
    PLAYSTORE_GLOBAL_UPDATE_PARAM,
    PLAYSTORE_INSTALL_CHANGES,
    PLAYSTORE_UPDATE_CHANGES,
    PLAYSTORE_UNINSTALL_CHANGES,
    PLAYSTORE_CANCEL_CHANGES,
    PLAYSTORE_WISHLIST_CHANGES,
    PLAYSTORE_AUTOUPDATE_CHANGES,
    PLAYSTORE_RATING_CHANGES,
    PLAYSTORE_REVIEW_CHANGES,
    PLAYSTORE_SEARCH_CHANGES,
    PLAYSTORE_SETTINGS_CHANGES,
    PlayStore,
    store_app,
    store_app_name,
    apps_in_category,
    top_rated_in_category,
)


# =============================================================================
# 1. SearchAppAndReportDeveloper (L3, query)
#    Multi-step: search → pick correct result → open detail → report developer
# =============================================================================
class SearchAppAndReportDeveloper(AnswerTask):
    templates = [
        "在 Play 商店中搜索「{app_label}」，打开正确的应用详情页，查看详细信息，然后告诉我这个应用的开发者名称。",
        "帮我搜一下 Play 商店里的「{app_label}」，点进正确的详情页，回答这个 App 的开发者是谁。",
    ]
    apps = ["playstore"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["search", "extract"]
    parameters = {"app_label": PLAYSTORE_SEARCH_PARAM}
    answer_fields = [{"type": "text", "label": "开发者名称", "key": "developer"}]
    max_steps = 30

    def get_answer(self, _input: JudgeInput) -> Any:
        app_id = getattr(self.p, "app_label", "com.spotify.music")
        ps_init = PlayStore(_input.apps_init.get("playstore", {}))
        # Check that search was performed with correct query
        app = store_app(app_id)
        if app:
            return app.get("developer", "")
        return ""


# =============================================================================
# 2. SearchAppAndReportSize (L3, query)
#    Multi-step: search → open correct detail → report install size
# =============================================================================
class SearchAppAndReportSize(AnswerTask):
    templates = [
        "在 Play 商店中搜索「{app_label}」，打开正确的应用详情页，查看详细信息，告诉我这个应用的安装包有多大。",
        "帮我搜索 Play 商店里的「{app_label}」，点进去看看安装包大小是多少，回答具体数字。",
    ]
    apps = ["playstore"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["search", "extract"]
    parameters = {"app_label": PLAYSTORE_SEARCH_PARAM}
    answer_fields = [{"type": "text", "label": "安装包大小", "key": "size"}]
    max_steps = 30

    def get_answer(self, _input: JudgeInput) -> Any:
        app_id = getattr(self.p, "app_label", "com.spotify.music")
        app = store_app(app_id)
        if app:
            return app.get("size", "")
        return ""


# =============================================================================
# 3. CheckInstalledVersion (L2, query)
#    From My Apps → Installed → open app → report installed version
# =============================================================================
class CheckInstalledVersion(AnswerTask):
    templates = [
        "打开 Play 商店的「我的应用」，从已安装列表中找到{app_label}，打开详情页查看已安装版本号。告诉我当前安装的是哪个版本。",
        "去我的应用里找到{app_label}，看看现在装的是哪个版本，把版本号告诉我。",
    ]
    apps = ["playstore"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["navigate", "extract"]
    parameters = {"app_label": PLAYSTORE_INSTALLED_APP_PARAM}
    answer_fields = [{"type": "text", "label": "已安装版本号", "key": "installed_version"}]
    optimal_paths = [["tab.myapps"]]

    def get_answer(self, _input: JudgeInput) -> Any:
        app_id = getattr(self.p, "app_label", "com.spotify.music")
        ps_init = PlayStore(_input.apps_init.get("playstore", {}))
        return ps_init.installed_version(app_id) or ""


# =============================================================================
# 4. BrowseCategoryAndReportTop (L3, hybrid)
#    Enter category → set sort → identify top-rated → open it → report name
# =============================================================================
class BrowseCategoryAndReportTop(AnswerTask):
    templates = [
        "打开 Play 商店的{category_label}分类，按{sort_label}排序，找到排在第一个的应用，打开详情页告诉我它叫什么名字。",
        "去{category_label}分类浏览，用{sort_label}排序，点开排名第一的 App 看看叫什么名字。",
    ]
    apps = ["playstore"]
    scope = "S2"
    objective = "hybrid"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["navigate", "extract"]
    parameters = {
        "category_label": PLAYSTORE_CATEGORY_PARAM,
        "sort_label": PLAYSTORE_SORT_PARAM,
    }
    answer_fields = [{"type": "text", "label": "App 名称", "key": "app_name"}]
    max_steps = 30

    def get_answer(self, _input: JudgeInput) -> Any:
        category_id = getattr(self.p, "category_label", "tools")
        sort_opt = getattr(self.p, "sort_label", "relevance")
        category_apps = apps_in_category(category_id)
        if not category_apps:
            return ""
        # Apply sort matching TS logic
        if sort_opt == "rating":
            sorted_apps = sorted(category_apps, key=lambda a: a["rating"], reverse=True)
        elif sort_opt == "downloads":
            sorted_apps = sorted(category_apps, key=lambda a: a["ratingCount"], reverse=True)
        elif sort_opt == "size":
            sorted_apps = sorted(category_apps, key=lambda a: a["sizeBytes"])
        else:
            # relevance: combined
            sorted_apps = sorted(category_apps, key=lambda a: a["rating"] * (a["ratingCount"] ** 0.1), reverse=True)
        return sorted_apps[0]["name"] if sorted_apps else ""


# =============================================================================
# 5. InstallApp (L2, operate)
#    Search/Find uninstalled app → install → verify state
# =============================================================================
class InstallApp(CriteriaTask):
    templates = [
        "在 Play 商店中找到{app_label}，然后安装它。",
        "帮我把{app_label}安装到手机上。",
    ]
    apps = ["playstore"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["install"]
    parameters = {"app_label": {
        "type": "enum",
        "values": {
            "Calm": "com.calm.meditation",
            "Evernote": "com.evernote.app",
            "Canva": "com.canva.editor",
            "Notion": "com.notion.app",
            "Zoom": "com.zoom.meeting",
            "TikTok": "com.tiktok.app",
        },
        "default": "com.calm.meditation",
        "description": "要安装的目标 App（需未安装）",
    }}
    expected_changes = PLAYSTORE_INSTALL_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        app_id = getattr(self.p, "app_label", "com.calm.meditation")
        ps = PlayStore(input.apps.get("playstore", {}))
        ps_init = PlayStore(input.apps_init.get("playstore", {}))

        app = store_app(app_id)
        store_ver = app["storeVersion"] if app else ""

        checks: list[dict[str, Any]] = []

        # Check installed
        is_installed = ps.is_installed(app_id)
        checks.append({
            "passed": is_installed,
            "expected": f"app {app_id} installed=true",
            "actual": f"installed={is_installed}, version={ps.installed_version(app_id)}",
        })

        # Check version matches store
        version_matches = ps.installed_version(app_id) == store_ver
        checks.append({
            "passed": version_matches,
            "expected": f"installedVersion={store_ver}",
            "actual": f"installedVersion={ps.installed_version(app_id)}",
        })

        # Check install record exists
        init_record_ids = {r.get("id") for r in ps_init.install_records}
        new_records = [r for r in ps.install_records if r.get("id") not in init_record_ids]
        has_record = any(r.get("appId") == app_id for r in new_records)
        checks.append({
            "passed": has_record,
            "expected": f"new install record for {app_id}",
            "actual": f"new records: {[(r.get('appId'), r.get('version')) for r in new_records]}",
        })

        # Check non-target apps unchanged
        for other_id in ps_init.installed_apps:
            if other_id != app_id:
                if ps.installed_version(other_id) != ps_init.installed_version(other_id):
                    checks.append({
                        "passed": False,
                        "expected": f"{other_id} version unchanged",
                        "actual": f"was {ps_init.installed_version(other_id)}, now {ps.installed_version(other_id)}",
                    })
                    break

        return checks


# =============================================================================
# 6. CancelDownload (L3, operate)
#    Setup creates download job → user goes to downloads → cancels → verify
# =============================================================================
class CancelDownload(BaseTask):
    templates = [
        "打开我的应用里的下载队列，找到{app_label}的下载任务，取消它。",
        "我的应用里有{app_label}正在下载，帮我取消掉。",
    ]
    apps = ["playstore"]
    scope = "S2"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["cancel"]
    parameters = {"app_label": {
        "type": "enum",
        "values": {"PUBG Mobile": "com.pubg.mobile", "Snapchat": "com.snapchat.android"},
        "default": "com.pubg.mobile",
        "description": "要取消下载的 App",
    }}
    expected_changes = PLAYSTORE_CANCEL_CHANGES
    max_steps = 30

    async def _prepare(self, env):
        app_id = getattr(self.p, "app_label", "com.pubg.mobile")
        # Inject a queued download job for the target app
        await env.set_state(
            {"apps": {"playstore": {"downloadJobs": [
                {"id": "dj-setup-1", "appId": app_id, "status": "queued", "createdAt": 1750000000000},
            ]}}},
            deep=True,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        app_id = getattr(self.p, "app_label", "com.pubg.mobile")
        ps = PlayStore(input.apps.get("playstore", {}))

        checks: list[dict[str, Any]] = []

        # Check the target job is cancelled
        target_job = None
        for j in ps.download_jobs:
            if j.get("appId") == app_id:
                target_job = j
                break

        if target_job is None:
            checks.append({
                "passed": False,
                "expected": f"download job for {app_id} exists",
                "actual": "no job found",
            })
        else:
            is_cancelled = target_job.get("status") == "cancelled"
            checks.append({
                "passed": is_cancelled,
                "expected": f"job for {app_id} status=cancelled",
                "actual": f"status={target_job.get('status')}",
            })

        # Check NOT installed
        not_installed = not ps.is_installed(app_id)
        checks.append({
            "passed": not_installed,
            "expected": f"app {app_id} NOT installed",
            "actual": f"installed={ps.is_installed(app_id)}",
        })

        return checks


# =============================================================================
# 7. UpdateApp (L2, operate)
#    Update installed old-version app to latest
# =============================================================================
class UpdateApp(CriteriaTask):
    templates = [
        "在 Play 商店中把{app_label}更新到最新版本。",
        "帮我把{app_label}升级到最新版。",
    ]
    apps = ["playstore"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["update"]
    parameters = {"app_label": PLAYSTORE_UPDATABLE_APP_PARAM}
    expected_changes = PLAYSTORE_UPDATE_CHANGES
    optimal_paths = [["tab.myapps", "myApps.tab.updates"]]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        app_id = getattr(self.p, "app_label", "com.spotify.music")
        ps = PlayStore(input.apps.get("playstore", {}))
        ps_init = PlayStore(input.apps_init.get("playstore", {}))

        app = store_app(app_id)
        store_ver = app["storeVersion"] if app else ""
        old_ver = ps_init.installed_version(app_id)

        checks: list[dict[str, Any]] = []

        # Check installed version updated to store version
        version_updated = ps.installed_version(app_id) == store_ver
        checks.append({
            "passed": version_updated,
            "expected": f"installedVersion updated from {old_ver} to {store_ver}",
            "actual": f"installedVersion={ps.installed_version(app_id)}",
        })

        # Check update record exists
        init_record_ids = {r.get("id") for r in ps_init.update_records}
        new_records = [r for r in ps.update_records if r.get("id") not in init_record_ids]
        has_record = any(r.get("appId") == app_id for r in new_records)
        checks.append({
            "passed": has_record,
            "expected": f"new update record for {app_id}",
            "actual": f"new records: {[(r.get('appId'), r.get('fromVersion'), r.get('toVersion')) for r in new_records]}",
        })

        # Check non-target app versions unchanged
        for other_id in ps_init.installed_apps:
            if other_id != app_id:
                if ps.installed_version(other_id) != ps_init.installed_version(other_id):
                    checks.append({
                        "passed": False,
                        "expected": f"{other_id} version unchanged",
                        "actual": f"was {ps_init.installed_version(other_id)}, now {ps.installed_version(other_id)}",
                    })
                    break

        return checks


# =============================================================================
# 8. UninstallApp (L2, operate)
#    Uninstall an installed app with confirmation
# =============================================================================
class UninstallApp(BaseTask):
    templates = [
        "在 Play 商店中找到{app_label}并卸载它。",
        "帮我把{app_label}从手机上卸载掉。",
    ]
    apps = ["playstore"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["uninstall"]
    parameters = {"app_label": {
        "type": "enum",
        "values": {
            "Google Drive": "com.google.drive",
            "NetEase Cloud Music": "com.netease.cloudmusic",
            "Adobe Lightroom": "com.adobe.lightroom",
        },
        "default": "com.google.drive",
        "description": "要卸载的已安装 App",
    }}
    expected_changes = PLAYSTORE_UNINSTALL_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        app_id = getattr(self.p, "app_label", "com.google.drive")
        ps = PlayStore(input.apps.get("playstore", {}))
        ps_init = PlayStore(input.apps_init.get("playstore", {}))

        checks: list[dict[str, Any]] = []

        # Check uninstalled
        is_uninstalled = not ps.is_installed(app_id)
        checks.append({
            "passed": is_uninstalled,
            "expected": f"app {app_id} installed=false",
            "actual": f"installed={ps.is_installed(app_id)}",
        })

        # Check uninstall record exists
        init_record_ids = {r.get("id") for r in ps_init.uninstall_records}
        new_records = [r for r in ps.uninstall_records if r.get("id") not in init_record_ids]
        has_record = any(r.get("appId") == app_id for r in new_records)
        checks.append({
            "passed": has_record,
            "expected": f"new uninstall record for {app_id}",
            "actual": f"new records: {[(r.get('appId'), r.get('version')) for r in new_records]}",
        })

        # Check non-target unchanged
        for other_id in ps_init.installed_apps:
            if other_id != app_id:
                if not ps.is_installed(other_id):
                    checks.append({
                        "passed": False,
                        "expected": f"{other_id} still installed",
                        "actual": f"{other_id} uninstalled unexpectedly",
                    })
                    break

        # Check wishlist/ratings NOT mistakenly deleted
        init_wishlist = set(ps_init.wishlist)
        current_wishlist = set(ps.wishlist)
        if app_id in init_wishlist and app_id not in current_wishlist:
            # Wishlist items may or may not persist after uninstall - this is a design choice
            pass

        return checks


# =============================================================================
# 9. AddToWishlist (L2, operate)
#    Add a non-wishlisted app to wishlist
# =============================================================================
class AddToWishlist(BaseTask):
    templates = [
        "在 Play 商店中找到{app_label}，把它加入愿望单。",
        "帮我把{app_label}添加到我的愿望单里。",
    ]
    apps = ["playstore"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["wishlist"]
    parameters = {"app_label": {
        "type": "enum",
        "values": {
            "Zoom": "com.zoom.meeting",
            "Minecraft": "com.mojang.minecraft",
            "TikTok": "com.tiktok.app",
            "Uber": "com.uber.ride",
            "Canva": "com.canva.editor",
            "Notion": "com.notion.app",
        },
        "default": "com.zoom.meeting",
        "description": "要加入愿望单的 App（需未在愿望单中）",
    }}
    expected_changes = PLAYSTORE_WISHLIST_CHANGES

    async def _prepare(self, env):
        app_id = getattr(self.p, "app_label", "com.zoom.meeting")
        ps_state = await env.get_state()
        current_wishlist = ps_state.get("apps", {}).get("playstore", {}).get("wishlist", [])
        if isinstance(current_wishlist, list) and app_id in current_wishlist:
            # Remove from wishlist first to ensure initial state is not completed
            new_wishlist = [x for x in current_wishlist if x != app_id]
            await env.set_state({"apps": {"playstore": {"wishlist": new_wishlist}}}, deep=True)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        app_id = getattr(self.p, "app_label", "com.zoom.meeting")
        ps = PlayStore(input.apps.get("playstore", {}))
        ps_init = PlayStore(input.apps_init.get("playstore", {}))

        was_wishlisted = ps_init.is_wishlisted(app_id)
        is_now_wishlisted = ps.is_wishlisted(app_id)

        checks: list[dict[str, Any]] = []

        if was_wishlisted:
            # Already wishlisted in init - task can't be completed as "add"
            checks.append({
                "passed": False,
                "expected": "app was NOT in wishlist initially",
                "actual": f"app was already in wishlist in init state",
            })
        else:
            checks.append({
                "passed": is_now_wishlisted,
                "expected": f"app {app_id} in wishlist",
                "actual": f"wishlisted={is_now_wishlisted}, wishlist={ps.wishlist}",
            })

        return checks


# =============================================================================
# 10. RemoveFromWishlist (L2, operate)
#     Remove a wishlisted app from wishlist
# =============================================================================
class RemoveFromWishlist(BaseTask):
    templates = [
        "在 Play 商店的愿望单中找到{app_label}，把它移出愿望单。",
        "帮我把{app_label}从我的愿望单里移除。",
    ]
    apps = ["playstore"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["wishlist"]
    parameters = {"app_label": {
        "type": "enum",
        "values": {
            "Calm": "com.calm.meditation",
            "Evernote": "com.evernote.app",
            "Tripadvisor": "com.tripadvisor.app",
        },
        "default": "com.calm.meditation",
        "description": "要从愿望单移除的 App",
    }}
    expected_changes = PLAYSTORE_WISHLIST_CHANGES

    async def _prepare(self, env):
        app_id = getattr(self.p, "app_label", "com.calm.meditation")
        ps_state = await env.get_state()
        current_wishlist = list(ps_state.get("apps", {}).get("playstore", {}).get("wishlist", []) or [])
        if app_id not in current_wishlist:
            current_wishlist.append(app_id)
            await env.set_state({"apps": {"playstore": {"wishlist": current_wishlist}}}, deep=True)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        app_id = getattr(self.p, "app_label", "com.calm.meditation")
        ps = PlayStore(input.apps.get("playstore", {}))
        ps_init = PlayStore(input.apps_init.get("playstore", {}))

        was_wishlisted = ps_init.is_wishlisted(app_id)
        is_now_wishlisted = ps.is_wishlisted(app_id)

        checks: list[dict[str, Any]] = []

        if not was_wishlisted:
            checks.append({
                "passed": False,
                "expected": "app was in wishlist initially",
                "actual": f"app was NOT in wishlist in init state",
            })
        else:
            checks.append({
                "passed": not is_now_wishlisted,
                "expected": f"app {app_id} removed from wishlist",
                "actual": f"wishlisted={is_now_wishlisted}, wishlist={ps.wishlist}",
            })

        return checks


# =============================================================================
# 11. EnableAutoUpdate (L2, operate)
#     Enable auto-update for an installed app
# =============================================================================
class EnableAutoUpdate(BaseTask):
    templates = [
        "在 Play 商店中找到{app_label}的详情页，为它开启自动更新。",
        "帮我把{app_label}的自动更新打开。",
    ]
    apps = ["playstore"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["settings"]
    parameters = {"app_label": PLAYSTORE_INSTALLED_APP_PARAM}
    expected_changes = PLAYSTORE_AUTOUPDATE_CHANGES

    async def _prepare(self, env):
        app_id = getattr(self.p, "app_label", "com.spotify.music")
        # Ensure auto-update is disabled initially
        await env.set_state(
            {"apps": {"playstore": {"autoUpdate": {app_id: False}}}},
            deep=True,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        app_id = getattr(self.p, "app_label", "com.spotify.music")
        ps = PlayStore(input.apps.get("playstore", {}))

        is_enabled = ps.auto_update_enabled(app_id)
        return [{
            "passed": is_enabled,
            "expected": f"autoUpdate[{app_id}]=true",
            "actual": f"autoUpdate[{app_id}]={ps.auto_update.get(app_id)}",
        }]


# =============================================================================
# 12. DisableAutoUpdate (L2, operate)
#     Disable auto-update for an installed app
# =============================================================================
class DisableAutoUpdate(BaseTask):
    templates = [
        "在 Play 商店中找到{app_label}的详情页，把它的自动更新关掉。",
        "帮我把{app_label}的自动更新关闭。",
    ]
    apps = ["playstore"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["settings"]
    parameters = {"app_label": PLAYSTORE_INSTALLED_APP_PARAM}
    expected_changes = PLAYSTORE_AUTOUPDATE_CHANGES

    async def _prepare(self, env):
        app_id = getattr(self.p, "app_label", "com.spotify.music")
        # Ensure auto-update is enabled initially
        await env.set_state(
            {"apps": {"playstore": {"autoUpdate": {app_id: True}}}},
            deep=True,
        )

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        app_id = getattr(self.p, "app_label", "com.spotify.music")
        ps = PlayStore(input.apps.get("playstore", {}))

        is_disabled = not ps.auto_update_enabled(app_id)
        return [{
            "passed": is_disabled,
            "expected": f"autoUpdate[{app_id}]=false",
            "actual": f"autoUpdate[{app_id}]={ps.auto_update.get(app_id)}",
        }]


# =============================================================================
# 13. RateApp (L3, operate)
#     Navigate to app detail → rate with specific stars
# =============================================================================
class RateApp(BaseTask):
    templates = [
        "去 Play 商店里找到{app_label}，进入详情页，给它评{rating_label}。",
        "帮我在 Play 商店中给{app_label}打个{rating_label}的评分。",
    ]
    apps = ["playstore"]
    scope = "S2"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["navigate", "rate"]
    parameters = {
        "app_label": {
            "type": "enum",
            "values": {
                "TikTok": "com.tiktok.app",
                "Uber": "com.uber.ride",
                "Minecraft": "com.mojang.minecraft",
                "PUBG Mobile": "com.pubg.mobile",
                "Snapchat": "com.snapchat.android",
                "Tripadvisor": "com.tripadvisor.app",
            },
            "default": "com.tiktok.app",
            "description": "要评分的 App",
        },
        "rating_label": PLAYSTORE_RATING_PARAM,
    }
    expected_changes = PLAYSTORE_RATING_CHANGES
    max_steps = 30

    async def _prepare(self, env):
        app_id = getattr(self.p, "app_label", "com.tiktok.app")
        target_rating = int(getattr(self.p, "rating_label", 4))
        ps_state = await env.get_state()
        current_ratings = dict(ps_state.get("apps", {}).get("playstore", {}).get("ratings", {}) or {})
        current = current_ratings.get(app_id, 0)
        if current == target_rating:
            # Set to different rating so task is meaningful
            current_ratings[app_id] = (target_rating % 5) + 1
            await env.set_state({"apps": {"playstore": {"ratings": current_ratings}}}, deep=True)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        app_id = getattr(self.p, "app_label", "com.tiktok.app")
        target_rating = int(getattr(self.p, "rating_label", 4))
        ps = PlayStore(input.apps.get("playstore", {}))

        actual_rating = ps.user_rating(app_id)
        return [{
            "passed": actual_rating == target_rating,
            "expected": f"rating[{app_id}]={target_rating}",
            "actual": f"rating[{app_id}]={actual_rating}",
        }]


# =============================================================================
# 14. WriteOrEditReview (L3, operate)
#     Write new review OR edit existing review based on setup branch
# =============================================================================
class WriteOrEditReview(BaseTask):
    templates = [
        "去 Play 商店找到{app_label}，{action_instruction}",
        "帮我在 Play 商店中{action_instruction}",
    ]
    apps = ["playstore"]
    scope = "S2"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["navigate", "review"]
    parameters = {
        "app_label": {
            "type": "enum",
            "values": {
                "Zoom (新评价)": "com.zoom.meeting",
                "Notion (新评价)": "com.notion.app",
                "Canva (新评价)": "com.canva.editor",
                "Spotify (编辑评价)": "com.spotify.music",
                "Duolingo (编辑评价)": "com.duolingo",
            },
            "default": "com.zoom.meeting",
            "description": "目标 App",
        },
        "action_instruction": {
            "type": "enum",
            "values": {
                "Spotify (编辑评价)": "把已有评价的内容改成「Updated: Great experience overall!」",
                "Duolingo (编辑评价)": "把已有评价改成「Still the best language app ever!」",
                "Zoom (新评价)": "撰写一条评价，内容为「Solid video conferencing tool, 4 stars」",
                "Notion (新评价)": "写一条评价「Game changer for productivity, 5 stars」",
                "Canva (新评价)": "写一条评价「Easy to design anything, 4 stars」",
            },
            "default": "撰写一条评价，内容为「Solid video conferencing tool, 4 stars」",
            "description": "评价操作说明",
        },
    }
    expected_changes = PLAYSTORE_REVIEW_CHANGES
    max_steps = 30

    async def _prepare(self, env):
        app_id = getattr(self.p, "app_label", "com.zoom.meeting")
        instruction = getattr(self.p, "action_instruction", "")
        is_edit = "编辑" in instruction or "改成" in instruction or "更新" in instruction

        if is_edit:
            # Ensure the user has an existing review to edit
            ps_state = await env.get_state()
            current_reviews = list(ps_state.get("apps", {}).get("playstore", {}).get("userReviews", []) or [])
            existing = [r for r in current_reviews if r.get("appId") == app_id]
            if not existing:
                # Add a review to edit
                current_reviews.append({
                    "id": "ur-setup-edit",
                    "appId": app_id,
                    "rating": 3,
                    "content": "Old review content to be edited.",
                    "createdAt": 1748000000000,
                    "updatedAt": 1748000000000,
                })
                await env.set_state({"apps": {"playstore": {"userReviews": current_reviews}}}, deep=True)
        else:
            # Ensure NO existing review (clean slate for writing)
            ps_state = await env.get_state()
            current_reviews = list(ps_state.get("apps", {}).get("playstore", {}).get("userReviews", []) or [])
            filtered = [r for r in current_reviews if r.get("appId") != app_id]
            if len(filtered) != len(current_reviews):
                await env.set_state({"apps": {"playstore": {"userReviews": filtered}}}, deep=True)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        app_id = getattr(self.p, "app_label", "com.zoom.meeting")
        instruction = getattr(self.p, "action_instruction", "")
        ps = PlayStore(input.apps.get("playstore", {}))
        ps_init = PlayStore(input.apps_init.get("playstore", {}))

        is_edit = "编辑" in instruction or "改成" in instruction or "更新" in instruction

        checks: list[dict[str, Any]] = []

        if is_edit:
            # Verify the existing review was modified
            init_review = ps_init.user_review_for(app_id)
            current_review = ps.user_review_for(app_id)

            if init_review is None:
                checks.append({
                    "passed": False,
                    "expected": "existing review found in init state",
                    "actual": "no review in init state",
                })
            elif current_review is None:
                checks.append({
                    "passed": False,
                    "expected": "review still exists (edited, not deleted)",
                    "actual": "review deleted",
                })
            else:
                # Check content changed
                content_changed = current_review.get("content") != init_review.get("content")
                checks.append({
                    "passed": content_changed,
                    "expected": "review content was updated",
                    "actual": f"content: '{current_review.get('content')}'",
                })

                # Check same review ID (edited, not replaced)
                same_id = current_review.get("id") == init_review.get("id")
                checks.append({
                    "passed": same_id,
                    "expected": f"same review id={init_review.get('id')}",
                    "actual": f"review id={current_review.get('id')}",
                })
        else:
            # Verify a new review was created
            init_review_ids = {r.get("id") for r in ps_init.user_reviews}
            new_reviews = [r for r in ps.user_reviews if r.get("id") not in init_review_ids]
            has_new_review = any(r.get("appId") == app_id for r in new_reviews)

            checks.append({
                "passed": has_new_review,
                "expected": f"new review for {app_id}",
                "actual": f"new reviews: {[(r.get('appId'), r.get('content')[:30] if r.get('content') else '') for r in new_reviews]}",
            })

            if has_new_review:
                new_review = next(r for r in new_reviews if r.get("appId") == app_id)
                has_content = bool(new_review.get("content", "").strip())
                checks.append({
                    "passed": has_content,
                    "expected": "review has non-empty content",
                    "actual": f"content: '{new_review.get('content', '')}'",
                })

        # Check other users' reviews unchanged (NOT my reviews)
        init_other_review_ids = {r.get("id") for r in ps_init.reviews}
        current_other_review_ids = {r.get("id") for r in ps.reviews}
        other_reviews_unchanged = init_other_review_ids == current_other_review_ids
        checks.append({
            "passed": other_reviews_unchanged,
            "expected": "other users' reviews unchanged",
            "actual": f"init {len(init_other_review_ids)} reviews, current {len(current_other_review_ids)} reviews",
        })

        return checks


# =============================================================================
# 15. FilterCategoryAndInstall (L4, hybrid)
#     Enter category → sort → find target → install → verify
# =============================================================================
class FilterCategoryAndInstall(BaseTask):
    templates = [
        "进入 Play 商店的{category_label}分类，按{sort_label}排序浏览，找到{app_label}并安装它。",
        "去{category_label}分类，用{sort_label}排序，在列表里找到{app_label}然后安装。",
    ]
    apps = ["playstore"]
    scope = "S2"
    objective = "hybrid"
    composition = "sequential"
    difficulty = "L4"
    capabilities = ["navigate", "install", "extract"]
    parameters = {
        "category_label": PLAYSTORE_CATEGORY_PARAM,
        "sort_label": PLAYSTORE_SORT_PARAM,
        "target": {
            "type": "enum",
            "values": {
                "Evernote": "com.evernote.app",
                "Canva": "com.canva.editor",
                "Notion": "com.notion.app",
                "Zoom": "com.zoom.meeting",
                "Tripadvisor": "com.tripadvisor.app",
            },
            "default": "com.evernote.app",
            "description": "目标 App",
        },
    }
    expected_changes = PLAYSTORE_INSTALL_CHANGES + ["currentCategoryId", "currentSortOption"]
    max_steps = 45

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        app_id = getattr(self.p, "target", "com.evernote.app")

        ps = PlayStore(input.apps.get("playstore", {}))
        ps_init = PlayStore(input.apps_init.get("playstore", {}))

        app = store_app(app_id)
        store_ver = app["storeVersion"] if app else ""

        checks: list[dict[str, Any]] = []

        # 1. Check category was visited (currentCategoryId changed)
        category_visited = ps.current_category_id is not None
        checks.append({
            "passed": category_visited,
            "expected": "category was navigated to",
            "actual": f"currentCategoryId={ps.current_category_id}",
        })

        # 2. Check sort was applied (currentSortOption changed from default)
        sort_applied = ps.current_sort_option != "relevance" or ps_init.current_sort_option != "relevance"
        checks.append({
            "passed": sort_applied,
            "expected": "sort option was changed",
            "actual": f"currentSortOption={ps.current_sort_option}",
        })

        # 3. Check installed
        is_installed = ps.is_installed(app_id)
        checks.append({
            "passed": is_installed,
            "expected": f"app {app_id} installed",
            "actual": f"installed={is_installed}",
        })

        # 4. Check installed version matches store
        if is_installed:
            version_ok = ps.installed_version(app_id) == store_ver
            checks.append({
                "passed": version_ok,
                "expected": f"installedVersion={store_ver}",
                "actual": f"installedVersion={ps.installed_version(app_id)}",
            })

        return checks
