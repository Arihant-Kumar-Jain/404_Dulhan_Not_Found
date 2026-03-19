"""
Vendor Search Agent — uses 100% free APIs:

  1. Overpass API (OpenStreetMap) — find vendors by category near venue city
  2. Nominatim (OSM geocoding)   — city name → lat/lon
  3. ORS (OpenRouteService)      — driving distance from venue to vendor
     (free tier: 2000 req/day, needs OPENROUTESERVICE_API_KEY in .env)
     Falls back to Haversine straight-line distance if ORS key not set.

No Google Maps.  No paid APIs.
"""
from __future__ import annotations

import asyncio
import logging
import math
import os
from typing import Any

import httpx

from .base_agent import BaseAgent, AgentResult

logger = logging.getLogger(__name__)

# ── API Endpoints ─────────────────────────────────────────────────────────────
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
OVERPASS_URL  = "https://overpass-api.de/api/interpreter"
ORS_URL       = "https://api.openrouteservice.org/v2/matrix/driving-car"

# Overpass amenity/shop tags we search per vendor category
OVERPASS_CATEGORY_TAGS: dict[str, list[dict[str, str]]] = {
    "Decorator": [
        {"shop": "florist"},
        {"shop": "party"},
    ],
    "Caterer": [
        {"amenity": "restaurant"},
        {"catering": "yes"},
    ],
    "Photography": [
        {"shop": "photographer"},
    ],
    "AV / Sound": [
        {"shop": "electronics"},
        {"amenity": "events_venue"},
    ],
    "Tent & Furniture": [
        {"shop": "furniture"},
    ],
}

RADIUS_METRES = 20_000   # 20 km search radius around city centre


