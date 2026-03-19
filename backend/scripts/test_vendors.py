import asyncio
import json
import logging
from backend.estimation_pipeline.agents.vendor_search_agent import VendorSearchAgent

logging.basicConfig(level=logging.INFO)

class DummyPayload:
    city = "udaipur"
    events = ["sangeet", "reception"]

async def main():
    agent = VendorSearchAgent()
    result = await agent.run(DummyPayload())
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
