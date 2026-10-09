"""
Therapy Sessions API
Handles session scheduling, participant management, and Stream Video token generation.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional
import uuid
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from database import get_db
import models
from pydantic import BaseModel

router = APIRouter(prefix="/api/therapy", tags=["therapy"])

# ─────────────────────────────────────────────
# Pydantic Schemas (inline to keep it contained)
# ─────────────────────────────────────────────

class ParticipantOut(BaseModel):
    id: int
    user_id: int
    role: str
    invite_status: str
    user_name: Optional[str] = None
    user_email: Optional[str] = None

    class Config:
        from_attributes = True


class SessionOut(BaseModel):
    id: int
    session_uid: str
    title: Optional[str]
    session_type: str
    status: str
    scheduled_time: Optional[datetime]
    duration_minutes: int
    goals: Optional[str]
    notes: Optional[str]
    recording_url: Optional[str]
    doctor_user_id: int
    child_user_id: int
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    created_at: datetime
    doctor_name: Optional[str] = None
    child_name: Optional[str] = None
    participants: List[ParticipantOut] = []

    class Config:
        from_attributes = True


class CreateSessionRequest(BaseModel):
    firebase_uid: str          # doctor's firebase UID
    child_user_id: int         # ID of the child
    title: Optional[str] = None
    session_type: str = "follow-up"
    scheduled_time: Optional[datetime] = None
    duration_minutes: int = 45
    goals: Optional[str] = None
    notes: Optional[str] = None
    invite_parent: bool = True
    invite_caregiver: bool = False


class UpdateStatusRequest(BaseModel):
    firebase_uid: str
    status: str   # accepted | declined | live | completed | cancelled


class RespondInviteRequest(BaseModel):
    firebase_uid: str
    response: str  # accepted | declined


# ─────────────────────────────────────────────
# Helper: generate a room ID like abc-defg-hij
# ─────────────────────────────────────────────
def _gen_room_id() -> str:
    import string, random
    alpha = string.ascii_lowercase
    return f"{''.join(random.choices(alpha, k=3))}-{''.join(random.choices(alpha, k=4))}-{''.join(random.choices(alpha, k=3))}"


def _session_to_out(s: models.TherapySession) -> dict:
    """Enrich a session ORM object with readable names."""
    participants = []
    for p in s.participants:
        participants.append({
            "id": p.id,
            "user_id": p.user_id,
            "role": p.role,
            "invite_status": p.invite_status,
            "user_name": p.user.name if p.user else None,
            "user_email": p.user.email if p.user else None,
        })
    return {
        "id": s.id,
        "session_uid": s.session_uid,
        "title": s.title,
        "session_type": s.session_type,
        "status": s.status,
        "scheduled_time": s.scheduled_time,
        "duration_minutes": s.duration_minutes,
        "goals": s.goals,
        "notes": s.notes,
        "recording_url": s.recording_url,
        "doctor_user_id": s.doctor_user_id,
        "child_user_id": s.child_user_id,
        "started_at": s.started_at,
        "ended_at": s.ended_at,
        "created_at": s.created_at,
        "doctor_name": s.doctor.name if s.doctor else None,
        "child_name": s.child.name if s.child else None,
        "participants": participants,
    }


# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────

@router.post("/sessions", response_model=dict)
def create_session(req: CreateSessionRequest, db: Session = Depends(get_db)):
    """Doctor creates/schedules a new therapy session."""
    doctor = db.query(models.User).filter(
        models.User.firebase_uid == req.firebase_uid,
        models.User.role == "doctor"
    ).first()
    if not doctor:
        raise HTTPException(status_code=403, detail="Only doctors can create sessions")

    child = db.query(models.User).filter(
        models.User.id == req.child_user_id,
        models.User.role == "child"
    ).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    session_uid = _gen_room_id()
    session = models.TherapySession(
        session_uid=session_uid,
        title=req.title or f"Therapy Session with {child.name}",
        session_type=req.session_type,
        status="pending_acceptance",
        scheduled_time=req.scheduled_time,
        duration_minutes=req.duration_minutes,
        goals=req.goals,
        notes=req.notes,
        doctor_user_id=doctor.id,
        child_user_id=child.id,
    )
    db.add(session)
    db.flush()  # get session.id

    # Always add doctor and child as participants
    db.add(models.TherapySessionParticipant(
        session_id=session.id, user_id=doctor.id, role="doctor", invite_status="accepted"
    ))
    db.add(models.TherapySessionParticipant(
        session_id=session.id, user_id=child.id, role="child", invite_status="pending"
    ))

    # Invite parent(s) linked to this child
    if req.invite_parent:
        parent_links = db.query(models.Link).filter(
            models.Link.child_id == child.id,
            models.Link.guardian_role == "parent"
        ).all()
        for lnk in parent_links:
            db.add(models.TherapySessionParticipant(
                session_id=session.id, user_id=lnk.guardian_id,
                role="parent", invite_status="pending"
            ))

    # Invite caregiver(s) linked to this child
    if req.invite_caregiver:
        caregiver_links = db.query(models.Link).filter(
            models.Link.child_id == child.id,
            models.Link.guardian_role == "caregiver"
        ).all()
        for lnk in caregiver_links:
            db.add(models.TherapySessionParticipant(
                session_id=session.id, user_id=lnk.guardian_id,
                role="caregiver", invite_status="pending"
            ))

    db.commit()
    db.refresh(session)
    return _session_to_out(session)


@router.get("/sessions", response_model=list)
def list_sessions(firebase_uid: str = Query(...), db: Session = Depends(get_db)):
    """List sessions relevant to the calling user (any role)."""
    user = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "doctor":
        sessions = db.query(models.TherapySession).filter(
            models.TherapySession.doctor_user_id == user.id
        ).order_by(models.TherapySession.scheduled_time.desc().nullslast()).all()
    elif user.role == "child":
        sessions = db.query(models.TherapySession).filter(
            models.TherapySession.child_user_id == user.id
        ).order_by(models.TherapySession.scheduled_time.desc().nullslast()).all()
    else:
        # parent or caregiver — return sessions they are a participant of
        participant_sessions = db.query(models.TherapySessionParticipant).filter(
            models.TherapySessionParticipant.user_id == user.id
        ).all()
        session_ids = [p.session_id for p in participant_sessions]
        sessions = db.query(models.TherapySession).filter(
            models.TherapySession.id.in_(session_ids)
        ).order_by(models.TherapySession.scheduled_time.desc().nullslast()).all()

    return [_session_to_out(s) for s in sessions]


@router.get("/sessions/{session_id}", response_model=dict)
def get_session(session_id: int, firebase_uid: str = Query(...), db: Session = Depends(get_db)):
    """Get a specific therapy session (must be a participant)."""
    user = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    session = db.query(models.TherapySession).filter(
        models.TherapySession.id == session_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Authorization: must be doctor, child, or listed participant
    authorized = (
        session.doctor_user_id == user.id
        or session.child_user_id == user.id
        or any(p.user_id == user.id for p in session.participants)
    )
    if not authorized:
        raise HTTPException(status_code=403, detail="Not authorized to view this session")

    return _session_to_out(session)


@router.post("/sessions/{session_id}/respond", response_model=dict)
def respond_to_invite(session_id: int, req: RespondInviteRequest, db: Session = Depends(get_db)):
    """Parent or Caregiver accepts or declines an invite."""
    user = db.query(models.User).filter(models.User.firebase_uid == req.firebase_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if req.response not in ("accepted", "declined"):
        raise HTTPException(status_code=400, detail="response must be 'accepted' or 'declined'")

    session = db.query(models.TherapySession).filter(
        models.TherapySession.id == session_id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    participant = db.query(models.TherapySessionParticipant).filter(
        models.TherapySessionParticipant.session_id == session_id,
        models.TherapySessionParticipant.user_id == user.id
    ).first()
    if not participant:
        raise HTTPException(status_code=403, detail="You are not an invited participant")

    participant.invite_status = req.response

    # If all parents have responded, update session status
    pending_parent_invites = db.query(models.TherapySessionParticipant).filter(
        models.TherapySessionParticipant.session_id == session_id,
        models.TherapySessionParticipant.role == "parent",
        models.TherapySessionParticipant.invite_status == "pending"
    ).count()

    if pending_parent_invites == 0:
        # Check if any parent accepted
        any_accepted = db.query(models.TherapySessionParticipant).filter(
            models.TherapySessionParticipant.session_id == session_id,
            models.TherapySessionParticipant.role == "parent",
            models.TherapySessionParticipant.invite_status == "accepted"
        ).count()
        if any_accepted > 0:
            session.status = "accepted"
        else:
            session.status = "declined"

    db.commit()
    db.refresh(session)
    return _session_to_out(session)


@router.post("/sessions/{session_id}/status", response_model=dict)
def update_session_status(session_id: int, req: UpdateStatusRequest, db: Session = Depends(get_db)):
    """Doctor updates session status (live, completed, cancelled)."""
    user = db.query(models.User).filter(
        models.User.firebase_uid == req.firebase_uid,
        models.User.role == "doctor"
    ).first()
    if not user:
        raise HTTPException(status_code=403, detail="Only doctors can update session status")

    session = db.query(models.TherapySession).filter(
        models.TherapySession.id == session_id,
        models.TherapySession.doctor_user_id == user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    valid = {"live", "completed", "cancelled", "scheduled", "accepted", "pending_acceptance"}
    if req.status not in valid:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid}")

    session.status = req.status
    if req.status == "live" and not session.started_at:
        session.started_at = datetime.now(timezone.utc)
    if req.status == "completed" and not session.ended_at:
        session.ended_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(session)
    return _session_to_out(session)


@router.post("/sessions/{session_id}/join", response_model=dict)
def record_join(session_id: int, firebase_uid: str = Query(...), db: Session = Depends(get_db)):
    """Record that a participant joined (for tracking)."""
    user = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    participant = db.query(models.TherapySessionParticipant).filter(
        models.TherapySessionParticipant.session_id == session_id,
        models.TherapySessionParticipant.user_id == user.id
    ).first()
    if participant:
        participant.joined_at = datetime.now(timezone.utc)
        db.commit()

    session = db.query(models.TherapySession).filter(
        models.TherapySession.id == session_id
    ).first()
    return _session_to_out(session) if session else {}


@router.get("/stream-token", response_model=dict)
def get_stream_token(firebase_uid: str = Query(...), db: Session = Depends(get_db)):
    """
    Generate a Stream Video JWT token for the authenticated user.
    Uses PyJWT to generate a valid Stream JWT signed with STREAM_API_SECRET.
    This token works for both Stream Video and Stream Chat SDKs.
    """
    user = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    api_key = os.environ.get("STREAM_API_KEY", "")
    api_secret = os.environ.get("STREAM_API_SECRET", "")

    if api_key and api_secret:
        try:
            import jwt as pyjwt
            import time
            user_id = str(user.id)
            payload = {
                "user_id": user_id,
                "iss": "stream-video-python",
                "sub": f"user/{user_id}",
                "iat": int(time.time()),
                "nbf": int(time.time()) - 5,
            }
            token = pyjwt.encode(payload, api_secret, algorithm="HS256")
            return {"token": token, "user_id": user_id, "api_key": api_key}
        except Exception as e:
            # Fallback: try stream_chat library
            try:
                from stream_chat import StreamChat
                client = StreamChat(api_key=api_key, api_secret=api_secret)
                token = client.create_token(str(user.id))
                return {"token": token, "user_id": str(user.id), "api_key": api_key}
            except Exception as e2:
                raise HTTPException(status_code=500, detail=f"Stream token generation failed: {e} / {e2}")
    else:
        # Dev/demo mode
        return {
            "token": None,
            "user_id": str(user.id),
            "api_key": api_key or "",
            "dev_mode": True
        }
