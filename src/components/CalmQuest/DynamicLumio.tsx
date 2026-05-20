import { Sparkles, MessageCircle, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DynamicLumioProps {
  message: string;
  className?: string;
  mood?: "calm" | "excited" | "thoughtful";
  position?: "bottom" | "side";
  actionButton?: React.ReactNode;
}

export const DynamicLumio = ({ message, className, position = "bottom", actionButton }: DynamicLumioProps) => {
  
  if (position === "bottom") {
    // RPG Dialog Box style
    return (
      <div className={cn("w-full max-w-4xl mx-auto flex flex-col md:flex-row items-end gap-6 animate-fade-up z-40 relative", className)}>
        
        {/* The Human Silhouette SVG / Stand-in */}
        <div className="relative shrink-0 w-32 h-40 md:w-48 md:h-64 overflow-visible z-20">
           {/* Glow behind character */}
           <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
           {/* Abstract Human SVG */}
           <svg viewBox="0 0 100 150" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] animate-float-delay" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 15C58.2843 15 65 21.7157 65 30C65 38.2843 58.2843 45 50 45C41.7157 45 35 38.2843 35 30C35 21.7157 41.7157 15 50 15Z" fill="hsl(var(--primary))" stroke="hsl(var(--foreground))" strokeWidth="4"/>
              <path d="M25 70C25 56.1929 36.1929 45 50 45C63.8071 45 75 56.1929 75 70V100C75 127.614 52.6142 150 25 150H75V150C75 122.386 52.6142 100 25 100V70Z" fill="hsl(var(--primary))" stroke="hsl(var(--foreground))" strokeWidth="4"/>
              {/* Scarf / Detail */}
              <path d="M35 55L65 65L70 85L30 75L35 55Z" fill="hsl(var(--secondary))" stroke="hsl(var(--foreground))" strokeWidth="4"/>
           </svg>
        </div>

        {/* Dialog Box */}
        <div className="flex-1 bg-card border-4 border-foreground rounded-[2rem] p-6 md:p-8 shadow-pop-lg relative min-h-[140px] flex flex-col justify-between">
          <div className="absolute -top-4 -left-4 bg-primary text-primary-foreground border-4 border-foreground rounded-full p-3 shadow-pop">
             <MessageCircle className="w-6 h-6" />
          </div>
          <div className="absolute top-6 right-6">
             <Sparkles className="w-6 h-6 text-muted-foreground animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest text-primary mb-2 ml-8">Lumio</div>
            <p className="text-lg md:text-xl font-bold leading-relaxed text-foreground ml-8">
              "{message}"
            </p>
          </div>
          
          {actionButton && (
            <div className="self-end mt-4">
              {actionButton}
            </div>
          )}
        </div>

      </div>
    );
  }

  // Side Position (For Level Select map)
  return (
    <div className={cn("w-full flex items-center justify-center gap-4 bg-card border-4 border-foreground rounded-[2rem] p-6 shadow-pop mb-12 animate-fade-up", className)}>
       <div className="w-16 h-16 shrink-0 bg-primary rounded-full border-4 border-foreground flex items-center justify-center shadow-pop overflow-hidden">
          {/* Face crop of SVG */}
          <svg viewBox="20 10 60 50" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 15C58.2843 15 65 21.7157 65 30C65 38.2843 58.2843 45 50 45C41.7157 45 35 38.2843 35 30C35 21.7157 41.7157 15 50 15Z" fill="hsl(var(--primary))" stroke="hsl(var(--foreground))" strokeWidth="4"/>
          </svg>
       </div>
       <div className="flex-1">
          <div className="text-xs font-black uppercase tracking-widest text-primary mb-1">Lumio says:</div>
          <p className="text-lg font-bold text-foreground">"{message}"</p>
       </div>
    </div>
  );
};
