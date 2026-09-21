from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite:///./secondbrain.db"
    secret_key: str = "second-brain-secret-key-change-in-production-32chars!"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days
    hf_api_token: str = ""  # Hugging Face Inference API token (free)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
