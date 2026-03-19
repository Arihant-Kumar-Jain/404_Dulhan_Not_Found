"""
WeddingBudget.ai — Décor Image Scraping Pipeline
Scrapes wedding décor images from free sources using Playwright + BeautifulSoup
"""

import asyncio
import json
import os
import hashlib
from datetime import datetime
from pathlib import Path

import aiohttp
from bs4 import BeautifulSoup

# Try playwright import (optional for basic scraping)
try:
    from playwright.async_api import async_playwright
    HAS_PLAYWRIGHT = True
except ImportError:
    HAS_PLAYWRIGHT = False
    print("⚠️ Playwright not installed. Using basic HTTP scraping only.")


# ──────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────

SEARCH_QUERIES = [
    "indian wedding mandap decoration",
    "indian wedding reception decor",
    "mehendi ceremony decoration ideas",
    "haldi ceremony decoration",
    "sangeet night stage decoration",
    "indian wedding floral decoration",
    "royal indian wedding decor",
    "modern indian wedding decoration",
    "rustic wedding decor india",
    "destination wedding decor udaipur",
    "wedding mandap flower decoration",
    "indian wedding entrance decoration",
    "wedding reception table setting india",
    "indian wedding stage design",
    "pastel wedding decor india"
]

OUTPUT_DIR = Path(__file__).parent.parent / "data" / "scraped_images"
METADATA_FILE = OUTPUT_DIR / "metadata.json"


# ──────────────────────────────────────────
# Unsplash API Scraper (Free tier - 50 req/hr)
# ──────────────────────────────────────────

