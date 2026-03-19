"""
Decor and Design agent -- Sajawat Agent.

Uses CLIP+PyTorch NN model for price estimation.
The model is loaded lazily so cold starts don't crash the server.
"""
from __future__ import annotations
import logging
from .base_agent import BaseAgent, AgentResult

logger = logging.getLogger(__name__)


class DecorAgent(BaseAgent):
    agent_id   = "decor"
    agent_name = "Sajawat Agent (Decor)"
    agent_icon = ""

    def _calculate(self, input_data) -> AgentResult:
        """
        Run CLIP+PyTorch NN model to predict decor costs.
        No fallback -- the trained model checkpoint must exist.
        """
        from backend.models.clip_xgboost.predict import predict_from_metadata
        result = predict_from_metadata(input_data)
        return AgentResult(**result, agent_id=self.agent_id)
