from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "SEO-GEO Optimizer"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Database — defaults to SQLite, override with DATABASE_URL in .env
    DATABASE_URL: str = "sqlite:///./seo_geo.db"

    # Postgres fields kept optional (ignored if DATABASE_URL is set)
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None

    # AI API
    ANTHROPIC_API_KEY: str

    # Authentication
    SECRET_KEY: str = "dev-secret-key-change-in-production-minimum-32-chars!!"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # OAuth (optional)
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    # Email (optional — forgot-password token shown in UI if not configured)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: Optional[str] = None

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
