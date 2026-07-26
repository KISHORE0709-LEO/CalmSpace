import { useState } from "react";
import { CaregiverShell } from "@/components/CaregiverShell";
import { 
  FilePlus, 
  AlertCircle, 
  Thermometer, 
  UtensilsCrossed, 
  Smile, 
  Moon, 
  MoreVertical, 
  CheckCircle2,
  Circle,
  MessageSquare,
  ClipboardCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const HandoffNotes = () => {
  const [filter, setFilter] = useState<"All" | "Medical" | "Behavioral">("All");

  return (
    <CaregiverShell title="" subtitle="" fullWidth>
      <div className="w-full max-w-[96%] mx-auto pt-4 h-full flex flex-col pb-24 relative">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-2">Handoff Notes</h1>
            <p className="text-muted-foreground font-medium text-lg max-w-xl">
              Coordinating continuity of care through detailed shift transitions and team observations.
            </p>
          </div>
          <button className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-black text-sm py-3 px-6 rounded-xl border-4 border-foreground shadow-pop hover:-translate-y-1 transition-all flex items-center gap-2 self-start">
            <FilePlus className="w-5 h-5" /> Create New Note
          </button>
        </div>

        {/* URGENT REMINDERS */}
        <div className="mb-8">
          <div className="bg-red-50/50 border-4 border-destructive/50 rounded-[2rem] p-6 sm:p-8">
            <h2 className="text-2xl font-black text-destructive flex items-center gap-3 mb-6 tracking-tight">
              <AlertCircle className="w-6 h-6" strokeWidth={3} /> Urgent Reminders
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reminder 1 */}
              <div className="bg-background rounded-2xl border-l-4 border-l-destructive border-y-2 border-r-2 border-foreground/10 p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-12 bg-destructive/10 flex items-center justify-center border-r-2 border-foreground/10">
                  <Thermometer className="text-destructive w-6 h-6" />
                </div>
                <div className="pl-16">
                  <h3 className="font-black text-destructive text-sm uppercase tracking-widest mb-1">Health Alert</h3>
                  <p className="text-sm font-bold text-foreground leading-relaxed">
                    Leo has a mild fever (100.2°F) since 10:00 AM. Monitor closely and hydrate.
                  </p>
                </div>
              </div>
              
              {/* Reminder 2 */}
              <div className="bg-background rounded-2xl border-l-4 border-l-destructive border-y-2 border-r-2 border-foreground/10 p-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-12 bg-destructive/10 flex items-center justify-center border-r-2 border-foreground/10">
                  <UtensilsCrossed className="text-destructive w-6 h-6" />
                </div>
                <div className="pl-16">
                  <h3 className="font-black text-destructive text-sm uppercase tracking-widest mb-1">Dietary Restriction</h3>
                  <p className="text-sm font-bold text-foreground leading-relaxed">
                    Avoid dairy during lunch today. Substitute with oat milk if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* LATEST SHIFT SUMMARY */}
            <div className="calm-card bg-background border-4 border-foreground shadow-pop-lg rounded-[2rem] p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-primary">Latest Shift Summary</h3>
                <span className="bg-muted px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 border-foreground/10 text-muted-foreground">
                  Shift: 8 AM - 4 PM
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {/* Behavior Pill */}
                <div className="bg-green-50 border-2 border-green-200/50 rounded-[2rem] p-5 flex flex-col items-center sm:items-start text-center sm:text-left transition-transform hover:-translate-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-green-700 mb-2">
                    <Smile className="w-5 h-5" /> <span className="font-black text-sm uppercase tracking-widest">Behavior</span>
                  </div>
                  <h4 className="font-black text-lg text-green-950 mb-1">Calm & Playful</h4>
                  <p className="text-xs font-bold text-green-800/70">Very engaged in puzzle activities.</p>
                </div>
                {/* Nutrition Pill */}
                <div className="bg-blue-50 border-2 border-blue-200/50 rounded-[2rem] p-5 flex flex-col items-center sm:items-start text-center sm:text-left transition-transform hover:-translate-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-blue-700 mb-2">
                    <UtensilsCrossed className="w-5 h-5" /> <span className="font-black text-sm uppercase tracking-widest">Nutrition</span>
                  </div>
                  <h4 className="font-black text-lg text-blue-950 mb-1">Full Intake</h4>
                  <p className="text-xs font-bold text-blue-800/70">Ate all broccoli and salmon.</p>
                </div>
                {/* Sleep Pill */}
                <div className="bg-yellow-50 border-2 border-yellow-200/50 rounded-[2rem] p-5 flex flex-col items-center sm:items-start text-center sm:text-left transition-transform hover:-translate-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-yellow-700 mb-2">
                    <Moon className="w-5 h-5" /> <span className="font-black text-sm uppercase tracking-widest">Sleep</span>
                  </div>
                  <h4 className="font-black text-lg text-yellow-950 mb-1">45min Nap</h4>
                  <p className="text-xs font-bold text-yellow-800/70">Restful, no interruptions.</p>
                </div>
              </div>

              {/* Quote box */}
              <div className="bg-background rounded-full border-2 border-foreground/10 border-dashed p-6 text-center shadow-inner">
                <p className="text-sm sm:text-base font-bold text-muted-foreground italic leading-relaxed">
                  "Leo had a great afternoon. He was particularly interested in the book about solar systems we started yesterday. Energy levels remained high until about 3:30 PM."
                </p>
              </div>
            </div>

            {/* CARE TEAM FEED */}
            <div>
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-2xl font-black text-foreground">Care Team Feed</h3>
                
                {/* Filters */}
                <div className="flex gap-2">
                  {(["All", "Medical", "Behavioral"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                        filter === f ? "bg-primary text-primary-foreground border-foreground shadow-sm" : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                
                {/* Feed Item 1 */}
                <div className="calm-card bg-background border-4 border-foreground rounded-[2rem] shadow-pop-sm p-6 sm:p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-foreground overflow-hidden bg-muted">
                        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop" alt="Dr. Marcus Chen" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-black text-base text-foreground">Dr. Marcus Chen</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Yesterday at 5:30 PM • Medical</p>
                      </div>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h5 className="font-black text-lg text-foreground mb-2">Medication Adjustment Follow-up</h5>
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed mb-6">
                    Please note that we are increasing the morning vitamin D dosage to 1000IU. I've updated the digital MAR for tomorrow's morning routine. Let me know if there's any gastric sensitivity.
                  </p>

                  <div className="flex gap-2">
                    <span className="bg-muted px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-foreground">Dosage Update</span>
                    <span className="bg-muted px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest text-foreground">Health</span>
                  </div>
                </div>

                {/* Feed Item 2 */}
                <div className="calm-card bg-background border-4 border-foreground rounded-[2rem] shadow-pop-sm p-6 sm:p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border-2 border-foreground overflow-hidden bg-muted">
                        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop" alt="Elena (Mom)" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-black text-base text-foreground">Elena (Mom)</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Today at 8:15 AM • Routine</p>
                      </div>
                    </div>
                    <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <h5 className="font-black text-lg text-foreground mb-2">Weekend Schedule Prep</h5>
                  <p className="text-sm font-bold text-muted-foreground leading-relaxed mb-6">
                    Hi Team! Just a reminder that Nana is visiting tomorrow around 2 PM. Leo usually gets a bit overstimulated with visitors, so maybe an extra quiet time session before she arrives?
                  </p>
                </div>

              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* CHECKLIST CARD */}
            <div className="calm-card bg-background border-4 border-foreground shadow-pop-lg rounded-[2rem] p-6 sm:p-8 flex flex-col relative overflow-hidden">
              <div className="flex items-start gap-3 mb-8">
                <ClipboardCheck className="w-6 h-6 text-primary mt-1 shrink-0" />
                <h3 className="text-2xl font-black text-foreground leading-tight">End of Shift Checklist</h3>
              </div>

              <div className="space-y-6 mb-10 flex-1">
                {/* Item 1 */}
                <div className="flex items-start gap-4 group cursor-pointer">
                  <Circle className="w-6 h-6 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
                  <span className="font-bold text-sm text-foreground/80 group-hover:text-foreground transition-colors pt-0.5 leading-snug">
                    Medications Administered & Logged
                  </span>
                </div>
                {/* Item 2 */}
                <div className="flex items-start gap-4 group cursor-pointer">
                  <Circle className="w-6 h-6 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
                  <span className="font-bold text-sm text-foreground/80 group-hover:text-foreground transition-colors pt-0.5 leading-snug">
                    Nutrition Intake Recorded
                  </span>
                </div>
                {/* Item 3 */}
                <div className="flex items-start gap-4 group cursor-pointer">
                  <Circle className="w-6 h-6 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
                  <span className="font-bold text-sm text-foreground/80 group-hover:text-foreground transition-colors pt-0.5 leading-snug">
                    Play Area Tidied
                  </span>
                </div>
                {/* Item 4 */}
                <div className="flex items-start gap-4 group cursor-pointer">
                  <Circle className="w-6 h-6 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
                  <span className="font-bold text-sm text-foreground/80 group-hover:text-foreground transition-colors pt-0.5 leading-snug">
                    Laundry Cycle Started
                  </span>
                </div>
                {/* Item 5 */}
                <div className="flex items-start gap-4 group cursor-pointer">
                  <Circle className="w-6 h-6 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
                  <span className="font-bold text-sm text-foreground/80 group-hover:text-foreground transition-colors pt-0.5 leading-snug">
                    Handoff Note Published
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-auto">
                <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-base py-4 rounded-xl border-4 border-foreground shadow-pop hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 fill-current" /> Finalize Handoff
                </button>
                <p className="text-[10px] font-black text-muted-foreground text-center uppercase tracking-widest">
                  Shift Lock Available at 4:00 PM
                </p>
              </div>
            </div>

            {/* TEAM GOAL CARD */}
            <div className="calm-card bg-background border-4 border-foreground shadow-pop-sm rounded-[2rem] p-6 text-center">
              <h4 className="font-black text-sm uppercase tracking-widest text-foreground mb-4">Team Goal: Seamless Transition</h4>
              <div className="flex justify-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-[#7a641c] border-2 border-foreground" />
                <div className="w-3 h-3 rounded-full bg-[#7a641c] border-2 border-foreground" />
                <div className="w-3 h-3 rounded-full bg-[#7a641c] border-2 border-foreground" />
                <div className="w-3 h-3 rounded-full bg-muted border-2 border-foreground" />
                <div className="w-3 h-3 rounded-full bg-muted border-2 border-foreground" />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground italic">3/5 Tasks Completed</p>
            </div>

          </div>
        </div>
      </div>
      
      {/* FLOATING CHAT BUTTON */}
      <button className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-primary text-primary-foreground rounded-full border-4 border-foreground shadow-pop flex items-center justify-center hover:-translate-y-2 hover:shadow-pop-lg transition-all group">
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-950 text-[10px] font-black w-6 h-6 rounded-full border-2 border-foreground flex items-center justify-center shadow-sm">
          4
        </span>
      </button>

    </CaregiverShell>
  );
};

export default HandoffNotes;
