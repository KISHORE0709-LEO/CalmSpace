import { useEffect, useState } from "react";
import { ParentShell } from "@/components/ParentShell";
import { Users, Plus, Trash2, Loader2, Mail, Stethoscope, HandHeart, RefreshCw, Link2, Search, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { careTeamApi, LinkedChild, TeamMember } from "@/lib/careTeamApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE_URL } from "@/lib/api";

const roleConfig: Record<string, { color: string; label: string; emoji: string }> = {
  parent:    { color: "bg-pink-100 border-pink-400 text-pink-800",       label: "Parent",    emoji: "👪" },
  caregiver: { color: "bg-blue-100 border-blue-400 text-blue-800",       label: "Caregiver", emoji: "🫂" },
  doctor:    { color: "bg-purple-100 border-purple-400 text-purple-800", label: "Doctor",    emoji: "🩺" },
};

interface DoctorEntry { id: number; name: string; email: string; }

const ManageCareTeam = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"caregiver" | "doctor">("caregiver");
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [inviting, setInviting] = useState(false);
  const [linkChildEmail, setLinkChildEmail] = useState("");
  const [linkingChild, setLinkingChild] = useState(false);

  // Doctor browser
  const [doctors, setDoctors] = useState<DoctorEntry[]>([]);
  const [doctorSearch, setDoctorSearch] = useState("");
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);

  const load = () => {
    if (!user) return;
    setLoading(true);
    careTeamApi.getMyChildren(user.uid)
      .then(data => {
        setChildren(data);
        if (data.length > 0 && !selectedChildId) setSelectedChildId(data[0].id);
      })
      .finally(() => setLoading(false));
  };

  const loadDoctors = () => {
    if (!API_BASE_URL) return;
    fetch(`${API_BASE_URL}/api/doctors/list`)
      .then(r => r.ok ? r.json() : [])
      .then(setDoctors)
      .catch(() => {});
  };

  useEffect(() => { load(); loadDoctors(); }, [user]);

  const selectedChild = children.find(c => c.id === selectedChildId);

  const handleInvite = async (emailOverride?: string) => {
    const email = emailOverride ?? inviteEmail.trim();
    if (!user || !selectedChildId || !email) return;
    setInviting(true);
    try {
      const res = await careTeamApi.invite(user.uid, selectedChildId, email, inviteRole);
      if (res.message) {
        toast.success(res.message);
        setInviteEmail("");
        setShowDoctorPicker(false);
        load();
      } else {
        toast.error(res.detail || "Failed to invite");
      }
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setInviting(false);
    }
  };

  const handleLinkChild = async () => {
    if (!user || !linkChildEmail.trim()) return;
    setLinkingChild(true);
    try {
      const res = await careTeamApi.linkChild(user.uid, linkChildEmail.trim());
      if (res.message) {
        toast.success(res.message);
        setLinkChildEmail("");
        load();
      } else {
        toast.error(res.detail || "Failed to link child");
      }
    } catch {
      toast.error("Failed to link child");
    } finally {
      setLinkingChild(false);
    }
  };

  const handleRemove = async (link_id: number, name: string) => {
    if (!user) return;
    if (!confirm(`Remove ${name} from the care team?`)) return;
    try {
      await careTeamApi.remove(link_id, user.uid);
      toast.success(`${name} removed from care team`);
      load();
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const filteredDoctors = doctors.filter(d =>
    d.name.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.email.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  // Check which doctors are already linked to the selected child
  const linkedDoctorEmails = new Set(
    selectedChild?.team.filter(m => m.role === "doctor").map(m => m.email) ?? []
  );

  return (
    <ParentShell title="Manage Care Team" subtitle="Assign and manage your child's care team" fullWidth>
      <div className="max-w-4xl mx-auto animate-fade-up pb-12">

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : children.length === 0 ? (
          <div className="calm-card p-12 text-center border-4 border-foreground shadow-pop">
            <Users className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-black mb-2">No child linked yet</h2>
            <p className="text-muted-foreground font-bold mb-6">Link your child's account using their email address.</p>
            <div className="flex gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input value={linkChildEmail} onChange={e => setLinkChildEmail(e.target.value)}
                  placeholder="Child's email address"
                  className="pl-10 h-12 border-4 border-foreground rounded-xl font-bold text-base" />
              </div>
              <Button onClick={handleLinkChild} disabled={linkingChild || !linkChildEmail.trim()}
                className="h-12 px-6 font-black border-4 border-foreground shadow-pop hover:-translate-y-1 transition-all bg-primary text-primary-foreground rounded-xl">
                {linkingChild ? <Loader2 className="w-5 h-5 animate-spin" /> : "Link Child"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground font-bold mt-3">💡 The child must already have a CalmSpace account.</p>
          </div>
        ) : (
          <>
            {/* Link a new child */}
            <div className="calm-card border-4 border-foreground shadow-pop p-6 mb-6">
              <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Link2 className="w-5 h-5 text-primary" /> Link Another Child</h3>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input value={linkChildEmail} onChange={e => setLinkChildEmail(e.target.value)}
                    placeholder="Child's email address"
                    className="pl-10 h-12 border-4 border-foreground rounded-xl font-bold text-base" />
                </div>
                <Button onClick={handleLinkChild} disabled={linkingChild || !linkChildEmail.trim()}
                  className="h-12 px-6 font-black border-4 border-foreground shadow-pop hover:-translate-y-1 transition-all bg-primary text-primary-foreground rounded-xl">
                  {linkingChild ? <Loader2 className="w-5 h-5 animate-spin" /> : "Link Child"}
                </Button>
              </div>
            </div>

            {/* Child selector */}
            {children.length > 1 && (
              <div className="flex gap-3 mb-6 flex-wrap">
                {children.map(c => (
                  <button key={c.id} onClick={() => setSelectedChildId(c.id)}
                    className={`px-5 py-2 rounded-full font-black border-4 transition-all ${selectedChildId === c.id ? "bg-primary text-primary-foreground border-foreground shadow-pop" : "bg-background border-foreground/30 hover:border-foreground"}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            {selectedChild && (
              <div className="flex flex-col gap-6">

                {/* Child info card */}
                <div className="calm-card border-4 border-foreground shadow-pop p-6 flex items-center gap-5 bg-gradient-to-r from-primary/10 to-secondary/10">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border-4 border-foreground shadow-pop-sm flex items-center justify-center text-3xl">👦</div>
                  <div>
                    <h2 className="text-2xl font-black">{selectedChild.name}</h2>
                    <p className="text-muted-foreground font-bold">{selectedChild.email}{selectedChild.age ? ` · Age ${selectedChild.age}` : ""}</p>
                  </div>
                  <button onClick={load} className="ml-auto p-2 rounded-xl border-2 border-foreground hover:bg-muted transition-all">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>

                {/* Current team */}
                <div className="calm-card border-4 border-foreground shadow-pop p-6">
                  <h3 className="text-xl font-black mb-5 flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Current Care Team</h3>
                  {selectedChild.team.length === 0 ? (
                    <p className="text-muted-foreground font-bold text-center py-6">No care team members yet. Invite a caregiver or doctor below.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {selectedChild.team.map((m: TeamMember) => {
                        const cfg = roleConfig[m.role] ?? roleConfig.parent;
                        const isParent = m.role === "parent";
                        return (
                          <div key={m.link_id} className="flex items-center gap-4 p-4 rounded-2xl border-4 border-foreground bg-background shadow-pop-sm">
                            <span className="text-2xl">{cfg.emoji}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-2 ${cfg.color}`}>{cfg.label}</span>
                                {isParent && <span className="text-xs font-bold text-muted-foreground">(You)</span>}
                                {m.status === "pending" && <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">Pending</span>}
                              </div>
                              <p className="font-black text-base">{m.name || "Pending acceptance"}</p>
                              <p className="text-xs text-muted-foreground font-bold">{m.email}</p>
                            </div>
                            {!isParent && (
                              <button onClick={() => handleRemove(m.link_id, m.name || m.email)}
                                className="p-2 rounded-xl border-2 border-red-300 text-red-500 hover:bg-red-50 transition-all">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Invite form */}
                <div className="calm-card border-4 border-foreground shadow-pop p-6">
                  <h3 className="text-xl font-black mb-5 flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Invite Care Team Member</h3>
                  <div className="flex flex-col gap-4">
                    {/* Role toggle */}
                    <div className="flex gap-3">
                      {(["caregiver", "doctor"] as const).map(r => (
                        <button key={r} onClick={() => { setInviteRole(r); setShowDoctorPicker(false); }}
                          className={`flex-1 py-3 rounded-xl font-black border-4 transition-all flex items-center justify-center gap-2 ${inviteRole === r ? "bg-primary text-primary-foreground border-foreground shadow-pop" : "bg-background border-foreground/30 hover:border-foreground"}`}>
                          {r === "caregiver" ? <HandHeart className="w-5 h-5" /> : <Stethoscope className="w-5 h-5" />}
                          {r === "caregiver" ? "Caregiver" : "Doctor"}
                        </button>
                      ))}
                    </div>

                    {/* Doctor picker — browse registered doctors */}
                    {inviteRole === "doctor" && (
                      <div>
                        <button
                          onClick={() => setShowDoctorPicker(v => !v)}
                          className="w-full py-3 rounded-xl border-4 border-dashed border-primary/50 font-black text-sm text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 mb-3"
                        >
                          <Search className="w-4 h-4" />
                          {showDoctorPicker ? "Hide Doctor List" : "Browse Registered Doctors"}
                        </button>

                        {showDoctorPicker && (
                          <div className="border-4 border-foreground rounded-2xl overflow-hidden shadow-pop mb-3">
                            <div className="p-3 bg-muted/50 border-b-2 border-foreground">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input value={doctorSearch} onChange={e => setDoctorSearch(e.target.value)}
                                  placeholder="Search by name or email..."
                                  className="pl-9 h-10 border-2 border-foreground rounded-xl font-bold text-sm" />
                              </div>
                            </div>
                            <div className="max-h-56 overflow-y-auto divide-y-2 divide-foreground/10">
                              {filteredDoctors.length === 0 ? (
                                <p className="text-center text-sm font-bold text-muted-foreground py-6">No doctors found.</p>
                              ) : filteredDoctors.map(doc => {
                                const alreadyLinked = linkedDoctorEmails.has(doc.email);
                                return (
                                  <div key={doc.id} className="flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 border-2 border-foreground flex items-center justify-center text-lg flex-shrink-0">🩺</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-black text-sm truncate">{doc.name}</p>
                                      <p className="text-xs text-muted-foreground font-bold truncate">{doc.email}</p>
                                    </div>
                                    {alreadyLinked ? (
                                      <span className="flex items-center gap-1 text-xs font-black text-green-600 bg-green-100 px-2 py-1 rounded-full border border-green-300">
                                        <CheckCircle2 className="w-3 h-3" /> Linked
                                      </span>
                                    ) : (
                                      <Button
                                        onClick={() => handleInvite(doc.email)}
                                        disabled={inviting}
                                        className="h-8 px-3 text-xs font-black border-2 border-foreground shadow-pop-sm bg-primary text-primary-foreground rounded-lg hover:-translate-y-0.5 transition-all"
                                      >
                                        {inviting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Add"}
                                      </Button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Manual email invite */}
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                          placeholder={`${inviteRole === "caregiver" ? "Caregiver" : "Doctor"}'s email address`}
                          className="pl-10 h-12 border-4 border-foreground rounded-xl font-bold text-base" />
                      </div>
                      <Button onClick={() => handleInvite()} disabled={inviting || !inviteEmail.trim()}
                        className="h-12 px-6 font-black border-4 border-foreground shadow-pop hover:-translate-y-1 transition-all bg-primary text-primary-foreground rounded-xl">
                        {inviting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Invite"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground font-bold">
                      💡 If they already have a CalmSpace account, they'll be linked immediately. Otherwise, they'll be linked when they sign up with this email.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </div>
    </ParentShell>
  );
};

export default ManageCareTeam;
