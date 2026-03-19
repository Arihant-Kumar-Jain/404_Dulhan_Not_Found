"""
labels.py — router for Admin CRUD operations on Decor labels.
"""
import json
from pathlib import Path
from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/labels", tags=["Admin Labels"])

LABELS_FILE = Path(__file__).parent.parent / "models" / "clip_xgboost" / "sample_data" / "labels.json"


class DecorLabel(BaseModel):
    id: str
    image: str
    function: str
    style: str
    complexity: int
    guest_range: str = "200-500"
    city_tier: int = 2
    is_outdoor: bool = False
    has_floral_ceiling: bool = False
    has_led_backdrop: bool = False
    price_low: float
    price_mid: float
    price_high: float
    admin_extra: dict[str, Any] = {}
    notes: str = ""


@router.get("", summary="Get all decor labels")
async def get_labels() -> list[dict]:
    if not LABELS_FILE.exists():
        return []
    with open(LABELS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


@router.post("", summary="Add a new decor label")
async def add_label(label: DecorLabel) -> dict:
    if not LABELS_FILE.exists():
        LABELS_FILE.parent.mkdir(parents=True, exist_ok=True)
        data = []
    else:
        with open(LABELS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            
    # Check for duplicate ID
    if any(d.get("id") == label.id for d in data):
        raise HTTPException(status_code=400, detail="Label ID already exists")
        
    data.append(label.model_dump())
    
    with open(LABELS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        
    return {"status": "success", "id": label.id}
