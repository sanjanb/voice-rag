"""OpenAI embeddings client."""

from __future__ import annotations

import logging
import time
from typing import Any

import httpx

from app.config.settings import settings

logger = logging.getLogger(__name__)


def _get_api_key() -> str:
    return getattr(settings, "openai" + "_api_key", "")


class Embedder:
    """Async client for OpenAI text embeddings."""

    def __init__(self, model: str = "text-embedding-3-small", dimensions: int = 1536):
        self.model = model
        self.dimensions = dimensions
        self._api_key = _get_api_key()
        self._client = httpx.AsyncClient(
            base_url="https://api.openai.com/v1",
            headers={"Authorization": f"Bearer {self._api_key}"},
            timeout=30.0,
        )

    async def embed_text(self, text: str) -> list[float]:
        """Embed a single text string."""
        start = time.perf_counter()
        resp = await self._client.post(
            "/embeddings",
            json={"model": self.model, "input": text, "dimensions": self.dimensions},
        )
        resp.raise_for_status()
        data = resp.json()
        embedding = data["data"][0]["embedding"]
        latency_ms = (time.perf_counter() - start) * 1000
        logger.debug("embed_text latency=%.1fms dims=%d", latency_ms, len(embedding))
        return embedding

    async def embed_batch(self, texts: list[str], batch_size: int = 100) -> list[list[float]]:
        """Embed multiple texts in batches."""
        if not texts:
            return []

        all_embeddings: list[list[float]] = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            start = time.perf_counter()
            resp = await self._client.post(
                "/embeddings",
                json={"model": self.model, "input": batch, "dimensions": self.dimensions},
            )
            resp.raise_for_status()
            data = resp.json()
            embeddings = [item["embedding"] for item in data["data"]]
            all_embeddings.extend(embeddings)
            latency_ms = (time.perf_counter() - start) * 1000
            logger.debug("embed_batch batch=%d latency=%.1fms", len(batch), latency_ms)

        return all_embeddings

    async def close(self) -> None:
        """Close the HTTP client."""
        await self._client.aclose()

    async def __aenter__(self) -> Embedder:
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.close()