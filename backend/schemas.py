from pydantic import BaseModel, EmailStr
from typing import Optional, List
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

    class Config:
        from_attributes = True

class ChildDataResponse(BaseModel):
    id: int
    name: str
    email: str
    # Here you can add fields for session reports/progress data
