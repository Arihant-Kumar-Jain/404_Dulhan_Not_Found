"""
Centralized cost data for all estimation agents.
Edit these dicts to update pricing — no code changes needed elsewhere.

All monetary values are in INR (₹) per unit described in comments.
"""
from typing import Any

# ── Venue ────────────────────────────────────────────────────────────────────
# Per room per night (INR)
VENUE_COSTS: dict[str, dict[str, dict[str, float]]] = {
    "udaipur": {
        "5star_palace": {"low": 30_000, "mid": 45_000, "high": 65_000},
        "5star_city":   {"low": 15_000, "mid": 25_000, "high": 40_000},
        "4star":        {"low":  8_000, "mid": 12_000, "high": 18_000},
        "resort":       {"low": 10_000, "mid": 18_000, "high": 30_000},
        "farmhouse":    {"low":  5_000, "mid": 10_000, "high": 15_000},
    },
    "jaipur": {
        "5star_palace": {"low": 25_000, "mid": 40_000, "high": 55_000},
        "5star_city":   {"low": 12_000, "mid": 20_000, "high": 35_000},
        "4star":        {"low":  7_000, "mid": 11_000, "high": 16_000},
        "resort":       {"low":  8_000, "mid": 15_000, "high": 25_000},
        "farmhouse":    {"low":  4_000, "mid":  8_000, "high": 12_000},
    },
    "mumbai": {
        "5star_palace": {"low": 35_000, "mid": 50_000, "high": 75_000},
        "5star_city":   {"low": 18_000, "mid": 30_000, "high": 50_000},
        "4star":        {"low": 10_000, "mid": 15_000, "high": 22_000},
        "resort":       {"low": 12_000, "mid": 20_000, "high": 35_000},
        "farmhouse":    {"low":  6_000, "mid": 12_000, "high": 18_000},
    },
    "delhi": {
        "5star_palace": {"low": 28_000, "mid": 42_000, "high": 60_000},
        "5star_city":   {"low": 15_000, "mid": 25_000, "high": 45_000},
        "4star":        {"low":  9_000, "mid": 13_000, "high": 20_000},
        "resort":       {"low": 10_000, "mid": 18_000, "high": 28_000},
        "farmhouse":    {"low":  5_000, "mid": 10_000, "high": 16_000},
    },
    "goa": {
        "5star_palace": {"low": 20_000, "mid": 35_000, "high": 50_000},
        "5star_city":   {"low": 12_000, "mid": 22_000, "high": 38_000},
        "4star":        {"low":  7_000, "mid": 10_000, "high": 15_000},
        "resort":       {"low": 10_000, "mid": 16_000, "high": 30_000},
        "farmhouse":    {"low":  5_000, "mid":  9_000, "high": 14_000},
    },
    "jodhpur": {
        "5star_palace": {"low": 22_000, "mid": 38_000, "high": 55_000},
        "5star_city":   {"low": 10_000, "mid": 18_000, "high": 30_000},
        "4star":        {"low":  6_000, "mid": 10_000, "high": 15_000},
        "resort":       {"low":  8_000, "mid": 14_000, "high": 22_000},
        "farmhouse":    {"low":  4_000, "mid":  7_000, "high": 12_000},
    },
}
VENUE_FALLBACK_CITY = "delhi"
VENUE_FALLBACK_TIER = "4star"

# ── Food & Beverage ───────────────────────────────────────────────────────────
# Per guest per meal (INR)
FNB_COSTS: dict[str, dict[str, dict[str, float]]] = {
    "welcome_dinner": {
        "veg":   {"low": 1_800, "mid": 2_500, "high": 4_000},
        "nonveg":{"low": 2_200, "mid": 3_000, "high": 5_000},
    },
    "lunch_buffet": {
        "veg":   {"low": 1_200, "mid": 1_800, "high": 3_000},
        "nonveg":{"low": 1_500, "mid": 2_200, "high": 3_500},
    },
    "gala_dinner": {
        "veg":   {"low": 2_500, "mid": 3_500, "high": 6_000},
        "nonveg":{"low": 3_000, "mid": 4_500, "high": 7_500},
    },
    "cocktail_snacks": {
        "veg":   {"low":   800, "mid": 1_200, "high": 2_000},
        "nonveg":{"low": 1_000, "mid": 1_500, "high": 2_500},
    },
}
# Event → meal mapping
EVENT_MEAL_MAP: dict[str, str] = {
    "mehendi":  "cocktail_snacks",
    "haldi":    "lunch_buffet",
    "sangeet":  "gala_dinner",
    "baraat":   "cocktail_snacks",
    "pheras":   "lunch_buffet",
    "reception":"gala_dinner",
}

# Bar — per guest per bar event (INR)
BAR_COSTS: dict[str, dict[str, float]] = {
    "dry":       {"low": 0,     "mid": 0,     "high": 0},
    "beer_wine": {"low":  800,  "mid": 1_200, "high": 2_000},
    "full_bar":  {"low": 1_500, "mid": 2_500, "high": 4_500},
}
BAR_EVENTS = {"sangeet", "reception", "cocktail"}

