import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, Star, Trash2 } from "lucide-react";

interface MyCalmSpaceProps {
  onComplete?: (score: number) => void;
}

type Category = 'lighting' | 'furniture' | 'nature' | 'sounds' | 'activities';

interface Item {
  id: string;
  name: string;
  emoji: string;
  score: number;
  category: Category;
  bad?: boolean;
  tip: string;
}

const ITEMS: Item[] = [
  { id: 'l1', name: 'Fairy Lights',  emoji: '✨', score: 18, category: 'lighting',   tip: 'Soft twinkly lights feel magical & calm' },
  { id: 'l2', name: 'Candle',        emoji: '🕯️', score: 15, category: 'lighting',   tip: 'Warm flickering light soothes the mind' },
  { id: 'l3', name: 'Lava Lamp',     emoji: '🫧', score: 14, category: 'lighting',   tip: 'Slow moving blobs are hypnotically relaxing' },
  { id: 'l4', name: 'Night Light',   emoji: '🌙', score: 12, category: 'lighting',   tip: 'A gentle glow makes darkness feel safe' },
  { id: 'l5', name: 'Strobe Light',  emoji: '🚨', score: -25, category: 'lighting',  bad: true, tip: '⚠️ Flashing lights cause sensory overload!' },
  { id: 'f1', name: 'Bean Bag',      emoji: '🛋️', score: 22, category: 'furniture',  tip: 'Sinking into a bean bag feels like a hug' },
  { id: 'f2', name: 'Soft Rug',      emoji: '🪵', score: 14, category: 'furniture',  tip: 'Soft textures under your feet feel grounding' },
  { id: 'f3', name: 'Cozy Blanket',  emoji: '🧸', score: 20, category: 'furniture',  tip: 'Weighted blankets reduce anxiety' },
  { id: 'f4', name: 'Floor Cushion', emoji: '🪑', score: 12, category: 'furniture',  tip: 'Sitting low and comfy helps you relax' },
  { id: 'f5', name: 'Hammock',       emoji: '🌴', score: 18, category: 'furniture',  tip: 'Gentle swinging calms the nervous system' },
  { id: 'n1', name: 'Indoor Plant',  emoji: '🪴', score: 16, category: 'nature',     tip: 'Plants clean the air and lift your mood' },
  { id: 'n2', name: 'Fish Tank',     emoji: '🐠', score: 20, category: 'nature',     tip: 'Watching fish swim lowers blood pressure' },
  { id: 'n3', name: 'Flowers',       emoji: '🌸', score: 14, category: 'nature',     tip: 'Fresh flowers make any space feel alive' },
  { id: 'n4', name: 'Sunlight',      emoji: '☀️', score: 18, category: 'nature',     tip: 'Natural light boosts serotonin levels' },
  { id: 'n5', name: 'Rain Window',   emoji: '🌧️', score: 15, category: 'nature',     tip: 'Watching rain is naturally meditative' },
  { id: 's1', name: 'Lofi Music',    emoji: '🎧', score: 22, category: 'sounds',     tip: 'Lofi beats help focus and reduce stress' },
  { id: 's2', name: 'Wind Chimes',   emoji: '🎐', score: 16, category: 'sounds',     tip: 'Gentle chimes create a peaceful atmosphere' },
  { id: 's3', name: 'White Noise',   emoji: '📻', score: 14, category: 'sounds',     tip: 'White noise blocks out distracting sounds' },
  { id: 's4', name: 'Loud Alarm',    emoji: '📢', score: -30, category: 'sounds',    bad: true, tip: '⚠️ Loud sudden sounds spike your stress!' },
  { id: 's5', name: 'Singing Bowl',  emoji: '🔔', score: 18, category: 'sounds',     tip: 'Singing bowls create calming vibrations' },
  { id: 'a1', name: 'Fidget Cube',   emoji: '🎲', score: 14, category: 'activities', tip: 'Fidgeting helps discharge nervous energy' },
  { id: 'a2', name: 'Colouring',     emoji: '🎨', score: 18, category: 'activities', tip: 'Colouring is meditative and creative' },
  { id: 'a3', name: 'Journal',       emoji: '📓', score: 16, category: 'activities', tip: 'Writing feelings helps process emotions' },
  { id: 'a4', name: 'Stress Ball',   emoji: '🟡', score: 12, category: 'activities', tip: 'Squeezing releases physical tension' },
  { id: 'a5', name: 'Puzzle',        emoji: '🧩', score: 16, category: 'activities', tip: 'Puzzles focus the mind and reduce worry' },
];

