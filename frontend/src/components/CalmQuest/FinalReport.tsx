import { Button } from "@/components/ui/button";
import { Trophy, Star, TrendingUp, Home } from "lucide-react";

interface Props {
  stars: number;
  xp: number;
  onHome: () => void;
}

export const FinalReport = ({ stars, xp, onHome }: Props) => {
  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-[2rem] border-4 border-foreground shadow-pop-lg overflow-hidden relative p-8 animate-scale-in">
      
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-secondary rounded-full border-4 border-foreground shadow-pop flex items-center justify-center relative">
          <Trophy className="w-10 h-10 text-secondary-foreground" />
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-black px-2 py-1 rounded-full border-2 border-foreground rotate-12">
            100%
          </div>
        </div>
      </div>

      <h2 className="text-center text-3xl font-black mb-2">Quest Complete!</h2>
      <p className="text-center text-muted-foreground font-medium mb-8">You've mastered all social scenarios.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-muted border-2 border-foreground rounded-xl p-4 flex flex-col items-center shadow-inner">
          <Star className="w-6 h-6 text-yellow-500 fill-yellow-500 mb-2" />
          <span className="text-2xl font-black">{stars}</span>
          <span className="text-xs font-bold text-muted-foreground uppercase">Stars</span>
        </div>
        <div className="bg-muted border-2 border-foreground rounded-xl p-4 flex flex-col items-center shadow-inner">
          <TrendingUp className="w-6 h-6 text-green-500 mb-2" />
          <span className="text-2xl font-black">{xp}</span>
          <span className="text-xs font-bold text-muted-foreground uppercase">Total XP</span>
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="bg-background border-2 border-foreground rounded-xl p-5 mb-8 shadow-sm">
        <h3 className="font-bold text-sm mb-4">Skill Mastery</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Emotional Regulation</span>
              <span>95%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-green-500 w-[95%]" /></div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Communication</span>
              <span>88%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-[88%]" /></div>
          </div>
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Boundary Setting</span>
              <span>92%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden"><div className="h-full bg-purple-500 w-[92%]" /></div>
          </div>
        </div>
      </div>

      <Button onClick={onHome} size="lg" className="w-full rounded-full text-lg shadow-pop-sm hover:-translate-y-1 transition-transform">
        <Home className="w-5 h-5 mr-2" /> Return to Map
      </Button>
    </div>
  );
};
