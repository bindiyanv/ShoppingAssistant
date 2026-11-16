"""Minimal orders API. M4 will expose these as LLM tools (add_to_cart, place_order, order_status)."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Order, OrderItem, Product
from app.schemas import OrderCreate, OrderOut

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=201)
def place_order(body: OrderCreate, db: Session = Depends(get_db)):
    order = Order(user_id=body.user_id)
    total = 0
    for item in body.items:
        product = db.get(Product, item.product_id)
        if not product:
            raise HTTPException(404, f"Product {item.product_id} not found")
        if product.stock < item.quantity:
            raise HTTPException(409, f"Not enough stock for {product.name}")
        product.stock -= item.quantity
        total += product.price * item.quantity
        order.items.append(
            OrderItem(product_id=product.id, quantity=item.quantity, unit_price=product.price)
        )
    order.total = total
    db.add(order)
    db.commit()
    return order


@router.get("/{order_id}", response_model=OrderOut)
def order_status(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    return order
