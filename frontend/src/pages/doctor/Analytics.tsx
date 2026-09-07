import { useState, useMemo } from "react";
// Removed DoctorShell import
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Activity, Download, Brain, Clock, AlertTriangle } from "lucide-react";

// Colors for emotion states
const COLORS = {
  Calm: "#22c55e", // green-500
  Mild: "#eab308", // yellow-500
  Anxious: "#f97316", // orange-500
  Overloaded: "#ef4444", // red-500
};

const EMOTION_MAP = {
  Calm: { color: COLORS.Calm, icon: "😌" },
  Mild: { color: COLORS.Mild, icon: "😐" },
  Anxious: { color: COLORS.Anxious, icon: "😰" },
  Overloaded: { color: COLORS.Overloaded, icon: "🤯" },
};

// Mock data generation function based on date range
const generateMockData = (days: number) => {
  const fusionData = [];
  const correlationData = [];
  
  let calmCount = 0;
  let mildCount = 0;
  let anxiousCount = 0;
  let overloadedCount = 0;
  
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    // Create realistic looking physiological variations
    // Make weekends slightly calmer
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const baseHrv = isWeekend ? 65 : 45;
    
    // Add some random noise
    const noise = Math.floor(Math.random() * 30) - 15;
    let hrv = baseHrv + noise;
    
    // Calculate facial confidence based on HRV loosely (lower HRV -> higher stress -> lower confidence in 'calm' expression)
    // We'll normalize it to a 0-1 scale
    let facialConfidence = (Math.random() * 0.4) + (hrv > 50 ? 0.5 : 0.1);
    facialConfidence = Math.min(Math.max(facialConfidence, 0), 1);
    
    // Determine dominant emotion for the day based on HRV
    let dominantEmotion = "Calm";
    if (hrv < 30) { dominantEmotion = "Overloaded"; overloadedCount++; }
    else if (hrv < 45) { dominantEmotion = "Anxious"; anxiousCount++; }
    else if (hrv < 55) { dominantEmotion = "Mild"; mildCount++; }
    else { dominantEmotion = "Calm"; calmCount++; }

    // Hardcode a spike pattern for testing realism: e.g. every Monday (1)
    if (d.getDay() === 1) {
      hrv -= 20; // lower HRV
      facialConfidence = 0.2;
      dominantEmotion = "Anxious";
      anxiousCount++;
      if (hrv < 30) calmCount--; // fix counts roughly
    }

    fusionData.push({
      date: dateStr,
      hrv: Math.max(hrv, 10), // Keep above 10
      facialConfidence: parseFloat(facialConfidence.toFixed(2))
    });
    
    correlationData.push({
      date: dateStr,
      emotion: dominantEmotion,
      color: COLORS[dominantEmotion as keyof typeof COLORS]
    });
  }
  
  const total = calmCount + mildCount + anxiousCount + overloadedCount;
  
  const emotionDistribution = [
    { name: "Calm", value: Math.round((calmCount/total)*100), fill: COLORS.Calm },
    { name: "Mildly Stressed", value: Math.round((mildCount/total)*100), fill: COLORS.Mild },
    { name: "Anxious", value: Math.round((anxiousCount/total)*100), fill: COLORS.Anxious },
    { name: "Overloaded", value: Math.round((overloadedCount/total)*100), fill: COLORS.Overloaded },
  ];

  // Some mock logs that correlate with the data
  const logs = [
    { id: 1, time: "Yesterday, 3:00 PM", trigger: "Loud Noise", note: "Loud classroom transition caused distress.", emotion: "Overloaded" },
    { id: 2, time: "2 days ago, 9:15 AM", trigger: "Routine Change", note: "Substitute teacher today, seemed very anxious.", emotion: "Anxious" },
    { id: 3, time: "5 days ago, 12:30 PM", trigger: "Social", note: "Argument during recess.", emotion: "Mild" },
  ];

  return { fusionData, correlationData, emotionDistribution, logs };
};

