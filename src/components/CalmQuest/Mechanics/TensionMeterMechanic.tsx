import { useState } from "react";
import { LevelData, Choice } from "@/lib/calmQuestData";
import { useEmotion } from "@/context/EmotionContext";
import { Zap, ShieldAlert } from "lucide-react";

interface Props {
  level: LevelData;
  onComplete: (stars: number, xp: number) => void;
}

export const TensionMeterMechanic = ({ level, onComplete }: Props) => {
  const { emotion } = useEmotion();
  const [currentStepId, setCurrentStepId] = useState(level.initialStepId);
  const [tension, setTension] = useState(30); // starts at 30%
  const [showFeedback, setShowFeedback] = useState<{ text: string; correct: boolean } | null>(null);

  const step = level.steps[currentStepId];
  const isOverloaded = emotion === "Overloaded";

  const handleChoice = (choice: Choice) => {
    const tensionChange = choice.isCorrect ? -20 : 40;
    const newTension = Math.max(0, Math.min(100, tension + tensionChange));
    setTension(newTension);
    setShowFeedback({ text: choice.feedback, correct: choice.isCorrect });

    setTimeout(() => {
      setShowFeedback(null);
      if (newTension >= 100) {
        // failed level
        alert("Tension too high! Take a breath and try again.");
        setTension(30);
      } else if (choice.isCorrect) {
        onComplete(3, 100);
      }
    }, 3000);
  };

  if (!step) return null;

  return (
    <div className={`w-full max-w-lg mx-auto bg-card rounded-[2rem] border-4 border-foreground shadow-pop-lg overflow-hidden relative min-h-[500px] flex flex-col transition-colors duration-500 ${tension > 80 ? "bg-red-50" : ""}`}>
      
      {/* Tension Meter Header */}
      <div className="bg-foreground p-4 text-background flex items-center gap-4">
        <Zap className={`w-6 h-6 ${tension > 80 ? "text-red-500 animate-pulse" : "text-yellow-400"}`} />
        <div className="flex-1 h-4 bg-background/20 rounded-full overflow-hidden border border-background/50 relative">
          <div 
            className={`h-full transition-all duration-700 ease-out ${tension > 80 ? "bg-red-500" : tension > 50 ? "bg-orange-400" : "bg-green-400"}`}
            style={{ width: `${tension}%` }}
          />
        </div>
        <span className="font-bold text-sm min-w-[3rem]">{tension}%</span>
      </div>

      {/* Screen Shake effect if tension is high */}
      <div className={`flex-1 p-6 flex flex-col ${tension > 80 ? "animate-wiggle" : ""}`}>
        
        {/* Threat / Situation Box */}
        <div className="bg-background border-4 border-foreground p-6 rounded-[1.5rem] shadow-[4px_4px_0_0_rgba(0,0,0,0.1)] relative mt-4">
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white p-2 rounded-full border-2 border-foreground shadow-sm">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <p className="text-center font-bold text-lg mt-2">
            {step.characterName && <span className="block text-sm text-red-500 mb-1">{step.characterName}</span>}
            {isOverloaded ? step.simplifiedDialogue : step.dialogue}
          </p>
        </div>

        {/* Choices Box */}
        <div className="mt-auto flex flex-col gap-3">
          {showFeedback ? (
            <div className={`p-4 rounded-xl border-2 border-foreground text-center font-bold shadow-pop-sm transition-all animate-scale-in ${showFeedback.correct ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
              {showFeedback.text}
            </div>
          ) : (
            step.choices?.map(choice => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice)}
                className="bg-card hover:bg-accent border-2 border-foreground p-4 rounded-xl shadow-pop text-left font-semibold text-sm transition-all hover:-translate-y-1"
              >
                {isOverloaded ? choice.simplifiedText : choice.text}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
