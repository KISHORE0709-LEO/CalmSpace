import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

interface Msg { role: "user" | "mitra"; text: string; }

const initial: Msg[] = [
  { role: "mitra", text: "Hi friend 🌼 I'm Mitra. I noticed you might be feeling a little worried. Want to talk about it?" },
];

const suggestions = ["I feel anxious", "Help me calm down", "I had a hard day", "Tell me a story"];

const Mitra = () => {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "mitra", text: "Thank you for sharing that with me. Let's take a slow breath together — in for four, out for four. I'm right here. 💙" },
    ]);
    setInput("");
  };

  return (
    <AppShell title="Mitra" subtitle="Your gentle companion — always ready to listen.">
      <div className="calm-card p-0 overflow-hidden flex flex-col h-[70vh]">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-primary-soft/40">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold">Mitra</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" /> Listening with care
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-4 py-3 rounded-[1rem] text-sm font-medium border-2 border-foreground shadow-pop-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-border bg-card">
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
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type how you feel..."
              className="flex-1 px-4 py-3 rounded-full border-2 border-foreground bg-background text-sm font-semibold shadow-pop-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
            <Button type="submit" size="icon" className="rounded-full w-12 h-12">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
};

export default Mitra;
