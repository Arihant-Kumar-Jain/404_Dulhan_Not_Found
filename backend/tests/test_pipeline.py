import pytest
from backend.estimation_pipeline.orchestrator import Orchestrator

class DummyInput:
    city = "udaipur"
    hotel_tier = "5star_palace"
    room_count = 50
    events = ["mehendi", "sangeet", "reception"]
    guest_count = 200
    food_type = "veg"
    bar_type = "dry"
    entertainment_tier = "standard"


@pytest.mark.asyncio
async def test_orchestrator_runs_all_agents():
    orch = Orchestrator(include_vendor_search=False)
    
    # 6 agents expected
    result = await orch.run(DummyInput())
    
    # We should have a session ID
    assert result.session_id is not None
    
    costs = result.breakdown
    assert len(costs) == 6
    assert "Venue & Accommodation" in costs
    assert "Food & Beverage" in costs
    
    assert result.total_mid > 0
    assert result.total_low < result.total_mid < result.total_high
    
    # Should be dict serializable
    data = result.to_dict()
    assert data["session_id"] == result.session_id
    assert "vendors" in data
