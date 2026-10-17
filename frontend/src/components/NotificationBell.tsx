import { useState, useRef, useEffect } from "react";
import { Bell, Video, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { respondToInvite } from "@/lib/therapyApi";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface NotificationBellProps {
  role: "doctor" | "parent" | "caregiver";
}

const ROOM_ROUTES: Record<string, string> = {
  doctor: "/doctor/therapy/room",
  parent: "/parent/therapy/room",
  caregiver: "/caregiver/therapy/room",
};

const SESSION_ROUTES: Record<string, string> = {
  doctor: "/doctor/therapy/setup",
  parent: "/parent/therapy",
  caregiver: "/caregiver/therapy",
};

export const NotificationBell = ({ role }: NotificationBellProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, count, refresh } = useNotifications();
  const [open, setOpen] = useState(false);
  const [responding, setResponding] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleJoin = (session: any) => {
    setOpen(false);
    navigate(ROOM_ROUTES[role], { state: { session } });
  };

  const handleAccept = async (session: any) => {
    if (!user) return;
    setResponding(session.id);
    try {
      await respondToInvite(session.id, user.uid, "accepted");
      toast.success("Session accepted!");
      refresh();
    } catch {
      toast.error("Failed to accept session.");
    } finally {
      setResponding(null);
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    navigate(SESSION_ROUTES[role]);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-12 h-12 rounded-full bg-background border-2 border-foreground shadow-pop-sm hover:bg-muted hover:-translate-y-[2px] hover:shadow-pop flex items-center justify-center shrink-0 transition-all"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-background animate-bounce">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 w-80 bg-card border-2 border-foreground shadow-pop rounded-2xl z-[100] overflow-hidden animate-fade-down">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-foreground/10 bg-muted/50">
            <h3 className="font-black text-sm">Notifications</h3>
            <button onClick={() => setOpen(false)} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-muted">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Items */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-bold">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-foreground/5 hover:bg-muted/40 transition-colors ${
                    n.type === "live" ? "bg-red-50" : n.type === "pending" ? "bg-amber-50" : "bg-blue-50/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm">{n.title}</p>
                      <p className="text-xs text-muted-foreground font-bold truncate">{n.subtitle}</p>
                      {n.session.scheduled_time && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(n.session.scheduled_time).toLocaleString([], {
                            month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {n.type === "live" && (
                      <button
                        onClick={() => handleJoin(n.session)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-black hover:-translate-y-0.5 transition-all"
                      >
                        <Video className="w-3 h-3" /> Join Now
                      </button>
                    )}
                    {n.type === "pending" && role !== "doctor" && (
                      <button
                        onClick={() => handleAccept(n.session)}
                        disabled={responding === n.session.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-black hover:-translate-y-0.5 transition-all disabled:opacity-50"
                      >
                        Accept
                      </button>
                    )}
                    {(n.type === "scheduled" || n.type === "pending") && (
                      <button
                        onClick={handleViewAll}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-background border border-foreground/20 text-xs font-bold hover:bg-muted transition-colors"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <button
            onClick={handleViewAll}
            className="w-full py-3 text-xs font-black text-primary hover:bg-muted/50 transition-colors border-t border-foreground/10"
          >
            View all sessions →
          </button>
        </div>
      )}
    </div>
  );
};
