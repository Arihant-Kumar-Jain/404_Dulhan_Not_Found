"""
budget.py — router for orchestrator budget generation and WebSocket progress.
"""
import asyncio
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, ConfigDict

from backend.estimation_pipeline import Orchestrator

router = APIRouter(prefix="/budget", tags=["Budget"])


class WeddingInput(BaseModel):
    """Pydantic model representing the frontend wizard form data."""
    model_config = ConfigDict(extra="allow")
    
    city: str = "udaipur"
    guest_count: int = 300
    events: list[str] = ["sangeet", "reception"]
    hotel_tier: str = "5star_palace"
    food_type: str = "veg_nonveg"
    bar_type: str = "full_bar"
    entertainment_tier: str = "premium"
    decor_style: str = "royal"
    decor_complexity: int = 3
    room_count: int = 150
    outstation_percentage: float = 0.5


async def _ws_send(websocket: WebSocket, payload: dict) -> None:
    try:
        await websocket.send_json(payload)
    except Exception:
        pass


@router.websocket("/ws")
async def websocket_budget_endpoint(websocket: WebSocket):
    """
    Real-time WebSocket connection for Agentic Pipeline estimation.
    Expects a JSON message with {type: 'start_estimation', data: WeddingInput}.
    """
    await websocket.accept()
    
    async def wrapped_send(payload: dict):
        await _ws_send(websocket, payload)

    try:
        while True:
            msg = await websocket.receive_json()
            if msg.get("type") == "start_estimation":
                # Convert dict to Pydantic model
                input_data = WeddingInput(**msg.get("data", {}))
                
                # Run the orchestrator with our websocket sender
                orch = Orchestrator(ws_send=wrapped_send)
                _ = await orch.run(input_data)
                
            elif msg.get("type") == "human_feedback":
                from backend.estimation_pipeline.human_in_loop import process_human_feedback
                log_entry = process_human_feedback(msg)
                await wrapped_send(log_entry)
                
            elif msg.get("type") == "ping":
                await wrapped_send({"type": "pong"})

    except WebSocketDisconnect:
        pass
