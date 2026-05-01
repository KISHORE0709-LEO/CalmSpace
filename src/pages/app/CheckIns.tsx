import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const questions = [
  { q: "How did you sleep?", opts: ["😴 Great", "🙂 Okay", "😕 Not well"] },
  { q: "How does your body feel?", opts: ["💪 Strong", "😌 Calm", "😣 Tense"] },
  { q: "Anything making you worried today?", opts: ["☀️ No", "🤔 A little", "🌧️ Yes"] },
];

const CheckIns = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const done = step >= questions.length;

  const pick = (a: string) => {
    setAnswers([...answers, a]);
    setStep(step + 1);
  };

  return (
    <AppShell title="Daily Check-in" subtitle="A few small questions. No wrong answers.">
      <div className="max-w-2xl mx-auto">
        <div className="calm-card">
          {!done ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-medium text-primary">Question {step + 1} of {questions.length}</span>
                <div className="flex gap-1.5">
                  {questions.map((_, i) => (
                    <span key={i} className={`w-8 h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>
              </div>
              <h2 className="text-2xl mb-8">{questions[step].q}</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {questions[step].opts.map((o) => (
                  <button
                    key={o}
                    onClick={() => pick(o)}
                    className="p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary-soft transition-all text-lg font-medium"
                  >
                    {o}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-accent-foreground" />
              </div>
              <h2 className="text-2xl mb-2">All done — thank you 💛</h2>
              <p className="text-muted-foreground mb-6">Your answers help us care for you better.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {answers.map((a, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-primary-soft text-sm">{a}</span>
                ))}
              </div>
              <button
                onClick={() => { setStep(0); setAnswers([]); }}
                className="mt-8 text-sm text-primary font-medium underline-offset-4 hover:underline"
              >
                Start again
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default CheckIns;
