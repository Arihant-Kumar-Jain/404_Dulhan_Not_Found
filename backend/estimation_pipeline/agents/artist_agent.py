"""
Artist & Entertainment agent — Sangeet Agent.

Maps entertainment tier → set of acts → summed low/mid/high costs.
"""
from __future__ import annotations
from backend.estimation_pipeline.agents.base_agent import BaseAgent, AgentResult
from backend.estimation_pipeline.data.costs import ARTIST_COSTS, ENTERTAINMENT_TIER_MAP


class ArtistAgent(BaseAgent):
    agent_id   = "artist"
    agent_name = "Sangeet Agent (Artists)"
    agent_icon = ""

    def _calculate(self, input_data) -> AgentResult:
        tier = getattr(input_data, "entertainment_tier", "premium")
        acts = ENTERTAINMENT_TIER_MAP.get(tier, ENTERTAINMENT_TIER_MAP["premium"])

        total_low = total_mid = total_high = 0.0
        for act in acts:
            cost = ARTIST_COSTS.get(act, ARTIST_COSTS["local_dj"])
            total_low  += cost["low"]
            total_mid  += cost["mid"]
            total_high += cost["high"]

        acts_display = ", ".join(a.replace("_", " ").title() for a in acts)

        return AgentResult(
            agent_id = self.agent_id,
            name     = "Artist & Entertainment",
            icon     = self.agent_icon,
            low      = total_low,
            mid      = total_mid,
            high     = total_high,
            details  = f"{tier.title()} tier: {acts_display}",
        )
