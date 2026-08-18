"""Service B entrypoint: Person 1's AI/quantum/OCR-extraction routes only.

Deliberately separate from app.main (Service A, the Postgres-backed API):
importing ai_router pulls in ai_engine's full dependency tree (lightgbm,
qiskit, opencv, ortools, ...), which makes Service B's image ~1.8GB versus
Service A's ~185MB. Mounting both routers in one process would force every
deploy of the DB-backed API to carry that weight too. Neither service
depends on the other - Service B has no DATABASE_URL/asyncpg dependency at
all (see app.routes.ai's module docstring), and Service A never imports
ai_engine.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.ai import ai_router, get_engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pay model-load latency once at startup rather than on the first
    # request - HANDOFF.md documents <150ms preload, which only holds if
    # this runs eagerly instead of on first call.
    get_engine()
    yield


app = FastAPI(title="CareDOM AI Engine Service", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router, prefix="/api/v1")
