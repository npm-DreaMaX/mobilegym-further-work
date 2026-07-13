"""
Baicizhan (百词斩) benchmark task definitions.
15 tasks covering search, study, favorites, notes, exercises, review, and plan configuration.
"""

# -- Task Index (auto-generated, do not edit) --
# 15 tasks | L1×2  L2×6  L3×6  L4×1
#
# [L2] SearchWordAndReportMeaning      搜索「{word}」，打开详情，告诉我它的中文释义。
# [L2] SearchWordAndReportExample      搜索「{word}」，打开详情，告诉我它的英文例句。
# [L2] CheckTodayProgress              查看今日学习进度，告诉我今天学了多少个单词。
# [L3] LearnNewWord                    从首页开始今日学习，学习单词「{word_spelling}」并标记为认识。
# [L3] MarkWordUnknown                 从首页开始学习，将单词「{word_spelling}」标记为不认识。
# [L3] AddFavorite                     将单词「{word_spelling}」加入收藏。
# [L2] RemoveFavorite                  将单词「{word_spelling}」从收藏中移除。
# [L3] AddWordNote                     为单词「{word_spelling}」添加笔记：「{note_content}」。
# [L3] EditWordNote                    编辑单词「{word_spelling}」的已有笔记，将内容改为「{new_content}」。
# [L4] CompleteSpellingExercise        为单词「{word_spelling}」完成拼写练习，正确拼出该单词。
# [L3] CompleteListeningExercise       为单词「{word_spelling}」完成听力练习：先播放发音，再从选项中选出正确单词。
# [L2] ReviewWrongWord                 在错题本中复习单词「{word_spelling}」，标记为答对了。
# [L1] ChangeDailyGoal                 将每日学习目标修改为{goal}个单词。
# [L2] ConfigureReminder               打开学习提醒，将提醒时间设为{time}。
# [L1] SwitchWordBook                  将当前词书切换为{book_display}。
# -- End Task Index --

from __future__ import annotations

from typing import Any

from bench_env.task.base import BaseTask
from bench_env.task.common_tasks import AnswerTask, CriteriaTask, build_answer_checks, match_value
from bench_env.task.baicizhan.app import (
    Baicizhan,
    BAICIZHAN_SEARCH_WORD_PARAM,
    BAICIZHAN_DAILY_GOAL_PARAM,
    BAICIZHAN_BOOK_PARAM,
    BAICIZHAN_REMINDER_TIME_PARAM,
    BAICIZHAN_NOTE_CONTENT_PARAM,
    SEARCH_EXPECTED_CHANGES,
    STUDY_EXPECTED_CHANGES,
    FAVORITE_EXPECTED_CHANGES,
    NOTE_EXPECTED_CHANGES,
    SPELLING_EXPECTED_CHANGES,
    LISTENING_EXPECTED_CHANGES,
    REVIEW_EXPECTED_CHANGES,
    PLAN_EXPECTED_CHANGES,
    GOAL_EXPECTED_CHANGES,
)
from bench_env.task.judge import JudgeInput


