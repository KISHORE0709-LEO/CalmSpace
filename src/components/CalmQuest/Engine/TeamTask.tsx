import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Star, Heart, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────
type TileType = "art" | "writing" | "deco" | "science" | "story" | "math";

interface Tile {
  id: number;
  type: TileType;
  emoji: string;
  placed: boolean;
  wrong: boolean;
}

interface Slot {
  id: number;
  type: TileType;
  filled: boolean;
  wrongFlash: boolean;
  correctFlash: boolean;
}

interface Hint {
  character: string;
  emoji: string;
  text: string;
  color: string;
}

interface Props {
  onComplete: (stars: number, xp: number) => void;
  onBack: () => void;
}

// ─── Config ────────────────────────────────────────────────────────────────────
const TILE_DEFS: Record<TileType, { emoji: string; label: string; color: string; bg: string; border: string }> = {
  art:     { emoji: "🎨", label: "Art",     color: "#f472b6", bg: "bg-pink-100",   border: "border-pink-400"   },
  writing: { emoji: "✏️", label: "Writing", color: "#60a5fa", bg: "bg-blue-100",   border: "border-blue-400"   },
  deco:    { emoji: "⭐", label: "Deco",    color: "#facc15", bg: "bg-yellow-100", border: "border-yellow-400" },
  science: { emoji: "🔬", label: "Science", color: "#4ade80", bg: "bg-green-100",  border: "border-green-400"  },
  story:   { emoji: "📖", label: "Story",   color: "#a78bfa", bg: "bg-purple-100", border: "border-purple-400" },
  math:    { emoji: "📐", label: "Math",    color: "#fb923c", bg: "bg-orange-100", border: "border-orange-400" },
};

// 9 tiles, 3 of each set — board has 9 slots matching
const TYPES_IN_ORDER: TileType[] = ["art","writing","deco","science","story","math","art","writing","deco"];

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const HINTS: Hint[] = [
  { character: "Rahul",  emoji: "🧑", text: "Try placing the art pieces first!", color: "bg-blue-100 border-blue-400 text-blue-900" },
  { character: "Priya",  emoji: "👧", text: "The science tile goes with the green slot!", color: "bg-pink-100 border-pink-400 text-pink-900" },
  { character: "Arjun",  emoji: "👦", text: "Match the colors — they always match!", color: "bg-green-100 border-green-400 text-green-900" },
  { character: "Priya",  emoji: "👧", text: "I think the story tile should go there!", color: "bg-pink-100 border-pink-400 text-pink-900" },
  { character: "Rahul",  emoji: "🧑", text: "We're doing great! Keep going!", color: "bg-blue-100 border-blue-400 text-blue-900" },
  { character: "Arjun",  emoji: "👦", text: "Almost done! I'm so proud of our team!", color: "bg-green-100 border-green-400 text-green-900" },
];

