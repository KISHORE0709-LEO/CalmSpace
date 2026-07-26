import { ParentShell } from "@/components/ParentShell";
import { 
  Calendar, 
  ChevronUp, 
  ChevronDown, 
  Smile, 
  MessageSquareWarning, 
  Gamepad2, 
  Stethoscope, 
  Utensils, 
  Bell, 
  Star, 
  Headphones,
  Check
} from "lucide-react";

const History = () => {
  return (
    <ParentShell title="" subtitle="" fullWidth>
      <div className="w-full max-w-[96%] mx-auto pt-4 h-full flex flex-col pb-16">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight mb-2">Daily Activity Check</h1>
            <p className="text-lg font-bold text-muted-foreground opacity-90">Monitoring Leo's emotional wellness and daily milestones.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: TIMELINES */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* TODAY CARD (Expanded) */}
            <div className="calm-card bg-card border-4 border-foreground shadow-pop-lg rounded-[2rem] p-6 md:p-8 flex flex-col">
              
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-secondary border-4 border-foreground rounded-full flex items-center justify-center shadow-pop-sm shrink-0">
                    <Calendar className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-foreground">Today, Oct 25</h2>
                    <p className="text-sm font-black text-primary uppercase tracking-widest mt-1">5 Events Tracked</p>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
                  <ChevronUp className="w-6 h-6 text-foreground" />
                </button>
              </div>

              {/* TIMELINE */}
              <div className="relative pl-6 sm:pl-10 pb-4">
                
                {/* Vertical Dotted Line */}
                <div className="absolute top-4 bottom-8 left-8 sm:left-12 w-1 border-l-4 border-dotted border-foreground/20 -translate-x-1/2" />

                {/* Event 1 */}
                <div className="relative pb-10">
                  <div className="absolute left-2 sm:left-2 top-6 w-4 h-4 rounded-full bg-yellow-400 border-4 border-foreground shadow-sm -translate-x-1/2 z-10" />
                  <div className="ml-8 sm:ml-12 bg-background border-4 border-foreground rounded-3xl p-5 shadow-pop-sm hover:-translate-y-1 transition-transform group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 border-2 border-foreground flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors shrink-0">
                          <Smile className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">1:30 PM • School Check-in</span>
                      </div>
                      <span className="bg-primary/20 text-primary border-2 border-primary/30 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest self-start sm:self-auto">
                        Mood: Happy
                      </span>
                    </div>
                    <p className="font-black text-lg text-foreground ml-[3.25rem]">Leo felt great after school!</p>
                  </div>
                </div>

                {/* Event 2 (Alert) */}
                <div className="relative pb-10">
                  <div className="absolute left-2 sm:left-2 top-6 w-4 h-4 rounded-full bg-destructive border-4 border-foreground shadow-sm -translate-x-1/2 z-10 animate-pulse" />
                  <div className="ml-8 sm:ml-12 flex flex-col gap-3">
                    <div className="bg-background border-4 border-destructive rounded-3xl p-5 shadow-pop-sm relative overflow-hidden group hover:-translate-y-1 transition-transform">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-destructive/10 rounded-bl-full pointer-events-none" />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted border-2 border-foreground flex items-center justify-center shrink-0">
                            <MessageSquareWarning className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">2:15 PM • Chatbot Conversation</span>
                        </div>
                        <span className="bg-destructive text-destructive-foreground border-2 border-foreground px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest self-start sm:self-auto shadow-sm">
                          ⚠ Parental Alert
                        </span>
                      </div>
                      <p className="font-bold text-lg text-foreground/80 italic ml-[3.25rem]">"Someone was mean at school today."</p>
                    </div>
                    {/* Suggestion Banner */}
                    <div className="bg-accent border-4 border-foreground rounded-full px-6 py-3 ml-4 shadow-pop-sm font-black text-sm text-accent-foreground flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-foreground" />
                      Suggestion: Offer extra support tonight
                    </div>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="relative pb-10">
                  <div className="absolute left-2 sm:left-2 top-6 w-4 h-4 rounded-full bg-blue-400 border-4 border-foreground shadow-sm -translate-x-1/2 z-10" />
                  <div className="ml-8 sm:ml-12 bg-background border-4 border-foreground rounded-3xl p-5 shadow-pop-sm hover:-translate-y-1 transition-transform group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-foreground flex items-center justify-center shrink-0">
                          <Gamepad2 className="w-5 h-5 text-blue-700" />
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">3:00 PM • Game Time</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-black text-xs text-blue-700 tracking-wider">Focus Score: 85%</span>
                        <div className="w-24 h-2 rounded-full bg-muted border border-foreground overflow-hidden">
                          <div className="w-[85%] h-full bg-blue-600 rounded-full" />
                        </div>
                      </div>
                    </div>
                    <p className="font-black text-lg text-foreground ml-[3.25rem]">Played "Space Explorer" for 30 mins.</p>
                  </div>
                </div>

                {/* Event 4 */}
                <div className="relative pb-10">
                  <div className="absolute left-2 sm:left-2 top-6 w-4 h-4 rounded-full bg-primary border-4 border-foreground shadow-sm -translate-x-1/2 z-10" />
                  <div className="ml-8 sm:ml-12 bg-background border-4 border-foreground rounded-3xl p-5 shadow-pop-sm flex justify-between items-center hover:-translate-y-1 transition-transform group">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-foreground flex items-center justify-center shrink-0">
                          <Stethoscope className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">4:00 PM • Speech Therapy</span>
                      </div>
                      <p className="font-black text-lg text-foreground ml-[3.25rem]">Live session with Dr. Sarah completed</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground border-4 border-foreground shadow-sm flex items-center justify-center shrink-0">
                      <Check className="w-6 h-6 stroke-[4]" />
                    </div>
                  </div>
                </div>

                {/* Event 5 */}
                <div className="relative">
                  <div className="absolute left-2 sm:left-2 top-6 w-4 h-4 rounded-full bg-yellow-400 border-4 border-foreground shadow-sm -translate-x-1/2 z-10" />
                  <div className="ml-8 sm:ml-12 bg-background border-4 border-foreground rounded-3xl p-5 shadow-pop-sm hover:-translate-y-1 transition-transform group">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 border-2 border-foreground flex items-center justify-center shrink-0">
                          <Utensils className="w-5 h-5 text-yellow-700" />
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">6:00 PM • Dinner Check-in</span>
                      </div>
                    </div>
                    <p className="font-black text-lg text-foreground ml-[3.25rem]">Logged: Paneer dinner - Yum!</p>
                  </div>
                </div>

              </div>
            </div>

            {/* YESTERDAY CARD (Collapsed) */}
            <div className="calm-card bg-card border-4 border-foreground shadow-pop rounded-[2rem] p-6 flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-muted border-4 border-foreground rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground">Yesterday, Oct 24</h2>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">7 Events Tracked</p>
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-background border-2 border-foreground flex items-center justify-center shadow-sm">
                <ChevronDown className="w-6 h-6 text-foreground" />
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* SENTIMENT ANALYSIS */}
            <div className="calm-card bg-card border-4 border-foreground shadow-pop-lg rounded-[2rem] p-8 flex flex-col">
              <h2 className="text-2xl font-black text-primary mb-8 text-center">Sentiment Analysis</h2>
              
              {/* Bar Chart Mockup */}
              <div className="flex items-end justify-center gap-6 h-32 mb-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-20 bg-primary/40 rounded-t-full border-4 border-b-0 border-foreground"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Morning</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-end gap-1">
                    <div className="w-8 h-28 bg-accent rounded-t-full border-4 border-b-0 border-foreground shadow-pop-sm z-10"></div>
                    <div className="w-8 h-12 bg-destructive/30 rounded-t-full border-4 border-b-0 border-foreground"></div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Noon</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-end gap-1">
                    <div className="w-8 h-24 bg-primary rounded-t-full border-4 border-b-0 border-foreground shadow-pop-sm z-10"></div>
                    <div className="w-8 h-16 bg-blue-300 rounded-t-full border-4 border-b-0 border-foreground"></div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Evening</span>
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-muted border-4 border-foreground rounded-2xl p-6 mt-4 shadow-inner">
                <h4 className="font-black text-sm mb-2 text-foreground">Daily Summary</h4>
                <p className="text-sm font-bold text-muted-foreground leading-relaxed">
                  Leo showed high engagement during play but had a notable emotional dip following school hours.
                </p>
              </div>
            </div>

            {/* CARE TIPS */}
            <div className="calm-card bg-card border-4 border-foreground shadow-pop-lg rounded-[2rem] p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-accent border-4 border-foreground rounded-full flex items-center justify-center shadow-pop-sm">
                  <Star className="w-5 h-5 text-accent-foreground fill-current" />
                </div>
                <h2 className="text-2xl font-black text-foreground">Care Tips</h2>
              </div>

              <div className="flex flex-col gap-6 mb-8">
                <div className="flex gap-4">
                  <div className="mt-1 shrink-0">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-foreground mb-1">Positive Reinforcement</h4>
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed">Recommended for handling school stress. Celebrate the 85% focus score!</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 shrink-0">
                    <Headphones className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-foreground mb-1">Open Dialogue</h4>
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed">Ask about the school situation using 'I feel' statements during dinner.</p>
                  </div>
                </div>
              </div>

              <button className="w-full bg-background hover:bg-muted text-primary font-black border-4 border-foreground rounded-2xl py-4 shadow-pop hover:-translate-y-1 transition-all text-sm">
                View Personalized Plan
              </button>
            </div>

            {/* QUOTE BANNER */}
            <div className="bg-gradient-to-br from-primary/30 via-accent/30 to-secondary/30 border-4 border-foreground shadow-pop rounded-[2rem] p-8 flex items-center justify-center min-h-[140px] relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circles-and-roundabouts.png')] opacity-20 mix-blend-overlay"></div>
              <p className="font-black text-lg text-center text-foreground italic relative z-10 leading-snug">
                "Consistency is the key to progress."
              </p>
            </div>

          </div>

        </div>
      </div>
    </ParentShell>
  );
};

export default History;
