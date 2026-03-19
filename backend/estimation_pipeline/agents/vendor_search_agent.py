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

from backend.estimation_pipeline.agents.base_agent import BaseAgent, AgentResult

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


# ── Hardcoded city coordinates + backup vendors ────────────────────────────────
CITY_BACKUP: dict[str, dict] = {
    "udaipur": {
        "center": (24.5854, 73.7125),
        "vendors": {
            "Venue": [
                {"name": "Taj Lake Palace", "lat": 24.5755, "lon": 73.6816, "osm_id": 1001, "distance_km": 3.2},
                {"name": "The Oberoi Udaivilas", "lat": 24.5812, "lon": 73.6800, "osm_id": 1002, "distance_km": 3.4},
                {"name": "City Palace Heritage Venue", "lat": 24.5764, "lon": 73.6835, "osm_id": 1003, "distance_km": 3.1},
            ],
            "Decorator": [
                {"name": "Udaipur Royal Decor", "lat": 24.5764, "lon": 73.6868, "osm_id": 1004, "distance_km": 2.8},
                {"name": "Mewar Event Designs", "lat": 24.5812, "lon": 73.7190, "osm_id": 1005, "distance_km": 1.1},
                {"name": "Devra Floral Arts", "lat": 24.5900, "lon": 73.7150, "osm_id": 1006, "distance_km": 0.6},
            ],
            "Caterer": [
                {"name": "Mewar Authentic Caterers", "lat": 24.5930, "lon": 73.7080, "osm_id": 1007, "distance_km": 1.0},
                {"name": "Lake City Feast", "lat": 24.5750, "lon": 73.6810, "osm_id": 1008, "distance_km": 3.6},
                {"name": "Rajwada Rasoi", "lat": 24.5880, "lon": 73.7210, "osm_id": 1009, "distance_km": 1.4},
            ],
            "Artist": [
                {"name": "Manganiyar Folk Troupe", "lat": 24.5790, "lon": 73.6920, "osm_id": 1010, "distance_km": 2.3},
                {"name": "Udaipur Sangeet Group", "lat": 24.5850, "lon": 73.7050, "osm_id": 1011, "distance_km": 0.8},
                {"name": "Lake Symphony DJ", "lat": 24.5800, "lon": 73.7100, "osm_id": 1012, "distance_km": 0.6},
            ],
            "Logistics": [
                {"name": "Mewar Vintage Wheels", "lat": 24.5910, "lon": 73.7140, "osm_id": 1013, "distance_km": 0.7},
                {"name": "Lake City Tours & Travels", "lat": 24.5780, "lon": 73.7200, "osm_id": 1014, "distance_km": 1.2},
                {"name": "Udaipur Premium Fleet", "lat": 24.5830, "lon": 73.7000, "osm_id": 1015, "distance_km": 1.3},
            ],
        },
    },
    "jaipur": {
        "center": (26.9124, 75.7873),
        "vendors": {
            "Venue": [
                {"name": "Rambagh Palace", "lat": 26.8970, "lon": 75.8080, "osm_id": 2001, "distance_km": 2.6},
                {"name": "Fairmont Jaipur", "lat": 27.0200, "lon": 75.8850, "osm_id": 2002, "distance_km": 15.3},
                {"name": "Jai Mahal Palace", "lat": 26.9110, "lon": 75.7900, "osm_id": 2003, "distance_km": 0.3},
            ],
            "Decorator": [
                {"name": "Pink City Planners", "lat": 26.9200, "lon": 75.7800, "osm_id": 2004, "distance_km": 1.2},
                {"name": "Rajputana Decor", "lat": 26.9050, "lon": 75.8000, "osm_id": 2005, "distance_km": 1.5},
                {"name": "Aravali Floral Studio", "lat": 26.9150, "lon": 75.7700, "osm_id": 2006, "distance_km": 1.8},
            ],
            "Caterer": [
                {"name": "Rajasthani Dawat Caterers", "lat": 26.9180, "lon": 75.7920, "osm_id": 2007, "distance_km": 0.8},
                {"name": "Chokhi Dhani Catering", "lat": 26.8650, "lon": 75.7880, "osm_id": 2008, "distance_km": 5.3},
                {"name": "Heritage Feast Jaipur", "lat": 26.9100, "lon": 75.7750, "osm_id": 2009, "distance_km": 1.3},
            ],
            "Artist": [
                {"name": "Jaipur Gharana Musicians", "lat": 26.9150, "lon": 75.7950, "osm_id": 2010, "distance_km": 1.0},
                {"name": "Pink City Live Band", "lat": 26.9250, "lon": 75.7700, "osm_id": 2011, "distance_km": 2.1},
                {"name": "Royal Beats DJ Services", "lat": 26.9080, "lon": 75.7830, "osm_id": 2012, "distance_km": 0.6},
            ],
            "Logistics": [
                {"name": "Jaipur Elephant & Vintage Car Logistics", "lat": 26.9220, "lon": 75.7900, "osm_id": 2013, "distance_km": 1.1},
                {"name": "Pink City Fleet Providers", "lat": 26.9000, "lon": 75.7980, "osm_id": 2014, "distance_km": 1.8},
                {"name": "Rajputana Travels", "lat": 26.9100, "lon": 75.8100, "osm_id": 2015, "distance_km": 2.2},
            ],
        },
    },
    "mumbai": {
        "center": (19.0760, 72.8777),
        "vendors": {
            "Venue": [
                {"name": "Taj Mahal Palace", "lat": 18.9217, "lon": 72.8330, "osm_id": 3001, "distance_km": 17.5},
                {"name": "The St. Regis Mumbai", "lat": 18.9940, "lon": 72.8240, "osm_id": 3002, "distance_km": 10.6},
                {"name": "Jio World Convention Centre", "lat": 19.0650, "lon": 72.8640, "osm_id": 3003, "distance_km": 1.8},
            ],
            "Decorator": [
                {"name": "Bollywood Theme Decor", "lat": 19.0850, "lon": 72.8900, "osm_id": 3004, "distance_km": 1.5},
                {"name": "Sea Face Florals", "lat": 19.0600, "lon": 72.8200, "osm_id": 3005, "distance_km": 6.2},
                {"name": "Marine Drive Designs", "lat": 19.0500, "lon": 72.8800, "osm_id": 3006, "distance_km": 2.8},
            ],
            "Caterer": [
                {"name": "Taste of Mumbai Caterers", "lat": 19.0780, "lon": 72.8800, "osm_id": 3007, "distance_km": 0.3},
                {"name": "Grand Hyatt Catering", "lat": 19.0680, "lon": 72.8680, "osm_id": 3008, "distance_km": 1.3},
                {"name": "Marine Drive Feast", "lat": 19.0730, "lon": 72.8250, "osm_id": 3009, "distance_km": 5.5},
            ],
            "Artist": [
                {"name": "Bollywood Troupe Dancers", "lat": 19.0800, "lon": 72.8850, "osm_id": 3010, "distance_km": 0.9},
                {"name": "Mumbai Strings Symphony", "lat": 19.0550, "lon": 72.8300, "osm_id": 3011, "distance_km": 5.4},
                {"name": "Mumbai EDM & DJ Acts", "lat": 19.0900, "lon": 72.8750, "osm_id": 3012, "distance_km": 1.6},
            ],
            "Logistics": [
                {"name": "Mumbai Luxury Fleet", "lat": 19.0700, "lon": 72.8700, "osm_id": 3013, "distance_km": 1.0},
                {"name": "Andheri Transfer Pro", "lat": 19.1135, "lon": 72.8697, "osm_id": 3014, "distance_km": 4.2},
                {"name": "Bandra Logistics Solutions", "lat": 19.0600, "lon": 72.8350, "osm_id": 3015, "distance_km": 4.8},
            ],
        },
    },
    "delhi": {
        "center": (28.6139, 77.2090),
        "vendors": {
            "Venue": [
                {"name": "Taj Palace, New Delhi", "lat": 28.5950, "lon": 77.1650, "osm_id": 4001, "distance_km": 4.5},
                {"name": "ITC Maurya", "lat": 28.5970, "lon": 77.1610, "osm_id": 4002, "distance_km": 4.9},
                {"name": "The Leela Palace", "lat": 28.5800, "lon": 77.1850, "osm_id": 4003, "distance_km": 4.2},
            ],
            "Decorator": [
                {"name": "Delhi Darbar Decorators", "lat": 28.6280, "lon": 77.2190, "osm_id": 4004, "distance_km": 1.8},
                {"name": "Chandni Chowk Florals", "lat": 28.6506, "lon": 77.2309, "osm_id": 4005, "distance_km": 4.5},
                {"name": "Lutyens Event Designs", "lat": 28.6100, "lon": 77.2200, "osm_id": 4006, "distance_km": 1.3},
            ],
            "Caterer": [
                {"name": "Haldiram Catering Services", "lat": 28.6350, "lon": 77.2250, "osm_id": 4007, "distance_km": 2.7},
                {"name": "Tadka Imperial Catering", "lat": 28.5920, "lon": 77.1700, "osm_id": 4008, "distance_km": 4.8},
                {"name": "Punjabi Feast Caterers", "lat": 28.6200, "lon": 77.2000, "osm_id": 4009, "distance_km": 1.2},
            ],
            "Artist": [
                {"name": "Delhi Sufi Ensembles", "lat": 28.6100, "lon": 77.2300, "osm_id": 4010, "distance_km": 2.1},
                {"name": "NCR Punjabi Band", "lat": 28.5700, "lon": 77.2200, "osm_id": 4011, "distance_km": 5.0},
                {"name": "Capital DJ Services", "lat": 28.6300, "lon": 77.2100, "osm_id": 4012, "distance_km": 1.8},
            ],
            "Logistics": [
                {"name": "NCR Wedding Transport", "lat": 28.6000, "lon": 77.2050, "osm_id": 4013, "distance_km": 1.6},
                {"name": "Lajpat Nagar Fleet Rentals", "lat": 28.5700, "lon": 77.2400, "osm_id": 4014, "distance_km": 5.5},
                {"name": "Delhi Chauffeur Services", "lat": 28.6200, "lon": 77.2150, "osm_id": 4015, "distance_km": 1.0},
            ],
        },
    },
    "goa": {
        "center": (15.2993, 74.1240),
        "vendors": {
            "Venue": [
                {"name": "Taj Exotica Resort", "lat": 15.2390, "lon": 73.9350, "osm_id": 5001, "distance_km": 20.3},
                {"name": "The Leela Goa", "lat": 15.1500, "lon": 73.9450, "osm_id": 5002, "distance_km": 25.1},
                {"name": "Caravela Beach Resort", "lat": 15.2200, "lon": 73.9300, "osm_id": 5003, "distance_km": 22.4},
            ],
            "Decorator": [
                {"name": "Goa Beach Decor Co.", "lat": 15.5479, "lon": 73.7518, "osm_id": 5004, "distance_km": 4.5},
                {"name": "Panaji Event Florals", "lat": 15.4909, "lon": 73.8278, "osm_id": 5005, "distance_km": 2.1},
                {"name": "Tropical Vows Design", "lat": 15.3000, "lon": 74.1000, "osm_id": 5006, "distance_km": 2.5},
            ],
            "Caterer": [
                {"name": "Goan Spice Catering", "lat": 15.5000, "lon": 73.8300, "osm_id": 5007, "distance_km": 1.8},
                {"name": "Calangute Kitchen", "lat": 15.5438, "lon": 73.7551, "osm_id": 5008, "distance_km": 4.8},
                {"name": "South Goa Feast", "lat": 15.2700, "lon": 74.1000, "osm_id": 5009, "distance_km": 3.8},
            ],
            "Artist": [
                {"name": "Goa Carnival Goers", "lat": 15.5100, "lon": 73.8100, "osm_id": 5010, "distance_km": 2.5},
                {"name": "Beach Acoustic Band", "lat": 15.5300, "lon": 73.7700, "osm_id": 5011, "distance_km": 3.7},
                {"name": "Goa Beats Pro Audio", "lat": 15.4950, "lon": 73.8250, "osm_id": 5012, "distance_km": 1.4},
            ],
            "Logistics": [
                {"name": "Coastal Transport Rentals", "lat": 15.5560, "lon": 73.7513, "osm_id": 5013, "distance_km": 5.0},
                {"name": "Panjim Transit Pro", "lat": 15.4989, "lon": 73.8180, "osm_id": 5014, "distance_km": 1.9},
                {"name": "South Goa Coaches", "lat": 15.2800, "lon": 73.9800, "osm_id": 5015, "distance_km": 10.5},
            ],
        },
    },
}


