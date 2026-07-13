"""Offline correctness tests for exactly fifteen Wallet benchmarks."""

from __future__ import annotations

import copy
import inspect
import json
from pathlib import Path
from typing import Any, Callable

import pytest

from bench_env.task.base import BaseTask
from bench_env.task.wallet import tasks as task_module
from bench_env.task.wallet.app import Wallet
from bench_env.tests.conftest import make_judge_input
from bench_env.tests.task_defs import _shared_hard as hard


EXPECTED_TASK_IDS = {
    "AddBankCard", "SetDefaultCard", "RenameBankCard", "FreezeBankCard", "UnfreezeBankCard",
    "DeleteBankCard", "ReorderBankCards", "AddTransitCard", "RechargeTransitCard",
    "AddMembershipCard", "RedeemReward", "AddCoupon", "RedeemCoupon",
    "ArchiveExpiredTicket", "SearchMembershipNumber",
}
TASK_CLASSES = [obj for _, obj in inspect.getmembers(task_module, inspect.isclass) if issubclass(obj, BaseTask) and obj is not BaseTask and obj.__module__ == task_module.__name__]
DEFAULTS = json.loads((Path(__file__).resolve().parents[3] / "apps" / "Wallet" / "data" / "defaults.json").read_text(encoding="utf-8"))
OS_STATE = {"time": {"timestamp": 1742025600000}}


def state() -> dict[str, Any]:
    value = copy.deepcopy(DEFAULTS)
    value["_temp"] = {"searchQuery": "", "filterType": "all", "lastViewedCardId": None, "lastViewedRoute": None}
    return value


def judge(init: dict[str, Any], current: dict[str, Any], *, route: str = "/", answer: str | None = None, submitted: bool = False):
    apps_init = {"wallet": init, "answer_sheet": {"answers": {}, "submitted": False}}
    apps = {"wallet": current, "answer_sheet": {"answers": {"0": answer} if answer is not None else {}, "submitted": submitted}}
    return make_judge_input({"apps": apps_init, "os": OS_STATE}, {"apps": apps, "os": OS_STATE}, route={"app": "wallet", "path": route}, answer=answer)


def find_card(value: dict[str, Any], card_id: str) -> dict[str, Any]:
    return next(card for card in value["cards"] if card["id"] == card_id)


def assert_pass(task: BaseTask, inp: Any) -> None:
    checks = task.check_goals(inp)
    assert all(check["passed"] for check in checks), checks


def assert_fail(task: BaseTask, inp: Any) -> None:
    checks = task.check_goals(inp)
    assert not all(check["passed"] for check in checks), checks


class TestDefinitions:
    def test_exactly_fifteen_expected_ids(self) -> None:
        assert {task.__name__ for task in TASK_CLASSES} == EXPECTED_TASK_IDS
        assert len(TASK_CLASSES) == 15

    @pytest.mark.parametrize("task_cls", TASK_CLASSES, ids=lambda value: value.__name__)
    def test_definition_contract(self, task_cls: type[BaseTask]) -> None:
        checks = hard.TestTaskDefinitions()
        checks.test_instantiation(task_cls)
        checks.test_description_renders(task_cls)
        checks.test_required_class_attrs(task_cls)
        checks.test_parameter_defaults_present(task_cls)


class TestAccessor:
    def test_fixture_access(self) -> None:
        wallet = Wallet(state())
        assert wallet.default_card_id == "card-bank-001"
        assert wallet.membership_card_by_brand("星巴克")["memberNumber"] == "SB20240001"
        assert wallet.transit_card_by_city("北京")["id"] == "card-transit-001"


def add_bank_positive():
    initial = state(); current = copy.deepcopy(initial)
    current["cards"].insert(0, {"id": "card-bank-004", "type": "bank", "name": "新工资卡", "issuer": "中国工商银行", "holder": "张伟", "last4": "1234", "number": "6222020000000001234", "cardType": "debit", "balance": 0, "frozen": False, "isDefault": False, "sortOrder": 6, "barcode": "6222020000000001234"})
    return task_module.AddBankCard(bank="中国工商银行", holder="张伟", last4="1234", nickname="新工资卡"), judge(initial, current)


def default_positive():
    initial = state(); current = copy.deepcopy(initial)
    for card in current["cards"]: card["isDefault"] = card["id"] == "card-bank-002"
    current["defaultCardId"] = "card-bank-002"
    return task_module.SetDefaultCard(card_name="储蓄卡", card_id="card-bank-002"), judge(initial, current)


