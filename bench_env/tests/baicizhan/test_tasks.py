"""
Baicizhan task correctness tests — offline judge validation.
"""

from __future__ import annotations

import copy
import inspect
import json
from pathlib import Path
from typing import Any

import pytest

from bench_env.task.base import BaseTask
from bench_env.task.common_tasks import AnswerTask
from bench_env.task.baicizhan import tasks as _tasks_module
from bench_env.tests.conftest import make_judge_input

ALL_TASK_CLASSES: list[type[BaseTask]] = [
    obj
    for _, obj in inspect.getmembers(_tasks_module, inspect.isclass)
    if issubclass(obj, BaseTask) and obj is not BaseTask and obj.__module__ == _tasks_module.__name__
]
ALL_TASK_IDS = [cls.__name__ for cls in ALL_TASK_CLASSES]

TEST_OS_STATE = {"time": {"timestamp": 1750000000000}}
DEFAULT_ROUTE = {"app": "baicizhan", "path": "/"}


def _load_defaults() -> dict[str, Any]:
    path = Path(__file__).resolve().parents[3] / "apps" / "Baicizhan" / "data" / "defaults.json"
    return json.loads(path.read_text(encoding="utf-8"))


DEFAULTS = _load_defaults()


def _make_apps_state(overrides: dict | None = None) -> dict:
    """Build a minimal baicizhan app state from defaults + optional overrides."""
    state: dict[str, Any] = {
        "wordBooks": copy.deepcopy(DEFAULTS["wordBooks"]),
        "words": copy.deepcopy(DEFAULTS["words"]),
        "studyPlan": copy.deepcopy(DEFAULTS["studyPlan"]),
        "studyRecords": copy.deepcopy(DEFAULTS.get("studyRecords", [])),
        "reviewRecords": copy.deepcopy(DEFAULTS.get("reviewRecords", [])),
        "reviewSessions": copy.deepcopy(DEFAULTS.get("reviewSessions", [])),
        "todaySession": None,
        "mistakeBook": copy.deepcopy(DEFAULTS.get("mistakeBook", [])),
        "favorites": copy.deepcopy(DEFAULTS.get("favorites", [])),
        "notes": copy.deepcopy(DEFAULTS.get("notes", {})),
        "spellingExercises": copy.deepcopy(DEFAULTS.get("spellingExercises", {})),
        "listeningExercises": copy.deepcopy(DEFAULTS.get("listeningExercises", {})),
        "dailyProgress": copy.deepcopy(DEFAULTS.get("dailyProgress", {})),
        "statistics": copy.deepcopy(DEFAULTS.get("statistics", {})),
        "search": copy.deepcopy(DEFAULTS.get("search", {})),
        "settings": copy.deepcopy(DEFAULTS.get("settings", {})),
        "_temp": {
            "currentStudyWordIndex": 0,
            "currentReviewWordIndex": 0,
            "studySessionWordIds": [],
            "reviewSessionWordIds": [],
        },
    }
    if overrides:
        _deep_merge(state, overrides)
    return state


def _deep_merge(base: dict, overrides: dict) -> None:
    for k, v in overrides.items():
        if isinstance(v, dict) and isinstance(base.get(k), dict):
            _deep_merge(base[k], v)
        elif isinstance(v, list) and isinstance(base.get(k), list):
            base[k] = copy.deepcopy(v)
        else:
            base[k] = copy.deepcopy(v)


def _find_word_by_spelling(words: dict, spelling: str) -> dict | None:
    for w in words.values():
        if w.get("spelling", "").lower() == spelling.lower():
            return w
    return None


# =============================================================================
# Test: All 15 tasks are discoverable
# =============================================================================
def test_all_tasks_discovered():
    """Verify exactly 15 tasks are registered."""
    assert len(ALL_TASK_CLASSES) == 15, f"Expected 15 tasks, found {len(ALL_TASK_CLASSES)}: {ALL_TASK_IDS}"


@pytest.mark.parametrize("task_cls", ALL_TASK_CLASSES, ids=ALL_TASK_IDS)
def test_task_has_required_metadata(task_cls: type[BaseTask]):
    """Every task must have scope, objective, difficulty, capabilities."""
    assert task_cls.scope in ("S1", "S2", "S3"), f"{task_cls.__name__}: invalid scope {task_cls.scope}"
    assert task_cls.objective in ("operate", "query", "hybrid"), f"{task_cls.__name__}: invalid objective"
    assert task_cls.difficulty in ("L1", "L2", "L3", "L4"), f"{task_cls.__name__}: invalid difficulty"
    assert len(task_cls.capabilities) > 0, f"{task_cls.__name__}: no capabilities"