// ─── Main Component ─────────────────────────────────────────────────────────────
export const TeamTask = ({ onComplete, onBack }: Props) => {
  const [phase, setPhase]         = useState<"intro" | "game" | "win">("intro");
  const [introStep, setIntroStep] = useState(0);

  // Game state
  const [tiles, setTiles]         = useState<Tile[]>([]);
  const [slots, setSlots]         = useState<Slot[]>([]);
  const [selected, setSelected]   = useState<number | null>(null); // selected tile id
  const [score, setScore]         = useState(0);
  const [harmony, setHarmony]     = useState(100);
  const [hint, setHint]           = useState<Hint>(HINTS[0]);
  const [hintIdx, setHintIdx]     = useState(0);
  const [feedback, setFeedback]   = useState<{ text: string; good: boolean } | null>(null);
  const [wrongTile, setWrongTile] = useState<number | null>(null);

  const initGame = useCallback(() => {
    const types = shuffle(TYPES_IN_ORDER);
    const newTiles: Tile[] = types.map((type, i) => ({
      id: i,
      type,
      emoji: TILE_DEFS[type].emoji,
      placed: false,
      wrong: false,
    }));
    const slotTypes = shuffle([...TYPES_IN_ORDER]);
    const newSlots: Slot[] = slotTypes.map((type, i) => ({
      id: i,
      type,
      filled: false,
      wrongFlash: false,
      correctFlash: false,
    }));
    setTiles(newTiles);
    setSlots(newSlots);
    setSelected(null);
    setScore(0);
    setHarmony(100);
    setHint(HINTS[0]);
  }, []);

  useEffect(() => {
    if (phase === "game") initGame();
  }, [phase, initGame]);

  // Rotate hints every 6s
  useEffect(() => {
    if (phase !== "game") return;
    const interval = setInterval(() => {
      setHintIdx(i => {
        const next = (i + 1) % HINTS.length;
        setHint(HINTS[next]);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [phase]);

  // Win check
  useEffect(() => {
    if (phase !== "game") return;
    if (score >= 9) {
      setTimeout(() => setPhase("win"), 800);
      setTimeout(() => {
        const stars = harmony > 80 ? 3 : harmony > 50 ? 2 : 1;
        onComplete(stars, harmony * 2 + 50);
      }, 3500);
    }
  }, [score, phase, harmony, onComplete]);

  const handleTileClick = (tile: Tile) => {
    if (tile.placed) return;
    setSelected(tile.id === selected ? null : tile.id);
  };

  const handleSlotClick = (slot: Slot) => {
    if (slot.filled || selected === null) return;
    const tile = tiles.find(t => t.id === selected);
    if (!tile) return;

    if (tile.type === slot.type) {
      // ✅ Correct!
      setTiles(prev => prev.map(t => t.id === tile.id ? { ...t, placed: true } : t));
      setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, filled: true, correctFlash: true } : s));
      setTimeout(() => setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, correctFlash: false } : s)), 600);
      setScore(s => s + 1);
      setHarmony(h => Math.min(100, h + 3));
      setFeedback({ text: ["Perfect fit! 🌟", "Great match! ⭐", "Excellent! 🎉", "Nice one! 💛"][Math.floor(Math.random() * 4)], good: true });
      setSelected(null);
    } else {
      // ❌ Wrong
      setWrongTile(tile.id);
      setTimeout(() => setWrongTile(null), 600);
      setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, wrongFlash: true } : s));
      setTimeout(() => setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, wrongFlash: false } : s)), 600);
      setHarmony(h => Math.max(0, h - 8));
      setFeedback({ text: "Oops! Check the colour 🎨", good: false });
      setSelected(null);
    }
    setTimeout(() => setFeedback(null), 1800);
  };

  const availableTiles = tiles.filter(t => !t.placed);
  const filledCount = slots.filter(s => s.filled).length;

  // ─── INTRO ────────────────────────────────────────────────────────────────────
  const introLines = [
    { speaker: "Ms. Priya 👩‍🏫", text: "We need to build the class project board! Each piece goes in its matching coloured slot.", color: "bg-primary text-primary-foreground" },
    { speaker: "Rahul 🧑",       text: "I'll give you hints along the way! Just click a tile, then click the matching slot on the board.", color: "bg-blue-100 text-blue-900" },
    { speaker: "Lumio 💫",       text: "Click a tile on the left → then click its matching slot on the right. Match the colours and emojis. Easy!", color: "bg-secondary text-secondary-foreground" },
  ];

  if (phase === "intro") {
    const step = introLines[introStep];
    return (
      <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center animate-fade-up px-4 gap-6">
        <div className="w-full max-w-xl bg-card border-4 border-foreground rounded-[2.5rem] overflow-hidden shadow-pop-lg">
          {/* Preview */}
          <div className="relative w-full h-32 border-b-4 border-foreground flex items-center justify-center gap-3 overflow-hidden" style={{ background: "linear-gradient(135deg,#dbeafe,#fef9c3)" }}>
            {(["art","writing","deco","science","story","math"] as TileType[]).map((t, i) => (
              <div key={i} className={cn("w-12 h-12 rounded-xl border-3 border-foreground flex items-center justify-center text-2xl shadow-pop animate-float", TILE_DEFS[t].bg)} style={{ animationDelay: `${i * 0.2}s`, border:"3px solid #1e293b" }}>
                {TILE_DEFS[t].emoji}
              </div>
            ))}
          </div>
          <div className="p-7 flex flex-col gap-5">
            <div className={cn("rounded-2xl border-4 border-foreground p-4 shadow-pop relative", step.color)}>
              <div className="absolute -top-4 left-6 bg-foreground text-background font-black text-xs uppercase tracking-widest px-3 py-1 rounded-full">{step.speaker}</div>
              <p className="text-base font-bold mt-2">"{step.text}"</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {introLines.map((_,i) => <div key={i} className={cn("w-2.5 h-2.5 rounded-full border-2 border-foreground", i===introStep?"bg-primary":"bg-muted")} />)}
              </div>
              <div className="flex gap-3">
                {introStep > 0 && <Button variant="outline" onClick={()=>setIntroStep(s=>s-1)} className="rounded-full shadow-pop-sm">← Back</Button>}
                {introStep < introLines.length-1
                  ? <Button onClick={()=>setIntroStep(s=>s+1)} className="rounded-full shadow-pop px-6">Next →</Button>
                  : <Button onClick={()=>setPhase("game")} className="rounded-full shadow-pop-lg px-8 py-5 text-lg font-black bg-secondary text-secondary-foreground border-4 border-foreground hover:-translate-y-1 transition-all">Build the Board! 🎨</Button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── WIN ──────────────────────────────────────────────────────────────────────
  if (phase === "win") {
    const stars = harmony > 80 ? 3 : harmony > 50 ? 2 : 1;
    return (
      <div className="w-full min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-7 text-center px-4 animate-fade-up">
        <div className="text-6xl animate-bounce-slow">🏆</div>
        <h1 className="text-5xl font-black text-foreground">Project Board Complete!</h1>
        <div className="flex gap-2">
          {[1,2,3].map(s => <Star key={s} className={cn("w-10 h-10", s<=stars ? "fill-secondary text-secondary" : "text-muted-foreground")} />)}
        </div>
        <p className="text-xl text-muted-foreground max-w-md">The project board looks amazing! Your team is so proud! 🎉</p>
        <div className="flex flex-wrap justify-center gap-3">
          {["Puzzle Master 🧩","Team Builder 🏗️","Classroom Star ⭐"].map((b,i) => (
            <div key={i} className="bg-secondary border-4 border-foreground rounded-2xl px-5 py-2 font-black text-secondary-foreground shadow-pop animate-float" style={{animationDelay:`${i*0.3}s`}}>{b}</div>
          ))}
        </div>
        <div className="bg-card border-4 border-foreground rounded-[2rem] p-5 max-w-sm shadow-pop">
          <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Lumio 💫</p>
          <p className="text-lg font-bold italic">"When each person adds their piece, the whole picture becomes beautiful."</p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          {[["bg-primary text-primary-foreground","9/9","Pieces Placed"],["bg-secondary text-secondary-foreground",`${harmony}%`,"Harmony"],["bg-card text-foreground",`${stars}★`,"Stars"]].map(([cls,val,lbl],i) => (
            <div key={i} className={cn("border-4 border-foreground rounded-2xl px-5 py-3 shadow-pop text-center", cls as string)}>
              <div className="text-2xl font-black">{val}</div>
              <div className="text-xs uppercase tracking-wide mt-1">{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── GAME ─────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full animate-fade-up">
      <div className="mb-3">
        <Button variant="outline" size="sm" onClick={onBack} className="rounded-full shadow-pop-sm">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Map
        </Button>
      </div>

      {/* HUD */}
      <div className="w-full bg-card border-4 border-foreground rounded-[1.5rem] p-3 shadow-pop mb-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[160px]">
          <div className="flex justify-between mb-1 text-xs font-black">
            <span className="text-primary flex items-center gap-1"><Star className="w-3 h-3" />Pieces Placed</span>
            <span>{filledCount} / 9</span>
          </div>
          <div className="w-full h-4 bg-muted rounded-full border-2 border-foreground overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width:`${(filledCount/9)*100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-1 text-sm font-black shrink-0">
          <Heart className="w-4 h-4 text-secondary fill-secondary" />
          <span className={cn(harmony < 40 ? "text-red-500" : "")}>{harmony}%</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-black shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
          {score * 20} XP
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={cn("w-full text-center py-2 px-4 rounded-2xl border-4 border-foreground font-black text-base mb-3 animate-scale-in shadow-pop", feedback.good ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900")}>
          {feedback.text}
        </div>
      )}

      {/* Main game area */}
      <div className="flex gap-4 items-start">

        {/* LEFT: Tile hand */}
        <div className="flex flex-col gap-3 shrink-0">
          <div className="text-xs font-black uppercase tracking-widest text-muted-foreground text-center mb-1">
            📦 Your Tiles
          </div>
          <div className="flex flex-col gap-2">
            {availableTiles.map(tile => {
              const def = TILE_DEFS[tile.type];
              const isSelected = selected === tile.id;
              const isWrong = wrongTile === tile.id;
              return (
                <button
                  key={tile.id}
                  onClick={() => handleTileClick(tile)}
                  className={cn(
                    "w-20 h-20 rounded-2xl border-4 flex flex-col items-center justify-center gap-1 transition-all duration-200 shadow-pop active:scale-95 cursor-pointer",
                    def.bg,
                    def.border,
                    isSelected && "scale-110 shadow-pop-lg ring-4 ring-foreground -translate-y-1",
                    isWrong && "animate-shake bg-red-200 border-red-500",
                  )}
                >
                  <span className="text-3xl">{tile.emoji}</span>
                  <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: def.color }}>{def.label}</span>
                </button>
              );
            })}
            {availableTiles.length === 0 && (
              <div className="w-20 h-20 rounded-2xl border-4 border-dashed border-muted-foreground flex items-center justify-center text-2xl opacity-40">✓</div>
            )}
          </div>
        </div>

        {/* CENTER: Project Board */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
            📌 Project Board — Click a tile then click its matching slot!
          </div>

          {/* 3×3 grid */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            {slots.map(slot => {
              const def = TILE_DEFS[slot.type];
              return (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  disabled={slot.filled}
                  className={cn(
                    "aspect-square rounded-2xl border-4 flex flex-col items-center justify-center gap-1 transition-all duration-200 shadow-pop",
                    slot.filled
                      ? cn("border-foreground", def.bg, "scale-100 cursor-default")
                      : cn("border-dashed bg-muted/30 hover:scale-105 hover:shadow-pop-lg", def.border,
                          selected !== null && "cursor-pointer",
                          slot.correctFlash && "bg-green-200 border-green-500 scale-105",
                          slot.wrongFlash   && "bg-red-200 border-red-500",
                        ),
                  )}
                >
                  {slot.filled ? (
                    <>
                      <span className="text-3xl">{def.emoji}</span>
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    </>
                  ) : (
                    <>
                      <span className="text-2xl opacity-30">{def.emoji}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-40" style={{ color: def.color }}>{def.label}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Progress */}
          <div className="flex gap-1 mt-2">
            {slots.map((slot, i) => (
              <div key={i} className={cn("w-3 h-3 rounded-full border-2 border-foreground transition-all", slot.filled ? "bg-primary scale-110" : "bg-muted")} />
            ))}
          </div>
        </div>

        {/* RIGHT: Teammate hints */}
        <div className="shrink-0 w-36 flex flex-col gap-3">
          <div className="text-xs font-black uppercase tracking-widest text-muted-foreground text-center mb-1">
            💬 Team Hints
          </div>

          {/* Active hint */}
          <div className={cn("rounded-2xl border-4 border-foreground p-3 shadow-pop relative animate-fade-up", hint.color)} key={hintIdx}>
            <div className="absolute -top-3 left-3 bg-foreground text-background text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
              {hint.character}
            </div>
            <div className="text-2xl mb-1">{hint.emoji}</div>
            <p className="text-xs font-bold mt-2 leading-snug">"{hint.text}"</p>
          </div>

          {/* Teammates status */}
          <div className="flex flex-col gap-2 mt-2">
            {[{name:"Rahul",emoji:"🧑",color:"bg-blue-100"},{name:"Priya",emoji:"👧",color:"bg-pink-100"},{name:"Arjun",emoji:"👦",color:"bg-green-100"}].map(tm => (
              <div key={tm.name} className={cn("flex items-center gap-2 rounded-xl border-2 border-foreground px-2 py-1.5 shadow-pop-sm", tm.color)}>
                <span className="text-lg">{tm.emoji}</span>
                <div>
                  <div className="text-[10px] font-black">{tm.name}</div>
                  <div className="text-[9px] text-green-700 font-bold">Helping! ✓</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selection hint */}
      {selected !== null && (
        <div className="mt-4 text-center text-sm font-bold text-primary animate-pulse-soft">
          ✅ Tile selected! Now click the matching slot on the board →
        </div>
      )}
      {selected === null && availableTiles.length > 0 && (
        <div className="mt-4 text-center text-sm font-medium text-muted-foreground">
          👆 Click a tile on the left to select it, then click its matching slot on the board
        </div>
      )}
    </div>
  );
};
