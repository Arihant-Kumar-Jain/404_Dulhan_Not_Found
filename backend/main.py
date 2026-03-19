"""
WeddingBudget.ai — Main FastAPI Application
"""
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.routers import budget, decor, vendors, labels

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

# Initialize application
app = FastAPI(
    title="WeddingBudget.ai Engine",
    description="Agentic Estimation Pipeline & ML Models for Indian Weddings",
    version="2.0.0",
)

# Allow CORS for frontend dev server
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000", # Swagger UI test calls
    "https://weddingbudget.ai",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(budget.router, prefix="/api/v1")
app.include_router(decor.router,  prefix="/api/v1")
app.include_router(vendors.router, prefix="/api/v1")
app.include_router(labels.router, prefix="/api/v1")

# --- Root Endpoint ---
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "WeddingBudget.ai Pipeline v2.0",
        "docs_url": "/docs",
    }
