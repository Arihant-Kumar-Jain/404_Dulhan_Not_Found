"""
vendors.py — router for Nominatim+Overpass real vendor search.
"""
from typing import Any
from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict
from backend.estimation_pipeline.agents.vendor_search_agent import VendorSearchAgent

router = APIRouter(prefix="/vendors", tags=["Vendors"])


class VendorSearchRequest(BaseModel):
    model_config = ConfigDict(extra="allow")
    city: str = "udaipur"
    events: list[str] = ["sangeet", "reception"]


@router.post("/nearby", summary="Search real nearby vendors (Free APIs)")
async def search_nearby_vendors(payload: VendorSearchRequest) -> dict[str, Any]:
    """
    Uses OpenStreetMap (Overpass + Nominatim + OpenRouteService)
    to find real vendors matching the event requirements in the specified city.
    """
    agent = VendorSearchAgent()
    result = await agent.run(payload)
    return dict(result)
