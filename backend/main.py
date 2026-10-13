from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
from pathlib import Path
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()
try:
    import firebase_admin
    from firebase_admin import credentials, auth as firebase_auth
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    firebase_admin = None  # type: ignore
    credentials = None  # type: ignore
    firebase_auth = None  # type: ignore
from typing import List
import os
import sys

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import models
import schemas
from database import engine, get_db
from app.routes.sensing_routes import router as sensing_router, handle_facial_sensing_ws
from app.routes.care_circles import router as care_circles_router
from app.routes.care_circle_ws import handle_care_circle_ws
from app.routes.therapy_sessions import router as therapy_router

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CalmSpace Backend")

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Path("uploads").mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"url": f"http://localhost:8000/{file_path}"}


# Sensing Layer - Facial Emotion CNN Branch
app.include_router(sensing_router)
app.add_api_websocket_route("/ws/facial-sensing", handle_facial_sensing_ws)

# Care Circle & Group Chat
app.include_router(care_circles_router)
app.add_api_websocket_route("/ws/care-circle/{circle_id}", handle_care_circle_ws)

# Therapy Sessions
app.include_router(therapy_router)

# Firebase Admin Setup
# You must provide the path to your Firebase service account JSON key
# e.g., os.environ["FIREBASE_CREDENTIALS"] = "/path/to/serviceAccountKey.json"
try:
    if FIREBASE_AVAILABLE and credentials is not None and firebase_admin is not None and os.environ.get("FIREBASE_CREDENTIALS"):
        cred = credentials.Certificate(os.environ["FIREBASE_CREDENTIALS"])
        firebase_admin.initialize_app(cred)
    elif not FIREBASE_AVAILABLE:
        print("Note: firebase_admin library not installed. Running in standalone sensing/auth simulation mode.")
    else:
        print("Warning: FIREBASE_CREDENTIALS environment variable not set. Firebase Admin SDK not initialized.")
except Exception as e:
    print(f"Error initializing Firebase Admin: {e}")

@app.get("/api/auth/check-email")
def check_email(email: str, db: Session = Depends(get_db)):
    """Check if an email is already registered and what role it has."""
    existing = db.query(models.User).filter(models.User.email == email.strip().lower()).first()
    if existing:
        return {"exists": True, "role": existing.role}
    return {"exists": False, "role": None}


