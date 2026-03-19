"""
Base agent class for WeddingBudget.ai estimation agents.

Every agent:
  - receives a WeddingInput pydantic model
  - optionally receives a WebSocket send callback for real-time UI updates
  - returns a standardised AgentResult dict
"""
from __future__ import annotations

import asyncio
from abc import ABC, abstractmethod
from typing import Any, Callable, Coroutine, Optional


# Type alias: async function that sends a dict to the WS client
WSSendFn = Callable[[dict], Coroutine[Any, Any, None]]


class AgentResult(dict):
    """
    Standardised agent output.  Always contains at minimum:
        name        str   — display name, e.g. "Venue & Accommodation"
        icon        str   — emoji icon for UI
        low         float — lower bound estimate (INR)
        mid         float — mid estimate (INR)
        high        float — upper bound estimate (INR)
        details     str   — human-readable summary line
        agent_id    str   — machine-readable agent identifier
    """
    # no extra logic; just a self-documenting alias


class BaseAgent(ABC):
    """
    Abstract base for all budget estimation agents.

    Subclasses implement `_calculate(input_data)` synchronously (or async).
    The public `run()` method wraps this with WebSocket progress updates.
    """

    #: Override in subclass — short identifier used for WS messages
    agent_id: str = "base"
    #: Override in subclass — friendly display name
    agent_name: str = "Base Agent"
    #: Override in subclass — emoji shown in UI
    agent_icon: str = ""

    def __init__(self, ws_send: Optional[WSSendFn] = None) -> None:
        """
        Args:
            ws_send: Optional async callback ``async def send(msg: dict) -> None``.
                     If provided, the agent will emit progress messages during `run()`.
        """
        self._ws_send = ws_send

    # ── Internal helpers ────────────────────────────────────────────────────

    async def _emit(self, payload: dict) -> None:
        """Emit a WebSocket message if a send function is registered."""
        if self._ws_send:
            await self._ws_send(payload)

    async def _emit_status(self, status: str, message: str) -> None:
        await self._emit({
            "type": "agent_status",
            "agent": self.agent_name,
            "agent_id": self.agent_id,
            "icon": self.agent_icon,
            "status": status,
            "message": message,
        })

    async def _emit_message(self, message: str) -> None:
        await self._emit({
            "type": "agent_message",
            "agent": self.agent_name,
            "agent_id": self.agent_id,
            "icon": self.agent_icon,
            "message": message,
        })

    # ── Public API ───────────────────────────────────────────────────────────

    @abstractmethod
    def _calculate(self, input_data: Any) -> AgentResult:
        """
        Synchronous core computation.  Must return an `AgentResult`-compatible
        dict with keys: name, icon, low, mid, high, details, agent_id.

        Do NOT perform I/O here; use async helpers in `run()` for I/O-bound work.
        """

    async def run(self, input_data: Any, stream_delay: float = 0.6) -> AgentResult:
        """
        Execute the agent asynchronously, emitting WS progress updates.

        Args:
            input_data:   WeddingInput (or compatible) pydantic model.
            stream_delay: Seconds to pause between messages for dramatic effect.

        Returns:
            AgentResult dict with low / mid / high price breakdown.
        """
        await self._emit_status("working", f"{self.agent_name} starting analysis…")
        await asyncio.sleep(stream_delay * 0.4)

        # Run synchronous calculation in executor to avoid blocking event loop
        loop = asyncio.get_event_loop()
        result: AgentResult = await loop.run_in_executor(None, self._calculate, input_data)

        # Stream the details line as a mid-progress message
        await self._emit_message(result.get("details", "Analysis complete."))
        await asyncio.sleep(stream_delay * 0.6)

        mid_lakhs = result.get("mid", 0) / 100_000
        await self._emit_message(
            f"Estimate → ₹{mid_lakhs:.1f}L (mid-range)"
        )

        await self._emit_status("done", f"{self.agent_name} complete.")
        await self._emit({
            "type": "agent_result",
            "agent_id": self.agent_id,
            "result": dict(result),
        })
        return result
