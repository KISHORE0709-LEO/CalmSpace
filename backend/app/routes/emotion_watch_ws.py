"""
Real-time emotion broadcast WebSocket.
Child's emotion packets are pushed to all connected watchers (parent, caregiver, doctor).
"""
import json
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session

from database import SessionLocal
import models
from ..auth import resolve_user_from_token

# child_id -> set of watcher WebSockets
_watchers: Dict[int, Set[WebSocket]] = {}


async def _add_watcher(child_id: int, ws: WebSocket):
    if child_id not in _watchers:
        _watchers[child_id] = set()
    _watchers[child_id].add(ws)


def _remove_watcher(child_id: int, ws: WebSocket):
    if child_id in _watchers:
        _watchers[child_id].discard(ws)
        if not _watchers[child_id]:
            del _watchers[child_id]


async def broadcast_emotion(child_id: int, payload: dict):
    """Called by the emotion log endpoint to push to all watchers in real time."""
    if child_id not in _watchers:
        return
    dead = set()
    msg = json.dumps(payload)
    for ws in list(_watchers[child_id]):
        try:
            await ws.send_text(msg)
        except Exception:
            dead.add(ws)
    for ws in dead:
        _watchers[child_id].discard(ws)


async def handle_emotion_watch_ws(websocket: WebSocket, child_id: int):
    """
    Parent / caregiver / doctor connects here to receive live emotion pushes
    for a specific child. Auth via ?firebase_uid= query param.
    """
    token = (
        websocket.query_params.get("firebase_uid")
        or websocket.query_params.get("token")
        or websocket.headers.get("authorization", "").replace("Bearer ", "").strip()
    )

    db: Session = SessionLocal()
    try:
        if not token:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Missing auth")
            return

        user = resolve_user_from_token(token, db)
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid auth")
            return

        child = db.query(models.User).filter(
            models.User.id == child_id, models.User.role == "child"
        ).first()
        if not child:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Child not found")
            return

        # Verify caller is linked to this child
        if user.role != "child":
            link = db.query(models.Link).filter(
                models.Link.child_id == child_id,
                models.Link.guardian_id == user.id,
                models.Link.status == "active"
            ).first()
            if not link:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Not authorized")
                return

        await websocket.accept()
        await _add_watcher(child_id, websocket)

        # Send latest known emotion immediately on connect
        latest = db.query(models.EmotionLog).filter(
            models.EmotionLog.child_id == child_id
        ).order_by(models.EmotionLog.logged_at.desc()).first()

        if latest:
            await websocket.send_text(json.dumps({
                "type": "latest",
                "child_id": child_id,
                "state": latest.calmspace_state,
                "dominant_emotion": latest.dominant_emotion,
                "confidence": latest.confidence,
                "probs": {
                    "Calm": latest.prob_calm,
                    "Happy": latest.prob_happy,
                    "Distressed": latest.prob_distressed,
                    "Overwhelmed": latest.prob_overwhelmed,
                },
                "is_crisis": latest.is_crisis,
                "logged_at": latest.logged_at.isoformat(),
            }))

        # Keep alive — handle ping/pong
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text("pong")

    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        _remove_watcher(child_id, websocket)
        try:
            db.close()
        except Exception:
            pass
