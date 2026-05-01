import { useState } from "react";
import { Heart, Sun, Wind, Music, Lightbulb, Activity } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const moods = [
  { emoji: "😊", label: "Happy", color: "bg-accent-soft" },
  { emoji: "😌", label: "Calm", color: "bg-primary-soft" },
  { emoji: "😟", label: "Worried", color: "bg-accent-soft" },
  { emoji: "😢", label: "Sad", color: "bg-primary-soft" },
  { emoji: "😣", label: "Overwhelmed", color: "bg-accent-soft" },
  { emoji: "😡", label: "Frustrated", color: "bg-primary-soft" },
];

const Feelings = () => {
  const [mood, setMood] = useState("Calm");
  return (
    <AppShell title="Feelings & Comfort" subtitle="How are you feeling right now? Tap what fits.">
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 calm-card">
          <h2 className="text-lg mb-4">Choose a feeling</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => setMood(m.label)}
                className={`flex flex-col items-center gap-2 p-4 rounded-[1rem] border-2 border-foreground transition-all duration-200 ${
                  mood === m.label
                    ? "bg-primary text-primary-foreground shadow-pop-lg -translate-y-1"
                    : "bg-background hover:bg-accent shadow-pop hover:shadow-pop-lg hover:-translate-y-1"
                }`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-xs font-medium">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 p-5 rounded-2xl bg-gradient-warm">
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-primary mt-0.5" fill="currentColor" />
              <div>
                <p className="font-medium mb-1">You're feeling {mood.toLowerCase()}.</p>
                <p className="text-sm text-muted-foreground">
                  That's okay. Take a slow breath. You're safe here, and we'll move at your pace.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="calm-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">Heart rate</h2>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="text-center py-4">
            <div className="text-5xl font-bold text-primary">82</div>
            <div className="text-xs text-muted-foreground mt-1">bpm — gentle</div>
          </div>
          <div className="h-20 flex items-end gap-1">
            {[40, 55, 48, 62, 50, 70, 58, 65, 52, 60, 55, 50].map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-primary-soft" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="calm-card lg:col-span-3">
          <h2 className="text-lg mb-4">Suggested adjustments</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: Lightbulb, t: "Dim the lights", d: "Soften brightness by 40%" },
              { icon: Music, t: "Calming sounds", d: "Rain & soft piano" },
              { icon: Wind, t: "Box breathing", d: "4-4-4-4 for 2 minutes" },
              { icon: Sun, t: "Quiet corner", d: "Take a 10-min break" },
            ].map((s) => (
              <button key={s.t} className="text-left p-4 rounded-[1rem] bg-background border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-[2px] transition-all">
                <s.icon className="w-5 h-5 text-primary mb-2" />
                <div className="font-bold text-sm text-foreground">{s.t}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.d}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Feelings;
