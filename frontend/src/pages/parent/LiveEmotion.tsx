import { ParentShell } from "@/components/ParentShell";
import { 
  Activity, HeartPulse, Lightbulb, AlertTriangle, ArrowRight, 
  History, MessageSquare, Phone, CheckCircle2, TrendingUp, ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LiveEmotion = () => {
  const navigate = useNavigate();

  return (
    <ParentShell title="Live Session View" subtitle="Real-time monitoring and immediate guidance" fullWidth>
      <div className="grid lg:grid-cols-12 gap-6 pb-12 animate-fade-up items-start max-w-[1800px] mx-auto px-4">
        
        {/* ================= LEFT COLUMN (Stats & Vitals) ================= */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Profile & Live Status */}
          <div className="calm-card bg-white border-4 border-foreground shadow-pop rounded-2xl p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b-2 border-foreground/10 pb-4">
               <div className="flex flex-col items-end w-full">
                  <div className="flex items-center gap-2 bg-green-100 border-2 border-green-400 text-green-800 px-3 py-1.5 rounded-full font-black text-sm shadow-sm w-full justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                    Live Monitoring
                  </div>
                  <div className="text-xs font-bold text-muted-foreground mt-2 w-full text-center uppercase tracking-widest">
                    Last updated 2:18 PM
                  </div>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 border-4 border-foreground shadow-pop-sm flex items-center justify-center text-xl font-black text-blue-900 shrink-0">
                RK
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground leading-tight">Rahul Kumar</h2>
                <p className="text-xs font-bold text-muted-foreground">Age 8 • Spectrum A</p>
              </div>
            </div>
          </div>

          {/* Heart Rate Strip */}
          <div className="calm-card bg-white border-4 border-foreground shadow-pop p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-red-500" /> Heart Rate
              </h3>
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
            <div className="h-24 relative overflow-hidden flex items-center bg-red-50 rounded-xl border-4 border-foreground shadow-inner">
              <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="absolute left-0 h-[85%] w-[200%] stroke-red-500 fill-transparent stroke-[4px] animate-ecg drop-shadow-sm">
                <path d="M0 50 L10 50 L15 20 L20 80 L25 50 L40 50 L45 10 L55 90 L65 50 L80 50 L85 30 L90 70 L95 50 L110 50 
                         L125 50 L130 20 L135 80 L140 50 L155 50 L160 10 L170 90 L180 50 L195 50 L200 30 L205 70 L210 50 L220 50
                         M220 50 L230 50 L235 20 L240 80 L245 50 L260 50 L265 10 L275 90 L285 50 L300 50 L305 30 L310 70 L315 50 L330 50 
                         L345 50 L350 20 L355 80 L360 50 L375 50 L380 10 L390 90 L400 50 L415 50 L420 30 L425 70 L430 50 L440 50" 
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="absolute right-0 bottom-2 bg-white/95 backdrop-blur-md pl-3 pr-2 py-1 rounded-l-xl border-y-4 border-l-4 border-foreground shadow-pop-sm flex items-end gap-1">
                <div className="text-2xl font-black text-red-600 leading-none">94</div>
                <div className="text-[10px] font-black text-muted-foreground tracking-widest uppercase pb-0.5">BPM</div>
              </div>
            </div>
          </div>

          {/* AI Metrics: Confidence & Trend */}
          <div className="calm-card bg-white border-4 border-foreground shadow-pop p-6 flex flex-col gap-5">
            <div>
              <div className="flex justify-between items-end mb-2">
                <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Emotion Confidence
                </h3>
                <span className="font-black text-primary">92%</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden border-2 border-foreground/10">
                <div className="h-full bg-primary w-[92%] rounded-full" />
              </div>
            </div>

            <div className="pt-4 border-t-2 border-foreground/10">
              <h3 className="text-sm font-black text-muted-foreground uppercase tracking-wider mb-2">Stress Trend</h3>
              <div className="flex items-center gap-2 text-orange-600 bg-orange-50 border-2 border-orange-200 px-3 py-2 rounded-xl">
                <TrendingUp className="w-5 h-5" />
                <span className="font-bold text-sm">Slightly Increasing</span>
              </div>
            </div>
          </div>

        </div>

        {/* ================= CENTER COLUMN (Hero & Guidance) ================= */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          {/* HERO: Current Emotion State */}
          <div className="calm-card bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-foreground shadow-pop-xl p-8 lg:p-12 relative overflow-hidden flex flex-col items-center justify-center text-center">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-300/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-yellow-300/30 rounded-full blur-3xl pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur border-4 border-foreground shadow-pop px-6 py-2 rounded-full font-black uppercase tracking-widest text-orange-900 mb-8 relative z-10 text-sm">
              Status <span className="mx-2 text-foreground/20">|</span> 🟡 Attention Recommended
            </div>
            
            <div className="text-[120px] leading-none animate-wiggle drop-shadow-2xl relative z-10 mb-6">
              😟
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-black text-orange-900 tracking-tight relative z-10 mb-4">
              Mildly Stressed
            </h1>
            <p className="text-2xl font-bold text-orange-800/80 relative z-10">
              Elevated physiological signs detected.
            </p>
          </div>

          {/* What this means */}
          <div className="calm-card bg-blue-50 border-4 border-foreground shadow-pop-lg p-8 flex-1 flex flex-col relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-200/50 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-12 h-12 bg-blue-100 rounded-full border-2 border-blue-300 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-3xl font-black text-blue-900">What this means</h3>
            </div>

            <div className="bg-white rounded-3xl border-4 border-foreground shadow-pop-sm p-6 lg:p-8 relative z-10">
              <p className="text-xl font-bold text-foreground mb-6">
                Child may be feeling overwhelmed and needs a proactive sensory break to prevent escalation.
              </p>
              <div className="space-y-4">
                <h4 className="font-black text-sm text-muted-foreground uppercase tracking-widest">Suggested Immediate Actions</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-4 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer p-4 rounded-2xl border-2 border-blue-200 shadow-sm">
                    <span className="text-2xl">💡</span>
                    <span className="font-bold text-blue-900 text-lg">Dim the lights</span>
                  </li>
                  <li className="flex items-center gap-4 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer p-4 rounded-2xl border-2 border-blue-200 shadow-sm">
                    <span className="text-2xl">🎧</span>
                    <span className="font-bold text-blue-900 text-lg">Offer calming sounds or headphones</span>
                  </li>
                  <li className="flex items-center gap-4 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer p-4 rounded-2xl border-2 border-blue-200 shadow-sm">
                    <span className="text-2xl">🛋️</span>
                    <span className="font-bold text-blue-900 text-lg">Guide to the Quiet Corner</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN (History & Actions) ================= */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Positive Observation */}
          <div className="calm-card bg-green-50 border-4 border-foreground shadow-pop p-6">
            <h3 className="text-sm font-black text-green-800 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" /> Positive Observation
            </h3>
            <div className="bg-white border-2 border-green-200 p-4 rounded-xl shadow-sm text-green-900 font-bold text-sm leading-relaxed">
              ✓ Child remains responsive to verbal prompts.
            </div>
          </div>

          {/* Recent State Changes */}
          <div className="calm-card bg-white border-4 border-foreground shadow-pop p-6 flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-black flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" /> Recent Transitions
              </h3>
            </div>
            
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px before:h-full before:w-1 before:bg-gradient-to-b before:from-blue-500 before:via-blue-200 before:to-transparent">
              
              {/* Timeline Item 1 */}
              <div className="relative flex items-center group is-active">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-foreground bg-orange-200 shadow-sm shrink-0 z-10 relative">
                  <div className="w-2 h-2 bg-orange-600 rounded-full animate-ping"></div>
                </div>
                <div className="w-[calc(100%-3rem)] bg-orange-50 p-3 rounded-xl border-2 border-orange-200 shadow-sm ml-4">
                  <div className="flex flex-col gap-0.5 mb-1">
                    <span className="font-black text-sm text-orange-900">Mildly Stressed</span>
                    <time className="text-xs font-bold text-orange-600">2:15 PM</time>
                  </div>
                </div>
              </div>

              {/* Timeline Item 2 */}
              <div className="relative flex items-center group">
                <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-foreground bg-green-200 shadow-sm shrink-0 z-10 relative">
                </div>
                <div className="w-[calc(100%-3rem)] bg-green-50 p-3 rounded-xl border-2 border-green-200 shadow-sm ml-4">
                  <div className="flex flex-col gap-0.5 mb-1">
                    <span className="font-black text-sm text-green-900">Calm</span>
                    <time className="text-xs font-bold text-green-600">12:30 PM</time>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => navigate("/parent/crisis-alerts")}
              className="w-full flex items-center justify-between bg-red-100 hover:bg-red-200 border-4 border-foreground shadow-pop hover:shadow-pop-md hover:-translate-y-1 transition-all rounded-2xl p-5 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full border-2 border-red-300 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-lg text-red-900">Go to Alerts</h4>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-red-500 group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => navigate("/parent/chat")}
              className="w-full flex items-center justify-between bg-purple-100 hover:bg-purple-200 border-4 border-foreground shadow-pop hover:shadow-pop-md hover:-translate-y-1 transition-all rounded-2xl p-5 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full border-2 border-purple-300 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-lg text-purple-900">Message Caregiver</h4>
                </div>
              </div>
            </button>

            <button 
              onClick={() => navigate("/parent/chat")}
              className="w-full flex items-center justify-between bg-blue-100 hover:bg-blue-200 border-4 border-foreground shadow-pop hover:shadow-pop-md hover:-translate-y-1 transition-all rounded-2xl p-5 group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full border-2 border-blue-300 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-lg text-blue-900">Message Doctor</h4>
                </div>
              </div>
            </button>
          </div>

        </div>

      </div>
    </ParentShell>
  );
};

export default LiveEmotion;
