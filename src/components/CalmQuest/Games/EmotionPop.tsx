import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Trophy, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const ROWS = 8;
const COLS = 8;
const EMOTIONS = ['😊', '😢', '😡', '😨', '😮'];
const CELL_SIZE = 64; // pixels on desktop, styled responsively in CSS

interface Tile {
  id: string;
  emotion: string;
  row: number;
  col: number;
  isMatched: boolean;
  isNew: boolean;
  spawnDelay?: number; // delay for falling stagger
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  emoji: string;
  size: number;
  alpha: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface EmotionPopProps {
  onComplete?: (score: number) => void;
}

const EMOTION_THEMES: { [key: string]: { border: string, bg: string, glow: string, color: string } } = {
  '😊': { border: 'border-yellow-400', bg: 'bg-yellow-500/10 dark:bg-yellow-500/20', glow: 'shadow-yellow-400/50', color: '#fbbf24' },
  '😢': { border: 'border-blue-400', bg: 'bg-blue-500/10 dark:bg-blue-500/20', glow: 'shadow-blue-400/50', color: '#60a5fa' },
  '😡': { border: 'border-red-400', bg: 'bg-red-500/10 dark:bg-red-500/20', glow: 'shadow-red-400/50', color: '#f87171' },
  '😨': { border: 'border-purple-400', bg: 'bg-purple-500/10 dark:bg-purple-500/20', glow: 'shadow-purple-400/50', color: '#c084fc' },
  '😮': { border: 'border-amber-400', bg: 'bg-amber-500/10 dark:bg-amber-500/20', glow: 'shadow-amber-400/50', color: '#fb923c' },
};

export const EmotionPop = ({ onComplete }: EmotionPopProps) => {
  const [board, setBoard] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [autoReturn, setAutoReturn] = useState<number | null>(null);
  const [celebration, setCelebration] = useState<{ emotion: string, id: number } | null>(null);
  
  // Custom Visual Effects States
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const [activeDrag, setActiveDrag] = useState<{
    tileId: string;
    startRow: number;
    startCol: number;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  // Initialize board with no immediate matches
  const initBoard = useCallback(() => {
    const initialBoard: Tile[] = [];
    let idCounter = 0;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let emotion;
        do {
          emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
        } while (
          (r >= 2 && initialBoard[(r - 1) * COLS + c].emotion === emotion && initialBoard[(r - 2) * COLS + c].emotion === emotion) ||
          (c >= 2 && initialBoard[r * COLS + (c - 1)].emotion === emotion && initialBoard[r * COLS + (c - 2)].emotion === emotion)
        );

        initialBoard.push({
          id: `tile-${idCounter++}`,
          emotion,
          row: r,
          col: c,
          isMatched: false,
          isNew: false
        });
      }
    }
    setBoard(initialBoard);
    setScore(0);
    setCombo(0);
    setTimeLeft(60);
    setGameOver(false);
    setAutoReturn(null);
  }, []);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Timer loop
  useEffect(() => {
    if (timeLeft > 0 && !gameOver && board.length > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      setGameOver(true);
      setAutoReturn(5);
    }
  }, [timeLeft, gameOver, board]);

  // Auto Return Countdown loop
  useEffect(() => {
    if (autoReturn === null) return;
    if (autoReturn <= 0) {
      if (onComplete) onComplete(score);
      return;
    }
    const timer = setTimeout(() => setAutoReturn(autoReturn - 1), 1000);
    return () => clearTimeout(timer);
  }, [autoReturn, score, onComplete]);

