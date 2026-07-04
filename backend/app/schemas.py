from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Membership Schemas


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


# Members Schemas
class MemberBase(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    email: str
    phone_number: Optional[str] = None
    address: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None

    favorite_exercise: Optional[str] = None
    avg_workout_duration_min: Optional[float] = 0.0
    avg_calories_burned: Optional[float] = 0.0
    total_weight_lifted_kg: Optional[float] = 0.0


class MemberCreate(MemberBase):
    pass


class MemberFaceRegister(BaseModel):
    face_embedding: List[float]


class MemberUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    status: Optional[str] = None


class MemberResponse(MemberBase):
    id: str
    status: str
    face_embedding: Optional[List[float]] = None
    created_at: datetime

    class Config:
        from_attributes = True
