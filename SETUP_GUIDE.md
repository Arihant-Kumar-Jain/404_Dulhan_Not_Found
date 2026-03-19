# Setup Guide — WeddingBudget.ai

## Prerequisites

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Python | 3.10+ | Conda/venv both work |
| Node.js | 18+ | For Next.js frontend |
| CUDA Toolkit | 12.1 (optional) | GPU acceleration for CLIP model |
| Git | Any | To clone the repo |

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-org/404_Dulhan_Not_Found.git
cd 404_Dulhan_Not_Found
```

---

## 2. Backend Setup (Python)

### 2a. Create & activate a virtual environment

```bash
# Using venv
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate
```

### 2b. Install Python dependencies

```bash
pip install -r backend/requirements.txt
```

> **CUDA / GPU users:** To enable GPU acceleration for the CLIP model:
> ```bash
> pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
> pip install open-clip-torch
> ```

### 2c. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
# Required
NOMINATIM_USER_AGENT=WeddingBudgetAI/1.0

# Optional — enables real driving-distance calculations
OPENROUTESERVICE_API_KEY=your_ors_key_here

# ML model path (defaults to backend/models/artifacts/decor_nn.pt)
DECOR_MODEL_PATH=backend/models/artifacts/decor_nn.pt

# CLIP model name (default shown)
CLIP_MODEL_NAME=ViT-B-32
CLIP_PRETRAINED=laion2b_s34b_b79k
```

### 2d. (Optional) Train the Décor ML Model

If you have labeled training data:

```bash
cd backend
python -m models.clip_xgboost.train
```

If no model checkpoint exists, the `DecorAgent` falls back to the cost table in `estimation_pipeline/data/costs.py`.

### 2e. Start the FastAPI server

```bash
# From project root
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Swagger docs available at: `http://localhost:8000/docs`

---

## 3. Frontend Setup (Node.js)

### 3a. Install Node dependencies

```bash
npm install
```

### 3b. Start the development server

```bash
npm run dev
```

The app will be available at: `http://localhost:3000`

---

## 4. Full System Check

With **both** servers running:

1. Open `http://localhost:3000`
2. Click **Plan Your Wedding**
3. Fill in the 6-step wizard
4. Watch the **7 AI Agents** loading HUD
5. View the **Budget Dashboard** with Low / Mid / High estimates
6. Switch to the **Vendor Map** tab to see OSM markers
7. Export as **PDF** or **CSV**

---

## 5. Running Tests

```bash
# Backend tests (from project root)
cd backend
python -m pytest tests/ -v

# Specific test suites
python -m pytest tests/test_agents.py -v    # Agent unit tests
python -m pytest tests/test_api.py -v       # API integration tests
python -m pytest tests/test_model.py -v     # ML model tests
```

---

## 6. Project Scripts

```bash
# Generate synthetic training labels
python backend/scripts/generate_labels.py

# Scrape décor images (optional, for re-training)
python backend/scrapers/scrape_images.py

# Run a demo estimation without the frontend
python backend/scripts/demo_estimation.py
```

---

## 7. Common Issues

### `ModuleNotFoundError: No module named 'open_clip'`
Run `pip install open-clip-torch` in the **same** Python environment as uvicorn.

### `WebSocket 403 Forbidden`
The correct WebSocket URL is `ws://localhost:8000/api/v1/budget/ws` — not `/ws/calculate`.

### `fflate/lib/node.cjs` Next.js build error  
The `ExportPdfButton` component is dynamically imported with `ssr: false`. Do not statically import `jspdf` at the top of any Next.js page.

### Overpass API `504 Gateway Timeout`
This is a transient OSM API issue. The `VendorSearchAgent` automatically retries once and returns empty results on failure — the budget pipeline continues normally.

### Budget shows `₹0` for all categories
The model checkpoint may not exist at `DECOR_MODEL_PATH`. The agent will use the rule-based `costs.py` table instead. Check logs for `[DecorAgent]` errors.
