"""
FastAPI Routes and WebSocket Handler for Real-Time Facial Emotion Sensing.
Emits low-latency JSON telemetry packets to CalmSpace's multimodal fusion layer.
"""

import json
import base64
import io
import logging
from typing import Optional
from PIL import Image

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel

from app.sensing.inference_engine import FacialEmotionEngine
from app.sensing.config import AFFECTNET_CLASSES, CALMSPACE_STATES, ASD_DOMAIN_SHIFT_NOTICE

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/sensing", tags=["Facial Emotion Sensing"])

# Singleton inference engine instance
_engine: Optional[FacialEmotionEngine] = None


def get_sensing_engine() -> FacialEmotionEngine:
    """Returns or initializes the singleton FacialEmotionEngine."""
    global _engine
    if _engine is None:
        _engine = FacialEmotionEngine(backbone="light")
    return _engine


class SensingStatusResponse(BaseModel):
    status: str
    device: str
    affectnet_classes: list
    calmspace_states: list
    autism_domain_shift_notice: str
    review_log_count: int
    multiple_faces_events_count: int


@router.get("/status", response_model=SensingStatusResponse)
def get_status():
    """Returns the operational status and taxonomy of the Facial CNN component."""
    engine = get_sensing_engine()
    return SensingStatusResponse(
        status="active",
        device=str(engine.device),
        affectnet_classes=AFFECTNET_CLASSES,
        calmspace_states=CALMSPACE_STATES,
        autism_domain_shift_notice=ASD_DOMAIN_SHIFT_NOTICE,
        review_log_count=len(engine.review_log),
        multiple_faces_events_count=len(engine.multiple_faces_log)
    )


@router.get("/review-log")
def get_review_log():
    """
    Returns flagged low-confidence or high-entropy frames.
    Allows clinicians/caregivers to inspect atypical affect presentations.
    """
    engine = get_sensing_engine()
    return {
        "count": len(engine.review_log),
        "logged_frames": engine.get_review_log()
    }


@router.get("/multiple-faces-history")
def get_multiple_faces_history():
    """
    Returns all timestamps, face counts, and bounding box events
    whenever multiple individuals/faces were detected simultaneously in the camera stream.
    """
    engine = get_sensing_engine()
    return {
        "total_events": len(engine.multiple_faces_log),
        "events": engine.get_multiple_faces_log()
    }


async def handle_facial_sensing_ws(websocket: WebSocket):
    """
    Low-latency WebSocket endpoint for real-time video stream processing.
    Accepts base64-encoded frames or binary image bytes; returns JSON telemetry packet.
    """
    await websocket.accept()
    engine = get_sensing_engine()
    logger.info("Facial emotion sensing WebSocket client connected.")

    try:
        while True:
            # Receive either text (JSON with base64) or binary data
            message = await websocket.receive()
            if message.get("type") == "websocket.disconnect":
                break

            frame_image = None
            provided_bbox = None

            if "text" in message:
                try:
                    data = json.loads(message["text"])
                    if data.get("type") == "ping":
                        await websocket.send_json({"type": "pong"})
                        continue

                    if "frame" in data:
                        raw_b64 = data["frame"]
                        if "," in raw_b64:
                            raw_b64 = raw_b64.split(",", 1)[1]
                        img_bytes = base64.b64decode(raw_b64)
                        frame_image = Image.open(io.BytesIO(img_bytes))

                    if "bbox" in data and isinstance(data["bbox"], list) and len(data["bbox"]) == 4:
                        provided_bbox = tuple(data["bbox"])
                except Exception as e:
                    await websocket.send_json({"error": f"Invalid JSON payload: {e}", "status": "malformed_frame"})
                    continue

            elif "bytes" in message:
                try:
                    frame_image = Image.open(io.BytesIO(message["bytes"]))
                except Exception as e:
                    await websocket.send_json({"error": f"Invalid image binary: {e}", "status": "malformed_frame"})
                    continue

            if frame_image is None:
                await websocket.send_json({"error": "No valid frame received.", "status": "empty_frame"})
                continue

            # Process frame through inference engine
            try:
                result = engine.process_frame(frame_image, provided_bbox=provided_bbox)
                print(
                    f"[Facial Sensing] Frame {result['frame_id']} | "
                    f"Face: {result['face_detected']} | "
                    f"State: {result['calmspace_state']} | "
                    f"Conf: {result['detection_confidence']:.2f} | "
                    f"Latency: {result['latency_ms']}ms",
                    flush=True
                )
                await websocket.send_json(result)
            except Exception as e:
                logger.error(f"Error processing frame in engine: {e}")
                await websocket.send_json({"error": f"Engine error: {e}", "status": "processing_error"})

    except (WebSocketDisconnect, RuntimeError):
        logger.info("Facial emotion sensing WebSocket client disconnected.")
    except Exception as e:
        logger.error(f"WebSocket session terminated: {e}")
