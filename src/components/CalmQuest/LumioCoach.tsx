import { UserCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LumioCoachProps {
  message: string;
  className?: string;
  mood?: "calm" | "excited" | "thoughtful";
}

export const LumioCoach = ({ message, className }: LumioCoachProps) => {
  return (
    <div className={cn("w-full max-w-2xl mx-auto flex flex-col md:flex-row items-center gap-6 mb-12 animate-fade-up", className)}>
      
      {/* Lumio Avatar (Human Character Placeholder) */}
      <div className="relative shrink-0 group">
        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity animate-pulse-soft pointer-events-none" />
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-foreground bg-primary shadow-pop-sm flex items-center justify-center relative overflow-hidden z-10 transition-transform group-hover:scale-105">
           {/* If they provide a human image for Lumio later, it goes here */}
           <div className="w-full h-full bg-gradient-to-t from-black/20 to-transparent absolute inset-0 z-0" />
           <UserCircle className="w-20 h-20 md:w-28 md:h-28 text-primary-foreground absolute bottom-[-10px] z-10" strokeWidth={1} />
        </div>
        <div className="absolute -top-2 -right-2 bg-background border-2 border-foreground rounded-full p-1 shadow-pop-sm z-20 animate-bounce-slow">
           <Sparkles className="w-5 h-5 text-secondary" />
        </div>
      </div>

      {/* Dialogue Bubble */}
      <div className="flex-1 bg-card border-2 border-foreground rounded-[2rem] rounded-tl-sm p-6 md:p-8 shadow-pop relative">
        <div className="absolute top-4 left-6 text-xs font-black uppercase tracking-widest text-primary mb-2">Lumio (Your Coach)</div>
        <p className="text-lg md:text-xl font-bold leading-relaxed text-foreground mt-4">
          "{message}"
        </p>
      </div>

    </div>
  );
};
