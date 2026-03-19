"""
WeddingBudget.ai — FastAPI Backend
Multi-agent AI-powered wedding budget estimation engine
"""

import json
import asyncio
import os
from typing import Optional
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="WeddingBudget.ai API",
    description="AI-powered wedding budget estimation with multi-agent intelligence",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────
# Data Models
# ──────────────────────────────────────────

class WeddingInput(BaseModel):
    city: str
    hotel_tier: str  # "5star_palace" | "5star_city" | "4star" | "resort" | "farmhouse"
    room_count: int
    guest_count: int
    outstation_percentage: float  # 0.0 to 1.0
    events: list[str]  # ["mehendi", "haldi", "sangeet", "baraat", "pheras", "reception"]
    bride_city: Optional[str] = None
    groom_city: Optional[str] = None
    decor_style: Optional[str] = "traditional"  # traditional | modern | royal | minimalist
    decor_complexity: Optional[int] = 3  # 1-5
    food_type: Optional[str] = "veg_nonveg"  # veg | nonveg | veg_nonveg
    bar_type: Optional[str] = "full_bar"  # dry | beer_wine | full_bar
    entertainment_tier: Optional[str] = "premium"  # basic | standard | premium | celebrity


class BudgetResponse(BaseModel):
    session_id: str
    total_low: float
    total_mid: float
    total_high: float
    confidence: float
    breakdown: dict
    created_at: str


# ──────────────────────────────────────────
# Cost Data (Admin-editable seed data)
# ──────────────────────────────────────────

VENUE_COSTS = {
    "udaipur": {"5star_palace": {"low": 30000, "mid": 45000, "high": 65000}, "5star_city": {"low": 15000, "mid": 25000, "high": 40000}, "4star": {"low": 8000, "mid": 12000, "high": 18000}, "resort": {"low": 10000, "mid": 18000, "high": 30000}, "farmhouse": {"low": 5000, "mid": 10000, "high": 15000}},
    "jaipur": {"5star_palace": {"low": 25000, "mid": 40000, "high": 55000}, "5star_city": {"low": 12000, "mid": 20000, "high": 35000}, "4star": {"low": 7000, "mid": 11000, "high": 16000}, "resort": {"low": 8000, "mid": 15000, "high": 25000}, "farmhouse": {"low": 4000, "mid": 8000, "high": 12000}},
    "mumbai": {"5star_palace": {"low": 35000, "mid": 50000, "high": 75000}, "5star_city": {"low": 18000, "mid": 30000, "high": 50000}, "4star": {"low": 10000, "mid": 15000, "high": 22000}, "resort": {"low": 12000, "mid": 20000, "high": 35000}, "farmhouse": {"low": 6000, "mid": 12000, "high": 18000}},
    "delhi": {"5star_palace": {"low": 28000, "mid": 42000, "high": 60000}, "5star_city": {"low": 15000, "mid": 25000, "high": 45000}, "4star": {"low": 9000, "mid": 13000, "high": 20000}, "resort": {"low": 10000, "mid": 18000, "high": 28000}, "farmhouse": {"low": 5000, "mid": 10000, "high": 16000}},
    "goa": {"5star_palace": {"low": 20000, "mid": 35000, "high": 50000}, "5star_city": {"low": 12000, "mid": 22000, "high": 38000}, "4star": {"low": 7000, "mid": 10000, "high": 15000}, "resort": {"low": 10000, "mid": 16000, "high": 30000}, "farmhouse": {"low": 5000, "mid": 9000, "high": 14000}},
    "jodhpur": {"5star_palace": {"low": 22000, "mid": 38000, "high": 55000}, "5star_city": {"low": 10000, "mid": 18000, "high": 30000}, "4star": {"low": 6000, "mid": 10000, "high": 15000}, "resort": {"low": 8000, "mid": 14000, "high": 22000}, "farmhouse": {"low": 4000, "mid": 7000, "high": 12000}},
}