  // Particle updates (physics loop)
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15, // gravity
            alpha: p.alpha - 0.03,
            size: Math.max(0, p.size - 0.2)
          }))
          .filter(p => p.alpha > 0 && p.size > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, [particles]);

  // Spawn matching sparkles
  const spawnSparkles = (col: number, row: number, emotion: string) => {
    const theme = EMOTION_THEMES[emotion] || { color: '#ffffff' };
    const count = 8;
    const newParticles: Particle[] = [];

    // Calculate pixel center of the cell
    const cellCenterX = col * CELL_SIZE + CELL_SIZE / 2;
    const cellCenterY = row * CELL_SIZE + CELL_SIZE / 2;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 4;
      newParticles.push({
        id: Date.now() + Math.random(),
        x: cellCenterX,
        y: cellCenterY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // shoot slightly upwards
        color: theme.color,
        emoji: Math.random() > 0.6 ? emotion : '✨',
        size: 12 + Math.random() * 12,
        alpha: 1
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  };

  // Spawn floating score indicators
  const spawnFloatingText = (col: number, row: number, text: string, color: string) => {
    const x = col * CELL_SIZE + CELL_SIZE / 2;
    const y = row * CELL_SIZE + CELL_SIZE / 2 - 10;
    const newText: FloatingText = {
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      color
    };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 1000);
  };

  // Shake screen helper
  const triggerScreenShake = () => {
    setIsScreenShaking(true);
    setTimeout(() => setIsScreenShaking(false), 500);
  };

  // Match check helper
  const checkMatches = useCallback((currentBoard: Tile[]) => {
    let hasMatches = false;
    const newBoard = currentBoard.map(tile => ({ ...tile, isMatched: false }));

    // Horizontal matches of 3 or more
    for (let r = 0; r < ROWS; r++) {
      let matchRun = 1;
      let matchEmotion = '';
      let matchStartIndex = 0;

      for (let c = 0; c < COLS; c++) {
        const tile = newBoard.find(t => t.row === r && t.col === c);
        if (tile && tile.emotion === matchEmotion && matchEmotion !== '') {
          matchRun++;
        } else {
          if (matchRun >= 3) {
            for (let i = matchStartIndex; i < c; i++) {
              const t = newBoard.find(t => t.row === r && t.col === i);
              if (t) t.isMatched = true;
            }
            hasMatches = true;
          }
          matchEmotion = tile ? tile.emotion : '';
          matchRun = 1;
          matchStartIndex = c;
        }
      }
      if (matchRun >= 3) {
        for (let i = matchStartIndex; i < COLS; i++) {
          const t = newBoard.find(t => t.row === r && t.col === i);
          if (t) t.isMatched = true;
        }
        hasMatches = true;
      }
    }

    // Vertical matches of 3 or more
    for (let c = 0; c < COLS; c++) {
      let matchRun = 1;
      let matchEmotion = '';
      let matchStartIndex = 0;

      for (let r = 0; r < ROWS; r++) {
        const tile = newBoard.find(t => t.row === r && t.col === c);
        if (tile && tile.emotion === matchEmotion && matchEmotion !== '') {
          matchRun++;
        } else {
          if (matchRun >= 3) {
            for (let i = matchStartIndex; i < r; i++) {
              const t = newBoard.find(t => t.row === i && t.col === c);
              if (t) t.isMatched = true;
            }
            hasMatches = true;
          }
          matchEmotion = tile ? tile.emotion : '';
          matchRun = 1;
          matchStartIndex = r;
        }
      }
      if (matchRun >= 3) {
        for (let i = matchStartIndex; i < ROWS; i++) {
          const t = newBoard.find(t => t.row === i && t.col === c);
          if (t) t.isMatched = true;
        }
        hasMatches = true;
      }
    }

    return { hasMatches, newBoard };
  }, []);

  // Handle score matching gravity and spawning
  useEffect(() => {
    if (board.length === 0 || isProcessing || gameOver) return;

    const { hasMatches, newBoard } = checkMatches(board);

    if (hasMatches) {
      setIsProcessing(true);
      setBoard(newBoard);

      // Trigger sparkles and floating scores for matched tiles
      const matchedTiles = newBoard.filter(t => t.isMatched);
      
      // Select one tile to trigger big celebration
      if (matchedTiles.length > 0) {
        const randomMatched = matchedTiles[Math.floor(Math.random() * matchedTiles.length)];
        setCelebration({ emotion: randomMatched.emotion, id: Date.now() });
      }

      // Calculate score and add effects
      const matchedCount = matchedTiles.length;
      const pointsPerTile = 15;
      const pointsEarned = matchedCount * pointsPerTile * (combo + 1);
      setScore(s => s + pointsEarned);

      // Spawn effects
      matchedTiles.forEach((tile) => {
        spawnSparkles(tile.col, tile.row, tile.emotion);
      });

      // Spawn a float score at center of matches
      const avgCol = matchedTiles.reduce((acc, t) => acc + t.col, 0) / matchedCount;
      const avgRow = matchedTiles.reduce((acc, t) => acc + t.row, 0) / matchedCount;
      const themeColor = EMOTION_THEMES[matchedTiles[0]?.emotion]?.color || '#ffffff';
      spawnFloatingText(
        avgCol, 
        avgRow, 
        `+${pointsEarned} ${combo > 0 ? `(${combo + 1}x Combo!)` : ''}`, 
        themeColor
      );

      setCombo(c => c + 1);

      // Wait for pop animation before executing gravity
      setTimeout(() => {
        let updatedBoard = [...newBoard].filter(t => !t.isMatched);
        
        // Gravity shifts tiles down
        for (let c = 0; c < COLS; c++) {
          let emptySpaces = 0;
          for (let r = ROWS - 1; r >= 0; r--) {
            const tile = updatedBoard.find(t => t.row === r && t.col === c);
            if (!tile) {
              emptySpaces++;
            } else if (emptySpaces > 0) {
              tile.row += emptySpaces;
              tile.isNew = false; // falling animation
            }
          }

          // Spawn new tiles at the top with a stagger delay
          for (let i = 0; i < emptySpaces; i++) {
            updatedBoard.push({
              id: `new-${Date.now()}-${c}-${i}`,
              emotion: EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)],
              row: i,
              col: c,
              isMatched: false,
              isNew: true,
              spawnDelay: (emptySpaces - i) * 80 // Stagger fall animation
            });
          }
        }

        setBoard(updatedBoard);
        
        // Let them land, then check for chain matches
        setTimeout(() => {
          setIsProcessing(false);
        }, 400);

      }, 400); // matching duration
    } else {
      setCombo(0);
    }
  }, [board, isProcessing, checkMatches, combo, gameOver]);

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent, tile: Tile) => {
    if (isProcessing || gameOver || activeDrag) return;
    
    // Capture pointer to track dragging out of bounds
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    setActiveDrag({
      tileId: tile.id,
      startRow: tile.row,
      startCol: tile.col,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDrag || isProcessing) return;

    setActiveDrag(prev => {
      if (!prev) return null;
      return {
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY,
      };
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!activeDrag || isProcessing) return;

    // Release pointer capture
    const target = e.currentTarget as HTMLElement;
    try {
      target.releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }

    const { tileId, startRow, startCol, startX, startY, currentX, currentY } = activeDrag;
    setActiveDrag(null);

    const dx = currentX - startX;
    const dy = currentY - startY;
    const threshold = 25; // drag distance threshold to initiate swap

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return; // simple click

    // Determine swipe direction
    let targetRow = startRow;
    let targetCol = startCol;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      targetCol = dx > 0 ? Math.min(COLS - 1, startCol + 1) : Math.max(0, startCol - 1);
    } else {
      // Vertical swipe
      targetRow = dy > 0 ? Math.min(ROWS - 1, startRow + 1) : Math.max(0, startRow - 1);
    }

    if (targetRow === startRow && targetCol === startCol) return;

    // Swap execution
    setIsProcessing(true);
    const newBoard = [...board];
    const tile1 = newBoard.find(t => t.row === startRow && t.col === startCol);
    const tile2 = newBoard.find(t => t.row === targetRow && t.col === targetCol);

    if (tile1 && tile2) {
      // Swap row/cols
      tile1.row = targetRow;
      tile1.col = targetCol;
      tile2.row = startRow;
      tile2.col = startCol;

      setBoard(newBoard);

      // Validate match
      setTimeout(() => {
        const { hasMatches } = checkMatches(newBoard);
        if (!hasMatches) {
          // Swap back since no match was created
          tile1.row = startRow;
          tile1.col = startCol;
          tile2.row = targetRow;
          tile2.col = targetCol;
          setBoard([...newBoard]);
          setTimeout(() => setIsProcessing(false), 300);
        } else {
          setIsProcessing(false); // Let useEffect process matches
        }
      }, 300); // match check delay matching transition time
    } else {
      setIsProcessing(false);
    }
  };

  // Power Up: Calm Bomb
  const useCalmBomb = () => {
    if (isProcessing || gameOver || score < 150) return;
    
    setScore(s => s - 150);
    setIsProcessing(true);
    triggerScreenShake();

    // Destroy all '😡' (anger) and spawn extra sparkles
    const newBoard = board.map(t => {
      const shouldMatch = t.emotion === '😡';
      if (shouldMatch) {
        spawnSparkles(t.col, t.row, '😡');
        spawnSparkles(t.col, t.row, '✨');
      }
      return {
        ...t,
        isMatched: shouldMatch || t.isMatched
      };
    });

    setBoard(newBoard);
    setTimeout(() => setIsProcessing(false), 300);
  };

  // Drag visual coordinates calculation
  const getDragTranslation = (tile: Tile) => {
    if (!activeDrag || activeDrag.tileId !== tile.id) return { x: 0, y: 0, isActive: false };

    const dx = activeDrag.currentX - activeDrag.startX;
    const dy = activeDrag.currentY - activeDrag.startY;

    // Constrain to primary axis and limit to one cell size max
    if (Math.abs(dx) > Math.abs(dy)) {
      const sign = Math.sign(dx);
      // limit between 0 and 1 cell size
      const maxDrag = CELL_SIZE;
      const xOffset = sign * Math.min(maxDrag, Math.abs(dx));
      return { x: xOffset, y: 0, isActive: true, dir: 'x', sign };
    } else {
      const sign = Math.sign(dy);
      const maxDrag = CELL_SIZE;
      const yOffset = sign * Math.min(maxDrag, Math.abs(dy));
      return { x: 0, y: yOffset, isActive: true, dir: 'y', sign };
    }
  };

  // Swap target visual slide calculation
  const getSwapSlideTranslation = (tile: Tile) => {
    if (!activeDrag) return { x: 0, y: 0 };
    
    // Find active dragged tile
    const dragTile = board.find(t => t.id === activeDrag.tileId);
    if (!dragTile) return { x: 0, y: 0 };

    const dx = activeDrag.currentX - activeDrag.startX;
    const dy = activeDrag.currentY - activeDrag.startY;
    const threshold = 10;
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return { x: 0, y: 0 };

    let targetCol = dragTile.col;
    let targetRow = dragTile.row;

    if (Math.abs(dx) > Math.abs(dy)) {
      targetCol = dx > 0 ? Math.min(COLS - 1, dragTile.col + 1) : Math.max(0, dragTile.col - 1);
    } else {
      targetRow = dy > 0 ? Math.min(ROWS - 1, dragTile.row + 1) : Math.max(0, dragTile.row - 1);
    }

    // If this tile is the target of the swap, translate it in the opposite direction
    if (tile.col === targetCol && tile.row === targetRow && (targetCol !== dragTile.col || targetRow !== dragTile.row)) {
      const dragTrans = getDragTranslation(dragTile);
      return {
        x: -dragTrans.x,
        y: -dragTrans.y
      };
    }

    return { x: 0, y: 0 };
  };

  return (
    <div className={cn(
      "w-full max-w-4xl mx-auto flex flex-col items-center bg-card/90 backdrop-blur-md border-[6px] border-foreground rounded-[2.5rem] p-6 lg:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all duration-300",
      isScreenShaking && "animate-shake"
    )}>
      
      {/* Custom Styles Injection */}
      <style>{`
        @keyframes float-up-fade {
          0% { transform: translateY(0) scale(0.8); opacity: 1; }
          100% { transform: translateY(-40px) scale(1.1); opacity: 0; }
        }
        .animate-float-up-fade {
          animation: float-up-fade 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes bounce-land {
          0% { transform: scaleY(1); }
          40% { transform: scaleY(0.8) scaleX(1.15); }
          70% { transform: scaleY(1.08) scaleX(0.95); }
          100% { transform: scaleY(1) scaleX(1); }
        }
        .animate-bounce-land {
          animation: bounce-land 0.4s ease-out forwards;
        }
        .tile-gradient-😊 { background: radial-gradient(circle, rgba(251,191,36,0.3) 0%, rgba(0,0,0,0) 70%); }
        .tile-gradient-😢 { background: radial-gradient(circle, rgba(96,165,250,0.3) 0%, rgba(0,0,0,0) 70%); }
        .tile-gradient-😡 { background: radial-gradient(circle, rgba(248,113,113,0.3) 0%, rgba(0,0,0,0) 70%); }
        .tile-gradient-😨 { background: radial-gradient(circle, rgba(192,132,252,0.3) 0%, rgba(0,0,0,0) 70%); }
        .tile-gradient-😮 { background: radial-gradient(circle, rgba(251,146,60,0.3) 0%, rgba(0,0,0,0) 70%); }
      `}</style>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/15 z-0 pointer-events-none" />

      {/* Header HUD */}
      <div className="w-full flex justify-between items-center z-10 mb-8 px-4 py-4 bg-background/50 border-4 border-foreground rounded-2xl shadow-pop-sm">
        <div className="flex flex-col">
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Score</span>
          <span className="text-4xl font-black text-foreground tabular-nums drop-shadow-sm">{score}</span>
        </div>
        
        <div className="flex flex-col items-center">
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Time Remaining</span>
          <span className={cn(
            "text-4xl font-black tabular-nums transition-all duration-300 font-mono",
            timeLeft <= 15 ? "text-destructive scale-110 animate-pulse" : "text-foreground"
          )}>
            0:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Combo multiplier</span>
          <span className={cn(
            "text-3xl font-black tabular-nums transition-all duration-300",
            combo > 1 ? "text-primary scale-125 animate-bounce" : "text-foreground opacity-60"
          )}>
            x{combo}
          </span>
        </div>
      </div>

      {/* Game Board Container */}
      <div 
        ref={boardRef}
        className="relative z-10 bg-black/5 dark:bg-black/40 p-4 rounded-[2.5rem] border-[6px] border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden touch-none" 
        style={{ 
          width: 'min(100%, 550px)',
          aspectRatio: '1/1'
        }}
      >
        {/* Responsive Grid Wrapper */}
        <div className="relative w-full h-full grid grid-cols-8 grid-rows-8 gap-1 md:gap-2">
          {/* Static Background Slots for depth grid effect */}
          {Array.from({ length: 64 }).map((_, idx) => (
            <div key={idx} className="w-full h-full bg-foreground/5 dark:bg-white/5 rounded-xl border border-foreground/5 shadow-inner" />
          ))}

          {/* Dynamic Tiles */}
          {board.map((tile) => {
            const dragTrans = getDragTranslation(tile);
            const swapTrans = getSwapSlideTranslation(tile);
            const isDragging = dragTrans.isActive;
            const theme = EMOTION_THEMES[tile.emotion];

            // Render positions in percentage based on grid size
            const pctLeft = (tile.col / COLS) * 100;
            const pctTop = (tile.row / ROWS) * 100;

            const xOffset = isDragging ? dragTrans.x : swapTrans.x;
            const yOffset = isDragging ? dragTrans.y : swapTrans.y;

            return (
              <div
                key={tile.id}
                onPointerDown={(e) => handlePointerDown(e, tile)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={cn(
                  "absolute select-none cursor-grab active:cursor-grabbing transition-transform duration-300 ease-out",
                  tile.isMatched ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100",
                  tile.isNew && "animate-bounce-land",
                  isDragging ? "z-40 pointer-events-none duration-0 scale-110" : "z-10"
                )}
                style={{
                  width: `${100 / COLS}%`,
                  height: `${100 / ROWS}%`,
                  left: `${pctLeft}%`,
                  top: `${pctTop}%`,
                  transform: `translate(${xOffset}px, ${yOffset}px)`,
                  transitionDelay: tile.spawnDelay ? `${tile.spawnDelay}ms` : '0ms'
                }}
              >
                {/* Visual Glassmorphic Tile Card */}
                <div className={cn(
                  "w-[90%] h-[90%] mx-auto my-auto bg-card/65 backdrop-blur-md rounded-xl md:rounded-2xl border-[3px] border-foreground flex items-center justify-center shadow-pop-sm hover:shadow-pop-md transition-all duration-300 relative overflow-hidden group",
                  theme.border
                )}>
                  {/* Subtle Inner color radial glow */}
                  <div className={cn("absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 opacity-70 group-hover:opacity-100", `tile-gradient-${tile.emotion}`)} />
                  
                  {/* Glowing shadow behind emoji */}
                  <span className={cn(
                    "text-3xl md:text-4xl pointer-events-none z-10 transform transition-transform duration-300 scale-100 group-hover:scale-125 filter drop-shadow-md",
                    isDragging && "scale-125 rotate-6"
                  )}>
                    {tile.emotion}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Sparkles Particle Layer */}
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none z-50 flex items-center justify-center font-bold"
              style={{
                left: `${(p.x / (COLS * CELL_SIZE)) * 100}%`,
                top: `${(p.y / (ROWS * CELL_SIZE)) * 100}%`,
                fontSize: `${p.size}px`,
                color: p.color,
                opacity: p.alpha,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {p.emoji}
            </div>
          ))}

          {/* Floating Scores Overlay */}
          {floatingTexts.map((ft) => (
            <div
              key={ft.id}
              className="absolute pointer-events-none z-50 font-black text-sm md:text-lg animate-float-up-fade select-none whitespace-nowrap"
              style={{
                left: `${(ft.x / (COLS * CELL_SIZE)) * 100}%`,
                top: `${(ft.y / (ROWS * CELL_SIZE)) * 100}%`,
                color: ft.color,
                textShadow: '0 2px 8px rgba(0,0,0,0.5), -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000',
                transform: 'translate(-50%, -50%)'
              }}
            >
              {ft.text}
            </div>
          ))}
        </div>

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-up p-6 text-center">
            <Trophy className="w-20 h-20 text-yellow-500 mb-4 animate-bounce" />
            <h2 className="text-4xl font-black text-foreground mb-2">Spectacular Job!</h2>
            <p className="text-lg font-bold text-muted-foreground mb-6">You popped your way to a score of {score}</p>
            {onComplete && (
              <div className="flex flex-col items-center gap-3">
                <Button onClick={() => onComplete(score)} size="lg" className="rounded-full font-black text-xl py-6 px-10 shadow-pop hover:-translate-y-1 transition-transform">
                  Continue Journey <Sparkles className="w-5 h-5 ml-2" />
                </Button>
                {autoReturn !== null && (
                  <span className="text-sm text-muted-foreground font-black animate-pulse">
                    Returning to map in {autoReturn}s...
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Actions / Power-ups */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center mt-8 gap-4 z-10 px-4">
        <Button 
          variant="outline" 
          onClick={initBoard}
          className="rounded-full border-2 border-foreground shadow-pop font-black px-6 py-5 hover:-translate-y-0.5 hover:bg-muted"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Restart Game
        </Button>

        <Button 
          variant="outline" 
          onClick={useCalmBomb} 
          disabled={isProcessing || score < 150 || gameOver}
          className={cn(
            "rounded-full border-2 border-foreground shadow-pop font-black px-8 py-5 transition-all duration-300 group",
            score >= 150 ? "hover:-translate-y-1 hover:shadow-pop-lg hover:bg-destructive hover:text-destructive-foreground" : "opacity-40 cursor-not-allowed"
          )}
        >
          <Zap className="w-5 h-5 mr-2 group-hover:animate-wiggle text-red-500 group-hover:text-white" /> 
          Calm Bomb (Cost: 150)
        </Button>
      </div>

      {/* Instructions */}
      <p className="mt-8 text-muted-foreground text-xs md:text-sm font-semibold text-center w-full max-w-lg bg-card border-[3px] border-foreground/10 rounded-full py-2.5 px-6 shadow-sm">
        Swipe adjacent cards to make columns/rows of 3 or more of the same emoji. Popping Anger 😡 costs less with a Calm Bomb!
      </p>

      {/* Celebration Big Screen Emoji Pop Overlay */}
      {celebration && (
        <div key={celebration.id} className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center overflow-hidden">
          <div className="text-[14rem] animate-slide-bounce-across opacity-70 drop-shadow-[0_20px_40px_rgba(0,0,0,0.35)]">
            {celebration.emotion}
          </div>
        </div>
      )}

    </div>
  );
};
