from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from .database.connection import get_db
from .models.customer import Customer
from .schemas.customer import CustomerCreate, CustomerResponse

from app.routers.product import router as product_router
from app.routers.order import router as order_router
from app.services.dashboard_service import get_dashboard_data


app = FastAPI(
    title="AI Business Platform API",
    version="1.0.0",
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Routers
# ---------------------------------------------------------

app.include_router(product_router)
app.include_router(order_router)


# ---------------------------------------------------------
# Root
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "AI Business Platform API is running"
    }


# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------

@app.get("/health")
def health_check(
    db: Session = Depends(get_db),
):
    try:
        db.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
        }


# ---------------------------------------------------------
# Dashboard
# ---------------------------------------------------------

@app.get("/api/dashboard")
def dashboard_api(
    db: Session = Depends(get_db),
):
    return get_dashboard_data(db)


# ---------------------------------------------------------
# Create Customer
# ---------------------------------------------------------

@app.post(
    "/customers",
    response_model=CustomerResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
):
    existing_customer = (
        db.query(Customer)
        .filter(Customer.email == customer.email)
        .first()
    )

    if existing_customer:
        raise HTTPException(
            status_code=409,
            detail="Customer with this email already exists",
        )

    new_customer = Customer(
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        company=customer.company,
        created_at=datetime.utcnow(),
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


# ---------------------------------------------------------
# Get Customers
# ---------------------------------------------------------

@app.get(
    "/customers",
    response_model=list[CustomerResponse],
)
def get_customers(
    db: Session = Depends(get_db),
):
    return (
        db.query(Customer)
        .order_by(Customer.id)
        .all()
    )


# ---------------------------------------------------------
# Get Customer
# ---------------------------------------------------------

@app.get(
    "/customers/{customer_id}",
    response_model=CustomerResponse,
)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    return customer


# ---------------------------------------------------------
# Update Customer
# ---------------------------------------------------------

@app.put(
    "/customers/{customer_id}",
    response_model=CustomerResponse,
)
def update_customer(
    customer_id: int,
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    duplicate_email = (
        db.query(Customer)
        .filter(
            Customer.email == customer_data.email,
            Customer.id != customer_id,
        )
        .first()
    )

    if duplicate_email:
        raise HTTPException(
            status_code=409,
            detail="Another customer already uses this email",
        )

    customer.name = customer_data.name
    customer.email = customer_data.email
    customer.phone = customer_data.phone
    customer.company = customer_data.company

    db.commit()
    db.refresh(customer)

    return customer


# ---------------------------------------------------------
# Delete Customer
# ---------------------------------------------------------

@app.delete(
    "/customers/{customer_id}",
)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
):
    customer = (
        db.query(Customer)
        .filter(Customer.id == customer_id)
        .first()
    )

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found",
        )

    db.delete(customer)
    db.commit()

    return {
        "message": "Customer deleted successfully",
        "id": customer_id,
    }