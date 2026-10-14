import { useEffect, useState } from "react";
import { ParentShell } from "@/components/ParentShell";
import { TrendingUp, Loader2, Users, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { careTeamApi, LinkedChild, EmotionEntry } from "@/lib/careTeamApi";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const EmotionalTrend = () => {
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
    careTeamApi.getHistory(child.id, user.uid, 50).then(setHistory).finally(() => setRefreshing(false));
  };

  useEffect(() => { if (selectedChild) loadHistory(selectedChild); }, [selectedChild]);

  // Build chart data — group by time bucket (every 5 entries)
  const chartData = history.slice().reverse().map((e, i) => ({
    name: new Date(e.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    Calm: Math.round((e.probs.Calm || 0) * 100),
    Happy: Math.round((e.probs.Happy || 0) * 100),
    Distressed: Math.round((e.probs.Distressed || 0) * 100),
    Overwhelmed: Math.round((e.probs.Overwhelmed || 0) * 100),
  }));

  // State distribution counts
  const counts = history.reduce((acc, e) => { acc[e.state] = (acc[e.state] || 0) + 1; return acc; }, {} as Record<string,number>);
  const total = history.length || 1;

  return (
    <ParentShell title="Emotional Trend" subtitle="Emotion patterns over time">
      <div className="max-w-4xl mx-auto pb-12 animate-fade-up">

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

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">{selectedChild?.name}'s Emotion Trends</h2>
              <button onClick={() => selectedChild && loadHistory(selectedChild)}
                className="p-2 rounded-xl border-4 border-foreground hover:bg-muted transition-all shadow-pop-sm">
                <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { key: "Calm",       emoji: "😌", color: "bg-green-100 border-green-400 text-green-800" },
                { key: "Happy",      emoji: "😊", color: "bg-yellow-100 border-yellow-400 text-yellow-800" },
                { key: "Distressed", emoji: "😰", color: "bg-orange-100 border-orange-400 text-orange-800" },
                { key: "Overwhelmed",emoji: "🤯", color: "bg-red-100 border-red-400 text-red-800" },
              ].map(({ key, emoji, color }) => (
                <div key={key} className={`calm-card border-4 border-foreground shadow-pop p-4 text-center ${color}`}>
                  <div className="text-3xl mb-1">{emoji}</div>
                  <div className="font-black text-2xl">{Math.round(((counts[key] || 0) / total) * 100)}%</div>
                  <div className="text-xs font-black uppercase tracking-widest">{key}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            {chartData.length === 0 ? (
              <div className="calm-card p-12 text-center border-4 border-foreground shadow-pop">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl font-black text-muted-foreground">No emotion data yet.</p>
                <p className="text-muted-foreground mt-2">Data appears once the child uses the Feelings page with camera on.</p>
              </div>
            ) : (
              <div className="calm-card border-4 border-foreground shadow-pop p-6">
                <h3 className="text-lg font-black mb-4">Emotion Probability Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700 }} unit="%" />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend />
                    <Area type="monotone" dataKey="Calm"        stroke="#22c55e" fill="#dcfce7" strokeWidth={2} />
                    <Area type="monotone" dataKey="Happy"       stroke="#eab308" fill="#fef9c3" strokeWidth={2} />
                    <Area type="monotone" dataKey="Distressed"  stroke="#f97316" fill="#ffedd5" strokeWidth={2} />
                    <Area type="monotone" dataKey="Overwhelmed" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </ParentShell>
  );
};

export default EmotionalTrend;
