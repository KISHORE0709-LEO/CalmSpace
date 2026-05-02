import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const questions = [
  { q: "How did you sleep?",                  opts: ["😴 Great", "🙂 Okay", "😕 Not well"] },
  { q: "How does your body feel?",            opts: ["💪 Strong", "😌 Calm", "😣 Tense"] },
  { q: "Anything making you worried today?",  opts: ["☀️ No", "🤔 A little", "🌧️ Yes"] },
];

const celebrationEmojis = ["🎉", "⭐", "🌈", "💛", "✨", "🌸", "🎊", "💙"];

const CheckIns = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [animKey, setAnimKey] = useState(0);
  const done = step >= questions.length;

  const pick = (a: string) => {
    setAnswers([...answers, a]);
    setAnimKey((k) => k + 1);
    setStep(step + 1);
  };

  const progress = (step / questions.length) * 100;

  return (
    <AppShell title="Daily Check-in" subtitle="A few small questions. No wrong answers.">
      <div className="max-w-2xl mx-auto">
        <div className="calm-card relative overflow-hidden">
          {/* bg blob */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl animate-pulse-soft pointer-events-none" />

          {!done ? (
            <div key={animKey} style={{ animation: "fade-up 0.4s ease forwards" }} className="relative z-10">
              {/* progress */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-primary">Question {step + 1} of {questions.length}</span>
                <div className="flex gap-1.5">
                  {questions.map((_, i) => (
                    <span key={i} className={`h-2 rounded-full transition-all duration-500 ${i < step ? "bg-primary w-8" : i === step ? "bg-primary w-5 animate-pulse-soft" : "bg-muted w-5"}`} />
                  ))}
                </div>
              </div>

              {/* animated progress bar */}
              <div className="h-2 rounded-full bg-muted overflow-hidden mb-8 border border-foreground/20">
                <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>

              <h2 className="text-2xl font-black tracking-tight mb-8">{questions[step].q}</h2>

              <div className="grid sm:grid-cols-3 gap-3">
                {questions[step].opts.map((o, i) => (
                  <button
                    key={o}
                    onClick={() => pick(o)}
                    className="p-6 rounded-[1rem] border-2 border-foreground bg-background shadow-pop hover:shadow-pop-lg hover:-translate-y-2 hover:bg-accent transition-all text-lg font-bold group"
                    style={{ animation: `fade-up 0.4s ease ${i * 80}ms forwards`, opacity: 0 }}
                  >
                    <span className="block text-3xl mb-2 group-hover:animate-bounce-slow">{o.split(" ")[0]}</span>
                    <span className="text-sm">{o.split(" ").slice(1).join(" ")}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 relative z-10" style={{ animation: "scale-in 0.5s ease forwards" }}>
              {/* celebration emojis */}
              <div className="flex justify-center gap-2 mb-6 flex-wrap">
                {celebrationEmojis.map((e, i) => (
                  <span key={i} className="text-2xl animate-bounce-slow" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
                ))}
              </div>

              <div className="w-20 h-20 rounded-full bg-primary border-2 border-foreground flex items-center justify-center mx-auto mb-5 shadow-pop animate-pulse-soft">
                <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-black tracking-tight mb-2">All done — thank you 💛</h2>
              <p className="text-muted-foreground mb-6">Your answers help us care for you better.</p>

              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {answers.map((a, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 rounded-full bg-primary text-primary-foreground border-2 border-foreground text-sm font-bold shadow-pop-sm hover:-translate-y-1 transition-all cursor-default"
                    style={{ animation: `fade-up 0.4s ease ${i * 100}ms forwards`, opacity: 0 }}
                  >
                    {a}
                  </span>
                ))}
              </div>

              <button
                onClick={() => { setStep(0); setAnswers([]); setAnimKey((k) => k + 1); }}
                className="text-sm text-primary font-black underline-offset-4 hover:underline hover:scale-105 transition-all"
              >
                Start again ↺
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default CheckIns;
