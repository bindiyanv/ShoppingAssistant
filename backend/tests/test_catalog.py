from scripts.fetch_catalog import USD_TO_INR, map_product, round_inr


def test_round_inr():
    assert round_inr(0) == 0
    assert round_inr(849.15) == 849
    assert round_inr(850.0) == 849
    assert round_inr(850.5) == 859
    assert round_inr(4420) == 4499
    assert round_inr(161_499.15) == 161_499
    assert round_inr(161_500.1) == 161_999


def _raw(**over):
    raw = {
        "id": 7,
        "title": "Phone X",
        "category": "smartphones",
        "description": "A phone.",
        "price": 99.99,
        "stock": 12,
        "rating": 4.567,
        "brand": "Acme",
        "sku": "SMA-ACM-001",
        "tags": ["smartphones", "android"],
        "warrantyInformation": "1 year warranty",
        "thumbnail": "https://cdn.dummyjson.com/x/thumbnail.webp",
    }
    raw.update(over)
    return raw


def test_map_product_fields():
    row = map_product(_raw())
    assert row["sku"] == "DJ-SMA-ACM-001"
    assert row["category"] == "electronics"
    assert row["price"] == round_inr(99.99 * USD_TO_INR)
    assert isinstance(row["price"], int)
    assert row["rating"] == 4.6
    assert row["image_url"].startswith("https://cdn.dummyjson.com/")
    assert row["attributes"]["type"] == "smartphones"
    assert row["attributes"]["tags"] == "smartphones, android"


def test_map_product_category_mapping_and_skips():
    assert map_product(_raw(category="mens-shoes"))["category"] == "footwear"
    assert map_product(_raw(category="tops"))["category"] == "apparel"
    assert map_product(_raw(category="kitchen-accessories"))["category"] == "home"
    assert map_product(_raw(category="groceries")) is None
    assert map_product(_raw(category="beauty")) is None


def test_map_product_missing_brand():
    assert map_product(_raw(brand=None))["brand"] == "Generic"
