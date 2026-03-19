"""
Sundries & Basics agent — Shagun Agent.

Covers room baskets, ritual materials, gift hampers,
stationery, and a configurable contingency buffer.
"""
from __future__ import annotations
from .base_agent import BaseAgent, AgentResult
from ..data.costs import SUNDRIES, ENTERTAINMENT_TO_SUNDRY_TIER


class SundriesAgent(BaseAgent):
    agent_id   = "sundries"
    agent_name = "Shagun Agent (Sundries)"
    agent_icon = ""

    def _calculate(self, input_data) -> AgentResult:
        rooms  = getattr(input_data, "room_count",  50)
        guests = getattr(input_data, "guest_count", 500)
        events = getattr(input_data, "events",      [])
        tier_key = ENTERTAINMENT_TO_SUNDRY_TIER.get(
            getattr(input_data, "entertainment_tier", "premium"), "premium"
        )

        baskets    = SUNDRIES["room_basket"][tier_key] * rooms
        rituals    = sum(SUNDRIES["ritual_materials"].get(e, 0) for e in events)
        gifts      = SUNDRIES["gift_hampers"][tier_key] * guests
        stationery = SUNDRIES["stationery_per_guest"][tier_key] * guests
        subtotal   = baskets + rituals + gifts + stationery

        return AgentResult(
            agent_id = self.agent_id,
            name     = "Sundries & Basics",
            icon     = self.agent_icon,
            low      = int(subtotal * 0.70),
            mid      = int(subtotal),
            high     = int(subtotal * 1.40),
            details  = (
                f"Room baskets ({rooms}), rituals, gifts & stationery "
                f"for {guests} guests [{tier_key} tier]"
            ),
        )
