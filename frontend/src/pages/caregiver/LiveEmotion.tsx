import { CaregiverShell } from "@/components/CaregiverShell";
import { Activity, Clock, HeartPulse, Lightbulb, AlertTriangle, ArrowRight, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LiveEmotion = () => {
  const navigate = useNavigate();

  return (
    <CaregiverShell title="Live Session View" subtitle="Real-time monitoring and immediate guidance" fullWidth>
      <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12 animate-fade-up">
        
        {/* Child Profile & Session Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white border-4 border-foreground shadow-pop rounded-2xl p-6 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 border-4 border-foreground shadow-pop-sm flex items-center justify-center text-2xl font-black text-blue-900">
              RK
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground leading-tight">Rahul Kumar</h2>
              <p className="text-sm font-bold text-muted-foreground">Age 8 • Spectrum Profile A</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-100 border-2 border-green-300 text-green-800 px-4 py-2 rounded-xl font-bold shadow-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Session active since 9:00 AM
          </div>
        </div>

        {/* HERO: Current Emotion State */}
        <div className="calm-card bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-foreground shadow-pop-lg p-8 sm:p-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-orange-300/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-yellow-300/30 rounded-full blur-3xl pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border-2 border-foreground shadow-pop-sm px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-orange-800 mb-6 relative z-10">
            <Activity className="w-4 h-4 animate-pulse" /> Live State
          </div>
          
          <div className="text-[100px] leading-none animate-wiggle drop-shadow-xl relative z-10 mb-4">
            😟
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black text-orange-900 tracking-tight relative z-10 mb-2">
            Mildly Stressed
          </h1>
          <p className="text-xl font-bold text-orange-800/80 relative z-10">
            Elevated physiological signs detected.
          </p>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Left Column: Vitals & History */}
          <div className="flex flex-col gap-8">
            
            {/* Heart Rate Strip (Reused styling from Feelings) */}
            <div className="calm-card bg-white border-4 border-foreground shadow-pop p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black flex items-center gap-2">
                  <HeartPulse className="w-6 h-6 text-red-500" /> Heart Rate
                </h3>
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-md uppercase tracking-wider animate-pulse">Live</span>
              </div>
              
              <style>{`
                @keyframes ecg-scroll {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .animate-ecg {
                  animation: ecg-scroll 3s linear infinite;
                }
              `}</style>
              <div className="h-32 relative overflow-hidden flex items-center bg-red-50 rounded-xl border-4 border-foreground shadow-inner">
                <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="absolute left-0 h-[85%] w-[200%] stroke-red-500 fill-transparent stroke-[4px] animate-ecg drop-shadow-sm">
                  <path d="M0 50 L10 50 L15 20 L20 80 L25 50 L40 50 L45 10 L55 90 L65 50 L80 50 L85 30 L90 70 L95 50 L110 50 
                           L125 50 L130 20 L135 80 L140 50 L155 50 L160 10 L170 90 L180 50 L195 50 L200 30 L205 70 L210 50 L220 50
                           M220 50 L230 50 L235 20 L240 80 L245 50 L260 50 L265 10 L275 90 L285 50 L300 50 L305 30 L310 70 L315 50 L330 50 
                           L345 50 L350 20 L355 80 L360 50 L375 50 L380 10 L390 90 L400 50 L415 50 L420 30 L425 70 L430 50 L440 50" 
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="absolute right-0 bottom-3 bg-white/95 backdrop-blur-md pl-4 pr-3 py-1.5 rounded-l-xl border-y-4 border-l-4 border-foreground shadow-pop-sm flex items-end gap-1">
                  <div className="text-3xl font-black text-red-600 leading-none">94</div>
                  <div className="text-xs font-black text-muted-foreground tracking-widest uppercase pb-0.5">BPM</div>
                </div>
              </div>
            </div>

            {/* Recent State Changes */}
            <div className="calm-card bg-white border-4 border-foreground shadow-pop p-6 flex-1">
              <div className="flex items-center gap-2 mb-6">
                <History className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-black">Recent Transitions</h3>
                <span className="ml-auto text-xs font-bold text-muted-foreground uppercase">Last 2 Hours</span>
              </div>
              
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-blue-500 before:via-blue-200 before:to-transparent">
                
                {/* Timeline Item 1 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-foreground bg-orange-200 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative left-0 md:left-1/2">
                    <div className="w-2 h-2 bg-orange-600 rounded-full animate-ping"></div>
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-orange-50 p-3 rounded-xl border-2 border-orange-200 shadow-sm ml-4 md:ml-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-sm text-orange-900">Mildly Stressed</span>
                      <time className="text-xs font-bold text-orange-600">2:15 PM</time>
                    </div>
                  </div>
                </div>

                {/* Timeline Item 2 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-foreground bg-green-200 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 relative left-0 md:left-1/2">
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-green-50 p-3 rounded-xl border-2 border-green-200 shadow-sm ml-4 md:ml-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black text-sm text-green-900">Calm</span>
                      <time className="text-xs font-bold text-green-600">12:30 PM</time>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Guidance & Actions */}
          <div className="flex flex-col gap-8">
            
            {/* What this means & Actions */}
            <div className="calm-card bg-blue-50 border-4 border-foreground shadow-pop p-8 flex-1 flex flex-col relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-200/50 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 bg-blue-100 rounded-full border-2 border-blue-300 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-blue-900">What this means</h3>
              </div>

              <div className="bg-white rounded-2xl border-2 border-blue-200 p-6 mb-6 relative z-10 shadow-sm">
                <p className="text-lg font-bold text-foreground mb-4">
                  Child may be feeling overwhelmed and needs a proactive sensory break to prevent escalation.
                </p>
                <div className="space-y-3">
                  <h4 className="font-black text-sm text-muted-foreground uppercase tracking-widest">Suggested Immediate Actions</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      <span className="text-xl">💡</span>
                      <span className="font-bold text-blue-900">Dim the lights</span>
                    </li>
                    <li className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      <span className="text-xl">🎧</span>
                      <span className="font-bold text-blue-900">Offer calming sounds or headphones</span>
                    </li>
                    <li className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      <span className="text-xl">🛋️</span>
                      <span className="font-bold text-blue-900">Guide to the Quiet Corner</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-auto relative z-10 pt-4">
                <button 
                  onClick={() => navigate("/caregiver/incident-logging")}
                  className="w-full flex items-center justify-between bg-red-50 hover:bg-red-100 border-4 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all rounded-[2rem] p-6 group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full border-2 border-red-200 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-black text-xl text-red-900">Log this moment</h4>
                      <p className="text-sm font-bold text-red-700/80">Record incident for clinical review</p>
                    </div>
                  </div>
                  <ArrowRight className="w-8 h-8 text-red-500 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </CaregiverShell>
  );
};

export default LiveEmotion;
