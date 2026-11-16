"""Test setup: temp SQLite + temp Chroma path, and NO real API calls (fake embeddings + LLM)."""

import hashlib
import os
import tempfile

_tmp = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp}/test.db"
os.environ["CHROMA_PATH"] = f"{_tmp}/chroma"
os.environ["GEMINI_API_KEY"] = "test"
# Relevance cutoffs are tuned for real Gemini vectors; the fake vectors below have a different scale.
os.environ["RELEVANCE_MARGIN"] = "2"
os.environ["RELEVANCE_MAX_DISTANCE"] = "2"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.services import embeddings, llm  # noqa: E402


def _fake_vec(text: str, dim: int = 768) -> list[float]:
    # deterministic bag-of-words hash vector, good enough for tests
    v = [0.0] * dim
    for w in text.lower().split():
        v[int(hashlib.md5(w.encode()).hexdigest(), 16) % dim] += 1.0
    return v


@pytest.fixture(autouse=True)
def no_external_apis(monkeypatch):
    monkeypatch.setattr(embeddings, "embed_documents", lambda ts: [_fake_vec(t) for t in ts])
    monkeypatch.setattr(embeddings, "embed_query", _fake_vec)
    monkeypatch.setattr(llm, "generate", lambda system, history, user: "FAKE ANSWER")


@pytest.fixture
def client():
    from app.main import app

    with TestClient(app) as c:
        yield c
