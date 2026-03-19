"""
Training pipeline for the CLIP + PyTorch NN decor model.

Reads labels.json -> Extracts CLIP features -> Trains NN -> Saves checkpoint

Run standalone: `python -m backend.models.clip_xgboost.training_pipeline`
"""
from __future__ import annotations

import json
import logging

import numpy as np

from backend.config import settings
from backend.models.clip_xgboost.feature_extractor import build_full_feature_vector
from backend.models.clip_xgboost.model import DecorNNRegressor
from backend.models.clip_xgboost.prompt_templates import build_prompt

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_training() -> None:
    labels_file = settings.LABELS_FILE
    if not labels_file.exists():
        logger.error("Labels file not found at %s", labels_file)
        return

    with open(labels_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not data:
        logger.error("labels.json is empty")
        return

    # 1. Discover all unique admin_extra keys to freeze the feature column layout
    extra_keys_set: set[str] = set()
    for row in data:
        for k in row.get("admin_extra", {}).keys():
            extra_keys_set.add(k)
    extra_keys = sorted(list(extra_keys_set))

    logger.info("Found %d labels. Discovered admin_extra keys: %s", len(data), extra_keys)

    # 2. Extract features and targets
    X_list = []
    y_list = []

    for i, row in enumerate(data):
        logger.info("Processing label %d/%d: %s", i + 1, len(data), row.get("id"))

        prompt = build_prompt(row)

        # Resolve image path relative to sample_data dir
        img_path = str(settings.SAMPLE_DATA_DIR / row.get("image", ""))
        vec = build_full_feature_vector(
            image_path=img_path,
            text_prompt=prompt,
            label=row,
            extra_keys=extra_keys,
        )

        target = [
            float(row.get("price_low",  50_000)),
            float(row.get("price_mid",  80_000)),
            float(row.get("price_high", 120_000)),
        ]

        X_list.append(vec)
        y_list.append(target)

    X = np.vstack(X_list)
    y = np.vstack(y_list)

    # 3. Train and Save
    regressor = DecorNNRegressor(input_dim=X.shape[1])
    regressor.train(X, y, extra_keys, epochs=settings.TRAIN_EPOCHS, lr=settings.TRAIN_LR)
    regressor.save()

    logger.info("Training pipeline complete. Model saved to %s", settings.model_checkpoint_path)


if __name__ == "__main__":
    run_training()
