import { useState, useEffect, useRef } from "react";
import { Send, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MessageType = {
  id: string;
  senderName: string;
  senderRole: "parent" | "caregiver" | "doctor";
  content: string;
  timestamp: Date;
  isSelf: boolean;
};

interface ChatWorkspaceProps {
  threadId: string;
  threadName: string;
  currentRole: "parent" | "caregiver" | "doctor";
}

// Mock initial messages
const mockMessages: Record<string, MessageType[]> = {
  "parent_caregiver": [
    { id: "1", senderName: "Sarah Jenkins", senderRole: "caregiver", content: "Hi! The session went really well today. We focused on emotional regulation.", timestamp: new Date(Date.now() - 3600000), isSelf: false },
    { id: "2", senderName: "You", senderRole: "parent", content: "That's great to hear! Did any specific triggers come up?", timestamp: new Date(Date.now() - 3500000), isSelf: true },
  ],
  "parent_doctor": [
    { id: "3", senderName: "Dr. Mehta", senderRole: "doctor", content: "I've reviewed the latest LSTM risk scores. Everything looks stable.", timestamp: new Date(Date.now() - 7200000), isSelf: false },
    { id: "4", senderName: "You", senderRole: "parent", content: "Thank you doctor. Should we adjust any routines?", timestamp: new Date(Date.now() - 7100000), isSelf: true },
  ],
  "caregiver_doctor": [
    { id: "5", senderName: "Sarah Jenkins", senderRole: "caregiver", content: "Dr. Mehta, I noticed elevated stress during the transition to lunchtime today.", timestamp: new Date(Date.now() - 1800000), isSelf: true },
    { id: "6", senderName: "Dr. Mehta", senderRole: "doctor", content: "Noted. Let's try incorporating the sensory timeout before transitions tomorrow.", timestamp: new Date(Date.now() - 1700000), isSelf: false },
  ]
};

export const ChatWorkspace = ({ threadId, threadName, currentRole }: ChatWorkspaceProps) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // In a real app, this is where we'd establish the WebSocket connection for this thread
    // and load historical messages.
    setMessages(mockMessages[threadId] || []);
  }, [threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: MessageType = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: "You",
      senderRole: currentRole,
      content: inputValue,
      timestamp: new Date(),
      isSelf: true
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
    
    // In a real app, send via WebSocket
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "parent": return "bg-primary text-primary-foreground";
      case "caregiver": return "bg-secondary text-secondary-foreground";
      case "doctor": return "bg-accent text-accent-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col h-[600px] border-2 border-foreground rounded-xl shadow-pop-sm overflow-hidden bg-background">
      {/* Chat Header */}
      <div className="border-b-2 border-foreground p-4 bg-muted/50 flex items-center justify-between">
        <h3 className="font-black text-lg">{threadName}</h3>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500 shadow-pop-sm animate-pulse" />
          <span className="text-sm font-bold text-muted-foreground">Connected</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-60">
            <UserCircle2 size={48} className="mb-4" />
            <p className="font-bold">No messages yet.</p>
            <p className="text-sm">Start the conversation below.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-bold text-sm">{msg.senderName}</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-foreground ${getRoleBadgeColor(msg.senderRole)}`}>
                  {msg.senderRole}
                </span>
              </div>
              <div className={`max-w-[80%] p-3 rounded-2xl border-2 border-foreground shadow-pop-sm text-[15px] leading-relaxed ${msg.isSelf ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card text-card-foreground rounded-tl-sm'}`}>
                {msg.content}
              </div>
              <span className="text-xs text-muted-foreground mt-1 font-medium">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-foreground bg-muted/30 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 h-12 px-4 rounded-xl border-2 border-foreground shadow-pop-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
        />
        <Button type="submit" className="h-12 w-12 rounded-xl border-2 border-foreground shadow-pop-sm p-0 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-1 transition-all">
          <Send size={20} />
        </Button>
      </form>
    </div>
  );
};
