import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.api.v1.auth import router as auth_router
from app.api.v1.reports import router as reports_router
from app.api.v1.assistant import router as assistant_router


app = FastAPI(
    title="HealthLens AI API",
    description="AI-powered health risk screening API",
    version="1.0.0",
)


# ==========================================
# CORS CONFIGURATION
# ==========================================

# Support custom frontend domains from environment
env_origins = os.getenv("ALLOWED_ORIGINS", "")
parsed_custom_origins = [
    origin.strip() for origin in env_origins.split(",") if origin.strip()
]

base_allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000",
]

allowed_origins = list(set(base_allowed_origins + parsed_custom_origins))

# Allow localhost and any Vercel deployment preview/production URL via regex
origin_regex = os.getenv(
    "ALLOWED_ORIGIN_REGEX",
    r"^https?://(localhost|127\.0\.0\.1|([a-zA-Z0-9_-]+\.)?vercel\.app)(:\d+)?$",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# ROUTES
# ==========================================

app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Authentication"],
)

app.include_router(
    reports_router,
    prefix="/api/v1/reports",
    tags=["Reports"],
)

app.include_router(
    assistant_router,
    prefix="/api/v1/assistant",
    tags=["Assistant"],
)


@app.get("/")
def root():
    return {
        "message": "HealthLens AI API is running",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HealthLens AI API",
    }
