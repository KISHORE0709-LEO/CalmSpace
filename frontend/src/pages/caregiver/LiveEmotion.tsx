import { useEffect, useRef, useState } from "react";
import { CaregiverShell } from "@/components/CaregiverShell";
import { Lightbulb, ShieldCheck, History, Loader2, Users, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmotion } from "@/context/EmotionContext";
import { careTeamApi, LinkedChild } from "@/lib/careTeamApi";
import { useNavigate } from "react-router-dom";

const EMOTION_CONFIG = {
  Calm:       { emoji: "😌", label: "Calm",       bg: "from-green-100 to-emerald-100",  text: "text-green-900",  actions: ["✅ Continue current activity", "🎵 Keep ambient music low"] },
  Happy:      { emoji: "😊", label: "Happy",      bg: "from-yellow-100 to-amber-100",   text: "text-yellow-900", actions: ["🎉 Encourage play", "🗣️ Engage in conversation"] },
  Distressed: { emoji: "😰", label: "Distressed", bg: "from-orange-100 to-amber-100",   text: "text-orange-900", actions: ["💡 Dim the lights", "🎧 Offer calming sounds", "🛋️ Guide to quiet space"] },
  Overwhelmed:{ emoji: "🤯", label: "Overwhelmed",bg: "from-red-100 to-rose-100",        text: "text-red-900",    actions: ["🚨 Activate Sanctuary Mode", "🔇 Reduce all noise", "🤝 Offer physical comfort"] },
  Unknown:    { emoji: "🌫️", label: "Detecting…", bg: "from-gray-100 to-slate-100",     text: "text-gray-900",   actions: [] },
};

