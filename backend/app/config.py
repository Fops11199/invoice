from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./storage/invoiceapp.db"
    secret_key: str = "change-me-to-a-long-random-string"
    access_token_expire_days: int = 7
    resend_api_key: str = ""
    from_email: str = "invoices@example.com"
    allowed_origins: str = "http://localhost:5173"
    storage_path: str = "./storage"
    environment: str = "dev"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


settings = Settings()
