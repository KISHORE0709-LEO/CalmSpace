import { AlertTriangle, Clock, Lightbulb, Shield } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const alerts = [
  {
    level: "Medium",
    color: "bg-accent text-foreground",
    dot: "bg-warning",
    when: "Today, 3:45 PM",
    reason: "Pattern detected: noisy environments + low sleep often lead to overwhelm.",
    suggestions: ["Plan a quiet break at 3:30", "Bring noise-cancelling headphones", "Offer a calming snack"],
  },
  {
    level: "Low",
    color: "bg-primary text-primary-foreground",
    dot: "bg-success",
    when: "Tomorrow morning",
    reason: "School routine change. Mornings have been steady this week.",
    suggestions: ["Review tomorrow's schedule together", "Lay out clothes the night before"],
  },
];

const Alerts = () => (
  <AppShell title="Alerts" subtitle="Gentle nudges to prepare for harder moments.">
    <div className="grid lg:grid-cols-3 gap-5 mb-5">
      <div className="calm-card lg:col-span-2 bg-accent">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight mb-1">All clear for now ✨</h2>
            <p className="text-sm text-muted-foreground">
              No high-risk moments expected in the next few hours. We'll let you know if that changes.
            </p>
          </div>
        </div>
      </div>
      <div className="calm-card">
        <div className="text-xs text-muted-foreground mb-1">Active alerts</div>
        <div className="text-4xl font-black text-primary">{alerts.length}</div>
        <div className="text-xs text-muted-foreground mt-1">in next 24h</div>
      </div>
    </div>

    <div className="space-y-4">
      {alerts.map((a, i) => (
        <div key={i} className={`calm-card ${a.color}`}>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[1rem] bg-background border-2 border-foreground shadow-pop-sm flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`w-2 h-2 rounded-full ${a.dot}`} />
                  <span className="font-black">{a.level} risk</span>
                </div>
                <div className="text-xs flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" /> {a.when}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background rounded-[1rem] p-4 mb-4 border-2 border-foreground shadow-pop-sm">
            <p className="text-sm text-foreground"><b>Why:</b> {a.reason}</p>
          </div>

          <div className="bg-background rounded-[1rem] p-4 border-2 border-foreground shadow-pop-sm">
            <div className="flex items-center gap-2 mb-3 text-sm font-black">
              <Lightbulb className="w-4 h-4 text-primary" /> Suggestions
            </div>
            <ul className="space-y-2">
              {a.suggestions.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  </AppShell>
);

export default Alerts;
