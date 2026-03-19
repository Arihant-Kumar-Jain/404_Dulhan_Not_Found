"""
Feature extractor — wraps OpenCLIP (ViT-B/32) for image and text embeddings.

Returns normalised 512-dim float32 arrays.
Uses open_clip (already in requirements.txt: open-clip-torch).

References:
  github.com/mlfoundations/open_clip
"""
from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

from backend.config import settings

MODEL_NAME  = settings.CLIP_MODEL_NAME
PRETRAINED  = settings.CLIP_PRETRAINED


@lru_cache(maxsize=1)
def _load_model():
    """Lazy-load CLIP model once; subsequent calls return cached instance."""
    import torch
    import open_clip

    device = settings.resolve_device()
    logger.info("Loading OpenCLIP %s / %s on %s ...", MODEL_NAME, PRETRAINED, device)
    model, _, preprocess = open_clip.create_model_and_transforms(
        MODEL_NAME, pretrained=PRETRAINED
    )
    model = model.to(device)
    model.eval()
    tokenizer = open_clip.get_tokenizer(MODEL_NAME)
    return model, preprocess, tokenizer, device


def extract_image_embedding(image_path: str | Path) -> np.ndarray:
    """
    Load an image from disk and return its CLIP embedding (512-dim float32).

    Args:
        image_path: Absolute or relative path to a .jpg/.png file.

    Returns:
        numpy array of shape (512,), L2-normalised.
    """
    import torch
    from PIL import Image

    model, preprocess, _, device = _load_model()
    img = Image.open(image_path).convert("RGB")
    tensor = preprocess(img).unsqueeze(0).to(device)

    with torch.no_grad():
        emb = model.encode_image(tensor)
        emb = emb / emb.norm(dim=-1, keepdim=True)   # L2 normalise

    return emb.squeeze(0).cpu().numpy().astype(np.float32)


def extract_text_embedding(text: str) -> np.ndarray:
    """
    Tokenize a text string and return its CLIP embedding (512-dim float32).

    Args:
        text: The prompt string built by prompt_templates.build_prompt().

    Returns:
        numpy array of shape (512,), L2-normalised.
    """
    import torch

    model, _, tokenizer, device = _load_model()
    tokens = tokenizer([text]).to(device)

    with torch.no_grad():
        emb = model.encode_text(tokens)
        emb = emb / emb.norm(dim=-1, keepdim=True)

    return emb.squeeze(0).cpu().numpy().astype(np.float32)


# ── Metadata feature encoding ──────────────────────────────────────────────────

FUNCTION_MAP: dict[str, int] = {
    "mehendi": 0, "haldi": 1, "sangeet": 2,
    "baraat": 3, "pheras": 4, "reception": 5,
}
STYLE_MAP: dict[str, int] = {
    "traditional": 0, "royal": 1, "modern": 2, "minimalist": 3, "rustic": 4
}
CITY_TIER_MAP: dict[str, int] = {
    "udaipur": 2, "jaipur": 2, "mumbai": 2, "delhi": 2,
    "goa": 1, "jodhpur": 1,
}

def _guest_bucket(guest_range: str) -> int:
    """Convert guest_range string or count to 0–3 bucket."""
    try:
        low = int(str(guest_range).split("-")[0].replace("<", "").strip())
        if low < 200:  return 0
        if low < 500:  return 1
        if low < 1000: return 2
        return 3
    except (ValueError, AttributeError):
        return 1


def build_metadata_vector(label: dict, extra_keys: Optional[list[str]] = None) -> np.ndarray:
    """
    Build the 9 + N fixed metadata features:

        [function_enc, style_enc, complexity, guest_bucket,
         city_tier, is_outdoor, has_floral_ceiling, has_led_backdrop,
         + sorted(admin_extra keys)]

    Args:
        label      : One label dict from labels.json.
        extra_keys : Sorted list of all admin_extra keys discovered across
                     the full dataset (so columns are stable across rows).

    Returns:
        numpy array of shape (9 + len(extra_keys),), float32.
    """
    vec = [
        float(FUNCTION_MAP.get(label.get("function", "reception"), 5)),
        float(STYLE_MAP.get(label.get("style", "traditional"), 0)),
        float(label.get("complexity", 3)),
        float(_guest_bucket(label.get("guest_range", label.get("guest_count", "300")))),
        float(CITY_TIER_MAP.get(str(label.get("city", "")).lower(), 2)),
        float(bool(label.get("is_outdoor", False))),
        float(bool(label.get("has_floral_ceiling", False))),
        float(bool(label.get("has_led_backdrop", False))),
    ]

    extra_dict = label.get("admin_extra", {})
    for key in (extra_keys or []):
        val = extra_dict.get(key, 0)
        vec.append(float(bool(val) if isinstance(val, bool) else val))

    return np.array(vec, dtype=np.float32)


def build_full_feature_vector(
    image_path: Optional[str | Path],
    text_prompt: str,
    label: dict,
    extra_keys: Optional[list[str]] = None,
) -> np.ndarray:
    """
    Concatenate [image_emb (512) | text_emb (512) | metadata (9+N)].

    Args:
        image_path : Path to image file, or None (zeros used as fallback).
        text_prompt: String from build_prompt(label).
        label      : Label dict used for metadata features.
        extra_keys : Sorted admin_extra key list for stable columns.

    Returns:
        numpy array of shape (1033 + N,), float32.
    """
    img_emb = (
        extract_image_embedding(image_path)
        if image_path and Path(image_path).exists()
        else np.zeros(512, dtype=np.float32)
    )
    txt_emb  = extract_text_embedding(text_prompt)
    meta_vec = build_metadata_vector(label, extra_keys)

    return np.concatenate([img_emb, txt_emb, meta_vec], axis=0).astype(np.float32)
