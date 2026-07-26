import { useState } from "react";
import { CaregiverShell } from "@/components/CaregiverShell";
import { 
  AlertTriangle, 
  Activity, 
  CheckCircle,
  Bell,
  ShieldAlert,
  Play,
  BrainCircuit,
  EyeOff,
  MicOff,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";

const CrisisAlerts = () => {
  const [activeTab, setActiveTab] = useState<"live" | "predictions">("live");

  return (
    <CaregiverShell title="" subtitle="" fullWidth>
      
      {/* Wrapper to provide consistent breathing room on the left/right */}
      <div className="w-full max-w-[96%] mx-auto pt-4 h-full flex flex-col pb-16">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight mb-2 sm:mb-0">Crisis Alerts</h1>
          
          {/* Toggle Nav */}
          <div className="flex bg-background border-4 border-foreground rounded-full shadow-pop p-1.5 w-fit">
            <button 
              onClick={() => setActiveTab("live")}
              className={cn(
                "px-6 py-2 rounded-full font-black text-sm transition-all duration-200",
                activeTab === "live" ? "bg-accent text-accent-foreground border-2 border-foreground shadow-pop-sm" : "hover:bg-muted border-2 border-transparent"
              )}
            >
              Live View
            </button>
            <button 
              onClick={() => setActiveTab("predictions")}
              className={cn(
                "px-6 py-2 rounded-full font-black text-sm transition-all duration-200",
                activeTab === "predictions" ? "bg-accent text-accent-foreground border-2 border-foreground shadow-pop-sm" : "hover:bg-muted border-2 border-transparent"
              )}
            >
              Predictions
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: LIVE ACTION */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Main Red Alert Card */}
            <div className="w-full bg-card rounded-[2rem] border-4 border-foreground shadow-pop-lg overflow-hidden flex flex-col">
              
              {/* Red Header */}
              <div className="bg-destructive text-destructive-foreground px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b-4 border-foreground">
                <div className="flex items-center gap-3">
                  <div className="bg-background text-destructive w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 border-foreground animate-pulse-soft">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Meltdown Detected - Go Now!</h2>
                </div>
                <div className="bg-background/20 backdrop-blur px-4 py-1.5 rounded-full border-2 border-background/40">
                  <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase">Priority Level: Extreme</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8">
                
                {/* Left: Camera Feed Simulator */}
                <div className="w-full md:w-[55%] aspect-video bg-muted rounded-[1.5rem] border-4 border-foreground relative overflow-hidden flex justify-center items-center group shadow-inner">
                  <img 
                    src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1471&auto=format&fit=crop" 
                    alt="Bedroom"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

                  <div className="absolute top-4 left-4 bg-background text-foreground px-3 py-1.5 rounded-full flex items-center gap-2 border-2 border-foreground shadow-pop-sm z-10">
                    <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-wider">LIVE - Bedroom Cam</span>
                  </div>
                  
                  <div className="absolute top-4 right-4 text-white font-bold text-[10px] drop-shadow-md z-10">
                    2024-10-24 14:03:22
                  </div>

                  <div className="w-16 h-16 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center border-4 border-foreground shadow-pop-sm group-hover:scale-110 transition-transform cursor-pointer z-10 text-foreground">
                    <Play className="w-6 h-6 ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Right: Status & Actions */}
                <div className="w-full md:w-[45%] flex flex-col justify-center">
                  <div className="bg-accent/30 rounded-[1.5rem] p-6 h-full flex flex-col justify-center border-4 border-foreground shadow-pop-sm relative">
                    
                    <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Current Status</h3>
                    
                    <div className="flex items-center gap-2 text-destructive font-black text-xl mb-4">
                      <AlertTriangle className="w-6 h-6" />
                      Active Conflict
                    </div>

                    <p className="text-sm font-bold text-foreground/80 leading-snug mb-6">
                      Detected acoustic surge and rapid erratic motion. <br/>
                      <span className="text-foreground">Duration: 2m 14s</span>
                    </p>

                    <button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all rounded-xl py-3 border-4 border-foreground shadow-pop flex flex-col items-center justify-center gap-0.5 mt-auto hover:-translate-y-1">
                      <span className="font-black text-sm">I'm on it</span>
                      <span className="text-[10px] font-bold opacity-80">Notify Parent</span>
                    </button>

                  </div>
                </div>

              </div>
            </div>

            {/* Why Now Card */}
            <div className="calm-card flex flex-col sm:flex-row items-start gap-6 bg-card border-4 border-foreground shadow-pop-sm p-6 rounded-[2rem]">
              <div className="w-16 h-16 bg-primary/20 text-primary border-4 border-foreground rounded-[1rem] shadow-pop-sm flex items-center justify-center shrink-0">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2 text-primary">Why now?</h3>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                  Historical patterns suggest fatigue after school sessions. Today's session was 45 minutes longer than average, leading to sensory depletion. Transition support is recommended for the next hour.
                </p>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: BE READY TIMELINE */}
          <div className="lg:col-span-4 h-full">
            <div className="calm-card h-full flex flex-col bg-card border-4 border-foreground shadow-pop-sm p-6 rounded-[2rem]">
              
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-secondary-foreground">Be Ready</h2>
                <Activity className="w-6 h-6 text-foreground" />
              </div>

              {/* Timeline */}
              <div className="relative flex-1 pl-4 mb-4">
                {/* Vertical connecting line */}
                <div className="absolute top-2 bottom-8 left-4 w-1 bg-foreground/10 -translate-x-1/2" />

                {/* Item 1: 1:30 PM */}
                <div className="relative pl-10 pb-10">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-400 flex items-center justify-center -translate-x-1/2 z-10 border-2 border-foreground shadow-pop-sm">
                    <CheckCircle className="w-3 h-3 text-foreground" />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-base text-primary">1:30 PM</span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground px-2 py-0.5 rounded-md border-2 border-foreground">Sent</span>
                  </div>
                  <h4 className="font-black text-sm text-foreground mb-1">Preparation Warning</h4>
                  <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                    Early signs: Repetitive rocking detected in play area.
                  </p>
                </div>

                {/* Item 2: 1:45 PM */}
                <div className="relative pl-10 pb-10">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center -translate-x-1/2 z-10 border-2 border-foreground shadow-pop-sm">
                    <Bell className="w-3 h-3 text-foreground" />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-base text-secondary">1:45 PM</span>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-accent/50 text-foreground px-2 py-0.5 rounded-md border-2 border-foreground">Upcoming</span>
                  </div>
                  <h4 className="font-black text-sm text-foreground mb-1">High Risk Alert</h4>
                  <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                    Projected escalation window based on noise levels.
                  </p>
                </div>

                {/* Item 3: 2:00 PM (ACTIVE) */}
                <div className="relative pl-10">
                  <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-destructive flex items-center justify-center -translate-x-1/2 z-10 border-2 border-foreground shadow-pop-sm animate-pulse-soft">
                    <span className="font-black text-xs text-background">!</span>
                  </div>
                  
                  {/* Active Highlight Box */}
                  <div className="bg-destructive/10 border-4 border-destructive/30 rounded-2xl p-4 -ml-4 mt-[-4px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-base text-destructive">2:00 PM</span>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-destructive text-destructive-foreground px-2 py-0.5 rounded-md border-2 border-foreground">Active</span>
                    </div>
                    <h4 className="font-black text-sm text-destructive mb-1">Predicted Meltdown Time</h4>
                    <p className="text-xs font-bold text-muted-foreground/80 leading-relaxed">
                      Confidence level: 88%. Current sensor data matching 02/14/24 pattern.
                    </p>
                  </div>
                </div>
              </div>

              {/* Safety Checklist Controls */}
              <div className="mt-auto pt-6 border-t-4 border-foreground/5 flex flex-col items-center">
                <h4 className="font-black text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Safety Checklist</h4>
                <div className="flex justify-center gap-4">
                  <button className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:-translate-y-1 transition-transform border-4 border-foreground shadow-pop-sm">
                    <EyeOff className="w-5 h-5" />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:-translate-y-1 transition-transform border-4 border-foreground shadow-pop-sm">
                    <MicOff className="w-5 h-5" />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center hover:-translate-y-1 transition-transform border-4 border-foreground shadow-pop-sm">
                    <Sun className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </CaregiverShell>
  );
};

export default CrisisAlerts;
