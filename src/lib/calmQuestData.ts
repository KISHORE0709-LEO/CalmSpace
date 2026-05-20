export type WorldId = 1 | 2 | 3;
export type LevelId = 1 | 2 | 3 | 4 | 5;

export interface CinematicLevelData {
  id: LevelId;
  title: string;
  gameplayMechanic: "collection" | "pathfinding" | "survival";
  lumioQuote: string;
  goal: string;
  avoid: string;
}

export interface CinematicWorldData {
  id: WorldId;
  title: string;
  theme: string;
  color: string;
  gradient: string;
  lumioIntro: string;
  levels: CinematicLevelData[];
}

export const worlds: CinematicWorldData[] = [
  {
    id: 1,
    title: "Echo Academy",
    theme: "School/college confidence",
    color: "bg-primary",
    gradient: "from-primary to-background",
    lumioIntro: "Confidence begins where fear first speaks.",
    levels: [
      { id: 1, title: "First Spark", gameplayMechanic: "collection", goal: "Collect Confidence Orbs", avoid: "Panic Clouds", lumioQuote: "Every spark of confidence pushes the fog away." },
      { id: 2, title: "Broken Signal", gameplayMechanic: "collection", goal: "Collect Confidence Orbs", avoid: "Panic Clouds", lumioQuote: "Even when interrupted, your signal remains strong." },
      { id: 3, title: "Spotlight Drift", gameplayMechanic: "collection", goal: "Collect Confidence Orbs", avoid: "Panic Clouds", lumioQuote: "The spotlight is warm, not burning." },
      { id: 4, title: "Team Orbit", gameplayMechanic: "collection", goal: "Collect Confidence Orbs", avoid: "Panic Clouds", lumioQuote: "Find your orbit even when others drift." },
      { id: 5, title: "Mirror Marks", gameplayMechanic: "collection", goal: "Collect Confidence Orbs", avoid: "Panic Clouds", lumioQuote: "The only reflection that matters is your own." },
    ]
  },
  {
    id: 2,
    title: "The Social Tide",
    theme: "Friendship & Belonging",
    color: "bg-secondary",
    gradient: "from-secondary to-background",
    lumioIntro: "Navigating connection means learning how to float.",
    levels: [
      { id: 1, title: "Silent Waves", gameplayMechanic: "pathfinding", goal: "Navigate Trust Bridges", avoid: "Silent Waves", lumioQuote: "Silence is just water settling. Keep moving." },
      { id: 2, title: "Echo Room", gameplayMechanic: "pathfinding", goal: "Navigate Trust Bridges", avoid: "Shadow Claims", lumioQuote: "Echoes fade. Your path remains solid." },
      { id: 3, title: "Missing Seat", gameplayMechanic: "pathfinding", goal: "Navigate Trust Bridges", avoid: "Silent Waves", lumioQuote: "You don't need a seat when you can build a bridge." },
      { id: 4, title: "Shadow Claim", gameplayMechanic: "pathfinding", goal: "Navigate Trust Bridges", avoid: "Shadow Claims", lumioQuote: "A shadow only exists because of your light." },
      { id: 5, title: "Rush Current", gameplayMechanic: "pathfinding", goal: "Navigate Trust Bridges", avoid: "Silent Waves", lumioQuote: "Let the rush pass you by. You set the pace." },
    ]
  },
  {
    id: 3,
    title: "Storm Within",
    theme: "Conflict & Emotional Regulation",
    color: "bg-accent",
    gradient: "from-accent to-background",
    lumioIntro: "The hardest battles are often inside us.",
    levels: [
      { id: 1, title: "Thunder Step", gameplayMechanic: "survival", goal: "Collect Calm Energy", avoid: "Emotional Spikes", lumioQuote: "Thunder is loud, but it passes quickly." },
      { id: 2, title: "Pressure Loop", gameplayMechanic: "survival", goal: "Collect Calm Energy", avoid: "Emotional Spikes", lumioQuote: "Break the loop. Step into the calm." },
      { id: 3, title: "Iron Voice", gameplayMechanic: "survival", goal: "Collect Calm Energy", avoid: "Emotional Spikes", lumioQuote: "You do not have to bend to iron." },
      { id: 4, title: "Whisper Storm", gameplayMechanic: "survival", goal: "Collect Calm Energy", avoid: "Emotional Spikes", lumioQuote: "Whispers blow away like dry leaves." },
      { id: 5, title: "Gentle Repair", gameplayMechanic: "survival", goal: "Collect Calm Energy", avoid: "Emotional Spikes", lumioQuote: "Every storm leaves fertile ground behind." },
    ]
  }
];
