from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order


def get_dashboard_data(db: Session):
    customer_count = db.query(Customer).count()

    order_count = db.query(Order).count()

    total_revenue = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .scalar()
    )

    completed_payments = (
        db.query(func.coalesce(func.sum(Order.total_amount), 0))
        .filter(Order.status == "Completed")
        .scalar()
    )

    pending_orders = (
        db.query(Order)
        .filter(Order.status == "Pending")
        .count()
    )

    processing_orders = (
        db.query(Order)
        .filter(Order.status == "Processing")
        .count()
    )

    completed_orders = (
        db.query(Order)
        .filter(Order.status == "Completed")
        .count()
    )

    cancelled_orders = (
        db.query(Order)
        .filter(Order.status == "Cancelled")
        .count()
    )

    return {
        "revenue": float(total_revenue or 0),
        "customers": customer_count,
        "orders": order_count,
        "payments": float(completed_payments or 0),
        "order_status": {
            "Pending": pending_orders,
            "Processing": processing_orders,
            "Completed": completed_orders,
            "Cancelled": cancelled_orders,
        },
    }