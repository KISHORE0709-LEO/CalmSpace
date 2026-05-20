import { useState, useEffect } from "react";
import { LevelData, Choice } from "@/lib/calmQuestData";
import { useEmotion } from "@/context/EmotionContext";
import { Send, CheckCheck, MoreHorizontal } from "lucide-react";

interface Props {
  level: LevelData;
  onComplete: (stars: number, xp: number) => void;
}

export const ChatSimulationMechanic = ({ level, onComplete }: Props) => {
  const { emotion } = useEmotion();
  const [currentStepId, setCurrentStepId] = useState(level.initialStepId);
  const [isTyping, setIsTyping] = useState(true);
  const [showFeedback, setShowFeedback] = useState<{ text: string; correct: boolean } | null>(null);

  const step = level.steps[currentStepId];

  useEffect(() => {
    // Simulate typing delay for incoming message
    setIsTyping(true);
    const timer = setTimeout(() => setIsTyping(false), 2000);
    return () => clearTimeout(timer);
  }, [currentStepId]);

  const handleChoice = (choice: Choice) => {
    setShowFeedback({ text: choice.feedback, correct: choice.isCorrect });
    setTimeout(() => {
      setShowFeedback(null);
      if (choice.isCorrect) onComplete(3, 100);
    }, 3000);
  };

  const isOverloaded = emotion === "Overloaded";

  if (!step) return null;

  return (
    <div className="w-full max-w-sm mx-auto bg-card rounded-[2rem] border-4 border-foreground shadow-pop-lg overflow-hidden relative h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-primary p-4 border-b-4 border-foreground flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-background border-2 border-foreground flex items-center justify-center font-bold shadow-pop-sm">
          {step.characterName?.[0] || "U"}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-primary-foreground">{step.characterName || "Unknown"}</h4>
          <p className="text-xs text-primary-foreground/80">{isTyping ? "typing..." : "online"}</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-muted p-4 overflow-y-auto flex flex-col gap-4">
        {/* Timestamp */}
        <div className="text-center text-xs text-muted-foreground font-semibold">Today 12:00 PM</div>

        {/* Incoming Message */}
        <div className="flex items-end gap-2 max-w-[85%]">
          <div className="w-6 h-6 rounded-full bg-background border border-foreground shrink-0" />
          <div className="bg-card border-2 border-foreground p-3 rounded-2xl rounded-bl-sm shadow-sm relative">
            {isTyping ? (
              <MoreHorizontal className="w-5 h-5 animate-pulse text-muted-foreground" />
            ) : (
              <p className="text-sm font-medium">
                {isOverloaded ? step.simplifiedDialogue : step.dialogue}
              </p>
            )}
          </div>
        </div>

        {/* Choices container appearing as user input options */}
        {!isTyping && !showFeedback && (
          <div className="mt-auto flex flex-col gap-2 pt-4">
            <span className="text-xs font-bold text-muted-foreground ml-2">Choose your reply:</span>
            {step.choices?.map(choice => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice)}
                className="bg-primary hover:bg-primary-hover border-2 border-foreground p-3 text-left rounded-2xl shadow-pop-sm transition-all flex justify-between items-center group text-primary-foreground"
              >
                <span className="text-sm font-semibold">{isOverloaded ? choice.simplifiedText : choice.text}</span>
                <Send className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        )}

        {/* Feedback Message */}
        {showFeedback && (
          <div className="mt-auto">
             <div className="flex justify-end mb-4">
                <div className="bg-primary border-2 border-foreground p-3 rounded-2xl rounded-br-sm shadow-sm">
                   <p className="text-sm font-semibold text-primary-foreground">...</p>
                   <CheckCheck className="w-3 h-3 text-primary-foreground/50 mt-1 absolute bottom-2 right-2" />
                </div>
             </div>
             <div className={`p-3 text-center rounded-xl border-2 border-foreground text-sm font-bold shadow-pop-sm ${showFeedback.correct ? 'bg-green-100' : 'bg-red-100'}`}>
                {showFeedback.text}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
