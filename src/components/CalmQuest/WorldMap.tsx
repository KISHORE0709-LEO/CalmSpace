import React, { useEffect, useRef, useState } from "react";
import { worlds } from "@/lib/calmQuestData";
import { useCalmQuestProgress } from "@/hooks/useCalmQuestProgress";
import { Lock, Star, Play, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const DesktopConnector = ({ fromSide }: { fromSide: "left" | "right" }) => {
  const isLeft = fromSide === "left";
  return (
    <div className="hidden md:block w-full h-28 lg:h-36 relative z-10 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
        <path
          d={isLeft ? "M 25,0 L 25,15 C 25,60 75,40 75,85 L 75,100" : "M 75,0 L 75,15 C 75,60 25,40 25,85 L 25,100"}
          fill="none" stroke="hsl(var(--foreground))" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" vectorEffect="non-scaling-stroke"
          className="opacity-20"
        />
      </svg>
      <div className="absolute text-foreground opacity-30 translate-x-[-50%] bottom-[-10px] animate-bounce-slow" style={{ left: isLeft ? "75%" : "25%" }}>
        <ChevronDown size={32} strokeWidth={3.5} />
      </div>
    </div>
  );
};

const MobileConnector = ({ fromSide }: { fromSide: "left" | "right" }) => {
  const isLeft = fromSide === "left";
  return (
    <div className="block md:hidden w-full h-16 relative z-10 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
        <path
          d={isLeft ? "M 50,0 C 40,40 60,60 50,100" : "M 50,0 C 60,40 40,60 50,100"}
          fill="none" stroke="hsl(var(--foreground))" strokeWidth="3.5" strokeDasharray="6 8" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="opacity-20"
        />
      </svg>
      <div className="absolute text-foreground opacity-30 bottom-[-12px] left-[50%] -translate-x-1/2 animate-bounce-slow">
        <ChevronDown size={28} strokeWidth={3.5} />
      </div>
    </div>
  );
};

const LevelCard = ({ level, isLocked, isNextLevel, isLevelCompleted, onSelectLevel }: { level: { id: number, worldId: number, title: string, goal: string, worldTitle: string, worldColor: string }, isLocked: boolean, isNextLevel: boolean, isLevelCompleted: boolean, onSelectLevel: (w: number, l: number) => void }) => {
  const { ref, inView } = useInView(0.1);
  const delay = 0;

  return (
    <article
      ref={ref}
      onClick={() => !isLocked && onSelectLevel(level.worldId, level.id)}
      className={cn(
        "group w-full max-w-sm md:max-w-none mx-auto bg-card border-2 border-foreground rounded-[2rem] p-6 lg:p-8 transition-all duration-300 relative overflow-hidden z-20",
        isLocked ? "opacity-75 grayscale cursor-not-allowed shadow-pop" : "shadow-pop hover:shadow-pop-lg hover:-translate-y-2 cursor-pointer"
      )}
      style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}
    >
      {!isLocked && <div className={cn("absolute -z-10 w-64 h-64 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none -top-20 -right-20", level.worldColor)} />}

      {/* Status Emoji/Icon */}
      <span className="absolute top-4 right-5 text-2xl opacity-80 group-hover:opacity-100 transition-all">
        {isLevelCompleted ? "⭐" : isNextLevel ? "▶️" : "🔒"}
      </span>

      <div className="flex flex-col items-start gap-6">
        <div className="flex w-full items-start justify-between">
          <div className={cn("grid place-items-center rounded-2xl border-2 border-foreground shadow-pop-sm shrink-0 w-16 h-16 transition-transform duration-300", 
            isLevelCompleted ? "bg-primary" : isNextLevel ? "bg-secondary group-hover:scale-110 group-hover:-rotate-6" : "bg-muted", "text-foreground")}>
            
            {isLevelCompleted ? <Star size={28} strokeWidth={2.5} className="fill-foreground text-foreground" /> : 
             isNextLevel ? <Play size={28} strokeWidth={2.5} className="fill-foreground text-foreground ml-1" /> : 
             <Lock size={28} strokeWidth={2.5} />}
          </div>
          
          <div className="flex flex-col items-end">
             <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{level.worldTitle}</span>
             <div className="flex items-center justify-center min-w-12 h-12 px-3 bg-foreground text-background font-black text-xl rounded-[1rem] shadow-pop-sm mt-1">
               Lvl {level.id}
             </div>
          </div>
        </div>
        <div className="mt-2 text-left">
          <h3 className="text-2xl sm:text-[1.75rem] leading-tight font-black text-foreground tracking-tight mb-2">{level.title}</h3>
          <p className="text-[15px] sm:text-[1.05rem] text-muted-foreground leading-relaxed font-medium">{level.goal}</p>
        </div>
      </div>
    </article>
  );
};

interface WorldMapProps {
  worldId: number;
  onSelectLevel: (worldId: number, levelId: number) => void;
}

export const WorldMap = ({ worldId, onSelectLevel }: WorldMapProps) => {
  const { progress } = useCalmQuestProgress();

  const world = worlds.find(w => w.id === worldId);
  if (!world) return null;

  // Flatten the 5 levels for this specific world
  const levels = world.levels.map(level => ({ 
    ...level, 
    worldId: world.id, 
    worldTheme: world.theme, 
    worldTitle: world.title, 
    worldColor: world.color 
  }));

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col px-4 md:px-0 mt-8 pb-24">
      {levels.map((level, i) => {
        const isLeft = i % 2 === 0;
        const isLast = i === levels.length - 1;

        const isWorldUnlocked = progress.unlockedWorlds.includes(level.worldId);
        const completedInWorld = progress.completedLevels[level.worldId] || [];
        const isLevelCompleted = completedInWorld.includes(level.id);
        
        // Find if it's the very next level to play
        const prevLevelId = level.id - 1;
        const isNextLevel = isWorldUnlocked && !isLevelCompleted && (level.id === 1 || completedInWorld.includes(prevLevelId));
        const isLocked = !isWorldUnlocked || (!isLevelCompleted && !isNextLevel);

        return (
          <React.Fragment key={`${level.worldId}-${level.id}`}>
            <div className={cn("w-full md:w-1/2 px-2 sm:px-4 lg:px-8 relative z-20", isLeft ? "md:mr-auto" : "md:ml-auto")}>
              <LevelCard 
                level={level} 
                isLocked={isLocked} 
                isNextLevel={isNextLevel} 
                isLevelCompleted={isLevelCompleted} 
                onSelectLevel={onSelectLevel} 
              />
            </div>

            {!isLast && (
              <>
                <DesktopConnector fromSide={isLeft ? "left" : "right"} />
                <MobileConnector fromSide={isLeft ? "left" : "right"} />
              </>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
