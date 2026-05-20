import { useState } from "react";
import { worlds } from "@/lib/calmQuestData";
import { EchoAcademyMechanic } from "./Engine/EchoAcademyMechanic";
import { SocialTideMechanic } from "./Engine/SocialTideMechanic";
import { StormWithinMechanic } from "./Engine/StormWithinMechanic";
import { GreetingRun } from "./Engine/GreetingRun";
import { ShareDash } from "./Engine/ShareDash";
import { EmotionPop } from "./Games/EmotionPop";
import { CalmControl } from "./Games/CalmControl";
import { MyCalmSpace } from "./Games/MyCalmSpace";
import { BullyBlock } from "./Games/BullyBlock";
import { PeerPressurePanic } from "./Games/PeerPressurePanic";
import { SafeStrangerQuest } from "./Games/SafeStrangerQuest";
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

  // World 1 Level 1 — GreetingRun (custom, handles its own intro)
  if (worldId === 1 && levelId === 1) {
    return <GreetingRun level={level} onComplete={onLevelComplete} onBack={onBack} worldId={worldId} levelId={levelId} />;
  }

  // World 1 Level 2 — ShareDash (custom, handles its own intro)
  if (worldId === 1 && levelId === 2) {
    return <ShareDash level={level} onComplete={onLevelComplete} onBack={onBack} />;
  }

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
          {/* World 2 — Emotions & Calm */}
          {worldId === 2 && levelId === 1 && (
            <EmotionPop
              onComplete={(score) => {
                const stars = score > 1500 ? 3 : score > 800 ? 2 : 1;
                onLevelComplete(stars, Math.floor(score / 10) || 50);
              }}
            />
          )}
          {worldId === 2 && levelId === 2 && (
            <CalmControl
              onComplete={(score) => {
                const stars = score > 800 ? 3 : score > 500 ? 2 : 1;
                onLevelComplete(stars, Math.floor(score / 10) || 50);
              }}
            />
          )}
          {worldId === 2 && levelId === 3 && (
            <MyCalmSpace
              onComplete={(score) => {
                const stars = score >= 100 ? 3 : score >= 70 ? 2 : 1;
                onLevelComplete(stars, score);
              }}
            />
          )}

          {/* World 3 — Real-Life Safety */}
          {worldId === 3 && levelId === 1 && (
            <BullyBlock
              onComplete={(score) => {
                const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;
                onLevelComplete(stars, score);
              }}
            />
          )}
          {worldId === 3 && levelId === 2 && (
            <PeerPressurePanic
              onComplete={(score) => {
                const stars = score >= 70 ? 3 : score >= 40 ? 2 : 1;
                onLevelComplete(stars, score);
              }}
            />
          )}
          {worldId === 3 && levelId === 3 && (
            <SafeStrangerQuest
              onComplete={(score) => {
                const stars = score >= 70 ? 3 : score >= 40 ? 2 : 1;
                onLevelComplete(stars, score);
              }}
            />
          )}

          {/* World 1 Level 3 + fallback */}
          {worldId !== 2 && worldId !== 3 && (
            <>
              {level.gameplayMechanic === "collection"  && <EchoAcademyMechanic level={level} onComplete={onLevelComplete} />}
              {level.gameplayMechanic === "pathfinding" && <SocialTideMechanic  level={level} onComplete={onLevelComplete} />}
              {level.gameplayMechanic === "survival"    && <StormWithinMechanic level={level} onComplete={onLevelComplete} />}
            </>
          )}
        </div>
      )}
    </div>
  );
};
