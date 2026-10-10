/**
 * Child — Therapy Sessions
 * Simple, friendly interface showing the child's upcoming sessions and join button.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Star, Video, Calendar, Clock, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchSessions, TherapySession } from "@/lib/therapyApi";

export default function ChildTherapy() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const nextSession = sessions.find((s) => ["accepted", "live", "pending_acceptance"].includes(s.status));

  const handleJoin = (session: TherapySession) => {
    navigate("/app/therapy/room", { state: { session } });
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-sky-100 to-yellow-50 pt-24 pb-16 px-4 font-sans">

        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <span className="text-6xl">🎉</span>
          <h1 className="text-4xl font-black text-foreground mt-4 mb-2">Therapy Time!</h1>
          <p className="text-muted-foreground font-bold text-lg">Meet with your doctor online. It's fun and easy!</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : nextSession ? (
          <div className="max-w-lg mx-auto animate-fade-up">

            {/* Main Session Card */}
            <div className={`bg-white rounded-[3rem] border-4 border-foreground shadow-pop-xl p-8 text-center space-y-6 ${
              nextSession.status === "live" ? "ring-4 ring-red-400" : ""
            }`}>

              {nextSession.status === "live" && (
                <div className="flex items-center justify-center gap-2 bg-red-100 border-2 border-red-400 rounded-full py-2 px-6">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-black text-red-600 text-sm uppercase tracking-wider">Your doctor is waiting!</span>
                </div>
              )}

              {/* Doctor avatar */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-primary/20 border-4 border-primary flex items-center justify-center text-4xl font-black text-primary shadow-pop">
                  {(nextSession.doctor_name || "D").charAt(0)}
                </div>
                <h2 className="text-2xl font-black">{nextSession.doctor_name || "Your Doctor"}</h2>
                <span className="text-muted-foreground font-bold">is ready for you! 😊</span>
              </div>

              {/* Session info */}
              <div className="bg-sky-50 rounded-2xl border-2 border-sky-200 p-4 space-y-2 text-sm font-bold text-left">
                <p className="flex items-center gap-2 text-foreground">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>{nextSession.title}</span>
                </p>
                {nextSession.scheduled_time && (
                  <>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      {new Date(nextSession.scheduled_time).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      {new Date(nextSession.scheduled_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </>
                )}
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  {nextSession.duration_minutes} minutes
                </p>
              </div>

              {/* Join button */}
              {["accepted", "live"].includes(nextSession.status) ? (
                <button
                  onClick={() => handleJoin(nextSession)}
                  className={`w-full py-5 rounded-[2rem] border-4 border-foreground font-black text-2xl flex items-center justify-center gap-3 transition-all hover:-translate-y-1 active:translate-y-1 shadow-pop ${
                    nextSession.status === "live"
                      ? "bg-red-500 text-white animate-pulse-soft"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  <Video className="w-7 h-7" />
                  {nextSession.status === "live" ? "Join Now! 🎉" : "Get Ready to Join"}
                  <ArrowRight className="w-7 h-7" />
                </button>
              ) : (
                <div className="w-full py-4 rounded-[2rem] border-4 border-foreground/20 bg-muted text-muted-foreground font-black text-xl text-center">
                  ⏰ Waiting for confirmation…
                </div>
              )}
            </div>

            {/* Stars encouragement */}
            <div className="mt-8 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <p className="text-center font-black text-muted-foreground mt-3">You're doing amazing! ⭐</p>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center animate-fade-up">
            <div className="bg-white rounded-[3rem] border-4 border-foreground shadow-pop-xl p-10 space-y-6">
              <span className="text-6xl">📅</span>
              <h2 className="text-2xl font-black">No session today</h2>
              <p className="text-muted-foreground font-bold">Your doctor will schedule the next session soon. Come back later!</p>
            </div>
          </div>
        )}

        {/* Previous sessions */}
        {sessions.filter((s) => s.status === "completed").length > 0 && (
          <div className="max-w-lg mx-auto mt-8">
            <h3 className="font-black text-lg mb-3 text-center">Past Sessions</h3>
            <div className="space-y-2">
              {sessions.filter((s) => s.status === "completed").map((s) => (
                <div key={s.id} className="bg-white/80 rounded-2xl border-2 border-foreground/10 p-4 flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground font-bold">
                      {s.scheduled_time ? new Date(s.scheduled_time).toLocaleDateString() : "Completed"}
                    </p>
                  </div>
                  <span className="text-xs font-black text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">Done ✓</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
