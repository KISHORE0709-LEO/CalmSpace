from sqlalchemy import Integer, String, ForeignKey, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from typing import Optional, List
import enum
from .database import Base

class RoleEnum(str, enum.Enum):
    parent = "parent"
    caregiver = "caregiver"
    doctor = "doctor"

class StatusEnum(str, enum.Enum):
    pending = "pending"
    active = "active"
    revoked = "revoked"

class ThreadTypeEnum(str, enum.Enum):
    parent_caregiver = "parent_caregiver"
    parent_doctor = "parent_doctor"
    caregiver_doctor = "caregiver_doctor"

class CareCircle(Base):
    __tablename__ = "care_circles"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    child_profile_id: Mapped[Optional[int]] = mapped_column(Integer, index=True, nullable=True)
    created_by: Mapped[int] = mapped_column(Integer, index=True) # user_id of the parent
    caregiver_doctor_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    members: Mapped[List["CircleMember"]] = relationship("CircleMember", back_populates="circle")
    threads: Mapped[List["ChatThread"]] = relationship("ChatThread", back_populates="circle")

class CircleMember(Base):
    __tablename__ = "circle_members"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    circle_id: Mapped[int] = mapped_column(Integer, ForeignKey("care_circles.id"))
    user_id: Mapped[int] = mapped_column(Integer, index=True)
    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum))
    status: Mapped[StatusEnum] = mapped_column(Enum(StatusEnum), default=StatusEnum.pending)
    invited_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    joined_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    circle: Mapped["CareCircle"] = relationship("CareCircle", back_populates="members")

class ChatThread(Base):
    __tablename__ = "chat_threads"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    circle_id: Mapped[int] = mapped_column(Integer, ForeignKey("care_circles.id"))
    thread_type: Mapped[ThreadTypeEnum] = mapped_column(Enum(ThreadTypeEnum))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    circle: Mapped["CareCircle"] = relationship("CareCircle", back_populates="threads")
    participants: Mapped[List["ThreadParticipant"]] = relationship("ThreadParticipant", back_populates="thread")
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="thread")

class ThreadParticipant(Base):
    __tablename__ = "thread_participants"
    
    thread_id: Mapped[int] = mapped_column(Integer, ForeignKey("chat_threads.id"), primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    
    thread: Mapped["ChatThread"] = relationship("ChatThread", back_populates="participants")

class Message(Base):
    __tablename__ = "messages"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    thread_id: Mapped[int] = mapped_column(Integer, ForeignKey("chat_threads.id"))
    sender_id: Mapped[int] = mapped_column(Integer, index=True)
    content: Mapped[str] = mapped_column(String)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    read_status: Mapped[bool] = mapped_column(Boolean, default=False)

    thread: Mapped["ChatThread"] = relationship("ChatThread", back_populates="messages")
