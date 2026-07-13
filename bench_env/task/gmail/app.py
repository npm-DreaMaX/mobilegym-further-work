"""Gmail state accessor and deterministic task judge helpers."""

from __future__ import annotations

import copy
import re
from typing import Any

from bench_env.task.base import BaseApp

GMAIL_SEARCH_CHANGES = ["search.query", "search.resultThreadIds"]
GMAIL_DRAFT_CHANGES = ["drafts[+1]"]
GMAIL_SEND_CHANGES = ["sent[+1]", "messages[+1]", "threads[+1]"]
GMAIL_REPLY_CHANGES = [
    "sent[+1]",
    "messages[+1]",
    "threads.thread_project_atlas.messageIds[+1]",
    "threads.thread_project_atlas.folder",
    "threads.thread_project_atlas.isRead",
    "threads.thread_project_atlas.updatedAt",
]


def _norm_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value)).strip().casefold()


def _norm_addresses(values: list[Any]) -> list[str]:
    return sorted(_norm_text(value) for value in values)


class Gmail(BaseApp):
    """Typed access to Gmail's record-based state contract."""

    @property
    def user(self) -> dict[str, Any]:
        return self.raw["user"]

    @property
    def threads(self) -> dict[str, dict[str, Any]]:
        return self.raw["threads"]

    @property
    def messages(self) -> dict[str, dict[str, Any]]:
        return self.raw["messages"]

    @property
    def drafts(self) -> dict[str, dict[str, Any]]:
        return self.raw["drafts"]

    @property
    def sent(self) -> dict[str, dict[str, Any]]:
        return self.raw["sent"]

    @property
    def labels(self) -> dict[str, dict[str, Any]]:
        return self.raw["labels"]

    @property
    def search(self) -> dict[str, Any]:
        return self.raw["search"]

    @property
    def temp(self) -> dict[str, Any]:
        return self.raw["_temp"]

    def thread_by_id(self, thread_id: str) -> dict[str, Any]:
        try:
            return self.threads[thread_id]
        except KeyError as exc:
            raise ValueError(f"Gmail thread '{thread_id}' not found") from exc

    def message_by_id(self, message_id: str) -> dict[str, Any]:
        try:
            return self.messages[message_id]
        except KeyError as exc:
            raise ValueError(f"Gmail message '{message_id}' not found") from exc

    def label_by_id(self, label_id: str) -> dict[str, Any]:
        try:
            return self.labels[label_id]
        except KeyError as exc:
            raise ValueError(f"Gmail label '{label_id}' not found") from exc

    def latest_message_for_thread(self, thread_id: str) -> dict[str, Any]:
        thread = self.thread_by_id(thread_id)
        return self.message_by_id(thread["messageIds"][-1])

    def attachment_name_answer(self, message_id: str) -> str:
        return str(self.message_by_id(message_id)["attachments"][0]["name"])

    def subject_answer(self, message_id: str) -> str:
        return str(self.message_by_id(message_id)["subject"])

    def check_search_open_answer(
        self,
        input: Any,
        *,
        query: str,
        thread_id: str,
        message_id: str,
        expected_answer: str,
        field: str,
    ) -> dict[str, Any]:
        sheet = input.apps["answer_sheet"]
        actual_answer = str(sheet["answers"].get("0", "")).strip()
        searched = (
            _norm_text(self.search["query"]) == _norm_text(query)
            and thread_id in self.search["resultThreadIds"]
        )
        opened = (
            thread_id in self.temp["openedThreadIds"]
            and self.temp["lastOpenedThreadId"] == thread_id
            and self.temp["lastOpenedMessageId"] == message_id
        )
        passed = (
            searched
            and opened
            and sheet["submitted"] is True
            and _norm_text(actual_answer) == _norm_text(expected_answer)
        )
        return {
            "field": field,
            "expected": {
                "search": query,
                "openedThreadId": thread_id,
                "answer": expected_answer,
                "submitted": True,
            },
            "actual": {
                "search": self.search,
                "lastOpenedThreadId": self.temp["lastOpenedThreadId"],
                "lastOpenedMessageId": self.temp["lastOpenedMessageId"],
                "answer": actual_answer,
                "submitted": sheet["submitted"],
            },
            "passed": passed,
        }

    def check_thread_field_changed(
        self, thread_id: str, field_name: str, expected: Any, *, field: str
    ) -> dict[str, Any]:
        initial = self.init.thread_by_id(thread_id)[field_name]
        actual_thread = self.threads.get(thread_id)
        actual = actual_thread[field_name] if actual_thread is not None else None
        return {
            "field": field,
            "expected": {"from": initial, "to": expected},
            "actual": actual,
            "passed": initial != expected and actual == expected,
        }

    def check_search_and_starred(
        self, *, query: str, thread_id: str, field: str = "searched_thread_starred"
    ) -> dict[str, Any]:
        searched = (
            _norm_text(self.search["query"]) == _norm_text(query)
            and thread_id in self.search["resultThreadIds"]
        )
        initial = self.init.thread_by_id(thread_id)["isStarred"]
        actual = self.threads.get(thread_id)
        starred = actual is not None and actual["isStarred"] is True
        return {
            "field": field,
            "expected": {"search": query, "threadId": thread_id, "isStarred": True},
            "actual": {"search": self.search, "isStarred": actual["isStarred"] if actual else None},
            "passed": initial is False and searched and starred,
        }

    def check_existing_label_applied(
        self, thread_id: str, label_id: str, *, field: str = "existing_label_applied"
    ) -> dict[str, Any]:
        self.init.label_by_id(label_id)
        initial_ids = self.init.thread_by_id(thread_id)["labelIds"]
        current = self.threads.get(thread_id)
        current_ids = current["labelIds"] if current is not None else []
        expected_ids = [*initial_ids, label_id]
        return {
            "field": field,
            "expected": {"threadId": thread_id, "labelIds": expected_ids},
            "actual": current_ids,
            "passed": label_id not in initial_ids and current_ids == expected_ids,
        }

    def new_labels(self) -> list[dict[str, Any]]:
        initial_ids = set(self.init.labels)
        return [label for label_id, label in self.labels.items() if label_id not in initial_ids]

    def _existing_records_unchanged(
        self,
        current: dict[str, dict[str, Any]],
        initial: dict[str, dict[str, Any]],
        *,
        exclude_ids: set[str] | None = None,
    ) -> bool:
        excluded = exclude_ids or set()
        return all(
            record_id in current and current[record_id] == record
            for record_id, record in initial.items()
            if record_id not in excluded
        )

    def check_new_label_applied(
        self, thread_id: str, label_name: str, *, field: str = "new_label_applied"
    ) -> dict[str, Any]:
        matching = [label for label in self.new_labels() if _norm_text(label["name"]) == _norm_text(label_name)]
        current = self.threads.get(thread_id)
        label_ids = current["labelIds"] if current is not None else []
        applied = [label for label in matching if label["id"] in label_ids]
        new_ids = {label["id"] for label in self.new_labels()}
        labels_preserved = self._existing_records_unchanged(self.labels, self.init.labels)
        threads_preserved = self._existing_records_unchanged(
            self.threads, self.init.threads, exclude_ids={thread_id}
        )
        target_initial = self.init.thread_by_id(thread_id)
        target_expected = {
            **target_initial,
            "labelIds": [*target_initial["labelIds"], *[label["id"] for label in applied]],
        }
        target_exact = current == target_expected
        return {
            "field": field,
            "expected": {"newLabelName": label_name, "appliedTo": thread_id},
            "actual": {"newLabels": matching, "threadLabelIds": label_ids},
            "passed": (
                len(new_ids) == 1
                and len(matching) == 1
                and len(applied) == 1
                and labels_preserved
                and threads_preserved
                and target_exact
            ),
        }

    def new_drafts(self) -> list[dict[str, Any]]:
        initial_ids = set(self.init.drafts)
        return [draft for draft_id, draft in self.drafts.items() if draft_id not in initial_ids]

    def new_sent(self) -> list[dict[str, Any]]:
        initial_ids = set(self.init.sent)
        return [message for message_id, message in self.sent.items() if message_id not in initial_ids]

    @staticmethod
    def _message_matches(
        message: dict[str, Any], *, to: list[str], cc: list[str], bcc: list[str], subject: str, body: str
    ) -> bool:
        return (
            _norm_addresses(message["to"]) == _norm_addresses(to)
            and _norm_addresses(message["cc"]) == _norm_addresses(cc)
            and _norm_addresses(message["bcc"]) == _norm_addresses(bcc)
            and str(message["subject"]) == subject
            and str(message["body"]) == body
        )

    def check_new_draft(
        self, *, to: list[str], cc: list[str], bcc: list[str], subject: str, body: str
    ) -> dict[str, Any]:
        matching = [
            draft for draft in self.new_drafts()
            if self._message_matches(draft, to=to, cc=cc, bcc=bcc, subject=subject, body=body)
            and draft["replyToThreadId"] is None
            and draft["forwardOfMessageId"] is None
        ]
        all_new = self.new_drafts()
        existing_preserved = self._existing_records_unchanged(self.drafts, self.init.drafts)
        return {
            "field": "draft.created_not_sent",
            "expected": {"to": to, "cc": cc, "bcc": bcc, "subject": subject, "body": body},
            "actual": {"matchingDrafts": matching, "newSentCount": len(self.new_sent())},
            "passed": (
                len(all_new) == 1
                and len(matching) == 1
                and len(self.new_sent()) == 0
                and existing_preserved
            ),
        }

    def check_new_sent_message(
        self, *, to: list[str], cc: list[str], bcc: list[str], subject: str, body: str,
        field: str = "message.sent",
    ) -> dict[str, Any]:
        matching = [message for message in self.new_sent() if self._message_matches(
            message, to=to, cc=cc, bcc=bcc, subject=subject, body=body
        )]
        mirrored = [message for message in matching if self.messages.get(message["id"]) == message]
        new_sent = self.new_sent()
        new_message_ids = set(self.messages) - set(self.init.messages)
        new_thread_ids = set(self.threads) - set(self.init.threads)
        message = matching[0] if len(matching) == 1 else None
        thread = self.threads.get(message["threadId"]) if message else None
        thread_exact = bool(
            message
            and thread
            and set(new_thread_ids) == {message["threadId"]}
            and thread["messageIds"] == [message["id"]]
            and thread["folder"] == "archive"
            and thread["isRead"] is True
            and thread["isStarred"] is False
            and thread["isImportant"] is False
            and thread["labelIds"] == []
        )
        preserved = (
            self._existing_records_unchanged(self.sent, self.init.sent)
            and self._existing_records_unchanged(self.messages, self.init.messages)
            and self._existing_records_unchanged(self.threads, self.init.threads)
        )
        return {
            "field": field,
            "expected": {"to": to, "cc": cc, "bcc": bcc, "subject": subject, "body": body},
            "actual": matching,
            "passed": (
                len(new_sent) == 1
                and len(matching) == 1
                and len(mirrored) == 1
                and new_message_ids == {message["id"]}
                and thread_exact
                and preserved
            ),
        }

    def check_new_reply(
        self, *, thread_id: str, to: str, subject: str, body: str
    ) -> dict[str, Any]:
        initial_thread = self.init.thread_by_id(thread_id)
        current = self.threads.get(thread_id)
        initial_message_ids = set(initial_thread["messageIds"])
        appended_ids = [mid for mid in current["messageIds"] if mid not in initial_message_ids] if current else []
        matching = [
            self.sent[mid] for mid in appended_ids
            if mid in self.sent
            and mid in self.messages
            and self.sent[mid] == self.messages[mid]
            and self.sent[mid]["threadId"] == thread_id
            and _norm_addresses(self.sent[mid]["to"]) == _norm_addresses([to])
            and self.sent[mid]["cc"] == []
            and self.sent[mid]["bcc"] == []
            and self.sent[mid]["subject"] == subject
            and self.sent[mid]["body"] == body
        ]
        new_sent_ids = set(self.sent) - set(self.init.sent)
        new_message_ids = set(self.messages) - set(self.init.messages)
        other_threads_preserved = self._existing_records_unchanged(
            self.threads, self.init.threads, exclude_ids={thread_id}
        )
        target_expected = {
            **initial_thread,
            "messageIds": [*initial_thread["messageIds"], *appended_ids],
            "folder": "archive",
            "isRead": True,
            "updatedAt": current["updatedAt"] if current else initial_thread["updatedAt"],
        }
        target_exact = current == target_expected
        return {
            "field": "thread.reply_appended",
            "expected": {"threadId": thread_id, "to": to, "subject": subject, "body": body},
            "actual": {"appendedIds": appended_ids, "matching": matching},
            "passed": (
                len(appended_ids) == 1
                and len(matching) == 1
                and new_sent_ids == set(appended_ids)
                and new_message_ids == set(appended_ids)
                and other_threads_preserved
                and target_exact
            ),
        }

    def check_new_forward(
        self, *, source_message_id: str, recipient: str, note: str
    ) -> dict[str, Any]:
        source = self.init.message_by_id(source_message_id)
        expected_subject = f"Fwd: {source['subject']}"
        matching = []
        for message in self.new_sent():
            body = str(message["body"])
            quoted = all(
                _norm_text(part) in _norm_text(body)
                for part in (source["from"], source["subject"], source["body"])
            )
            if (
                _norm_addresses(message["to"]) == _norm_addresses([recipient])
                and message["cc"] == []
                and message["bcc"] == []
                and message["subject"] == expected_subject
                and _norm_text(note) in _norm_text(body)
                and quoted
                and self.messages.get(message["id"]) == message
                and message["threadId"] not in self.init.threads
            ):
                matching.append(message)
        new_sent_ids = set(self.sent) - set(self.init.sent)
        new_message_ids = set(self.messages) - set(self.init.messages)
        new_thread_ids = set(self.threads) - set(self.init.threads)
        message = matching[0] if len(matching) == 1 else None
        thread = self.threads.get(message["threadId"]) if message else None
        thread_exact = bool(
            message
            and thread
            and new_thread_ids == {message["threadId"]}
            and thread["messageIds"] == [message["id"]]
            and thread["folder"] == "archive"
            and thread["isRead"] is True
            and thread["isStarred"] is False
            and thread["isImportant"] is False
            and thread["labelIds"] == []
        )
        preserved = (
            self._existing_records_unchanged(self.sent, self.init.sent)
            and self._existing_records_unchanged(self.messages, self.init.messages)
            and self._existing_records_unchanged(self.threads, self.init.threads)
        )
        return {
            "field": "message.forwarded",
            "expected": {
                "sourceMessageId": source_message_id,
                "recipient": recipient,
                "subject": expected_subject,
                "note": note,
                "quotedSource": True,
            },
            "actual": matching,
            "passed": (
                len(matching) == 1
                and new_sent_ids == {message["id"]}
                and new_message_ids == {message["id"]}
                and thread_exact
                and preserved
            ),
        }

    def prepare_thread_state(
        self,
        thread_id: str,
        *,
        is_read: bool | None = None,
        is_starred: bool | None = None,
        folder: str | None = None,
        remove_label_id: str | None = None,
    ) -> dict[str, Any]:
        state = copy.deepcopy(self.raw)
        thread = state["threads"][thread_id]
        if is_read is not None:
            thread["isRead"] = is_read
        if is_starred is not None:
            thread["isStarred"] = is_starred
        if folder is not None:
            thread["folder"] = folder
        if remove_label_id is not None:
            thread["labelIds"] = [value for value in thread["labelIds"] if value != remove_label_id]
        return state

    def prepare_without_label_name(self, label_name: str) -> dict[str, Any]:
        state = copy.deepcopy(self.raw)
        remove_ids = {
            label_id for label_id, label in state["labels"].items()
            if _norm_text(label["name"]) == _norm_text(label_name)
        }
        for label_id in remove_ids:
            del state["labels"][label_id]
        for thread in state["threads"].values():
            thread["labelIds"] = [label_id for label_id in thread["labelIds"] if label_id not in remove_ids]
        return state
