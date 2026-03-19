"""
Human-in-the-Loop module — handles custom planning questions and user overrides.

Phases:
  1. Pre-calculation questions (structured, sent before agents run)
  2. Per-agent override (user adjusts a category after seeing agent result)
  3. Free-text special requirements (appended as additional context)
"""
from __future__ import annotations
from typing import Any

# ── Pre-Calculation Question Bank ─────────────────────────────────────────────

PRE_CALC_QUESTIONS: list[dict[str, Any]] = [
    {
        "id"      : "special_elements",
        "phase"   : "pre",
        "type"    : "multiselect",
        "question": "Do you want any of these special elements?",
        "options" : [
            "Live Dhol entry during Baraat",
            "Ice sculptures",
            "Custom floral arches",
            "Fire performers",
            "Drone show",
            "Underwater / pool décor",
            "Giant LED screen backdrop",
            "Branded photo booth",
        ],
        "cost_impact": {
            "Live Dhol entry during Baraat"  : 25_000,
            "Ice sculptures"                 : 80_000,
            "Custom floral arches"           : 120_000,
            "Fire performers"                : 50_000,
            "Drone show"                     : 200_000,
            "Underwater / pool décor"        : 250_000,
            "Giant LED screen backdrop"      : 150_000,
            "Branded photo booth"            : 35_000,
        },
    },
    {
        "id"      : "caterer_locked",
        "phase"   : "pre",
        "type"    : "boolean",
        "question": "Do you already have a caterer finalized?",
        "hint"    : "If yes, we'll skip the Dawat Agent estimate and mark it as TBD.",
        "skip_agent_on_yes": "fnb",
    },
    {
        "id"      : "home_to_venue_distance",
        "phase"   : "pre",
        "type"    : "number",
        "question": "Approximate road distance from your home city to venue (km)?",
        "unit"    : "km",
        "default" : 300,
        "hint"    : "Used to estimate inbound guest travel costs.",
    },
    {
        "id"      : "venue_locked",
        "phase"   : "pre",
        "type"    : "boolean",
        "question": "Do you already have a venue / hotel booked?",
        "hint"    : "If yes, enter your actual per-room rate and we'll use that instead.",
        "followup_on_yes": {
            "id"      : "actual_room_rate",
            "type"    : "number",
            "question": "What is your actual room rate (₹ per room per night)?",
            "unit"    : "INR",
        },
    },
    {
        "id"      : "dietary_notes",
        "phase"   : "pre",
        "type"    : "text",
        "question": "Any dietary or cuisine preferences? (e.g., Rajasthani thali, Italian pasta counter)",
        "hint"    : "Free text — passed to F&B agent as context.",
    },
]


def get_pre_calc_questions() -> list[dict[str, Any]]:
    """Return all pre-calculation questions for the wizard frontend."""
    return PRE_CALC_QUESTIONS


def apply_pre_calc_answers(input_data_dict: dict, answers: dict) -> dict:
    """
    Mutate and return `input_data_dict` based on user answers to pre-calc questions.

    Args:
        input_data_dict: The raw wizard input as a dict (before Pydantic validation).
        answers:         {question_id: value} from the frontend.

    Returns:
        Updated input_data_dict with overrides applied.
    """
    # Special elements → extra cost added to sundries
    specials = answers.get("special_elements", [])
    q = next(q for q in PRE_CALC_QUESTIONS if q["id"] == "special_elements")
    extra_cost = sum(q["cost_impact"].get(s, 0) for s in specials)
    input_data_dict.setdefault("extra_special_cost", 0)
    input_data_dict["extra_special_cost"] += extra_cost
    input_data_dict["special_elements"] = specials

    # Skip F&B agent
    if answers.get("caterer_locked"):
        input_data_dict["skip_agents"] = input_data_dict.get("skip_agents", []) + ["fnb"]

    # Override room rate
    if answers.get("venue_locked") and answers.get("actual_room_rate"):
        input_data_dict["override_room_rate"] = float(answers["actual_room_rate"])

    # Extra home-to-venue distance
    if dist := answers.get("home_to_venue_distance"):
        input_data_dict["home_to_venue_km"] = float(dist)

    # Dietary notes → passed through as metadata
    if note := answers.get("dietary_notes"):
        input_data_dict["dietary_notes"] = note

    return input_data_dict


# ── Per-Agent Override (WS message type: human_feedback) ─────────────────────

def process_human_feedback(feedback: dict) -> dict:
    """
    Handle a user's mid-session override.

    Expected payload from frontend:
        {
            "type": "human_feedback",
            "agent_id": "venue",
            "action": "override",
            "override_mid": 2500000,
            "message": "I talked to the hotel — they quoted ₹25L"
        }

    Returns a structured log entry that the orchestrator stores.
    """
    return {
        "type"    : "override_logged",
        "agent_id": feedback.get("agent_id"),
        "action"  : feedback.get("action", "override"),
        "value"   : feedback.get("override_mid"),
        "message" : feedback.get("message", ""),
    }
