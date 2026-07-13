"""
GoogleDrive task correctness tests — offline judge verification.
"""
from __future__ import annotations

import copy
import inspect
import json
from pathlib import Path
from typing import Any

import pytest

from bench_env.task.google_drive.app import GoogleDrive
from bench_env.task.google_drive import tasks as _tasks_module
from bench_env.task.base import BaseTask
from bench_env.tests.conftest import make_judge_input

ALL_TASK_CLASSES: list[type[BaseTask]] = [
    obj
    for _, obj in inspect.getmembers(_tasks_module, inspect.isclass)
    if issubclass(obj, BaseTask) and obj is not BaseTask and obj.__module__ == _tasks_module.__name__
]
ALL_TASK_IDS = [cls.__name__ for cls in ALL_TASK_CLASSES]

TEST_OS_STATE = {"time": {"timestamp": 1752576000000}}
DEFAULT_ROUTE = {"app": "googledrive", "path": "/"}


def _load_defaults() -> dict[str, Any]:
    path = Path(__file__).resolve().parents[3] / "apps" / "GoogleDrive" / "data" / "defaults.json"
    return json.loads(path.read_text(encoding="utf-8"))


DEFAULTS = _load_defaults()


def _make_input(
    init_googledrive: dict[str, Any],
    curr_googledrive: dict[str, Any] | None = None,
    *,
    answer: str = "",
    route: dict[str, Any] | None = None,
) -> Any:
    init_apps = {"googledrive": init_googledrive}
    curr_apps = {"googledrive": curr_googledrive if curr_googledrive is not None else init_googledrive}
    return make_judge_input(
        {"apps": init_apps, "os": TEST_OS_STATE},
        {"apps": curr_apps, "os": TEST_OS_STATE},
        route=route or DEFAULT_ROUTE,
        answer=answer,
    )


# =============================================================================
# Task count
# =============================================================================

def test_exactly_15_tasks():
    assert len(ALL_TASK_CLASSES) == 15, (
        f"Expected 15 tasks, got {len(ALL_TASK_CLASSES)}: {ALL_TASK_IDS}"
    )


@pytest.mark.parametrize("task_cls", ALL_TASK_CLASSES, ids=ALL_TASK_IDS)
def test_task_description(task_cls: type[BaseTask]):
    task = task_cls()
    desc = task.description
    assert isinstance(desc, str) and len(desc) > 0


# =============================================================================
# Positive cases
# =============================================================================

def test_create_new_folder_positive():
    from bench_env.task.google_drive.tasks import CreateNewFolder
    task = CreateNewFolder()
    task._sampled_params = {"folderName": "project-alpha"}
    init_state = copy.deepcopy(DEFAULTS)
    curr_state = copy.deepcopy(DEFAULTS)
    curr_state.setdefault("files", []).append({
        "id": "file-999", "name": "project-alpha", "type": "folder",
        "trashed": False, "parentId": None,
    })
    inp = _make_input(init_state, curr_state)
    results = task.check_goals(inp)
    assert len(results) >= 1
    assert results[0]["passed"] is True, f"Expected passed=True, got {results[0]}"


def test_rename_file_positive():
    from bench_env.task.google_drive.tasks import RenameFile
    task = RenameFile()
    task._sampled_params = {"fileId": "file-007", "newName": "meeting-notes-july-renamed", "fileName": "meeting-notes-2026-07-01"}
    init_state = copy.deepcopy(DEFAULTS)
    curr_state = copy.deepcopy(DEFAULTS)
    for f in curr_state["files"]:
        if f["id"] == "file-007":
            f["name"] = "meeting-notes-july-renamed"
    inp = _make_input(init_state, curr_state)
    results = task.check_goals(inp)
    assert results[0]["passed"] is True


def test_star_file_positive():
    from bench_env.task.google_drive.tasks import StarFile
    task = StarFile()
    task._sampled_params = {"fileId": "file-002", "fileName": "Annual Budget 2026"}
    init_state = copy.deepcopy(DEFAULTS)
    curr_state = copy.deepcopy(DEFAULTS)
    for f in curr_state["files"]:
        if f["id"] == "file-002":
            f["starred"] = True
    inp = _make_input(init_state, curr_state)
    results = task.check_goals(inp)
    assert results[0]["passed"] is True


def test_unstar_file_positive():
    from bench_env.task.google_drive.tasks import UnstarFile
    task = UnstarFile()
    task._sampled_params = {"fileId": "file-001", "fileName": "Q4 Marketing Strategy"}
    init_state = copy.deepcopy(DEFAULTS)
    curr_state = copy.deepcopy(DEFAULTS)
    for f in curr_state["files"]:
        if f["id"] == "file-001":
            f["starred"] = False
    inp = _make_input(init_state, curr_state)
    results = task.check_goals(inp)
    assert results[0]["passed"] is True


def test_trash_file_positive():
    from bench_env.task.google_drive.tasks import TrashFile
    task = TrashFile()
    task._sampled_params = {"fileId": "file-007", "fileName": "meeting-notes-2026-07-01"}
    init_state = copy.deepcopy(DEFAULTS)
    curr_state = copy.deepcopy(DEFAULTS)
    for f in curr_state["files"]:
        if f["id"] == "file-007":
            f["trashed"] = True
            f["trashedFromParentId"] = f.get("parentId")
    inp = _make_input(init_state, curr_state)
    results = task.check_goals(inp)
    assert results[0]["passed"] is True


