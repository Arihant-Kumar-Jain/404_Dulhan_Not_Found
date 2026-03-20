# WeddingBudget.ai — AI-Powered Indian Wedding Budget Estimator

<div align="center">

  

  <h3>404 Dulhan Not Found</h3>
  <p><i>Plan smarter. Celebrate bigger. Worry less.</i></p>

  <!-- Links -->
  <p>
    <a href="docs/PRODUCT_DOCUMENT.md"><b>Product Document |</b></a>
    <a href="SETUP_GUIDE.md"><b>Setup Guide |</b></a>
    <a href="https://youtu.be/R31dDlCtr10"><b> Youtube Demo Video </b></a>
    
  </p>

  <!-- Badges -->
  <p>
    <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="MIT License"/></a>
    <a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.10+-green.svg" alt="Python 3.10+"/></a>
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black.svg" alt="Next.js 15"/></a>
    <a href="https://pytorch.org/"><img src="https://img.shields.io/badge/PyTorch-2.x-red.svg" alt="PyTorch"/></a>
    <a href="https://fastapi.tiangolo.com/"><img src="https://img.shields.io/badge/FastAPI-ASGI-teal.svg" alt="FastAPI"/></a>
    <a href="https://openai.com/research/clip"><img src="https://img.shields.io/badge/CLIP-ViT--B/32-purple.svg" alt="CLIP"/></a>
  </p>

</div>

---

## 📋 Table of Contents

