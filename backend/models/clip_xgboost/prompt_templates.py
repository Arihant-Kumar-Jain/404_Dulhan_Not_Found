"""
Custom CLIP prompt templates for wedding decor price prediction.

build_prompt(label) → rich natural-language string encoding ALL metadata.
Admin-added keys in label["admin_extra"] appear as:
    "Additionally occupied: key1: val1, key2: val2"
"""
from __future__ import annotations

BASE_PROMPTS: dict[str, str] = {
    "mehendi": (
        "A {style} mehendi ceremony, complexity {complexity}/5, "
        "{guest_range} guests, {setting} setting, {floral} floral work, "
        "city tier {city_tier}. Additionally occupied: {extra}"
    ),
    "sangeet": (
        "A {style} sangeet stage setup, complexity {complexity}/5, "
        "{guest_range} guests, {led} LED backdrop, {setting} venue, "
        "city tier {city_tier}. Additionally occupied: {extra}"
    ),
    "reception": (
        "A {style} wedding reception hall, complexity {complexity}/5, "
        "{guest_range} guests, {setting} setting, {floral} floral arch, "
        "city tier {city_tier}. Additionally occupied: {extra}"
    ),
    "haldi": (
        "A haldi ceremony, {style} style, complexity {complexity}/5, "
        "{guest_range} guests, {setting}. City tier {city_tier}. "
        "Additionally occupied: {extra}"
    ),
    "baraat": (
        "A {style} baraat procession décor, complexity {complexity}/5, "
        "{guest_range} guests, {setting}, city tier {city_tier}. "
        "Additionally occupied: {extra}"
    ),
    "pheras": (
        "A {style} wedding mandap with sacred fire, complexity {complexity}/5, "
        "{guest_range} guests, {floral} floral pillars, {setting}. "
        "City tier {city_tier}. Additionally occupied: {extra}"
    ),
}

_GUEST_RANGE_MAP = [
    (200,   "<200 guests"),
    (500,   "200–500 guests"),
    (1000,  "500–1000 guests"),
    (99999, ">1000 guests"),
]

def _guest_range_label(guest_count: int) -> str:
    for threshold, label in _GUEST_RANGE_MAP:
        if guest_count <= threshold:
            return label
    return ">1000 guests"


def build_prompt(label: dict) -> str:
    """
    Construct a rich text prompt from a decor label dict.

    Required keys: function, style, complexity
    Optional keys: guest_count, guest_range, is_outdoor, has_floral_ceiling,
                   has_led_backdrop, city_tier, admin_extra
    """
    fn = label.get("function", "reception")
    template = BASE_PROMPTS.get(fn, BASE_PROMPTS["reception"])

    # Admin-extra fields → "Additionally occupied" suffix
    extra_dict = label.get("admin_extra", {})
    extra_parts = [
        f"{k.replace('_', ' ')}: {v}"
        for k, v in extra_dict.items()
    ]
    extra_str = ", ".join(extra_parts) if extra_parts else "none"

    # Derive guest_range label
    if "guest_range" in label:
        guest_range = label["guest_range"]
    elif "guest_count" in label:
        guest_range = _guest_range_label(int(label["guest_count"]))
    else:
        guest_range = "mixed guest count"

    return template.format(
        style      = label.get("style", "traditional"),
        complexity = label.get("complexity", 3),
        guest_range= guest_range,
        setting    = "outdoor" if label.get("is_outdoor", False) else "indoor",
        floral     = "heavy" if label.get("has_floral_ceiling", False) else "minimal",
        led        = "with" if label.get("has_led_backdrop", False) else "without",
        city_tier  = label.get("city_tier", 2),
        extra      = extra_str,
    )
