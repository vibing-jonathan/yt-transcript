from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://yt_transcribe:changeme@localhost:5432/yt_transcribe"

    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/1"

    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    hf_model_id: str = "OpenMOSS-Team/MOSS-Transcribe-Diarize"
    use_gpu: bool = False

    frontend_origin: str = "http://localhost:5173"


settings = Settings()
