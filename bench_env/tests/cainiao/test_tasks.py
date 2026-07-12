"""
Cainiao task correctness tests.

Focus: offline judge for ``SearchPackage`` (grounded query). Verifies the four
required scenarios — three negatives and one positive — plus basic task
instantiation / description rendering. No simulator required.
"""

from __future__ import annotations

import copy
import inspect
from pathlib import Path
from typing import Any

import pytest

from bench_env.task.cainiao.app import Cainiao
from bench_env.task.cainiao import tasks as _tasks_module
from bench_env.task.base import BaseTask
from bench_env.tests.conftest import make_judge_input

ALL_TASK_CLASSES: list[type[BaseTask]] = [
    obj
    for _, obj in inspect.getmembers(_tasks_module, inspect.isclass)
    if issubclass(obj, BaseTask) and obj is not BaseTask and obj.__module__ == _tasks_module.__name__
]
ALL_TASK_IDS = [cls.__name__ for cls in ALL_TASK_CLASSES]

TEST_OS_STATE = {"time": {"timestamp": 1752576000000}}
DEFAULT_ROUTE = {"app": "cainiao", "path": "/"}


def _load_defaults() -> dict[str, Any]:
    path = Path(__file__).resolve().parents[3] / "apps" / "Cainiao" / "data" / "defaults.json"
    return json_load(path)


def json_load(path: Path) -> dict[str, Any]:
    import json
    return json.loads(path.read_text(encoding="utf-8"))


DEFAULTS = _load_defaults()
BASE_STATE: dict[str, Any] = copy.deepcopy(DEFAULTS)


def _make_task_input(
    init_cainiao: dict[str, Any],
    curr_cainiao: dict[str, Any],
    *,
    init_sheet: dict[str, Any] | None = None,
    curr_sheet: dict[str, Any] | None = None,
    route: dict[str, Any] | None = None,
    answer: str | None = None,
):
    init_apps: dict[str, Any] = {"cainiao": init_cainiao}
    curr_apps: dict[str, Any] = {"cainiao": curr_cainiao}
    if init_sheet is not None:
        init_apps["answer_sheet"] = init_sheet
    if curr_sheet is not None:
        curr_apps["answer_sheet"] = curr_sheet
    return make_judge_input(
        {"apps": init_apps, "os": TEST_OS_STATE},
        {"apps": curr_apps, "os": TEST_OS_STATE},
        route=route or DEFAULT_ROUTE,
        answer=answer,
    )


def _answer_sheet(value: str | None, *, submitted: bool) -> dict[str, Any]:
    """Build an answer_sheet app-state with one text field (index "0")."""
    return {
        "fields": [{"type": "text", "label": "取件码"}],
        "answers": {} if value is None else {"0": value},
        "submitted": submitted,
    }


def _search_current(
    *,
    searched: bool,
    tracking_no: str | None,
    result_package_id: str | None,
) -> dict[str, Any]:
    found = bool(result_package_id)
    return {
        "trackingNo": tracking_no,
        "resultPackageId": result_package_id,
        "resultCount": 1 if found else 0,
        "searched": searched,
    }


def _set_search(state: dict[str, Any], current: dict[str, Any]) -> None:
    state["search"] = {"current": current, "history": state.get("search", {}).get("history", [])}


def _set_viewed(state: dict[str, Any], package_id: str | None) -> None:
    state.setdefault("_temp", {})
    state["_temp"]["lastViewedPackageId"] = package_id


def _make_search_task() -> _tasks_module.SearchPackage:
    task = _tasks_module.SearchPackage()
    # Fixed, non-default target values (do not collide with the 5 default packages).
    task.params["tracking_no"] = "SF9999888877776"
    task.params["pickupCode"] = "7-3-2025"
    task.params["pkgId"] = "pkg-search-target"
    return task


def _inject_target(base: dict[str, Any]) -> dict[str, Any]:
    """State after SearchPackage._post_sample: base + injected target package."""
    state = copy.deepcopy(base)
    pkg = Cainiao.build_search_target_package(
        "SF9999888877776", "7-3-2025", "pkg-search-target"
    )
    state["packages"] = [*state["packages"], pkg]
    return state


# =============================================================================
# Basic structural tests (all 15 tasks)
# =============================================================================


class TestTaskDefinitions:
    @pytest.mark.parametrize("cls", ALL_TASK_CLASSES, ids=ALL_TASK_IDS)
    def test_instantiation(self, cls):
        task = cls()
        assert task.name == cls.__name__
        assert task.templates
        assert "cainiao" in task.apps

    @pytest.mark.parametrize("cls", ALL_TASK_CLASSES, ids=ALL_TASK_IDS)
    def test_description_renders(self, cls):
        task = cls()
        task._env_state = {"os": TEST_OS_STATE}
        desc = task.description
        assert desc
        assert "{" not in desc, f"unfilled placeholder in {cls.__name__}: {desc}"

    @pytest.mark.parametrize("cls", ALL_TASK_CLASSES, ids=ALL_TASK_IDS)
    def test_required_class_attrs(self, cls):
        assert cls.scope in ("S1", "S2", "S3")
        assert cls.objective in ("operate", "query", "hybrid")
        assert cls.composition in ("atomic", "sequential", "transfer", "deep_dive")
        assert cls.difficulty in ("L1", "L2", "L3", "L4")

    @pytest.mark.parametrize("cls", ALL_TASK_CLASSES, ids=ALL_TASK_IDS)
    def test_parameter_defaults_present(self, cls):
        for key, schema in cls.parameters.items():
            if key.startswith("_"):
                continue
            assert "default" in schema, f"{cls.__name__}.{key} missing default"


