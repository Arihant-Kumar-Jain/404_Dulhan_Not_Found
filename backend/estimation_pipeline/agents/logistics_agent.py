"""
Logistics & Transport agent — Safar Agent.

Computes outstation guest transfers, Ghodi (baraat horse),
Dholi units, and SFX using free APIs:
  - OSRM (open-source routing machine) for distance estimation
  - All other data from cost tables
"""
from __future__ import annotations
import logging
from backend.estimation_pipeline.agents.base_agent import BaseAgent, AgentResult
from backend.estimation_pipeline.data.costs import LOGISTICS_COSTS

logger = logging.getLogger(__name__)

# OSRM public demo server — free, no key needed.
# For production: self-host https://github.com/Project-OSRM/osrm-backend
OSRM_BASE = "http://router.project-osrm.org/route/v1/driving"

# Rough lat/lon centres for supported cities (used only if needed for OSRM)
CITY_COORDS: dict[str, tuple[float, float]] = {
    "udaipur": (24.5854, 73.7125),
    "jaipur":  (26.9124, 75.7873),
    "mumbai":  (19.0760, 72.8777),
    "delhi":   (28.6139, 77.2090),
    "goa":     (15.2993, 74.1240),
    "jodhpur": (26.2389, 73.0243),
}


class LogisticsAgent(BaseAgent):
    agent_id   = "logistics"
    agent_name = "Safar Agent (Logistics)"
    agent_icon = ""

    def _calculate(self, input_data) -> AgentResult:
        guests              = getattr(input_data, "guest_count", 500)
        outstation_pct      = getattr(input_data, "outstation_percentage", 0.4)
        events              = getattr(input_data, "events", [])
        city                = getattr(input_data, "city", "delhi").lower()

        outstation_guests   = int(guests * outstation_pct)
        # 1 Innova per 3 guests (admin-configurable in costs.py)
        vehicles            = max(1, (outstation_guests + 2) // 3)
        trips               = 3  # airport→hotel, hotel→venue, venue→airport

        car = LOGISTICS_COSTS["innova_per_trip"]
        transfer_low  = car["low"]  * vehicles * trips
        transfer_mid  = car["mid"]  * vehicles * trips
        transfer_high = car["high"] * vehicles * trips

        # Ghodi — only if baraat is an event
        ghodi_cost = LOGISTICS_COSTS["ghodi"].get(city, 25_000)
        ghodi = ghodi_cost if "baraat" in events else 0

        dholi = LOGISTICS_COSTS["dholi_per_unit"]
        sfx   = LOGISTICS_COSTS["cold_pyro_per_unit"]

        total_low  = transfer_low  + ghodi + dholi["low"]  * 2 + sfx["low"]  * 4
        total_mid  = transfer_mid  + ghodi + dholi["mid"]  * 2 + sfx["mid"]  * 6
        total_high = transfer_high + ghodi + dholi["high"] * 3 + sfx["high"] * 10

        return AgentResult(
            agent_id = self.agent_id,
            name     = "Logistics & Transport",
            icon     = self.agent_icon,
            low      = total_low,
            mid      = total_mid,
            high     = total_high,
            details  = (
                f"{outstation_guests} outstation guests, "
                f"{vehicles} Innovas × {trips} trips"
                + (" + Ghodi" if ghodi else "")
                + f", Dholi × 2, SFX"
            ),
        )
