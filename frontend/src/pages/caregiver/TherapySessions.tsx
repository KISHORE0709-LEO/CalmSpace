import { useNavigate } from "react-router-dom";
import { CaregiverShell } from "@/components/CaregiverShell";
import { Calendar, Clock, Video, FileText, ChevronRight, CheckCircle2, History, Info, CalendarPlus, Download, Activity, Target, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TherapySessions() {
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate("/caregiver/therapy/room");
  };

  const handleViewSummary = () => {
    navigate("/caregiver/therapy/summary");
  };

  return (
    <CaregiverShell title="Therapy Sessions" subtitle="View and join therapy sessions" fullWidth={true}>
      <div className="mx-auto mt-4 pb-16 space-y-10 animate-fade-up">
        
        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="calm-card bg-primary/10 border-primary p-6 flex flex-col justify-center items-center text-center">
            <span className="text-4xl font-black text-primary mb-2">2</span>
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Upcoming Sessions</span>
          </div>
          <div className="calm-card bg-accent/10 border-accent p-6 flex flex-col justify-center items-center text-center">
            <span className="text-4xl font-black text-accent-foreground mb-2">15</span>
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Completed Sessions</span>
          </div>
          <div className="calm-card bg-secondary/10 border-secondary p-6 flex flex-col justify-center items-center text-center">
            <span className="text-xl font-black text-secondary-foreground mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Aug 02
            </span>
            <span className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5" /> 10:00 AM
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Next Session</span>
          </div>
        </div>

        {/* Ongoing Session */}
        <div>
          <h3 className="text-2xl font-black flex items-center gap-3 pb-3 border-b-2 border-foreground/10 mb-6">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
            </span>
            Ongoing Now
          </h3>
          <div className="calm-card bg-background border-2 border-foreground shadow-pop-lg hover:shadow-pop-xl transition-all p-8">
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-4xl font-black text-foreground mb-2">Dr. Mehta</h2>
                  <p className="text-lg font-bold text-muted-foreground flex items-center gap-6">
                    <span className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Today</span>
                    <span className="flex items-center gap-2"><Clock className="w-5 h-5" /> 10:00 AM</span>
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-xl border-2 border-foreground/10">
                    <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground block mb-1">Child</span>
                    <span className="font-black text-lg">Rahul Kumar</span>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-xl border-2 border-foreground/10">
                    <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground block mb-1">Session Type</span>
                    <span className="font-black text-lg flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Behavioral Therapy</span>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-xl border-2 border-foreground/10">
                    <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground block mb-1">Goal</span>
                    <span className="font-black text-lg flex items-center gap-2"><Target className="w-4 h-4 text-secondary-foreground" /> Emotional Regulation</span>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-xl border-2 border-foreground/10">
                    <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground block mb-1">Duration</span>
                    <span className="font-black text-lg flex items-center gap-2"><Timer className="w-4 h-4 text-accent-foreground" /> 45 mins</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center gap-6 lg:border-l-2 lg:border-foreground/10 lg:pl-8">
                <div className="bg-green-100 text-green-800 px-6 py-2 rounded-full border-2 border-green-300 font-black text-lg tracking-widest uppercase shadow-sm flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span> Live
                </div>
                <Button 
                  onClick={handleJoin}
                  className="h-16 px-10 text-2xl font-black rounded-2xl bg-secondary text-secondary-foreground border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all w-full"
                >
                  <Video className="w-6 h-6 mr-3" /> Join Session
                </Button>
              </div>

            </div>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div>
          <h3 className="text-2xl font-black flex items-center gap-3 pb-3 border-b-2 border-foreground/10 mb-6">
            <Calendar className="w-6 h-6 text-primary" /> Upcoming Sessions
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="calm-card bg-background border-2 border-foreground shadow-pop hover:-translate-y-1 transition-all p-6 flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl font-black mb-1">Dr. Mehta</h4>
                    <p className="text-muted-foreground font-bold flex items-center gap-4">
                      <span>Aug 02, 2026</span>
                      <span>10:00 AM</span>
                    </p>
                  </div>
                  <span className="bg-primary/10 text-primary border-2 border-primary/20 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider">Scheduled</span>
                </div>
                
                <div className="space-y-2 pt-4 border-t-2 border-foreground/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground uppercase">Session Type</span>
                    <span className="font-black text-sm">Social Skills Training</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground uppercase">Goal</span>
                    <span className="font-black text-sm">Eye Contact & Communication</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-muted-foreground uppercase">Duration</span>
                    <span className="font-black text-sm">45 mins</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 mt-8 pt-4 border-t-2 border-foreground/10">
                <Button variant="outline" className="flex-1 h-12 border-2 border-foreground shadow-pop-sm font-black text-sm">
                  <Info className="w-4 h-4 mr-2" /> View Details
                </Button>
                <Button className="flex-1 h-12 bg-white text-foreground border-2 border-foreground shadow-pop-sm hover:bg-muted font-black text-sm">
                  <CalendarPlus className="w-4 h-4 mr-2" /> Add to Calendar
                </Button>
              </div>
            </div>
            {/* Add a subtle visual hint if there are more upcoming sessions (since the stat says 2) */}
            <div className="calm-card bg-muted/30 border-2 border-foreground/20 border-dashed flex items-center justify-center p-6 text-muted-foreground font-bold hover:bg-muted/50 transition-colors cursor-pointer">
               + 1 more upcoming session next month
            </div>
          </div>
        </div>

        {/* Past Sessions */}
        <div>
          <h3 className="text-2xl font-black flex items-center gap-3 pb-3 border-b-2 border-foreground/10 mb-6">
            <History className="w-6 h-6 text-accent-foreground" /> Past Sessions
          </h3>
          <div className="space-y-4">
            
            <div className="calm-card bg-background border-2 border-foreground shadow-pop-sm hover:shadow-pop transition-all p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h4 className="text-xl font-black">Dr. Mehta</h4>
                  <span className="bg-green-100 text-green-700 border-2 border-green-300 px-2 py-0.5 rounded text-xs font-black uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </span>
                </div>
                <p className="text-sm font-bold text-muted-foreground mb-4">Jul 18, 2026 • 10:00 AM</p>
                <div className="flex items-center gap-6">
                  <span className="font-medium text-sm flex items-center gap-1"><Timer className="w-4 h-4 text-muted-foreground" /> Duration: 45 mins</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button 
                  onClick={handleViewSummary}
                  variant="outline" 
                  className="h-12 px-6 border-2 border-foreground shadow-pop-sm font-black hover:bg-primary hover:text-primary-foreground group"
                >
                  <FileText className="w-4 h-4 mr-2" /> View Summary
                </Button>
                <Button 
                  className="h-12 px-6 bg-white text-foreground hover:bg-muted border-2 border-foreground shadow-pop-sm font-black"
                >
                  <Download className="w-4 h-4 mr-2" /> Download Report
                </Button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </CaregiverShell>
  );
}
