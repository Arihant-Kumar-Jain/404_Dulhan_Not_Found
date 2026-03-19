import asyncio
import json
import logging
from backend.estimation_pipeline.orchestrator import Orchestrator

# Silence httpx and other verbose logs for cleaner output
logging.getLogger("httpx").setLevel(logging.WARNING)

class DummyInput:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)
        # Needed for proper getattr
        if not hasattr(self, "events"):
            self.events = ["sangeet", "reception"]

async def main():
    print("\n" + "="*50)
    print(" 1. INITIALIZING WEDDING INPUT")
    print("="*50)
    
    # Simulate a user filling out the wizard form
    wizard_data = {
        "city": "udaipur",
        "guest_count": 350,
        "events": ["sangeet", "reception"],
        "hotel_tier": "5star_palace",
        "food_type": "veg_nonveg",
        "bar_type": "full_bar",
        "entertainment_tier": "premium",
        "decor_style": "royal",
        "decor_complexity": 4,
        "room_count": 100,
        "outstation_percentage": 0.4,
        "special_elements": ["Giant LED screen backdrop", "Ice sculptures"]
    }
    
    print(json.dumps(wizard_data, indent=2))
    input_obj = DummyInput(**wizard_data)
    
    print("\n" + "="*50)
    print(" 2. RUNNING ORCHESTRATOR & AGENTS (with Real-time WS Stream)")
    print("="*50)
    
    # Mock a websocket send function to see events
    async def mock_ws_send(payload):
        # Only print the text-based messages to keep it readable
        if payload.get("type") in ("agent_status", "agent_message"):
            print(f"[WS STREAM] {payload.get('agent', 'System')}: {payload.get('message', '')}")
            
    # Initialize Orchestrator. (vendor_search disabled here so it runs fast and doesn't spam APIs for the demo)
    orch = Orchestrator(ws_send=mock_ws_send, include_vendor_search=False)
    
    result = await orch.run(input_obj)
    
    print("\n" + "="*50)
    print(" 3. FINAL PIPELINE OUTPUT (JSON payload returned to client)")
    print("="*50)
    print(json.dumps(result.to_dict(), indent=2))
    print("\nDone!")

if __name__ == "__main__":
    asyncio.run(main())
