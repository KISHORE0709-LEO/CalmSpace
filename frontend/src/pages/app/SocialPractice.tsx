import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { CinematicWorldSelect } from "@/components/CalmQuest/Cinematic/CinematicWorldSelect";
import { OnboardingSequence } from "@/components/CalmQuest/Cinematic/OnboardingSequence";
import { LevelRunner } from "@/components/CalmQuest/LevelRunner";
import { WorldMap } from "@/components/CalmQuest/WorldMap";
import { DynamicLumio } from "@/components/CalmQuest/DynamicLumio";
import { CinematicWorldData, worlds } from "@/lib/calmQuestData";
import { useCalmQuestProgress } from "@/hooks/useCalmQuestProgress";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type ViewState = "onboarding" | "worldSelect" | "levelSelect" | "level";

const SocialPractice = () => {
  const [view, setView] = useState<ViewState>("onboarding");
  const [currentWorldId, setCurrentWorldId] = useState<number | null>(null);
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);

  const { progress, completeLevel } = useCalmQuestProgress();
  const currentWorld = worlds.find(w => w.id === currentWorldId);

  useEffect(() => {
    // Always show the CalmQuest title screen when clicking the tab, as requested.
    // if (progress.xp > 0) setView("worldSelect");
  }, []);

  const handleWorldSelect = (world: CinematicWorldData) => {
    setCurrentWorldId(world.id);
    setView("levelSelect");
  };

  const handleSelectLevel = (worldId: number, levelId: number) => {
    setCurrentWorldId(worldId);
    setCurrentLevelId(levelId);
    setView("level");
  };

  const handleLevelComplete = (stars: number, xp: number) => {
    if (currentWorldId !== null && currentLevelId !== null) {
      completeLevel(currentWorldId, currentLevelId, stars, xp);
      setView("levelSelect");
    }
  };

  return (
    <AppShell title="" subtitle="">
      <div className="relative w-full">

        {view === "onboarding" && (
          <OnboardingSequence onComplete={() => setView("worldSelect")} />
        )}

        {view === "worldSelect" && (
          <div className="w-full flex flex-col items-center animate-fade-up mt-4">
            <DynamicLumio
              message="Welcome to CalmQuest. Choose a realm to begin practicing your social confidence."
              mood="calm"
              position="side"
            />
            <CinematicWorldSelect onSelectWorld={handleWorldSelect} />
          </div>
        )}

        {view === "levelSelect" && currentWorldId && currentWorld && (
          <div className="w-full max-w-5xl mx-auto animate-fade-up mt-4">
            <div className="w-full mb-8 text-left flex items-center justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-1">{currentWorld.title}</h2>
                <p className="text-muted-foreground font-medium">CalmQuest — Level Select</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setView("worldSelect")} className="rounded-full shadow-pop-sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Realms
              </Button>
            </div>
            <DynamicLumio
              message={currentWorld.lumioIntro}
              mood="thoughtful"
              position="side"
            />
            <WorldMap worldId={currentWorldId} onSelectLevel={handleSelectLevel} />
          </div>
        )}

        {view === "level" && currentWorldId && currentLevelId && (
          <LevelRunner
            worldId={currentWorldId}
            levelId={currentLevelId}
            onBack={() => setView("levelSelect")}
            onLevelComplete={handleLevelComplete}
          />
        )}
      </div>
    </AppShell>
  );
};

export default SocialPractice;
