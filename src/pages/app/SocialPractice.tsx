import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { EmotionProvider } from "@/context/EmotionContext";
import { EmotionSelector } from "@/components/CalmQuest/EmotionSelector";
import { WorldMap } from "@/components/CalmQuest/WorldMap";
import { LevelRunner } from "@/components/CalmQuest/LevelRunner";
import { CalmingCheckpoint } from "@/components/CalmQuest/CalmingCheckpoint";
import { FinalReport } from "@/components/CalmQuest/FinalReport";
import { useCalmQuestProgress } from "@/hooks/useCalmQuestProgress";
import { worlds } from "@/lib/calmQuestData";

type ViewState = "map" | "level" | "checkpoint" | "report";

const CalmQuestApp = () => {
  const [view, setView] = useState<ViewState>("map");
  const [currentWorldId, setCurrentWorldId] = useState<number | null>(null);
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  
  const { progress, completeLevel } = useCalmQuestProgress();

  const handleSelectLevel = (worldId: number, levelId: number) => {
    setCurrentWorldId(worldId);
    setCurrentLevelId(levelId);
    setView("level");
  };

  const handleLevelComplete = (stars: number, xp: number) => {
    if (currentWorldId !== null && currentLevelId !== null) {
      completeLevel(currentWorldId, currentLevelId, stars, xp);
      
      // If just finished level 5, show checkpoint
      if (currentLevelId === 5) {
        if (currentWorldId === 3) {
          setView("report");
        } else {
          setView("checkpoint");
        }
      } else {
        setView("map");
      }
    }
  };

  return (
    <div className="relative w-full min-h-[calc(100vh-8rem)]">
      <EmotionSelector />
      
      {view === "map" && (
        <div className="animate-fade-up">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">CalmQuest</h2>
            <p className="text-muted-foreground font-medium">Your interactive journey to social confidence.</p>
          </div>
          <WorldMap onSelectLevel={handleSelectLevel} />
        </div>
      )}

      {view === "level" && currentWorldId && currentLevelId && (
        <LevelRunner 
          worldId={currentWorldId} 
          levelId={currentLevelId} 
          onBack={() => setView("map")}
          onLevelComplete={handleLevelComplete}
        />
      )}

      {view === "checkpoint" && currentWorldId && (
        <CalmingCheckpoint 
          worldId={currentWorldId} 
          worldTitle={worlds.find(w => w.id === currentWorldId)?.title || ""}
          onContinue={() => setView("map")}
        />
      )}

      {view === "report" && (
        <FinalReport 
          stars={progress.stars} 
          xp={progress.xp} 
          onHome={() => setView("map")}
        />
      )}
    </div>
  );
};

const SocialPractice = () => {
  return (
    <AppShell title="" subtitle="">
      <EmotionProvider>
        <CalmQuestApp />
      </EmotionProvider>
    </AppShell>
  );
};

export default SocialPractice;
