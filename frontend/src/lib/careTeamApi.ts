import { API_BASE_URL } from "./api";

export interface TeamMember { role: string; name: string; email: string; link_id: number; }
export interface LinkedChild  { id: number; name: string; email: string; age?: number; link_id: number; team: TeamMember[]; }
export interface EmotionEntry  { id: number; state: string; dominant_emotion: string; confidence: number; probs: Record<string,number>; is_crisis: boolean; logged_at: string; }
export interface CrisisAlert   { id: number; state: string; confidence: number; prob_overwhelmed: number; logged_at: string; }

const q = (params: Record<string,string>) => new URLSearchParams(params).toString();

export const careTeamApi = {
  getMyTeam: (firebase_uid: string) =>
    fetch(`${API_BASE_URL}/api/care-team/my-team?${q({firebase_uid})}`).then(r => r.json()),

  getMyChildren: (firebase_uid: string): Promise<LinkedChild[]> =>
    fetch(`${API_BASE_URL}/api/care-team/my-children?${q({firebase_uid})}`).then(r => r.json()),

  invite: (firebase_uid: string, child_id: number, email: string, role: string) =>
    fetch(`${API_BASE_URL}/api/care-team/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebase_uid, child_id, email, role })
    }).then(r => r.json()),

  remove: (link_id: number, firebase_uid: string) =>
    fetch(`${API_BASE_URL}/api/care-team/remove/${link_id}?firebase_uid=${firebase_uid}`, { method: "DELETE" }).then(r => r.json()),

  logEmotion: (firebase_uid: string, data: Omit<EmotionEntry,"id"|"logged_at"|"is_crisis">) =>
    fetch(`${API_BASE_URL}/api/emotion/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebase_uid, ...data, prob_calm: data.probs.Calm, prob_happy: data.probs.Happy, prob_distressed: data.probs.Distressed, prob_overwhelmed: data.probs.Overwhelmed })
    }).then(r => r.json()),

  getHistory: (child_id: number, firebase_uid: string, limit = 100): Promise<EmotionEntry[]> =>
    fetch(`${API_BASE_URL}/api/emotion/history/${child_id}?${q({firebase_uid, limit: String(limit)})}`).then(r => r.json()),

  getLatest: (child_id: number, firebase_uid: string) =>
    fetch(`${API_BASE_URL}/api/emotion/latest/${child_id}?${q({firebase_uid})}`).then(r => r.json()),

  getCrisisAlerts: (child_id: number, firebase_uid: string): Promise<CrisisAlert[]> =>
    fetch(`${API_BASE_URL}/api/emotion/crisis-alerts/${child_id}?${q({firebase_uid})}`).then(r => r.json()),

  linkChild: (firebase_uid: string, child_email: string) =>
    fetch(`${API_BASE_URL}/api/care-team/link-child`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebase_uid, child_email })
    }).then(r => r.json()),
};
