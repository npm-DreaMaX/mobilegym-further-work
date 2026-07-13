# bench_env/task/telegram/app.py
"""Telegram App accessor for benchmark tasks.

Provides state access and check methods for Telegram benchmark tasks.
"""

from __future__ import annotations

from typing import Any

from bench_env.task.base import BaseApp


# ── Shared parameter schemas ────────────────────────────────────────

TELEGRAM_CONTACT_PARAM = {
    "name": {
        "type": "string",
        "description": "Contact name (e.g. 'Alice Johnson', 'Bob Martinez')",
        "source": "apps.telegram.contacts[].name",
    }
}

TELEGRAM_CHAT_PARAM = {
    "chat_name": {
        "type": "string",
        "description": "Chat title (e.g. 'Alice Johnson', 'Engineering Team')",
        "source": "apps.telegram.chats[].title",
    }
}


class Telegram(BaseApp):
    """Accessor for Telegram app state."""

    # ── Properties ──────────────────────────────────────────────────

    @property
    def user(self) -> dict:
        return self._state["user"]

    @property
    def user_id(self) -> str:
        return self.user["id"]

    @property
    def user_name(self) -> str:
        return self.user["name"]

    @property
    def contacts(self) -> list[dict]:
        return self._state["contacts"]

    @property
    def chats(self) -> list[dict]:
        return self._state["chats"]

    @property
    def archived_chats(self) -> list[dict]:
        return self._state.get("archivedChats", [])

    @property
    def settings(self) -> dict:
        return self._state["settings"]

    @property
    def search(self) -> dict:
        return self._state.get("search", {"current": {"query": "", "results": []}, "history": []})

    # ── Lookup helpers ──────────────────────────────────────────────

    def find_contact(self, name: str) -> dict | None:
        """Find contact by name (case-insensitive partial match)."""
        name_lower = name.lower()
        for c in self.contacts:
            if name_lower in c["name"].lower():
                return c
        return None

    def contact_by_name(self, name: str) -> dict:
        """Get contact by exact name match. Raises if not found."""
        c = self.find_contact(name)
        if c is None:
            raise ValueError(f"Contact not found: {name}")
        return c

    def find_chat(self, title: str) -> dict | None:
        """Find chat by title (case-insensitive partial match)."""
        title_lower = title.lower()
        for chat in self.chats + self.archived_chats:
            if title_lower in chat["title"].lower():
                return chat
        return None

    def chat_by_title(self, title: str) -> dict:
        """Get chat by exact title match. Raises if not found."""
        chat = self.find_chat(title)
        if chat is None:
            raise ValueError(f"Chat not found: {title}")
        return chat

    def chat_by_id(self, chat_id: str) -> dict:
        """Get chat by ID from active or archived chats."""
        for chat in self.chats + self.archived_chats:
            if chat["id"] == chat_id:
                return chat
        raise ValueError(f"Chat not found: {chat_id}")

    def find_message(self, chat_id: str, message_id: str) -> dict | None:
        """Find a message by ID in a specific chat."""
        chat = self.chat_by_id(chat_id)
        for msg in chat.get("messages", []):
            if msg["id"] == message_id:
                return msg
        return None

    def get_chat_messages(self, chat_id: str) -> list[dict]:
        """Get all messages in a chat."""
        chat = self.chat_by_id(chat_id)
        return chat.get("messages", [])

    # ── Message diff helpers ────────────────────────────────────────

    def _init_message_ids(self, chat_id: str) -> set[str]:
        """Get message IDs from init state for a chat."""
        if not self.has_init:
            raise ValueError("init state not available")
        init_chats = self.init.chats
        for chat in init_chats:
            if chat["id"] == chat_id:
                return {msg["id"] for msg in chat.get("messages", [])}
        return set()

    def new_messages_in(self, chat_id: str) -> list[dict]:
        """Get messages added after init state."""
        current_msgs = self.get_chat_messages(chat_id)
        if not self.has_init:
            return current_msgs
        init_ids = self._init_message_ids(chat_id)
        return [msg for msg in current_msgs if msg["id"] not in init_ids]

    def new_sent_texts_to(self, chat_name: str) -> list[str]:
        """Get newly sent text messages to a specific chat."""
        chat = self.chat_by_title(chat_name)
        new_msgs = self.new_messages_in(chat["id"])
        texts = []
        for msg in new_msgs:
            if msg.get("senderId") == self.user_id and msg.get("type") == "text":
                texts.append(msg["content"])
        return texts

    def last_sent_text_to(self, chat_name: str) -> str | None:
        """Get last sent text message to a chat."""
        texts = self.new_sent_texts_to(chat_name)
        return texts[-1] if texts else None

    # ── Check methods ───────────────────────────────────────────────

    def check_new_sent_to(self, chat_name: str, *keywords: str, field: str = "sent_message") -> list[dict]:
        """Check that a new message was sent to the chat containing all keywords."""
        texts = self.new_sent_texts_to(chat_name)
        if not texts:
            return [{
                "field": field,
                "expected": f"new message with {keywords}",
                "actual": "no new sent messages",
                "passed": False,
            }]

        last_text = texts[-1]
        all_present = all(kw.lower() in last_text.lower() for kw in keywords)
        return [{
            "field": field,
            "expected": f"message containing {keywords}",
            "actual": last_text,
            "passed": all_present,
        }]

    def check_reply_sent(self, chat_name: str, reply_to_message_id: str, content: str, field: str = "reply") -> list[dict]:
        """Check that a reply was sent with correct reply_to_message_id."""
        chat = self.chat_by_title(chat_name)
        new_msgs = self.new_messages_in(chat["id"])
        replies = [m for m in new_msgs if m.get("replyToMessageId") == reply_to_message_id and m.get("senderId") == self.user_id]

        if not replies:
            return [{
                "field": field,
                "expected": f"reply to {reply_to_message_id} with content '{content}'",
                "actual": "no matching reply found",
                "passed": False,
            }]

        last_reply = replies[-1]
        content_match = content.lower() in last_reply["content"].lower()
        return [{
            "field": field,
            "expected": f"reply with content containing '{content}'",
            "actual": last_reply["content"],
            "passed": content_match,
        }]

    def check_message_edited(self, chat_id: str, message_id: str, new_content: str, field: str = "edited_message") -> list[dict]:
        """Check that a message was edited with new content."""
        msg = self.find_message(chat_id, message_id)
        if msg is None:
            return [{
                "field": field,
                "expected": f"message {message_id} edited to '{new_content}'",
                "actual": "message not found",
                "passed": False,
            }]

        content_match = new_content.lower() in msg["content"].lower()
        is_edited = msg.get("isEdited", False)
        return [{
            "field": field,
            "expected": f"edited message with content '{new_content}'",
            "actual": f"content='{msg['content']}', isEdited={is_edited}",
            "passed": content_match and is_edited,
        }]

    def check_message_deleted(self, chat_id: str, message_id: str, field: str = "deleted_message") -> list[dict]:
        """Check that a message was deleted from the chat."""
        msgs = self.get_chat_messages(chat_id)
        found = any(m["id"] == message_id for m in msgs)
        return [{
            "field": field,
            "expected": f"message {message_id} deleted",
            "actual": "still present" if found else "deleted",
            "passed": not found,
        }]

    def check_message_forwarded(self, from_chat_name: str, to_chat_name: str, source_message_id: str, field: str = "forwarded_message") -> list[dict]:
        """Check that a message was forwarded from one chat to another."""
        to_chat = self.chat_by_title(to_chat_name)
        new_msgs = self.new_messages_in(to_chat["id"])
        forwarded = [
            m for m in new_msgs
            if m.get("type") == "forwarded"
            and m.get("forwardedFrom", {}).get("messageId") == source_message_id
            and m.get("forwardedFrom", {}).get("chatId") == self.chat_by_title(from_chat_name)["id"]
        ]
        return [{
            "field": field,
            "expected": f"forwarded message from {from_chat_name} (msg {source_message_id})",
            "actual": f"{len(forwarded)} forwarded message(s) found",
            "passed": len(forwarded) > 0,
        }]

    def check_reaction_added(self, chat_id: str, message_id: str, emoji: str, field: str = "reaction") -> list[dict]:
        """Check that a reaction was added to a message."""
        msg = self.find_message(chat_id, message_id)
        if msg is None:
            return [{
                "field": field,
                "expected": f"reaction {emoji} on message {message_id}",
                "actual": "message not found",
                "passed": False,
            }]

        has_reaction = any(r["emoji"] == emoji and r.get("userReacted", False) for r in msg.get("reactions", []))
        return [{
            "field": field,
            "expected": f"reaction {emoji} with userReacted=True",
            "actual": msg.get("reactions", []),
            "passed": has_reaction,
        }]

    def check_message_pinned(self, chat_id: str, message_id: str, field: str = "pinned_message") -> list[dict]:
        """Check that a message was pinned in the chat."""
        chat = self.chat_by_id(chat_id)
        is_pinned = chat.get("pinnedMessageId") == message_id
        return [{
            "field": field,
            "expected": f"message {message_id} pinned",
            "actual": f"pinnedMessageId={chat.get('pinnedMessageId')}",
            "passed": is_pinned,
        }]

    def check_chat_pinned(self, chat_id: str, field: str = "pinned_chat") -> list[dict]:
        """Check that a chat is pinned."""
        chat = self.chat_by_id(chat_id)
        return [{
            "field": field,
            "expected": "chat pinned=True",
            "actual": f"pinned={chat.get('pinned', False)}",
            "passed": chat.get("pinned", False),
        }]

    def check_chat_muted(self, chat_id: str, field: str = "muted_chat") -> list[dict]:
        """Check that a chat is muted."""
        chat = self.chat_by_id(chat_id)
        return [{
            "field": field,
            "expected": "chat muted=True",
            "actual": f"muted={chat.get('muted', False)}",
            "passed": chat.get("muted", False),
        }]

    def check_chat_archived(self, chat_id: str, field: str = "archived_chat") -> list[dict]:
        """Check that a chat is archived (not in active chats, in archivedChats)."""
        in_active = any(c["id"] == chat_id for c in self.chats)
        in_archived = any(c["id"] == chat_id for c in self.archived_chats)
        return [{
            "field": field,
            "expected": "chat in archivedChats, not in chats",
            "actual": f"in_active={in_active}, in_archived={in_archived}",
            "passed": not in_active and in_archived,
        }]

    def check_chat_marked_unread(self, chat_id: str, field: str = "marked_unread") -> list[dict]:
        """Check that a chat is marked as unread."""
        chat = self.chat_by_id(chat_id)
        return [{
            "field": field,
            "expected": "chat isMarkedUnread=True",
            "actual": f"isMarkedUnread={chat.get('isMarkedUnread', False)}",
            "passed": chat.get("isMarkedUnread", False),
        }]

    def check_group_created(self, group_name: str, member_names: list[str], field: str = "created_group") -> list[dict]:
        """Check that a group was created with the given name and members."""
        # Find the group
        group = self.find_chat(group_name)
        if group is None:
            return [{
                "field": field,
                "expected": f"group '{group_name}' exists",
                "actual": "group not found",
                "passed": False,
            }]

        if group.get("type") != "group":
            return [{
                "field": field,
                "expected": f"group type='group'",
                "actual": f"type='{group.get('type')}'",
                "passed": False,
            }]

        # Check members
        members = group.get("members", [])
        member_name_set = {m["name"].lower() for m in members}
        expected_names = {n.lower() for n in member_names}
        # Also include self
        expected_names.add(self.user_name.lower())
        missing = expected_names - member_name_set
        return [{
            "field": field,
            "expected": f"group with members {member_names} + self",
            "actual": f"members: {[m['name'] for m in members]}",
            "passed": len(missing) == 0,
        }]

    def check_group_renamed(self, old_name: str, new_name: str, field: str = "renamed_group") -> list[dict]:
        """Check that a group was renamed. The group ID should be the same."""
        if not self.has_init:
            raise ValueError("init state not available")

        init_chats = self.init.chats
        old_chat = None
        for c in init_chats:
            if c["title"] == old_name and c.get("type") == "group":
                old_chat = c
                break

        if old_chat is None:
            raise ValueError(f"Group '{old_name}' not found in init state")

        old_id = old_chat["id"]

        # Check current state
        current_chat = self.chat_by_id(old_id)
        name_match = current_chat["title"] == new_name
        return [{
            "field": field,
            "expected": f"group '{old_id}' renamed to '{new_name}'",
            "actual": f"title='{current_chat['title']}'",
            "passed": name_match,
        }]

    def check_search_performed(self, query: str, field: str = "search") -> list[dict]:
        """Check that a search was performed with the given query."""
        search = self.search
        current_query = search.get("current", {}).get("query", "")
        return [{
            "field": field,
            "expected": f"search query contains '{query}'",
            "actual": f"query='{current_query}'",
            "passed": query.lower() in current_query.lower(),
        }]

    # ── Counting helpers ────────────────────────────────────────────

    def count_unread_chats(self) -> int:
        """Count chats with unread messages."""
        return sum(1 for c in self.chats if c.get("unreadCount", 0) > 0 or c.get("isMarkedUnread", False))

    def count_chats(self) -> int:
        """Count total active chats."""
        return len(self.chats)

    def count_messages_in(self, chat_name: str) -> int:
        """Count messages in a chat."""
        chat = self.chat_by_title(chat_name)
        return len(chat.get("messages", []))

    def count_group_members(self, chat_name: str) -> int:
        """Count members in a group chat."""
        chat = self.chat_by_title(chat_name)
        return len(chat.get("members", []))
