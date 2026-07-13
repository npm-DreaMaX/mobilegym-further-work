"""
China Mobile task correctness tests.

Focus: offline judge for query task ``CheckBalance`` and operate task
``RechargeFifty`` (positive + negatives), plus basic structural tests for all
15 tasks (instantiation, description rendering, required class attributes,
parameter defaults). No simulator required.
"""

from __future__ import annotations

import copy
import inspect
import json
from pathlib import Path
from typing import Any

import pytest

from bench_env.task.china_mobile.app import ChinaMobile
from bench_env.task.china_mobile import tasks as _tasks_module
from bench_env.task.base import BaseTask
from bench_env.tests.conftest import make_judge_input

ALL_TASK_CLASSES: list[type[BaseTask]] = [
    obj
    for _, obj in inspect.getmembers(_tasks_module, inspect.isclass)
    if issubclass(obj, BaseTask) and obj is not BaseTask and obj.__module__ == _tasks_module.__name__
]
ALL_TASK_IDS = [cls.__name__ for cls in ALL_TASK_CLASSES]

TEST_OS_STATE = {"time": {"timestamp": 1752576000000}}
DEFAULT_ROUTE = {"app": "chinamobile", "path": "/"}


def _load_defaults() -> dict[str, Any]:
    path = Path(__file__).resolve().parents[3] / "apps" / "ChinaMobile" / "data" / "defaults.json"
    return json.loads(path.read_text(encoding="utf-8"))


DEFAULTS = _load_defaults()
BASE_STATE: dict[str, Any] = copy.deepcopy(DEFAULTS)


def _make_task_input(
    init_cm: dict[str, Any],
    curr_cm: dict[str, Any],
    *,
    init_sheet: dict[str, Any] | None = None,
    curr_sheet: dict[str, Any] | None = None,
    route: dict[str, Any] | None = None,
    answer: str | None = None,
):
    init_apps: dict[str, Any] = {"chinamobile": init_cm}
    curr_apps: dict[str, Any] = {"chinamobile": curr_cm}
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


def _answer_sheet(value: str | None, *, submitted: bool, label: str = "话费余额(元)") -> dict[str, Any]:
    return {
        "fields": [{"type": "number", "label": label}],
        "answers": {} if value is None else {"0": value},
        "submitted": submitted,
    }


def _set_visited(state: dict[str, Any], page: str) -> None:
    state.setdefault("_temp", {})
    visited = state["_temp"].setdefault("visitedPages", [])
    if page not in visited:
        visited.append(page)


# =============================================================================
# Basic structural tests (all 15 tasks)
# =============================================================================

class TestTaskDefinitions:
    @pytest.mark.parametrize("cls", ALL_TASK_CLASSES, ids=ALL_TASK_IDS)
    def test_instantiation(self, cls):
        task = cls()
        assert task.name == cls.__name__
        assert task.templates
        assert "chinamobile" in task.apps

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

    def test_task_count_is_15(self):
        assert len(ALL_TASK_CLASSES) == 15


# =============================================================================
# CheckBalance grounded judge — 1 positive + 3 negatives
# =============================================================================

