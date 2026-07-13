"""
Baicizhan (百词斩) app state accessor.
Provides samplers, check helpers, and parameter definitions for benchmark tasks.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from bench_env.task.base import BaseApp

# ---- Parameter Definitions ----

BAICIZHAN_SEARCH_WORD_PARAM = {
    "type": "enum",
    "values": ["abandon", "eloquent", "diligent", "hypothesis", "accomplish", "budget",
               "enthusiasm", "guarantee", "passport", "itinerary", "negotiate", "revenue"],
    "default": "abandon",
    "description": "要搜索的英文单词",
}

BAICIZHAN_DAILY_GOAL_PARAM = {
    "type": "enum",
    "values": [10, 20, 30, 50, 100],
    "default": 30,
    "description": "每日学习目标数量",
}

BAICIZHAN_BOOK_PARAM = {
    "type": "enum",
    "values": {
        "CET-4 大学英语四级": "cet4",
        "CET-6 大学英语六级": "cet6",
        "基础词汇": "basic",
        "旅行英语": "travel",
        "商务英语": "business",
    },
    "default": "cet4",
    "description": "目标词书",
}

BAICIZHAN_REMINDER_TIME_PARAM = {
    "type": "enum",
    "values": ["08:00", "09:00", "12:00", "18:00", "20:00", "21:00", "22:00"],
    "default": "20:00",
    "description": "提醒时间 (HH:MM)",
}

BAICIZHAN_NOTE_CONTENT_PARAM = {
    "type": "string",
    "default": "这个词很重要，需要反复记忆。注意发音和拼写。",
    "description": "笔记内容",
}


# ---- Expected Changes Constants ----

SEARCH_EXPECTED_CHANGES = ["baicizhan.search"]

STUDY_EXPECTED_CHANGES = [
    "baicizhan.studyRecords",
    "baicizhan.todaySession",
    "baicizhan.words",
    "baicizhan.dailyProgress",
    "baicizhan.statistics",
    "baicizhan._temp",
]

FAVORITE_EXPECTED_CHANGES = [
    "baicizhan.favorites",
    "baicizhan.words",
    "baicizhan.statistics",
]

NOTE_EXPECTED_CHANGES = [
    "baicizhan.notes",
    "baicizhan.words",
]

SPELLING_EXPECTED_CHANGES = [
    "baicizhan.spellingExercises",
    "baicizhan.words",
]

LISTENING_EXPECTED_CHANGES = [
    "baicizhan.listeningExercises",
    "baicizhan.words",
]

REVIEW_EXPECTED_CHANGES = [
    "baicizhan.reviewRecords",
    "baicizhan.reviewSessions",
    "baicizhan.mistakeBook",
    "baicizhan.words",
    "baicizhan.dailyProgress",
    "baicizhan.statistics",
    "baicizhan._temp",
]

PLAN_EXPECTED_CHANGES = [
    "baicizhan.studyPlan",
    "baicizhan.wordBooks",
]

GOAL_EXPECTED_CHANGES = [
    "baicizhan.studyPlan",
]


class Baicizhan(BaseApp):
    """Accessor for the Baicizhan (百词斩) app state."""

    app_id = "baicizhan"

    # ---- Word lookups ----

    @staticmethod
    def get_word(apps: dict, word_id: str) -> dict | None:
        """Get a single word by ID from runtime state."""
        words = apps.get("baicizhan", {}).get("words", {})
        return words.get(word_id)

    @staticmethod
    def get_word_by_spelling(apps: dict, spelling: str) -> dict | None:
        """Find a word by its spelling (case-insensitive)."""
        words = apps.get("baicizhan", {}).get("words", {})
        lower = spelling.lower()
        for w in words.values():
            if w.get("spelling", "").lower() == lower:
                return w
        return None

    @staticmethod
    def get_words_by_book(apps: dict, book_id: str) -> list[dict]:
        """Get all words belonging to a specific book."""
        words = apps.get("baicizhan", {}).get("words", {})
        return [w for w in words.values() if w.get("bookId") == book_id]

    @staticmethod
    def get_current_book_id(apps: dict) -> str:
        """Get the currently selected word book ID."""
        plan = apps.get("baicizhan", {}).get("studyPlan", {})
        return plan.get("bookId", "basic")

    # ---- Search checks ----

    @staticmethod
    def check_searched(apps: dict, word_id: str) -> bool:
        """Verify the search state shows the correct word was opened."""
        search = apps.get("baicizhan", {}).get("search", {})
        return search.get("openedWordId") == word_id

    @staticmethod
    def check_search_performed(apps: dict, query: str) -> bool:
        """Verify a search was performed with the given query."""
        search = apps.get("baicizhan", {}).get("search", {})
        return search.get("query", "").lower() == query.lower() or query.lower() in [h.lower() for h in search.get("history", [])]

    # ---- Study checks ----

    @staticmethod
    def check_word_studied(apps: dict, apps_init: dict, word_id: str, expected_result: str | None = None) -> dict:
        """Check that a word was studied. Returns check dict."""
        words_init = apps_init.get("baicizhan", {}).get("words", {})
        words_curr = apps.get("baicizhan", {}).get("words", {})
        word_init = words_init.get(word_id, {})
        word_curr = words_curr.get(word_id, {})

        study_count_delta = word_curr.get("studyCount", 0) - word_init.get("studyCount", 0)

        checks = []
        # Study count must have increased
        checks.append({
            "label": "studyCount increased",
            "passed": study_count_delta > 0,
            "expected": "studyCount > initial",
            "actual": f"studyCount delta = {study_count_delta}",
        })

        # Study record must exist for this word
        records_init = apps_init.get("baicizhan", {}).get("studyRecords", [])
        records_curr = apps.get("baicizhan", {}).get("studyRecords", [])
        new_records = [r for r in records_curr if r["id"] not in {ri["id"] for ri in records_init}]
        word_records = [r for r in new_records if r.get("wordId") == word_id]
        checks.append({
            "label": "study record created",
            "passed": len(word_records) > 0,
            "expected": "new study record for target word",
            "actual": f"{len(word_records)} new records for word {word_id}",
        })

        if expected_result:
            result_match = any(r.get("result") == expected_result for r in word_records)
            checks.append({
                "label": f"result is {expected_result}",
                "passed": result_match,
                "expected": expected_result,
                "actual": [r.get("result") for r in word_records],
            })

        # Session progress must have advanced
        session_init = apps_init.get("baicizhan", {}).get("todaySession")
        session_curr = apps.get("baicizhan", {}).get("todaySession")
        if session_init is None and session_curr is not None:
            checks.append({
                "label": "study session started",
                "passed": True,
                "expected": "session created",
                "actual": "session exists",
            })
        elif session_curr is not None:
            completed_delta = session_curr.get("completedWords", 0) - (session_init.get("completedWords", 0) if session_init else 0)
            checks.append({
                "label": "session progress advanced",
                "passed": completed_delta > 0,
                "expected": "completedWords increased",
                "actual": f"completedWords delta = {completed_delta}",
            })

        return {
            "label": f"word {word_id} studied",
            "passed": all(c.get("passed", False) for c in checks),
            "checks": checks,
        }

    @staticmethod
    def check_word_not_in_mistake_book(apps: dict, word_id: str) -> dict:
        """Check that a word is NOT in the mistake book."""
        mistake_book = apps.get("baicizhan", {}).get("mistakeBook", [])
        return {
            "label": f"word {word_id} not in mistakeBook",
            "passed": word_id not in mistake_book,
            "expected": f"{word_id} not in mistakeBook",
            "actual": f"{word_id} {'in' if word_id in mistake_book else 'not in'} mistakeBook",
        }

    @staticmethod
    def check_word_in_mistake_book(apps: dict, word_id: str) -> dict:
        """Check that a word IS in the mistake book."""
        mistake_book = apps.get("baicizhan", {}).get("mistakeBook", [])
        return {
            "label": f"word {word_id} in mistakeBook",
            "passed": word_id in mistake_book,
            "expected": f"{word_id} in mistakeBook",
            "actual": f"{word_id} {'in' if word_id in mistake_book else 'not in'} mistakeBook",
        }

    @staticmethod
    def check_word_familiarity(apps: dict, word_id: str, expected_status: str) -> dict:
        """Check a word's familiarity status."""
        word = apps.get("baicizhan", {}).get("words", {}).get(word_id, {})
        actual = word.get("familiarity", "unknown")
        return {
            "label": f"word {word_id} familiarity",
            "passed": actual == expected_status,
            "expected": expected_status,
            "actual": actual,
        }

    # ---- Favorite checks ----

    @staticmethod
    def check_favorite_status(apps: dict, word_id: str, expected_fav: bool) -> dict:
        """Check if a word is favorited or not."""
        favorites = apps.get("baicizhan", {}).get("favorites", [])
        is_fav = word_id in favorites
        word = apps.get("baicizhan", {}).get("words", {}).get(word_id, {})
        return {
            "label": f"word {word_id} favorite={expected_fav}",
            "passed": is_fav == expected_fav and word.get("isFavorite") == expected_fav,
            "expected": f"favorite={expected_fav}",
            "actual": f"favorites list contains={is_fav}, word.isFavorite={word.get('isFavorite')}",
        }

    @staticmethod
    def check_favorite_count_unchanged(apps: dict, apps_init: dict, exclude_word_id: str | None = None) -> dict:
        """Check that favorite count only changed for the target word."""
        favs_init = set(apps_init.get("baicizhan", {}).get("favorites", []))
        favs_curr = set(apps.get("baicizhan", {}).get("favorites", []))
        if exclude_word_id:
            favs_init.discard(exclude_word_id)
            favs_curr.discard(exclude_word_id)
        return {
            "label": "other favorites unchanged",
            "passed": favs_init == favs_curr,
            "expected": f"other favorites unchanged ({len(favs_init)} items)",
            "actual": f"added={favs_curr - favs_init}, removed={favs_init - favs_curr}",
        }

    # ---- Note checks ----

    @staticmethod
    def check_note_created(apps: dict, apps_init: dict, word_id: str, expected_content: str | None = None) -> dict:
        """Check that a new note was created for a word. Returns the new note or None."""
        notes_init = apps_init.get("baicizhan", {}).get("notes", {})
        notes_curr = apps.get("baicizhan", {}).get("notes", {})
        init_ids = set(notes_init.keys())
        curr_ids = set(notes_curr.keys())
        new_note_ids = curr_ids - init_ids

        new_notes_for_word = [
            nid for nid in new_note_ids
            if notes_curr[nid].get("wordId") == word_id
        ]

        checks = []
        checks.append({
            "label": "new note exists",
            "passed": len(new_notes_for_word) > 0,
            "expected": "at least 1 new note",
            "actual": f"{len(new_notes_for_word)} new notes for word {word_id}",
        })

        if expected_content and new_notes_for_word:
            note_content = notes_curr[new_notes_for_word[0]].get("content", "")
            checks.append({
                "label": "note content matches",
                "passed": note_content == expected_content,
                "expected": expected_content,
                "actual": note_content,
            })

        # Check word's noteIds updated
        word = apps.get("baicizhan", {}).get("words", {}).get(word_id, {})
        word_note_ids = set(word.get("noteIds", []))
        checks.append({
            "label": "word noteIds updated",
            "passed": new_note_ids.issubset(word_note_ids),
            "expected": f"new note ids in word.noteIds",
            "actual": f"word.noteIds={word.get('noteIds')}, new={new_note_ids}",
        })

        return {
            "label": f"note created for word {word_id}",
            "passed": all(c.get("passed", False) for c in checks),
            "checks": checks,
            "new_note_ids": list(new_note_ids),
        }

    @staticmethod
    def check_note_edited(apps: dict, apps_init: dict, note_id: str, expected_content: str) -> dict:
        """Check that an existing note was edited."""
        notes_init = apps_init.get("baicizhan", {}).get("notes", {})
        notes_curr = apps.get("baicizhan", {}).get("notes", {})
        note_init = notes_init.get(note_id, {})
        note_curr = notes_curr.get(note_id, {})

        checks = []
        checks.append({
            "label": "note still exists",
            "passed": note_id in notes_curr,
            "expected": "note exists",
            "actual": f"note {'exists' if note_id in notes_curr else 'missing'}",
        })
        checks.append({
            "label": "content changed",
            "passed": note_curr.get("content") != note_init.get("content"),
            "expected": "content different from initial",
            "actual": f"initial='{note_init.get('content')}', current='{note_curr.get('content')}'",
        })
        checks.append({
            "label": "content matches expected",
            "passed": note_curr.get("content") == expected_content,
            "expected": expected_content,
            "actual": note_curr.get("content"),
        })

        return {
            "label": f"note {note_id} edited",
            "passed": all(c.get("passed", False) for c in checks),
            "checks": checks,
        }

    # ---- Exercise checks ----

    @staticmethod
    def check_spelling_completed(apps: dict, apps_init: dict, word_id: str) -> dict:
        """Check that a spelling exercise was completed for a word."""
        exercises_init = apps_init.get("baicizhan", {}).get("spellingExercises", {})
        exercises_curr = apps.get("baicizhan", {}).get("spellingExercises", {})
        init_ids = set(exercises_init.keys())
        curr_ids = set(exercises_curr.keys())
        new_ids = curr_ids - init_ids

        new_for_word = [
            eid for eid in new_ids
            if exercises_curr[eid].get("wordId") == word_id
        ]

        checks = []
        checks.append({
            "label": "exercise created",
            "passed": len(new_for_word) > 0,
            "expected": "new exercise for target word",
            "actual": f"{len(new_for_word)} new exercises for word {word_id}",
        })

        if new_for_word:
            ex = exercises_curr[new_for_word[0]]
            checks.append({
                "label": "exercise completed",
                "passed": ex.get("isCompleted", False),
                "expected": True,
                "actual": ex.get("isCompleted"),
            })
            checks.append({
                "label": "exercise correct",
                "passed": ex.get("isCorrect", False),
                "expected": True,
                "actual": ex.get("isCorrect"),
            })
            checks.append({
                "label": "attempts recorded",
                "passed": len(ex.get("attempts", [])) > 0,
                "expected": "at least 1 attempt",
                "actual": f"{len(ex.get('attempts', []))} attempts",
            })

        return {
            "label": f"spelling completed for word {word_id}",
            "passed": all(c.get("passed", False) for c in checks),
            "checks": checks,
        }

    @staticmethod
    def check_listening_completed(apps: dict, apps_init: dict, word_id: str) -> dict:
        """Check that a listening exercise was completed for a word."""
        exercises_init = apps_init.get("baicizhan", {}).get("listeningExercises", {})
        exercises_curr = apps.get("baicizhan", {}).get("listeningExercises", {})
        init_ids = set(exercises_init.keys())
        curr_ids = set(exercises_curr.keys())
        new_ids = curr_ids - init_ids

        new_for_word = [
            eid for eid in new_ids
            if exercises_curr[eid].get("wordId") == word_id
        ]

        checks = []
        checks.append({
            "label": "exercise created",
            "passed": len(new_for_word) > 0,
            "expected": "new exercise for target word",
            "actual": f"{len(new_for_word)} new exercises for word {word_id}",
        })

        if new_for_word:
            ex = exercises_curr[new_for_word[0]]
            checks.append({
                "label": "audio played",
                "passed": ex.get("played", False),
                "expected": True,
                "actual": ex.get("played"),
            })
            checks.append({
                "label": "exercise completed",
                "passed": ex.get("isCompleted", False),
                "expected": True,
                "actual": ex.get("isCompleted"),
            })
            checks.append({
                "label": "exercise correct",
                "passed": ex.get("isCorrect", False),
                "expected": True,
                "actual": ex.get("isCorrect"),
            })

        return {
            "label": f"listening completed for word {word_id}",
            "passed": all(c.get("passed", False) for c in checks),
            "checks": checks,
        }

    # ---- Review checks ----

    @staticmethod
    def check_word_reviewed(apps: dict, apps_init: dict, word_id: str) -> dict:
        """Check that a word was reviewed and updated."""
        words_init = apps_init.get("baicizhan", {}).get("words", {})
        words_curr = apps.get("baicizhan", {}).get("words", {})
        word_curr = words_curr.get(word_id, {})

        # Check review record created
        records_init = apps_init.get("baicizhan", {}).get("reviewRecords", [])
        records_curr = apps.get("baicizhan", {}).get("reviewRecords", [])
        new_records = [r for r in records_curr if r["id"] not in {ri["id"] for ri in records_init}]
        word_review_records = [r for r in new_records if r.get("wordId") == word_id]

        mistake_book_curr = apps.get("baicizhan", {}).get("mistakeBook", [])

        checks = []
        checks.append({
            "label": "review record created",
            "passed": len(word_review_records) > 0,
            "expected": "new review record for target word",
            "actual": f"{len(word_review_records)} new review records",
        })
        checks.append({
            "label": "word removed from mistakeBook",
            "passed": word_id not in mistake_book_curr,
            "expected": f"{word_id} removed from mistakeBook",
            "actual": f"{word_id} {'in' if word_id in mistake_book_curr else 'not in'} mistakeBook",
        })
        checks.append({
            "label": "review status updated",
            "passed": word_curr.get("reviewStatus") == "reviewed",
            "expected": "reviewed",
            "actual": word_curr.get("reviewStatus"),
        })

        return {
            "label": f"word {word_id} reviewed",
            "passed": all(c.get("passed", False) for c in checks),
            "checks": checks,
        }

    # ---- Plan checks ----

    @staticmethod
    def check_daily_goal(apps: dict, expected_goal: int) -> dict:
        """Check that the daily goal was set."""
        plan = apps.get("baicizhan", {}).get("studyPlan", {})
        actual = plan.get("dailyGoal")
        return {
            "label": "daily goal set",
            "passed": actual == expected_goal,
            "expected": expected_goal,
            "actual": actual,
        }

    @staticmethod
    def check_word_book_switched(apps: dict, expected_book_id: str) -> dict:
        """Check that the word book was switched."""
        plan = apps.get("baicizhan", {}).get("studyPlan", {})
        books = apps.get("baicizhan", {}).get("wordBooks", {})
        actual_book = plan.get("bookId")

        checks = []
        checks.append({
            "label": "studyPlan bookId",
            "passed": actual_book == expected_book_id,
            "expected": expected_book_id,
            "actual": actual_book,
        })
        # Check the book is marked as current
        book = books.get(expected_book_id, {})
        checks.append({
            "label": "book marked as current",
            "passed": book.get("isCurrent", False),
            "expected": True,
            "actual": book.get("isCurrent"),
        })

        return {
            "label": f"word book switched to {expected_book_id}",
            "passed": all(c.get("passed", False) for c in checks),
            "checks": checks,
        }

    @staticmethod
    def check_reminder(apps: dict, expected_enabled: bool, expected_time: str | None = None) -> dict:
        """Check reminder settings."""
        plan = apps.get("baicizhan", {}).get("studyPlan", {})
        enabled_ok = plan.get("reminderEnabled") == expected_enabled
        time_ok = True
        if expected_time is not None:
            time_ok = plan.get("reminderTime") == expected_time

        return {
            "label": "reminder settings",
            "passed": enabled_ok and time_ok,
            "expected": f"enabled={expected_enabled}, time={expected_time}",
            "actual": f"enabled={plan.get('reminderEnabled')}, time={plan.get('reminderTime')}",
        }

    # ---- Samplers ----

    @staticmethod
    def sample_word_for_study(apps: dict) -> dict:
        """Sample a word that is 'unknown' and belongs to the current book."""
        plan = apps.get("baicizhan", {}).get("studyPlan", {})
        book_id = plan.get("bookId", "basic")
        words = apps.get("baicizhan", {}).get("words", {})
        candidates = [
            w for w in words.values()
            if w.get("bookId") == book_id and w.get("familiarity") in ("unknown", "learning")
        ]
        if not candidates:
            raise ValueError(f"No unknown/learning words found in book '{book_id}' for study")
        return candidates[0]

    @staticmethod
    def sample_word_not_favorite(apps: dict) -> dict:
        """Sample a word that is NOT currently favorited."""
        words = apps.get("baicizhan", {}).get("words", {})
        favorites = set(apps.get("baicizhan", {}).get("favorites", []))
        candidates = [w for w in words.values() if w["id"] not in favorites]
        if not candidates:
            raise ValueError("No non-favorited words available")
        return candidates[0]

    @staticmethod
    def sample_word_favorite(apps: dict) -> dict:
        """Sample a word that IS currently favorited."""
        words = apps.get("baicizhan", {}).get("words", {})
        favorites = set(apps.get("baicizhan", {}).get("favorites", []))
        candidates = [w for w in words.values() if w["id"] in favorites]
        if not candidates:
            raise ValueError("No favorited words available")
        return candidates[0]

    @staticmethod
    def sample_word_with_note(apps: dict) -> dict:
        """Sample a word that has at least one note."""
        words = apps.get("baicizhan", {}).get("words", {})
        candidates = [w for w in words.values() if len(w.get("noteIds", [])) > 0]
        if not candidates:
            raise ValueError("No words with notes available")
        return candidates[0]

    @staticmethod
    def sample_word_in_mistake_book(apps: dict) -> dict:
        """Sample a word that is in the mistake book."""
        words = apps.get("baicizhan", {}).get("words", {})
        mistake_book = apps.get("baicizhan", {}).get("mistakeBook", [])
        candidates = [w for w in words.values() if w["id"] in mistake_book]
        if not candidates:
            raise ValueError("No words in mistake book")
        return candidates[0]

    @staticmethod
    def sample_book_not_current(apps: dict) -> dict:
        """Sample a word book that is NOT the current one."""
        books = apps.get("baicizhan", {}).get("wordBooks", {})
        plan = apps.get("baicizhan", {}).get("studyPlan", {})
        current_id = plan.get("bookId", "basic")
        candidates = [
            b for bid, b in books.items()
            if bid != current_id
        ]
        if not candidates:
            raise ValueError("No alternative word books available")
        return candidates[0]
