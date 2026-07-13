"""Wallet state accessors and precise benchmark checks."""

from __future__ import annotations

from typing import Any

from bench_env.task.base import BaseApp
from bench_env.task.common_tasks import match_value


WALLET_CARDS_CHANGES = ["cards"]
WALLET_DEFAULT_CHANGES = ["defaultCardId", "cards[].isDefault"]
WALLET_CARD_NAME_CHANGES = ["cards[].name"]
WALLET_CARD_FROZEN_CHANGES = ["cards[].frozen"]
WALLET_RECHARGE_CHANGES = ["cards[].balance", "transactions"]
WALLET_REWARD_CHANGES = ["cards[].points", "redeemedRewards", "transactions"]
WALLET_COUPON_CHANGES = ["coupons"]
WALLET_COUPON_REDEEM_CHANGES = ["coupons[].redeemed", "coupons[].redeemedAt"]
WALLET_ARCHIVE_CHANGES = ["tickets", "archivedTickets"]
WALLET_SEARCH_CHANGES = ["searchHistory"]


class Wallet(BaseApp):
    """Typed read model for Wallet's persisted entities and action traces."""

    @staticmethod
    def _from_env(env_state: dict[str, Any]) -> "Wallet":
        return Wallet(env_state["apps"]["wallet"])

    @staticmethod
    def sample_bank_card(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        cards = Wallet._from_env(env_state).cards_of_type("bank")
        if not cards:
            raise ValueError("Wallet has no bank card")
        return rng.choice(cards)

    @staticmethod
    def sample_non_default_bank_card(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        cards = [card for card in Wallet._from_env(env_state).cards_of_type("bank") if not card["isDefault"]]
        if not cards:
            raise ValueError("Wallet has no non-default bank card")
        return rng.choice(cards)

    @staticmethod
    def sample_frozen_bank_card(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        cards = [card for card in Wallet._from_env(env_state).cards_of_type("bank") if card["frozen"]]
        if not cards:
            raise ValueError("Wallet has no frozen bank card")
        return rng.choice(cards)

    @staticmethod
    def sample_transit_card(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        cards = Wallet._from_env(env_state).cards_of_type("transit")
        if not cards:
            raise ValueError("Wallet has no transit card")
        return rng.choice(cards)

    @staticmethod
    def sample_membership_card(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        cards = Wallet._from_env(env_state).cards_of_type("membership")
        if not cards:
            raise ValueError("Wallet has no membership card")
        return rng.choice(cards)

    @staticmethod
    def sample_unredeemed_coupon(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        coupons = [coupon for coupon in Wallet._from_env(env_state).coupons if not coupon["redeemed"]]
        if not coupons:
            raise ValueError("Wallet has no unredeemed coupon")
        return rng.choice(coupons)

    @staticmethod
    def sample_expired_ticket(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        tickets = Wallet._from_env(env_state).tickets
        if not tickets:
            raise ValueError("Wallet has no expired ticket")
        return rng.choice(tickets)

    @staticmethod
    def sample_reward(env_state: dict[str, Any], rng: Any) -> dict[str, Any]:
        wallet = Wallet._from_env(env_state)
        eligible = []
        for reward in wallet.rewards:
            card = wallet.card_by_id(reward["membershipCardId"])
            if card and card["points"] >= reward["pointsCost"] and not any(item["rewardId"] == reward["id"] for item in wallet.redeemed_rewards):
                eligible.append({**reward, "cardName": card["name"]})
        if not eligible:
            raise ValueError("Wallet has no redeemable reward")
        return rng.choice(eligible)

    @property
    def cards(self) -> list[dict[str, Any]]:
        return self._state["cards"]

    @property
    def coupons(self) -> list[dict[str, Any]]:
        return self._state["coupons"]

    @property
    def tickets(self) -> list[dict[str, Any]]:
        return self._state["tickets"]

    @property
    def archived_tickets(self) -> list[dict[str, Any]]:
        return self._state["archivedTickets"]

    @property
    def rewards(self) -> list[dict[str, Any]]:
        return self._state["rewards"]

    @property
    def redeemed_rewards(self) -> list[dict[str, Any]]:
        return self._state["redeemedRewards"]

    @property
    def transactions(self) -> list[dict[str, Any]]:
        return self._state["transactions"]

    @property
    def default_card_id(self) -> str | None:
        return self._state["defaultCardId"]

    def card_by_id(self, card_id: str) -> dict[str, Any] | None:
        return next((card for card in self.cards if card["id"] == card_id), None)

    def card_by_name(self, name: str) -> dict[str, Any] | None:
        wanted = name.strip()
        return next((card for card in self.cards if card["name"].strip() == wanted), None)

    def cards_of_type(self, card_type: str) -> list[dict[str, Any]]:
        return [card for card in self.cards if card["type"] == card_type]

    def bank_card_by_issuer_and_last4(self, issuer: str, last4: str) -> dict[str, Any] | None:
        return next((card for card in self.cards if card["type"] == "bank" and card["issuer"].strip() == issuer.strip() and card["last4"].strip() == last4.strip()), None)

    def membership_card_by_brand(self, brand: str) -> dict[str, Any] | None:
        return next((card for card in self.cards if card["type"] == "membership" and brand in card["issuer"]), None)

    def transit_card_by_city(self, city: str) -> dict[str, Any] | None:
        return next((card for card in self.cards if card["type"] == "transit" and card["city"].strip() == city.strip()), None)

    def coupon_by_id(self, coupon_id: str) -> dict[str, Any] | None:
        return next((coupon for coupon in self.coupons if coupon["id"] == coupon_id), None)

    def coupon_by_code(self, code: str) -> dict[str, Any] | None:
        return next((coupon for coupon in self.coupons if coupon["code"].strip() == code.strip()), None)

    def ticket_by_id(self, ticket_id: str) -> dict[str, Any] | None:
        return next((ticket for ticket in self.tickets if ticket["id"] == ticket_id), None)

    def reward_by_id(self, reward_id: str) -> dict[str, Any] | None:
        return next((reward for reward in self.rewards if reward["id"] == reward_id), None)

    def new_cards(self) -> list[dict[str, Any]]:
        initial_ids = {card["id"] for card in self.init.cards}
        return [card for card in self.cards if card["id"] not in initial_ids]

    def new_coupons(self) -> list[dict[str, Any]]:
        initial_ids = {coupon["id"] for coupon in self.init.coupons}
        return [coupon for coupon in self.coupons if coupon["id"] not in initial_ids]

    def new_transactions(self) -> list[dict[str, Any]]:
        initial_ids = {transaction["id"] for transaction in self.init.transactions}
        return [transaction for transaction in self.transactions if transaction["id"] not in initial_ids]

    def new_redeemed_rewards(self) -> list[dict[str, Any]]:
        initial_ids = {record["id"] for record in self.init.redeemed_rewards}
        return [record for record in self.redeemed_rewards if record["id"] not in initial_ids]

    def unchanged_cards_except(self, target_id: str, allowed_fields: set[str]) -> bool:
        initial = {card["id"]: card for card in self.init.cards}
        current = {card["id"]: card for card in self.cards}
        if set(initial) != set(current):
            return False
        for card_id, before in initial.items():
            after = current[card_id]
            if card_id != target_id and after != before:
                return False
            if card_id == target_id:
                keys = set(before) | set(after)
                if any(before.get(key) != after.get(key) for key in keys - allowed_fields):
                    return False
        return True

    def check_exactly_one_new_card(self, expected: dict[str, Any]) -> list[dict[str, Any]]:
        new_cards = self.new_cards()
        card = new_cards[0] if len(new_cards) == 1 else None
        fields_match = card is not None and all(card.get(key) == value for key, value in expected.items())
        stable_id = card is not None and isinstance(card["id"], str) and card["id"].startswith(f"card-{expected['type']}-")
        existing_unchanged = all(self.card_by_id(card["id"]) == card for card in self.init.cards)
        return [
            {"field": "cards.new", "expected": expected, "actual": card, "passed": fields_match},
            {"field": "cards.new.id", "expected": f"stable card-{expected['type']}-NNN", "actual": card["id"] if card else None, "passed": stable_id},
            {"field": "cards.existing", "expected": "unchanged", "actual": existing_unchanged, "passed": existing_unchanged},
        ]

    def check_default_card(self, card_id: str) -> list[dict[str, Any]]:
        defaults = [card["id"] for card in self.cards if card["type"] == "bank" and card["isDefault"]]
        initial = {card["id"]: card for card in self.init.cards}
        fields_unchanged = set(initial) == {card["id"] for card in self.cards} and all(
            all(initial[card["id"]].get(key) == value for key, value in card.items() if key != "isDefault")
            for card in self.cards
        )
        return [
            {"field": "defaultCardId", "expected": card_id, "actual": self.default_card_id, "passed": self.default_card_id == card_id},
            {"field": "cards[].isDefault", "expected": [card_id], "actual": defaults, "passed": defaults == [card_id]},
            {"field": "cards.nonDefaultFields", "expected": "unchanged", "actual": fields_unchanged, "passed": fields_unchanged},
        ]

    def check_card_field(self, card_id: str, field: str, expected: Any) -> list[dict[str, Any]]:
        card = self.card_by_id(card_id)
        unchanged = self.unchanged_cards_except(card_id, {field})
        return [
            {"field": f"cards[id={card_id}].{field}", "expected": expected, "actual": card[field] if card else None, "passed": card is not None and card[field] == expected},
            {"field": "cards.otherFields", "expected": "unchanged", "actual": unchanged, "passed": unchanged},
        ]

    def check_recharge(self, card_id: str, amount: int) -> list[dict[str, Any]]:
        before = self.init.card_by_id(card_id)
        after = self.card_by_id(card_id)
        new_transactions = self.new_transactions()
        transaction = new_transactions[0] if len(new_transactions) == 1 else None
        other_transit_unchanged = all(self.card_by_id(card["id"]) == card for card in self.init.cards_of_type("transit") if card["id"] != card_id)
        return [
            {"field": "cards[].balance", "expected": before["balance"] + amount if before else None, "actual": after["balance"] if after else None, "passed": before is not None and after is not None and after["balance"] == before["balance"] + amount},
            {"field": "transactions.new", "expected": {"cardId": card_id, "type": "recharge", "amount": amount}, "actual": transaction, "passed": transaction is not None and transaction["cardId"] == card_id and transaction["type"] == "recharge" and transaction["amount"] == amount},
            {"field": "cards.otherTransit", "expected": "unchanged", "actual": other_transit_unchanged, "passed": other_transit_unchanged},
        ]

    def check_reward_redemption(self, card_id: str, reward_id: str) -> list[dict[str, Any]]:
        reward = self.init.reward_by_id(reward_id)
        before = self.init.card_by_id(card_id)
        after = self.card_by_id(card_id)
        records = self.new_redeemed_rewards()
        record = records[0] if len(records) == 1 else None
        return [
            {"field": "cards[].points", "expected": before["points"] - reward["pointsCost"] if before and reward else None, "actual": after["points"] if after else None, "passed": before is not None and after is not None and reward is not None and after["points"] == before["points"] - reward["pointsCost"] and after["points"] >= 0},
            {"field": "redeemedRewards.new", "expected": {"rewardId": reward_id, "membershipCardId": card_id}, "actual": record, "passed": record is not None and record["rewardId"] == reward_id and record["membershipCardId"] == card_id},
            {"field": "redeemedRewards.unique", "expected": 1, "actual": sum(1 for item in self.redeemed_rewards if item["rewardId"] == reward_id and item["membershipCardId"] == card_id), "passed": sum(1 for item in self.redeemed_rewards if item["rewardId"] == reward_id and item["membershipCardId"] == card_id) == 1},
        ]

    def check_deleted_card(self, card_id: str) -> list[dict[str, Any]]:
        initial_ids = [card["id"] for card in self.init.cards]
        current_ids = [card["id"] for card in self.cards]
        expected_ids = [item_id for item_id in initial_ids if item_id != card_id]
        remaining_match = set(current_ids) == set(expected_ids) and len(current_ids) == len(expected_ids)
        target = self.init.card_by_id(card_id)
        expected_default = self.init.default_card_id
        if target and target["isDefault"]:
            expected_default = next((card["id"] for card in self.cards if card["type"] == "bank"), None)
        defaults = [card["id"] for card in self.cards if card["type"] == "bank" and card["isDefault"]]
        return [
            {"field": "cards.removed", "expected": card_id, "actual": current_ids, "passed": card_id not in current_ids and remaining_match},
            {"field": "defaultCardId", "expected": expected_default, "actual": self.default_card_id, "passed": self.default_card_id == expected_default},
            {"field": "cards[].isDefault", "expected": [expected_default] if expected_default else [], "actual": defaults, "passed": defaults == ([expected_default] if expected_default else [])},
        ]

    def check_reordered_first(self, card_id: str) -> list[dict[str, Any]]:
        initial_by_id = {card["id"]: card for card in self.init.cards}
        same_entities = set(initial_by_id) == {card["id"] for card in self.cards}
        fields_unchanged = same_entities and all(
            all(initial_by_id[card["id"]].get(key) == value for key, value in card.items() if key != "sortOrder")
            for card in self.cards
        )
        ordered = [card["id"] for card in sorted(self.cards, key=lambda item: item["sortOrder"])]
        return [
            {"field": "cards.order[0]", "expected": card_id, "actual": ordered[0] if ordered else None, "passed": bool(ordered and ordered[0] == card_id)},
            {"field": "cards.entities", "expected": "same IDs and fields", "actual": fields_unchanged, "passed": fields_unchanged},
        ]

    def check_exactly_one_new_coupon(self, merchant: str, code: str, value: int) -> list[dict[str, Any]]:
        new = self.new_coupons()
        coupon = new[0] if len(new) == 1 else None
        matched = coupon is not None and coupon["merchant"] == merchant and coupon["code"] == code and coupon["value"] == value and coupon["redeemed"] is False
        existing_unchanged = all(self.coupon_by_id(item["id"]) == item for item in self.init.coupons)
        return [
            {"field": "coupons.new", "expected": {"merchant": merchant, "code": code, "value": value}, "actual": coupon, "passed": matched},
            {"field": "coupons.existing", "expected": "unchanged", "actual": existing_unchanged, "passed": existing_unchanged},
        ]

    def check_redeemed_coupon(self, coupon_id: str) -> list[dict[str, Any]]:
        coupon = self.coupon_by_id(coupon_id)
        unchanged = all(self.coupon_by_id(item["id"]) == item for item in self.init.coupons if item["id"] != coupon_id)
        return [
            {"field": "coupons[].redeemed", "expected": True, "actual": coupon["redeemed"] if coupon else None, "passed": coupon is not None and coupon["redeemed"] is True and coupon.get("redeemedAt") is not None},
            {"field": "coupons.other", "expected": "unchanged", "actual": unchanged, "passed": unchanged},
        ]

    def check_archived_ticket(self, ticket_id: str) -> list[dict[str, Any]]:
        archived = [ticket for ticket in self.archived_tickets if ticket["id"] == ticket_id]
        initial_other = [ticket for ticket in self.init.tickets if ticket["id"] != ticket_id]
        remaining_unchanged = self.tickets == initial_other
        return [
            {"field": "tickets.removed", "expected": ticket_id, "actual": [ticket["id"] for ticket in self.tickets], "passed": self.ticket_by_id(ticket_id) is None and remaining_unchanged},
            {"field": "archivedTickets.added", "expected": ticket_id, "actual": archived, "passed": len(archived) == 1 and archived[0]["archived"] is True},
        ]

    def check_search_trace(self, query: str, card_id: str, route: str) -> list[dict[str, Any]]:
        temp = self._state["_temp"]
        return [
            {"field": "searchHistory", "expected": query, "actual": self._state["searchHistory"], "passed": query in self._state["searchHistory"]},
            {"field": "_temp.searchQuery", "expected": query, "actual": temp["searchQuery"], "passed": temp["searchQuery"] == query},
            {"field": "_temp.lastViewedCardId", "expected": card_id, "actual": temp["lastViewedCardId"], "passed": temp["lastViewedCardId"] == card_id},
            {"field": "_temp.lastViewedRoute", "expected": route, "actual": temp["lastViewedRoute"], "passed": temp["lastViewedRoute"] == route},
        ]

    def check_answer_sheet(self, expected: str, input: Any) -> list[dict[str, Any]]:
        sheet = input.apps["answer_sheet"]
        actual = sheet["answers"].get("0")
        return [
            {"field": "answer_sheet.会员编号", "expected": expected, "actual": actual, "passed": actual not in (None, "") and match_value(expected, str(actual))},
            {"field": "answer_sheet.submitted", "expected": True, "actual": sheet["submitted"], "passed": sheet["submitted"] is True},
        ]
