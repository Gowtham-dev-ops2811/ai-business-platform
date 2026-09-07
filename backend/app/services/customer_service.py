from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate


def get_customers(db: Session):
    return db.query(Customer).order_by(Customer.id.desc()).all()


def get_customer(db: Session, customer_id: int):
    return db.query(Customer).filter(
        Customer.id == customer_id
    ).first()


def create_customer(db: Session, customer: CustomerCreate):
    new_customer = Customer(
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        company=customer.company,
    )

    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer