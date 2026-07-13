"""
Focused Telegram task tests — offline (no live env).
"""

from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any

from bench_env.task.telegram import tasks as _tasks_module
from bench_env.task.telegram.app import Telegram
from bench_env.tests.conftest import make_judge_input
from bench_env.tests.weather.test_tasks import TEST_OS_STATE

ROOT = Path(__file__).resolve().parents[3]
DEFAULT_ROUTE = {"app": "launcher", "path": "/"}


def _load_json(*parts: str) -> dict[str, Any]:
    return json.loads(ROOT.joinpath(*parts).read_text(encoding="utf-8"))


TG_BASE_STATE = _load_json("apps", "Telegram", "data", "defaults.json")


def _make_input(
    init_tg: dict[str, Any],
    curr_tg: dict[str, Any],
    route: dict | None = None,
):
    os_state = {"time": copy.deepcopy(TEST_OS_STATE["time"]), "providers": {}}
    return make_judge_input(
        {"apps": {"telegram": init_tg}, "os": os_state},
        {"apps": {"telegram": curr_tg}, "os": os_state},
        route=route or DEFAULT_ROUTE,
    )


# ── Task 3: SendMessageToContact ──────────────────────────────────────

def test_send_message_positive():
    task = _tasks_module.SendMessageToContact(
        contact_name="Alice Johnson",
        text="Hello, how are you?",
    )
    init_tg = copy.deepcopy(TG_BASE_STATE)
    curr_tg = copy.deepcopy(TG_BASE_STATE)
    # Simulate sending a message
    for chat in curr_tg["chats"]:
        if chat["title"] == "Alice Johnson":
            chat["messages"].append({
                "id": "msg_sent_999",
                "type": "text",
                "content": "Hello, how are you?",
                "senderId": curr_tg["user"]["id"],
                "senderName": curr_tg["user"]["name"],
                "timestamp": 999999999999,
                "reactions": [],
            })
            break
    checks = task.check_goals(_make_input(init_tg, curr_tg))
    assert all(c["passed"] for c in checks), checks


def test_send_message_negative():
    task = _tasks_module.SendMessageToContact(
        contact_name="Alice Johnson",
        text="Hello, how are you?",
    )
    init_tg = copy.deepcopy(TG_BASE_STATE)
    curr_tg = copy.deepcopy(TG_BASE_STATE)
    # No message sent
    checks = task.check_goals(_make_input(init_tg, curr_tg))
    assert not all(c["passed"] for c in checks), checks


# ── Task 5: EditOwnMessage ────────────────────────────────────────────

def test_edit_message_positive():
    task = _tasks_module.EditOwnMessage(
        chat_name="Alice Johnson",
        old_content="Telegram integration",
        new_content="Telegram v2 integration",
    )
    init_tg = copy.deepcopy(TG_BASE_STATE)
    curr_tg = copy.deepcopy(TG_BASE_STATE)
    # Edit the message
    for chat in curr_tg["chats"]:
        if chat["title"] == "Alice Johnson":
            for msg in chat["messages"]:
                if "integration" in msg["content"].lower() and msg["senderId"] == curr_tg["user"]["id"]:
                    msg["content"] = "Telegram v2 integration"
                    msg["isEdited"] = True
                    break
            break
    checks = task.check_goals(_make_input(init_tg, curr_tg))
    assert all(c["passed"] for c in checks), checks


# ── Task 6: DeleteOwnMessage ──────────────────────────────────────────

def test_delete_message_positive():
    task = _tasks_module.DeleteOwnMessage(
        chat_name="Alice Johnson",
        content="Telegram integration",
    )
    init_tg = copy.deepcopy(TG_BASE_STATE)
    curr_tg = copy.deepcopy(TG_BASE_STATE)
    # Delete the message
    for chat in curr_tg["chats"]:
        if chat["title"] == "Alice Johnson":
            chat["messages"] = [
                m for m in chat["messages"]
                if not ("integration" in m["content"].lower() and m["senderId"] == curr_tg["user"]["id"])
            ]
            break
    checks = task.check_goals(_make_input(init_tg, curr_tg))
    assert all(c["passed"] for c in checks), checks


