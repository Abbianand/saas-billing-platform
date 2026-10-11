from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class PlanCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    included_requests: int = Field(gt=0)
    overage_price: Decimal = Field(ge=0)


class PlanResponse(BaseModel):
    id: int
    name: str
    included_requests: int
    overage_price: Decimal

    model_config = ConfigDict(from_attributes=True)