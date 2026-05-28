from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:ta%23qK%24ugX%3FSKPy9@db.emxpmyotsjbwrgxbtudy.supabase.co:5432/postgres?sslmode=require"
    secret_key: str = "second-brain-secret-key-change-in-production-32chars!"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days
    ai_service_url: str = "http://localhost:8001"

    class Config:
        env_file = ".env"


settings = Settings()
