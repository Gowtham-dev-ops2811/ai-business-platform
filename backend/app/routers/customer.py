from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.customer import CustomerCreate, CustomerResponse
from app.services.customer_service import (
    create_customer,
    get_customer,
    get_customers,
)


router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"],
)


@router.get(
    "",
    response_model=list[CustomerResponse],
)
def read_customers(
    db: Session = Depends(get_db),
):
    return get_customers(db)


@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
)
def read_customer(
    customer_id: int,
    db: Session = Depends(get_db),
):
    customer = get_customer(db, customer_id)

    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found",
        )

    return customer


@router.post(
    "",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
):
    return create_customer(db, customer)