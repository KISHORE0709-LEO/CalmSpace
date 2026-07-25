import { useNavigate } from "react-router-dom";
import { ParentShell } from "@/components/ParentShell";
import { Calendar, Clock, Video, FileText, ChevronRight, CheckCircle2, History } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TherapySessions() {
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate("/parent/therapy/room");
  };

  const handleViewSummary = () => {
    navigate("/parent/therapy/summary");
  };

  return (
    <ParentShell title="Therapy Sessions" subtitle="View and join your child's therapy sessions">
      <div className="max-w-4xl mx-auto mt-8 pb-16 space-y-10 animate-fade-up">
        
        {/* Next/Ongoing Session */}
        <div className="calm-card bg-primary/10 border-primary">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-black text-xs uppercase tracking-wider text-green-700 bg-green-100 px-3 py-1 rounded-full border-2 border-green-200">Ongoing Now</span>
              </div>
              <h2 className="text-3xl font-black mb-2 text-foreground">Dr. Mehta</h2>
              <p className="font-bold text-muted-foreground flex items-center gap-6">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Today</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 10:00 AM</span>
              </p>
              <div className="mt-6 inline-flex items-center gap-2 bg-background px-4 py-2 rounded-xl border-2 border-foreground shadow-pop-sm text-sm font-bold">
                <span className="text-primary">Goal:</span> Emotional Regulation
              </div>
            </div>
            
            <Button 
              onClick={handleJoin}
              className="h-16 px-8 text-xl font-black rounded-2xl bg-secondary text-secondary-foreground border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all w-full md:w-auto"
            >
              <Video className="w-6 h-6 mr-3" /> Join Session
            </Button>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="space-y-4">
          <h3 className="text-xl font-black flex items-center gap-2 pb-2 border-b-2 border-border/50"><Calendar className="w-6 h-6 text-primary" /> Upcoming Sessions</h3>
          <div className="space-y-4">
            <div className="calm-card p-6 flex items-center justify-between group cursor-not-allowed opacity-80 bg-background/50">
              <div>
                <h4 className="font-black text-lg">Dr. Mehta</h4>
                <p className="text-sm font-bold text-muted-foreground">Aug 02, 2026 • 10:00 AM</p>
              </div>
              <div className="bg-muted px-4 py-2 rounded-xl border-2 border-foreground font-bold text-sm">
                Scheduled
              </div>
            </div>
          </div>
        </div>

        {/* Past Sessions */}
        <div className="space-y-4">
          <h3 className="text-xl font-black flex items-center gap-2 pb-2 border-b-2 border-border/50"><History className="w-6 h-6 text-accent-foreground" /> Past Sessions</h3>
          <div className="space-y-4">
            <div 
              onClick={handleViewSummary}
              className="calm-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-accent/10 transition-colors group bg-background"
            >
              <div>
                <h4 className="font-black text-lg group-hover:text-primary transition-colors">Dr. Mehta</h4>
                <p className="text-sm font-bold text-muted-foreground">Jul 18, 2026 • 10:00 AM</p>
              </div>
              <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-4 md:mt-0">
                <span className="flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg border-2 border-green-300">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </span>
                <Button variant="outline" className="border-2 border-foreground shadow-pop-sm group-hover:bg-primary group-hover:text-primary-foreground font-black">
                  Summary <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </ParentShell>
  );
}
