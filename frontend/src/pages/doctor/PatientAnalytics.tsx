import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DoctorShell } from "@/components/DoctorShell";
import { ArrowLeft, BarChart3, ActivitySquare, Activity, Download, Brain, Clock, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { careTeamApi, LinkedChild, EmotionEntry } from "@/lib/careTeamApi";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS: Record<string, string> = {
  Calm: "#22c55e", Happy: "#3b82f6", Distressed: "#f97316", Overwhelmed: "#ef4444",
  Mild: "#eab308", Anxious: "#f97316", Overloaded: "#ef4444",
};
const EMOTION_MAP = {
  Calm: { color: COLORS.Calm, icon: "😌" },
  Happy: { color: COLORS.Happy, icon: "😊" },
  Distressed: { color: COLORS.Distressed, icon: "😰" },
  Overwhelmed: { color: COLORS.Overwhelmed, icon: "🤯" },
};

function generateMockData(days: number) {
  const fusionData = [];
  const correlationData = [];
  let calmCount = 0, mildCount = 0, anxiousCount = 0, overloadedCount = 0;
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const noise = Math.floor(Math.random() * 30) - 15;
    let hrv = (isWeekend ? 65 : 45) + noise;
    let facialConfidence = Math.min(Math.max((Math.random() * 0.4) + (hrv > 50 ? 0.5 : 0.1), 0), 1);
    let dominantEmotion = "Calm";
    if (hrv < 30) { dominantEmotion = "Overloaded"; overloadedCount++; }
    else if (hrv < 45) { dominantEmotion = "Anxious"; anxiousCount++; }
    else if (hrv < 55) { dominantEmotion = "Mild"; mildCount++; }
    else { dominantEmotion = "Calm"; calmCount++; }
    if (d.getDay() === 1) { hrv -= 20; facialConfidence = 0.2; dominantEmotion = "Anxious"; anxiousCount++; }
    fusionData.push({ date: dateStr, hrv: Math.max(hrv, 10), facialConfidence: parseFloat(facialConfidence.toFixed(2)) });
    correlationData.push({ date: dateStr, emotion: dominantEmotion, color: COLORS[dominantEmotion] });
  }
  const total = Math.max(calmCount + mildCount + anxiousCount + overloadedCount, 1);
  const emotionDistribution = [
    { name: "Calm", value: Math.round((calmCount / total) * 100), fill: COLORS.Calm },
    { name: "Mildly Stressed", value: Math.round((mildCount / total) * 100), fill: COLORS.Mild },
    { name: "Anxious", value: Math.round((anxiousCount / total) * 100), fill: COLORS.Anxious },
    { name: "Overloaded", value: Math.round((overloadedCount / total) * 100), fill: COLORS.Overloaded },
  ];
  const logs = [
    { id: 1, time: "Yesterday, 3:00 PM", trigger: "Loud Noise", note: "Loud classroom transition caused distress.", emotion: "Overloaded" },
    { id: 2, time: "2 days ago, 9:15 AM", trigger: "Routine Change", note: "Substitute teacher today, seemed very anxious.", emotion: "Anxious" },
    { id: 3, time: "5 days ago, 12:30 PM", trigger: "Social", note: "Argument during recess.", emotion: "Mild" },
  ];
  return { fusionData, correlationData, emotionDistribution, logs, calmCount, overloadedCount, anxiousCount };
}

