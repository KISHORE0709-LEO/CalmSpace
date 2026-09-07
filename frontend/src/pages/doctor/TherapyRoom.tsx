import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, 
  Settings, Maximize, Activity, Sparkles, Pencil,
  AlertCircle, Smile, StopCircle, ChevronRight, Share2,
  MonitorUp, Hand, SmilePlus, Type, MoreVertical, X, CheckCircle2, Eraser, MousePointer2, ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TherapyRoom() {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [activeTab, setActiveTab] = useState<"insights" | "tools" | "notes">("insights");
  const [mainView, setMainView] = useState<"video" | "whiteboard" | "cards">("video");
  const [emotionScore, setEmotionScore] = useState(85);
  const [stressLevel, setStressLevel] = useState(20);
  const [isHandRaised, setIsHandRaised] = useState(false);
  
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

  // Emotion Cards Game Logic
  const emotions = [
    { emoji: '😄', title: 'Happy', desc: 'Can you make a happy face?' },
    { emoji: '😢', title: 'Sad', desc: 'Show me a sad face.' },
    { emoji: '😠', title: 'Angry', desc: 'What does an angry face look like?' },
    { emoji: '😲', title: 'Surprised', desc: 'Make a surprised face!' },
    { emoji: '😨', title: 'Scared', desc: 'Show me a scared expression.' }
  ];
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const nextCard = () => setCurrentCardIndex(prev => (prev + 1) % emotions.length);
  const prevCard = () => setCurrentCardIndex(prev => (prev === 0 ? emotions.length - 1 : prev - 1));

  // Whiteboard Logic
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingColor, setDrawingColor] = useState("#000000");
  const [drawingMode, setDrawingMode] = useState<"draw" | "erase">("draw");

  // Setup canvas size when whiteboard opens
  useEffect(() => {
    if (mainView === "whiteboard" && canvasRef.current) {
      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        // Fill with white background initially
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "transparent";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [mainView]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    if (drawingMode === "erase") {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 20;
    } else {
      ctx.strokeStyle = drawingColor;
      ctx.lineWidth = 5;
    }
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.closePath();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="h-screen w-screen max-h-screen bg-background flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b-2 border-foreground bg-card shadow-sm shrink-0 z-20">
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
      <div className="flex-1 flex overflow-hidden p-2 gap-2 bg-muted/30">
        
        {/* Main Stage (Video or Tool) */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border-2 border-foreground shadow-pop bg-card flex flex-col">
          
          {/* View Switcher: Video */}
          {mainView === "video" && (
            <div className="flex-1 relative flex items-center justify-center bg-blue-50/50">
              <div className="absolute w-64 h-64 bg-green-400/20 rounded-full animate-pulse-soft blur-2xl"></div>
              
              <div className="relative w-48 h-48 rounded-full bg-blue-200 border-4 border-foreground shadow-pop-lg flex items-center justify-center text-7xl font-black text-blue-700 animate-float-slow z-10">
                R
              </div>
              
              <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                <div className="bg-white/90 backdrop-blur border-2 border-foreground shadow-pop-sm px-3 py-1.5 rounded-xl flex items-center gap-2 font-bold text-sm">
                  <Smile className="w-4 h-4 text-green-500" /> Calm ({Math.round(emotionScore)}%)
                </div>
                <div className="bg-white/90 backdrop-blur border-2 border-foreground shadow-pop-sm px-3 py-1.5 rounded-xl flex items-center gap-2 font-bold text-sm">
                  <Activity className="w-4 h-4 text-blue-500" /> Engaged
                </div>
              </div>

              <div className="absolute bottom-6 left-6 bg-background border-2 border-foreground shadow-pop-sm px-4 py-2 rounded-xl flex items-center gap-3 z-10">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="font-black">Rahul & Mother</span>
              </div>
            </div>
          )}

          {/* View Switcher: Whiteboard */}
          {mainView === "whiteboard" && (
            <div className="flex-1 relative bg-white flex flex-col">
              <div className="absolute top-4 left-4 bg-white border-2 border-foreground shadow-pop-sm rounded-xl p-2 flex flex-col gap-2 z-10 animate-fade-up">
                <button 
                  onClick={() => setDrawingMode("draw")}
                  className={`p-2 rounded-lg transition-colors ${drawingMode === "draw" ? "bg-primary text-primary-foreground border-2 border-foreground" : "hover:bg-muted"}`}
                  title="Draw"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setDrawingMode("erase")}
                  className={`p-2 rounded-lg transition-colors ${drawingMode === "erase" ? "bg-primary text-primary-foreground border-2 border-foreground" : "hover:bg-muted"}`}
                  title="Eraser"
                >
                  <Eraser className="w-5 h-5" />
                </button>
                <button 
                  onClick={clearCanvas}
                  className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                  title="Clear Canvas"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="w-full h-px bg-border my-1"></div>
                
                <button onClick={() => {setDrawingColor("#000000"); setDrawingMode("draw");}} className={`w-9 h-9 rounded-full bg-black border-2 ${drawingColor === "#000000" && drawingMode === "draw" ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent"}`}></button>
                <button onClick={() => {setDrawingColor("#ef4444"); setDrawingMode("draw");}} className={`w-9 h-9 rounded-full bg-red-500 border-2 ${drawingColor === "#ef4444" && drawingMode === "draw" ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent"}`}></button>
                <button onClick={() => {setDrawingColor("#3b82f6"); setDrawingMode("draw");}} className={`w-9 h-9 rounded-full bg-blue-500 border-2 ${drawingColor === "#3b82f6" && drawingMode === "draw" ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent"}`}></button>
                <button onClick={() => {setDrawingColor("#22c55e"); setDrawingMode("draw");}} className={`w-9 h-9 rounded-full bg-green-500 border-2 ${drawingColor === "#22c55e" && drawingMode === "draw" ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent"}`}></button>
                <button onClick={() => {setDrawingColor("#eab308"); setDrawingMode("draw");}} className={`w-9 h-9 rounded-full bg-yellow-500 border-2 ${drawingColor === "#eab308" && drawingMode === "draw" ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent"}`}></button>
              </div>
              
              <div className="absolute top-4 right-4 z-10">
                <Button onClick={() => setMainView("video")} variant="outline" className="border-2 border-foreground shadow-pop-sm font-bold bg-white hover:bg-red-50 hover:text-red-600">
                  <X className="w-4 h-4 mr-2" /> Close Whiteboard
                </Button>
              </div>
              
              {/* The Drawing Canvas */}
              <div className="w-full h-full flex-1 cursor-crosshair relative">
                {/* Visual grid background */}
                <div className="absolute inset-0 pattern-dots pattern-blue-500 pattern-bg-transparent pattern-size-4 pattern-opacity-10 pointer-events-none"></div>
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseOut={stopDrawing}
                  className="absolute inset-0 w-full h-full touch-none z-0"
                />
              </div>
            </div>
          )}

          {/* View Switcher: Emotion Cards */}
          {mainView === "cards" && (
            <div className="flex-1 relative bg-purple-50 flex flex-col items-center justify-center gap-8">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="absolute top-4 right-4 z-10">
                <Button onClick={() => setMainView("video")} variant="outline" className="border-2 border-foreground shadow-pop-sm font-bold bg-white hover:bg-red-50 hover:text-red-600">
                  <X className="w-4 h-4 mr-2" /> Close Game
                </Button>
              </div>
              
              <h2 className="text-3xl font-black text-purple-900 absolute top-8 border-b-4 border-purple-200 pb-2">Emotion Cards Game</h2>
              
              <div className="w-[340px] h-[440px] bg-white rounded-[2rem] border-4 border-foreground shadow-pop-lg flex flex-col items-center justify-center p-8 text-center transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer" onClick={nextCard}>
                <div className="text-9xl mb-8 animate-bounce-slow" key={currentCardIndex}>{emotions[currentCardIndex].emoji}</div>
                <h3 className="text-5xl font-black text-primary tracking-tight">{emotions[currentCardIndex].title}</h3>
                <p className="text-muted-foreground font-bold mt-6 text-lg">{emotions[currentCardIndex].desc}</p>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={prevCard} variant="outline" className="h-16 px-8 border-2 border-foreground shadow-pop-sm font-black text-xl bg-white hover:-translate-y-1 transition-all rounded-xl">
                  <ChevronLeft className="w-6 h-6 mr-2" /> Previous
                </Button>
                <Button onClick={nextCard} className="h-16 px-10 border-2 border-foreground shadow-pop-sm font-black text-xl bg-purple-500 text-white hover:bg-purple-600 hover:-translate-y-1 transition-all rounded-xl">
                  Next Card <ChevronRight className="w-6 h-6 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Picture in Picture (Self) - Always visible */}
          <div className="absolute bottom-6 right-6 w-56 aspect-video bg-card rounded-xl overflow-hidden border-2 border-foreground z-30 shadow-pop hover:scale-105 transition-transform cursor-move">
             <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
               {isVideoOff ? (
                 <div className="w-14 h-14 rounded-full bg-muted border-2 border-foreground flex items-center justify-center font-black text-lg">
                   Dr
                 </div>
               ) : (
                 <div className="flex flex-col items-center gap-2 text-foreground/50">
                   <Video className="w-6 h-6" />
                   <span className="text-[10px] font-bold uppercase tracking-wider">Camera On</span>
                 </div>
               )}
             </div>
             <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur border-2 border-foreground shadow-pop-sm px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1.5">
               {isMuted && <MicOff className="w-3 h-3 text-red-500" />}
               You (Host)
             </div>
          </div>
        </div>

        {/* Therapy Toolkit Sidebar */}
        <div className="w-[360px] lg:w-[400px] bg-card flex flex-col border-2 border-foreground shadow-pop shrink-0 overflow-hidden rounded-2xl">
          {/* Tabs */}
          <div className="flex border-b-2 border-foreground bg-muted">
            <button 
              onClick={() => setActiveTab("insights")}
              className={`flex-1 py-3 text-xs lg:text-sm font-black transition-colors border-r-2 border-foreground ${activeTab === 'insights' ? 'bg-background' : 'hover:bg-background/50'}`}
            >
              Insights
            </button>
            <button 
              onClick={() => setActiveTab("tools")}
              className={`flex-1 py-3 text-xs lg:text-sm font-black transition-colors border-r-2 border-foreground ${activeTab === 'tools' ? 'bg-background' : 'hover:bg-background/50'}`}
            >
              Tools
            </button>
            <button 
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-3 text-xs lg:text-sm font-black transition-colors ${activeTab === 'notes' ? 'bg-background' : 'hover:bg-background/50'}`}
            >
              Notes
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-background">
            
            {activeTab === "insights" && (
              <div className="space-y-5 animate-fade-up">
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
                  <h3 className="font-black text-xs text-muted-foreground uppercase tracking-wider">AI Suggestions</h3>
                  <div className="p-3 bg-muted rounded-xl border-2 border-foreground shadow-pop-sm flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold">Child seems highly engaged. Great time to introduce the turn-taking game.</p>
                  </div>
                  <div className="p-3 bg-muted rounded-xl border-2 border-foreground shadow-pop-sm flex gap-3 items-start">
                    <Activity className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold">Attention span dropping slightly over last 2 mins. Consider a sensory break.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tools" && (
              <div className="space-y-3 animate-fade-up">
                <h3 className="font-black text-sm text-muted-foreground uppercase tracking-wider mb-2">Interactive Activities</h3>
                
                <button 
                  onClick={() => setMainView("whiteboard")}
                  className={`w-full group p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${mainView === 'whiteboard' ? 'bg-purple-100 border-purple-500 shadow-pop-sm' : 'bg-purple-50 border-purple-200 hover:border-purple-500 hover:shadow-pop-sm'}`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center text-2xl border-2 border-purple-300">🎨</div>
                    <div>
                      <h4 className="font-black text-purple-900">Shared Whiteboard</h4>
                      <p className="text-xs font-bold text-purple-600/80">Draw and express feelings</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-colors ${mainView === 'whiteboard' ? 'text-purple-700' : 'text-purple-400 group-hover:text-purple-700'}`} />
                </button>

                <button 
                  onClick={() => setMainView("cards")}
                  className={`w-full group p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${mainView === 'cards' ? 'bg-orange-100 border-orange-500 shadow-pop-sm' : 'bg-orange-50 border-orange-200 hover:border-orange-500 hover:shadow-pop-sm'}`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-orange-200 rounded-xl flex items-center justify-center text-2xl border-2 border-orange-300">🎲</div>
                    <div>
                      <h4 className="font-black text-orange-900">Emotion Cards Game</h4>
                      <p className="text-xs font-bold text-orange-600/80">Practice facial expressions</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 transition-colors ${mainView === 'cards' ? 'text-orange-700' : 'text-orange-400 group-hover:text-orange-700'}`} />
                </button>
                
                <button 
                  className="w-full group p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 hover:border-blue-500 hover:shadow-pop-sm transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center text-2xl border-2 border-blue-300">🎵</div>
                    <div>
                      <h4 className="font-black text-blue-900">Calming Sounds</h4>
                      <p className="text-xs font-bold text-blue-600/80">Play background sensory audio</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-400 group-hover:text-blue-700 transition-colors" />
                </button>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="flex flex-col h-full animate-fade-up gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-muted-foreground uppercase tracking-wider">Private Notes</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border-2 border-foreground bg-muted">Auto-saving</span>
                </div>
                <textarea 
                  className="flex-1 w-full border-2 border-foreground shadow-pop-sm rounded-xl p-4 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-white text-sm leading-relaxed"
                  placeholder="Type session observations here. These notes are private..."
                  defaultValue="- Rahul responded well to visual schedule today.&#10;- Eye contact improved during the emotion card game.&#10;- Mother noted he had a tough morning transition."
                ></textarea>
                <Button className="w-full h-12 border-2 border-foreground shadow-pop-sm font-black rounded-xl">
                  <Pencil className="w-4 h-4 mr-2" /> Quick Insert AI Summary
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Meet-style Control Bar */}
      <div className="h-20 px-6 flex items-center justify-between bg-card border-t-2 border-foreground shrink-0 z-20">
        
        {/* Left: Session Info / Settings */}
        <div className="flex-1 flex items-center gap-3">
          <span className="font-bold text-sm hidden md:inline-block">10:24 AM | Session In Progress</span>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-2 border-foreground hover:bg-muted transition-colors">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Center: Core Call Controls */}
        <div className="flex-1 flex justify-center items-center gap-3">
          <Button 
            onClick={() => setIsMuted(!isMuted)}
            className={`h-12 w-12 rounded-full border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform ${isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-foreground hover:bg-muted'}`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          
          <Button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`h-12 w-12 rounded-full border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-foreground hover:bg-muted'}`}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>
          
          <div className="w-px h-8 bg-border mx-1"></div>

          <Button 
            onClick={() => setIsHandRaised(!isHandRaised)}
            className={`h-12 w-12 rounded-full border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform ${isHandRaised ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500' : 'bg-white text-foreground hover:bg-muted'}`}
            title="Raise Hand"
          >
            <Hand className="w-5 h-5" />
          </Button>

          <Button className="h-12 w-12 rounded-full bg-white text-foreground border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform hover:bg-muted" title="Reactions">
            <SmilePlus className="w-5 h-5" />
          </Button>

          <Button className="h-12 w-12 rounded-full bg-white text-foreground border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform hover:bg-muted" title="Turn on captions">
            <Type className="w-5 h-5" />
          </Button>

          <Button className="h-12 w-12 rounded-full bg-white text-foreground border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform hover:bg-muted" title="Share Screen">
            <MonitorUp className="w-5 h-5" />
          </Button>
          
          <Button className="h-12 w-12 rounded-full bg-white text-foreground border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform hover:bg-muted" title="More Options">
            <MoreVertical className="w-5 h-5" />
          </Button>

          <Button 
            onClick={handleEndSession}
            className="h-12 px-6 ml-2 bg-red-500 hover:bg-red-600 text-white font-black rounded-full border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all"
          >
            <PhoneOff className="w-5 h-5 mr-2" /> End
          </Button>
        </div>

        {/* Right: Expand/Collapse Sidebar etc. */}
        <div className="flex-1 flex justify-end gap-3">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-2 border-foreground hover:bg-muted transition-colors relative">
            <MessageSquare className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 border-2 border-card rounded-full"></span>
          </Button>
        </div>
      </div>
    </div>
  );
}