FNB_COSTS = {
    "welcome_dinner": {"veg": {"low": 1800, "mid": 2500, "high": 4000}, "nonveg": {"low": 2200, "mid": 3000, "high": 5000}},
    "lunch_buffet": {"veg": {"low": 1200, "mid": 1800, "high": 3000}, "nonveg": {"low": 1500, "mid": 2200, "high": 3500}},
    "gala_dinner": {"veg": {"low": 2500, "mid": 3500, "high": 6000}, "nonveg": {"low": 3000, "mid": 4500, "high": 7500}},
    "cocktail_snacks": {"veg": {"low": 800, "mid": 1200, "high": 2000}, "nonveg": {"low": 1000, "mid": 1500, "high": 2500}},
}

BAR_COSTS = {
    "dry": {"low": 0, "mid": 0, "high": 0},
    "beer_wine": {"low": 800, "mid": 1200, "high": 2000},
    "full_bar": {"low": 1500, "mid": 2500, "high": 4500},
}

ARTIST_COSTS = {
    "local_dj": {"low": 50000, "mid": 100000, "high": 150000},
    "professional_dj": {"low": 150000, "mid": 300000, "high": 500000},
    "local_band": {"low": 100000, "mid": 200000, "high": 350000},
    "bollywood_singer_b": {"low": 500000, "mid": 800000, "high": 1200000},
    "bollywood_singer_a": {"low": 800000, "mid": 1500000, "high": 2500000},
    "folk_artists": {"low": 30000, "mid": 60000, "high": 100000},
    "choreographer": {"low": 50000, "mid": 100000, "high": 200000},
    "anchor": {"low": 40000, "mid": 80000, "high": 150000},
    "celebrity_performer": {"low": 2000000, "mid": 5000000, "high": 10000000},
}

LOGISTICS_COSTS = {
    "innova_per_trip": {"low": 3000, "mid": 4500, "high": 7000},
    "ghodi": {"udaipur": 25000, "jaipur": 20000, "mumbai": 35000, "delhi": 30000, "goa": 20000, "jodhpur": 18000},
    "dholi_per_unit": {"low": 8000, "mid": 12000, "high": 18000},
    "cold_pyro_per_unit": {"low": 3000, "mid": 5000, "high": 8000},
    "confetti_cannon": {"low": 2000, "mid": 3500, "high": 5000},
}

DECOR_COSTS = {
    "mehendi": {"1": {"low": 100000, "mid": 200000, "high": 350000}, "2": {"low": 200000, "mid": 400000, "high": 600000}, "3": {"low": 400000, "mid": 700000, "high": 1000000}, "4": {"low": 700000, "mid": 1200000, "high": 1800000}, "5": {"low": 1200000, "mid": 2000000, "high": 3000000}},
    "haldi": {"1": {"low": 80000, "mid": 150000, "high": 250000}, "2": {"low": 150000, "mid": 300000, "high": 500000}, "3": {"low": 300000, "mid": 500000, "high": 800000}, "4": {"low": 500000, "mid": 900000, "high": 1500000}, "5": {"low": 900000, "mid": 1500000, "high": 2500000}},
    "sangeet": {"1": {"low": 150000, "mid": 300000, "high": 500000}, "2": {"low": 300000, "mid": 500000, "high": 800000}, "3": {"low": 500000, "mid": 900000, "high": 1400000}, "4": {"low": 900000, "mid": 1500000, "high": 2500000}, "5": {"low": 1500000, "mid": 2500000, "high": 4000000}},
    "baraat": {"1": {"low": 50000, "mid": 100000, "high": 200000}, "2": {"low": 100000, "mid": 200000, "high": 350000}, "3": {"low": 200000, "mid": 400000, "high": 600000}, "4": {"low": 400000, "mid": 700000, "high": 1000000}, "5": {"low": 700000, "mid": 1200000, "high": 1800000}},
    "pheras": {"1": {"low": 200000, "mid": 400000, "high": 600000}, "2": {"low": 400000, "mid": 700000, "high": 1100000}, "3": {"low": 700000, "mid": 1200000, "high": 1800000}, "4": {"low": 1200000, "mid": 2000000, "high": 3000000}, "5": {"low": 2000000, "mid": 3500000, "high": 5500000}},
    "reception": {"1": {"low": 200000, "mid": 400000, "high": 700000}, "2": {"low": 400000, "mid": 800000, "high": 1200000}, "3": {"low": 800000, "mid": 1400000, "high": 2200000}, "4": {"low": 1400000, "mid": 2500000, "high": 3800000}, "5": {"low": 2500000, "mid": 4000000, "high": 6000000}},
}

