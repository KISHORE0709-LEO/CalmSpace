import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Trophy, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const ROWS = 8;
const COLS = 8;
const EMOTIONS = ['😊', '😢', '😡', '😨', '😮'];

interface Tile {
  id: string;
  emotion: string;
  row: number;
  col: number;
  isMatched: boolean;
  isNew: boolean;
  spawnDelay?: number;
}

interface FloatingText {
  id: number;
  col: number;
  row: number;
  text: string;
  color: string;
}

interface EmotionPopProps {
  onComplete?: (score: number) => void;
}

const EMOTION_THEMES: Record<string, { border: string; color: string }> = {
  '😊': { border: 'border-yellow-400', color: '#fbbf24' },
  '😢': { border: 'border-blue-400',   color: '#60a5fa' },
  '😡': { border: 'border-red-400',    color: '#f87171' },
  '😨': { border: 'border-purple-400', color: '#c084fc' },
  '😮': { border: 'border-amber-400',  color: '#fb923c' },
};

// Build a row×col lookup map for O(1) access
function buildGrid(tiles: Tile[]): Map<string, Tile> {
  const map = new Map<string, Tile>();
  for (const t of tiles) map.set(`${t.row},${t.col}`, t);
  return map;
}

function checkMatches(tiles: Tile[]): { hasMatches: boolean; newBoard: Tile[] } {
  const grid = buildGrid(tiles);
  const matched = new Set<string>();

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    let run = 1;
    for (let c = 1; c <= COLS; c++) {
      const prev = grid.get(`${r},${c - 1}`);
      const curr = grid.get(`${r},${c}`);
      if (curr && prev && curr.emotion === prev.emotion) {
        run++;
      } else {
        if (run >= 3) for (let k = c - run; k < c; k++) matched.add(`${r},${k}`);
        run = 1;
      }
    }
  }

  // Vertical
  for (let c = 0; c < COLS; c++) {
    let run = 1;
    for (let r = 1; r <= ROWS; r++) {
      const prev = grid.get(`${r - 1},${c}`);
      const curr = grid.get(`${r},${c}`);
      if (curr && prev && curr.emotion === prev.emotion) {
        run++;
      } else {
        if (run >= 3) for (let k = r - run; k < r; k++) matched.add(`${k},${c}`);
        run = 1;
      }
    }
  }

  if (matched.size === 0) return { hasMatches: false, newBoard: tiles };

  const newBoard = tiles.map(t =>
    matched.has(`${t.row},${t.col}`) ? { ...t, isMatched: true } : t
  );
  return { hasMatches: true, newBoard };
}

function makeBoard(): Tile[] {
  const board: Tile[] = [];
  let id = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let emotion: string;
      do {
        emotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      } while (
        (r >= 2 && board[(r - 1) * COLS + c]?.emotion === emotion && board[(r - 2) * COLS + c]?.emotion === emotion) ||
        (c >= 2 && board[r * COLS + c - 1]?.emotion === emotion && board[r * COLS + c - 2]?.emotion === emotion)
      );
      board.push({ id: `t${id++}`, emotion, row: r, col: c, isMatched: false, isNew: false });
    }
  }
  return board;
}

