import { ParentShell } from "@/components/ParentShell";
import { Lightbulb, ShieldCheck, History, Loader2, Users, Wifi, WifiOff, Camera, CameraOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { careTeamApi, LinkedChild } from "@/lib/careTeamApi";
import { useChildEmotionWatch } from "@/hooks/useChildEmotionWatch";

const EMOTION_CONFIG = {
  Calm:        { emoji: "😌", label: "Calm",        bg: "from-green-100 to-emerald-100",  text: "text-green-900",  bar: "bg-green-400",  actions: ["✅ Continue current activity", "🎵 Keep ambient music low", "💡 Maintain current lighting"] },
  Happy:       { emoji: "😊", label: "Happy",       bg: "from-yellow-100 to-amber-100",   text: "text-yellow-900", bar: "bg-yellow-400", actions: ["🎉 Encourage play or sharing", "🎨 Offer creative activities", "🗣️ Engage in conversation"] },
  Distressed:  { emoji: "😰", label: "Distressed",  bg: "from-orange-100 to-amber-100",   text: "text-orange-900", bar: "bg-orange-400", actions: ["💡 Dim the lights", "🎧 Offer calming sounds", "🛋️ Guide to a quiet space"] },
  Overwhelmed: { emoji: "🤯", label: "Overwhelmed", bg: "from-red-100 to-rose-100",        text: "text-red-900",    bar: "bg-red-500",    actions: ["🚨 Activate Sanctuary Mode", "🔇 Reduce all noise", "🤝 Offer physical comfort"] },
  Unknown:     { emoji: "🌫️", label: "Detecting…",  bg: "from-gray-100 to-slate-100",     text: "text-gray-900",   bar: "bg-gray-400",   actions: [] },
};

const MAX_HISTORY = 12;

const LiveEmotion = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [selectedChild, setSelectedChild] = useState<LinkedChild | null>(null);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [timeline, setTimeline] = useState<{ emotion: string; conf: number; time: string; ts: number }[]>([]);
  const lastEmotionRef = useRef<string>("");

  const { packet, status: wsStatus } = useChildEmotionWatch(selectedChild?.id ?? null);

  const emotion = packet?.state || "Unknown";
  const confidence = packet?.confidence || 0;
  const probs = packet?.probs || { Calm: 0, Happy: 0, Distressed: 0, Overwhelmed: 0 };
  const isLive = wsStatus === "connected" && packet?.type === "live";
  const cfg = EMOTION_CONFIG[emotion as keyof typeof EMOTION_CONFIG] ?? EMOTION_CONFIG.Unknown;

  useEffect(() => {
    if (!user) return;
    careTeamApi.getMyChildren(user.uid)
      .then(data => { setChildren(data); if (data.length > 0) setSelectedChild(data[0]); })
      .finally(() => setLoadingChildren(false));
  }, [user]);

  useEffect(() => {
    if (emotion !== "Unknown" && emotion !== lastEmotionRef.current) {
      lastEmotionRef.current = emotion;
      const now = new Date();
      setTimeline(prev => [{
        emotion, conf: confidence,
        time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        ts: now.getTime(),
      }, ...prev].slice(0, MAX_HISTORY));
    }
  }, [emotion, confidence]);

  if (loadingChildren) return (
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
      <div className="w-full max-w-[1800px] mx-auto px-4 pb-12 animate-fade-up">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Live Emotion</h1>
            <p className="text-muted-foreground font-bold mt-1">Real-time monitoring for {selectedChild?.name}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-black text-sm self-start ${
            wsStatus === "connected" ? "bg-green-50 border-green-400 text-green-800"
            : wsStatus === "connecting" ? "bg-amber-50 border-amber-400 text-amber-800"
            : "bg-red-50 border-red-300 text-red-700"
          }`}>
            {wsStatus === "connected" ? <Wifi className="w-3.5 h-3.5 text-green-500" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
            {wsStatus === "connected" ? "Live Connected" : wsStatus === "connecting" ? "Connecting…" : "Reconnecting…"}
          </div>
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

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* LEFT */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <div className="calm-card border-4 border-foreground shadow-pop p-5">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl font-black text-sm border-2 mb-4 ${
                isLive ? "bg-green-100 border-green-400 text-green-800"
                : packet ? "bg-amber-100 border-amber-400 text-amber-800"
                : "bg-gray-100 border-gray-300 text-gray-600"
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-amber-400"}`} />
                {isLive ? "🔴 Live Stream Active" : packet ? "📊 Last Known State" : "Waiting for child…"}
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 border-4 border-foreground flex items-center justify-center text-xl font-black text-primary shrink-0">
                  {selectedChild?.name?.charAt(0) || "👦"}
                </div>
                <div>
                  <p className="font-black">{selectedChild?.name}</p>
                  <p className="text-xs text-muted-foreground font-bold">
                    {packet?.logged_at ? `Last: ${new Date(packet.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "No data yet"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground border-t-2 border-foreground/10 pt-3">
                {isLive ? <Camera className="w-4 h-4 text-green-500" /> : <CameraOff className="w-4 h-4 text-muted-foreground" />}
                {isLive ? "Child's camera active" : "Camera not streaming"}
              </div>
            </div>

            <div className="calm-card border-4 border-foreground shadow-pop p-5 flex flex-col gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Confidence
                  </span>
                  <span className="font-black text-primary text-lg">{Math.round(confidence * 100)}%</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden border-2 border-foreground/10">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.round(confidence * 100)}%` }} />
                </div>
              </div>
              <div className="border-t-2 border-foreground/10 pt-3 flex flex-col gap-3">
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Emotion Probabilities</p>
                {(["Calm", "Happy", "Distressed", "Overwhelmed"] as const).map(key => {
                  const pct = Math.round((probs[key] || 0) * 100);
                  const c = EMOTION_CONFIG[key];
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs font-bold mb-1"><span>{c.emoji} {c.label}</span><span className="font-black">{pct}%</span></div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden border border-foreground/10">
                        <div className={`h-full rounded-full transition-all duration-700 ${c.bar}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CENTER */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className={`calm-card bg-gradient-to-br ${cfg.bg} border-4 border-foreground shadow-pop-xl p-10 flex flex-col items-center text-center`}>
              <div className={`inline-flex items-center gap-2 bg-white/90 border-4 border-foreground shadow-pop px-5 py-1.5 rounded-full font-black uppercase tracking-widest ${cfg.text} mb-6 text-xs`}>
                {isLive ? "🟢 Live Detection" : "📊 Last Known"} · {cfg.label}
              </div>
              <div className="text-[100px] leading-none drop-shadow-2xl mb-4 transition-all duration-500">{cfg.emoji}</div>
              <h1 className={`text-5xl font-black ${cfg.text} tracking-tight mb-2`}>{cfg.label}</h1>
              <p className={`text-sm font-bold ${cfg.text} opacity-70`}>{Math.round(confidence * 100)}% confidence</p>
            </div>

            {cfg.actions.length > 0 && (
              <div className="calm-card bg-blue-50 border-4 border-foreground shadow-pop p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full border-2 border-blue-300 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-black text-blue-900">Suggested Actions</h3>
                </div>
                <ul className="space-y-2">
                  {cfg.actions.map((a, i) => (
                    <li key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border-2 border-blue-200 font-bold text-blue-900">{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {!packet && (
              <div className="calm-card border-4 border-foreground shadow-pop p-8 text-center bg-muted/30">
                <CameraOff className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="font-black text-muted-foreground">No emotion data yet.</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedChild?.name} needs to open the Feelings page with camera on.</p>
              </div>
            )}
          </div>

          {/* RIGHT — Timeline */}
          <div className="lg:col-span-3">
            <div className="calm-card border-4 border-foreground shadow-pop p-5">
              <h3 className="text-sm font-black flex items-center gap-2 mb-4 uppercase tracking-wider">
                <History className="w-4 h-4 text-primary" /> Emotion Timeline
              </h3>
              {timeline.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground font-bold">No transitions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Updates in real time as emotions change</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-foreground/10" />
                  <div className="space-y-3">
                    {timeline.map((h, i) => {
                      const hcfg = EMOTION_CONFIG[h.emotion as keyof typeof EMOTION_CONFIG] ?? EMOTION_CONFIG.Unknown;
                      return (
                        <div key={h.ts} className="flex items-start gap-3 pl-2">
                          <div className={`w-5 h-5 rounded-full border-4 border-foreground shrink-0 mt-0.5 z-10 ${
                            h.emotion === "Calm" ? "bg-green-400" : h.emotion === "Happy" ? "bg-yellow-400"
                            : h.emotion === "Distressed" ? "bg-orange-400" : h.emotion === "Overwhelmed" ? "bg-red-500" : "bg-gray-300"
                          } ${i === 0 ? "animate-pulse" : ""}`} />
                          <div className={`flex-1 p-2.5 rounded-xl border-2 ${
                            h.emotion === "Overwhelmed" ? "bg-red-50 border-red-300"
                            : h.emotion === "Distressed" ? "bg-orange-50 border-orange-200"
                            : "bg-background border-foreground/10"
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className="font-black text-sm">{hcfg.emoji} {hcfg.label}</span>
                              {i === 0 && <span className="text-[9px] font-black bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">NOW</span>}
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="text-xs text-muted-foreground font-bold">{h.time}</span>
                              <span className="text-xs font-bold text-muted-foreground">{Math.round(h.conf * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ParentShell>
  );
};

export default LiveEmotion;
