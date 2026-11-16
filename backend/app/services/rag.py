"""RAG orchestration: filters -> retrieve -> grounded prompt -> LLM -> persist."""

import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import ChatMessage, ChatSession, Product
from app.schemas import ChatFilters
from app.services import llm, vector_store

SYSTEM_PROMPT = """You are ShopAssist, a friendly shopping assistant for an online store in India.
Rules:
- Recommend ONLY products listed in the CATALOG CONTEXT. Never invent products, prices, specs or stock.
- Quote prices in rupees exactly as given (e.g. ₹4,999).
- If nothing in the context fits, say so and ask a clarifying question (budget, size, use case).
- Keep answers short: 1-3 recommendations, one line each on why it fits.
- Refer to products by their exact name."""

_PRICE_UNDER = re.compile(r"(?:under|below|less than|within|upto|up to|max)\s*(?:rs\.?|inr|₹)?\s*([\d,]+)\s*(k)?", re.I)
_PRICE_OVER = re.compile(r"(?:over|above|more than|min)\s*(?:rs\.?|inr|₹)?\s*([\d,]+)\s*(k)?", re.I)


# Words that only make sense relative to an earlier turn ("cheaper ones?", "is it waterproof?").
_FOLLOW_UP = re.compile(
    r"\b(it|its|this|that|these|those|them|they|ones?|cheaper|pricier|costlier|bigger|smaller|"
    r"lighter|another|other|others|else|similar|instead|same|"
    r"more(?!\s+than)|less(?!\s+than)|what about|how about)\b",
    re.I,
)


def is_follow_up(message: str) -> bool:
    return bool(_FOLLOW_UP.search(message))


def build_search_query(message: str, history: list[dict[str, str]]) -> str:
    """Text to embed for retrieval.

    A standalone request ("smartphone under 20000") is searched on its own, so an earlier,
    unrelated request can't drown it out. A follow-up ("cheaper ones?") is combined with the
    most recent user turn so it keeps its context.
    """
    if not is_follow_up(message):
        return message
    last_user = next((m["content"] for m in reversed(history) if m["role"] == "user"), "")
    return f"{message} {last_user[-300:]}".strip()


def _to_int(num: str, k: str | None) -> int:
    value = int(num.replace(",", ""))
    return value * 1000 if k else value


def extract_filters(message: str, explicit: ChatFilters | None) -> ChatFilters:
    """Explicit UI filters win; otherwise parse simple price phrases from the message."""
    f = explicit.model_copy() if explicit else ChatFilters()
    if f.max_price is None and (m := _PRICE_UNDER.search(message)):
        f.max_price = _to_int(m.group(1), m.group(2))
    if f.min_price is None and (m := _PRICE_OVER.search(message)):
        f.min_price = _to_int(m.group(1), m.group(2))
    return f


def format_context(products: list[Product]) -> str:
    if not products:
        return "CATALOG CONTEXT: (no matching products found)"
    lines = ["CATALOG CONTEXT:"]
    for p in products:
        attrs = "; ".join(f"{k}={v}" for k, v in (p.attributes or {}).items())
        stock = "in stock" if p.stock > 0 else "out of stock"
        lines.append(
            f"- [{p.id}] {p.name} | brand={p.brand} | category={p.category} | "
            f"price=₹{p.price:,} | {stock} | rating={p.rating} | {p.description} {attrs}"
        )
    return "\n".join(lines)


def order_by_mention(products: list[Product], reply: str) -> list[Product]:
    """Put products the assistant names first (in the order it names them), then the rest.

    The UI badges the first card as the best match, so it should be what the answer recommends.
    """
    text = reply.lower()
    pos = {p.id: text.find(p.name.lower()) for p in products}
    mentioned = sorted((p for p in products if pos[p.id] >= 0), key=lambda p: pos[p.id])
    return mentioned + [p for p in products if pos[p.id] < 0]


def _get_or_create_session(db: Session, session_id: int | None) -> ChatSession:
    if session_id and (s := db.get(ChatSession, session_id)):
        return s
    s = ChatSession()
    db.add(s)
    db.flush()
    return s


def _history(session: ChatSession) -> list[dict[str, str]]:
    msgs = session.messages[-settings.history_turns * 2 :]
    return [{"role": m.role, "content": m.content} for m in msgs]


def answer(
    db: Session, message: str, session_id: int | None, filters: ChatFilters | None
) -> tuple[int, str, list[Product]]:
    session = _get_or_create_session(db, session_id)
    history = _history(session)
    f = extract_filters(message, filters)
    if is_follow_up(message) and f.max_price is None and f.min_price is None:
        # "cheaper ones?" keeps the budget from the request it refers to.
        last_user = next((m["content"] for m in reversed(history) if m["role"] == "user"), "")
        prev = extract_filters(last_user, None)
        f.max_price, f.min_price = prev.max_price, prev.min_price

    query = build_search_query(message, history)

    where = vector_store.build_where(f.max_price, f.min_price, f.category, f.in_stock_only)
    ids = vector_store.search(query, settings.top_k, where)
    by_id = {p.id: p for p in db.scalars(select(Product).where(Product.id.in_(ids)))}
    products = [by_id[i] for i in ids if i in by_id]

    user_turn = f"{format_context(products)}\n\nCUSTOMER: {message}"
    reply = llm.generate(SYSTEM_PROMPT, history, user_turn)
    products = order_by_mention(products, reply)

    db.add_all(
        [
            ChatMessage(session_id=session.id, role="user", content=message, product_ids=[]),
            ChatMessage(
                session_id=session.id,
                role="assistant",
                content=reply,
                product_ids=[p.id for p in products],
            ),
        ]
    )
    db.commit()
    return session.id, reply, products