# ── Task 7: ForwardMessage ────────────────────────────────────────────

def test_forward_message_positive():
    task = _tasks_module.ForwardMessage(
        from_chat="Alice Johnson",
        to_chat="Carol White",
        content="quarterly report",
    )
    init_tg = copy.deepcopy(TG_BASE_STATE)
    curr_tg = copy.deepcopy(TG_BASE_STATE)
    # Find source message
    from_chat = None
    source_msg = None
    for chat in init_tg["chats"]:
        if chat["title"] == "Alice Johnson":
            from_chat = chat
            for msg in chat["messages"]:
                if "quarterly report" in msg["content"].lower():
                    source_msg = msg
                    break
            break
    assert source_msg is not None, "Source message not found"
    # Add forwarded message to target chat
    for chat in curr_tg["chats"]:
        if chat["title"] == "Carol White":
            chat["messages"].append({
                "id": "msg_forwarded_999",
                "type": "forwarded",
                "content": source_msg["content"],
                "senderId": curr_tg["user"]["id"],
                "senderName": curr_tg["user"]["name"],
                "timestamp": 999999999999,
                "forwardedFrom": {
                    "messageId": source_msg["id"],
                    "senderId": source_msg["senderId"],
                    "senderName": source_msg.get("senderName", source_msg["senderId"]),
                    "chatId": from_chat["id"],
                    "originalContent": source_msg["content"],
                },
                "reactions": [],
            })
            break
    checks = task.check_goals(_make_input(init_tg, curr_tg))
    assert all(c["passed"] for c in checks), checks


# ── Task 8: AddReaction ───────────────────────────────────────────────

def test_add_reaction_positive():
    task = _tasks_module.AddReaction(
        chat_name="Engineering Team",
        content="Sprint planning",
        emoji="👍",
    )
    init_tg = copy.deepcopy(TG_BASE_STATE)
    curr_tg = copy.deepcopy(TG_BASE_STATE)
    # Add reaction
    for chat in curr_tg["chats"]:
        if chat["title"] == "Engineering Team":
            for msg in chat["messages"]:
                if "sprint planning" in msg["content"].lower():
                    msg["reactions"].append({"emoji": "👍", "count": 1, "userReacted": True})
                    break
            break
    checks = task.check_goals(_make_input(init_tg, curr_tg))
    assert all(c["passed"] for c in checks), checks


# ── Task 10: PinChat ──────────────────────────────────────────────────

def test_pin_chat_positive():
    task = _tasks_module.PinChat(chat_name="Carol White")
    init_tg = copy.deepcopy(TG_BASE_STATE)
    curr_tg = copy.deepcopy(TG_BASE_STATE)
    # Pin the chat
    for chat in curr_tg["chats"]:
        if chat["title"] == "Carol White":
            chat["pinned"] = True
            break
    # Ensure init has it unpinned
    for chat in init_tg["chats"]:
        if chat["title"] == "Carol White":
            chat["pinned"] = False
            break
    checks = task.check_goals(_make_input(init_tg, curr_tg))
    assert all(c["passed"] for c in checks), checks


# ── Task 11: MuteChat ─────────────────────────────────────────────────

def test_mute_chat_positive():
    task = _tasks_module.MuteChat(chat_name="Carol White")
    init_tg = copy.deepcopy(TG_BASE_STATE)
    curr_tg = copy.deepcopy(TG_BASE_STATE)
    for chat in curr_tg["chats"]:
        if chat["title"] == "Carol White":
            chat["muted"] = True
            break
    for chat in init_tg["chats"]:
        if chat["title"] == "Carol White":
            chat["muted"] = False
            break
    checks = task.check_goals(_make_input(init_tg, curr_tg))
    assert all(c["passed"] for c in checks), checks


# ── Task 12: ArchiveChat ──────────────────────────────────────────────

