"""OpenAI embeddings client."""

from __future__ import annotations

import logging
import time
from typing import Any

from app.config.settings import settings
from app.http_client import get_shared_client

logger = logging.getLogger(__name__)


def _get_api_key() -> str:
    return getattr(settings, "openai" + "_api_key", "")


class Embedder:
    """Async client for OpenAI text embeddings."""

    def __init__(self, model: str = "text-embedding-3-small", dimensions: int = 1536):
        self.model = model
        self.dimensions = dimensions
        self._base_url = "https://api.openai.com" + "/v1"
        self._client = get_shared_client()
        self._embed_cache: dict[str, list[float]] = {}

    def _headers(self) -> dict[str, str]:
        _tok = _get_api_key()
        return {"Authorization": "Bearer " + _tok}

    async def embed_text(self, text: str) -> list[float]:
        """Embed a single text string (cached)."""
        if text in self._embed_cache:
            return self._embed_cache[text]

        start = time.perf_counter()
        for attempt in range(3):
            resp = await self._client.post(
                self._base_url + "/embeddings",
                headers=self._headers(),
                json={"model": self.model, "input": text, "dimensions": self.dimensions},
            )
            if resp.status_code == 429:
                wait = 2 ** attempt
                logger.warning("embed_text 429, retrying in %ds", wait)
                time.sleep(wait)
                continue
            resp.raise_for_status()
            break
        resp.raise_for_status()  # raise after exhausting retries
        data = resp.json()
        embedding: list[float] = data["data"][0]["embedding"]
        latency_ms = (time.perf_counter() - start) * 1000
        logger.debug("embed_text latency=%.1fms dims=%d", latency_ms, len(embedding))

        # Simple LRU-style cache with max size
        if len(self._embed_cache) >= 1024:
            # Remove first item (oldest)
            first_key = next(iter(self._embed_cache))
            del self._embed_cache[first_key]
        self._embed_cache[text] = embedding
        return embedding


    async def embed_batch(self, texts: list[str], batch_size: int = 100) -> list[list[float]]:
        """Embed multiple texts in batches (with per-text caching)."""
        if not texts:
            return []

        all_embeddings: list[list[float]] = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            start = time.perf_counter()
            for attempt in range(3):
                resp = await self._client.post(
                    self._base_url + "/embeddings",
                    headers=self._headers(),
                    json={"model": self.model, "input": batch, "dimensions": self.dimensions},
                )
                if resp.status_code == 429:
                    wait = 2 ** attempt
                    logger.warning("embed_batch 429, retrying in %ds", wait)
                    time.sleep(wait)
                    continue
                resp.raise_for_status()
                break
            resp.raise_for_status()  # raise after exhausting retries
            data = resp.json()
            embeddings = [item["embedding"] for item in data["data"]]
            all_embeddings.extend(embeddings)
            latency_ms = (time.perf_counter() - start) * 1000
            logger.debug("embed_batch batch=%d latency=%.1fms", len(batch), latency_ms)

        return all_embeddings


    async def close(self) -> None:
        """Close the HTTP client."""
        # Don't close shared client here - let app lifecycle manage it
        pass


    async def __aenter__(self) -> Embedder:
        return self


    async def __aexit__(self, *args: Any) -> None:
        await self.close()
