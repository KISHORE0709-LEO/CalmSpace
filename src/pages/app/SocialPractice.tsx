import { useState } from "react";
import { Check, Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

const scenario = {
  title: "Meeting a new classmate",
  description: "A new student says hi to you in the hallway. What do you do?",
  options: [
    { id: "a", text: "Smile and say hi back", correct: true, fb: "Wonderful! A small smile is a kind welcome." },
    { id: "b", text: "Walk past quietly", correct: false, fb: "That's okay too — but a small wave can feel friendly." },
    { id: "c", text: "Ask their name", correct: true, fb: "Great choice! Curiosity builds friendship." },
  ],
};

const SocialPractice = () => {
  const [picked, setPicked] = useState<string | null>(null);
  const selected = scenario.options.find((o) => o.id === picked);

  return (
    <AppShell title="Social Practice" subtitle="Safe scenarios to build everyday confidence.">
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 calm-card">
          <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
            <Users className="w-4 h-4" /> Scenario 3 of 12
          </div>
          <h2 className="text-2xl mb-2">{scenario.title}</h2>
          <p className="text-muted-foreground mb-6">{scenario.description}</p>

          <div className="space-y-3">
            {scenario.options.map((o) => {
              const isPicked = picked === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setPicked(o.id)}
                  className={`w-full text-left p-4 rounded-[1rem] border-2 border-foreground shadow-pop hover:-translate-y-[2px] transition-all flex items-center gap-3 ${
                    isPicked ? "bg-primary text-primary-foreground shadow-pop-lg" : "bg-card hover:bg-accent"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isPicked ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    {isPicked && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-sm font-medium">{o.text}</span>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="mt-6 p-5 rounded-[1rem] bg-accent border-2 border-foreground shadow-pop">
              <p className="font-medium mb-1">{selected.correct ? "Lovely choice ✨" : "Good try 💛"}</p>
              <p className="text-sm text-muted-foreground">{selected.fb}</p>
              <Button className="mt-4 rounded-full" onClick={() => setPicked(null)}>Next scenario</Button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="calm-card">
            <h3 className="font-semibold mb-4">Your progress</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-primary">25%</span>
              <span className="text-sm text-muted-foreground">complete</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-1/4 bg-primary rounded-full" />
            </div>
          </div>
          <div className="calm-card bg-accent-soft border-accent/20">
            <h3 className="font-semibold mb-2">Today's badge 🏅</h3>
            <p className="text-sm text-muted-foreground">Kind Greeter — practiced 3 friendly hellos!</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default SocialPractice;