def test_archive_chat_positive():
    task = _tasks_module.ArchiveChat(chat_name="Carol White")
    init_tg = copy.deepcopy(TG_BASE_STATE)
    curr_tg = copy.deepcopy(TG_BASE_STATE)
    # Archive: move from chats to archivedChats
    archived_chat = None
    for chat in curr_tg["chats"]:
        if chat["title"] == "Carol White":
            archived_chat = chat.copy()
            archived_chat["archived"] = True
            break
    curr_tg["chats"] = [c for c in curr_tg["chats"] if c["title"] != "Carol White"]
    curr_tg["archivedChats"] = curr_tg.get("archivedChats", []) + [archived_chat]
    checks = task.check_goals(_make_input(init_tg, curr_tg))
    assert all(c["passed"] for c in checks), checks


# ── Task 13: MarkChatUnread ──────────────────────────────────────────

def test_mark_unread_positive():
    task = _tasks_module.MarkChatUnread(chat_name="Carol White")
    init_tg = copy.deepcopy(TG_BASE_STATE)
    curr_tg = copy.deepcopy(TG_BASE_STATE)
    for chat in curr_tg["chats"]:
        if chat["title"] == "Carol White":
            chat["isMarkedUnread"] = True
            break
    checks = task.check_goals(_make_input(init_tg, curr_tg))
    assert all(c["passed"] for c in checks), checks


# ── Task 14: CreateGroup ──────────────────────────────────────────────

def test_create_group_positive():
    task = _tasks_module.CreateGroup(
        group_name="Weekend Plans",
        contact1="Alice Johnson",
        contact2="Bob Martinez",
    )
    init_tg = copy.deepcopy(TG_BASE_STATE)
    curr_tg = copy.deepcopy(TG_BASE_STATE)
    # Add new group
    user = curr_tg["user"]
    alice = next(c for c in curr_tg["contacts"] if c["name"] == "Alice Johnson")
    bob = next(c for c in curr_tg["contacts"] if c["name"] == "Bob Martinez")
    curr_tg["chats"].append({
        "id": "chat_group_999",
        "type": "group",
        "title": "Weekend Plans",
        "avatar": "",
        "pinned": False,
        "muted": False,
        "archived": False,
        "unreadCount": 0,
        "members": [
            {"id": user["id"], "name": user["name"], "avatar": user["avatar"], "role": "owner"},
            {"id": alice["id"], "name": alice["name"], "avatar": alice["avatar"], "role": "member"},
            {"id": bob["id"], "name": bob["name"], "avatar": bob["avatar"], "role": "member"},
        ],
        "messages": [],
        "lastActivity": 999999999999,
    })
    checks = task.check_goals(_make_input(init_tg, curr_tg))
    assert all(c["passed"] for c in checks), checks


# ── Task 15: RenameGroup ──────────────────────────────────────────────

def test_rename_group_positive():
    task = _tasks_module.RenameGroup(
        old_name="Engineering Team",
        new_name="Dev Squad",
    )
    init_tg = copy.deepcopy(TG_BASE_STATE)
    curr_tg = copy.deepcopy(TG_BASE_STATE)
    # Rename
    for chat in curr_tg["chats"]:
        if chat["title"] == "Engineering Team":
            chat["title"] = "Dev Squad"
            break
    checks = task.check_goals(_make_input(init_tg, curr_tg))
    assert all(c["passed"] for c in checks), checks


# ── Task 2: SearchInChatAndReportSender ───────────────────────────────

def test_search_and_report_sender():
    task = _tasks_module.SearchInChatAndReportSender(
        keyword="quarterly report",
        chat_name="Boss",
    )
    init_tg = copy.deepcopy(TG_BASE_STATE)
    answer = task.get_answer(_make_input(init_tg, init_tg))
    # The Boss chat has "quarterly report" in msg_boss_001, sent by Boss
    assert "Boss" in answer, f"Expected 'Boss' in answer, got: {answer}"


# ── Telegram accessor tests ──────────────────────────────────────────

def test_telegram_accessor():
    tg = Telegram(TG_BASE_STATE, init=TG_BASE_STATE)
    assert tg.user_name == "Alex"
    assert len(tg.contacts) > 0
    assert len(tg.chats) > 0
    assert tg.count_chats() == len(tg.chats)

    # Find contact
    alice = tg.find_contact("Alice")
    assert alice is not None
    assert alice["name"] == "Alice Johnson"

    # Find chat
    eng = tg.find_chat("Engineering")
    assert eng is not None
    assert eng["type"] == "group"