# ── Haversine fallback ────────────────────────────────────────────────────────

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Straight-line distance in km between two lat/lon points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2
         + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2))
         * math.sin(dlon / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


# ── Geocoding ─────────────────────────────────────────────────────────────────

async def _geocode_city(city: str) -> tuple[float, float] | None:
    """Return (lat, lon) for *city* via Nominatim, or None on failure."""
    headers = {
        "User-Agent": os.getenv("NOMINATIM_USER_AGENT", "WeddingBudgetAI/1.0")
    }
    params  = {"q": f"{city}, India", "format": "json", "limit": 1}
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            resp = await client.get(NOMINATIM_URL, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            if data:
                return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception as exc:
        logger.warning("Nominatim geocode failed for %s: %s", city, exc)
    return None


# ── Overpass query ────────────────────────────────────────────────────────────

def _build_overpass_query(lat: float, lon: float, tags: list[dict[str, str]]) -> str:
    """Build an Overpass QL query for given tags within RADIUS_METRES of (lat, lon)."""
    tag_blocks = []
    for tag in tags:
        for k, v in tag.items():
            tag_blocks.append(
                f'node["{k}"="{v}"](around:{RADIUS_METRES},{lat},{lon});'
            )
    union = "\n  ".join(tag_blocks)
    return f"[out:json][timeout:15];\n(\n  {union}\n);\nout center 10;"


async def _overpass_search(
    lat: float, lon: float, tags: list[dict[str, str]]
) -> list[dict[str, Any]]:
    query = _build_overpass_query(lat, lon, tags)
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(OVERPASS_URL, data={"data": query})
            resp.raise_for_status()
            elements = resp.json().get("elements", [])
            vendors = []
            for el in elements[:8]:          # cap at 8 results
                tags_raw = el.get("tags", {})
                name = tags_raw.get("name") or tags_raw.get("brand") or "Unnamed Vendor"
                vlat = el.get("lat") or el.get("center", {}).get("lat")
                vlon = el.get("lon") or el.get("center", {}).get("lon")
                vendors.append({
                    "name"     : name,
                    "lat"      : vlat,
                    "lon"      : vlon,
                    "phone"    : tags_raw.get("phone") or tags_raw.get("contact:phone", ""),
                    "website"  : tags_raw.get("website") or tags_raw.get("contact:website", ""),
                    "osm_id"   : el.get("id"),
                    "maps_url" : (
                        f"https://www.openstreetmap.org/node/{el.get('id')}"
                        if el.get("id") else ""
                    ),
                })
            return vendors
    except Exception as exc:
        logger.warning("Overpass search failed: %s", exc)
        return []


# ── Distance via ORS (free) ───────────────────────────────────────────────────

async def _ors_distances_km(
    origin_lat: float, origin_lon: float,
    destinations: list[tuple[float, float]],
) -> list[float]:
    """
    OpenRouteService Matrix API (free 2000 req/day).
    Returns driving distance in km for each destination.
    Falls back to Haversine if no key or request fails.
    """
    ors_key = os.getenv("OPENROUTESERVICE_API_KEY", "")
    if not ors_key or not destinations:
        return [
            _haversine_km(origin_lat, origin_lon, d[0], d[1])
            for d in destinations
        ]

    locations = [[origin_lon, origin_lat]] + [[d[1], d[0]] for d in destinations]
    body = {
        "locations": locations,
        "sources"  : [0],
        "destinations": list(range(1, len(destinations) + 1)),
        "metrics"  : ["distance"],
        "units"    : "km",
    }
    headers = {
        "Authorization": ors_key,
        "Content-Type" : "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(ORS_URL, json=body, headers=headers)
            resp.raise_for_status()
            distances = resp.json()["distances"][0]  # row 0 = from origin
            return [d for d in distances]
    except Exception as exc:
        logger.warning("ORS distance matrix failed: %s — using Haversine.", exc)
        return [
            _haversine_km(origin_lat, origin_lon, d[0], d[1])
            for d in destinations
        ]


# ── Main Agent ────────────────────────────────────────────────────────────────

class VendorSearchAgent(BaseAgent):
    """
    Finds real nearby vendors for each required category using free OSM APIs.
    Result is informational (no cost estimate); included in final budget output
    as a vendor recommendation section.
    """

    agent_id   = "vendor_search"
    agent_name = "Vendor Search Agent"
    agent_icon = ""

    async def run(self, input_data: Any, stream_delay: float = 0.6) -> AgentResult:
        """
        Overrides BaseAgent.run() because this agent is fully async
        (HTTP calls to Nominatim, Overpass, ORS).
        """
        await self._emit_status("working", "Locating nearby vendors via OpenStreetMap…")

        city   = getattr(input_data, "city", "delhi")
        events = getattr(input_data, "events", [])

        # Decide which vendor categories to search
        needed_categories = ["Decorator", "Caterer"]
        if any(e in events for e in ("sangeet", "reception")):
            needed_categories.append("AV / Sound")
        needed_categories.append("Photography")

        # 1. Geocode city
        coords = await _geocode_city(city)
        if not coords:
            await self._emit_message("Could not geocode city — skipping vendor search.")
            return _empty_result()

        city_lat, city_lon = coords
        await self._emit_message(f"City centre located at ({city_lat:.4f}, {city_lon:.4f})")

        all_categories: dict[str, list[dict]] = {}

        for category in needed_categories:
            tags = OVERPASS_CATEGORY_TAGS.get(category, [{"shop": "yes"}])
            await self._emit_message(f"Searching {category} vendors near {city.title()}…")
            raw_vendors = await _overpass_search(city_lat, city_lon, tags)

            # 2. Get driving distances
            destinations = [
                (v["lat"], v["lon"]) for v in raw_vendors
                if v.get("lat") and v.get("lon")
            ]
            distances = await _ors_distances_km(city_lat, city_lon, destinations)

            enriched = []
            for v, dist in zip(raw_vendors, distances):
                v["distance_km"] = round(dist, 1)
                enriched.append(v)

            # Sort by distance
            enriched.sort(key=lambda x: x.get("distance_km", 999))
            all_categories[category] = enriched[:5]   # top 5 per category
            await asyncio.sleep(0.3)

        await self._emit_status("done", "Vendor search complete.")

        summary = ", ".join(
            f"{cat}: {len(vendors)} found"
            for cat, vendors in all_categories.items()
        )

        result = AgentResult(
            agent_id   = self.agent_id,
            name       = "Nearby Vendors",
            icon       = self.agent_icon,
            low        = 0,
            mid        = 0,
            high       = 0,
            details    = summary,
            vendors    = all_categories,   # extra key; passed through to frontend
        )

        await self._emit({
            "type"     : "agent_result",
            "agent_id" : self.agent_id,
            "result"   : dict(result),
        })
        return result

    # VendorSearchAgent has no sync _calculate (it's fully async via run())
    def _calculate(self, input_data):  # type: ignore[override]
        raise NotImplementedError("Use run() — this agent is async-only.")


def _empty_result() -> AgentResult:
    return AgentResult(
        agent_id="vendor_search",
        name="Nearby Vendors",
        icon="🗺️",
        low=0, mid=0, high=0,
        details="No vendor data retrieved.",
        vendors={},
    )
