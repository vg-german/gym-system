from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional, List
from datetime import datetime, date


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
    id: UUID
    status: str
    face_embedding: Optional[List[float]] = None
    join_date: datetime
    last_visit_date: Optional[datetime] = None

    class Config:
        from_attributes = True


# Access Verification Schema
class FaceVerificationRequest(BaseModel):
    face_embedding: List[float]

# Attendance Schemas


class AttendanceLogBase(BaseModel):
    member_id: UUID
    access_status: str


class AttendanceLogResponse(AttendanceLogBase):
    id: int
    checked_in: datetime

    class Config:
        from_attributes = True


# Suscription Schemas
class SubscriptionBase(BaseModel):
    member_id: UUID
    membership_id: int


class SubscriptionCreate(SubscriptionBase):
    pass


class SubscriptionItemResponse(BaseModel):
    id: UUID
    member_name: str
    email: str
    plan_name: str
    start_date: date
    end_date: date
    status: str

    class Config:
        from_attributes = True


class PaginatedSubscriptionResponse(BaseModel):
    items: list[SubscriptionItemResponse]
    total_pages: int
    current_page: int
    total_items: int

    class Config:
        from_attributes = True

# Dashboard Schemas


class DashboardStats(BaseModel):
    total_members: int
    active_subscribers: int
    today_checkins: int


class AccessLogResponse(BaseModel):
    id: int
    name: str
    email: str
    time:  str
    status: str

    class Config:
        from_attributes = True
