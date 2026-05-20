import { useState } from "react";
import { worlds } from "@/lib/calmQuestData";
import { useCalmQuestProgress } from "@/hooks/useCalmQuestProgress";
import { Lock, Star, Play } from "lucide-react";

interface WorldMapProps {
  onSelectLevel: (worldId: number, levelId: number) => void;
}

export const WorldMap = ({ onSelectLevel }: WorldMapProps) => {
  const { progress } = useCalmQuestProgress();

  return (
    <div className="relative w-full max-w-md mx-auto h-[600px] overflow-y-auto overflow-x-hidden rounded-[2rem] border-4 border-foreground shadow-pop-lg bg-[#F8F9FA] scrollbar-none pb-20">
      {/* Scrollable Map Container */}
      <div className="relative min-h-[1200px] flex flex-col justify-end p-8 gap-16">
        
        {/* Render Worlds in reverse so world 1 is at the bottom (like Candy Crush) */}
        {[...worlds].reverse().map((world) => {
          const isUnlocked = progress.unlockedWorlds.includes(world.id);
          const completedInWorld = progress.completedLevels[world.id] || [];

          return (
            <div key={world.id} className="relative w-full">
              {/* World Header */}
              <div className={`calm-card relative z-20 mb-8 border-4 border-foreground text-center ${isUnlocked ? "bg-card shadow-pop-lg" : "bg-muted grayscale opacity-80"}`}>
                <h3 className="text-xl font-black">{world.title}</h3>
                <p className="text-xs font-medium text-muted-foreground">{world.theme}</p>
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-[1.2rem] flex flex-col items-center justify-center border-none">
                    <Lock className="w-8 h-8 mb-2" />
                    <span className="font-bold text-sm">Complete previous world</span>
                  </div>
                )}
              </div>

              {/* Levels Container - curved path layout */}
              <div className="relative w-full h-[300px]">
                {/* SVG Path linking nodes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                  <path 
                    d="M 50,280 C 150,250 250,220 200,150 C 150,80 50,50 150,20" 
                    fill="none" 
                    stroke="var(--foreground)" 
                    strokeWidth="8" 
                    strokeDasharray="12 12"
                    className={isUnlocked ? "opacity-30" : "opacity-10"}
                  />
                </svg>

                {/* Level Nodes */}
                {world.levels.map((level, i) => {
                  // Candy crush style positioning
                  const positions = [
                    { bottom: "20px", left: "20%" },
                    { bottom: "80px", left: "60%" },
                    { bottom: "150px", left: "40%" },
                    { bottom: "210px", left: "20%" },
                    { bottom: "280px", left: "50%" },
                  ];
                  const pos = positions[i];
                  const isLevelCompleted = completedInWorld.includes(level.id);
                  const isNextLevel = isUnlocked && !isLevelCompleted && (i === 0 || completedInWorld.includes(world.levels[i-1].id));
                  const isLevelLocked = !isUnlocked || (!isLevelCompleted && !isNextLevel);

                  return (
                    <button
                      key={level.id}
                      disabled={isLevelLocked}
                      onClick={() => onSelectLevel(world.id, level.id)}
                      className={`absolute w-16 h-16 -ml-8 -mb-8 rounded-full border-4 border-foreground shadow-pop flex items-center justify-center transition-all z-10 
                        ${isLevelLocked ? "bg-muted cursor-not-allowed scale-90" : 
                          isNextLevel ? `${world.color} animate-pulse-soft shadow-pop-lg hover:scale-110 cursor-pointer` : 
                          "bg-secondary shadow-pop-sm hover:scale-105 cursor-pointer"}`}
                      style={{ ...pos }}
                    >
                      {isLevelCompleted ? (
                        <Star className="w-6 h-6 fill-foreground text-foreground" />
                      ) : isNextLevel ? (
                        <Play className="w-6 h-6 ml-1 text-foreground fill-foreground" />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                      
                      {/* Level Label */}
                      <span className="absolute -top-6 whitespace-nowrap text-xs font-black bg-background border-2 border-foreground px-2 py-0.5 rounded-full shadow-pop-sm">
                        Lvl {level.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