class TestCheckBalanceJudge:
    def _task(self):
        return _tasks_module.CheckBalance()

    def test_positive_visit_and_submit_correct_balance(self):
        task = self._task()
        init = copy.deepcopy(BASE_STATE)
        curr = copy.deepcopy(BASE_STATE)
        _set_visited(curr, "balance")
        inp = _make_task_input(
            init, curr,
            init_sheet=_answer_sheet(None, submitted=False),
            curr_sheet=_answer_sheet("38.5", submitted=True),
        )
        result = task.evaluate(inp)
        assert result.success, f"positive failed: issues={result.issues}"
        assert result.clean, f"positive not clean: warnings={result.warnings}"
        assert result.progress == 1.0

    def test_negative_no_visit_submit_correct_balance(self):
        task = self._task()
        init = copy.deepcopy(BASE_STATE)
        curr = copy.deepcopy(BASE_STATE)
        # Did not visit the balance page.
        inp = _make_task_input(
            init, curr,
            init_sheet=_answer_sheet(None, submitted=False),
            curr_sheet=_answer_sheet("38.5", submitted=True),
        )
        result = task.evaluate(inp)
        assert not result.success, "no-visit should fail"
        fields = {c["field"]: c for c in result.issues}
        assert fields["page.visited"]["passed"] is False

    def test_negative_visited_but_wrong_answer(self):
        task = self._task()
        init = copy.deepcopy(BASE_STATE)
        curr = copy.deepcopy(BASE_STATE)
        _set_visited(curr, "balance")
        inp = _make_task_input(
            init, curr,
            init_sheet=_answer_sheet(None, submitted=False),
            curr_sheet=_answer_sheet("999", submitted=True),
        )
        result = task.evaluate(inp)
        assert not result.success, "wrong answer should fail"
        fields = {c["field"]: c for c in result.issues}
        assert fields["answer.balance"]["passed"] is False
        assert fields["page.visited"]["passed"] is True

    def test_negative_visited_but_not_submitted(self):
        task = self._task()
        init = copy.deepcopy(BASE_STATE)
        curr = copy.deepcopy(BASE_STATE)
        _set_visited(curr, "balance")
        inp = _make_task_input(
            init, curr,
            init_sheet=_answer_sheet(None, submitted=False),
            curr_sheet=_answer_sheet("38.5", submitted=False),
        )
        result = task.evaluate(inp)
        assert not result.success, "not submitted should fail"
        fields = {c["field"]: c for c in result.issues}
        assert fields["answer_sheet.submitted"]["passed"] is False

    def test_clean_allows_only_visited_temp_and_answer_sheet(self):
        """Positive case must be clean: only _temp.visitedPages + answer_sheet changed."""
        task = self._task()
        init = copy.deepcopy(BASE_STATE)
        curr = copy.deepcopy(BASE_STATE)
        _set_visited(curr, "balance")
        inp = _make_task_input(
            init, curr,
            init_sheet=_answer_sheet(None, submitted=False),
            curr_sheet=_answer_sheet("38.5", submitted=True),
        )
        result = task.evaluate(inp)
        assert result.success
        assert result.clean, f"unexpected side effects: {result.warnings}"


# =============================================================================
# RechargeFifty operate judge — positive + negative
# =============================================================================

class TestRechargeFiftyJudge:
    def _task(self):
        return _tasks_module.RechargeFifty()

    def test_positive_balance_increased_and_txn_recorded(self):
        task = self._task()
        init = copy.deepcopy(BASE_STATE)
        curr = copy.deepcopy(BASE_STATE)
        # Simulate a successful recharge of 50.
        curr["balance"] = round(curr["balance"] + 50, 2)
        curr["transactions"] = [
            {"id": "txn-003", "type": "recharge", "amount": 50, "desc": "话费充值50元", "time": 1752576000000},
            *curr["transactions"],
        ]
        inp = _make_task_input(init, curr)
        result = task.evaluate(inp)
        assert result.success, f"positive failed: issues={result.issues}"
        assert result.clean, f"positive not clean: warnings={result.warnings}"

    def test_negative_wrong_amount(self):
        """Recharged 100 instead of 50 — balance delta wrong + no 50 txn."""
        task = self._task()
        init = copy.deepcopy(BASE_STATE)
        curr = copy.deepcopy(BASE_STATE)
        curr["balance"] = round(curr["balance"] + 100, 2)
        curr["transactions"] = [
            {"id": "txn-003", "type": "recharge", "amount": 100, "desc": "话费充值100元", "time": 1752576000000},
            *curr["transactions"],
        ]
        inp = _make_task_input(init, curr)
        result = task.evaluate(inp)
        assert not result.success, "wrong amount should fail"
        fields = {c["field"]: c for c in result.issues}
        assert fields["balance.increased_by_50"]["passed"] is False
        assert fields["transaction.recharge_50"]["passed"] is False

    def test_negative_toast_only_no_state_change(self):
        """A fake 'success' toast with no balance / txn change must fail."""
        task = self._task()
        init = copy.deepcopy(BASE_STATE)
        curr = copy.deepcopy(BASE_STATE)
        inp = _make_task_input(init, curr)
        result = task.evaluate(inp)
        assert not result.success, "toast-only (no state change) should fail"


