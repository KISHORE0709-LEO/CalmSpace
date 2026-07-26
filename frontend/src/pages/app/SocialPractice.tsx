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
      {/* Full Page Illustrative Background (Only after onboarding) */}
      {view !== "onboarding" && (
        <>
          <div 
            className="fixed inset-0 z-0 opacity-70"
            style={{
              backgroundImage: "url('/backgrounds/social_bg.png')",
              backgroundSize: '1000px', // Larger pattern
              backgroundRepeat: 'repeat',
              backgroundPosition: 'top center'
            }}
          />
          {/* Light soft overlay to ensure readability without hiding the background */}
          <div className="fixed inset-0 z-0 bg-background/60 backdrop-blur-[1px]" />
        </>
      )}

      <div className="relative z-10 w-full min-h-[calc(100vh-6rem)] flex flex-col">
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
              <div className="bg-background/80 backdrop-blur-md p-4 rounded-2xl border-2 border-foreground/10 shadow-sm">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-1">{currentWorld.title}</h2>
                <p className="text-muted-foreground font-medium">CalmQuest — Level Select</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setView("worldSelect")} className="rounded-full shadow-pop-sm bg-background/90 hover:bg-background">
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
