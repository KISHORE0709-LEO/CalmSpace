import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star, ShieldCheck, AlertTriangle, Sparkles } from "lucide-react";

interface SafeStrangerQuestProps {
  onComplete?: (score: number) => void;
}

interface StrangerCard {
  id: string;
  emoji: string;
  name: string;
  clues: string[];
  isSafe: boolean;
  explanation: string;
  safeLabel: string;   // why safe
  unsafeLabel?: string; // why unsafe
}

const CARDS: StrangerCard[] = [
  {
    id: 'c1',
    emoji: '👮',
    name: 'Police Officer',
    clues: ['Wearing a uniform with a badge', 'Standing near a police car', 'Asks if you need help'],
    isSafe: true,
    explanation: 'Police officers wear official uniforms and badges. They are trained to help children who are lost or in danger.',
    safeLabel: 'Uniform + Badge = Safe helper',
  },
  {
    id: 'c2',
    emoji: '🧑‍🦯',
    name: 'Stranger at Park',
    clues: ['No uniform or badge', 'Offers you sweets from their bag', 'Asks you to come with them'],
    isSafe: false,
    explanation: 'Never go with a stranger who offers you food or asks you to come with them — even if they seem friendly.',
    safeLabel: '',
    unsafeLabel: 'Offering sweets + asking to follow = Unsafe!',
  },
  {
    id: 'c3',
    emoji: '🏪',
    name: 'Shop Worker',
    clues: ['Wearing a store uniform', 'Standing behind the shop counter', 'You are inside the shop'],
    isSafe: true,
    explanation: 'Shop workers in uniform inside their store are safe adults to ask for help if you are lost.',
    safeLabel: 'Uniform + inside their workplace = Safe helper',
  },
  {
    id: 'c4',
    emoji: '🚗',
    name: 'Person in a Car',
    clues: ['Pulls up slowly beside you', 'Asks you to get in the car', 'You don\'t know them'],
    isSafe: false,
    explanation: 'Never get into a car with someone you don\'t know. Always move away and find a trusted adult.',
    safeLabel: '',
    unsafeLabel: 'Unknown person asking you into their car = Very unsafe!',
  },
  {
    id: 'c5',
    emoji: '👩‍⚕️',
    name: 'School Nurse',
    clues: ['Wearing a white uniform', 'Inside the school building', 'Has a name badge'],
    isSafe: true,
    explanation: 'School nurses are trusted adults inside your school. They are there to help you.',
    safeLabel: 'School staff + badge + inside school = Safe',
  },
  {
    id: 'c6',
    emoji: '🧔',
    name: 'Person at Playground',
    clues: ['No children with them', 'Keeps watching you play', 'Asks where your parents are'],
    isSafe: false,
    explanation: 'An adult at a playground with no children of their own who asks about your parents is a warning sign.',
    safeLabel: '',
    unsafeLabel: 'Adult alone + watching + asking about parents = Unsafe!',
  },
  {
    id: 'c7',
    emoji: '🚌',
    name: 'Bus Driver',
    clues: ['Sitting in the driver\'s seat', 'Wearing a uniform', 'On a public bus route'],
    isSafe: true,
    explanation: 'Bus drivers in uniform on public routes are safe adults. You can ask them for help if you are lost.',
    safeLabel: 'Uniform + public role = Safe helper',
  },
  {
    id: 'c8',
    emoji: '📱',
    name: 'Online Stranger',
    clues: ['Met them only online', 'Wants to meet you in person', 'Asks you to keep it secret'],
    isSafe: false,
    explanation: 'Never meet someone in person that you only know online, especially if they ask you to keep it secret.',
    safeLabel: '',
    unsafeLabel: 'Online only + secret meeting = Very unsafe!',
  },
];

type SortResult = 'correct' | 'wrong' | null;