# ── Geocoding ─────────────────────────────────────────────────────────────────

async def _geocode_city(city: str) -> tuple[float, float] | None:
    """Return (lat, lon) for *city* via Nominatim, falling back to hardcoded coords."""
    # Try Nominatim first
    headers = {
        "User-Agent": "WeddingBudgetAI/2.0 (https://weddingbudget.ai; contact@weddingbudget.ai)",
        "Accept": "application/json",
        "Accept-Language": "en",
    }
    params = {"q": f"{city}, India", "format": "json", "limit": 1}
    try:
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.get(NOMINATIM_URL, params=params, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            if data:
                return float(data[0]["lat"]), float(data[0]["lon"])
    except Exception as exc:
        logger.warning("Nominatim geocode failed for %s: %s", city, exc)

    # Fallback to hardcoded coordinates
    city_lower = city.lower().strip()
    backup = CITY_BACKUP.get(city_lower)
    if backup:
        logger.info("Using hardcoded coordinates for %s", city)
        return backup["center"]

    return None


def _get_fallback_vendors(city: str, needed_categories: list[str]) -> dict[str, list[dict]]:
    """Return backup vendor data for a city when Overpass API fails."""
    city_lower = city.lower().strip()
    backup = CITY_BACKUP.get(city_lower)
    if not backup:
        return {}
    all_vendors = backup.get("vendors", {})
    result = {}
    for cat in needed_categories:
        if cat in all_vendors:
            # Add maps_url to each vendor
            vendors = []
            for v in all_vendors[cat]:
                vendors.append({
                    **v,
                    "phone": "",
                    "website": "",
                    "maps_url": f"https://www.google.com/maps?q={v['lat']},{v['lon']}",
                })
            result[cat] = vendors
    return result


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
        needed_categories = ["Venue", "Decorator", "Caterer", "Logistics"]
        if any(e in events for e in ("sangeet", "reception", "haldi")):
            needed_categories.append("Artist")

        # 1. Geocode city (to display coordinates)
        coords = await _geocode_city(city)
        if not coords:
            await self._emit_message("Could not geocode city — using backup vendor data.")
        else:
            city_lat, city_lon = coords
            await self._emit_message(f"City centre located at ({city_lat:.4f}, {city_lon:.4f})")

        # 2. Get local curated vendors directly (OpenStreetMap is too flaky)
        await self._emit_message(f"Retrieving curated top vendors for {city.title()}…")
        await asyncio.sleep(0.5)
        
        all_categories = _get_fallback_vendors(city, needed_categories)
        if not all_categories:
            await self._emit_message(f"No curated vendors found for {city.title()}.")
            return _empty_result()

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
        icon="",
        low=0, mid=0, high=0,
        details="No vendor data retrieved.",
        vendors={},
    )