class UnsplashScraper:
    """Scrapes wedding décor images from Unsplash API (free tier)"""

    BASE_URL = "https://api.unsplash.com"

    def __init__(self, access_key: str):
        self.access_key = access_key
        self.headers = {"Authorization": f"Client-ID {access_key}"}
        self.results = []

    async def search(self, query: str, per_page: int = 30, page: int = 1) -> list[dict]:
        """Search Unsplash for images matching query"""
        async with aiohttp.ClientSession() as session:
            params = {
                "query": query,
                "per_page": per_page,
                "page": page,
                "orientation": "landscape",
            }
            async with session.get(
                f"{self.BASE_URL}/search/photos",
                headers=self.headers,
                params=params,
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    images = []
                    for photo in data.get("results", []):
                        img = {
                            "id": f"unsplash_{photo['id']}",
                            "source": "unsplash",
                            "url_full": photo["urls"]["full"],
                            "url_regular": photo["urls"]["regular"],
                            "url_thumb": photo["urls"]["thumb"],
                            "photographer": photo["user"]["name"],
                            "photographer_url": photo["user"]["links"]["html"],
                            "description": photo.get("description") or photo.get("alt_description") or query,
                            "tags": [tag["title"] for tag in photo.get("tags", [])],
                            "width": photo["width"],
                            "height": photo["height"],
                            "query": query,
                            "scraped_at": datetime.utcnow().isoformat(),
                            # Admin-editable fields (to be labelled)
                            "function_type": None,  # mehendi, haldi, sangeet, pheras, reception
                            "style": None,  # traditional, royal, modern, rustic, glamorous
                            "complexity_tier": None,  # 1-5
                            "seed_cost_low": None,
                            "seed_cost_high": None,
                        }
                        images.append(img)
                    return images
                else:
                    print(f"⚠️ Unsplash API error ({resp.status}): {await resp.text()}")
                    return []

    async def scrape_all(self, queries: list[str] = None) -> list[dict]:
        """Run all search queries and collect results"""
        queries = queries or SEARCH_QUERIES
        all_images = []

        for i, query in enumerate(queries):
            print(f"🔍 [{i+1}/{len(queries)}] Searching: '{query}'...")
            images = await self.search(query, per_page=30)
            all_images.extend(images)

            # Rate limiting: wait 1.5s between requests (50 req/hr limit)
            if i < len(queries) - 1:
                await asyncio.sleep(1.5)

        # Deduplicate by image ID
        seen = set()
        unique = []
        for img in all_images:
            if img["id"] not in seen:
                seen.add(img["id"])
                unique.append(img)

        print(f"✅ Scraped {len(unique)} unique images from {len(queries)} queries")
        self.results = unique
        return unique


# ──────────────────────────────────────────
# Web Scraper (Playwright-based for JS-rendered pages)
# ──────────────────────────────────────────

class WebDecorScraper:
    """Scrapes décor images from wedding blogs and free stock sites"""

    BLOG_URLS = [
        "https://www.pexels.com/search/indian%20wedding%20decoration/",
        "https://www.pexels.com/search/wedding%20mandap/",
        "https://www.pexels.com/search/wedding%20reception%20decor/",
    ]

    async def scrape_pexels_page(self, url: str) -> list[dict]:
        """Scrape image URLs from Pexels search results using HTTP"""
        images = []
        try:
            async with aiohttp.ClientSession() as session:
                headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
                async with session.get(url, headers=headers) as resp:
                    if resp.status == 200:
                        html = await resp.text()
                        soup = BeautifulSoup(html, "html.parser")

                        # Find image elements
                        for img in soup.find_all("img", {"class": lambda x: x and "photo-item" in str(x)}):
                            src = img.get("src") or img.get("data-src")
                            if src and "pexels" in src:
                                images.append({
                                    "id": f"pexels_{hashlib.md5(src.encode()).hexdigest()[:12]}",
                                    "source": "pexels",
                                    "url_regular": src,
                                    "url_thumb": src.replace("?auto=compress", "?auto=compress&w=400"),
                                    "description": img.get("alt", "Wedding décor"),
                                    "query": url.split("/search/")[-1].replace("%20", " ") if "/search/" in url else "",
                                    "scraped_at": datetime.utcnow().isoformat(),
                                    "function_type": None,
                                    "style": None,
                                    "complexity_tier": None,
                                    "seed_cost_low": None,
                                    "seed_cost_high": None,
                                })

                        print(f"  📸 Found {len(images)} images from {url}")
        except Exception as e:
            print(f"  ❌ Error scraping {url}: {e}")

        return images

    async def scrape_with_playwright(self, url: str, scroll_times: int = 5) -> list[dict]:
        """Scrape using Playwright for JS-rendered pages"""
        if not HAS_PLAYWRIGHT:
            print("  ⚠️ Playwright not available, skipping browser-based scraping")
            return []

        images = []
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                await page.goto(url, timeout=30000)

                # Scroll to load lazy-loaded images
                for _ in range(scroll_times):
                    await page.evaluate("window.scrollBy(0, window.innerHeight)")
                    await asyncio.sleep(1)

                # Extract all image URLs (from rendered DOM)
                img_elements = await page.query_selector_all("img")
                for img in img_elements:
                    src = await img.get_attribute("src")
                    alt = await img.get_attribute("alt") or ""
                    if src and any(kw in alt.lower() for kw in ["wedding", "decor", "mandap", "floral", "ceremony"]):
                        images.append({
                            "id": f"web_{hashlib.md5(src.encode()).hexdigest()[:12]}",
                            "source": "web",
                            "url_regular": src,
                            "url_thumb": src,
                            "description": alt,
                            "scraped_at": datetime.utcnow().isoformat(),
                            "function_type": None,
                            "style": None,
                            "complexity_tier": None,
                            "seed_cost_low": None,
                            "seed_cost_high": None,
                        })

                await browser.close()
                print(f"  📸 Found {len(images)} images from {url} (Playwright)")
        except Exception as e:
            print(f"  ❌ Playwright error for {url}: {e}")

        return images

    async def scrape_all(self) -> list[dict]:
        """Run all scraping tasks"""
        all_images = []

        for url in self.BLOG_URLS:
            print(f"🌐 Scraping: {url}")
            images = await self.scrape_pexels_page(url)
            all_images.extend(images)
            await asyncio.sleep(2)

        return all_images


# ──────────────────────────────────────────
# Pipeline Orchestrator
# ──────────────────────────────────────────

async def run_scraping_pipeline(unsplash_key: str = None) -> dict:
    """
    Main scraping pipeline:
    1. Scrape from Unsplash API (if key provided)
    2. Scrape from free stock photo sites
    3. Deduplicate and save metadata
    """
    print("=" * 60)
    print("🎨 WeddingBudget.ai — Décor Image Scraping Pipeline")
    print("=" * 60)

    all_images = []

    # Step 1: Unsplash API
    if unsplash_key:
        print("\n📌 Phase 1: Unsplash API Scraping")
        unsplash = UnsplashScraper(unsplash_key)
        images = await unsplash.scrape_all()
        all_images.extend(images)
    else:
        print("\n⚠️ No Unsplash API key provided. Skipping Unsplash scraping.")
        print("   Get a free key at: https://unsplash.com/developers")

    # Step 2: Web Scraping
    print("\n📌 Phase 2: Web Scraping (Pexels, blogs)")
    web_scraper = WebDecorScraper()
    web_images = await web_scraper.scrape_all()
    all_images.extend(web_images)

    # Step 3: Deduplicate
    seen = set()
    unique = []
    for img in all_images:
        if img["id"] not in seen:
            seen.add(img["id"])
            unique.append(img)

    # Step 4: Save metadata
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load existing metadata if any
    existing = []
    if METADATA_FILE.exists():
        with open(METADATA_FILE, "r") as f:
            existing = json.load(f)

    # Merge (keep existing labels)
    existing_ids = {img["id"] for img in existing}
    for img in unique:
        if img["id"] not in existing_ids:
            existing.append(img)

    with open(METADATA_FILE, "w") as f:
        json.dump(existing, f, indent=2, ensure_ascii=False)

    stats = {
        "total_images": len(existing),
        "new_images": len(unique) - len(existing_ids.intersection({img["id"] for img in unique})),
        "sources": list(set(img["source"] for img in existing)),
        "unlabelled": sum(1 for img in existing if img.get("function_type") is None),
        "labelled": sum(1 for img in existing if img.get("function_type") is not None),
    }

    print(f"\n{'='*60}")
    print(f"✅ Pipeline Complete!")
    print(f"   Total images: {stats['total_images']}")
    print(f"   New images: {stats['new_images']}")
    print(f"   Sources: {', '.join(stats['sources'])}")
    print(f"   Labelled: {stats['labelled']} | Unlabelled: {stats['unlabelled']}")
    print(f"   Metadata saved to: {METADATA_FILE}")
    print(f"{'='*60}")

    return stats


# ──────────────────────────────────────────
# CLI Entry Point
# ──────────────────────────────────────────

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="WeddingBudget.ai Décor Image Scraper")
    parser.add_argument("--unsplash-key", type=str, default=os.getenv("UNSPLASH_ACCESS_KEY"),
                        help="Unsplash API access key")
    parser.add_argument("--queries", type=str, nargs="+", default=None,
                        help="Custom search queries")
    args = parser.parse_args()

    asyncio.run(run_scraping_pipeline(args.unsplash_key))