export const SafeStrangerQuest = ({ onComplete }: SafeStrangerQuestProps) => {
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sortResult, setSortResult] = useState<SortResult>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [autoReturn, setAutoReturn] = useState<number | null>(null);
  const [wrongCount, setWrongCount] = useState(0);

  const card = CARDS[cardIdx];
  const total = CARDS.length;
  const progress = Math.round((cardIdx / total) * 100);

  const handleSort = (guessedSafe: boolean) => {
    if (sortResult !== null) return;
    const correct = guessedSafe === card.isSafe;
    setSortResult(correct ? 'correct' : 'wrong');
    if (correct) {
      setScore(s => s + (streak >= 2 ? 15 : 10));
      setStreak(s => s + 1);
    } else {
      setStreak(0);
      setWrongCount(w => w + 1);
    }
    setShowExplanation(true);
  };

  const handleNext = () => {
    setFlipped(false);
    setSortResult(null);
    setShowExplanation(false);
    if (cardIdx + 1 >= total) {
      setGameOver(true);
    } else {
      setCardIdx(i => i + 1);
    }
  };

  useEffect(() => {
    if (!gameOver) return;
    setAutoReturn(6);
  }, [gameOver]);

  useEffect(() => {
    if (autoReturn === null) return;
    if (autoReturn <= 0) { onComplete?.(score); return; }
    const t = setTimeout(() => setAutoReturn(p => p! - 1), 1000);
    return () => clearTimeout(t);
  }, [autoReturn, score, onComplete]);

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  // ── GAME OVER ──
  if (gameOver) {
    return (
      <div className="w-full max-w-lg mx-auto animate-fade-up">
        <div className="bg-card border-4 border-foreground rounded-[2rem] p-8 shadow-pop-lg flex flex-col items-center text-center gap-5">
          <div className="text-7xl animate-bounce-slow">🕵️</div>
          <h2 className="text-3xl font-black text-foreground">Stranger Spotter Complete!</h2>
          <p className="text-base font-semibold text-muted-foreground">
            You sorted all {total} strangers. Remember these clues in real life!
          </p>
          <div className="flex gap-3">
            {[1,2,3].map(i => (
              <Star key={i} className={cn("w-12 h-12", i <= stars ? "fill-yellow-400 text-yellow-400 animate-bounce-slow" : "fill-muted text-muted")}
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <div className="w-full grid grid-cols-3 gap-3">
            <div className="bg-emerald-500/10 border-2 border-emerald-400 rounded-2xl p-3 text-center">
              <p className="text-2xl font-black">{score}</p>
              <p className="text-xs font-black text-emerald-700 uppercase">Score</p>
            </div>
            <div className="bg-primary/10 border-2 border-primary/40 rounded-2xl p-3 text-center">
              <p className="text-2xl font-black">{total - wrongCount}/{total}</p>
              <p className="text-xs font-black text-primary uppercase">Correct</p>
            </div>
            <div className="bg-secondary/10 border-2 border-secondary/40 rounded-2xl p-3 text-center">
              <p className="text-2xl font-black">{streak}🔥</p>
              <p className="text-xs font-black text-secondary-foreground uppercase">Best Streak</p>
            </div>
          </div>

          {/* Key rules recap */}
          <div className="w-full bg-muted/40 border-2 border-foreground/10 rounded-2xl p-4 text-left space-y-2">
            <p className="text-xs font-black uppercase text-muted-foreground mb-2">🔑 Key Rules to Remember</p>
            {[
              { emoji: '✅', text: 'Uniform + badge in a public role = usually safe to ask for help' },
              { emoji: '✅', text: 'Police, shop workers, bus drivers, school staff = safe helpers' },
              { emoji: '❌', text: 'Never get into a stranger\'s car' },
              { emoji: '❌', text: 'Never go with someone offering sweets or gifts' },
              { emoji: '❌', text: 'Never meet someone from online in person secretly' },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-base shrink-0">{r.emoji}</span>
                <p className="text-sm font-semibold text-foreground">{r.text}</p>
              </div>
            ))}
          </div>

          {onComplete && (
            <div className="w-full flex flex-col gap-2">
              <Button onClick={() => onComplete(score)} className="w-full rounded-2xl border-2 border-foreground font-black py-5 shadow-pop text-base">
                Complete Level <Sparkles className="w-4 h-4 ml-2" />
              </Button>
              {autoReturn !== null && (
                <span className="text-sm text-muted-foreground font-black animate-pulse text-center">Returning in {autoReturn}s…</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── MAIN GAME ──
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-5 animate-fade-up">

      {/* HUD */}
      <div className="bg-card border-4 border-foreground rounded-[1.5rem] px-5 py-4 shadow-pop flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs font-black text-muted-foreground mb-1.5">
            <span>Card {cardIdx + 1} of {total}</span>
            <span>Score: {score} {streak >= 2 && <span className="text-orange-500">🔥 {streak} streak!</span>}</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full border-2 border-foreground overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="text-2xl shrink-0">🕵️</div>
      </div>

      {/* Instruction */}
      <div className="bg-primary/10 border-2 border-foreground/20 rounded-2xl px-5 py-3 text-center">
        <p className="text-sm font-black text-foreground">
          Read the clues 👇 then decide — is this stranger <span className="text-emerald-600">SAFE</span> or <span className="text-red-500">UNSAFE</span>?
        </p>
      </div>

      {/* Stranger Card */}
      <div className={cn(
        "w-full bg-card border-4 border-foreground rounded-[2rem] overflow-hidden shadow-pop-lg transition-all duration-300",
        sortResult === 'correct' ? "ring-4 ring-emerald-400" : sortResult === 'wrong' ? "ring-4 ring-red-400" : ""
      )}>
        {/* Card header */}
        <div className={cn(
          "flex items-center gap-4 px-6 py-5 border-b-4 border-foreground",
          sortResult === 'correct' ? "bg-emerald-100" : sortResult === 'wrong' ? "bg-red-100" : "bg-muted/30"
        )}>
          <div className="text-6xl">{card.emoji}</div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Stranger #{cardIdx + 1}</p>
            <h3 className="text-2xl font-black text-foreground">{card.name}</h3>
          </div>
          {sortResult && (
            <div className="ml-auto text-4xl animate-bounce-slow">
              {sortResult === 'correct' ? '✅' : '❌'}
            </div>
          )}
        </div>

        {/* Clues */}
        <div className="px-6 py-5">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">🔍 Clues about this person</p>
          <div className="space-y-2.5">
            {card.clues.map((clue, i) => (
              <div key={i} className="flex items-start gap-3 bg-muted/40 border-2 border-foreground/10 rounded-xl px-4 py-3">
                <span className="text-base shrink-0">👁️</span>
                <p className="text-base font-semibold text-foreground">{clue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Explanation after sorting */}
        {showExplanation && (
          <div className={cn(
            "mx-5 mb-5 rounded-2xl p-4 border-2",
            card.isSafe ? "bg-emerald-50 border-emerald-400" : "bg-red-50 border-red-400"
          )}>
            <div className="flex items-center gap-2 mb-2">
              {card.isSafe
                ? <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                : <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />}
              <p className={cn("text-sm font-black uppercase tracking-wide", card.isSafe ? "text-emerald-700" : "text-red-700")}>
                {card.isSafe ? '✅ This person is SAFE' : '❌ This person is UNSAFE'}
              </p>
            </div>
            <p className="text-sm font-semibold text-foreground leading-relaxed">{card.explanation}</p>
            {card.isSafe
              ? <p className="text-xs font-black text-emerald-700 mt-2 bg-emerald-100 rounded-lg px-3 py-1.5">{card.safeLabel}</p>
              : <p className="text-xs font-black text-red-700 mt-2 bg-red-100 rounded-lg px-3 py-1.5">{card.unsafeLabel}</p>
            }
          </div>
        )}
      </div>

      {/* Sort buttons OR Next */}
      {!showExplanation ? (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSort(true)}
            className="flex flex-col items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white border-4 border-emerald-700 rounded-2xl px-6 py-5 font-black text-lg shadow-[4px_4px_0px_0px_rgba(21,128,61,1)] hover:-translate-y-1 transition-all active:scale-95"
          >
            <span className="text-4xl">✅</span>
            SAFE
            <span className="text-xs font-semibold opacity-80">I can ask for help</span>
          </button>
          <button
            onClick={() => handleSort(false)}
            className="flex flex-col items-center gap-2 bg-red-500 hover:bg-red-600 text-white border-4 border-red-700 rounded-2xl px-6 py-5 font-black text-lg shadow-[4px_4px_0px_0px_rgba(185,28,28,1)] hover:-translate-y-1 transition-all active:scale-95"
          >
            <span className="text-4xl">❌</span>
            UNSAFE
            <span className="text-xs font-semibold opacity-80">Stay away!</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortResult === 'wrong' && (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl px-5 py-3 text-center">
              <p className="text-sm font-black text-amber-800">
                {card.isSafe ? '💡 This one was actually SAFE — look for uniforms and badges!' : '💡 This one was UNSAFE — trust your gut feeling!'}
              </p>
            </div>
          )}
          {sortResult === 'correct' && (
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl px-5 py-3 text-center">
              <p className="text-sm font-black text-emerald-800">
                {streak >= 3 ? `🔥 ${streak} in a row! You're a Stranger Spotter pro!` : '⭐ Correct! Great spotting!'}
              </p>
            </div>
          )}
          <button
            onClick={handleNext}
            className="w-full bg-secondary text-secondary-foreground border-4 border-foreground rounded-2xl px-8 py-5 text-lg font-black shadow-pop-lg hover:-translate-y-1 transition-all"
          >
            {cardIdx + 1 >= total ? 'See Results 🏆' : 'Next Stranger →'}
          </button>
        </div>
      )}
    </div>
  );
};
