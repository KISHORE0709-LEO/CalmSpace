import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, Trophy, Sparkles, Heart, Settings, X, Star, AlertTriangle, Eye, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface PeerPressurePanicProps {
  onComplete?: (score: number) => void;
}

interface Point {
  x: number;
  y: number;
}

interface HistoryFrame {
  player: Point;
  ringleader: Point;
}

export const PeerPressurePanic = ({ onComplete }: PeerPressurePanicProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Map settings
  const MAP_WIDTH = 800;
  const MAP_HEIGHT = 400;

  // Accessibility Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState<'off' | 'low' | 'medium'>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Game values
  const [stress, setStress] = useState(20);
  const [pressure, setPressure] = useState(0); // Amber bar
  const [integrity, setIntegrity] = useState(100); // Teal bar
  const [confidence, setConfidence] = useState(30);

  // State machine steps
  const [currentStage, setCurrentStage] = useState<'classroom_ask' | 'hallway_escalation' | 'bathroom_consequence' | 'escaped'>('classroom_ask');
  const [activeDialogue, setActiveDialogue] = useState<boolean>(true);
  const [gameOver, setGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [autoReturn, setAutoReturn] = useState<number | null>(null);

  // Floating text / prompts
  const [floatingText, setFloatingText] = useState<string | null>(null);

  // Easter Eggs & Badges
  const [nearHesitantTimer, setNearHesitantTimer] = useState(0);
  const [unlockedListeningBadge, setUnlockedListeningBadge] = useState(false);
  const [hesitantNPCWhisper, setHesitantNPCWhisper] = useState<string | null>(null);

  // Consequence cutscene triggers
  const [showPriyaCutscene, setShowPriyaCutscene] = useState(false);
  const [reflectionAnswered, setReflectionAnswered] = useState(false);

  // Coordinates
  const playerRef = useRef<Point>({ x: 100, y: 200 }); // starts in classroom
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const historyRef = useRef<HistoryFrame[]>([]);
  const recordCounterRef = useRef(0);

  // Friend Group Positions
  const [ringleader, setRingleader] = useState<Point>({ x: 150, y: 180 });
  const [amplifier, setAmplifier] = useState<Point>({ x: 150, y: 220 });
  const [hesitantNPC, setHesitantNPC] = useState<Point>({ x: 180, y: 200 });

  // Map Zones: Zone 1 (Classroom 0-260px), Zone 2 (Hallway 260-560px), Zone 3 (Bathroom 560-800px)
  const zoneWidth = MAP_WIDTH / 3;

  // Key targets
  const teacherDesk = { x: 50, y: 50, w: 60, h: 40 };
  const counselorDoor = { x: 520, y: 40, w: 40, h: 60 };

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

  // Main Canvas Render and Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tick = () => {
      if (gameOver || activeDialogue || showPriyaCutscene) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const player = playerRef.current;

      // 1. Record history frames for debrief replay
      recordCounterRef.current++;
      if (recordCounterRef.current % 10 === 0) {
        historyRef.current.push({
          player: { x: player.x, y: player.y },
          ringleader: { x: ringleader.x, y: ringleader.y }
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

      // Map boundary checks
      if (nextX > 20 && nextX < MAP_WIDTH - 20) player.x = nextX;
      if (nextY > 20 && nextY < MAP_HEIGHT - 20) player.y = nextY;

      // Class desk obstacle collisions
      const desks = [
        { x: 80, y: 120, w: 40, h: 30 },
        { x: 160, y: 120, w: 40, h: 30 },
        { x: 80, y: 240, w: 40, h: 30 },
        { x: 160, y: 240, w: 40, h: 30 }
      ];

      desks.forEach(d => {
        if (
          player.x > d.x - 10 &&
          player.x < d.x + d.w + 10 &&
          player.y > d.y - 10 &&
          player.y < d.y + d.h + 10
        ) {
          player.x -= dx;
          player.y -= dy;
        }
      });

      // 3. Check trigger thresholds for zone progression and dialogues
      // classroom ask triggers on start
      if (currentStage === 'classroom_ask' && player.x > 220) {
        // Trigger hallway escalation dialog
        setCurrentStage('hallway_escalation');
        setActiveDialogue(true);

        // Move group to Zone 2 lockers
        setRingleader({ x: 400, y: 180 });
        setAmplifier({ x: 390, y: 220 });
        setHesitantNPC({ x: 440, y: 200 });
      }

      if (currentStage === 'hallway_escalation' && player.x > 530) {
        // Trigger bathroom consequence dialog
        setCurrentStage('bathroom_consequence');
        setActiveDialogue(true);

        // Move group to Zone 3 bathroom corridor
        setRingleader({ x: 680, y: 180 });
        setAmplifier({ x: 670, y: 220 });
        setHesitantNPC({ x: 710, y: 200 });
      }

      // Check escaped win triggers
      if (
        player.x >= counselorDoor.x &&
        player.x <= counselorDoor.x + counselorDoor.w &&
        player.y >= counselorDoor.y &&
        player.y <= counselorDoor.y + counselorDoor.h
      ) {
        setIsWin(true);
        setGameOver(true);
        setConfidence(c => Math.min(100, c + 25));
        return;
      }

      // 4. Update hesitant NPC easter egg
      const distToHesitant = Math.hypot(player.x - hesitantNPC.x, player.y - hesitantNPC.y);
      const distToRingleader = Math.hypot(player.x - ringleader.x, player.y - ringleader.y);
      
      // If close to hesitant NPC and far from ringleader, trigger whisper
      if (distToHesitant < 45 && distToRingleader > 60) {
        setNearHesitantTimer(t => {
          const next = t + (1 / 60);
          if (next >= 3.0 && !unlockedListeningBadge) { // 3 seconds to hear whisper
            setUnlockedListeningBadge(true);
            setHesitantNPCWhisper("I don't really want to do this either.");
            setFloatingText("Badge Unlocked: You listened closely.");
            setConfidence(c => Math.min(100, c + 15));
          }
          return next;
        });
      } else {
        setNearHesitantTimer(0);
        setHesitantNPCWhisper(null);
      }

      // 5. Update pressure bar based on proximity to ringleader/amplifier
      const distToGroup = Math.hypot(player.x - ringleader.x, player.y - ringleader.y);
      if (distToGroup < 100) {
        setPressure(p => Math.min(100, p + 0.15));
      } else {
        setPressure(p => Math.max(0, p - 0.25));
      }

      // 6. RENDER CANVAS
      ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

      // Muted school hallway background
      ctx.fillStyle = highContrast ? '#ffffff' : '#f8fafc';
      ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

      // Render Zone Separators
      ctx.strokeStyle = highContrast ? '#000000' : '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(zoneWidth, 0);
      ctx.lineTo(zoneWidth, MAP_HEIGHT);
      ctx.moveTo(zoneWidth * 2, 0);
      ctx.lineTo(zoneWidth * 2, MAP_HEIGHT);
      ctx.stroke();

      // Zone Labels
      ctx.fillStyle = highContrast ? '#000000' : '#64748b';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('ZONE 1: CLASSROOM', 20, 25);
      ctx.fillText('ZONE 2: HALLWAY', zoneWidth + 20, 25);
      ctx.fillText('ZONE 3: BACK CORRIDOR', zoneWidth * 2 + 20, 25);

      // Zone 1: Classroom details (desks and teacher standing back turned)
      ctx.fillStyle = '#cbd5e1';
      desks.forEach(d => {
        ctx.fillRect(d.x, d.y, d.w, d.h);
        ctx.strokeRect(d.x, d.y, d.w, d.h);
      });

      // Teacher Desk & teacher
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(teacherDesk.x, teacherDesk.y, teacherDesk.w, teacherDesk.h);
      ctx.strokeRect(teacherDesk.x, teacherDesk.y, teacherDesk.w, teacherDesk.h);

      // Teacher facing desk
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(teacherDesk.x + teacherDesk.w / 2, teacherDesk.y - 12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '8px sans-serif';
      ctx.fillText('👩‍🏫', teacherDesk.x + teacherDesk.w / 2 - 5, teacherDesk.y - 9);

      // Zone 2: Hallway lockers details
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(zoneWidth + 60, 40, 160, 25); // Top Lockers
      ctx.strokeRect(zoneWidth + 60, 40, 160, 25);

      // Counselor Door glowing
      ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.fillRect(counselorDoor.x, counselorDoor.y, counselorDoor.w, counselorDoor.h);
      ctx.strokeRect(counselorDoor.x, counselorDoor.y, counselorDoor.w, counselorDoor.h);
      ctx.fillStyle = highContrast ? '#000000' : '#047857';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('🚪 COUNSELOR', counselorDoor.x - 20, counselorDoor.y + 75);

      // Draw Ringleader, Amplifier, and Hesitant NPCs
      // Ringleader (🗣️)
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(ringleader.x, ringleader.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '10px sans-serif';
      ctx.fillText('🗣️', ringleader.x - 6, ringleader.y + 4);

      // Amplifier (😂)
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(amplifier.x, amplifier.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '10px sans-serif';
      ctx.fillText('😂', amplifier.x - 6, amplifier.y + 4);

      // Hesitant NPC (😟)
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(hesitantNPC.x, hesitantNPC.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '10px sans-serif';
      ctx.fillText('😟', hesitantNPC.x - 6, hesitantNPC.y + 4);

      // Label Group Members
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('Ringleader', ringleader.x - 20, ringleader.y - 15);
      ctx.fillText('Amplifier', amplifier.x - 20, amplifier.y + 25);
      ctx.fillText('Friend', hesitantNPC.x - 12, hesitantNPC.y - 15);

      // Draw Player avatar with dynamic expression
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
  }, [gameOver, activeDialogue, currentStage, hesitantNPC, ringleader, amplifier, showPriyaCutscene, highContrast, stress]);

  // Dialogue choices handler
  const handleStageChoice = (option: 'A' | 'B' | 'C') => {
    setActiveDialogue(false);

    if (currentStage === 'classroom_ask') {
      if (option === 'A') {
        setFloatingText("Walking away takes courage.");
        setPressure(p => Math.max(0, p - 10));
        setConfidence(c => Math.min(100, c + 5));
      } else if (option === 'B') {
        setFloatingText("The ringleader senses your hesitation.");
        setPressure(p => Math.min(100, p + 20));
        setIntegrity(i => Math.max(0, i - 10));
      } else if (option === 'C') {
        setFloatingText("Going along felt easier. Notice how pressure rises.");
        setPressure(p => Math.min(100, p + 30));
        setIntegrity(i => Math.max(0, i - 25));
      }
    } else if (currentStage === 'hallway_escalation') {
      if (option === 'A') {
        // Escaped pressure! Ringleader walks away, Hesitant stays behind
        setCurrentStage('escaped');
        setRingleader({ x: -100, y: -100 });
        setAmplifier({ x: -100, y: -100 });
        setFloatingText("You said No. The counselor door is open.");
        setConfidence(c => Math.min(100, c + 20));
        setPressure(0);
      } else if (option === 'B') {
        setFloatingText("Watching is different from doing — but still feels bad.");
        setIntegrity(i => Math.max(0, i - 15));
        setPressure(p => Math.min(100, p + 15));
      } else if (option === 'C') {
        setFloatingText("The pressure worked. Escalate to the back corridor.");
        setIntegrity(i => Math.max(0, i - 30));
        setPressure(p => Math.min(100, p + 35));
      }
    } else if (currentStage === 'bathroom_consequence') {
      if (option === 'A') {
        setFloatingText("Telling the truth is hard. You did it.");
        setIntegrity(i => Math.min(100, i + 20));
        setConfidence(c => Math.min(100, c + 25));
        setIsWin(true);
        setGameOver(true);
      } else if (option === 'B') {
        setFloatingText("Sometimes we freeze. That's human.");
        setIsWin(true);
        setGameOver(true);
      } else if (option === 'C') {
        setIntegrity(0);
        setShowPriyaCutscene(true);
      }
    }
  };

  // Re-draw history replay path canvas
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
      
      {/* Top HUD: Pressure Gauge and Integrity Bar */}
      <div className="w-full bg-card/90 backdrop-blur-md border-[5px] border-foreground rounded-[2rem] p-5 shadow-pop mb-6 flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Integrity Bar (Teal) */}
        <div className="flex-1 w-full max-w-xs">
          <span className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase mb-1 block">My Integrity</span>
          <div className="w-full h-4 bg-muted border-2 border-foreground rounded-full overflow-hidden relative shadow-inner">
            <div 
              className="h-full bg-teal-400 transition-all duration-300 ease-out"
              style={{ width: `${integrity}%` }}
            />
          </div>
        </div>

        {/* Pressure Gauge (Amber) */}
        <div className="flex-1 w-full max-w-xs">
          <span className="text-xs font-black text-amber-500 uppercase mb-1 block font-mono">Social Pressure</span>
          <div className="w-full h-4 bg-muted border-2 border-foreground rounded-full overflow-hidden relative shadow-inner">
            <div 
              className="h-full bg-amber-400 transition-all duration-300 ease-out"
              style={{ width: `${pressure}%` }}
            />
          </div>
        </div>

        {/* Confidence Display */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-black text-muted-foreground uppercase">Confidence Score</span>
          <span className="text-2xl font-black text-foreground">{Math.round(confidence)} pts</span>
        </div>

        {/* Settings gear */}
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          className="rounded-full shadow-pop-sm"
        >
          <Settings className="w-4 h-4 mr-1.5" /> Settings
        </Button>
      </div>

      {/* Interactive dialogue prompts */}
      {floatingText && (
        <div className="w-full max-w-md bg-sky-50 dark:bg-sky-950/20 border-2 border-sky-300 text-sky-700 dark:text-sky-300 rounded-xl px-4 py-2 text-center text-xs font-bold mb-4 animate-fade-up">
          {floatingText}
        </div>
      )}

      {/* Hesitant NPC Whisper easter egg indicator */}
      {hesitantNPCWhisper && (
        <div className="w-full max-w-md bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-300 text-amber-800 dark:text-amber-300 rounded-xl p-3 text-center text-xs font-black mb-4 animate-bounce-slow">
          🤐 Friend whispers: "{hesitantNPCWhisper}"
        </div>
      )}

      {/* Main Game Screen */}
      {!gameOver && !showPriyaCutscene ? (
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
              👉 Move right to advance maps. Find the green counselor door to escape.
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Move:</span>
              <kbd className="px-2 py-1 bg-muted border border-foreground/20 rounded text-xs font-bold font-mono">WASD</kbd>
            </div>
          </div>
        </div>
      ) : showPriyaCutscene ? (
        /* Empathy Cutscene for option C giving in */
        <div className="w-full bg-card border-[6px] border-foreground rounded-[2.5rem] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-fade-up max-w-md flex flex-col items-center text-center gap-6">
          <div className="text-6xl animate-wiggle">😢</div>
          <h3 className="text-2xl font-black text-foreground">Consequence Scene</h3>
          <p className="text-sm font-bold text-muted-foreground leading-relaxed">
            Priya walked to her locker after class and saw the mean message written on it. Her face turned sad and she looked around holding back tears.
          </p>
          <div className="bg-red-500/10 border-2 border-red-500/20 text-red-700 rounded-2xl p-4 w-full">
            <p className="text-xs font-black uppercase tracking-wider">Empathy reflection</p>
            <p className="text-sm font-bold mt-1">"How do you think Priya felt?"</p>
          </div>
          <Button
            onClick={() => {
              setShowPriyaCutscene(false);
              setGameOver(true);
              setIsWin(false);
            }}
            className="w-full rounded-full font-black text-md py-5 shadow-pop hover:-translate-y-0.5"
          >
            Continue to Debrief
          </Button>
        </div>
      ) : (
        /* Debrief Screen */
        <div className="w-full bg-card border-[6px] border-foreground rounded-[2.5rem] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-fade-up max-w-2xl flex flex-col gap-6">
          <div className="flex items-center justify-between border-b-4 border-foreground pb-4">
            <h2 className="text-2xl font-black text-foreground">Quest Debrief</h2>
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

          {/* Badges unlocked */}
          {unlockedListeningBadge && (
            <div className="bg-emerald-500/10 border-4 border-emerald-500/20 text-emerald-600 rounded-2xl p-4 flex items-center gap-3 animate-bounce-slow">
              <Award className="w-10 h-10" />
              <div className="text-left">
                <p className="text-xs font-black uppercase tracking-widest">Badge Unlocked!</p>
                <p className="text-sm font-black">"You listened closely"</p>
                <p className="text-[10px] font-semibold text-emerald-600/80">You found the hesitant friend and listened to their true thoughts.</p>
              </div>
            </div>
          )}

          {/* Three illustrated momentos */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black text-muted-foreground uppercase">Lesson Moments</span>
            
            <div className="bg-background border-2 border-foreground rounded-2xl p-4 flex gap-3 items-start">
              <span className="text-2xl">🗣️</span>
              <p className="text-xs font-bold text-foreground/80 leading-relaxed">
                "Your friends asked you to do something that would hurt someone else."
              </p>
            </div>

            <div className="bg-background border-2 border-foreground rounded-2xl p-4 flex gap-3 items-start">
              <span className="text-2xl">⚡</span>
              <p className="text-xs font-bold text-foreground/80 leading-relaxed">
                "The more you stayed near them, the harder it got to say no."
              </p>
            </div>

            <div className="bg-background border-2 border-foreground rounded-2xl p-4 flex gap-3 items-start">
              <span className="text-2xl">😟</span>
              <p className="text-xs font-bold text-foreground/80 leading-relaxed">
                "One person in the group also didn't want to do it — did you notice?"
              </p>
            </div>
          </div>

          {/* Reflection panel */}
          <div className="bg-primary/5 border-4 border-foreground rounded-2xl p-5 flex flex-col gap-3">
            <span className="text-xs font-black text-muted-foreground uppercase">What would you do next time?</span>
            {!reflectionAnswered ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setReflectionAnswered(true)}
                  className="flex-1 rounded-xl border-2 border-foreground font-black py-4 shadow-pop-sm text-xs text-foreground"
                >
                  Yes and I said no
                </Button>
                <Button 
                  onClick={() => setReflectionAnswered(true)}
                  className="flex-1 rounded-xl border-2 border-foreground font-black py-4 shadow-pop-sm text-xs text-foreground"
                >
                  Yes and I did it
                </Button>
              </div>
            ) : (
              <div className="text-xs font-bold text-emerald-600">
                ✔️ Both choices are common. Pausing and reflecting helps you build strength for next time.
              </div>
            )}
          </div>

          {/* Progression actions */}
          <div className="flex gap-4 border-t-4 border-foreground pt-4 mt-2">
            <Button
              onClick={() => {
                setStress(20);
                setPressure(0);
                setIntegrity(100);
                setConfidence(30);
                setCurrentStage('classroom_ask');
                setActiveDialogue(true);
                setGameOver(false);
                setIsWin(false);
                setReflectionAnswered(false);
                setNearHesitantTimer(0);
                setUnlockedListeningBadge(false);
                setRingleader({ x: 150, y: 180 });
                setAmplifier({ x: 150, y: 220 });
                setHesitantNPC({ x: 180, y: 200 });
                playerRef.current = { x: 100, y: 200 };
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
                Next Scenario
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Stage Dialogue Modals */}
      {activeDialogue && !gameOver && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border-[6px] border-foreground rounded-[2.5rem] p-6 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-fade-up text-center">
            
            {/* Modal Title */}
            <div className="flex items-center justify-center gap-2 mb-4 border-b-2 border-foreground pb-2">
              <span className="text-3xl">🗣️</span>
              <h3 className="text-md font-black text-foreground">
                {currentStage === 'classroom_ask' && "Classroom Ask"}
                {currentStage === 'hallway_escalation' && "Hallway Escalation"}
                {currentStage === 'bathroom_consequence' && "Teacher Confrontation"}
              </h3>
            </div>

            {/* Prompt dialogue */}
            <p className="text-xs font-bold text-foreground leading-relaxed mb-6 bg-muted/50 p-4 rounded-xl border border-foreground/10">
              {currentStage === 'classroom_ask' && '"Hey, we\'re gonna write something mean on Priya\'s locker. Come with us — it\'ll be funny."'}
              {currentStage === 'hallway_escalation' && '"Okay your turn, you write something."'}
              {currentStage === 'bathroom_consequence' && 'The teacher appears behind you and points at the marker: "What is happening here?" Ringleader says "We were just joking."'}
            </p>

            {/* Option choices */}
            <div className="flex flex-col gap-3">
              {currentStage === 'classroom_ask' && (
                <>
                  <Button
                    onClick={() => handleStageChoice('A')}
                    className="w-full text-left bg-background hover:bg-muted border-2 border-foreground rounded-2xl p-4 font-black text-xs text-foreground shadow-pop-sm"
                  >
                    Option A: "I don't think that's a good idea."
                  </Button>
                  <Button
                    onClick={() => handleStageChoice('B')}
                    className="w-full text-left bg-background hover:bg-muted border-2 border-foreground rounded-2xl p-4 font-black text-xs text-foreground shadow-pop-sm"
                  >
                    Option B: "Maybe... what are you going to write?"
                  </Button>
                  <Button
                    onClick={() => handleStageChoice('C')}
                    variant="destructive"
                    className="w-full text-left border-2 border-foreground rounded-2xl p-4 font-black text-xs shadow-pop-sm"
                  >
                    Option C: "Sure, sounds fun."
                  </Button>
                </>
              )}

              {currentStage === 'hallway_escalation' && (
                <>
                  <Button
                    onClick={() => handleStageChoice('A')}
                    className="w-full text-left bg-background hover:bg-muted border-2 border-foreground rounded-2xl p-4 font-black text-xs text-foreground shadow-pop-sm"
                  >
                    Option A: "No. I'm not doing that. It's mean."
                  </Button>
                  <Button
                    onClick={() => handleStageChoice('B')}
                    className="w-full text-left bg-background hover:bg-muted border-2 border-foreground rounded-2xl p-4 font-black text-xs text-foreground shadow-pop-sm"
                  >
                    Option B: "I'll just watch."
                  </Button>
                  <Button
                    onClick={() => handleStageChoice('C')}
                    variant="destructive"
                    className="w-full text-left border-2 border-foreground rounded-2xl p-4 font-black text-xs shadow-pop-sm"
                  >
                    Option C: (Take the marker and write it)
                  </Button>
                </>
              )}

              {currentStage === 'bathroom_consequence' && (
                <>
                  <Button
                    onClick={() => handleStageChoice('A')}
                    className="w-full text-left bg-background hover:bg-muted border-2 border-foreground rounded-2xl p-4 font-black text-xs text-foreground shadow-pop-sm"
                  >
                    Option A: "Tell the truth — we were going to write on Priya's locker."
                  </Button>
                  <Button
                    onClick={() => handleStageChoice('B')}
                    className="w-full text-left bg-background hover:bg-muted border-2 border-foreground rounded-2xl p-4 font-black text-xs text-foreground shadow-pop-sm"
                  >
                    Option B: (Say nothing)
                  </Button>
                  <Button
                    onClick={() => handleStageChoice('C')}
                    variant="destructive"
                    className="w-full text-left border-2 border-foreground rounded-2xl p-4 font-black text-xs shadow-pop-sm"
                  >
                    Option C: (Go along with "just joking")
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