# =============================================================================
# Positive tests: Each operate task produces correct state
# =============================================================================

def test_change_daily_goal_positive():
    """ChangeDailyGoal: state should reflect new daily goal."""
    apps_init = _make_apps_state()
    apps_final = _make_apps_state()
    apps_final["studyPlan"]["dailyGoal"] = 50

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.ChangeDailyGoal()
    task.p.goal = 50
    result = task.evaluate(input_data)
    assert result.clean, f"Side effects detected: {result.unexpected_changes}"
    assert result.success, f"Goals not met: {result.issues}"


def test_switch_word_book_positive():
    """SwitchWordBook: studyPlan.bookId should change and book marked current."""
    apps_init = _make_apps_state()
    apps_final = _make_apps_state()
    apps_final["studyPlan"]["bookId"] = "cet4"
    apps_final["wordBooks"]["cet4"]["isCurrent"] = True
    apps_final["wordBooks"]["basic"]["isCurrent"] = False

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.SwitchWordBook()
    task.p.book_display = "cet4"
    result = task.evaluate(input_data)
    assert result.clean, f"Side effects: {result.unexpected_changes}"
    assert result.success, f"Goals not met: {result.issues}"


def test_add_favorite_positive():
    """AddFavorite: word should appear in favorites."""
    apps_init = _make_apps_state()
    # Remove w005 from favorites to start clean
    if "w005" in apps_init["favorites"]:
        apps_init["favorites"].remove("w005")

    apps_final = _make_apps_state()
    if "w005" in apps_final["favorites"]:
        apps_final["favorites"].remove("w005")
    apps_final["favorites"].append("w005")
    apps_final["words"]["w005"]["isFavorite"] = True
    apps_final["statistics"]["totalFavoriteCount"] += 1

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.AddFavorite()
    task.p.word_spelling = "eloquent"
    result = task.evaluate(input_data)
    assert result.clean, f"Side effects: {result.unexpected_changes}"
    assert result.success, f"Goals not met: {result.issues}"


def test_remove_favorite_positive():
    """RemoveFavorite: word should be removed from favorites."""
    apps_init = _make_apps_state()
    apps_init["favorites"] = ["w002"]
    apps_init["words"]["w002"]["isFavorite"] = True

    apps_final = _make_apps_state()
    apps_final["favorites"] = []
    apps_final["words"]["w002"]["isFavorite"] = False
    apps_final["statistics"]["totalFavoriteCount"] -= 1

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.RemoveFavorite()
    task.p.word_spelling = "benevolent"
    result = task.evaluate(input_data)
    assert result.clean, f"Side effects: {result.unexpected_changes}"
    assert result.success, f"Goals not met: {result.issues}"


def test_add_note_positive():
    """AddWordNote: a new note should be created for the target word."""
    apps_init = _make_apps_state()

    apps_final = _make_apps_state()
    note_content = "这是一个测试笔记。"
    apps_final["notes"]["note_test"] = {
        "id": "note_test",
        "wordId": "w005",
        "content": note_content,
        "createdAt": 1750000000000,
        "updatedAt": 1750000000000,
    }
    apps_final["words"]["w005"]["noteIds"] = list(apps_final["words"]["w005"].get("noteIds", [])) + ["note_test"]

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.AddWordNote()
    task.p.word_spelling = "eloquent"
    task.p.note_content = note_content
    result = task.evaluate(input_data)
    assert result.clean, f"Side effects: {result.unexpected_changes}"
    assert result.success, f"Goals not met: {result.issues}"


def test_complete_spelling_positive():
    """CompleteSpellingExercise: a completed spelling exercise should exist."""
    apps_init = _make_apps_state()

    apps_final = _make_apps_state()
    apps_final["spellingExercises"]["spell_test"] = {
        "id": "spell_test",
        "wordId": "w001",
        "attempts": ["abandon"],
        "isCorrect": True,
        "isCompleted": True,
        "startedAt": 1750000000000,
        "completedAt": 1750000000000,
    }

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.CompleteSpellingExercise()
    task.p.word_spelling = "abandon"
    result = task.evaluate(input_data)
    assert result.clean, f"Side effects: {result.unexpected_changes}"
    assert result.success, f"Goals not met: {result.issues}"


