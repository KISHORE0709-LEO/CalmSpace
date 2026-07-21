import { useState, useEffect } from "react";
import { Heart, Sun, Wind, Music, Lightbulb, Activity } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const moods = [
  { emoji: "😊", label: "Happy",       color: "bg-secondary" },
  { emoji: "😌", label: "Calm",        color: "bg-primary" },
  { emoji: "😟", label: "Worried",     color: "bg-accent" },
  { emoji: "😢", label: "Sad",         color: "bg-primary" },
  { emoji: "😣", label: "Overwhelmed", color: "bg-accent" },
  { emoji: "😡", label: "Frustrated",  color: "bg-secondary" },
];

const moodMessages: Record<string, string> = {
  Happy:       "You're feeling happy! That's wonderful. Let's keep that joy going 🌟",
  Calm:        "You're feeling calm. Take a slow breath. You're safe here, and we'll move at your pace.",
  Worried:     "Feeling worried is okay. Let's take it one small step at a time. You've got this 💙",
  Sad:         "It's okay to feel sad. Your feelings are valid. Mitra is here to listen 🌸",
  Overwhelmed: "Feeling overwhelmed? Let's slow down together. One breath at a time 🌬️",
  Frustrated:  "Frustration is a big feeling. Let's find a way to release it gently 💛",
};

const suggestions = [
  { icon: Lightbulb, t: "Dim the lights",  d: "Soften brightness by 40%",  emoji: "💡" },
  { icon: Music,     t: "Calming sounds",  d: "Rain & soft piano",          emoji: "🎵" },
  { icon: Wind,      t: "Box breathing",   d: "4-4-4-4 for 2 minutes",      emoji: "🌬️" },
  { icon: Sun,       t: "Quiet corner",    d: "Take a 10-min break",        emoji: "☀️" },
];

const heartRateBars = [40, 55, 48, 62, 50, 70, 58, 65, 52, 60, 55, 50];

const Feelings = () => {
  const [mood, setMood] = useState("Calm");
  const [animKey, setAnimKey] = useState(0);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);

  const handleMoodSelect = (label: string) => {
    setMood(label);
    setAnimKey((k) => k + 1);
  };

  return (
    <AppShell title="Feelings & Comfort" subtitle="How are you feeling right now? Tap what fits.">
      <div className="grid lg:grid-cols-3 gap-5">

        {/* mood picker */}
        <div className="lg:col-span-2 calm-card relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse-soft pointer-events-none" />
          <h2 className="text-lg font-black tracking-tight mb-4 relative z-10">Choose a feeling</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 relative z-10">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => handleMoodSelect(m.label)}
                className={`flex flex-col items-center gap-2 p-4 rounded-[1rem] border-2 border-foreground transition-all duration-200 group ${
                  mood === m.label
                    ? "bg-primary text-primary-foreground shadow-pop-lg -translate-y-1 scale-105"
                    : "bg-background hover:bg-accent shadow-pop hover:shadow-pop-lg hover:-translate-y-1"
                }`}
              >
                <span className={`text-3xl transition-transform duration-200 ${mood === m.label ? "animate-bounce-slow" : "group-hover:scale-125"}`}>
                  {m.emoji}
                </span>
                <span className="text-xs font-bold">{m.label}</span>
              </button>
            ))}
          </div>

          {/* response message */}
          <div
            key={animKey}
            className="mt-6 p-5 rounded-2xl bg-accent border-2 border-foreground shadow-pop"
            style={{ animation: "fade-up 0.5s ease forwards" }}
          >
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-0.5 animate-pulse-soft flex-shrink-0" fill="currentColor" />
              <div>
                <p className="font-black mb-1">You're feeling {mood.toLowerCase()}.</p>
                <p className="text-sm text-muted-foreground">{moodMessages[mood]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* heart rate */}
        <div className="calm-card relative overflow-hidden">
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-secondary/20 rounded-full blur-2xl animate-pulse-soft pointer-events-none" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h2 className="text-lg font-black tracking-tight">Heart rate</h2>
            <Activity className="w-4 h-4 text-primary animate-pulse-soft" />
          </div>
          <div className="text-center py-4 relative z-10">
            <div className="text-5xl font-black text-primary animate-pulse-soft">82</div>
            <div className="text-xs text-muted-foreground mt-1">bpm — gentle</div>
          </div>
          <div className="h-20 flex items-end gap-1 relative z-10">
            {heartRateBars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary transition-all duration-500 hover:bg-secondary"
                style={{ height: `${h}%`, animationDelay: `${i * 0.1}s`, animation: `pulse-soft ${1.5 + (i % 3) * 0.3}s ease-in-out infinite` }}
              />
            ))}
          </div>
        </div>

        {/* suggestions */}
        <div className="calm-card lg:col-span-3 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/30 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
          <h2 className="text-lg font-black tracking-tight mb-4 relative z-10">Suggested adjustments</h2>
          <div className="grid md:grid-cols-4 gap-4 relative z-10">
            {suggestions.map((s) => (
              <button
                key={s.t}
                onClick={() => setActiveSuggestion(activeSuggestion === s.t ? null : s.t)}
                className={`text-left p-4 rounded-[1rem] border-2 border-foreground transition-all group ${
                  activeSuggestion === s.t
                    ? "bg-primary text-primary-foreground shadow-pop-lg -translate-y-1"
                    : "bg-background shadow-pop hover:shadow-pop-lg hover:-translate-y-[2px] hover:bg-accent"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <s.icon className={`w-5 h-5 ${activeSuggestion === s.t ? "text-primary-foreground" : "text-primary"} group-hover:scale-110 transition-transform`} />
                  <span className={`text-xl group-hover:animate-wiggle ${activeSuggestion === s.t ? "animate-bounce-slow" : ""}`}>{s.emoji}</span>
                </div>
                <div className="font-black text-sm">{s.t}</div>
                <div className={`text-xs mt-0.5 ${activeSuggestion === s.t ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{s.d}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Feelings;
