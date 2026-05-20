import { useState, useEffect } from "react";
import { CinematicLevelData } from "@/lib/calmQuestData";
import { useGameLoop, Direction } from "./useGameLoop";
import { Button } from "@/components/ui/button";
import { Star, AlertCircle, Play } from "lucide-react";

interface Props {
  level: CinematicLevelData;
  onComplete: (stars: number, xp: number) => void;
}

const GRID_SIZE = 15;

export const EchoAcademyMechanic = ({ level, onComplete }: Props) => {
  const { tick, isPlaying, direction, isOverloaded, startGame, stopGame } = useGameLoop(250);
  
  const [playerPos, setPlayerPos] = useState({ x: 7, y: 7 });
  const [orbs, setOrbs] = useState<{ x: number, y: number }[]>([{ x: 3, y: 3 }]);
  const [hazards, setHazards] = useState<{ x: number, y: number }[]>([{ x: 10, y: 10 }]);
  const [score, setScore] = useState(0);

  const targetScore = 5;

  // Move player on tick
  useEffect(() => {
    if (!isPlaying) return;

    setPlayerPos(prev => {
      let newX = prev.x;
      let newY = prev.y;

      if (direction === "UP") newY -= 1;
      if (direction === "DOWN") newY += 1;
      if (direction === "LEFT") newX -= 1;
      if (direction === "RIGHT") newX += 1;

      // Wrap around grid
      if (newX < 0) newX = GRID_SIZE - 1;
      if (newX >= GRID_SIZE) newX = 0;
      if (newY < 0) newY = GRID_SIZE - 1;
      if (newY >= GRID_SIZE) newY = 0;

      // Check collision with orbs
      const orbIndex = orbs.findIndex(o => o.x === newX && o.y === newY);
      if (orbIndex !== -1) {
        setScore(s => s + 1);
        setOrbs([{ x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) }]);
        // Add hazard every 2 points
        if ((score + 1) % 2 === 0) {
          setHazards(h => [...h, { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) }]);
        }
      }

      // Check collision with hazards (Panic Clouds)
      const hitHazard = hazards.some(h => h.x === newX && h.y === newY);
      if (hitHazard) {
        // Penalty: lose a point, respawn somewhere
        setScore(Math.max(0, score - 1));
        return { x: 7, y: 7 };
      }

      return { x: newX, y: newY };
    });
  }, [tick]); // only run on tick update

  // Check win condition
  useEffect(() => {
    if (score >= targetScore) {
      stopGame();
      setTimeout(() => onComplete(3, 150), 1500);
    }
  }, [score, targetScore, stopGame, onComplete]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-fade-up">
      {/* HUD */}
      <div className="w-full bg-card border-4 border-foreground rounded-[1.5rem] p-4 flex justify-between items-center mb-6 shadow-pop">
        <div className="font-bold">
          <h3 className="text-primary text-xl uppercase tracking-widest">{level.title}</h3>
          <p className="text-xs text-muted-foreground">{level.goal}</p>
        </div>
        <div className="bg-foreground text-background px-4 py-2 rounded-xl font-black text-2xl flex items-center gap-2 shadow-inner">
          <Star className="w-6 h-6 fill-background text-background" />
          {score} / {targetScore}
        </div>
      </div>

      {/* Game Board */}
      <div className={`relative w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] bg-card border-8 border-foreground rounded-[2rem] shadow-pop-lg overflow-hidden transition-all duration-1000 ${isOverloaded ? 'grayscale-[30%] opacity-90' : ''}`}>
        
        {/* Breathing overlay if overloaded */}
        {isOverloaded && (
          <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
             <div className="w-64 h-64 bg-primary rounded-full animate-pulse-soft blur-3xl" />
          </div>
        )}

        {/* Entities */}
        <div className="absolute inset-0 z-10">
          {/* Orbs */}
          {orbs.map((orb, i) => (
            <div 
              key={`orb-${i}`}
              className="absolute bg-secondary rounded-full border-2 border-foreground shadow-pop-sm animate-bounce-slow"
              style={{
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(orb.x / GRID_SIZE) * 100}%`,
                top: `${(orb.y / GRID_SIZE) * 100}%`,
                transform: 'scale(0.7)'
              }}
            />
          ))}

          {/* Hazards */}
          {hazards.map((haz, i) => (
            <div 
              key={`haz-${i}`}
              className={`absolute bg-accent rounded-xl blur-[1px] animate-pulse-soft ${isOverloaded ? 'opacity-30' : 'opacity-80'}`}
              style={{
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
                left: `${(haz.x / GRID_SIZE) * 100}%`,
                top: `${(haz.y / GRID_SIZE) * 100}%`,
                transform: 'scale(1.2)'
              }}
            >
              <AlertCircle className="w-full h-full text-white/50" />
            </div>
          ))}

          {/* Player */}
          <div 
            className="absolute bg-primary rounded-lg border-2 border-foreground shadow-pop transition-all duration-200 ease-linear flex items-center justify-center z-20"
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(playerPos.x / GRID_SIZE) * 100}%`,
              top: `${(playerPos.y / GRID_SIZE) * 100}%`,
            }}
          >
            <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
          </div>
        </div>

        {/* Start Overlay */}
        {!isPlaying && score < targetScore && (
          <div className="absolute inset-0 z-30 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <p className="text-lg font-bold mb-4 text-center px-4">Use WASD or Arrow Keys to move.<br/>{level.goal}.</p>
            <Button size="lg" onClick={startGame} className="rounded-full shadow-pop-lg text-lg">
              <Play className="mr-2" /> Start Game
            </Button>
          </div>
        )}

        {/* Win Overlay */}
        {score >= targetScore && (
          <div className="absolute inset-0 z-30 bg-primary/90 backdrop-blur-md flex flex-col items-center justify-center animate-scale-in text-primary-foreground border-4 border-foreground">
            <Star className="w-16 h-16 fill-primary-foreground mb-4 animate-bounce-slow" />
            <h2 className="text-3xl font-black">Level Cleared!</h2>
          </div>
        )}
      </div>
    </div>
  );
};
