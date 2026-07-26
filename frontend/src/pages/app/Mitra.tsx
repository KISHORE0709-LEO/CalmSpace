import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic, History, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

interface Msg { role: "user" | "mitra"; text: string; }

const initial: Msg[] = [
  { role: "mitra", text: "Hi friend 🌼 I'm Mitra. I noticed you might be feeling a little worried. Want to talk about it?" },
];

const suggestions = ["I feel anxious", "Help me calm down", "I had a hard day", "Tell me a story"];

const mitraReplies = [
  "Thank you for sharing that with me. Let's take a slow breath together — in for four, out for four. I'm right here. 💙",
  "That sounds really tough. You're so brave for talking about it. Want to try a calming activity together? 🌸",
  "I hear you. Your feelings are completely valid. Let's take this one gentle step at a time. ✨",
  "You're doing amazing just by being here. Let's breathe together — in... and out. 🌬️",
];

const mockHistory = [
  { id: "1", title: "Feeling anxious about school", date: "Today, 10:30 AM", active: true },
  { id: "2", title: "Talking about my favorite toy", date: "Yesterday" },
  { id: "3", title: "Breathing exercise session", date: "2 days ago" },
  { id: "4", title: "Story time: The brave star", date: "Last week" },
  { id: "5", title: "I feel sad", date: "Last week" },
];

const Mitra = () => {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyIndex, setReplyIndex] = useState(0);
  const [characterId, setCharacterId] = useState(1);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setIsTyping(true);
    setCharacterId((prev) => (prev % 18) + 1);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages((m) => [...m, { role: "mitra", text: mitraReplies[replyIndex % mitraReplies.length] }]);
      setReplyIndex((i) => i + 1);
    }, 1500);
  };

  return (
    <>
      {/* Large Character fixed on the right side */}
      <div className="fixed bottom-0 right-0 w-[25vw] max-w-[400px] h-[80vh] pointer-events-none z-0 flex items-end justify-center pr-8 pb-8 hidden lg:flex">
        <img 
          src={`/photos/${characterId}.png`} 
          alt="Companion Character"
          className={`w-full h-auto object-contain transition-all duration-700 ease-in-out ${isTyping ? "animate-spline-talk" : "animate-spline-idle"}`}
          style={{ 
            mixBlendMode: 'normal',
            filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.15))", 
            transformOrigin: "bottom center" 
          }}
        />
      </div>

      <AppShell title="Mitra" subtitle="Your gentle companion — always ready to listen." fullWidth>
        <div className="flex flex-col lg:flex-row gap-8 relative z-10 h-[75vh] w-full">
          
          {/* Left Sidebar: Chat History */}
          <div className="w-full lg:w-1/5 calm-card p-5 overflow-hidden flex flex-col bg-card/95 backdrop-blur hidden md:flex h-full">
            <h3 className="font-black text-xl mb-4 flex items-center gap-2 text-foreground">
              <History className="w-5 h-5 text-blue-500" /> Recent Chats
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              <Button className="w-full mb-4 bg-primary text-primary-foreground font-black border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-all rounded-xl">
                + New Chat
              </Button>
              {mockHistory.map(item => (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                    item.active 
                      ? 'bg-blue-100 border-blue-400 shadow-sm' 
                      : 'bg-muted/50 border-transparent hover:border-foreground/30 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <MessageCircle className={`w-5 h-5 mt-0.5 ${item.active ? 'text-blue-600' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-sm truncate ${item.active ? 'text-blue-900' : 'text-foreground'}`}>
                        {item.title}
                      </div>
                      <div className={`text-xs font-semibold mt-1 ${item.active ? 'text-blue-700/70' : 'text-muted-foreground'}`}>
                        {item.date}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Main Area: Chatbot */}
          <div className="w-full lg:w-[60%] calm-card p-0 overflow-hidden flex flex-col h-full bg-card/95 backdrop-blur">
            {/* header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-accent border-b-2 border-foreground">
              <div className="relative">
                <div className="w-12 h-12 flex items-center justify-center overflow-visible">
                  <img 
                    src={`/photos/19.png`} 
                    alt="Avatar"
                    className={`w-full h-full object-contain transition-transform scale-150 drop-shadow-md ${isTyping ? "animate-talking" : ""}`}
                    style={{ mixBlendMode: 'normal' }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-foreground animate-pulse" />
              </div>
              <div>
                <div className="font-black text-base tracking-tight">Mitra</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse border border-foreground/20" /> Listening with care
                </div>
              </div>
              <div className="ml-auto flex gap-1">
                {["💙","🌸","✨"].map((e, i) => (
                  <span key={i} className="text-xl animate-float opacity-80" style={{ animationDelay: `${i * 0.5}s` }}>{e}</span>
                ))}
              </div>
            </div>

            {/* messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/50">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  style={{ animation: "fade-up 0.4s ease forwards", animationDelay: `${i * 0.05}s` }}
                >
                  {m.role === "mitra" && (
                    <div className="w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0 self-end overflow-visible">
                      <img 
                        src={`/photos/19.png`} 
                        alt="Mitra"
                        className={`w-full h-full object-contain transition-transform scale-[1.6] drop-shadow-md ${isTyping ? "animate-talking" : ""}`}
                        style={{ mixBlendMode: 'normal' }}
                      />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-sm font-bold border-2 border-foreground shadow-pop-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-white rounded-bl-sm"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}

              {/* typing indicator */}
              {isTyping && (
                <div className="flex justify-start" style={{ animation: "fade-up 0.3s ease forwards" }}>
                  <div className="w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0 self-end overflow-visible">
                    <img 
                      src={`/photos/19.png`} 
                      alt="Mitra"
                      className="w-full h-full object-contain scale-[1.6] drop-shadow-md animate-talking"
                      style={{ mixBlendMode: 'normal' }}
                    />
                  </div>
                  <div className="bg-white border-2 border-foreground rounded-2xl rounded-bl-sm px-5 py-4 shadow-pop-sm flex items-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-2.5 h-2.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* input */}
            <div className="px-6 py-4 border-t-2 border-foreground bg-white">
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="px-4 py-2 text-xs rounded-full bg-blue-50 hover:bg-blue-100 text-blue-900 font-black transition-all border-2 border-blue-200 hover:border-blue-400 shadow-sm hover:-translate-y-1 hover:shadow-pop-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type how you feel..."
                  className="flex-1 px-5 py-3 rounded-2xl border-2 border-foreground bg-background text-sm font-bold shadow-inner focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <Button type="button" size="icon" variant="secondary" className="rounded-2xl w-12 h-12 border-2 border-foreground shadow-pop-sm hover:scale-105 transition-transform bg-muted">
                  <Mic className="w-5 h-5 text-foreground" />
                </Button>
                <Button type="submit" size="icon" className="rounded-2xl w-12 h-12 hover:scale-105 transition-transform border-2 border-foreground shadow-pop-sm font-black">
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
};

export default Mitra;