def test_permanently_delete_positive():
    from bench_env.task.google_drive.tasks import PermanentlyDeleteFile
    task = PermanentlyDeleteFile()
    task._sampled_params = {"fileId": "file-016", "fileName": "Old Presentation Template"}
    init_state = copy.deepcopy(DEFAULTS)
    curr_state = copy.deepcopy(DEFAULTS)
    curr_state["files"] = [f for f in curr_state["files"] if f["id"] != "file-016"]
    inp = _make_input(init_state, curr_state)
    results = task.check_goals(inp)
    assert results[0]["passed"] is True


def test_restore_from_trash_positive():
    from bench_env.task.google_drive.tasks import RestoreFromTrash
    task = RestoreFromTrash()
    task._sampled_params = {"fileId": "file-015", "fileName": "Trash Old Draft", "originalParentId": "file-010"}
    init_state = copy.deepcopy(DEFAULTS)
    curr_state = copy.deepcopy(DEFAULTS)
    for f in curr_state["files"]:
        if f["id"] == "file-015":
            f["trashed"] = False
            f["parentId"] = "file-010"
    inp = _make_input(init_state, curr_state)
    results = task.check_goals(inp)
    assert all(r["passed"] for r in results)


def test_share_file_positive():
    from bench_env.task.google_drive.tasks import ShareFileWithViewer
    task = ShareFileWithViewer()
    task._sampled_params = {"fileId": "file-007", "email": "frank.wu@partner.com", "role": "viewer", "fileName": "meeting-notes-2026-07-01"}
    init_state = copy.deepcopy(DEFAULTS)
    curr_state = copy.deepcopy(DEFAULTS)
    for f in curr_state["files"]:
        if f["id"] == "file-007":
            f["permissions"] = list(f.get("permissions", [])) + [
                {"id": "perm-999", "email": "frank.wu@partner.com", "name": "Frank Wu", "role": "viewer", "grantedAt": 1752576000000}
            ]
    inp = _make_input(init_state, curr_state)
    results = task.check_goals(inp)
    assert results[0]["passed"] is True


def test_link_access_positive():
    from bench_env.task.google_drive.tasks import SetLinkAccessToAnyone
    task = SetLinkAccessToAnyone()
    task._sampled_params = {"fileId": "file-007", "fileName": "meeting-notes-2026-07-01"}
    init_state = copy.deepcopy(DEFAULTS)
    curr_state = copy.deepcopy(DEFAULTS)
    for f in curr_state["files"]:
        if f["id"] == "file-007":
            f["linkAccess"] = "anyone_viewer"
            f["shareableLink"] = "https://drive.google.com/file/d/file-007/view"
    inp = _make_input(init_state, curr_state)
    results = task.check_goals(inp)
    assert all(r["passed"] for r in results)


def test_move_file_positive():
    from bench_env.task.google_drive.tasks import MoveFileToFolder
    task = MoveFileToFolder()
    task._sampled_params = {"fileId": "file-007", "fileName": "meeting-notes-2026-07-01", "targetParentId": "file-010", "targetName": "Marketing"}
    init_state = copy.deepcopy(DEFAULTS)
    curr_state = copy.deepcopy(DEFAULTS)
    for f in curr_state["files"]:
        if f["id"] == "file-007":
            f["parentId"] = "file-010"
    inp = _make_input(init_state, curr_state)
    results = task.check_goals(inp)
    assert results[0]["passed"] is True


# =============================================================================
# Negative cases
# =============================================================================

def test_create_folder_negative_wrong_name():
    from bench_env.task.google_drive.tasks import CreateNewFolder
    task = CreateNewFolder()
    task._sampled_params = {"folderName": "project-alpha"}
    init_state = copy.deepcopy(DEFAULTS)
    curr_state = copy.deepcopy(DEFAULTS)
    curr_state.setdefault("files", []).append({
        "id": "file-999", "name": "wrong-name", "type": "folder", "trashed": False, "parentId": None,
    })
    inp = _make_input(init_state, curr_state)
    results = task.check_goals(inp)
    assert results[0]["passed"] is False


def test_trash_negative_not_trashed():
    from bench_env.task.google_drive.tasks import TrashFile
    task = TrashFile()
    task._sampled_params = {"fileId": "file-007", "fileName": "meeting-notes-2026-07-01"}
    init_state = copy.deepcopy(DEFAULTS)
    curr_state = copy.deepcopy(DEFAULTS)  # unchanged
    inp = _make_input(init_state, curr_state)
    results = task.check_goals(inp)
    assert results[0]["passed"] is False


def test_perm_delete_negative_still_exists():
    from bench_env.task.google_drive.tasks import PermanentlyDeleteFile
    task = PermanentlyDeleteFile()
    task._sampled_params = {"fileId": "file-016", "fileName": "Old Presentation Template"}
    init_state = copy.deepcopy(DEFAULTS)
    curr_state = copy.deepcopy(DEFAULTS)
    inp = _make_input(init_state, curr_state)
    results = task.check_goals(inp)
    assert results[0]["passed"] is False
