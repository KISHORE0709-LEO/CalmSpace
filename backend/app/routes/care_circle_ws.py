import json
from datetime import datetime
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import SessionLocal
import models
from ..auth import resolve_user_from_token

# In-memory registry: circle_id -> Set of active WebSockets
active_connections: Dict[int, Set[WebSocket]] = {}


class CareCircleConnectionManager:
    @staticmethod
    async def connect(circle_id: int, websocket: WebSocket):
        if circle_id not in active_connections:
            active_connections[circle_id] = set()
        active_connections[circle_id].add(websocket)

    @staticmethod
    def disconnect(circle_id: int, websocket: WebSocket):
        if circle_id in active_connections:
            active_connections[circle_id].discard(websocket)
            if not active_connections[circle_id]:
                del active_connections[circle_id]

    @staticmethod
    async def broadcast(circle_id: int, message_data: dict):
        if circle_id not in active_connections:
            return

        dead_connections = set()
        payload_str = json.dumps(message_data)

        for connection in list(active_connections[circle_id]):
            try:
                await connection.send_text(payload_str)
            except Exception:
                dead_connections.add(connection)

        for dead in dead_connections:
            active_connections[circle_id].discard(dead)


manager = CareCircleConnectionManager()


async def handle_care_circle_ws(websocket: WebSocket, circle_id: int):
    """WebSocket endpoint for real-time Care Circle group chat."""
    # 1. Extract authentication token from query parameters or headers
    token = (
        websocket.query_params.get("token")
        or websocket.query_params.get("firebase_uid")
        or websocket.headers.get("authorization", "").replace("Bearer ", "").strip()
    )

    db: Session = SessionLocal()
    try:
        if not token:
            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="Missing authentication token"
            )
            return

        # 2. Authenticate user
        user = resolve_user_from_token(token, db)
        if not user:
            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="Invalid authentication token or user not found"
            )
            return

        # 3. Verify circle exists
        circle = db.query(models.CareCircle).filter(models.CareCircle.id == circle_id).first()
        if not circle:
            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="Care Circle not found"
            )
            return

        # 4. Verify user is an active member
        member = db.query(models.CareCircleMember).filter(
            models.CareCircleMember.circle_id == circle_id,
            or_(
                models.CareCircleMember.user_id == user.id,
                models.CareCircleMember.invited_email == user.email.lower()
            )
        ).first()

        if not member or member.status != "active":
            await websocket.close(
                code=status.WS_1008_POLICY_VIOLATION,
                reason="User is not an active member of this Care Circle"
            )
            return

        # 5. Connection accepted
        await websocket.accept()
        await manager.connect(circle_id, websocket)

        # 6. Listen for chat messages
        while True:
            text = await websocket.receive_text()
            try:
                data = json.loads(text)
            except Exception:
                data = {"content": text}

            content = data.get("content", "").strip()
            if not content:
                continue

            # Check again that member status is still active (handles real-time revoke)
            db.refresh(member)
            if member.status != "active":
                await websocket.send_text(json.dumps({
                    "error": "Your access to this Care Circle has been revoked."
                }))
                await websocket.close(
                    code=status.WS_1008_POLICY_VIOLATION,
                    reason="Access revoked"
                )
                break

            # Persist chat message
            now = datetime.utcnow()
            chat_msg = models.ChatMessage(
                circle_id=circle_id,
                sender_user_id=user.id,
                content=content,
                sent_at=now
            )
            db.add(chat_msg)
            db.commit()
            db.refresh(chat_msg)

            # Broadcast to all connected active members
            broadcast_payload = {
                "id": chat_msg.id,
                "circle_id": circle_id,
                "sender_user_id": user.id,
                "sender_name": user.name,
                "sender_role": user.role,
                "content": chat_msg.content,
                "sent_at": chat_msg.sent_at.isoformat()
            }
            await manager.broadcast(circle_id, broadcast_payload)

    except WebSocketDisconnect:
        manager.disconnect(circle_id, websocket)
    except Exception as e:
        manager.disconnect(circle_id, websocket)
        try:
            await websocket.close(
                code=status.WS_1011_INTERNAL_ERROR,
                reason=str(e)[:100]
            )
        except Exception:
            pass
    finally:
        db.close()
