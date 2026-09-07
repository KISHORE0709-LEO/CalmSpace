import { worlds, CinematicWorldData } from "@/lib/calmQuestData";
import { Lock, ArrowRight } from "lucide-react";
import { useCalmQuestProgress } from "@/hooks/useCalmQuestProgress";
import { cn } from "@/lib/utils";

interface Props {
  onSelectWorld: (world: CinematicWorldData) => void;
}


const cardThemes = [
  // 1: Primary (Blue)
  {
    frameBg: "bg-primary border-4 border-foreground", 
    frameShadow: "shadow-[inset_4px_4px_12px_rgba(255,255,255,0.6),inset_-6px_-6px_16px_rgba(0,0,0,0.2),8px_12px_0_hsl(0,0%,8%)]",
    frameShadowHover: "hover:shadow-[inset_4px_4px_12px_rgba(255,255,255,0.6),inset_-6px_-6px_16px_rgba(0,0,0,0.2),12px_16px_0_hsl(0,0%,8%)]",
    innerBg: "bg-card border-4 border-foreground", 
    textColor: "text-card-foreground", 
    badgeBg: "bg-foreground text-background", 
    buttonBg: "bg-secondary border-4 border-foreground", 
    buttonShadow: "shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.2)]",
    deco: "⭐",
    decoPositions: [
      "top-4 left-1/4", "top-6 right-1/3", "bottom-8 left-1/3", "bottom-4 right-1/4", "top-1/3 left-3", "top-2/3 right-3"
    ]
  },
  // 2: Secondary (Yellow)
  {
    frameBg: "bg-secondary border-4 border-foreground", 
    frameShadow: "shadow-[inset_4px_4px_12px_rgba(255,255,255,0.7),inset_-6px_-6px_16px_rgba(0,0,0,0.2),8px_12px_0_hsl(0,0%,8%)]",
    frameShadowHover: "hover:shadow-[inset_4px_4px_12px_rgba(255,255,255,0.7),inset_-6px_-6px_16px_rgba(0,0,0,0.2),12px_16px_0_hsl(0,0%,8%)]",
    innerBg: "bg-card border-4 border-foreground", 
    textColor: "text-card-foreground", 
    badgeBg: "bg-foreground text-background", 
    buttonBg: "bg-primary border-4 border-foreground", 
    buttonShadow: "shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.2)]",
    deco: "✨",
    decoPositions: [
      "top-5 left-1/4", "top-4 right-1/3", "bottom-6 left-1/3", "bottom-5 right-1/4", "top-1/4 left-4", "top-3/4 right-4"
    ]
  },
  // 3: Destructive (Red)
  {
    frameBg: "bg-destructive border-4 border-foreground", 
    frameShadow: "shadow-[inset_4px_4px_12px_rgba(255,255,255,0.4),inset_-6px_-6px_16px_rgba(0,0,0,0.3),8px_12px_0_hsl(0,0%,8%)]",
    frameShadowHover: "hover:shadow-[inset_4px_4px_12px_rgba(255,255,255,0.4),inset_-6px_-6px_16px_rgba(0,0,0,0.3),12px_16px_0_hsl(0,0%,8%)]",
    innerBg: "bg-card border-4 border-foreground", 
    textColor: "text-card-foreground", 
    badgeBg: "bg-foreground text-background", 
    buttonBg: "bg-secondary border-4 border-foreground", 
    buttonShadow: "shadow-[inset_2px_2px_4px_rgba(255,255,255,0.6),inset_-2px_-2px_6px_rgba(0,0,0,0.2)]",
    deco: "",
    decoPositions: []
  }
];

export const CinematicWorldSelect = ({ onSelectWorld }: Props) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-10 pb-24 px-4 md:px-0 relative max-w-[1200px] mx-auto">
      {worlds.map((world, idx) => {
        const isUnlocked = true;
        const theme = cardThemes[idx % cardThemes.length];
        
        return (
          <div 
            key={world.id}
            onClick={() => isUnlocked && onSelectWorld(world)}
            className={cn(
              "w-full aspect-square rounded-[3.5rem] p-6 pb-24 relative flex flex-col group transition-all duration-500 overflow-hidden",
              theme.frameBg,
              theme.frameShadow,
              isUnlocked ? cn("cursor-pointer hover:-translate-y-3", theme.frameShadowHover) : "grayscale opacity-75 cursor-not-allowed"
            )}
            style={isUnlocked ? { transformStyle: "preserve-3d" } : undefined}
          >
            {/* Frame Decorations (Stars / Sparkles) */}
            {theme.deco && theme.decoPositions.map((pos, i) => (
              <div key={i} className={cn("absolute text-xl opacity-60 drop-shadow-sm pointer-events-none", pos)}>
                {theme.deco}
              </div>
            ))}

            {/* Toy Corners for Card 3 */}
            {idx === 2 && (
              <>
                <div className="absolute top-0 left-0 w-16 h-16 bg-[#eab308] rounded-br-[2rem] shadow-[inset_4px_4px_8px_rgba(255,255,255,0.4)] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-[#3b82f6] rounded-tl-[2rem] shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.2)] pointer-events-none" />
              </>
            )}

            {/* Earth Icon on Outer Frame (Bottom Left) */}
            <div className="absolute bottom-6 left-6 w-16 h-16 flex items-center justify-center text-[3.5rem] drop-shadow-[0_8px_8px_rgba(0,0,0,0.2)] group-hover:animate-bounce-slow transition-all duration-500 z-20">
              🌍
            </div>

            {/* Arrow Button on Outer Frame (Bottom Right) */}
            <div className={cn(
              "absolute bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-300 active:scale-95 group-hover:scale-110 z-20",
              theme.buttonBg,
              theme.buttonShadow
            )}>
              <ArrowRight size={32} strokeWidth={4} className="group-hover:translate-x-1 transition-transform drop-shadow-sm" />
            </div>

            {/* The Sunken Inner Screen */}
            <div className={cn(
              "w-full h-full rounded-[2.2rem] p-6 md:p-8 flex flex-col relative overflow-hidden",
              "shadow-[inset_0_12px_24px_rgba(0,0,0,0.15)]",
              theme.innerBg
            )}>
               
               {/* Badge */}
               <div className={cn(
                 "px-5 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest w-fit mb-4 relative z-10",
                 theme.badgeBg
               )}>
                 WORLD {idx + 1}
               </div>
               
               {/* Title & Description */}
               <h2 className={cn("text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-2 relative z-10 drop-shadow-sm w-[90%]", theme.textColor)}>
                 {world.title}
               </h2>
               <p className={cn("text-xs sm:text-sm font-bold opacity-80 leading-relaxed relative z-10 line-clamp-4 w-[85%]", theme.textColor)}>
                 {world.lumioIntro}
               </p>

               {/* Simulated Illustrations (CSS Abstract) */}
               <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none opacity-60">
                 {idx === 0 && (
                   <div className="absolute bottom-0 right-0 w-full h-full bg-primary/20 rounded-tl-full" />
                 )}
                 {idx === 1 && (
                   <div className="absolute bottom-0 right-0 w-full h-full bg-secondary/20 rounded-tl-full" />
                 )}
                 {idx === 2 && (
                   <div className="absolute bottom-0 right-0 w-full h-full bg-destructive/20 rounded-tl-full" />
                 )}
               </div>

            </div>
          </div>
        );
      })}
    </div>
  );
};
