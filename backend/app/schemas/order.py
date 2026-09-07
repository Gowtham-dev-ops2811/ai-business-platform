from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OrderBase(BaseModel):
    customer_id: int
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(OrderBase):
    pass


class OrderStatusUpdate(BaseModel):
    status: str


class OrderResponse(OrderBase):
    id: int
    total_amount: float
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderDetailResponse(OrderResponse):
    customer_name: str
    product_name: str

    model_config = ConfigDict(from_attributes=True)