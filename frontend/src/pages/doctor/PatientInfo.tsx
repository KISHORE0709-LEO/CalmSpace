import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DoctorShell } from "@/components/DoctorShell";
import { ArrowLeft, User, Loader2, Users, Heart, Stethoscope, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { careTeamApi, LinkedChild } from "@/lib/careTeamApi";

const roleConfig: Record<string, { color: string; label: string; emoji: string }> = {
  parent:    { color: "bg-pink-100 border-pink-400 text-pink-800",       label: "Parent",    emoji: "👪" },
  caregiver: { color: "bg-blue-100 border-blue-400 text-blue-800",       label: "Caregiver", emoji: "🫂" },
  doctor:    { color: "bg-purple-100 border-purple-400 text-purple-800", label: "Doctor",    emoji: "🩺" },
};

export default function PatientInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState<LinkedChild | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    careTeamApi.getMyChildren(user.uid).then(children => {
      const found = children.find(c => c.id === parseInt(id));
      setPatient(found || null);
    }).finally(() => setLoading(false));
  }, [user, id]);

  return (
    <DoctorShell fullWidth>
      <div className="mb-6 flex items-center gap-4 animate-fade-up">
        <Button
          variant="outline"
          onClick={() => navigate("/doctor/patients")}
          className="hover:-translate-x-1 transition-transform border-2 border-foreground shadow-pop-sm font-bold rounded-xl h-12"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Patients
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : !patient ? (
        <div className="calm-card p-12 text-center border-4 border-foreground shadow-pop">
          <p className="text-xl font-black text-muted-foreground">Patient not found or not linked to you.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-up-delay-1 max-w-3xl">
          {/* Patient header */}
          <div className="calm-card border-4 border-foreground shadow-pop p-8 flex items-center gap-6 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-4 border-foreground shadow-pop-sm flex items-center justify-center text-4xl font-black text-primary shrink-0">
              {patient.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-black">{patient.name}</h1>
              <p className="text-muted-foreground font-bold text-lg">
                {patient.age ? `${patient.age} years old` : "Age not set"} · {patient.email}
              </p>
            </div>
          </div>

          {/* Care team */}
          <div className="calm-card border-4 border-foreground shadow-pop p-6">
            <h2 className="text-xl font-black mb-5 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Care Team
            </h2>
            {patient.team.length === 0 ? (
              <p className="text-muted-foreground font-bold text-center py-6">No care team members linked yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {patient.team.map(m => {
                  const cfg = roleConfig[m.role] ?? roleConfig.parent;
                  return (
                    <div key={m.link_id} className="flex items-center gap-4 p-4 rounded-2xl border-4 border-foreground bg-background shadow-pop-sm">
                      <span className="text-2xl">{cfg.emoji}</span>
                      <div className="flex-1">
                        <span className={`text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-2 ${cfg.color}`}>{cfg.label}</span>
                        <p className="font-black text-base mt-1">{m.name || "Pending acceptance"}</p>
                        <p className="text-xs text-muted-foreground font-bold">{m.email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="calm-card border-4 border-foreground shadow-pop p-6">
            <h2 className="text-xl font-black mb-5">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate(`/doctor/patients/${patient.id}/analytics`)}
                className="font-black border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-all bg-primary text-primary-foreground h-12 rounded-xl"
              >
                View Emotion Analytics
              </Button>
              <Button
                onClick={() => navigate("/doctor/therapy/setup")}
                variant="outline"
                className="font-black border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-all h-12 rounded-xl"
              >
                Schedule Therapy Session
              </Button>
              <Button
                onClick={() => navigate("/doctor/chat")}
                variant="outline"
                className="font-black border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-all h-12 rounded-xl"
              >
                Message Care Team
              </Button>
            </div>
          </div>
        </div>
      )}
    </DoctorShell>
  );
}
