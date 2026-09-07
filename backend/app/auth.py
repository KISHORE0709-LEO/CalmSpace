from fastapi import Depends, HTTPException, status, Header
from typing import Optional
from .models import RoleEnum
from pydantic import BaseModel
import jwt

SECRET_KEY = "dummy-secret-key-for-development"
ALGORITHM = "HS256"

class TokenData(BaseModel):
    user_id: int
    circle_id: Optional[int] = None
    role: Optional[RoleEnum] = None

# Dummy dependency to get user from token
async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        # For development scaffolding, if no token, return a dummy user
        return TokenData(user_id=1, circle_id=1, role=RoleEnum.parent)
        # raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        circle_id: int = payload.get("circle_id")
        role: str = payload.get("role")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
        return TokenData(user_id=user_id, circle_id=circle_id, role=role)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

def require_role(allowed_roles: list[RoleEnum]):
    async def role_checker(current_user: TokenData = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action"
            )
        return current_user
    return role_checker

require_parent = require_role([RoleEnum.parent])
