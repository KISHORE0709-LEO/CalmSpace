import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
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

const Mitra = () => {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [replyIndex, setReplyIndex] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((m) => [...m, { role: "mitra", text: mitraReplies[replyIndex % mitraReplies.length] }]);
      setReplyIndex((i) => i + 1);
    }, 1500);
  };

  return (
    <AppShell title="Mitra" subtitle="Your gentle companion — always ready to listen.">
      <div className="calm-card p-0 overflow-hidden flex flex-col h-[70vh] relative">

        {/* header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-accent border-b-2 border-foreground">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-primary border-2 border-foreground flex items-center justify-center shadow-pop-sm animate-pulse-soft">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <div className="font-black text-base tracking-tight">Mitra</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Listening with care
            </div>
          </div>
          <div className="ml-auto flex gap-1">
            {["💙","🌸","✨"].map((e, i) => (
              <span key={i} className="text-lg animate-float opacity-60" style={{ animationDelay: `${i * 0.5}s` }}>{e}</span>
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
                <div className="w-8 h-8 rounded-full bg-primary border-2 border-foreground flex items-center justify-center mr-2 flex-shrink-0 self-end shadow-pop-sm">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[75%] px-4 py-3 rounded-[1rem] text-sm font-medium border-2 border-foreground shadow-pop-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-card rounded-bl-sm"
              }`}>
                {m.text}
              </div>
            </div>
          ))}

          {/* typing indicator */}
          {isTyping && (
            <div className="flex justify-start" style={{ animation: "fade-up 0.3s ease forwards" }}>
              <div className="w-8 h-8 rounded-full bg-primary border-2 border-foreground flex items-center justify-center mr-2 flex-shrink-0 self-end shadow-pop-sm">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-card border-2 border-foreground rounded-[1rem] rounded-bl-sm px-4 py-3 shadow-pop-sm flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* input */}
        <div className="px-6 py-3 border-t-2 border-foreground bg-card">
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="px-3 py-1.5 text-xs rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-bold transition-all border-2 border-foreground shadow-pop-sm hover:-translate-y-[1px] hover:shadow-pop"
              >
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type how you feel..."
              className="flex-1 px-4 py-3 rounded-full border-2 border-foreground bg-background text-sm font-semibold shadow-pop-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            <Button type="submit" size="icon" className="rounded-full w-12 h-12 hover:scale-110 transition-transform">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
};

export default Mitra;
