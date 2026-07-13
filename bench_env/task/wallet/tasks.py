"""Exactly fifteen Wallet benchmark tasks."""

from __future__ import annotations

from typing import Any

from bench_env.task.base import BaseTask
from bench_env.task.judge import JudgeInput
from bench_env.task.wallet.app import (
    WALLET_ARCHIVE_CHANGES,
    WALLET_CARD_FROZEN_CHANGES,
    WALLET_CARD_NAME_CHANGES,
    WALLET_CARDS_CHANGES,
    WALLET_COUPON_CHANGES,
    WALLET_COUPON_REDEEM_CHANGES,
    WALLET_DEFAULT_CHANGES,
    WALLET_RECHARGE_CHANGES,
    WALLET_REWARD_CHANGES,
    WALLET_SEARCH_CHANGES,
    Wallet,
)


class AddBankCard(BaseTask):
    """Verdict: exactly one matching bank card is created without modifying existing cards."""

    templates = ["在卡包中添加一张{bank}银行卡，持卡人是{holder}，后四位为{last4}，昵称设为{nickname}"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["input"]
    parameters = {
        "bank": {"type": "enum", "values": ["中国工商银行", "中国建设银行", "中国农业银行", "中国银行", "招商银行", "交通银行"], "default": "中国工商银行"},
        "holder": {"type": "string", "default": "张伟"},
        "last4": {"type": "string", "pattern": r"\d{4}", "default": "1234"},
        "nickname": {"type": "string", "default": "新工资卡"},
    }
    expected_changes = WALLET_CARDS_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        wallet = Wallet(input.apps["wallet"], init=input.apps_init["wallet"])
        return wallet.check_exactly_one_new_card({"type": "bank", "issuer": self.p.bank, "holder": self.p.holder, "last4": self.p.last4, "name": self.p.nickname})


class SetDefaultCard(BaseTask):
    """Verdict: target ID is the only default bank card."""

    templates = ["把{card_name}设为默认银行卡"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L1"
    capabilities = ["select"]
    parameters = {"card_name": {"type": "string", "sampler": Wallet.sample_non_default_bank_card, "fields": {"card_name": "name", "card_id": "id"}, "default": "储蓄卡"}}
    expected_changes = WALLET_DEFAULT_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        return Wallet(input.apps["wallet"], init=input.apps_init["wallet"]).check_default_card(self.params["card_id"])


class RenameBankCard(BaseTask):
    """Verdict: only the target bank card nickname changes."""

    templates = ["把银行卡{card_name}的昵称改为{new_name}"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["input"]
    parameters = {
        "card_name": {"type": "string", "sampler": Wallet.sample_bank_card, "fields": {"card_name": "name", "card_id": "id"}, "default": "工资卡"},
        "new_name": {"type": "string", "default": "我的银行卡"},
    }
    expected_changes = WALLET_CARD_NAME_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        return Wallet(input.apps["wallet"], init=input.apps_init["wallet"]).check_card_field(self.params["card_id"], "name", self.p.new_name)


class FreezeBankCard(BaseTask):
    """Verdict: target bank card alone becomes frozen."""

    templates = ["冻结银行卡{card_name}"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L1"
    capabilities = ["select"]
    parameters = {"card_name": {"type": "string", "sampler": Wallet.sample_non_default_bank_card, "fields": {"card_name": "name", "card_id": "id"}, "default": "储蓄卡"}}
    expected_changes = WALLET_CARD_FROZEN_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        return Wallet(input.apps["wallet"], init=input.apps_init["wallet"]).check_card_field(self.params["card_id"], "frozen", True)


class UnfreezeBankCard(BaseTask):
    """Verdict: target frozen bank card alone becomes active."""

    templates = ["解冻银行卡{card_name}"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L1"
    capabilities = ["select"]
    parameters = {"card_name": {"type": "string", "sampler": Wallet.sample_frozen_bank_card, "fields": {"card_name": "name", "card_id": "id"}, "default": "信用卡"}}
    expected_changes = WALLET_CARD_FROZEN_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        return Wallet(input.apps["wallet"], init=input.apps_init["wallet"]).check_card_field(self.params["card_id"], "frozen", False)


class DeleteBankCard(BaseTask):
    """Verdict: only target ID is deleted and default invariants remain valid."""

    templates = ["从卡包删除银行卡{card_name}"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["select"]
    parameters = {"card_name": {"type": "string", "sampler": Wallet.sample_bank_card, "fields": {"card_name": "name", "card_id": "id"}, "default": "储蓄卡"}}
    expected_changes = WALLET_CARDS_CHANGES + ["defaultCardId"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        return Wallet(input.apps["wallet"], init=input.apps_init["wallet"]).check_deleted_card(self.params["card_id"])


class ReorderBankCards(BaseTask):
    """Verdict: target stable ID moves to the first persisted card position."""

    templates = ["把银行卡{card_name}移动到卡片列表最上方"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["select"]
    parameters = {"card_name": {"type": "string", "sampler": Wallet.sample_non_default_bank_card, "fields": {"card_name": "name", "card_id": "id"}, "default": "储蓄卡"}}
    expected_changes = WALLET_CARDS_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        return Wallet(input.apps["wallet"], init=input.apps_init["wallet"]).check_reordered_first(self.params["card_id"])


class AddTransitCard(BaseTask):
    """Verdict: exactly one transit card for the requested city is created."""

    templates = ["在卡包中添加一张{city}交通卡"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["select"]
    parameters = {"city": {"type": "enum", "values": ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "西安", "重庆", "南京"], "default": "上海"}}
    expected_changes = WALLET_CARDS_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        return Wallet(input.apps["wallet"], init=input.apps_init["wallet"]).check_exactly_one_new_card({"type": "transit", "city": self.p.city})


class RechargeTransitCard(BaseTask):
    """Verdict: target balance and one matching recharge record change, other transit cards do not."""

    templates = ["给交通卡{card_name}充值{amount}元"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["input"]
    parameters = {
        "card_name": {"type": "string", "sampler": Wallet.sample_transit_card, "fields": {"card_name": "name", "card_id": "id"}, "default": "北京一卡通"},
        "amount": {"type": "enum", "values": [50, 100], "default": 50},
    }
    expected_changes = WALLET_RECHARGE_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        return Wallet(input.apps["wallet"], init=input.apps_init["wallet"]).check_recharge(self.params["card_id"], self.p.amount)


class AddMembershipCard(BaseTask):
    """Verdict: exactly one requested membership card is created."""

    templates = ["添加一张{brand}会员卡，会员编号填写{member_number}"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["input"]
    parameters = {
        "brand": {"type": "enum", "values": ["星巴克", "海底捞", "山姆会员", "Costco", "奈雪的茶", "喜茶", "瑞幸咖啡", "盒马鲜生"], "default": "星巴克"},
        "member_number": {"type": "string", "pattern": r"[A-Z0-9]{8,12}", "default": "SB20240088"},
    }
    expected_changes = WALLET_CARDS_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        return Wallet(input.apps["wallet"], init=input.apps_init["wallet"]).check_exactly_one_new_card({"type": "membership", "issuer": self.p.brand, "memberNumber": self.p.member_number})


class RedeemReward(BaseTask):
    """Verdict: target reward is redeemed once and points remain nonnegative."""

    templates = ["使用{card_name}的积分兑换{reward_name}"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["select"]
    parameters = {"reward_name": {"type": "string", "sampler": Wallet.sample_reward, "fields": {"reward_name": "name", "reward_id": "id", "card_id": "membershipCardId", "card_name": "cardName"}, "default": "100元代金券"}, "card_name": {"type": "string", "default": "海底捞会员"}}
    expected_changes = WALLET_REWARD_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        return Wallet(input.apps["wallet"], init=input.apps_init["wallet"]).check_reward_redemption(self.params["card_id"], self.params["reward_id"])


class AddCoupon(BaseTask):
    """Verdict: exactly one matching unredeemed coupon is created."""

    templates = ["添加一张{merchant}优惠券，券码为{code}，面值{value}元"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["input"]
    parameters = {
        "merchant": {"type": "enum", "values": ["麦当劳", "肯德基", "必胜客", "星巴克", "瑞幸咖啡", "喜茶", "奈雪的茶", "海底捞"], "default": "麦当劳"},
        "code": {"type": "string", "pattern": r"[A-Z0-9]{6,10}", "default": "NEWCODE1"},
        "value": {"type": "int", "min": 5, "max": 100, "default": 20},
    }
    expected_changes = WALLET_COUPON_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        return Wallet(input.apps["wallet"], init=input.apps_init["wallet"]).check_exactly_one_new_coupon(self.p.merchant, self.p.code, self.p.value)


class RedeemCoupon(BaseTask):
    """Verdict: target coupon ID alone becomes redeemed with a timestamp."""

    templates = ["核销券码为{coupon_code}的优惠券"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["select"]
    parameters = {"coupon_code": {"type": "string", "sampler": Wallet.sample_unredeemed_coupon, "fields": {"coupon_code": "code", "coupon_id": "id"}, "default": "MCD2024A"}}
    expected_changes = WALLET_COUPON_REDEEM_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        return Wallet(input.apps["wallet"], init=input.apps_init["wallet"]).check_redeemed_coupon(self.params["coupon_id"])


class ArchiveExpiredTicket(BaseTask):
    """Verdict: target ticket ID moves exactly once from expired to archived."""

    templates = ["把过期票券{ticket_title}归档"]
    apps = ["wallet"]
    scope = "S1"
    objective = "operate"
    composition = "atomic"
    difficulty = "L2"
    capabilities = ["select"]
    parameters = {"ticket_title": {"type": "string", "sampler": Wallet.sample_expired_ticket, "fields": {"ticket_title": "title", "ticket_id": "id"}, "default": "5元快车券"}}
    expected_changes = WALLET_ARCHIVE_CHANGES

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        return Wallet(input.apps["wallet"], init=input.apps_init["wallet"]).check_archived_ticket(self.params["ticket_id"])


class SearchMembershipNumber(BaseTask):
    """Verdict: search trace identifies the exact membership ID and AnswerSheet submits its number."""

    templates = ["在卡包里搜索{brand}会员卡，打开正确的会员详情，并把会员编号填写到答案表"]
    apps = ["wallet"]
    scope = "S1"
    objective = "query"
    composition = "sequential"
    difficulty = "L3"
    capabilities = ["search", "extract"]
    parameters = {"brand": {"type": "string", "sampler": Wallet.sample_membership_card, "fields": {"brand": "issuer", "card_id": "id", "member_number": "memberNumber"}, "default": "星巴克"}}
    answer_fields = [{"type": "text", "label": "会员编号", "hint": "例如 SB20240001"}]
    expected_changes = WALLET_SEARCH_CHANGES

    def get_answer(self, input: JudgeInput) -> str:
        card = Wallet(input.apps_init["wallet"]).card_by_id(self.params["card_id"])
        if card is None:
            raise ValueError(f"Membership card {self.params['card_id']!r} missing")
        return card["memberNumber"]

    def check_goals(self, input: JudgeInput) -> list[dict[str, Any]]:
        wallet = Wallet(input.apps["wallet"], init=input.apps_init["wallet"])
        card_id = self.params["card_id"]
        expected_route = f"/membership-cards/{card_id}"
        checks = wallet.check_search_trace(self.p.brand, card_id, expected_route)
        checks.append({"field": "route", "expected": expected_route, "actual": input.route["path"], "passed": input.route["path"] == expected_route})
        checks.extend(wallet.check_answer_sheet(self.get_answer(input), input))
        return checks
