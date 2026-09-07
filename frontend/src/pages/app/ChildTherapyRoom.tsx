import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Sparkles, Star, Target, Palette, Heart, ThumbsUp, PartyPopper, SmilePlus, X, Pencil, Eraser, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChildTherapyRoom() {
  const navigate = useNavigate();
  const [isAdmitted, setIsAdmitted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [canLeave, setCanLeave] = useState(false);
  const [stars, setStars] = useState(0);
  
  const [mainView, setMainView] = useState<"video" | "whiteboard" | "cards">("video");

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

  useEffect(() => {
    if (mainView === "whiteboard" && canvasRef.current) {
      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
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

  // Simulate being admitted after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAdmitted(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate doctor ending the session after 15 seconds
  useEffect(() => {
    if (isAdmitted) {
      const timer = setTimeout(() => {
        setCanLeave(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isAdmitted]);

  // Simulate receiving a star from the doctor every 8 seconds
  useEffect(() => {
    if (isAdmitted) {
      const starTimer = setInterval(() => {
        setStars(s => Math.min(s + 1, 5));
      }, 8000);
      return () => clearInterval(starTimer);
    }
  }, [isAdmitted]);

  const handleLeave = () => {
    if (canLeave) {
      navigate("/app/therapy/summary");
    }
  };

  if (!isAdmitted) {
    return (
      <div className="h-screen w-screen bg-sky-200 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Fun background elements */}
        <div className="absolute top-10 left-10 text-6xl animate-bounce-slow">☁️</div>
        <div className="absolute top-20 right-20 text-6xl animate-bounce-slow" style={{ animationDelay: '1s' }}>☁️</div>
        <div className="absolute bottom-10 left-1/4 text-6xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>🎈</div>

        <div className="calm-card bg-white p-12 text-center animate-fade-up max-w-lg w-full shadow-pop-xl border-4 border-foreground relative z-10 rounded-[3rem]">
          <div className="w-32 h-32 mx-auto bg-yellow-100 rounded-full border-4 border-foreground flex items-center justify-center shadow-pop mb-6">
            <Sparkles className="w-16 h-16 text-yellow-500 animate-pulse" />
          </div>
          
          <h2 className="text-4xl font-black text-foreground mb-4">Almost ready!</h2>
          <p className="text-2xl font-bold text-muted-foreground">Waiting for Dr. Mehta to join the fun...</p>
          
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-4 h-4 bg-primary rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-yellow-50 flex flex-col lg:flex-row font-sans overflow-hidden p-4 sm:p-6 gap-6 relative">
      
      {/* Decorative stars background */}
      <Star className="absolute top-10 left-1/2 w-12 h-12 text-yellow-300 fill-yellow-300 animate-spin-slow opacity-50 z-0" />
      <Star className="absolute bottom-32 right-10 w-16 h-16 text-yellow-300 fill-yellow-300 animate-spin-slow opacity-50 z-0" style={{ animationDirection: 'reverse' }} />

      {/* Side Panel (Goals & Rewards) */}
      <div className="hidden lg:flex w-80 flex-col gap-6 z-10">
        
        {/* Today's Goal Tracker */}
        <div className="calm-card bg-white border-4 border-foreground shadow-pop p-6 flex-1 max-h-[50%]">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-red-500" />
            <h3 className="text-2xl font-black text-red-900">Current Goal</h3>
          </div>
          
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center animate-pulse-soft">
            <span className="text-6xl block mb-4 animate-bounce-slow">😊</span>
            <h4 className="font-black text-xl text-red-900">Emotion Match</h4>
            <p className="font-bold text-red-700 mt-2">Let's match the faces!</p>
          </div>
        </div>

        {/* Live Reward Tracker */}
        <div className="calm-card bg-white border-4 border-foreground shadow-pop p-6 flex-1 max-h-[50%] flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            <h3 className="text-2xl font-black text-yellow-900">My Stars</h3>
          </div>
          <p className="font-bold text-yellow-700 mb-6">Dr. Mehta gives you a star for great work!</p>
          
          <div className="flex-1 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 flex flex-wrap gap-4 items-center justify-center">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
                  i < stars 
                    ? 'bg-yellow-300 border-4 border-foreground shadow-pop scale-110' 
                    : 'bg-yellow-100 border-4 border-transparent opacity-50'
                }`}
              >
                {i < stars ? (
                  <Star className="w-8 h-8 text-foreground fill-foreground animate-wiggle" />
                ) : (
                  <Star className="w-8 h-8 text-yellow-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Video & Controls Area */}
      <div className="flex-1 flex flex-col gap-6 z-10">
        
        {/* Main Workspace Area */}
        <div className="flex-1 rounded-[3rem] border-4 border-foreground shadow-pop-xl overflow-hidden relative bg-blue-100 flex flex-col">
          
          {/* Main Stage: Doctor's Video */}
          {mainView === "video" && (
            <div className="flex-1 relative flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200">
              <div className="text-center animate-fade-up">
                <span className="text-[120px] sm:text-[180px] leading-none block mb-6 animate-wiggle drop-shadow-xl">🦁</span>
                <h1 className="text-3xl sm:text-5xl font-black text-blue-900 bg-white/90 backdrop-blur-sm inline-block px-8 py-4 rounded-full border-4 border-foreground shadow-pop">
                  Can you show me a happy face?
                </h1>
              </div>
              {/* Doctor Label */}
              <div className="absolute top-6 left-6 bg-white border-4 border-foreground shadow-pop px-6 py-2 rounded-full flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-black text-xl">Dr. Mehta</span>
              </div>
            </div>
          )}

          {/* Main Stage: Whiteboard */}
          {mainView === "whiteboard" && (
            <div className="flex-1 relative bg-white flex flex-col">
              <div className="absolute top-4 left-4 bg-white border-4 border-foreground shadow-pop rounded-xl p-2 flex flex-col gap-2 z-10 animate-fade-up">
                <button 
                  onClick={() => setDrawingMode("draw")}
                  className={`p-2 rounded-lg transition-colors ${drawingMode === "draw" ? "bg-primary text-primary-foreground border-2 border-foreground" : "hover:bg-muted"}`}
                  title="Draw"
                >
                  <Pencil className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setDrawingMode("erase")}
                  className={`p-2 rounded-lg transition-colors ${drawingMode === "erase" ? "bg-primary text-primary-foreground border-2 border-foreground" : "hover:bg-muted"}`}
                  title="Eraser"
                >
                  <Eraser className="w-6 h-6" />
                </button>
                <button 
                  onClick={clearCanvas}
                  className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                  title="Clear Canvas"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="w-full h-1 bg-foreground/10 my-1 rounded-full"></div>
                
                <button onClick={() => {setDrawingColor("#000000"); setDrawingMode("draw");}} className={`w-10 h-10 rounded-full bg-black border-2 ${drawingColor === "#000000" && drawingMode === "draw" ? "border-primary ring-4 ring-primary ring-offset-2" : "border-transparent"}`}></button>
                <button onClick={() => {setDrawingColor("#ef4444"); setDrawingMode("draw");}} className={`w-10 h-10 rounded-full bg-red-500 border-2 ${drawingColor === "#ef4444" && drawingMode === "draw" ? "border-primary ring-4 ring-primary ring-offset-2" : "border-transparent"}`}></button>
                <button onClick={() => {setDrawingColor("#3b82f6"); setDrawingMode("draw");}} className={`w-10 h-10 rounded-full bg-blue-500 border-2 ${drawingColor === "#3b82f6" && drawingMode === "draw" ? "border-primary ring-4 ring-primary ring-offset-2" : "border-transparent"}`}></button>
                <button onClick={() => {setDrawingColor("#22c55e"); setDrawingMode("draw");}} className={`w-10 h-10 rounded-full bg-green-500 border-2 ${drawingColor === "#22c55e" && drawingMode === "draw" ? "border-primary ring-4 ring-primary ring-offset-2" : "border-transparent"}`}></button>
                <button onClick={() => {setDrawingColor("#eab308"); setDrawingMode("draw");}} className={`w-10 h-10 rounded-full bg-yellow-500 border-2 ${drawingColor === "#eab308" && drawingMode === "draw" ? "border-primary ring-4 ring-primary ring-offset-2" : "border-transparent"}`}></button>
              </div>
              
              <div className="absolute top-4 right-4 z-10">
                <Button onClick={() => setMainView("video")} className="border-4 border-foreground shadow-pop font-black bg-white text-black hover:bg-red-100 hover:text-red-600 text-lg rounded-xl h-12 px-6">
                  <X className="w-6 h-6 mr-2" /> Close
                </Button>
              </div>
              
              {/* The Drawing Canvas */}
              <div className="w-full h-full flex-1 cursor-crosshair relative">
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

          {/* Main Stage: Emotion Cards */}
          {mainView === "cards" && (
            <div className="flex-1 relative bg-orange-50 flex flex-col items-center justify-center gap-8">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="absolute top-4 right-4 z-10">
                <Button onClick={() => setMainView("video")} className="border-4 border-foreground shadow-pop font-black bg-white text-black hover:bg-red-100 hover:text-red-600 text-lg rounded-xl h-12 px-6">
                  <X className="w-6 h-6 mr-2" /> Close
                </Button>
              </div>
              
              <h2 className="text-4xl font-black text-orange-900 absolute top-8 border-b-4 border-orange-300 pb-2 bg-white/50 px-8 rounded-full">Emotion Game!</h2>
              
              <div className="w-[320px] h-[400px] sm:w-[380px] sm:h-[480px] bg-white rounded-[3rem] border-4 border-foreground shadow-pop-xl flex flex-col items-center justify-center p-8 text-center transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer" onClick={nextCard}>
                <div className="text-9xl mb-8 animate-bounce-slow" key={currentCardIndex}>{emotions[currentCardIndex].emoji}</div>
                <h3 className="text-5xl font-black text-primary tracking-tight">{emotions[currentCardIndex].title}</h3>
                <p className="text-muted-foreground font-bold mt-6 text-xl">{emotions[currentCardIndex].desc}</p>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={prevCard} className="h-16 px-8 border-4 border-foreground shadow-pop font-black text-xl bg-white text-black hover:-translate-y-1 transition-all rounded-[1.5rem]">
                  <ChevronLeft className="w-8 h-8 mr-2" /> Previous
                </Button>
                <Button onClick={nextCard} className="h-16 px-10 border-4 border-foreground shadow-pop font-black text-xl bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-1 transition-all rounded-[1.5rem]">
                  Next <ChevronRight className="w-8 h-8 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Child's Self View */}
          <div className={`absolute bottom-6 right-6 w-40 sm:w-56 lg:w-64 aspect-video bg-white rounded-[2rem] border-4 border-foreground shadow-pop flex flex-col items-center justify-center overflow-hidden transition-all duration-300 z-30 ${mainView !== 'video' ? 'scale-75 origin-bottom-right shadow-pop-sm' : ''}`}>
            {isVideoOff ? (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <span className="text-5xl">🙈</span>
              </div>
            ) : (
              <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-300 relative">
                <span className="text-6xl absolute z-0">👦</span>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-10 mix-blend-overlay"></div>
              </div>
            )}
            {isMuted && (
              <div className="absolute top-3 right-3 bg-red-500 p-2 rounded-full border-2 border-foreground z-20">
                <MicOff className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Giant Controls Area */}
        <div className="h-28 sm:h-32 shrink-0 bg-white rounded-[2.5rem] border-4 border-foreground shadow-pop px-6 flex items-center justify-between overflow-x-auto gap-4">
          
          <div className="flex gap-4 sm:gap-6">
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`h-16 w-16 sm:h-20 sm:w-20 rounded-[1.5rem] border-4 border-foreground shadow-pop hover:-translate-y-2 active:translate-y-1 transition-all flex items-center justify-center ${
                isVideoOff ? 'bg-red-400 text-white' : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-8 h-8 sm:w-10 sm:h-10" /> : <Video className="w-8 h-8 sm:w-10 sm:h-10" />}
            </button>

            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`h-16 w-16 sm:h-20 sm:w-20 rounded-[1.5rem] border-4 border-foreground shadow-pop hover:-translate-y-2 active:translate-y-1 transition-all flex items-center justify-center ${
                isMuted ? 'bg-red-400 text-white' : 'bg-primary text-primary-foreground'
              }`}
            >
              {isMuted ? <MicOff className="w-8 h-8 sm:w-10 sm:h-10" /> : <Mic className="w-8 h-8 sm:w-10 sm:h-10" />}
            </button>
          </div>

          <div className="flex gap-4 sm:gap-6 relative">
            <button 
              onClick={() => setMainView(mainView === "cards" ? "video" : "cards")}
              className={`h-16 w-16 sm:h-20 sm:w-20 rounded-[1.5rem] border-4 border-foreground shadow-pop hover:-translate-y-2 active:translate-y-1 transition-all flex items-center justify-center ${
                mainView === "cards" ? 'bg-orange-400 text-white shadow-pop-sm translate-y-1' : 'bg-white text-orange-500 hover:bg-orange-100'
              }`}
              title="Play Emotion Game"
            >
              <SmilePlus className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>

            <button 
              onClick={() => setMainView(mainView === "whiteboard" ? "video" : "whiteboard")}
              className={`h-16 w-16 sm:h-20 sm:w-20 rounded-[1.5rem] border-4 border-foreground shadow-pop hover:-translate-y-2 active:translate-y-1 transition-all flex items-center justify-center ${
                mainView === "whiteboard" ? 'bg-purple-400 text-white shadow-pop-sm translate-y-1' : 'bg-white text-purple-500 hover:bg-purple-100'
              }`}
              title="Draw Together"
            >
              <Palette className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>
          </div>

          <button 
            onClick={handleLeave}
            disabled={!canLeave}
            className={`h-16 px-6 sm:h-20 sm:px-10 rounded-[1.5rem] border-4 border-foreground font-black text-xl sm:text-2xl flex items-center justify-center transition-all ${
              canLeave 
                ? 'bg-red-500 text-white shadow-pop hover:-translate-y-2 active:translate-y-1 hover:shadow-pop-lg cursor-pointer animate-pulse-soft' 
                : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
            }`}
          >
            <PhoneOff className="w-6 h-6 sm:w-8 sm:h-8 mr-3" /> 
            {canLeave ? "Finish" : "Playing..."}
          </button>

        </div>
      </div>
    </div>
  );
}
