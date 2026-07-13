"""Wallet benchmark task definitions."""

from __future__ import annotations

from typing import Any

from bench_env.task.base import BaseTask
from bench_env.task.common_tasks import AnswerTask, CriteriaTask, match_value
from bench_env.task.judge import JudgeInput
from bench_env.task.wallet.app import Wallet


# ---------------------------------------------------------------------------
# Sampler helpers
# ---------------------------------------------------------------------------

def _wallet(state: dict[str, Any]) -> Wallet:
    return Wallet(state["apps"]["wallet"])


def _sample_bank_card(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
    cards = _wallet(env_state).cards_of_type("bank")
    if not cards:
        raise ValueError("No bank cards found in wallet state")
    return rng.choice(cards)


def _sample_non_default_bank_card(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
    cards = [c for c in _wallet(env_state).cards_of_type("bank") if not c.get("isDefault")]
    if not cards:
        raise ValueError("No non-default bank cards found in wallet state")
    return rng.choice(cards)


def _sample_frozen_bank_card(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
    cards = [c for c in _wallet(env_state).cards_of_type("bank") if c.get("frozen")]
    if not cards:
        raise ValueError("No frozen bank cards found in wallet state")
    return rng.choice(cards)


def _sample_transit_card(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
    cards = _wallet(env_state).cards_of_type("transit")
    if not cards:
        raise ValueError("No transit cards found in wallet state")
    return rng.choice(cards)


def _sample_membership_card(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
    cards = _wallet(env_state).cards_of_type("membership")
    if not cards:
        raise ValueError("No membership cards found in wallet state")
    return rng.choice(cards)


def _sample_unredeemed_coupon(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
    coupons = [c for c in _wallet(env_state).coupons if not c.get("redeemed")]
    if not coupons:
        raise ValueError("No unredeemed coupons found in wallet state")
    return rng.choice(coupons)


def _sample_expired_ticket(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
    tickets = _wallet(env_state).tickets
    if not tickets:
        raise ValueError("No expired tickets found in wallet state")
    return rng.choice(tickets)


def _sample_redeemable_reward(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
    wallet = _wallet(env_state)
    membership_ids = {c.get("id") for c in wallet.cards_of_type("membership")}
    redeemable = [
        r for r in wallet.rewards
        if r.get("membershipCardId") in membership_ids
    ]
    if not redeemable:
        raise ValueError("No redeemable rewards found in wallet state")
    return rng.choice(redeemable)


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------

class AddBankCard(BaseTask):
    templates = ["添加一张{bank}的银行卡，持卡人{holder}，卡号后四位{last4}，昵称为{nickname}"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["input"]
    parameters = {
        "bank": {
            "type": "enum",
            "values": ["中国工商银行", "中国建设银行", "中国农业银行", "中国银行", "招商银行", "交通银行"],
            "default": "中国工商银行",
        },
        "holder": {"type": "string", "default": "张伟"},
        "last4": {"type": "string", "pattern": r"\d{4}", "default": "1234"},
        "nickname": {"type": "string", "default": "新工资卡"},
    }
    expected_changes = ["cards"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        wallet = Wallet(input.apps["wallet"])
        card = wallet.bank_card_by_issuer_and_last4(self.p.bank, self.p.last4)
        return [
            {
                "field": "cards",
                "expected": f"bank card {self.p.nickname} exists",
                "actual": card,
                "passed": bool(
                    card
                    and card.get("name") == self.p.nickname
                    and card.get("holder") == self.p.holder
                ),
            }
        ]


class SetDefaultCard(CriteriaTask):
    templates = ["将{cards}银行卡设为默认卡"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L1"
    capabilities = ["select"]
    parameters = {
        "cards": {
            "type": "string",
            "sampler": _sample_non_default_bank_card,
            "fields": {"cards": "name"},
            "default": "储蓄卡",
        }
    }
    criteria: dict[str, Any] = {"defaultCardId": "{card_id}"}
    expected_changes = ["defaultCardId", "cards[].isDefault"]

    async def _post_sample(self, env: Any) -> None:
        await self._invert_criteria(env)

    def get_expected_changes(self, input: JudgeInput) -> list[str]:
        return ["defaultCardId", "cards[].isDefault"]


class RenameCard(BaseTask):
    templates = ["将{cards}重命名为{new_name}"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["input"]
    parameters = {
        "cards": {
            "type": "string",
            "sampler": _sample_bank_card,
            "fields": {"cards": "name", "card_id": "id"},
            "default": "工资卡",
        },
        "new_name": {"type": "string", "default": "我的银行卡"},
    }
    expected_changes = ["cards[].name"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        wallet = Wallet(input.apps["wallet"])
        card = wallet.card_by_id(self.params.get("card_id", ""))
        return [
            {
                "field": "cards[].name",
                "expected": self.p.new_name,
                "actual": card.get("name") if card else None,
                "passed": bool(card and card.get("name") == self.p.new_name),
            }
        ]


class FreezeCard(CriteriaTask):
    templates = ["冻结{cards}"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L1"
    capabilities = ["select"]
    parameters = {
        "cards": {
            "type": "string",
            "sampler": _sample_bank_card,
            "fields": {"cards": "name", "card_id": "id"},
            "default": "工资卡",
        }
    }
    criteria: dict[str, Any] = {"cards[id={card_id}].frozen": True}
    expected_changes = ["cards[].frozen"]

    async def _post_sample(self, env: Any) -> None:
        await self._invert_criteria(env)


class UnfreezeCard(CriteriaTask):
    templates = ["解冻{cards}"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L1"
    capabilities = ["select"]
    parameters = {
        "cards": {
            "type": "string",
            "sampler": _sample_frozen_bank_card,
            "fields": {"cards": "name", "card_id": "id"},
            "default": "信用卡",
        }
    }
    criteria: dict[str, Any] = {"cards[id={card_id}].frozen": False}
    expected_changes = ["cards[].frozen"]

    async def _post_sample(self, env: Any) -> None:
        await self._invert_criteria(env)


class DeleteCard(BaseTask):
    templates = ["删除{cards}"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["select"]
    parameters = {
        "cards": {
            "type": "string",
            "sampler": _sample_bank_card,
            "fields": {"cards": "name", "card_id": "id"},
            "default": "储蓄卡",
        }
    }
    expected_changes = ["cards", "defaultCardId"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        wallet = Wallet(input.apps["wallet"])
        card_id = self.params.get("card_id", "")
        return [
            {
                "field": "cards",
                "expected": f"card {card_id} removed",
                "actual": wallet.card_by_id(card_id),
                "passed": wallet.card_by_id(card_id) is None,
            }
        ]


class SortCards(BaseTask):
    templates = ["将{cards}移动到卡片列表第一位"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["select"]
    parameters = {
        "cards": {
            "type": "string",
            "sampler": _sample_non_default_bank_card,
            "fields": {"cards": "name", "card_id": "id"},
            "default": "储蓄卡",
        }
    }
    expected_changes = ["cards"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        wallet = Wallet(input.apps["wallet"])
        card_id = self.params.get("card_id", "")
        cards = wallet.cards
        return [
            {
                "field": "cards[0].id",
                "expected": card_id,
                "actual": cards[0].get("id") if cards else None,
                "passed": bool(cards and cards[0].get("id") == card_id),
            }
        ]


class AddTransitCard(BaseTask):
    templates = ["添加一张{city}的交通卡"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["select"]
    parameters = {
        "city": {
            "type": "enum",
            "values": ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "西安", "重庆", "南京"],
            "default": "上海",
        }
    }
    expected_changes = ["cards"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        wallet = Wallet(input.apps["wallet"])
        card = wallet.transit_card_by_city(self.p.city)
        return [
            {
                "field": "cards",
                "expected": f"transit card for {self.p.city}",
                "actual": card,
                "passed": bool(card),
            }
        ]


class RechargeTransitCard(BaseTask):
    templates = ["为{cards}充值{amount}元"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["input"]
    parameters = {
        "cards": {
            "type": "string",
            "sampler": _sample_transit_card,
            "fields": {"cards": "name", "card_id": "id"},
            "default": "北京一卡通",
        },
        "amount": {"type": "int", "min": 10, "max": 200, "default": 50},
    }
    expected_changes = ["cards[].balance", "transactions"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        wallet = Wallet(input.apps["wallet"])
        card_id = self.params.get("card_id", "")
        init_wallet = Wallet(input.apps_init["wallet"])
        init_card = init_wallet.card_by_id(card_id)
        card = wallet.card_by_id(card_id)
        init_balance = init_card.get("balance", 0) if init_card else 0
        checks = [
            {
                "field": "cards[].balance",
                "expected": init_balance + self.p.amount,
                "actual": card.get("balance") if card else None,
                "passed": bool(card and card.get("balance") == init_balance + self.p.amount),
            }
        ]
        txn = next(
            (t for t in wallet.transactions if t.get("cardId") == card_id and t.get("type") == "recharge"),
            None,
        )
        checks.append(
            {
                "field": "transactions",
                "expected": f"recharge transaction for {card_id}",
                "actual": txn,
                "passed": bool(txn and txn.get("amount") == self.p.amount),
            }
        )
        return checks


class AddMembershipCard(BaseTask):
    templates = ["添加一张{brand}会员卡，会员编号为{member_number}"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["input"]
    parameters = {
        "brand": {
            "type": "enum",
            "values": ["星巴克", "海底捞", "山姆会员", "Costco", "奈雪的茶", "喜茶", "瑞幸咖啡", "盒马鲜生"],
            "default": "星巴克",
        },
        "member_number": {"type": "string", "pattern": r"[A-Z0-9]{8,12}", "default": "SB20240088"},
    }
    expected_changes = ["cards"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        wallet = Wallet(input.apps["wallet"])
        card = next(
            (c for c in wallet.cards_of_type("membership")
             if self.p.brand in str(c.get("issuer") or "")
             and c.get("memberNumber") == self.p.member_number),
            None,
        )
        return [
            {
                "field": "cards",
                "expected": f"membership card {self.p.brand} with {self.p.member_number}",
                "actual": card,
                "passed": bool(card),
            }
        ]


class RedeemReward(BaseTask):
    templates = ["用{cards}的积分兑换{reward_name}"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L3"
    capabilities = ["select"]
    parameters = {
        "cards": {
            "type": "string",
            "sampler": _sample_membership_card,
            "fields": {"cards": "name", "card_id": "id"},
            "default": "海底捞会员",
        },
        "reward_name": {
            "type": "string",
            "sampler": _sample_redeemable_reward,
            "fields": {"reward_name": "name", "reward_id": "id", "membership_card_id": "membershipCardId"},
            "default": "100元代金券",
        },
    }
    expected_changes = ["cards[].points", "redeemedRewards"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        wallet = Wallet(input.apps["wallet"])
        card_id = self.params.get("membership_card_id", self.params.get("card_id", ""))
        card = wallet.card_by_id(card_id)
        init_wallet = Wallet(input.apps_init["wallet"])
        init_card = init_wallet.card_by_id(card_id)
        init_points = init_card.get("points", 0) if init_card else 0
        reward_id = self.params.get("reward_id", "")
        reward = wallet.reward_by_name(self.p.reward_name)
        points_cost = reward.get("pointsCost", 0) if reward else 0
        redeemed = any(r.get("rewardId") == reward_id for r in wallet.redeemed_rewards)
        return [
            {
                "field": "cards[].points",
                "expected": init_points - points_cost,
                "actual": card.get("points") if card else None,
                "passed": bool(card and card.get("points") == init_points - points_cost),
            },
            {
                "field": "redeemedRewards",
                "expected": f"reward {reward_id} redeemed",
                "actual": wallet.redeemed_rewards,
                "passed": redeemed,
            },
        ]


class AddCoupon(BaseTask):
    templates = ["添加一张{merchant}优惠券，券码{code}，面值{value}元"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["input"]
    parameters = {
        "merchant": {
            "type": "enum",
            "values": ["麦当劳", "肯德基", "必胜客", "星巴克", "瑞幸咖啡", "喜茶", "奈雪的茶", "海底捞"],
            "default": "麦当劳",
        },
        "code": {"type": "string", "pattern": r"[A-Z0-9]{6,10}", "default": "NEWCODE1"},
        "value": {"type": "int", "min": 5, "max": 100, "default": 20},
    }
    expected_changes = ["coupons"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        wallet = Wallet(input.apps["wallet"])
        coupon = wallet.coupon_by_code(self.p.code)
        return [
            {
                "field": "coupons",
                "expected": f"coupon {self.p.code} for {self.p.merchant}",
                "actual": coupon,
                "passed": bool(
                    coupon
                    and coupon.get("merchant") == self.p.merchant
                    and coupon.get("value") == self.p.value
                ),
            }
        ]


class RedeemCoupon(BaseTask):
    templates = ["核销券码{coupon_code}的优惠券"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["select"]
    parameters = {
        "coupon_code": {
            "type": "string",
            "sampler": _sample_unredeemed_coupon,
            "fields": {"coupon_code": "code", "coupon_id": "id"},
            "default": "MCD2024A",
        }
    }
    expected_changes = ["coupons[].redeemed"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        wallet = Wallet(input.apps["wallet"])
        coupon_id = self.params.get("coupon_id", "")
        coupon = wallet.coupon_by_code(self.p.coupon_code)
        return [
            {
                "field": "coupons[].redeemed",
                "expected": True,
                "actual": coupon.get("redeemed") if coupon else None,
                "passed": bool(coupon and coupon.get("redeemed") is True),
            }
        ]


class ArchiveExpiredTicket(BaseTask):
    templates = ["将过期的{ticket_title}票券归档"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["select"]
    parameters = {
        "ticket_title": {
            "type": "string",
            "sampler": _sample_expired_ticket,
            "fields": {"ticket_title": "title", "ticket_id": "id"},
            "default": "5元快车券",
        }
    }
    expected_changes = ["tickets", "archivedTickets"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        wallet = Wallet(input.apps["wallet"])
        ticket_id = self.params.get("ticket_id", "")
        return [
            {
                "field": "tickets",
                "expected": f"ticket {ticket_id} removed",
                "actual": wallet.ticket_by_title(self.p.ticket_title),
                "passed": wallet.ticket_by_title(self.p.ticket_title) is None,
            },
            {
                "field": "archivedTickets",
                "expected": f"ticket {ticket_id} archived",
                "actual": wallet.archived_tickets,
                "passed": any(t.get("id") == ticket_id for t in wallet.archived_tickets),
            },
        ]


class SearchMembershipNumber(BaseTask):
    templates = ["搜索{brand}会员卡，打开详情，查看会员编号"]
    apps = ["wallet"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["search", "extract"]
    parameters = {
        "brand": {
            "type": "string",
            "sampler": _sample_membership_card,
            "fields": {"brand": "issuer", "card_id": "id", "member_number": "memberNumber"},
            "default": "星巴克",
        }
    }
    answer_fields = [{"type": "text", "label": "会员编号"}]
    expected_changes = ["searchHistory"]

    def get_answer(self, input: JudgeInput) -> Any:
        return self.params.get("member_number", "")

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        wallet = Wallet(input.apps["wallet"])
        card_id = self.params.get("card_id", "")
        member_number = self.params.get("member_number", "")
        card = wallet.card_by_id(card_id)
        checks = [
            {
                "field": "route",
                "expected": f"/card/{card_id}",
                "actual": input.route.get("path", ""),
                "passed": input.route.get("path", "") == f"/card/{card_id}",
            },
            {
                "field": "searchHistory",
                "expected": self.p.brand,
                "actual": wallet.get("searchHistory", []),
                "passed": wallet.has_search_history(self.p.brand),
            },
            {
                "field": "answer",
                "expected": member_number,
                "actual": input.answer,
                "passed": bool(input.answer and match_value(member_number, input.answer)),
            },
        ]
        return checks
