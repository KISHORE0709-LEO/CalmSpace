from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from datetime import datetime
from typing import List, Optional

from database import get_db
import models
import schemas
from ..auth import get_current_user, require_parent

router = APIRouter(prefix="/api/care-circles", tags=["Care Circles"])


def check_circle_membership(
    circle_id: int,
    user: models.User,
    db: Session,
    require_active: bool = True
) -> models.CareCircleMember:
    """Validate user's membership in a circle, checking status server-side."""
    circle = db.query(models.CareCircle).filter(models.CareCircle.id == circle_id).first()
    if not circle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Care Circle not found")

    member = db.query(models.CareCircleMember).filter(
        models.CareCircleMember.circle_id == circle_id,
        or_(
            models.CareCircleMember.user_id == user.id,
            models.CareCircleMember.invited_email == user.email.lower()
        )
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this Care Circle"
        )

    if require_active and member.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: your membership status is '{member.status}'"
        )

    return member


@router.post("", response_model=schemas.CareCircleResponse, status_code=status.HTTP_201_CREATED)
def create_care_circle(
    request: schemas.CreateCareCircleRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_parent)
):
    """Parent creates a new Care Circle."""
    circle_name = request.name.strip() if request.name and request.name.strip() else f"{request.child_name.strip()}'s Care Circle"
    
    circle = models.CareCircle(
        name=circle_name,
        child_name=request.child_name.strip(),
        owner_user_id=current_user.id,
        created_at=datetime.utcnow()
    )
    db.add(circle)
    db.commit()
    db.refresh(circle)

    # Owner is automatically an active member
    owner_member = models.CareCircleMember(
        circle_id=circle.id,
        user_id=current_user.id,
        invited_email=current_user.email.lower(),
        role="parent",
        status="active",
        invited_at=datetime.utcnow(),
        responded_at=datetime.utcnow()
    )
    db.add(owner_member)
    db.commit()

    return schemas.CareCircleResponse(
        id=circle.id,
        name=circle.name,
        child_name=circle.child_name,
        owner_user_id=circle.owner_user_id,
        created_at=circle.created_at,
        owner_name=current_user.name,
        current_user_role="parent",
        current_user_status="active"
    )


