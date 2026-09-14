from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class SignupRequest(BaseModel):
    firebase_uid: str
    name: str
    email: EmailStr
    role: str
    child_email: Optional[EmailStr] = None

class UserResponse(BaseModel):
    id: int
    firebase_uid: str
    email: str
    name: str
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChildDataResponse(BaseModel):
    id: int
    name: str
    email: str
    # Here you can add fields for session reports/progress data


class CreateCareCircleRequest(BaseModel):
    name: Optional[str] = None
    child_name: str


class CareCircleResponse(BaseModel):
    id: int
    name: str
    child_name: str
    owner_user_id: int
    created_at: datetime
    owner_name: Optional[str] = None
    current_user_role: Optional[str] = None
    current_user_status: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CareCircleMemberResponse(BaseModel):
    id: int
    circle_id: int
    user_id: Optional[int] = None
    name: Optional[str] = None
    invited_email: str
    role: str
    status: str
    invited_at: datetime
    responded_at: Optional[datetime] = None
    is_owner: bool = False
    can_revoke: bool = False
    can_cancel: bool = False

    model_config = ConfigDict(from_attributes=True)


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str  # parent | caregiver | doctor


class ChatMessageResponse(BaseModel):
    id: int
    circle_id: int
    sender_user_id: int
    sender_name: str
    sender_role: str
    content: str
    sent_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SendMessageRequest(BaseModel):
    content: str

