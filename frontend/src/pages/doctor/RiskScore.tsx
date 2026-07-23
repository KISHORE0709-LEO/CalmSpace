import { useState, useMemo } from "react";
// Removed DoctorShell import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceArea, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, ActivitySquare, FileText, Download, Bell, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

const generateTrendData = (days: number) => {
  const data = [];
  const now = new Date();
  
  let currentScore = 25;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Narrative: score was low, but spiked over the last 3-4 days due to a sleep/routine disruption
    if (i <= 3) {
      currentScore = Math.min(currentScore + 8 + Math.random() * 10, 80); // Rises into yellow/red
    } else if (i === 4) {
      currentScore = 48; // Trigger event
    } else {
      currentScore = 20 + Math.random() * 12; // Baseline low (green)
    }
    
    data.push({ date: dateStr, riskScore: Math.round(currentScore) });
  }
  return data;
};

const contributingFactors = [
  { name: "Sleep disruption pattern (48h)", weight: 85, impact: "High", color: "bg-red-500" },
  { name: "Frequency of Overloaded states", weight: 65, impact: "High", color: "bg-red-500" },
  { name: "HRV variability trend", weight: 45, impact: "Medium", color: "bg-yellow-500" },
  { name: "Missed morning check-ins", weight: 20, impact: "Low", color: "bg-green-500" },
];

const alertHistory = [
  { id: 1, date: "Today, 09:30 AM", level: "Moderate", score: 58, notified: true, action: "Monitored" },
  { id: 2, date: "Yesterday, 14:15 PM", level: "Moderate", score: 52, notified: true, action: "Adjusted care plan" },
  { id: 3, date: "4 Days ago, 18:00 PM", level: "Low", score: 32, notified: false, action: "None" },
];

const getZoneConfig = (score: number) => {
  if (score >= 67) return { label: "High Risk", color: "#ef4444", textClass: "text-red-600", bgClass: "bg-red-100 border-red-200" };
  if (score >= 34) return { label: "Moderate Risk", color: "#eab308", textClass: "text-yellow-600", bgClass: "bg-yellow-100 border-yellow-200" };
  return { label: "Low Risk", color: "#22c55e", textClass: "text-green-600", bgClass: "bg-green-100 border-green-200" };
};

