"""
Wedding Décor Intelligence Library - Concurrent Image Scraper
=============================================================
All 4 sources run in parallel threads per combination.
A shared atomic counter tracks the combo quota (67 images).
Whichever source is fastest fills the quota first;
stuck/rate-limited sources are skipped gracefully.

SETUP:
    pip install requests psycopg2-binary python-dotenv playwright tqdm
    playwright install chromium
"""

import os
import time
import json
import hashlib
import threading
import requests
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv
from tqdm import tqdm
import psycopg2
import psycopg2.extras
from playwright.sync_api import sync_playwright

# Always load .env from the same folder as this script
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(threadName)s] %(message)s"
)
log = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL")
PIXABAY_KEY  = os.getenv("PIXABAY_API_KEY")
PEXELS_KEY   = os.getenv("PEXELS_API_KEY")
UNSPLASH_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

TABLE_NAME        = "decor_library"
IMAGES_PER_COMBO  = 67
MAX_COMBO_THREADS = 3

FUNCTIONS = ["Pheras", "Sangeet", "Reception", "Haldi", "Mehndi"]
STYLES    = ["Traditional", "Royal", "Modern"]

QUERY_TEMPLATES = {
    ("Pheras",    "Traditional"): "Indian traditional pheras wedding ceremony decor",
    ("Pheras",    "Royal"):       "royal pheras wedding mandap decoration flowers",
    ("Pheras",    "Modern"):      "modern minimalist wedding ceremony pheras decor",
    ("Sangeet",   "Traditional"): "traditional Indian sangeet ceremony decoration",
    ("Sangeet",   "Royal"):       "royal sangeet night decor flowers lights",
    ("Sangeet",   "Modern"):      "modern sangeet party decoration neon lights",
    ("Reception", "Traditional"): "traditional Indian wedding reception decoration",
    ("Reception", "Royal"):       "royal wedding reception grand decoration",
    ("Reception", "Modern"):      "modern wedding reception minimalist decor",
    ("Haldi",     "Traditional"): "traditional haldi ceremony decoration marigold",
    ("Haldi",     "Royal"):       "royal haldi ceremony decor flowers yellow",
    ("Haldi",     "Modern"):      "modern haldi ceremony decoration setup",
    ("Mehndi",    "Traditional"): "traditional mehndi ceremony decoration colorful",
    ("Mehndi",    "Royal"):       "royal mehndi night decoration elegant",
    ("Mehndi",    "Modern"):      "modern mehndi ceremony decoration boho",
}

# Unsplash has a Western-indexed library — use broader English terms
UNSPLASH_QUERY_TEMPLATES = {
    ("Pheras",    "Traditional"): "Indian Hindu wedding fire ceremony flowers",
    ("Pheras",    "Royal"):       "royal Indian wedding mandap floral decoration",
    ("Pheras",    "Modern"):      "modern Indian wedding ceremony minimalist decor",
    ("Sangeet",   "Traditional"): "Indian wedding music night colorful decoration",
    ("Sangeet",   "Royal"):       "grand Indian wedding celebration flowers lights",
    ("Sangeet",   "Modern"):      "Indian wedding night party neon modern decor",
    ("Reception", "Traditional"): "Indian wedding reception traditional floral decor",
    ("Reception", "Royal"):       "luxury wedding reception grand ballroom flowers",
    ("Reception", "Modern"):      "modern wedding reception minimalist table decor",
    ("Haldi",     "Traditional"): "Indian wedding turmeric ceremony yellow marigold",
    ("Haldi",     "Royal"):       "Indian wedding yellow flower ceremony decoration",
    ("Haldi",     "Modern"):      "Indian wedding yellow ceremony modern decoration",
    ("Mehndi",    "Traditional"): "henna night Indian wedding colorful fabric decor",
    ("Mehndi",    "Royal"):       "Indian wedding henna night elegant floral decor",
    ("Mehndi",    "Modern"):      "bohemian Indian wedding henna party decoration",
}

