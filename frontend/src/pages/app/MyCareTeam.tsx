import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Heart, Stethoscope, HandHeart, Loader2, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { careTeamApi, TeamMember } from "@/lib/careTeamApi";

const roleConfig: Record<string, { icon: typeof Heart; color: string; label: string; emoji: string }> = {
  parent:    { icon: Heart,       color: "bg-pink-100 border-pink-400 text-pink-800",    label: "Parent",    emoji: "👪" },
  caregiver: { icon: HandHeart,   color: "bg-blue-100 border-blue-400 text-blue-800",    label: "Caregiver", emoji: "🫂" },
  doctor:    { icon: Stethoscope, color: "bg-purple-100 border-purple-400 text-purple-800", label: "Doctor", emoji: "🩺" },
};

const MyCareTeam = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [childName, setChildName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    careTeamApi.getMyTeam(user.uid).then(data => {
      setTeam(data.team || []);
      setChildName(data.child_name || "");
    }).finally(() => setLoading(false));
  }, [user]);

  return (
    <AppShell title="My Care Team" subtitle="The people who support you every day 💙">
      <div className="max-w-2xl mx-auto animate-fade-up">

        {/* Hero */}
        <div className="calm-card bg-gradient-to-br from-primary/10 to-secondary/20 border-4 border-foreground shadow-pop p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🌿</div>
          <h2 className="text-3xl font-black mb-2">Hi {childName || "there"}!</h2>
          <p className="text-muted-foreground font-bold text-lg">These are the amazing people taking care of you.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : team.length === 0 ? (
          <div className="calm-card p-10 text-center border-4 border-foreground shadow-pop">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl font-black text-muted-foreground">Your care team is being set up.</p>
            <p className="text-muted-foreground mt-2">Ask your parent to link your care team!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {team.map((member) => {
              const cfg = roleConfig[member.role] ?? roleConfig.parent;
              const Icon = cfg.icon;
              return (
                <div key={member.link_id} className="calm-card border-4 border-foreground shadow-pop p-6 flex items-center gap-6 hover:-translate-y-1 transition-all">
                  <div className={`w-16 h-16 rounded-full border-4 border-foreground flex items-center justify-center text-3xl shadow-pop-sm ${cfg.color}`}>
                    {cfg.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border-2 ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black">{member.name}</h3>
                    <p className="text-muted-foreground font-bold text-sm">{member.email}</p>
                  </div>
                  <Icon className="w-8 h-8 text-muted-foreground/40" />
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 calm-card bg-secondary/20 border-4 border-foreground shadow-pop p-6 text-center">
          <p className="text-lg font-bold text-foreground">💙 You are loved and supported!</p>
          <p className="text-muted-foreground font-medium mt-1">Your care team is always here for you.</p>
        </div>
      </div>
    </AppShell>
  );
};

export default MyCareTeam;
