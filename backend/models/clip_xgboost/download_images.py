"""
Download 10 real wedding/event decor images from free public CDNs.
Each image matches a label in labels.json.

Run: python -m backend.models.clip_xgboost.download_images
"""
from __future__ import annotations

import logging
import ssl
import urllib.request
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

IMAGES_DIR = Path(__file__).parent / "sample_data" / "images"

# Pexels CDN URLs - reliably served, free to use, no auth required.
# These are resized versions (640px wide) of real wedding/event photos.
IMAGE_URLS = [
    (
        "sangeet_royal_01.jpg",
        "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=640",
    ),
    (
        "reception_modern_01.jpg",
        "https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=640",
    ),
    (
        "mehendi_traditional_01.jpg",
        "https://images.pexels.com/photos/1456613/pexels-photo-1456613.jpeg?auto=compress&cs=tinysrgb&w=640",
    ),
    (
        "pheras_royal_01.jpg",
        "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=640",
    ),
    (
        "haldi_rustic_01.jpg",
        "https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=640",
    ),
    (
        "baraat_traditional_01.jpg",
        "https://images.pexels.com/photos/1231265/pexels-photo-1231265.jpeg?auto=compress&cs=tinysrgb&w=640",
    ),
    (
        "sangeet_modern_01.jpg",
        "https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=640",
    ),
    (
        "reception_royal_01.jpg",
        "https://images.pexels.com/photos/1616113/pexels-photo-1616113.jpeg?auto=compress&cs=tinysrgb&w=640",
    ),
    (
        "mehendi_royal_01.jpg",
        "https://images.pexels.com/photos/1589216/pexels-photo-1589216.jpeg?auto=compress&cs=tinysrgb&w=640",
    ),
    (
        "pheras_traditional_01.jpg",
        "https://images.pexels.com/photos/265947/pexels-photo-265947.jpeg?auto=compress&cs=tinysrgb&w=640",
    ),
]


def download_images() -> None:
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    # Create SSL context that doesn't verify (some corporate networks block)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    for filename, url in IMAGE_URLS:
        dest = IMAGES_DIR / filename
        if dest.exists() and dest.stat().st_size > 1000:
            logger.info("Already exists: %s (%d KB)", dest.name, dest.stat().st_size // 1024)
            continue

        logger.info("Downloading %s ...", filename)
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "WeddingBudgetAI/1.0"})
            with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
                data = resp.read()
            if len(data) < 1000:
                logger.error("Download too small for %s (%d bytes), skipping", filename, len(data))
                continue
            dest.write_bytes(data)
            logger.info("Saved %s (%d KB)", filename, len(data) // 1024)
        except Exception as exc:
            logger.error("Failed to download %s: %s", filename, exc)


if __name__ == "__main__":
    download_images()
