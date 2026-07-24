import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, 
  Settings, Maximize, Activity, Sparkles, Pencil, FileText,
  AlertCircle, Smile, Frown, CheckCircle2, ChevronRight, Share2, StopCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TherapyRoom() {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTab, setActiveTab] = useState<"insights" | "tools" | "notes">("insights");
  const [emotionScore, setEmotionScore] = useState(85);
  const [stressLevel, setStressLevel] = useState(20);
  
  // Simulate live emotion tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setEmotionScore(prev => Math.min(100, Math.max(0, prev + (Math.random() * 10 - 5))));
      setStressLevel(prev => Math.min(100, Math.max(0, prev + (Math.random() * 8 - 4))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleEndSession = () => {
    navigate("/doctor/therapy/report");
  };

  return (
    <div className="h-screen max-h-screen bg-background flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b-2 border-foreground bg-card shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent border-2 border-foreground shadow-pop-sm flex items-center justify-center font-black">
            CS
          </div>
          <div>
            <h1 className="font-black text-lg leading-tight">Session with Rahul Kumar</h1>
            <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live • Goal: Emotional Regulation
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-red-100 border-2 border-red-500 text-red-600 px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 shadow-pop-sm">
            <StopCircle className="w-4 h-4 animate-pulse" /> REC
          </div>
          <div className="font-mono font-bold text-lg bg-muted px-4 py-1.5 rounded-xl border-2 border-foreground shadow-pop-sm">
            32:14
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        
        {/* Video Area */}
        <div className="flex-1 flex flex-col gap-4 relative">
          
          {/* Main Patient Video */}
          <div className="flex-1 calm-card p-0 overflow-hidden relative group border-4">
            <div className="absolute inset-0 bg-blue-50/50 flex items-center justify-center">
               <div className="w-48 h-48 rounded-full bg-blue-200 border-4 border-foreground shadow-pop-lg flex items-center justify-center text-7xl font-black text-blue-700 animate-float-slow">
                 R
               </div>
            </div>
            
            {/* Live AI Overlay */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="bg-white/90 backdrop-blur border-2 border-foreground shadow-pop-sm px-3 py-1.5 rounded-xl flex items-center gap-2 font-bold text-sm">
                <Smile className="w-4 h-4 text-green-500" /> Calm (85%)
              </div>
              <div className="bg-white/90 backdrop-blur border-2 border-foreground shadow-pop-sm px-3 py-1.5 rounded-xl flex items-center gap-2 font-bold text-sm">
                <Activity className="w-4 h-4 text-blue-500" /> Engaged
              </div>
            </div>

            <div className="absolute bottom-6 left-6 bg-background border-2 border-foreground shadow-pop-sm px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-black">Rahul & Mother</span>
            </div>

            <button className="absolute top-6 right-6 p-2 bg-background border-2 border-foreground shadow-pop-sm rounded-xl hover:-translate-y-1 transition-all opacity-0 group-hover:opacity-100">
              <Maximize className="w-5 h-5" />
            </button>
          </div>

          {/* Picture in Picture (Self) */}
          <div className="absolute bottom-6 right-6 w-64 aspect-video calm-card p-0 overflow-hidden border-4 z-10 shadow-pop-lg hover:scale-105 transition-transform cursor-move">
             <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
               {isVideoOff ? (
                 <div className="w-16 h-16 rounded-full bg-muted border-2 border-foreground flex items-center justify-center font-black text-xl">
                   Dr
                 </div>
               ) : (
                 <div className="flex flex-col items-center gap-2 text-foreground/50">
                   <Video className="w-8 h-8" />
                   <span className="text-xs font-bold uppercase tracking-wider">Camera On</span>
                 </div>
               )}
             </div>
             <div className="absolute bottom-2 left-2 bg-background border-2 border-foreground shadow-pop-sm px-2 py-1 rounded-lg flex items-center gap-2 text-xs font-bold">
               {isMuted && <MicOff className="w-3 h-3 text-red-500" />}
               You (Host)
             </div>
          </div>
        </div>

        {/* Therapy Toolkit Sidebar */}
        <div className="w-[400px] calm-card p-0 flex flex-col border-4 shrink-0 overflow-hidden animate-fade-up">
          {/* Tabs */}
          <div className="flex border-b-2 border-foreground bg-muted">
            <button 
              onClick={() => setActiveTab("insights")}
              className={`flex-1 py-4 text-sm font-black transition-colors border-r-2 border-foreground ${activeTab === 'insights' ? 'bg-background' : 'hover:bg-background/50'}`}
            >
              Insights
            </button>
            <button 
              onClick={() => setActiveTab("tools")}
              className={`flex-1 py-4 text-sm font-black transition-colors border-r-2 border-foreground ${activeTab === 'tools' ? 'bg-background' : 'hover:bg-background/50'}`}
            >
              Tools
            </button>
            <button 
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-4 text-sm font-black transition-colors ${activeTab === 'notes' ? 'bg-background' : 'hover:bg-background/50'}`}
            >
              Notes
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-5 bg-background">
            
            {activeTab === "insights" && (
              <div className="space-y-6 animate-fade-up">
                <div className="p-4 rounded-2xl bg-accent/30 border-2 border-accent-foreground/20 space-y-3">
                  <h3 className="font-black flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent-foreground" /> Live Emotion Score
                  </h3>
                  <div className="h-4 bg-background rounded-full border-2 border-foreground overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-1000 ease-out" 
                      style={{ width: `${emotionScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-muted-foreground">
                    <span>Agitated</span>
                    <span className="text-green-600">Calm ({Math.round(emotionScore)}%)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 space-y-3">
                  <h3 className="font-black flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" /> Stress Indicator
                  </h3>
                  <div className="h-4 bg-background rounded-full border-2 border-foreground overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${stressLevel > 60 ? 'bg-red-500' : 'bg-yellow-400'}`}
                      style={{ width: `${stressLevel}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-muted-foreground">
                    <span>Low</span>
                    <span>{Math.round(stressLevel)}%</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t-2 border-border/50">
                  <h3 className="font-black text-sm text-muted-foreground uppercase tracking-wider">AI Suggestions</h3>
                  <div className="p-3 bg-muted rounded-xl border-2 border-foreground shadow-pop-sm flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold">Child seems highly engaged. Great time to introduce the turn-taking game.</p>
                  </div>
                  <div className="p-3 bg-muted rounded-xl border-2 border-foreground shadow-pop-sm flex gap-3 items-start">
                    <Activity className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-bold">Attention span dropping slightly over last 2 mins. Consider a sensory break.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tools" && (
              <div className="space-y-4 animate-fade-up">
                <h3 className="font-black text-lg mb-4">Interactive Activities</h3>
                
                <div className="group p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 hover:border-purple-500 hover:shadow-pop-sm transition-all cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center text-2xl">🎨</div>
                    <div>
                      <h4 className="font-black text-purple-900">Shared Whiteboard</h4>
                      <p className="text-xs font-bold text-purple-600/70">Draw and express feelings</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-purple-400 group-hover:text-purple-700 transition-colors" />
                </div>

                <div className="group p-4 rounded-2xl bg-orange-50 border-2 border-orange-200 hover:border-orange-500 hover:shadow-pop-sm transition-all cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center text-2xl">🎲</div>
                    <div>
                      <h4 className="font-black text-orange-900">Emotion Cards Game</h4>
                      <p className="text-xs font-bold text-orange-600/70">Practice facial expressions</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-orange-400 group-hover:text-orange-700 transition-colors" />
                </div>
                
                <div className="group p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 hover:border-blue-500 hover:shadow-pop-sm transition-all cursor-pointer flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center text-2xl">🎵</div>
                    <div>
                      <h4 className="font-black text-blue-900">Calming Sounds</h4>
                      <p className="text-xs font-bold text-blue-600/70">Play background sensory audio</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-400 group-hover:text-blue-700 transition-colors" />
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="flex flex-col h-full animate-fade-up gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-lg">Private Notes</h3>
                  <Badge variant="outline" className="border-2 border-foreground bg-muted font-bold">Auto-saving</Badge>
                </div>
                <textarea 
                  className="flex-1 w-full border-2 border-foreground shadow-pop-sm rounded-xl p-4 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background/50"
                  placeholder="Type session observations here. These notes are completely private and will be attached to the final report..."
                  defaultValue="- Rahul responded well to visual schedule today.
- Eye contact improved during the emotion card game.
- Mother noted he had a tough morning transition, which explains initial elevated stress."
                ></textarea>
                <Button className="w-full h-12 border-2 border-foreground shadow-pop-sm font-black rounded-xl">
                  <Pencil className="w-4 h-4 mr-2" /> Quick Insert AI Summary
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="h-24 px-6 flex items-center justify-between bg-card border-t-2 border-foreground shrink-0 z-10">
        <div className="flex-1 flex items-center gap-4">
          <Button variant="outline" className="h-12 w-12 p-0 rounded-xl border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform">
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="outline" className="h-12 w-12 p-0 rounded-xl border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex justify-center items-center gap-4">
          <Button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform ${isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-background text-foreground hover:bg-muted'}`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          
          <Button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`w-14 h-14 rounded-full border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-background text-foreground hover:bg-muted'}`}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </Button>
          
          <Button className="w-14 h-14 rounded-full bg-primary text-primary-foreground border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform">
            <Share2 className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex-1 flex justify-end">
          <Button 
            onClick={handleEndSession}
            className="h-14 px-8 bg-red-500 hover:bg-red-600 text-white font-black text-lg rounded-full border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all"
          >
            <PhoneOff className="w-6 h-6 mr-2" /> End Session
          </Button>
        </div>
      </div>
    </div>
  );
}

// Temporary Badge component to use if not imported
const Badge = ({ children, className }: { children: React.ReactNode, className?: string, variant?: string }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
    {children}
  </span>
);
