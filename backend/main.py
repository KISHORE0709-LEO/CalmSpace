from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from typing import List
import os

import models
import schemas
from database import engine, get_db

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

# Firebase Admin Setup
# You must provide the path to your Firebase service account JSON key
# e.g., os.environ["FIREBASE_CREDENTIALS"] = "/path/to/serviceAccountKey.json"
try:
    if os.environ.get("FIREBASE_CREDENTIALS"):
        cred = credentials.Certificate(os.environ.get("FIREBASE_CREDENTIALS"))
        firebase_admin.initialize_app(cred)
    else:
        print("Warning: FIREBASE_CREDENTIALS environment variable not set. Firebase Admin SDK not initialized.")
except Exception as e:
    print(f"Error initializing Firebase Admin: {e}")

@app.post("/api/auth/signup", response_model=schemas.UserResponse)
def signup(request: schemas.SignupRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.firebase_uid == request.firebase_uid).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # If it's a parent or caregiver, they must provide a child_email and the child must exist
    child_user = None
    if request.role in ["parent", "caregiver"]:
        if not request.child_email:
            raise HTTPException(status_code=400, detail="Child's Email ID is required for parents and caregivers")
        
        child_user = db.query(models.User).filter(models.User.email == request.child_email, models.User.role == "child").first()
        if not child_user:
            raise HTTPException(status_code=404, detail="No child account exists with this email. Ask the child to sign up first.")

    # Create new user
    new_user = models.User(
        firebase_uid=request.firebase_uid,
        name=request.name,
        email=request.email,
        role=request.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # If parent or caregiver, link them to the child
    if child_user and request.role in ["parent", "caregiver"]:
        link = models.Link(
            child_id=child_user.id,
            guardian_id=new_user.id,
            guardian_role=request.role
        )
        db.add(link)
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
    # In a real app, you would verify the JWT token from the Authorization header using firebase_admin.auth.verify_id_token
    # For now, we are simulating it by passing firebase_uid in the query (Not secure for production)
    
    guardian = db.query(models.User).filter(models.User.firebase_uid == firebase_uid).first()
    if not guardian:
        raise HTTPException(status_code=404, detail="Guardian not found")
        
    links = db.query(models.Link).filter(models.Link.guardian_id == guardian.id).all()
    
    children_data = []
    for link in links:
        children_data.append({
            "id": link.child.id,
            "name": link.child.name,
            "email": link.child.email
        })
        
    return children_data