# ─────────────────────────────────────────────
# THREAD-SAFE QUOTA COUNTER
# ─────────────────────────────────────────────
class SharedQuota:
    def __init__(self, total: int):
        self._lock  = threading.Lock()
        self._count = 0
        self._total = total

    def claim(self) -> bool:
        with self._lock:
            if self._count < self._total:
                self._count += 1
                return True
            return False

    def done(self) -> bool:
        with self._lock:
            return self._count >= self._total

    @property
    def count(self) -> int:
        with self._lock:
            return self._count

# ─────────────────────────────────────────────
# DATABASE  (thread-local psycopg2 connections)
# ─────────────────────────────────────────────
_db_local = threading.local()

def get_conn():
    if not hasattr(_db_local, "conn") or _db_local.conn.closed:
        _db_local.conn = psycopg2.connect(DATABASE_URL)
        _db_local.conn.autocommit = True
    return _db_local.conn

def already_exists(source_id: str) -> bool:
    try:
        with get_conn().cursor() as cur:
            cur.execute(
                f"SELECT 1 FROM {TABLE_NAME} WHERE source_id = %s LIMIT 1",
                (source_id,)
            )
            return cur.fetchone() is not None
    except Exception as e:
        log.debug(f"already_exists failed for {source_id}: {e}")
        return False

def insert_meta(meta: dict) -> bool:
    try:
        cols         = list(meta.keys())
        vals         = list(meta.values())
        placeholders = ", ".join(["%s"] * len(cols))
        col_names    = ", ".join(cols)
        updates      = ", ".join(f"{c} = EXCLUDED.{c}" for c in cols if c != "source_id")
        sql = f"""
            INSERT INTO {TABLE_NAME} ({col_names})
            VALUES ({placeholders})
            ON CONFLICT (source_id) DO UPDATE SET {updates}
        """
        with get_conn().cursor() as cur:
            cur.execute(sql, vals)
        return True
    except Exception as e:
        log.debug(f"DB insert failed: {e}")
        return False

# ─────────────────────────────────────────────
# SHARED UTILITIES
# ─────────────────────────────────────────────
def build_meta(source_id, source, function_, style, original_url,
               supabase_url, width, height, tags, author, license_, raw) -> dict:
    return {
        "source_id":       source_id,
        "source":          source,
        "function_type":   function_,
        "style":           style,
        "combination_key": f"{function_}_{style}",
        "original_url":    original_url,
        "supabase_url":    supabase_url,
        "width":           width,
        "height":          height,
        "tags":            tags,
        "author":          author,
        "license":         license_,
        "raw_metadata":    json.dumps(raw),
        "is_tagged":       False,
        "complexity_tier": None,
        "cost_estimate":   None,
        "admin_notes":     None,
    }

def try_save(quota, source_id, source, function_, style,
             img_url, width, height, tags, author, license_, raw, uid) -> bool:
    if quota.done():
        return False
    if already_exists(source_id):
        return False
    if not quota.claim():
        return False
    meta = build_meta(source_id, source, function_, style,
                      img_url, img_url, width, height,
                      tags, author, license_, raw)
    return insert_meta(meta)

# ─────────────────────────────────────────────
# SOURCE 1: PIXABAY
# ─────────────────────────────────────────────
def fetch_pixabay(query, function_, style, quota):
    if not PIXABAY_KEY:
        log.info("Pixabay key missing — skipping")
        return
    page = 1
    while not quota.done():
        try:
            r = requests.get(
                "https://pixabay.com/api/",
                params=dict(key=PIXABAY_KEY, q=query, image_type="photo",
                            per_page=20, page=page, safesearch="true"),
                timeout=10
            )
            if r.status_code == 429:
                log.warning("Pixabay rate limit — sleeping 60s")
                time.sleep(60); continue
            if r.status_code != 200: break
            hits = r.json().get("hits", [])
            if not hits: break
            for hit in hits:
                if quota.done(): break
                try_save(quota, f"pixabay_{hit['id']}", "pixabay",
                         function_, style,
                         hit.get("largeImageURL") or hit["webformatURL"],
                         hit.get("imageWidth", 0), hit.get("imageHeight", 0),
                         hit.get("tags", ""), hit.get("user", ""),
                         "Pixabay License", hit, str(hit["id"]))
        except Exception as e:
            log.warning(f"Pixabay error page {page}: {e}"); break
        page += 1
        time.sleep(0.5)

