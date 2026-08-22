from pydantic import BaseModel
from typing import Dict

class BudgetResponse(BaseModel):
    total: float
    by_category: Dict[str, float]
    daily_average: float
