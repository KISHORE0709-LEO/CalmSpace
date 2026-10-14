import { useState, useEffect } from "react";
import { ParentShell } from "@/components/ParentShell";
import { TrendingUp, Calendar, Video, Loader2, Users, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
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
  pending_acceptance: "Awaiting Response",
  accepted: "Confirmed ✓",
  live: "🔴 LIVE NOW",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Cancelled",
};

const SessionReports = () => {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchSessions(user.uid).then(setSessions).finally(() => setLoading(false));
  }, [user]);

  const completed = sessions.filter(s => s.status === "completed");
  const upcoming = sessions.filter(s => !["completed", "cancelled", "declined"].includes(s.status));

  const stats = {
    total: sessions.length,
    completed: completed.length,
    upcoming: upcoming.length,
    live: sessions.filter(s => s.status === "live").length,
  };

  return (
    <ParentShell title="" subtitle="" fullWidth>
      <div className="w-full max-w-[96%] mx-auto pt-4 h-full flex flex-col animate-fade-up pb-16">

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight mb-2">Therapy Session Reports</h1>
            <p className="text-lg font-bold text-muted-foreground opacity-90">
              {profile?.name ? `${profile.name}'s` : "Your child's"} therapy history
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT */}
            <div className="lg:col-span-8 flex flex-col gap-8">

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: "Total Sessions", val: stats.total, icon: Calendar, color: "text-blue-500", bg: "bg-blue-100" },
                  { label: "Completed", val: stats.completed, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-100" },
                  { label: "Upcoming", val: stats.upcoming, icon: Clock, color: "text-amber-500", bg: "bg-amber-100" },
                ].map((stat, i) => (
                  <div key={i} className="calm-card bg-card border-4 border-foreground shadow-pop rounded-[1.5rem] p-6 flex items-center gap-4">
                    <div className={`w-14 h-14 ${stat.bg} border-4 border-foreground rounded-xl shadow-pop-sm flex items-center justify-center shrink-0`}>
                      <stat.icon className={`w-6 h-6 ${stat.color} stroke-[3]`} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                      <div className="text-3xl font-black text-foreground">{stat.val}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sessions list */}
              <div className="calm-card bg-card border-4 border-foreground shadow-pop-lg rounded-[2rem] overflow-hidden flex flex-col">
                <div className="p-6 md:p-8 border-b-4 border-foreground flex justify-between items-center bg-accent/20">
                  <h2 className="text-2xl font-black">All Sessions</h2>
                </div>

                <div className="p-6 md:p-8 flex flex-col gap-4">
                  {sessions.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="font-black text-muted-foreground">No sessions yet.</p>
                      <p className="text-sm text-muted-foreground/60 font-bold mt-1">Your doctor will schedule sessions and they'll appear here.</p>
                    </div>
                  ) : (
                    sessions.map(session => (
                      <div key={session.id} className={`flex flex-col md:flex-row md:items-center gap-4 p-5 bg-muted/20 border-2 border-foreground rounded-2xl hover:bg-muted/50 transition-colors ${session.status === "live" ? "border-red-300 bg-red-50" : ""}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <h3 className="font-black text-base">{session.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-black border ${STATUS_PILL[session.status] || ""}`}>
                              {STATUS_TEXT[session.status] || session.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm font-bold text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-primary" /> {session.doctor_name || "Doctor"}
                            </span>
                            {session.scheduled_time && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-primary" />
                                {new Date(session.scheduled_time).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-primary" /> {session.duration_minutes} min
                            </span>
                          </div>
                          {session.goals && (
                            <p className="text-xs text-muted-foreground font-bold mt-1 line-clamp-1">Goals: {session.goals}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {session.status === "completed" && (
                            <div className="flex items-center gap-1 text-green-600 font-black text-sm">
                              <CheckCircle2 className="w-4 h-4" /> Done
                            </div>
                          )}
                          {session.status === "live" && (
                            <div className="flex items-center gap-1 text-red-600 font-black text-sm animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-red-500" /> LIVE
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="calm-card bg-card border-4 border-secondary shadow-pop-lg rounded-[2rem] p-8 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-bl-full pointer-events-none" />
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="w-10 h-10 bg-secondary border-4 border-foreground rounded-full flex items-center justify-center shadow-pop-sm">
                    <TrendingUp className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <h2 className="text-2xl font-black text-foreground">Progress</h2>
                </div>
                <div className="bg-muted/50 border-4 border-foreground rounded-2xl p-6 relative z-10 shadow-inner">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm font-bold mb-1">
                        <span>Completion Rate</span>
                        <span className="text-primary">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden border-2 border-foreground/10">
                        <div className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%` }} />
                      </div>
                    </div>
                    <div className="text-sm font-bold text-muted-foreground">
                      {stats.completed} of {stats.total} sessions completed
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ParentShell>
  );
};

export default SessionReports;
