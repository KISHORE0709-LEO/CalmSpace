import { useState, useRef, useEffect } from "react";
import { Send, UserCircle2, Search, MoreVertical, Phone, Video, Smile as SmileIcon, Paperclip, Check, CheckCheck, Users, Plus, X, CheckCircle2, Copy, Stethoscope, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const mockMembers = [
  { id: 1, name: "Dr. Mehta", role: "doctor", status: "active", joined_at: "2026-07-10" },
  { id: 2, name: "Sarah Jenkins", role: "caregiver", status: "pending", invited_at: "2026-07-12" }
];

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
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, MessageType[]>>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Care Circle State
  const [isCareCircleOpen, setIsCareCircleOpen] = useState(false);
  const [members, setMembers] = useState(mockMembers);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<"caregiver" | "doctor">("caregiver");
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const activeThread = activeThreadId ? threads.find(t => t.id === activeThreadId) : null;
  const currentMessages = activeThreadId ? messages[activeThreadId] || [] : [];

  const handleGenerateInvite = () => {
    setInviteCode(Math.random().toString(36).substring(2, 10).toUpperCase());
  };

  const revokeMember = (id: number) => {
    setMembers(members.map(m => m.id === id ? { ...m, status: "revoked" } : m));
  };

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
    <div className="flex h-[calc(100vh-160px)] min-h-[600px] border-2 border-foreground rounded-2xl shadow-pop-lg overflow-hidden bg-background">
      
      {/* LEFT SIDEBAR (Thread List) */}
      <div className="w-[350px] flex-shrink-0 border-r-2 border-foreground flex flex-col bg-muted/20 relative">
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

        {/* Floating Care Circle Button */}
        {currentRole === 'parent' && (
          <button 
            onClick={() => setIsCareCircleOpen(true)}
            className="absolute bottom-6 left-6 px-4 h-14 rounded-full bg-primary text-primary-foreground border-2 border-foreground flex items-center gap-3 shadow-pop-lg hover:-translate-y-1 transition-all z-20 group"
          >
            <HeartPulse size={24} className="group-hover:scale-110 transition-transform" />
            <span className="font-black text-sm tracking-wide">Care Circle</span>
          </button>
        )}
      </div>

      {/* RIGHT SIDE (Active Chat) */}
      <div className="flex-1 flex flex-col bg-[#efeae2] relative">
        {/* Chat Pattern Background Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.2) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
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
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary mb-8 shadow-pop-sm">
              <HeartPulse size={40} className="text-primary" />
            </div>
            
            <h2 className="text-3xl font-black mb-4">Welcome to Secure Chat</h2>
            <p className="text-lg text-muted-foreground max-w-md mb-10">
              This is your direct line to everyone involved in your child's care. Keep everyone on the same page securely.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl text-left">
              <div className="bg-background p-5 rounded-xl border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform">
                <div className="font-black text-primary mb-2 text-lg">1. Select a Thread</div>
                <div className="text-sm font-bold text-muted-foreground leading-relaxed">Click any conversation on the left to securely message doctors and caregivers.</div>
              </div>
              <div className="bg-background p-5 rounded-xl border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform">
                <div className="font-black text-secondary mb-2 text-lg">2. Manage Circle</div>
                <div className="text-sm font-bold text-muted-foreground leading-relaxed">Use the button at the bottom left to generate secure invite codes for new members.</div>
              </div>
              <div className="bg-background p-5 rounded-xl border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform">
                <div className="font-black text-accent mb-2 text-lg">3. Privacy First</div>
                <div className="text-sm font-bold text-muted-foreground leading-relaxed">All messages are strictly scoped to the roles of the participants involved.</div>
              </div>
              <div className="bg-background p-5 rounded-xl border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform">
                <div className="font-black text-foreground mb-2 text-lg">4. Crisis Alerts</div>
                <div className="text-sm font-bold text-muted-foreground leading-relaxed">Automated insights will notify this chat if an anomaly is detected.</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Care Circle Modal */}
      {isCareCircleOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="calm-card p-6 md:p-10 w-full max-w-4xl relative animate-fade-up max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsCareCircleOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full border-2 border-foreground hover:bg-muted transition-colors shadow-pop-sm z-10"
            >
              <X size={24} />
            </button>
            
            <div className="mb-8">
              <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                <HeartPulse className="w-8 h-8 text-primary" />
                Manage Care Circle
              </h2>
              <p className="text-muted-foreground font-medium">Control who has access to your child's data and can communicate with you.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Existing Members */}
              {members.filter(m => m.status !== "revoked").map((member) => (
                <div key={member.id} className={`calm-card p-6 flex flex-col items-center relative ${member.status === 'pending' ? 'opacity-60 bg-muted/50' : ''}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 border-foreground shadow-pop-sm ${member.role === 'doctor' ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                    {member.role === 'doctor' ? <Stethoscope size={28} /> : <Users size={28} />}
                  </div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <span className="text-xs font-black uppercase tracking-wider mb-2 px-2 py-1 rounded-full border-2 border-foreground bg-background">
                    {member.role}
                  </span>
                  
                  {member.status === 'pending' ? (
                    <p className="text-sm text-muted-foreground mb-4">Pending Invite</p>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-4">Active Member</p>
                  )}

                  <button 
                    onClick={() => revokeMember(member.id)}
                    className="text-red-500 font-bold text-sm hover:underline mt-auto"
                  >
                    {member.status === 'pending' ? 'Cancel Invite' : 'Revoke Access'}
                  </button>
                </div>
              ))}

              {/* Add Member Button */}
              <div 
                onClick={() => setIsInviteModalOpen(true)}
                className="calm-card p-6 flex flex-col items-center justify-center cursor-pointer border-dashed hover:-translate-y-1 transition-transform group"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-foreground text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-solid transition-all shadow-pop-sm">
                  <Plus size={28} />
                </div>
                <h3 className="font-bold text-lg">Add Member</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Sub-Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="calm-card p-8 max-w-md w-full relative animate-scale-in">
            <button 
              onClick={() => { setIsInviteModalOpen(false); setInviteCode(null); }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-2xl font-black mb-6">Invite Member</h2>
            
            {!inviteCode ? (
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold block mb-3">Select Role</label>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setInviteRole("caregiver")}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${inviteRole === "caregiver" ? "border-foreground bg-secondary text-secondary-foreground shadow-pop-sm" : "border-muted-foreground/20 text-muted-foreground hover:border-foreground"}`}
                    >
                      Caregiver
                    </button>
                    <button 
                      onClick={() => setInviteRole("doctor")}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${inviteRole === "doctor" ? "border-foreground bg-accent text-accent-foreground shadow-pop-sm" : "border-muted-foreground/20 text-muted-foreground hover:border-foreground"}`}
                    >
                      Doctor
                    </button>
                  </div>
                </div>
                
                <Button onClick={handleGenerateInvite} className="w-full h-12 text-lg font-black border-2 border-foreground shadow-pop-sm">
                  Generate Invite Code
                </Button>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto shadow-pop-sm mb-4">
                  <CheckCircle2 size={32} className="text-primary-foreground" />
                </div>
                <p className="font-medium text-lg">Invite generated successfully!</p>
                
                <div className="bg-muted p-6 rounded-xl border-2 border-foreground relative overflow-hidden">
                  <div className="text-3xl font-black tracking-widest">{inviteCode}</div>
                </div>
                
                <p className="text-sm text-muted-foreground">This code expires in 24 hours.</p>
                
                <Button 
                  onClick={() => navigator.clipboard.writeText(inviteCode)}
                  className="w-full h-12 text-lg font-black border-2 border-foreground shadow-pop-sm bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  <Copy className="mr-2 h-5 w-5" /> Copy Code
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