export default function PatientAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"analytics" | "risk">("analytics");
  const [dateRange, setDateRange] = useState("30");
  const [patient, setPatient] = useState<LinkedChild | null>(null);
  const [history, setHistory] = useState<EmotionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    careTeamApi.getMyChildren(user.uid).then(children => {
      const found = children.find(c => c.id === parseInt(id));
      setPatient(found || null);
      if (found) {
        careTeamApi.getHistory(found.id, user.uid, 100)
          .then(setHistory)
          .catch(() => setHistory([]))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, [user, id]);

  const hasRealData = history.length > 0;

  // Real data charts
  const realChartData = history.slice().reverse().map(e => ({
    name: new Date(e.logged_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    Calm: Math.round((e.probs.Calm || 0) * 100),
    Happy: Math.round((e.probs.Happy || 0) * 100),
    Distressed: Math.round((e.probs.Distressed || 0) * 100),
    Overwhelmed: Math.round((e.probs.Overwhelmed || 0) * 100),
  }));
  const counts = history.reduce((acc, e) => { acc[e.state] = (acc[e.state] || 0) + 1; return acc; }, {} as Record<string, number>);
  const total = history.length || 1;
  const crisisCount = history.filter(e => e.is_crisis).length;

  // Mock data for when no real data yet
  const mock = useMemo(() => generateMockData(parseInt(dateRange)), [dateRange]);

  return (
    <DoctorShell fullWidth>
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 animate-fade-up">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/doctor/patients")}
            className="hover:-translate-x-1 transition-transform border-2 border-foreground shadow-pop-sm font-bold rounded-xl h-12"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          {patient ? (
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/20 text-primary border-2 border-foreground flex items-center justify-center shadow-pop-sm text-2xl font-black">
                {patient.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight leading-none mb-1">{patient.name}</h1>
                <p className="text-muted-foreground font-bold">Patient Analytics{patient.age ? ` • ${patient.age} yrs` : ""}</p>
              </div>
            </div>
          ) : !loading && (
            <h1 className="text-2xl font-black">Patient Analytics</h1>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px] h-12 border-2 border-foreground shadow-pop-sm font-bold bg-background rounded-xl">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button className="h-12 border-2 border-foreground shadow-pop-sm hover:-translate-y-1 hover:shadow-pop transition-all bg-secondary text-secondary-foreground font-black rounded-xl">
            <Download className="w-4 h-4 mr-2" /> Export View
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : !patient ? (
        <div className="calm-card p-12 text-center border-4 border-foreground shadow-pop">
          <p className="text-xl font-black text-muted-foreground">Patient not found or not linked to you.</p>
          <p className="text-sm text-muted-foreground mt-2">Ask the parent to invite you from their Manage Care Team page.</p>
        </div>
      ) : (
        <>
          {/* Tab switcher */}
          <div className="flex gap-2 mb-8 p-1.5 bg-muted rounded-2xl border-2 border-foreground/10 w-fit">
            {(["analytics", "risk"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                  activeTab === tab
                    ? "bg-background border-foreground shadow-pop-sm"
                    : "border-transparent hover:bg-background/50"
                }`}
              >
                {tab === "analytics" ? <BarChart3 className="w-4 h-4" /> : <ActivitySquare className="w-4 h-4" />}
                {tab === "analytics" ? "Emotion Analytics" : "Risk Overview"}
              </button>
            ))}
          </div>

          {activeTab === "analytics" && (
            <div className="space-y-8 animate-fade-up">
              {/* Summary stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="calm-card p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center border-2 border-green-200"><Activity className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">Avg. Daily Calm</p>
                    <p className="text-2xl font-black">{hasRealData ? Math.round(((counts["Calm"] || 0) / total) * 100) : mock.emotionDistribution[0].value}%</p>
                  </div>
                </div>
                <div className="calm-card p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center border-2 border-red-200"><AlertTriangle className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">Crisis Events</p>
                    <p className="text-2xl font-black">{hasRealData ? crisisCount : mock.overloadedCount}</p>
                  </div>
                </div>
                <div className="calm-card p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center border-2 border-blue-200"><Brain className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">Frequent Trigger</p>
                    <p className="text-xl font-black truncate">Routine Change</p>
                  </div>
                </div>
                <div className="calm-card p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center border-2 border-yellow-200"><Clock className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">Total Readings</p>
                    <p className="text-2xl font-black">{hasRealData ? history.length : "—"}</p>
                  </div>
                </div>
              </div>

              {hasRealData ? (
                /* Real data view */
                <>
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
                  <div className="calm-card border-4 border-foreground shadow-pop p-6">
                    <h3 className="text-lg font-black mb-4">Emotion Probability Over Time ({history.length} readings)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={realChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
                </>
              ) : (
                /* Mock / preview UI when no real data yet */
                <>
                  <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl px-5 py-3 text-sm font-bold text-amber-800 flex items-center gap-2">
                    <span>📊</span> Showing preview data — real readings will appear once {patient.name} uses the Feelings page with camera on.
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 calm-card p-6 flex flex-col">
                      <div className="mb-6">
                        <h3 className="text-xl font-black mb-1">Fusion Analytics: HRV & Facial Expression</h3>
                        <p className="text-sm text-muted-foreground font-medium">Physiological signals vs AI facial confidence (0.4 / 0.6 weighting)</p>
                      </div>
                      <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={mock.fusionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" tick={{ fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} domain={[0, 1]} />
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "2px solid hsl(0 0% 8%)", fontWeight: "bold", background: "hsl(var(--background))" }} />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px", fontWeight: "bold", fontSize: "14px" }} />
                            <Line yAxisId="left" type="monotone" dataKey="hrv" name="Physiological (HRV)" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            <Line yAxisId="right" type="monotone" dataKey="facialConfidence" name="Facial Confidence" stroke="#a855f7" strokeWidth={4} strokeDasharray="5 5" dot={{ r: 4, strokeWidth: 2 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="calm-card p-6 flex flex-col">
                      <div className="mb-2">
                        <h3 className="text-xl font-black mb-1">Emotion Distribution</h3>
                        <p className="text-sm text-muted-foreground font-medium">% time in each state</p>
                      </div>
                      <div className="flex-1 flex items-center justify-center min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={mock.emotionDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                              {mock.emotionDistribution.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip formatter={(v) => [`${v}%`, "Time"]} contentStyle={{ borderRadius: "12px", border: "2px solid hsl(0 0% 8%)", fontWeight: "bold", background: "hsl(var(--background))" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid grid-cols-2 gap-y-3 mt-4">
                        {mock.emotionDistribution.map((entry, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-foreground shrink-0" style={{ backgroundColor: entry.fill }} />
                            <span className="text-sm font-bold">{entry.name} ({entry.value}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 calm-card p-6">
                      <div className="mb-6">
                        <h3 className="text-xl font-black mb-1">Emotion Correlation Strip</h3>
                        <p className="text-sm text-muted-foreground font-medium">Daily dominant emotion patterns over the selected period</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {mock.correlationData.map((day, i) => (
                          <div key={i} className="group relative w-8 h-12 rounded-md border-2 border-foreground/10 hover:border-foreground transition-all cursor-crosshair hover:scale-110 hover:shadow-pop-sm hover:z-10" style={{ backgroundColor: day.color }}>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                              {day.date}<br />{day.emotion}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-6 mt-6 justify-center flex-wrap">
                        {Object.entries(EMOTION_MAP).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2 text-sm font-bold">
                            <div className="w-4 h-4 rounded-sm border-2 border-foreground" style={{ backgroundColor: val.color }} />
                            {key} {val.icon}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="calm-card p-6">
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-black mb-1">Context Notes</h3>
                          <p className="text-sm text-muted-foreground font-medium">Recent caregiver logs</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground border-2 border-foreground flex items-center justify-center">
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        {mock.logs.map(log => (
                          <div key={log.id} className="p-4 rounded-xl border-2 border-border/50 bg-background hover:border-foreground transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-black text-muted-foreground">{log.time}</span>
                              <span className="text-lg leading-none">{EMOTION_MAP[log.emotion as keyof typeof EMOTION_MAP]?.icon}</span>
                            </div>
                            <div className="mb-2">
                              <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded-md border border-primary/20">Trigger: {log.trigger}</span>
                            </div>
                            <p className="text-sm font-medium">{log.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "risk" && (
            <div className="calm-card border-4 border-foreground shadow-pop p-8 animate-fade-up">
              <h3 className="text-2xl font-black mb-6">Risk Assessment for {patient.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200">
                    <div className="font-black text-red-800 mb-1">Crisis Events</div>
                    <div className="text-3xl font-black text-red-600">{hasRealData ? crisisCount : mock.overloadedCount}</div>
                    <div className="text-sm text-red-700 font-bold">Overwhelmed states detected</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-orange-50 border-2 border-orange-200">
                    <div className="font-black text-orange-800 mb-1">Distress Rate</div>
                    <div className="text-3xl font-black text-orange-600">{hasRealData ? Math.round(((counts["Distressed"] || 0) / total) * 100) : mock.emotionDistribution[2].value}%</div>
                    <div className="text-sm text-orange-700 font-bold">Of all recorded states</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-green-50 border-2 border-green-200">
                    <div className="font-black text-green-800 mb-1">Calm Rate</div>
                    <div className="text-3xl font-black text-green-600">{hasRealData ? Math.round(((counts["Calm"] || 0) / total) * 100) : mock.emotionDistribution[0].value}%</div>
                    <div className="text-sm text-green-700 font-bold">Of all recorded states</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200">
                    <div className="font-black text-blue-800 mb-1">Total Readings</div>
                    <div className="text-3xl font-black text-blue-600">{hasRealData ? history.length : "—"}</div>
                    <div className="text-sm text-blue-700 font-bold">{hasRealData ? "Emotion data points collected" : "No real data yet"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DoctorShell>
  );
}
