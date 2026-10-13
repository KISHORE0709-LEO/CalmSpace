import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DoctorShell } from "@/components/DoctorShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, BarChart3, ActivitySquare, Download, ClipboardEdit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { careTeamApi, LinkedChild, EmotionEntry } from "@/lib/careTeamApi";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function PatientAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("analytics");
  const [patient, setPatient] = useState<LinkedChild | null>(null);
  const [history, setHistory] = useState<EmotionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    careTeamApi.getMyChildren(user.uid).then(children => {
      const found = children.find(c => c.id === parseInt(id));
      setPatient(found || null);
      if (found) {
        careTeamApi.getHistory(found.id, user.uid, 100).then(setHistory).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
  }, [user, id]);

  const chartData = history.slice().reverse().map(e => ({
    name: new Date(e.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    Calm: Math.round((e.probs.Calm || 0) * 100),
    Happy: Math.round((e.probs.Happy || 0) * 100),
    Distressed: Math.round((e.probs.Distressed || 0) * 100),
    Overwhelmed: Math.round((e.probs.Overwhelmed || 0) * 100),
  }));

  const counts = history.reduce((acc, e) => { acc[e.state] = (acc[e.state] || 0) + 1; return acc; }, {} as Record<string, number>);
  const total = history.length || 1;
  const crisisCount = history.filter(e => e.is_crisis).length;

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
        {patient && (
          <div>
            <h1 className="text-2xl font-black">{patient.name}</h1>
            <p className="text-sm text-muted-foreground font-bold">{patient.email}{patient.age ? ` · Age ${patient.age}` : ""}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : !patient ? (
        <div className="calm-card p-12 text-center border-4 border-foreground shadow-pop">
          <p className="text-xl font-black text-muted-foreground">Patient not found or not linked to you.</p>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-up-delay-1">
          <TabsList className="mb-8 w-full justify-start h-auto p-1.5 bg-muted rounded-2xl overflow-x-auto flex-nowrap shrink-0 border-2 border-foreground/10">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-background data-[state=active]:border-foreground data-[state=active]:shadow-pop-sm border-2 border-transparent rounded-xl py-3 px-6 text-sm font-bold flex gap-2 transition-all">
              <BarChart3 className="w-4 h-4" /> Emotion Analytics
            </TabsTrigger>
            <TabsTrigger value="risk" className="data-[state=active]:bg-background data-[state=active]:border-foreground data-[state=active]:shadow-pop-sm border-2 border-transparent rounded-xl py-3 px-6 text-sm font-bold flex gap-2 transition-all">
              <ActivitySquare className="w-4 h-4" /> Risk Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="m-0 border-none p-0 outline-none space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: "Calm", emoji: "😌", color: "bg-green-100 border-green-400 text-green-800" },
                { key: "Happy", emoji: "😊", color: "bg-yellow-100 border-yellow-400 text-yellow-800" },
                { key: "Distressed", emoji: "😰", color: "bg-orange-100 border-orange-400 text-orange-800" },
                { key: "Overwhelmed", emoji: "🤯", color: "bg-red-100 border-red-400 text-red-800" },
              ].map(({ key, emoji, color }) => (
                <div key={key} className={`calm-card border-4 border-foreground shadow-pop p-4 text-center ${color}`}>
                  <div className="text-3xl mb-1">{emoji}</div>
                  <div className="font-black text-2xl">{Math.round(((counts[key] || 0) / total) * 100)}%</div>
                  <div className="text-xs font-black uppercase tracking-widest">{key}</div>
                  <div className="text-xs font-bold mt-1">{counts[key] || 0} events</div>
                </div>
              ))}
            </div>

            <div className="calm-card border-4 border-foreground shadow-pop p-4 flex items-center gap-4 bg-red-50">
              <div className="text-3xl">🚨</div>
              <div>
                <div className="font-black text-xl text-red-800">{crisisCount} Crisis Events</div>
                <div className="text-sm font-bold text-red-600">Overwhelmed states exceeding 65% confidence</div>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="calm-card p-12 text-center border-4 border-foreground shadow-pop">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-xl font-black text-muted-foreground">No emotion data yet.</p>
                <p className="text-muted-foreground mt-2">Data appears once the child uses the Feelings page with camera on.</p>
              </div>
            ) : (
              <div className="calm-card border-4 border-foreground shadow-pop p-6">
                <h3 className="text-lg font-black mb-4">Emotion Probability Over Time ({history.length} readings)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
                    <YAxis tick={{ fontSize: 11, fontWeight: 700 }} unit="%" />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <Legend />
                    <Area type="monotone" dataKey="Calm" stroke="#22c55e" fill="#dcfce7" strokeWidth={2} />
                    <Area type="monotone" dataKey="Happy" stroke="#eab308" fill="#fef9c3" strokeWidth={2} />
                    <Area type="monotone" dataKey="Distressed" stroke="#f97316" fill="#ffedd5" strokeWidth={2} />
                    <Area type="monotone" dataKey="Overwhelmed" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent emotion log */}
            {history.length > 0 && (
              <div className="calm-card border-4 border-foreground shadow-pop p-6">
                <h3 className="text-lg font-black mb-4">Recent Emotion Log</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.slice(0, 20).map(e => (
                    <div key={e.id} className={`flex items-center justify-between p-3 rounded-xl border-2 ${e.is_crisis ? "bg-red-50 border-red-300" : "bg-background border-foreground/10"}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{e.state === "Calm" ? "😌" : e.state === "Happy" ? "😊" : e.state === "Distressed" ? "😰" : "🤯"}</span>
                        <div>
                          <span className="font-black text-sm">{e.state}</span>
                          {e.is_crisis && <span className="ml-2 text-xs font-black text-red-600 bg-red-100 px-2 py-0.5 rounded-full">CRISIS</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-muted-foreground">{Math.round(e.confidence * 100)}% conf</div>
                        <div className="text-xs text-muted-foreground">{new Date(e.logged_at).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="risk" className="m-0 border-none p-0 outline-none space-y-6">
            <div className="calm-card border-4 border-foreground shadow-pop p-8">
              <h3 className="text-2xl font-black mb-6">Risk Assessment for {patient.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200">
                    <div className="font-black text-red-800 mb-1">Crisis Events</div>
                    <div className="text-3xl font-black text-red-600">{crisisCount}</div>
                    <div className="text-sm text-red-700 font-bold">Overwhelmed states detected</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-orange-50 border-2 border-orange-200">
                    <div className="font-black text-orange-800 mb-1">Distress Rate</div>
                    <div className="text-3xl font-black text-orange-600">{Math.round(((counts["Distressed"] || 0) / total) * 100)}%</div>
                    <div className="text-sm text-orange-700 font-bold">Of all recorded states</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-green-50 border-2 border-green-200">
                    <div className="font-black text-green-800 mb-1">Calm Rate</div>
                    <div className="text-3xl font-black text-green-600">{Math.round(((counts["Calm"] || 0) / total) * 100)}%</div>
                    <div className="text-sm text-green-700 font-bold">Of all recorded states</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200">
                    <div className="font-black text-blue-800 mb-1">Total Readings</div>
                    <div className="text-3xl font-black text-blue-600">{history.length}</div>
                    <div className="text-sm text-blue-700 font-bold">Emotion data points collected</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </DoctorShell>
  );
}