@app.post("/api/auth/signup", response_model=schemas.UserResponse)
def signup(request: schemas.SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.firebase_uid == request.firebase_uid).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # ── Email uniqueness across roles ──────────────────────────────────────────
    # Prevent the same email from being used for a different role
    email_conflict = db.query(models.User).filter(
        models.User.email == request.email.strip().lower()
    ).first()
    if email_conflict:
        raise HTTPException(
            status_code=400,
            detail=f"This email is already registered as a '{email_conflict.role}'. Each email can only belong to one role."
        )

    # ── Prevent child emails from being used for other roles ───────────────────
    # If registering as non-child and the email is a child's email, block it
    if request.role != "child" and request.child_email:
        child_email_conflict = db.query(models.User).filter(
            models.User.email == request.child_email.strip().lower(),
            models.User.role != "child"
        ).first()
        if child_email_conflict:
            raise HTTPException(
                status_code=400,
                detail=f"That child email is registered as '{child_email_conflict.role}', not as a child account."
            )

    child_user = None
    if request.role == "parent":
        # Parent MUST provide child email
        if not request.child_email:
            raise HTTPException(status_code=400, detail="Child's email is required for parents.")
        child_user = db.query(models.User).filter(
            models.User.email == request.child_email.strip().lower(),
            models.User.role == "child"
        ).first()
        if not child_user:
            raise HTTPException(status_code=404, detail="No child account found with this email. The child must sign up first.")
    elif request.role == "caregiver" and request.child_email:
        # Caregiver child email is optional — only link if provided
        child_user = db.query(models.User).filter(
            models.User.email == request.child_email.strip().lower(),
            models.User.role == "child"
        ).first()
        # Don't error if not found — they may be invited by parent later

    new_user = models.User(
        firebase_uid=request.firebase_uid,
        name=request.name,
        email=request.email.strip().lower(),
        role=request.role,
        age=request.age
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    if child_user and request.role in ["parent", "caregiver"]:
        # Check not already linked
        existing_link = db.query(models.Link).filter(
            models.Link.child_id == child_user.id,
            models.Link.guardian_id == new_user.id,
            models.Link.status == "active"
        ).first()
        if not existing_link:
            link = models.Link(
                child_id=child_user.id,
                guardian_id=new_user.id,
                guardian_role=request.role,
                status="active"
            )
            db.add(link)
            db.commit()

    # Auto-link pending Care Circle invites
    pending_invites = db.query(models.CareCircleMember).filter(
        models.CareCircleMember.invited_email == new_user.email.lower(),
        models.CareCircleMember.user_id.is_(None)
    ).all()
    for pinv in pending_invites:
        pinv.user_id = new_user.id
    # Auto-link pending care team invites
    pending_links = db.query(models.Link).filter(
        models.Link.invited_email == new_user.email.lower(),
        models.Link.guardian_id.is_(None)
    ).all()
    for pl in pending_links:
        pl.guardian_id = new_user.id
        pl.status = "active"
    if pending_invites or pending_links:
        db.commit()

    return new_user


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_user_profile(firebase_uid: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.get("/api/dashboard/guardian", response_model=List[schemas.ChildDataResponse])
def get_guardian_dashboard(firebase_uid: str, db: Session = Depends(get_db)):
    guardian = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found")
    links = db.query(models.Link).filter(
        models.Link.guardian_id == guardian.id,
        models.Link.status == "active"
    ).all()
    return [{"id": l.child.id, "name": l.child.name, "email": l.child.email} for l in links]


# ─── CARE TEAM ROUTES ────────────────────────────────────────────────────────

@app.get("/api/care-team/my-team")
def get_my_care_team(firebase_uid: str, db: Session = Depends(get_db)):
    """Child calls this to see their linked parent, caregiver, doctor."""
    user = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    links = db.query(models.Link).filter(
        models.Link.child_id == user.id,
        models.Link.status == "active"
    ).all()
    team = []
    for lnk in links:
        if lnk.guardian:
            team.append({"role": lnk.guardian_role, "name": lnk.guardian.name, "email": lnk.guardian.email, "link_id": lnk.id})
    return {"child_id": user.id, "child_name": user.name, "team": team}


@app.get("/api/care-team/my-children")
def get_my_children(firebase_uid: str, db: Session = Depends(get_db)):
    """Parent/caregiver/doctor calls this to get their linked children."""
    user = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    links = db.query(models.Link).filter(
        models.Link.guardian_id == user.id,
        models.Link.status == "active"
    ).all()
    children = []
    for lnk in links:
        if lnk.child:
            c = lnk.child
            # get this child's full team
            child_links = db.query(models.Link).filter(
                models.Link.child_id == c.id,
                models.Link.status == "active"
            ).all()
            team = [
                {
                    "role": cl.guardian_role,
                    "name": cl.guardian.name if cl.guardian else None,
                    "email": cl.invited_email or (cl.guardian.email if cl.guardian else None),
                    "link_id": cl.id,
                    "status": cl.status
                }
                for cl in child_links
            ]
            children.append({"id": c.id, "name": c.name, "email": c.email, "age": c.age, "link_id": lnk.id, "team": team})
    return children


@app.post("/api/care-team/invite")
def invite_care_member(request: schemas.InviteCareTeamRequest, db: Session = Depends(get_db)):
    """Parent invites a caregiver or doctor by email for their child."""
    parent = db.query(models.User).filter(models.User.firebase_uid == request.firebase_uid).first()
    if not parent or parent.role != "parent":
        raise HTTPException(status_code=403, detail="Only parents can invite care team members")

    # Verify parent is linked to this child
    link_check = db.query(models.Link).filter(
        models.Link.child_id == request.child_id,
        models.Link.guardian_id == parent.id,
        models.Link.status == "active"
    ).first()
    if not link_check:
        raise HTTPException(status_code=403, detail="You are not linked to this child")

    if request.role not in ["caregiver", "doctor"]:
        raise HTTPException(status_code=400, detail="Role must be caregiver or doctor")

    invited_email = request.email.strip().lower()

    # Check if already linked
    existing = db.query(models.Link).filter(
        models.Link.child_id == request.child_id,
        models.Link.guardian_role == request.role,
        models.Link.status.in_(["active", "pending"])
    ).first()
    if existing:
        # Replace: mark old as removed
        existing.status = "removed"
        db.commit()

    # Check if invited user already exists
    invited_user = db.query(models.User).filter(models.User.email == invited_email).first()

    new_link = models.Link(
        child_id=request.child_id,
        guardian_id=invited_user.id if invited_user else None,
        guardian_role=request.role,
        status="active" if invited_user else "pending",
        invited_email=invited_email
    )
    db.add(new_link)
    db.commit()
    db.refresh(new_link)
    return {"message": f"Invite sent to {invited_email}", "status": new_link.status, "link_id": new_link.id}


@app.delete("/api/care-team/remove/{link_id}")
def remove_care_member(link_id: int, firebase_uid: str, db: Session = Depends(get_db)):
    """Parent removes a caregiver or doctor from their child's care team."""
    parent = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not parent or parent.role != "parent":
        raise HTTPException(status_code=403, detail="Only parents can remove care team members")

    link = db.query(models.Link).filter(models.Link.id == link_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")

    # Verify parent owns this child
    parent_link = db.query(models.Link).filter(
        models.Link.child_id == link.child_id,
        models.Link.guardian_id == parent.id,
        models.Link.status == "active"
    ).first()
    if not parent_link:
        raise HTTPException(status_code=403, detail="Not authorized")

    link.status = "removed"
    db.commit()
    return {"message": "Care team member removed"}


# ─── EMOTION LOG ROUTES ───────────────────────────────────────────────────────

@app.post("/api/emotion/log")
def log_emotion(request: schemas.EmotionLogRequest, db: Session = Depends(get_db)):
    """Child's frontend logs each significant emotion state change."""
    user = db.query(models.User).filter(models.User.firebase_uid == request.firebase_uid).first()
    if not user or user.role != "child":
        raise HTTPException(status_code=403, detail="Only children can log emotions")

    is_crisis = request.prob_overwhelmed > 0.65
    log = models.EmotionLog(
        child_id=user.id,
        calmspace_state=request.calmspace_state,
        dominant_emotion=request.dominant_emotion,
        confidence=request.confidence,
        prob_calm=request.prob_calm,
        prob_happy=request.prob_happy,
        prob_distressed=request.prob_distressed,
        prob_overwhelmed=request.prob_overwhelmed,
        is_crisis=is_crisis
    )
    db.add(log)
    db.commit()
    return {"logged": True, "is_crisis": is_crisis}


@app.get("/api/emotion/history/{child_id}")
def get_emotion_history(child_id: int, firebase_uid: str, limit: int = 100, db: Session = Depends(get_db)):
    """Parent/caregiver/doctor fetches emotion history for a child they are linked to."""
    requester = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not requester:
        raise HTTPException(status_code=404, detail="User not found")

    # Authorization: must be linked to this child
    if requester.role != "child":
        auth_link = db.query(models.Link).filter(
            models.Link.child_id == child_id,
            models.Link.guardian_id == requester.id,
            models.Link.status == "active"
        ).first()
        if not auth_link:
            raise HTTPException(status_code=403, detail="Not authorized to view this child's data")
    else:
        if requester.id != child_id:
            raise HTTPException(status_code=403, detail="Not authorized")

    logs = db.query(models.EmotionLog).filter(
        models.EmotionLog.child_id == child_id
    ).order_by(models.EmotionLog.logged_at.desc()).limit(limit).all()

    return [{
        "id": l.id,
        "state": l.calmspace_state,
        "dominant_emotion": l.dominant_emotion,
        "confidence": l.confidence,
        "probs": {"Calm": l.prob_calm, "Happy": l.prob_happy, "Distressed": l.prob_distressed, "Overwhelmed": l.prob_overwhelmed},
        "is_crisis": l.is_crisis,
        "logged_at": l.logged_at.isoformat()
    } for l in logs]


@app.get("/api/emotion/latest/{child_id}")
def get_latest_emotion(child_id: int, firebase_uid: str, db: Session = Depends(get_db)):
    """Get the most recent emotion state for a child."""
    requester = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not requester:
        raise HTTPException(status_code=404, detail="User not found")

    if requester.role != "child":
        auth_link = db.query(models.Link).filter(
            models.Link.child_id == child_id,
            models.Link.guardian_id == requester.id,
            models.Link.status == "active"
        ).first()
        if not auth_link:
            raise HTTPException(status_code=403, detail="Not authorized")

    log = db.query(models.EmotionLog).filter(
        models.EmotionLog.child_id == child_id
    ).order_by(models.EmotionLog.logged_at.desc()).first()

    if not log:
        return {"state": "Unknown", "confidence": 0, "logged_at": None}

    return {
        "state": log.calmspace_state,
        "dominant_emotion": log.dominant_emotion,
        "confidence": log.confidence,
        "probs": {"Calm": log.prob_calm, "Happy": log.prob_happy, "Distressed": log.prob_distressed, "Overwhelmed": log.prob_overwhelmed},
        "is_crisis": log.is_crisis,
        "logged_at": log.logged_at.isoformat()
    }


@app.post("/api/care-team/link-child")
def link_child(request: schemas.LinkChildRequest, db: Session = Depends(get_db)):
    """Parent links a child by email after registration."""
    parent = db.query(models.User).filter(models.User.firebase_uid == request.firebase_uid).first()
    if not parent or parent.role != "parent":
        raise HTTPException(status_code=403, detail="Only parents can link children")

    child = db.query(models.User).filter(
        models.User.email == request.child_email.strip().lower(),
        models.User.role == "child"
    ).first()
    if not child:
        raise HTTPException(status_code=404, detail="No child account found with this email")

    # Check if already linked
    existing = db.query(models.Link).filter(
        models.Link.child_id == child.id,
        models.Link.guardian_id == parent.id,
        models.Link.status == "active"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already linked to this child")

    link = models.Link(
        child_id=child.id,
        guardian_id=parent.id,
        guardian_role="parent",
        status="active"
    )
    db.add(link)
    db.commit()
    return {"message": f"Successfully linked to {child.name}", "child_id": child.id, "child_name": child.name}


@app.get("/api/care-team/child/{child_id}")
def get_child_profile(child_id: int, firebase_uid: str, db: Session = Depends(get_db)):
    """Get a child's profile — only accessible by linked guardians."""
    requester = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not requester:
        raise HTTPException(status_code=404, detail="User not found")

    child = db.query(models.User).filter(
        models.User.id == child_id,
        models.User.role == "child"
    ).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    # Authorization check
    if requester.role != "child":
        auth_link = db.query(models.Link).filter(
            models.Link.child_id == child_id,
            models.Link.guardian_id == requester.id,
            models.Link.status == "active"
        ).first()
        if not auth_link:
            raise HTTPException(status_code=403, detail="Not authorized")

    return {"id": child.id, "name": child.name, "email": child.email, "age": child.age}


@app.get("/api/emotion/crisis-alerts/{child_id}")
def get_crisis_alerts(child_id: int, firebase_uid: str, limit: int = 20, db: Session = Depends(get_db)):
    """Get crisis (Overwhelmed) events for a child."""
    requester = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not requester:
        raise HTTPException(status_code=404, detail="User not found")

    if requester.role != "child":
        auth_link = db.query(models.Link).filter(
            models.Link.child_id == child_id,
            models.Link.guardian_id == requester.id,
            models.Link.status == "active"
        ).first()
        if not auth_link:
            raise HTTPException(status_code=403, detail="Not authorized")

    alerts = db.query(models.EmotionLog).filter(
        models.EmotionLog.child_id == child_id,
        models.EmotionLog.is_crisis == True
    ).order_by(models.EmotionLog.logged_at.desc()).limit(limit).all()

    return [{
        "id": l.id,
        "state": l.calmspace_state,
        "confidence": l.confidence,
        "prob_overwhelmed": l.prob_overwhelmed,
        "logged_at": l.logged_at.isoformat()
    } for l in alerts]


# ─── DOCTOR FAMILY VIEW ───────────────────────────────────────────────────────

@app.get("/api/doctors/list")
def list_doctors(db: Session = Depends(get_db)):
    """Returns all registered doctors so parents can browse and invite them."""
    doctors = db.query(models.User).filter(models.User.role == "doctor").all()
    return [{"id": d.id, "name": d.name, "email": d.email} for d in doctors]

@app.get("/api/doctor/families")
def get_doctor_families(firebase_uid: str, db: Session = Depends(get_db)):
    """
    Doctor calls this to get all families they are linked to.
    Returns a list of families, each containing the child's info,
    the parent, and the caregiver (if any).
    """
    doctor = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    if doctor.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can access this endpoint")

    # Get all children this doctor is linked to
    doctor_links = db.query(models.Link).filter(
        models.Link.guardian_id == doctor.id,
        models.Link.guardian_role == "doctor",
        models.Link.status == "active"
    ).all()

    families = []
    for dl in doctor_links:
        if not dl.child:
            continue
        child = dl.child

        # Get all guardians for this child
        child_links = db.query(models.Link).filter(
            models.Link.child_id == child.id,
            models.Link.status == "active"
        ).all()

        parent_info = None
        caregiver_info = None
        for cl in child_links:
            if cl.guardian_role == "parent" and cl.guardian:
                parent_info = {
                    "id": cl.guardian.id,
                    "name": cl.guardian.name,
                    "email": cl.guardian.email
                }
            elif cl.guardian_role == "caregiver" and cl.guardian:
                caregiver_info = {
                    "id": cl.guardian.id,
                    "name": cl.guardian.name,
                    "email": cl.guardian.email
                }

        # Determine family name (parent's last name or child's name)
        family_name = "Unknown Family"
        if parent_info:
            parts = parent_info["name"].strip().split()
            family_name = f"The {parts[-1]} Family" if len(parts) > 1 else f"{parent_info['name']}'s Family"
        elif child:
            parts = child.name.strip().split()
            family_name = f"The {parts[-1]} Family" if len(parts) > 1 else f"{child.name}'s Family"

        families.append({
            "family_name": family_name,
            "child": {
                "id": child.id,
                "name": child.name,
                "email": child.email,
                "age": child.age,
                "link_id": dl.id
            },
            "parent": parent_info,
            "caregiver": caregiver_info
        })

    return families
