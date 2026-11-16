from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Product
from app.schemas import ProductOut

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=list[ProductOut])
def list_products(
    category: str | None = None, limit: int = 50, db: Session = Depends(get_db)
):
    stmt = select(Product).limit(min(limit, 200))
    if category:
        stmt = stmt.where(Product.category == category.lower())
    return db.scalars(stmt).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    return product
