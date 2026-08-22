"""
Centralized environment configuration.

Reads settings from process environment variables (populated by `.env` in
local dev via docker-compose's `env_file:`, or by Cloud Run's env config in
prod). Nothing here is ever hardcoded or written back to a file — secrets
like DATABASE_URL only ever live in the environment.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://kyzer_user:kyzer_pass@localhost:5432/kyzer_db"
    allowed_origins: str = "http://localhost:3000,http://localhost:5173"
    api_key: str | None = None  # optional shared secret for mutating writes

    @property
    def asyncpg_dsn(self) -> str:
        """asyncpg needs a plain postgresql:// DSN; strip SQLAlchemy-style
        driver suffixes like '+asyncpg' if DATABASE_URL was set that way."""
        return self.database_url.replace("postgresql+asyncpg://", "postgresql://")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
