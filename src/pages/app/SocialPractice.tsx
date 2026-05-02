import { useState } from "react";
import { Check, Users, Star, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

const scenario = {
  title: "Meeting a new classmate",
  description: "A new student says hi to you in the hallway. What do you do?",
  options: [
    { id: "a", text: "Smile and say hi back",  correct: true,  fb: "Wonderful! A small smile is a kind welcome. 😊", emoji: "😊" },
    { id: "b", text: "Walk past quietly",       correct: false, fb: "That's okay too — but a small wave can feel friendly. 👋", emoji: "🚶" },
    { id: "c", text: "Ask their name",          correct: true,  fb: "Great choice! Curiosity builds friendship. 🌟", emoji: "🤝" },
  ],
};

const floatingStars = ["⭐", "🌟", "✨", "💫"];

const SocialPractice = () => {
  const [picked, setPicked] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const selected = scenario.options.find((o) => o.id === picked);

  const handlePick = (id: string) => {
    setPicked(id);
    const opt = scenario.options.find((o) => o.id === id);
    if (opt?.correct) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
  };

  return (
    <AppShell title="Social Practice" subtitle="Safe scenarios to build everyday confidence.">

      {/* confetti burst */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="relative">
            {floatingStars.map((s, i) => (
              <span
                key={i}
                className="absolute text-4xl animate-scale-in"
                style={{ top: `${-60 + (i % 2) * 120}px`, left: `${-80 + i * 50}px`, animationDelay: `${i * 0.1}s` }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">

        {/* scenario card */}
        <div className="lg:col-span-2 calm-card relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse-soft pointer-events-none" />
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3 relative z-10">
            <Users className="w-4 h-4" /> Scenario 3 of 12
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2 relative z-10">{scenario.title}</h2>
          <p className="text-muted-foreground mb-6 relative z-10">{scenario.description}</p>

          <div className="space-y-3 relative z-10">
            {scenario.options.map((o) => {
              const isPicked = picked === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => handlePick(o.id)}
                  className={`w-full text-left p-4 rounded-[1rem] border-2 border-foreground transition-all duration-200 flex items-center gap-3 group ${
                    isPicked
                      ? "bg-primary text-primary-foreground shadow-pop-lg -translate-y-1 scale-[1.02]"
                      : "bg-card hover:bg-accent shadow-pop hover:-translate-y-[2px] hover:shadow-pop-lg"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-foreground transition-all ${
                    isPicked ? "bg-primary-foreground text-primary scale-110" : "bg-muted"
                  }`}>
                    {isPicked ? <Check className="w-4 h-4" /> : <span className="text-sm font-black">{o.id.toUpperCase()}</span>}
                  </div>
                  <span className="text-sm font-medium flex-1">{o.text}</span>
                  <span className={`text-xl transition-all ${isPicked ? "animate-bounce-slow" : "group-hover:animate-wiggle opacity-50"}`}>{o.emoji}</span>
                </button>
              );
            })}
          </div>

          {selected && (
            <div
              className={`mt-6 p-5 rounded-[1rem] border-2 border-foreground shadow-pop ${selected.correct ? "bg-secondary" : "bg-accent"}`}
              style={{ animation: "fade-up 0.4s ease forwards" }}
            >
              <p className="font-black mb-1">{selected.correct ? "Lovely choice ✨" : "Good try 💛"}</p>
              <p className="text-sm text-muted-foreground">{selected.fb}</p>
              <Button className="mt-4 rounded-full hover:scale-105 transition-transform" onClick={() => setPicked(null)}>
                Next scenario <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* sidebar */}
        <div className="space-y-5">
          <div className="calm-card relative overflow-hidden">
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse-soft pointer-events-none" />
            <h3 className="font-black tracking-tight mb-4 relative z-10">Your progress</h3>
            <div className="flex items-baseline gap-2 mb-3 relative z-10">
              <span className="text-4xl font-black text-primary">25%</span>
              <span className="text-sm text-muted-foreground">complete</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden relative z-10 border-2 border-foreground">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000"
                style={{ width: "25%", animation: "none" }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2 relative z-10">
              <span>3 done</span><span>12 total</span>
            </div>
          </div>

          <div className="calm-card bg-secondary border-2 border-foreground relative overflow-hidden">
            <div className="absolute top-2 right-3 text-2xl animate-bounce-slow">🏅</div>
            <h3 className="font-black tracking-tight mb-2">Today's badge</h3>
            <p className="text-sm text-muted-foreground">Kind Greeter — practiced 3 friendly hellos!</p>
            <div className="flex gap-1 mt-3">
              {[1,2,3].map((i) => <Star key={i} className="w-4 h-4 fill-foreground text-foreground animate-pulse-soft" style={{ animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>

          <div className="calm-card relative overflow-hidden">
            <h3 className="font-black tracking-tight mb-3">Upcoming scenarios</h3>
            <ul className="space-y-2">
              {["Joining a group game 🎮", "Asking for help 🙋", "Saying goodbye 👋"].map((s, i) => (
                <li key={s} className="text-sm text-muted-foreground flex items-center gap-2 hover:text-foreground transition-colors cursor-default group">
                  <span className="w-5 h-5 rounded-full bg-muted border border-foreground flex items-center justify-center text-xs font-black group-hover:bg-primary group-hover:text-primary-foreground transition-all">{i + 4}</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default SocialPractice;
