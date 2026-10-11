
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UsageCreate(BaseModel):
    tenant_id: int = Field(gt=0)
    usage_type: str


class UsageResponse(BaseModel):
    id: int
    subscription_id: int
    usage_type: str
    quantity: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)