SUNDRIES = {
    "room_basket": {"basic": 500, "standard": 1200, "premium": 2500, "luxury": 5000},
    "ritual_materials": {"mehendi": 15000, "haldi": 20000, "pheras": 35000},
    "gift_hampers": {"basic": 300, "premium": 800, "luxury": 2000},
    "stationery_per_guest": {"basic": 100, "premium": 250, "luxury": 500},
    "contingency_percent": 5,
}


# ──────────────────────────────────────────
# Budget Calculation Engines
# ──────────────────────────────────────────

def calculate_venue_cost(input_data: WeddingInput) -> dict:
    city = input_data.city.lower()
    tier = input_data.hotel_tier
    rooms = input_data.room_count
    nights = max(len(input_data.events) - 1, 2)  # At least 2 nights

    if city not in VENUE_COSTS:
        city = "delhi"  # fallback
    if tier not in VENUE_COSTS[city]:
        tier = "4star"

    rate = VENUE_COSTS[city][tier]
    return {
        "name": "Venue & Accommodation",
        "icon": "🏨",
        "low": rate["low"] * rooms * nights,
        "mid": rate["mid"] * rooms * nights,
        "high": rate["high"] * rooms * nights,
        "details": f"{rooms} rooms × {nights} nights at {city.title()} {tier.replace('_', ' ')}"
    }


def calculate_fnb_cost(input_data: WeddingInput) -> dict:
    guests = input_data.guest_count
    food_key = "nonveg" if input_data.food_type in ["nonveg", "veg_nonveg"] else "veg"
    events = input_data.events

    total_low, total_mid, total_high = 0, 0, 0

    meal_map = {
        "mehendi": "cocktail_snacks",
        "haldi": "lunch_buffet",
        "sangeet": "gala_dinner",
        "baraat": "cocktail_snacks",
        "pheras": "lunch_buffet",
        "reception": "gala_dinner",
    }

    for event in events:
        meal = meal_map.get(event, "lunch_buffet")
        cost = FNB_COSTS.get(meal, FNB_COSTS["lunch_buffet"])[food_key]
        total_low += cost["low"] * guests
        total_mid += cost["mid"] * guests
        total_high += cost["high"] * guests

    bar = BAR_COSTS.get(input_data.bar_type, BAR_COSTS["full_bar"])
    bar_events = len([e for e in events if e in ["sangeet", "reception", "cocktail"]])
    bar_events = max(bar_events, 1)
    total_low += bar["low"] * guests * bar_events
    total_mid += bar["mid"] * guests * bar_events
    total_high += bar["high"] * guests * bar_events

    return {
        "name": "Food & Beverage",
        "icon": "🍽️",
        "low": total_low,
        "mid": total_mid,
        "high": total_high,
        "details": f"{guests} guests × {len(events)} events, {input_data.bar_type.replace('_', ' ')} bar"
    }


