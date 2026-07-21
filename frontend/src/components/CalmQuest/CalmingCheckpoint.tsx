import { useState, useEffect } from "react";
import { useEmotion } from "@/context/EmotionContext";
import { Button } from "@/components/ui/button";
import { Wind, ArrowRight, Heart } from "lucide-react";

interface Props {
  worldId: number;
  worldTitle: string;
  onContinue: () => void;
}

export const CalmingCheckpoint = ({ worldId, worldTitle, onContinue }: Props) => {
  const { emotion } = useEmotion();
  const [breathePhase, setBreathePhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (breathePhase === "in") timer = setTimeout(() => setBreathePhase("hold"), 4000);
    else if (breathePhase === "hold") timer = setTimeout(() => setBreathePhase("out"), 4000);
    else if (breathePhase === "out") timer = setTimeout(() => setBreathePhase("in"), 4000);
    return () => clearTimeout(timer);
  }, [breathePhase]);

  const scale = breathePhase === "in" ? "scale-150" : breathePhase === "hold" ? "scale-150" : "scale-100";
  const label = breathePhase === "in" ? "Breathe In..." : breathePhase === "hold" ? "Hold..." : "Breathe Out...";

  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-[2rem] border-4 border-foreground shadow-pop-lg overflow-hidden relative min-h-[600px] flex flex-col items-center justify-center p-8 text-center animate-fade-up">
      
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-primary">
        <Heart className="w-5 h-5 fill-primary" />
        <span className="font-bold">Checkpoint</span>
      </div>

      <h2 className="text-3xl font-black mt-8 mb-2">World {worldId} Complete</h2>
      <p className="text-muted-foreground font-medium mb-12">You mastered {worldTitle}. Take a moment to rest.</p>

      {/* Breathing Bubble */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-16">
        <div className={`absolute inset-0 bg-primary/20 rounded-full transition-transform duration-[4000ms] ease-in-out ${scale}`} />
        <div className="relative z-10 w-24 h-24 bg-primary text-primary-foreground rounded-full flex flex-col items-center justify-center border-4 border-foreground shadow-pop-sm">
          <Wind className="w-8 h-8 mb-1" />
          <span className="font-bold text-xs">{label}</span>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-xl border-2 border-foreground shadow-inner mb-8 w-full">
        <p className="text-sm font-semibold italic">"Confidence is built one small interaction at a time. Be proud of your progress today."</p>
      </div>

      <Button onClick={onContinue} size="lg" className="w-full rounded-full text-lg shadow-pop-sm hover:-translate-y-1 transition-transform group">
        Continue Journey <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
};
