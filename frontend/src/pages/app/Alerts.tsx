import { useState } from "react";
import { AlertTriangle, Clock, Lightbulb, Shield, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const alerts = [
  {
    level: "Medium", color: "bg-secondary text-secondary-foreground", dot: "bg-yellow-400",
    when: "Today, 3:45 PM", emoji: "⚠️",
    reason: "Pattern detected: noisy environments + low sleep often lead to overwhelm.",
    suggestions: ["Plan a quiet break at 3:30", "Bring noise-cancelling headphones", "Offer a calming snack"],
  },
  {
    level: "Low", color: "bg-primary text-primary-foreground", dot: "bg-green-400",
    when: "Tomorrow morning", emoji: "💙",
    reason: "School routine change. Mornings have been steady this week.",
    suggestions: ["Review tomorrow's schedule together", "Lay out clothes the night before"],
  },
];

const Alerts = () => {
  const [dismissed, setDismissed] = useState<number[]>([]);

  return (
    <AppShell title="Alerts" subtitle="Gentle nudges to prepare for harder moments.">

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* all clear banner */}
        <div className="calm-card lg:col-span-2 bg-accent relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse-soft pointer-events-none" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-card border-2 border-foreground flex items-center justify-center shrink-0 shadow-pop-sm animate-pulse-soft">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight mb-1">All clear for now ✨</h2>
              <p className="text-sm text-muted-foreground">No high-risk moments expected in the next few hours. We'll let you know if that changes.</p>
            </div>
          </div>
        </div>

        {/* active count */}
        <div className="calm-card relative overflow-hidden">
          <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-secondary/20 rounded-full blur-xl animate-pulse-soft pointer-events-none" />
          <div className="text-xs text-muted-foreground mb-1 relative z-10">Active alerts</div>
          <div className="text-5xl font-black text-primary animate-pulse-soft relative z-10">
            {alerts.length - dismissed.length}
          </div>
          <div className="text-xs text-muted-foreground mt-1 relative z-10">in next 24h</div>
          <div className="flex gap-1 mt-3 relative z-10">
            {alerts.map((_, i) => (
              <span key={i} className={`w-3 h-3 rounded-full border-2 border-foreground ${dismissed.includes(i) ? "bg-muted" : "bg-primary animate-pulse"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map((a, i) => (
          dismissed.includes(i) ? null : (
            <div
              key={i}
              className={`calm-card ${a.color} relative overflow-hidden`}
              style={{ animation: `fade-up 0.5s ease ${i * 150}ms forwards` }}
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-background/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-wrap items-start justify-between gap-4 mb-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[1rem] bg-background border-2 border-foreground shadow-pop-sm flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 animate-pulse-soft" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${a.dot} animate-pulse`} />
                      <span className="font-black">{a.level} risk</span>
                      <span className="text-xl animate-bounce-slow">{a.emoji}</span>
                    </div>
                    <div className="text-xs flex items-center gap-1 opacity-70">
                      <Clock className="w-3 h-3" /> {a.when}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDismissed([...dismissed, i])}
                  className="flex items-center gap-1.5 text-xs font-black bg-background/20 hover:bg-background/40 border-2 border-foreground rounded-full px-3 py-1.5 transition-all hover:-translate-y-0.5 shadow-pop-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Dismiss
                </button>
              </div>

              <div className="bg-background rounded-[1rem] p-4 mb-4 border-2 border-foreground shadow-pop-sm relative z-10">
                <p className="text-sm text-foreground"><b>Why:</b> {a.reason}</p>
              </div>

              <div className="bg-background rounded-[1rem] p-4 border-2 border-foreground shadow-pop-sm relative z-10">
                <div className="flex items-center gap-2 mb-3 text-sm font-black">
                  <Lightbulb className="w-4 h-4 text-primary animate-pulse-soft" /> Suggestions
                </div>
                <ul className="space-y-2">
                  {a.suggestions.map((s, j) => (
                    <li
                      key={s}
                      className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group cursor-default"
                      style={{ animation: `fade-up 0.4s ease ${j * 80}ms forwards`, opacity: 0 }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        ))}

        {dismissed.length === alerts.length && (
          <div className="calm-card text-center py-12 relative overflow-hidden" style={{ animation: "scale-in 0.5s ease forwards" }}>
            <div className="flex justify-center gap-3 mb-4">
              {["🎉","✨","💙","🌸"].map((e, i) => (
                <span key={i} className="text-3xl animate-bounce-slow" style={{ animationDelay: `${i * 0.15}s` }}>{e}</span>
              ))}
            </div>
            <h3 className="text-xl font-black mb-2">All alerts dismissed!</h3>
            <p className="text-muted-foreground text-sm">You're all caught up. Have a calm and joyful day 💛</p>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Alerts;
