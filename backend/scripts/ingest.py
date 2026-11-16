"""Embed all products from SQLite into ChromaDB.
Run: python -m scripts.ingest          (upsert)
     python -m scripts.ingest --reset  (drop collection first; use after changing EMBED_DIM/metadata)"""

import sys

from sqlalchemy import select

from app.db import SessionLocal, init_db
from app.models import Product
from app.services import vector_store


def main() -> None:
    init_db()
    if "--reset" in sys.argv:
        vector_store.reset_collection()
        print("Chroma collection reset.")
    with SessionLocal() as db:
        products = list(db.scalars(select(Product)))
    n = vector_store.upsert_products(products)
    print(f"Indexed {n} products. Collection size: {vector_store.get_collection().count()}")


if __name__ == "__main__":
    main()