def rename_positive():
    initial = state(); current = copy.deepcopy(initial); find_card(current, "card-bank-001")["name"] = "我的银行卡"
    return task_module.RenameBankCard(card_name="工资卡", card_id="card-bank-001", new_name="我的银行卡"), judge(initial, current)


def freeze_positive():
    initial = state(); current = copy.deepcopy(initial); find_card(current, "card-bank-002")["frozen"] = True
    return task_module.FreezeBankCard(card_name="储蓄卡", card_id="card-bank-002"), judge(initial, current)


def unfreeze_positive():
    initial = state(); current = copy.deepcopy(initial); find_card(current, "card-bank-003")["frozen"] = False
    return task_module.UnfreezeBankCard(card_name="信用卡", card_id="card-bank-003"), judge(initial, current)


def delete_positive():
    initial = state(); current = copy.deepcopy(initial); current["cards"] = [card for card in current["cards"] if card["id"] != "card-bank-002"]
    return task_module.DeleteBankCard(card_name="储蓄卡", card_id="card-bank-002"), judge(initial, current)


def reorder_positive():
    initial = state(); current = copy.deepcopy(initial); cards = current["cards"]; moved = next(card for card in cards if card["id"] == "card-bank-002"); cards.remove(moved); cards.insert(0, moved)
    for index, card in enumerate(cards): card["sortOrder"] = index
    return task_module.ReorderBankCards(card_name="储蓄卡", card_id="card-bank-002"), judge(initial, current)


def add_transit_positive():
    initial = state(); current = copy.deepcopy(initial)
    current["cards"].append({"id": "card-transit-002", "type": "transit", "name": "上海一卡通", "issuer": "上海交通一卡通", "city": "上海", "balance": 0, "frozen": False, "isDefault": False, "sortOrder": 6, "barcode": "1000000000002"})
    return task_module.AddTransitCard(city="上海"), judge(initial, current)


def recharge_positive():
    initial = state(); current = copy.deepcopy(initial); find_card(current, "card-transit-001")["balance"] += 50
    current["transactions"].insert(0, {"id": "txn-001", "cardId": "card-transit-001", "type": "recharge", "amount": 50, "description": "北京一卡通充值", "timestamp": OS_STATE["time"]["timestamp"]})
    return task_module.RechargeTransitCard(card_name="北京一卡通", card_id="card-transit-001", amount=50), judge(initial, current)


def add_membership_positive():
    initial = state(); current = copy.deepcopy(initial)
    current["cards"].append({"id": "card-membership-003", "type": "membership", "name": "星巴克会员卡", "issuer": "星巴克", "memberNumber": "SB20240088", "points": 0, "balance": 0, "frozen": False, "isDefault": False, "sortOrder": 6, "barcode": "SB20240088"})
    return task_module.AddMembershipCard(brand="星巴克", member_number="SB20240088"), judge(initial, current)


def reward_positive():
    initial = state(); current = copy.deepcopy(initial); find_card(current, "card-membership-002")["points"] -= 500
    current["redeemedRewards"].insert(0, {"id": "redeemed-001", "rewardId": "reward-002", "membershipCardId": "card-membership-002", "name": "100元代金券", "pointsCost": 500, "redeemedAt": OS_STATE["time"]["timestamp"]})
    current["transactions"].insert(0, {"id": "txn-001", "cardId": "card-membership-002", "type": "redeem", "amount": 500, "description": "100元代金券", "timestamp": OS_STATE["time"]["timestamp"]})
    return task_module.RedeemReward(reward_name="100元代金券", reward_id="reward-002", card_id="card-membership-002", card_name="海底捞会员"), judge(initial, current)


def add_coupon_positive():
    initial = state(); current = copy.deepcopy(initial)
    current["coupons"].insert(0, {"id": "coupon-003", "merchant": "麦当劳", "code": "NEWCODE1", "value": 20, "expiry": 1799366400000, "redeemed": False})
    return task_module.AddCoupon(merchant="麦当劳", code="NEWCODE1", value=20), judge(initial, current)


def redeem_coupon_positive():
    initial = state(); current = copy.deepcopy(initial); coupon = next(item for item in current["coupons"] if item["id"] == "coupon-001"); coupon["redeemed"] = True; coupon["redeemedAt"] = OS_STATE["time"]["timestamp"]
    return task_module.RedeemCoupon(coupon_code="MCD2024A", coupon_id="coupon-001"), judge(initial, current)


