import { useEffect, useState, useCallback } from "react";
import { ParentShell } from "@/components/ParentShell";
import { AlertTriangle, ShieldAlert, Loader2, Users, RefreshCw, Clock, CheckCircle2, XCircle, TrendingUp, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { careTeamApi, LinkedChild, CrisisAlert } from "@/lib/careTeamApi";
import { useChildEmotionWatch } from "@/hooks/useChildEmotionWatch";

function getSeverity(prob: number) {
  if (prob >= 0.85) return { label: "Critical", color: "text-red-700", bg: "bg-red-100 border-red-400" };
  if (prob >= 0.70) return { label: "High", color: "text-orange-700", bg: "bg-orange-100 border-orange-400" };
  return { label: "Moderate", color: "text-amber-700", bg: "bg-amber-100 border-amber-400" };
}

function getRecommendations(prob: number): string[] {
  if (prob >= 0.85) return ["🚨 Activate Sanctuary Mode immediately", "🔇 Remove all auditory stimuli", "🤝 Offer deep pressure or weighted blanket", "📞 Contact therapist or doctor now"];
  if (prob >= 0.70) return ["💡 Dim lights and reduce screen brightness", "🎧 Play preferred calming music softly", "🛋️ Guide to a quiet, familiar space", "🧸 Offer comfort object"];
  return ["🌬️ Try 4-7-8 breathing exercise together", "🎨 Offer a preferred calming activity", "💬 Use simple, reassuring language"];
}

function getFactors(iso: string): string[] {
  const h = new Date(iso).getHours();
  const factors: string[] = [];
  if (h >= 6 && h <= 9) factors.push("Morning transition / routine change");
  if (h >= 11 && h <= 13) factors.push("Pre-lunch hunger or fatigue");
  if (h >= 14 && h <= 16) factors.push("Post-school sensory overload window");
  if (h >= 17 && h <= 19) factors.push("Evening wind-down difficulty");
  if (factors.length === 0) factors.push("Time context unavailable");
  factors.push("Check caregiver handoff notes for context");
  return factors;
}

function timeSince(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const CrisisAlerts = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [selectedChild, setSelectedChild] = useState<LinkedChild | null>(null);
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acknowledged, setAcknowledged] = useState<Set<number>>(new Set());
  const [resolved, setResolved] = useState<Set<number>>(new Set());

  const { packet } = useChildEmotionWatch(selectedChild?.id ?? null);
  const liveOverwhelmProb = packet ? (packet.probs.Overwhelmed || 0) : null;
  const isLiveCrisis = liveOverwhelmProb !== null && liveOverwhelmProb > 0.65;

  useEffect(() => {
    if (!user) return;
    careTeamApi.getMyChildren(user.uid).then(data => {
      setChildren(data);
      if (data.length > 0) setSelectedChild(data[0]);
    }).finally(() => setLoading(false));
  }, [user]);

  const loadAlerts = useCallback((child: LinkedChild) => {
    if (!user) return;
    setRefreshing(true);
    careTeamApi.getCrisisAlerts(child.id, user.uid).then(setAlerts).finally(() => setRefreshing(false));
  }, [user]);

  useEffect(() => {
    if (!selectedChild) return;
    loadAlerts(selectedChild);
    const interval = setInterval(() => loadAlerts(selectedChild), 15000);
    return () => clearInterval(interval);
  }, [selectedChild, loadAlerts]);

  const activeAlerts = alerts.filter(a => !resolved.has(a.id));
  const resolvedAlerts = alerts.filter(a => resolved.has(a.id));

  if (loading) return (
    <ParentShell fullWidth>
      <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    </ParentShell>
  );

  if (children.length === 0) return (
    <ParentShell fullWidth>
      <div className="calm-card p-12 text-center border-4 border-foreground shadow-pop max-w-lg mx-auto mt-10">
        <Users className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-black mb-2">No child linked</h2>
        <p className="text-muted-foreground font-bold">Go to Manage Care Team to link your child.</p>
      </div>
    </ParentShell>
  );

  return (
    <ParentShell fullWidth>
      <div className="w-full max-w-4xl mx-auto pb-12 animate-fade-up px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Crisis Alerts</h1>
            <p className="text-muted-foreground font-bold mt-1">Overwhelm events detected by the AI emotion system</p>
          </div>
          <button onClick={() => selectedChild && loadAlerts(selectedChild)}
            className="p-2.5 rounded-xl border-4 border-foreground hover:bg-muted transition-all shadow-pop-sm self-start">
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

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

        {/* Live predicted risk banner */}
        {liveOverwhelmProb !== null && (
          <div className={`calm-card border-4 shadow-pop p-5 mb-6 ${isLiveCrisis ? "bg-red-50 border-red-400 animate-pulse" : "bg-amber-50 border-amber-300"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl border-4 border-foreground flex items-center justify-center shrink-0 ${isLiveCrisis ? "bg-red-500 text-white" : "bg-amber-400 text-white"}`}>
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-black text-lg ${isLiveCrisis ? "text-red-800" : "text-amber-800"}`}>
                    {isLiveCrisis ? "🚨 LIVE CRISIS DETECTED" : "⚠️ Elevated Risk — Live"}
                  </span>
                  <span className="text-xs font-black bg-foreground text-background px-2 py-0.5 rounded-full">PREDICTED</span>
                </div>
                <p className={`text-sm font-bold ${isLiveCrisis ? "text-red-700" : "text-amber-700"}`}>
                  Overwhelm probability: <strong>{Math.round(liveOverwhelmProb * 100)}%</strong> · Live AI · Not yet confirmed
                </p>
              </div>
            </div>
            {isLiveCrisis && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {getRecommendations(liveOverwhelmProb).map((r, i) => (
                  <div key={i} className="bg-white p-2.5 rounded-xl border-2 border-red-200 text-sm font-bold text-red-900">{r}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[{ label: "Total", val: alerts.length, color: "text-red-600" }, { label: "Active", val: activeAlerts.length, color: "text-orange-600" }, { label: "Resolved", val: resolvedAlerts.length, color: "text-green-600" }].map(s => (
            <div key={s.label} className="calm-card border-4 border-foreground shadow-pop p-4 text-center">
              <div className={`text-3xl font-black ${s.color}`}>{s.val}</div>
              <div className="text-xs font-black uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {alerts.length === 0 ? (
          <div className="calm-card p-12 text-center border-4 border-foreground shadow-pop bg-green-50">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-black text-green-800 mb-2">No crisis events recorded</h3>
            <p className="text-green-700 font-bold">No overwhelm events detected yet. Great news!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {activeAlerts.map((alert, i) => {
              const sev = getSeverity(alert.prob_overwhelmed);
              const isAck = acknowledged.has(alert.id);
              return (
                <div key={alert.id} className={`calm-card border-4 shadow-pop p-6 ${i === 0 && !isAck ? "border-red-400 bg-red-50" : "border-foreground/20 bg-background"}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl border-4 border-foreground flex items-center justify-center shrink-0 shadow-pop-sm ${i === 0 && !isAck ? "bg-red-500 text-white animate-pulse" : "bg-red-100 text-red-600"}`}>
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-black text-lg">🤯 Overwhelmed — CONFIRMED</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full border-2 ${sev.bg} ${sev.color}`}>{sev.label}</span>
                        {isAck && <span className="text-xs font-black bg-blue-100 text-blue-700 border-2 border-blue-300 px-2 py-0.5 rounded-full">Acknowledged</span>}
                        {i === 0 && !isAck && <span className="text-xs font-black bg-red-500 text-white px-2 py-0.5 rounded-full border-2 border-foreground">Latest</span>}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm font-bold text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {timeSince(alert.logged_at)}</span>
                        <span>Confidence: <strong>{Math.round(alert.confidence * 100)}%</strong></span>
                        <span>Overwhelm: <strong>{Math.round(alert.prob_overwhelmed * 100)}%</strong></span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(alert.logged_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 mb-3">
                    <p className="text-xs font-black uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Possible Contributing Factors</p>
                    <ul className="space-y-1">
                      {getFactors(alert.logged_at).map((f, fi) => (
                        <li key={fi} className="text-xs font-bold text-amber-900 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 mb-4">
                    <p className="text-xs font-black uppercase tracking-wider text-blue-800 mb-2">Calming Recommendations</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {getRecommendations(alert.prob_overwhelmed).map((r, ri) => (
                        <div key={ri} className="text-xs font-bold text-blue-900 bg-white p-2 rounded-lg border border-blue-200">{r}</div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    {!isAck && (
                      <button onClick={() => setAcknowledged(prev => new Set([...prev, alert.id]))}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white font-black text-sm border-2 border-foreground shadow-pop-sm hover:-translate-y-0.5 transition-all">
                        <CheckCircle2 className="w-4 h-4" /> Acknowledge
                      </button>
                    )}
                    <button onClick={() => setResolved(prev => new Set([...prev, alert.id]))}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white font-black text-sm border-2 border-foreground shadow-pop-sm hover:-translate-y-0.5 transition-all">
                      <XCircle className="w-4 h-4" /> Mark Resolved
                    </button>
                  </div>
                </div>
              );
            })}

            {resolvedAlerts.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Resolved ({resolvedAlerts.length})
                </h3>
                <div className="flex flex-col gap-3">
                  {resolvedAlerts.map(alert => (
                    <div key={alert.id} className="calm-card border-2 border-foreground/10 p-4 opacity-60">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-black text-sm">🤯 Overwhelmed — Resolved</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{new Date(alert.logged_at).toLocaleString()} · {Math.round(alert.prob_overwhelmed * 100)}% overwhelm</p>
                        </div>
                        <span className="text-xs font-black bg-green-100 text-green-700 border-2 border-green-300 px-2 py-0.5 rounded-full">Resolved</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ParentShell>
  );
};

export default CrisisAlerts;
