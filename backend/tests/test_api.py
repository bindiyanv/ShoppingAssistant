from app.schemas import ChatFilters
from app.services.rag import build_search_query, extract_filters, is_follow_up
from app.services.vector_store import build_where


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_extract_price_filters():
    assert extract_filters("running shoes under ₹5,000", None).max_price == 5000
    assert extract_filters("earbuds below 3k", None).max_price == 3000
    assert extract_filters("speaker above 2000", None).min_price == 2000
    # explicit UI filters win
    assert extract_filters("under 5000", ChatFilters(max_price=999)).max_price == 999


def test_build_where():
    assert build_where(in_stock_only=False) is None
    w = build_where(max_price=5000, category="Footwear")
    assert {"category": {"$eq": "footwear"}} in w["$and"]


def test_end_to_end_chat(client):
    from scripts import ingest, seed_db

    seed_db.main()
    ingest.main()

    r = client.post("/api/chat", json={"message": "waterproof running shoe under 5000"})
    assert r.status_code == 200
    body = r.json()
    assert body["answer"] == "FAKE ANSWER"
    assert body["products"], "retrieval should return products"
    assert all(p["price"] <= 5000 and p["stock"] > 0 for p in body["products"])

    h = client.get(f"/api/chat/{body['session_id']}/messages")
    assert [m["role"] for m in h.json()] == ["user", "assistant"]


def test_follow_up_detection():
    for msg in ["cheaper ones?", "is it waterproof?", "show me more", "what about in blue", "any other options"]:
        assert is_follow_up(msg), msg
    for msg in ["smartphone under 20000", "Earbuds for the gym", "speaker more than 2000",
                "Waterproof running shoes under ₹5000", "Something for monsoon commutes"]:
        assert not is_follow_up(msg), msg


def test_search_query_uses_history_only_for_follow_ups():
    history = [
        {"role": "user", "content": "waterproof running shoes under 5000"},
        {"role": "assistant", "content": "Try the Stride Pro."},
    ]
    assert build_search_query("smartphone under 20000", history) == "smartphone under 20000"
    q = build_search_query("cheaper ones?", history)
    assert q.startswith("cheaper ones?") and "running shoes" in q
    assert build_search_query("cheaper ones?", []) == "cheaper ones?"


def test_filter_relevant_drops_weak_hits():
    from app.services.vector_store import filter_relevant

    # Real distances for "Earbuds for the gym": the running shoe trails the earbuds.
    ids = ["5", "13", "14", "6", "1"]
    dists = [0.307, 0.342, 0.362, 0.388, 0.399]
    assert filter_relevant(ids, dists, margin=0.05, max_distance=0.38) == [5, 13]
    # Off-topic query: nothing is close enough.
    assert filter_relevant(["1", "2"], [0.43, 0.44], margin=0.05, max_distance=0.38) == []
    assert filter_relevant([], [], margin=0.05, max_distance=0.38) == []


def test_order_by_mention_puts_recommended_first():
    from types import SimpleNamespace

    from app.services.rag import order_by_mention

    a, b, c = (SimpleNamespace(id=i, name=n) for i, n in [(1, "Apple Airpods"), (2, "PulseBuds ANC"), (3, "BassMax Neckband")])
    reply = "Try **PulseBuds ANC** (₹3,499), or the bassmax neckband for less."
    assert [p.id for p in order_by_mention([a, b, c], reply)] == [2, 3, 1]
    assert [p.id for p in order_by_mention([a, b, c], "Nothing fits.")] == [1, 2, 3]
