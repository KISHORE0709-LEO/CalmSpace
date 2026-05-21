import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Sparkles, Star } from "lucide-react";

interface CalmControlProps {
  onComplete?: (score: number) => void;
}

type Step = 0 | 1 | 2; // 0=breathing, 1=fidget, 2=sound

// ─── Step 1: Breathing ───────────────────────────────────────────────────────
const BREATH_CYCLES = 3; // complete 3 full cycles to finish

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';
const PHASE_DURATION: Record<BreathPhase, number> = {
  inhale: 4000,
  hold:   2000,
  exhale: 4000,
  rest:   1500,
};
const PHASE_ORDER: BreathPhase[] = ['inhale', 'hold', 'exhale', 'rest'];
const PHASE_LABEL: Record<BreathPhase, string> = {
  inhale: 'Breathe IN 🌬️',
  hold:   'Hold... ✋',
  exhale: 'Breathe OUT 😮‍💨',
  rest:   'Rest 😌',
};
const PHASE_COLOR: Record<BreathPhase, string> = {
  inhale: 'from-teal-400 to-emerald-500',
  hold:   'from-blue-400 to-indigo-500',
  exhale: 'from-purple-400 to-pink-500',
  rest:   'from-amber-300 to-orange-400',
};
const PHASE_SCALE: Record<BreathPhase, number> = {
  inhale: 1.35,
  hold:   1.35,
  exhale: 0.85,
  rest:   0.85,
};