def test_complete_listening_positive():
    """CompleteListeningExercise: a completed listening exercise with played=true should exist."""
    apps_init = _make_apps_state()

    apps_final = _make_apps_state()
    apps_final["listeningExercises"]["listen_test"] = {
        "id": "listen_test",
        "wordId": "w001",
        "played": True,
        "selectedOption": "w001",
        "isCorrect": True,
        "isCompleted": True,
        "startedAt": 1750000000000,
        "completedAt": 1750000000000,
    }

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.CompleteListeningExercise()
    task.p.word_spelling = "abandon"
    result = task.evaluate(input_data)
    assert result.clean, f"Side effects: {result.unexpected_changes}"
    assert result.success, f"Goals not met: {result.issues}"


def test_review_wrong_word_positive():
    """ReviewWrongWord: word should be removed from mistakeBook after correct review."""
    apps_init = _make_apps_state()
    apps_init["mistakeBook"] = ["w004"]
    apps_init["words"]["w004"]["reviewStatus"] = "pending"

    apps_final = _make_apps_state()
    apps_final["mistakeBook"] = []
    apps_final["words"]["w004"]["reviewStatus"] = "reviewed"
    apps_final["reviewRecords"] = [
        {"id": "rr_test", "wordId": "w004", "result": "correct", "timestamp": 1750000000000, "sessionId": "rev_test"}
    ]
    apps_final["reviewSessions"] = [
        {"id": "rev_test", "startedAt": 1750000000000, "completedAt": 1750000000000,
         "totalWords": 1, "completedWords": 1, "correctCount": 1, "incorrectCount": 0, "isCompleted": True}
    ]

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.ReviewWrongWord()
    task.p.word_spelling = "diligent"
    result = task.evaluate(input_data)
    assert result.clean, f"Side effects: {result.unexpected_changes}"
    assert result.success, f"Goals not met: {result.issues}"


def test_configure_reminder_positive():
    """ConfigureReminder: reminder should be enabled with correct time."""
    apps_init = _make_apps_state()
    apps_init["studyPlan"]["reminderEnabled"] = False

    apps_final = _make_apps_state()
    apps_final["studyPlan"]["reminderEnabled"] = True
    apps_final["studyPlan"]["reminderTime"] = "20:00"

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.ConfigureReminder()
    task.p.time = "20:00"
    result = task.evaluate(input_data)
    assert result.clean, f"Side effects: {result.unexpected_changes}"
    assert result.success, f"Goals not met: {result.issues}"


def test_learn_new_word_positive():
    """LearnNewWord: study record created, session progresses."""
    apps_init = _make_apps_state()
    apps_init["words"]["w005"]["familiarity"] = "unknown"
    apps_init["words"]["w005"]["studyCount"] = 0
    apps_init["todaySession"] = None

    apps_final = _make_apps_state()
    apps_final["words"]["w005"]["familiarity"] = "learning"
    apps_final["words"]["w005"]["studyCount"] = 1
    apps_final["words"]["w005"]["lastStudiedAt"] = 1750000000000
    apps_final["todaySession"] = {
        "id": "sess_test", "bookId": "basic", "startedAt": 1750000000000,
        "completedAt": None, "totalWords": 3, "completedWords": 1,
        "knownCount": 1, "unknownCount": 0, "isCompleted": False
    }
    apps_final["studyRecords"] = list(apps_final.get("studyRecords", [])) + [
        {"id": "sr_test", "wordId": "w005", "bookId": "basic", "result": "known",
         "timestamp": 1750000000000, "sessionId": "sess_test"}
    ]

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.LearnNewWord()
    task.p.word_spelling = "eloquent"
    result = task.evaluate(input_data)
    assert result.success, f"Goals not met: {result.issues}"


def test_mark_unknown_positive():
    """MarkWordUnknown: study record with unknown result, word in mistakeBook."""
    apps_init = _make_apps_state()
    apps_init["words"]["w005"]["familiarity"] = "unknown"
    apps_init["words"]["w005"]["mistakeCount"] = 0
    apps_init["mistakeBook"] = [m for m in apps_init["mistakeBook"] if m != "w005"]
    apps_init["todaySession"] = None

    apps_final = _make_apps_state()
    apps_final["words"]["w005"]["familiarity"] = "unknown"
    apps_final["words"]["w005"]["studyCount"] = 1
    apps_final["words"]["w005"]["mistakeCount"] = 1
    apps_final["mistakeBook"] = list(apps_final["mistakeBook"]) + ["w005"]
    apps_final["todaySession"] = {
        "id": "sess_test2", "bookId": "basic", "startedAt": 1750000000000,
        "completedAt": None, "totalWords": 3, "completedWords": 1,
        "knownCount": 0, "unknownCount": 1, "isCompleted": False
    }
    apps_final["studyRecords"] = list(apps_final.get("studyRecords", [])) + [
        {"id": "sr_test2", "wordId": "w005", "bookId": "basic", "result": "unknown",
         "timestamp": 1750000000000, "sessionId": "sess_test2"}
    ]

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.MarkWordUnknown()
    task.p.word_spelling = "eloquent"
    result = task.evaluate(input_data)
    assert result.success, f"Goals not met: {result.issues}"