- [Executive Summary](#-executive-summary)
- [Key Innovations](#-key-innovations)
- [Project Structure](#-project-structure)
- [The 7 AI Agents](#-the-7-ai-agents)
- [ML Model — Décor Neural Network](#-ml-model--décor-neural-network)
- [Vendor Intelligence Module](#-vendor-intelligence-module)
- [Frontend Architecture](#-frontend-architecture)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Performance Benchmarks](#-performance-benchmarks)
- [Design Decisions](#-design-decisions)
- [Citations & Acknowledgments](#-citations--acknowledgments)
- [License](#-license)

---

## 🎯 Executive Summary

WeddingBudget.ai is a full-stack, agentic AI system that produces a complete Indian wedding cost estimate in under **90 seconds** — replacing the traditional process of gathering 10+ vendor quotes over weeks.

Users complete a **6-step planning wizard** (city, venue tier, guest count, events, décor, F&B). Seven specialized AI agents then run in the background, streaming live progress to the browser over WebSockets. The result: a detailed **Low / Mid / High budget breakdown** by category, paired with an **interactive vendor map** showing real nearby vendors from OpenStreetMap.

> All prices are in **₹ INR**, city-calibrated, and export-ready as **PDF or CSV**.

---

## 🏆 Key Innovations

| Feature | Innovation | Impact |
|---------|-----------|--------|
| **7-Agent AI Pipeline** | Autonomous multi-agent orchestrator with WebSocket streaming | Real-time progress HUD, 90-second full estimate |
| **CLIP + PyTorch Décor Model** | ViT-B/32 text embeddings + 3-output neural network | ML price estimation for the most subjective cost category |
| **Free Vendor Discovery** | Nominatim + Overpass API (OSM) — zero paid APIs | Interactive vendor map near wedding city with no API cost |
| **SSR-Safe PDF Export** | jsPDF isolated in `ssr: false` dynamic component | Download branded quote report with one click |
| **Premium Design System** | DM Serif Display / Inter · Cream-Maroon-Gold palette | Luxury aesthetic matching Indian wedding sensibility |
| **Real-time WebSocket HUD** | Typed JSON event protocol per-agent | Users watch agents "think" — transparent AI process |

---

## 📁 Project Structure

```
404_Dulhan_Not_Found/
│
├── src/                              # Next.js 15 Frontend
│   ├── app/
│   │   ├── page.tsx                  # Landing page — hero, features, CTA
│   │   ├── wizard/page.tsx           # Multi-step planning wizard (6 steps)
│   │   └── budget/page.tsx           # Agentic HUD loading + Budget Dashboard
│   ├── components/
│   │   ├── VendorMap.tsx             # Leaflet map — OSM vendor markers (ssr: false)
│   │   └── ExportPdfButton.tsx       # jsPDF + html2canvas PDF export (ssr: false)
│   ├── stores/wizardStore.ts         # Zustand wizard state management
│   └── data/constants.ts             # City/tier/event/style lookup lists
│
├── backend/
│   ├── main.py                       # FastAPI app entry + CORS setup
│   ├── config.py                     # Pydantic Settings — env var management
│   ├── requirements.txt              # Python dependencies (pip freeze)
│   ├── .env.example                  # Environment variable template
│   │
│   ├── routers/
│   │   ├── budget.py                 # WebSocket orchestrator endpoint (/ws)
│   │   ├── decor.py                  # CLIP+NN decor prediction REST endpoint
│   │   ├── vendors.py                # OSM vendor search REST endpoint
│   │   └── labels.py                 # Training label CRUD
│   │
│   ├── estimation_pipeline/
│   │   ├── orchestrator.py           # Runs all 7 agents, aggregates results
│   │   ├── human_in_loop.py          # Human feedback integration
│   │   ├── agents/
│   │   │   ├── base_agent.py         # Abstract base + WebSocket emit helpers
│   │   │   ├── venue_agent.py        # Hotel/palace cost (city × tier × rooms × nights)
│   │   │   ├── fnb_agent.py          # Food & Beverage (guests × food_type × bar)
│   │   │   ├── decor_agent.py        # CLIP+NN ML decor estimation
│   │   │   ├── artist_agent.py       # Entertainment (tier × events)
│   │   │   ├── logistics_agent.py    # Transport (outstation% × city_tier)
│   │   │   ├── sundries_agent.py     # Misc costs (% of subtotal + itemised)
│   │   │   └── vendor_search_agent.py # OSM vendor map scraper (fully async)
│   │   └── data/
│   │       └── costs.py              # Central INR pricing tables — edit here only
│   │
│   ├── models/
│   │   └── clip_xgboost/
│   │       ├── model.py              # DecorNNRegressor — PyTorch 3-output NN
│   │       ├── feature_extractor.py  # CLIP + tabular feature pipeline
│   │       ├── predict.py            # Inference wrapper (lazy-loads model)
│   │       ├── train.py              # Training script
│   │       └── prompt_templates.py   # CLIP text prompt builder
│   │
│   └── tests/
│       ├── test_agents.py            # Agent unit tests (AgentResult schema)
│       ├── test_model.py             # ML model tests (train/load/predict)
│       └── test_api.py               # API integration tests (httpx + pytest)
│
├── docs/
│   ├── PRODUCT_DOCUMENT.md           # design decisions
│
├── README.md
├── SETUP_GUIDE.md
└── LICENSE
```

---

## 🤖 The 7 AI Agents

Each agent inherits from `BaseAgent` and streams typed JSON status/message/result events over WebSocket as it works:

| # | Agent ID | Name | Method | Output |
|---|----------|------|--------|--------|
| 1 | `venue` | **Mahal Agent** | Lookup table: `city × tier × rooms × nights` | Venue & accommodation cost |
| 2 | `fnb` | **Dawat Agent** | Lookup table: `guests × food_type × bar_type × events` | F&B catering cost |
| 3 | `decor` | **Sajawat Agent** ✨ | **CLIP ViT-B/32 + PyTorch NN** → `[low, mid, high]` | Décor cost + AI confidence |
| 4 | `artist` | **Sangeet Agent** | Lookup table: `entertainment_tier × event_count` | Artist/DJ/entertainment cost |
| 5 | `logistics` | **Safar Agent** | Lookup table: `outstation_pct × guests × city_tier` | Travel & hospitality blocks |
| 6 | `sundries` | **Shagun Agent** | Fixed % of subtotal + itemised misc | Gifts, printing, miscellaneous |
| 7 | `vendor_search` | **Nearby Vendor Agent** | Nominatim → Overpass API → ORS/Haversine | Real vendor map data (no cost) |

All pricing tables are in a **single file** — `estimation_pipeline/data/costs.py` — no algorithm changes needed to update prices.

### WebSocket Event Protocol

```jsonc
// Agent starts working
{ "type": "agent_status", "agent_id": "decor", "status": "working", "message": "Running CLIP inference..." }

// Mid-progress human-readable update
{ "type": "agent_message", "agent_id": "fnb", "message": "Estimate → ₹8.2L (mid-range)" }

// Agent completes
{ "type": "agent_result", "agent_id": "venue", "result": { "low": 960000, "mid": 1500000, "high": 2400000 } }

// All agents done — triggers Dashboard transition
{ "type": "final_budget", "total_low": 5200000, "total_mid": 8400000, "total_high": 14200000, "categories": [...], "vendors": {...} }
```

---

## 🧠 ML Model — Décor Neural Network

Décor is the most subjective Indian wedding cost — the same "royal" event can cost ₹3L or ₹80L. It cannot be modeled with fixed lookup tables. **DecorNNRegressor** solves this with semantic understanding via CLIP.

### Architecture

![alt text](./assets/ml.jpg)

**Text prompt example fed to CLIP:**
> *"Royal Rajputana style wedding décor for reception with 300 guests, cold pyros, custom stage, complexity level 4, Category A city"*

**Loss:** `SmoothL1Loss` (Huber — robust to price outliers)  
**Optimizer:** Adam + CosineAnnealingLR

### Why Three Outputs?

Indian wedding vendors universally quote price **ranges** — not fixed prices. Three outputs let users plan for best case (Low), most likely (Mid), and contingency (High) scenarios.

---

## 📍 Vendor Intelligence Module

The `VendorSearchAgent` uses **100% free, open-source APIs** — no Google Maps, no paid keys required:


**Vendor categories searched:** Decorators · Caterers · Photography Studios · AV/Sound · Tent & Furniture

> Overpass 504 Gateway Timeouts are caught silently — the budget pipeline continues even if vendor data is unavailable.

---

## 🎨 Frontend Architecture

### Wizard State (Zustand)

The 6-step wizard uses **Zustand** for state across steps. On completion, `WeddingParams` is written to `localStorage` before routing to `/budget` — keeping pages fully independent with no prop drilling across routes.

### SSR Compatibility

Two libraries require strict client-only isolation in Next.js 15:

| Library | Issue | Solution |
|---------|-------|----------|
| `leaflet` | Requires browser DOM (`window`, `document`) | `VendorMap` wrapped in `dynamic(..., { ssr: false })` |
| `jspdf` | Uses `fflate/lib/node.cjs` Worker threads | `ExportPdfButton` is a separate component, dynamically imported with `{ ssr: false }` |

### Design Tokens

```css
--maroon:       #9A2143   /* Primary brand */
--gold:         #BFA054   /* Accents, CTAs */
--bg-cream:     #FAF7F2   /* Page backgrounds */
--font-display: 'DM Serif Display'  /* Headings */
--font-body:    'Inter'             /* Body text */
```

---

## 🚀 Getting Started

See **[SETUP_GUIDE.md](SETUP_GUIDE.md)** for the complete installation walkthrough, or use the one-command script below.

### One-Command Setup (Recommended)

```bash
# Linux / macOS
bash setup.sh

# Windows (PowerShell)
.\setup.ps1
```

The script creates your venv, installs all Python and Node dependencies, and generates a pre-filled `.env` file ready to edit.

### Quick Start (Manual)

```bash
# 1. Clone
git clone https://github.com/your-org/404_Dulhan_Not_Found.git
cd 404_Dulhan_Not_Found

# 2. Backend
cd backend
python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
cp backend/.env.example backend/.env
# Fill in your secrets in backend/.env (see below)
uvicorn backend.main:app --reload

# 3. Frontend (new terminal, project root)
npm install
npm run dev
```

Visit `http://localhost:3000` → Plan Your Wedding → Watch the AI agents work → Get your budget.

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.10+ | venv recommended |
| Node.js | 18+ | for Next.js |
| CUDA Toolkit | 12.1 (optional) | GPU for faster CLIP inference |

### Environment Variables

Only **two variables** are required. Create `backend/.env` and set:

```env
# Supabase / PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:port/dbname

# Groq API key — powers the LLM planning layer
GROQ_API_KEY=gsk_your_key_here
```

> Get a free Groq key at [console.groq.com](https://console.groq.com).  
> Get your Supabase connection string from Project Settings → Database → Connection string.

### Running Tests

```bash
cd backend
python -m pytest tests/ -v
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `WS` | `/api/v1/budget/ws` | Agentic budget estimation (real-time stream) |
| `POST` | `/api/v1/decor/predict` | Décor price prediction (CLIP+NN) |
| `POST` | `/api/v1/vendors/nearby` | OSM vendor search near a city |
| `GET` | `/api/v1/labels/` | Training label management |
| `GET` | `/docs` | Swagger UI |

**WebSocket message:** `{ "type": "start_estimation", "data": { ...WeddingParams } }`

---

## ⚡ Performance Benchmarks

| Operation | Time | Notes |
|-----------|------|-------|
| Venue + F&B + Artist + Logistics + Sundries | ~2–4s | Rule-based, CPU |
| Décor (CLIP encoding + NN inference) | ~8–15s | GPU: 8s / CPU: ~30s |
| Vendor Search (Nominatim + Overpass × 4) | ~20–45s | Network-dependent |
| **Full pipeline (all 7 agents)** | **~45–90s** | Primary bottleneck: vendor API |
| PDF export (client-side) | ~3–5s | html2canvas @ 2× scale |

---

## 🛠 Design Decisions

**Sequential agent execution** — Agents run one-by-one rather than in parallel (`asyncio.gather`). Overpass API enforces strict rate limits and the CLIP model is GPU-memory-intensive; sequential execution avoids 429 errors and OOM crashes while still providing a real-time streaming HUD.

**Rule-based for 5 agents, ML for 1** — Venue, F&B, Artist, Logistics, and Sundries are deterministic given inputs (rooms × nights × rate). ML adds value only for Décor where semantic style complexity drives meaningful price variance beyond what tables can capture.

**numpy `_json_safe()` serializer** — PyTorch/numpy return `float64` scalars which are not JSON-serializable by Python's default encoder. A recursive converter in `budget.py` ensures the WebSocket payload never crashes silently on the final emission.

**`localStorage` for inter-page state** — The wizard and budget pages are independent Next.js routes with no shared layout state. Writing `WeddingParams` to `localStorage` on wizard completion is the simplest cross-route handoff that works with or without authentication.

---

## 📝 Citations & Acknowledgments

### Research & Models

1. **CLIP (Radford et al., OpenAI)**
   ```bibtex
   @inproceedings{radford2021clip,
     title={Learning Transferable Visual Models From Natural Language Supervision},
     author={Radford, Alec and Kim, Jong Wook and Hallacy, Chris and others},
     booktitle={ICML},
     year={2021}
   }
   ```

2. **open-clip-torch (LAION)**
   ```bibtex
   @software{openclip,
     author = {Ilharco, Gabriel and Wortsman, Mitchell and Wightman, Ross and Gordon, Cade and Carlini, Nicholas and Taori, Rohan and Dave, Achal and Shankar, Vaishaal and Namkoong, Hongseok and Miller, John and Fang, Alex and Ritter, Michael and Schmidt, Ludwig},
     title = {OpenCLIP},
     year = {2021},
     url = {https://doi.org/10.5281/zenodo.5143773}
   }
   ```

3. **SwinIR (Liang et al.)**
   ```bibtex
   @inproceedings{liang2021swinir,
     title={SwinIR: Image Restoration Using Swin Transformer},
     author={Liang, Jingyun and Cao, Jiezhang and Sun, Guolei and others},
     booktitle={ICCV},
     year={2021}
   }
   ```

4. **FastAPI**
   ```bibtex
   @software{fastapi,
     author = {Sebastián Ramírez},
     title = {FastAPI},
     url = {https://github.com/tiangolo/fastapi},
     year = {2019}
   }
   ```

### Open-Source Libraries

<table>
  <tr>
    <td align="center" width="120">
      <img src="https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png" height="40"/><br>
      <sub><b>FastAPI</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" height="40"/><br>
      <sub><b>React / Next.js</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://upload.wikimedia.org/wikipedia/commons/1/10/PyTorch_logo_icon.svg" height="40"/><br>
      <sub><b>PyTorch</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://huggingface.co/front/assets/huggingface_logo-noborder.svg" height="40"/><br>
      <sub><b>HuggingFace</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://leafletjs.com/docs/images/logo.png" height="40"/><br>
      <sub><b>Leaflet</b></sub>
    </td>
    <td align="center" width="120">
      <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" height="40"/><br>
      <sub><b>CLIP (OpenAI)</b></sub>
    </td>
  </tr>
</table>

### Special Thanks

- **LAION** for open CLIP pre-trained weights (`laion2b_s34b_b79k`)
- **OpenStreetMap contributors** for the free geo data powering the vendor map
- **Pydantic & Uvicorn** teams for making Python async APIs a joy to build
- **Vercel / Next.js** team for the App Router architecture
- **Indian wedding community** for inspiring this problem worth solving

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ for Indian families planning the wedding of their dreams**

*AI-powered planning · Real vendor data · Zero paid APIs*

</div>
