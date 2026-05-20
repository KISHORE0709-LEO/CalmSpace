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
    title: "School & Friendship",
    theme: "Navigating School Life",
    color: "bg-primary",
    gradient: "from-primary to-background",
    lumioIntro: "School is a big place, but you have everything you need to make great friends.",
    levels: [
      { id: 1, title: "Greeting Run", gameplayMechanic: "pathfinding", goal: "Greet students and teachers while avoiding rude collisions.", avoid: "Ignoring people", lumioQuote: "A simple hello is the start of a great friendship." },
      { id: 2, title: "Share Dash", gameplayMechanic: "collection", goal: "Quickly deliver requested items like pencils and books.", avoid: "Running out of time", lumioQuote: "Sharing makes the classroom brighter for everyone." },
      { id: 3, title: "Team Task", gameplayMechanic: "survival", goal: "Help teammates and organize tasks to complete a project.", avoid: "Classroom chaos", lumioQuote: "Working together turns a hard task into a fun one." },
    ]
  },
  {
    id: 2,
    title: "Emotions & Calm",
    theme: "Emotional Regulation",
    color: "bg-secondary",
    gradient: "from-secondary to-background",
    lumioIntro: "Every feeling is valid. Let's learn to understand and embrace them.",
    levels: [
      { id: 1, title: "Emotion Pop", gameplayMechanic: "collection", goal: "Match emotion icons to clear levels.", avoid: "Unmatched emotions", lumioQuote: "Matching your feelings helps you understand them." },
      { id: 2, title: "Calm Control", gameplayMechanic: "harmony", goal: "Balance sensory inputs using guided breathing and tactile fidgets.", avoid: "Sensory overload", lumioQuote: "Stimming and breathing are great ways to keep your body calm." },
      { id: 3, title: "Calm Room Builder", gameplayMechanic: "collection", goal: "Build a personalized calming space with sensory objects.", avoid: "Clutter", lumioQuote: "Your calm space is your safe space. Make it yours." },
    ]
  },
  {
    id: 3,
    title: "Real-Life Safety",
    theme: "Safety & Boundaries",
    color: "bg-accent",
    gradient: "from-accent to-background",
    lumioIntro: "The real world can be unpredictable, but you can always stay safe and in control.",
    levels: [
      { id: 1, title: "Bully Block", gameplayMechanic: "evasion", goal: "Walk away calmly and reach the counselor's office safely.", avoid: "Aggressive reactions", lumioQuote: "Walking away is sometimes the bravest thing you can do." },
      { id: 2, title: "Peer Pressure Panic", gameplayMechanic: "avoidance", goal: "Walk away from negative pressure zones and join support groups.", avoid: "Giving in to pressure", lumioQuote: "You always have the right to say no and walk away." },
      { id: 3, title: "Safe Stranger Quest", gameplayMechanic: "safety", goal: "Explore the mall, verify badges, and reach the security desk.", avoid: "Suspicious strangers", lumioQuote: "When lost, always look for a badge or security uniform." },
    ]
  }
];
