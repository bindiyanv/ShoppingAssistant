# ShopAssist (RAG-powered conversational e-commerce assistant)

 Read it fully before making changes.

## What this project is
A shopping assistant: users chat in natural language ("waterproof running shoes under ₹5000"),
the backend retrieves matching products from a vector index (RAG) and an LLM answers
using ONLY retrieved catalog data. Later milestones add cart/orders via tool calling.

## Hard constraints (do not violate)
- Target machine: **8 GB RAM laptop**. No Docker, no local LLMs, no Postgres/Redis/Kafka.
- Everything runs as two local processes: `uvicorn` (backend) and `vite` (frontend).
- LLM + embeddings come from **hosted free-tier APIs** (Gemini, optionally Groq for chat).
- Single uvicorn worker. No background task queues. Keep dependencies minimal.
- Never commit `.env`, `*.db`, or `backend/chroma_data/`.

## Tech stack
| Layer | Choice |
|---|---|
| Backend | Python 3.11+, FastAPI, Pydantic v2, Uvicorn |
| Relational DB | SQLite via SQLAlchemy 2.0 (sync, typed `Mapped[]` models) |
| Vector DB | ChromaDB `PersistentClient` (on-disk at `backend/chroma_data/`, cosine) |
| Embeddings | Gemini `gemini-embedding-001` (768 dims via `output_dimensionality`) |
| Chat LLM | Gemini Flash (default) or Groq (`LLM_PROVIDER=groq`) |
| Frontend | React + Vite + Tailwind CSS v4 (`@tailwindcss/vite`) |
| Tests | pytest + FastAPI TestClient (mock all external API calls) |

Note: Groq has **no embeddings API** — embeddings are always Gemini, even when chat uses Groq.
Model names live in `.env`; check https://ai.google.dev/gemini-api/docs/models and
https://console.groq.com/docs/models if a model is deprecated.

## Architecture
```
INGESTION (offline, scripts/)
  data/products.json ──> SQLite (products table) ──> build product text ──> Gemini embeddings ──> ChromaDB

QUERY (per chat message, POST /api/chat)
  React chat UI ──> FastAPI /api/chat
      1. load session history (SQLite chat_messages)
      2. extract filters (max_price, category) from request/message
      3. embed query (Gemini, task_type=RETRIEVAL_QUERY)
      4. ChromaDB top-k with metadata `where` filters (price, category, in_stock)
      5. build grounded prompt (system rules + retrieved products + history)
      6. LLM generate (Gemini or Groq)
      7. persist user+assistant messages, return {answer, products[], session_id}
```
SQLite is the **source of truth** for products; Chroma holds only id + text + filterable metadata.
Chroma IDs == product IDs (as strings) so results join back to SQLite.

## Directory layout
```
backend/
  app/
    main.py            FastAPI app, CORS, router registration, startup table creation
    config.py          pydantic-settings; all env vars
    db.py              engine, SessionLocal, Base, get_db dependency
    models.py          User, Product, Order, OrderItem, ChatSession, ChatMessage
    schemas.py         Pydantic request/response models
    api/               products.py, chat.py, orders.py  (thin routers, no business logic)
    services/
      embeddings.py    Gemini embedding wrapper (batching + retry)
      vector_store.py  Chroma wrapper: upsert_products, search
      llm.py           provider-agnostic generate(system, history, user) -> str
      rag.py           filter extraction, prompt building, answer orchestration
  scripts/
    seed_db.py         load data/products.json into SQLite
    ingest.py          embed products from SQLite into Chroma
  data/products.json   sample catalog
  tests/
frontend/
  src/ App.jsx, api.js, components/ChatWindow.jsx, components/ProductCard.jsx
```

## Commands
```bash
# backend (from backend/)
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                  # add GEMINI_API_KEY
python -m scripts.seed_db && python -m scripts.ingest
python -m scripts.seed_db --fetch                     # refresh DummyJSON snapshot (data/products_dummyjson.json) first
uvicorn app.main:app --reload --port 8000
pytest -q

# frontend (from frontend/)
npm install && npm run dev                            # http://localhost:5173, proxies /api -> :8000
```

## Coding conventions
- Routers stay thin; logic goes in `services/`. Services must not import FastAPI.
- Type hints everywhere; Pydantic schemas for every request/response.
- All external API calls go through `services/embeddings.py` or `services/llm.py` so tests can mock them.
- Embed in batches (≤100 texts/call) and back off on HTTP 429 — free tiers are rate-limited.
- The LLM must never invent products, prices or stock. If retrieval returns nothing, say so.
- Prices are INR, stored as integers (rupees).
- Frontend: functional components + hooks, Tailwind utility classes only, no UI kit.


## Milestones
- [x] M0 Scaffold (this structure)
- [ ] M1 Seed + ingest working end-to-end with real Gemini key
- [ ] M2 /api/chat grounded answers + product cards in UI
- [ ] M3 Filters (price/category/stock) + multi-turn memory polish
- [ ] M4 Tool calling: add_to_cart, place_order, order_status
- [ ] M5 Simple auth (username + hashed password, JWT) and per-user history
- [ ] M6 Evaluation set (20–30 questions → expected product ids) + retrieval hit-rate script
