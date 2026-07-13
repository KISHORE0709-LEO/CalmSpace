from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
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
    
    id = Column(Integer, primary_key=True, index=True)
    child_profile_id = Column(Integer, index=True)
    created_by = Column(Integer, index=True) # user_id of the parent
    caregiver_doctor_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("CircleMember", back_populates="circle")
    threads = relationship("ChatThread", back_populates="circle")

class CircleMember(Base):
    __tablename__ = "circle_members"
    
    id = Column(Integer, primary_key=True, index=True)
    circle_id = Column(Integer, ForeignKey("care_circles.id"))
    user_id = Column(Integer, index=True)
    role = Column(Enum(RoleEnum))
    status = Column(Enum(StatusEnum), default=StatusEnum.pending)
    invited_at = Column(DateTime, default=datetime.utcnow)
    joined_at = Column(DateTime, nullable=True)

    circle = relationship("CareCircle", back_populates="members")

class ChatThread(Base):
    __tablename__ = "chat_threads"
    
    id = Column(Integer, primary_key=True, index=True)
    circle_id = Column(Integer, ForeignKey("care_circles.id"))
    thread_type = Column(Enum(ThreadTypeEnum))
    created_at = Column(DateTime, default=datetime.utcnow)

    circle = relationship("CareCircle", back_populates="threads")
    participants = relationship("ThreadParticipant", back_populates="thread")
    messages = relationship("Message", back_populates="thread")

class ThreadParticipant(Base):
    __tablename__ = "thread_participants"
    
    thread_id = Column(Integer, ForeignKey("chat_threads.id"), primary_key=True)
    user_id = Column(Integer, primary_key=True)
    
    thread = relationship("ChatThread", back_populates="participants")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey("chat_threads.id"))
    sender_id = Column(Integer, index=True)
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    read_status = Column(Boolean, default=False)
    
    thread = relationship("ChatThread", back_populates="messages")
