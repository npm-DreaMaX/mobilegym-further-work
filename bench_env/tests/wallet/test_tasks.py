"""Wallet task correctness tests."""

from __future__ import annotations

import copy
import inspect
import json
from pathlib import Path
from typing import Any

import pytest

from bench_env.task.base import BaseTask
from bench_env.task.common_tasks import AnswerTask
from bench_env.tests.conftest import make_judge_input
from bench_env.tests.task_defs import _shared_hard as hard
from bench_env.tests.task_defs import _shared_derived as derived
from bench_env.task.wallet import tasks as _tasks_module
from bench_env.task.wallet.app import Wallet

ALL_TASK_CLASSES: list[type[BaseTask]] = [
    obj
    for _, obj in inspect.getmembers(_tasks_module, inspect.isclass)
    if issubclass(obj, BaseTask) and obj is not BaseTask and obj.__module__ == _tasks_module.__name__
]
ALL_TASK_IDS = [cls.__name__ for cls in ALL_TASK_CLASSES]
ANSWER_TASK_CLASSES = [cls for cls in ALL_TASK_CLASSES if issubclass(cls, AnswerTask)]


TEST_OS_STATE = {"time": {"timestamp": 1742025600000}}


def _load_defaults() -> dict[str, Any]:
    path = Path(__file__).resolve().parents[3] / "apps" / "Wallet" / "data" / "defaults.json"
    return json.loads(path.read_text(encoding="utf-8"))


DEFAULTS = _load_defaults()


def _base_state() -> dict[str, Any]:
    return copy.deepcopy(DEFAULTS)


def _make_wallet_input(
    init_state: dict[str, Any],
    curr_state: dict[str, Any],
    *,
    route: dict[str, Any] | None = None,
    answer: str | None = None,
):
    return make_judge_input(
        {"apps": {"wallet": init_state}, "os": TEST_OS_STATE},
        {"apps": {"wallet": curr_state}, "os": TEST_OS_STATE},
        route=route,
        answer=answer,
    )


def _card_by_name(state: dict[str, Any], name: str) -> dict[str, Any] | None:
    for card in state.get("cards", []):
        if card.get("name") == name:
            return card
    return None


def _find_card(state: dict[str, Any], card_id: str) -> dict[str, Any] | None:
    for card in state.get("cards", []):
        if card.get("id") == card_id:
            return card
    return None


# ---------------------------------------------------------------------------
# Task definition tests
# ---------------------------------------------------------------------------

class TestTaskDefinitions:
    @pytest.mark.parametrize("task_cls", ALL_TASK_CLASSES, ids=ALL_TASK_IDS)
    def test_instantiation(self, task_cls: type[BaseTask]) -> None:
        task = task_cls()
        checks = hard.TestTaskDefinitions()
        checks.test_instantiation(task_cls)
        checks.test_description_renders(task_cls)
        checks.test_required_class_attrs(task_cls)
        checks.test_parameter_defaults_present(task_cls)

    @pytest.mark.parametrize("task_cls", ANSWER_TASK_CLASSES, ids=[cls.__name__ for cls in ANSWER_TASK_CLASSES])
    def test_answer_task_has_answer_or_get_answer(self, task_cls: type[AnswerTask]) -> None:
        checks = hard.TestTaskDefinitions()
        checks.test_answer_task_has_answer_or_get_answer(task_cls)


# ---------------------------------------------------------------------------
# Accessor tests
# ---------------------------------------------------------------------------

class TestWalletAccessor:
    @pytest.fixture
    def wallet(self) -> Wallet:
        return Wallet(copy.deepcopy(DEFAULTS))

    def test_cards_count(self, wallet: Wallet) -> None:
        assert len(wallet.cards) == 6

    def test_default_card(self, wallet: Wallet) -> None:
        assert wallet.default_card_id == "card-bank-001"

    def test_card_by_name(self, wallet: Wallet) -> None:
        card = wallet.card_by_name("工资卡")
        assert card is not None
        assert card["type"] == "bank"

    def test_membership_card_by_brand(self, wallet: Wallet) -> None:
        card = wallet.membership_card_by_brand("星巴克")
        assert card is not None
        assert card["memberNumber"] == "SB20240001"

    def test_transit_card_by_city(self, wallet: Wallet) -> None:
        card = wallet.transit_card_by_city("北京")
        assert card is not None
        assert card["name"] == "北京一卡通"


# ---------------------------------------------------------------------------
# Judge matrix offline
# ---------------------------------------------------------------------------

