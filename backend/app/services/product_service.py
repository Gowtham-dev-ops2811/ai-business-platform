from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate


def get_products(db: Session):
    return db.query(Product).order_by(Product.id.desc()).all()


def get_product(db: Session, product_id: int):
    return (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )


def create_product(db: Session, product: ProductCreate):
    new_product = Product(
        name=product.name,
        description=product.description,
        price=product.price,
        stock=product.stock,
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


def update_product(
    db: Session,
    product_id: int,
    product_data: ProductCreate,
):
    product = get_product(db, product_id)

    if not product:
        return None

    product.name = product_data.name
    product.description = product_data.description
    product.price = product_data.price
    product.stock = product_data.stock

    db.commit()
    db.refresh(product)

    return product


def delete_product(db: Session, product_id: int):
    product = get_product(db, product_id)

    if not product:
        return None

    db.delete(product)
    db.commit()

    return product