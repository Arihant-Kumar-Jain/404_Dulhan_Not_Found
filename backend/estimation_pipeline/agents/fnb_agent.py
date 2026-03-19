"""
Food & Beverage agent — Dawat Agent.

Calculates per-guest, per-event catering + bar costs.
"""
from __future__ import annotations
from .base_agent import BaseAgent, AgentResult
from ..data.costs import (
    FNB_COSTS, EVENT_MEAL_MAP, BAR_COSTS, BAR_EVENTS,
)


class FnBAgent(BaseAgent):
    agent_id   = "fnb"
    agent_name = "Dawat Agent (F&B)"
    agent_icon = ""

    def _calculate(self, input_data) -> AgentResult:
        guests    = getattr(input_data, "guest_count", 500)
        food_type = getattr(input_data, "food_type", "veg_nonveg")
        bar_type  = getattr(input_data, "bar_type",  "full_bar")
        events    = getattr(input_data, "events", [])

        # veg_nonveg billing → use nonveg rates (higher, more accurate)
        food_key = "nonveg" if food_type in ("nonveg", "veg_nonveg") else "veg"

        total_low = total_mid = total_high = 0.0

        for event in events:
            meal  = EVENT_MEAL_MAP.get(event, "lunch_buffet")
            costs = FNB_COSTS.get(meal, FNB_COSTS["lunch_buffet"])[food_key]
            total_low  += costs["low"]  * guests
            total_mid  += costs["mid"]  * guests
            total_high += costs["high"] * guests

        # Bar — count events that typically have a bar
        bar_event_count = max(len([e for e in events if e in BAR_EVENTS]), 1)
        bar = BAR_COSTS.get(bar_type, BAR_COSTS["full_bar"])
        total_low  += bar["low"]  * guests * bar_event_count
        total_mid  += bar["mid"]  * guests * bar_event_count
        total_high += bar["high"] * guests * bar_event_count

        return AgentResult(
            agent_id = self.agent_id,
            name     = "Food & Beverage",
            icon     = self.agent_icon,
            low      = total_low,
            mid      = total_mid,
            high     = total_high,
            details  = (
                f"{guests} guests × {len(events)} events, "
                f"{food_type.replace('_', ' ')} menu, "
                f"{bar_type.replace('_', ' ')} bar"
            ),
        )
