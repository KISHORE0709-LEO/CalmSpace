import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, CheckCircle2, RotateCw, Maximize2, Trash, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface MyCalmSpaceProps {
  onComplete?: (score: number) => void;
}

interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  calmScore: number;
  type: 'light' | 'sound' | 'texture' | 'object';
}

interface PlacedItem extends InventoryItem {
  instanceId: string;
  x: number; // in pixels relative to room canvas
  y: number;
  rotation: number; // degrees: 0, 45, 90, 135, etc.
  scale: number; // multiplier: 0.8, 1, 1.3
}

interface VisualNote {
  id: number;
  emoji: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
}

const INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Soft Lamp', emoji: '🏮', calmScore: 20, type: 'light' },
  { id: 'i2', name: 'Lava Lamp', emoji: '🌋', calmScore: 15, type: 'light' },
  { id: 'i3', name: 'Flashing Strobe', emoji: '🚨', calmScore: -30, type: 'light' },
  { id: 'i4', name: 'Lofi Beats', emoji: '🎧', calmScore: 25, type: 'sound' },
  { id: 'i5', name: 'Loud Alarm', emoji: '📢', calmScore: -35, type: 'sound' },
  { id: 'i6', name: 'Soft Rug', emoji: '🧶', calmScore: 15, type: 'texture' },
  { id: 'i7', name: 'Bean Bag', emoji: '🛋️', calmScore: 25, type: 'texture' },
  { id: 'i8', name: 'Fidget Toy', emoji: '🪀', calmScore: 10, type: 'object' },
  { id: 'i9', name: 'Indoor Plant', emoji: '🪴', calmScore: 20, type: 'object' },
];

