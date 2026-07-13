"""Fifteen deterministic Gmail benchmark tasks."""

from __future__ import annotations

from typing import Any

from bench_env.task.base import BaseTask
from bench_env.task.judge import JudgeInput
from bench_env.task.gmail.app import (
    Gmail,
    GMAIL_DRAFT_CHANGES,
    GMAIL_REPLY_CHANGES,
    GMAIL_SEARCH_CHANGES,
    GMAIL_SEND_CHANGES,
)

ATLAS_THREAD = "thread_project_atlas"
ATLAS_MESSAGE = "msg_atlas_1"
QUARTERLY_THREAD = "thread_quarterly_report"
QUARTERLY_MESSAGE = "msg_quarterly_1"
TRAVEL_THREAD = "thread_travel_receipt"
SECURITY_THREAD = "thread_security_alert"
TRASH_THREAD = "thread_trash_restore"
RECIPES_THREAD = "thread_labeled_recipes"


class SearchSenderOpenLatestAnswerSubject(BaseTask):
    templates = ["Search Gmail for messages from Maya Chen, open the latest result, and report its subject."]
    apps = ["gmail"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["search", "extract"]
    expected_changes = GMAIL_SEARCH_CHANGES + [f"threads.{ATLAS_THREAD}.isRead"]
    answer_fields = [{"type": "text", "label": "Email subject", "matcher": "exact"}]

    async def _post_sample(self, env: Any) -> None:
        state = await env.get_state(required_apps=self.apps)
        prepared = Gmail(state["apps"]["gmail"]).prepare_thread_state(ATLAS_THREAD, is_read=False)
        await env.set_state({"apps": {"gmail": prepared}}, deep=True, reload=False)

    def get_expected_response(self, input: JudgeInput) -> list[str]:
        return [Gmail(input.apps_init["gmail"]).subject_answer(ATLAS_MESSAGE)]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        current = Gmail(input.apps["gmail"])
        expected = Gmail(input.apps_init["gmail"]).subject_answer(ATLAS_MESSAGE)
        return [current.check_search_open_answer(input, query="Maya Chen", thread_id=ATLAS_THREAD, message_id=ATLAS_MESSAGE, expected_answer=expected, field="search_open_subject")]


class SearchKeywordOpenAnswerAttachment(BaseTask):
    templates = ["Search Gmail for quarterly, open the matching email, and report the attachment filename."]
    apps = ["gmail"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["search", "extract"]
    expected_changes = GMAIL_SEARCH_CHANGES + [f"threads.{QUARTERLY_THREAD}.isRead"]
    answer_fields = [{"type": "text", "label": "Attachment filename", "matcher": "exact"}]

    async def _post_sample(self, env: Any) -> None:
        state = await env.get_state(required_apps=self.apps)
        prepared = Gmail(state["apps"]["gmail"]).prepare_thread_state(QUARTERLY_THREAD, is_read=False)
        await env.set_state({"apps": {"gmail": prepared}}, deep=True, reload=False)

    def get_expected_response(self, input: JudgeInput) -> list[str]:
        return [Gmail(input.apps_init["gmail"]).attachment_name_answer(QUARTERLY_MESSAGE)]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        current = Gmail(input.apps["gmail"])
        expected = Gmail(input.apps_init["gmail"]).attachment_name_answer(QUARTERLY_MESSAGE)
        return [current.check_search_open_answer(input, query="quarterly", thread_id=QUARTERLY_THREAD, message_id=QUARTERLY_MESSAGE, expected_answer=expected, field="search_open_attachment")]


class SearchAndStarEmail(BaseTask):
    templates = ["Search Gmail for Project Atlas and star the matching email."]
    apps = ["gmail"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["search", "edit"]
    expected_changes = GMAIL_SEARCH_CHANGES + [
        f"threads.{ATLAS_THREAD}.isStarred",
        f"threads.{ATLAS_THREAD}.isRead",
    ]

    async def _post_sample(self, env: Any) -> None:
        state = await env.get_state(required_apps=self.apps)
        prepared = Gmail(state["apps"]["gmail"]).prepare_thread_state(ATLAS_THREAD, is_starred=False)
        await env.set_state({"apps": {"gmail": prepared}}, deep=True, reload=False)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        gmail = Gmail(input.apps["gmail"], init=input.apps_init["gmail"])
        return [gmail.check_search_and_starred(query="Project Atlas", thread_id=ATLAS_THREAD)]


class UnstarTravelReceipt(BaseTask):
    templates = ["Remove the star from the Travel Desk email with subject 'Your flight receipt'."]
    apps = ["gmail"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L1"
    capabilities = ["edit"]
    expected_changes = [f"threads.{TRAVEL_THREAD}.isStarred"]

    async def _post_sample(self, env: Any) -> None:
        state = await env.get_state(required_apps=self.apps)
        prepared = Gmail(state["apps"]["gmail"]).prepare_thread_state(TRAVEL_THREAD, is_starred=True)
        await env.set_state({"apps": {"gmail": prepared}}, deep=True, reload=False)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        gmail = Gmail(input.apps["gmail"], init=input.apps_init["gmail"])
        return [gmail.check_thread_field_changed(TRAVEL_THREAD, "isStarred", False, field="thread.unstarred")]


class MarkQuarterlyReportUnread(BaseTask):
    templates = ["Mark the Finance Team email titled 'Quarterly finance report' as unread."]
    apps = ["gmail"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L1"
    capabilities = ["edit"]
    expected_changes = [f"threads.{QUARTERLY_THREAD}.isRead"]

    async def _post_sample(self, env: Any) -> None:
        state = await env.get_state(required_apps=self.apps)
        prepared = Gmail(state["apps"]["gmail"]).prepare_thread_state(QUARTERLY_THREAD, is_read=True)
        await env.set_state({"apps": {"gmail": prepared}}, deep=True, reload=False)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        gmail = Gmail(input.apps["gmail"], init=input.apps_init["gmail"])
        return [gmail.check_thread_field_changed(QUARTERLY_THREAD, "isRead", False, field="thread.marked_unread")]


class ArchiveProjectAtlas(BaseTask):
    templates = ["Archive Maya Chen's email titled 'Project Atlas launch plan'."]
    apps = ["gmail"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L1"
    capabilities = ["edit"]
    expected_changes = [f"threads.{ATLAS_THREAD}.folder", f"threads.{ATLAS_THREAD}.isRead"]

    async def _post_sample(self, env: Any) -> None:
        state = await env.get_state(required_apps=self.apps)
        prepared = Gmail(state["apps"]["gmail"]).prepare_thread_state(ATLAS_THREAD, folder="inbox")
        await env.set_state({"apps": {"gmail": prepared}}, deep=True, reload=False)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        gmail = Gmail(input.apps["gmail"], init=input.apps_init["gmail"])
        return [gmail.check_thread_field_changed(ATLAS_THREAD, "folder", "archive", field="thread.archived")]


class TrashTravelReceipt(BaseTask):
    templates = ["Move the Travel Desk email titled 'Your flight receipt' to Trash."]
    apps = ["gmail"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L1"
    capabilities = ["edit"]
    expected_changes = [f"threads.{TRAVEL_THREAD}.folder", f"threads.{TRAVEL_THREAD}.isRead"]

    async def _post_sample(self, env: Any) -> None:
        state = await env.get_state(required_apps=self.apps)
        prepared = Gmail(state["apps"]["gmail"]).prepare_thread_state(TRAVEL_THREAD, folder="inbox")
        await env.set_state({"apps": {"gmail": prepared}}, deep=True, reload=False)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        gmail = Gmail(input.apps["gmail"], init=input.apps_init["gmail"])
        return [gmail.check_thread_field_changed(TRAVEL_THREAD, "folder", "trash", field="thread.trashed")]


class RestoreTrashEmailToInbox(BaseTask):
    templates = ["Restore Nora Bell's 'Neighborhood volunteer schedule' email from Trash to Inbox."]
    apps = ["gmail"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["edit"]
    expected_changes = [f"threads.{TRASH_THREAD}.folder"]

    async def _post_sample(self, env: Any) -> None:
        state = await env.get_state(required_apps=self.apps)
        prepared = Gmail(state["apps"]["gmail"]).prepare_thread_state(TRASH_THREAD, folder="trash")
        await env.set_state({"apps": {"gmail": prepared}}, deep=True, reload=False)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        gmail = Gmail(input.apps["gmail"], init=input.apps_init["gmail"])
        return [gmail.check_thread_field_changed(TRASH_THREAD, "folder", "inbox", field="thread.restored_to_inbox")]


class ApplyExistingWorkLabel(BaseTask):
    templates = ["Apply the existing Work label to Jamie Cook's 'Dinner recipes' email."]
    apps = ["gmail"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["edit"]
    expected_changes = [f"threads.{RECIPES_THREAD}.labelIds"]

    async def _post_sample(self, env: Any) -> None:
        state = await env.get_state(required_apps=self.apps)
        prepared = Gmail(state["apps"]["gmail"]).prepare_thread_state(RECIPES_THREAD, remove_label_id="label_work")
        await env.set_state({"apps": {"gmail": prepared}}, deep=True, reload=False)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        gmail = Gmail(input.apps["gmail"], init=input.apps_init["gmail"])
        return [gmail.check_existing_label_applied(RECIPES_THREAD, "label_work")]


class CreateRecipesLabelAndApply(BaseTask):
    templates = ["Create a new label named Recipes and apply it to Jamie Cook's 'Dinner recipes' email."]
    apps = ["gmail"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["create", "edit"]
    expected_changes = ["labels[+1]", f"threads.{RECIPES_THREAD}.labelIds"]

    async def _post_sample(self, env: Any) -> None:
        state = await env.get_state(required_apps=self.apps)
        prepared = Gmail(state["apps"]["gmail"]).prepare_without_label_name("Recipes")
        await env.set_state({"apps": {"gmail": prepared}}, deep=True, reload=False)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        gmail = Gmail(input.apps["gmail"], init=input.apps_init["gmail"])
        return [gmail.check_new_label_applied(RECIPES_THREAD, "Recipes")]


class SaveExactMultiRecipientDraft(BaseTask):
    templates = ["Compose an email to maya.chen@example.com and jamie@example.com, CC finance@example.com, BCC archive@example.com, subject 'Atlas dinner follow-up', body 'Please review the launch notes and dinner plan.', and save it as a draft without sending."]
    apps = ["gmail"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["create", "form"]
    expected_changes = GMAIL_DRAFT_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        gmail = Gmail(input.apps["gmail"], init=input.apps_init["gmail"])
        return [gmail.check_new_draft(to=["maya.chen@example.com", "jamie@example.com"], cc=["finance@example.com"], bcc=["archive@example.com"], subject="Atlas dinner follow-up", body="Please review the launch notes and dinner plan.")]


class SendExactEmail(BaseTask):
    templates = ["Send an email to nora@example.com, CC jamie@example.com, with subject 'Volunteer dinner update' and body 'The volunteer dinner starts at 6 PM on Saturday.'"]
    apps = ["gmail"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["create", "form"]
    expected_changes = GMAIL_SEND_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        gmail = Gmail(input.apps["gmail"], init=input.apps_init["gmail"])
        return [gmail.check_new_sent_message(to=["nora@example.com"], cc=["jamie@example.com"], bcc=[], subject="Volunteer dinner update", body="The volunteer dinner starts at 6 PM on Saturday.")]


class ReplyToProjectAtlas(BaseTask):
    templates = ["Reply to Maya Chen's 'Project Atlas launch plan' thread with exactly: I reviewed the checklist and will be ready for April 18."]
    apps = ["gmail"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["create", "edit"]
    expected_changes = GMAIL_REPLY_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        gmail = Gmail(input.apps["gmail"], init=input.apps_init["gmail"])
        return [gmail.check_new_reply(thread_id=ATLAS_THREAD, to="maya.chen@example.com", subject="Re: Project Atlas launch plan", body="I reviewed the checklist and will be ready for April 18.")]


class ForwardQuarterlyReport(BaseTask):
    templates = ["Forward the Finance Team email 'Quarterly finance report' to maya.chen@example.com and add this note: Please review this report before our meeting."]
    apps = ["gmail"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["create", "extract"]
    expected_changes = GMAIL_SEND_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        gmail = Gmail(input.apps["gmail"], init=input.apps_init["gmail"])
        return [gmail.check_new_forward(source_message_id=QUARTERLY_MESSAGE, recipient="maya.chen@example.com", note="Please review this report before our meeting.")]


class ReportSecurityAlertSpam(BaseTask):
    templates = ["Report the email 'Claim your bonus now' from promo@suspicious.example as Spam."]
    apps = ["gmail"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["edit"]
    expected_changes = [f"threads.{SECURITY_THREAD}.folder", f"threads.{SECURITY_THREAD}.isRead"]

    async def _post_sample(self, env: Any) -> None:
        state = await env.get_state(required_apps=self.apps)
        prepared = Gmail(state["apps"]["gmail"]).prepare_thread_state(SECURITY_THREAD, folder="inbox")
        await env.set_state({"apps": {"gmail": prepared}}, deep=True, reload=False)

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        gmail = Gmail(input.apps["gmail"], init=input.apps_init["gmail"])
        return [gmail.check_thread_field_changed(SECURITY_THREAD, "folder", "spam", field="thread.reported_spam")]
