# Architecture Diagram Prompts — WeddingBudget.ai

> Copy each prompt below and paste it into **Gemini** (or any other image generation tool) to generate professional architecture diagrams.

---

## Diagram 1: High-Level System Architecture

**Prompt:**
```
Create a professional software architecture diagram for a web application called "WeddingBudget.ai". 
Use a clean, modern design with a dark navy background (#0F1625), white text, and accent colors of maroon (#9A2143), gold (#BFA054), and light blue (#4A9EFF).

Show three main layers in a horizontal flow:

LEFT SIDE — "User Browser" box (dark card):
  - Label: "Next.js 15 Frontend"
  - Sub-items: "/ Landing Page", "/wizard – Planning Form", "/budget – AI Dashboard", "Leaflet Vendor Map", "PDF/CSV Export"
  - Icon: React logo

CENTER — Arrow labeled "WebSocket (ws://)" going right, and HTTP REST arrow labeled "GET/POST" going right. Both arrows point to the center column.

MIDDLE — "FastAPI + Uvicorn" box:
  - Label: "Python Backend (ASGI)"
  - Sub-items: "/api/v1/budget/ws", "/api/v1/decor/predict", "/api/v1/vendors/nearby"
  - Icon: Python snake/FastAPI logo

From the FastAPI box, show a downward arrow to:
  - "Orchestrator" box containing 7 agent cards in a grid: Venue Agent, F&B Agent, Décor Agent (highlighted in gold with star), Artist Agent, Logistics Agent, Sundries Agent, Vendor Search Agent

RIGHT SIDE — Two separate boxes with arrows from the Orchestrator:
  1. "ML Model" box in maroon: "CLIP ViT-B-32 + PyTorch 3-Output Neural Network → [Low / Mid / High]"
  2. "Free APIs" box in blue: "Nominatim (Geocoding), Overpass API (OSM Vendors), ORS Matrix (Distances)"

Use connector lines with labeled arrows. Add a title at the top: "WeddingBudget.ai — System Architecture". Make it look like a professional AWS/GCP architecture diagram.
```

---

## Diagram 2: Agent Pipeline Flow

**Prompt:**
```
Create a professional vertical flowchart / pipeline diagram for a system called "WeddingBudget.ai Agentic Pipeline". 

Use a clean white background with subtle grid lines, rounded rectangle boxes, and a color scheme of: maroon (#9A2143), gold (#BFA054), dark charcoal (#1E1E2E), and green (#2ECC71).

Show the following vertical flow from top to bottom:

1. Hexagon at the top: "User Input (6-Step Wizard)" in gold

2. Arrow down to a rounded rectangle: "Orchestrator" in charcoal background, white text. Show a small icon for sequential processing.

3. Below the Orchestrator, show 7 sequential agent boxes in a vertical stack, each as a card with:
   - Left colored badge for agent number (1–7)
   - Agent name in bold
   - Description in smaller text
   - Status tag on the right
   
   The cards should be:
   1. 🏛 Mahal Agent — Venue & Accommodation — "Lookup table: city × tier × rooms"
   2. 🍽 Dawat Agent — Food & Beverage — "Lookup table: guests × food type × bar"
   3. ✨ Sajawat Agent — Décor Design — "CLIP+PyTorch NN → 3 outputs" [highlight with gold border and "AI" badge]
   4. 🎵 Sangeet Agent — Entertainment — "Rule-based: tier × events"
   5. 🚌 Safar Agent — Logistics — "Rule-based: outstation % × distance"
   6. 🎁 Shagun Agent — Sundries — "Fixed % of subtotal"
   7. 📍 Vendor Agent — OSM Search — "Nominatim → Overpass → ORS" [highlight with blue border and "ASYNC" badge]

4. Arrow down to a green box: "OrchestratorResult → final_budget JSON"

5. Arrow down to three output cards side by side: "Economy Estimate ₹X L", "Standard Estimate ₹Y L" (highlighted, larger), "Luxury Estimate ₹Z L"

6. Two export buttons at the bottom: "Download PDF" and "Export CSV"

Add a title: "Agentic Estimation Pipeline — Sequential Execution Flow"
Style it like a Figma design system flow chart. Professional, minimal, clean.
```

---

## Diagram 3: ML Model Architecture (Décor Neural Network)

**Prompt:**
```
Create a professional neural network architecture diagram for a décor price estimation model called "DecorNNRegressor". 

Use a dark background (#0A0A1A) with glowing layer boxes, bright connection lines, and accent colors of purple (#8B5CF6), orange (#F59E0B), and green (#10B981). Make it look like a modern AI/ML paper figure.

Show the following layers as horizontal boxes from left to right:

INPUT (left side, 3 separate boxes stacked vertically with a bracket):
  Box 1 (blue): "CLIP Text Embedding — 512 dimensions — 'Royal décor for 300 guests...'"
  Box 2 (orange): "Tabular Features — 16 dimensions — [guest_count, decor_complexity, city_tier, one-hot event type, special elements]"
  Box 3: "↕ Concatenate → 528-dim vector"

Then show 4 hidden layers as vertical columns of nodes (use circles or rectangles with gradient shading):
  Layer 1: "Dense 256 + ReLU + BatchNorm + Dropout(0.3)" in purple
  Layer 2: "Dense 128 + ReLU + BatchNorm + Dropout(0.3)" in purple  
  Layer 3: "Dense 64 + ReLU" in purple
  Layer 4: "Dense 3" — output layer in green

OUTPUT (right side, 3 separate colored boxes):
  "Low Estimate — ₹ (floor scenario)"  in blue
  "Mid Estimate — ₹ (most likely)" in green with star/highlight
  "High Estimate — ₹ (premium scenario)" in orange

Show connection lines between layers with arrow flow left to right.

Below the diagram add: "Loss: SmoothL1Loss (Huber) | Optimizer: Adam + CosineAnnealingLR | Input: CLIP ViT-B-32"

Add title: "DecorNNRegressor — 3-Output Price Regression Network"
Style it like a figure from a published ML conference paper (NeurIPS/CVPR style).
```

