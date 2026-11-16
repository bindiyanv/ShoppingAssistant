# ShopAssist

RAG-powered conversational shopping assistant.

**Stack:** FastAPI + SQLite (SQLAlchemy) + ChromaDB (local) + Gemini + React (Vite + Tailwind).

## Quick start

```bash
# 1. Backend
cd backend
python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                 # paste your GEMINI_API_KEY
python -m scripts.seed_db            # products.json -> SQLite
python -m scripts.ingest             # SQLite -> embeddings -> ChromaDB
uvicorn app.main:app --reload --port 8000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                          # open http://localhost:5173
```

API docs: http://localhost:8000/docs · Tests: `cd backend && pytest -q` (no API keys needed)

