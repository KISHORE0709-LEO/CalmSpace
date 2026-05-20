import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { EmotionProvider } from "@/context/EmotionContext";
import { EmotionSelector } from "@/components/CalmQuest/EmotionSelector";
import { CinematicWorldSelect } from "@/components/CalmQuest/Cinematic/CinematicWorldSelect";
import { OnboardingSequence } from "@/components/CalmQuest/Cinematic/OnboardingSequence";
import { LevelRunner } from "@/components/CalmQuest/LevelRunner";
import { WorldMap } from "@/components/CalmQuest/WorldMap";
import { LumioCoach } from "@/components/CalmQuest/LumioCoach";
import { CinematicWorldData, worlds } from "@/lib/calmQuestData";
import { useCalmQuestProgress } from "@/hooks/useCalmQuestProgress";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type ViewState = "onboarding" | "worldSelect" | "levelSelect" | "level";

const CalmQuestApp = () => {
  const [view, setView] = useState<ViewState>("onboarding");
  const [currentWorldId, setCurrentWorldId] = useState<number | null>(null);
  const [currentLevelId, setCurrentLevelId] = useState<number | null>(null);
  
  const { progress, completeLevel } = useCalmQuestProgress();

  useEffect(() => {
    // If they have already played before (e.g. XP > 0), skip cinematic onboarding
    if (progress.xp > 0 && view === "onboarding") {
      setView("worldSelect");
    }
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
      setView("levelSelect"); // Return to the zig-zag map for this world
    }
  };

  const currentWorld = worlds.find(w => w.id === currentWorldId);

  return (
    <div className="relative w-full min-h-[calc(100vh-8rem)]">
      <EmotionSelector />
      
      {view === "onboarding" && (
        <OnboardingSequence onComplete={() => setView("worldSelect")} />
      )}

      {view === "worldSelect" && (
        <div className="w-full flex flex-col items-center animate-fade-up mt-8">
           <LumioCoach 
             message="Welcome to CalmQuest. Choose a realm to begin practicing your social confidence."
             mood="calm"
           />
           <CinematicWorldSelect onSelectWorld={handleWorldSelect} />
        </div>
      )}

      {view === "levelSelect" && currentWorldId && currentWorld && (
        <div className="w-full max-w-5xl mx-auto animate-fade-up mt-8">
           <div className="mb-8">
             <Button variant="outline" size="sm" onClick={() => setView("worldSelect")} className="rounded-full shadow-pop-sm">
               <ArrowLeft className="w-4 h-4 mr-2" /> Back to Realms
             </Button>
           </div>
           
           <LumioCoach 
             message={currentWorld.lumioIntro}
             mood="thoughtful"
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
  );
};

const SocialPractice = () => {
  return (
    <AppShell title="CalmQuest" subtitle="Interactive Social Confidence Journey">
      <EmotionProvider>
        <CalmQuestApp />
      </EmotionProvider>
    </AppShell>
  );
};

export default SocialPractice;
