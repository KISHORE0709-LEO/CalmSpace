import { ParentShell } from "@/components/ParentShell";
import { 
  TrendingUp, 
  Calendar, 
  Video, 
  Play, 
  Filter, 
  Download, 
  Check, 
  Flame, 
  MapPin, 
  ChevronDown 
} from "lucide-react";

const SessionReports = () => {
  return (
    <ParentShell title="" subtitle="" fullWidth>
      <div className="w-full max-w-[96%] mx-auto pt-4 h-full flex flex-col">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight mb-2">Therapy Session Reports</h1>
            <p className="text-lg font-bold text-muted-foreground opacity-90">Detailed history and growth analysis for Leo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* OVERALL PROGRESS */}
            <div className="calm-card bg-card border-4 border-foreground shadow-pop-lg rounded-[2rem] p-8 flex flex-col">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-3xl font-black text-foreground mb-1">Overall Progress</h2>
                  <p className="text-sm font-bold text-muted-foreground">Consistent improvement across all therapies</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-5xl font-black text-primary tracking-tighter">78<span className="text-2xl">%</span></div>
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded-full border-2 border-primary font-black text-xs flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +12% vs last month
                  </div>
                </div>
              </div>
              
              {/* Bar Chart Area */}
              <div className="h-48 w-full bg-muted/30 rounded-2xl border-4 border-foreground flex items-end p-6 gap-3 md:gap-6 overflow-hidden relative shadow-inner">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-4 py-8 opacity-20">
                  <div className="w-full border-b-2 border-dashed border-foreground" />
                  <div className="w-full border-b-2 border-dashed border-foreground" />
                  <div className="w-full border-b-2 border-dashed border-foreground" />
                </div>
                
                {/* Bars */}
                {[40, 50, 70, 65, 85, 95].map((height, i) => (
                  <div key={i} className="flex-1 group relative h-full flex items-end z-10">
                    <div 
                      className="w-full bg-secondary border-2 md:border-4 border-foreground rounded-t-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-primary"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: "Total Sessions", val: "48", icon: Calendar, color: "text-blue-500", bg: "bg-blue-100" },
                { label: "Live Sessions", val: "32", icon: Video, color: "text-green-500", bg: "bg-green-100" },
                { label: "Recorded", val: "16", icon: Play, color: "text-amber-500", bg: "bg-amber-100" },
              ].map((stat, i) => (
                <div key={i} className="calm-card bg-card border-4 border-foreground shadow-pop rounded-[1.5rem] p-6 flex items-center gap-4">
                  <div className={`w-14 h-14 ${stat.bg} border-4 border-foreground rounded-xl shadow-pop-sm flex items-center justify-center shrink-0`}>
                    <stat.icon className={`w-6 h-6 ${stat.color} stroke-[3]`} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                    <div className="text-3xl font-black text-foreground">{stat.val}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* RECENT SESSIONS */}
            <div className="calm-card bg-card border-4 border-foreground shadow-pop-lg rounded-[2rem] overflow-hidden flex flex-col">
              <div className="p-6 md:p-8 border-b-4 border-foreground flex justify-between items-center bg-accent/20">
                <h2 className="text-2xl font-black">Recent Sessions</h2>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 bg-background border-4 border-foreground rounded-xl px-4 py-2 font-black text-sm shadow-pop-sm hover:-translate-y-1 transition-transform">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                  <button className="flex items-center gap-2 bg-background border-4 border-foreground rounded-xl px-4 py-2 font-black text-sm shadow-pop-sm hover:-translate-y-1 transition-transform text-primary">
                    <Download className="w-4 h-4" /> Export
                  </button>
                </div>
              </div>
              
              <div className="p-6 md:p-8 flex flex-col gap-6">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 text-[10px] font-black text-muted-foreground uppercase tracking-widest pb-4 border-b-4 border-foreground/10">
                  <div className="col-span-3">Session Details</div>
                  <div className="col-span-3">Type</div>
                  <div className="col-span-3">Provider</div>
                  <div className="col-span-3 text-right">Outcome</div>
                </div>

                {/* Rows */}
                {[
                  { date: "Oct 24, 2023", time: "10:30 AM", type: "Speech", isLive: true, provider: "Dr. Sarah J.", img: "12", score: "85%", outcome: "HIGH ENGAGEMENT" },
                  { date: "Oct 22, 2023", time: "03:15 PM", type: "Behavioral", isLive: false, provider: "BuddyBot Guide", img: "bot", score: "72%", outcome: "COMPLETED" },
                  { date: "Oct 20, 2023", time: "09:00 AM", type: "Occupational", isLive: true, provider: "Mark R.", img: "11", score: "92%", outcome: "EXCEPTIONAL" },
                ].map((row, i) => (
                  <div key={i} className="flex flex-col md:grid md:grid-cols-12 gap-4 items-center p-4 bg-muted/20 border-2 border-foreground rounded-2xl hover:bg-muted/50 transition-colors">
                    
                    <div className="col-span-3 w-full text-left">
                      <div className="font-black text-foreground">{row.date}</div>
                      <div className="text-xs font-bold text-muted-foreground">{row.time}</div>
                    </div>
                    
                    <div className="col-span-3 w-full">
                      <div className="inline-flex flex-col items-start gap-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border-2 border-foreground shadow-sm ${
                          row.type === 'Speech' ? 'bg-blue-100 text-blue-800' :
                          row.type === 'Behavioral' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {row.type}
                        </span>
                        <div className="flex items-center gap-1 ml-1">
                          <span className={`w-2 h-2 rounded-full ${row.isLive ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                          <span className="text-[9px] font-black tracking-widest text-muted-foreground uppercase">{row.isLive ? 'LIVE' : 'RECORDED'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-span-3 w-full flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border-2 border-foreground overflow-hidden bg-secondary flex items-center justify-center shrink-0">
                        {row.img === 'bot' ? (
                          <span className="font-black text-xs text-secondary-foreground">AI</span>
                        ) : (
                          <img src={`https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=256&auto=format&fit=crop`} alt={row.provider} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="font-black text-sm">{row.provider}</span>
                    </div>

                    <div className="col-span-3 w-full flex justify-end">
                      <div className="bg-background border-2 border-foreground shadow-pop-sm rounded-full px-4 py-2 flex items-center gap-2">
                        <span className="font-black text-primary">{row.score}</span>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{row.outcome}</span>
                      </div>
                    </div>

                  </div>
                ))}

              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* KEY INSIGHT */}
            <div className="calm-card bg-card border-4 border-secondary shadow-pop-lg rounded-[2rem] p-8 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="w-10 h-10 bg-secondary border-4 border-foreground rounded-full flex items-center justify-center shadow-pop-sm">
                  <TrendingUp className="w-5 h-5 text-secondary-foreground" />
                </div>
                <h2 className="text-2xl font-black text-foreground">Key Insight</h2>
              </div>

              <div className="bg-muted/50 border-4 border-foreground rounded-2xl p-6 relative z-10 shadow-inner">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Clinical Correlation</h4>
                <p className="text-sm font-bold text-foreground leading-relaxed mb-6">
                  Leo is showing <span className="text-primary font-black bg-primary/10 px-1 rounded">significant reduction</span> in sensory-seeking behaviors during morning slots. High impact noted in Speech Therapy.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary mt-0.5 shrink-0">
                      <Check className="w-3 h-3 text-primary stroke-[4]" />
                    </div>
                    <span className="text-sm font-bold text-foreground">Verbal interaction increased by <span className="font-black">25%</span></span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary mt-0.5 shrink-0">
                      <Check className="w-3 h-3 text-primary stroke-[4]" />
                    </div>
                    <span className="text-sm font-bold text-foreground">Task transitions improved by <span className="font-black">18%</span></span>
                  </div>
                </div>
              </div>

              <button className="mt-8 text-primary font-black text-sm flex items-center gap-1 hover:underline relative z-10">
                View Behavioral Audit &rarr;
              </button>
            </div>

            {/* CONSISTENCY */}
            <div className="calm-card bg-card border-4 border-foreground shadow-pop-lg rounded-[2rem] p-8 flex flex-col">
              <h2 className="text-2xl font-black text-foreground mb-1">Consistency</h2>
              <p className="text-sm font-bold text-muted-foreground mb-8">Daily activity streak tracker</p>

              {/* Streak Box */}
              <div className="bg-accent/20 border-4 border-accent rounded-3xl p-8 flex items-center justify-center gap-6 shadow-inner relative overflow-hidden mb-8">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="w-16 h-20 bg-accent border-4 border-foreground rounded-2xl flex items-center justify-center shadow-pop relative z-10">
                  <Flame className="w-8 h-8 text-accent-foreground fill-current" />
                </div>
                <div className="relative z-10">
                  <div className="text-5xl font-black text-foreground leading-none tracking-tighter">12</div>
                  <div className="text-lg font-black text-accent uppercase tracking-widest mt-1">Day<br/>Streak!</div>
                </div>
              </div>

              {/* Calendar Dots */}
              <div className="flex justify-between items-center mb-8 px-2">
                {['MO','TU','WE','TH','FR','SA','SU'].map((day, i) => {
                  const active = i < 5; // Simulating Mon-Fri streak
                  return (
                    <div key={day} className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase">{day}</span>
                      <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center text-[10px] font-black shadow-pop-sm ${
                        active 
                          ? 'bg-primary border-foreground text-primary-foreground' 
                          : 'bg-muted border-foreground/20 text-muted-foreground'
                      }`}>
                        {14 + i}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Note Bubble */}
              <div className="bg-muted/30 border-4 border-foreground/10 rounded-2xl p-5 relative">
                <MapPin className="w-6 h-6 text-primary absolute -top-3 -left-2 fill-primary stroke-foreground stroke-2" />
                <p className="text-sm font-bold text-foreground/80 italic leading-relaxed pl-4">
                  "Leo is doing so well! Don't forget to reward the 12-day streak tonight with a favorite story."
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </ParentShell>
  );
};

export default SessionReports;
