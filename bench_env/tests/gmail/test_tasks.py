"""Offline structural and judge tests for the Gmail benchmark suite."""

from __future__ import annotations

import copy
import json
from pathlib import Path

import pytest

from bench_env.task.registry import TaskRegistry
from bench_env.task.gmail import tasks
from bench_env.tests.conftest import make_judge_input

DEFAULTS_PATH = Path(__file__).resolve().parents[3] / "apps" / "Gmail" / "data" / "defaults.json"
DEFAULTS = json.loads(DEFAULTS_PATH.read_text(encoding="utf-8"))
OS_STATE = {"time": {"timestamp": 1752364800000}}
TASK_CLASSES = TaskRegistry()._load_suite_tasks("gmail")


def state() -> dict:
    value = copy.deepcopy(DEFAULTS)
    value["_temp"] = {
        "lastSearchQuery": None,
        "lastOpenedThreadId": None,
        "lastOpenedMessageId": None,
        "searchHistory": [],
        "openedThreadIds": [],
    }
    return value


def judge_input(initial: dict, current: dict, answer_sheet: dict | None = None):
    init_apps = {"gmail": initial, "answer_sheet": {"answers": {}, "submitted": False}}
    curr_apps = {"gmail": current, "answer_sheet": answer_sheet or {"answers": {}, "submitted": False}}
    return make_judge_input(
        {"apps": init_apps, "os": OS_STATE},
        {"apps": curr_apps, "os": OS_STATE},
        route={"app": "gmail", "path": "/"},
    )


def evaluate(task_cls, mutate):
    initial = state()
    current = copy.deepcopy(initial)
    sheet = {"answers": {}, "submitted": False}
    mutate(current, sheet)
    return task_cls().evaluate(judge_input(initial, current, sheet))


def field_change(thread_id: str, key: str, value):
    def mutate(current, _sheet):
        current["threads"][thread_id][key] = value
    return mutate


class TestDefinitions:
    def test_registry_discovers_exactly_fifteen(self):
        assert len(TASK_CLASSES) == 15

    @pytest.mark.parametrize("name,cls", sorted(TASK_CLASSES.items()))
    def test_task_contract(self, name, cls):
        task = cls()
        assert task.name == name
        assert task.apps == ["gmail"]
        assert task.templates and "{" not in task.description
        assert task.scope in {"S1", "S2", "S3"}
        assert task.objective in {"operate", "query", "hybrid"}
        assert task.composition in {"atomic", "sequential", "transfer", "deep_dive"}
        assert task.difficulty in {"L1", "L2", "L3", "L4"}


@pytest.mark.parametrize(
    "task_cls,thread_id,key,goal,wrong",
    [
        (tasks.UnstarTravelReceipt, "thread_travel_receipt", "isStarred", False, True),
        (tasks.MarkQuarterlyReportUnread, "thread_quarterly_report", "isRead", False, True),
        (tasks.ArchiveProjectAtlas, "thread_project_atlas", "folder", "archive", "trash"),
        (tasks.TrashTravelReceipt, "thread_travel_receipt", "folder", "trash", "archive"),
        (tasks.RestoreTrashEmailToInbox, "thread_trash_restore", "folder", "inbox", "trash"),
        (tasks.ReportSecurityAlertSpam, "thread_security_alert", "folder", "spam", "trash"),
    ],
)
def test_thread_modification_positive_and_negative(task_cls, thread_id, key, goal, wrong):
    assert evaluate(task_cls, field_change(thread_id, key, goal)).success
    assert not evaluate(task_cls, field_change(thread_id, key, wrong)).success


def test_query_tasks_require_search_open_and_correct_answer():
    cases = [
        (tasks.SearchSenderOpenLatestAnswerSubject, "Maya Chen", "thread_project_atlas", "msg_atlas_1", "Project Atlas launch plan"),
        (tasks.SearchKeywordOpenAnswerAttachment, "quarterly", "thread_quarterly_report", "msg_quarterly_1", "Q2-Financial-Report.pdf"),
    ]
    for cls, query, thread_id, message_id, answer in cases:
        def good(current, sheet):
            current["search"] = {"query": query, "resultThreadIds": [thread_id]}
            current["_temp"].update({"lastOpenedThreadId": thread_id, "lastOpenedMessageId": message_id, "openedThreadIds": [thread_id]})
            current["threads"][thread_id]["isRead"] = True
            sheet.update({"answers": {"0": answer}, "submitted": True})
        assert evaluate(cls, good).success

        def bypass(_current, sheet):
            sheet.update({"answers": {"0": answer}, "submitted": True})
        assert not evaluate(cls, bypass).success

        def wrong_answer(current, sheet):
            good(current, sheet)
            sheet["answers"]["0"] = "wrong"
        assert not evaluate(cls, wrong_answer).success


