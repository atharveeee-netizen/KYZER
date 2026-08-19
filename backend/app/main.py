"""FastAPI entrypoint. Open CORS + open reads, per the "Zero Login Wall" rule
for judges (docs/team/PERSON_2_BACKEND_DATABASE_LEAD.md, AI_INSTRUCTIONS.md)."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import close_db, connect_db
from app.routes import dashboard_routes, inventory_routes, ocr_routes, redistribution_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(title="CareDOM Backend API", version="0.1.0", lifespan=lifespan)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_routes.router)
app.include_router(inventory_routes.router)
app.include_router(ocr_routes.router)
app.include_router(redistribution_routes.router)

# ai_router (app.routes.ai / Person 1's AI+quantum engine) must NOT be mounted
# here: it imports ai_engine, which this Service A image deliberately excludes
# (185MB vs. Service B's ~1.8GB - see Dockerfile.ai and app.main_ai). Mounting
# it here crashes the container on boot with ModuleNotFoundError. It belongs
# only in app.main_ai (Service B, built from Dockerfile.ai).


@app.get("/health")
@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "service": "caredom-backend"}
