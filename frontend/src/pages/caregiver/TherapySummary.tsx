import { CaregiverShell } from "@/components/CaregiverShell";
import { 
  FileText, Calendar, CheckCircle2, Download, 
  Activity, ArrowRight, Heart, Brain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function TherapySummary() {
  return (
    <CaregiverShell title="Session Summary" subtitle="Review Dr. Mehta's notes and caregiver instructions" fullWidth={true}>
      <div className="max-w-5xl mx-auto mt-8 pb-16 space-y-8 animate-fade-up">
        
        {/* Header Summary */}
        <div className="calm-card bg-primary/10 border-primary p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs uppercase tracking-wider font-bold bg-background px-3 py-1 rounded-full border-2 border-foreground shadow-pop-sm">
                  Jul 25, 2026
                </span>
                <span className="text-xs uppercase tracking-wider font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full border-2 border-green-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              </div>
              <h2 className="text-3xl font-black mb-2">Therapy Session with Dr. Mehta</h2>
              <p className="font-bold text-muted-foreground text-lg">Focus: Emotional Regulation & Social Play</p>
            </div>
            
            <Button className="h-14 px-6 text-lg font-black rounded-xl bg-white text-foreground border-2 border-foreground shadow-pop hover:-translate-y-1 transition-all">
              <Download className="w-5 h-5 mr-2" /> Download Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-8">
            
            {/* Therapy Summary */}
            <div className="calm-card space-y-4">
              <h3 className="text-xl font-black flex items-center gap-2 border-b-2 border-foreground/10 pb-3">
                <FileText className="w-6 h-6 text-primary" /> Session Notes
              </h3>
              <div className="space-y-4 text-base font-medium leading-relaxed">
                <p>
                  Rahul engaged very well today. We started with the Emotion Cards game, where he correctly identified 4 out of 5 primary emotions without prompting.
                </p>
                <p>
                  During the shared whiteboard activity, he was able to draw how he felt during the morning transition, which is a huge step forward in emotional expression.
                </p>
                <div className="bg-muted p-4 rounded-xl border-2 border-foreground/10 text-sm font-bold text-muted-foreground">
                  "Rahul's eye contact improved significantly when discussing his favorite cartoon characters. Caregivers can use this interest to build more social reciprocity next week."
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="calm-card space-y-4 bg-accent/20 border-accent-foreground/20">
              <h3 className="text-xl font-black flex items-center gap-2 border-b-2 border-foreground/10 pb-3">
                <Activity className="w-6 h-6 text-accent-foreground" /> Caregiver Instructions
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
                  <span className="font-medium">Maintain a strict visual schedule for morning transitions to reduce anxiety. Assist parents in enforcing this.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
                  <span className="font-medium">Praise specific social behaviors when assisting with playtime (e.g., "I like how you looked at me when asking for juice").</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent-foreground shrink-0 mt-0.5" />
                  <span className="font-medium">Ensure Rahul takes a 5-minute sensory break before starting afternoon tasks.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Assigned Home Activities */}
            <div className="calm-card space-y-4">
              <h3 className="text-xl font-black flex items-center gap-2 border-b-2 border-foreground/10 pb-3">
                <Heart className="w-6 h-6 text-secondary-foreground" /> Assigned Caregiver Activities
              </h3>
              <p className="text-sm font-medium text-muted-foreground mb-4">Please assist Rahul with these exercises before the next session.</p>
              
              <div className="space-y-3">
                <div className="bg-background border-2 border-foreground shadow-pop-sm p-4 rounded-xl flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary border-2 border-foreground flex items-center justify-center shrink-0">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-lg">Emotion Matching Game</h4>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Practice identifying faces.</p>
                    <Link to="/app/feelings" className="text-primary font-black text-sm flex items-center hover:underline">
                      Launch Activity <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
                
                <div className="bg-background border-2 border-foreground shadow-pop-sm p-4 rounded-xl flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-200 border-2 border-foreground flex items-center justify-center shrink-0">
                    <span className="text-xl">🫁</span>
                  </div>
                  <div>
                    <h4 className="font-black text-lg">Deep Breathing (4-7-8)</h4>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Do this when Rahul seems agitated during transitions.</p>
                    <span className="text-xs font-bold bg-muted px-2 py-1 rounded border-2 border-border/50 text-muted-foreground">Offline Activity</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Appointment */}
            <div className="calm-card space-y-4 bg-muted border-foreground/20">
              <h3 className="text-xl font-black flex items-center gap-2 border-b-2 border-foreground/10 pb-3">
                <Calendar className="w-6 h-6 text-primary" /> Next Scheduled Appointment
              </h3>
              
              <div className="bg-white p-6 rounded-xl border-2 border-foreground shadow-pop-sm text-center">
                <h4 className="text-2xl font-black text-primary mb-1">Aug 02, 2026</h4>
                <p className="text-lg font-bold text-foreground">10:00 AM - 10:45 AM</p>
                <div className="w-16 h-1 bg-border mx-auto my-4"></div>
                <p className="text-sm font-bold text-muted-foreground">Follow-up Therapy with Dr. Mehta</p>
              </div>
              
            </div>

          </div>
        </div>
        
      </div>
    </CaregiverShell>
  );
}