const RiskScore = () => {
  const [dateRange, setDateRange] = useState("30");
  const [clinicalNote, setClinicalNote] = useState("Risk aligns with recent school schedule change and reported sleep disruptions. Recommend caregiver briefing on adjusting evening wind-down routine.");

  const trendData = useMemo(() => generateTrendData(parseInt(dateRange)), [dateRange]);
  const currentScore = trendData[trendData.length - 1].riskScore;
  const currentZone = getZoneConfig(currentScore);

  const gaugeData = [
    { value: currentScore, fill: currentZone.color },
    { value: 100 - currentScore, fill: "hsl(var(--muted))" }
  ];

  return (
    <div className="w-full">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4 animate-fade-up">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 text-primary border-2 border-foreground flex items-center justify-center shadow-pop-sm text-2xl font-black">
            L
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight leading-none mb-1">Leo Jenkins</h1>
            <p className="text-muted-foreground font-bold">LSTM Risk Assessment • 8 yrs</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
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
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Current Risk Gauge Hero */}
        <div className="calm-card p-8 animate-fade-up flex flex-col items-center justify-center text-center relative overflow-hidden">
          <h3 className="text-xl font-black mb-6 w-full text-left">Current Model Assessment</h3>
          
          <div className="w-full h-[200px] relative flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="100%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={110}
                  outerRadius={140}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Inner text */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center pb-2">
              <span className="text-6xl font-black tracking-tighter" style={{ color: currentZone.color }}>
                {currentScore}
              </span>
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">/ 100</span>
            </div>
          </div>
          
          <div className={`mt-6 px-6 py-2 rounded-full border-2 text-lg font-black ${currentZone.bgClass} ${currentZone.textClass}`}>
            {currentZone.label}
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="lg:col-span-2 calm-card p-6 animate-fade-up-delay-1 flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black mb-1">Contributing Factors</h3>
              <p className="text-sm text-muted-foreground font-medium">LSTM feature importance (normalized weights)</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground border-2 border-foreground flex items-center justify-center">
              <ActivitySquare className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center space-y-5">
            {contributingFactors.map((factor, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold">{factor.name}</span>
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">{factor.impact} Impact</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden border-2 border-border/20">
                  <div 
                    className={`h-full ${factor.color} transition-all duration-1000`} 
                    style={{ width: `${factor.weight}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Trend Line with Shaded Zones */}
        <div className="lg:col-span-2 calm-card p-6 animate-fade-up flex flex-col min-h-[400px]">
          <div className="mb-6">
            <h3 className="text-xl font-black mb-1">Risk Trajectory</h3>
            <p className="text-sm text-muted-foreground font-medium">Score changes over the selected timeframe</p>
          </div>
          <div className="flex-1 w-full h-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                {/* Background Shaded Zones */}
                <ReferenceArea y1={0} y2={33} fill="#22c55e" fillOpacity={0.1} />
                <ReferenceArea y1={34} y2={66} fill="#eab308" fillOpacity={0.1} />
                <ReferenceArea y1={67} y2={100} fill="#ef4444" fillOpacity={0.1} />
                
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12, fontWeight: 700}} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{fontSize: 12, fontWeight: 700}} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: '2px solid hsl(0 0% 8%)', fontWeight: 'bold', boxShadow: '4px 4px 0 0 hsl(0 0% 8%)', background: 'hsl(var(--background))' }}
                />
                
                <Line 
                  type="monotone" 
                  dataKey="riskScore" 
                  name="Risk Score" 
                  stroke="#000000" 
                  strokeWidth={4} 
                  dot={{r: 4, strokeWidth: 2, fill: '#fff'}} 
                  activeDot={{r: 6, fill: '#000'}} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8 animate-fade-up-delay-2">
          {/* Predicted Risk Window */}
          <div className="calm-card p-6 bg-accent border-2 border-foreground">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-background border-2 border-foreground flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h4 className="font-black text-lg mb-1">Predicted Vulnerability Window</h4>
                <p className="text-sm font-medium leading-relaxed">
                  The model predicts elevated risk of Overloaded states during <strong className="font-black">Weekday afternoons (2 PM - 4 PM)</strong> due to compounded physiological fatigue and routine transitions.
                </p>
              </div>
            </div>
          </div>

          {/* Clinical Note Field */}
          <div className="calm-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black flex items-center gap-2">
                <FileText className="w-5 h-5" /> Clinical Note
              </h3>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground">
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
            </div>
            <textarea 
              className="w-full h-32 p-4 rounded-xl border-2 border-foreground shadow-pop-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary font-medium text-sm leading-relaxed"
              value={clinicalNote}
              onChange={(e) => setClinicalNote(e.target.value)}
              placeholder="Add your clinical observations here..."
            />
          </div>
        </div>
      </div>

      {/* Alert History */}
      <div className="calm-card p-6 animate-fade-up-delay-3 overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black mb-1">Model Alert History</h3>
            <p className="text-sm text-muted-foreground font-medium">Past automated risk escalations</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-background border-2 border-foreground flex items-center justify-center shadow-pop-sm">
            <Bell className="w-4 h-4 text-foreground" />
          </div>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-foreground">
                <th className="pb-3 font-black">Timestamp</th>
                <th className="pb-3 font-black">Risk Level</th>
                <th className="pb-3 font-black">Score</th>
                <th className="pb-3 font-black">Parent Notified</th>
                <th className="pb-3 font-black">Doctor Action</th>
              </tr>
            </thead>
            <tbody className="font-medium">
              {alertHistory.map((alert) => {
                const zone = getZoneConfig(alert.score);
                return (
                  <tr key={alert.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-4">{alert.date}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${zone.bgClass} ${zone.textClass}`}>
                        {alert.level}
                      </span>
                    </td>
                    <td className="py-4 font-black">{alert.score}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${alert.notified ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {alert.notified ? 'Yes (Automated)' : 'No'}
                      </span>
                    </td>
                    <td className="py-4">
                      <Select defaultValue={alert.action}>
                        <SelectTrigger className="w-[180px] h-9 border-2 border-foreground bg-background font-bold text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Monitored">Monitored</SelectItem>
                          <SelectItem value="Contacted parent">Contacted parent</SelectItem>
                          <SelectItem value="Adjusted care plan">Adjusted care plan</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default RiskScore;
