import { useNavigate } from "react-router-dom";
import { Star, Trophy, Home, Gamepad2, Sparkles } from "lucide-react";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";

export default function ChildTherapySummary() {
  const navigate = useNavigate();
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  const detectSize = () => {
    setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
  }

  useEffect(() => {
    window.addEventListener('resize', detectSize);
    return () => {
      window.removeEventListener('resize', detectSize);
    }
  }, []);

  return (
    <div className="min-h-screen bg-sky-200 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <Confetti
        width={windowDimension.width}
        height={windowDimension.height}
        recycle={false}
        numberOfPieces={300}
        gravity={0.15}
      />
      
      {/* Decorative background elements */}
      <div className="absolute top-10 right-20 text-6xl animate-bounce-slow">🎈</div>
      <div className="absolute bottom-20 left-10 text-6xl animate-bounce-slow" style={{ animationDelay: "0.5s" }}>🎉</div>
      <div className="absolute top-1/4 left-20 text-6xl animate-bounce-slow" style={{ animationDelay: "1s" }}>🚀</div>

      <div className="calm-card bg-white p-8 sm:p-12 text-center animate-fade-up max-w-2xl w-full shadow-pop-xl border-4 border-foreground relative z-10 rounded-[3rem]">
        
        <div className="w-32 h-32 mx-auto bg-yellow-300 rounded-full border-4 border-foreground flex items-center justify-center shadow-pop mb-8 relative">
          <span className="text-6xl animate-wiggle absolute z-10">🥳</span>
          <Sparkles className="w-40 h-40 absolute text-yellow-500 animate-spin-slow opacity-50 pointer-events-none" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4">Great Job Today!</h1>
        <p className="text-2xl font-bold text-muted-foreground mb-10">You finished your session and did amazing!</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-yellow-50 border-4 border-yellow-400 p-6 rounded-3xl shadow-pop transform hover:scale-105 transition-transform cursor-default">
            <Star className="w-16 h-16 text-yellow-500 fill-yellow-500 mx-auto mb-3 animate-pulse-soft" />
            <h3 className="text-3xl font-black text-yellow-600">+50 Stars</h3>
            <p className="font-bold text-yellow-700">Earned today!</p>
          </div>
          
          <div className="bg-blue-50 border-4 border-blue-400 p-6 rounded-3xl shadow-pop transform hover:scale-105 transition-transform cursor-default">
            <Trophy className="w-16 h-16 text-blue-500 fill-blue-500 mx-auto mb-3 animate-wiggle" />
            <h3 className="text-2xl font-black text-blue-600">Great Listener</h3>
            <p className="font-bold text-blue-700">New Badge Unlocked!</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate("/app/feelings")}
            className="h-20 px-8 rounded-3xl bg-primary text-primary-foreground font-black text-2xl border-4 border-foreground shadow-pop hover:-translate-y-2 active:translate-y-1 hover:shadow-pop-lg transition-all flex items-center justify-center flex-1"
          >
            <Gamepad2 className="w-8 h-8 mr-3" /> Play Next
          </button>
          
          <button 
            onClick={() => navigate("/app/therapy")}
            className="h-20 px-8 rounded-3xl bg-secondary text-secondary-foreground font-black text-2xl border-4 border-foreground shadow-pop hover:-translate-y-2 active:translate-y-1 hover:shadow-pop-lg transition-all flex items-center justify-center flex-1"
          >
            <Home className="w-8 h-8 mr-3" /> Home
          </button>
        </div>

      </div>
    </div>
  );
}
