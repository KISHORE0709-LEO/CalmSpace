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
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 pb-24 px-4 md:px-0 relative">
      {worlds.map((world, idx) => {
        const isUnlocked = true; // Unlock all worlds as requested
        
        return (
          <div 
            key={world.id}
            onClick={() => isUnlocked && onSelectWorld(world)}
            className={cn(
              "w-full relative rounded-[2.5rem] border-4 border-foreground overflow-hidden group transition-all duration-500 flex flex-col h-full",
              isUnlocked ? "cursor-pointer bg-card shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-3 hover:-translate-x-1" : "grayscale opacity-75 cursor-not-allowed bg-muted"
            )}
          >
            {/* Background Atmosphere Gradient */}
            <div className={cn("absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity duration-700 bg-gradient-to-br blur-2xl", world.gradient)} />
            
            {/* Gaming decorative elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-foreground/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

            <div className="relative z-10 p-6 md:p-8 flex flex-col flex-1 h-full">
               
               {/* Top Content */}
               <div className="flex-1">
                 <div className="flex items-center justify-between mb-6">
                   <div className="px-4 py-1.5 bg-foreground text-background text-sm font-black uppercase tracking-widest rounded-full shadow-pop-sm group-hover:scale-110 transition-transform origin-left">
                     World {idx + 1}
                   </div>
                 </div>
                 
                 <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-4 group-hover:text-primary transition-colors">
                   {world.title}
                 </h2>
                 <p className="text-base text-muted-foreground font-semibold mb-6">
                   {world.lumioIntro}
                 </p>
               </div>

               {/* Bottom Action */}
               <div className="mt-auto flex justify-between items-end">
                 <div className="text-4xl opacity-50 group-hover:opacity-100 group-hover:animate-bounce-slow transition-all">🌍</div>
                 <div className="shrink-0 w-14 h-14 bg-primary border-4 border-foreground rounded-full flex items-center justify-center shadow-pop group-hover:bg-foreground group-hover:text-background group-hover:-rotate-12 group-hover:scale-110 transition-all duration-300">
                   <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                 </div>
               </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
