import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Volume2, Music, CheckCircle2, Star, Disc } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalmControlProps {
  onComplete?: (score: number) => void;
}

type TabType = 'breath' | 'fidget' | 'sound';
type BreathPhase = 'Inhale' | 'Hold' | 'Exhale' | 'Rest';

export const CalmControl = ({ onComplete }: CalmControlProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('breath');
  const [harmony, setHarmony] = useState(20); // starts low, aim for 100
  const [isWin, setIsWin] = useState(false);
  const [autoReturn, setAutoReturn] = useState<number | null>(null);

  // 🌬️ Guided Breathing States
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('Inhale');
  const [breathProgress, setBreathProgress] = useState(0); // 0 to 100 for current phase
  const [isBreathingHeld, setIsBreathingHeld] = useState(false); // true if holding pointer down

  // 🪀 Pop-It Board States
  const [poppedBubbles, setPoppedBubbles] = useState<boolean[]>(Array(12).fill(false));
  const [bubblesSquash, setBubblesSquash] = useState<number[]>(Array(12).fill(1)); // scale multiplier
  const [popCount, setPopCount] = useState(0);

  // 🎧 Sound Mixer States
  const [soundVolumes, setSoundVolumes] = useState({
    rain: 30,
    forest: 20,
    chimes: 40
  });

  // Floating Sparkle particles generated on user interaction
  const [fidgetParticles, setFidgetParticles] = useState<{ id: number; x: number; y: number; color: string; scale: number; vy: number }[]>([]);

  // Soundscape ambient noise level (decreases as user boosts volumes and pops)
  const ambientOverloadLevel = Math.max(0, 100 - harmony);

  // Win condition checker
  useEffect(() => {
    if (harmony >= 100 && !isWin) {
      setIsWin(true);
      setAutoReturn(5);
    }
  }, [harmony, isWin]);

  // Auto Return countdown
  useEffect(() => {
    if (autoReturn === null) return;
    if (autoReturn <= 0) {
      if (onComplete) onComplete(100);
      return;
    }
    const timer = setTimeout(() => setAutoReturn(autoReturn - 1), 1000);
    return () => clearTimeout(timer);
  }, [autoReturn, onComplete]);

  // Breathing Guide Loop
  useEffect(() => {
    if (isWin) return;
    const interval = setInterval(() => {
      setBreathProgress(prev => {
        if (prev >= 100) {
          // Transition phase
          setBreathPhase(current => {
            if (current === 'Inhale') return 'Hold';
            if (current === 'Hold') return 'Exhale';
            if (current === 'Exhale') return 'Rest';
            return 'Inhale';
          });
          return 0;
        }

        // Increase harmony if they are actively holding/breathed in sync
        const isCorrectInteraction = 
          (breathPhase === 'Inhale' && isBreathingHeld) ||
          (breathPhase === 'Hold' && isBreathingHeld) ||
          (breathPhase === 'Exhale' && !isBreathingHeld) ||
          (breathPhase === 'Rest' && !isBreathingHeld);

        if (isCorrectInteraction) {
          setHarmony(h => Math.min(100, h + 0.35));
        }

        return prev + 2.5; // step increment
      });
    }, 100);

    return () => clearInterval(interval);
  }, [breathPhase, isBreathingHeld, isWin]);

  // Fidget particles physics update
  useEffect(() => {
    if (fidgetParticles.length === 0) return;
    const timer = setInterval(() => {
      setFidgetParticles(prev =>
        prev
          .map(p => ({
            ...p,
            y: p.y + p.vy,
            vy: p.vy + 0.12, // gravity
            scale: Math.max(0, p.scale - 0.02)
          }))
          .filter(p => p.scale > 0)
      );
    }, 20);
    return () => clearInterval(timer);
  }, [fidgetParticles]);

  // Handle bubble pop
  const handlePop = (index: number, e: React.MouseEvent) => {
    if (isWin) return;
    
    // Trigger squash scale animation
    setBubblesSquash(prev => {
      const copy = [...prev];
      copy[index] = 0.5;
      return copy;
    });

    setTimeout(() => {
      setBubblesSquash(prev => {
        const copy = [...prev];
        copy[index] = 1.15; // spring bounce
        return copy;
      });
      setTimeout(() => {
        setBubblesSquash(prev => {
          const copy = [...prev];
          copy[index] = 1.0;
          return copy;
        });
      }, 150);
    }, 80);

    setPoppedBubbles(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });

    setPopCount(c => c + 1);
    setHarmony(h => Math.min(100, h + 2.5));

    // Spawn sparkles at pointer position
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (parentRect) {
      const x = rect.left - parentRect.left + rect.width / 2;
      const y = rect.top - parentRect.top;
      
      const colors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#c084fc'];
      const newParticles = Array.from({ length: 5 }).map((_, idx) => ({
        id: Date.now() + idx + Math.random(),
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 1,
        vy: -1.5 - Math.random() * 2
      }));
      setFidgetParticles(prev => [...prev, ...newParticles]);
    }
  };

  const resetPopIt = () => {
    setPoppedBubbles(Array(12).fill(false));
  };

  // Handle mixer adjustment
  const handleVolumeChange = (type: 'rain' | 'forest' | 'chimes', val: number) => {
    if (isWin) return;
    setSoundVolumes(prev => {
      const next = { ...prev, [type]: val };
      // Harmony increases based on total relaxing sounds added (ideal levels)
      const avgVolume = (next.rain + next.forest + next.chimes) / 3;
      setHarmony(h => Math.min(100, Math.max(20, Math.floor(avgVolume + 15))));
      return next;
    });
  };

  // Get Phase instruction text
  const getBreathInstruction = () => {
    switch (breathPhase) {
      case 'Inhale': return 'Press and hold down to breathe in...';
      case 'Hold': return 'Keep holding your finger down and pause...';
      case 'Exhale': return 'Release your touch and let it out...';
      case 'Rest': return 'Rest and relax before the next cycle...';
    }
  };

  const getBreathColor = () => {
    switch (breathPhase) {
      case 'Inhale': return 'from-emerald-400 to-teal-500 shadow-teal-500/35';
      case 'Hold': return 'from-blue-400 to-indigo-500 shadow-indigo-500/35';
      case 'Exhale': return 'from-purple-400 to-pink-500 shadow-pink-500/35';
      case 'Rest': return 'from-amber-400 to-orange-500 shadow-orange-500/35';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Visual keyframe animation helper */}
      <style>{`
        @keyframes ripple-calm {
          0% { transform: scale(0.85); opacity: 0.75; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .animate-ripple-calm {
          animation: ripple-calm 4s infinite ease-out;
        }
        @keyframes slow-background-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }
        .animate-bg-pulse {
          animation: slow-background-pulse 6s infinite ease-in-out;
        }
      `}</style>

      {/* Dynamic Background visual: shifts from red/noisy gradient to starry indigo night based on harmony */}
      <div 
        className="absolute inset-0 -z-10 transition-all duration-1000"
        style={{
          background: `linear-gradient(135deg, 
            rgba(${Math.floor(239 - (harmony * 1.8))}, ${Math.floor(68 + (harmony * 1.5))}, ${Math.floor(68 + (harmony * 1.8))}, 0.15) 0%, 
            rgba(${Math.floor(99 - (harmony * 0.5))}, ${Math.floor(102 + (harmony * 0.8))}, ${Math.floor(241 + (harmony * 0.1))}, 0.15) 100%)`
        }}
      />

      {/* Top HUD: Ambient Noise vs Cozy Harmony level */}
      <div className="w-full bg-card/90 backdrop-blur-md border-[5px] border-foreground rounded-[2rem] p-5 sm:p-6 shadow-pop mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col text-center md:text-left">
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center justify-center md:justify-start gap-1">
            <Volume2 className="w-4 h-4 text-primary animate-pulse" /> Environmental Overload
          </span>
          <div className="flex items-baseline gap-1 justify-center md:justify-start">
            <span className={cn(
              "text-3xl font-black tabular-nums transition-colors duration-300",
              ambientOverloadLevel > 50 ? "text-red-500" : "text-emerald-500"
            )}>
              {Math.round(ambientOverloadLevel)}%
            </span>
            <span className="text-xs text-muted-foreground font-black uppercase">Volume</span>
          </div>
        </div>

        <div className="flex-1 max-w-sm w-full mx-4">
          <div className="text-xs font-black text-muted-foreground uppercase text-center mb-1 flex items-center justify-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400 animate-pulse" /> Sensory Balance Progress
          </div>
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden border-2 border-foreground relative shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 via-primary to-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${harmony}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end">
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Cozy Rating</span>
          <span className="text-3xl font-black text-foreground">{Math.round(harmony)} / 100</span>
        </div>
      </div>

      {/* Core Game Container */}
      <div className="w-full bg-card border-[6px] border-foreground rounded-[2.5rem] p-6 lg:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col md:flex-row gap-6">
        
        {/* Left Side: Coping Strategies Tab Navigation */}
        <div className="w-full md:w-[220px] shrink-0 flex flex-row md:flex-col gap-2">
          <button
            onClick={() => setActiveTab('breath')}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-2xl border-2 border-foreground font-black text-sm transition-all hover:-translate-y-0.5",
              activeTab === 'breath' ? "bg-primary text-primary-foreground shadow-pop-sm" : "bg-background hover:bg-muted"
            )}
          >
            <span>🌬️</span> Breathing Anchor
          </button>
          <button
            onClick={() => setActiveTab('fidget')}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-2xl border-2 border-foreground font-black text-sm transition-all hover:-translate-y-0.5",
              activeTab === 'fidget' ? "bg-primary text-primary-foreground shadow-pop-sm" : "bg-background hover:bg-muted"
            )}
          >
            <span>🪀</span> Tactile Fidget Pop
          </button>
          <button
            onClick={() => setActiveTab('sound')}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-2xl border-2 border-foreground font-black text-sm transition-all hover:-translate-y-0.5",
              activeTab === 'sound' ? "bg-primary text-primary-foreground shadow-pop-sm" : "bg-background hover:bg-muted"
            )}
          >
            <span>🎧</span> Soundscape Mixer
          </button>
        </div>

        {/* Right Side: Coping Playground Area */}
        <div className="flex-1 bg-background/50 border-4 border-foreground rounded-2xl p-6 min-h-[350px] flex flex-col items-center justify-center relative overflow-hidden">
          
          {/* TAB 1: Breathing Guided Circle */}
          {activeTab === 'breath' && (
            <div className="flex flex-col items-center w-full select-none text-center">
              {/* Expanding Ripple Circles */}
              <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                {/* Floating Ripple Aura */}
                <div 
                  className={cn(
                    "absolute w-44 h-44 rounded-full border-4 border-dashed border-primary/20",
                    isBreathingHeld && "animate-spin-slow"
                  )} 
                />
                
                {/* The main pulsing breathing ball */}
                <div 
                  onPointerDown={() => setIsBreathingHeld(true)}
                  onPointerUp={() => setIsBreathingHeld(false)}
                  onPointerLeave={() => setIsBreathingHeld(false)}
                  className={cn(
                    "w-36 h-36 rounded-full bg-gradient-to-br flex flex-col items-center justify-center text-white border-4 border-foreground cursor-pointer shadow-pop transition-all duration-300 transform ease-in-out active:scale-95 touch-none relative z-10",
                    getBreathColor()
                  )}
                  style={{
                    transform: `scale(${1 + (breathProgress / 300)})`
                  }}
                >
                  <span className="text-xs font-black uppercase tracking-widest opacity-60">Phase</span>
                  <span className="text-xl font-black tracking-tight">{breathPhase}</span>
                  <span className="text-[10px] font-bold mt-1 opacity-70">
                    {isBreathingHeld ? "HOLDING" : "TAP & HOLD"}
                  </span>

                  {/* Circular progress overlay ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                    <circle 
                      cx="72" cy="72" r="66" 
                      stroke="rgba(255,255,255,0.25)" strokeWidth="4" fill="transparent" 
                    />
                    <circle 
                      cx="72" cy="72" r="66" 
                      stroke="white" strokeWidth="4" fill="transparent" 
                      strokeDasharray={414}
                      strokeDashoffset={414 - (414 * breathProgress) / 100}
                    />
                  </svg>
                </div>
              </div>

              <h4 className="text-lg font-black text-foreground mb-2">
                {getBreathInstruction()}
              </h4>
              <p className="text-xs text-muted-foreground font-semibold max-w-sm leading-relaxed">
                Paced breathing triggers your parasympathetic nervous system, lowering stress signals and calming sensory overload.
              </p>
            </div>
          )}

          {/* TAB 2: Tactile Pop-It board */}
          {activeTab === 'fidget' && (
            <div className="flex flex-col items-center w-full select-none">
              <h4 className="text-base font-black text-foreground mb-4 flex items-center gap-1.5">
                Satisfying Fidget Pop <Sparkles className="w-4 h-4 text-yellow-500 animate-spin-slow" />
              </h4>

              {/* Fidget Popping Board */}
              <div className="grid grid-cols-4 gap-3 bg-muted/60 border-4 border-foreground rounded-[2rem] p-5 shadow-inner relative max-w-xs w-full">
                {poppedBubbles.map((isPopped, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => handlePop(idx, e)}
                    style={{
                      transform: `scale(${bubblesSquash[idx]})`
                    }}
                    className={cn(
                      "aspect-square rounded-full border-4 border-foreground shadow-pop-sm flex items-center justify-center transition-all duration-100 ease-out active:scale-90 relative overflow-hidden",
                      isPopped 
                        ? "bg-gradient-to-br from-emerald-300 to-teal-400 translate-y-0.5 shadow-none border-foreground/50" 
                        : "bg-gradient-to-br from-pink-400 to-rose-500 hover:-translate-y-0.5"
                    )}
                  >
                    {/* Pop-it Bubble circle reflection details */}
                    <div className={cn(
                      "w-4 h-4 rounded-full absolute top-1 left-1 opacity-45 pointer-events-none",
                      isPopped ? "bg-white/10" : "bg-white/40"
                    )} />
                    <span className="text-lg select-none pointer-events-none">
                      {isPopped ? "🟢" : "🔴"}
                    </span>
                  </button>
                ))}

                {/* Particle layer rendering relative to pop board */}
                {fidgetParticles.map(p => (
                  <div
                    key={p.id}
                    className="absolute pointer-events-none font-black text-sm z-30"
                    style={{
                      left: p.x,
                      top: p.y,
                      color: p.color,
                      transform: `scale(${p.scale}) translate(-50%, -50%)`,
                    }}
                  >
                    ★
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between w-full max-w-xs mt-4">
                <span className="text-xs font-black text-muted-foreground uppercase">
                  Total Pops: {popCount}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetPopIt}
                  className="rounded-full border-2 border-foreground shadow-pop-sm hover:-translate-y-0.5 px-3"
                >
                  Reset Board
                </Button>
              </div>

              <p className="text-xs text-muted-foreground font-semibold mt-4 text-center max-w-xs leading-relaxed">
                Stimming (like clicking or popping) keeps hands active, refocuses attention, and discharges nervous tension.
              </p>
            </div>
          )}

          {/* TAB 3: Auditory Soundscape Mixer */}
          {activeTab === 'sound' && (
            <div className="flex flex-col items-center w-full select-none px-4">
              <h4 className="text-base font-black text-foreground mb-4 flex items-center gap-1.5">
                Auditory Masking Mixer <Music className="w-4 h-4 text-primary animate-bounce" />
              </h4>

              <div className="w-full space-y-4 max-w-sm bg-background border-4 border-foreground rounded-[2rem] p-5 shadow-pop-sm">
                {/* Channel 1: Rain */}
                <div className="flex items-center gap-4">
                  <span className="text-2xl w-8 select-none text-center">🌧️</span>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Rain soundscape</span>
                    <input 
                      type="range" 
                      min="0" max="100"
                      value={soundVolumes.rain}
                      onChange={(e) => handleVolumeChange('rain', parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary border border-foreground/10"
                    />
                  </div>
                  <span className="text-xs font-black w-8 tabular-nums text-right">{soundVolumes.rain}%</span>
                </div>

                {/* Channel 2: Wind Chimes */}
                <div className="flex items-center gap-4">
                  <span className="text-2xl w-8 select-none text-center">🎐</span>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Wind Chimes</span>
                    <input 
                      type="range" 
                      min="0" max="100"
                      value={soundVolumes.chimes}
                      onChange={(e) => handleVolumeChange('chimes', parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary border border-foreground/10"
                    />
                  </div>
                  <span className="text-xs font-black w-8 tabular-nums text-right">{soundVolumes.chimes}%</span>
                </div>

                {/* Channel 3: Forest/Birds */}
                <div className="flex items-center gap-4">
                  <span className="text-2xl w-8 select-none text-center">🌲</span>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Forest Birds</span>
                    <input 
                      type="range" 
                      min="0" max="100"
                      value={soundVolumes.forest}
                      onChange={(e) => handleVolumeChange('forest', parseInt(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary border border-foreground/10"
                    />
                  </div>
                  <span className="text-xs font-black w-8 tabular-nums text-right">{soundVolumes.forest}%</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground font-semibold mt-5 text-center max-w-xs leading-relaxed">
                auditory masking overlays soft ambient frequencies over high-stimulus alarms or screaming, allowing focus.
              </p>
            </div>
          )}

          {/* Glowing Aura overlay when almost fully balanced */}
          {harmony > 75 && (
            <div className="absolute inset-0 border-[6px] border-emerald-400/20 blur-md pointer-events-none rounded-xl" />
          )}
        </div>
      </div>

      {/* Win overlay screen */}
      {isWin && (
        <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center animate-fade-up p-4">
          <div className="bg-card border-[6px] border-foreground rounded-[2.5rem] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full flex flex-col items-center animate-fade-up text-center">
            <CheckCircle2 className="w-20 h-20 text-emerald-500 mb-4 animate-bounce" />
            <h2 className="text-3xl font-black text-foreground mb-3">Sensory Harmony Achieved</h2>
            <p className="text-sm font-bold text-muted-foreground mb-6">
              You turned chaotic noise triggers into a peaceful, balanced atmosphere.
            </p>
            <div className="bg-emerald-500/10 text-emerald-600 border-4 border-emerald-500/20 rounded-2xl px-8 py-3 mb-6 w-full">
              <p className="text-xs font-black uppercase tracking-widest mb-0.5">Harmony Rating</p>
              <p className="text-4xl font-black">100% PERFECT</p>
            </div>
            {onComplete && (
              <div className="flex flex-col items-center gap-3 w-full">
                <Button onClick={() => onComplete(100)} size="lg" className="w-full rounded-full font-black text-xl py-5 shadow-pop hover:-translate-y-1">
                  Complete Lesson <Sparkles className="w-5 h-5 ml-2" />
                </Button>
                {autoReturn !== null && (
                  <span className="text-sm text-muted-foreground font-black animate-pulse">
                    Returning to map in {autoReturn}s...
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
