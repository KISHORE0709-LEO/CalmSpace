import { useState } from "react";
import { ParentShell } from "@/components/ParentShell";
import { Users, Plus, Mail, Copy, X, CheckCircle2, UserCircle2, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockMembers = [
  { id: 1, name: "Dr. Mehta", role: "doctor", status: "active", joined_at: "2026-07-10" },
  { id: 2, name: "Sarah Jenkins", role: "caregiver", status: "pending", invited_at: "2026-07-12" }
];

export const CareCircle = () => {
  const [members, setMembers] = useState(mockMembers);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState<"caregiver" | "doctor">("caregiver");
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const handleGenerateInvite = () => {
    // Mock API call to backend
    setInviteCode(Math.random().toString(36).substring(2, 10).toUpperCase());
  };

  const revokeMember = (id: number) => {
    setMembers(members.map(m => m.id === id ? { ...m, status: "revoked" } : m));
  };

  return (
    <ParentShell title="Care Circle" subtitle="Manage who has access to your child's data">
      <div className="calm-card p-10 animate-fade-up">
        
        {/* Hub and Spoke Layout */}
        <div className="relative flex flex-col items-center py-16">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-pop-lg z-10 relative mb-12 border-4 border-foreground">
            <UserCircle2 size={48} className="text-primary-foreground" />
            <div className="absolute -bottom-8 font-black whitespace-nowrap text-xl">Child Profile</div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 w-full max-w-4xl relative">
            {/* Connection Lines (visual representation) */}
            <div className="absolute top-[-3rem] left-1/2 w-full h-[2px] bg-foreground/20 -translate-x-1/2 -z-10 hidden md:block"></div>

            {members.filter(m => m.status !== "revoked").map((member) => (
              <div key={member.id} className={`calm-card p-6 flex-1 min-w-[250px] flex flex-col items-center relative ${member.status === 'pending' ? 'opacity-60 bg-muted/50' : ''}`}>
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
                  className="text-red-500 font-bold text-sm hover:underline"
                >
                  {member.status === 'pending' ? 'Cancel Invite' : 'Revoke Access'}
                </button>
              </div>
            ))}

            <div 
              onClick={() => setIsInviteModalOpen(true)}
              className="calm-card p-6 flex-1 min-w-[250px] flex flex-col items-center justify-center cursor-pointer border-dashed hover:-translate-y-1 transition-transform group"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-foreground text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-solid transition-all shadow-pop-sm">
                <Plus size={28} />
              </div>
              <h3 className="font-bold text-lg">Add Member</h3>
            </div>
          </div>
        </div>
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
    </ParentShell>
  );
};

export default CareCircle;