# =============================================================================
# PayArrears operate judge — positive (bill paid + balance + txn)
# =============================================================================

class TestPayArrearsJudge:
    def _task(self):
        t = _tasks_module.PayArrears()
        # Use the real default arrears bill.
        return t

    def test_positive_bill_paid_balance_decreased_txn_recorded(self):
        task = self._task()
        init = copy.deepcopy(BASE_STATE)
        curr = copy.deepcopy(BASE_STATE)
        amount = 12.80
        curr["balance"] = round(curr["balance"] - amount, 2)
        curr["bills"] = [
            {**b, "status": "paid", "arrears": False} if b["id"] == "bill-2026-06" else b
            for b in curr["bills"]
        ]
        curr["transactions"] = [
            {"id": "txn-003", "type": "payment", "amount": amount, "desc": "缴纳2026-06账单", "time": 1752576000000},
            *curr["transactions"],
        ]
        inp = _make_task_input(init, curr)
        result = task.evaluate(inp)
        assert result.success, f"positive failed: issues={result.issues}"
        assert result.clean, f"positive not clean: warnings={result.warnings}"

    def test_negative_already_paid_bill_rejected(self):
        """Paying an already-paid bill again must not double-charge (store rejects).
        Here the agent 'paid' but balance didn't change → must fail clean=False? No:
        the judge sees no state change → check_goals fail (bill not unpaid→paid)."""
        task = self._task()
        init = copy.deepcopy(BASE_STATE)
        curr = copy.deepcopy(BASE_STATE)
        # Bill is already unpaid in defaults; if it were already paid, paying
        # again is a no-op. Here we simulate the agent NOT paying (no change).
        inp = _make_task_input(init, curr)
        result = task.evaluate(inp)
        assert not result.success, "no payment should fail"


# =============================================================================
# ChangePlan operate judge (CriteriaTask)
# =============================================================================

class TestChangePlanJudge:
    def _task(self):
        t = _tasks_module.ChangePlan()
        t.params["planId"] = "plan-58"
        t.params["planName"] = "飞享套餐-58元"
        return t

    def test_positive_plan_changed_and_txn_recorded(self):
        task = self._task()
        init = copy.deepcopy(BASE_STATE)
        curr = copy.deepcopy(BASE_STATE)
        curr["activePlanId"] = "plan-58"
        curr["transactions"] = [
            {"id": "txn-003", "type": "planchange", "amount": 0, "desc": "套餐变更为飞享套餐-58元", "time": 1752576000000},
            *curr["transactions"],
        ]
        inp = _make_task_input(init, curr)
        result = task.evaluate(inp)
        assert result.success, f"positive failed: issues={result.issues}"
        assert result.clean, f"positive not clean: warnings={result.warnings}"

    def test_negative_plan_unchanged(self):
        task = self._task()
        init = copy.deepcopy(BASE_STATE)
        curr = copy.deepcopy(BASE_STATE)
        inp = _make_task_input(init, curr)
        result = task.evaluate(inp)
        assert not result.success, "unchanged plan should fail"


# =============================================================================
# OPEN_APP recognition — APP_NAME_MAP resolves 中国移动 / ChinaMobile / chinamobile
# =============================================================================

class TestOpenAppRecognition:
    def test_app_name_map_resolves_chinamobile(self):
        from bench_env.env.mobile_gym import MobileGymEnv
        name_map = MobileGymEnv.APP_NAME_MAP
        assert name_map.get("中国移动") == "chinamobile"
        assert name_map.get("ChinaMobile") == "chinamobile"
        assert name_map.get("China Mobile") == "chinamobile"
        assert name_map.get("chinamobile") == "chinamobile"
        assert "chinamobile" in MobileGymEnv._KNOWN_APP_IDS

    def test_manifest_id_matches_snapshot_key(self):
        """manifest.id (TS) must equal the snapshot key the bench reads."""
        manifest_path = Path(__file__).resolve().parents[3] / "apps" / "ChinaMobile" / "manifest.ts"
        text = manifest_path.read_text(encoding="utf-8")
        assert "id: 'chinamobile'" in text