def _positive(task: BaseTask, inp: Any) -> tuple[BaseTask, Any]:
    return task, inp


def _negative(task: BaseTask, inp: Any) -> tuple[BaseTask, Any]:
    return task, inp


# AddBankCard

def _add_bank_card_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    curr["cards"].insert(0, {
        "id": "card-bank-new",
        "type": "bank",
        "name": "新工资卡",
        "issuer": "中国工商银行",
        "holder": "张伟",
        "last4": "1234",
        "number": "",
        "balance": 0,
        "frozen": False,
        "isDefault": False,
        "sortOrder": 0,
        "barcode": "",
    })
    task = _tasks_module.AddBankCard(bank="中国工商银行", holder="张伟", last4="1234", nickname="新工资卡")
    return task, _make_wallet_input(state, curr)


def _add_bank_card_negative():
    state = _base_state()
    task = _tasks_module.AddBankCard(bank="中国工商银行", holder="张伟", last4="1234", nickname="新工资卡")
    return task, _make_wallet_input(state, copy.deepcopy(state))


# SetDefaultCard

def _set_default_card_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    card_id = "card-bank-002"
    for c in curr["cards"]:
        c["isDefault"] = c["id"] == card_id
    curr["defaultCardId"] = card_id
    task = _tasks_module.SetDefaultCard(cards="储蓄卡", card_id=card_id)
    return task, _make_wallet_input(state, curr)


def _set_default_card_negative():
    state = _base_state()
    task = _tasks_module.SetDefaultCard(cards="储蓄卡", card_id="card-bank-002")
    return task, _make_wallet_input(state, copy.deepcopy(state))


# RenameCard

def _rename_card_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    card = _find_card(curr, "card-bank-001")
    assert card is not None
    card["name"] = "我的主卡"
    task = _tasks_module.RenameCard(cards="工资卡", card_id="card-bank-001", new_name="我的主卡")
    return task, _make_wallet_input(state, curr)


def _rename_card_negative():
    state = _base_state()
    task = _tasks_module.RenameCard(cards="工资卡", card_id="card-bank-001", new_name="我的主卡")
    return task, _make_wallet_input(state, copy.deepcopy(state))


# FreezeCard

def _freeze_card_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    card = _find_card(curr, "card-bank-001")
    assert card is not None
    card["frozen"] = True
    task = _tasks_module.FreezeCard(cards="工资卡", card_id="card-bank-001")
    return task, _make_wallet_input(state, curr)


def _freeze_card_negative():
    state = _base_state()
    task = _tasks_module.FreezeCard(cards="工资卡", card_id="card-bank-001")
    return task, _make_wallet_input(state, copy.deepcopy(state))


# UnfreezeCard

def _unfreeze_card_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    card = _find_card(curr, "card-bank-003")
    assert card is not None
    card["frozen"] = False
    task = _tasks_module.UnfreezeCard(cards="信用卡", card_id="card-bank-003")
    return task, _make_wallet_input(state, curr)


def _unfreeze_card_negative():
    state = _base_state()
    task = _tasks_module.UnfreezeCard(cards="信用卡", card_id="card-bank-003")
    return task, _make_wallet_input(state, copy.deepcopy(state))


# DeleteCard

def _delete_card_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    card_id = "card-bank-002"
    curr["cards"] = [c for c in curr["cards"] if c["id"] != card_id]
    task = _tasks_module.DeleteCard(cards="储蓄卡", card_id=card_id)
    return task, _make_wallet_input(state, curr)


def _delete_card_negative():
    state = _base_state()
    task = _tasks_module.DeleteCard(cards="储蓄卡", card_id="card-bank-002")
    return task, _make_wallet_input(state, copy.deepcopy(state))


# SortCards

def _sort_cards_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    card_id = "card-bank-002"
    cards = [c for c in curr["cards"] if c["id"] != card_id]
    card = _find_card(curr, card_id)
    cards.insert(0, card)
    curr["cards"] = cards
    task = _tasks_module.SortCards(cards="储蓄卡", card_id=card_id)
    return task, _make_wallet_input(state, curr)


def _sort_cards_negative():
    state = _base_state()
    task = _tasks_module.SortCards(cards="储蓄卡", card_id="card-bank-002")
    return task, _make_wallet_input(state, copy.deepcopy(state))


# AddTransitCard

