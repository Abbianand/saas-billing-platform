
from pydantic import BaseModel, ConfigDict, Field


class TenantCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    plan_id: int = Field(gt=0)


class TenantResponse(BaseModel):
    id: int
    name: str
    plan_id: int
    plan_name: str

    model_config = ConfigDict(from_attributes=True)