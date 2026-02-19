"""
CliniqAI Main Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import CORS_ORIGINS
from .database import init_db
from .routers import auth, predictions, patients, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    init_db()
    yield


app = FastAPI(
    title="CliniqAI API",
    description="AI Doctor's Second Opinion - Healthcare AI Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(predictions.router, prefix="/api/v1")
app.include_router(patients.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "CliniqAI API - AI Doctor's Second Opinion",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
