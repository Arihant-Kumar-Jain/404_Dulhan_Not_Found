"""
Orchestrator — runs all 7 agents and aggregates their results.

Usage:
    from estimation_pipeline import Orchestrator
    from estimation_pipeline.orchestrator import RunConfig

    orch = Orchestrator(ws_send=send_fn)
    result = await orch.run(wedding_input)
"""
from __future__ import annotations

import asyncio
import uuid
from datetime import datetime, timezone
from typing import Any, Callable, Coroutine, Optional

from .agents.base_agent   import WSSendFn, AgentResult
from .agents.venue_agent   import VenueAgent
from .agents.fnb_agent     import FnBAgent
from .agents.decor_agent   import DecorAgent
from .agents.artist_agent  import ArtistAgent
from .agents.logistics_agent import LogisticsAgent
from .agents.sundries_agent  import SundriesAgent
from .agents.vendor_search_agent import VendorSearchAgent
from .data.costs import SUNDRIES


class OrchestratorResult:
    """Full pipeline result returned to callers / serialized to JSON."""

    def __init__(
        self,
        session_id: str,
        agent_results: list[AgentResult],
        confidence: float,
    ) -> None:
        self.session_id = session_id
        self.created_at = datetime.now(tz=timezone.utc).isoformat()

        # Separate cost agents from vendor-search (vendor has no cost)
        cost_agents = [r for r in agent_results if r.get("agent_id") != "vendor_search"]
        self.vendor_result = next(
            (r for r in agent_results if r.get("agent_id") == "vendor_search"), None
        )

        contingency = 1 + SUNDRIES["contingency_percent"] / 100

        self.total_low  = int(sum(r["low"]  for r in cost_agents) * contingency)
        self.total_mid  = int(sum(r["mid"]  for r in cost_agents) * contingency)
        self.total_high = int(sum(r["high"] for r in cost_agents) * contingency)

        self.confidence = confidence
        self.breakdown  = {r["name"]: dict(r) for r in cost_agents}

    def to_dict(self) -> dict:
        return {
            "session_id"   : self.session_id,
            "created_at"   : self.created_at,
            "total_low"    : self.total_low,
            "total_mid"    : self.total_mid,
            "total_high"   : self.total_high,
            "confidence"   : self.confidence,
            "breakdown"    : self.breakdown,
            "vendors"      : self.vendor_result.get("vendors", {}) if self.vendor_result else {},
        }


class Orchestrator:
    """
    Runs all 7 estimation agents, emitting WebSocket progress messages.

    Args:
        ws_send: Optional async callback for real-time frontend updates.
        include_vendor_search: Set False to skip the (slower) vendor HTTP calls.
    """

    def __init__(
        self,
        ws_send: Optional[WSSendFn] = None,
        include_vendor_search: bool = True,
    ) -> None:
        self._ws_send = ws_send
        self._include_vendors = include_vendor_search

    async def _emit(self, payload: dict) -> None:
        if self._ws_send:
            await self._ws_send(payload)

    def _build_agents(self) -> list:
        common = dict(ws_send=self._ws_send)
        agents = [
            VenueAgent(**common),
            FnBAgent(**common),
            DecorAgent(**common),
            ArtistAgent(**common),
            LogisticsAgent(**common),
            SundriesAgent(**common),
        ]
        if self._include_vendors:
            agents.append(VendorSearchAgent(**common))
        return agents

    def _compute_confidence(self, input_data: Any) -> float:
        """Confidence score 0–1 based on how much info the user provided."""
        score = 0.70
        if getattr(input_data, "bride_city", None):
            score += 0.04
        if getattr(input_data, "groom_city", None):
            score += 0.04
        if getattr(input_data, "decor_complexity", None):
            score += 0.05
        if len(getattr(input_data, "events", [])) >= 4:
            score += 0.05
        if getattr(input_data, "outstation_percentage", 0) > 0:
            score += 0.02
        return min(score, 0.95)

    async def run(self, input_data: Any) -> OrchestratorResult:
        session_id = str(uuid.uuid4())
        agents = self._build_agents()
        cost_count = len(agents) - (1 if self._include_vendors else 0)

        await self._emit({
            "type"        : "session_start",
            "session_id"  : session_id,
            "message"     : "Deploying AI estimation agents…",
            "total_agents": len(agents),
        })

        results: list[AgentResult] = []
        completed = 0

        for i, agent in enumerate(agents):
            result = await agent.run(input_data)
            results.append(result)
            completed += 1
            await self._emit({
                "type"     : "progress",
                "completed": completed,
                "total"    : len(agents),
                "percent"  : int(completed / len(agents) * 100),
            })

        confidence = self._compute_confidence(input_data)
        orch_result = OrchestratorResult(session_id, results, confidence)

        await self._emit({
            "type"      : "budget_complete",
            **orch_result.to_dict(),
        })

        return orch_result
