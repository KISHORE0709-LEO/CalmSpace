import { useEffect, useRef, useState } from "react";
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

const summaryItems = [
  { dot: "bg-green-400", label: "Big win", text: "Made it through music class without overwhelm.", emoji: "🏆" },
  { dot: "bg-yellow-400", label: "Watch out", text: "Wednesday afternoons feel hardest — try a quiet break.", emoji: "⚠️" },
  { dot: "bg-primary",   label: "Pattern", text: "Calmer after morning walks and box breathing.", emoji: "📊" },
  { dot: "bg-accent",    label: "Suggestion", text: "Add an extra check-in before homework time.", emoji: "💡" },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function AnimatedBar({ height, delay, color }: { height: number; delay: number; color: string }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className={`w-full rounded-t-lg ${color} transition-all duration-700`}
      style={{ height: inView ? `${height}%` : "0%", transitionDelay: `${delay}ms` }} />
  );
}

const Caregiver = () => {
  const { ref: statsRef, inView: statsInView } = useInView(0.2);

  return (
    <AppShell title="Caregiver View" subtitle="A gentle window into the week.">

      {/* stat cards */}
      <div ref={statsRef} className="grid lg:grid-cols-4 gap-5 mb-5">
        {[
          { icon: Smile,     l: "Calm moments",  v: "68%", t: "+12% vs last week", color: "bg-primary text-primary-foreground", emoji: "😊", delay: 0 },
          { icon: Heart,     l: "Check-ins done", v: "21",  t: "of 21 days",        color: "bg-secondary text-secondary-foreground", emoji: "💛", delay: 100 },
          { icon: Clock,     l: "Avg recovery",  v: "4m",  t: "after overwhelm",   color: "bg-accent text-accent-foreground", emoji: "⏱️", delay: 200 },
          { icon: TrendingUp,l: "Mood trend",    v: "↑",   t: "Trending positive", color: "bg-primary text-primary-foreground", emoji: "📈", delay: 300 },
        ].map((s) => (
          <div
            key={s.l}
            className={`calm-card group hover:-translate-y-2 hover:shadow-pop-lg transition-all duration-300 relative overflow-hidden ${s.color}`}
            style={{ opacity: statsInView ? 1 : 0, transform: statsInView ? "translateY(0)" : "translateY(30px)", transition: `opacity 0.6s ease ${s.delay}ms, transform 0.6s ease ${s.delay}ms` }}
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-background/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-background/20 border-2 border-foreground flex items-center justify-center shadow-pop-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-2xl group-hover:animate-bounce-slow">{s.emoji}</span>
            </div>
            <div className="text-3xl font-black mb-1">{s.v}</div>
            <div className="text-sm font-black tracking-tight">{s.l}</div>
            <div className="text-xs opacity-70 mt-1">{s.t}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">

        {/* chart */}
        <div className="lg:col-span-2 calm-card relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse-soft pointer-events-none" />
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="text-lg font-black tracking-tight">Emotion timeline</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary" /> Calm</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-accent" /> Worry</span>
            </div>
          </div>
          <div className="h-64 flex items-end gap-3 relative z-10">
            {data.map((d, i) => (
              <div key={d.d} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center justify-end gap-1 h-full">
                  <AnimatedBar height={(d.calm / 100) * 100} delay={i * 80} color="bg-primary" />
                  <AnimatedBar height={(d.worry / 100) * 30} delay={i * 80 + 40} color="bg-accent" />
                </div>
                <span className="text-xs text-muted-foreground">{d.d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* summary */}
        <div className="calm-card relative overflow-hidden">
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-secondary/20 rounded-full blur-2xl animate-pulse-soft pointer-events-none" />
          <h2 className="text-lg font-black tracking-tight mb-4 relative z-10">Weekly summary</h2>
          <ul className="space-y-4 text-sm relative z-10">
            {summaryItems.map((item, i) => (
              <li
                key={item.label}
                className="flex gap-3 group hover:bg-accent/30 rounded-xl p-2 transition-all cursor-default"
                style={{ animation: `fade-up 0.5s ease ${i * 100}ms forwards`, opacity: 0 }}
              >
                <span className="text-xl flex-shrink-0 group-hover:animate-wiggle">{item.emoji}</span>
                <span><b>{item.label}:</b> {item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
};

export default Caregiver;
