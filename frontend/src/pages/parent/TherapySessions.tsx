/**
 * Parent — Therapy Sessions
 * View scheduled sessions, accept/decline invites, join sessions.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ParentShell } from "@/components/ParentShell";
import {
  Video, UserCircle2, Calendar, Clock, ArrowRight, CheckCircle2,
  XCircle, Loader2, AlertCircle, History, Users, FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchSessions, respondToInvite, TherapySession, TherapyParticipant
} from "@/lib/therapyApi";
import { toast } from "sonner";

const STATUS_PILL: Record<string, string> = {
  pending_acceptance: "bg-amber-100 text-amber-700 border-amber-300",
  accepted: "bg-emerald-100 text-emerald-700 border-emerald-300",
  live: "bg-red-100 text-red-700 border-red-300",
  completed: "bg-blue-100 text-blue-700 border-blue-300",
  declined: "bg-rose-100 text-rose-700 border-rose-300",
  cancelled: "bg-gray-100 text-gray-500 border-gray-300",
};

const STATUS_TEXT: Record<string, string> = {
  pending_acceptance: "Awaiting Your Response",
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
  const [responding, setResponding] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchSessions(user.uid)
      .then(setSessions)
      .finally(() => setLoading(false));
  }, [user]);

  const handleRespond = async (session: TherapySession, response: "accepted" | "declined") => {
    if (!user) return;
    setResponding(session.id);
    try {
      const updated = await respondToInvite(session.id, user.uid, response);
      setSessions((prev) => prev.map((s) => (s.id === session.id ? updated : s)));
      toast.success(response === "accepted" ? "Session accepted! You'll receive joining details." : "Session declined.");
    } catch {
      toast.error("Could not update response. Please try again.");
    } finally {
      setResponding(null);
    }
  };

  const handleJoin = (session: TherapySession) => {
    navigate("/parent/therapy/room", { state: { session } });
  };

  const upcomingSessions = sessions.filter((s) => !["completed", "cancelled", "declined"].includes(s.status));
  const pastSessions = sessions.filter((s) => ["completed", "cancelled", "declined"].includes(s.status));

  return (
    <ParentShell title="" subtitle="" fullWidth>
      <div className="w-full max-w-[96%] mx-auto pt-4 pb-16">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight">Therapy Sessions</h1>
            <p className="text-muted-foreground font-bold mt-1">Manage and join {profile?.name ? `${profile.name}'s` : "your child's"} virtual therapy sessions</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-10">

            {/* ── Upcoming / Active Sessions ── */}
            <section>
              <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-primary" /> Upcoming & Active Sessions
              </h2>

              {upcomingSessions.length === 0 ? (
                <div className="calm-card text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="font-black text-muted-foreground">No upcoming sessions scheduled.</p>
                  <p className="text-sm text-muted-foreground/60 font-bold mt-1">Your doctor will schedule sessions and you'll be notified here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => {
                    const myParticipant: TherapyParticipant | undefined = session.participants.find(
                      (p) => p.role === "parent"
                    );
                    const isPending = session.status === "pending_acceptance" && myParticipant?.invite_status === "pending";
                    const isLive = session.status === "live";
                    const canJoin = myParticipant?.invite_status === "accepted" && ["accepted", "live"].includes(session.status);

                    return (
                      <div key={session.id} className={`calm-card border-4 transition-all ${
                        isLive ? "border-red-400 shadow-pop-lg" : "border-foreground/10 hover:border-foreground/30"
                      }`}>
                        {/* Live indicator */}
                        {isLive && (
                          <div className="flex items-center gap-2 mb-4 pb-4 border-b-2 border-red-200">
                            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                            <span className="font-black text-red-600 text-sm uppercase tracking-wider">Session is LIVE — Join Now</span>
                          </div>
                        )}

                        <div className="flex flex-col md:flex-row gap-5">
                          {/* Doctor photo / avatar */}
                          <div className="w-full md:w-48 shrink-0 rounded-2xl overflow-hidden border-2 border-foreground/20 bg-muted flex items-center justify-center min-h-[100px]">
                            <div className="flex flex-col items-center gap-2 p-4">
                              <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-xl font-black text-primary">
                                {(session.doctor_name || "D").charAt(0)}
                              </div>
                              <span className="text-xs font-black text-center text-foreground/70">{session.doctor_name || "Doctor"}</span>
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <h3 className="text-xl font-black">{session.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-black border ${STATUS_PILL[session.status] || STATUS_PILL.pending_acceptance}`}>
                                {STATUS_TEXT[session.status] || session.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                              {session.scheduled_time && (
                                <div className="flex items-center gap-2 text-muted-foreground font-bold">
                                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                                  {new Date(session.scheduled_time).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                                </div>
                              )}
                              {session.scheduled_time && (
                                <div className="flex items-center gap-2 text-muted-foreground font-bold">
                                  <Clock className="w-4 h-4 text-primary shrink-0" />
                                  {new Date(session.scheduled_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-muted-foreground font-bold">
                                <Clock className="w-4 h-4 text-primary shrink-0" />
                                {session.duration_minutes} min
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                              <Users className="w-4 h-4 text-primary" />
                              {session.participants.map((p) => p.user_name || p.role).join(", ")}
                            </div>

                            {session.goals && (
                              <div className="bg-muted/40 rounded-xl p-3 border border-foreground/10">
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-1">Session Goals</p>
                                <p className="text-sm font-bold text-foreground whitespace-pre-line line-clamp-2">{session.goals}</p>
                              </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex flex-wrap gap-3 pt-2">
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleRespond(session, "accepted")}
                                    disabled={responding === session.id}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white font-black border-2 border-emerald-700 hover:-translate-y-0.5 transition-all shadow-pop-sm disabled:opacity-50"
                                  >
                                    {responding === session.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRespond(session, "declined")}
                                    disabled={responding === session.id}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-background text-rose-600 font-black border-2 border-rose-300 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                  >
                                    <XCircle className="w-4 h-4" /> Decline
                                  </button>
                                </>
                              )}
                              {canJoin && (
                                <button
                                  onClick={() => handleJoin(session)}
                                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black border-2 transition-all hover:-translate-y-0.5 shadow-pop-sm ${
                                    isLive
                                      ? "bg-red-500 text-white border-red-700 animate-pulse-soft"
                                      : "bg-primary text-primary-foreground border-foreground"
                                  }`}
                                >
                                  <Video className="w-4 h-4" />
                                  {isLive ? "Join Live Session" : "Join Session"}
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

            {/* ── Past Sessions ── */}
            {pastSessions.length > 0 && (
              <section>
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-muted-foreground" /> Past Sessions
                </h2>
                <div className="space-y-3">
                  {pastSessions.map((session) => (
                    <div key={session.id} className="calm-card border border-foreground/10 opacity-80 hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-base truncate">{session.title}</h3>
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
    </ParentShell>
  );
}
