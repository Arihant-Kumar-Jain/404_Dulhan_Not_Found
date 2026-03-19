"""
PyTorch Neural Network Regression Model for Decor Pricing.

Multi-output MLP predicting [low, mid, high] prices
from a 1033+N dimensional feature vector.

The three outputs represent:
  - low:  conservative / minimum realistic estimate
  - mid:  most-likely market-rate estimate
  - high: premium / upper-bound estimate

This range-based approach gives users a confidence interval
rather than a single point estimate, which is more honest and
useful for Indian wedding budget planning where vendor prices
vary wildly by negotiation, season, and exact requirements.
"""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)


class DecorNNRegressor:
    """
    Wraps a PyTorch MLP to predict [low, mid, high] price ranges.

    Why three outputs (low, mid, high)?
    Wedding decor pricing is inherently uncertain. A single-point
    prediction would be misleading. Instead, the model outputs a
    range representing:
      - low:  budget-conscious option with the same style/theme
      - mid:  typical market rate for this configuration
      - high: premium execution with top-tier materials/vendors
    """

    def __init__(self, input_dim: int = 1033) -> None:
        self.input_dim = input_dim
        self.model = None
        self.extra_keys: list[str] = []
        self._device = "cpu"
        self._build_model()

    def _build_model(self):
        try:
            import torch
            import torch.nn as nn
        except ImportError:
            raise ImportError("Please install PyTorch: pip install torch")

        self._device = self._resolve_device()

        self.model = nn.Sequential(
            nn.Linear(self.input_dim, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.2),

            nn.Linear(512, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.1),

            nn.Linear(128, 3)  # [low, mid, high]
        ).to(self._device)

    @staticmethod
    def _resolve_device() -> str:
        """Resolve compute device from config or auto-detect."""
        from backend.config import settings
        if settings.DEVICE == "auto":
            import torch
            return "cuda" if torch.cuda.is_available() else "cpu"
        return settings.DEVICE

    def train(self, X: np.ndarray, y: np.ndarray, extra_keys: list[str],
              epochs: int = 200, lr: float = 1e-3) -> None:
        """
        Train the MLP.

        Args:
            X: Feature matrix of shape (n_samples, n_features).
            y: Target matrix of shape (n_samples, 3) for [low, mid, high].
            extra_keys: The list of admin_extra keys used to build X.
        """
        import torch
        import torch.nn as nn
        import torch.optim as optim

        self.extra_keys = sorted(extra_keys)
        self.input_dim = X.shape[1]

        # Rebuild model if input_dim changed
        if self.model[0].in_features != self.input_dim:
            self._build_model()

        X_tensor = torch.tensor(X, dtype=torch.float32).to(self._device)
        y_tensor = torch.tensor(y, dtype=torch.float32).to(self._device)

        criterion = nn.HuberLoss()
        optimizer = optim.AdamW(self.model.parameters(), lr=lr, weight_decay=1e-4)
        scheduler = optim.lr_scheduler.ReduceLROnPlateau(
            optimizer, mode='min', factor=0.5, patience=10
        )

        logger.info(
            "Training PyTorch NN on %d samples (dims: %d) on %s",
            X.shape[0], X.shape[1], self._device,
        )
        self.model.train()

        for epoch in range(epochs):
            optimizer.zero_grad()
            outputs = self.model(X_tensor)

            # Soft constraint: enforce low <= mid <= high via penalty
            low_mid_penalty = torch.relu(outputs[:, 0] - outputs[:, 1]).mean()
            mid_high_penalty = torch.relu(outputs[:, 1] - outputs[:, 2]).mean()

            mse_loss = criterion(outputs, y_tensor)
            total_loss = mse_loss + 10.0 * (low_mid_penalty + mid_high_penalty)

            total_loss.backward()
            optimizer.step()
            scheduler.step(total_loss)

            if (epoch + 1) % 50 == 0:
                logger.info(
                    "Epoch [%d/%d], Loss: %.2f", epoch + 1, epochs, total_loss.item()
                )

        logger.info("Training complete.")
        self.model.eval()

    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Predict prices for new feature vectors.

        Returns:
            Matrix of shape (n_samples, 3) representing [low, mid, high].
        """
        import torch

        if self.model is None:
            raise RuntimeError("Model is not trained. Call train() or load() first.")

        self.model.eval()
        X_tensor = torch.tensor(X, dtype=torch.float32).to(self._device)

        with torch.no_grad():
            if len(X_tensor.shape) == 1:
                X_tensor = X_tensor.unsqueeze(0)
            y_pred = self.model(X_tensor).cpu().numpy()

        # Enforce strict logical ordering: low <= mid <= high
        y_pred = np.sort(y_pred, axis=1)

        # Round to nearest 5k for cleaner UI numbers
        y_pred = np.round(y_pred / 5000) * 5000
        return y_pred

    def save(self, model_name: str | None = None) -> None:
        """Save model weights and extra_keys layout to disk."""
        import torch
        from backend.config import settings

        if self.model is None:
            raise RuntimeError("Cannot save an untrained model.")

        name = model_name or settings.DECOR_MODEL_NAME
        settings.MODEL_ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
        path = settings.MODEL_ARTIFACTS_DIR / name

        save_dict = {
            "state_dict": self.model.state_dict(),
            "input_dim": self.input_dim,
            "extra_keys": self.extra_keys,
        }

        torch.save(save_dict, path)
        logger.info("PyTorch model saved to %s", path)

    @classmethod
    def load(cls, model_name: str | None = None) -> DecorNNRegressor:
        """Load model weights from disk using settings-based path."""
        import torch
        from backend.config import settings

        name = model_name or settings.DECOR_MODEL_NAME
        path = settings.MODEL_ARTIFACTS_DIR / name
        if not path.exists():
            raise FileNotFoundError(
                f"Model not found at {path}. Run training pipeline."
            )

        save_dict = torch.load(path, map_location="cpu", weights_only=True)

        instance = cls(input_dim=save_dict["input_dim"])
        instance.model.load_state_dict(save_dict["state_dict"])
        instance.extra_keys = save_dict.get("extra_keys", [])
        instance.model.to(instance._device)
        instance.model.eval()

        logger.info("Model loaded from %s (device: %s)", path, instance._device)
        return instance
