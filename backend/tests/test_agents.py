import pytest
import os
from unittest.mock import patch, MagicMock

from backend.estimation_pipeline.agents.venue_agent import VenueAgent
from backend.estimation_pipeline.agents.fnb_agent import FnBAgent
from backend.estimation_pipeline.agents.sundries_agent import SundriesAgent


class DummyInput:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


@pytest.mark.asyncio
async def test_venue_agent_calculation():
    agent = VenueAgent()
    inp = DummyInput(
        city="udaipur", 
        hotel_tier="5star_palace", 
        room_count=50, 
        events=["mehendi", "sangeet", "reception"]
    )
    result = agent._calculate(inp)
    
    assert result["agent_id"] == "venue"
    # udaipur 5star_palace mid = 45k
    # nights = len(events) - 1, min 2 = max(3-1, 2) = 2
    # 50 * 2 * 45k = 4_500_000
    assert result["mid"] == 4_500_000
    assert "50 rooms" in result["details"]


@pytest.mark.asyncio
async def test_fnb_agent_calculation():
    agent = FnBAgent()
    inp = DummyInput(
        events=["sangeet", "reception"], 
        food_type="veg", 
        bar_type="full_bar", 
        guest_count=200
    )
    result = agent._calculate(inp)
    
    assert result["agent_id"] == "fnb"
    
    assert result["mid"] > 0


@pytest.mark.asyncio
async def test_sundries_agent_calculation():
    agent = SundriesAgent()
    inp = DummyInput(
        events=["mehendi", "sangeet"],
        room_count=20,
        guest_count=100,
        entertainment_tier="standard"
    )
    result = agent._calculate(inp)
    
    assert result["agent_id"] == "sundries"
    
    assert "low" in result
    assert "mid" in result
    assert "high" in result
    assert result["low"] == int(result["mid"] * 0.7)
