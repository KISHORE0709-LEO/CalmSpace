import { useState, useEffect } from "react";
import { Sparkles, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onComplete: () => void;
}

export const OnboardingSequence = ({ onComplete }: Props) => {
  const [phase, setPhase] = useState<number>(0);

  useEffect(() => {
    // Cinematic timings
    const timers = [
      setTimeout(() => setPhase(1), 1000),  // Fade in background / stars
      setTimeout(() => setPhase(2), 3000),  // Reveal Lumio
      setTimeout(() => setPhase(3), 5000),  // First text
      setTimeout(() => setPhase(4), 9000),  // Second text
      setTimeout(() => setPhase(5), 13000), // Reveal Button
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center overflow-hidden">
      
      {/* Ambient background particles */}
      <div className={`absolute inset-0 transition-opacity duration-3000 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
      </div>

      {/* Lumio Character */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-[2000ms] ease-out ${phase >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-90'}`}>
        {/* Lumio Body */}
        <div className="w-48 h-48 sm:w-64 sm:h-64 relative mb-12 animate-float">
          {/* Glowing Aura */}
          <div className="absolute inset-[-20%] bg-primary/30 rounded-full blur-2xl animate-pulse-soft" />
          {/* Physical Form */}
          <div className="w-full h-full bg-gradient-to-br from-background via-primary/50 to-secondary rounded-[3rem] border-4 border-foreground shadow-pop-lg flex items-center justify-center overflow-hidden rotate-45">
            <div className="flex flex-col items-center">
               <UserCircle className="w-24 h-24 text-foreground mb-2" strokeWidth={1.5} />
               <Sparkles className="w-8 h-8 text-foreground absolute top-4 right-4 animate-bounce-slow" />
            </div>
          </div>
        </div>

        {/* Text Area */}
        <div className="h-32 flex flex-col items-center justify-center text-center px-4 max-w-2xl">
          <p className={`text-2xl sm:text-4xl font-black tracking-tight text-foreground transition-all duration-1000 absolute ${phase === 3 ? 'opacity-100 translate-y-0 blur-none' : 'opacity-0 translate-y-4 blur-sm'}`}>
            "Welcome, traveler..."
          </p>
          <p className={`text-xl sm:text-3xl font-bold text-muted-foreground leading-relaxed transition-all duration-1000 absolute ${phase >= 4 ? 'opacity-100 translate-y-0 blur-none' : 'opacity-0 translate-y-4 blur-sm'}`}>
            "Every challenge becomes easier when practiced in a safe place."
          </p>
        </div>

        {/* Enter Button */}
        <div className={`mt-16 transition-all duration-1000 ${phase >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
          <Button onClick={onComplete} size="lg" className="rounded-full text-xl px-12 py-8 shadow-pop-lg hover:-translate-y-2 hover:shadow-pop-lg bg-foreground text-background group">
            Begin Journey <Sparkles className="ml-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
};
