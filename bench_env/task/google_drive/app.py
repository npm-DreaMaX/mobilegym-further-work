"""
GoogleDrive app state accessor + deterministic samplers.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from bench_env.task.base import BaseApp

_DEFAULTS_PATH = (
    Path(__file__).resolve().parents[3]
    / "apps"
    / "GoogleDrive"
    / "data"
    / "defaults.json"
)
_DEFAULTS = json.loads(_DEFAULTS_PATH.read_text(encoding="utf-8"))

GDRIVE_FILES: list[dict[str, Any]] = _DEFAULTS["files"]


class GoogleDrive(BaseApp):
    """GoogleDrive state accessor."""

    @property
    def files(self) -> list[dict[str, Any]]:
        return self.get_list("files")

    @property
    def user(self) -> dict[str, Any]:
        value = self.get("user")
        return value if isinstance(value, dict) else {}

    @property
    def settings(self) -> dict[str, Any]:
        value = self.get("settings")
        return value if isinstance(value, dict) else {}

    @property
    def search_current(self) -> dict[str, Any]:
        value = self.get("search.current")
        return value if isinstance(value, dict) else {}

    def file_by_id(self, file_id: str) -> dict[str, Any] | None:
        for f in self.files:
            if str(f.get("id") or "") == str(file_id):
                return f
        return None

    def file_by_name(self, name: str) -> dict[str, Any] | None:
        for f in self.files:
            if str(f.get("name") or "") == str(name):
                return f
        return None

    @property
    def active_files(self) -> list[dict[str, Any]]:
        return [f for f in self.files if not f.get("trashed")]

    @property
    def trashed_files(self) -> list[dict[str, Any]]:
        return [f for f in self.files if f.get("trashed")]

    @property
    def starred_files(self) -> list[dict[str, Any]]:
        return [f for f in self.active_files if f.get("starred")]

    @property
    def shared_files(self) -> list[dict[str, Any]]:
        return [f for f in self.active_files if f.get("sharedWithMe")]

    # ── Samplers ────────────────────────────────────────────────────

    @staticmethod
    def sample_searchable_file(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a file with a unique keyword in its name for search tasks."""
        candidates = [
            {"fileId": "file-001", "name": "Q4 Marketing Strategy", "keyword": "Marketing"},
            {"fileId": "file-005", "name": "system-architecture.pdf", "keyword": "architecture"},
            {"fileId": "file-013", "name": "api-design-v2", "keyword": "api-design"},
            {"fileId": "file-020", "name": "competitor-analysis-2026", "keyword": "competitor"},
        ]
        return rng.choice(candidates)

    @staticmethod
    def sample_file_by_type(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a file type for filter tasks."""
        options = [
            {"filterType": "document", "label": "文档"},
            {"filterType": "spreadsheet", "label": "表格"},
            {"filterType": "presentation", "label": "演示文稿"},
            {"filterType": "pdf", "label": "PDF"},
        ]
        return rng.choice(options)

    @staticmethod
    def sample_file_to_rename(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a file to rename. Returns {fileId, name, newName}."""
        candidates = [
            {"fileId": "file-007", "name": "meeting-notes-2026-07-01", "newName": "meeting-notes-july-renamed"},
            {"fileId": "file-008", "name": "onboarding-guide", "newName": "onboarding-handbook-v2"},
            {"fileId": "file-018", "name": "server-log-archive.zip", "newName": "server-logs-q1.zip"},
        ]
        return rng.choice(candidates)

    @staticmethod
    def sample_file_to_move(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a file to move and its target folder."""
        candidates = [
            {"fileId": "file-007", "fileName": "meeting-notes-2026-07-01", "targetParentId": "file-010", "targetName": "Marketing"},
            {"fileId": "file-018", "fileName": "server-log-archive.zip", "targetParentId": "file-011", "targetName": "Engineering"},
            {"fileId": "file-019", "fileName": "welcome-video.mp4", "targetParentId": "file-011", "targetName": "Engineering"},
        ]
        return rng.choice(candidates)

    @staticmethod
    def sample_file_to_star(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample an unstarred file. Returns {fileId, fileName}."""
        pool = [f for f in GDRIVE_FILES if not f.get("starred") and not f.get("trashed")]
        f = rng.choice(pool)
        return {"fileId": f["id"], "fileName": f["name"]}

    @staticmethod
    def sample_starred_file(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a starred file for unstar task."""
        pool = [f for f in GDRIVE_FILES if f.get("starred") and not f.get("trashed")]
        f = rng.choice(pool)
        return {"fileId": f["id"], "fileName": f["name"]}

    @staticmethod
    def sample_file_to_share(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a file for sharing task."""
        candidates = [
            {"fileId": "file-007", "fileName": "meeting-notes-2026-07-01"},
            {"fileId": "file-008", "fileName": "onboarding-guide"},
            {"fileId": "file-009", "fileName": "expense-report-june"},
        ]
        c = rng.choice(candidates)
        share_emails = [
            {"email": "frank.wu@partner.com", "name": "Frank Wu", "role": "viewer"},
            {"email": "grace.liu@company.com", "name": "Grace Liu", "role": "editor"},
        ]
        share = rng.choice(share_emails)
        return {**c, **share}

    @staticmethod
    def sample_file_with_editor(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a file that has a non-owner editor permission."""
        pool = []
        for f in GDRIVE_FILES:
            for p in f.get("permissions", []):
                if p.get("role") == "editor" and p.get("email") != f.get("owner"):
                    pool.append({
                        "fileId": f["id"],
                        "fileName": f["name"],
                        "permissionId": p["id"],
                        "email": p["email"],
                        "name": p.get("name", ""),
                        "currentRole": "editor",
                    })
        return rng.choice(pool) if pool else {"fileId": "file-002", "fileName": "Annual Budget 2026", "permissionId": "perm-003", "email": "bob.wang@company.com", "name": "Bob Wang", "currentRole": "editor"}

    @staticmethod
    def sample_file_with_viewer(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a file that has a viewer permission."""
        pool = []
        for f in GDRIVE_FILES:
            for p in f.get("permissions", []):
                if p.get("role") == "viewer":
                    pool.append({
                        "fileId": f["id"],
                        "fileName": f["name"],
                        "permissionId": p["id"],
                        "email": p["email"],
                        "name": p.get("name", ""),
                    })
        return rng.choice(pool) if pool else {"fileId": "file-008", "fileName": "onboarding-guide", "permissionId": "perm-012", "email": "eve.zhang@company.com", "name": "Eve Zhang"}

    @staticmethod
    def sample_file_for_link_access(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a file with restricted link access."""
        pool = [f for f in GDRIVE_FILES if f.get("linkAccess") == "restricted" and not f.get("trashed")]
        f = rng.choice(pool)
        return {"fileId": f["id"], "fileName": f["name"]}

    @staticmethod
    def sample_file_to_trash(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a non-trashed file."""
        pool = [f for f in GDRIVE_FILES if not f.get("trashed") and f.get("type") != "folder"]
        f = rng.choice(pool)
        return {"fileId": f["id"], "fileName": f["name"]}

    @staticmethod
    def sample_trashed_file(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a trashed file for restore or permanent delete."""
        pool = [f for f in GDRIVE_FILES if f.get("trashed")]
        f = rng.choice(pool)
        return {"fileId": f["id"], "fileName": f["name"], "originalParentId": f.get("trashedFromParentId")}

    @staticmethod
    def sample_trashed_file_for_perm_delete(_env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        """Sample a different trashed file for permanent delete (not same as restore target)."""
        pool = [f for f in GDRIVE_FILES if f.get("trashed")]
        f = rng.choice(pool)
        return {"fileId": f["id"], "fileName": f["name"]}
