import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ShieldAlert, Trophy, Sparkles, Heart, AlertTriangle, ShieldCheck, Eye, EyeOff, Settings, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface BullyBlockProps {
  onComplete?: (score: number) => void;
}

interface Point {
  x: number;
  y: number;
}

interface Bully {
  id: string;
  x: number;
  y: number;
  speed: number;
  angle: number;
  state: 'patrol' | 'chase' | 'search';
  patrolPath: Point[];
  currentPathIdx: number;
  searchTimer: number;
  detectionRadius: number;
}

interface Locker {
  x: number;
  y: number;
  w: number;
  h: number;
  id: string;
}

interface FriendGroup {
  x: number;
  y: number;
  r: number;
  emoji: string;
  lines: string[];
  activeLineIdx: number;
  walkTimer: number; // 5 seconds near allies triggers walking
  hasStartedWalking: boolean;
}

// History frame for debrief replay
interface HistoryFrame {
  player: Point;
  bullies: Point[];
}

export const BullyBlock = ({ onComplete }: BullyBlockProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Gameplay parameters
  const MAP_WIDTH = 800;
  const MAP_HEIGHT = 400;

  // Accessibility Settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState<'off' | 'low' | 'medium'>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');

  // Game Loop states
  const [stress, setStress] = useState(20);
  const [confidence, setConfidence] = useState(30);
  const [isHidden, setIsHidden] = useState(false);
  const [isSpotted, setIsSpotted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [reachedOffice, setReachedOffice] = useState<'teacher' | 'counselor' | null>(null);
  const [autoReturn, setAutoReturn] = useState<number | null>(null);

  // Floating feedback banner
  const [floatingBanner, setFloatingBanner] = useState<string | null>(null);

  // Choice moment states
  const [choiceTriggered, setChoiceTriggered] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);

  // Post game reflection state
  const [reflectionAnswered, setReflectionAnswered] = useState(false);

  // Refs for tracking movement & positions
  const playerRef = useRef<Point>({ x: 50, y: 200 });
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const historyRef = useRef<HistoryFrame[]>([]);
  const recordCounterRef = useRef(0);

  // Lockers/Alcoves
  const lockers: Locker[] = [
    { id: 'l1', x: 200, y: 40, w: 45, h: 50 },
    { id: 'l2', x: 380, y: 40, w: 45, h: 50 },
    { id: 'l3', x: 540, y: 40, w: 45, h: 50 },
    { id: 'l4', x: 280, y: 310, w: 45, h: 50 },
    { id: 'l5', x: 480, y: 310, w: 45, h: 50 }
  ];

  // Friend Groups
  const [friendGroups, setFriendGroups] = useState<FriendGroup[]>([
    { 
      x: 180, 
      y: 280, 
      r: 60, 
      emoji: '🧑‍🤝‍🧑', 
      lines: ["Want to walk with me?", "I'll go with you", "Come this way"],
      activeLineIdx: 0,
      walkTimer: 0,
      hasStartedWalking: false
    },
    { 
      x: 480, 
      y: 160, 
      r: 55, 
      emoji: '🎨', 
      lines: ["Stay near us!", "You are safe here.", "Let's walk toward the counselor office."],
      activeLineIdx: 0,
      walkTimer: 0,
      hasStartedWalking: false
    }
  ]);

  // Patrol Bullies
  const [bullies, setBullies] = useState<Bully[]>([
    {
      id: 'b1',
      x: 320,
      y: 110,
      speed: 1.4,
      angle: 0,
      state: 'patrol',
      patrolPath: [{ x: 320, y: 110 }, { x: 520, y: 110 }, { x: 520, y: 290 }, { x: 320, y: 290 }],
      currentPathIdx: 0,
      searchTimer: 0,
      detectionRadius: 90
    },
    {
      id: 'b2',
      x: 620,
      y: 290,
      speed: 1.6,
      angle: Math.PI,
      state: 'patrol',
      patrolPath: [{ x: 620, y: 290 }, { x: 200, y: 290 }, { x: 200, y: 120 }, { x: 620, y: 120 }],
      currentPathIdx: 0,
      searchTimer: 0,
      detectionRadius: 90
    },
    {
      id: 'b3',
      x: 420,
      y: 200,
      speed: 1.2,
      angle: 0,
      state: 'patrol',
      patrolPath: [{ x: 420, y: 200 }, { x: 680, y: 200 }],
      currentPathIdx: 0,
      searchTimer: 0,
      detectionRadius: 90
    }
  ]);

  // Safe zones
  const teacherRoom = { x: 740, y: 60, w: 55, h: 100 };
  const counselorOffice = { x: 740, y: 240, w: 55, h: 100 };

  // Screen shake
  const [shakeOffset, setShakeOffset] = useState<Point>({ x: 0, y: 0 });

  // Monitor keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (e.key === ' ' || e.key.toLowerCase() === 'e') {
        toggleHiding();
      }
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

  const toggleHiding = () => {
    if (gameOver || showChoiceModal) return;
    const player = playerRef.current;
    let nearLocker = false;
    lockers.forEach(l => {
      const centerX = l.x + l.w / 2;
      const centerY = l.y + l.h / 2;
      if (Math.hypot(player.x - centerX, player.y - centerY) < 60) {
        nearLocker = true;
      }
    });

    if (nearLocker) {
      setIsHidden(prev => {
        const next = !prev;
        if (next) {
          setConfidence(c => Math.min(100, c + 10)); // Reward hiding successfully
          setFloatingBanner("Hiding gives you space to calm down.");
        }
        return next;
      });
    }
  };

  // Choice moment triggers at x = 360
  useEffect(() => {
    if (gameOver) return;
    if (playerRef.current.x >= 360 && !choiceTriggered) {
      setChoiceTriggered(true);
      setShowChoiceModal(true);
    }
  }, [playerRef.current.x, choiceTriggered, gameOver]);

  // Main Canvas Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tick = () => {
      if (gameOver || showChoiceModal) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const player = playerRef.current;

      // 1. Record history frames for debrief replay
      recordCounterRef.current++;
      if (recordCounterRef.current % 10 === 0) {
        historyRef.current.push({
          player: { x: player.x, y: player.y },
          bullies: bullies.map(b => ({ x: b.x, y: b.y }))
        });
      }

      // 2. Update player movement
      if (!isHidden) {
        let dx = 0;
        let dy = 0;
        const speed = 2.5;

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

        // Corridor boundary limits
        if (nextX > 20 && nextX < MAP_WIDTH - 20) player.x = nextX;
        if (nextY > 20 && nextY < MAP_HEIGHT - 20) player.y = nextY;

        // Locker collisions
        lockers.forEach(l => {
          if (
            player.x > l.x - 10 &&
            player.x < l.x + l.w + 10 &&
            player.y > l.y - 10 &&
            player.y < l.y + l.h + 10
          ) {
            player.x -= dx;
            player.y -= dy;
          }
        });
      }

      // 3. Check safe exit triggers
      if (
        player.x >= teacherRoom.x &&
        player.x <= teacherRoom.x + teacherRoom.w &&
        player.y >= teacherRoom.y &&
        player.y <= teacherRoom.y + teacherRoom.h
      ) {
        setReachedOffice('teacher');
        setIsWin(true);
        setGameOver(true);
        setConfidence(c => Math.min(100, c + 30));
        return;
      }

      if (
        player.x >= counselorOffice.x &&
        player.x <= counselorOffice.x + counselorOffice.w &&
        player.y >= counselorOffice.y &&
        player.y <= counselorOffice.y + counselorOffice.h
      ) {
        setReachedOffice('counselor');
        setIsWin(true);
        setGameOver(true);
        setConfidence(c => Math.min(100, c + 35));
        return;
      }

      // 4. Update protection zones and support buddy logic
      let nearFriends = false;
      setFriendGroups(prev => 
        prev.map(fg => {
          const dist = Math.hypot(player.x - fg.x, player.y - fg.y);
          if (dist < fg.r) {
            nearFriends = true;
            // increment line cycles
            let nextLineIdx = fg.activeLineIdx;
            if (Math.random() < 0.005) {
              nextLineIdx = (fg.activeLineIdx + 1) % fg.lines.length;
            }

            // walk timer triggers after 5 seconds near group
            const nextWalkTimer = fg.walkTimer + (1 / 60);
            let nextX = fg.x;
            let nextY = fg.y;
            let walking = fg.hasStartedWalking;

            if (nextWalkTimer >= 5) {
              walking = true;
            }

            if (walking) {
              // Walk toward exit zone
              const targetOffice = counselorOffice;
              const angleToOffice = Math.atan2(targetOffice.y + 50 - fg.y, targetOffice.x - fg.x);
              nextX += Math.cos(angleToOffice) * 1.0;
              nextY += Math.sin(angleToOffice) * 1.0;
              
              // Guide player with friends group
              player.x += Math.cos(angleToOffice) * 0.95;
              player.y += Math.sin(angleToOffice) * 0.95;
            }

            return {
              ...fg,
              activeLineIdx: nextLineIdx,
              walkTimer: nextWalkTimer,
              hasStartedWalking: walking,
              x: nextX,
              y: nextY
            };
          }
          return fg;
        })
      );

      // 5. Update patrol routes and bully AI
      let spotted = false;
      setBullies(prevBullies => 
        prevBullies.map(b => {
          let nextX = b.x;
          let nextY = b.y;
          let angle = b.angle;
          let state = b.state;
          let pathIdx = b.currentPathIdx;
          let searchTimer = b.searchTimer;

          // detection calculation
          const distToPlayer = Math.hypot(player.x - b.x, player.y - b.y);
          const isPlayerVis = !isHidden && !nearFriends && distToPlayer < b.detectionRadius;

          if (isPlayerVis) {
            spotted = true;
            state = 'chase';
          }

          if (state === 'chase') {
            angle = Math.atan2(player.y - b.y, player.x - b.x);
            // Move fast
            nextX += Math.cos(angle) * (b.speed * 1.5);
            nextY += Math.sin(angle) * (b.speed * 1.5);

            if (!isPlayerVis) {
              state = 'search';
              searchTimer = 120; // search for 2 seconds (120 frames)
            }
          } else if (state === 'search') {
            searchTimer--;
            angle += Math.sin(searchTimer * 0.08) * 0.08;
            if (searchTimer <= 0) {
              state = 'patrol';
            }
          } else {
            // PATROL
            const dest = b.patrolPath[pathIdx];
            angle = Math.atan2(dest.y - b.y, dest.x - b.x);
            nextX += Math.cos(angle) * b.speed;
            nextY += Math.sin(angle) * b.speed;

            if (Math.hypot(dest.x - b.x, dest.y - b.y) < 12) {
              pathIdx = (pathIdx + 1) % b.patrolPath.length;
            }
          }

          // Consequence of being caught (near bully) increases stress
          if (distToPlayer < 40 && !isHidden) {
            setStress(s => {
              const nextStress = Math.min(100, s + 0.6);
              if (nextStress >= 100) {
                setGameOver(true);
                setIsWin(false);
              }
              return nextStress;
            });
          }

          return {
            ...b,
            x: nextX,
            y: nextY,
            angle,
            state,
            currentPathIdx: pathIdx,
            searchTimer
          };
        })
      );

      // 6. Update Stress & Confidence
      setIsSpotted(spotted);
      setStress(s => {
        const diff = spotted ? 0.25 : nearFriends ? -0.08 : isHidden ? -0.1 : -0.02;
        return Math.min(100, Math.max(10, s + diff));
      });

      setConfidence(c => {
        const diff = nearFriends ? 0.05 : spotted ? -0.06 : 0.01;
        return Math.min(100, Math.max(10, c + diff));
      });

      // 7. Dynamic screen shake based on stress and spotted state
      if (!reducedMotion) {
        if (spotted || stress > 75) {
          const shakeVal = shakeIntensity === 'medium' ? 6 : shakeIntensity === 'low' ? 3 : 0;
          setShakeOffset({
            x: (Math.random() - 0.5) * shakeVal,
            y: (Math.random() - 0.5) * shakeVal
          });
        } else {
          setShakeOffset({ x: 0, y: 0 });
        }
      } else {
        setShakeOffset({ x: 0, y: 0 });
      }

      // 8. RENDER CANVAS
      // Corridor setup
      ctx.fillStyle = highContrast ? '#ffffff' : '#f1f5f9';
      ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

      ctx.strokeStyle = highContrast ? '#000000' : 'rgba(0,0,0,0.02)';
      ctx.lineWidth = 1;
      for (let i = 0; i < MAP_WIDTH; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, MAP_HEIGHT);
        ctx.stroke();
      }

      // Draw Door Safe Zones
      // Teacher room
      ctx.fillStyle = highContrast ? '#ffffff' : 'rgba(16, 185, 129, 0.15)';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.fillRect(teacherRoom.x, teacherRoom.y, teacherRoom.w, teacherRoom.h);
      ctx.strokeRect(teacherRoom.x, teacherRoom.y, teacherRoom.w, teacherRoom.h);

      // Counselor Room
      ctx.fillStyle = highContrast ? '#ffffff' : 'rgba(59, 130, 246, 0.15)';
      ctx.strokeStyle = '#3b82f6';
      ctx.fillRect(counselorOffice.x, counselorOffice.y, counselorOffice.w, counselorOffice.h);
      ctx.strokeRect(counselorOffice.x, counselorOffice.y, counselorOffice.w, counselorOffice.h);

      // Draw text tags for rooms
      ctx.fillStyle = highContrast ? '#000000' : '#475569';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('TEACHER\'S ROOM', teacherRoom.x - 40, teacherRoom.y - 8);
      ctx.fillText('COUNSELOR OFFICE', counselorOffice.x - 50, counselorOffice.y - 8);

      // Draw Hide spots (Purple glowing floor indicator)
      lockers.forEach(l => {
        ctx.fillStyle = highContrast ? '#ffff00' : 'rgba(168, 85, 247, 0.2)';
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.fillRect(l.x - 5, l.y - 5, l.w + 10, l.h + 10);
        ctx.strokeRect(l.x - 5, l.y - 5, l.w + 10, l.h + 10);

        // Draw physical lockers
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(l.x, l.y, l.w, l.h);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(l.x, l.y, l.w, l.h);
      });

      // Draw Ally groups
      friendGroups.forEach(fg => {
        ctx.fillStyle = highContrast ? '#ffffff' : 'rgba(16, 185, 129, 0.1)';
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(fg.x, fg.y, fg.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = '24px sans-serif';
        ctx.fillText(fg.emoji, fg.x - 12, fg.y + 8);

        // Render floating speech lines
        ctx.fillStyle = highContrast ? '#000000' : '#047857';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(fg.lines[fg.activeLineIdx], fg.x - 40, fg.y - 28);
      });

      // Draw Patrolling Bullies & detection zones
      bullies.forEach(b => {
        // Draw detection ring
        ctx.strokeStyle = highContrast ? '#000000' : 'rgba(239, 68, 68, 0.2)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.detectionRadius, 0, Math.PI * 2);
        ctx.stroke();

        if (b.state === 'chase') {
          // pulsing detection ring
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.detectionRadius + Math.sin(Date.now() * 0.01) * 8, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw body
        ctx.fillStyle = highContrast ? '#000000' : '#ea580c';
        ctx.beginPath();
        ctx.arc(b.x, b.y, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = '12px sans-serif';
        ctx.fillText('😈', b.x - 7, b.y + 4);

        if (b.state === 'search') {
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText('?', b.x - 5, b.y - 18);
        }
      });

      // Draw Player circular avatar with facial expression based on stress
      const faceEmoji = stress > 75 ? '😰' : stress > 45 ? '😐' : '🙂';
      
      ctx.fillStyle = highContrast ? '#000000' : isHidden ? 'rgba(59, 130, 246, 0.4)' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(player.x, player.y, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '14px sans-serif';
      ctx.fillText(faceEmoji, player.x - 7, player.y + 5);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isHidden, gameOver, showChoiceModal, bullies, friendGroups, shakeIntensity, highContrast, reducedMotion, stress]);

  // Choice moment selection options
  const selectChoice = (opt: 'A' | 'B' | 'C') => {
    setShowChoiceModal(false);
    
    if (opt === 'A') {
      setStress(s => Math.min(100, s + 5));
      setFloatingBanner("Walking away takes courage.");
      setConfidence(c => Math.min(100, c + 5));
    } else if (opt === 'B') {
      setStress(s => Math.min(100, s + 15));
      setFloatingBanner("Sometimes waiting it out works.");
      setConfidence(c => Math.min(100, c + 5));
    } else if (opt === 'C') {
      setStress(s => Math.min(100, s + 40));
      setFloatingBanner("Reacting can make things escalate. Let's try again.");
      setConfidence(c => Math.max(0, c - 15));

      // Spawn extra helper bullies
      setBullies(prev => [
        ...prev,
        {
          id: `b-extra-${Date.now()}`,
          x: playerRef.current.x - 120,
          y: playerRef.current.y + 80,
          speed: 1.5,
          angle: 0,
          state: 'chase',
          patrolPath: [],
          currentPathIdx: 0,
          searchTimer: 0,
          detectionRadius: 90
        },
        {
          id: `b-extra-2-${Date.now()}`,
          x: playerRef.current.x + 120,
          y: playerRef.current.y - 80,
          speed: 1.5,
          angle: Math.PI,
          state: 'chase',
          patrolPath: [],
          currentPathIdx: 0,
          searchTimer: 0,
          detectionRadius: 90
        }
      ]);
    }
  };

  // Re-draw history replay canvas inside debrief
  const drawReplayCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / MAP_WIDTH;
    const scaleY = canvas.height / MAP_HEIGHT;

    // Draw lockers outline
    ctx.fillStyle = '#e2e8f0';
    lockers.forEach(l => {
      ctx.fillRect(l.x * scaleX, l.y * scaleY, l.w * scaleX, l.h * scaleY);
    });

    // Draw counselor & teacher zones
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
    ctx.fillRect(teacherRoom.x * scaleX, teacherRoom.y * scaleY, teacherRoom.w * scaleX, teacherRoom.h * scaleY);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fillRect(counselorOffice.x * scaleX, counselorOffice.y * scaleY, counselorOffice.w * scaleX, counselorOffice.h * scaleY);

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

      // Draw bully paths (drawn as dots to avoid clutter)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
      path.forEach(frame => {
        frame.bullies.forEach(b => {
          ctx.beginPath();
          ctx.arc(b.x * scaleX, b.y * scaleY, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    }
  };

  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto flex flex-col items-center select-none",
      highContrast && "filter contrast-125 font-mono"
    )}>
      {/* Sensory Pulsing Hearts overlay (heartbeat visual) when stress is high */}
      {stress > 70 && (
        <div className="absolute inset-0 z-40 border-[8px] border-red-500/20 blur-md pointer-events-none animate-pulse" />
      )}

      {/* Top HUD: how I feel vs stars */}
      <div className="w-full bg-card/90 backdrop-blur-md border-[5px] border-foreground rounded-[2rem] p-5 shadow-pop mb-6 flex flex-row justify-between items-center gap-6">
        
        {/* Stress Meter (how I feel) */}
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
          <span className="text-2xl font-black text-foreground">{Math.round(confidence)} pts</span>
        </div>

        {/* Settings gear icon */}
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          className="rounded-full shadow-pop-sm"
        >
          <Settings className="w-4 h-4 mr-1.5" /> Settings
        </Button>
      </div>

      {/* Main Game Screen */}
      {!gameOver ? (
        <div className="w-full bg-card border-[6px] border-foreground rounded-[2.5rem] p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col gap-4">
          
          {/* Floating dynamic banners */}
          {floatingBanner && (
            <div className="bg-sky-50 dark:bg-sky-950/20 border-2 border-sky-300 text-sky-700 dark:text-sky-300 rounded-xl px-4 py-2 text-center text-xs font-bold animate-fade-up">
              {floatingBanner}
            </div>
          )}

          {/* HTML5 Canvas */}
          <div className="flex justify-center bg-slate-900 rounded-2xl border-4 border-foreground relative overflow-hidden">
            <canvas
              ref={canvasRef}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              className="w-full h-auto max-w-full block"
              style={{
                transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
                transition: 'transform 0.05s ease-out'
              }}
            />
          </div>

          {/* Control D-pad buttons */}
          <div className="flex justify-between items-center gap-4">
            <Button
              onClick={toggleHiding}
              className="rounded-full border-2 border-foreground shadow-pop-sm font-black py-4 px-6 hover:-translate-y-0.5"
            >
              {isHidden ? "🚪 Step Out" : "🗄️ Hide in Locker (SPACE)"}
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-semibold">Move avatar:</span>
              <kbd className="px-2 py-1 bg-muted border border-foreground/20 rounded text-xs font-bold font-mono">WASD</kbd>
              <kbd className="px-2 py-1 bg-muted border border-foreground/20 rounded text-xs font-bold font-mono">Arrows</kbd>
            </div>
          </div>
        </div>
      ) : (
        /* Debrief Screen (The Core Learning Moment) */
        <div className="w-full bg-card border-[6px] border-foreground rounded-[2.5rem] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-fade-up max-w-2xl flex flex-col gap-6">
          <div className="flex items-center justify-between border-b-4 border-foreground pb-4">
            <h2 className="text-2xl font-black text-foreground">
              {isWin ? "Quest Debrief" : "Too Overwhelmed"}
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

          {/* Three illustrated momentos */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black text-muted-foreground uppercase">Lesson Moments</span>
            
            <div className="bg-background border-2 border-foreground rounded-2xl p-4 flex gap-3 items-start">
              <span className="text-2xl">😈</span>
              <p className="text-xs font-bold text-foreground/80 leading-relaxed">
                "When the bully got close, your stress went up. That's normal."
              </p>
            </div>

            <div className="bg-background border-2 border-foreground rounded-2xl p-4 flex gap-3 items-start">
              <span className="text-2xl">🗄️</span>
              <p className="text-xs font-bold text-foreground/80 leading-relaxed">
                "Hiding behind the locker gave you space to calm down."
              </p>
            </div>

            <div className="bg-background border-2 border-foreground rounded-2xl p-4 flex gap-3 items-start">
              <span className="text-2xl">🚪</span>
              <p className="text-xs font-bold text-foreground/80 leading-relaxed">
                {reachedOffice === 'counselor' 
                  ? "Reaching the counselor's office was a safe way to ask for help."
                  : "Reaching the teacher's room was the safe choice."}
              </p>
            </div>
          </div>

          {/* Question / reflection panel */}
          <div className="bg-primary/5 border-4 border-foreground rounded-2xl p-5 flex flex-col gap-3">
            <span className="text-xs font-black text-muted-foreground uppercase">What would you do next time?</span>
            {!reflectionAnswered ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={() => setReflectionAnswered(true)}
                  className="flex-1 rounded-xl border-2 border-foreground font-black py-4 shadow-pop-sm text-xs"
                >
                  Stay near friends and look for lockers to hide.
                </Button>
                <Button 
                  onClick={() => setReflectionAnswered(true)}
                  className="flex-1 rounded-xl border-2 border-foreground font-black py-4 shadow-pop-sm text-xs"
                >
                  Walk directly to the teacher or counselor.
                </Button>
              </div>
            ) : (
              <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5" /> Reflecting helps you prepare for real-world situations!
              </div>
            )}
          </div>

          {/* Progression actions */}
          <div className="flex gap-4 border-t-4 border-foreground pt-4 mt-2">
            <Button
              onClick={() => {
                // reset states
                setStress(20);
                setConfidence(30);
                setIsHidden(false);
                setIsSpotted(false);
                setGameOver(false);
                setIsWin(false);
                setChoiceTriggered(false);
                setReflectionAnswered(false);
                historyRef.current = [];
                playerRef.current = { x: 50, y: 200 };
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

      {/* Mid Level Choice Pause Modal */}
      {showChoiceModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border-[6px] border-foreground rounded-[2.5rem] p-6 max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-fade-up text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-4xl">😈</span>
              <h3 className="text-lg font-black text-foreground">A Bully is Approaching</h3>
            </div>
            
            <p className="text-xs font-bold text-muted-foreground mb-6 leading-relaxed">
              The bully is walking directly toward you in the open corridor. What do you do?
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => selectChoice('A')}
                className="w-full text-left bg-background hover:bg-muted border-2 border-foreground rounded-2xl p-4 font-black text-xs text-foreground shadow-pop-sm"
              >
                Option A: "Walk away calmly toward the lockers"
              </Button>
              
              <Button
                onClick={() => selectChoice('B')}
                className="w-full text-left bg-background hover:bg-muted border-2 border-foreground rounded-2xl p-4 font-black text-xs text-foreground shadow-pop-sm"
              >
                Option B: "Stand still and ignore them"
              </Button>

              <Button
                onClick={() => selectChoice('C')}
                variant="destructive"
                className="w-full text-left border-2 border-foreground rounded-2xl p-4 font-black text-xs shadow-pop-sm"
              >
                Option C: "Shout back at them"
              </Button>
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
              {/* Screen Shake Control */}
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

              {/* High Contrast Toggle */}
              <div className="flex justify-between items-center bg-muted/40 p-3 rounded-2xl border-2 border-foreground">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-foreground">High Contrast Mode</span>
                  <span className="text-[10px] text-muted-foreground">Increases contrast and black outlines</span>
                </div>
                <input 
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="w-5 h-5 accent-primary border-2 border-foreground cursor-pointer"
                />
              </div>

              {/* Reduced Motion Toggle */}
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
