import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, Trophy, Sparkles, Heart, Settings, X, Star, AlertTriangle, Eye, Award, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafeStrangerQuestProps {
  onComplete?: (score: number) => void;
}

interface Point {
  x: number;
  y: number;
}

interface StrangerNPC {
  id: string;
  emoji: string;
  name: string;
  x: number;
  y: number;
  type: 'tourist' | 'pushy_stranger' | 'bird_feeder' | 'lost_parent' | 'lost_vendor' | 'lost_busy' | 'lost_path';
  scanned: boolean;
  message?: string;
  // Lens scan parameters
  contextText: string;
  attentionText: string;
  feelingText: string; // "Okay" | "Uncertain" | "Uncomfortable"
  feelingColor: string;
  interpretation: string;
}

interface HistoryFrame {
  player: Point;
  scannedCount: number;
}

export const SafeStrangerQuest = ({ onComplete }: SafeStrangerQuestProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Map settings
  const MAP_WIDTH = 800;
  const MAP_HEIGHT = 400;
  const zoneWidth = MAP_WIDTH / 3;

  // Accessibility Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState<'off' | 'low' | 'medium'>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Game state values
  const [stress, setStress] = useState(20);
  const [confidence, setConfidence] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [autoReturn, setAutoReturn] = useState<number | null>(null);
  const [floatingText, setFloatingText] = useState<string | null>("Use the Investigation Lens (Magnifying Glass) to scan strangers.");

  // Lost State trigger
  const [isLostState, setIsLostState] = useState(false);

  // Investigation Lens active scanner
  const [activeScanNpc, setActiveScanNpc] = useState<StrangerNPC | null>(null);
  const [scanProgress, setScanProgress] = useState<number | null>(null);
  const [showDialogueChoice, setShowDialogueChoice] = useState<StrangerNPC | null>(null);

  // Badges
  const [scannedIds, setScannedIds] = useState<string[]>([]);
  const [unlockedEvidenceBadge, setUnlockedEvidenceBadge] = useState(false);
  const [reflectionAnswered, setReflectionAnswered] = useState(false);

  // Player and path tracking
  const playerRef = useRef<Point>({ x: 50, y: 220 });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const historyRef = useRef<HistoryFrame[]>([]);
  const recordCounterRef = useRef(0);

  // Stranger NPCs List
  const [npcs, setNpcs] = useState<StrangerNPC[]>([
    {
      id: 'tourist',
      emoji: '🗺️',
      name: 'Unfamiliar Map Reader',
      x: 180,
      y: 240,
      type: 'tourist',
      scanned: false,
      contextText: "Public daytime street, others nearby.",
      attentionText: "Focused on map, not looking at you.",
      feelingText: "Okay",
      feelingColor: "text-emerald-500",
      interpretation: "This person is looking at their map and needs directions. They are not focused on you.",
      message: "Excuse me, do you know where the pharmacy is?"
    },
    {
      id: 'pushy_stranger',
      emoji: '👤',
      name: 'Approaching Stranger',
      x: 380,
      y: 250,
      type: 'pushy_stranger',
      scanned: false,
      contextText: "Bus stop shelter, quiet area.",
      attentionText: "Focused heavily on you.",
      feelingText: "Uncomfortable",
      feelingColor: "text-red-500",
      interpretation: "This person approached you without being asked. They are offering a ride you didn't ask for.",
      message: "Hey, you're waiting alone? My car is just there, I can give you a lift."
    },
    {
      id: 'bird_feeder',
      emoji: '🕊️',
      name: 'Older Person on Bench',
      x: 520,
      y: 120,
      type: 'bird_feeder',
      scanned: false,
      contextText: "Open public park bench, families visible.",
      attentionText: "Focused on feeding birds, not on you.",
      feelingText: "Neutral / Okay",
      feelingColor: "text-emerald-500",
      interpretation: "This person is just enjoying the park and feeding birds. They are neutral.",
      message: "(Feeding birds peacefully, doesn't speak to you)"
    },
    // Lost challenge NPCs (placed in Zone 3)
    {
      id: 'lost_parent',
      emoji: '👨‍👩‍👧‍👦',
      name: 'Parent with Children',
      x: 640,
      y: 240,
      type: 'lost_parent',
      scanned: false,
      contextText: "Public park playground, other children present.",
      attentionText: "Focused on their children playing.",
      feelingText: "Okay / Safe",
      feelingColor: "text-emerald-500",
      interpretation: "This is a parent watching children. A safe public role to ask for help.",
      message: "Hello! Are you lost? I can help you find your way."
    },
    {
      id: 'lost_vendor',
      emoji: '🍦',
      name: 'Ice Cream Vendor',
      x: 740,
      y: 120,
      type: 'lost_vendor',
      scanned: false,
      contextText: "Branded cart, wearing a uniform.",
      attentionText: "Focused on serving food.",
      feelingText: "Okay / Safe",
      feelingColor: "text-emerald-500",
      interpretation: "A worker in a visible uniform. Safe public helper role.",
      message: "Hey buddy, need help finding your parent?"
    },
    {
      id: 'lost_busy',
      emoji: '🚶‍♂️',
      name: 'Distracted Fast Walker',
      x: 680,
      y: 80,
      type: 'lost_busy',
      scanned: false,
      contextText: "Busy sidewalk, on their phone.",
      attentionText: "Focused on their phone conversation.",
      feelingText: "Neutral / Unavailable",
      feelingColor: "text-amber-500",
      interpretation: "This person is busy talking on the phone. They are unavailable.",
      message: "Sorry, I am late for a meeting right now!"
    },
    {
      id: 'lost_path',
      emoji: '👤',
      name: 'Person Near Path',
      x: 730,
      y: 310,
      type: 'lost_path',
      scanned: false,
      contextText: "Isolated wood path end.",
      attentionText: "Watching you walk past.",
      feelingText: "Uncomfortable",
      feelingColor: "text-red-500",
      interpretation: "This person is standing in an isolated spot watching you. Avoid this zone.",
      message: "Hey, why don't you come down this trail with me? It's shorter."
    }
  ]);

  // Map elements
  const busStop = { x: 340, y: 220, w: 90, h: 50 };
  const busVehicle = { x: 440, y: 220, w: 80, h: 50 };
  const pharmacyShop = { x: 40, y: 60, w: 80, h: 70 };

  // Setup Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Auto Return countdown
  useEffect(() => {
    if (gameOver && autoReturn === null) {
      setAutoReturn(5);
    }
  }, [gameOver, autoReturn]);

  useEffect(() => {
    if (autoReturn === null) return;
    if (autoReturn <= 0) {
      if (onComplete) onComplete(isWin ? Math.round(confidence) : 0);
      return;
    }
    const timer = setTimeout(() => setAutoReturn(autoReturn - 1), 1000);
    return () => clearTimeout(timer);
  }, [autoReturn, isWin, confidence, onComplete]);

  // Lost trigger state
  useEffect(() => {
    if (playerRef.current.x > 580 && !isLostState) {
      setIsLostState(true);
      setFloatingText("Your map disappeared! You are lost. Scan and find a safe adult helper.");
    }
  }, [playerRef.current.x, isLostState]);

  // Scan progress count loop
  useEffect(() => {
    if (scanProgress === null || !activeScanNpc) return;
    if (scanProgress >= 100) {
      setScanProgress(null);
      setShowDialogueChoice(activeScanNpc);
      setNpcs(prev => 
        prev.map(n => n.id === activeScanNpc.id ? { ...n, scanned: true } : n)
      );

      // Check Evidence Collector Badge conditions
      setScannedIds(prev => {
        const next = prev.includes(activeScanNpc.id) ? prev : [...prev, activeScanNpc.id];
        // Scan tourist, pushy stranger, bird feeder, and at least one lost NPC
        const hasCore = next.includes('tourist') && next.includes('pushy_stranger') && next.includes('bird_feeder');
        const hasLost = next.some(id => id.startsWith('lost_'));
        if (hasCore && hasLost && !unlockedEvidenceBadge) {
          setUnlockedEvidenceBadge(true);
          setConfidence(c => Math.min(100, c + 15));
        }
        return next;
      });
      return;
    }

    const interval = setTimeout(() => {
      setScanProgress(p => (p !== null ? p + 8 : null));
    }, 80);
    return () => clearTimeout(interval);
  }, [scanProgress, activeScanNpc, unlockedEvidenceBadge]);

  // Main Canvas game loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tick = () => {
      if (gameOver || scanProgress !== null || showDialogueChoice) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const player = playerRef.current;

      // 1. Record history frames for debrief replay
      recordCounterRef.current++;
      if (recordCounterRef.current % 10 === 0) {
        historyRef.current.push({
          player: { x: player.x, y: player.y },
          scannedCount: scannedIds.length
        });
      }

      // 2. Update player movement
      let dx = 0;
      let dy = 0;
      const speed = 2.6;

      if (keysRef.current['w'] || keysRef.current['arrowup']) dy = -speed;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) dy = speed;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) dx = -speed;
      if (keysRef.current['d'] || keysRef.current['arrowright']) dx = speed;

      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const nextX = player.x + dx;
      const nextY = player.y + dy;

      // Map bounds limits
      if (nextX > 20 && nextX < MAP_WIDTH - 20) player.x = nextX;
      if (nextY > 20 && nextY < MAP_HEIGHT - 20) player.y = nextY;

      // 3. RENDER CANVAS
      ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

      // Pavement/Grass landscape
      ctx.fillStyle = highContrast ? '#ffffff' : '#f8fafc';
      ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

      // Zone Dividers
      ctx.strokeStyle = highContrast ? '#000000' : '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(zoneWidth, 0);
      ctx.lineTo(zoneWidth, MAP_HEIGHT);
      ctx.moveTo(zoneWidth * 2, 0);
      ctx.lineTo(zoneWidth * 2, MAP_HEIGHT);
      ctx.stroke();

      // Zone Title Labels
      ctx.fillStyle = highContrast ? '#000000' : '#94a3b8';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('ZONE 1: SHOPPING STREET', 20, 20);
      ctx.fillText('ZONE 2: BUS STOP', zoneWidth + 20, 20);
      ctx.fillText('ZONE 3: OPEN PARK', zoneWidth * 2 + 20, 20);

      // Draw Pharmacy Shop
      ctx.fillStyle = '#eff6ff';
      ctx.fillRect(pharmacyShop.x, pharmacyShop.y, pharmacyShop.w, pharmacyShop.h);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.strokeRect(pharmacyShop.x, pharmacyShop.y, pharmacyShop.w, pharmacyShop.h);

      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('⚕️ PHARMACY', pharmacyShop.x + 8, pharmacyShop.y + 40);

      // Draw Bus Stop Bench & Bus vehicle
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(busStop.x, busStop.y, busStop.w, busStop.h);
      ctx.strokeRect(busStop.x, busStop.y, busStop.w, busStop.h);
      ctx.fillStyle = '#475569';
      ctx.font = '9px sans-serif';
      ctx.fillText('🚏 Bus Shelter', busStop.x + 12, busStop.y + 30);

      // Bus vehicle
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(busVehicle.x, busVehicle.y, busVehicle.w, busVehicle.h);
      ctx.strokeRect(busVehicle.x, busVehicle.y, busVehicle.w, busVehicle.h);
      ctx.fillStyle = 'white';
      ctx.fillText('🚌 BUS', busVehicle.x + 22, busVehicle.y + 30);

      // Draw NPCs
      npcs.forEach(n => {
        // Render simple placeholder circle
        ctx.fillStyle = highContrast ? '#000000' : '#475569';
        ctx.beginPath();
        ctx.arc(n.x, n.y, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '12px sans-serif';
        ctx.fillText(n.emoji, n.x - 6, n.y + 4);

        // Highlight scanned NPCs
        if (n.scanned) {
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 15, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Draw Player circular avatar with face expression based on stress
      const faceEmoji = stress > 75 ? '😰' : stress > 45 ? '😐' : '🙂';
      ctx.fillStyle = highContrast ? '#000000' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(player.x, player.y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '13px sans-serif';
      ctx.fillText(faceEmoji, player.x - 7, player.y + 5);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [gameOver, scanProgress, showDialogueChoice, npcs, scannedIds, highContrast, stress]);

  // Activate magnifying glass investigation lens on nearest NPC
  const activateInvestigationLens = () => {
    if (gameOver || scanProgress !== null || showDialogueChoice) return;

    // Find nearest NPC within range
    const player = playerRef.current;
    let closestNpc: StrangerNPC | null = null;
    let minDist = 75;

    npcs.forEach(n => {
      const dist = Math.hypot(player.x - n.x, player.y - n.y);
      if (dist < minDist) {
        minDist = dist;
        closestNpc = n;
      }
    });

    if (closestNpc) {
      setActiveScanNpc(closestNpc);
      setScanProgress(0);
    } else {
      setFloatingText("Walk closer to a stranger to scan them.");
    }
  };

  // Dialogue choices outcomes
  const handleDialogueChoice = (option: 'A' | 'B' | 'C') => {
    const activeNpc = showDialogueChoice;
    setShowDialogueChoice(null);
    if (!activeNpc) return;

    if (activeNpc.type === 'tourist') {
      if (option === 'B') {
        setFloatingText("This person needed help. You read the situation correctly.");
        setConfidence(c => Math.min(100, c + 10));
      } else {
        setFloatingText("You chose to pass by safely.");
      }
    } else if (activeNpc.type === 'pushy_stranger') {
      if (option === 'A') {
        setFloatingText("Saying no clearly and calmly is always okay.");
        setConfidence(c => Math.min(100, c + 10));
      } else if (option === 'B') {
        setFloatingText("Moving toward a safe adult without making a scene — smart and calm.");
        setConfidence(c => Math.min(100, c + 20));
      } else if (option === 'C') {
        // immediate failure retry trigger
        setStress(100);
        setGameOver(true);
        setIsWin(false);
      }
    } else if (activeNpc.type === 'lost_parent' || activeNpc.type === 'lost_vendor') {
      // Correct choices for lost state completes safety
      setFloatingText("Quest Complete! You safely located assistance.");
      setConfidence(c => Math.min(100, c + 25));
      setIsWin(true);
      setGameOver(true);
    } else if (activeNpc.type === 'lost_busy') {
      setFloatingText("This person wasn't available — that's okay, try someone else.");
    } else if (activeNpc.type === 'lost_path') {
      if (option === 'A') {
        setFloatingText("Something felt off and it was. Walking toward another adult was right.");
        setConfidence(c => Math.min(100, c + 10));
      } else {
        setStress(100);
        setGameOver(true);
        setIsWin(false);
      }
    }
  };

  // Re-draw history path canvas
  const drawReplayCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / MAP_WIDTH;
    const scaleY = canvas.height / MAP_HEIGHT;

    // Draw dividers
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(zoneWidth * scaleX, 0);
    ctx.lineTo(zoneWidth * scaleX, canvas.height);
    ctx.moveTo(zoneWidth * 2 * scaleX, 0);
    ctx.lineTo(zoneWidth * 2 * scaleX, canvas.height);
    ctx.stroke();

    // Draw recorded path
    const path = historyRef.current;
    if (path.length > 1) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(path[0].player.x * scaleX, path[0].player.y * scaleY);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].player.x * scaleX, path[i].player.y * scaleY);
      }
      ctx.stroke();
    }
  };

  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto flex flex-col items-center select-none",
      highContrast && "filter contrast-125 font-mono"
    )}>
      
      {/* Top HUD */}
      <div className="w-full bg-card/90 backdrop-blur-md border-[5px] border-foreground rounded-[2rem] p-5 shadow-pop mb-6 flex flex-row justify-between items-center gap-6">
        
        {/* Stress Meter */}
        <div className="flex-1 w-full max-w-xs">
          <span className="text-xs font-black text-muted-foreground uppercase mb-1 block">How I feel</span>
          <div className="w-full h-4 bg-muted border-2 border-foreground rounded-full overflow-hidden relative shadow-inner">
            <div 
              className={cn(
                "h-full transition-all duration-300 ease-out",
                stress > 70 ? "bg-red-500" : stress > 45 ? "bg-amber-400" : "bg-emerald-400"
              )}
              style={{ width: `${stress}%` }}
            />
          </div>
        </div>

        {/* Confidence Display */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-black text-muted-foreground uppercase">Confidence Score</span>
          <span className="text-xl font-black text-foreground">{Math.round(confidence)} pts</span>
        </div>

        {/* Lens active buttons */}
        <Button
          onClick={activateInvestigationLens}
          className="rounded-full border-2 border-foreground shadow-pop-sm font-black py-4 px-6 bg-yellow-400 hover:bg-yellow-500 text-black"
        >
          <Search className="w-4 h-4 mr-1.5" /> Investigation Lens
        </Button>

        <Button 
          variant="outline"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          className="rounded-full shadow-pop-sm"
        >
          <Settings className="w-4 h-4 mr-1.5" /> Settings
        </Button>
      </div>

      {/* Info notification */}
      {floatingText && (
        <div className="w-full max-w-md bg-sky-50 dark:bg-sky-950/20 border-2 border-sky-300 text-sky-700 dark:text-sky-300 rounded-xl px-4 py-2 text-center text-xs font-bold mb-4 animate-fade-up">
          {floatingText}
        </div>
      )}

      {/* Main Game Screen */}
      {!gameOver ? (
        <div className="w-full bg-card border-[6px] border-foreground rounded-[2.5rem] p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col gap-4">
          
          {/* HTML5 Canvas */}
          <div className="flex justify-center bg-slate-900 rounded-2xl border-4 border-foreground relative overflow-hidden">
            <canvas
              ref={canvasRef}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              className="w-full h-auto max-w-full block"
            />
          </div>

          <div className="flex justify-between items-center gap-4">
            <span className="text-xs font-bold text-muted-foreground">
              💡 Walk near characters and press the yellow **Investigation Lens** button to scan them.
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Move:</span>
              <kbd className="px-2 py-1 bg-muted border border-foreground/20 rounded text-xs font-bold font-mono">WASD</kbd>
            </div>
          </div>
        </div>
      ) : (
        /* Debrief Screen */
        <div className="w-full bg-card border-[6px] border-foreground rounded-[2.5rem] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-fade-up max-w-2xl flex flex-col gap-6">
          <div className="flex items-center justify-between border-b-4 border-foreground pb-4">
            <h2 className="text-2xl font-black text-foreground">
              {isWin ? "Safe Stranger Quest Complete!" : "Safety Risk Reached"}
            </h2>
            <div className="flex gap-1.5">
              {Array.from({ length: 3 }).map((_, idx) => {
                const starsCount = confidence > 70 ? 3 : confidence > 45 ? 2 : 1;
                return (
                  <Star 
                    key={idx} 
                    className={cn(
                      "w-7 h-7 transition-all duration-500",
                      idx < starsCount ? "fill-yellow-400 text-yellow-500 animate-bounce-slow" : "text-gray-300"
                    )}
                  />
                );
              })}
            </div>
          </div>

          {/* Replay mini canvas */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black text-muted-foreground uppercase">Your Path Replay (Blue)</span>
            <div className="border-4 border-foreground rounded-2xl overflow-hidden bg-slate-900 flex justify-center">
              <canvas
                ref={el => {
                  if (el) drawReplayCanvas(el);
                }}
                width={360}
                height={180}
                className="block"
              />
            </div>
          </div>

          {/* Evidence Collector Badge */}
          {unlockedEvidenceBadge && (
            <div className="bg-yellow-500/10 border-4 border-yellow-500/20 text-yellow-600 rounded-2xl p-4 flex items-center gap-3 animate-bounce-slow">
              <Award className="w-10 h-10" />
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest">Badge Unlocked!</p>
                <p className="text-sm font-black">"Evidence Collector"</p>
                <p className="text-[10px] font-semibold text-yellow-600/80">You used the lens on every stranger encounter without skipping.</p>
              </div>
            </div>
          )}

          {/* Three illustrated momentos */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black text-muted-foreground uppercase">Lesson Moments</span>
            
            <div className="bg-background border-2 border-foreground rounded-2xl p-4 flex gap-3 items-start">
              <span className="text-2xl">🗺️</span>
              <p className="text-xs font-bold text-foreground/80 leading-relaxed">
                "The tourist needed help — you read that situation correctly."
              </p>
            </div>

            <div className="bg-background border-2 border-foreground rounded-2xl p-4 flex gap-3 items-start">
              <span className="text-2xl">🚏</span>
              <p className="text-xs font-bold text-foreground/80 leading-relaxed">
                "At the bus stop, your feeling told you something. Feelings are information."
              </p>
            </div>

            <div className="bg-background border-2 border-foreground rounded-2xl p-4 flex gap-3 items-start">
              <span className="text-2xl">🍦</span>
              <p className="text-xs font-bold text-foreground/80 leading-relaxed">
                "When you were lost, you found a safe adult in uniform. That's exactly right."
              </p>
            </div>
          </div>

          {/* Open select reflection */}
          <div className="bg-primary/5 border-4 border-foreground rounded-2xl p-5 flex flex-col gap-3 text-left">
            <span className="text-xs font-black text-muted-foreground uppercase">If you were lost somewhere, who would you ask for help?</span>
            {!reflectionAnswered ? (
              <div className="grid grid-cols-2 gap-2">
                {["A police officer", "A shop worker", "A parent with children", "A stranger sitting alone"].map((ans) => (
                  <button
                    key={ans}
                    onClick={() => setReflectionAnswered(true)}
                    className="bg-background hover:bg-muted border-2 border-foreground rounded-xl p-3 font-bold text-xs text-foreground text-left shadow-pop-sm"
                  >
                    {ans}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                ✔️ Identifiable public uniforms (officers, workers) and parents with kids are excellent choices.
              </div>
            )}
          </div>

          {/* Progression actions */}
          <div className="flex gap-4 border-t-4 border-foreground pt-4 mt-2">
            <Button
              onClick={() => {
                setStress(20);
                setConfidence(30);
                setGameOver(false);
                setIsWin(false);
                setIsLostState(false);
                setReflectionAnswered(false);
                setScannedIds([]);
                setUnlockedEvidenceBadge(false);
                // reset npcs
                setNpcs(prev => prev.map(n => ({ ...n, scanned: false })));
                playerRef.current = { x: 50, y: 220 };
                historyRef.current = [];
              }}
              variant="outline"
              className="flex-1 rounded-full border-2 border-foreground font-black text-md py-5 shadow-pop-sm hover:-translate-y-0.5"
            >
              Play Again
            </Button>
            {onComplete && (
              <Button
                onClick={() => onComplete(Math.round(confidence))}
                className="flex-1 rounded-full border-2 border-foreground font-black text-md py-5 shadow-pop hover:-translate-y-0.5"
              >
                Complete Quest
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Investigation Lens Active Scanner Overlay */}
      {scanProgress !== null && activeScanNpc && (
        <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border-[6px] border-foreground rounded-[2.5rem] p-6 max-w-sm w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] text-center animate-fade-up">
            <h3 className="text-lg font-black text-foreground mb-4 flex items-center justify-center gap-1.5">
              <Search className="w-5 h-5 animate-pulse text-yellow-500" /> Scanning Stranger...
            </h3>
            <div className="w-full h-4 bg-muted border-2 border-foreground rounded-full overflow-hidden relative shadow-inner mb-6">
              <div 
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <p className="text-xs font-bold text-muted-foreground animate-pulse">Running social metrics evaluation...</p>
          </div>
        </div>
      )}

      {/* Scanner dialogue result popup */}
      {showDialogueChoice && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border-[6px] border-foreground rounded-[2.5rem] p-6 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-fade-up text-left">
            
            {/* Scan findings details */}
            <h3 className="text-lg font-black text-foreground mb-4 border-b-2 border-foreground pb-2 flex items-center gap-2">
              <span>{showDialogueChoice.emoji}</span>
              <span>{showDialogueChoice.name}</span>
            </h3>

            {/* Lens scanning output details */}
            <div className="bg-yellow-500/5 border-2 border-yellow-500/20 rounded-2xl p-4 mb-4 space-y-2 text-xs font-bold text-foreground">
              <p>🔍 **What they are doing:** {showDialogueChoice.contextText}</p>
              <p>👤 **Focus/Attention:** {showDialogueChoice.attentionText}</p>
              <p>💭 **Your Feeling:** <span className={showDialogueChoice.feelingColor}>{showDialogueChoice.feelingText}</span></p>
              <p className="border-t border-foreground/10 pt-2 mt-2 font-mono text-muted-foreground leading-relaxed">
                👉 **Interpretation:** {showDialogueChoice.interpretation}
              </p>
            </div>

            {/* Dialogue bubble */}
            <p className="text-xs font-black bg-muted p-4 rounded-xl border border-foreground/10 mb-6 leading-relaxed">
              "{showDialogueChoice.message}"
            </p>

            {/* Response options */}
            <div className="flex flex-col gap-3">
              {showDialogueChoice.type === 'tourist' && (
                <>
                  <Button
                    onClick={() => handleDialogueChoice('B')}
                    className="w-full text-left bg-background hover:bg-muted border-2 border-foreground rounded-2xl p-4 font-black text-xs text-foreground shadow-pop-sm"
                  >
                    Option A: Ask "do you need help?" and point to pharmacy
                  </Button>
                  <Button
                    onClick={() => handleDialogueChoice('A')}
                    className="w-full text-left bg-background hover:bg-muted border-2 border-foreground rounded-2xl p-4 font-black text-xs text-foreground shadow-pop-sm"
                  >
                    Option B: Walk past and ignore them
                  </Button>
                </>
              )}

              {showDialogueChoice.type === 'pushy_stranger' && (
                <>
                  <Button
                    onClick={() => handleDialogueChoice('A')}
                    className="w-full text-left bg-background hover:bg-muted border-2 border-foreground rounded-2xl p-4 font-black text-xs text-foreground shadow-pop-sm"
                  >
                    Option A: "No thank you. I'm fine waiting."
                  </Button>
                  <Button
                    onClick={() => handleDialogueChoice('B')}
                    className="w-full text-left bg-background hover:bg-muted border-2 border-foreground rounded-2xl p-4 font-black text-xs text-foreground shadow-pop-sm"
                  >
                    Option B: Walk toward the Bus Driver (safe anchor)
                  </Button>
                  <Button
                    onClick={() => handleDialogueChoice('C')}
                    variant="destructive"
                    className="w-full text-left border-2 border-foreground rounded-2xl p-4 font-black text-xs shadow-pop-sm"
                  >
                    Option C: Accept lift and follow them to car
                  </Button>
                </>
              )}

              {showDialogueChoice.type === 'bird_feeder' && (
                <Button
                  onClick={() => handleDialogueChoice('A')}
                  className="w-full rounded-full font-black text-xs py-4 shadow-pop"
                >
                  Continue walking safely
                </Button>
              )}

              {/* Lost states options */}
              {(showDialogueChoice.type === 'lost_parent' || showDialogueChoice.type === 'lost_vendor') && (
                <Button
                  onClick={() => handleDialogueChoice('B')}
                  className="w-full rounded-full font-black text-xs py-4 shadow-pop"
                >
                  Ask them for help finding your way
                </Button>
              )}

              {showDialogueChoice.type === 'lost_busy' && (
                <Button
                  onClick={() => handleDialogueChoice('A')}
                  className="w-full rounded-full font-black text-xs py-4 shadow-pop"
                >
                  Look for someone else
                </Button>
              )}

              {showDialogueChoice.type === 'lost_path' && (
                <>
                  <Button
                    onClick={() => handleDialogueChoice('A')}
                    className="w-full text-left bg-background hover:bg-muted border-2 border-foreground rounded-2xl p-4 font-black text-xs text-foreground shadow-pop-sm"
                  >
                    Option A: Decline and walk toward the parent with children
                  </Button>
                  <Button
                    onClick={() => handleDialogueChoice('C')}
                    variant="destructive"
                    className="w-full text-left border-2 border-foreground rounded-2xl p-4 font-black text-xs shadow-pop-sm"
                  >
                    Option B: Follow them down the path
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Accessibility Sensory Settings Panel */}
      {settingsOpen && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border-[6px] border-foreground rounded-[2.5rem] p-6 max-w-sm w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative animate-fade-up">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSettingsOpen(false)}
              className="absolute top-4 right-4 rounded-full border-2 border-foreground"
            >
              <X className="w-4 h-4" />
            </Button>

            <h3 className="text-lg font-black text-foreground mb-4">Sensory Settings</h3>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-black text-muted-foreground uppercase">Screen Shake</span>
                <div className="flex gap-2">
                  {(['off', 'low', 'medium'] as const).map(level => (
                    <Button
                      key={level}
                      variant={shakeIntensity === level ? 'default' : 'outline'}
                      onClick={() => setShakeIntensity(level)}
                      className="flex-1 rounded-xl border-2 border-foreground font-black text-xs"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center bg-muted/40 p-3 rounded-2xl border-2 border-foreground">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-foreground">High Contrast Mode</span>
                  <span className="text-[10px] text-muted-foreground">Increases contrast colors</span>
                </div>
                <input 
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="w-5 h-5 accent-primary border-2 border-foreground cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center bg-muted/40 p-3 rounded-2xl border-2 border-foreground">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-foreground">Reduced Motion</span>
                  <span className="text-[10px] text-muted-foreground">Disables shakes and transitions</span>
                </div>
                <input 
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => {
                    setReducedMotion(e.target.checked);
                    if (e.target.checked) setShakeIntensity('off');
                  }}
                  className="w-5 h-5 accent-primary border-2 border-foreground cursor-pointer"
                />
              </div>
            </div>

            <Button
              onClick={() => setSettingsOpen(false)}
              className="w-full rounded-full font-black text-xs py-4 shadow-pop mt-6"
            >
              Save Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
