from app.database.base import Base
from app.database.connection import engine

from app.models.customer import Customer
from app.models.product import Product
from app.models.order import Order


print("Creating database tables...")

Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")