import { useNavigate } from "react-router-dom";
import { DoctorShell } from "@/components/DoctorShell";
import { 
  CheckCircle2, Clock, Calendar, Users, 
  Activity, ArrowRight, Save, FileText,
  Sparkles, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TherapyReport() {
  const navigate = useNavigate();

  return (
    <DoctorShell title="Session Report" subtitle="Auto-generated summary from the latest session">
      <div className="mt-8 space-y-8 pb-16">
        
        {/* Success Banner */}
        <div className="calm-card bg-green-100 border-green-300 flex items-center justify-between p-6 animate-fade-up">
          <div className="flex items-center gap-4 text-green-800">
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center border-2 border-green-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-xl">Session Completed Successfully</h2>
              <p className="font-bold text-sm opacity-80">All data has been saved and AI insights generated.</p>
            </div>
          </div>
          <Button 
            className="h-12 bg-green-600 text-white hover:bg-green-700 border-2 border-green-800 shadow-pop-sm font-black rounded-xl"
            onClick={() => navigate("/doctor/patients")}
          >
            Save & Return to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Col: Overview & Notes */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up-delay-1">
              <div className="calm-card p-4 space-y-1">
                <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Duration
                </p>
                <p className="font-black text-xl">45 mins</p>
              </div>
              <div className="calm-card p-4 space-y-1">
                <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Date
                </p>
                <p className="font-black text-lg leading-tight">Today<br/>10:24 AM</p>
              </div>
              <div className="calm-card p-4 space-y-1 md:col-span-2">
                <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> Participants
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="bg-primary/20 text-primary-foreground px-2 py-1 rounded-md text-xs font-bold border-2 border-foreground">Rahul (Patient)</span>
                  <span className="bg-muted px-2 py-1 rounded-md text-xs font-bold border-2 border-foreground">Mother</span>
                </div>
              </div>
            </div>

            {/* Doctor's Notes */}
            <div className="calm-card p-6 space-y-4 animate-fade-up-delay-2">
              <h3 className="font-black text-xl flex items-center gap-2 border-b-2 border-foreground/10 pb-2">
                <FileText className="w-5 h-5 text-primary" /> Session Notes
              </h3>
              <div className="bg-muted p-4 rounded-xl border-2 border-foreground/10 font-medium text-sm space-y-2">
                <p>- Rahul responded well to visual schedule today.</p>
                <p>- Eye contact improved during the emotion card game.</p>
                <p>- Mother noted he had a tough morning transition, which explains initial elevated stress.</p>
              </div>
            </div>
            
            {/* AI Insights */}
            <div className="calm-card p-6 space-y-4 animate-fade-up-delay-3 bg-accent/20 border-accent-foreground/20">
              <h3 className="font-black text-xl flex items-center gap-2 border-b-2 border-foreground/10 pb-2 text-accent-foreground">
                <Sparkles className="w-5 h-5" /> AI Generated Insights & Homework
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border-2 border-foreground shadow-pop-sm">
                  <h4 className="font-black text-sm mb-2 text-green-600">Progress Observed</h4>
                  <p className="text-sm font-medium">Emotion regulation was 30% more stable compared to last week. Positive response to auditory calming tools.</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-foreground shadow-pop-sm">
                  <h4 className="font-black text-sm mb-2 text-blue-600">Suggested Homework</h4>
                  <ul className="text-sm font-medium space-y-1 list-disc pl-5">
                    <li>Practice "Emotion Cards" for 10 mins daily.</li>
                    <li>Use the deep breathing animation before school transition.</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

          {/* Right Col: Emotion Timeline & Activities */}
          <div className="space-y-6">
            
            {/* Emotion Timeline Mock */}
            <div className="calm-card p-6 space-y-4 animate-fade-up-delay-2">
              <h3 className="font-black text-xl flex items-center gap-2 border-b-2 border-foreground/10 pb-2">
                <Activity className="w-5 h-5 text-red-500" /> Emotion Timeline
              </h3>
              <div className="h-40 bg-muted rounded-xl border-2 border-foreground relative overflow-hidden flex items-end p-2 gap-1">
                {/* Mock Bar Chart */}
                {[40, 50, 45, 60, 75, 80, 85, 90, 88, 85].map((val, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-primary rounded-t-sm border-2 border-foreground"
                    style={{ height: `${val}%` }}
                  ></div>
                ))}
              </div>
              <div className="flex justify-between text-xs font-bold text-muted-foreground px-1">
                <span>Start (Anxious)</span>
                <span>End (Calm)</span>
              </div>
            </div>

            {/* Activities Completed */}
            <div className="calm-card p-6 space-y-4 animate-fade-up-delay-3">
              <h3 className="font-black text-xl flex items-center gap-2 border-b-2 border-foreground/10 pb-2">
                <CheckCircle2 className="w-5 h-5 text-secondary-foreground" /> Activities Log
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-orange-50 border-2 border-orange-200 rounded-xl">
                  <div className="text-2xl">🎲</div>
                  <div>
                    <h4 className="font-black text-sm">Emotion Cards Game</h4>
                    <p className="text-xs font-bold text-muted-foreground">15 mins • High Engagement</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <div className="text-2xl">🎵</div>
                  <div>
                    <h4 className="font-black text-sm">Calming Sounds</h4>
                    <p className="text-xs font-bold text-muted-foreground">5 mins • Transition</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="w-full h-14 border-2 border-foreground shadow-pop-sm font-black rounded-xl text-lg animate-fade-up-delay-3 hover:-translate-y-1 transition-all">
              <Download className="w-5 h-5 mr-2" /> Download PDF Report
            </Button>

          </div>
        </div>
      </div>
    </DoctorShell>
  );
}
