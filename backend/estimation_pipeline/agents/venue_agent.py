"""
Venue & Accommodation agent — Mahal Agent.

Uses VENUE_COSTS table: per-room-per-night × rooms × nights.
"""
from __future__ import annotations
from .base_agent import BaseAgent, AgentResult
from ..data.costs import (
    VENUE_COSTS, VENUE_FALLBACK_CITY, VENUE_FALLBACK_TIER,
)


class VenueAgent(BaseAgent):
    agent_id   = "venue"
    agent_name = "Mahal Agent (Venue)"
    agent_icon = ""

    def _calculate(self, input_data) -> AgentResult:
        city  = getattr(input_data, "city", "").lower() or VENUE_FALLBACK_CITY
        tier  = getattr(input_data, "hotel_tier", VENUE_FALLBACK_TIER)
        rooms = getattr(input_data, "room_count", 50)
        events = getattr(input_data, "events", [])

        # Number of nights = events - 1, minimum 2
        nights = max(len(events) - 1, 2)

        costs = VENUE_COSTS.get(city, VENUE_COSTS[VENUE_FALLBACK_CITY])
        rate  = costs.get(tier, costs[VENUE_FALLBACK_TIER])

        return AgentResult(
            agent_id = self.agent_id,
            name     = "Venue & Accommodation",
            icon     = self.agent_icon,
            low      = rate["low"]  * rooms * nights,
            mid      = rate["mid"]  * rooms * nights,
            high     = rate["high"] * rooms * nights,
            details  = (
                f"{rooms} rooms × {nights} nights @ {city.title()} "
                f"{tier.replace('_', ' ').title()}"
            ),
        )
