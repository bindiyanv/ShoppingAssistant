from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    llm_provider: Literal["gemini", "groq"] = "gemini"

    gemini_api_key: str = ""
    gemini_chat_model: str = "gemini-3.5-flash-lite"
    gemini_embed_model: str = "gemini-embedding-001"
    embed_dim: int = 768

    groq_api_key: str = ""
    groq_chat_model: str = "openai/gpt-oss-20b"

    database_url: str = "sqlite:///./shopassist.db"
    chroma_path: str = "./chroma_data"
    chroma_collection: str = "products"

    top_k: int = 5
    # Cosine-distance cutoffs for retrieved products (tuned for gemini-embedding-001 @ 768 dims).
    # Keep a hit only if it is within `relevance_margin` of the best hit and below `relevance_max_distance`.
    relevance_margin: float = 0.05
    relevance_max_distance: float = 0.38
    history_turns: int = 6
    cors_origins: str = "http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