def calculate_decor_cost(input_data: WeddingInput) -> dict:
    complexity = str(min(max(input_data.decor_complexity or 3, 1), 5))
    events = input_data.events

    total_low, total_mid, total_high = 0, 0, 0

    for event in events:
        cost = DECOR_COSTS.get(event, DECOR_COSTS.get("reception"))
        if cost and complexity in cost:
            total_low += cost[complexity]["low"]
            total_mid += cost[complexity]["mid"]
            total_high += cost[complexity]["high"]

    return {
        "name": "Décor & Design",
        "icon": "🎨",
        "low": total_low,
        "mid": total_mid,
        "high": total_high,
        "details": f"Complexity tier {complexity}/5, {len(events)} events"
    }


def calculate_artist_cost(input_data: WeddingInput) -> dict:
    tier = input_data.entertainment_tier or "premium"

    tier_map = {
        "basic": ["local_dj", "folk_artists"],
        "standard": ["professional_dj", "local_band", "anchor"],
        "premium": ["professional_dj", "bollywood_singer_b", "choreographer", "anchor"],
        "celebrity": ["professional_dj", "bollywood_singer_a", "choreographer", "anchor", "celebrity_performer"],
    }

    acts = tier_map.get(tier, tier_map["premium"])
    total_low, total_mid, total_high = 0, 0, 0

    for act in acts:
        cost = ARTIST_COSTS.get(act, ARTIST_COSTS["local_dj"])
        total_low += cost["low"]
        total_mid += cost["mid"]
        total_high += cost["high"]

    return {
        "name": "Artist & Entertainment",
        "icon": "🎤",
        "low": total_low,
        "mid": total_mid,
        "high": total_high,
        "details": f"{tier.title()} tier: {', '.join(a.replace('_', ' ').title() for a in acts)}"
    }


