import { useState, useEffect, useRef, useCallback } from "react";
import { CinematicLevelData } from "@/lib/calmQuestData";
import { Button } from "@/components/ui/button";
import { Star, ArrowRight } from "lucide-react";

interface Props {
  level: CinematicLevelData;
  onComplete: (stars: number, xp: number) => void;
  onBack: () => void;
  worldId: number;
  levelId: number;
}

type Scene = "game" | "results";
type EnvMode = "school" | "outside" | "home";
interface Choice { emoji: string; label: string; correct: boolean; response: string; }
interface NPCTemplate { name: string; emoji: string; greeting: string; choices: Choice[]; }

const GOAL = 8;
const PLAYER_X = 18; // fixed % from left
const MEET_THRESHOLD = 14; // how close NPC must be to trigger interaction
const NPC_SPEED = 0.35; // px% per tick
const BG_SPEED = 0.5;

const ALL_NPCS: Record<EnvMode, NPCTemplate[]> = {
  school: [
    { name: "Rahul",     emoji: "🧒",  greeting: "Hey there!",        choices: [{ emoji: "👋", label: "Wave",       correct: true,  response: "See you in class! 😊" }, { emoji: "🙂", label: "Smile",     correct: true,  response: "Nice!" },           { emoji: "🚶", label: "Ignore", correct: false, response: "..." }] },
    { name: "Ms. Priya", emoji: "👩🏫", greeting: "Good morning!",     choices: [{ emoji: "👋", label: "Greet Back", correct: true,  response: "Good to see you! ⭐" }, { emoji: "🙂", label: "Smile",     correct: true,  response: "Have a great day!" }, { emoji: "🚶", label: "Ignore", correct: false, response: "..." }] },
    { name: "Arjun",     emoji: "👦",  greeting: "Walk with me?",      choices: [{ emoji: "🙂", label: "Join",       correct: true,  response: "Yay! Let's go! 🎉" },   { emoji: "🚶", label: "Alone",    correct: false, response: "Oh okay..." }] },
    { name: "Student",   emoji: "🧑",  greeting: "Oops, sorry!",       choices: [{ emoji: "🙏", label: "No worries", correct: true,  response: "Thanks! 💛" },           { emoji: "😐", label: "Ignore",   correct: false, response: "..." }] },
    { name: "Priya",     emoji: "👧",  greeting: "Hi! I'm new here.",  choices: [{ emoji: "😊", label: "Welcome!",   correct: true,  response: "Thank you! 🌸" },        { emoji: "🚶", label: "Ignore",   correct: false, response: "..." }] },
    { name: "Mr. Kumar", emoji: "👨🏫", greeting: "Hello there!",       choices: [{ emoji: "👋", label: "Hello Sir",  correct: true,  response: "Well done! 🌟" },        { emoji: "🙂", label: "Smile",    correct: true,  response: "Good!" },           { emoji: "🚶", label: "Ignore", correct: false, response: "..." }] },
  ],
  outside: [
    { name: "Neighbor",   emoji: "🧓",  greeting: "Good morning!",     choices: [{ emoji: "👋", label: "Wave",       correct: true,  response: "Have a nice day! ☀️" }, { emoji: "🙂", label: "Smile",    correct: true,  response: "You too!" },        { emoji: "🚶", label: "Ignore", correct: false, response: "..." }] },
    { name: "Shopkeeper", emoji: "🧑‍💼", greeting: "Can I help you?",   choices: [{ emoji: "😊", label: "Yes please", correct: true,  response: "Of course! 🛍️" },       { emoji: "🙏", label: "Thank you",correct: true,  response: "Anytime!" },        { emoji: "🚶", label: "Ignore", correct: false, response: "..." }] },
    { name: "Friend",     emoji: "🧒",  greeting: "Hey! Come play!",   choices: [{ emoji: "😊", label: "Sure!",      correct: true,  response: "Awesome! 🎈" },          { emoji: "👋", label: "Wave",     correct: true,  response: "Let's go!" },       { emoji: "🚶", label: "Ignore", correct: false, response: "..." }] },
    { name: "Auntie",     emoji: "👩",  greeting: "Hello dear!",       choices: [{ emoji: "👋", label: "Hello!",     correct: true,  response: "So polite! 💛" },        { emoji: "🙂", label: "Smile",    correct: true,  response: "Sweet!" },          { emoji: "🚶", label: "Ignore", correct: false, response: "..." }] },
  ],
  home: [
    { name: "Mum",     emoji: "👩",  greeting: "Good morning!",      choices: [{ emoji: "🤗", label: "Hug",        correct: true,  response: "Love you! 💕" },         { emoji: "👋", label: "Morning!", correct: true,  response: "Breakfast ready!" }, { emoji: "🚶", label: "Ignore", correct: false, response: "..." }] },
    { name: "Dad",     emoji: "👨",  greeting: "How are you?",       choices: [{ emoji: "😊", label: "I'm good!",  correct: true,  response: "Great! 🌟" },            { emoji: "🙂", label: "Smile",    correct: true,  response: "Good to hear!" },   { emoji: "🚶", label: "Ignore", correct: false, response: "..." }] },
    { name: "Grandma", emoji: "👵",  greeting: "Come sit with me!",  choices: [{ emoji: "🤗", label: "Join her",   correct: true,  response: "So happy! 🌸" },         { emoji: "😊", label: "Smile",    correct: true,  response: "Lovely!" },         { emoji: "🚶", label: "Ignore", correct: false, response: "..." }] },
    { name: "Grandpa", emoji: "👴",  greeting: "Good morning!",      choices: [{ emoji: "👋", label: "Morning!",   correct: true,  response: "Wonderful! ⭐" },         { emoji: "🤗", label: "Hug",      correct: true,  response: "My dear!" },        { emoji: "🚶", label: "Ignore", correct: false, response: "..." }] },
  ],
};

