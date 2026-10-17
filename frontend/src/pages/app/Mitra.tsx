import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, History, MessageCircle, Volume2, VolumeX, Radio } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useMitraVoice } from "@/hooks/useMitraVoice";
import { getMitraReply } from "@/lib/mitraReplies";

interface Msg { role: "user" | "mitra"; text: string; }

const initial: Msg[] = [
  { role: "mitra", text: "Hi friend 🌼 I'm Mitra. I'm always here to listen. How are you feeling today?" },
];

const suggestions = ["Someone bullied me", "I feel sad", "Help me calm down", "Tell me a story"];

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
  const [characterId, setCharacterId] = useState(1);
  const [voiceMode, setVoiceMode] = useState(false);
  const [muteVoice, setMuteVoice] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Refs so callbacks never have stale closures
  const voiceModeRef = useRef(false);
  const muteVoiceRef = useRef(false);
  useEffect(() => { voiceModeRef.current = voiceMode; }, [voiceMode]);
  useEffect(() => { muteVoiceRef.current = muteVoice; }, [muteVoice]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // sendMessage ref — lets useMitraVoice call it without stale closure
  const sendMessageRef = useRef<(text: string) => void>(() => {});

  // useMitraVoice MUST be called before sendMessage useCallback
  const { speak, startListening, stopListening, status: voiceStatus, transcript,
    isSpeaking, sttSupported, ttsReady } = useMitraVoice({
    onTranscript: useCallback((text: string) => sendMessageRef.current(text), []),
    enabled: voiceMode,
  });

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: "user", text }]);
    setInput("");
    setIsTyping(true);
    setCharacterId(prev => (prev % 18) + 1);

    if (voiceModeRef.current) stopListening();

    // Small delay so typing indicator shows
    setTimeout(() => {
      const reply = getMitraReply(text);
      setIsTyping(false);
      setMessages(m => [...m, { role: "mitra", text: reply }]);

      // Always speak — voice mode or not (if TTS key is set)
      speak(reply).then(() => {
        if (voiceModeRef.current) startListening();
      });
    }, 1000 + Math.random() * 500);
  }, [speak, startListening, stopListening]);

  // Keep the ref in sync
  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  const toggleVoiceMode = () => {
    if (voiceMode) {
      stopListening();
      setVoiceMode(false);
    } else {
      setVoiceMode(true);
      const lastMitra = [...messages].reverse().find(m => m.role === "mitra");
      if (lastMitra && !muteVoice) {
        speak(lastMitra.text).then(() => startListening());
      } else {
        setTimeout(() => startListening(), 200);
      }
    }
  };

  const voiceStatusLabel: Record<string, string> = {
    idle: "Voice ready",
    listening: "🎙️ Listening…",
    processing: "Thinking…",
    speaking: "🔊 Mitra is speaking…",
  };

  const voiceStatusColor: Record<string, string> = {
    idle: "bg-gray-100 border-gray-300 text-gray-600",
    listening: "bg-green-100 border-green-400 text-green-800 animate-pulse",
    processing: "bg-amber-100 border-amber-400 text-amber-800",
    speaking: "bg-blue-100 border-blue-400 text-blue-800",
  };

  return (
    <>
      <div className="fixed bottom-0 right-0 w-[25vw] max-w-[400px] h-[80vh] pointer-events-none z-0 items-end justify-center pr-8 pb-8 hidden lg:flex">
        <img
          src={`/photos/${characterId}.png`}
          alt="Companion Character"
          className={`w-full h-auto object-contain transition-all duration-700 ease-in-out ${isTyping || isSpeaking ? "animate-spline-talk" : "animate-spline-idle"}`}
          style={{ filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.15))", transformOrigin: "bottom center" }}
        />
      </div>

      <AppShell title="Mitra" subtitle="Your gentle companion — always ready to listen." fullWidth>
        <div className="flex flex-col lg:flex-row gap-8 relative z-10 h-[75vh] w-full">

          {/* Left Sidebar */}
          <div className="w-full lg:w-1/5 calm-card p-5 overflow-hidden flex-col bg-card/95 backdrop-blur hidden md:flex h-full">
            <h3 className="font-black text-xl mb-4 flex items-center gap-2 text-foreground">
              <History className="w-5 h-5 text-blue-500" /> Recent Chats
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              <Button className="w-full mb-4 bg-primary text-primary-foreground font-black border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-all rounded-xl">
                + New Chat
              </Button>
              {mockHistory.map(item => (
                <div key={item.id} className={`p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                  item.active ? "bg-blue-100 border-blue-400 shadow-sm" : "bg-muted/50 border-transparent hover:border-foreground/30 hover:bg-muted"
                }`}>
                  <div className="flex items-start gap-3">
                    <MessageCircle className={`w-5 h-5 mt-0.5 ${item.active ? "text-blue-600" : "text-muted-foreground group-hover:text-foreground"}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-sm truncate ${item.active ? "text-blue-900" : "text-foreground"}`}>{item.title}</div>
                      <div className={`text-xs font-semibold mt-1 ${item.active ? "text-blue-700/70" : "text-muted-foreground"}`}>{item.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="w-full lg:w-[60%] calm-card p-0 overflow-hidden flex flex-col h-full bg-card/95 backdrop-blur">

            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-accent border-b-2 border-foreground">
              <div className="relative">
                <div className="w-12 h-12 flex items-center justify-center overflow-visible">
                  <img src="/photos/19.png" alt="Avatar"
                    className={`w-full h-full object-contain transition-transform scale-150 drop-shadow-md ${isTyping || isSpeaking ? "animate-talking" : ""}`}
                    style={{ mixBlendMode: "normal" }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-foreground animate-pulse" />
              </div>
              <div>
                <div className="font-black text-base tracking-tight">Mitra</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse border border-foreground/20" />
                  {voiceMode ? voiceStatusLabel[voiceStatus] : "Listening with care"}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                {voiceMode && (
                  <button onClick={() => setMuteVoice(m => !m)}
                    title={muteVoice ? "Unmute Mitra's voice" : "Mute Mitra's voice"}
                    className={`p-2 rounded-xl border-2 border-foreground transition-all shadow-pop-sm ${muteVoice ? "bg-gray-200 text-gray-500" : "bg-blue-100 text-blue-700"}`}>
                    {muteVoice ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}
                <button onClick={toggleVoiceMode}
                  title={voiceMode ? "Turn off voice conversation" : "Start voice conversation"}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-foreground font-black text-xs transition-all shadow-pop-sm ${
                    voiceMode ? "bg-green-500 text-white" : "bg-background text-foreground hover:bg-green-50"
                  }`}>
                  <Radio className={`w-4 h-4 ${voiceMode ? "animate-pulse" : ""}`} />
                  {voiceMode ? "Voice ON" : "Voice"}
                </button>
              </div>
            </div>

            {/* Voice status bar */}
            {voiceMode && (
              <div className={`px-6 py-2 border-b-2 border-foreground flex items-center gap-3 text-xs font-black transition-all ${voiceStatusColor[voiceStatus]}`}>
                {voiceStatus === "listening" && (
                  <div className="flex gap-1 items-end">
                    {[8, 14, 10, 16].map((h, i) => (
                      <div key={i} className="w-1 bg-green-500 rounded-full animate-bounce"
                        style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                )}
                <span>{voiceStatusLabel[voiceStatus]}</span>
                {transcript && voiceStatus === "listening" && (
                  <span className="ml-2 text-green-700 font-bold italic truncate max-w-[60%]">"{transcript}"</span>
                )}
                {!sttSupported && <span className="text-amber-700">⚠️ Use Chrome for mic support</span>}
                {!ttsReady && <span className="text-amber-700 ml-auto">⚠️ Add ElevenLabs key for Mitra's voice</span>}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  style={{ animation: "fade-up 0.4s ease forwards", animationDelay: `${i * 0.05}s` }}>
                  {m.role === "mitra" && (
                    <div className="w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0 self-end overflow-visible">
                      <img src="/photos/19.png" alt="Mitra"
                        className={`w-full h-full object-contain transition-transform scale-[1.6] drop-shadow-md ${isSpeaking ? "animate-talking" : ""}`}
                        style={{ mixBlendMode: "normal" }}
                      />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-sm font-bold border-2 border-foreground shadow-pop-sm leading-relaxed ${
                    m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-white rounded-bl-sm"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start" style={{ animation: "fade-up 0.3s ease forwards" }}>
                  <div className="w-10 h-10 flex items-center justify-center mr-3 flex-shrink-0 self-end overflow-visible">
                    <img src="/photos/19.png" alt="Mitra"
                      className="w-full h-full object-contain scale-[1.6] drop-shadow-md animate-talking"
                      style={{ mixBlendMode: "normal" }}
                    />
                  </div>
                  <div className="bg-white border-2 border-foreground rounded-2xl rounded-bl-sm px-5 py-4 shadow-pop-sm flex items-center gap-2">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-2.5 h-2.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="px-6 py-4 border-t-2 border-foreground bg-white">
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map(s => (
                  <button key={s} onClick={() => sendMessage(s)}
                    className="px-4 py-2 text-xs rounded-full bg-blue-50 hover:bg-blue-100 text-blue-900 font-black transition-all border-2 border-blue-200 hover:border-blue-400 shadow-sm hover:-translate-y-1 hover:shadow-pop-sm">
                    {s}
                  </button>
                ))}
              </div>
              <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-3">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={voiceMode && voiceStatus === "listening" ? "Speaking… (or type here)" : "Type how you feel…"}
                  className="flex-1 px-5 py-3 rounded-2xl border-2 border-foreground bg-background text-sm font-bold shadow-inner focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <Button type="button" size="icon"
                  onClick={() => voiceStatus === "listening" ? stopListening() : startListening()}
                  title={voiceStatus === "listening" ? "Stop listening" : "Tap to speak"}
                  className={`rounded-2xl w-12 h-12 border-2 border-foreground shadow-pop-sm hover:scale-105 transition-transform ${
                    voiceStatus === "listening" ? "bg-green-500 text-white" : "bg-muted text-foreground"
                  }`}>
                  {voiceStatus === "listening" ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
                </Button>
                <Button type="submit" size="icon"
                  className="rounded-2xl w-12 h-12 hover:scale-105 transition-transform border-2 border-foreground shadow-pop-sm font-black">
                  <Send className="w-5 h-5" />
                </Button>
              </form>
              {voiceMode && (
                <p className="text-center text-xs text-muted-foreground font-bold mt-2">
                  🎙️ Voice conversation active — speak naturally, take your time
                </p>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </>
  );
};

export default Mitra;