const LiveEmotion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { emotion: wsEmotion, detectionConfidence: wsConf, calmspaceMappedProbabilities: wsProbs, isLive, faceDetected } = useEmotion();

  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [selectedChild, setSelectedChild] = useState<LinkedChild | null>(null);
  const [dbEmotion, setDbEmotion] = useState<any>(null);
  const [history, setHistory] = useState<{ emotion: string; time: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const lastEmotionRef = useRef<string>("");

  useEffect(() => {
    if (!user) return;
    careTeamApi.getMyChildren(user.uid).then(data => {
      setChildren(data);
      if (data.length > 0) setSelectedChild(data[0]);
    }).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || !selectedChild) return;
    const poll = () => careTeamApi.getLatest(selectedChild.id, user.uid).then(setDbEmotion).catch(() => {});
    poll();
    const t = setInterval(poll, 5000);
    return () => clearInterval(t);
  }, [user, selectedChild]);

  const emotion = (isLive && faceDetected ? wsEmotion : dbEmotion?.state) || "Unknown";
  const confidence = isLive && faceDetected ? wsConf : (dbEmotion?.confidence || 0);
  const probs = isLive && faceDetected ? wsProbs : (dbEmotion?.probs || { Calm:0.25, Happy:0.25, Distressed:0.25, Overwhelmed:0.25 });
  const cfg = EMOTION_CONFIG[emotion as keyof typeof EMOTION_CONFIG] ?? EMOTION_CONFIG.Unknown;
  const isCrisis = emotion === "Overwhelmed" && confidence > 0.5;

  useEffect(() => {
    if (emotion !== "Unknown" && emotion !== lastEmotionRef.current) {
      lastEmotionRef.current = emotion;
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setHistory(prev => [{ emotion, time: now }, ...prev].slice(0, 6));
    }
  }, [emotion]);

  const historyColors: Record<string, string> = {
    Calm: "bg-green-200 border-green-400", Happy: "bg-yellow-200 border-yellow-400",
    Distressed: "bg-orange-200 border-orange-400", Overwhelmed: "bg-red-200 border-red-400",
    Unknown: "bg-gray-200 border-gray-300",
  };

  if (loading) return (
    <CaregiverShell title="Live Session View" subtitle="" fullWidth>
      <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    </CaregiverShell>
  );

  if (children.length === 0) return (
    <CaregiverShell title="Live Session View" subtitle="" fullWidth>
      <div className="calm-card p-12 text-center border-4 border-foreground shadow-pop max-w-lg mx-auto mt-10">
        <Users className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-black mb-2">Not linked to a child</h2>
        <p className="text-muted-foreground font-bold">Ask the parent to invite you to their child's care team.</p>
      </div>
    </CaregiverShell>
  );

  return (
    <CaregiverShell title="Live Session View" subtitle={`Monitoring ${selectedChild?.name || "child"}`} fullWidth>
      <div className="grid lg:grid-cols-12 gap-6 pb-12 animate-fade-up items-start">

        {/* LEFT */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {children.length > 1 && (
            <div className="calm-card border-4 border-foreground shadow-pop p-4">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Select Child</p>
              {children.map(c => (
                <button key={c.id} onClick={() => setSelectedChild(c)}
                  className={`w-full px-4 py-2 rounded-xl font-black border-4 text-left mb-2 transition-all ${selectedChild?.id === c.id ? "bg-primary text-primary-foreground border-foreground shadow-pop-sm" : "bg-background border-foreground/30 hover:border-foreground"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          )}

          <div className="calm-card bg-white border-4 border-foreground shadow-pop rounded-2xl p-6 flex flex-col gap-4">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-black text-sm justify-center border-2 ${isLive && faceDetected ? "bg-green-100 border-green-400 text-green-800" : "bg-amber-100 border-amber-400 text-amber-800"}`}>
              <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${isLive && faceDetected ? "bg-green-500" : "bg-amber-500"}`} />
              {isLive && faceDetected ? "🔴 Live" : dbEmotion ? "📊 Last Known" : "Waiting…"}
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="w-14 h-14 rounded-full bg-blue-100 border-4 border-foreground shadow-pop-sm flex items-center justify-center text-xl font-black text-blue-900 shrink-0">
                {selectedChild?.name?.charAt(0) || "👦"}
              </div>
              <div>
                <h2 className="text-lg font-black">{selectedChild?.name}</h2>
                <p className="text-xs font-bold text-muted-foreground">
                  {dbEmotion?.logged_at ? `Last: ${new Date(dbEmotion.logged_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}` : "No data yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="calm-card bg-white border-4 border-foreground shadow-pop p-6 flex flex-col gap-3">
            <div className="flex justify-between items-end mb-1">
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Confidence
              </h3>
              <span className="font-black text-primary">{Math.round(confidence * 100)}%</span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden border-2 border-foreground/10">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.round(confidence * 100)}%` }} />
            </div>
            {Object.entries(EMOTION_CONFIG).filter(([k]) => k !== "Unknown").map(([key, c]) => {
              const pct = Math.round((probs[key] || 0) * 100);
              const barColor = key === "Calm" ? "bg-green-400" : key === "Happy" ? "bg-yellow-400" : key === "Distressed" ? "bg-orange-400" : "bg-red-400";
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs font-bold mb-0.5"><span>{c.emoji} {c.label}</span><span>{pct}%</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {isCrisis && (
            <div className="calm-card bg-red-500 text-white border-4 border-foreground shadow-pop p-5 flex items-center gap-4 animate-pulse">
              <AlertTriangle className="w-8 h-8 shrink-0" />
              <div>
                <p className="font-black text-lg">🚨 CRISIS ALERT — Act Now!</p>
                <p className="text-sm font-bold opacity-90">Child is overwhelmed. Immediate intervention recommended.</p>
              </div>
            </div>
          )}

          <div className={`calm-card bg-gradient-to-br ${cfg.bg} border-4 border-foreground shadow-pop-xl p-8 lg:p-12 relative overflow-hidden flex flex-col items-center justify-center text-center`}>
            <div className="text-[120px] leading-none drop-shadow-2xl relative z-10 mb-6 transition-all duration-500">{cfg.emoji}</div>
            <h1 className={`text-5xl lg:text-6xl font-black ${cfg.text} tracking-tight relative z-10 mb-4`}>{cfg.label}</h1>
          </div>

          {cfg.actions.length > 0 && (
            <div className="calm-card bg-blue-50 border-4 border-foreground shadow-pop-lg p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-black text-blue-900">Suggested Actions</h3>
              </div>
              <ul className="space-y-2">
                {cfg.actions.map((a, i) => (
                  <li key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border-2 border-blue-200 font-bold text-blue-900">{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="calm-card bg-white border-4 border-foreground shadow-pop p-6">
            <h3 className="text-base font-black flex items-center gap-2 mb-4"><History className="w-5 h-5 text-blue-500" /> Recent Transitions</h3>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No transitions yet</p>
            ) : (
              <div className="space-y-3">
                {history.map((h, i) => {
                  const hcfg = EMOTION_CONFIG[h.emotion as keyof typeof EMOTION_CONFIG] ?? EMOTION_CONFIG.Unknown;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border-4 border-foreground ${historyColors[h.emotion] ?? "bg-gray-200"} flex items-center justify-center shrink-0`}>
                        {i === 0 && <div className="w-2 h-2 rounded-full bg-current animate-ping" />}
                      </div>
                      <div className={`flex-1 p-2 rounded-xl border-2 ${historyColors[h.emotion] ?? "border-gray-200"}`}>
                        <div className="font-black text-sm">{hcfg.emoji} {hcfg.label}</div>
                        <div className="text-xs text-muted-foreground">{h.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => navigate("/caregiver/chat")}
              className="w-full flex items-center justify-between bg-purple-100 hover:bg-purple-200 border-4 border-foreground shadow-pop hover:-translate-y-1 transition-all rounded-2xl p-4 group">
              <span className="font-black text-purple-900">💬 Notify Parent</span>
            </button>
            <button onClick={() => navigate("/caregiver/crisis-alerts")}
              className="w-full flex items-center justify-between bg-red-100 hover:bg-red-200 border-4 border-foreground shadow-pop hover:-translate-y-1 transition-all rounded-2xl p-4 group">
              <span className="font-black text-red-900">🚨 View Crisis Log</span>
            </button>
          </div>
        </div>

      </div>
    </CaregiverShell>
  );
};

export default LiveEmotion;