# ─────────────────────────────────────────────
# SOURCE 2: PEXELS
# ─────────────────────────────────────────────
def fetch_pexels(query, function_, style, quota):
    if not PEXELS_KEY:
        log.info("Pexels key missing — skipping")
        return
    page = 1
    headers = {"Authorization": PEXELS_KEY}
    while not quota.done():
        try:
            r = requests.get(
                "https://api.pexels.com/v1/search",
                params=dict(query=query, per_page=20, page=page),
                headers=headers, timeout=10
            )
            if r.status_code == 429:
                wait = int(r.headers.get("Retry-After", 60))
                log.warning(f"Pexels rate limit — sleeping {wait}s")
                time.sleep(wait); continue
            if r.status_code != 200: break
            photos = r.json().get("photos", [])
            if not photos: break
            for photo in photos:
                if quota.done(): break
                img_url = photo["src"].get("large2x") or photo["src"]["original"]
                try_save(quota, f"pexels_{photo['id']}", "pexels",
                         function_, style, img_url,
                         photo.get("width", 0), photo.get("height", 0),
                         photo.get("alt", ""), photo.get("photographer", ""),
                         "Pexels License", photo, str(photo["id"]))
        except Exception as e:
            log.warning(f"Pexels error page {page}: {e}"); break
        page += 1
        time.sleep(0.4)

# ─────────────────────────────────────────────
# SOURCE 3: UNSPLASH
# ─────────────────────────────────────────────
def fetch_unsplash(query, function_, style, quota, unsplash_query=None):
    if not UNSPLASH_KEY:
        log.info("Unsplash key missing — skipping")
        return
    search_q = unsplash_query or query
    page = 1
    while not quota.done():
        try:
            r = requests.get(
                "https://api.unsplash.com/search/photos",
                params=dict(query=search_q, per_page=20, page=page),
                headers={"Authorization": f"Client-ID {UNSPLASH_KEY}"},
                timeout=10
            )
            log.info(f"Unsplash page {page} status={r.status_code} remaining={r.headers.get('X-Ratelimit-Remaining','?')}")
            if r.status_code == 429:
                log.warning("Unsplash rate limit — sleeping 60s")
                time.sleep(60); continue
            if r.status_code != 200:
                log.warning(f"Unsplash {r.status_code}: {r.text[:200]}"); break
            results = r.json().get("results", [])
            log.info(f"Unsplash page {page} returned {len(results)} results")
            if not results: break
            for photo in results:
                if quota.done(): break
                img_url = photo["urls"].get("regular") or photo["urls"]["full"]
                tags    = " ".join(t["title"] for t in photo.get("tags", []))
                try_save(quota, f"unsplash_{photo['id']}", "unsplash",
                         function_, style, img_url,
                         photo.get("width", 0), photo.get("height", 0),
                         tags, photo.get("user", {}).get("name", ""),
                         "Unsplash License", photo, photo["id"])
        except Exception as e:
            log.warning(f"Unsplash error page {page}: {e}"); break
        page += 1
        time.sleep(0.5)