# =============================================================================
# L2 — SearchWordAndReportMeaning (Query)
# Agent must: search for a word → open correct detail → report Chinese meaning
# =============================================================================
class SearchWordAndReportMeaning(AnswerTask):
    templates = [
        "在百词斩中搜索「{word}」，打开它的详情页，告诉我这个单词的中文释义是什么。",
        "帮我查一下百词斩里「{word}」的意思，把中文释义告诉我。",
    ]
    apps = ["baicizhan"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["search", "extract"]
    parameters = {"word": BAICIZHAN_SEARCH_WORD_PARAM}
    expected_changes = SEARCH_EXPECTED_CHANGES
    optimal_paths = [["home.search.open", "search.word.open"]]

    @property
    def answer_fields(self):
        return [{"type": "text", "label": "中文释义", "hint": "请填写该单词的中文释义"}]

    def get_answer(self, input: JudgeInput) -> Any:
        word_spelling = self.p.word
        word = Baicizhan.get_word_by_spelling(input.apps_init, word_spelling)
        if word is None:
            raise ValueError(f"Word '{word_spelling}' not found in world data")
        return word.get("chineseMeaning", "")

    def check_goals(self, input: JudgeInput) -> list[dict]:
        word_spelling = self.p.word
        word = Baicizhan.get_word_by_spelling(input.apps_init, word_spelling)
        if word is None:
            return [{"label": "word lookup", "passed": False, "expected": word_spelling, "actual": "not found"}]

        word_id = word["id"]
        checks = []

        # 1. Must have searched and opened the correct word
        checks.append({
            "label": "correct word opened from search",
            "passed": Baicizhan.check_searched(input.apps, word_id),
            "expected": f"openedWordId={word_id}",
            "actual": f"openedWordId={input.apps.get('baicizhan', {}).get('search', {}).get('openedWordId')}",
        })

        # 2. Answer check via match_value
        expected_answer = self.get_answer(input)
        answer_checks = build_answer_checks(input, expected_answer, field="chineseMeaning")
        checks.extend(answer_checks)

        return checks


# =============================================================================
# L2 — SearchWordAndReportExample (Query)
# Agent must: search → open detail → report English example sentence
# =============================================================================
class SearchWordAndReportExample(AnswerTask):
    templates = [
        "在百词斩中搜索「{word}」，打开详情页，把它的英文例句告诉我。",
        "查一下百词斩里「{word}」的例句是什么，把英文原句发给我。",
    ]
    apps = ["baicizhan"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["search", "extract"]
    parameters = {"word": BAICIZHAN_SEARCH_WORD_PARAM}
    expected_changes = SEARCH_EXPECTED_CHANGES
    optimal_paths = [["home.search.open", "search.word.open"]]

    @property
    def answer_fields(self):
        return [{"type": "text", "label": "英文例句", "hint": "请填写该单词的英文例句"}]

    def get_answer(self, input: JudgeInput) -> Any:
        word_spelling = self.p.word
        word = Baicizhan.get_word_by_spelling(input.apps_init, word_spelling)
        if word is None:
            raise ValueError(f"Word '{word_spelling}' not found")
        return word.get("exampleSentence", "")

    def check_goals(self, input: JudgeInput) -> list[dict]:
        word_spelling = self.p.word
        word = Baicizhan.get_word_by_spelling(input.apps_init, word_spelling)
        if word is None:
            return [{"label": "word lookup", "passed": False, "expected": word_spelling, "actual": "not found"}]

        word_id = word["id"]
        checks = []

        checks.append({
            "label": "correct word opened from search",
            "passed": Baicizhan.check_searched(input.apps, word_id),
            "expected": f"openedWordId={word_id}",
            "actual": f"openedWordId={input.apps.get('baicizhan', {}).get('search', {}).get('openedWordId')}",
        })

        expected_answer = self.get_answer(input)
        answer_checks = build_answer_checks(input, expected_answer, field="exampleSentence")
        checks.extend(answer_checks)

        return checks


# =============================================================================
# L2 — CheckTodayProgress (Query)
# Agent must: navigate to progress page → report studied count
# =============================================================================
class CheckTodayProgress(AnswerTask):
    templates = [
        "查看百词斩的今日学习进度，告诉我今天已经学了多少个单词。",
        "打开今日进度页面，我今天学了多少个词？",
    ]
    apps = ["baicizhan"]
    scope = "S1"
    objective = "query"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["extract"]
    parameters = {}
    expected_changes = []
    optimal_paths = [["home.progress.open"]]

    @property
    def answer_fields(self):
        return [{"type": "number", "label": "今日已学单词数", "hint": "填写数字"}]

    def get_answer(self, input: JudgeInput) -> Any:
        progress = input.apps_init.get("baicizhan", {}).get("dailyProgress", {})
        return progress.get("studiedCount", 0)

    def check_goals(self, input: JudgeInput) -> list[dict]:
        checks = []
        expected = self.get_answer(input)
        answer_checks = build_answer_checks(input, expected, field="studiedCount")
        checks.extend(answer_checks)
        return checks


# =============================================================================
# L3 — LearnNewWord (Operate)
# Agent must: start study session → find target word card → mark as known
# Multi-step: Home → Study → view card → reveal meaning → click "认识"
# =============================================================================
class LearnNewWord(BaseTask):
    templates = [
        "在百词斩中从首页开始今日学习，学习单词「{word_spelling}」，把它标记为认识。",
        "开始百词斩的每日学习，学到「{word_spelling}」这个词时点认识。",
    ]
    apps = ["baicizhan"]
    scope = "S2"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["navigation", "action"]
    parameters = {
        "word_spelling": {
            "type": "string",
            "default": "eloquent",
            "description": "目标单词的英文拼写",
        },
        "_word": {
            "sampler": Baicizhan.sample_word_for_study,
            "fields": {"word_spelling": "spelling"},
        },
    }
    expected_changes = STUDY_EXPECTED_CHANGES
    optimal_paths = [["home.study.start"]]
    max_steps = 30

    async def _prepare(self, env):
        """Ensure the target word is in the current book's study session word list."""
        state = await env.get_state()
        word = Baicizhan.get_word_by_spelling(state["apps"], self.p.word_spelling)
        if word is None:
            raise ValueError(f"Word '{self.p.word_spelling}' not found")

        # Make word unknown so it's eligible for study
        word_id = word["id"]
        await env.set_state({
            "apps": {
                "baicizhan": {
                    "words": {
                        word_id: {
                            "familiarity": "unknown",
                            "studyCount": word.get("studyCount", 0),
                            "reviewStatus": "pending",
                        }
                    },
                    "todaySession": None,
                }
            }
        }, {"deep": True})

    def check_goals(self, input: JudgeInput) -> list[dict]:
        word = Baicizhan.get_word_by_spelling(input.apps_init, self.p.word_spelling)
        if word is None:
            return [{"label": "word lookup", "passed": False, "expected": self.p.word_spelling, "actual": "not found"}]

        word_id = word["id"]
        checks = []

        # Check the word was actually studied
        study_check = Baicizhan.check_word_studied(input.apps, input.apps_init, word_id, expected_result="known")
        checks.append(study_check)

        # Check familiarity changed to learning or familiar
        familiarity_check = Baicizhan.check_word_familiarity(input.apps, word_id, "learning")
        checks.append(familiarity_check)

        # Check word is NOT in mistake book (since we marked it known)
        not_mistake = Baicizhan.check_word_not_in_mistake_book(input.apps, word_id)
        checks.append(not_mistake)

        # Verify session exists and has progress
        session = input.apps.get("baicizhan", {}).get("todaySession")
        checks.append({
            "label": "study session active",
            "passed": session is not None and session.get("completedWords", 0) > 0,
            "expected": "session with progress",
            "actual": f"session={'exists' if session else 'none'}, completedWords={session.get('completedWords', 0) if session else 0}",
        })

        # Non-target words check: other unknown words in the same book should be unaffected
        # (only the target word should have changed)
        other_words_init = {
            wid: w for wid, w in input.apps_init.get("baicizhan", {}).get("words", {}).items()
            if w.get("bookId") == word.get("bookId") and wid != word_id and w.get("familiarity") == "unknown"
        }
        other_words_curr = {
            wid: w for wid, w in input.apps.get("baicizhan", {}).get("words", {}).items()
            if w.get("bookId") == word.get("bookId") and wid != word_id and w.get("familiarity") == "unknown"
        }
        # At least one other unknown word should still be unknown (proves we didn't batch-mark everything)
        unchanged_count = sum(
            1 for wid in other_words_init
            if wid in other_words_curr and other_words_curr[wid].get("familiarity") == "unknown"
        )
        checks.append({
            "label": "other unknown words unaffected",
            "passed": len(other_words_init) == 0 or unchanged_count >= len(other_words_init) - 1,
            "expected": "other unknown words still unknown",
            "actual": f"{unchanged_count}/{len(other_words_init)} other unknown words still unknown",
        })

        return checks


# =============================================================================
# L3 — MarkWordUnknown (Operate)
# Agent must: start study → mark target word as unknown → check mistake book
# =============================================================================
class MarkWordUnknown(BaseTask):
    templates = [
        "在百词斩中开始今日学习，学到「{word_spelling}」时点不认识，把它加入错题本。",
        "开始百词斩学习，把「{word_spelling}」标记为不认识。",
    ]
    apps = ["baicizhan"]
    scope = "S2"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["navigation", "action"]
    parameters = {
        "word_spelling": {
            "type": "string",
            "default": "hypothesis",
            "description": "目标单词的英文拼写",
        },
        "_word": {
            "sampler": Baicizhan.sample_word_for_study,
            "fields": {"word_spelling": "spelling"},
        },
    }
    expected_changes = STUDY_EXPECTED_CHANGES + ["baicizhan.mistakeBook"]
    optimal_paths = [["home.study.start"]]
    max_steps = 30

    async def _prepare(self, env):
        state = await env.get_state()
        word = Baicizhan.get_word_by_spelling(state["apps"], self.p.word_spelling)
        if word is None:
            raise ValueError(f"Word '{self.p.word_spelling}' not found")
        word_id = word["id"]
        await env.set_state({
            "apps": {
                "baicizhan": {
                    "words": {
                        word_id: {
                            "familiarity": "unknown",
                            "studyCount": word.get("studyCount", 0),
                            "mistakeCount": word.get("mistakeCount", 0),
                            "reviewStatus": "pending",
                        }
                    },
                    "todaySession": None,
                    # Ensure word is NOT already in mistake book
                    "mistakeBook": [mid for mid in state["apps"]["baicizhan"].get("mistakeBook", []) if mid != word_id],
                }
            }
        }, {"deep": True})

    def check_goals(self, input: JudgeInput) -> list[dict]:
        word = Baicizhan.get_word_by_spelling(input.apps_init, self.p.word_spelling)
        if word is None:
            return [{"label": "word lookup", "passed": False, "expected": self.p.word_spelling, "actual": "not found"}]

        word_id = word["id"]
        checks = []

        # Study record must exist with result "unknown"
        study_check = Baicizhan.check_word_studied(input.apps, input.apps_init, word_id, expected_result="unknown")
        checks.append(study_check)

        # Word must be in mistake book
        in_mistake = Baicizhan.check_word_in_mistake_book(input.apps, word_id)
        checks.append(in_mistake)

        # Familiarity should be 'unknown'
        familiarity_check = Baicizhan.check_word_familiarity(input.apps, word_id, "unknown")
        checks.append(familiarity_check)

        # Mistake count must have increased
        word_init = input.apps_init.get("baicizhan", {}).get("words", {}).get(word_id, {})
        word_curr = input.apps.get("baicizhan", {}).get("words", {}).get(word_id, {})
        mistake_delta = word_curr.get("mistakeCount", 0) - word_init.get("mistakeCount", 0)
        checks.append({
            "label": "mistake count increased",
            "passed": mistake_delta > 0,
            "expected": "mistakeCount > initial",
            "actual": f"mistakeCount delta = {mistake_delta}",
        })

        return checks


# =============================================================================
# L3 — AddFavorite (Operate)
# Agent must: find word → open detail → toggle favorite ON
# =============================================================================
class AddFavorite(BaseTask):
    templates = [
        "在百词斩中找到「{word_spelling}」，把它加入收藏夹。",
        "帮我把百词斩里的「{word_spelling}」收藏了。",
    ]
    apps = ["baicizhan"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["navigation", "action"]
    parameters = {
        "word_spelling": {
            "type": "string",
            "default": "benevolent",
            "description": "目标单词的英文拼写",
        },
        "_word": {
            "sampler": Baicizhan.sample_word_not_favorite,
            "fields": {"word_spelling": "spelling"},
        },
    }
    expected_changes = FAVORITE_EXPECTED_CHANGES
    optimal_paths = [["home.search.open", "search.word.open"]]

    async def _prepare(self, env):
        """Ensure target word is NOT already favorited."""
        state = await env.get_state()
        word = Baicizhan.get_word_by_spelling(state["apps"], self.p.word_spelling)
        if word is None:
            raise ValueError(f"Word '{self.p.word_spelling}' not found")
        word_id = word["id"]
        await env.set_state({
            "apps": {
                "baicizhan": {
                    "words": {
                        word_id: {"isFavorite": False}
                    },
                    "favorites": [fid for fid in state["apps"]["baicizhan"].get("favorites", []) if fid != word_id],
                }
            }
        }, {"deep": True})

    def check_goals(self, input: JudgeInput) -> list[dict]:
        word = Baicizhan.get_word_by_spelling(input.apps_init, self.p.word_spelling)
        if word is None:
            return [{"label": "word lookup", "passed": False, "expected": self.p.word_spelling, "actual": "not found"}]

        word_id = word["id"]
        checks = []

        # Must be favorited now
        fav_check = Baicizhan.check_favorite_status(input.apps, word_id, True)
        checks.append(fav_check)

        # Other favorites must be unchanged
        unchanged_check = Baicizhan.check_favorite_count_unchanged(input.apps, input.apps_init, exclude_word_id=word_id)
        checks.append(unchanged_check)

        # Statistics totalFavoriteCount must have increased
        stats_init = input.apps_init.get("baicizhan", {}).get("statistics", {})
        stats_curr = input.apps.get("baicizhan", {}).get("statistics", {})
        fav_count_delta = stats_curr.get("totalFavoriteCount", 0) - stats_init.get("totalFavoriteCount", 0)
        checks.append({
            "label": "totalFavoriteCount increased",
            "passed": fav_count_delta > 0,
            "expected": "totalFavoriteCount > initial",
            "actual": f"delta = {fav_count_delta}",
        })

        return checks


# =============================================================================
# L2 — RemoveFavorite (Operate)
# Agent must: find favorited word → open detail → toggle favorite OFF
# =============================================================================
class RemoveFavorite(BaseTask):
    templates = [
        "在百词斩中找到「{word_spelling}」，把它从收藏夹中移除。",
        "帮我把百词斩里收藏的「{word_spelling}」取消收藏。",
    ]
    apps = ["baicizhan"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["navigation", "action"]
    parameters = {
        "word_spelling": {
            "type": "string",
            "default": "benevolent",
            "description": "目标单词的英文拼写",
        },
        "_word": {
            "sampler": Baicizhan.sample_word_favorite,
            "fields": {"word_spelling": "spelling"},
        },
    }
    expected_changes = FAVORITE_EXPECTED_CHANGES
    optimal_paths = [["tab.me", "me.favorites.open", "favorites.word.open"]]

    async def _prepare(self, env):
        """Ensure target word IS favorited."""
        state = await env.get_state()
        word = Baicizhan.get_word_by_spelling(state["apps"], self.p.word_spelling)
        if word is None:
            raise ValueError(f"Word '{self.p.word_spelling}' not found")
        word_id = word["id"]
        favs = state["apps"]["baicizhan"].get("favorites", [])
        if word_id not in favs:
            favs = list(favs) + [word_id]
        await env.set_state({
            "apps": {
                "baicizhan": {
                    "words": {
                        word_id: {"isFavorite": True}
                    },
                    "favorites": favs,
                }
            }
        }, {"deep": True})

    def check_goals(self, input: JudgeInput) -> list[dict]:
        word = Baicizhan.get_word_by_spelling(input.apps_init, self.p.word_spelling)
        if word is None:
            return [{"label": "word lookup", "passed": False, "expected": self.p.word_spelling, "actual": "not found"}]

        word_id = word["id"]
        checks = []

        fav_check = Baicizhan.check_favorite_status(input.apps, word_id, False)
        checks.append(fav_check)

        unchanged_check = Baicizhan.check_favorite_count_unchanged(input.apps, input.apps_init, exclude_word_id=word_id)
        checks.append(unchanged_check)

        # totalFavoriteCount must have decreased
        stats_init = input.apps_init.get("baicizhan", {}).get("statistics", {})
        stats_curr = input.apps.get("baicizhan", {}).get("statistics", {})
        fav_count_delta = stats_curr.get("totalFavoriteCount", 0) - stats_init.get("totalFavoriteCount", 0)
        checks.append({
            "label": "totalFavoriteCount decreased",
            "passed": fav_count_delta < 0,
            "expected": "totalFavoriteCount < initial",
            "actual": f"delta = {fav_count_delta}",
        })

        return checks


# =============================================================================
# L3 — AddWordNote (Operate)
# Agent must: open word detail → add note with specific content → verify
# =============================================================================
class AddWordNote(BaseTask):
    templates = [
        "在百词斩中打开「{word_spelling}」的详情页，添加一条笔记：「{note_content}」。",
        "帮我在百词斩的「{word_spelling}」里记一条笔记，内容是「{note_content}」。",
    ]
    apps = ["baicizhan"]
    scope = "S2"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["navigation", "input", "action"]
    parameters = {
        "word_spelling": {
            "type": "string",
            "default": "eloquent",
            "description": "目标单词的英文拼写",
        },
        "note_content": BAICIZHAN_NOTE_CONTENT_PARAM,
    }
    expected_changes = NOTE_EXPECTED_CHANGES
    optimal_paths = [["home.search.open", "search.word.open"]]
    max_steps = 30

    def check_goals(self, input: JudgeInput) -> list[dict]:
        word = Baicizhan.get_word_by_spelling(input.apps_init, self.p.word_spelling)
        if word is None:
            return [{"label": "word lookup", "passed": False, "expected": self.p.word_spelling, "actual": "not found"}]

        word_id = word["id"]
        checks = []

        note_check = Baicizhan.check_note_created(input.apps, input.apps_init, word_id, expected_content=self.p.note_content)
        checks.append(note_check)

        # Other words' notes unchanged
        notes_init = input.apps_init.get("baicizhan", {}).get("notes", {})
        notes_curr = input.apps.get("baicizhan", {}).get("notes", {})
        new_note_ids = note_check.get("new_note_ids", [])
        other_notes_init = {k: v for k, v in notes_init.items()}
        other_notes_curr = {k: v for k, v in notes_curr.items() if k not in new_note_ids}
        other_unchanged = all(
            k in other_notes_curr and other_notes_curr[k].get("content") == other_notes_init[k].get("content")
            for k in other_notes_init
        )
        checks.append({
            "label": "other notes unchanged",
            "passed": other_unchanged,
            "expected": "all other notes unchanged",
            "actual": f"other notes {'unchanged' if other_unchanged else 'SOME CHANGED'}",
        })

        return checks


# =============================================================================
# L3 — EditWordNote (Operate)
# Agent must: find word with existing note → edit the note content → verify
# =============================================================================
class EditWordNote(BaseTask):
    templates = [
        "在百词斩中打开「{word_spelling}」的详情页，把它的已有笔记内容改为「{new_content}」。",
        "帮我把百词斩里「{word_spelling}」的笔记修改成「{new_content}」。",
    ]
    apps = ["baicizhan"]
    scope = "S2"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["navigation", "input", "action"]
    parameters = {
        "word_spelling": {
            "type": "string",
            "default": "benevolent",
            "description": "目标单词的英文拼写",
        },
        "new_content": {
            "type": "string",
            "default": "修改后的笔记：这个单词已掌握，需要注意在写作中正确使用。",
            "description": "修改后的笔记内容",
        },
    }
    expected_changes = NOTE_EXPECTED_CHANGES
    optimal_paths = [["home.search.open", "search.word.open"]]
    max_steps = 30

    async def _prepare(self, env):
        """Ensure target word has an existing note."""
        state = await env.get_state()
        word = Baicizhan.get_word_by_spelling(state["apps"], self.p.word_spelling)
        if word is None:
            raise ValueError(f"Word '{self.p.word_spelling}' not found")

        word_id = word["id"]
        existing_notes = state["apps"]["baicizhan"].get("notes", {})
        existing_words = state["apps"]["baicizhan"].get("words", {})

        # Find or create a note for this word
        word_note_ids = existing_words.get(word_id, {}).get("noteIds", [])
        if not word_note_ids:
            # Create a default note
            note_id = "note_setup_001"
            await env.set_state({
                "apps": {
                    "baicizhan": {
                        "notes": {
                            note_id: {
                                "id": note_id,
                                "wordId": word_id,
                                "content": "原始笔记内容：需要多加练习。",
                                "createdAt": 1750000000000,
                                "updatedAt": 1750000000000,
                            }
                        },
                        "words": {
                            word_id: {"noteIds": [note_id]}
                        },
                    }
                }
            }, {"deep": True})

    def check_goals(self, input: JudgeInput) -> list[dict]:
        word = Baicizhan.get_word_by_spelling(input.apps_init, self.p.word_spelling)
        if word is None:
            return [{"label": "word lookup", "passed": False, "expected": self.p.word_spelling, "actual": "not found"}]

        word_id = word["id"]
        word_init = input.apps_init.get("baicizhan", {}).get("words", {}).get(word_id, {})
        note_ids = word_init.get("noteIds", [])
        if not note_ids:
            return [{"label": "no note to edit", "passed": False, "expected": "word has notes", "actual": "no notes"}]

        target_note_id = note_ids[0]
        checks = []

        note_edit_check = Baicizhan.check_note_edited(input.apps, input.apps_init, target_note_id, self.p.new_content)
        checks.append(note_edit_check)

        # Verify updatedAt changed
        note_curr = input.apps.get("baicizhan", {}).get("notes", {}).get(target_note_id, {})
        note_init = input.apps_init.get("baicizhan", {}).get("notes", {}).get(target_note_id, {})
        checks.append({
            "label": "updatedAt timestamp changed",
            "passed": note_curr.get("updatedAt") != note_init.get("updatedAt"),
            "expected": "updatedAt > initial",
            "actual": f"initial={note_init.get('updatedAt')}, current={note_curr.get('updatedAt')}",
        })

        # Other notes must be unchanged
        other_note_ids = [nid for nid in note_ids if nid != target_note_id]
        notes_curr = input.apps.get("baicizhan", {}).get("notes", {})
        notes_init = input.apps_init.get("baicizhan", {}).get("notes", {})
        other_unchanged = all(
            nid in notes_curr and notes_curr[nid].get("content") == notes_init[nid].get("content")
            for nid in other_note_ids
        )
        checks.append({
            "label": "other notes unchanged",
            "passed": other_unchanged,
            "expected": "other notes preserved",
            "actual": f"other notes {'unchanged' if other_unchanged else 'CHANGED'}",
        })

        return checks


# =============================================================================
# L4 — CompleteSpellingExercise (Operate)
# Agent must: open word detail → start spelling exercise → type correct spelling → submit
# =============================================================================
class CompleteSpellingExercise(BaseTask):
    templates = [
        "在百词斩中打开「{word_spelling}」的详情页，进入拼写练习，正确拼出这个单词。",
        "帮我在百词斩里完成「{word_spelling}」的拼写练习，把正确的拼写输入提交。",
    ]
    apps = ["baicizhan"]
    scope = "S2"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["navigation", "input", "action"]
    parameters = {
        "word_spelling": {
            "type": "string",
            "default": "abandon",
            "description": "目标单词的英文拼写",
        },
    }
    expected_changes = SPELLING_EXPECTED_CHANGES
    optimal_paths = [["home.search.open", "search.word.open", "word.spelling.open"]]
    max_steps = 30

    def check_goals(self, input: JudgeInput) -> list[dict]:
        word = Baicizhan.get_word_by_spelling(input.apps_init, self.p.word_spelling)
        if word is None:
            return [{"label": "word lookup", "passed": False, "expected": self.p.word_spelling, "actual": "not found"}]

        word_id = word["id"]
        checks = []

        spelling_check = Baicizhan.check_spelling_completed(input.apps, input.apps_init, word_id)
        checks.append(spelling_check)

        # Verify the submitted answer matches the word spelling
        exercises_init = input.apps_init.get("baicizhan", {}).get("spellingExercises", {})
        exercises_curr = input.apps.get("baicizhan", {}).get("spellingExercises", {})
        new_ids = set(exercises_curr.keys()) - set(exercises_init.keys())
        new_for_word = [eid for eid in new_ids if exercises_curr[eid].get("wordId") == word_id]
        if new_for_word:
            ex = exercises_curr[new_for_word[0]]
            attempts = ex.get("attempts", [])
            last_attempt = attempts[-1] if attempts else ""
            checks.append({
                "label": "correct spelling submitted",
                "passed": last_attempt.lower() == word["spelling"].lower(),
                "expected": word["spelling"],
                "actual": last_attempt,
            })

        return checks


# =============================================================================
# L3 — CompleteListeningExercise (Operate)
# Agent must: open word detail → start listening → PLAY audio → select correct → submit
# =============================================================================
class CompleteListeningExercise(BaseTask):
    templates = [
        "在百词斩中打开「{word_spelling}」的详情页，进入听力练习，先点播放听发音，然后选出正确的单词。",
        "帮我在百词斩完成「{word_spelling}」的听力练习：先播放，再选出听到的是哪个词。",
    ]
    apps = ["baicizhan"]
    scope = "S2"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["navigation", "action"]
    parameters = {
        "word_spelling": {
            "type": "string",
            "default": "abandon",
            "description": "目标单词的英文拼写",
        },
    }
    expected_changes = LISTENING_EXPECTED_CHANGES
    optimal_paths = [["home.search.open", "search.word.open", "word.listening.open"]]
    max_steps = 30

    def check_goals(self, input: JudgeInput) -> list[dict]:
        word = Baicizhan.get_word_by_spelling(input.apps_init, self.p.word_spelling)
        if word is None:
            return [{"label": "word lookup", "passed": False, "expected": self.p.word_spelling, "actual": "not found"}]

        word_id = word["id"]
        checks = []

        listening_check = Baicizhan.check_listening_completed(input.apps, input.apps_init, word_id)
        checks.append(listening_check)

        # Verify played=true explicitly (critical: agent must have clicked play)
        exercises_init = input.apps_init.get("baicizhan", {}).get("listeningExercises", {})
        exercises_curr = input.apps.get("baicizhan", {}).get("listeningExercises", {})
        new_ids = set(exercises_curr.keys()) - set(exercises_init.keys())
        new_for_word = [eid for eid in new_ids if exercises_curr[eid].get("wordId") == word_id]
        if new_for_word:
            ex = exercises_curr[new_for_word[0]]
            checks.append({
                "label": "audio was played before submission",
                "passed": ex.get("played", False) is True,
                "expected": True,
                "actual": ex.get("played"),
            })
            # Verify the selected option matches the target word
            checks.append({
                "label": "correct word selected",
                "passed": ex.get("selectedOption") == word_id,
                "expected": word_id,
                "actual": ex.get("selectedOption"),
            })

        return checks


# =============================================================================
# L2 — ReviewWrongWord (Operate)
# Agent must: go to mistake book → start review → mark target word as correct
# =============================================================================
class ReviewWrongWord(BaseTask):
    templates = [
        "在百词斩的错题本中复习「{word_spelling}」，标记为答对了，把它从错题本移出。",
        "打开百词斩错题本，复习「{word_spelling}」这个词，答对后移出错题本。",
    ]
    apps = ["baicizhan"]
    scope = "S2"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["navigation", "action"]
    parameters = {
        "word_spelling": {
            "type": "string",
            "default": "diligent",
            "description": "目标单词的英文拼写",
        },
        "_word": {
            "sampler": Baicizhan.sample_word_in_mistake_book,
            "fields": {"word_spelling": "spelling"},
        },
    }
    expected_changes = REVIEW_EXPECTED_CHANGES
    optimal_paths = [["home.mistakes.open", "mistakes.review.start"]]
    max_steps = 30

    async def _prepare(self, env):
        """Ensure the target word is in the mistake book."""
        state = await env.get_state()
        word = Baicizhan.get_word_by_spelling(state["apps"], self.p.word_spelling)
        if word is None:
            raise ValueError(f"Word '{self.p.word_spelling}' not found")
        word_id = word["id"]
        mistake_book = state["apps"]["baicizhan"].get("mistakeBook", [])
        if word_id not in mistake_book:
            mistake_book = list(mistake_book) + [word_id]
        await env.set_state({
            "apps": {
                "baicizhan": {
                    "words": {
                        word_id: {"reviewStatus": "pending", "familiarity": "unknown"}
                    },
                    "mistakeBook": mistake_book,
                }
            }
        }, {"deep": True})

    def check_goals(self, input: JudgeInput) -> list[dict]:
        word = Baicizhan.get_word_by_spelling(input.apps_init, self.p.word_spelling)
        if word is None:
            return [{"label": "word lookup", "passed": False, "expected": self.p.word_spelling, "actual": "not found"}]

        word_id = word["id"]
        checks = []

        review_check = Baicizhan.check_word_reviewed(input.apps, input.apps_init, word_id)
        checks.append(review_check)

        # Review session must exist
        sessions_init = input.apps_init.get("baicizhan", {}).get("reviewSessions", [])
        sessions_curr = input.apps.get("baicizhan", {}).get("reviewSessions", [])
        new_session = len(sessions_curr) > len(sessions_init)
        checks.append({
            "label": "review session created",
            "passed": new_session,
            "expected": "new review session",
            "actual": f"sessions: {len(sessions_init)} → {len(sessions_curr)}",
        })

        return checks


# =============================================================================
# L1 — ChangeDailyGoal (Operate)
# Agent must: go to study plan → change daily goal → verify
# =============================================================================
class ChangeDailyGoal(CriteriaTask):
    templates = [
        "把百词斩的每日学习目标改成{goal}个单词。",
        "在百词斩里把每天背单词的数量设为{goal}个。",
    ]
    apps = ["baicizhan"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L1"
    capabilities = ["settings"]
    parameters = {"goal": BAICIZHAN_DAILY_GOAL_PARAM}
    criteria = {"studyPlan.dailyGoal": "{goal}"}
    optimal_paths = [["tab.me", "me.plan.open"]]
    expected_changes = GOAL_EXPECTED_CHANGES

    async def _post_sample(self, env):
        await self._invert_criteria(env)


# =============================================================================
# L2 — ConfigureReminder (Operate)
# Agent must: go to reminder settings → enable reminder → set time → save
# =============================================================================
class ConfigureReminder(CriteriaTask):
    templates = [
        "在百词斩中打开学习提醒，设为每天{time}提醒我背单词。",
        "帮我在百词斩设置里开启每日{time}的学习提醒。",
    ]
    apps = ["baicizhan"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["settings"]
    parameters = {"time": BAICIZHAN_REMINDER_TIME_PARAM}
    criteria = {
        "studyPlan.reminderEnabled": True,
        "studyPlan.reminderTime": "{time}",
    }
    optimal_paths = [["tab.me", "me.settings.open", "settings.reminder.open"]]
    expected_changes = PLAN_EXPECTED_CHANGES

    async def _post_sample(self, env):
        await self._invert_criteria(env)


# =============================================================================
# L1 — SwitchWordBook (Operate)
# Agent must: go to study plan → switch to target book → verify
# =============================================================================
class SwitchWordBook(CriteriaTask):
    templates = [
        "把百词斩的当前词书切换为{book_display}。",
        "在百词斩里把学习词书换成{book_display}。",
    ]
    apps = ["baicizhan"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L1"
    capabilities = ["settings"]
    parameters = {"book_display": BAICIZHAN_BOOK_PARAM}
    criteria = {"studyPlan.bookId": "{book_display}"}
    optimal_paths = [["tab.me", "me.plan.open"]]
    expected_changes = PLAN_EXPECTED_CHANGES

    async def _post_sample(self, env):
        await self._invert_criteria(env)
