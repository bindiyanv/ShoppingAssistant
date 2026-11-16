from pydantic import BaseModel, ConfigDict, Field


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    name: str
    brand: str
    category: str
    description: str
    attributes: dict
    price: int
    stock: int
    rating: float | None = None
    image_url: str | None = None


class ChatFilters(BaseModel):
    max_price: int | None = None
    min_price: int | None = None
    category: str | None = None
    in_stock_only: bool = True


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: int | None = None
    filters: ChatFilters | None = None


class ChatResponse(BaseModel):
    session_id: int
    answer: str
    products: list[ProductOut]


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    role: str
    content: str
    product_ids: list[int]


class OrderItemIn(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1, le=20)


class OrderCreate(BaseModel):
    items: list[OrderItemIn] = Field(min_length=1)
    user_id: int | None = None


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    total: int
