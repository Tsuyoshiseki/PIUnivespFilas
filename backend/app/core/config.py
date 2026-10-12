from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações lidas do arquivo .env ou de variáveis de ambiente."""

    database_url: str = "postgresql://fila:fila123@localhost:5432/filavirtual"
    secret_key: str = "dev-inseguro-troque-em-producao"
    access_token_expire_minutes: int = 480
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
