import os
import sys
import unittest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from main import app  # noqa: E402
from database import SessionLocal  # noqa: E402
import models  # noqa: E402


class TestCareCircleModule(unittest.TestCase):
    """Integration test suite for Care Circle roster, invites, permissions, and WebSocket chat."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        db = SessionLocal()

        # Seed test users
        parent = db.query(models.User).filter(models.User.email == "test_parent@calmspace.app").first()
        if not parent:
            parent = models.User(
                firebase_uid="uid_parent_123",
                name="Test Parent",
                email="test_parent@calmspace.app",
                role="parent"
            )
            db.add(parent)
            db.commit()
            db.refresh(parent)
        cls.parent_id = parent.id
        cls.parent_uid = parent.firebase_uid
        cls.parent_name = parent.name

        caregiver = db.query(models.User).filter(models.User.email == "test_caregiver@calmspace.app").first()
        if not caregiver:
            caregiver = models.User(
                firebase_uid="uid_caregiver_456",
                name="Sarah Jenkins",
                email="test_caregiver@calmspace.app",
                role="caregiver"
            )
            db.add(caregiver)
            db.commit()
            db.refresh(caregiver)
        cls.caregiver_id = caregiver.id
        cls.caregiver_uid = caregiver.firebase_uid
        cls.caregiver_name = caregiver.name

        doctor = db.query(models.User).filter(models.User.email == "test_doctor@calmspace.app").first()
        if not doctor:
            doctor = models.User(
                firebase_uid="uid_doctor_789",
                name="Dr. Mehta",
                email="test_doctor@calmspace.app",
                role="doctor"
            )
            db.add(doctor)
            db.commit()
            db.refresh(doctor)
        cls.doctor_id = doctor.id
        cls.doctor_uid = doctor.firebase_uid
        cls.doctor_name = doctor.name

        db.close()

    def test_care_circle_full_lifecycle(self):
        # 1. Non-parent cannot create circle
        res = self.client.post(
            "/api/care-circles",
            json={"child_name": "Tommy", "name": "Tommy's Circle"},
            headers={"Authorization": f"Bearer {self.caregiver_uid}"}
        )
        self.assertEqual(res.status_code, 403)

        # 2. Parent creates circle
        res = self.client.post(
            "/api/care-circles",
            json={"child_name": "Tommy", "name": "The Tommy Jenkins Circle"},
            headers={"Authorization": f"Bearer {self.parent_uid}"}
        )
        self.assertEqual(res.status_code, 201)
        circle_data = res.json()
        circle_id = circle_data["id"]
        self.assertEqual(circle_data["owner_user_id"], self.parent_id)
        self.assertEqual(circle_data["current_user_role"], "parent")

        # 3. List my circles
        res = self.client.get(
            "/api/care-circles/mine",
            headers={"Authorization": f"Bearer {self.parent_uid}"}
        )
        self.assertEqual(res.status_code, 200)
        mine = res.json()
        self.assertTrue(any(c["id"] == circle_id for c in mine))

        # 4. Parent invites caregiver by email
        res = self.client.post(
            f"/api/care-circles/{circle_id}/invite",
            json={"email": "test_caregiver@calmspace.app", "role": "caregiver"},
            headers={"Authorization": f"Bearer {self.parent_uid}"}
        )
        self.assertEqual(res.status_code, 200)
        cg_member = res.json()
        cg_member_id = cg_member["id"]
        self.assertEqual(cg_member["status"], "pending")
        self.assertEqual(cg_member["user_id"], self.caregiver_id)

        # 5. Non-member/pending member cannot view messages (require_active=True)
        res = self.client.get(
            f"/api/care-circles/{circle_id}/messages",
            headers={"Authorization": f"Bearer {self.caregiver_uid}"}
        )
        self.assertEqual(res.status_code, 403)

        # 6. Caregiver views their circles -> sees pending circle
        res = self.client.get(
            "/api/care-circles/mine",
            headers={"Authorization": f"Bearer {self.caregiver_uid}"}
        )
        self.assertEqual(res.status_code, 200)
        cg_circles = res.json()
        cg_circle = next(c for c in cg_circles if c["id"] == circle_id)
        self.assertEqual(cg_circle["current_user_status"], "pending")

        # 7. Caregiver accepts invite
        res = self.client.post(
            f"/api/care-circles/{circle_id}/invite/{cg_member_id}/accept",
            headers={"Authorization": f"Bearer {self.caregiver_uid}"}
        )
        self.assertEqual(res.status_code, 200)

        # 8. Check members roster
        res = self.client.get(
            f"/api/care-circles/{circle_id}/members",
            headers={"Authorization": f"Bearer {self.parent_uid}"}
        )
        self.assertEqual(res.status_code, 200)
        members = res.json()
        self.assertEqual(len(members), 2)
        active_cg = next(m for m in members if m["id"] == cg_member_id)
        self.assertEqual(active_cg["status"], "active")

        # 9. Real-time WebSocket chat test: active member connects, sends message, receives broadcast
        with self.client.websocket_connect(f"/ws/care-circle/{circle_id}?token={self.parent_uid}") as ws_parent:
            ws_parent.send_json({"content": "Hello Care Circle, session starts at 2 PM."})
            received = ws_parent.receive_json()
            self.assertEqual(received["content"], "Hello Care Circle, session starts at 2 PM.")
            self.assertEqual(received["sender_name"], self.parent_name)
            self.assertEqual(received["sender_role"], "parent")

        # Caregiver connects, sends message, receives broadcast
        with self.client.websocket_connect(f"/ws/care-circle/{circle_id}?token={self.caregiver_uid}") as ws_cg:
            ws_cg.send_json({"content": "Understood! I will prepare the visual schedule."})
            received = ws_cg.receive_json()
            self.assertEqual(received["content"], "Understood! I will prepare the visual schedule.")
            self.assertEqual(received["sender_name"], self.caregiver_name)
            self.assertEqual(received["sender_role"], "caregiver")

        # 10. Messages persisted to REST endpoint
        res = self.client.get(
            f"/api/care-circles/{circle_id}/messages",
            headers={"Authorization": f"Bearer {self.caregiver_uid}"}
        )
        self.assertEqual(res.status_code, 200)
        msgs = res.json()
        self.assertEqual(len(msgs), 2)

        # 11. Parent revokes caregiver
        res = self.client.post(
            f"/api/care-circles/{circle_id}/members/{cg_member_id}/revoke",
            headers={"Authorization": f"Bearer {self.parent_uid}"}
        )
        self.assertEqual(res.status_code, 200)

        # 12. Revoked caregiver cannot read messages via REST (403)
        res = self.client.get(
            f"/api/care-circles/{circle_id}/messages",
            headers={"Authorization": f"Bearer {self.caregiver_uid}"}
        )
        self.assertEqual(res.status_code, 403)

        # 13. Revoked caregiver WebSocket connection rejected with policy violation (1008)
        with self.assertRaises(WebSocketDisconnect) as cm:
            with self.client.websocket_connect(f"/ws/care-circle/{circle_id}?token={self.caregiver_uid}"):
                pass
        self.assertEqual(cm.exception.code, 1008)

    def test_invite_unregistered_email_and_autolink(self):
        import uuid
        # Parent creates circle
        res = self.client.post(
            "/api/care-circles",
            json={"child_name": "Leo", "name": "Leo Care Team"},
            headers={"Authorization": f"Bearer {self.parent_uid}"}
        )
        self.assertEqual(res.status_code, 201)
        circle_id = res.json()["id"]

        # Invite an email that does not exist in users table yet
        unregistered_email = f"new_doctor_{uuid.uuid4().hex[:8]}@calmspace.app"
        res = self.client.post(
            f"/api/care-circles/{circle_id}/invite",
            json={"email": unregistered_email, "role": "doctor"},
            headers={"Authorization": f"Bearer {self.parent_uid}"}
        )
        self.assertEqual(res.status_code, 200)
        inv = res.json()
        self.assertIsNone(inv["user_id"])
        self.assertEqual(inv["status"], "pending")

        # Now someone signs up with that email
        unique_uid = f"uid_doc_{uuid.uuid4().hex[:8]}"
        signup_res = self.client.post(
            "/api/auth/signup",
            json={
                "firebase_uid": unique_uid,
                "name": "Dr. John",
                "email": unregistered_email,
                "role": "doctor"
            }
        )
        self.assertEqual(signup_res.status_code, 200)
        new_doc = signup_res.json()

        # Check that the pending invite was auto-linked to new_doc["id"]
        res = self.client.get(
            f"/api/care-circles/{circle_id}/members",
            headers={"Authorization": f"Bearer {self.parent_uid}"}
        )
        members = res.json()
        linked_member = next(m for m in members if m["invited_email"] == unregistered_email)
        self.assertEqual(linked_member["user_id"], new_doc["id"])
        self.assertEqual(linked_member["status"], "pending")


if __name__ == "__main__":
    unittest.main()
