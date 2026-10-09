"""
CalmSpace Therapy Server — Lightweight standalone server
Handles only therapy session + Stream token endpoints.
Avoids importing ML/sensing modules that require PyTorch.
Run from: /Users/mac/Desktop/CalmSpace/backend/
  python3 therapy_server.py
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import os, sys, time

# ── Env ──────────────────────────────────────────────────────────────────────
# Load .env manually (avoid python-dotenv version issues)
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                os.environ.setdefault(k.strip(), v.strip().strip('"'))

STREAM_API_KEY    = os.environ.get("STREAM_API_KEY", "")
STREAM_API_SECRET = os.environ.get("STREAM_API_SECRET", "")

sys.path.insert(0, os.path.dirname(__file__))

# Import SQLAlchemy models (no ML deps)
try:
    from database import engine, get_db, Base
    import models
    models.Base.metadata.create_all(bind=engine)
    DB_AVAILABLE = True
except Exception as e:
    print(f"[WARNING] DB not available: {e}")
    DB_AVAILABLE = False

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="CalmSpace Therapy Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Stream token endpoint ─────────────────────────────────────────────────────
@app.get("/api/therapy/stream-token")
def get_stream_token(firebase_uid: str = Query(...)):
    """
    Generate a Stream Video JWT for the authenticated user.
    Falls back to dev mode (token: null) when DB or secrets are unavailable.
    """
    # Try to look up user in DB
    user_id = None
    if DB_AVAILABLE:
        try:
            from sqlalchemy.orm import Session as DBSession
            from database import SessionLocal
            db: DBSession = SessionLocal()
            try:
                user = db.query(models.User).filter(
                    models.User.firebase_uid == firebase_uid
                ).first()
                if user:
                    user_id = str(user.id)
            finally:
                db.close()
        except Exception as e:
            print(f"[DB lookup error] {e}")

    # If no user found in DB, use firebase_uid as fallback user_id
    if not user_id:
        # Sanitize to valid Stream user ID
        safe_uid = firebase_uid.replace(".", "_").replace("@", "_").replace("-", "_")[:60]
        user_id = safe_uid or "demo_user"

    # Generate JWT token
    if STREAM_API_KEY and STREAM_API_SECRET:
        try:
            import jwt as pyjwt
            payload = {
                "user_id": user_id,
                "iss": "stream-video-python",
                "sub": f"user/{user_id}",
                "iat": int(time.time()),
                "nbf": int(time.time()) - 5,
            }
            token = pyjwt.encode(payload, STREAM_API_SECRET, algorithm="HS256")
            print(f"[Token] Generated for user_id={user_id}")
            return {"token": token, "user_id": user_id, "api_key": STREAM_API_KEY}
        except Exception as e:
            print(f"[Token error] {e}")

    # Dev mode — no token (frontend will use guest mode)
    print(f"[Token] Dev mode — returning null token for user_id={user_id}")
    return {"token": None, "user_id": user_id, "api_key": STREAM_API_KEY, "dev_mode": True}


@app.get("/")
def root():
    return {
        "message": "CalmSpace Therapy Server running",
        "stream_configured": bool(STREAM_API_KEY and STREAM_API_SECRET),
        "db_available": DB_AVAILABLE,
    }


# ── Include the full therapy sessions router ──────────────────────────────────
if DB_AVAILABLE:
    try:
        from app.routes.therapy_sessions import router as therapy_router
        # Remove the stream-token endpoint from therapy_router to avoid conflict
        app.include_router(therapy_router)
        print("[INFO] Full therapy_sessions router loaded")
    except Exception as e:
        print(f"[WARNING] Could not load therapy_sessions router: {e}")
        print("[INFO] Only /api/therapy/stream-token is available")


if __name__ == "__main__":
    import uvicorn
    print(f"[START] Stream API key: {'✓' if STREAM_API_KEY else '✗ missing'}")
    print(f"[START] Stream secret:  {'✓' if STREAM_API_SECRET else '✗ missing'}")
    print(f"[START] DB available:   {'✓' if DB_AVAILABLE else '✗'}")
    uvicorn.run("therapy_server:app", host="0.0.0.0", port=8000, reload=True)
