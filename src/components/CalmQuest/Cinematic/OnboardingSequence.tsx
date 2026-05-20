import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicLumio } from "../DynamicLumio";

interface Props {
  onComplete: () => void;
}

export const OnboardingSequence = ({ onComplete }: Props) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 relative animate-fade-in">
      
      {/* Abstract Background Particles (Not full screen, just container) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[3rem] z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-[80px] animate-pulse-soft" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full relative z-10 px-4">
        <DynamicLumio 
          message="Welcome, traveler... Every challenge becomes easier when practiced in a safe place."
          mood="calm"
          position="bottom"
          actionButton={
            <Button 
              onClick={onComplete} 
              size="lg" 
              className="rounded-full text-lg px-8 py-6 shadow-pop hover:-translate-y-1 transition-all duration-300 bg-foreground text-background group"
            >
              Begin Journey <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
            </Button>
          }
        />
      </div>

    </div>
  );
};
