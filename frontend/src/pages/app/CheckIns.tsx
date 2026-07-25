import { useState } from "react";
import { CheckCircle2, Heart, Sparkles, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const questions = [
  { 
    q: "How was school today?", category: "School/Day",
    opts: [
      { text: "🌟 Great", val: "positive" },
      { text: "🙂 Okay", val: "neutral" },
      { text: "😢 A bit sad", val: "negative" }
    ]
  },
  { 
    q: "How did you sleep last night?", category: "Sleep",
    opts: [
      { text: "😴 Great", val: "positive" },
      { text: "🙂 Okay", val: "neutral" },
      { text: "😕 Not well", val: "negative" }
    ]
  },
  { 
    q: "How was dinner?", category: "Meals",
    opts: [
      { text: "😋 Yummy", val: "positive" },
      { text: "🙂 Okay", val: "neutral" },
      { text: "🤐 Not hungry", val: "negative" }
    ]
  },
  { 
    q: "Did you talk to anyone today?", category: "Social",
    opts: [
      { text: "💬 Yes, lots!", val: "positive" },
      { text: "🙂 A little", val: "neutral" },
      { text: "😶 Not really", val: "negative" }
    ]
  },
];

const celebrationEmojis = ["🎉", "⭐", "🌈", "💛", "✨", "🌸", "🎊", "💙"];

// Mock generative LLM responses
const getMockResponse = (category: string, val: string) => {
  if (val === "positive") return `I'm so glad your ${category.toLowerCase()} went so well! It's always great to hear you're feeling good. Keep that amazing energy up! ✨`;
  if (val === "neutral") return `Thanks for letting me know. Some days are just okay, and that's perfectly fine. We're always here for you! 💛`;
  return `I hear you, and I'm sorry it was a bit tough. It's completely okay to have hard moments. Take a deep breath, you're doing a wonderful job. 🌸`;
};

const CheckIns = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [animKey, setAnimKey] = useState(0);
  
  // Generative Feedback State
  const [feedback, setFeedback] = useState<{ text: string, isNegative: boolean, answerText: string } | null>(null);

  const done = step >= questions.length;
  const progress = (step / questions.length) * 100;

  const handleAnswer = (opt: { text: string, val: string }) => {
    // Generate mock response instead of moving immediately
    const responseText = getMockResponse(questions[step].category, opt.val);
    setFeedback({
      text: responseText,
      isNegative: opt.val === "negative",
      answerText: opt.text
    });
  };

  const handleNext = () => {
    if (feedback) {
      setAnswers([...answers, feedback.answerText]);
    }
    setFeedback(null);
    setAnimKey((k) => k + 1);
    setStep(step + 1);
  };

  return (
    <AppShell title="Daily Check-in" subtitle="A few small questions. No wrong answers.">
      <div className="max-w-2xl mx-auto">
        <div className="calm-card relative overflow-hidden min-h-[400px]">
          {/* bg blob */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl animate-pulse-soft pointer-events-none" />

          {done ? (
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
              <p className="text-muted-foreground mb-8 text-lg">Your check-in is safely recorded.</p>

              <button
                onClick={() => { setStep(0); setAnswers([]); setAnimKey((k) => k + 1); setFeedback(null); }}
                className="text-sm text-primary font-black underline-offset-4 hover:underline hover:scale-105 transition-all"
              >
                Start again ↺
              </button>
            </div>
          ) : feedback ? (
            <div key={`feedback-${step}`} style={{ animation: "fade-up 0.4s ease forwards" }} className="relative z-10 flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-accent border-2 border-foreground flex items-center justify-center mb-6 shadow-pop-sm">
                <Heart className="w-8 h-8 text-primary" fill="currentColor" />
              </div>
              
              <h3 className="text-2xl font-black tracking-tight mb-4">You answered {feedback.answerText}</h3>
              
              <p className="text-foreground text-lg leading-relaxed font-medium mb-8 p-6 bg-background rounded-[1.5rem] border-2 border-foreground shadow-pop-sm inline-block max-w-lg">
                {feedback.text}
              </p>

              {feedback.isNegative && (
                <button className="mb-6 px-6 py-4 rounded-[1rem] bg-secondary text-secondary-foreground border-2 border-foreground font-bold shadow-pop hover:-translate-y-1 hover:shadow-pop-md transition-all flex items-center gap-3">
                  <Sparkles className="w-5 h-5" />
                  Want to try a 2-minute breathing exercise?
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-pop-sm hover:-translate-y-1 transition-all flex items-center gap-2 mt-4"
              >
                {step === questions.length - 1 ? "Finish Check-in" : "Next Question"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div key={animKey} style={{ animation: "fade-up 0.4s ease forwards" }} className="relative z-10">
              {/* progress */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-primary">Category: {questions[step].category}</span>
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
                    key={o.text}
                    onClick={() => handleAnswer(o)}
                    className="p-6 rounded-[1rem] border-2 border-foreground bg-background shadow-pop hover:shadow-pop-lg hover:-translate-y-2 hover:bg-accent transition-all text-lg font-bold group"
                    style={{ animation: `fade-up 0.4s ease ${i * 80}ms forwards`, opacity: 0 }}
                  >
                    <span className="block text-3xl mb-2 group-hover:animate-bounce-slow">{o.text.split(" ")[0]}</span>
                    <span className="text-sm">{o.text.split(" ").slice(1).join(" ")}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default CheckIns;
