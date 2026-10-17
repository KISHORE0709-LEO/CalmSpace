import { useEffect, useRef, useState } from "react";
import { CaregiverShell } from "@/components/CaregiverShell";
import { Lightbulb, ShieldCheck, History, Loader2, Users, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { careTeamApi, LinkedChild } from "@/lib/careTeamApi";
import { useChildEmotionWatch } from "@/hooks/useChildEmotionWatch";
import { useNavigate } from "react-router-dom";

const EMOTION_CONFIG = {
  Calm:        { emoji: "😌", label: "Calm",        bg: "from-green-100 to-emerald-100",  text: "text-green-900",  bar: "bg-green-400",  actions: ["✅ Continue current activity", "🎵 Keep ambient music low"] },
  Happy:       { emoji: "😊", label: "Happy",       bg: "from-yellow-100 to-amber-100",   text: "text-yellow-900", bar: "bg-yellow-400", actions: ["🎉 Encourage play", "🗣️ Engage in conversation"] },
  Distressed:  { emoji: "😰", label: "Distressed",  bg: "from-orange-100 to-amber-100",   text: "text-orange-900", bar: "bg-orange-400", actions: ["💡 Dim the lights", "🎧 Offer calming sounds", "🛋️ Guide to quiet space"] },
  Overwhelmed: { emoji: "🤯", label: "Overwhelmed", bg: "from-red-100 to-rose-100",        text: "text-red-900",    bar: "bg-red-500",    actions: ["🚨 Activate Sanctuary Mode", "🔇 Reduce all noise", "🤝 Offer physical comfort"] },
  Unknown:     { emoji: "🌫️", label: "Detecting…",  bg: "from-gray-100 to-slate-100",     text: "text-gray-900",   bar: "bg-gray-400",   actions: [] },
};

const LiveEmotion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [selectedChild, setSelectedChild] = useState<LinkedChild | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<{ emotion: string; time: string }[]>([]);
  const lastEmotionRef = useRef<string>("");

  const { packet, status: wsStatus } = useChildEmotionWatch(selectedChild?.id ?? null);

  const emotion = packet?.state || "Unknown";
  const confidence = packet?.confidence || 0;
  const probs = packet?.probs || { Calm: 0, Happy: 0, Distressed: 0, Overwhelmed: 0 };
  const isLive = wsStatus === "connected" && packet?.type === "live";
  const isCrisis = emotion === "Overwhelmed" && confidence > 0.5;
  const cfg = EMOTION_CONFIG[emotion as keyof typeof EMOTION_CONFIG] ?? EMOTION_CONFIG.Unknown;

  const historyColors: Record<string, string> = {
    Calm: "bg-green-200 border-green-400", Happy: "bg-yellow-200 border-yellow-400",
    Distressed: "bg-orange-200 border-orange-400", Overwhelmed: "bg-red-200 border-red-400",
    Unknown: "bg-gray-200 border-gray-300",
  };

  useEffect(() => {
    if (!user) return;
    careTeamApi.getMyChildren(user.uid)
      .then(data => { setChildren(data); if (data.length > 0) setSelectedChild(data[0]); })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (emotion !== "Unknown" && emotion !== lastEmotionRef.current) {
      lastEmotionRef.current = emotion;
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setTimeline(prev => [{ emotion, time: now }, ...prev].slice(0, 8));
    }
  }, [emotion]);

  if (loading) return (
    <CaregiverShell fullWidth>
      <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
    </CaregiverShell>
  );

  if (children.length === 0) return (
    <CaregiverShell fullWidth>
      <div className="calm-card p-12 text-center border-4 border-foreground shadow-pop max-w-lg mx-auto mt-10">
        <Users className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-black mb-2">Not linked to a child</h2>
        <p className="text-muted-foreground font-bold">Ask the parent to invite you to their child's care team.</p>
      </div>
    </CaregiverShell>
  );

  return (
    <CaregiverShell fullWidth>
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
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-black text-sm justify-center border-2 ${
              wsStatus === "connected" ? "bg-green-100 border-green-400 text-green-800" : "bg-amber-100 border-amber-400 text-amber-800"
            }`}>
              {wsStatus === "connected" ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isLive ? "🔴 Live" : packet ? "📊 Last Known" : "Waiting…"}
            </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="w-14 h-14 rounded-full bg-blue-100 border-4 border-foreground shadow-pop-sm flex items-center justify-center text-xl font-black text-blue-900 shrink-0">
                {selectedChild?.name?.charAt(0) || "👦"}
              </div>
              <div>
                <h2 className="text-lg font-black">{selectedChild?.name}</h2>
                <p className="text-xs font-bold text-muted-foreground">
                  {packet?.logged_at ? `Last: ${new Date(packet.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "No data yet"}
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
            {(["Calm", "Happy", "Distressed", "Overwhelmed"] as const).map(key => {
              const pct = Math.round((probs[key] || 0) * 100);
              const c = EMOTION_CONFIG[key];
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs font-bold mb-0.5"><span>{c.emoji} {c.label}</span><span>{pct}%</span></div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${c.bar}`} style={{ width: `${pct}%` }} />
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

          <div className={`calm-card bg-gradient-to-br ${cfg.bg} border-4 border-foreground shadow-pop-xl p-8 lg:p-12 flex flex-col items-center text-center`}>
            <div className={`inline-flex items-center gap-2 bg-white/90 border-4 border-foreground shadow-pop px-5 py-1.5 rounded-full font-black uppercase tracking-widest ${cfg.text} mb-6 text-xs`}>
              {isLive ? "🟢 Live" : "📊 Last Known"} · {cfg.label}
            </div>
            <div className="text-[100px] leading-none drop-shadow-2xl mb-4 transition-all duration-500">{cfg.emoji}</div>
            <h1 className={`text-5xl font-black ${cfg.text} tracking-tight mb-2`}>{cfg.label}</h1>
            <p className={`text-sm font-bold ${cfg.text} opacity-70`}>{Math.round(confidence * 100)}% confidence</p>
          </div>

          {cfg.actions.length > 0 && (
            <div className="calm-card bg-blue-50 border-4 border-foreground shadow-pop-lg p-6">
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
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No transitions yet</p>
            ) : (
              <div className="space-y-3">
                {timeline.map((h, i) => {
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
              className="w-full flex items-center justify-between bg-purple-100 hover:bg-purple-200 border-4 border-foreground shadow-pop hover:-translate-y-1 transition-all rounded-2xl p-4">
              <span className="font-black text-purple-900">💬 Notify Parent</span>
            </button>
            <button onClick={() => navigate("/caregiver/crisis-alerts")}
              className="w-full flex items-center justify-between bg-red-100 hover:bg-red-200 border-4 border-foreground shadow-pop hover:-translate-y-1 transition-all rounded-2xl p-4">
              <span className="font-black text-red-900">🚨 View Crisis Log</span>
            </button>
          </div>
        </div>
      </div>
    </CaregiverShell>
  );
};

export default LiveEmotion;
