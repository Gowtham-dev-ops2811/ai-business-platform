from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.product import ProductCreate, ProductResponse
from app.services.product_service import (
    create_product,
    delete_product,
    get_product,
    get_products,
    update_product,
)


router = APIRouter(
    prefix="/products",
    tags=["Products"],
)


@router.get(
    "",
    response_model=list[ProductResponse],
)
def read_products(
    db: Session = Depends(get_db),
):
    return get_products(db)


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
)
def read_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = get_product(db, product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
):
    return create_product(db, product)


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
)
def edit_product(
    product_id: int,
    product_data: ProductCreate,
    db: Session = Depends(get_db),
):
    product = update_product(
        db,
        product_id,
        product_data,
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


@router.delete(
    "/{product_id}",
)
def remove_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = delete_product(db, product_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return {
        "message": "Product deleted successfully",
        "id": product_id,
    }