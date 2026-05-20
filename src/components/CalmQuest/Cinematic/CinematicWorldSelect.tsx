import { worlds, CinematicWorldData } from "@/lib/calmQuestData";
import { Lock, ArrowRight } from "lucide-react";
import { useCalmQuestProgress } from "@/hooks/useCalmQuestProgress";
import { cn } from "@/lib/utils";

interface Props {
  onSelectWorld: (world: CinematicWorldData) => void;
}

export const CinematicWorldSelect = ({ onSelectWorld }: Props) => {
  const { progress } = useCalmQuestProgress();

  return (
    <div className="w-full flex flex-col gap-8 pb-24">
      {worlds.map((world, idx) => {
        const isUnlocked = progress.unlockedWorlds.includes(world.id);
        
        return (
          <div 
            key={world.id}
            onClick={() => isUnlocked && onSelectWorld(world)}
            className={cn(
              "w-full relative rounded-[2rem] border-4 border-foreground overflow-hidden group transition-all duration-500",
              isUnlocked ? "cursor-pointer bg-card shadow-pop hover:shadow-pop-lg hover:-translate-y-2" : "grayscale opacity-75 cursor-not-allowed bg-muted"
            )}
          >
            {/* Background Atmosphere Gradient (Only on unlocked) */}
            {isUnlocked && (
               <div className={cn("absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-gradient-to-r blur-3xl", world.gradient)} />
            )}

            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
               
               {/* Left Content */}
               <div className="flex-1">
                 <div className="flex items-center gap-4 mb-2">
                   <div className="px-3 py-1 bg-foreground text-background text-xs font-black uppercase tracking-widest rounded-full">
                     World {idx + 1}
                   </div>
                   {!isUnlocked && (
                     <div className="flex items-center gap-1 text-muted-foreground text-sm font-bold">
                       <Lock className="w-4 h-4" /> Locked
                     </div>
                   )}
                 </div>
                 
                 <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4">
                   {world.title}
                 </h2>
                 <p className="text-lg text-muted-foreground font-medium max-w-xl">
                   {world.lumioIntro}
                 </p>
               </div>

               {/* Right Action */}
               {isUnlocked && (
                 <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 bg-primary border-4 border-foreground rounded-full flex items-center justify-center shadow-pop group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                   <ArrowRight className="w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:translate-x-2" />
                 </div>
               )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
