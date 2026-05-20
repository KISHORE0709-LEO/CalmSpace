export type WorldId = 1 | 2 | 3;
export type LevelId = 1 | 2 | 3 | 4 | 5;

export interface Choice {
  id: string;
  text: string;
  simplifiedText: string; // for Overloaded emotion
  isCorrect: boolean;
  feedback: string;
}

export interface ScenarioStep {
  characterName?: string;
  avatar?: string;
  dialogue: string;
  simplifiedDialogue: string; // for Overloaded emotion
  choices?: Choice[];
  nextStepId?: string; // id of next step if no choices, or choice leads to step
}

export interface LevelData {
  id: LevelId;
  title: string;
  scenarioDescription: string;
  mechanic: "visual_novel" | "chat" | "tension";
  steps: Record<string, ScenarioStep>;
  initialStepId: string;
  mitraTip: string;
}

export interface WorldData {
  id: WorldId;
  title: string;
  theme: string;
  description: string;
  color: string;
  levels: LevelData[];
}

export const worlds: WorldData[] = [
  {
    id: 1,
    title: "Campus Life",
    theme: "College confidence and classroom situations",
    description: "Navigate through common college situations.",
    color: "bg-blue-400",
    levels: [
      {
        id: 1,
        title: "Cold Call",
        scenarioDescription: "Teacher unexpectedly asks a question you don't know.",
        mechanic: "visual_novel",
        initialStepId: "start",
        steps: {
          "start": {
            characterName: "Professor Smith",
            dialogue: "You there! What is the primary cause of this phenomenon we just discussed?",
            simplifiedDialogue: "What is the answer?",
            choices: [
              { id: "a", text: "Stare blankly and freeze.", simplifiedText: "Freeze.", isCorrect: false, feedback: "Freezing happens! But trying to respond helps more." },
              { id: "b", text: "I'm not sure, but I think it relates to...", simplifiedText: "Try to guess.", isCorrect: true, feedback: "Great! Showing effort is better than perfection." },
              { id: "c", text: "I didn't do the reading, sorry.", simplifiedText: "I didn't read.", isCorrect: false, feedback: "Honesty is okay, but try pivoting instead of shutting down." }
            ]
          }
        },
        mitraTip: "It's okay not to know everything. Taking a deep breath before speaking helps!"
      },
      // ... more levels for World 1 (will be expanded in actual components)
    ]
  },
  {
    id: 2,
    title: "Social Circle",
    theme: "Friendships, peer pressure, social belonging",
    description: "Learn to handle complex social dynamics.",
    color: "bg-purple-400",
    levels: [
      {
        id: 1,
        title: "Seen Zone",
        scenarioDescription: "Friend suddenly ghosts you.",
        mechanic: "chat",
        initialStepId: "start",
        steps: {
          "start": {
            characterName: "Alex",
            dialogue: "Hey are we still on for later? (Read 12:00 PM)",
            simplifiedDialogue: "Are we hanging out? (Read)",
            choices: [
              { id: "a", text: "Spam them with question marks.", simplifiedText: "Spam them.", isCorrect: false, feedback: "Spamming might overwhelm them more." },
              { id: "b", text: "Wait a few hours before following up.", simplifiedText: "Wait a bit.", isCorrect: true, feedback: "Good! They might just be busy right now." },
              { id: "c", text: "Assume they hate you.", simplifiedText: "They hate me.", isCorrect: false, feedback: "Don't jump to conclusions!" }
            ]
          }
        },
        mitraTip: "People get busy. Don't let your anxious thoughts fill in the silence."
      }
    ]
  },
  {
    id: 3,
    title: "Pressure Zone",
    theme: "Conflict and emotional control",
    description: "Practice emotional regulation under high stress.",
    color: "bg-orange-400",
    levels: [
      {
        id: 1,
        title: "Heat Wave",
        scenarioDescription: "A stranger suddenly shouts.",
        mechanic: "tension",
        initialStepId: "start",
        steps: {
          "start": {
            characterName: "Angry Stranger",
            dialogue: "Watch where you are walking!!",
            simplifiedDialogue: "Watch out!!",
            choices: [
              { id: "a", text: "Yell back at them.", simplifiedText: "Yell back.", isCorrect: false, feedback: "Escalating the situation increases tension." },
              { id: "b", text: "Say 'Sorry, my bad' calmly and keep walking.", simplifiedText: "Apologize and walk.", isCorrect: true, feedback: "Perfect. De-escalation protects your peace." },
              { id: "c", text: "Run away in panic.", simplifiedText: "Run away.", isCorrect: false, feedback: "You don't need to panic. Stay grounded." }
            ]
          }
        },
        mitraTip: "You can't control others' anger, only your reaction to it."
      }
    ]
  }
];

// Fleshing out remaining levels here...
