"""Application configuration using pydantic-settings."""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Main application settings."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # API Keys
    openai_api_key: str = ""

    # STT
    stt_primary: str = "hosted"
    stt_fallback: str = "local"
    stt_timeout_ms: int = 120
    stt_max_retries: int = 1

    # Embedding
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536

    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_collection: str = "voice_rag"

    # LLM
    llm_provider: str = "openai"
    llm_model: str = "gpt-4o-mini"
    llm_timeout_ms: int = 100

    # Reranker
    reranker_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    reranker_timeout_ms: int = 40

    # Retrieval
    dense_top_n: int = 20
    sparse_top_n: int = 20
    fused_top_n: int = 20
    final_top_k: int = 5

    # Guardrails
    min_retrieval_confidence: float = 0.3
    min_candidates: int = 1
    max_unsupported_claims: int = 0

    # Reranker trigger
    reranker_difficulty_threshold: float = 0.4
    reranker_min_candidates: int = 6

    # Timeouts
    stt_budget_ms: int = 120
    query_budget_ms: int = 10
    retrieval_budget_ms: int = 40
    rerank_budget_ms: int = 40
    generation_budget_ms: int = 100
    total_budget_ms: int = 200

    # Retry
    max_attempts: int = 2
    backoff_ms: int = 20

    # Observability
    otel_exporter_otlp_endpoint: str = "http://localhost:4317"
    log_level: str = "INFO"


settings = Settings()
