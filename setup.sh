#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# setup.sh — WeddingBudget.ai one-command environment setup
#
# Usage:
#   bash setup.sh
#
# What it does:
#   1. Creates a Python virtual environment in backend/venv
#   2. Installs all backend Python dependencies from backend/requirements.txt
#   3. Installs all frontend Node.js dependencies (npm install)
#   4. Generates backend/.env from backend/.env.example if it doesn't exist
#   5. Prints next-step instructions
# ──────────────────────────────────────────────────────────────────────────────

set -e

BOLD=$(tput bold 2>/dev/null || echo "")
RESET=$(tput sgr0 2>/dev/null || echo "")
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
NC="\033[0m"

echo ""
echo "${BOLD}╔══════════════════════════════════════════════════╗${RESET}"
echo "${BOLD}║       WeddingBudget.ai — Setup Script            ║${RESET}"
echo "${BOLD}║       404 Dulhan Not Found                       ║${RESET}"
echo "${BOLD}╚══════════════════════════════════════════════════╝${RESET}"
echo ""

# ── 1. Python virtual environment ────────────────────────────────────────────
echo -e "${CYAN}[1/4] Creating Python virtual environment...${NC}"

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}      Virtual environment created at ./venv${NC}"
else
    echo -e "${YELLOW}      ./venv already exists — skipping creation${NC}"
fi

# Activate
# shellcheck source=/dev/null
source venv/Scripts/activate 2>/dev/null || source venv/bin/activate

echo -e "${GREEN}      Activated: $(python --version)${NC}"
echo ""

# ── 2. Backend Python dependencies ───────────────────────────────────────────
echo -e "${CYAN}[2/4] Installing backend Python dependencies...${NC}"

if [ -f "backend/requirements.txt" ]; then
    pip install --quiet -r backend/requirements.txt
    echo -e "${GREEN}      Backend dependencies installed.${NC}"
else
    echo -e "${YELLOW}      backend/requirements.txt not found — skipping${NC}"
fi
echo ""

# ── 3. Frontend Node.js dependencies ─────────────────────────────────────────
echo -e "${CYAN}[3/4] Installing frontend Node.js dependencies...${NC}"

if [ -f "package.json" ]; then
    npm install --silent
    echo -e "${GREEN}      Node.js dependencies installed.${NC}"
else
    echo -e "${YELLOW}      package.json not found — skipping npm install${NC}"
fi
echo ""

# ── 4. Generate .env file ─────────────────────────────────────────────────────
echo -e "${CYAN}[4/4] Setting up environment variables...${NC}"

if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}      Created backend/.env from .env.example${NC}"
    else
        # Create a minimal .env if no example exists
        cat > backend/.env << 'ENVEOF'
# WeddingBudget.ai — Backend Environment Variables
# Fill in the values below before starting the server.

# Supabase / PostgreSQL connection string (required)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Groq API key — powers the AI planning layer (required)
GROQ_API_KEY=gsk_your_key_here
ENVEOF
        echo -e "${GREEN}      Created backend/.env with required variables${NC}"
    fi
else
    echo -e "${YELLOW}      backend/.env already exists — not overwritten${NC}"
fi
echo ""

# ── Done ──────────────────────────────────────────────────────────────────────
echo -e "${BOLD}╔══════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║   Setup complete! Next steps:                    ║${RESET}"
echo -e "${BOLD}╚══════════════════════════════════════════════════╝${RESET}"
echo ""
echo -e "  ${YELLOW}1. Edit backend/.env and fill in your secrets:${NC}"
echo ""
echo -e "       DATABASE_URL  →  your Supabase PostgreSQL connection string"
echo -e "       GROQ_API_KEY  →  your Groq API key (console.groq.com)"
echo ""
echo -e "  ${YELLOW}2. Start the backend server:${NC}"
echo ""
echo -e "       source venv/bin/activate   # or venv\\Scripts\\activate on Windows"
echo -e "       uvicorn backend.main:app --reload"
echo ""
echo -e "  ${YELLOW}3. Start the frontend (new terminal):${NC}"
echo ""
echo -e "       npm run dev"
echo ""
echo -e "  ${GREEN}Then open: http://localhost:3000${NC}"
echo ""
