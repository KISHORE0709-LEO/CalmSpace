import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star, Award, ShieldCheck, AlertTriangle } from "lucide-react";

interface PeerPressurePanicProps {
  onComplete?: (score: number) => void;
}

type SceneId = 'classroom' | 'hallway' | 'consequence' | 'cutscene' | 'debrief';

interface Choice {
  label: string;
  result: string;
  warning?: string; // shown on bad/neutral choices BEFORE result
  resultEmoji: string;
  integrityDelta: number;
  confidenceDelta: number;
  next: SceneId | 'win' | 'lose';
  isGood?: boolean;
  isBad?: boolean;
}

interface Scene {
  id: SceneId;
  location: string;
  locationEmoji: string;
  bg: string;
  speaker: string;
  speakerEmoji: string;
  dialogue: string;
  context: string;
  choices: Choice[];
}

const SCENES: Scene[] = [
  {
    id: 'classroom',
    location: 'Classroom',
    locationEmoji: '🏫',
    bg: 'from-sky-100 via-blue-50 to-indigo-50',
    speaker: 'Ringleader',
    speakerEmoji: '😏',
    dialogue: '"Hey, we\'re gonna write something mean on Priya\'s locker after class. Come with us — it\'ll be funny."',
    context: 'Your classmate is pressuring you to bully someone. The teacher is busy at the front.',
    choices: [
      {
        label: '🚶 "I don\'t think that\'s a good idea. I\'m not coming."',
        result: 'You stood your ground early. That took real courage!',
        resultEmoji: '💪',
        integrityDelta: 0, confidenceDelta: 15,
        next: 'hallway', isGood: true,
      },
      {
        label: '😐 "Maybe... what are you going to write?"',
        result: 'You didn\'t say no. The ringleader senses your hesitation and pushes harder.',
        warning: 'Staying quiet or being unsure gives bullies more power. Always say NO clearly.',
        resultEmoji: '⚠️',
        integrityDelta: -15, confidenceDelta: -5,
        next: 'hallway',
      },
      {
        label: '😬 "Sure, sounds fun."',
        result: 'Going along felt easier — but you just agreed to hurt someone.',
        warning: 'Never agree to hurt someone just to fit in. Real friends don\'t ask you to do mean things.',
        resultEmoji: '😔',
        integrityDelta: -30, confidenceDelta: -10,
        next: 'hallway', isBad: true,
      },
    ],
  },
  {
    id: 'hallway',
    location: 'School Hallway',
    locationEmoji: '🚪',
    bg: 'from-amber-50 via-yellow-50 to-orange-50',
    speaker: 'Ringleader',
    speakerEmoji: '😤',
    dialogue: '"Okay, your turn now. You write something mean on her locker."',
    context: 'You\'re now at Priya\'s locker. The ringleader is handing you a marker. Others are watching.',
    choices: [
      {
        label: '✋ "No. I\'m not doing that. It\'s mean and I\'m walking away."',
        result: 'You said NO clearly. The ringleader backs off. You head to the counselor.',
        resultEmoji: '🌟',
        integrityDelta: 20, confidenceDelta: 25,
        next: 'win', isGood: true,
      },
      {
        label: '👀 "I\'ll just watch, I won\'t write anything."',
        result: 'Watching is still being part of it. It still hurts Priya.',
        warning: 'Watching someone get bullied without stopping it makes you part of the problem. Walk away or speak up!',
        resultEmoji: '😟',
        integrityDelta: -15, confidenceDelta: -5,
        next: 'consequence',
      },
      {
        label: '✏️ (You take the marker and write something)',
        result: 'The pressure worked this time. You hurt someone who did nothing wrong.',
        warning: 'This is bullying. Writing mean things about someone causes real pain. You should NEVER do this.',
        resultEmoji: '😰',
        integrityDelta: -40, confidenceDelta: -20,
        next: 'cutscene', isBad: true,
      },
    ],
  },
  {
    id: 'consequence',
    location: 'School Hallway',
    locationEmoji: '🚨',
    bg: 'from-red-50 via-rose-50 to-pink-50',
    speaker: 'Teacher',
    speakerEmoji: '👩🏫',
    dialogue: '"What is going on here? I saw everything. What do you have to say for yourself?"',
    context: 'A teacher appeared from around the corner. The ringleader says "We were just joking." Now it\'s your turn to speak.',
    choices: [
      {
        label: '🗣️ "I\'m sorry. We were going to write something mean. It was wrong."',
        result: 'Telling the truth was hard — but you did it. That\'s real integrity.',
        resultEmoji: '💚',
        integrityDelta: 25, confidenceDelta: 20,
        next: 'win', isGood: true,
      },
      {
        label: '🤐 (Say nothing and look at the floor)',
        result: 'Freezing happens. You didn\'t make it worse — but Priya still got hurt.',
        warning: 'Staying silent when you can speak up leaves the victim without support. Try to find your voice next time.',
        resultEmoji: '😶',
        integrityDelta: 0, confidenceDelta: 0,
        next: 'debrief',
      },
      {
        label: '😅 "We were just joking, it\'s not a big deal."',
        result: 'Going along with the lie makes things worse for everyone.',
        warning: 'Lying to a teacher and dismissing someone\'s pain is wrong. "Just joking" is never an excuse for bullying.',
        resultEmoji: '❌',
        integrityDelta: -20, confidenceDelta: -15,
        next: 'cutscene', isBad: true,
      },
    ],
  },
];

