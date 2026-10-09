/**
 * Therapy Session API client
 * Connects to CalmSpace backend therapy endpoints.
 * Falls back to mock data when backend is unavailable (dev mode).
 */
import { API_BASE_URL } from "./api";

export interface TherapyParticipant {
  id: number;
  user_id: number;
  role: "doctor" | "parent" | "caregiver" | "child";
  invite_status: "pending" | "accepted" | "declined";
  user_name?: string;
  user_email?: string;
}

export interface TherapySession {
  id: number;
  session_uid: string;          // Stream room ID (e.g. "abc-defg-hij")
  title: string;
  session_type: string;
  status:
    | "scheduled"
    | "pending_acceptance"
    | "accepted"
    | "declined"
    | "live"
    | "completed"
    | "cancelled";
  scheduled_time?: string;
  duration_minutes: number;
  goals?: string;
  notes?: string;
  recording_url?: string;
  doctor_user_id: number;
  child_user_id: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
  doctor_name?: string;
  child_name?: string;
  participants: TherapyParticipant[];
}

// ─── Mock data for dev/demo when backend is offline ───────────────────────────
const MOCK_SESSIONS: TherapySession[] = [
  {
    id: 1,
    session_uid: "abc-defg-hij",
    title: "Follow-up Therapy Session",
    session_type: "follow-up",
    status: "accepted",
    scheduled_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 45,
    goals: "Emotional Regulation\nEye Contact\nSocial Communication",
    notes: "Child had a stressful school day. Focus on calming exercises first.",
    doctor_user_id: 1,
    child_user_id: 2,
    created_at: new Date().toISOString(),
    doctor_name: "Dr. Arya Sharma",
    child_name: "Rahul Kumar",
    participants: [
      { id: 1, user_id: 1, role: "doctor", invite_status: "accepted", user_name: "Dr. Arya Sharma" },
      { id: 2, user_id: 2, role: "child", invite_status: "accepted", user_name: "Rahul Kumar" },
      { id: 3, user_id: 3, role: "parent", invite_status: "accepted", user_name: "Parent User" },
    ],
  },
  {
    id: 2,
    session_uid: "xyz-pqrs-lmn",
    title: "Initial Assessment",
    session_type: "initial",
    status: "pending_acceptance",
    scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    duration_minutes: 60,
    doctor_user_id: 1,
    child_user_id: 4,
    created_at: new Date().toISOString(),
    doctor_name: "Dr. Arya Sharma",
    child_name: "Mia Wong",
    participants: [
      { id: 4, user_id: 1, role: "doctor", invite_status: "accepted", user_name: "Dr. Arya Sharma" },
      { id: 5, user_id: 4, role: "child", invite_status: "pending", user_name: "Mia Wong" },
      { id: 6, user_id: 5, role: "parent", invite_status: "pending", user_name: "Parent User 2" },
    ],
  },
];

// ─── API calls ─────────────────────────────────────────────────────────────────

async function apiFetch(path: string, options?: RequestInit) {
  if (!API_BASE_URL) throw new Error("NO_BACKEND");
  const res = await fetch(`${API_BASE_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || "API error");
  }
  return res.json();
}

export async function fetchSessions(firebaseUid: string): Promise<TherapySession[]> {
  try {
    return await apiFetch(`/api/therapy/sessions?firebase_uid=${encodeURIComponent(firebaseUid)}`);
  } catch {
    return MOCK_SESSIONS;
  }
}

export async function fetchSession(sessionId: number, firebaseUid: string): Promise<TherapySession> {
  try {
    return await apiFetch(`/api/therapy/sessions/${sessionId}?firebase_uid=${encodeURIComponent(firebaseUid)}`);
  } catch {
    return MOCK_SESSIONS.find((s) => s.id === sessionId) || MOCK_SESSIONS[0];
  }
}

export interface CreateSessionPayload {
  firebase_uid: string;
  child_user_id: number;
  title?: string;
  session_type: string;
  scheduled_time?: string;
  duration_minutes: number;
  goals?: string;
  notes?: string;
  invite_parent: boolean;
  invite_caregiver: boolean;
}

export async function createSession(payload: CreateSessionPayload): Promise<TherapySession> {
  try {
    return await apiFetch("/api/therapy/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Return a mock created session
    const mock: TherapySession = {
      id: Date.now(),
      session_uid: `${Math.random().toString(36).slice(2, 5)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`,
      title: payload.title || "New Therapy Session",
      session_type: payload.session_type,
      status: "pending_acceptance",
      scheduled_time: payload.scheduled_time,
      duration_minutes: payload.duration_minutes,
      goals: payload.goals,
      notes: payload.notes,
      doctor_user_id: 1,
      child_user_id: payload.child_user_id,
      created_at: new Date().toISOString(),
      doctor_name: "Dr. (You)",
      child_name: "Child",
      participants: [],
    };
    return mock;
  }
}

export async function respondToInvite(
  sessionId: number,
  firebaseUid: string,
  response: "accepted" | "declined"
): Promise<TherapySession> {
  try {
    return await apiFetch(`/api/therapy/sessions/${sessionId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebase_uid: firebaseUid, response }),
    });
  } catch {
    return MOCK_SESSIONS[0];
  }
}

export async function updateSessionStatus(
  sessionId: number,
  firebaseUid: string,
  status: string
): Promise<TherapySession> {
  try {
    return await apiFetch(`/api/therapy/sessions/${sessionId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebase_uid: firebaseUid, status }),
    });
  } catch {
    return MOCK_SESSIONS[0];
  }
}

export async function recordJoin(sessionId: number, firebaseUid: string): Promise<void> {
  try {
    await apiFetch(`/api/therapy/sessions/${sessionId}/join?firebase_uid=${encodeURIComponent(firebaseUid)}`, {
      method: "POST",
    });
  } catch {
    // Silently fail — non-critical
  }
}

export async function fetchStreamToken(firebaseUid: string): Promise<{ token: string | null; user_id: string; api_key: string; dev_mode?: boolean }> {
  try {
    return await apiFetch(`/api/therapy/stream-token?firebase_uid=${encodeURIComponent(firebaseUid)}`);
  } catch {
    return { token: null, user_id: "demo_user", api_key: "", dev_mode: true };
  }
}