function BreathingStep({ onDone }: { onDone: () => void }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0–100 within current phase
  const [cycles, setCycles] = useState(0);
  const phase = PHASE_ORDER[phaseIdx];
  const duration = PHASE_DURATION[phase];

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        const nextIdx = (phaseIdx + 1) % PHASE_ORDER.length;
        setPhaseIdx(nextIdx);
        setProgress(0);
        if (nextIdx === 0) {
          setCycles(c => {
            const next = c + 1;
            if (next >= BREATH_CYCLES) setTimeout(onDone, 600);
            return next;
          });
        }
      }
    }, 50);
    return () => clearInterval(interval);
  }, [phaseIdx, duration, onDone]);

  const scale = PHASE_SCALE[phase];
  const cycleProgress = Math.round(((cycles / BREATH_CYCLES) + (phaseIdx / (PHASE_ORDER.length * BREATH_CYCLES))) * 100);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Step 1 of 3 — Breathing</p>
        <h3 className="text-2xl font-black text-foreground">Follow the circle</h3>
        <p className="text-sm text-muted-foreground mt-1">Just watch and breathe along. No tapping needed!</p>
      </div>

      {/* Animated breathing circle */}
      <div className="relative flex items-center justify-center w-52 h-52">
        {/* Ripple rings */}
        {phase === 'inhale' && (
          <>
            <div className="absolute w-52 h-52 rounded-full border-4 border-teal-300/30 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute w-44 h-44 rounded-full border-2 border-teal-300/20 animate-ping" style={{ animationDuration: '2.5s' }} />
          </>
        )}
        <div
          className={cn("w-36 h-36 rounded-full bg-gradient-to-br flex flex-col items-center justify-center text-white shadow-2xl transition-all", PHASE_COLOR[phase])}
          style={{ transform: `scale(${scale})`, transition: `transform ${duration}ms ease-in-out` }}
        >
          <span className="text-3xl mb-1">
            {phase === 'inhale' ? '🌬️' : phase === 'hold' ? '✋' : phase === 'exhale' ? '😮‍💨' : '😌'}
          </span>
          <span className="text-sm font-black tracking-tight">{PHASE_LABEL[phase]}</span>
        </div>
      </div>

      {/* Phase progress bar */}
      <div className="w-full max-w-xs space-y-1">
        <div className="flex justify-between text-xs font-black text-muted-foreground">
          <span>{PHASE_LABEL[phase]}</span>
          <span>{cycles}/{BREATH_CYCLES} cycles</span>
        </div>
        <div className="w-full h-3 bg-muted rounded-full border-2 border-foreground overflow-hidden">
          <div className="h-full bg-teal-400 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Overall progress */}
      <div className="w-full max-w-xs space-y-1">
        <div className="text-xs font-black text-muted-foreground text-center">Overall progress</div>
        <div className="w-full h-4 bg-muted rounded-full border-2 border-foreground overflow-hidden">
          <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${Math.min(99, cycleProgress)}%` }} />
        </div>
      </div>

      <div className="bg-primary/5 border-2 border-foreground/10 rounded-2xl px-5 py-3 max-w-xs text-center">
        <p className="text-sm font-semibold text-muted-foreground">
          Slow breathing calms your nervous system and reduces stress 💙
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Fidget Pop-It ────────────────────────────────────────────────────
const TOTAL_BUBBLES = 16;
const POPS_NEEDED = 16;

function FidgetStep({ onDone }: { onDone: () => void }) {
  const [popped, setPopped] = useState<boolean[]>(Array(TOTAL_BUBBLES).fill(false));
  const popCount = popped.filter(Boolean).length;

  useEffect(() => {
    if (popCount >= POPS_NEEDED) setTimeout(onDone, 700);
  }, [popCount, onDone]);

  const handlePop = (i: number) => {
    if (popped[i]) return;
    setPopped(prev => { const n = [...prev]; n[i] = true; return n; });
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Step 2 of 3 — Fidget</p>
        <h3 className="text-2xl font-black text-foreground">Pop all the bubbles! 🫧</h3>
        <p className="text-sm text-muted-foreground mt-1">Tap every bubble to pop it. Feel the satisfying release!</p>
      </div>

      {/* Pop-it grid */}
      <div className="grid grid-cols-4 gap-3 bg-muted/40 border-4 border-foreground rounded-[2rem] p-5 shadow-inner">
        {popped.map((isPop, i) => (
          <button
            key={i}
            onClick={() => handlePop(i)}
            className={cn(
              "w-14 h-14 rounded-full border-4 border-foreground flex items-center justify-center text-2xl transition-all duration-150 active:scale-90 select-none",
              isPop
                ? "bg-emerald-300 shadow-inner scale-95 border-emerald-500"
                : "bg-gradient-to-br from-pink-400 to-rose-500 shadow-pop-sm hover:-translate-y-1 hover:shadow-pop"
            )}
          >
            {isPop ? '✅' : '🔴'}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="w-full max-w-xs space-y-1">
        <div className="flex justify-between text-sm font-black text-muted-foreground">
          <span>Popped</span><span>{popCount} / {POPS_NEEDED}</span>
        </div>
        <div className="w-full h-4 bg-muted rounded-full border-2 border-foreground overflow-hidden">
          <div className="h-full bg-pink-400 rounded-full transition-all duration-300" style={{ width: `${(popCount / POPS_NEEDED) * 100}%` }} />
        </div>
      </div>

      <div className="bg-primary/5 border-2 border-foreground/10 rounded-2xl px-5 py-3 max-w-xs text-center">
        <p className="text-sm font-semibold text-muted-foreground">
          Stimming like popping helps discharge nervous energy and refocus 🧠
        </p>
      </div>
    </div>
  );
}

// ─── Step 3: Sound Mixer (real Web Audio) ────────────────────────────────────
const SOUND_DEFS = [
  { key: 'rain',   emoji: '🌧️', label: 'Rain',        color: '#60a5fa', ideal: 50 },
  { key: 'forest', emoji: '🌲', label: 'Forest Birds', color: '#34d399', ideal: 50 },
  { key: 'chimes', emoji: '🎐', label: 'Wind Chimes',  color: '#c084fc', ideal: 40 },
] as const;

type SoundKey = 'rain' | 'forest' | 'chimes';

// Build rain: white noise through a bandpass filter
function buildRain(ctx: AudioContext) {
  const bufSize = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 0.4;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();
  return gain;
}

// Build forest: random short sine bursts (bird chirps)
function buildForest(ctx: AudioContext) {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ctx.destination);
  let stopped = false;
  const chirp = () => {
    if (stopped) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 1200 + Math.random() * 1400;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(g);
    g.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
    setTimeout(chirp, 300 + Math.random() * 900);
  };
  chirp();
  return { gain, stop: () => { stopped = true; } };
}

// Build chimes: pentatonic bell tones
const CHIME_FREQS = [523, 659, 784, 1047, 1319];
function buildChimes(ctx: AudioContext) {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ctx.destination);
  let stopped = false;
  const ding = () => {
    if (stopped) return;
    const freq = CHIME_FREQS[Math.floor(Math.random() * CHIME_FREQS.length)];
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.22, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
    osc.connect(g);
    g.connect(gain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 2);
    setTimeout(ding, 800 + Math.random() * 2200);
  };
  ding();
  return { gain, stop: () => { stopped = true; } };
}

function SoundStep({ onDone }: { onDone: () => void }) {
  const [volumes, setVolumes] = useState<Record<SoundKey, number>>({ rain: 0, forest: 0, chimes: 0 });
  const [started, setStarted] = useState(false);
  const ctxRef   = useRef<AudioContext | null>(null);
  const gainsRef = useRef<Partial<Record<SoundKey, GainNode>>>({});
  const stopsRef = useRef<Partial<Record<SoundKey, () => void>>>({});

  const allGood = SOUND_DEFS.every(s => volumes[s.key] >= s.ideal);

  // Start audio context on first user interaction
  const startAudio = useCallback(() => {
    if (ctxRef.current) return;
    const ctx = new AudioContext();
    ctxRef.current = ctx;

    gainsRef.current.rain = buildRain(ctx);

    const forest = buildForest(ctx);
    gainsRef.current.forest = forest.gain;
    stopsRef.current.forest = forest.stop;

    const chimes = buildChimes(ctx);
    gainsRef.current.chimes = chimes.gain;
    stopsRef.current.chimes = chimes.stop;

    setStarted(true);
  }, []);

  // Sync gain nodes when volumes change
  useEffect(() => {
    if (!ctxRef.current) return;
    (Object.keys(volumes) as SoundKey[]).forEach(key => {
      const g = gainsRef.current[key];
      if (g) g.gain.setTargetAtTime(volumes[key] / 100 * 0.7, ctxRef.current!.currentTime, 0.1);
    });
  }, [volumes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(stopsRef.current).forEach(fn => fn?.());
      ctxRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (allGood) setTimeout(onDone, 800);
  }, [allGood, onDone]);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Step 3 of 3 — Sounds</p>
        <h3 className="text-2xl font-black text-foreground">Mix your calm sounds 🎧</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {started ? 'Drag each slider up to hear the sound. Fill all three!' : 'Tap the button below to start the sounds 🔊'}
        </p>
      </div>

      {/* Start button — needed to unlock AudioContext on mobile/browser */}
      {!started && (
        <button
          onClick={startAudio}
          className="bg-secondary text-secondary-foreground border-4 border-foreground rounded-2xl px-10 py-5 text-lg font-black shadow-pop-lg hover:-translate-y-1 transition-all animate-bounce-slow"
        >
          🔊 Start Sounds
        </button>
      )}

      {/* Sliders */}
      <div className="w-full max-w-sm space-y-5 bg-card border-4 border-foreground rounded-[2rem] p-6 shadow-pop">
        {SOUND_DEFS.map(s => {
          const val = volumes[s.key];
          const good = val >= s.ideal;
          return (
            <div key={s.key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="text-sm font-black text-foreground">{s.label}</span>
                </div>
                <span className="text-lg transition-all">{good ? '✅' : val > 0 ? '🔉' : '🔇'}</span>
              </div>
              <input
                type="range" min="0" max="100" value={val}
                onChange={e => {
                  if (!started) startAudio();
                  setVolumes(prev => ({ ...prev, [s.key]: +e.target.value }));
                }}
                className="w-full h-4 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${good ? '#34d399' : s.color} ${val}%, #e2e8f0 ${val}%)`
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground font-bold">
                <span>Silent</span>
                <span className={cn('font-black', good ? 'text-emerald-600' : 'text-foreground')}>{val}%</span>
                <span>Loud</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calm level bar */}
      <div className="w-full max-w-sm space-y-1">
        <div className="flex justify-between text-sm font-black text-muted-foreground">
          <span>Calm level</span>
          <span>{SOUND_DEFS.filter(s => volumes[s.key] >= s.ideal).length} / {SOUND_DEFS.length} active</span>
        </div>
        <div className="w-full h-4 bg-muted rounded-full border-2 border-foreground overflow-hidden">
          <div
            className="h-full bg-indigo-400 rounded-full transition-all duration-500"
            style={{ width: `${(SOUND_DEFS.filter(s => volumes[s.key] >= s.ideal).length / SOUND_DEFS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-primary/5 border-2 border-foreground/10 rounded-2xl px-5 py-3 max-w-xs text-center">
        <p className="text-sm font-semibold text-muted-foreground">
          Calming sounds mask stressful noise and help your brain relax 🎵
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const CalmControl = ({ onComplete }: CalmControlProps) => {
  const [step, setStep] = useState<Step>(0);
  const [done, setDone] = useState([false, false, false]);
  const [showWin, setShowWin] = useState(false);
  const [autoReturn, setAutoReturn] = useState<number | null>(null);

  const markDone = (s: Step) => {
    setDone(prev => { const n = [...prev]; n[s] = true; return n; });
    if (s < 2) setTimeout(() => setStep((s + 1) as Step), 400);
    else setTimeout(() => setShowWin(true), 600);
  };

  useEffect(() => {
    if (!showWin) return;
    setAutoReturn(5);
  }, [showWin]);

  useEffect(() => {
    if (autoReturn === null) return;
    if (autoReturn <= 0) { onComplete?.(100); return; }
    const t = setTimeout(() => setAutoReturn(p => p! - 1), 1000);
    return () => clearTimeout(t);
  }, [autoReturn, onComplete]);

  const STEPS = [
    { emoji: '🌬️', label: 'Breathing' },
    { emoji: '🫧', label: 'Fidget Pop' },
    { emoji: '🎧', label: 'Calm Sounds' },
  ];

  if (showWin) {
    return (
      <div className="w-full max-w-lg mx-auto animate-fade-up">
        <div className="bg-card border-4 border-foreground rounded-[2rem] p-8 shadow-pop-lg flex flex-col items-center text-center gap-5">
          <div className="text-7xl animate-bounce-slow">🌈</div>
          <h2 className="text-3xl font-black text-foreground">You're Calm Now!</h2>
          <p className="text-base font-semibold text-muted-foreground leading-relaxed">
            You completed all 3 calming techniques. These tools work in real life too — try them whenever you feel overwhelmed!
          </p>
          <div className="flex gap-3">
            {[1,2,3].map(i => (
              <Star key={i} className="w-12 h-12 fill-yellow-400 text-yellow-400 animate-bounce-slow"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <div className="w-full grid grid-cols-3 gap-3">
            {STEPS.map((s, i) => (
              <div key={i} className="bg-emerald-500/10 border-2 border-emerald-400 rounded-2xl p-3 text-center">
                <div className="text-2xl mb-1">{s.emoji}</div>
                <p className="text-xs font-black text-emerald-700">{s.label}</p>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto mt-1" />
              </div>
            ))}
          </div>
          <div className="w-full bg-primary/5 border-2 border-foreground/10 rounded-2xl p-4 text-left">
            <p className="text-xs font-black uppercase text-muted-foreground mb-1">✨ What you learned</p>
            <p className="text-sm font-semibold text-foreground">Breathing, stimming, and calming sounds are real tools you can use anytime you feel stressed or overwhelmed.</p>
          </div>
          {onComplete && (
            <div className="w-full flex flex-col gap-2">
              <Button onClick={() => onComplete(100)} className="w-full rounded-2xl border-2 border-foreground font-black py-5 shadow-pop text-base">
                Complete Level <Sparkles className="w-4 h-4 ml-2" />
              </Button>
              {autoReturn !== null && (
                <span className="text-sm text-muted-foreground font-black animate-pulse text-center">
                  Returning in {autoReturn}s…
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-5 animate-fade-up">

      {/* Step progress bar */}
      <div className="bg-card border-4 border-foreground rounded-[1.5rem] px-5 py-4 shadow-pop">
        <div className="flex items-center gap-3">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                i === step ? "scale-110" : ""
              )}>
                <div className={cn(
                  "w-12 h-12 rounded-full border-4 border-foreground flex items-center justify-center text-xl shadow-pop-sm transition-all",
                  done[i] ? "bg-emerald-400" : i === step ? "bg-secondary animate-pulse" : "bg-muted"
                )}>
                  {done[i] ? '✅' : s.emoji}
                </div>
                <span className={cn("text-xs font-black", i === step ? "text-foreground" : "text-muted-foreground")}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className={cn("flex-1 h-1.5 rounded-full border border-foreground/20 transition-all duration-500", done[i] ? "bg-emerald-400" : "bg-muted")} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Active step card */}
      <div className="bg-card border-4 border-foreground rounded-[2rem] p-6 shadow-pop-lg">
        {step === 0 && <BreathingStep onDone={() => markDone(0)} />}
        {step === 1 && <FidgetStep    onDone={() => markDone(1)} />}
        {step === 2 && <SoundStep     onDone={() => markDone(2)} />}
      </div>

    </div>
  );
};
