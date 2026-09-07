from pydantic import BaseModel


class DashboardResponse(BaseModel):
    revenue: float
    customers: int
    orders: int
    payments: float