const ENV_CFG: Record<EnvMode, { bg: string; ground: string; path: string; sky: string[]; buildings: string[] }> = {
  school:  { bg: "from-sky-300 via-sky-100 to-yellow-50",    ground: "bg-green-300",  path: "bg-amber-200",  sky: ["☁️","☁️","🌤️","☁️","🌤️"], buildings: ["🏫","🌳","🌳","🏫","🌳","📚","🌳","🏫"] },
  outside: { bg: "from-sky-400 via-sky-200 to-green-100",    ground: "bg-green-400",  path: "bg-yellow-100", sky: ["☁️","🌤️","☁️","🌈","☁️"], buildings: ["🌳","🌻","🏠","🌳","🌻","🌳","🏡","🌳"] },
  home:    { bg: "from-orange-200 via-yellow-100 to-pink-50", ground: "bg-orange-200", path: "bg-orange-100", sky: ["🌙","⭐","🌟","⭐","🌙"],  buildings: ["🏠","🪴","🛋️","🏠","🌿","🪴","🏠","🌿"] },
};

function pickNpc(env: EnvMode, exclude: string): NPCTemplate {
  const pool = ALL_NPCS[env].filter(n => n.name !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export const GreetingRun = ({ onComplete, onBack, worldId, levelId }: Props) => {
  const [scene, setScene] = useState<Scene>("game");
  const [env, setEnv] = useState<EnvMode>("school");
  const [npcX, setNpcX] = useState(95);
  const [currentNpc, setCurrentNpc] = useState<NPCTemplate>(() => pickNpc("school", ""));
  const [interacting, setInteracting] = useState(false);
  const [responseText, setResponseText] = useState<string | null>(null);
  const [stats, setStats] = useState({ greetings: 0, friendship: 0, xp: 0, streak: 0 });
  const [lumioHint, setLumioHint] = useState<string | null>(null);
  const [resultTitle, setResultTitle] = useState("Friendly Starter");
  const [showIntro, setShowIntro] = useState(true);
  const [bgOffset, setBgOffset] = useState(0);
  const [playerAnim, setPlayerAnim] = useState(false); // walking legs anim
  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const envRef = useRef(env);
  envRef.current = env;

  useEffect(() => {
    // do not auto-dismiss — wait for user to click Start
  }, []);

  // main game loop — world scrolls, NPC comes toward player
  useEffect(() => {
    if (scene !== "game" || showIntro) return;
    loopRef.current = setInterval(() => {
      if (interacting) return;
      setBgOffset(p => (p + BG_SPEED) % 100);
      setPlayerAnim(p => !p);
      setNpcX(prev => {
        const next = prev - NPC_SPEED;
        if (next <= PLAYER_X + MEET_THRESHOLD) {
          setInteracting(true);
          return PLAYER_X + MEET_THRESHOLD;
        }
        return next;
      });
    }, 50);
    return () => { if (loopRef.current) clearInterval(loopRef.current); };
  }, [scene, interacting, showIntro]);

  const handleChoice = useCallback((choice: Choice) => {
    const xpGain = currentNpc.name.includes("Ms.") || currentNpc.name.includes("Mr.") ? 20 : 10;
    setResponseText(choice.response);

    if (choice.correct) {
      setStats(prev => {
        const next = { greetings: prev.greetings + 1, friendship: prev.friendship + 10, xp: prev.xp + xpGain, streak: prev.streak + 1 };
        if (next.greetings >= GOAL) {
          setResultTitle(next.streak >= 6 ? "Hallway Hero" : "Social Explorer");
          setTimeout(() => setScene("results"), 1200);
        }
        return next;
      });
    } else {
      if (hintRef.current) clearTimeout(hintRef.current);
      setLumioHint("That's okay — kindness always wins 💛");
      hintRef.current = setTimeout(() => setLumioHint(null), 2500);
    }

    setTimeout(() => {
      setResponseText(null);
      setInteracting(false);
      setCurrentNpc(pickNpc(envRef.current, currentNpc.name));
      setNpcX(95);
    }, 1400);
  }, [currentNpc]);

  const progress = Math.min(100, Math.round((stats.greetings / GOAL) * 100));
  const cfg = ENV_CFG[env];

  // ── RESULTS ──
  if (scene === "results") {
    const stars = stats.streak >= 6 ? 3 : stats.greetings >= GOAL ? 2 : 1;
    return (
      <div className="w-full animate-scale-in">
        <div className="bg-card border-4 border-foreground rounded-[2rem] shadow-pop-lg p-8 max-w-lg mx-auto text-center relative overflow-hidden">
          <div className="absolute top-3 right-5 text-4xl animate-float opacity-60">🎉</div>
          <div className="absolute bottom-3 left-5 text-3xl animate-bounce-slow opacity-60">⭐</div>

          {/* header */}
          <div className="w-20 h-20 rounded-full bg-secondary border-4 border-foreground shadow-pop mx-auto mb-4 flex items-center justify-center text-4xl animate-bounce-slow">🏆</div>
          <h2 className="text-3xl font-black tracking-tight mb-1">Greeting Run Complete!</h2>
          <p className="text-lg font-bold text-muted-foreground mb-5">{resultTitle}</p>

          {/* stars */}
          <div className="flex justify-center gap-2 mb-6">
            {[1,2,3].map(i => (
              <Star key={i} className={`w-10 h-10 ${i <= stars ? "fill-secondary text-secondary animate-bounce-slow" : "fill-muted text-muted"}`}
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>

          {/* stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { emoji: "⭐", label: "Greetings",        val: stats.greetings, bg: "bg-primary text-primary-foreground" },
              { emoji: "💛", label: "Friendship Points", val: stats.friendship, bg: "bg-secondary text-secondary-foreground" },
              { emoji: "🏆", label: "Social XP",         val: stats.xp,        bg: "bg-accent text-accent-foreground" },
              { emoji: "🎯", label: "Streak",            val: stats.streak,    bg: "bg-primary text-primary-foreground" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl border-2 border-foreground p-3 text-center shadow-pop-sm`}>
                <div className="text-2xl mb-1">{s.emoji}</div>
                <div className="text-2xl font-black">{s.val}</div>
                <div className="text-xs font-bold opacity-80">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Lumio quote */}
          <div className="bg-primary/10 border-2 border-primary rounded-2xl p-4 mb-5 text-left">
            <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">✨ Lumio</p>
            <p className="font-bold text-foreground">"Amazing work! You made many friendly connections today."</p>
          </div>

          {/* unlock */}
          <div className="bg-secondary border-2 border-foreground rounded-2xl p-3 mb-6 text-center shadow-pop-sm">
            <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">🔓 Next Level Unlocked</p>
            <p className="font-black text-lg">Share Dash</p>
          </div>

          {/* buttons */}
          <div className="flex flex-col gap-3">
            <Button size="lg" className="rounded-2xl px-8 h-14 text-base font-black border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all w-full"
              onClick={() => onComplete(stars, stats.xp)}>
              Next Level — Share Dash <ArrowRight className="ml-2 w-5 h-5" />
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
    <div className="w-full flex flex-col gap-4 animate-fade-up relative">

      {/* Lumio intro overlay */}
      {showIntro && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm rounded-[2rem]">
          <div className="flex flex-col items-center gap-5 text-center px-8 animate-fade-up max-w-sm w-full">
            <div className="w-20 h-20 rounded-full bg-primary border-4 border-foreground shadow-pop-lg flex items-center justify-center text-4xl animate-bounce-slow">✨</div>
            <div className="bg-card border-4 border-foreground rounded-[2rem] p-5 shadow-pop-lg w-full text-left">
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">How to Play</p>
              <ul className="space-y-2.5">
                {[
                  { emoji: "🧑", text: "You are the character on the left" },
                  { emoji: "🚶", text: "Characters walk toward you from the right" },
                  { emoji: "💬", text: "When they arrive, a greeting bubble appears" },
                  { emoji: "👋", text: "Tap a response to greet them" },
                  { emoji: "⭐", text: "Greet 8 characters to complete the level" },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3 text-sm font-semibold">
                    <span className="text-xl flex-shrink-0">{item.emoji}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => setShowIntro(false)}
              className="w-full bg-secondary text-secondary-foreground border-4 border-foreground rounded-2xl px-8 py-4 text-lg font-black shadow-pop-lg hover:shadow-pop hover:-translate-y-1 transition-all">
              Start the Game 🎮
            </button>
          </div>
        </div>
      )}

      {/* HUD */}
      <div className="flex items-center justify-between bg-card border-4 border-foreground rounded-[1.5rem] px-4 py-3 shadow-pop flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-foreground text-xs font-black shadow-pop-sm bg-muted hover:-translate-y-0.5 transition-all">
            &larr; World Map
          </button>
          {(["school","outside","home"] as EnvMode[]).map(m => (
            <button key={m} onClick={() => { setEnv(m); setCurrentNpc(pickNpc(m, "")); setNpcX(95); setInteracting(false); }}
              className={`px-3 py-1.5 rounded-full border-2 border-foreground text-xs font-black shadow-pop-sm transition-all hover:-translate-y-0.5 ${env === m ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {m === "school" ? "🏫" : m === "outside" ? "🌳" : "🏠"} {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="font-black text-sm">⭐ {stats.greetings}/{GOAL}</span>
          <span className="font-black text-sm">💛 {stats.friendship}</span>
          <span className="font-black text-sm">🏆 {stats.xp} XP</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-4 bg-muted rounded-full border-2 border-foreground overflow-hidden shadow-pop-sm">
        <div className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${Math.max(4, progress)}%` }} />
      </div>

      {/* ── GAME WORLD ── */}
      <div className={`relative w-full rounded-[2rem] border-4 border-foreground shadow-pop-lg overflow-hidden bg-gradient-to-b ${cfg.bg}`}
        style={{ height: 380 }}>

        {/* Sky — scrolling clouds */}
        {cfg.sky.map((e, i) => (
          <span key={i} className="absolute text-4xl pointer-events-none select-none"
            style={{ top: `${6 + (i % 3) * 10}%`, left: `${((i * 22 - bgOffset * 0.4) % 120) - 10}%`, opacity: 0.7, transition: "left 0.05s linear" }}>
            {e}
          </span>
        ))}

        {/* Background buildings / trees — scrolling */}
        {cfg.buildings.map((e, i) => (
          <span key={i} className="absolute text-5xl pointer-events-none select-none"
            style={{ bottom: "22%", left: `${((i * 14 - bgOffset * 0.6) % 120) - 8}%`, opacity: 0.6, transition: "left 0.05s linear" }}>
            {e}
          </span>
        ))}

        {/* Ground */}
        <div className={`absolute bottom-0 left-0 right-0 h-24 ${cfg.ground}`} />

        {/* Path / road */}
        <div className={`absolute bottom-16 left-0 right-0 h-10 ${cfg.path} border-y-4 border-foreground/20`} />

        {/* Road dashes — scrolling */}
        {[0,1,2,3,4,5,6,7,8,9].map(i => (
          <div key={i} className="absolute h-2 w-10 bg-white/40 rounded-full"
            style={{ bottom: "5.2rem", left: `${((i * 12 - bgOffset * 0.8) % 120) - 5}%`, transition: "left 0.05s linear" }} />
        ))}

        {/* NPC — walks in from right */}
        <div className="absolute bottom-16 flex flex-col items-center gap-1"
          style={{ left: `${npcX}%`, transform: "translateX(-50%)", transition: interacting ? "none" : "left 0.05s linear" }}>

          <div className={`text-6xl ${interacting ? "animate-bounce-slow" : ""}`}
            style={{ transform: "scaleX(-1)" }}>
            {currentNpc.emoji}
          </div>
          <div className="text-xs font-black bg-card border-2 border-foreground rounded-full px-3 py-1 shadow-pop-sm whitespace-nowrap">
            {currentNpc.name}
          </div>

          {/* Greeting bubble */}
          {interacting && !responseText && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-card border-4 border-foreground rounded-[1.5rem] p-4 shadow-pop-lg z-30 animate-scale-in"
              style={{ minWidth: 230, maxWidth: 300 }}>
              <p className="font-bold text-sm text-center mb-3">"{currentNpc.greeting}"</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {currentNpc.choices.map(c => (
                  <button key={c.label} onClick={() => handleChoice(c)}
                    className="flex items-center gap-1.5 bg-background border-2 border-foreground rounded-full px-3 py-2 text-sm font-black shadow-pop-sm hover:-translate-y-1 hover:bg-primary hover:text-primary-foreground transition-all">
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Response */}
          {responseText && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-secondary border-2 border-foreground rounded-2xl px-4 py-2 text-sm font-bold shadow-pop whitespace-nowrap animate-fade-up z-20">
              {responseText}
            </div>
          )}
        </div>

        {/* Player — fixed position, walking animation */}
        <div className="absolute bottom-16 flex flex-col items-center gap-1"
          style={{ left: `${PLAYER_X}%`, transform: "translateX(-50%)" }}>
          <div className={`text-6xl ${!interacting ? (playerAnim ? "translate-y-0" : "-translate-y-1") : "animate-pulse-soft"} transition-transform duration-100`}>
            🧑
          </div>
          <div className="text-xs font-black bg-primary text-primary-foreground border-2 border-foreground rounded-full px-3 py-1 shadow-pop-sm">
            You
          </div>
        </div>

        {/* Lumio hint */}
        {lumioHint && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-2 border-foreground rounded-2xl px-4 py-2 text-sm font-bold shadow-pop z-40 animate-fade-up whitespace-nowrap">
            ✨ {lumioHint}
          </div>
        )}

        {/* Milestone pop */}
        {stats.greetings > 0 && responseText && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
            <div className="text-4xl font-black animate-scale-in drop-shadow-lg">
              {stats.greetings === 3 ? "🌟 Halfway there!" : stats.greetings === 6 ? "⭐ Almost done!" : ""}
            </div>
          </div>
        )}
      </div>

      {/* Lumio guide bar */}
      <div className="bg-card border-4 border-foreground rounded-[1.5rem] px-4 py-4 shadow-pop">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary border-2 border-foreground flex items-center justify-center text-xl flex-shrink-0 animate-pulse-soft">✨</div>
          <p className="text-sm font-bold text-muted-foreground flex-1">
            {stats.greetings === 0 ? "Characters walk toward you — tap a response when the bubble appears!" :
             stats.greetings < 4  ? `Great start! ${GOAL - stats.greetings} more greetings to go!` :
             stats.greetings < 7  ? "You're on a roll! Keep greeting everyone!" :
             "One more — you're incredible! ⭐"}
          </p>
          <span className="text-sm font-black text-primary whitespace-nowrap">{stats.greetings}/{GOAL}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { emoji: "🚶", text: "Characters walk toward you" },
            { emoji: "💬", text: "Bubble appears when they arrive" },
            { emoji: "👋", text: "Tap a response to greet them" },
          ].map(item => (
            <div key={item.text} className="flex flex-col items-center gap-1 bg-muted rounded-xl p-2 text-center">
              <span className="text-xl">{item.emoji}</span>
              <span className="text-xs font-semibold text-muted-foreground leading-tight">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
