import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Sparkles, Star, Target, Palette, Heart, ThumbsUp, PartyPopper, SmilePlus } from "lucide-react";

export default function ChildTherapyRoom() {
  const navigate = useNavigate();
  const [isAdmitted, setIsAdmitted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [canLeave, setCanLeave] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [stars, setStars] = useState(0);
  
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

  // Simulate receiving a star from the doctor every 8 seconds
  useEffect(() => {
    if (isAdmitted) {
      const starTimer = setInterval(() => {
        setStars(s => Math.min(s + 1, 5)); // Cap at 5 stars for now
      }, 8000);
      return () => clearInterval(starTimer);
    }
  }, [isAdmitted]);

  const handleLeave = () => {
    if (canLeave) {
      navigate("/app/therapy/summary");
    }
  };

  const playReaction = () => {
    setShowEmojis(false);
    // In a real app, this would send an event to the backend. 
    // Here we just close the menu.
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
        
        {/* Main Video Area */}
        <div className="flex-1 rounded-[3rem] border-4 border-foreground shadow-pop-xl overflow-hidden relative bg-blue-100 flex flex-col">
          
          {/* Doctor's Video / Activity */}
          <div className="flex-1 relative flex items-center justify-center bg-gradient-to-b from-blue-100 to-blue-200">
            <div className="text-center animate-fade-up">
              <span className="text-[120px] sm:text-[180px] leading-none block mb-6 animate-wiggle drop-shadow-xl">🦁</span>
              <h1 className="text-3xl sm:text-5xl font-black text-blue-900 bg-white/90 backdrop-blur-sm inline-block px-8 py-4 rounded-full border-4 border-foreground shadow-pop">
                Can you show me a happy face?
              </h1>
            </div>
          </div>

          {/* Doctor Label */}
          <div className="absolute top-6 left-6 bg-white border-4 border-foreground shadow-pop px-6 py-2 rounded-full flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-black text-xl">Dr. Mehta</span>
          </div>

          {/* Child's Self View */}
          <div className="absolute bottom-6 right-6 w-40 sm:w-56 lg:w-64 aspect-video bg-white rounded-[2rem] border-4 border-foreground shadow-pop flex flex-col items-center justify-center overflow-hidden">
            {isVideoOff ? (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <span className="text-5xl">🙈</span>
              </div>
            ) : (
              <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-300 relative">
                <span className="text-6xl absolute z-0">👦</span>
                {/* Simulated webcam grain overlay */}
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
            
            {/* Emoji Reactions Popover */}
            {showEmojis && (
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-white border-4 border-foreground shadow-pop-lg rounded-full p-2 flex gap-2 animate-fade-up z-50">
                {[
                  { icon: <Heart className="w-8 h-8 text-red-500 fill-red-500" />, color: 'bg-red-100 hover:bg-red-200' },
                  { icon: <ThumbsUp className="w-8 h-8 text-blue-500 fill-blue-500" />, color: 'bg-blue-100 hover:bg-blue-200' },
                  { icon: <PartyPopper className="w-8 h-8 text-yellow-500" />, color: 'bg-yellow-100 hover:bg-yellow-200' }
                ].map((reaction, i) => (
                  <button 
                    key={i} 
                    onClick={playReaction}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${reaction.color}`}
                  >
                    {reaction.icon}
                  </button>
                ))}
              </div>
            )}

            <button 
              onClick={() => setShowEmojis(!showEmojis)}
              className={`h-16 w-16 sm:h-20 sm:w-20 rounded-[1.5rem] border-4 border-foreground shadow-pop hover:-translate-y-2 active:translate-y-1 transition-all flex items-center justify-center ${
                showEmojis ? 'bg-accent text-accent-foreground shadow-pop-sm translate-y-1' : 'bg-white hover:bg-accent/20'
              }`}
            >
              <SmilePlus className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>

            <button 
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-[1.5rem] border-4 border-foreground shadow-pop hover:-translate-y-2 active:translate-y-1 transition-all flex items-center justify-center bg-white hover:bg-orange-100 text-orange-500"
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
