import { useState } from "react";
import { worlds } from "@/lib/calmQuestData";
import { VisualNovelMechanic } from "./Mechanics/VisualNovelMechanic";
import { ChatSimulationMechanic } from "./Mechanics/ChatSimulationMechanic";
import { TensionMeterMechanic } from "./Mechanics/TensionMeterMechanic";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";

interface Props {
  worldId: number;
  levelId: number;
  onBack: () => void;
  onLevelComplete: (stars: number, xp: number) => void;
}

export const LevelRunner = ({ worldId, levelId, onBack, onLevelComplete }: Props) => {
  const [showMitraIntro, setShowMitraIntro] = useState(true);
  
  const world = worlds.find(w => w.id === worldId);
  const level = world?.levels.find(l => l.id === levelId);

  if (!world || !level) return <div>Level not found</div>;

  return (
    <div className="w-full max-w-4xl mx-auto animate-scale-in">
      {/* Level Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" size="sm" onClick={onBack} className="rounded-full shadow-pop-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Map
        </Button>
        <div className="text-right">
          <h2 className="text-2xl font-black tracking-tight">{level.title}</h2>
          <p className="text-sm font-medium text-muted-foreground">{world.title} - Level {level.id}</p>
        </div>
      </div>

      {showMitraIntro ? (
        <div className="max-w-lg mx-auto bg-card p-8 rounded-[2rem] border-4 border-foreground shadow-pop-lg text-center relative mt-12 animate-fade-up">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary rounded-full border-4 border-foreground shadow-pop flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-black mt-8 mb-2">Mitra says:</h3>
          <p className="text-lg font-medium text-muted-foreground mb-8">"{level.mitraTip}"</p>
          <Button size="lg" className="w-full rounded-full text-lg shadow-pop-sm transition-transform hover:-translate-y-1" onClick={() => setShowMitraIntro(false)}>
            Start Scenario
          </Button>
        </div>
      ) : (
        <div className="animate-fade-up">
          {level.mechanic === "visual_novel" && <VisualNovelMechanic level={level} onComplete={onLevelComplete} />}
          {level.mechanic === "chat" && <ChatSimulationMechanic level={level} onComplete={onLevelComplete} />}
          {level.mechanic === "tension" && <TensionMeterMechanic level={level} onComplete={onLevelComplete} />}
        </div>
      )}
    </div>
  );
};
