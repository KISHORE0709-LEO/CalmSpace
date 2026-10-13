import { useEffect, useState } from "react";
import { CaregiverShell } from "@/components/CaregiverShell";
import { AlertTriangle, ShieldAlert, Loader2, Users, RefreshCw, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { careTeamApi, LinkedChild, CrisisAlert } from "@/lib/careTeamApi";

const CrisisAlerts = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [selectedChild, setSelectedChild] = useState<LinkedChild | null>(null);
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;
    careTeamApi.getMyChildren(user.uid).then(data => {
      setChildren(data);
      if (data.length > 0) setSelectedChild(data[0]);
    }).finally(() => setLoading(false));
  }, [user]);

  const loadAlerts = (child: LinkedChild) => {
    if (!user) return;
    setRefreshing(true);
    careTeamApi.getCrisisAlerts(child.id, user.uid)
      .then(setAlerts)
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    if (selectedChild) loadAlerts(selectedChild);
  }, [selectedChild]);

  const timeSince = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <CaregiverShell title="Crisis Alerts" subtitle="Overwhelm events detected by the emotion system" fullWidth>
      <div className="max-w-3xl mx-auto pb-12 animate-fade-up">

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : children.length === 0 ? (
          <div className="calm-card p-12 text-center border-4 border-foreground shadow-pop">
            <Users className="w-14 h-14 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-black mb-2">Not linked to a child</h2>
            <p className="text-muted-foreground font-bold">Ask the parent to invite you to their child's care team.</p>
          </div>
        ) : (
          <>
            {children.length > 1 && (
              <div className="flex gap-3 mb-6 flex-wrap">
                {children.map(c => (
                  <button key={c.id} onClick={() => setSelectedChild(c)}
                    className={`px-5 py-2 rounded-full font-black border-4 transition-all ${selectedChild?.id === c.id ? "bg-primary text-primary-foreground border-foreground shadow-pop" : "bg-background border-foreground/30 hover:border-foreground"}`}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 border-4 border-foreground rounded-xl flex items-center justify-center shadow-pop-sm">
                  <ShieldAlert className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">{selectedChild?.name}'s Crisis Events</h2>
                  <p className="text-sm font-bold text-muted-foreground">{alerts.length} overwhelm event{alerts.length !== 1 ? "s" : ""} recorded</p>
                </div>
              </div>
              <button onClick={() => selectedChild && loadAlerts(selectedChild)}
                className="p-2 rounded-xl border-4 border-foreground hover:bg-muted transition-all shadow-pop-sm">
                <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>

            {alerts.length === 0 ? (
              <div className="calm-card p-12 text-center border-4 border-foreground shadow-pop bg-green-50">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-black text-green-800 mb-2">No crisis events!</h3>
                <p className="text-green-700 font-bold">No overwhelm events have been detected yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {alerts.map((alert, i) => (
                  <div key={alert.id} className={`calm-card border-4 border-foreground shadow-pop p-6 ${i === 0 ? "bg-red-50 border-red-300" : "bg-background"}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl border-4 border-foreground flex items-center justify-center shrink-0 shadow-pop-sm ${i === 0 ? "bg-red-500 text-white animate-pulse" : "bg-red-100 text-red-600"}`}>
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-lg text-red-800">🤯 Overwhelmed State Detected</span>
                          {i === 0 && <span className="text-xs font-black bg-red-500 text-white px-3 py-1 rounded-full border-2 border-foreground">Latest</span>}
                        </div>
                        <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {timeSince(alert.logged_at)}</span>
                          <span>Confidence: {Math.round(alert.confidence * 100)}%</span>
                          <span>Overwhelm: {Math.round(alert.prob_overwhelmed * 100)}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{new Date(alert.logged_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </CaregiverShell>
  );
};

export default CrisisAlerts;
