import { useState, useEffect } from "react";
import { CinematicLevelData } from "@/lib/calmQuestData";
import { useGameLoop } from "./useGameLoop";
import { Button } from "@/components/ui/button";
import { Star, Play, Droplets } from "lucide-react";

interface Props {
  level: CinematicLevelData;
  onComplete: (stars: number, xp: number) => void;
}

const GRID_SIZE = 12;

export const SocialTideMechanic = ({ level, onComplete }: Props) => {
  const { tick, isPlaying, direction, startGame, stopGame } = useGameLoop(300);
  
  const [playerPos, setPlayerPos] = useState({ x: 0, y: GRID_SIZE - 1 }); // Start bottom left
  const [targetPos] = useState({ x: GRID_SIZE - 1, y: 0 }); // Goal top right
  
  // A river that moves downwards
  const [riverYOffset, setRiverYOffset] = useState(0);

  // Define river columns
  const riverCols = [3, 4, 7, 8];

  // Move player & animate river
  useEffect(() => {
    if (!isPlaying) return;

    // Animate river visually
    setRiverYOffset(prev => (prev + 1) % GRID_SIZE);

    setPlayerPos(prev => {
      let newX = prev.x;
      let newY = prev.y;

      if (direction === "UP") newY -= 1;
      if (direction === "DOWN") newY += 1;
      if (direction === "LEFT") newX -= 1;
      if (direction === "RIGHT") newX += 1;

      // Restrict to bounds
      newX = Math.max(0, Math.min(GRID_SIZE - 1, newX));
      newY = Math.max(0, Math.min(GRID_SIZE - 1, newY));

      // If in a river column and moving horizontally, sometimes it pushes you down
      if (riverCols.includes(newX) && Math.random() > 0.5) {
         newY = Math.min(GRID_SIZE - 1, newY + 1);
      }

      return { x: newX, y: newY };
    });
  }, [tick]);

  // Check win condition
  useEffect(() => {
    if (playerPos.x === targetPos.x && playerPos.y === targetPos.y) {
      stopGame();
      setTimeout(() => onComplete(3, 150), 1500);
    }
  }, [playerPos, targetPos, stopGame, onComplete]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center animate-fade-up">
      {/* HUD */}
      <div className="w-full bg-card border-4 border-foreground rounded-[1.5rem] p-4 flex justify-between items-center mb-6 shadow-pop">
        <div className="font-bold">
          <h3 className="text-purple-600 text-xl uppercase tracking-widest">{level.title}</h3>
          <p className="text-xs text-muted-foreground">{level.goal}</p>
        </div>
      </div>

      {/* Game Board */}
      <div className={`relative w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] bg-card border-8 border-foreground rounded-[2rem] shadow-pop-lg overflow-hidden transition-all duration-1000`}>
        
        {/* River Rendering */}
        <div className="absolute inset-0 z-0 opacity-40">
          {riverCols.map(col => (
             <div 
               key={`river-${col}`}
               className="absolute top-0 bottom-0 bg-primary/20 border-x-2 border-primary/40 flex flex-col items-center justify-around overflow-hidden"
               style={{
                 width: `${100 / GRID_SIZE}%`,
                 left: `${(col / GRID_SIZE) * 100}%`,
               }}
             >
                <Droplets className={`text-primary w-6 h-6 transition-transform duration-[300ms] opacity-80`} style={{ transform: `translateY(${riverYOffset * 5}px)` }} />
                <Droplets className={`text-primary w-6 h-6 transition-transform duration-[300ms] opacity-80`} style={{ transform: `translateY(${riverYOffset * 5}px)` }} />
             </div>
          ))}
        </div>

        <div className="absolute inset-0 z-10">
          
          {/* Target */}
          <div 
            className="absolute bg-secondary rounded-full border-2 border-foreground shadow-pop-sm flex items-center justify-center animate-pulse"
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(targetPos.x / GRID_SIZE) * 100}%`,
              top: `${(targetPos.y / GRID_SIZE) * 100}%`,
            }}
          >
            <Star className="w-4 h-4 fill-foreground text-foreground" />
          </div>

          {/* Player */}
          <div 
            className="absolute bg-foreground rounded-full border-2 border-primary shadow-pop transition-all duration-200 ease-linear flex items-center justify-center z-20"
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(playerPos.x / GRID_SIZE) * 100}%`,
              top: `${(playerPos.y / GRID_SIZE) * 100}%`,
            }}
          >
             <div className="w-1.5 h-1.5 bg-background rounded-full" />
          </div>
        </div>

        {/* Start Overlay */}
        {!isPlaying && (playerPos.x !== targetPos.x || playerPos.y !== targetPos.y) && (
          <div className="absolute inset-0 z-30 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <p className="text-lg font-bold mb-4 text-center px-4">Cross the river to the star.<br/>Currents may push you down.</p>
            <Button size="lg" onClick={startGame} className="rounded-full shadow-pop-lg text-lg">
              <Play className="mr-2" /> Start Flow
            </Button>
          </div>
        )}

        {/* Win Overlay */}
        {playerPos.x === targetPos.x && playerPos.y === targetPos.y && (
          <div className="absolute inset-0 z-30 bg-primary/90 backdrop-blur-md flex flex-col items-center justify-center animate-scale-in text-primary-foreground border-4 border-foreground">
            <Star className="w-16 h-16 fill-primary-foreground mb-4 animate-bounce-slow" />
            <h2 className="text-3xl font-black">Connection Made!</h2>
          </div>
        )}
      </div>
    </div>
  );
};