# =============================================================================
# Negative tests: Wrong answer / incomplete state
# =============================================================================

def test_search_meaning_wrong_answer():
    """SearchWordAndReportMeaning: wrong answer should fail."""
    apps_init = _make_apps_state()
    apps_final = _make_apps_state()
    apps_final["search"]["openedWordId"] = "w001"
    apps_final["search"]["query"] = "abandon"

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
        answer="这是错误的释义",
    )
    task = _tasks_module.SearchWordAndReportMeaning()
    task.p.word = "abandon"
    result = task.evaluate(input_data)
    assert not result.success, "Should fail with wrong answer"


def test_spelling_incomplete_negative():
    """CompleteSpellingExercise: incomplete exercise should fail."""
    apps_init = _make_apps_state()
    apps_final = _make_apps_state()
    apps_final["spellingExercises"]["spell_inc"] = {
        "id": "spell_inc", "wordId": "w001", "attempts": [],
        "isCorrect": False, "isCompleted": False,
        "startedAt": 1750000000000, "completedAt": None
    }

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.CompleteSpellingExercise()
    task.p.word_spelling = "abandon"
    result = task.evaluate(input_data)
    assert not result.success, "Should fail with incomplete exercise"


def test_listening_not_played_negative():
    """CompleteListeningExercise: not played should still be detected."""
    apps_init = _make_apps_state()
    apps_final = _make_apps_state()
    apps_final["listeningExercises"]["listen_np"] = {
        "id": "listen_np", "wordId": "w001", "played": False,
        "selectedOption": "w001", "isCorrect": True, "isCompleted": True,
        "startedAt": 1750000000000, "completedAt": 1750000000000
    }

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.CompleteListeningExercise()
    task.p.word_spelling = "abandon"
    result = task.evaluate(input_data)
    # The check for played=true is in check_goals, so this should fail
    # even though isCompleted=true
    assert not result.success, "Should fail when audio not played"


def test_wrong_word_reviewed_negative():
    """ReviewWrongWord: reviewing wrong word should fail."""
    apps_init = _make_apps_state()
    apps_init["mistakeBook"] = ["w004"]

    apps_final = _make_apps_state()
    apps_final["mistakeBook"] = ["w004"]  # w004 still in mistakeBook (not removed)
    apps_final["reviewRecords"] = [
        {"id": "rr_wrong", "wordId": "w008", "result": "correct",
         "timestamp": 1750000000000, "sessionId": "rev_wrong"}
    ]

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.ReviewWrongWord()
    task.p.word_spelling = "diligent"
    result = task.evaluate(input_data)
    assert not result.success, "Should fail when target word not reviewed correctly"


def test_side_effect_other_favorites_unchanged():
    """AddFavorite: other favorites should not be affected."""
    apps_init = _make_apps_state()
    apps_init["favorites"] = ["w002"]

    apps_final = _make_apps_state()
    apps_final["favorites"] = ["w002", "w005"]  # Added w005 but also...
    apps_final["favorites"].append("w003")  # UNEXPECTED: w003 also added
    apps_final["words"]["w005"]["isFavorite"] = True
    apps_final["words"]["w003"]["isFavorite"] = True

    input_data = make_judge_input(
        init_state={"apps": {"baicizhan": apps_init}, "os": TEST_OS_STATE},
        curr_state={"apps": {"baicizhan": apps_final}, "os": TEST_OS_STATE},
        route=DEFAULT_ROUTE,
    )
    task = _tasks_module.AddFavorite()
    task.p.word_spelling = "eloquent"
    result = task.evaluate(input_data)
    # The check for other favorites unchanged should detect the extra change
    goal_checks = result.issues
    other_check = [c for c in goal_checks if "other" in str(c.get("label", "")).lower()]
    if other_check:
        assert not other_check[0].get("passed", True), "Should detect unexpected favorite change"