const Analytics = () => {
  const [dateRange, setDateRange] = useState("30"); // default to 30 days
  
  const { fusionData, correlationData, emotionDistribution, logs } = useMemo(() => {
    return generateMockData(parseInt(dateRange));
  }, [dateRange]);

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
            <p className="text-muted-foreground font-bold">Patient Analytics • 8 yrs</p>
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
            <Download className="w-4 h-4 mr-2" /> Export View
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="calm-card p-6 flex items-center gap-4 animate-fade-up-delay-1">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center border-2 border-green-200">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Avg. Daily Calm</p>
            <p className="text-2xl font-black">{emotionDistribution[0].value}%</p>
          </div>
        </div>
        <div className="calm-card p-6 flex items-center gap-4 animate-fade-up-delay-2">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center border-2 border-red-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Logged Incidents</p>
            <p className="text-2xl font-black">{logs.length}</p>
          </div>
        </div>
        <div className="calm-card p-6 flex items-center gap-4 animate-fade-up-delay-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center border-2 border-blue-200">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Frequent Trigger</p>
            <p className="text-xl font-black truncate">Routine Change</p>
          </div>
        </div>
        <div className="calm-card p-6 flex items-center gap-4 animate-fade-up-delay-3">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center border-2 border-yellow-200">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-muted-foreground">Longest Calm Streak</p>
            <p className="text-2xl font-black">4 Days</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Fusion Trend Line */}
        <div className="lg:col-span-2 calm-card p-6 animate-fade-up flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-black mb-1">Fusion Analytics: HRV & Facial Expression</h3>
            <p className="text-sm text-muted-foreground font-medium">Tracking physiological signals vs AI facial confidence (0.4 / 0.6 weighting)</p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fusionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 12, fontWeight: 700}} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" tick={{fontSize: 12, fontWeight: 700}} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12, fontWeight: 700}} tickLine={false} axisLine={false} domain={[0, 1]} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: '2px solid hsl(0 0% 8%)', fontWeight: 'bold', boxShadow: '4px 4px 0 0 hsl(0 0% 8%)', background: 'hsl(var(--background))' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', fontSize: '14px' }}/>
                <Line yAxisId="left" type="monotone" dataKey="hrv" name="Physiological (HRV)" stroke="#3b82f6" strokeWidth={4} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line yAxisId="right" type="monotone" dataKey="facialConfidence" name="Facial Confidence" stroke="#a855f7" strokeWidth={4} strokeDasharray="5 5" dot={{r: 4, strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Distribution Donut */}
        <div className="calm-card p-6 animate-fade-up flex flex-col">
          <div className="mb-2">
            <h3 className="text-xl font-black mb-1">Emotion Distribution</h3>
            <p className="text-sm text-muted-foreground font-medium">% time in each state</p>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emotionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {emotionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => [`${value}%`, 'Time']}
                  contentStyle={{ borderRadius: '12px', border: '2px solid hsl(0 0% 8%)', fontWeight: 'bold', background: 'hsl(var(--background))' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-y-3 mt-4">
            {emotionDistribution.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border border-foreground shrink-0" style={{ backgroundColor: entry.fill }} />
                <span className="text-sm font-bold">{entry.name} ({entry.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Emotion Correlation Strip */}
        <div className="lg:col-span-2 calm-card p-6 animate-fade-up">
          <div className="mb-6">
            <h3 className="text-xl font-black mb-1">Emotion Correlation Strip</h3>
            <p className="text-sm text-muted-foreground font-medium">Daily dominant emotion patterns over the selected period</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {correlationData.map((day, i) => (
              <div 
                key={i} 
                className="group relative w-8 h-12 rounded-md border-2 border-foreground/10 hover:border-foreground transition-all cursor-crosshair hover:scale-110 hover:shadow-pop-sm hover:z-10"
                style={{ backgroundColor: day.color }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                  {day.date}<br/>{day.emotion}
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

        {/* Context Notes / Logs */}
        <div className="calm-card p-6 animate-fade-up">
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
            {logs.map(log => (
              <div key={log.id} className="p-4 rounded-xl border-2 border-border/50 bg-background hover:border-foreground transition-colors cursor-default">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-muted-foreground">{log.time}</span>
                  <span className="text-lg leading-none" title={log.emotion}>{EMOTION_MAP[log.emotion as keyof typeof EMOTION_MAP].icon}</span>
                </div>
                <div className="mb-2">
                  <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded-md border border-primary/20">
                    Trigger: {log.trigger}
                  </span>
                </div>
                <p className="text-sm font-medium">{log.note}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
