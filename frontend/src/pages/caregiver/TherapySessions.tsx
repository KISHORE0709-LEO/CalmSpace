/**
 * Caregiver — Therapy Sessions
 * View assigned sessions and join them.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CaregiverShell } from "@/components/CaregiverShell";
import {
  Video, Calendar, Clock, ArrowRight, Loader2, AlertCircle, Users, History
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchSessions, TherapySession } from "@/lib/therapyApi";

const STATUS_PILL: Record<string, string> = {
  pending_acceptance: "bg-amber-100 text-amber-700 border-amber-300",
  accepted: "bg-emerald-100 text-emerald-700 border-emerald-300",
  live: "bg-red-100 text-red-700 border-red-300",
  completed: "bg-blue-100 text-blue-700 border-blue-300",
  declined: "bg-rose-100 text-rose-700 border-rose-300",
  cancelled: "bg-gray-100 text-gray-500 border-gray-300",
};

const STATUS_TEXT: Record<string, string> = {
  pending_acceptance: "Scheduled",
  accepted: "Confirmed ✓",
  live: "🔴 LIVE NOW",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Cancelled",
};

export default function TherapySessions() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = () => {
      fetchSessions(user.uid)
        .then(setSessions)
        .finally(() => setLoading(false));
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const upcomingSessions = sessions.filter((s) => !["completed", "cancelled", "declined"].includes(s.status));
  const pastSessions = sessions.filter((s) => ["completed", "cancelled", "declined"].includes(s.status));

  return (
    <CaregiverShell title="" subtitle="" fullWidth>
      <div className="w-full max-w-[96%] mx-auto pt-4 pb-16">

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Therapy Sessions</h1>
          <p className="text-muted-foreground font-bold mt-1">Sessions you're assigned to support</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-10">

            <section>
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" /> Upcoming Sessions
              </h2>

              {upcomingSessions.length === 0 ? (
                <div className="calm-card text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="font-black text-muted-foreground">No sessions assigned to you yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => {
                    const isLive = session.status === "live";
                    return (
                      <div
                        key={session.id}
                        className={`calm-card border-4 transition-all ${isLive ? "border-red-400" : "border-foreground/10 hover:border-foreground/30"}`}
                      >
                        {isLive && (
                          <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-red-200">
                            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                            <span className="font-black text-red-600 text-sm uppercase tracking-wider">Session is LIVE — Join Now</span>
                          </div>
                        )}

                        <div className="flex flex-col md:flex-row gap-5">
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <h3 className="text-xl font-black">{session.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-black border ${STATUS_PILL[session.status] || STATUS_PILL.pending_acceptance}`}>
                                {STATUS_TEXT[session.status] || session.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground font-bold">
                                <Users className="w-4 h-4 text-primary shrink-0" />
                                {session.child_name || "Child"}
                              </div>
                              {session.scheduled_time && (
                                <div className="flex items-center gap-2 text-muted-foreground font-bold">
                                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                                  {new Date(session.scheduled_time).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-muted-foreground font-bold">
                                <Clock className="w-4 h-4 text-primary shrink-0" />
                                {session.duration_minutes} min
                              </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                              {["accepted", "live", "pending_acceptance"].includes(session.status) && (
                                <button
                                  onClick={() => navigate("/caregiver/therapy/room", { state: { session } })}
                                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black border-2 transition-all hover:-translate-y-0.5 shadow-pop-sm ${
                                    isLive
                                      ? "bg-red-500 text-white border-red-700"
                                      : "bg-primary text-primary-foreground border-foreground"
                                  }`}
                                >
                                  <Video className="w-4 h-4" />
                                  {isLive ? "Join Live" : "Join Session"}
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {pastSessions.length > 0 && (
              <section>
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-muted-foreground" /> Past Sessions
                </h2>
                <div className="space-y-3">
                  {pastSessions.map((session) => (
                    <div key={session.id} className="calm-card border border-foreground/10 opacity-75">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <h3 className="font-black text-base">{session.title}</h3>
                          <p className="text-xs text-muted-foreground font-bold mt-0.5">
                            {session.doctor_name} · {session.scheduled_time ? new Date(session.scheduled_time).toLocaleDateString() : "No date"}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${STATUS_PILL[session.status] || ""}`}>
                          {STATUS_TEXT[session.status] || session.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </CaregiverShell>
  );
}
