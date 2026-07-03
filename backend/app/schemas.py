from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class MembershipBase(BaseModel):
    name: str
    contract_period: int
    price: float


class MembershipCreate(MembershipBase):
    pass


class MembershipUpdate(BaseModel):
    name: Optional[str] = None
    contract_period: Optional[int] = None
    price: Optional[float] = None


class MembershipResponse(MembershipBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
