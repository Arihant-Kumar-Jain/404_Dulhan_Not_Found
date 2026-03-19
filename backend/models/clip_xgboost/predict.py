"""
Predict API wrapper for the CLIP + PyTorch NN decor model.

Exposes a clean function that the DecorAgent can call directly.
Lazily loads model so that server startup is not blocked.
"""
from __future__ import annotations

import logging
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)

# Global cached model instance to prevent reloading on each request
_REGRESSOR = None


def load_model() -> Any:
    """Lazy load the PyTorch NN regressor from the settings-configured path."""
    global _REGRESSOR
    if _REGRESSOR is None:
        from backend.models.clip_xgboost.model import DecorNNRegressor
        _REGRESSOR = DecorNNRegressor.load()
    return _REGRESSOR


def predict_from_metadata(input_data: Any) -> dict[str, float]:
    """
    Given a raw Pydantic input from the DecorAgent (guest_count, events, etc.),
    build the feature vector and predict [low, mid, high] prices.

    The three-output design reflects the reality of Indian wedding pricing:
    vendors quote ranges, not fixed prices. The model learns these ranges
    from labeled training data where each sample has low/mid/high annotated
    by domain experts.

    Args:
        input_data: Wizard input (e.g. WeddingInput model).

    Returns:
        Dict with name, icon, low, mid, high, details.
    """
    from backend.models.clip_xgboost.feature_extractor import (
        build_full_feature_vector,
        CITY_TIER_MAP,
    )
    from backend.models.clip_xgboost.prompt_templates import build_prompt

    regressor = load_model()

    guests     = getattr(input_data, "guest_count", 300)
    complexity = getattr(input_data, "decor_complexity", 3)
    events     = getattr(input_data, "events", [])
    city       = getattr(input_data, "city", "delhi").lower()
    is_outdoor = getattr(input_data, "is_outdoor", False)
    city_tier  = CITY_TIER_MAP.get(city, 2)

    total_low = 0.0
    total_mid = 0.0
    total_high = 0.0

    for event in events:
        synthetic_label = {
            "function": event,
            "style": getattr(input_data, "decor_style", "traditional"),
            "complexity": complexity,
            "guest_count": guests,
            "is_outdoor": is_outdoor,
            "city_tier": city_tier,
            "admin_extra": {
                el: True for el in getattr(input_data, "special_elements", [])
            },
        }

        prompt = build_prompt(synthetic_label)

        vec = build_full_feature_vector(
            image_path=None,
            text_prompt=prompt,
            label=synthetic_label,
            extra_keys=regressor.extra_keys,
        )

        try:
            X_input = vec.reshape(1, -1)
            y_pred = regressor.predict(X_input)[0]
            total_low  += float(y_pred[0])
            total_mid  += float(y_pred[1])
            total_high += float(y_pred[2])
        except Exception as exc:
            logger.error("Predict failed for %s: %s", event, exc)

    return {
        "name"   : "Decor and Design",
        "icon"   : "",
        "low"    : total_low,
        "mid"    : total_mid,
        "high"   : total_high,
        "details": f"AI Estimate for {len(events)} events (CLIP+PyTorch NN)",
    }
