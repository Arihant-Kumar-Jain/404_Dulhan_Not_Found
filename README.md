# WeddingBudget.ai 💍

> **AI-Powered Wedding Budget Estimator** — Built for the WedTech Innovation Challenge by Events by Athea
>
> **Team**: 404 Dulhan Not Found 🚫👰 | **Branch**: `wed-planner`

---

## 🌟 What is WeddingBudget.ai?

India's first AI-powered wedding budget estimation platform. Six intelligent AI agents analyze venue, décor, catering, entertainment, logistics & more to deliver accurate, itemized budget estimates with Low/Mid/High ranges — all presented through a stunning, immersive 3D experience.

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🏰 **3D Immersive Landing** | Three.js scene with falling rose petals, flickering diyas, golden ornamental rings, and sparkle particles |
| 🧙 **Smart Input Wizard** | 6-step animated form — city selection with real photos, hotel tiers, guest counter, event wheel, décor gallery, F&B options |
| 🎭 **Agent Theater** | Watch 6 AI agents work in real-time with animated avatars, streaming chat messages, and progress tracking |
| 📊 **Budget Dashboard** | Animated budget cards with Low/Mid/High ranges, AI confidence scores, and scenario comparison |
| 🎨 **Décor Library** | Pinterest-style masonry grid with filters, lightbox, shortlisting, and AI cost prediction |
| 🤝 **Human-in-the-Loop** | Users can review, approve, and override AI estimates during calculation |
| ⚙️ **Admin Panel** | Seed costs, label décor images, manage artist database, and configure estimation templates |
| 📄 **PDF Export** | Download branded, professional budget reports |

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript |
| 3D Engine | Three.js, React Three Fiber, Drei |
| Animations | GSAP-ready, CSS Animations, Framer Motion |
| State | Zustand |
| Styling | CSS Modules + Design System |
| Backend | FastAPI (Python) |
| AI Agents | CrewAI + Groq (Llama 3) |
| Scraping | Playwright + BeautifulSoup |
| Database | SQLite → PostgreSQL |
| Charts | Recharts |
| Export | jsPDF + html2canvas |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Groq API key (free: https://console.groq.com)
- Unsplash API key (free: https://unsplash.com/developers)

### Frontend Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev
# → Opens at http://localhost:3000
```

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys

# Run FastAPI server
python main.py
# → Opens at http://localhost:8000
```

### Run Scraping Pipeline
```bash
cd backend
python -m scrapers.decor_scraper --unsplash-key YOUR_KEY
```

## 📁 Project Structure

```
├── src/                      # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx          # 3D Landing Page
│   │   ├── wizard/           # Smart Input Wizard
│   │   ├── budget/           # Budget Dashboard + Agent Theater
│   │   ├── decor-library/    # Décor Gallery
│   │   └── admin/            # Admin Panel
│   ├── components/three/     # 3D Components (R3F)
│   ├── stores/               # Zustand State (wizard, agents, budget)
│   └── data/                 # Constants & Config
│
├── backend/                  # FastAPI Backend
│   ├── main.py               # API + WebSocket + Cost Engines
│   ├── scrapers/             # Décor Image Scraping Pipeline
│   └── requirements.txt      # Python Dependencies
│
└── public/                   # Static Assets
```

## 🎯 Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | 3D immersive hero with agent showcase |
| `/wizard` | Budget Wizard | 6-step animated input form |
| `/budget` | Dashboard | Agent Theater + Budget Results |
| `/decor-library` | Décor Library | Pinterest-style décor gallery |
| `/admin` | Admin Panel | Cost DB, labels, artist management |

## 🤖 AI Agents

| Agent | Role |
|-------|------|
| 🏨 Venue Agent | City-specific hotel/venue cost analysis |
| 🍽️ F&B Agent | Per-head food, bar, specialty counter costs |
| 🎨 Décor Agent | Style and complexity-based décor estimation |
| 🎤 Artist Agent | Entertainment tier and artist fee mapping |
| 🚗 Logistics Agent | Fleet sizing, transfers, Baraat logistics |
| 🎁 Sundries Agent | Incidentals, gifts, ritual materials |

## 📊 Free APIs Used

| API | Purpose | Limits |
|-----|---------|--------|
| Groq | LLM (Llama 3) | 14,400 req/day |
| Unsplash | Wedding imagery | 50 req/hr |
| OpenRouteService | Distance calc | 2,000 req/day |

## 🎨 Design System

- **Colors**: Deep Maroon (#8B1A1A), Royal Gold (#D4AF37), Ivory (#FFFFF0)
- **Typography**: Playfair Display + Inter
- **Effects**: Glassmorphism, gold gradients, particle systems
- **Theme**: Premium Indian wedding aesthetic

---

Built with ❤️ by Team 404 Dulhan Not Found | WedTech Innovation Challenge 2025