# ─────────────────────────────────────────────
# SOURCE 4: PINTEREST (Playwright)
# ─────────────────────────────────────────────
def fetch_pinterest(query, function_, style, quota):
    email    = os.getenv("PINTEREST_EMAIL", "")
    password = os.getenv("PINTEREST_PASSWORD", "")
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            ctx  = browser.new_context(user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 Chrome/120 Safari/537.36"
            ))
            page = ctx.new_page()
            if email and password:
                try:
                    page.goto("https://www.pinterest.com/login/", timeout=30000)
                    page.fill('input[name="id"]', email)
                    page.fill('input[name="password"]', password)
                    page.click('button[type="submit"]')
                    page.wait_for_timeout(3000)
                except Exception as e:
                    log.warning(f"Pinterest login failed: {e}")

            page.goto(
                f"https://www.pinterest.com/search/pins/?q={requests.utils.quote(query)}&rs=typed",
                timeout=30000
            )
            page.wait_for_timeout(3000)
            seen = set()
            scrolls = 0
            while not quota.done() and scrolls < 25:
                for img in page.query_selector_all('img[src*="pinimg.com"]'):
                    if quota.done(): break
                    src = img.get_attribute("src") or ""
                    if not ("236x" in src or "474x" in src or "originals" in src):
                        continue
                    high_res = src.replace("236x", "736x").replace("474x", "736x")
                    if high_res in seen: continue
                    seen.add(high_res)
                    uid = hashlib.md5(high_res.encode()).hexdigest()[:12]
                    try_save(quota, f"pinterest_{uid}", "pinterest",
                             function_, style, high_res, 0, 0,
                             query, "Pinterest",
                             "Pinterest - Rights Reserved",
                             {"url": high_res, "query": query}, uid)
                page.evaluate("window.scrollBy(0, window.innerHeight * 2)")
                page.wait_for_timeout(2000)
                scrolls += 1
            browser.close()
    except Exception as e:
        log.warning(f"Pinterest scraper crashed: {e}")

# ─────────────────────────────────────────────
# COMBO WORKER
# ─────────────────────────────────────────────
def process_combo(func, style, pbar):
    query      = QUERY_TEMPLATES[(func, style)]
    unsplash_q = UNSPLASH_QUERY_TEMPLATES.get((func, style), query)
    quota      = SharedQuota(IMAGES_PER_COMBO)
    label      = f"{func}x{style}"
    log.info(f"▶  {label}  query='{query}'")

    sources = [
        ("pixabay",   lambda q, f, s, qt: fetch_pixabay(q, f, s, qt)),
        ("pexels",    lambda q, f, s, qt: fetch_pexels(q, f, s, qt)),
        ("unsplash",  lambda q, f, s, qt: fetch_unsplash(q, f, s, qt, unsplash_q)),
        ("pinterest", lambda q, f, s, qt: fetch_pinterest(q, f, s, qt)),
    ]

    with ThreadPoolExecutor(max_workers=4, thread_name_prefix=label) as ex:
        futures = {ex.submit(fn, query, func, style, quota): name for name, fn in sources}
        for future in as_completed(futures):
            name = futures[future]
            try:
                future.result()
                log.info(f"  [{label}] {name} done — {quota.count}/{IMAGES_PER_COMBO}")
            except Exception as e:
                log.warning(f"  [{label}] {name} error: {e}")

    log.info(f"✅ {label} complete — {quota.count} images saved")
    pbar.update(1)
    return quota.count

# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
def run():
    if not DATABASE_URL:
        log.error("❌ DATABASE_URL not set — check your .env file")
        return

    # Verify DB connection before starting
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.close()
        log.info("✅ DB connection OK")
    except Exception as e:
        log.error(f"❌ DB connection failed: {e}")
        return

    log.info("🚀 WedTech Décor Scraper — Concurrent Mode")
    combos      = [(f, s) for f in FUNCTIONS for s in STYLES]
    grand_total = 0

    with tqdm(total=len(combos), desc="Combos", unit="combo") as pbar:
        with ThreadPoolExecutor(max_workers=MAX_COMBO_THREADS, thread_name_prefix="combo") as ex:
            futures = {ex.submit(process_combo, f, s, pbar): (f, s) for f, s in combos}
            for future in as_completed(futures):
                func, style = futures[future]
                try:
                    grand_total += future.result()
                except Exception as e:
                    log.error(f"Combo {func}x{style} failed: {e}")

    log.info(f"\n🎉 ALL DONE — Total images saved: {grand_total}")

if __name__ == "__main__":
    run()