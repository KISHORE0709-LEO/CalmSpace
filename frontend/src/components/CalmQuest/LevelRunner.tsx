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
import { TeamTask } from "./Engine/TeamTask";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Props {
  worldId: number;
  levelId: number;
  onBack: () => void;
  onLevelComplete: (stars: number, xp: number) => void;
}

const INTRO_CARDS: Record<string, { icon: string; accentClass: string; steps: { emoji: string; text: string }[] }> = {
  "2-1": {
    icon: "😊",
    accentClass: "text-secondary",
    steps: [
      { emoji: "😊", text: "A board of emotion tiles fills the screen" },
      { emoji: "👆", text: "Swipe adjacent tiles to swap them" },
      { emoji: "🎯", text: "Match 3 or more of the same emotion in a row or column" },
      { emoji: "💥", text: "Matched tiles pop and new ones fall in" },
      { emoji: "⏱️", text: "Score as many points as you can in 60 seconds" },
    ],
  },
  "2-2": {
    icon: "🌬️",
    accentClass: "text-secondary",
    steps: [
      { emoji: "🌬️", text: "Switch between Breathing, Fidget Pop, and Soundscape tabs" },
      { emoji: "🫁", text: "Breathing: hold the circle to inhale, release to exhale" },
      { emoji: "🪀", text: "Fidget: tap the bubbles on the pop-it board" },
      { emoji: "🎧", text: "Soundscape: drag the sliders to mix calming sounds" },
      { emoji: "💚", text: "Fill the Sensory Balance bar to 100% to win" },
    ],
  },
  "2-3": {
    icon: "🏮",
    accentClass: "text-secondary",
    steps: [
      { emoji: "🛋️", text: "Drag items from the Cozy Inventory into your room" },
      { emoji: "✅", text: "Calming items (lamps, plants, bean bags) raise your score" },
      { emoji: "🚨", text: "Avoid strobes and loud alarms — they lower your score" },
      { emoji: "🔄", text: "Tap a placed item to rotate, resize, or remove it" },
      { emoji: "🎯", text: "Reach an Atmosphere Score of 100 to complete the level" },
    ],
  },
  "3-1": {
    icon: "🏫",
    accentClass: "text-accent",
    steps: [
      { emoji: "🧑", text: "You are the blue circle — move with WASD or arrow keys" },
      { emoji: "😈", text: "Orange bullies patrol the corridor — avoid their detection zones" },
      { emoji: "🗄️", text: "Hide in purple locker alcoves to calm down (press SPACE)" },
      { emoji: "🧑\u200d🤝\u200d🧑", text: "Stay near green friend groups to lower stress" },
      { emoji: "🚪", text: "Reach the Teacher's Room or Counselor's Office to win" },
    ],
  },
  "3-2": {
    icon: "🗣️",
    accentClass: "text-accent",
    steps: [
      { emoji: "🧑", text: "Move right through three zones with WASD or arrow keys" },
      { emoji: "🗣️", text: "Dialogue moments will pause the game — choose your response" },
      { emoji: "💛", text: "Saying no keeps your Integrity bar high" },
      { emoji: "🚪", text: "Reach the green Counselor door to escape the pressure" },
      { emoji: "😟", text: "Tip: stay near the hesitant friend to unlock a secret badge" },
    ],
  },
  "3-3": {
    icon: "🔍",
    accentClass: "text-accent",
    steps: [
      { emoji: "🧑", text: "Move through the map with WASD or arrow keys" },
      { emoji: "🔍", text: "Walk near a stranger and press Investigation Lens to scan them" },
      { emoji: "📋", text: "Read the scan results — context, attention, and your feeling" },
      { emoji: "✅", text: "Choose the safest response from the options shown" },
      { emoji: "🍦", text: "When lost in Zone 3, find a safe adult in uniform to help you" },
    ],
  },
};

function IntroCard({ worldId, levelId, onStart, onBack, world, level }: {
  worldId: number; levelId: number; onStart: () => void; onBack: () => void;
  world: { title: string }; level: { title: string; lumioQuote: string };
}) {
  const key = `${worldId}-${levelId}`;
  const card = INTRO_CARDS[key];
  if (!card) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-[2rem]">
      <div className="flex flex-col items-center gap-5 text-center px-6 animate-fade-up max-w-sm w-full">
        <div className="w-20 h-20 rounded-full bg-secondary border-4 border-foreground shadow-pop-lg flex items-center justify-center text-4xl animate-bounce-slow">
          {card.icon}
        </div>
        <div className="bg-card border-4 border-foreground rounded-[2rem] p-5 shadow-pop-lg w-full text-left">
          <div className="mb-3">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{world.title} — Level {levelId}</p>
            <h3 className="text-xl font-black text-foreground">{level.title}</h3>
          </div>
          <p className={`text-xs font-black uppercase tracking-widest mb-3 ${card.accentClass}`}>How to Play</p>
          <ul className="space-y-2.5">
            {card.steps.map((item) => (
              <li key={item.text} className="flex items-center gap-3 text-sm font-semibold">
                <span className="text-xl flex-shrink-0">{item.emoji}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t-2 border-foreground/10">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">✨ Lumio says</p>
            <p className="text-sm font-semibold text-muted-foreground italic">"{level.lumioQuote}"</p>
          </div>
        </div>
        <button
          onClick={onStart}
          className="w-full bg-secondary text-secondary-foreground border-4 border-foreground rounded-2xl px-8 py-4 text-lg font-black shadow-pop-lg hover:shadow-pop hover:-translate-y-1 transition-all"
        >
          Start the Game 🎮
        </button>
        <button onClick={onBack} className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Map
        </button>
      </div>
    </div>
  );
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

  // World 1 Level 2 — ShareDash
  if (worldId === 1 && levelId === 2) {
    return <ShareDash level={level} onComplete={onLevelComplete} onBack={onBack} />;
  }

  // World 1 Level 3 — TeamTask
  if (worldId === 1 && levelId === 3) {
    return <TeamTask onComplete={onLevelComplete} onBack={onBack} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-up min-h-[calc(100vh-12rem)] flex flex-col justify-start pt-8">
      {/* Level Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="outline" size="sm" onClick={onBack} className="rounded-full shadow-pop-sm">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Map
        </Button>
        <div className="text-right">
          <h2 className="text-2xl font-black tracking-tight text-foreground">{level.title}</h2>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{world.title} - Level {level.id}</p>
        </div>
      </div>

      <div className="relative animate-fade-up w-full">
        {showIntro && (
          <IntroCard
            worldId={worldId}
            levelId={levelId}
            onStart={() => setShowIntro(false)}
            onBack={onBack}
            world={world}
            level={level}
          />
        )}

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
    </div>
  );
};
