from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    alpha_vantage_api_key: str
    log_level: str = "DEBUG"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings() 