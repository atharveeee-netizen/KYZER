"""
Async PostgreSQL connection pooling.

We use asyncpg directly (no ORM). A single connection *pool* is opened once
at app startup and shared for the process lifetime; each request borrows one
connection from the pool via the `get_db` dependency and returns it when the
request finishes. This avoids the cost of opening a new TCP/TLS connection to
Postgres on every request.
"""
from collections.abc import AsyncGenerator

import asyncpg

from app.config import get_settings

_pool: asyncpg.Pool | None = None


async def connect_db() -> None:
    global _pool
    settings = get_settings()
    _pool = await asyncpg.create_pool(
        dsn=settings.asyncpg_dsn,
        min_size=1,
        max_size=10,
    )


async def close_db() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Database pool not initialized — connect_db() must run at startup")
    return _pool


async def get_db() -> AsyncGenerator[asyncpg.Connection, None]:
    """FastAPI dependency: `db: asyncpg.Connection = Depends(get_db)`."""
    pool = get_pool()
    async with pool.acquire() as connection:
        yield connection