const CATEGORIES: { key: Category; label: string; emoji: string; active: string }[] = [
  { key: 'lighting',   label: 'Lighting',   emoji: '💡', active: 'bg-yellow-400 text-yellow-900 border-yellow-600' },
  { key: 'furniture',  label: 'Furniture',  emoji: '🛋️', active: 'bg-orange-400 text-white border-orange-600' },
  { key: 'nature',     label: 'Nature',     emoji: '🌿', active: 'bg-emerald-500 text-white border-emerald-700' },
  { key: 'sounds',     label: 'Sounds',     emoji: '🎵', active: 'bg-blue-500 text-white border-blue-700' },
  { key: 'activities', label: 'Activities', emoji: '🎨', active: 'bg-purple-500 text-white border-purple-700' },
];

const WIN_TARGET = 80;

// 6 clearly visible room slots with descriptive positions
const SLOTS = [
  { id: 'top-left',     label: 'Wall Left',    emoji: '🖼️', x: '4%',   y: '6%',  w: '22%', h: '26%' },
  { id: 'top-center',   label: 'Ceiling',      emoji: '💫', x: '38%',  y: '4%',  w: '24%', h: '20%' },
  { id: 'top-right',    label: 'Wall Right',   emoji: '🖼️', x: '74%',  y: '6%',  w: '22%', h: '26%' },
  { id: 'floor-left',   label: 'Floor Left',   emoji: '📦', x: '4%',   y: '66%', w: '28%', h: '28%' },
  { id: 'floor-center', label: 'Centre Floor', emoji: '📦', x: '36%',  y: '62%', w: '28%', h: '32%' },
  { id: 'floor-right',  label: 'Floor Right',  emoji: '📦', x: '68%',  y: '66%', w: '28%', h: '28%' },
];

