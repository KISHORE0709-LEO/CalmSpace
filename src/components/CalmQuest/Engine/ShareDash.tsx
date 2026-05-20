import { useState, useEffect, useRef, useCallback } from "react";
import { CinematicLevelData } from "@/lib/calmQuestData";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";

interface Props {
  level: CinematicLevelData;
  onComplete: (stars: number, xp: number) => void;
  onBack: () => void;
}

type Scene = "intro" | "game" | "results";

interface Item {
  id: string;
  emoji: string;
  label: string;
  x: number; // % position in classroom
  y: number;
}

interface Student {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  request: string;
  requestEmoji: string;
  needsItem: string; // item label they need
  active: boolean;   // currently requesting
  helped: boolean;
  responseText: string | null;
}

const GOAL_HELPS = 15;
const PLAYER_SPEED = 1.5;

const ITEMS: Item[] = [
  { id: "pencil",   emoji: "✏️",  label: "Pencil",   x: 8,  y: 20 },
  { id: "notebook", emoji: "📓",  label: "Notebook", x: 8,  y: 40 },
  { id: "eraser",   emoji: "🧽",  label: "Eraser",   x: 8,  y: 60 },
  { id: "ruler",    emoji: "📏",  label: "Ruler",    x: 8,  y: 78 },
  { id: "bottle",   emoji: "💧",  label: "Bottle",   x: 88, y: 20 },
  { id: "book",     emoji: "📚",  label: "Book",     x: 88, y: 40 },
  { id: "bag",      emoji: "🎒",  label: "Bag",      x: 88, y: 60 },
  { id: "crayon",   emoji: "🖍️",  label: "Crayon",   x: 88, y: 78 },
];

const STUDENT_POOL: Omit<Student, "active" | "helped" | "responseText">[] = [
  { id: "rahul",   name: "Rahul",   emoji: "🧒",  x: 30, y: 35, request: "Can I borrow a pencil?",    requestEmoji: "✏️",  needsItem: "Pencil"   },
  { id: "priya",   name: "Priya",   emoji: "👧",  x: 55, y: 35, request: "I forgot my notebook…",     requestEmoji: "📓",  needsItem: "Notebook" },
  { id: "arjun",   name: "Arjun",   emoji: "👦",  x: 42, y: 60, request: "Can I use an eraser?",      requestEmoji: "🧽",  needsItem: "Eraser"   },
  { id: "meera",   name: "Meera",   emoji: "👧🏽", x: 68, y: 60, request: "Can you pass the ruler?",   requestEmoji: "📏",  needsItem: "Ruler"    },
  { id: "dev",     name: "Dev",     emoji: "🧑",  x: 30, y: 60, request: "I forgot my bottle…",       requestEmoji: "💧",  needsItem: "Bottle"   },
  { id: "sara",    name: "Sara",    emoji: "👩",  x: 55, y: 60, request: "Can I borrow a book?",       requestEmoji: "📚",  needsItem: "Book"     },
  { id: "kiran",   name: "Kiran",   emoji: "🧒🏽", x: 42, y: 35, request: "I dropped my bag…",         requestEmoji: "🎒",  needsItem: "Bag"      },
  { id: "ananya",  name: "Ananya",  emoji: "👧🏻", x: 68, y: 35, request: "Can I have a crayon?",      requestEmoji: "🖍️",  needsItem: "Crayon"   },
];

const LUMIO_HINTS = [
  "Helping others makes friendships stronger 💛",
  "A small act of kindness goes a long way ✨",
  "You're making the classroom a happier place 🌟",
  "Sharing is caring — great job! 🎉",
];

