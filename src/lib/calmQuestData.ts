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
      { id: 2, title: "Noise Escape", gameplayMechanic: "pathfinding", goal: "Find calming tools before sensory overload happens.", avoid: "Loud noises", lumioQuote: "It's always okay to step away and find a quiet space." },
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
      { id: 1, title: "Safe Response", gameplayMechanic: "survival", goal: "Move away safely and reach a trusted adult.", avoid: "Escalating the situation", lumioQuote: "Walking away is sometimes the bravest thing you can do." },
      { id: 2, title: "Party Control", gameplayMechanic: "survival", goal: "Balance conversations and take calming breaks at a party.", avoid: "Social overload", lumioQuote: "Taking a break doesn't mean the party is over." },
      { id: 3, title: "Find My Parent", gameplayMechanic: "pathfinding", goal: "Navigate the mall safely to find the help desk.", avoid: "Unsafe strangers", lumioQuote: "When lost, always look for someone who can help." },
    ]
  }
];