def calculate_logistics_cost(input_data: WeddingInput) -> dict:
    outstation = int(input_data.guest_count * input_data.outstation_percentage)
    vehicles = max(1, (outstation + 2) // 3)
    trips = 3
    city = input_data.city.lower()

    car_cost = LOGISTICS_COSTS["innova_per_trip"]
    transfer_low = car_cost["low"] * vehicles * trips
    transfer_mid = car_cost["mid"] * vehicles * trips
    transfer_high = car_cost["high"] * vehicles * trips

    ghodi_city = LOGISTICS_COSTS["ghodi"].get(city, 25000)
    ghodi = ghodi_city if "baraat" in input_data.events else 0

    dholi = LOGISTICS_COSTS["dholi_per_unit"]
    sfx = LOGISTICS_COSTS["cold_pyro_per_unit"]

    total_low = transfer_low + ghodi + dholi["low"] * 2 + sfx["low"] * 4
    total_mid = transfer_mid + ghodi + dholi["mid"] * 2 + sfx["mid"] * 6
    total_high = transfer_high + ghodi + dholi["high"] * 3 + sfx["high"] * 10

    return {
        "name": "Logistics & Transport",
        "icon": "🚗",
        "low": total_low,
        "mid": total_mid,
        "high": total_high,
        "details": f"{outstation} outstation guests, {vehicles} vehicles, {trips} trips"
    }


def calculate_sundries_cost(input_data: WeddingInput) -> dict:
    rooms = input_data.room_count
    guests = input_data.guest_count
    events = input_data.events

    tier_map = {"basic": "basic", "standard": "standard", "premium": "premium", "celebrity": "luxury"}
    tier_key = tier_map.get(input_data.entertainment_tier or "premium", "premium")

    baskets = SUNDRIES["room_basket"][tier_key] * rooms
    rituals = sum(SUNDRIES["ritual_materials"].get(e, 0) for e in events)
    gifts = SUNDRIES["gift_hampers"][tier_key] * guests
    stationery = SUNDRIES["stationery_per_guest"][tier_key] * guests

    subtotal = baskets + rituals + gifts + stationery

    return {
        "name": "Sundries & Basics",
        "icon": "🎁",
        "low": int(subtotal * 0.7),
        "mid": subtotal,
        "high": int(subtotal * 1.4),
        "details": f"Room baskets, rituals, gifts, stationery for {guests} guests"
    }


# ──────────────────────────────────────────
# API Endpoints
# ──────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "WeddingBudget.ai API", "version": "1.0.0"}


@app.post("/api/v1/budget/calculate", response_model=BudgetResponse)
async def calculate_budget(input_data: WeddingInput):
    """Calculate wedding budget synchronously (non-streaming)"""
    import uuid

    venue = calculate_venue_cost(input_data)
    fnb = calculate_fnb_cost(input_data)
    decor = calculate_decor_cost(input_data)
    artist = calculate_artist_cost(input_data)
    logistics = calculate_logistics_cost(input_data)
    sundries = calculate_sundries_cost(input_data)

    categories = [venue, fnb, decor, artist, logistics, sundries]

    total_low = sum(c["low"] for c in categories)
    total_mid = sum(c["mid"] for c in categories)
    total_high = sum(c["high"] for c in categories)

    # Add contingency
    contingency_pct = SUNDRIES["contingency_percent"] / 100
    total_low = int(total_low * (1 + contingency_pct))
    total_mid = int(total_mid * (1 + contingency_pct))
    total_high = int(total_high * (1 + contingency_pct))

    # Confidence based on data completeness
    confidence = 0.75
    if input_data.bride_city and input_data.groom_city:
        confidence += 0.05
    if input_data.decor_complexity:
        confidence += 0.05
    if len(input_data.events) >= 4:
        confidence += 0.05
    confidence = min(confidence, 0.95)

    return BudgetResponse(
        session_id=str(uuid.uuid4()),
        total_low=total_low,
        total_mid=total_mid,
        total_high=total_high,
        confidence=confidence,
        breakdown={cat["name"]: cat for cat in categories},
        created_at=datetime.utcnow().isoformat(),
    )


# ──────────────────────────────────────────
# WebSocket — Agent Theater (Real-time)
# ──────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id] = websocket

    def disconnect(self, session_id: str):
        self.active_connections.pop(session_id, None)

    async def send_message(self, session_id: str, message: dict):
        ws = self.active_connections.get(session_id)
        if ws:
            await ws.send_json(message)


manager = ConnectionManager()


async def simulate_agent_work(session_id: str, agent_name: str, agent_icon: str, messages: list[str], result: dict, delay: float = 1.0):
    """Simulate an agent working and sending progress messages"""
    await manager.send_message(session_id, {
        "type": "agent_status",
        "agent": agent_name,
        "icon": agent_icon,
        "status": "working",
        "message": f"Starting analysis..."
    })
    await asyncio.sleep(delay * 0.5)

    for msg in messages:
        await manager.send_message(session_id, {
            "type": "agent_message",
            "agent": agent_name,
            "icon": agent_icon,
            "message": msg
        })
        await asyncio.sleep(delay * 0.8)

    await manager.send_message(session_id, {
        "type": "agent_status",
        "agent": agent_name,
        "icon": agent_icon,
        "status": "done",
        "result": result
    })


@app.websocket("/ws/budget-session/{session_id}")
async def budget_websocket(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()

            if data.get("type") == "start_calculation":
                input_data = WeddingInput(**data.get("input", {}))

                await manager.send_message(session_id, {
                    "type": "session_start",
                    "message": "Budget calculation initiated. Deploying AI agents...",
                    "total_agents": 6
                })
                await asyncio.sleep(1)

                # Agent 1: Venue
                venue = calculate_venue_cost(input_data)
                await simulate_agent_work(session_id, "Venue Agent", "🏨", [
                    f"Analyzing {input_data.city.title()} venue costs...",
                    f"Checking {input_data.hotel_tier.replace('_', ' ')} tier pricing...",
                    f"Calculating {input_data.room_count} rooms × estimated {max(len(input_data.events)-1, 2)} nights...",
                    f"Venue estimate: ₹{venue['mid']/100000:.1f}L (mid-range)"
                ], venue, 0.8)

                await manager.send_message(session_id, {"type": "progress", "completed": 1, "total": 6})

                # Agent 2: F&B
                fnb = calculate_fnb_cost(input_data)
                await simulate_agent_work(session_id, "F&B Agent", "🍽️", [
                    f"Computing per-head costs for {input_data.guest_count} guests...",
                    f"Menu type: {input_data.food_type.replace('_', ' ')} across {len(input_data.events)} events...",
                    f"Bar setup: {input_data.bar_type.replace('_', ' ')}...",
                    f"Total F&B estimate: ₹{fnb['mid']/100000:.1f}L"
                ], fnb, 0.8)

                await manager.send_message(session_id, {"type": "progress", "completed": 2, "total": 6})

                # Agent 3: Décor
                decor = calculate_decor_cost(input_data)
                await simulate_agent_work(session_id, "Décor Agent", "🎨", [
                    f"Analyzing décor complexity tier {input_data.decor_complexity}/5...",
                    f"Estimating {input_data.decor_style} style décor across {len(input_data.events)} events...",
                    f"Checking reference images for cost prediction...",
                    f"Décor estimate: ₹{decor['mid']/100000:.1f}L"
                ], decor, 0.8)

                await manager.send_message(session_id, {"type": "progress", "completed": 3, "total": 6})

                # Agent 4: Artists
                artist = calculate_artist_cost(input_data)
                await simulate_agent_work(session_id, "Artist Agent", "🎤", [
                    f"Mapping {input_data.entertainment_tier} tier entertainment costs...",
                    f"Checking artist database for available acts...",
                    f"Entertainment estimate: ₹{artist['mid']/100000:.1f}L"
                ], artist, 0.7)

                await manager.send_message(session_id, {"type": "progress", "completed": 4, "total": 6})

                # Agent 5: Logistics
                logistics = calculate_logistics_cost(input_data)
                await simulate_agent_work(session_id, "Logistics Agent", "🚗", [
                    f"Calculating transfers for {int(input_data.guest_count * input_data.outstation_percentage)} outstation guests...",
                    f"Fleet sizing: 1 Innova per 3 guests...",
                    f"Baraat logistics: Ghodi, Dholi, SFX...",
                    f"Logistics estimate: ₹{logistics['mid']/100000:.1f}L"
                ], logistics, 0.7)

                await manager.send_message(session_id, {"type": "progress", "completed": 5, "total": 6})

                # Agent 6: Sundries
                sundries = calculate_sundries_cost(input_data)
                await simulate_agent_work(session_id, "Sundries Agent", "🎁", [
                    f"Estimating room baskets for {input_data.room_count} rooms...",
                    f"Ritual materials, gifts, stationery...",
                    f"Sundries & extras: ₹{sundries['mid']/100000:.1f}L"
                ], sundries, 0.6)

                await manager.send_message(session_id, {"type": "progress", "completed": 6, "total": 6})

                # Final Budget
                categories = [venue, fnb, decor, artist, logistics, sundries]
                total_low = int(sum(c["low"] for c in categories) * 1.05)
                total_mid = int(sum(c["mid"] for c in categories) * 1.05)
                total_high = int(sum(c["high"] for c in categories) * 1.05)

                await asyncio.sleep(0.5)
                await manager.send_message(session_id, {
                    "type": "budget_complete",
                    "total_low": total_low,
                    "total_mid": total_mid,
                    "total_high": total_high,
                    "confidence": 0.85,
                    "breakdown": {cat["name"]: cat for cat in categories}
                })

            elif data.get("type") == "human_feedback":
                # Human-in-the-loop: user can adjust parameters
                feedback = data.get("feedback", {})
                await manager.send_message(session_id, {
                    "type": "feedback_received",
                    "message": f"Adjusting budget based on your feedback: {feedback.get('message', 'N/A')}",
                })

    except WebSocketDisconnect:
        manager.disconnect(session_id)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