export const MyCalmSpace = ({ onComplete }: MyCalmSpaceProps) => {
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  
  // Dragging states
  const [draggedItem, setDraggedItem] = useState<{
    item: InventoryItem | PlacedItem;
    type: 'inventory' | 'placed';
    offsetX: number;
    offsetY: number;
  } | null>(null);
  
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [notes, setNotes] = useState<VisualNote[]>([]);

  const roomRef = useRef<HTMLDivElement>(null);

  const currentCalmScore = placedItems.reduce((acc, item) => acc + item.calmScore, 0);
  const winTarget = 100;
  const isWin = currentCalmScore >= winTarget;

  const [autoReturn, setAutoReturn] = useState<number | null>(null);

  // Auto return countdown trigger
  useEffect(() => {
    if (isWin && autoReturn === null) {
      setAutoReturn(5);
    } else if (!isWin && autoReturn !== null) {
      setAutoReturn(null);
    }
  }, [isWin, autoReturn]);

  // Auto Return Countdown loop
  useEffect(() => {
    if (autoReturn === null) return;
    if (autoReturn <= 0) {
      if (onComplete) onComplete(currentCalmScore);
      return;
    }
    const timer = setTimeout(() => setAutoReturn(autoReturn - 1), 1000);
    return () => clearTimeout(timer);
  }, [autoReturn, currentCalmScore, onComplete]);

  // Music Notes floating physics loop
  useEffect(() => {
    // Generate new notes periodically if sound lofi is placed
    const lofiPlaced = placedItems.filter(item => item.id === 'i4');
    let noteSpawner: NodeJS.Timeout;

    if (lofiPlaced.length > 0) {
      noteSpawner = setInterval(() => {
        const randomLofi = lofiPlaced[Math.floor(Math.random() * lofiPlaced.length)];
        const noteEmojis = ['🎵', '🎶', '♩', '♪'];
        setNotes(prev => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            emoji: noteEmojis[Math.floor(Math.random() * noteEmojis.length)],
            x: randomLofi.x + 40,
            y: randomLofi.y - 10,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -1.2 - Math.random() * 1.5,
            alpha: 1
          }
        ]);
      }, 800);
    }

    return () => clearInterval(noteSpawner);
  }, [placedItems]);

  // Update floating notes
  useEffect(() => {
    if (notes.length === 0) return;
    const interval = setInterval(() => {
      setNotes(prev =>
        prev
          .map(n => ({
            ...n,
            x: n.x + n.vx,
            y: n.y + n.vy,
            alpha: n.alpha - 0.02
          }))
          .filter(n => n.alpha > 0)
      );
    }, 25);
    return () => clearInterval(interval);
  }, [notes]);

  // Global Pointer Events to track drag position relative to Canvas
  const handlePointerDown = (e: React.PointerEvent, item: InventoryItem | PlacedItem, type: 'inventory' | 'placed') => {
    if (e.button !== 0 && e.button !== undefined) return; // only left click / touch

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDraggedItem({ item, type, offsetX, offsetY });
    setSelectedInstanceId(type === 'placed' ? (item as PlacedItem).instanceId : null);

    // Capture pointer
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedItem || !roomRef.current) return;
    const rect = roomRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPointerPos({ x, y });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggedItem) return;
    
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }

    if (!roomRef.current) {
      setDraggedItem(null);
      return;
    }

    const rect = roomRef.current.getBoundingClientRect();
    const dropX = e.clientX - rect.left - draggedItem.offsetX;
    const dropY = e.clientY - rect.top - draggedItem.offsetY;

    // Bounds check: Allow dropping if mostly inside the room
    const padding = 30;
    const isInside = 
      dropX >= -padding && 
      dropX <= rect.width - 40 && 
      dropY >= -padding && 
      dropY <= rect.height - 40;

    if (isInside) {
      const constrainedX = Math.max(0, Math.min(rect.width - 80, dropX));
      const constrainedY = Math.max(0, Math.min(rect.height - 80, dropY));

      if (draggedItem.type === 'inventory') {
        // Add new placed item
        const newInstanceId = `placed-${Date.now()}`;
        setPlacedItems(prev => [
          ...prev,
          {
            ...draggedItem.item,
            instanceId: newInstanceId,
            x: constrainedX,
            y: constrainedY,
            rotation: 0,
            scale: 1.0
          }
        ]);
        setSelectedInstanceId(newInstanceId);
      } else {
        // Move existing item
        const placed = draggedItem.item as PlacedItem;
        setPlacedItems(prev =>
          prev.map(p =>
            p.instanceId === placed.instanceId
              ? { ...p, x: constrainedX, y: constrainedY }
              : p
          )
        );
      }
    } else if (draggedItem.type === 'placed') {
      // Drop outside room -> Delete item
      const placed = draggedItem.item as PlacedItem;
      setPlacedItems(prev => prev.filter(p => p.instanceId !== placed.instanceId));
      setSelectedInstanceId(null);
    }

    setDraggedItem(null);
  };

  // Item Modifiers
  const rotateItem = (instanceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlacedItems(prev =>
      prev.map(p =>
        p.instanceId === instanceId
          ? { ...p, rotation: (p.rotation + 45) % 360 }
          : p
      )
    );
  };

  const scaleItem = (instanceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlacedItems(prev =>
      prev.map(p => {
        if (p.instanceId === instanceId) {
          const nextScale = p.scale === 1.0 ? 1.3 : p.scale === 1.3 ? 0.8 : 1.0;
          return { ...p, scale: nextScale };
        }
        return p;
      })
    );
  };

  const deleteItem = (instanceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlacedItems(prev => prev.filter(p => p.instanceId !== instanceId));
    setSelectedInstanceId(null);
  };

  const clearRoom = () => {
    setPlacedItems([]);
    setSelectedInstanceId(null);
  };

  // Avatar state
  const getAvatar = () => {
    if (placedItems.some(i => i.id === 'i3' || i.id === 'i5')) {
      // Overstimulated/Stressed emoji if alarms/strobes are placed
      return { emoji: '😵‍💫', text: 'Too loud and flashing!', animation: 'animate-shake' };
    }
    if (currentCalmScore < 0) return { emoji: '😰', text: 'This space feels overwhelming...', animation: 'animate-shake' };
    if (currentCalmScore < 30) return { emoji: '😐', text: 'Could be more relaxing...', animation: 'animate-none' };
    if (currentCalmScore < 60) return { emoji: '🙂', text: 'Getting cozier!', animation: 'animate-float-slow' };
    if (currentCalmScore < 100) return { emoji: '😊', text: 'I feel very peaceful.', animation: 'animate-float' };
    return { emoji: '😌', text: 'Perfect relaxation space!', animation: 'animate-bounce-slow' };
  };

  const avatar = getAvatar();

  // Dynamic Room Overlay style based on placed lamps
  const renderRoomLightingStyles = () => {
    const lamps = placedItems.filter(item => item.type === 'light');
    if (lamps.length === 0) return {};

    const activeStrobe = lamps.some(l => l.id === 'i3');
    if (activeStrobe) return {}; // strobe is handled via flashing animation class

    // Construct layered radial gradients centered at each lamp position
    const gradients = lamps
      .map(lamp => {
        if (lamp.id === 'i1') {
          // Warm soft gold glow
          return `radial-gradient(circle at ${lamp.x + 40}px ${lamp.y + 40}px, rgba(251,191,36,0.3) 0%, rgba(251,191,36,0) 65%)`;
        }
        if (lamp.id === 'i2') {
          // Slow neon pink-magenta lava glow
          return `radial-gradient(circle at ${lamp.x + 40}px ${lamp.y + 40}px, rgba(236,72,153,0.3) 0%, rgba(236,72,153,0) 70%)`;
        }
        return '';
      })
      .filter(Boolean)
      .join(', ');

    return { backgroundImage: gradients || undefined };
  };

  const isStrobeActive = placedItems.some(i => i.id === 'i3');
  const isAlarmActive = placedItems.some(i => i.id === 'i5');

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Inject custom visualizer keyframes */}
      <style>{`
        @keyframes float-notes {
          0% { transform: translateY(0) scale(0.7) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-70px) scale(1.1) rotate(15deg); opacity: 0; }
        }
        .animate-note {
          animation: float-notes 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        @keyframes strobe-flash {
          0%, 100% { background-color: rgba(239, 68, 68, 0.05); }
          50% { background-color: rgba(239, 68, 68, 0.35); }
        }
        .animate-strobe-alert {
          animation: strobe-flash 0.15s infinite;
        }
        @keyframes alarm-ripple {
          0% { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .animate-alarm-ripple {
          animation: alarm-ripple 1s infinite linear;
        }
      `}</style>

      {/* Left: Inventory panel */}
      <div className="w-full lg:w-[320px] shrink-0 bg-card border-[6px] border-foreground rounded-[2.5rem] p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[380px] lg:h-[650px] overflow-hidden z-20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-foreground tracking-tight">Cozy Inventory</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearRoom} 
            disabled={placedItems.length === 0}
            className="shadow-pop-sm rounded-xl hover:-translate-y-0.5 border-2 border-foreground"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Reset
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground font-semibold mb-4">
          Drag soothing items into your room. Avoid noise alarms & flashing strobes!
        </p>
        
        <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-4 scrollbar-none touch-none px-1">
          {INVENTORY.map(item => (
            <div 
              key={item.id}
              className="aspect-square bg-background border-[3px] border-foreground/15 rounded-2xl flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:border-foreground hover:shadow-pop transition-all group select-none relative overflow-hidden"
              onPointerDown={(e) => handlePointerDown(e, item, 'inventory')}
              onPointerUp={handlePointerUp}
              onPointerMove={handlePointerMove}
            >
              {/* Calm Score Badge */}
              <div className={cn(
                "absolute top-1.5 right-1.5 text-[9px] font-black px-1 py-0.5 rounded border border-foreground/10",
                item.calmScore > 0 ? "bg-primary/20 text-emerald-600" : "bg-red-500/20 text-red-600"
              )}>
                {item.calmScore > 0 ? `+${item.calmScore}` : item.calmScore}
              </div>

              <span className="text-4xl pointer-events-none group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">{item.emoji}</span>
              <span className="text-[10px] font-black uppercase mt-2.5 text-center leading-tight px-1 pointer-events-none text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Cozy Canvas Room */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Calm Score HUD */}
        <div className="bg-background/90 border-4 border-foreground rounded-[2rem] p-5 shadow-pop-sm flex justify-between items-center relative overflow-hidden z-20">
          <div className="flex flex-col z-10">
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Atmosphere Comfort</span>
            <div className="flex items-baseline gap-1.5">
              <span className={cn(
                "text-4xl font-black tabular-nums transition-colors duration-300", 
                isWin ? "text-emerald-500" : currentCalmScore < 0 ? "text-red-500" : "text-foreground"
              )}>
                {currentCalmScore}
              </span>
              <span className="text-lg text-muted-foreground font-bold">/ {winTarget}</span>
            </div>
          </div>
          
          <div className="flex-1 max-w-[280px] mx-6 hidden sm:block">
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden border-2 border-foreground relative shadow-inner">
              <div 
                className={cn(
                  "h-full transition-all duration-500 ease-out", 
                  isWin ? "bg-emerald-500" : currentCalmScore < 0 ? "bg-red-500" : "bg-blue-400"
                )} 
                style={{ width: `${Math.max(0, Math.min(100, (currentCalmScore / winTarget) * 100))}%` }} 
              />
            </div>
          </div>

          {isWin ? (
            <div className="flex items-center gap-1.5 text-emerald-600 font-black animate-bounce-slow text-sm bg-emerald-500/10 px-4 py-2 rounded-xl border-2 border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" /> Cozy Vibe Match!
            </div>
          ) : (
            <div className="text-xs font-bold text-muted-foreground max-w-[150px] text-right">
              Place items to raise tranquility score to {winTarget}
            </div>
          )}
        </div>

        {/* Room Canvas Area */}
        <div 
          ref={roomRef}
          onPointerMove={handlePointerMove}
          className={cn(
            "flex-1 min-h-[460px] lg:min-h-0 border-[6px] border-foreground rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-colors duration-500 bg-[#FAF9F6] dark:bg-slate-950 touch-none select-none z-10",
            isStrobeActive && "animate-strobe-alert"
          )}
        >
          {/* Room Isometric Floor Line Visuals */}
          <div className="absolute top-1/4 left-0 right-0 border-t-[4px] border-foreground/15 z-0" />
          <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-slate-200/20 dark:bg-slate-800/10 z-0 pointer-events-none" />
          
          {/* Window showing scenery */}
          <div className="absolute top-6 left-12 w-28 h-20 bg-cyan-100 dark:bg-cyan-950 border-[3px] border-foreground rounded-lg overflow-hidden flex flex-col justify-end z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-300 to-amber-100 dark:from-indigo-950 dark:to-cyan-900 opacity-60" />
            <div className="w-12 h-6 bg-white/40 dark:bg-white/10 rounded-full animate-float-slow absolute top-4 left-4" />
            {/* Window Pane grids */}
            <div className="w-full h-0.5 bg-foreground/20 absolute top-1/2" />
            <div className="w-0.5 h-full bg-foreground/20 absolute left-1/2" />
          </div>

          {/* Dynamic Light overlays */}
          <div 
            className="absolute inset-0 pointer-events-none z-10 mix-blend-screen opacity-90 transition-all duration-300"
            style={renderRoomLightingStyles()}
          />

          {/* Avatar Person inside Room */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10">
             <div className="relative">
               <span className={cn(
                 "text-[8rem] transition-all duration-500 block filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.25)]", 
                 avatar.animation
               )}>
                 {avatar.emoji}
               </span>
               
               {/* Ambient Glow Aura */}
               {currentCalmScore > 50 && (
                 <div className="absolute inset-[-20px] bg-primary/20 blur-3xl -z-10 rounded-full animate-pulse-soft" />
               )}
             </div>
             <span className="bg-background/90 border-2 border-foreground rounded-full px-4 py-1 text-xs font-black shadow-sm mt-3 animate-float-slow">
               {avatar.text}
             </span>
          </div>

          {/* Placed Items */}
          {placedItems.map(item => {
            const isSelected = selectedInstanceId === item.instanceId;
            return (
              <div
                key={item.instanceId}
                className={cn(
                  "absolute select-none group touch-none cursor-grab active:cursor-grabbing",
                  isSelected ? "z-30" : "z-20"
                )}
                style={{ 
                  left: item.x, 
                  top: item.y,
                  transform: `scale(${item.scale}) rotate(${item.rotation}deg)`,
                  transition: draggedItem?.item === item ? 'none' : 'transform 0.15s ease-out'
                }}
                onPointerDown={(e) => handlePointerDown(e, item, 'placed')}
                onPointerUp={handlePointerUp}
                onPointerMove={handlePointerMove}
              >
                {/* Placed Item emoji render */}
                <div className="relative">
                  <span className="text-7xl filter drop-shadow-[0_12px_8px_rgba(0,0,0,0.3)] block transform hover:scale-105 transition-transform duration-200">
                    {item.emoji}
                  </span>

                  {/* Alarm Waves ripple */}
                  {item.id === 'i5' && (
                    <>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-4 border-red-500/20 rounded-full animate-alarm-ripple pointer-events-none -z-10" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-red-500/10 rounded-full animate-alarm-ripple pointer-events-none -z-10" style={{ animationDelay: '0.5s' }} />
                    </>
                  )}

                  {/* Ambient sound particle indicator (music waves symbol) */}
                  {item.type === 'sound' && item.calmScore > 0 && (
                    <div className="absolute -top-3 -right-3 flex gap-1 pointer-events-none bg-background/90 border border-foreground/10 rounded-full px-1.5 py-0.5 shadow-sm">
                      <Music className="w-3.5 h-3.5 text-primary animate-bounce" />
                    </div>
                  )}

                  {/* Glow circle behind bulb lamps */}
                  {item.type === 'light' && item.calmScore > 0 && (
                    <div className="absolute inset-0 bg-amber-200/35 blur-xl -z-10 rounded-full animate-pulse-soft scale-150 pointer-events-none" />
                  )}
                </div>

                {/* Selected Item Control Ring Menu */}
                {isSelected && !draggedItem && (
                  <div 
                    className="absolute top-[-45px] left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-background border-2 border-foreground rounded-full p-1 shadow-pop-sm z-50 pointer-events-auto"
                    onPointerDown={(e) => e.stopPropagation()} // block drag triggering on click
                  >
                    <button 
                      onClick={(e) => rotateItem(item.instanceId, e)}
                      className="w-7 h-7 bg-muted hover:bg-primary hover:text-white rounded-full flex items-center justify-center border border-foreground/10 transition-colors"
                      title="Rotate Item"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => scaleItem(item.instanceId, e)}
                      className="w-7 h-7 bg-muted hover:bg-primary hover:text-white rounded-full flex items-center justify-center border border-foreground/10 transition-colors"
                      title="Resize"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => deleteItem(item.instanceId, e)}
                      className="w-7 h-7 bg-red-100 hover:bg-red-500 hover:text-white text-red-600 rounded-full flex items-center justify-center border border-foreground/10 transition-colors"
                      title="Remove"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Active Inventory Drag Ghost Preview */}
          {draggedItem && (
            <div 
              className="absolute pointer-events-none z-50 scale-105 opacity-65 border-2 border-dashed border-primary rounded-full p-2 bg-primary/5"
              style={{
                left: pointerPos.x - draggedItem.offsetX,
                top: pointerPos.y - draggedItem.offsetY,
              }}
            >
              <span className="text-7xl block">{draggedItem.item.emoji}</span>
            </div>
          )}

          {/* Sound Music Note Particles */}
          {notes.map(note => (
            <div
              key={note.id}
              className="absolute pointer-events-none z-40 text-lg font-black animate-note select-none text-primary"
              style={{
                left: note.x,
                top: note.y,
                opacity: note.alpha
              }}
            >
              {note.emoji}
            </div>
          ))}

          {/* Win Screen */}
          {isWin && (
            <div className="absolute inset-0 z-50 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center animate-fade-up">
              <div className="bg-card border-[6px] border-foreground rounded-[2.5rem] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full flex flex-col items-center">
                <Sparkles className="w-20 h-20 text-emerald-500 mb-4 animate-bounce-slow" />
                <h2 className="text-3xl font-black text-foreground mb-3 text-center">Incredibly Cozy!</h2>
                <p className="text-sm font-bold text-muted-foreground mb-6 text-center text-balance">
                  You have constructed a perfectly balanced, relaxing environment for sensory peace.
                </p>
                <div className="bg-emerald-500/10 text-emerald-600 border-[3px] border-emerald-500/20 rounded-2xl px-6 py-3 mb-6 w-full text-center">
                  <p className="text-xs font-black uppercase tracking-widest mb-0.5">Atmosphere Score</p>
                  <p className="text-4xl font-black tabular-nums">{currentCalmScore}</p>
                </div>
                {onComplete && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <Button onClick={() => onComplete(currentCalmScore)} size="lg" className="w-full rounded-full font-black text-xl py-5 shadow-pop hover:-translate-y-1">
                      Finish Level <Sparkles className="w-5 h-5 ml-2" />
                    </Button>
                    {autoReturn !== null && (
                      <span className="text-sm text-muted-foreground font-black animate-pulse text-center">
                        Returning to map in {autoReturn}s...
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
