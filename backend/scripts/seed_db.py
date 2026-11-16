"""Load the product catalog into SQLite (upsert by SKU).

Run: python -m scripts.seed_db           seed from local JSON files (offline)
     python -m scripts.seed_db --fetch   refresh the DummyJSON snapshot first, then seed

Sources:
  data/products.json            our hand-written Indian catalog items
  data/products_dummyjson.json  snapshot written by scripts/fetch_catalog.py (optional)
"""

import json
import sys
from pathlib import Path

from sqlalchemy import select

from app.db import SessionLocal, init_db
from app.models import Product

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SOURCES = [DATA_DIR / "products.json", DATA_DIR / "products_dummyjson.json"]


def load_rows() -> list[dict]:
    rows: list[dict] = []
    for path in SOURCES:
        if path.exists():
            rows.extend(json.loads(path.read_text(encoding="utf-8")))
    return rows


def main() -> None:
    if "--fetch" in sys.argv:
        from scripts import fetch_catalog

        fetch_catalog.main()

    init_db()
    rows = load_rows()
    with SessionLocal() as db:
        existing = {p.sku: p for p in db.scalars(select(Product))}
        for row in rows:
            row["category"] = row["category"].lower()
            if (p := existing.get(row["sku"])) is not None:
                for k, v in row.items():
                    setattr(p, k, v)
            else:
                db.add(Product(**row))
        db.commit()
    print(f"Seeded {len(rows)} products into SQLite.")


if __name__ == "__main__":
    main()