def _add_transit_card_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    curr["cards"].append({
        "id": "card-transit-new",
        "type": "transit",
        "name": "上海一卡通",
        "issuer": "上海交通一卡通",
        "city": "上海",
        "balance": 0,
        "frozen": False,
        "isDefault": False,
        "sortOrder": len(curr["cards"]),
        "barcode": "T123",
    })
    task = _tasks_module.AddTransitCard(city="上海")
    return task, _make_wallet_input(state, curr)


def _add_transit_card_negative():
    state = _base_state()
    task = _tasks_module.AddTransitCard(city="上海")
    return task, _make_wallet_input(state, copy.deepcopy(state))


# RechargeTransitCard

def _recharge_transit_card_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    card = _find_card(curr, "card-transit-001")
    assert card is not None
    card["balance"] += 50
    curr["transactions"].insert(0, {
        "id": "txn-new",
        "cardId": "card-transit-001",
        "type": "recharge",
        "amount": 50,
        "description": "北京一卡通充值",
        "timestamp": TEST_OS_STATE["time"]["timestamp"],
    })
    task = _tasks_module.RechargeTransitCard(cards="北京一卡通", card_id="card-transit-001", amount=50)
    return task, _make_wallet_input(state, curr)


def _recharge_transit_card_negative():
    state = _base_state()
    task = _tasks_module.RechargeTransitCard(cards="北京一卡通", card_id="card-transit-001", amount=50)
    return task, _make_wallet_input(state, copy.deepcopy(state))


# AddMembershipCard

def _add_membership_card_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    curr["cards"].append({
        "id": "card-membership-new",
        "type": "membership",
        "name": "星巴克会员",
        "issuer": "星巴克",
        "memberNumber": "SB20240088",
        "points": 0,
        "balance": 0,
        "frozen": False,
        "isDefault": False,
        "sortOrder": len(curr["cards"]),
        "barcode": "SB20240088",
    })
    task = _tasks_module.AddMembershipCard(brand="星巴克", member_number="SB20240088")
    return task, _make_wallet_input(state, curr)


def _add_membership_card_negative():
    state = _base_state()
    task = _tasks_module.AddMembershipCard(brand="星巴克", member_number="SB20240088")
    return task, _make_wallet_input(state, copy.deepcopy(state))


# RedeemReward

def _redeem_reward_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    card = _find_card(curr, "card-membership-002")
    assert card is not None
    card["points"] -= 500
    curr["redeemedRewards"].insert(0, {
        "id": "redeemed-new",
        "rewardId": "reward-002",
        "membershipCardId": "card-membership-002",
        "name": "100元代金券",
        "pointsCost": 500,
        "redeemedAt": TEST_OS_STATE["time"]["timestamp"],
    })
    task = _tasks_module.RedeemReward(cards="海底捞会员", card_id="card-membership-002", reward_name="100元代金券", reward_id="reward-002")
    return task, _make_wallet_input(state, curr)


def _redeem_reward_negative():
    state = _base_state()
    task = _tasks_module.RedeemReward(cards="海底捞会员", card_id="card-membership-002", reward_name="100元代金券", reward_id="reward-002")
    return task, _make_wallet_input(state, copy.deepcopy(state))


# AddCoupon

def _add_coupon_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    curr["coupons"].insert(0, {
        "id": "coupon-new",
        "merchant": "麦当劳",
        "code": "NEWCODE1",
        "value": 20,
        "expiry": 1799366400000,
        "redeemed": False,
    })
    task = _tasks_module.AddCoupon(merchant="麦当劳", code="NEWCODE1", value=20)
    return task, _make_wallet_input(state, curr)


def _add_coupon_negative():
    state = _base_state()
    task = _tasks_module.AddCoupon(merchant="麦当劳", code="NEWCODE1", value=20)
    return task, _make_wallet_input(state, copy.deepcopy(state))


# RedeemCoupon

def _redeem_coupon_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    coupon = next((c for c in curr["coupons"] if c["code"] == "MCD2024A"), None)
    assert coupon is not None
    coupon["redeemed"] = True
    task = _tasks_module.RedeemCoupon(coupon_code="MCD2024A", coupon_id="coupon-001")
    return task, _make_wallet_input(state, curr)


def _redeem_coupon_negative():
    state = _base_state()
    task = _tasks_module.RedeemCoupon(coupon_code="MCD2024A", coupon_id="coupon-001")
    return task, _make_wallet_input(state, copy.deepcopy(state))


# ArchiveExpiredTicket

