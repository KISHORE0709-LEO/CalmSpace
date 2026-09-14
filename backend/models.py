from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    role = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships for links
    children_links = relationship("Link", foreign_keys="[Link.guardian_id]", back_populates="guardian")
    guardian_links = relationship("Link", foreign_keys="[Link.child_id]", back_populates="child")

class Link(Base):
    __tablename__ = "links"

    id = Column(Integer, primary_key=True, index=True)
    child_id = Column(Integer, ForeignKey("users.id"))
    guardian_id = Column(Integer, ForeignKey("users.id"))
    guardian_role = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    child = relationship("User", foreign_keys=[child_id], back_populates="guardian_links")
    guardian = relationship("User", foreign_keys=[guardian_id], back_populates="children_links")


class CareCircle(Base):
    __tablename__ = "care_circles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    child_name = Column(String)
    owner_user_id = Column(Integer, ForeignKey("users.id"), index=True)  # must be role='parent'
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", foreign_keys=[owner_user_id])
    members = relationship("CareCircleMember", back_populates="circle", cascade="all, delete-orphan")
    messages = relationship("ChatMessage", back_populates="circle", cascade="all, delete-orphan")


class CareCircleMember(Base):
    __tablename__ = "care_circle_members"

    id = Column(Integer, primary_key=True, index=True)
    circle_id = Column(Integer, ForeignKey("care_circles.id"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # null until invite is accepted and a matching account exists
    invited_email = Column(String, index=True)
    role = Column(String)  # parent | caregiver | doctor
    status = Column(String, default="pending")  # pending | active | revoked
    invited_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)

    circle = relationship("CareCircle", back_populates="members")
    user = relationship("User", foreign_keys=[user_id])


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    circle_id = Column(Integer, ForeignKey("care_circles.id"), index=True)
    sender_user_id = Column(Integer, ForeignKey("users.id"), index=True)
    content = Column(String)
    sent_at = Column(DateTime, default=datetime.utcnow)

    circle = relationship("CareCircle", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_user_id])

