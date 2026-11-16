from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chat, orders, products
from app.config import settings
from app.db import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="ShopAssist API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(chat.router)
app.include_router(orders.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "llm_provider": settings.llm_provider}
