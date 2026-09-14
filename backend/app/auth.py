from fastapi import Depends, HTTPException, status, Header, Query
from sqlalchemy.orm import Session
from typing import Optional
import os
import jwt
from database import get_db
import models

try:
    import firebase_admin
    from firebase_admin import auth as firebase_auth
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    firebase_admin = None
    firebase_auth = None

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "calmspace-care-circle-secret-key")
ALGORITHM = "HS256"


def resolve_user_from_token(token_val: str, db: Session) -> Optional[models.User]:
    """Helper to resolve a User from Firebase token, custom JWT, firebase_uid, email, or user_id."""
    if not token_val:
        return None

    # 1. Try Firebase Admin verification if available
    if FIREBASE_AVAILABLE and firebase_admin is not None:
        try:
            decoded = firebase_auth.verify_id_token(token_val)
            uid = decoded.get("uid")
            if uid:
                user = db.query(models.User).filter(models.User.firebase_uid == uid).first()
                if user:
                    return user
        except Exception:
            pass

    # 2. Try standard JWT decode
    try:
        payload = jwt.decode(token_val, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub:
            # sub could be user_id or firebase_uid
            if str(sub).isdigit():
                user = db.query(models.User).filter(models.User.id == int(sub)).first()
                if user:
                    return user
            user = db.query(models.User).filter(models.User.firebase_uid == str(sub)).first()
            if user:
                return user
    except Exception:
        pass

    # 3. Direct match with firebase_uid
    user = db.query(models.User).filter(models.User.firebase_uid == token_val).first()
    if user:
        return user

    # 4. Direct match with email
    user = db.query(models.User).filter(models.User.email == token_val).first()
    if user:
        return user

    # 5. Direct match with integer user id
    if token_val.isdigit():
        user = db.query(models.User).filter(models.User.id == int(token_val)).first()
        if user:
            return user

    return None


async def get_current_user(
    authorization: Optional[str] = Header(None),
    x_firebase_uid: Optional[str] = Header(None),
    token: Optional[str] = Query(None),
    firebase_uid: Optional[str] = Query(None),
    db: Session = Depends(get_db)
) -> models.User:
    """Dependency to retrieve and authenticate the current user."""
    candidate_token = None

    if authorization and authorization.startswith("Bearer "):
        candidate_token = authorization.split(" ")[1].strip()
    elif x_firebase_uid:
        candidate_token = x_firebase_uid.strip()
    elif token:
        candidate_token = token.strip()
    elif firebase_uid:
        candidate_token = firebase_uid.strip()

    if not candidate_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided"
        )

    user = resolve_user_from_token(candidate_token, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials or user not found"
        )

    return user


def require_role(allowed_roles: list[str]):
    """Decorator / dependency to ensure current user has one of the allowed roles."""
    async def role_checker(current_user: models.User = Depends(get_current_user)) -> models.User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action not allowed for role '{current_user.role}'. Required: {allowed_roles}"
            )
        return current_user
    return role_checker


require_parent = require_role(["parent"])
require_caregiver_or_doctor = require_role(["caregiver", "doctor"])
