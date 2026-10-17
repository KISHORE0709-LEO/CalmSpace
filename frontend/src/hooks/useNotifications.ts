import { useState, useEffect, useCallback } from "react";
import { fetchSessions, TherapySession } from "@/lib/therapyApi";
import { useAuth } from "@/contexts/AuthContext";

export interface NotificationItem {
  id: number;
  title: string;
  subtitle: string;
  type: "live" | "pending" | "scheduled";
  session: TherapySession;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) return;
    try {
      const sessions = await fetchSessions(user.uid);
      const items: NotificationItem[] = [];
      for (const s of sessions) {
        if (s.status === "live") {
          items.push({ id: s.id, title: "🔴 Session is LIVE", subtitle: s.title, type: "live", session: s });
        } else if (s.status === "pending_acceptance") {
          items.push({ id: s.id, title: "📅 Session Invite", subtitle: s.title, type: "pending", session: s });
        } else if (s.status === "accepted" || s.status === "scheduled") {
          const t = s.scheduled_time ? new Date(s.scheduled_time) : null;
          const soon = t && (t.getTime() - Date.now()) < 30 * 60 * 1000 && t.getTime() > Date.now();
          if (soon) items.push({ id: s.id, title: "⏰ Starting Soon", subtitle: s.title, type: "scheduled", session: s });
        }
      }
      setNotifications(items);
      setCount(items.length);
    } catch {}
  }, [user]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 8000);
    return () => clearInterval(interval);
  }, [refresh]);

  return { notifications, count, refresh };
}