def archive_positive():
    initial = state(); current = copy.deepcopy(initial); ticket = next(item for item in current["tickets"] if item["id"] == "ticket-001"); current["tickets"].remove(ticket); current["archivedTickets"].insert(0, {**ticket, "archived": True})
    return task_module.ArchiveExpiredTicket(ticket_title="5元快车券", ticket_id="ticket-001"), judge(initial, current)


def search_positive():
    initial = state(); current = copy.deepcopy(initial); current["searchHistory"] = ["星巴克"]; current["_temp"] = {"searchQuery": "星巴克", "filterType": "all", "lastViewedCardId": "card-membership-001", "lastViewedRoute": "/membership-cards/card-membership-001"}
    task = task_module.SearchMembershipNumber(brand="星巴克", card_id="card-membership-001", member_number="SB20240001")
    return task, judge(initial, current, route="/membership-cards/card-membership-001", answer="会员编号是 SB20240001", submitted=True)


POSITIVE_BUILDERS: list[tuple[str, Callable[[], tuple[BaseTask, Any]]]] = [
    ("AddBankCard", add_bank_positive), ("SetDefaultCard", default_positive), ("RenameBankCard", rename_positive),
    ("FreezeBankCard", freeze_positive), ("UnfreezeBankCard", unfreeze_positive), ("DeleteBankCard", delete_positive),
    ("ReorderBankCards", reorder_positive), ("AddTransitCard", add_transit_positive), ("RechargeTransitCard", recharge_positive),
    ("AddMembershipCard", add_membership_positive), ("RedeemReward", reward_positive), ("AddCoupon", add_coupon_positive),
    ("RedeemCoupon", redeem_coupon_positive), ("ArchiveExpiredTicket", archive_positive), ("SearchMembershipNumber", search_positive),
]


class TestJudgeMatrix:
    @pytest.mark.parametrize("name,builder", POSITIVE_BUILDERS, ids=[name for name, _ in POSITIVE_BUILDERS])
    def test_positive(self, name: str, builder: Callable[[], tuple[BaseTask, Any]]) -> None:
        task, inp = builder(); assert_pass(task, inp)

    @pytest.mark.parametrize("name,builder", POSITIVE_BUILDERS[:-1], ids=[f"{name}_did_nothing" for name, _ in POSITIVE_BUILDERS[:-1]])
    def test_operate_negative_did_nothing(self, name: str, builder: Callable[[], tuple[BaseTask, Any]]) -> None:
        task, inp = builder(); assert_fail(task, judge(inp.apps_init["wallet"], copy.deepcopy(inp.apps_init["wallet"])))

    def test_recharge_wrong_target_negative(self) -> None:
        task, inp = recharge_positive(); current = copy.deepcopy(inp.apps_init["wallet"]); find_card(current, "card-transit-001")["balance"] += 50
        assert_fail(task, judge(inp.apps_init["wallet"], current))

    def test_reward_partial_completion_negative(self) -> None:
        task, inp = reward_positive(); current = copy.deepcopy(inp.apps_init["wallet"]); find_card(current, "card-membership-002")["points"] -= 500
        assert_fail(task, judge(inp.apps_init["wallet"], current))

    def test_search_wrong_target_negative(self) -> None:
        task, inp = search_positive(); current = copy.deepcopy(inp.apps["wallet"]); current["_temp"]["lastViewedCardId"] = "card-membership-002"; current["_temp"]["lastViewedRoute"] = "/membership-cards/card-membership-002"
        assert_fail(task, judge(inp.apps_init["wallet"], current, route="/membership-cards/card-membership-002", answer="会员编号是 SB20240001", submitted=True))

    def test_search_correct_state_wrong_answer_negative(self) -> None:
        task, inp = search_positive(); assert_fail(task, judge(inp.apps_init["wallet"], inp.apps["wallet"], route="/membership-cards/card-membership-001", answer="会员编号是 HDL66880022", submitted=True))

    def test_search_correct_answer_not_submitted_negative(self) -> None:
        task, inp = search_positive(); assert_fail(task, judge(inp.apps_init["wallet"], inp.apps["wallet"], route="/membership-cards/card-membership-001", answer="会员编号是 SB20240001", submitted=False))

    def test_search_empty_answer_negative(self) -> None:
        task, inp = search_positive(); assert_fail(task, judge(inp.apps_init["wallet"], inp.apps["wallet"], route="/membership-cards/card-membership-001", answer=None, submitted=True))