# =============================================================================
# SearchPackage grounded judge — 1 positive + 3 negatives
# =============================================================================


class TestSearchPackageJudge:
    """Verify the four required scenarios for the rewritten SearchPackage."""

    def test_positive_search_and_submit_correct_pickup(self):
        task = _make_search_task()
        init = _inject_target(BASE_STATE)
        curr = _inject_target(BASE_STATE)
        # Agent searched the correct tracking number, opened the correct detail,
        # and submitted the correct pickup code.
        _set_search(
            curr,
            _search_current(
                searched=True,
                tracking_no="SF9999888877776",
                result_package_id="pkg-search-target",
            ),
        )
        _set_viewed(curr, "pkg-search-target")
        inp = _make_task_input(
            init, curr,
            init_sheet=_answer_sheet(None, submitted=False),
            curr_sheet=_answer_sheet("7-3-2025", submitted=True),
        )
        result = task.evaluate(inp)
        assert result.success, f"positive failed: issues={result.issues}"
        assert result.clean, f"positive not clean: warnings={result.warnings}"
        assert result.progress == 1.0

    def test_negative_no_search_submit_correct_pickup(self):
        """Neg-1: never searched, but submitted the correct pickup code anyway."""
        task = _make_search_task()
        init = _inject_target(BASE_STATE)
        curr = _inject_target(BASE_STATE)
        # No search performed; no package viewed.
        _set_search(
            curr,
            _search_current(searched=False, tracking_no=None, result_package_id=None),
        )
        _set_viewed(curr, None)
        inp = _make_task_input(
            init, curr,
            init_sheet=_answer_sheet(None, submitted=False),
            curr_sheet=_answer_sheet("7-3-2025", submitted=True),
        )
        result = task.evaluate(inp)
        assert not result.success, "neg-1 unexpectedly passed (no search should fail)"
        # Specifically the search.performed / tracking_no / viewed checks must fail.
        fields = {c["field"]: c for c in result.issues}
        assert fields["search.performed"]["passed"] is False
        assert fields["search.tracking_no"]["passed"] is False

    def test_negative_search_wrong_tracking_submit_correct_pickup(self):
        """Neg-2: searched the wrong tracking number, submitted correct pickup code."""
        task = _make_search_task()
        init = _inject_target(BASE_STATE)
        curr = _inject_target(BASE_STATE)
        # Searched a wrong (existing) tracking number — result is a different package.
        _set_search(
            curr,
            _search_current(
                searched=True,
                tracking_no="ZT9876543210987",  # pkg-002, not the target
                result_package_id="pkg-002",
            ),
        )
        _set_viewed(curr, "pkg-002")
        inp = _make_task_input(
            init, curr,
            init_sheet=_answer_sheet(None, submitted=False),
            curr_sheet=_answer_sheet("7-3-2025", submitted=True),
        )
        result = task.evaluate(inp)
        assert not result.success, "neg-2 unexpectedly passed (wrong search should fail)"
        fields = {c["field"]: c for c in result.issues}
        assert fields["search.tracking_no"]["passed"] is False
        assert fields["search.result_package_id"]["passed"] is False
        assert fields["package.viewed"]["passed"] is False

    def test_negative_search_correct_submit_wrong_pickup(self):
        """Neg-3: searched the correct tracking number, but submitted wrong pickup code."""
        task = _make_search_task()
        init = _inject_target(BASE_STATE)
        curr = _inject_target(BASE_STATE)
        _set_search(
            curr,
            _search_current(
                searched=True,
                tracking_no="SF9999888877776",
                result_package_id="pkg-search-target",
            ),
        )
        _set_viewed(curr, "pkg-search-target")
        inp = _make_task_input(
            init, curr,
            init_sheet=_answer_sheet(None, submitted=False),
            curr_sheet=_answer_sheet("9-9-9999", submitted=True),
        )
        result = task.evaluate(inp)
        assert not result.success, "neg-3 unexpectedly passed (wrong pickup should fail)"
        fields = {c["field"]: c for c in result.issues}
        assert fields["answer.pickup_code"]["passed"] is False
        # search checks should still pass (agent did search correctly)
        assert fields["search.performed"]["passed"] is True
        assert fields["search.tracking_no"]["passed"] is True

    def test_clean_allows_search_and_browse_state_only(self):
        """Positive case must be clean: only search.* + _temp + answer_sheet changed.

        Guard against regressions where injected package or packages list leaks
        into the unexpected-side-effect diff.
        """
        task = _make_search_task()
        init = _inject_target(BASE_STATE)
        curr = _inject_target(BASE_STATE)
        _set_search(
            curr,
            _search_current(
                searched=True,
                tracking_no="SF9999888877776",
                result_package_id="pkg-search-target",
            ),
        )
        _set_viewed(curr, "pkg-search-target")
        inp = _make_task_input(
            init, curr,
            init_sheet=_answer_sheet(None, submitted=False),
            curr_sheet=_answer_sheet("7-3-2025", submitted=True),
        )
        result = task.evaluate(inp)
        assert result.success
        assert result.clean, f"unexpected side effects: {result.warnings}"
