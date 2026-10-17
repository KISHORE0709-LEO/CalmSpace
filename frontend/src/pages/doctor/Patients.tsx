import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorShell } from "@/components/DoctorShell";
import { Users, Search, Loader2, FileText, BarChart3, Heart, UserCog, Baby, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { careTeamApi, LinkedChild, TeamMember } from "@/lib/careTeamApi";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";

interface Family {
  family_name: string;
  child: { id: number; name: string; email: string; age?: number; link_id: number };
  parent: { name: string; email: string } | null;
  caregiver: { name: string; email: string } | null;
}

function toFamilies(children: LinkedChild[]): Family[] {
  return children.map(c => {
    const parent   = c.team.find((m: TeamMember) => m.role === "parent")   || null;
    const caregiver = c.team.find((m: TeamMember) => m.role === "caregiver") || null;
    const lastName = c.name.split(" ").slice(-1)[0] || c.name;
    return {
      family_name: `The ${lastName} Family`,
      child: { id: c.id, name: c.name, email: c.email, age: c.age, link_id: c.link_id },
      parent:   parent   ? { name: parent.name   || "Pending", email: parent.email   } : null,
      caregiver: caregiver ? { name: caregiver.name || "Pending", email: caregiver.email } : null,
    };
  });
}

const Patients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = async (showSpinner = false) => {
    if (!user) return;
    if (showSpinner) setRefreshing(true);
    else setLoading(true);
    // Trigger auto-heal by hitting the care-circles/mine endpoint first
    try {
      await fetch(`${API_BASE_URL}/api/care-circles/mine?firebase_uid=${user.uid}`, {
        headers: { Authorization: `Bearer ${user.uid}` },
      });
    } catch {}
    careTeamApi.getMyChildren(user.uid)
      .then(children => setFamilies(toFamilies(children)))
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { load(); }, [user]);

  const filtered = useMemo(() => {
    if (!search.trim()) return families;
    const q = search.toLowerCase();
    return families.filter(f =>
      f.family_name.toLowerCase().includes(q) ||
      f.child.name.toLowerCase().includes(q) ||
      (f.parent?.name || "").toLowerCase().includes(q)
    );
  }, [families, search]);

  const handleRefresh = () => {
    load(true);
    toast.info("Refreshing patient list…");
  };

  return (
    <DoctorShell fullWidth>
      <div className="pt-8">
        <div className="mb-8 animate-fade-up flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">My Families</h1>
            <p className="text-muted-foreground font-bold text-lg">All families connected to your care</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-12 rounded-xl font-black shadow-pop-sm border-2 border-foreground bg-primary hover:-translate-y-1 transition-all"
          >
            {refreshing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <RefreshCw className="w-5 h-5 mr-2" />}
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="calm-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center border-2 border-primary/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">Total Families</p>
              <p className="text-2xl font-black">{families.length}</p>
            </div>
          </div>
          <div className="calm-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center border-2 border-green-200">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">Active Patients</p>
              <p className="text-2xl font-black">{families.length}</p>
            </div>
          </div>
          <div className="calm-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center border-2 border-blue-200">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground">With Caregivers</p>
              <p className="text-2xl font-black">{families.filter(f => f.caregiver).length}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex mb-8">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by family name, child, or parent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 border-2 border-foreground shadow-pop-sm rounded-xl text-base"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="calm-card p-16 text-center border-4 border-foreground shadow-pop">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-black mb-2">
              {families.length === 0 ? "No families linked yet" : "No families match your search"}
            </h2>
            <p className="text-muted-foreground font-bold mb-6">
              {families.length === 0
                ? "Once a parent adds you to their Care Circle, click Refresh to see your patients."
                : "Try a different search term."}
            </p>
            {families.length === 0 && (
              <Button onClick={handleRefresh} disabled={refreshing} className="font-black border-2 border-foreground shadow-pop-sm">
                {refreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Refresh Now
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filtered.map((family) => (
              <div key={family.child.id} className="calm-card p-6 group hover:-translate-y-1 hover:shadow-pop transition-all border-2 border-foreground">
                {/* Family Name Header */}
                <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-border/50">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary border-2 border-foreground flex items-center justify-center shadow-pop-sm text-2xl font-black flex-shrink-0">
                    {family.family_name.replace("The ", "").charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black leading-tight">{family.family_name}</h3>
                    <p className="text-xs font-bold text-primary uppercase tracking-wide">Family</p>
                  </div>
                </div>

                {/* Family Members */}
                <div className="space-y-3">
                  {/* Child */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border-2 border-primary/20">
                    <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground border-2 border-foreground flex items-center justify-center text-sm font-black flex-shrink-0">
                      <Baby className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-sm truncate">{family.child.name}</p>
                      <p className="text-xs text-muted-foreground font-bold">
                        Child{family.child.age ? ` · ${family.child.age} yrs` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Parent */}
                  {family.parent ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border-2 border-secondary/30">
                      <div className="w-9 h-9 rounded-full bg-secondary text-secondary-foreground border-2 border-foreground flex items-center justify-center text-sm font-black flex-shrink-0">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm truncate">{family.parent.name}</p>
                        <p className="text-xs text-muted-foreground font-bold">Parent (Admin)</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border-2 border-dashed border-border">
                      <div className="w-9 h-9 rounded-full bg-muted border-2 border-foreground/30 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground font-bold">No parent linked yet</p>
                    </div>
                  )}

                  {/* Caregiver */}
                  {family.caregiver && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border-2 border-amber-200">
                      <div className="w-9 h-9 rounded-full bg-amber-400 text-white border-2 border-foreground flex items-center justify-center text-sm font-black flex-shrink-0">
                        <UserCog className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-sm truncate">{family.caregiver.name}</p>
                        <p className="text-xs text-muted-foreground font-bold">Caregiver</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-5 pt-4 border-t-2 border-border/50 flex flex-col xl:flex-row gap-3">
                  <Button
                    onClick={() => navigate(`/doctor/patients/${family.child.id}/info`)}
                    variant="outline"
                    className="flex-1 h-10 border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-all text-sm font-black rounded-xl"
                  >
                    <FileText className="w-4 h-4 mr-2 shrink-0" /> Patient Info
                  </Button>
                  <Button
                    onClick={() => navigate(`/doctor/patients/${family.child.id}/analytics`)}
                    className="flex-1 h-10 border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-all bg-primary text-primary-foreground text-sm font-black rounded-xl"
                  >
                    <BarChart3 className="w-4 h-4 mr-2 shrink-0" /> Analytics
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DoctorShell>
  );
};

export default Patients;
