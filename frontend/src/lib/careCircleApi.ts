import { API_BASE_URL } from "./api";

export interface CareCircle {
  id: number;
  name: string;
  child_name: string;
  owner_user_id: number;
  created_at: string;
  owner_name?: string;
  current_user_role?: string;
  current_user_status?: string; // "pending" | "active" | "revoked"
}

export interface CareCircleMember {
  id: number;
  circle_id: number;
  user_id?: number | null;
  name: string;
  invited_email: string;
  role: "parent" | "caregiver" | "doctor";
  status: "pending" | "active" | "revoked";
  invited_at: string;
  responded_at?: string | null;
  is_owner: boolean;
  can_revoke: boolean;
  can_cancel: boolean;
}

export interface ChatMessage {
  id: number;
  circle_id: number;
  sender_user_id: number;
  sender_name: string;
  sender_role: "parent" | "caregiver" | "doctor";
  content: string;
  sent_at: string;
}

function getAuthHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchMyCircles(token?: string | null): Promise<CareCircle[]> {
  if (!API_BASE_URL) return [];
  const res = await fetch(`${API_BASE_URL}/api/care-circles/mine`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch care circles");
  }
  return res.json();
}

export async function createCareCircle(
  childName: string,
  name?: string,
  token?: string | null
): Promise<CareCircle> {
  if (!API_BASE_URL) throw new Error("Backend URL not configured");
  const res = await fetch(`${API_BASE_URL}/api/care-circles`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ child_name: childName, name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create Care Circle");
  }
  return res.json();
}

export async function fetchCircleMembers(
  circleId: number,
  token?: string | null
): Promise<CareCircleMember[]> {
  if (!API_BASE_URL) return [];
  const res = await fetch(`${API_BASE_URL}/api/care-circles/${circleId}/members`, {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch circle members");
  }
  return res.json();
}

export async function inviteMember(
  circleId: number,
  email: string,
  role: "parent" | "caregiver" | "doctor",
  token?: string | null
): Promise<CareCircleMember> {
  if (!API_BASE_URL) throw new Error("Backend URL not configured");
  const res = await fetch(`${API_BASE_URL}/api/care-circles/${circleId}/invite`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ email, role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to invite member");
  }
  return res.json();
}

export async function cancelInvite(
  circleId: number,
  memberId: number,
  token?: string | null
): Promise<void> {
  if (!API_BASE_URL) throw new Error("Backend URL not configured");
  const res = await fetch(`${API_BASE_URL}/api/care-circles/${circleId}/invite/${memberId}/cancel`, {
    method: "POST",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to cancel invite");
  }
}

export async function revokeMember(
  circleId: number,
  memberId: number,
  token?: string | null
): Promise<void> {
  if (!API_BASE_URL) throw new Error("Backend URL not configured");
  const res = await fetch(`${API_BASE_URL}/api/care-circles/${circleId}/members/${memberId}/revoke`, {
    method: "POST",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to revoke member access");
  }
}

export async function acceptInvite(
  circleId: number,
  memberId: number,
  token?: string | null
): Promise<void> {
  if (!API_BASE_URL) throw new Error("Backend URL not configured");
  const res = await fetch(`${API_BASE_URL}/api/care-circles/${circleId}/invite/${memberId}/accept`, {
    method: "POST",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to accept invite");
  }
}

export async function declineInvite(
  circleId: number,
  memberId: number,
  token?: string | null
): Promise<void> {
  if (!API_BASE_URL) throw new Error("Backend URL not configured");
  const res = await fetch(`${API_BASE_URL}/api/care-circles/${circleId}/invite/${memberId}/decline`, {
    method: "POST",
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to decline invite");
  }
}

export async function fetchChatMessages(
  circleId: number,
  token?: string | null,
  before?: string
): Promise<ChatMessage[]> {
  if (!API_BASE_URL) return [];
  const url = new URL(`${API_BASE_URL}/api/care-circles/${circleId}/messages`);
  if (before) url.searchParams.set("before", before);

  const res = await fetch(url.toString(), {
    headers: getAuthHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch chat messages");
  }
  return res.json();
}

export function getCareCircleWsUrl(circleId: number, token?: string | null): string | null {
  if (import.meta.env.VITE_WS_URL) {
    const base = import.meta.env.VITE_WS_URL.replace("/ws/facial-sensing", "");
    return `${base}/ws/care-circle/${circleId}${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  }

  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  if (isLocal) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.hostname}:8000/ws/care-circle/${circleId}${
      token ? `?token=${encodeURIComponent(token)}` : ""
    }`;
  }

  return null;
}
