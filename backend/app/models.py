from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    password_hash: Mapped[str | None] = mapped_column(String(255))  # M5: auth
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    brand: Mapped[str] = mapped_column(String(128), default="")
    category: Mapped[str] = mapped_column(String(64), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    attributes: Mapped[dict] = mapped_column(JSON, default=dict)
    price: Mapped[int] = mapped_column(Integer)  # INR, whole rupees
    stock: Mapped[int] = mapped_column(Integer, default=0)
    rating: Mapped[float | None] = mapped_column(default=None)
    image_url: Mapped[str | None] = mapped_column(String(512), default=None)


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(32), default="placed")
    total: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[int] = mapped_column(Integer)

    order: Mapped[Order] = relationship(back_populates="items")
    product: Mapped[Product] = relationship()


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    messages: Mapped[list["ChatMessage"]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.id"
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("chat_sessions.id"), index=True)
    role: Mapped[str] = mapped_column(String(16))  # "user" | "assistant"
    content: Mapped[str] = mapped_column(Text)
    product_ids: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    session: Mapped[ChatSession] = relationship(back_populates="messages")
