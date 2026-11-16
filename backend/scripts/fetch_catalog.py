"""Fetch a realistic product catalog from DummyJSON and save it as a local snapshot.

Run: python -m scripts.fetch_catalog        (or: python -m scripts.seed_db --fetch)

Writes data/products_dummyjson.json, which seed_db loads alongside data/products.json.
Seeding itself stays offline, so tests never hit the network.
"""

import json
import math
import urllib.request
from pathlib import Path
from typing import Any

BASE_URL = "https://dummyjson.com/products/category/{slug}?limit=0"
OUT = Path(__file__).resolve().parent.parent / "data" / "products_dummyjson.json"

USD_TO_INR = 85  # fixed demo rate; prices are stored as whole rupees

# DummyJSON category slug -> our catalog category. Anything not listed is skipped.
CATEGORY_MAP: dict[str, str] = {
    "smartphones": "electronics",
    "laptops": "electronics",
    "tablets": "electronics",
    "mobile-accessories": "electronics",
    "mens-shoes": "footwear",
    "womens-shoes": "footwear",
    "mens-shirts": "apparel",
    "tops": "apparel",
    "womens-dresses": "apparel",
    "kitchen-accessories": "home",
    "furniture": "home",
    "home-decoration": "home",
}


def round_inr(amount: float) -> int:
    """Round a rupee amount up to a familiar retail price ending in 9.

    < ₹1,000 -> next ...9 (₹849), < ₹10,000 -> next ...99 (₹4,499), else next ...499/...999.
    """
    if amount <= 0:
        return 0
    if amount < 1000:
        step = 10
    elif amount < 10000:
        step = 100
    else:
        step = 500
    return int(math.ceil(amount / step) * step) - 1


def map_product(raw: dict[str, Any]) -> dict[str, Any] | None:
    """Convert one DummyJSON product into our products.json row shape, or None to skip."""
    category = CATEGORY_MAP.get(raw.get("category", ""))
    if category is None:
        return None
    attributes = {"type": raw["category"].replace("-", " ")}
    if tags := raw.get("tags"):
        attributes["tags"] = ", ".join(tags)
    if warranty := raw.get("warrantyInformation"):
        attributes["warranty"] = warranty
    if policy := raw.get("returnPolicy"):
        attributes["return_policy"] = policy
    return {
        "sku": f"DJ-{raw.get('sku') or raw['id']}",
        "name": raw["title"],
        "brand": raw.get("brand") or "Generic",
        "category": category,
        "description": raw.get("description", ""),
        "attributes": attributes,
        "price": round_inr(float(raw["price"]) * USD_TO_INR),
        "stock": int(raw.get("stock", 0)),
        "rating": round(float(raw["rating"]), 1) if raw.get("rating") is not None else None,
        "image_url": raw.get("thumbnail") or (raw.get("images") or [None])[0],
    }


def _get_json(url: str) -> dict[str, Any]:
    req = urllib.request.Request(url, headers={"User-Agent": "shopassist-catalog/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for slug in CATEGORY_MAP:
        data = _get_json(BASE_URL.format(slug=slug))
        rows.extend(r for raw in data.get("products", []) if (r := map_product(raw)))
    return rows


def main() -> None:
    rows = fetch()
    OUT.write_text(json.dumps(rows, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    counts: dict[str, int] = {}
    for r in rows:
        counts[r["category"]] = counts.get(r["category"], 0) + 1
    print(f"Saved {len(rows)} DummyJSON products to {OUT.name}: {counts}")


if __name__ == "__main__":
    main()
