import { useState } from "react";
import { worlds, CinematicWorldData } from "@/lib/calmQuestData";
import { Compass, Lock } from "lucide-react";
import { useCalmQuestProgress } from "@/hooks/useCalmQuestProgress";

interface Props {
  onSelectWorld: (world: CinematicWorldData) => void;
}

export const CinematicWorldSelect = ({ onSelectWorld }: Props) => {
  const { progress } = useCalmQuestProgress();
  const [hoveredWorld, setHoveredWorld] = useState<number | null>(null);

  return (
    <div className="w-full flex flex-col items-center justify-center relative overflow-hidden py-12 rounded-[3rem] animate-fade-up">
      
      {/* Removed the fixed inset background to avoid breaking AppShell. Just relying on the cards and soft glowing elements. */}

      {/* Lumio Mini-Guide Top */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card border-2 border-foreground px-6 py-3 rounded-full shadow-pop-sm z-20">
        <Compass className="w-6 h-6 text-primary animate-spin-slow" />
        <span className="font-bold text-sm">Select a Realm</span>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 w-full max-w-6xl px-4 mt-8 z-10">
        {worlds.map((world, idx) => {
          const isUnlocked = progress.unlockedWorlds.includes(world.id);
          const isHovered = hoveredWorld === world.id;

          return (
            <div 
              key={world.id}
              className={`relative flex flex-col items-center group cursor-pointer transition-all duration-700 ease-out ${isUnlocked ? '' : 'grayscale opacity-75 cursor-not-allowed'}`}
              onMouseEnter={() => isUnlocked && setHoveredWorld(world.id)}
              onMouseLeave={() => setHoveredWorld(null)}
              onClick={() => isUnlocked && onSelectWorld(world)}
              style={{ transform: isHovered ? 'translateY(-20px) scale(1.05)' : 'translateY(0) scale(1)' }}
            >
              {/* The World Island */}
              <div className={`w-64 h-64 md:w-80 md:h-80 relative rounded-full border-8 border-foreground shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-center overflow-hidden transition-all duration-700 ${idx % 2 === 0 ? 'animate-float' : 'animate-float-delay'}`}>
                
                {/* World Inner Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${world.gradient} transition-transform duration-[2000ms] ${isHovered ? 'scale-110' : 'scale-100'}`} />
                
                {/* Atmosphere overlay */}
                <div className="absolute inset-0 bg-black/10 rounded-full" />
                
                {/* Locked State Overlay */}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                    <Lock className="w-12 h-12 mb-2 text-muted-foreground" />
                    <span className="font-black text-sm bg-foreground text-background px-3 py-1 rounded-full">Locked</span>
                  </div>
                )}

                {/* World Title inside island */}
                <h2 className="relative z-10 text-3xl font-black text-foreground drop-shadow-md text-center px-4">
                  {world.title}
                </h2>
              </div>

              {/* Lumio Quote on Hover */}
              <div className={`absolute -bottom-24 w-72 text-center transition-all duration-500 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <p className="text-lg font-bold italic text-muted-foreground">"{world.lumioIntro}"</p>
                <div className="w-full h-1 bg-foreground mt-4 rounded-full shadow-pop-sm mx-auto" />
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