export const PeerPressurePanic = ({ onComplete }: PeerPressurePanicProps) => {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [integrity, setIntegrity] = useState(100);
  const [confidence, setConfidence] = useState(30);
  const [phase, setPhase] = useState<'scene' | 'flash' | 'warning' | 'result' | 'win' | 'cutscene' | 'debrief'>('scene');
  const [lastChoice, setLastChoice] = useState<Choice | null>(null);
  const [choiceHistory, setChoiceHistory] = useState<Choice[]>([]);
  const [reflectionDone, setReflectionDone] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [flashColor, setFlashColor] = useState<'red' | 'green'>('green');

  const scene = SCENES[sceneIdx];

  const handleChoice = (choice: Choice) => {
    const newIntegrity = Math.max(0, Math.min(100, integrity + choice.integrityDelta));
    const newConfidence = Math.max(0, Math.min(100, confidence + choice.confidenceDelta));
    setIntegrity(newIntegrity);
    setConfidence(newConfidence);
    setLastChoice(choice);
    setChoiceHistory(prev => [...prev, choice]);
    if (choice.isGood && choiceHistory.every(c => c.isGood)) setShowBadge(true);

    // Flash then warning (if bad/neutral) then result
    setFlashColor(choice.isGood ? 'green' : 'red');
    setPhase('flash');
  };

  // Auto-advance flash → warning or result
  useEffect(() => {
    if (phase !== 'flash') return;
    const t = setTimeout(() => {
      if (lastChoice?.warning) setPhase('warning');
      else setPhase('result');
    }, 600);
    return () => clearTimeout(t);
  }, [phase, lastChoice]);

  const handleNext = () => {
    if (!lastChoice) return;
    const next = lastChoice.next;
    if (next === 'win') { setPhase('win'); return; }
    if (next === 'cutscene') { setPhase('cutscene'); return; }
    if (next === 'debrief') { setPhase('debrief'); return; }
    const nextIdx = SCENES.findIndex(s => s.id === next);
    if (nextIdx !== -1) { setSceneIdx(nextIdx); setPhase('scene'); }
  };

  const handleRestart = () => {
    setSceneIdx(0); setIntegrity(100); setConfidence(30);
    setPhase('scene'); setLastChoice(null); setChoiceHistory([]);
    setReflectionDone(false); setShowBadge(false);
  };

  const finalScore = Math.round((integrity * 0.6) + (confidence * 0.4));
  const stars = finalScore >= 80 ? 3 : finalScore >= 50 ? 2 : 1;

  // ── FLASH ──
  if (phase === 'flash') {
    return (
      <div className={cn(
        "fixed inset-0 z-[999] flex items-center justify-center animate-fade-up",
        flashColor === 'red' ? "bg-red-500/90" : "bg-emerald-500/90"
      )}>
        <div className="text-[8rem] animate-bounce-slow drop-shadow-2xl">
          {flashColor === 'red' ? '❌' : '✅'}
        </div>
      </div>
    );
  }

  // ── WARNING (bad/neutral choice) ──
  if (phase === 'warning' && lastChoice?.warning) {
    return (
      <div className="w-full max-w-xl mx-auto animate-fade-up">
        <div className="bg-red-50 border-4 border-red-500 rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] flex flex-col items-center text-center gap-6">
          {/* Pulsing warning icon */}
          <div className="w-24 h-24 rounded-full bg-red-500 border-4 border-red-700 flex items-center justify-center shadow-lg animate-pulse">
            <AlertTriangle className="w-12 h-12 text-white" strokeWidth={3} />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-2">⚠️ Don't do this!</p>
            <p className="text-xl font-black text-red-900 leading-snug">{lastChoice.warning}</p>
          </div>

          {/* Integrity drop indicator */}
          {lastChoice.integrityDelta < 0 && (
            <div className="w-full bg-red-100 border-2 border-red-300 rounded-2xl px-5 py-3 flex items-center justify-between">
              <span className="text-sm font-black text-red-700">💚 Integrity dropped</span>
              <span className="text-xl font-black text-red-600">{lastChoice.integrityDelta}</span>
            </div>
          )}

          <button
            onClick={() => setPhase('result')}
            className="w-full bg-red-500 text-white border-4 border-red-700 rounded-2xl px-8 py-5 text-lg font-black shadow-[4px_4px_0px_0px_rgba(185,28,28,1)] hover:-translate-y-1 transition-all"
          >
            I understand → See what happens
          </button>
        </div>
      </div>
    );
  }

  // ── RESULT FEEDBACK ──
  if (phase === 'result' && lastChoice) {
    const isGood = lastChoice.isGood;
    return (
      <div className="w-full max-w-xl mx-auto animate-fade-up">
        <div className={cn(
          "bg-card border-4 border-foreground rounded-[2rem] p-8 shadow-pop-lg flex flex-col items-center text-center gap-6",
          isGood ? "ring-4 ring-emerald-400/50" : "ring-4 ring-red-400/30"
        )}>
          <div className="text-7xl animate-bounce-slow">{lastChoice.resultEmoji}</div>
          <p className="text-xl font-black text-foreground leading-snug">{lastChoice.result}</p>

          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm font-black text-muted-foreground uppercase">
              <span>💚 Integrity</span><span>{integrity}%</span>
            </div>
            <div className="w-full h-4 bg-muted rounded-full border-2 border-foreground overflow-hidden">
              <div className={cn("h-full transition-all duration-700 rounded-full", integrity > 60 ? "bg-teal-400" : integrity > 30 ? "bg-amber-400" : "bg-red-400")}
                style={{ width: `${integrity}%` }} />
            </div>
          </div>

          <button
            onClick={handleNext}
            className={cn(
              "w-full border-4 border-foreground rounded-2xl px-8 py-5 text-lg font-black shadow-pop-lg hover:-translate-y-1 transition-all",
              isGood ? "bg-secondary text-secondary-foreground" : "bg-card text-foreground"
            )}
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ── WIN ──
  if (phase === 'win') {
    return (
      <div className="w-full max-w-xl mx-auto animate-fade-up">
        <div className="bg-card border-4 border-foreground rounded-[2rem] p-8 shadow-pop-lg flex flex-col items-center text-center gap-6">
          <div className="text-7xl animate-bounce-slow">🌟</div>
          <h2 className="text-3xl font-black text-foreground">You stood up!</h2>
          <p className="text-base font-semibold text-muted-foreground leading-relaxed">
            You said no to peer pressure and protected someone from being hurt. That takes real courage.
          </p>
          <div className="flex gap-3">
            {[1,2,3].map(i => (
              <Star key={i} className={cn("w-12 h-12", i <= stars ? "fill-yellow-400 text-yellow-400 animate-bounce-slow" : "fill-muted text-muted")}
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          {showBadge && (
            <div className="w-full bg-emerald-500/10 border-2 border-emerald-400 rounded-2xl p-5 flex items-center gap-4 text-left">
              <Award className="w-10 h-10 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black uppercase text-emerald-700">Badge Unlocked!</p>
                <p className="text-base font-black text-foreground">Integrity Champion</p>
                <p className="text-sm text-muted-foreground">You made the right call every step of the way.</p>
              </div>
            </div>
          )}
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="bg-teal-500/10 border-2 border-teal-400 rounded-2xl p-4 text-center">
              <p className="text-xs font-black text-teal-700 uppercase">Integrity</p>
              <p className="text-3xl font-black text-foreground">{integrity}%</p>
            </div>
            <div className="bg-primary/10 border-2 border-primary/40 rounded-2xl p-4 text-center">
              <p className="text-xs font-black text-primary uppercase">Confidence</p>
              <p className="text-3xl font-black text-foreground">{confidence}</p>
            </div>
          </div>
          <div className="w-full bg-primary/5 border-2 border-foreground/10 rounded-2xl p-5 text-left">
            <p className="text-xs font-black uppercase text-muted-foreground mb-2">✨ What you learned</p>
            <p className="text-base font-semibold text-foreground">Saying "no" clearly and walking away is always an option — even when it feels hard. Real friends respect that.</p>
          </div>
          <div className="w-full flex gap-3">
            <Button variant="outline" onClick={handleRestart} className="flex-1 rounded-2xl border-2 border-foreground font-black py-5 shadow-pop-sm text-base">
              Play Again
            </Button>
            {onComplete && (
              <Button onClick={() => onComplete(finalScore)} className="flex-1 rounded-2xl border-2 border-foreground font-black py-5 shadow-pop text-base">
                Next Level →
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── CUTSCENE ──
  if (phase === 'cutscene') {
    return (
      <div className="w-full max-w-xl mx-auto animate-fade-up">
        <div className="bg-card border-4 border-foreground rounded-[2rem] p-8 shadow-pop-lg flex flex-col items-center text-center gap-6">
          <div className="text-7xl">😢</div>
          <h2 className="text-2xl font-black text-foreground">Priya's Perspective</h2>
          <p className="text-base font-semibold text-muted-foreground leading-relaxed">
            Priya walked to her locker after class and saw the mean words written on it. She looked around, holding back tears, wondering who she could trust.
          </p>
          <div className="w-full bg-red-500/10 border-2 border-red-300 rounded-2xl p-5">
            <p className="text-xs font-black uppercase text-red-700 mb-2">Empathy Check</p>
            <p className="text-base font-bold text-foreground">How do you think Priya felt?</p>
          </div>
          {!reflectionDone ? (
            <div className="w-full grid grid-cols-2 gap-3">
              {['Hurt and alone', 'Embarrassed', 'Scared to come back', 'All of these'].map(ans => (
                <button key={ans} onClick={() => setReflectionDone(true)}
                  className="bg-muted hover:bg-primary/10 border-2 border-foreground rounded-xl p-4 text-sm font-bold text-foreground text-left transition-all hover:-translate-y-0.5">
                  {ans}
                </button>
              ))}
            </div>
          ) : (
            <div className="w-full bg-emerald-500/10 border-2 border-emerald-400 rounded-2xl p-5 text-left flex gap-3 items-start">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-base font-bold text-foreground">All of those feelings are real. Remembering how others feel helps us make better choices next time.</p>
            </div>
          )}
          {reflectionDone && (
            <div className="w-full flex gap-3">
              <Button variant="outline" onClick={handleRestart} className="flex-1 rounded-2xl border-2 border-foreground font-black py-5 shadow-pop-sm text-base">
                Try Again
              </Button>
              {onComplete && (
                <Button onClick={() => onComplete(finalScore)} className="flex-1 rounded-2xl border-2 border-foreground font-black py-5 shadow-pop text-base">
                  Continue →
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── DEBRIEF ──
  if (phase === 'debrief') {
    return (
      <div className="w-full max-w-xl mx-auto animate-fade-up">
        <div className="bg-card border-4 border-foreground rounded-[2rem] p-8 shadow-pop-lg flex flex-col items-center text-center gap-6">
          <div className="text-7xl">😶</div>
          <h2 className="text-2xl font-black text-foreground">Sometimes We Freeze</h2>
          <p className="text-base font-semibold text-muted-foreground leading-relaxed">
            Freezing under pressure is very human. You didn't make it worse — but next time, you can practice speaking up.
          </p>
          <div className="flex gap-3">
            {[1,2,3].map(i => (
              <Star key={i} className={cn("w-12 h-12", i <= stars ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted")} />
            ))}
          </div>
          <div className="w-full bg-primary/5 border-2 border-foreground/10 rounded-2xl p-5 text-left">
            <p className="text-xs font-black uppercase text-muted-foreground mb-2">✨ Remember</p>
            <p className="text-base font-semibold text-foreground">You can always walk away, find a trusted adult, or say "I'm not comfortable with this." Practice makes it easier.</p>
          </div>
          <div className="w-full flex gap-3">
            <Button variant="outline" onClick={handleRestart} className="flex-1 rounded-2xl border-2 border-foreground font-black py-5 shadow-pop-sm text-base">
              Try Again
            </Button>
            {onComplete && (
              <Button onClick={() => onComplete(finalScore)} className="flex-1 rounded-2xl border-2 border-foreground font-black py-5 shadow-pop text-base">
                Continue →
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN SCENE ──
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-5 animate-fade-up">

      {/* HUD */}
      <div className="bg-card border-4 border-foreground rounded-[1.5rem] px-6 py-4 shadow-pop flex items-center gap-5 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          {SCENES.map((s, i) => (
            <div key={s.id} className={cn(
              "h-3 rounded-full border-2 border-foreground transition-all duration-300",
              i < sceneIdx ? "bg-emerald-400 w-8" : i === sceneIdx ? "bg-primary w-10" : "bg-muted w-5"
            )} />
          ))}
          <span className="text-sm font-black text-muted-foreground ml-1">Scene {sceneIdx + 1}/{SCENES.length}</span>
        </div>
        <div className="flex items-center gap-3 min-w-[160px]">
          <span className="text-sm font-black text-teal-600 uppercase whitespace-nowrap">💚 Integrity</span>
          <div className="flex-1 h-3 bg-muted rounded-full border border-foreground/20 overflow-hidden">
            <div className={cn("h-full transition-all duration-500 rounded-full", integrity > 60 ? "bg-teal-400" : integrity > 30 ? "bg-amber-400" : "bg-red-400")}
              style={{ width: `${integrity}%` }} />
          </div>
          <span className="text-sm font-black text-foreground">{integrity}%</span>
        </div>
      </div>

      {/* Scene Card */}
      <div className={cn("w-full rounded-[2rem] border-4 border-foreground shadow-pop-lg overflow-hidden bg-gradient-to-br", scene.bg)}>

        {/* Location bar */}
        <div className="flex items-center gap-3 px-6 py-4 bg-foreground/5 border-b-2 border-foreground/10">
          <span className="text-2xl">{scene.locationEmoji}</span>
          <span className="text-sm font-black uppercase tracking-widest text-foreground/70">{scene.location}</span>
        </div>

        {/* Characters + dialogue */}
        <div className="flex items-end justify-center gap-6 px-8 pt-8 pb-3">
          {/* Speaker */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="text-6xl animate-bounce-slow">{scene.speakerEmoji}</div>
            <span className="text-sm font-black bg-card border-2 border-foreground rounded-full px-3 py-1 shadow-pop-sm">{scene.speaker}</span>
          </div>

          {/* Bubble */}
          <div className="flex-1 bg-card border-4 border-foreground rounded-[1.5rem] p-5 shadow-pop relative">
            <div className="absolute -left-3 top-7 w-0 h-0 border-t-[10px] border-t-transparent border-r-[14px] border-r-foreground border-b-[10px] border-b-transparent" />
            <p className="text-base font-bold text-foreground leading-relaxed">{scene.dialogue}</p>
          </div>

          {/* Player */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="text-6xl">🧒</div>
            <span className="text-sm font-black bg-primary text-primary-foreground border-2 border-foreground rounded-full px-3 py-1 shadow-pop-sm">You</span>
          </div>
        </div>

        {/* Context */}
        <div className="mx-6 mb-5 bg-card/70 border-2 border-foreground/20 rounded-xl px-5 py-3">
          <p className="text-sm font-semibold text-muted-foreground leading-relaxed">📍 {scene.context}</p>
        </div>
      </div>

      {/* Choices */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground px-1">What do you do?</p>
        {scene.choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => handleChoice(choice)}
            className={cn(
              "w-full text-left bg-card border-4 border-foreground rounded-2xl px-6 py-5 font-bold text-base text-foreground shadow-pop-sm",
              "hover:-translate-y-1 hover:shadow-pop transition-all duration-200 active:scale-95",
              choice.isGood && "hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
              choice.isBad && "hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/30",
              !choice.isGood && !choice.isBad && "hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
            )}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
};
