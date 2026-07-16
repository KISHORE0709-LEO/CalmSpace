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