def test_search_and_star_requires_both_changes():
    def good(current, _sheet):
        current["search"] = {"query": "Project Atlas", "resultThreadIds": ["thread_project_atlas"]}
        current["threads"]["thread_project_atlas"]["isStarred"] = True
    assert evaluate(tasks.SearchAndStarEmail, good).success
    assert not evaluate(tasks.SearchAndStarEmail, field_change("thread_project_atlas", "isStarred", True)).success


def test_existing_and_new_label_judges():
    def apply_existing(current, _sheet):
        current["threads"]["thread_labeled_recipes"]["labelIds"].append("label_work")
    assert evaluate(tasks.ApplyExistingWorkLabel, apply_existing).success
    assert not evaluate(tasks.ApplyExistingWorkLabel, lambda *_: None).success

    def create_and_apply(current, _sheet):
        current["labels"]["label_new"] = {"id": "label_new", "name": "Recipes", "color": "#a142f4"}
        current["threads"]["thread_labeled_recipes"]["labelIds"].append("label_new")
    assert evaluate(tasks.CreateRecipesLabelAndApply, create_and_apply).success
    assert not evaluate(tasks.CreateRecipesLabelAndApply, lambda current, _sheet: current["labels"].update({"label_new": {"id": "label_new", "name": "Recipes", "color": "#a142f4"}})).success


def sent_message(mid: str, thread_id: str, to, cc, bcc, subject, body):
    return {"id": mid, "threadId": thread_id, "from": "alex.morgan@gmail.com", "to": to, "cc": cc, "bcc": bcc, "subject": subject, "body": body, "attachments": [], "sentAt": 1752364800000}


def test_draft_and_send_positive_and_negative():
    def draft(current, _sheet):
        current["drafts"]["draft_new"] = {"id": "draft_new", "to": ["maya.chen@example.com", "jamie@example.com"], "cc": ["finance@example.com"], "bcc": ["archive@example.com"], "subject": "Atlas dinner follow-up", "body": "Please review the launch notes and dinner plan.", "attachments": [], "replyToThreadId": None, "forwardOfMessageId": None, "updatedAt": 1}
    assert evaluate(tasks.SaveExactMultiRecipientDraft, draft).success
    assert not evaluate(tasks.SaveExactMultiRecipientDraft, lambda *_: None).success

    def send(current, _sheet):
        message = sent_message("sent_new", "thread_sent", ["nora@example.com"], ["jamie@example.com"], [], "Volunteer dinner update", "The volunteer dinner starts at 6 PM on Saturday.")
        current["sent"][message["id"]] = message
        current["messages"][message["id"]] = copy.deepcopy(message)
        current["threads"]["thread_sent"] = {"id": "thread_sent", "messageIds": [message["id"]], "folder": "archive", "isRead": True, "isStarred": False, "isImportant": False, "labelIds": [], "updatedAt": 1}
    assert evaluate(tasks.SendExactEmail, send).success
    assert not evaluate(tasks.SendExactEmail, draft).success


def test_reply_and_forward_require_correct_thread_or_quoted_source():
    def reply(current, _sheet):
        message = sent_message("reply_new", "thread_project_atlas", ["maya.chen@example.com"], [], [], "Re: Project Atlas launch plan", "I reviewed the checklist and will be ready for April 18.")
        current["sent"][message["id"]] = message
        current["messages"][message["id"]] = copy.deepcopy(message)
        current["threads"]["thread_project_atlas"]["messageIds"].append(message["id"])
        current["threads"]["thread_project_atlas"]["folder"] = "archive"
        current["threads"]["thread_project_atlas"]["isRead"] = True
        current["threads"]["thread_project_atlas"]["updatedAt"] = message["sentAt"]
    assert evaluate(tasks.ReplyToProjectAtlas, reply).success
    assert not evaluate(tasks.ReplyToProjectAtlas, lambda current, sheet: field_change("thread_project_atlas", "isRead", True)(current, sheet)).success

    source = DEFAULTS["messages"]["msg_quarterly_1"]
    def forward(current, _sheet):
        body = f"Please review this report before our meeting.\n\nFrom: {source['from']}\nSubject: {source['subject']}\n\n{source['body']}"
        message = sent_message("forward_new", "thread_forward", ["maya.chen@example.com"], [], [], f"Fwd: {source['subject']}", body)
        current["sent"][message["id"]] = message
        current["messages"][message["id"]] = copy.deepcopy(message)
        current["threads"]["thread_forward"] = {"id": "thread_forward", "messageIds": [message["id"]], "folder": "archive", "isRead": True, "isStarred": False, "isImportant": False, "labelIds": [], "updatedAt": 1}
    assert evaluate(tasks.ForwardQuarterlyReport, forward).success
    assert not evaluate(tasks.ForwardQuarterlyReport, lambda *_: None).success