def _archive_expired_ticket_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    ticket_id = "ticket-001"
    ticket = next((t for t in curr["tickets"] if t["id"] == ticket_id), None)
    assert ticket is not None
    curr["tickets"] = [t for t in curr["tickets"] if t["id"] != ticket_id]
    curr["archivedTickets"].insert(0, {**ticket, "archived": True})
    task = _tasks_module.ArchiveExpiredTicket(ticket_title="5元快车券", ticket_id=ticket_id)
    return task, _make_wallet_input(state, curr)


def _archive_expired_ticket_negative():
    state = _base_state()
    task = _tasks_module.ArchiveExpiredTicket(ticket_title="5元快车券", ticket_id="ticket-001")
    return task, _make_wallet_input(state, copy.deepcopy(state))


# SearchMembershipNumber

def _search_membership_number_positive():
    state = _base_state()
    curr = copy.deepcopy(state)
    curr["searchHistory"] = ["星巴克"]
    task = _tasks_module.SearchMembershipNumber(brand="星巴克", card_id="card-membership-001", member_number="SB20240001")
    inp = _make_wallet_input(state, curr, route={"app": "wallet", "path": "/card/card-membership-001"}, answer="SB20240001")
    return task, inp


def _search_membership_number_negative():
    state = _base_state()
    curr = copy.deepcopy(state)
    curr["searchHistory"] = ["星巴克"]
    task = _tasks_module.SearchMembershipNumber(brand="星巴克", card_id="card-membership-001", member_number="SB20240001")
    inp = _make_wallet_input(state, curr, route={"app": "wallet", "path": "/card/card-membership-001"}, answer="WRONG")
    return task, inp


OFFLINE_JUDGE_POSITIVE_CASES = [
    ("AddBankCard", _add_bank_card_positive),
    ("SetDefaultCard", _set_default_card_positive),
    ("RenameCard", _rename_card_positive),
    ("FreezeCard", _freeze_card_positive),
    ("UnfreezeCard", _unfreeze_card_positive),
    ("DeleteCard", _delete_card_positive),
    ("SortCards", _sort_cards_positive),
    ("AddTransitCard", _add_transit_card_positive),
    ("RechargeTransitCard", _recharge_transit_card_positive),
    ("AddMembershipCard", _add_membership_card_positive),
    ("RedeemReward", _redeem_reward_positive),
    ("AddCoupon", _add_coupon_positive),
    ("RedeemCoupon", _redeem_coupon_positive),
    ("ArchiveExpiredTicket", _archive_expired_ticket_positive),
    ("SearchMembershipNumber", _search_membership_number_positive),
]

OFFLINE_JUDGE_NEGATIVE_CASES = [
    ("AddBankCard", _add_bank_card_negative),
    ("SetDefaultCard", _set_default_card_negative),
    ("RenameCard", _rename_card_negative),
    ("FreezeCard", _freeze_card_negative),
    ("UnfreezeCard", _unfreeze_card_negative),
    ("DeleteCard", _delete_card_negative),
    ("SortCards", _sort_cards_negative),
    ("AddTransitCard", _add_transit_card_negative),
    ("RechargeTransitCard", _recharge_transit_card_negative),
    ("AddMembershipCard", _add_membership_card_negative),
    ("RedeemReward", _redeem_reward_negative),
    ("AddCoupon", _add_coupon_negative),
    ("RedeemCoupon", _redeem_coupon_negative),
    ("ArchiveExpiredTicket", _archive_expired_ticket_negative),
    ("SearchMembershipNumber", _search_membership_number_negative),
]


class TestTaskJudgeMatrixOffline:
    @pytest.mark.parametrize("name, builder", OFFLINE_JUDGE_POSITIVE_CASES, ids=[n for n, _ in OFFLINE_JUDGE_POSITIVE_CASES])
    def test_positive_cases(self, name: str, builder):
        task, inp = builder()
        checks = task.check_goals(inp)
        assert all(c["passed"] for c in checks), f"Task {name} failed: {checks}"

    @pytest.mark.parametrize("name, builder", OFFLINE_JUDGE_NEGATIVE_CASES, ids=[n for n, _ in OFFLINE_JUDGE_NEGATIVE_CASES])
    def test_negative_cases(self, name: str, builder):
        task, inp = builder()
        checks = task.check_goals(inp)
        assert not all(c["passed"] for c in checks), f"Task {name} should fail but passed: {checks}"

    def test_offline_judge_matrix_complete(self):
        positive = {name for name, _ in OFFLINE_JUDGE_POSITIVE_CASES}
        negative = {name for name, _ in OFFLINE_JUDGE_NEGATIVE_CASES}
        assert positive == set(ALL_TASK_IDS)
        assert negative == set(ALL_TASK_IDS)
