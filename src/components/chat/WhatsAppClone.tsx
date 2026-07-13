import { useState, useRef, useEffect } from "react";
import { Send, UserCircle2, Search, MoreVertical, Phone, Video, Smile as SmileIcon, Paperclip, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type MessageType = {
  id: string;
  senderName: string;
  senderRole: "parent" | "caregiver" | "doctor";
  content: string;
  timestamp: Date;
  isSelf: boolean;
  status: "sent" | "delivered" | "read";
};

export type ThreadType = {
  id: string;
  name: string;
  role: "parent" | "caregiver" | "doctor" | "mixed";
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  avatarColor: string;
};

interface WhatsAppCloneProps {
  currentRole: "parent" | "caregiver" | "doctor";
  threads: ThreadType[];
  initialMessages: Record<string, MessageType[]>;
}

export const WhatsAppClone = ({ currentRole, threads, initialMessages }: WhatsAppCloneProps) => {
  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0]?.id);
  const [messages, setMessages] = useState<Record<string, MessageType[]>>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find(t => t.id === activeThreadId);
  const currentMessages = messages[activeThreadId] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeThreadId) return;

    const newMessage: MessageType = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: "You",
      senderRole: currentRole,
      content: inputValue,
      timestamp: new Date(),
      isSelf: true,
      status: "sent",
    };

    setMessages(prev => ({
      ...prev,
      [activeThreadId]: [...(prev[activeThreadId] || []), newMessage]
    }));
    setInputValue("");
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
    <div className="flex h-[75vh] min-h-[600px] border-2 border-foreground rounded-2xl shadow-pop-lg overflow-hidden bg-background">
      
      {/* LEFT SIDEBAR (Thread List) */}
      <div className="w-[350px] flex-shrink-0 border-r-2 border-foreground flex flex-col bg-muted/20">
        {/* Sidebar Header */}
        <div className="h-16 border-b-2 border-foreground flex items-center justify-between px-4 bg-muted/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-foreground shadow-pop-sm ${getRoleBadgeColor(currentRole)}`}>
              <UserCircle2 size={24} />
            </div>
            <span className="font-black text-lg capitalize">{currentRole}</span>
          </div>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <MoreVertical size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b-2 border-foreground">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search or start new chat" 
              className="pl-10 h-10 rounded-xl border-2 border-foreground shadow-pop-sm focus-visible:ring-primary bg-background"
            />
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <div 
              key={thread.id}
              onClick={() => setActiveThreadId(thread.id)}
              className={`flex items-center gap-3 p-3 cursor-pointer border-b-2 border-foreground/10 transition-colors ${activeThreadId === thread.id ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-foreground flex-shrink-0 shadow-pop-sm ${thread.avatarColor}`}>
                <UserCircle2 size={28} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-base truncate">{thread.name}</h4>
                  {thread.lastMessageTime && (
                    <span className="text-xs font-bold text-muted-foreground whitespace-nowrap ml-2">
                      {thread.lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground truncate font-medium">
                    {messages[thread.id]?.length > 0 ? messages[thread.id][messages[thread.id].length - 1].content : "No messages yet"}
                  </p>
                  {thread.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black shadow-pop-sm ml-2">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE (Active Chat) */}
      <div className="flex-1 flex flex-col bg-[#efeae2] relative">
        {/* WhatsApp Pattern Background Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png")', backgroundSize: '400px' }} />
        
        {activeThread ? (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b-2 border-foreground flex items-center justify-between px-4 bg-muted/80 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-foreground shadow-pop-sm ${activeThread.avatarColor}`}>
                  <UserCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-black text-lg">{activeThread.name}</h3>
                  <p className="text-xs font-bold text-green-600">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <button className="hover:text-foreground transition-colors"><Video size={20} /></button>
                <button className="hover:text-foreground transition-colors"><Phone size={20} /></button>
                <button className="hover:text-foreground transition-colors"><Search size={20} /></button>
                <button className="hover:text-foreground transition-colors"><MoreVertical size={20} /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10 scrollbar-thin scrollbar-thumb-foreground/20">
              {currentMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <div className="bg-background/80 p-4 rounded-xl border-2 border-foreground shadow-pop-sm text-center font-bold">
                    This is the start of your conversation with {activeThread.name}.
                  </div>
                </div>
              ) : (
                currentMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isSelf ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl border-2 border-foreground shadow-pop-sm text-[15px] relative group ${
                      msg.isSelf 
                        ? 'bg-[#d9fdd3] text-foreground rounded-tr-sm' 
                        : 'bg-background text-foreground rounded-tl-sm'
                    }`}>
                      {!msg.isSelf && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-xs text-primary">{msg.senderName}</span>
                          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border border-foreground ${getRoleBadgeColor(msg.senderRole)}`}>
                            {msg.senderRole}
                          </span>
                        </div>
                      )}
                      
                      <div className="font-medium pr-12 leading-relaxed">{msg.content}</div>
                      
                      <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground/70">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.isSelf && (
                          <span className="text-blue-500">
                            {msg.status === 'read' ? <CheckCheck size={14} /> : <Check size={14} />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-muted/80 backdrop-blur-sm border-t-2 border-foreground flex items-end gap-3 z-10">
              <button type="button" className="p-3 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <SmileIcon size={24} />
              </button>
              <button type="button" className="p-3 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                <Paperclip size={24} />
              </button>
              
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message"
                className="flex-1 h-12 rounded-xl border-2 border-foreground shadow-pop-sm focus-visible:ring-primary bg-background text-base px-4"
              />
              
              <Button type="submit" className="h-12 w-12 rounded-xl border-2 border-foreground shadow-pop-sm p-0 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary-hover shrink-0 transition-transform hover:-translate-y-1">
                <Send size={20} />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground z-10">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center border-2 border-foreground/20 mb-6">
              <UserCircle2 size={48} className="opacity-50" />
            </div>
            <h2 className="text-2xl font-black mb-2">WhatsApp for CalmSpace</h2>
            <p className="font-medium text-lg text-center max-w-sm">Select a chat from the sidebar to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};
