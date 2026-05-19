from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:Sigma@localhost:5432/secondbrain"
    secret_key: str = "second-brain-secret-key-change-in-production-32chars!"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days
    ai_service_url: str = "http://localhost:8001"

    class Config:
        env_file = ".env"


settings = Settings()