---

## Diagram 4: Data Flow — WebSocket Communication Protocol

**Prompt:**
```
Create a professional sequence diagram / message flow diagram showing real-time WebSocket communication between a Next.js frontend and FastAPI backend.

Use a clean white background with two vertical swim lanes:
- LEFT lane: "Next.js Browser" (React logo, blue label)
- RIGHT lane: "FastAPI Server" (Python logo, green label)

Show the following sequence of messages with arrows between the lanes and timestamps/message types:

1. → "WebSocket Upgrade Handshake (HTTP 101)"
2. → "{ type: 'start_estimation', data: WeddingParams }"
3. ← "{ type: 'session_start', total_agents: 7 }"

Then show 7 grouped blocks (one per agent), each containing:
   ← "{ type: 'agent_status', agent_id: 'venue', status: 'working' }"
   ← "{ type: 'agent_message', message: '50 rooms × 3 nights @ Udaipur' }"
   ← "{ type: 'agent_status', status: 'done' }"
   ← "{ type: 'agent_result', result: { low, mid, high } }"
   - pause 300ms →
   [repeat for each agent]

Finally:
   ← "{ type: 'final_budget', total_low, total_mid, total_high, categories: [...], vendors: {...} }"

Show the frontend reacting at each stage:
- On agent_status → update HUD card color and indicator
- On final_budget → transition to Budget Dashboard

Label the diagram: "WebSocket Message Sequence — Agentic Budget Estimation"
Include a legend box showing message type colors (status=yellow, result=green, final=maroon).
Style it like a professional API documentation sequence diagram (Stripe/Twilio style).
```

---

## Diagram 5: Frontend Component Tree

**Prompt:**
```
Create a professional React component tree diagram for a Next.js application called "WeddingBudget.ai".

Use a clean design on white background with boxes connected by dark lines. Color-code components by type:
- Blue background: Route Pages
- Green background: Client Components ('use client')
- Orange background: Dynamically loaded (ssr: false)
- Purple background: Zustand Store
- Gray background: CSS Modules

Show this tree structure:

Root:
  layout.tsx (App Shell + Global CSS)
    ├── page.tsx [Blue] — "/ Landing Page"
    │
    ├── wizard/page.tsx [Green] — "Plan Wizard"
    │     ├── WizardProgress (component)
    │     ├── StepCity / StepHotel / StepGuests... (step components)
    │     └── wizardStore.ts [Purple] — "Zustand: currentStep, input, nextStep()"
    │
    └── budget/page.tsx [Green] — "Budget Dashboard"
          ├── Agent HUD Cards (7 × AgentCard)
          │     └── WebSocket → ws://localhost:8000/api/v1/budget/ws
          │
          ├── Summary Cards (Low / Mid / High)
          │
          ├── Category Breakdown Table
          │
          ├── VendorMap.tsx [Orange] — "Leaflet — ssr: false"
          │     ├── MapContainer (react-leaflet)
          │     └── Marker × N (from Overpass API)
          │
          └── ExportPdfButton.tsx [Orange] — "jsPDF — ssr: false"
                └── html2canvas → jsPDF → .pdf file

Also show: globals.css [Gray] with tokens: "--maroon, --gold, --cream, --font-display"

Label: "Next.js 15 App Router — Component Hierarchy"
Make it look like a Figma component explorer or a GitHub code map. Professional, clean.
```

---

## Diagram 6: Vendor Search Data Pipeline

**Prompt:**
```
Create a professional data flow diagram showing how the Vendor Search Agent works in WeddingBudget.ai.

Use a clean design with a light cream background, rounded boxes, and arrows with labels. Use icons where possible (map pin, globe, database icons).

Show this horizontal pipeline with 5 stages:

Stage 1 — INPUT (maroon box):
  Title: "Wedding Input"
  Contents: City = "Udaipur", Events = ["sangeet", "reception"], Radius = 20km

Arrow labeled "city name" →

Stage 2 — GEOCODING (blue box):
  Title: "Nominatim API (OSM)"
  URL: "nominatim.openstreetmap.org/search"
  Output: "lat: 24.5854, lon: 73.7125"

Arrow labeled "lat/lon + radius" →

Stage 3 — VENDOR DISCOVERY (green box):
  Title: "Overpass API (OSM)"
  URL: "overpass-api.de/api/interpreter"  
  Query: "shop=florist, amenity=restaurant, shop=photographer, ..."
  Output: "Raw vendor list: name, lat, lon, tags, osm_id"
  Note: "×4 category queries, 300ms delay between each"

Arrow labeled "vendor coordinates" →

Stage 4 — DISTANCE CALC (orange box, two sub-options):
  Sub-box A: "ORS Matrix API (if API key set)" — driving distance in km
  Sub-box B: "Haversine Formula (fallback)" — straight-line distance

Arrow labeled "enriched vendors" →

Stage 5 — OUTPUT (gold box):
  Title: "VendorSearchResult"
  Contents: Dict of categories → top-5 vendors sorted by distance
  Example: "Decorators: [{name: 'Floral Art', lat: ..., distance_km: 2.1, maps_url: '...'}]"

Arrow → "Leaflet Map Markers (frontend)"

Below the diagram add a note box:
  "All APIs are free & open-source. No Google Maps. No paid keys required (ORS optional)."
  "Overpass may timeout (504) — agent returns empty on failure. Budget pipeline continues."

Title: "VendorSearchAgent — Free OSM Data Pipeline"
```
