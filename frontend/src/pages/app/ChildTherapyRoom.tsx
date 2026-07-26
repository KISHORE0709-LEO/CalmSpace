import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Sparkles, Star } from "lucide-react";

export default function ChildTherapyRoom() {
  const navigate = useNavigate();
  const [isAdmitted, setIsAdmitted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [canLeave, setCanLeave] = useState(false);
  
  // Simulate being admitted after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAdmitted(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate doctor ending the session after 15 seconds (for demo purposes, we will enable the leave button)
  useEffect(() => {
    if (isAdmitted) {
      const timer = setTimeout(() => {
        setCanLeave(true);
      }, 10000); // 10 seconds after admission for demo
      return () => clearTimeout(timer);
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
    <div className="h-screen w-screen bg-yellow-50 flex flex-col font-sans overflow-hidden p-4 sm:p-6 gap-6 relative">
      
      {/* Decorative stars */}
      <Star className="absolute top-10 left-10 w-12 h-12 text-yellow-300 fill-yellow-300 animate-spin-slow opacity-50" />
      <Star className="absolute bottom-32 right-10 w-16 h-16 text-yellow-300 fill-yellow-300 animate-spin-slow opacity-50" style={{ animationDirection: 'reverse' }} />

      {/* Main Video Area */}
      <div className="flex-1 rounded-[3rem] border-4 border-foreground shadow-pop-xl overflow-hidden relative bg-blue-100">
        
        {/* Doctor's Video / Activity */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-fade-up">
            <span className="text-[150px] sm:text-[200px] leading-none block mb-4 animate-wiggle">🦁</span>
            <h1 className="text-4xl sm:text-5xl font-black text-blue-900 bg-white/80 backdrop-blur-sm inline-block px-8 py-4 rounded-full border-4 border-foreground shadow-pop">
              Let's match the emotion!
            </h1>
          </div>
        </div>

        {/* Doctor Label */}
        <div className="absolute top-6 left-6 bg-white border-4 border-foreground shadow-pop px-6 py-2 rounded-full flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-black text-xl">Dr. Mehta</span>
        </div>

        {/* Child's Self View */}
        <div className="absolute bottom-6 right-6 w-48 sm:w-64 aspect-video bg-white rounded-[2rem] border-4 border-foreground shadow-pop flex flex-col items-center justify-center overflow-hidden">
          {isVideoOff ? (
            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
              <span className="text-5xl">🙈</span>
            </div>
          ) : (
            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-300">
              <span className="text-6xl">👦</span>
            </div>
          )}
          {isMuted && (
            <div className="absolute top-2 right-2 bg-red-500 p-2 rounded-full border-2 border-foreground">
              <MicOff className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Giant Controls Area */}
      <div className="h-28 sm:h-32 shrink-0 flex items-center justify-center gap-6 sm:gap-10">
        
        <button 
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`h-20 w-20 sm:h-24 sm:w-24 rounded-[2rem] border-4 border-foreground shadow-pop hover:-translate-y-2 active:translate-y-1 transition-all flex items-center justify-center ${
            isVideoOff ? 'bg-red-400 text-white shadow-red-600' : 'bg-secondary text-secondary-foreground'
          }`}
        >
          {isVideoOff ? <VideoOff className="w-10 h-10 sm:w-12 sm:h-12" /> : <Video className="w-10 h-10 sm:w-12 sm:h-12" />}
        </button>

        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`h-20 w-20 sm:h-24 sm:w-24 rounded-[2rem] border-4 border-foreground shadow-pop hover:-translate-y-2 active:translate-y-1 transition-all flex items-center justify-center ${
            isMuted ? 'bg-red-400 text-white shadow-red-600' : 'bg-primary text-primary-foreground'
          }`}
        >
          {isMuted ? <MicOff className="w-10 h-10 sm:w-12 sm:h-12" /> : <Mic className="w-10 h-10 sm:w-12 sm:h-12" />}
        </button>

        <button 
          onClick={handleLeave}
          disabled={!canLeave}
          className={`h-20 px-8 sm:h-24 sm:px-12 rounded-[2rem] border-4 border-foreground font-black text-2xl sm:text-3xl flex items-center justify-center transition-all ${
            canLeave 
              ? 'bg-red-500 text-white shadow-pop hover:-translate-y-2 active:translate-y-1 hover:shadow-pop-lg cursor-pointer animate-pulse-soft' 
              : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
          }`}
        >
          <PhoneOff className="w-8 h-8 sm:w-10 sm:h-10 mr-3" /> 
          {canLeave ? "Finish" : "Playing..."}
        </button>

      </div>
    </div>
  );
}
