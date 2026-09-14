import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  UserCircle2,
  Search,
  Users,
  Plus,
  X,
  Stethoscope,
  HeartPulse,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import {
  CareCircle,
  CareCircleMember,
  ChatMessage,
  fetchMyCircles,
  createCareCircle,
  fetchCircleMembers,
  inviteMember,
  cancelInvite,
  revokeMember,
  fetchChatMessages,
  getCareCircleWsUrl,
} from "@/lib/careCircleApi";
import { PendingInviteBanner } from "./PendingInviteBanner";
import { toast } from "sonner";

interface WhatsAppCloneProps {
  currentRole: "parent" | "caregiver" | "doctor";
}

export const WhatsAppClone = ({ currentRole }: WhatsAppCloneProps) => {
  const { user, profile } = useAuth();
  const authToken = profile?.firebase_uid || user?.uid || null;

  // Circles and active room state
  const [circles, setCircles] = useState<CareCircle[]>([]);
  const [loadingCircles, setLoadingCircles] = useState<boolean>(true);
  const [activeCircleId, setActiveCircleId] = useState<number | null>(null);

  // Messages and WebSocket state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");

  // Roster / Manage Care Circle modal state
  const [isCareCircleOpen, setIsCareCircleOpen] = useState(false);
  const [members, setMembers] = useState<CareCircleMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Invite modal state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"caregiver" | "doctor" | "parent">("caregiver");
  const [inviting, setInviting] = useState(false);

  // Create circle modal state (for parents without a circle)
  const [isCreateCircleOpen, setIsCreateCircleOpen] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newCircleName, setNewCircleName] = useState("");
  const [creatingCircle, setCreatingCircle] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load circles
  const loadCircles = useCallback(async () => {
    if (!authToken) return;
    setLoadingCircles(true);
    try {
      const myCircles = await fetchMyCircles(authToken);
      setCircles(myCircles);

      // Auto-select first active circle if none selected
      if (!activeCircleId && myCircles.length > 0) {
        const activeOne = myCircles.find((c) => c.current_user_status === "active") || myCircles[0];
        setActiveCircleId(activeOne.id);
      }
    } catch (err) {
      console.error("Failed to load care circles:", err);
    } finally {
      setLoadingCircles(false);
    }
  }, [authToken, activeCircleId]);

  useEffect(() => {
    loadCircles();
  }, [loadCircles]);

  // Load members whenever Care Circle modal is opened
  const loadMembers = useCallback(async () => {
    if (!activeCircleId) return;
    setLoadingMembers(true);
    try {
      const data = await fetchCircleMembers(activeCircleId, authToken);
      setMembers(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load circle members");
    } finally {
      setLoadingMembers(false);
    }
  }, [activeCircleId, authToken]);

  useEffect(() => {
    if (isCareCircleOpen && activeCircleId) {
      loadMembers();
    }
  }, [isCareCircleOpen, activeCircleId, loadMembers]);

  // Load chat history & initialize WebSocket when activeCircleId changes
  useEffect(() => {
    if (!activeCircleId) return;

    let isMounted = true;

    // 1. Fetch historical messages
    setLoadingMessages(true);
    fetchChatMessages(activeCircleId, authToken)
      .then((history) => {
        if (isMounted) {
          setMessages(history);
        }
      })
      .catch((err) => {
        console.error("Failed to load chat messages:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingMessages(false);
      });

    // 2. Open WebSocket connection
    const wsUrl = getCareCircleWsUrl(activeCircleId, authToken);
    if (!wsUrl) {
      setConnectionStatus("disconnected");
      return;
    }

    setConnectionStatus("connecting");
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      if (isMounted) setConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const incoming: ChatMessage = JSON.parse(event.data);
        if (incoming.content) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      } catch (err) {
        console.error("Failed to parse incoming chat message:", err);
      }
    };

    ws.onerror = () => {
      if (isMounted) setConnectionStatus("error");
    };

    ws.onclose = (event) => {
      if (isMounted) {
        setConnectionStatus("disconnected");
        if (event.code === 1008) {
          toast.error("Your access to this Care Circle chat is inactive or has been revoked.");
        }
      }
    };

    return () => {
      isMounted = false;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
      socketRef.current = null;
    };
  }, [activeCircleId, authToken]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const content = inputValue.trim();
    if (!content || !activeCircleId) return;

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Chat is not connected. Please wait for connection.");
      return;
    }

    try {
      socketRef.current.send(JSON.stringify({ content }));
      setInputValue("");
    } catch (err) {
      toast.error("Failed to send message over socket.");
    }
  };

  // Optimistic member revocation
  const handleRevokeMember = async (member: CareCircleMember) => {
    if (!activeCircleId) return;
    const originalMembers = [...members];
    // Optimistic update
    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, status: "revoked" } : m)));

    try {
      await revokeMember(activeCircleId, member.id, authToken);
      toast.success(`Access revoked for ${member.name}.`);
    } catch (err: any) {
      // Rollback on failure
      setMembers(originalMembers);
      toast.error(err.message || "Failed to revoke member access. Reverted changes.");
    }
  };

  // Optimistic invite cancellation
  const handleCancelInvite = async (member: CareCircleMember) => {
    if (!activeCircleId) return;
    const originalMembers = [...members];
    // Optimistic update: remove from list
    setMembers((prev) => prev.filter((m) => m.id !== member.id));

    try {
      await cancelInvite(activeCircleId, member.id, authToken);
      toast.success(`Invite cancelled for ${member.invited_email}.`);
    } catch (err: any) {
      // Rollback on failure
      setMembers(originalMembers);
      toast.error(err.message || "Failed to cancel invite. Reverted changes.");
    }
  };

  // Send invite handler
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCircleId || !inviteEmail.trim()) return;

    setInviting(true);
    try {
      const newMember = await inviteMember(activeCircleId, inviteEmail.trim(), inviteRole, authToken);
      setMembers((prev) => [...prev, newMember]);
      toast.success(`Invite sent to ${inviteEmail}.`);
      setIsInviteModalOpen(false);
      setInviteEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send invite.");
    } finally {
      setInviting(false);
    }
  };

  // Create care circle handler
  const handleCreateCircle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) {
      toast.error("Child name is required");
      return;
    }

    setCreatingCircle(true);
    try {
      const newCircle = await createCareCircle(newChildName.trim(), newCircleName.trim() || undefined, authToken);
      setCircles((prev) => [newCircle, ...prev]);
      setActiveCircleId(newCircle.id);
      setIsCreateCircleOpen(false);
      setNewChildName("");
      setNewCircleName("");
      toast.success("Care Circle created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create Care Circle");
    } finally {
      setCreatingCircle(false);
    }
  };

  const activeCircle = circles.find((c) => c.id === activeCircleId) || null;
  const pendingCircles = circles.filter((c) => c.current_user_status === "pending");
  const activeCircles = circles.filter((c) => c.current_user_status !== "pending");

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "parent":
        return "bg-primary text-primary-foreground";
      case "caregiver":
        return "bg-secondary text-secondary-foreground";
      case "doctor":
        return "bg-accent text-accent-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const renderConnectionStatus = () => {
    switch (connectionStatus) {
      case "connected":
        return (
          <div className="flex items-center gap-1.5 text-xs font-bold text-green-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Connected
          </div>
        );
      case "connecting":
        return (
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Connecting...
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-500">
            <WifiOff size={12} />
            Connection Error
          </div>
        );
      case "disconnected":
      default:
        return (
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
            Disconnected
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {/* Pending invites banner for Caregivers / Doctors / Parents */}
      <PendingInviteBanner
        pendingCircles={pendingCircles}
        authToken={authToken}
        currentUserEmail={profile?.email || user?.email}
        onInviteResponded={loadCircles}
      />

      <div className="flex h-[calc(100vh-180px)] min-h-[600px] border-2 border-foreground rounded-2xl shadow-pop-lg overflow-hidden bg-background">
        {/* LEFT SIDEBAR: Care Circle Rooms & Threads */}
        <div className="w-[340px] flex-shrink-0 border-r-2 border-foreground flex flex-col bg-muted/20 relative">
          {/* Header */}
          <div className="h-16 border-b-2 border-foreground flex items-center justify-between px-4 bg-muted/50">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 border-foreground shadow-pop-sm ${getRoleBadgeColor(
                  currentRole
                )}`}
              >
                <UserCircle2 size={24} />
              </div>
              <div>
                <span className="font-black text-base capitalize block leading-tight">
                  {profile?.name || user?.displayName || currentRole}
                </span>
                <span className="text-[11px] font-bold text-muted-foreground uppercase">
                  {currentRole}
                </span>
              </div>
            </div>

            {currentRole === "parent" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCreateCircleOpen(true)}
                className="h-8 px-2 border-2 border-foreground font-black shadow-pop-sm hover:-translate-y-0.5"
                title="Create New Care Circle"
              >
                <Plus size={14} className="mr-1" /> New
              </Button>
            )}
          </div>

          {/* Room / Circle List */}
          <div className="flex-1 overflow-y-auto">
            {loadingCircles ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground font-bold text-sm">
                <Loader2 size={20} className="animate-spin mr-2 text-primary" /> Loading circles...
              </div>
            ) : activeCircles.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground space-y-4">
                <p className="font-bold text-sm">No active Care Circles yet.</p>
                {currentRole === "parent" ? (
                  <Button
                    onClick={() => setIsCreateCircleOpen(true)}
                    className="w-full font-black border-2 border-foreground shadow-pop-sm"
                  >
                    <Plus size={16} className="mr-1" /> Create Care Circle
                  </Button>
                ) : (
                  <p className="text-xs">You will see conversations here once a parent invites you.</p>
                )}
              </div>
            ) : (
              activeCircles.map((circle) => (
                <div
                  key={circle.id}
                  onClick={() => setActiveCircleId(circle.id)}
                  className={`flex items-center gap-3 p-3.5 cursor-pointer border-b-2 border-foreground/10 transition-colors ${
                    activeCircleId === circle.id ? "bg-primary/15" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-foreground flex-shrink-0 shadow-pop-sm bg-primary text-primary-foreground">
                    <HeartPulse size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-sm truncate">{circle.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground truncate font-medium">
                      Child: <span className="font-bold text-foreground">{circle.child_name}</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Floating Care Circle Roster Button */}
          {activeCircle && (
            <div className="p-3 border-t-2 border-foreground bg-background/80 backdrop-blur-sm">
              <Button
                onClick={() => setIsCareCircleOpen(true)}
                className="w-full h-12 rounded-xl bg-primary text-primary-foreground border-2 border-foreground flex items-center justify-center gap-2 shadow-pop-sm hover:-translate-y-0.5 transition-all font-black text-sm"
              >
                <Users size={20} />
                <span>{currentRole === "parent" ? "Manage Care Circle" : "Circle Roster"}</span>
              </Button>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Active Chat Room */}
        <div className="flex-1 flex flex-col bg-[#efeae2] relative">
          {/* Subtle chat background overlay */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(rgba(0,0,0,0.2) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {activeCircle ? (
            <>
              {/* Header */}
              <div className="h-16 border-b-2 border-foreground flex items-center justify-between px-6 bg-muted/90 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-foreground shadow-pop-sm bg-primary text-primary-foreground">
                    <HeartPulse size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-base leading-tight">{activeCircle.name}</h3>
                    {renderConnectionStatus()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCareCircleOpen(true)}
                    className="border-2 border-foreground font-black text-xs shadow-pop-sm hover:-translate-y-0.5"
                  >
                    <Users size={14} className="mr-1 text-primary" />
                    Roster
                  </Button>
                </div>
              </div>

              {/* Messages History & Live Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 z-10 scrollbar-thin">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground font-bold">
                    <Loader2 size={24} className="animate-spin mr-2 text-primary" /> Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6">
                    <div className="bg-background/90 p-5 rounded-2xl border-2 border-foreground shadow-pop-sm text-center max-w-sm">
                      <p className="font-black text-base text-foreground mb-1">
                        Welcome to {activeCircle.name}
                      </p>
                      <p className="text-xs font-medium">
                        This is the start of your secure Care Circle group chat. Send a message to keep
                        everyone on the same page.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSelf =
                      msg.sender_user_id === profile?.id ||
                      msg.sender_name === profile?.name ||
                      msg.sender_name === user?.displayName;

                    return (
                      <div key={msg.id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[72%] p-3.5 rounded-2xl border-2 border-foreground shadow-pop-sm text-[14px] relative ${
                            isSelf
                              ? "bg-[#d9fdd3] text-foreground rounded-tr-sm"
                              : "bg-background text-foreground rounded-tl-sm"
                          }`}
                        >
                          {!isSelf && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-xs text-primary">{msg.sender_name}</span>
                              <span
                                className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full border border-foreground ${getRoleBadgeColor(
                                  msg.sender_role
                                )}`}
                              >
                                {msg.sender_role}
                              </span>
                            </div>
                          )}

                          <div className="font-medium pr-12 leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content}
                          </div>

                          <div className="absolute right-2.5 bottom-1 flex items-center gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground/70">
                              {new Date(msg.sent_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3.5 bg-muted/90 backdrop-blur-sm border-t-2 border-foreground flex items-center gap-2 z-10"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={`Message ${activeCircle.name}...`}
                  className="flex-1 h-11 rounded-xl border-2 border-foreground shadow-pop-sm bg-background text-sm px-4 focus-visible:ring-primary"
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="h-11 px-4 rounded-xl border-2 border-foreground shadow-pop-sm bg-primary text-primary-foreground font-black flex items-center justify-center gap-1.5 hover:-translate-y-0.5 transition-transform"
                >
                  <Send size={16} />
                  <span>Send</span>
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center z-10">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary mb-6 shadow-pop-sm">
                <HeartPulse size={36} className="text-primary" />
              </div>
              <h2 className="text-2xl font-black mb-3">Care Circle Group Chat</h2>
              <p className="text-sm font-medium text-muted-foreground max-w-md mb-6">
                Connect parents, caregivers, and doctors in a unified real-time chat room dedicated to
                supporting the child.
              </p>
              {currentRole === "parent" && (
                <Button
                  onClick={() => setIsCreateCircleOpen(true)}
                  className="font-black border-2 border-foreground shadow-pop-sm"
                >
                  <Plus size={16} className="mr-1" /> Create a Care Circle
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MANAGE CARE CIRCLE ROSTER MODAL */}
      {isCareCircleOpen && activeCircle && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="calm-card p-6 md:p-8 w-full max-w-3xl relative animate-fade-up max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsCareCircleOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full border-2 border-foreground hover:bg-muted transition-colors shadow-pop-sm"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-black mb-1 flex items-center gap-2">
                <HeartPulse className="w-7 h-7 text-primary" />
                {activeCircle.name} Roster
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                Child: <span className="font-bold text-foreground">{activeCircle.child_name}</span> •
                Controlled by parent account.
              </p>
            </div>

            {loadingMembers ? (
              <div className="py-12 flex justify-center items-center text-muted-foreground font-bold">
                <Loader2 size={24} className="animate-spin mr-2 text-primary" /> Loading members...
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members
                  .filter((m) => m.status !== "revoked")
                  .map((member) => (
                    <div
                      key={member.id}
                      className={`calm-card p-5 flex flex-col items-center relative text-center ${
                        member.status === "pending" ? "opacity-75 bg-muted/40 border-dashed" : ""
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 border-2 border-foreground shadow-pop-sm ${
                          member.role === "doctor"
                            ? "bg-accent text-accent-foreground"
                            : member.role === "caregiver"
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {member.role === "doctor" ? (
                          <Stethoscope size={24} />
                        ) : (
                          <Users size={24} />
                        )}
                      </div>

                      <h4 className="font-black text-base truncate w-full">{member.name}</h4>
                      <p className="text-xs text-muted-foreground truncate w-full mb-2">
                        {member.invited_email}
                      </p>

                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-foreground bg-background">
                          {member.role}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            member.status === "active"
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-amber-100 text-amber-700 border border-amber-300"
                          }`}
                        >
                          {member.status}
                        </span>
                      </div>

                      {/* Action buttons with server-side authorized states */}
                      {member.can_revoke && (
                        <button
                          onClick={() => handleRevokeMember(member)}
                          className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline mt-auto pt-2"
                        >
                          Revoke Access
                        </button>
                      )}

                      {member.can_cancel && (
                        <button
                          onClick={() => handleCancelInvite(member)}
                          className="text-xs font-bold text-muted-foreground hover:text-red-500 hover:underline mt-auto pt-2"
                        >
                          Cancel Invite
                        </button>
                      )}
                    </div>
                  ))}

                {/* Add Member Card (Parent only) */}
                {currentRole === "parent" && (
                  <div
                    onClick={() => setIsInviteModalOpen(true)}
                    className="calm-card p-5 flex flex-col items-center justify-center cursor-pointer border-dashed border-2 hover:-translate-y-1 transition-transform group min-h-[170px]"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 border-2 border-dashed border-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-solid transition-all shadow-pop-sm">
                      <Plus size={24} />
                    </div>
                    <span className="font-black text-sm">Add Member</span>
                    <span className="text-xs text-muted-foreground font-medium">By Email</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INVITE MEMBER SUB-MODAL */}
      {isInviteModalOpen && activeCircle && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="calm-card p-6 md:p-8 max-w-md w-full relative animate-scale-in">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-black mb-1 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> Invite to Care Circle
            </h3>
            <p className="text-xs text-muted-foreground font-medium mb-5">
              Send an invite by email. They will see the invite when they log in.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1.5">Member Email</label>
                <Input
                  type="email"
                  required
                  placeholder="therapist@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="h-11 rounded-xl border-2 border-foreground shadow-pop-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1.5">Select Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteRole("caregiver")}
                    className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition-all ${
                      inviteRole === "caregiver"
                        ? "border-foreground bg-secondary text-secondary-foreground shadow-pop-sm"
                        : "border-muted-foreground/30 text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    Caregiver
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteRole("doctor")}
                    className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition-all ${
                      inviteRole === "doctor"
                        ? "border-foreground bg-accent text-accent-foreground shadow-pop-sm"
                        : "border-muted-foreground/30 text-muted-foreground hover:border-foreground"
                    }`}
                  >
                    Doctor / Therapist
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={inviting || !inviteEmail.trim()}
                className="w-full h-11 font-black border-2 border-foreground shadow-pop-sm bg-primary text-primary-foreground mt-2"
              >
                {inviting ? <Loader2 size={16} className="animate-spin mr-1" /> : <Mail size={16} className="mr-1" />}
                Send Invite
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CARE CIRCLE MODAL */}
      {isCreateCircleOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="calm-card p-6 md:p-8 max-w-md w-full relative animate-scale-in">
            <button
              onClick={() => setIsCreateCircleOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-black mb-1 flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-primary" /> Create Care Circle
            </h3>
            <p className="text-xs text-muted-foreground font-medium mb-5">
              Set up a care circle for your child and link therapists and caregivers.
            </p>

            <form onSubmit={handleCreateCircle} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1.5">Child's Name *</label>
                <Input
                  required
                  placeholder="e.g. Leo"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="h-11 rounded-xl border-2 border-foreground shadow-pop-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1.5">
                  Circle Name <span className="text-muted-foreground">(Optional)</span>
                </label>
                <Input
                  placeholder="e.g. The Jenkins Family Care Team"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  className="h-11 rounded-xl border-2 border-foreground shadow-pop-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={creatingCircle || !newChildName.trim()}
                className="w-full h-11 font-black border-2 border-foreground shadow-pop-sm bg-primary text-primary-foreground mt-2"
              >
                {creatingCircle ? (
                  <Loader2 size={16} className="animate-spin mr-1" />
                ) : (
                  <Plus size={16} className="mr-1" />
                )}
                Create Care Circle
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
