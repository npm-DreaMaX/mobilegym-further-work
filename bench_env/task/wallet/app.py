"""Wallet app state accessor."""

from __future__ import annotations

from typing import Any

from bench_env.task.base import BaseApp


class Wallet(BaseApp):
    """Wallet state accessor."""

    @property
    def cards(self) -> list[dict[str, Any]]:
        return self.get("cards", [])

    @property
    def coupons(self) -> list[dict[str, Any]]:
        return self.get("coupons", [])

    @property
    def tickets(self) -> list[dict[str, Any]]:
        return self.get("tickets", [])

    @property
    def archived_tickets(self) -> list[dict[str, Any]]:
        return self.get("archivedTickets", [])

    @property
    def rewards(self) -> list[dict[str, Any]]:
        return self.get("rewards", [])

    @property
    def redeemed_rewards(self) -> list[dict[str, Any]]:
        return self.get("redeemedRewards", [])

    @property
    def transactions(self) -> list[dict[str, Any]]:
        return self.get("transactions", [])

    @property
    def default_card_id(self) -> str | None:
        return self.get("defaultCardId")

    def card_by_id(self, card_id: str) -> dict[str, Any] | None:
        for card in self.cards:
            if card.get("id") == card_id:
                return card
        return None

    def card_by_name(self, name: str) -> dict[str, Any] | None:
        for card in self.cards:
            if str(card.get("name") or "").strip() == name.strip():
                return card
        return None

    def cards_of_type(self, card_type: str) -> list[dict[str, Any]]:
        return [c for c in self.cards if c.get("type") == card_type]

    def bank_card_by_issuer_and_last4(self, issuer: str, last4: str) -> dict[str, Any] | None:
        for card in self.cards:
            if (
                card.get("type") == "bank"
                and str(card.get("issuer") or "").strip() == issuer.strip()
                and str(card.get("last4") or "").strip() == last4.strip()
            ):
                return card
        return None

    def membership_card_by_brand(self, brand: str) -> dict[str, Any] | None:
        for card in self.cards:
            if card.get("type") == "membership" and brand in str(card.get("issuer") or ""):
                return card
        return None

    def transit_card_by_city(self, city: str) -> dict[str, Any] | None:
        for card in self.cards:
            if card.get("type") == "transit" and str(card.get("city") or "").strip() == city.strip():
                return card
        return None

    def coupon_by_code(self, code: str) -> dict[str, Any] | None:
        for coupon in self.coupons:
            if str(coupon.get("code") or "").strip() == code.strip():
                return coupon
        return None

    def ticket_by_title(self, title: str) -> dict[str, Any] | None:
        for ticket in self.tickets:
            if str(ticket.get("title") or "").strip() == title.strip():
                return ticket
        return None

    def reward_by_name(self, name: str) -> dict[str, Any] | None:
        for reward in self.rewards:
            if str(reward.get("name") or "").strip() == name.strip():
                return reward
        return None

    def is_first_card(self, card_id: str) -> bool:
        cards = self.cards
        return bool(cards and cards[0].get("id") == card_id)

    def has_search_history(self, query: str) -> bool:
        history = self.get("searchHistory", [])
        return any(str(q or "").strip() == query.strip() for q in history)