@router.get("/mine", response_model=List[schemas.CareCircleResponse])
def get_my_care_circles(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Circles the current user belongs to (any status: active, pending, or owned)."""
    # Find all memberships
    memberships = db.query(models.CareCircleMember).filter(
        or_(
            models.CareCircleMember.user_id == current_user.id,
            models.CareCircleMember.invited_email == current_user.email.lower()
        )
    ).all()

    circle_ids = {m.circle_id for m in memberships}
    
    # Also include any circles owned by parent
    if current_user.role == "parent":
        owned_circles = db.query(models.CareCircle).filter(models.CareCircle.owner_user_id == current_user.id).all()
        for oc in owned_circles:
            circle_ids.add(oc.id)

    if not circle_ids:
        return []

    circles = db.query(models.CareCircle).filter(models.CareCircle.id.in_(circle_ids)).all()
    
    membership_map = {m.circle_id: m for m in memberships}
    
    result = []
    for c in circles:
        mem = membership_map.get(c.id)
        role = mem.role if mem else ("parent" if c.owner_user_id == current_user.id else None)
        mem_status = mem.status if mem else ("active" if c.owner_user_id == current_user.id else None)
        owner_name = c.owner.name if c.owner else "Parent"

        result.append(schemas.CareCircleResponse(
            id=c.id,
            name=c.name,
            child_name=c.child_name,
            owner_user_id=c.owner_user_id,
            created_at=c.created_at,
            owner_name=owner_name,
            current_user_role=role,
            current_user_status=mem_status
        ))

    return result


@router.get("/{circle_id}/members", response_model=List[schemas.CareCircleMemberResponse])
def get_circle_members(
    circle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Roster: list of members in circle. Enforces caller is active/pending member or owner."""
    circle = db.query(models.CareCircle).filter(models.CareCircle.id == circle_id).first()
    if not circle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Care Circle not found")

    caller_member = db.query(models.CareCircleMember).filter(
        models.CareCircleMember.circle_id == circle_id,
        or_(
            models.CareCircleMember.user_id == current_user.id,
            models.CareCircleMember.invited_email == current_user.email.lower()
        )
    ).first()

    is_owner = (circle.owner_user_id == current_user.id)
    if not is_owner and (not caller_member or caller_member.status == "revoked"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this Care Circle")

    members = db.query(models.CareCircleMember).filter(
        models.CareCircleMember.circle_id == circle_id
    ).order_by(models.CareCircleMember.invited_at.asc()).all()

    result = []
    for m in members:
        user_name = m.user.name if m.user else None
        if not user_name:
            user_name = m.invited_email.split("@")[0].replace(".", " ").title()

        is_member_owner = (m.user_id == circle.owner_user_id)
        can_revoke = is_owner and (m.status == "active") and not is_member_owner
        can_cancel = is_owner and (m.status == "pending")

        result.append(schemas.CareCircleMemberResponse(
            id=m.id,
            circle_id=m.circle_id,
            user_id=m.user_id,
            name=user_name,
            invited_email=m.invited_email,
            role=m.role,
            status=m.status,
            invited_at=m.invited_at,
            responded_at=m.responded_at,
            is_owner=is_member_owner,
            can_revoke=can_revoke,
            can_cancel=can_cancel
        ))

    return result


@router.post("/{circle_id}/invite", response_model=schemas.CareCircleMemberResponse)
def invite_member(
    circle_id: int,
    request: schemas.InviteMemberRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_parent)
):
    """Parent only: invite a caregiver, doctor, or parent by email."""
    circle = db.query(models.CareCircle).filter(
        models.CareCircle.id == circle_id,
        models.CareCircle.owner_user_id == current_user.id
    ).first()
    if not circle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Care Circle not found or you are not the owner")

    valid_roles = ["parent", "caregiver", "doctor"]
    if request.role not in valid_roles:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid role. Allowed: {valid_roles}")

    invited_email = request.email.strip().lower()

    # Check for existing member
    existing = db.query(models.CareCircleMember).filter(
        models.CareCircleMember.circle_id == circle_id,
        models.CareCircleMember.invited_email == invited_email
    ).first()

    if existing:
        if existing.status == "active":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Member with this email is already active")
        elif existing.status == "pending":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Member with this email already has a pending invite")
        elif existing.status == "revoked":
            # Re-invite
            existing.status = "pending"
            existing.role = request.role
            existing.invited_at = datetime.utcnow()
            existing.responded_at = None
            db.commit()
            db.refresh(existing)
            return schemas.CareCircleMemberResponse(
                id=existing.id,
                circle_id=existing.circle_id,
                user_id=existing.user_id,
                name=existing.user.name if existing.user else invited_email.split("@")[0].title(),
                invited_email=existing.invited_email,
                role=existing.role,
                status=existing.status,
                invited_at=existing.invited_at,
                responded_at=existing.responded_at,
                is_owner=False,
                can_revoke=False,
                can_cancel=True
            )

    # Check if a user with this email already exists
    matching_user = db.query(models.User).filter(models.User.email == invited_email).first()
    user_id = matching_user.id if matching_user else None

    member = models.CareCircleMember(
        circle_id=circle_id,
        user_id=user_id,
        invited_email=invited_email,
        role=request.role,
        status="pending",
        invited_at=datetime.utcnow()
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    return schemas.CareCircleMemberResponse(
        id=member.id,
        circle_id=member.circle_id,
        user_id=member.user_id,
        name=matching_user.name if matching_user else invited_email.split("@")[0].title(),
        invited_email=member.invited_email,
        role=member.role,
        status=member.status,
        invited_at=member.invited_at,
        responded_at=member.responded_at,
        is_owner=False,
        can_revoke=False,
        can_cancel=True
    )


@router.post("/{circle_id}/invite/{member_id}/cancel")
def cancel_invite(
    circle_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_parent)
):
    """Parent only: cancel a pending invite."""
    circle = db.query(models.CareCircle).filter(
        models.CareCircle.id == circle_id,
        models.CareCircle.owner_user_id == current_user.id
    ).first()
    if not circle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Care Circle not found or you are not the owner")

    member = db.query(models.CareCircleMember).filter(
        models.CareCircleMember.id == member_id,
        models.CareCircleMember.circle_id == circle_id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member invite not found")

    if member.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending invites can be cancelled")

    db.delete(member)
    db.commit()
    return {"message": "Invite cancelled successfully", "member_id": member_id}


@router.post("/{circle_id}/members/{member_id}/revoke")
def revoke_member(
    circle_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_parent)
):
    """Parent only: revoke an active member's access."""
    circle = db.query(models.CareCircle).filter(
        models.CareCircle.id == circle_id,
        models.CareCircle.owner_user_id == current_user.id
    ).first()
    if not circle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Care Circle not found or you are not the owner")

    member = db.query(models.CareCircleMember).filter(
        models.CareCircleMember.id == member_id,
        models.CareCircleMember.circle_id == circle_id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    if member.user_id == circle.owner_user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot revoke the circle owner")

    if member.status != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only active members can be revoked")

    member.status = "revoked"
    member.responded_at = datetime.utcnow()
    db.commit()

    return {"message": "Member access revoked successfully", "member_id": member_id}


@router.post("/{circle_id}/invite/{member_id}/accept")
def accept_invite(
    circle_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Invited user accepts the pending invite."""
    member = db.query(models.CareCircleMember).filter(
        models.CareCircleMember.id == member_id,
        models.CareCircleMember.circle_id == circle_id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")

    # Caller must match invited email or assigned user_id
    is_authorized = (member.user_id == current_user.id) or (member.invited_email.lower() == current_user.email.lower())
    if not is_authorized:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This invite was not sent to your account")

    if member.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot accept invite with status '{member.status}'")

    member.status = "active"
    member.user_id = current_user.id
    member.responded_at = datetime.utcnow()
    db.commit()

    return {"message": "Invite accepted. You are now an active member of this Care Circle.", "circle_id": circle_id}


@router.post("/{circle_id}/invite/{member_id}/decline")
def decline_invite(
    circle_id: int,
    member_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Invited user declines the pending invite."""
    member = db.query(models.CareCircleMember).filter(
        models.CareCircleMember.id == member_id,
        models.CareCircleMember.circle_id == circle_id
    ).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")

    is_authorized = (member.user_id == current_user.id) or (member.invited_email.lower() == current_user.email.lower())
    if not is_authorized:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This invite was not sent to your account")

    if member.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot decline invite with status '{member.status}'")

    member.status = "revoked"
    member.responded_at = datetime.utcnow()
    db.commit()

    return {"message": "Invite declined.", "circle_id": circle_id}


@router.get("/{circle_id}/messages", response_model=List[schemas.ChatMessageResponse])
def get_circle_messages(
    circle_id: int,
    before: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Paginated chat history, active members only."""
    check_circle_membership(circle_id, current_user, db, require_active=True)

    query = db.query(models.ChatMessage).filter(models.ChatMessage.circle_id == circle_id)

    if before:
        try:
            before_dt = datetime.fromisoformat(before.replace("Z", "+00:00"))
            query = query.filter(models.ChatMessage.sent_at < before_dt)
        except Exception:
            pass

    messages = query.order_by(models.ChatMessage.sent_at.asc()).limit(limit).all()

    result = []
    for msg in messages:
        sender_name = msg.sender.name if msg.sender else "User"
        sender_role = msg.sender.role if msg.sender else "member"
        result.append(schemas.ChatMessageResponse(
            id=msg.id,
            circle_id=msg.circle_id,
            sender_user_id=msg.sender_user_id,
            sender_name=sender_name,
            sender_role=sender_role,
            content=msg.content,
            sent_at=msg.sent_at
        ))

    return result
