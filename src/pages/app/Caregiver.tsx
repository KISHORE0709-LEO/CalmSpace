import { TrendingUp, Smile, Clock, Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const data = [
  { d: "Mon", calm: 60, worry: 20 },
  { d: "Tue", calm: 70, worry: 15 },
  { d: "Wed", calm: 55, worry: 35 },
  { d: "Thu", calm: 75, worry: 10 },
  { d: "Fri", calm: 82, worry: 8 },
  { d: "Sat", calm: 68, worry: 22 },
  { d: "Sun", calm: 78, worry: 12 },
];

const Caregiver = () => {
  const max = 100;
  return (
    <AppShell title="Caregiver View" subtitle="A gentle window into the week.">
      <div className="grid lg:grid-cols-4 gap-5 mb-5">
        {[
          { icon: Smile, l: "Calm moments", v: "68%", t: "+12% vs last week", color: "text-primary bg-primary-soft" },
          { icon: Heart, l: "Check-ins done", v: "21", t: "of 21 days", color: "text-accent-foreground bg-accent-soft" },
          { icon: Clock, l: "Avg recovery", v: "4m", t: "after overwhelm", color: "text-primary bg-primary-soft" },
          { icon: TrendingUp, l: "Mood trend", v: "↑", t: "Trending positive", color: "text-accent-foreground bg-accent-soft" },
        ].map((s) => (
          <div key={s.l} className="calm-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold mb-1">{s.v}</div>
            <div className="text-sm font-medium">{s.l}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.t}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 calm-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg">Emotion timeline</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Calm</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> Worry</span>
            </div>
          </div>
          <div className="h-64 flex items-end gap-3">
            {data.map((d) => (
              <div key={d.d} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end gap-1 h-full">
                  <div className="w-full rounded-t-lg bg-primary-soft relative" style={{ height: `${(d.calm / max) * 100}%` }}>
                    <div className="absolute inset-x-0 bottom-0 rounded-t-lg bg-primary" style={{ height: "60%" }} />
                  </div>
                  <div className="w-full rounded-t bg-accent" style={{ height: `${(d.worry / max) * 30}%` }} />
                </div>
                <span className="text-xs text-muted-foreground">{d.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="calm-card">
          <h2 className="text-lg mb-4">Weekly summary</h2>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-success mt-1.5 shrink-0" />
              <span><b>Big win:</b> Made it through music class without overwhelm.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-warning mt-1.5 shrink-0" />
              <span><b>Watch out:</b> Wednesday afternoons feel hardest — try a quiet break.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
              <span><b>Pattern:</b> Calmer after morning walks and box breathing.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
              <span><b>Suggestion:</b> Add an extra check-in before homework time.</span>
            </li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
};

export default Caregiver;