export const EmotionPop = ({ onComplete }: EmotionPopProps) => {
  const [board, setBoard] = useState<Tile[]>(makeBoard);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [autoReturn, setAutoReturn] = useState<number | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [activeDrag, setActiveDrag] = useState<{
    tileId: string; startRow: number; startCol: number;
    startX: number; startY: number; currentX: number; currentY: number;
  } | null>(null);

  // Stable refs to avoid stale closures in timeouts
  const comboRef = useRef(combo);
  comboRef.current = combo;

  // Timer
  useEffect(() => {
    if (gameOver || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (timeLeft === 0 && !gameOver) {
      setGameOver(true);
      setAutoReturn(5);
    }
  }, [timeLeft, gameOver]);

  // Auto-return
  useEffect(() => {
    if (autoReturn === null) return;
    if (autoReturn <= 0) { onComplete?.(score); return; }
    const t = setTimeout(() => setAutoReturn(p => p! - 1), 1000);
    return () => clearTimeout(t);
  }, [autoReturn, score, onComplete]);

  // Match processing
  useEffect(() => {
    if (!board.length || isProcessing || gameOver) return;
    const { hasMatches, newBoard } = checkMatches(board);
    if (!hasMatches) { setCombo(0); return; }

    setIsProcessing(true);
    setBoard(newBoard);

    const matchedTiles = newBoard.filter(t => t.isMatched);
    const matchedCount = matchedTiles.length;
    const currentCombo = comboRef.current;
    const pointsEarned = matchedCount * 15 * (currentCombo + 1);
    setScore(s => s + pointsEarned);
    setCombo(c => c + 1);

    // Single floating text at centroid
    const avgCol = matchedTiles.reduce((a, t) => a + t.col, 0) / matchedCount;
    const avgRow = matchedTiles.reduce((a, t) => a + t.row, 0) / matchedCount;
    const color = EMOTION_THEMES[matchedTiles[0]?.emotion]?.color ?? '#fff';
    const ftId = Date.now();
    setFloatingTexts(prev => [...prev, {
      id: ftId, col: avgCol, row: avgRow,
      text: `+${pointsEarned}${currentCombo > 0 ? ` x${currentCombo + 1}` : ''}`,
      color
    }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(f => f.id !== ftId)), 900);

    // Gravity + refill
    setTimeout(() => {
      setBoard(prev => {
        const surviving = prev.filter(t => !t.isMatched);
        // Build column arrays
        const cols: Tile[][] = Array.from({ length: COLS }, () => []);
        for (const t of surviving) cols[t.col].push(t);

        const next: Tile[] = [];
        let newId = Date.now();
        for (let c = 0; c < COLS; c++) {
          const col = cols[c].sort((a, b) => a.row - b.row);
          const empty = ROWS - col.length;
          // Drop existing tiles to bottom
          for (let i = 0; i < col.length; i++) {
            next.push({ ...col[i], row: empty + i, isNew: false });
          }
          // Fill top with new tiles
          for (let i = 0; i < empty; i++) {
            next.push({
              id: `n${newId++}`,
              emotion: EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)],
              row: i, col: c, isMatched: false, isNew: true,
              spawnDelay: (empty - i) * 60,
            });
          }
        }
        return next;
      });
      setTimeout(() => setIsProcessing(false), 300);
    }, 350);
  }, [board, isProcessing, gameOver]);

  // Drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent, tile: Tile) => {
    if (isProcessing || gameOver || activeDrag) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setActiveDrag({
      tileId: tile.id, startRow: tile.row, startCol: tile.col,
      startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY,
    });
  }, [isProcessing, gameOver, activeDrag]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!activeDrag || isProcessing) return;
    setActiveDrag(prev => prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null);
  }, [activeDrag, isProcessing]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!activeDrag || isProcessing) return;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}

    const { startRow, startCol, startX, startY, currentX, currentY } = activeDrag;
    setActiveDrag(null);

    const dx = currentX - startX;
    const dy = currentY - startY;
    if (Math.abs(dx) < 25 && Math.abs(dy) < 25) return;

    let targetRow = startRow, targetCol = startCol;
    if (Math.abs(dx) > Math.abs(dy)) {
      targetCol = dx > 0 ? Math.min(COLS - 1, startCol + 1) : Math.max(0, startCol - 1);
    } else {
      targetRow = dy > 0 ? Math.min(ROWS - 1, startRow + 1) : Math.max(0, startRow - 1);
    }
    if (targetRow === startRow && targetCol === startCol) return;

    setIsProcessing(true);
    setBoard(prev => {
      const next = [...prev];
      const t1 = next.find(t => t.row === startRow && t.col === startCol);
      const t2 = next.find(t => t.row === targetRow && t.col === targetCol);
      if (!t1 || !t2) { setIsProcessing(false); return prev; }
      t1.row = targetRow; t1.col = targetCol;
      t2.row = startRow;  t2.col = startCol;

      const { hasMatches } = checkMatches(next);
      if (!hasMatches) {
        t1.row = startRow; t1.col = startCol;
        t2.row = targetRow; t2.col = targetCol;
        setTimeout(() => setIsProcessing(false), 250);
        return [...next];
      }
      setIsProcessing(false);
      return next;
    });
  }, [activeDrag, isProcessing]);

  const useCalmBomb = useCallback(() => {
    if (isProcessing || gameOver || score < 150) return;
    setScore(s => s - 150);
    setBoard(prev => prev.map(t => t.emotion === '😡' ? { ...t, isMatched: true } : t));
  }, [isProcessing, gameOver, score]);

  const initBoard = useCallback(() => {
    setBoard(makeBoard());
    setScore(0); setCombo(0); setTimeLeft(60);
    setGameOver(false); setAutoReturn(null);
    setFloatingTexts([]); setActiveDrag(null);
    setIsProcessing(false);
  }, []);

  // Drag visual — computed inline, no per-tile board.find()
  const dragInfo = useMemo(() => {
    if (!activeDrag) return null;
    const dx = activeDrag.currentX - activeDrag.startX;
    const dy = activeDrag.currentY - activeDrag.startY;
    const isH = Math.abs(dx) >= Math.abs(dy);
    const offset = isH
      ? Math.sign(dx) * Math.min(60, Math.abs(dx))
      : Math.sign(dy) * Math.min(60, Math.abs(dy));
    const targetCol = isH
      ? (dx > 0 ? Math.min(COLS - 1, activeDrag.startCol + 1) : Math.max(0, activeDrag.startCol - 1))
      : activeDrag.startCol;
    const targetRow = !isH
      ? (dy > 0 ? Math.min(ROWS - 1, activeDrag.startRow + 1) : Math.max(0, activeDrag.startRow - 1))
      : activeDrag.startRow;
    return { tileId: activeDrag.tileId, isH, offset, targetRow, targetCol };
  }, [activeDrag]);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center bg-card border-[6px] border-foreground rounded-[2.5rem] p-6 lg:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
      <style>{`
        @keyframes float-up-fade {
          0%   { transform: translateY(0)    scale(0.9); opacity: 1; }
          100% { transform: translateY(-36px) scale(1.1); opacity: 0; }
        }
        .ft-anim { animation: float-up-fade 0.9s ease-out forwards; }
        @keyframes bounce-land {
          0%   { transform: scaleY(1); }
          40%  { transform: scaleY(0.82) scaleX(1.12); }
          70%  { transform: scaleY(1.06) scaleX(0.96); }
          100% { transform: scaleY(1); }
        }
        .bounce-land { animation: bounce-land 0.35s ease-out forwards; }
      `}</style>

      {/* HUD */}
      <div className="w-full flex justify-between items-center z-10 mb-6 px-4 py-3 bg-background/60 border-4 border-foreground rounded-2xl shadow-pop-sm">
        <div className="flex flex-col">
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Score</span>
          <span className="text-4xl font-black text-foreground tabular-nums">{score}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Time</span>
          <span className={cn(
            "text-4xl font-black tabular-nums font-mono",
            timeLeft <= 15 ? "text-destructive animate-pulse" : "text-foreground"
          )}>
            0:{timeLeft.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">Combo</span>
          <span className={cn(
            "text-3xl font-black tabular-nums",
            combo > 1 ? "text-primary animate-bounce" : "text-foreground opacity-50"
          )}>x{combo}</span>
        </div>
      </div>

      {/* Board */}
      <div
        className="relative z-10 bg-black/5 dark:bg-black/30 p-3 rounded-[2rem] border-[6px] border-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden touch-none"
        style={{ width: 'min(100%, 540px)', aspectRatio: '1/1' }}
      >
        {/* Background grid slots */}
        <div className="absolute inset-3 grid grid-cols-8 grid-rows-8 gap-1">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="bg-foreground/5 rounded-lg border border-foreground/5" />
          ))}
        </div>

        {/* Tiles */}
        <div className="relative w-full h-full">
          {board.map((tile) => {
            const theme = EMOTION_THEMES[tile.emotion];
            const pctLeft = (tile.col / COLS) * 100;
            const pctTop  = (tile.row / ROWS) * 100;

            let tx = 0, ty = 0, isDragging = false;
            if (dragInfo) {
              if (dragInfo.tileId === tile.id) {
                isDragging = true;
                tx = dragInfo.isH ? dragInfo.offset : 0;
                ty = dragInfo.isH ? 0 : dragInfo.offset;
              } else if (
                Math.abs(dragInfo.offset) > 10 &&
                tile.row === dragInfo.targetRow && tile.col === dragInfo.targetCol
              ) {
                tx = dragInfo.isH ? -dragInfo.offset : 0;
                ty = dragInfo.isH ? 0 : -dragInfo.offset;
              }
            }

            return (
              <div
                key={tile.id}
                onPointerDown={(e) => handlePointerDown(e, tile)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={cn(
                  "absolute select-none cursor-grab",
                  tile.isMatched ? "scale-0 opacity-0 transition-all duration-200" : "scale-100 opacity-100",
                  tile.isNew && "bounce-land",
                  isDragging ? "z-40 scale-110" : "z-10"
                )}
                style={{
                  width: `${100 / COLS}%`,
                  height: `${100 / ROWS}%`,
                  left: `${pctLeft}%`,
                  top: `${pctTop}%`,
                  transform: `translate(${tx}px, ${ty}px)`,
                  transition: isDragging ? 'none' : 'transform 0.18s ease-out',
                  transitionDelay: tile.isNew && tile.spawnDelay ? `${tile.spawnDelay}ms` : '0ms',
                  willChange: 'transform',
                }}
              >
                <div className={cn(
                  "w-[88%] h-[88%] mx-auto mt-[6%] rounded-xl border-[3px] border-foreground flex items-center justify-center",
                  "bg-card shadow-pop-sm",
                  theme.border
                )}>
                  <span className="text-2xl md:text-3xl pointer-events-none select-none leading-none">
                    {tile.emotion}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Floating score texts */}
          {floatingTexts.map((ft) => (
            <div
              key={ft.id}
              className="absolute pointer-events-none z-50 font-black text-sm md:text-base ft-anim select-none whitespace-nowrap"
              style={{
                left: `${(ft.col / COLS) * 100}%`,
                top: `${(ft.row / ROWS) * 100}%`,
                color: ft.color,
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {ft.text}
            </div>
          ))}
        </div>

        {/* Game Over overlay */}
        {gameOver && (
          <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-up">
            <Trophy className="w-16 h-16 text-yellow-500 mb-4 animate-bounce" />
            <h2 className="text-3xl font-black text-foreground mb-2">Spectacular Job!</h2>
            <p className="text-base font-bold text-muted-foreground mb-6">Score: {score}</p>
            {onComplete && (
              <div className="flex flex-col items-center gap-3">
                <Button onClick={() => onComplete(score)} size="lg" className="rounded-full font-black px-10 shadow-pop hover:-translate-y-1 transition-transform">
                  Continue <Sparkles className="w-4 h-4 ml-2" />
                </Button>
                {autoReturn !== null && (
                  <span className="text-sm text-muted-foreground font-black animate-pulse">
                    Returning in {autoReturn}s…
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 z-10 px-4">
        <Button variant="outline" onClick={initBoard}
          className="rounded-full border-2 border-foreground shadow-pop font-black px-6 py-5 hover:-translate-y-0.5">
          <RefreshCw className="w-4 h-4 mr-2" /> Restart
        </Button>
        <Button variant="outline" onClick={useCalmBomb}
          disabled={isProcessing || score < 150 || gameOver}
          className={cn(
            "rounded-full border-2 border-foreground shadow-pop font-black px-8 py-5 transition-all group",
            score >= 150 ? "hover:-translate-y-1 hover:bg-destructive hover:text-destructive-foreground" : "opacity-40 cursor-not-allowed"
          )}>
          <Zap className="w-5 h-5 mr-2 text-red-500 group-hover:text-white" />
          Calm Bomb (150 pts)
        </Button>
      </div>

      <p className="mt-6 text-muted-foreground text-xs md:text-sm font-semibold text-center w-full max-w-lg bg-card border-[3px] border-foreground/10 rounded-full py-2.5 px-6 shadow-sm">
        Swipe adjacent tiles to match 3+ of the same emotion. Use Calm Bomb to clear all 😡!
      </p>
    </div>
  );
};
