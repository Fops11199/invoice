from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_earned: float
    outstanding: float
    overdue: float
    client_count: int
    invoice_count: int
    recent_invoices: list[dict]
