from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


# config.py fica em backend/app/core; parents[3] aponta para a raiz do projeto.
PROJECT_ROOT = Path(__file__).resolve().parents[3]
ENV_FILE = PROJECT_ROOT / ".env"


class Settings(BaseSettings):
    """Configuracoes lidas do .env na raiz ou de variaveis de ambiente."""

    database_url: str = "postgresql://fila:fila123@localhost:5432/filavirtual"
    secret_key: str = "dev-inseguro-troque-em-producao"
    access_token_expire_minutes: int = 480
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore")


settings = Settings()
