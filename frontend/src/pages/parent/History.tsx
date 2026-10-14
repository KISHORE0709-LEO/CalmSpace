import { useEffect, useState } from "react";
import { ParentShell } from "@/components/ParentShell";
import { Calendar, Loader2, Users, RefreshCw, AlertTriangle, Smile, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { careTeamApi, LinkedChild, EmotionEntry } from "@/lib/careTeamApi";

const EMOTION_CONFIG: Record<string, { emoji: string; color: string; dot: string }> = {
  Calm:        { emoji: "😌", color: "bg-green-100 border-green-400 text-green-800",   dot: "bg-green-400" },
  Happy:       { emoji: "😊", color: "bg-yellow-100 border-yellow-400 text-yellow-800", dot: "bg-yellow-400" },
  Distressed:  { emoji: "😰", color: "bg-orange-100 border-orange-400 text-orange-800", dot: "bg-orange-400" },
  Overwhelmed: { emoji: "🤯", color: "bg-red-100 border-red-400 text-red-800",          dot: "bg-red-500" },
  Unknown:     { emoji: "🌫️", color: "bg-gray-100 border-gray-300 text-gray-700",       dot: "bg-gray-400" },
};

const History = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [selectedChild, setSelectedChild] = useState<LinkedChild | null>(null);
  const [history, setHistory] = useState<EmotionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;
    careTeamApi.getMyChildren(user.uid).then(data => {
      setChildren(data);
      if (data.length > 0) setSelectedChild(data[0]);
    }).finally(() => setLoading(false));
  }, [user]);

  const loadHistory = (child: LinkedChild) => {
    if (!user) return;
    setRefreshing(true);
    careTeamApi.getHistory(child.id, user.uid, 100).then(setHistory).finally(() => setRefreshing(false));
  };

  useEffect(() => { if (selectedChild) loadHistory(selectedChild); }, [selectedChild]);

  const counts = history.reduce((acc, e) => { acc[e.state] = (acc[e.state] || 0) + 1; return acc; }, {} as Record<string, number>);
  const total = history.length || 1;
  const crisisCount = history.filter(e => e.is_crisis).length;

  // Group by date
  const grouped = history.reduce((acc, e) => {
    const date = new Date(e.logged_at).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
    if (!acc[date]) acc[date] = [];
    acc[date].push(e);
    return acc;
  }, {} as Record<string, EmotionEntry[]>);

  return (
    <ParentShell title="" subtitle="" fullWidth>
      <div className="w-full max-w-[96%] mx-auto pt-4 h-full flex flex-col pb-16">

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight mb-2">Emotion History</h1>
            <p className="text-lg font-bold text-muted-foreground opacity-90">
              {selectedChild ? `${selectedChild.name}'s emotional wellness log` : "Select a child to view history"}
            </p>
          </div>
          <button onClick={() => selectedChild && loadHistory(selectedChild)}
            className="p-2 rounded-xl border-4 border-foreground hover:bg-muted transition-all shadow-pop-sm self-start">
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : children.length === 0 ? (
          <div className="calm-card p-12 text-center border-4 border-foreground shadow-pop">
            <Users className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-black mb-2">No child linked</h2>
            <p className="text-muted-foreground font-bold">Go to Manage Care Team to link your child.</p>
          </div>
        ) : (
          <>
            {children.length > 1 && (
              <div className="flex gap-3 mb-6 flex-wrap">
                {children.map(c => (
                  <button key={c.id} onClick={() => setSelectedChild(c)}
                    className={`px-5 py-2 rounded-full font-black border-4 transition-all ${selectedChild?.id === c.id ? "bg-primary text-primary-foreground border-foreground shadow-pop" : "bg-background border-foreground/30 hover:border-foreground"}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* LEFT: Timeline */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                {Object.keys(grouped).length === 0 ? (
                  <div className="calm-card p-12 text-center border-4 border-foreground shadow-pop">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-xl font-black text-muted-foreground">No emotion history yet.</p>
                    <p className="text-muted-foreground mt-2">Data appears once the child uses the Feelings page with camera on.</p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([date, entries]) => (
                    <div key={date} className="calm-card bg-card border-4 border-foreground shadow-pop-lg rounded-[2rem] p-6 md:p-8 flex flex-col">
                      <div className="flex gap-4 mb-6">
                        <div className="w-14 h-14 bg-secondary border-4 border-foreground rounded-full flex items-center justify-center shadow-pop-sm shrink-0">
                          <Calendar className="w-6 h-6 text-secondary-foreground" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-foreground">{date}</h2>
                          <p className="text-sm font-black text-primary uppercase tracking-widest mt-1">{entries.length} Events Tracked</p>
                        </div>
                      </div>

                      <div className="relative pl-6 sm:pl-10 pb-4">
                        <div className="absolute top-4 bottom-8 left-8 sm:left-12 w-1 border-l-4 border-dotted border-foreground/20 -translate-x-1/2" />
                        {entries.map((e, i) => {
                          const cfg = EMOTION_CONFIG[e.state] ?? EMOTION_CONFIG.Unknown;
                          return (
                            <div key={e.id} className="relative pb-6">
                              <div className={`absolute left-2 sm:left-2 top-6 w-4 h-4 rounded-full border-4 border-foreground shadow-sm -translate-x-1/2 z-10 ${cfg.dot} ${e.is_crisis ? "animate-pulse" : ""}`} />
                              <div className={`ml-8 sm:ml-12 border-4 border-foreground rounded-3xl p-4 shadow-pop-sm hover:-translate-y-1 transition-transform ${e.is_crisis ? "bg-red-50 border-red-300" : "bg-background"}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">{cfg.emoji}</span>
                                    <span className="font-bold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
                                      {new Date(e.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black border-2 ${cfg.color}`}>{e.state}</span>
                                    {e.is_crisis && <span className="px-2 py-1 rounded-full text-xs font-black bg-red-500 text-white border-2 border-foreground">🚨 CRISIS</span>}
                                  </div>
                                </div>
                                <p className="font-bold text-sm text-muted-foreground ml-10">
                                  Confidence: {Math.round(e.confidence * 100)}% · {e.dominant_emotion}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* RIGHT: Summary */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="calm-card bg-card border-4 border-foreground shadow-pop-lg rounded-[2rem] p-8 flex flex-col">
                  <h2 className="text-2xl font-black text-primary mb-6 text-center">Sentiment Summary</h2>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[
                      { key: "Calm", emoji: "😌", color: "bg-green-100 border-green-400 text-green-800" },
                      { key: "Happy", emoji: "😊", color: "bg-yellow-100 border-yellow-400 text-yellow-800" },
                      { key: "Distressed", emoji: "😰", color: "bg-orange-100 border-orange-400 text-orange-800" },
                      { key: "Overwhelmed", emoji: "🤯", color: "bg-red-100 border-red-400 text-red-800" },
                    ].map(({ key, emoji, color }) => (
                      <div key={key} className={`calm-card border-4 border-foreground shadow-pop p-3 text-center ${color}`}>
                        <div className="text-2xl mb-1">{emoji}</div>
                        <div className="font-black text-xl">{Math.round(((counts[key] || 0) / total) * 100)}%</div>
                        <div className="text-xs font-black uppercase tracking-widest">{key}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-muted border-4 border-foreground rounded-2xl p-4 shadow-inner">
                    <h4 className="font-black text-sm mb-2">Summary</h4>
                    <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                      {history.length} total readings. {crisisCount > 0 ? `⚠️ ${crisisCount} crisis event${crisisCount > 1 ? "s" : ""} detected.` : "✅ No crisis events."}
                    </p>
                  </div>
                </div>

                {crisisCount > 0 && (
                  <div className="calm-card bg-red-50 border-4 border-red-300 shadow-pop-lg rounded-[2rem] p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                      <h3 className="text-lg font-black text-red-800">Crisis Events</h3>
                    </div>
                    <p className="text-sm font-bold text-red-700">
                      {crisisCount} overwhelm event{crisisCount > 1 ? "s" : ""} detected. Consider reviewing with the doctor.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ParentShell>
  );
};

export default History;
