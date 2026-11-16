"""Gemini embeddings wrapper. The only module that calls the embedding API."""

import re
import time
from functools import lru_cache

from app.config import settings

BATCH_SIZE = 100


@lru_cache
def _client():
    from google import genai

    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not set (backend/.env)")
    return genai.Client(api_key=settings.gemini_api_key)


_RETRY_HINT = re.compile(r"retry in ([\d.]+)s|'retryDelay': '(\d+)s'", re.I)
MAX_WAIT_S = 65  # free-tier quotas are per minute, so one window is the longest useful wait


def _retry_wait(exc: Exception, attempt: int) -> float:
    """Seconds to wait before retrying: the server's hint if given, else exponential backoff."""
    msg = str(exc)
    if m := _RETRY_HINT.search(msg):
        hinted = float(m.group(1) or m.group(2))
        # The per-minute window may still be nearly full, so wait at least a growing floor.
        return min(MAX_WAIT_S, max(hinted + 1, 10 * (attempt + 1)))
    return min(MAX_WAIT_S, 2 ** (attempt + 1))


def _embed(texts: list[str], task_type: str, retries: int = 6) -> list[list[float]]:
    from google.genai import types

    cfg = types.EmbedContentConfig(
        task_type=task_type, output_dimensionality=settings.embed_dim
    )
    for attempt in range(retries):
        try:
            res = _client().models.embed_content(
                model=settings.gemini_embed_model, contents=texts, config=cfg
            )
            return [e.values for e in res.embeddings]
        except Exception as exc:  # free tier: back off on 429 / transient errors
            transient = "429" in str(exc) or "503" in str(exc)
            if attempt == retries - 1 or not transient:
                raise
            time.sleep(_retry_wait(exc, attempt))
    return []


def embed_documents(texts: list[str]) -> list[list[float]]:
    out: list[list[float]] = []
    for i in range(0, len(texts), BATCH_SIZE):
        out.extend(_embed(texts[i : i + BATCH_SIZE], "RETRIEVAL_DOCUMENT"))
    return out


def embed_query(text: str) -> list[float]:
    return _embed([text], "RETRIEVAL_QUERY")[0]