# ── Decor ─────────────────────────────────────────────────────────────────────
# Per event, keyed by complexity tier 1–5 (INR)
DECOR_COSTS: dict[str, dict[str, dict[str, float]]] = {
    "mehendi": {
        "1": {"low":  100_000, "mid":  200_000, "high":   350_000},
        "2": {"low":  200_000, "mid":  400_000, "high":   600_000},
        "3": {"low":  400_000, "mid":  700_000, "high": 1_000_000},
        "4": {"low":  700_000, "mid":1_200_000, "high": 1_800_000},
        "5": {"low":1_200_000, "mid":2_000_000, "high": 3_000_000},
    },
    "haldi": {
        "1": {"low":   80_000, "mid":  150_000, "high":   250_000},
        "2": {"low":  150_000, "mid":  300_000, "high":   500_000},
        "3": {"low":  300_000, "mid":  500_000, "high":   800_000},
        "4": {"low":  500_000, "mid":  900_000, "high": 1_500_000},
        "5": {"low":  900_000, "mid":1_500_000, "high": 2_500_000},
    },
    "sangeet": {
        "1": {"low":  150_000, "mid":  300_000, "high":   500_000},
        "2": {"low":  300_000, "mid":  500_000, "high":   800_000},
        "3": {"low":  500_000, "mid":  900_000, "high": 1_400_000},
        "4": {"low":  900_000, "mid":1_500_000, "high": 2_500_000},
        "5": {"low":1_500_000, "mid":2_500_000, "high": 4_000_000},
    },
    "baraat": {
        "1": {"low":   50_000, "mid":  100_000, "high":   200_000},
        "2": {"low":  100_000, "mid":  200_000, "high":   350_000},
        "3": {"low":  200_000, "mid":  400_000, "high":   600_000},
        "4": {"low":  400_000, "mid":  700_000, "high": 1_000_000},
        "5": {"low":  700_000, "mid":1_200_000, "high": 1_800_000},
    },
    "pheras": {
        "1": {"low":  200_000, "mid":  400_000, "high":   600_000},
        "2": {"low":  400_000, "mid":  700_000, "high": 1_100_000},
        "3": {"low":  700_000, "mid":1_200_000, "high": 1_800_000},
        "4": {"low":1_200_000, "mid":2_000_000, "high": 3_000_000},
        "5": {"low":2_000_000, "mid":3_500_000, "high": 5_500_000},
    },
    "reception": {
        "1": {"low":  200_000, "mid":  400_000, "high":   700_000},
        "2": {"low":  400_000, "mid":  800_000, "high": 1_200_000},
        "3": {"low":  800_000, "mid":1_400_000, "high": 2_200_000},
        "4": {"low":1_400_000, "mid":2_500_000, "high": 3_800_000},
        "5": {"low":2_500_000, "mid":4_000_000, "high": 6_000_000},
    },
}

# ── Artists ───────────────────────────────────────────────────────────────────
# Per booking (INR)
ARTIST_COSTS: dict[str, dict[str, float]] = {
    "local_dj":            {"low":  50_000, "mid":  100_000, "high":   150_000},
    "professional_dj":     {"low": 150_000, "mid":  300_000, "high":   500_000},
    "local_band":          {"low": 100_000, "mid":  200_000, "high":   350_000},
    "bollywood_singer_b":  {"low": 500_000, "mid":  800_000, "high": 1_200_000},
    "bollywood_singer_a":  {"low": 800_000, "mid":1_500_000, "high": 2_500_000},
    "folk_artists":        {"low":  30_000, "mid":   60_000, "high":   100_000},
    "choreographer":       {"low":  50_000, "mid":  100_000, "high":   200_000},
    "anchor":              {"low":  40_000, "mid":   80_000, "high":   150_000},
    "celebrity_performer": {"low":2_000_000,"mid": 5_000_000,"high":10_000_000},
}
ENTERTAINMENT_TIER_MAP: dict[str, list[str]] = {
    "basic":     ["local_dj", "folk_artists"],
    "standard":  ["professional_dj", "local_band", "anchor"],
    "premium":   ["professional_dj", "bollywood_singer_b", "choreographer", "anchor"],
    "celebrity": ["professional_dj", "bollywood_singer_a", "choreographer", "anchor", "celebrity_performer"],
}

# ── Logistics ─────────────────────────────────────────────────────────────────
# Innova Crysta per trip (INR); Ghodi per city (INR)
LOGISTICS_COSTS: dict[str, Any] = {
    "innova_per_trip": {"low": 3_000, "mid": 4_500, "high": 7_000},
    "ghodi": {
        "udaipur": 25_000, "jaipur": 20_000, "mumbai": 35_000,
        "delhi": 30_000, "goa": 20_000, "jodhpur": 18_000,
    },
    "dholi_per_unit":      {"low":  8_000, "mid": 12_000, "high": 18_000},
    "cold_pyro_per_unit":  {"low":  3_000, "mid":  5_000, "high":  8_000},
    "confetti_cannon":     {"low":  2_000, "mid":  3_500, "high":  5_000},
}

# ── Sundries ──────────────────────────────────────────────────────────────────
SUNDRIES: dict[str, Any] = {
    "room_basket": {
        "basic": 500, "standard": 1_200, "premium": 2_500, "luxury": 5_000,
    },
    "ritual_materials": {
        "mehendi": 15_000, "haldi": 20_000, "pheras": 35_000,
    },
    "gift_hampers":         {"basic": 300, "standard": 500, "premium": 800, "luxury": 2_000},
    "stationery_per_guest": {"basic": 100, "standard": 175, "premium": 250, "luxury": 500},
    "contingency_percent":  5,
}
ENTERTAINMENT_TO_SUNDRY_TIER: dict[str, str] = {
    "basic": "basic", "standard": "standard",
    "premium": "premium", "celebrity": "luxury",
}

# ── City tier mapping (for ML feature) ───────────────────────────────────────
CITY_TIER: dict[str, int] = {
    "udaipur": 2, "jaipur": 2, "mumbai": 2, "delhi": 2,
    "goa": 1, "jodhpur": 1,
}
