import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CaregiverShell } from "@/components/CaregiverShell";
import { 
  Video, 
  UserCircle2, 
  Calendar,
  Clock,
  ArrowRight,
  Smile,
  History
} from "lucide-react";

export default function TherapySessions() {
  const navigate = useNavigate();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <CaregiverShell title="" subtitle="" fullWidth>
      <div className="w-full max-w-[96%] mx-auto pt-4 h-full flex flex-col pb-16">
        
        {/* HEADER */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight mb-2 sm:mb-0">Therapy Sessions</h1>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-black text-sm py-3 px-6 rounded-full border-4 border-foreground shadow-pop hover:-translate-y-1 transition-all flex items-center gap-2"
          >
            <History className="w-5 h-5" /> Call History
          </button>
        </div>

        <div className="flex flex-col gap-8">
          
          {/* TOP SECTION: LIVE SESSION & PROGRESS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Live Therapy Session Card (Left) */}
            <div className="lg:col-span-8 calm-card bg-card border-4 border-foreground shadow-pop-lg rounded-[2rem] p-5 sm:p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none" />
              
              {/* Video Thumbnail Area */}
              <div className="w-full md:w-[40%] relative rounded-[1.25rem] border-4 border-foreground overflow-hidden bg-muted shadow-inner group-hover:-translate-y-1 transition-transform">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop" 
                  alt="Dr. Arya Sharma" 
                  className="w-full h-full object-cover min-h-[150px] max-h-[200px] md:max-h-none"
                />
                <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground px-2 py-1 rounded-full border-2 border-foreground flex items-center gap-1.5 shadow-sm z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Live</span>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                  <span className="font-black text-xs drop-shadow-md">Dr. Arya Sharma</span>
                </div>
              </div>

              {/* Session Details Area */}
              <div className="w-full md:w-[60%] flex flex-col justify-center relative z-10">
                <h2 className="text-2xl sm:text-3xl font-black text-primary leading-tight mb-2 tracking-tight">
                  Live<br/>Therapy<br/>Session
                </h2>
                
                <p className="text-xs sm:text-sm font-bold text-muted-foreground mb-4 leading-relaxed">
                  <span className="text-foreground uppercase tracking-widest text-[9px] block mb-0.5">Ongoing focus:</span>
                  Positive Reinforcement Strategies
                </p>

                <div className="space-y-2 mb-4 bg-muted/30 p-3 rounded-2xl border-2 border-foreground/10">
                  <div className="flex items-center gap-2">
                    <Smile className="w-4 h-4 text-secondary-foreground shrink-0" />
                    <span className="text-xs font-bold text-muted-foreground">Child: <span className="text-foreground font-black">Leo</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-bold text-muted-foreground">Caregiver: <span className="text-foreground font-black">You (Leo's Caregiver)</span></span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate("/caregiver/therapy/room")}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm py-3 px-6 rounded-xl border-4 border-foreground shadow-pop hover:-translate-y-1 transition-all flex items-center justify-center gap-2 mt-auto"
                >
                  <Video className="w-5 h-5 fill-current" /> Join Call
                </button>
              </div>
            </div>

            {/* Session Progress Card (Right) */}
            <div className="lg:col-span-4 calm-card bg-card border-4 border-foreground shadow-pop-lg rounded-[2rem] p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Session Progress</h3>
                <p className="text-base font-bold text-foreground leading-snug mb-6">
                  Today's goal: Daily Routine Mapping
                </p>
                
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full border-2 border-foreground shadow-sm ${i <= 3 ? 'bg-yellow-400' : 'bg-muted'}`} />
                  ))}
                </div>

                {/* Quote Box */}
                <div className="bg-muted/50 border-4 border-foreground rounded-xl p-4 relative shadow-inner">
                  <p className="text-xs font-bold text-foreground/80 italic text-center leading-relaxed">
                    "Leo is responding exceptionally well to the new visual cues!"
                  </p>
                </div>
              </div>

              <button className="w-full mt-4 bg-background hover:bg-muted text-foreground font-black text-xs py-3 rounded-xl border-4 border-foreground shadow-pop-sm hover:-translate-y-1 transition-all">
                View Past Goals
              </button>
            </div>
          </div>

          {/* MIDDLE SECTION: SCHEDULE & INVITES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Upcoming Schedule (Left) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex justify-between items-end mb-2">
                <h3 className="text-xl font-black text-foreground">Upcoming Schedule</h3>
                <button className="text-sm font-black text-primary hover:underline">View Calendar</button>
              </div>

              {/* Schedule Item 1 */}
              <div className="bg-background border-4 border-foreground rounded-[1.5rem] p-4 sm:p-6 shadow-pop-sm flex items-center gap-6 hover:bg-muted/20 transition-colors">
                <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-foreground flex flex-col items-center justify-center shrink-0 shadow-inner">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Oct</span>
                  <span className="text-lg font-black text-blue-900 leading-none mt-0.5">24</span>
                </div>
                <div>
                  <h4 className="font-black text-lg text-foreground mb-1">Speech Therapy</h4>
                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3 h-3" /> 10:30 AM • Dr. Marcus Chen
                  </p>
                </div>
              </div>

              {/* Schedule Item 2 */}
              <div className="bg-background border-4 border-foreground rounded-[1.5rem] p-4 sm:p-6 shadow-pop-sm flex items-center gap-6 hover:bg-muted/20 transition-colors">
                <div className="w-16 h-16 rounded-full bg-yellow-100 border-2 border-foreground flex flex-col items-center justify-center shrink-0 shadow-inner">
                  <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700">Oct</span>
                  <span className="text-lg font-black text-yellow-900 leading-none mt-0.5">27</span>
                </div>
                <div>
                  <h4 className="font-black text-lg text-foreground mb-1">Occupational Therapy</h4>
                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                    <Clock className="w-3 h-3" /> 2:00 PM • Sarah Jenkins
                  </p>
                </div>
              </div>
            </div>

            {/* New Invites (Right) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex justify-between items-end mb-2">
                <h3 className="text-xl font-black text-foreground">New Invites</h3>
                <span className="bg-primary/20 text-primary border-2 border-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                  1 Pending
                </span>
              </div>

              <div className="calm-card bg-card border-4 border-primary shadow-pop-lg rounded-[2rem] p-6 sm:p-8 flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full pointer-events-none" />
                
                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-full border-2 border-foreground overflow-hidden bg-muted shrink-0 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=256&auto=format&fit=crop" alt="Dr. Emily Watson" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg text-foreground leading-tight mb-1">Joint Behavioral Session</h4>
                    <p className="text-xs font-bold text-muted-foreground mb-3">Requested by Leo's Parent</p>
                    <p className="text-xs font-black text-primary flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Proposed: Monday, Oct 30 • 4:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-auto relative z-10">
                  <button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm py-3 rounded-xl border-4 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform">
                    Accept Invite
                  </button>
                  <button className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-black text-sm py-3 rounded-xl border-4 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform">
                    Reschedule
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* BOTTOM SECTION: RECENT SUMMARIES */}
          <div className="mt-4">
            <h3 className="text-xl font-black text-foreground mb-6">Recent Session Summaries</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Summary 1 */}
              <div 
                onClick={() => navigate("/caregiver/therapy/summary")}
                className="calm-card bg-background border-4 border-foreground shadow-pop-sm rounded-[1.5rem] p-6 hover:-translate-y-2 transition-transform cursor-pointer group flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-blue-100 text-blue-800 border-2 border-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    Speech
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">Oct 17, 2023</span>
                </div>
                <h4 className="font-black text-lg text-foreground mb-3">Syllable Articulation</h4>
                <p className="text-xs font-bold text-muted-foreground leading-relaxed mb-6 flex-1">
                  Leo successfully navigated the 'three-syllable' word challenge today. He showed marked...
                </p>
                <div className="text-primary font-black text-sm flex items-center gap-2 group-hover:gap-3 transition-all mt-auto pt-4 border-t-2 border-foreground/10">
                  Read Full Report <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Summary 2 */}
              <div 
                onClick={() => navigate("/caregiver/therapy/summary")}
                className="calm-card bg-background border-4 border-foreground shadow-pop-sm rounded-[1.5rem] p-6 hover:-translate-y-2 transition-transform cursor-pointer group flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-yellow-100 text-yellow-800 border-2 border-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    Behavioral
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">Oct 14, 2023</span>
                </div>
                <h4 className="font-black text-lg text-foreground mb-3">Emotional Regulation</h4>
                <p className="text-xs font-bold text-muted-foreground leading-relaxed mb-6 flex-1">
                  Discussed the 'Red to Green' chart. Parent feedback indicates evening transitions...
                </p>
                <div className="text-primary font-black text-sm flex items-center gap-2 group-hover:gap-3 transition-all mt-auto pt-4 border-t-2 border-foreground/10">
                  Read Full Report <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Summary 3 */}
              <div 
                onClick={() => navigate("/caregiver/therapy/summary")}
                className="calm-card bg-background border-4 border-foreground shadow-pop-sm rounded-[1.5rem] p-6 hover:-translate-y-2 transition-transform cursor-pointer group flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-green-100 text-green-800 border-2 border-foreground px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                    Occupational
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">Oct 10, 2023</span>
                </div>
                <h4 className="font-black text-lg text-foreground mb-3">Fine Motor Skills</h4>
                <p className="text-xs font-bold text-muted-foreground leading-relaxed mb-6 flex-1">
                  Leo is getting more comfortable with the ergonomic grip pencils. We'v...
                </p>
                <div className="text-primary font-black text-sm flex items-center gap-2 group-hover:gap-3 transition-all mt-auto pt-4 border-t-2 border-foreground/10">
                  Read Full Report <ArrowRight className="w-4 h-4" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* HISTORY MODAL */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-[2rem] border-4 border-foreground shadow-pop-lg flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-primary p-6 border-b-4 border-foreground flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-primary-foreground">Call History</h2>
                <p className="text-primary-foreground/80 font-bold text-sm mt-1">Total Calls Attended: <span className="font-black text-background">15 Sessions</span></p>
              </div>
              <button 
                onClick={() => setIsHistoryOpen(false)}
                className="w-12 h-12 rounded-full bg-background border-4 border-foreground flex items-center justify-center hover:bg-muted shadow-pop-sm hover:-translate-y-1 transition-transform"
              >
                <span className="font-black text-foreground text-xl leading-none pt-1">x</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-muted/20">
              <div className="flex flex-col gap-4">
                
                {/* Mock Data Item */}
                {[
                  { date: "Oct 17, 2023", time: "10:30 AM", type: "Speech Therapy", duration: "45 mins", provider: "Dr. Marcus Chen", status: "Completed" },
                  { date: "Oct 14, 2023", time: "2:00 PM", type: "Behavioral", duration: "30 mins", provider: "Dr. Emily Watson", status: "Completed" },
                  { date: "Oct 10, 2023", time: "9:00 AM", type: "Occupational", duration: "60 mins", provider: "Sarah Jenkins", status: "Completed" },
                  { date: "Oct 03, 2023", time: "11:15 AM", type: "Speech Therapy", duration: "45 mins", provider: "Dr. Marcus Chen", status: "Missed" },
                  { date: "Sep 28, 2023", time: "2:00 PM", type: "Behavioral", duration: "30 mins", provider: "Dr. Emily Watson", status: "Completed" },
                  { date: "Sep 21, 2023", time: "10:00 AM", type: "Speech Therapy", duration: "45 mins", provider: "Dr. Marcus Chen", status: "Completed" },
                  { date: "Sep 14, 2023", time: "2:00 PM", type: "Behavioral", duration: "30 mins", provider: "Dr. Emily Watson", status: "Completed" },
                ].map((call, idx) => (
                  <div key={idx} className="bg-background border-4 border-foreground rounded-[1.5rem] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:-translate-y-1 transition-transform shadow-pop-sm">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full border-4 border-foreground flex items-center justify-center shrink-0 ${call.status === 'Completed' ? 'bg-secondary text-secondary-foreground' : 'bg-destructive text-destructive-foreground'}`}>
                        {call.status === 'Completed' ? <Video className="w-5 h-5 fill-current" /> : <span className="font-black text-xl">!</span>}
                      </div>
                      <div>
                        <h4 className="font-black text-lg text-foreground leading-tight">{call.type}</h4>
                        <p className="text-xs font-bold text-muted-foreground">{call.date} • {call.time}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 sm:gap-8 justify-between sm:justify-end">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-foreground uppercase tracking-widest">{call.provider}</p>
                        <p className="text-[10px] font-bold text-muted-foreground">Duration: {call.duration}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-foreground shadow-sm ${call.status === 'Completed' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {call.status}
                      </span>
                    </div>
                  </div>
                ))}

              </div>
            </div>

          </div>
        </div>
      )}
    </CaregiverShell>
  );
}
