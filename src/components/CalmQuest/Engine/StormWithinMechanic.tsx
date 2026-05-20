import { useState, useEffect } from "react";
import { CinematicLevelData } from "@/lib/calmQuestData";
import { useGameLoop } from "./useGameLoop";
import { Button } from "@/components/ui/button";
import { Zap, Play, Target } from "lucide-react";

interface Props {
  level: CinematicLevelData;
  onComplete: (stars: number, xp: number) => void;
}

export const StormWithinMechanic = ({ level, onComplete }: Props) => {
  const { tick, isPlaying, direction, startGame, stopGame } = useGameLoop(100);
  
  // Balance mini-game: keep the cursor in the center of the bar while "storm" forces push it left/right.
  const [balance, setBalance] = useState(50); // 0 to 100
  const [stormForce, setStormForce] = useState(0);
  const [surviveTime, setSurviveTime] = useState(0);
  const targetTime = 100; // survive for 100 ticks (10 seconds)

  useEffect(() => {
    if (!isPlaying) return;

    // Randomly shift the storm force every 10 ticks
    if (tick % 10 === 0) {
       const newForce = (Math.random() * 6 - 3); // -3 to 3
       setStormForce(newForce);
    }

    setBalance(prev => {
      let b = prev + stormForce;
      
      // Player counters the force
      if (direction === "LEFT") b -= 2;
      if (direction === "RIGHT") b += 2;

      b = Math.max(0, Math.min(100, b));
      return b;
    });

    setSurviveTime(t => t + 1);

  }, [tick, direction]);

  useEffect(() => {
    if (balance <= 0 || balance >= 100) {
      // Failed, tension too high
      stopGame();
      setSurviveTime(0);
      setBalance(50);
      alert("Lost balance. Take a breath and try again.");
    } else if (surviveTime >= targetTime) {
      stopGame();
      setTimeout(() => onComplete(3, 150), 1500);
    }
  }, [balance, surviveTime, targetTime, stopGame, onComplete]);


  const progressPercent = (surviveTime / targetTime) * 100;
  const isDanger = balance < 15 || balance > 85;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-fade-up">
      {/* HUD */}
      <div className="w-full bg-card border-4 border-foreground rounded-[1.5rem] p-4 flex flex-col gap-4 mb-6 shadow-pop">
        <div className="flex justify-between items-center font-bold">
          <div>
            <h3 className="text-orange-600 text-xl uppercase tracking-widest">{level.title}</h3>
            <p className="text-xs text-muted-foreground">{level.goal}</p>
          </div>
          <div className="font-black text-2xl">
            {Math.floor(progressPercent)}%
          </div>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-100" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Game Board */}
      <div className={`relative w-full max-w-md h-[200px] bg-card border-8 border-foreground rounded-[2rem] shadow-pop-lg overflow-hidden flex items-center justify-center transition-all duration-1000 ${isDanger ? 'animate-wiggle border-accent' : ''}`}>
        
        {/* The Balance Bar */}
        <div className="w-[80%] h-8 bg-background border-4 border-foreground shadow-pop-sm rounded-full relative overflow-hidden">
          {/* Target Zone */}
          <div className="absolute top-0 bottom-0 left-[40%] right-[40%] bg-primary/30 border-x-4 border-primary" />
          
          {/* Player Balance Indicator */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-6 h-12 bg-white rounded-full border-4 border-foreground shadow-pop flex items-center justify-center transition-all duration-75"
            style={{ left: `calc(${balance}% - 12px)` }}
          >
             <Zap className="w-4 h-4 text-accent" />
          </div>
        </div>

        {/* Start Overlay */}
        {!isPlaying && surviveTime < targetTime && (
          <div className="absolute inset-0 z-30 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <p className="text-lg font-bold mb-4 text-center px-4">Use Left/Right to keep balance.<br/>Survive the storm.</p>
            <Button size="lg" onClick={startGame} className="rounded-full shadow-pop-lg text-lg">
              <Play className="mr-2" /> Endure
            </Button>
          </div>
        )}

        {/* Win Overlay */}
        {surviveTime >= targetTime && (
          <div className="absolute inset-0 z-30 bg-primary/90 backdrop-blur-md flex flex-col items-center justify-center animate-scale-in text-primary-foreground border-4 border-foreground">
            <Target className="w-16 h-16 text-primary-foreground mb-4 animate-pulse" />
            <h2 className="text-3xl font-black text-center">Storm Passed!</h2>
          </div>
        )}
      </div>
    </div>
  );
};
