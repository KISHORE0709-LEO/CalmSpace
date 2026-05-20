import { useState } from "react";
import { worlds } from "@/lib/calmQuestData";
import { EchoAcademyMechanic } from "./Engine/EchoAcademyMechanic";
import { SocialTideMechanic } from "./Engine/SocialTideMechanic";
import { StormWithinMechanic } from "./Engine/StormWithinMechanic";
import { DynamicLumio } from "./DynamicLumio";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";

interface Props {
  worldId: number;
  levelId: number;
  onBack: () => void;
  onLevelComplete: (stars: number, xp: number) => void;
}

export const LevelRunner = ({ worldId, levelId, onBack, onLevelComplete }: Props) => {
  const [showIntro, setShowIntro] = useState(true);
  
  const world = worlds.find(w => w.id === worldId);
  const level = world?.levels.find(l => l.id === levelId);

  if (!world || !level) return <div>Level not found</div>;

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-up min-h-[calc(100vh-12rem)] flex flex-col justify-start pt-8">
      {/* Level Header */}
      <div className="flex items-center justify-between mb-12">
        <Button variant="outline" size="sm" onClick={onBack} className="rounded-full shadow-pop-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Map
        </Button>
        <div className="text-right">
          <h2 className="text-2xl font-black tracking-tight text-foreground">{level.title}</h2>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{world.title} - Level {level.id}</p>
        </div>
      </div>

      {showIntro ? (
        <div className="flex flex-col items-center animate-fade-up mt-8">
          <DynamicLumio 
            message={level.lumioQuote} 
            mood="thoughtful"
            position="bottom"
          />
          
          <Button size="lg" className="rounded-full text-xl py-6 px-12 shadow-pop hover:-translate-y-1 transition-transform" onClick={() => setShowIntro(false)}>
            <Play className="mr-3 w-6 h-6" /> Start the Game
          </Button>
        </div>
      ) : (
        <div className="animate-fade-up w-full">
          {level.gameplayMechanic === "collection" && <EchoAcademyMechanic level={level} onComplete={onLevelComplete} />}
          {level.gameplayMechanic === "pathfinding" && <SocialTideMechanic level={level} onComplete={onLevelComplete} />}
          {level.gameplayMechanic === "survival" && <StormWithinMechanic level={level} onComplete={onLevelComplete} />}
        </div>
      )}
    </div>
  );
};
