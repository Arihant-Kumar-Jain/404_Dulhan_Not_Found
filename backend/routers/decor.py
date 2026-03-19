"""
decor.py — router for CLIP+XGBoost decor pricing and semantic search.
"""
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict
from pydantic_settings import BaseSettings

from backend.models.clip_xgboost.predict import load_model, predict_from_metadata
from backend.estimation_pipeline.semantic_search import semantic_search_decor

router = APIRouter(prefix="/decor", tags=["Decor"])

class DecorPredictRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    guest_count: int = 300
    events: list[str] = ["reception"]
    decor_style: str = "royal"
    decor_complexity: int = 3
    city: str = "udaipur"
    is_outdoor: bool = False
    special_elements: list[str] = []


class DecorPriceResponse(BaseModel):
    low: float
    mid: float
    high: float
    details: str
    events_count: int


class DecorSearchRequest(BaseModel):
    query: str
    top_k: int = 5


@router.post(
    "/predict-price",
    response_model=DecorPriceResponse,
    summary="Predict decor price from wizard input",
    description="""
Evaluates the requested decor setup across multiple events using the 
trained CLIP+XGBoost ML model.

**Features extrapolated:** style, complexity, guests, city tier, 
outdoor/indoor, special elements (admin extra).
    """,
    responses={
        422: {"description": "Validation error: invalid request fields"},
        500: {"description": "Model inference failed / not trained"},
    },
)
async def predict_decor_price(payload: DecorPredictRequest) -> dict:
    # 1. Ensure model is loaded into memory
    load_model()
    
    # 2. Extract numeric totals
    result = predict_from_metadata(payload)
    
    return {
        "low"         : result["low"],
        "mid"         : result["mid"],
        "high"        : result["high"],
        "details"     : result["details"],
        "events_count": len(payload.events),
    }


@router.post(
    "/semantic-search", 
    summary="Search decor images by text (CLIP)",
    description="Extracts 512-dim embedding from text query and returns visually similar labeled decor images."
)
async def search_decor_library(payload: DecorSearchRequest) -> list[dict[str, Any]]:
    return semantic_search_decor(payload.query, payload.top_k)
