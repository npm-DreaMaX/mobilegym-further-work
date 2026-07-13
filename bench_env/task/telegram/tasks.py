# bench_env/task/telegram/tasks.py
# Telegram benchmark task definitions — 15 tasks

from __future__ import annotations

from typing import Any, ClassVar

from bench_env.task.common_tasks import CriteriaTask, AnswerTask
from bench_env.task.base import BaseTask
from bench_env.task.judge import JudgeInput

from .app import Telegram


# ── Task 1: 全局搜索找到联系人或聊天并打开 ─────────────────────────────

class SearchAndOpenChat(BaseTask):
    """使用全局搜索找到指定联系人或聊天并打开。"""

    templates = [
        "Use the global search to find '{name}' and open their chat.",
        "Search for '{name}' in the search bar and open the conversation.",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L1"
    capabilities = ["nav", "search"]
    expected_changes = ["search"]

    parameters: ClassVar[dict] = {
        "name": {
            "type": "string",
            "description": "Contact or chat name to search for",
            "source": "apps.telegram.contacts[].name",
        }
    }

    def check_goals(self, input: JudgeInput) -> list[dict]:
        tg = Telegram(input.apps["telegram"], init=input.apps_init["telegram"])
        # Check search was performed
        checks = tg.check_search_performed(self.p.name, field="search")
        # Check route is a chat
        path = input.route.get("path", "")
        is_chat_route = path.startswith("/chat/")
        checks.append({
            "field": "route",
            "expected": f"/chat/<id> (chat of {self.p.name})",
            "actual": path,
            "passed": is_chat_route,
        })
        return checks


# ── Task 2: 在指定聊天内搜索关键词，找到消息，回答发送者 ────────────────

class SearchInChatAndReportSender(AnswerTask):
    """在指定聊天内搜索关键词，找到目标消息，报告发送者。"""

    templates = [
        "Search for '{keyword}' in the '{chat_name}' chat and tell me who sent the message.",
        "Find the message containing '{keyword}' in the '{chat_name}' conversation and report the sender's name.",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["search", "query"]
    answer_fields = [{"type": "text", "label": "Sender name"}]
    expected_changes = ["search"]

    parameters: ClassVar[dict] = {
        "keyword": {
            "type": "string",
            "description": "Keyword to search for",
            "values": ["quarterly report", "deployment pipeline", "wireframes", "performance improvements", "accuracy"],
        },
        "chat_name": {
            "type": "string",
            "description": "Chat to search in",
            "values": ["Alice Johnson", "Engineering Team", "Design Review", "Bob Martinez", "Dave Chen", "Boss"],
        },
    }

    def get_answer(self, input: JudgeInput) -> Any:
        tg_init = Telegram(input.apps_init["telegram"])
        chat = tg_init.chat_by_title(self.p.chat_name)
        keyword = self.p.keyword.lower()
        # Find message containing keyword
        for msg in reversed(chat.get("messages", [])):
            if keyword in msg.get("content", "").lower() and msg.get("type") == "text":
                return msg.get("senderName", msg.get("senderId", ""))
        raise ValueError(f"No message found with keyword '{keyword}' in chat '{self.p.chat_name}'")


# ── Task 3: 向指定联系人发送精确文本消息 ───────────────────────────────

class SendMessageToContact(BaseTask):
    """向指定联系人发送精确文本消息。"""

    templates = [
        "Send a message to {contact_name} saying: '{text}'",
        "Message {contact_name} with the text: '{text}'",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["nav", "input", "messaging"]
    expected_changes = ["chats"]

    parameters: ClassVar[dict] = {
        "contact_name": {
            "type": "string",
            "description": "Contact to send message to",
            "source": "apps.telegram.contacts[].name",
        },
        "text": {
            "type": "string",
            "description": "Message text to send",
            "values": ["Hello, how are you?", "Meeting rescheduled to 3 PM", "Thanks for your help!", "Let's discuss tomorrow", "Project update sent"],
        },
    }

    def check_goals(self, input: JudgeInput) -> list[dict]:
        tg = Telegram(input.apps["telegram"], init=input.apps_init["telegram"])
        return tg.check_new_sent_to(self.p.contact_name, self.p.text, field="sent_message")


# ── Task 4: 对指定消息发送回复 ─────────────────────────────────────────

class ReplyToMessage(BaseTask):
    """对指定消息发送一条精确回复。"""

    templates = [
        "Reply to the message '{target_content}' in {chat_name} with: '{reply_text}'",
        "Find the message saying '{target_content}' in {chat_name} and reply: '{reply_text}'",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["nav", "messaging", "reply"]
    expected_changes = ["chats"]

    parameters: ClassVar[dict] = {
        "chat_name": {
            "type": "string",
            "description": "Chat containing the target message",
            "values": ["Alice Johnson", "Bob Martinez", "Engineering Team", "Boss"],
        },
        "target_content": {
            "type": "string",
            "description": "Content of the message to reply to",
            "values": ["quarterly report", "team lunch", "design review", "sprint planning"],
        },
        "reply_text": {
            "type": "string",
            "description": "Reply content",
            "values": ["Got it, will do!", "Sounds good, thanks!", "I agree completely", "Let me check and get back to you"],
        },
    }

    def check_goals(self, input: JudgeInput) -> list[dict]:
        tg = Telegram(input.apps["telegram"], init=input.apps_init["telegram"])
        tg_init = Telegram(input.apps_init["telegram"])
        chat = tg_init.chat_by_title(self.p.chat_name)
        # Find target message
        target_msg = None
        for msg in chat.get("messages", []):
            if self.p.target_content.lower() in msg.get("content", "").lower():
                target_msg = msg
                break
        if target_msg is None:
            raise ValueError(f"Target message not found: '{self.p.target_content}'")

        return tg.check_reply_sent(
            self.p.chat_name,
            target_msg["id"],
            self.p.reply_text,
            field="reply_message",
        )


# ── Task 5: 编辑自己发送的消息 ─────────────────────────────────────────

class EditOwnMessage(BaseTask):
    """找到自己发送的指定消息并编辑为新内容。"""

    templates = [
        "Find the message you sent saying '{old_content}' in {chat_name} and edit it to: '{new_content}'",
        "Edit your message '{old_content}' in {chat_name} to say: '{new_content}'",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["nav", "messaging", "edit"]
    expected_changes = ["chats"]

    parameters: ClassVar[dict] = {
        "chat_name": {
            "type": "string",
            "description": "Chat containing the message to edit",
            "values": ["Alice Johnson", "Bob Martinez", "Engineering Team"],
        },
        "old_content": {
            "type": "string",
            "description": "Original content of the message",
            "values": ["Telegram integration", "Italian place", "performance improvements", "slides"],
        },
        "new_content": {
            "type": "string",
            "description": "New content after editing",
            "values": ["Telegram v2 integration", "Mexican restaurant downtown", "performance and UX improvements", "updated slides"],
        },
    }

    def check_goals(self, input: JudgeInput) -> list[dict]:
        tg = Telegram(input.apps["telegram"], init=input.apps_init["telegram"])
        tg_init = Telegram(input.apps_init["telegram"])
        chat = tg_init.chat_by_title(self.p.chat_name)
        user_id = tg.user_id

        # Find the message to edit (must be sent by user)
        target_msg = None
        for msg in chat.get("messages", []):
            if msg.get("senderId") == user_id and self.p.old_content.lower() in msg.get("content", "").lower():
                target_msg = msg
                break
        if target_msg is None:
            raise ValueError(f"Own message not found: '{self.p.old_content}'")

        return tg.check_message_edited(chat["id"], target_msg["id"], self.p.new_content, field="edited_message")


# ── Task 6: 删除自己发送的消息 ─────────────────────────────────────────

class DeleteOwnMessage(BaseTask):
    """找到自己发送的指定消息并删除。必须经过消息菜单和确认流程。"""

    templates = [
        "Find the message you sent saying '{content}' in {chat_name} and delete it.",
        "Delete your message '{content}' from the {chat_name} chat.",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["nav", "messaging", "delete"]
    expected_changes = ["chats"]

    parameters: ClassVar[dict] = {
        "chat_name": {
            "type": "string",
            "description": "Chat containing the message to delete",
            "values": ["Alice Johnson", "Bob Martinez", "Engineering Team"],
        },
        "content": {
            "type": "string",
            "description": "Content of the message to delete",
            "values": ["Telegram integration", "Italian place", "performance improvements", "slides"],
        },
    }

    def check_goals(self, input: JudgeInput) -> list[dict]:
        tg = Telegram(input.apps["telegram"], init=input.apps_init["telegram"])
        tg_init = Telegram(input.apps_init["telegram"])
        chat = tg_init.chat_by_title(self.p.chat_name)
        user_id = tg.user_id

        target_msg = None
        for msg in chat.get("messages", []):
            if msg.get("senderId") == user_id and self.p.content.lower() in msg.get("content", "").lower():
                target_msg = msg
                break
        if target_msg is None:
            raise ValueError(f"Own message not found: '{self.p.content}'")

        return tg.check_message_deleted(chat["id"], target_msg["id"], field="deleted_message")


# ── Task 7: 将消息转发到另一个聊天 ─────────────────────────────────────

class ForwardMessage(BaseTask):
    """将指定消息转发到另一个指定聊天。"""

    templates = [
        "Forward the message '{content}' from {from_chat} to {to_chat}.",
        "Find the message saying '{content}' in {from_chat} and forward it to {to_chat}.",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["nav", "messaging", "forward"]
    expected_changes = ["chats"]

    parameters: ClassVar[dict] = {
        "from_chat": {
            "type": "string",
            "description": "Source chat",
            "values": ["Alice Johnson", "Bob Martinez", "Engineering Team"],
        },
        "to_chat": {
            "type": "string",
            "description": "Target chat for forwarding",
            "values": ["Carol White", "Dave Chen", "Design Review", "Boss"],
        },
        "content": {
            "type": "string",
            "description": "Content of the message to forward",
            "values": ["quarterly report", "team lunch", "sprint planning", "pipeline"],
        },
    }

    def check_goals(self, input: JudgeInput) -> list[dict]:
        tg = Telegram(input.apps["telegram"], init=input.apps_init["telegram"])
        tg_init = Telegram(input.apps_init["telegram"])

        # Find source message
        from_chat = tg_init.chat_by_title(self.p.from_chat)
        source_msg = None
        for msg in from_chat.get("messages", []):
            if self.p.content.lower() in msg.get("content", "").lower():
                source_msg = msg
                break
        if source_msg is None:
            raise ValueError(f"Source message not found: '{self.p.content}'")

        return tg.check_message_forwarded(
            self.p.from_chat, self.p.to_chat, source_msg["id"], field="forwarded_message"
        )


# ── Task 8: 添加表情回应 ───────────────────────────────────────────────

class AddReaction(BaseTask):
    """给指定消息添加指定 emoji reaction。"""

    templates = [
        "React with '{emoji}' to the message '{content}' in {chat_name}.",
        "Add a '{emoji}' reaction to the message saying '{content}' in {chat_name}.",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["nav", "messaging", "react"]
    expected_changes = ["chats"]

    parameters: ClassVar[dict] = {
        "chat_name": {
            "type": "string",
            "description": "Chat containing the target message",
            "values": ["Alice Johnson", "Bob Martinez", "Engineering Team", "Design Review"],
        },
        "content": {
            "type": "string",
            "description": "Content of the target message",
            "values": ["Sprint planning", "wireframes", "project going", "Italian place"],
        },
        "emoji": {
            "type": "string",
            "description": "Emoji reaction to add",
            "values": ["👍", "❤️", "🔥", "😂", "🙏"],
        },
    }

    def check_goals(self, input: JudgeInput) -> list[dict]:
        tg = Telegram(input.apps["telegram"], init=input.apps_init["telegram"])
        tg_init = Telegram(input.apps_init["telegram"])

        chat = tg_init.chat_by_title(self.p.chat_name)
        target_msg = None
        for msg in chat.get("messages", []):
            if self.p.content.lower() in msg.get("content", "").lower():
                target_msg = msg
                break
        if target_msg is None:
            raise ValueError(f"Target message not found: '{self.p.content}'")

        return tg.check_reaction_added(chat["id"], target_msg["id"], self.p.emoji, field="reaction")


# ── Task 9: 在群聊中置顶消息 ───────────────────────────────────────────

class PinMessageInGroup(BaseTask):
    """在群聊中置顶指定消息。"""

    templates = [
        "Pin the message '{content}' in the {group_name} group chat.",
        "Find the message saying '{content}' in {group_name} and pin it.",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["nav", "messaging", "pin"]
    expected_changes = ["chats"]

    parameters: ClassVar[dict] = {
        "group_name": {
            "type": "string",
            "description": "Group chat name",
            "values": ["Engineering Team", "Design Review"],
        },
        "content": {
            "type": "string",
            "description": "Content of the message to pin",
            "values": ["Sprint planning", "wireframes", "deployment pipeline", "JIRA tickets"],
        },
    }

    def check_goals(self, input: JudgeInput) -> list[dict]:
        tg = Telegram(input.apps["telegram"], init=input.apps_init["telegram"])
        tg_init = Telegram(input.apps_init["telegram"])

        chat = tg_init.chat_by_title(self.p.group_name)
        target_msg = None
        for msg in chat.get("messages", []):
            if self.p.content.lower() in msg.get("content", "").lower():
                target_msg = msg
                break
        if target_msg is None:
            raise ValueError(f"Target message not found: '{self.p.content}'")

        return tg.check_message_pinned(chat["id"], target_msg["id"], field="pinned_message")


# ── Task 10: 在 Chats 列表中置顶指定聊天 ───────────────────────────────

class PinChat(BaseTask):
    """在 Chats 列表中置顶指定聊天。"""

    templates = [
        "Pin the chat with {chat_name} in your chat list.",
        "Make the '{chat_name}' conversation pinned at the top.",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["nav", "chat_management"]
    expected_changes = ["chats"]

    parameters: ClassVar[dict] = {
        "chat_name": {
            "type": "string",
            "description": "Chat to pin",
            "source": "apps.telegram.chats[].title",
        },
    }

    async def _post_sample(self, env):
        """Ensure the chat starts unpinned so the task has work to do."""
        tg_init = Telegram(env.apps_init["telegram"])
        chat = tg_init.chat_by_title(self.p.chat_name)
        # Unpin it in initial state
        await env.set_state(
            {"apps": {"telegram": {"chats": [{"id": chat["id"], "pinned": False}]}}},
            deep=True,
            reload=False,
        )

    def check_goals(self, input: JudgeInput) -> list[dict]:
        tg = Telegram(input.apps["telegram"], init=input.apps_init["telegram"])
        chat = tg.chat_by_title(self.p.chat_name)
        return tg.check_chat_pinned(chat["id"], field="pinned_chat")


# ── Task 11: 将指定聊天静音 ────────────────────────────────────────────

class MuteChat(BaseTask):
    """将指定聊天静音。"""

    templates = [
        "Mute notifications for the '{chat_name}' chat.",
        "Turn off notifications for {chat_name}.",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["nav", "chat_management"]
    expected_changes = ["chats"]

    parameters: ClassVar[dict] = {
        "chat_name": {
            "type": "string",
            "description": "Chat to mute",
            "source": "apps.telegram.chats[].title",
        },
    }

    async def _post_sample(self, env):
        """Ensure the chat starts unmuted."""
        tg_init = Telegram(env.apps_init["telegram"])
        chat = tg_init.chat_by_title(self.p.chat_name)
        await env.set_state(
            {"apps": {"telegram": {"chats": [{"id": chat["id"], "muted": False}]}}},
            deep=True,
            reload=False,
        )

    def check_goals(self, input: JudgeInput) -> list[dict]:
        tg = Telegram(input.apps["telegram"], init=input.apps_init["telegram"])
        chat = tg.chat_by_title(self.p.chat_name)
        return tg.check_chat_muted(chat["id"], field="muted_chat")


# ── Task 12: 将指定聊天归档 ────────────────────────────────────────────

class ArchiveChat(BaseTask):
    """将指定聊天归档。"""

    templates = [
        "Archive the '{chat_name}' chat.",
        "Move the conversation with {chat_name} to archived chats.",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["nav", "chat_management"]
    expected_changes = ["chats", "archivedChats"]

    parameters: ClassVar[dict] = {
        "chat_name": {
            "type": "string",
            "description": "Chat to archive",
            "source": "apps.telegram.chats[].title",
        },
    }

    def check_goals(self, input: JudgeInput) -> list[dict]:
        tg = Telegram(input.apps["telegram"], init=input.apps_init["telegram"])
        tg_init = Telegram(input.apps_init["telegram"])
        chat = tg_init.chat_by_title(self.p.chat_name)
        return tg.check_chat_archived(chat["id"], field="archived_chat")


# ── Task 13: 将指定聊天标记为未读 ──────────────────────────────────────

class MarkChatUnread(BaseTask):
    """将指定聊天标记为未读。"""

    templates = [
        "Mark the '{chat_name}' chat as unread.",
        "Set the {chat_name} conversation as unread.",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L2"
    capabilities = ["nav", "chat_management"]
    expected_changes = ["chats"]

    parameters: ClassVar[dict] = {
        "chat_name": {
            "type": "string",
            "description": "Chat to mark as unread",
            "source": "apps.telegram.chats[].title",
        },
    }

    async def _post_sample(self, env):
        """Ensure the chat starts as read."""
        tg_init = Telegram(env.apps_init["telegram"])
        chat = tg_init.chat_by_title(self.p.chat_name)
        await env.set_state(
            {"apps": {"telegram": {"chats": [{"id": chat["id"], "isMarkedUnread": False, "unreadCount": 0}]}}},
            deep=True,
            reload=False,
        )

    def check_goals(self, input: JudgeInput) -> list[dict]:
        tg = Telegram(input.apps["telegram"], init=input.apps_init["telegram"])
        chat = tg.chat_by_title(self.p.chat_name)
        return tg.check_chat_marked_unread(chat["id"], field="marked_unread")


# ── Task 14: 创建一个新群组 ────────────────────────────────────────────

class CreateGroup(BaseTask):
    """创建一个新群组，选择指定联系人并设置群名。"""

    templates = [
        "Create a new group called '{group_name}' with {contact1} and {contact2}.",
        "Make a new group '{group_name}' and add {contact1} and {contact2} as members.",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["nav", "group_management", "messaging"]
    expected_changes = ["chats"]

    parameters: ClassVar[dict] = {
        "group_name": {
            "type": "string",
            "description": "Name for the new group",
            "values": ["Weekend Plans", "Book Club", "Project Alpha", "Running Buddies"],
        },
        "contact1": {
            "type": "string",
            "description": "First contact to add",
            "source": "apps.telegram.contacts[].name",
        },
        "contact2": {
            "type": "string",
            "description": "Second contact to add",
            "source": "apps.telegram.contacts[].name",
        },
    }

    def check_goals(self, input: JudgeInput) -> list[dict]:
        tg = Telegram(input.apps["telegram"], init=input.apps_init["telegram"])
        return tg.check_group_created(
            self.p.group_name,
            [self.p.contact1, self.p.contact2],
            field="created_group",
        )


# ── Task 15: 找到指定群组并重命名 ──────────────────────────────────────

class RenameGroup(BaseTask):
    """找到指定群组并重命名。"""

    templates = [
        "Rename the '{old_name}' group to '{new_name}'.",
        "Change the name of the {old_name} group to '{new_name}'.",
    ]
    apps = ["telegram"]
    scope = "S1"
    objective = "operate"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["nav", "group_management"]
    expected_changes = ["chats"]

    parameters: ClassVar[dict] = {
        "old_name": {
            "type": "string",
            "description": "Current group name",
            "values": ["Engineering Team", "Design Review"],
        },
        "new_name": {
            "type": "string",
            "description": "New group name",
            "values": ["Dev Squad", "UX Design Team", "Product Team", "Core Engineering"],
        },
    }

    def check_goals(self, input: JudgeInput) -> list[dict]:
        tg = Telegram(input.apps["telegram"], init=input.apps_init["telegram"])
        return tg.check_group_renamed(self.p.old_name, self.p.new_name, field="renamed_group")
