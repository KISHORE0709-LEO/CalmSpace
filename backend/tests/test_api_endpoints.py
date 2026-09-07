"""
Tests for CalmSpace Sensing REST and WebSocket API Endpoints.
"""

import os
import sys
import json
import base64
import io
import unittest
import numpy as np
from PIL import Image
from fastapi.testclient import TestClient

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from main import app


class TestSensingAPIEndpoints(unittest.TestCase):
    """Tests the REST routes and WebSocket streaming for facial emotion sensing."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_get_sensing_status(self):
        response = self.client.get("/api/sensing/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "active")
        self.assertEqual(len(data["affectnet_classes"]), 8)
        self.assertEqual(len(data["calmspace_states"]), 4)
        self.assertIn("autism_domain_shift_notice", data)

    def test_get_review_log(self):
        response = self.client.get("/api/sensing/review-log")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("count", data)
        self.assertIn("logged_frames", data)

    def test_websocket_facial_sensing_base64_frame(self):
        # Create a small test image
        img = Image.new("RGB", (320, 240), color=(140, 140, 140))
        buffer = io.BytesIO()
        img.save(buffer, format="JPEG")
        b64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")

        with self.client.websocket_connect("/ws/facial-sensing") as ws:
            payload = {
                "frame": f"data:image/jpeg;base64,{b64_str}",
                "bbox": [50, 40, 120, 140]
            }
            ws.send_text(json.dumps(payload))
            response = ws.receive_json()

            # Verify response conforms to sensing telemetry schema
            self.assertTrue(response["face_detected"])
            self.assertIn("quality_score", response)
            self.assertIn("raw_emotion_probabilities", response)
            self.assertIn("calmspace_mapped_probabilities", response)
            self.assertIn("detection_confidence", response)
            self.assertIn("autism_considerations", response)
            self.assertLess(response["latency_ms"], 100.0)


if __name__ == "__main__":
    unittest.main()
