# from pydantic_settings import BaseSettings, SettingsConfigDict


# class Settings(BaseSettings):
#     DATABASE_URL: str = "postgresql+psycopg2://veltrix:veltrix_pass@localhost:5432/veltrix"
#     SECRET_KEY: str = "change-me"
#     ACCESS_TOKEN_MINUTES: int = 30
#     GEMINI_API_KEY: str = ""
#     FRONTEND_URL: str = "http://localhost:3000"

#     model_config = SettingsConfigDict(env_file=".env", extra="ignore")


# settings = Settings()

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "VELTRIX"
    app_env: str = "development"
    debug: bool = True
    database_url: str

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60

    gemini_api_key: str | None = None

    upload_dir: str = "uploads"
    max_upload_size_mb: int = 20
    frontend_url: str = "http://localhost:3000"
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