export const MyCalmSpace = ({ onComplete }: MyCalmSpaceProps) => {
  const [activeCategory, setActiveCategory] = useState<Category>('lighting');
  const [placed, setPlaced] = useState<Record<string, Item>>({});
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [lastTip, setLastTip] = useState<{ emoji: string; text: string } | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [autoReturn, setAutoReturn] = useState<number | null>(null);

  const calmScore = Object.values(placed).reduce((s, i) => s + i.score, 0);
  const pct = Math.min(100, Math.max(0, (calmScore / WIN_TARGET) * 100));
  const hasBad = Object.values(placed).some(i => i.bad);

  const avatar = (() => {
    if (hasBad)            return { emoji: '😵💫', msg: 'Too stressful! Remove the bad items.' };
    if (calmScore <= 0)    return { emoji: '😟',   msg: 'Add some calming items to your room!' };
    if (calmScore < 30)    return { emoji: '😐',   msg: 'Getting there, keep adding...' };
    if (calmScore < 60)    return { emoji: '🙂',   msg: 'Feeling better already!' };
    if (calmScore < WIN_TARGET) return { emoji: '😊', msg: 'Almost there, so cozy!' };
    return { emoji: '😌',  msg: 'Perfect! This space is so peaceful 💚' };
  })();

  const handleSlotClick = (id: string) => setSelectedSlot(prev => prev === id ? null : id);

  const handleItemPick = (item: Item) => {
    if (!selectedSlot) return;
    const newPlaced = { ...placed, [selectedSlot]: item };
    setPlaced(newPlaced);
    setSelectedSlot(null);
    setLastTip({ emoji: item.emoji, text: item.tip });
    setTimeout(() => setLastTip(null), 2500);
    const newScore = Object.values(newPlaced).reduce((s, i) => s + i.score, 0);
    if (newScore >= WIN_TARGET && !showWin) {
      setTimeout(() => { setShowWin(true); setAutoReturn(5); }, 700);
    }
  };

  const removeItem = (slotId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaced(prev => { const n = { ...prev }; delete n[slotId]; return n; });
  };

  React.useEffect(() => {
    if (autoReturn === null) return;
    if (autoReturn <= 0) { onComplete?.(calmScore); return; }
    const t = setTimeout(() => setAutoReturn(p => p! - 1), 1000);
    return () => clearTimeout(t);
  }, [autoReturn, calmScore, onComplete]);

  // ── WIN SCREEN ──
  if (showWin) {
    const stars = calmScore >= 120 ? 3 : calmScore >= WIN_TARGET ? 2 : 1;
    return (
      <div className="w-full max-w-lg mx-auto animate-fade-up">
        <div className="bg-card border-4 border-foreground rounded-[2rem] p-8 shadow-pop-lg flex flex-col items-center text-center gap-5">
          <div className="text-7xl animate-bounce-slow">🏡</div>
          <h2 className="text-3xl font-black text-foreground">Your Calm Space is Ready!</h2>
          <p className="text-base font-semibold text-muted-foreground leading-relaxed">
            You built a beautiful, soothing space. These are real things you can add to your room to feel calmer every day!
          </p>
          <div className="flex gap-3">
            {[1,2,3].map(i => (
              <Star key={i} className={cn("w-12 h-12", i <= stars ? "fill-yellow-400 text-yellow-400 animate-bounce-slow" : "fill-muted text-muted")}
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/10 border-2 border-emerald-400 rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-foreground">{calmScore}</p>
              <p className="text-xs font-black text-emerald-700 uppercase">Calm Score</p>
            </div>
            <div className="bg-primary/10 border-2 border-primary/40 rounded-2xl p-4 text-center">
              <p className="text-3xl font-black text-foreground">{Object.values(placed).filter(i => !i.bad).length}</p>
              <p className="text-xs font-black text-primary uppercase">Items Placed</p>
            </div>
          </div>
          <div className="w-full bg-muted/40 border-2 border-foreground/10 rounded-2xl p-4">
            <p className="text-xs font-black uppercase text-muted-foreground mb-3">Your room contains</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {Object.values(placed).filter(i => !i.bad).map((item, i) => (
                <span key={i} className="bg-card border-2 border-foreground rounded-full px-3 py-1.5 text-sm font-bold flex items-center gap-1.5">
                  {item.emoji} {item.name}
                </span>
              ))}
            </div>
          </div>
          <div className="w-full bg-primary/5 border-2 border-foreground/10 rounded-2xl p-4 text-left">
            <p className="text-xs font-black uppercase text-muted-foreground mb-1">✨ What you learned</p>
            <p className="text-sm font-semibold text-foreground">Your environment affects how you feel. Small changes like soft lighting, plants, and calming sounds can make a big difference to your mood.</p>
          </div>
          {onComplete && (
            <div className="w-full flex flex-col gap-2">
              <Button onClick={() => onComplete(calmScore)} className="w-full rounded-2xl border-2 border-foreground font-black py-5 shadow-pop text-base">
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
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 animate-fade-up">

      {/* ── TOP HUD ── */}
      <div className="bg-card border-4 border-foreground rounded-[1.5rem] px-5 py-4 shadow-pop flex items-center gap-4 flex-wrap">
        {/* Avatar + score */}
        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
          <div className="text-4xl shrink-0 transition-all duration-500">{avatar.emoji}</div>
          <div className="flex-1">
            <p className="text-xs font-black text-muted-foreground mb-1.5">{avatar.msg}</p>
            <div className="w-full h-4 bg-muted rounded-full border-2 border-foreground overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700",
                  hasBad ? "bg-red-500" : pct < 40 ? "bg-amber-400" : pct < 80 ? "bg-blue-400" : "bg-emerald-400"
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={cn("text-2xl font-black tabular-nums", calmScore >= WIN_TARGET ? "text-emerald-600" : "text-foreground")}>{calmScore}</p>
            <p className="text-xs font-black text-muted-foreground">/ {WIN_TARGET}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setPlaced({}); setSelectedSlot(null); }}
          className="rounded-xl border-2 border-foreground shadow-pop-sm font-black text-xs shrink-0">
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Reset
        </Button>
      </div>

      {/* ── INSTRUCTION BANNER ── */}
      <div className={cn(
        "rounded-2xl border-4 border-foreground px-5 py-3 text-base font-black text-center transition-all duration-300",
        selectedSlot
          ? "bg-secondary text-secondary-foreground shadow-pop"
          : "bg-primary/10 text-foreground"
      )}>
        {selectedSlot
          ? "✅ Great! Now pick an item from below to place it"
          : "👆 Step 1: Tap any glowing slot in the room  →  Step 2: Pick an item below"}
      </div>

      {/* ── ROOM ── */}
      <div className="w-full bg-card border-4 border-foreground rounded-[2rem] p-4 shadow-pop-lg">
        <div className="grid grid-cols-3 gap-3">
          {SLOTS.map(slot => {
            const item = placed[slot.id];
            const isSelected = selectedSlot === slot.id;
            return (
              <div
                key={slot.id}
                onClick={() => handleSlotClick(slot.id)}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center cursor-pointer rounded-2xl border-4 transition-all duration-200",
                  isSelected
                    ? "border-secondary bg-secondary/10 scale-105 shadow-pop"
                    : item
                    ? "border-foreground bg-muted/30 hover:scale-105"
                    : "border-foreground/30 bg-muted/20 hover:border-foreground/60 hover:bg-muted/40"
                )}
              >
                {item ? (
                  <div className="relative flex flex-col items-center justify-center gap-1.5 w-full h-full p-3">
                    <span className="text-4xl leading-none">{item.emoji}</span>
                    <span className="text-xs font-black text-foreground text-center leading-tight">{item.name}</span>
                    <span className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-full border",
                      item.bad ? "bg-red-100 text-red-600 border-red-300" : "bg-emerald-100 text-emerald-700 border-emerald-300"
                    )}>{item.score > 0 ? `+${item.score}` : item.score}</span>
                    <button onClick={(e) => removeItem(slot.id, e)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-black flex items-center justify-center border-2 border-white shadow z-10">×</button>
                    {item.bad && <div className="absolute inset-0 rounded-xl bg-red-400/20 animate-pulse pointer-events-none" />}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 opacity-40">
                    <span className="text-2xl font-black text-foreground">+</span>
                    <span className="text-[10px] font-black text-foreground text-center">{slot.label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tip popup */}
        {lastTip && (
          <div className="mt-3 bg-secondary/10 border-2 border-secondary rounded-2xl px-4 py-2.5 text-center animate-fade-up">
            <p className="text-sm font-black text-foreground">{lastTip.emoji} {lastTip.text}</p>
          </div>
        )}
      </div>

      {/* ── ITEM PICKER ── */}
      <div className="bg-card border-4 border-foreground rounded-[2rem] overflow-hidden shadow-pop-lg">

        {/* Category tabs */}
        <div className="flex border-b-4 border-foreground overflow-x-auto scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={cn(
                "flex-1 min-w-[80px] flex flex-col items-center gap-1 py-3 px-2 font-black text-xs transition-all border-r-2 border-foreground last:border-r-0 shrink-0",
                activeCategory === cat.key
                  ? cat.active
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className="hidden sm:block">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="p-4">
          {!selectedSlot && (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-xl px-4 py-2.5 mb-4 text-center">
              <p className="text-sm font-black text-amber-800">👆 Tap a slot in the room above first!</p>
            </div>
          )}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {ITEMS.filter(i => i.category === activeCategory).map(item => {
              const isPlaced = Object.values(placed).some(p => p.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemPick(item)}
                  disabled={!selectedSlot}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-4 transition-all duration-150 select-none relative",
                    !selectedSlot
                      ? "border-foreground/15 bg-muted/30 opacity-50 cursor-not-allowed"
                      : item.bad
                      ? "border-red-500 bg-red-50 hover:bg-red-100 hover:-translate-y-1.5 hover:shadow-pop cursor-pointer active:scale-95"
                      : isPlaced
                      ? "border-emerald-500 bg-emerald-50 hover:-translate-y-1.5 hover:shadow-pop cursor-pointer active:scale-95"
                      : "border-foreground bg-card hover:bg-secondary/20 hover:-translate-y-1.5 hover:shadow-pop cursor-pointer active:scale-95"
                  )}
                >
                  {isPlaced && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-[8px] text-white font-black">✓</span>
                    </div>
                  )}
                  <span className="text-3xl leading-none">{item.emoji}</span>
                  <span className="text-[10px] font-black text-center leading-tight text-foreground">{item.name}</span>
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-full border",
                    item.bad
                      ? "bg-red-100 text-red-600 border-red-300"
                      : "bg-emerald-100 text-emerald-700 border-emerald-300"
                  )}>
                    {item.score > 0 ? `+${item.score}` : item.score}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
