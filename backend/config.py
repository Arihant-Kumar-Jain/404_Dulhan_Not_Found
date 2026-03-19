"""
Centralized configuration for the WeddingBudget.ai backend.

All model paths, CLIP settings, and runtime flags are loaded from
environment variables with sensible defaults. Import this module
wherever you need a setting instead of hardcoding paths.

Usage:
    from backend.config import settings
    model_path = settings.MODEL_ARTIFACTS_DIR / settings.DECOR_MODEL_NAME
"""
from __future__ import annotations

import os
from pathlib import Path


class Settings:
    """Application settings loaded from environment or defaults."""

    # --- Paths ---
    BACKEND_DIR: Path = Path(__file__).parent
    MODEL_ARTIFACTS_DIR: Path = BACKEND_DIR / "models" / "artifacts"
    SAMPLE_DATA_DIR: Path = BACKEND_DIR / "models" / "clip_xgboost" / "sample_data"
    LABELS_FILE: Path = SAMPLE_DATA_DIR / "labels.json"

    # --- Decor NN Model ---
    DECOR_MODEL_NAME: str = os.getenv("DECOR_MODEL_NAME", "decor_nn.pt")

    # --- CLIP ---
    CLIP_MODEL_NAME: str = os.getenv("CLIP_MODEL_NAME", "ViT-B-32")
    CLIP_PRETRAINED: str = os.getenv("CLIP_PRETRAINED", "openai")

    # --- Training ---
    TRAIN_EPOCHS: int = int(os.getenv("TRAIN_EPOCHS", "200"))
    TRAIN_LR: float = float(os.getenv("TRAIN_LR", "0.001"))

    # --- Runtime ---
    DEVICE: str = os.getenv("DEVICE", "auto")  # "auto", "cpu", or "cuda"

    def resolve_device(self) -> str:
        """Return the actual device string based on DEVICE setting."""
        if self.DEVICE == "auto":
            try:
                import torch
                return "cuda" if torch.cuda.is_available() else "cpu"
            except ImportError:
                return "cpu"
        return self.DEVICE

    @property
    def model_checkpoint_path(self) -> Path:
        """Full path to the saved model checkpoint."""
        return self.MODEL_ARTIFACTS_DIR / self.DECOR_MODEL_NAME


settings = Settings()
