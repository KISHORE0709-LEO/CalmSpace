from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets

from ..database import get_db
from ..models import CareCircle, CircleMember, RoleEnum, StatusEnum, ChatThread, ThreadTypeEnum, ThreadParticipant
from ..auth import get_current_user, TokenData, require_parent
from pydantic import BaseModel

router = APIRouter()

class InviteRequest(BaseModel):
    role: RoleEnum

class JoinRequest(BaseModel):
    invite_code: str

# In a real app, invite codes would be stored in a table or cache (e.g. Redis).
# For scaffolding, we'll store them in memory.
mock_invite_db = {}

@router.post("/{circle_id}/invite")
async def generate_invite(
    circle_id: int, 
    invite: InviteRequest, 
    db: Session = Depends(get_db), 
    current_user: TokenData = Depends(require_parent)
):
    # Verify circle exists and belongs to parent
    circle = db.query(CareCircle).filter(CareCircle.id == circle_id, CareCircle.created_by == current_user.user_id).first()
    if not circle:
        raise HTTPException(status_code=404, detail="Care circle not found")
        
    # Generate invite code
    invite_code = secrets.token_hex(4)
    
    # In a real system we might create a pending member row immediately if we know the user's email,
    # but with a shareable code, we just create the code first.
    mock_invite_db[invite_code] = {
        "circle_id": circle_id,
        "role": invite.role
    }
    
    return {"invite_code": invite_code, "expires_in": "24h"}

@router.post("/join")
async def join_circle(
    request: JoinRequest, 
    db: Session = Depends(get_db), 
    current_user: TokenData = Depends(get_current_user)
):
    invite_data = mock_invite_db.get(request.invite_code)
    if not invite_data:
        raise HTTPException(status_code=400, detail="Invalid or expired invite code")
        
    circle_id = invite_data["circle_id"]
    role = invite_data["role"]
    
    # Check if already a member
    existing_member = db.query(CircleMember).filter(
        CircleMember.circle_id == circle_id, 
        CircleMember.user_id == current_user.user_id
    ).first()
    
    if existing_member:
        existing_member.status = StatusEnum.active
        existing_member.role = role
        existing_member.joined_at = datetime.utcnow()
    else:
        new_member = CircleMember(
            circle_id=circle_id,
            user_id=current_user.user_id,
            role=role,
            status=StatusEnum.active,
            joined_at=datetime.utcnow()
        )
        db.add(new_member)
    
    # Create necessary chat threads
    circle = db.query(CareCircle).filter(CareCircle.id == circle_id).first()
    
    # Determine which threads to create based on role joined
    thread_types_needed = []
    if role == RoleEnum.caregiver:
        thread_types_needed.append(ThreadTypeEnum.parent_caregiver)
        if circle.caregiver_doctor_enabled:
            thread_types_needed.append(ThreadTypeEnum.caregiver_doctor)
    elif role == RoleEnum.doctor:
        thread_types_needed.append(ThreadTypeEnum.parent_doctor)
        if circle.caregiver_doctor_enabled:
            thread_types_needed.append(ThreadTypeEnum.caregiver_doctor)
            
    for t_type in thread_types_needed:
        thread = db.query(ChatThread).filter(ChatThread.circle_id == circle_id, ChatThread.thread_type == t_type).first()
        if not thread:
            thread = ChatThread(circle_id=circle_id, thread_type=t_type)
            db.add(thread)
            db.commit()
            db.refresh(thread)
            
            # Add the parent to this thread
            db.add(ThreadParticipant(thread_id=thread.id, user_id=circle.created_by))
            
        # Add the joining user to the thread
        # In a robust implementation we'd check if they are already in it
        participant_exists = db.query(ThreadParticipant).filter(
            ThreadParticipant.thread_id == thread.id, 
            ThreadParticipant.user_id == current_user.user_id
        ).first()
        if not participant_exists:
            db.add(ThreadParticipant(thread_id=thread.id, user_id=current_user.user_id))
            
    db.commit()
    
    return {"message": "Successfully joined care circle", "circle_id": circle_id, "role": role}

@router.delete("/{circle_id}/members/{user_id}")
async def remove_member(
    circle_id: int, 
    user_id: int, 
    db: Session = Depends(get_db), 
    current_user: TokenData = Depends(require_parent)
):
    # Verify circle exists and belongs to parent
    circle = db.query(CareCircle).filter(CareCircle.id == circle_id, CareCircle.created_by == current_user.user_id).first()
    if not circle:
        raise HTTPException(status_code=404, detail="Care circle not found")
        
    member = db.query(CircleMember).filter(
        CircleMember.circle_id == circle_id, 
        CircleMember.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    # Soft delete
    member.status = StatusEnum.revoked
    db.commit()
    
    return {"message": "Member access revoked"}

@router.get("/{circle_id}/members")
async def list_members(
    circle_id: int, 
    db: Session = Depends(get_db), 
    current_user: TokenData = Depends(require_parent)
):
    members = db.query(CircleMember).filter(
        CircleMember.circle_id == circle_id,
        CircleMember.status != StatusEnum.revoked
    ).all()
    
    # In a real app we'd join with the User table to get names/avatars
    return [
        {
            "user_id": m.user_id,
            "role": m.role,
            "status": m.status,
            "joined_at": m.joined_at
        } for m in members
    ]
