import { useState } from "react";
import { LevelData, Choice } from "@/lib/calmQuestData";
import { useEmotion } from "@/context/EmotionContext";
import { Button } from "@/components/ui/button";
import { User, MessageCircle } from "lucide-react";

interface Props {
  level: LevelData;
  onComplete: (stars: number, xp: number) => void;
}

export const VisualNovelMechanic = ({ level, onComplete }: Props) => {
  const { emotion } = useEmotion();
  const [currentStepId, setCurrentStepId] = useState(level.initialStepId);
  const [showFeedback, setShowFeedback] = useState<{ text: string; correct: boolean } | null>(null);

  const step = level.steps[currentStepId];

  const handleChoice = (choice: Choice) => {
    setShowFeedback({ text: choice.feedback, correct: choice.isCorrect });
    
    // Simulate progression logic
    setTimeout(() => {
      setShowFeedback(null);
      if (choice.isCorrect) {
        onComplete(3, 100); // Trigger complete for now if correct
      }
    }, 3000);
  };

  const isOverloaded = emotion === "Overloaded";

  if (!step) return null;

  return (
    <div className="w-full max-w-lg mx-auto bg-card rounded-[2rem] border-4 border-foreground shadow-pop-lg overflow-hidden relative min-h-[500px] flex flex-col">
      {/* Environment Background */}
      <div className="flex-1 bg-gradient-to-b from-blue-100 to-background flex flex-col items-center justify-end pb-8 relative">
        {/* Character Sprite Placeholder */}
        <div className={`w-32 h-40 bg-secondary rounded-t-full border-4 border-foreground border-b-0 relative z-10 transition-transform ${isOverloaded ? "scale-95" : "animate-float"}`}>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-background w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Dialogue Box */}
      <div className="bg-background border-t-4 border-foreground p-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative">
        {/* Speaker Name */}
        <div className="absolute -top-4 left-6 bg-primary text-primary-foreground font-black px-4 py-1 rounded-full border-2 border-foreground shadow-pop-sm text-sm">
          {step.characterName || "Someone"}
        </div>
        
        <p className="font-medium text-lg mt-2 min-h-[3rem]">
          {isOverloaded ? step.simplifiedDialogue : step.dialogue}
        </p>
      </div>

      {/* Choices Box */}
      <div className="p-4 bg-muted border-t-2 border-foreground flex flex-col gap-3">
        {showFeedback ? (
          <div className={`p-4 rounded-xl border-2 border-foreground text-center font-bold shadow-pop-sm ${showFeedback.correct ? 'bg-green-100' : 'bg-red-100'}`}>
            {showFeedback.text}
          </div>
        ) : (
          step.choices?.map(choice => (
            <button
              key={choice.id}
              onClick={() => handleChoice(choice)}
              className="bg-card hover:bg-accent hover:-translate-y-1 transition-all border-2 border-foreground p-3 rounded-xl shadow-pop text-left font-semibold text-sm flex items-center gap-3"
            >
              <MessageCircle className="w-4 h-4 shrink-0 text-primary" />
              <span>{isOverloaded ? choice.simplifiedText : choice.text}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
