"""ChromaDB wrapper. Chroma stores id + product text + filterable metadata only;
SQLite remains the source of truth for product details."""

from functools import lru_cache
from typing import Any

from app.config import settings
from app.services import embeddings


@lru_cache
def _client():
    import chromadb

    return chromadb.PersistentClient(path=settings.chroma_path)


def get_collection():
    # We always pass our own embeddings, so no embedding_function is needed.
    return _client().get_or_create_collection(
        name=settings.chroma_collection, metadata={"hnsw:space": "cosine"}
    )


def reset_collection() -> None:
    try:
        _client().delete_collection(settings.chroma_collection)
    except Exception:
        pass


def product_to_text(p) -> str:
    """Text that gets embedded. Keep it descriptive: this is what retrieval 'sees'."""
    attrs = ", ".join(f"{k}: {v}" for k, v in (p.attributes or {}).items())
    return (
        f"{p.name} by {p.brand}. Category: {p.category}. "
        f"Price: ₹{p.price}. {p.description} {attrs}"
    ).strip()


def upsert_products(products: list) -> int:
    if not products:
        return 0
    texts = [product_to_text(p) for p in products]
    vectors = embeddings.embed_documents(texts)
    get_collection().upsert(
        ids=[str(p.id) for p in products],
        embeddings=vectors,
        documents=texts,
        metadatas=[
            {"category": p.category.lower(), "price": p.price, "in_stock": p.stock > 0}
            for p in products
        ],
    )
    return len(products)


def build_where(
    max_price: int | None = None,
    min_price: int | None = None,
    category: str | None = None,
    in_stock_only: bool = True,
) -> dict[str, Any] | None:
    conds: list[dict[str, Any]] = []
    if max_price is not None:
        conds.append({"price": {"$lte": max_price}})
    if min_price is not None:
        conds.append({"price": {"$gte": min_price}})
    if category:
        conds.append({"category": {"$eq": category.lower()}})
    if in_stock_only:
        conds.append({"in_stock": {"$eq": True}})
    if not conds:
        return None
    return conds[0] if len(conds) == 1 else {"$and": conds}


def filter_relevant(
    ids: list[str], distances: list[float], margin: float, max_distance: float
) -> list[int]:
    """Drop weak hits: keep those close to the best hit and under an absolute ceiling.

    Embedding distances are bunched together, so a fixed top-k always pads the list with
    loosely related items (a running shoe for "earbuds for the gym"); a cutoff relative to
    the best hit removes them. Inputs are ordered best-first, as Chroma returns them.
    """
    if not ids:
        return []
    cutoff = min(distances[0] + margin, max_distance)
    return [int(i) for i, d in zip(ids, distances) if d <= cutoff]


def search(query: str, k: int, where: dict[str, Any] | None = None) -> list[int]:
    """Return relevant product ids ordered by similarity (may be fewer than k, or none)."""
    col = get_collection()
    if col.count() == 0:
        return []
    res = col.query(
        query_embeddings=[embeddings.embed_query(query)],
        n_results=min(k, col.count()),
        where=where,
    )
    return filter_relevant(
        res["ids"][0],
        res["distances"][0],
        settings.relevance_margin,
        settings.relevance_max_distance,
    )
