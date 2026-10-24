from functools import lru_cache
from typing import Literal

from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_INSECURE_SECRETS = {
    "",
    "change-me",
    "changeme",
    "secret",
    "your-secret-key",
}


class Settings(BaseSettings):
    """
    Central application configuration.

    Supports:
    - Development
    - Production
    - Existing lowercase settings references
    - Environment variables / .env
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ============================================================
    # APP
    # ============================================================

    APP_NAME: str = "VELTRIX AI API"

    ENVIRONMENT: Literal[
        "development",
        "production",
        "test",
    ] = "development"

    LOG_LEVEL: str = "INFO"

    ENABLE_DOCS: bool | None = None

    # ============================================================
    # DATABASE
    # ============================================================

    DATABASE_URL: str = (
        "postgresql+psycopg2://" "veltrix:veltrix_pass" "@localhost:5432/veltrix"
    )

    # ============================================================
    # SECURITY / JWT
    # ============================================================

    SECRET_KEY: str = "change-me"

    JWT_ALGORITHM: str = "HS256"

    ACCESS_TOKEN_MINUTES: int = 60

    # ============================================================
    # AI
    # ============================================================

    GEMINI_API_KEY: str = ""

    GEMINI_MODEL: str = "gemini-2.5-flash"

    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"

    # ============================================================
    # WEB / CORS
    # ============================================================

    FRONTEND_URL: str = "http://localhost:3000"

    CORS_ORIGINS: str = "http://localhost:3000"

    # ============================================================
    # FILES
    # ============================================================

    UPLOAD_DIR: str = "uploads"

    MAX_UPLOAD_SIZE_MB: int = 20

    # ============================================================
    # OPTIONAL / LEGACY FRONTEND URL
    # ============================================================

    VERCEL_OUTPUT_URL: str = ""

    # ============================================================
    # VALIDATORS
    # ============================================================

    tesseract_cmd: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    # ============================================================
    # VALIDATORS
    # ============================================================

    @field_validator("DATABASE_URL")
    @classmethod
    def normalize_db_url(cls, value: str) -> str:
        """
        Normalize common PostgreSQL URLs to psycopg2 format.
        """

        if value.startswith("postgres://"):
            return value.replace(
                "postgres://",
                "postgresql+psycopg2://",
                1,
            )

        if value.startswith("postgresql://"):
            return value.replace(
                "postgresql://",
                "postgresql+psycopg2://",
                1,
            )

        return value

    @field_validator("FRONTEND_URL")
    @classmethod
    def strip_frontend_slash(cls, value: str) -> str:
        return value.rstrip("/")

    @model_validator(mode="after")
    def validate_production(self):
        """
        Production must have real secrets,
        real frontend URL and real database.
        """

        if self.ENVIRONMENT != "production":
            return self

        problems: list[str] = []

        # JWT secret
        if self.SECRET_KEY in _INSECURE_SECRETS or len(self.SECRET_KEY) < 32:
            problems.append(
                "SECRET_KEY must be a random string of at least 32 characters"
            )

        # Gemini
        if not self.GEMINI_API_KEY:
            problems.append("GEMINI_API_KEY is required in production")

        # Frontend
        if not self.FRONTEND_URL.startswith("https://"):
            problems.append("FRONTEND_URL must use https:// in production")

        # Database
        if "localhost" in self.DATABASE_URL or "127.0.0.1" in self.DATABASE_URL:
            problems.append("DATABASE_URL must not point to localhost in production")

        if problems:
            raise ValueError("Invalid production configuration: " + "; ".join(problems))

        return self

    # ============================================================
    # NEW HELPERS
    # ============================================================

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def docs_enabled(self) -> bool:
        if self.ENABLE_DOCS is not None:
            return self.ENABLE_DOCS

        return not self.is_production

    @property
    def cors_origins(self) -> list[str]:
        extra = [
            origin.strip().rstrip("/")
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]

        origins = [
            self.FRONTEND_URL,
            *extra,
        ]

        return list(dict.fromkeys(origins))

    # ============================================================
    # BACKWARD COMPATIBILITY
    # ============================================================
    #
    # Existing VELTRIX code uses lowercase settings.
    # These properties prevent breaking the existing codebase.
    #

    @property
    def app_name(self) -> str:
        return self.APP_NAME

    @property
    def app_env(self) -> str:
        return self.ENVIRONMENT

    @property
    def debug(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def database_url(self) -> str:
        return self.DATABASE_URL

    @property
    def jwt_secret_key(self) -> str:
        return self.SECRET_KEY

    @property
    def jwt_algorithm(self) -> str:
        return self.JWT_ALGORITHM

    @property
    def jwt_access_token_expire_minutes(self) -> int:
        return self.ACCESS_TOKEN_MINUTES

    @property
    def gemini_api_key(self) -> str | None:
        return self.GEMINI_API_KEY or None

    @property
    def gemini_model(self) -> str:
        return self.GEMINI_MODEL

    @property
    def upload_dir(self) -> str:
        return self.UPLOAD_DIR

    @property
    def max_upload_size_mb(self) -> int:
        return self.MAX_UPLOAD_SIZE_MB

    @property
    def frontend_url(self) -> str:
        return self.FRONTEND_URL

    @property
    def vercel_output_url(self) -> str:
        return self.VERCEL_OUTPUT_URL

    @property
    def TESSERACT_CMD(self) -> str:
        return self.tesseract_cmd

@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