function pickStudents(count: number): Student[] {
  const shuffled = [...STUDENT_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(s => ({ ...s, active: true, helped: false, responseText: null }));
}

export const ShareDash = ({ level, onComplete, onBack }: Props) => {
  const [scene, setScene] = useState<Scene>("intro");
  const [introLine, setIntroLine] = useState(0);
  const [playerX, setPlayerX] = useState(48);
  const [playerY, setPlayerY] = useState(50);
  const [carrying, setCarrying] = useState<Item | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState({ helps: 0, points: 0, friendship: 0, xp: 0 });
  const [lumioHint, setLumioHint] = useState<string | null>(null);
  const [classroomMood, setClassroomMood] = useState(0); // 0-100
  const [resultBadge, setResultBadge] = useState("Helpful Friend");
  const keysRef = useRef<Set<string>>(new Set());
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const introLines = [
    "Today, kindness means helping each other.",
    "Let's make our classroom a happy place.",
  ];

  // auto-advance intro
  useEffect(() => {
    if (scene !== "intro") return;
    const t = setTimeout(() => {
      if (introLine < introLines.length - 1) {
        setIntroLine(l => l + 1);
      } else {
        setScene("game");
        setStudents(pickStudents(2));
      }
    }, 2200);
    return () => clearTimeout(t);
  }, [scene, introLine]);

  // keyboard
  useEffect(() => {
    if (scene !== "game") return;
    const down = (e: KeyboardEvent) => keysRef.current.add(e.key);
    const up   = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [scene]);

  // game loop — movement + proximity checks
  useEffect(() => {
    if (scene !== "game") return;
    loopRef.current = setInterval(() => {
      const keys = keysRef.current;
      const spd = PLAYER_SPEED;
      setPlayerX(px => {
        let nx = px;
        if (keys.has("ArrowRight") || keys.has("d")) nx = Math.min(92, px + spd);
        if (keys.has("ArrowLeft")  || keys.has("a")) nx = Math.max(4,  px - spd);
        return nx;
      });
      setPlayerY(py => {
        let ny = py;
        if (keys.has("ArrowDown")  || keys.has("s")) ny = Math.min(85, py + spd);
        if (keys.has("ArrowUp")    || keys.has("w")) ny = Math.max(15, py - spd);
        return ny;
      });
    }, 50);
    return () => { if (loopRef.current) clearInterval(loopRef.current); };
  }, [scene]);

  // proximity check — pick up item or deliver
  useEffect(() => {
    if (scene !== "game") return;

    // pick up item
    if (!carrying) {
      const nearItem = ITEMS.find(item => Math.hypot(playerX - item.x, playerY - item.y) < 10);
      if (nearItem) setCarrying(nearItem);
    }

    // deliver to student
    if (carrying) {
      const nearStudent = students.find(s =>
        s.active && !s.helped && s.needsItem === carrying.label &&
        Math.hypot(playerX - s.x, playerY - s.y) < 12
      );
      if (nearStudent) handleDeliver(nearStudent);
    }
  }, [playerX, playerY, scene, carrying, students]);

  // spawn more students
  useEffect(() => {
    if (scene !== "game") return;
    spawnRef.current = setInterval(() => {
      setStudents(prev => {
        const active = prev.filter(s => s.active && !s.helped);
        const maxActive = stats.helps < 5 ? 2 : stats.helps < 10 ? 3 : 3;
        if (active.length < maxActive) {
          const existing = prev.map(s => s.id);
          const available = STUDENT_POOL.filter(s => !existing.includes(s.id) || prev.find(p => p.id === s.id && p.helped));
          if (available.length > 0) {
            const pick = available[Math.floor(Math.random() * available.length)];
            return [...prev.filter(s => s.id !== pick.id), { ...pick, active: true, helped: false, responseText: null }];
          }
        }
        return prev;
      });
    }, 3500);
    return () => { if (spawnRef.current) clearInterval(spawnRef.current); };
  }, [scene, stats.helps]);

  const handleDeliver = useCallback((student: Student) => {
    setCarrying(null);
    setStudents(prev => prev.map(s => s.id === student.id
      ? { ...s, active: false, helped: true, responseText: "Thank you! 💛" }
      : s
    ));
    setTimeout(() => setStudents(prev => prev.map(s => s.id === student.id ? { ...s, responseText: null } : s)), 1800);

    const pts = 10;
    setStats(prev => {
      const next = { helps: prev.helps + 1, points: prev.points + pts, friendship: prev.friendship + 8, xp: prev.xp + pts };
      if (next.helps >= GOAL_HELPS) {
        const badge = next.helps >= GOAL_HELPS && next.points >= 120 ? "Kindness Star" : next.helps >= GOAL_HELPS ? "Classroom Helper" : "Helpful Friend";
        setResultBadge(badge);
        setTimeout(() => setScene("results"), 1000);
      }
      return next;
    });
    setClassroomMood(prev => Math.min(100, prev + 7));

    if (hintRef.current) clearTimeout(hintRef.current);
    setLumioHint(LUMIO_HINTS[Math.floor(Math.random() * LUMIO_HINTS.length)]);
    hintRef.current = setTimeout(() => setLumioHint(null), 2500);
  }, []);

  const progress = Math.min(100, Math.round((stats.helps / GOAL_HELPS) * 100));
  const moodBg = classroomMood < 30 ? "from-sky-200 via-yellow-50 to-green-50"
               : classroomMood < 60 ? "from-sky-300 via-yellow-100 to-green-100"
               : "from-sky-400 via-yellow-200 to-green-200";

  // ── INTRO ──
  if (scene === "intro") {
    return (
      <div className="w-full animate-fade-up">
        <div className={`relative w-full rounded-[2rem] border-4 border-foreground shadow-pop-lg overflow-hidden bg-gradient-to-b ${moodBg} flex items-center justify-center`}
          style={{ height: 380 }}>
          {/* classroom bg */}
          {["🪑","📚","✏️","🖼️","🌿","🪟","📐","🎒"].map((e, i) => (
            <span key={i} className="absolute text-4xl opacity-30 animate-float pointer-events-none select-none"
              style={{ top: `${8 + (i % 4) * 22}%`, left: `${5 + i * 12}%`, animationDelay: `${i * 0.3}s` }}>{e}</span>
          ))}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-amber-100 border-t-4 border-foreground/20" />
          {/* teacher */}
          <div className="relative z-10 flex flex-col items-center gap-4 text-center px-8 animate-scale-in">
            <div className="text-7xl animate-bounce-slow">👩🏫</div>
            <div className="bg-card border-4 border-foreground rounded-[2rem] p-5 shadow-pop-lg max-w-sm">
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">Ms. Priya</p>
              <p className="text-lg font-bold">"{introLines[introLine]}"</p>
            </div>
            <div className="flex gap-1">
              {introLines.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full border border-foreground ${i === introLine ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  if (scene === "results") {
    const stars = stats.helps >= GOAL_HELPS && stats.points >= 120 ? 3 : stats.helps >= GOAL_HELPS ? 2 : 1;
    return (
      <div className="w-full animate-scale-in">
        <div className="bg-card border-4 border-foreground rounded-[2rem] shadow-pop-lg p-8 max-w-lg mx-auto text-center relative overflow-hidden">
          <div className="absolute top-3 right-5 text-4xl animate-float opacity-60">🎉</div>
          <div className="absolute bottom-3 left-5 text-3xl animate-bounce-slow opacity-60">⭐</div>
          <div className="w-20 h-20 rounded-full bg-secondary border-4 border-foreground shadow-pop mx-auto mb-4 flex items-center justify-center text-4xl animate-bounce-slow">🏆</div>
          <h2 className="text-3xl font-black tracking-tight mb-1">Share Dash Complete!</h2>
          <p className="text-lg font-bold text-muted-foreground mb-5">{resultBadge}</p>
          <div className="flex justify-center gap-2 mb-6">
            {[1,2,3].map(i => (
              <Star key={i} className={`w-10 h-10 ${i <= stars ? "fill-secondary text-secondary animate-bounce-slow" : "fill-muted text-muted"}`}
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { emoji: "⭐", label: "Helps Done",       val: stats.helps,      bg: "bg-primary text-primary-foreground" },
              { emoji: "💛", label: "Friendship Energy", val: stats.friendship, bg: "bg-secondary text-secondary-foreground" },
              { emoji: "🏆", label: "Social XP",         val: stats.xp,         bg: "bg-accent text-accent-foreground" },
              { emoji: "🎯", label: "Helping Points",    val: stats.points,     bg: "bg-primary text-primary-foreground" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl border-2 border-foreground p-3 text-center shadow-pop-sm`}>
                <div className="text-2xl mb-1">{s.emoji}</div>
                <div className="text-2xl font-black">{s.val}</div>
                <div className="text-xs font-bold opacity-80">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="bg-primary/10 border-2 border-primary rounded-2xl p-4 mb-5 text-left">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">✨ Lumio</p>
            <p className="font-bold text-foreground">"Helping others makes friendships stronger."</p>
          </div>
          <div className="bg-secondary border-2 border-foreground rounded-2xl p-3 mb-6 text-center shadow-pop-sm">
            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">🔓 Next Level Unlocked</p>
            <p className="font-black text-lg">Team Task</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button size="lg" className="rounded-2xl px-8 h-14 text-base font-black border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all w-full"
              onClick={() => onComplete(stars, stats.xp)}>
              Next Level — Team Task <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-2xl px-8 h-14 text-base font-black border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all w-full"
              onClick={onBack}>
              ← Back to World Map
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── GAME ──
  return (
    <div className="w-full flex flex-col gap-4 animate-fade-up">

      {/* HUD */}
      <div className="flex items-center justify-between bg-card border-4 border-foreground rounded-[1.5rem] px-4 py-3 shadow-pop flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={onBack}
            className="px-3 py-1.5 rounded-full border-2 border-foreground text-xs font-black shadow-pop-sm bg-muted hover:-translate-y-0.5 transition-all">
            ← World Map
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-foreground bg-card text-xs font-black shadow-pop-sm">
            {carrying ? <>{carrying.emoji} Carrying: {carrying.label}</> : "🤲 Nothing in hand"}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-black text-sm">⭐ {stats.helps}/{GOAL_HELPS}</span>
          <span className="font-black text-sm">💛 {stats.friendship}</span>
          <span className="font-black text-sm">🏆 {stats.xp} XP</span>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-4 bg-muted rounded-full border-2 border-foreground overflow-hidden shadow-pop-sm">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.max(4, progress)}%` }} />
      </div>

      {/* Classroom mood bar */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-muted-foreground whitespace-nowrap">Classroom Mood</span>
        <div className="flex-1 h-3 bg-muted rounded-full border border-foreground/20 overflow-hidden">
          <div className="h-full bg-secondary rounded-full transition-all duration-700" style={{ width: `${classroomMood}%` }} />
        </div>
        <span className="text-lg">{classroomMood < 30 ? "😐" : classroomMood < 60 ? "🙂" : "😊"}</span>
      </div>

      {/* ── CLASSROOM ── */}
      <div className={`relative w-full rounded-[2rem] border-4 border-foreground shadow-pop-lg overflow-hidden bg-gradient-to-b ${moodBg}`}
        style={{ height: 420 }}>

        {/* Classroom decorations */}
        <div className="absolute top-2 left-0 right-0 flex justify-around px-4 pointer-events-none select-none">
          {["🖼️","📐","🌿","🖼️","📌","🌿","📐","🖼️"].map((e, i) => (
            <span key={i} className="text-2xl opacity-50">{e}</span>
          ))}
        </div>
        {/* Blackboard */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-green-800 border-4 border-amber-900 rounded-xl px-8 py-2 text-white text-sm font-black shadow-pop opacity-80">
          📝 Today: Be Kind &amp; Share
        </div>
        {/* Floor */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-amber-100 border-t-4 border-foreground/20" />
        {/* Desks row */}
        {[20, 38, 56, 74].map(x => (
          <div key={x} className="absolute text-3xl opacity-40 pointer-events-none select-none"
            style={{ bottom: "22%", left: `${x}%` }}>🪑</div>
        ))}

        {/* Item shelves */}
        {ITEMS.map(item => (
          <div key={item.id}
            className={`absolute flex flex-col items-center gap-0.5 cursor-pointer transition-all duration-200 ${Math.hypot(playerX - item.x, playerY - item.y) < 10 ? "scale-125" : "hover:scale-110"}`}
            style={{ left: `${item.x}%`, top: `${item.y}%`, transform: "translate(-50%,-50%)" }}>
            <div className={`text-3xl rounded-xl border-2 border-foreground p-1.5 shadow-pop-sm ${Math.hypot(playerX - item.x, playerY - item.y) < 10 ? "bg-secondary animate-bounce-slow" : "bg-card"}`}>
              {item.emoji}
            </div>
            <span className="text-xs font-black bg-card border border-foreground rounded-full px-1.5 py-0.5 shadow-pop-sm whitespace-nowrap">{item.label}</span>
          </div>
        ))}

        {/* Students */}
        {students.filter(s => s.active || s.responseText).map(s => (
          <div key={s.id} className="absolute flex flex-col items-center gap-0.5 transition-all duration-300"
            style={{ left: `${s.x}%`, top: `${s.y}%`, transform: "translate(-50%,-50%)" }}>
            <div className={`text-4xl ${s.active ? "animate-bounce-slow" : ""}`}>{s.emoji}</div>
            <span className="text-xs font-black bg-card border-2 border-foreground rounded-full px-2 py-0.5 shadow-pop-sm whitespace-nowrap">{s.name}</span>

            {/* Request bubble */}
            {s.active && !s.responseText && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-card border-4 border-foreground rounded-2xl px-3 py-2 shadow-pop-lg z-20 animate-scale-in whitespace-nowrap">
                <p className="text-xs font-bold text-center">{s.requestEmoji} "{s.request}"</p>
              </div>
            )}

            {/* Response */}
            {s.responseText && (
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-secondary border-2 border-foreground rounded-2xl px-3 py-1.5 text-xs font-bold shadow-pop whitespace-nowrap animate-fade-up z-20">
                {s.responseText}
              </div>
            )}
          </div>
        ))}

        {/* Player */}
        <div className="absolute flex flex-col items-center gap-0.5 transition-none z-30"
          style={{ left: `${playerX}%`, top: `${playerY}%`, transform: "translate(-50%,-50%)" }}>
          <div className="relative">
            <div className="text-5xl">🧑</div>
            {carrying && (
              <div className="absolute -top-4 -right-4 text-2xl animate-bounce-slow">{carrying.emoji}</div>
            )}
          </div>
          <div className="text-xs font-black bg-primary text-primary-foreground border-2 border-foreground rounded-full px-2 py-0.5 shadow-pop-sm">You</div>
        </div>

        {/* Lumio hint */}
        {lumioHint && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-2 border-foreground rounded-2xl px-4 py-2 text-sm font-bold shadow-pop z-40 animate-fade-up whitespace-nowrap">
            ✨ {lumioHint}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex flex-col gap-1">
          <button onPointerDown={() => keysRef.current.add("ArrowUp")}   onPointerUp={() => keysRef.current.delete("ArrowUp")}
            className="w-12 h-12 bg-card border-4 border-foreground rounded-xl shadow-pop text-xl font-black hover:bg-accent active:scale-95 transition-all select-none mx-auto">↑</button>
          <div className="flex gap-1">
            <button onPointerDown={() => keysRef.current.add("ArrowLeft")}  onPointerUp={() => keysRef.current.delete("ArrowLeft")}
              className="w-12 h-12 bg-card border-4 border-foreground rounded-xl shadow-pop text-xl font-black hover:bg-accent active:scale-95 transition-all select-none">←</button>
            <button onPointerDown={() => keysRef.current.add("ArrowDown")}  onPointerUp={() => keysRef.current.delete("ArrowDown")}
              className="w-12 h-12 bg-card border-4 border-foreground rounded-xl shadow-pop text-xl font-black hover:bg-accent active:scale-95 transition-all select-none">↓</button>
            <button onPointerDown={() => keysRef.current.add("ArrowRight")} onPointerUp={() => keysRef.current.delete("ArrowRight")}
              className="w-12 h-12 bg-card border-4 border-foreground rounded-xl shadow-pop text-xl font-black hover:bg-accent active:scale-95 transition-all select-none">→</button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground font-medium text-center ml-4">
          <p className="font-black text-sm mb-1">How to play</p>
          <p>🚶 Walk to an item shelf to pick it up</p>
          <p>📦 Then walk to the student who needs it</p>
          <p>💛 Help {GOAL_HELPS} classmates to complete!</p>
        </div>
      </div>

      {/* Lumio bar */}
      <div className="flex items-center gap-3 bg-card border-4 border-foreground rounded-[1.5rem] px-4 py-3 shadow-pop">
        <div className="w-10 h-10 rounded-full bg-primary border-2 border-foreground flex items-center justify-center text-xl flex-shrink-0 animate-pulse-soft">✨</div>
        <p className="text-sm font-bold text-muted-foreground flex-1">
          {stats.helps === 0 ? "Walk to a shelf to pick up an item, then bring it to a student who needs it!" :
           stats.helps < 5  ? `Great helping! ${GOAL_HELPS - stats.helps} more to go!` :
           stats.helps < 10 ? "You're making the classroom so much happier! 🌟" :
           stats.helps < 14 ? "Almost there — you're a Kindness Star! ⭐" :
           "One more help — you're incredible!"}
        </p>
        <span className="text-sm font-black text-primary whitespace-nowrap">{stats.helps}/{GOAL_HELPS}</span>
      </div>
    </div>
  );
};
