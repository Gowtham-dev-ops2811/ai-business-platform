from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product
from app.schemas.order import (
    OrderCreate,
    OrderDetailResponse,
    OrderResponse,
    OrderStatusUpdate,
)


router = APIRouter(
    prefix="/orders",
    tags=["Orders"],
)


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == order_data.customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    product = (
        db.query(Product)
        .filter(Product.id == order_data.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    if product.stock < order_data.quantity:
        raise HTTPException(
            status_code=400,
            detail="Insufficient product stock",
        )

    total_amount = product.price * order_data.quantity

    new_order = Order(
        customer_id=order_data.customer_id,
        product_id=order_data.product_id,
        quantity=order_data.quantity,
        total_amount=total_amount,
        status="Pending",
    )

    product.stock -= order_data.quantity

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order


@router.get(
    "",
    response_model=list[OrderDetailResponse],
)
def get_orders(
    db: Session = Depends(get_db),
):
    orders = (
        db.query(
            Order,
            Customer.name.label("customer_name"),
            Product.name.label("product_name"),
        )
        .join(
            Customer,
            Customer.id == Order.customer_id,
        )
        .join(
            Product,
            Product.id == Order.product_id,
        )
        .order_by(Order.id)
        .all()
    )

    result = []

    for order, customer_name, product_name in orders:
        result.append(
            {
                "id": order.id,
                "customer_id": order.customer_id,
                "product_id": order.product_id,
                "quantity": order.quantity,
                "total_amount": order.total_amount,
                "status": order.status,
                "created_at": order.created_at,
                "customer_name": customer_name,
                "product_name": product_name,
            }
        )

    return result


@router.get(
    "/{order_id}",
    response_model=OrderResponse,
)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    return order


@router.put(
    "/{order_id}",
    response_model=OrderResponse,
)
def update_order(
    order_id: int,
    order_data: OrderCreate,
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    customer = (
        db.query(Customer)
        .filter(Customer.id == order_data.customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    product = (
        db.query(Product)
        .filter(Product.id == order_data.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    old_product = (
        db.query(Product)
        .filter(Product.id == order.product_id)
        .first()
    )

    if old_product:
        old_product.stock += order.quantity

    if product.stock < order_data.quantity:
        db.rollback()

        raise HTTPException(
            status_code=400,
            detail="Insufficient product stock",
        )

    product.stock -= order_data.quantity

    order.customer_id = order_data.customer_id
    order.product_id = order_data.product_id
    order.quantity = order_data.quantity
    order.total_amount = product.price * order_data.quantity

    db.commit()
    db.refresh(order)

    return order


@router.put(
    "/{order_id}/status",
    response_model=OrderResponse,
)
def update_order_status(
    order_id: int,
    status_data: OrderStatusUpdate,
    db: Session = Depends(get_db),
):
    allowed_statuses = {
        "Pending",
        "Processing",
        "Completed",
        "Cancelled",
    }

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid order status",
        )

    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    order.status = status_data.status

    db.commit()
    db.refresh(order)

    return order


@router.delete(
    "/{order_id}",
)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
):
    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    product = (
        db.query(Product)
        .filter(Product.id == order.product_id)
        .first()
    )

    if product:
        product.stock += order.quantity

    db.delete(order)
    db.commit()

    return {
        "message": "Order deleted successfully",
        "id": order_id,
    }