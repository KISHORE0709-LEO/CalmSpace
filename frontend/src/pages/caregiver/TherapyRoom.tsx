import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, 
  SmilePlus, Type, Maximize, Loader2, UserCircle2, CheckCircle2, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TherapyRoom() {
  const navigate = useNavigate();
  const [isAdmitted, setIsAdmitted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Simulate being admitted after 3 seconds for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAdmitted(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLeaveSession = () => {
    navigate("/caregiver/therapy/summary");
  };

  if (!isAdmitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="calm-card max-w-md w-full p-10 text-center animate-fade-up space-y-6 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse"></div>
          
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border-2 border-primary shadow-pop-sm">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
          
          <div>
            <h2 className="text-2xl font-black mb-2">Waiting Room</h2>
            <p className="text-muted-foreground font-bold">Please wait, the doctor will let you in soon.</p>
          </div>

          <div className="bg-muted p-4 rounded-xl border-2 border-foreground/10 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <span className="text-sm font-bold text-muted-foreground">Camera and microphone tested</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <span className="text-sm font-bold text-muted-foreground">Connection is stable</span>
            </div>
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-blue-500 shrink-0" />
              <span className="text-sm font-bold text-muted-foreground">End-to-end encrypted session</span>
            </div>
          </div>

          <Button 
            onClick={() => navigate("/caregiver/therapy")}
            variant="outline" 
            className="w-full h-12 font-black border-2 border-foreground shadow-pop-sm mt-4"
          >
            Leave Waiting Room
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen max-h-screen bg-background flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b-2 border-foreground bg-card shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-secondary border-2 border-foreground shadow-pop-sm flex items-center justify-center font-black">
            Dr
          </div>
          <div>
            <h1 className="font-black text-lg leading-tight">Session with Dr. Mehta</h1>
            <p className="text-xs font-bold text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live • Goal: Emotional Regulation
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-red-100 border-2 border-red-500 text-red-600 px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 shadow-pop-sm">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span> REC
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2 bg-muted/30">
        
        {/* Main Stage (Doctor's Shared View or Main Video) */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border-2 border-foreground shadow-pop bg-card flex flex-col">
          
          <div className="flex-1 relative flex items-center justify-center bg-blue-50/50">
            {/* The main focus is the doctor or the shared activity */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
              <UserCircle2 className="w-96 h-96" />
            </div>
            
            <div className="absolute top-6 left-6 bg-background border-2 border-foreground shadow-pop-sm px-4 py-2 rounded-xl flex items-center gap-3 z-10">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="font-black">Dr. Mehta (Host)</span>
            </div>
            
            <div className="z-10 bg-white/80 backdrop-blur p-8 rounded-2xl border-4 border-foreground shadow-pop-lg animate-float-slow text-center max-w-lg">
              <h2 className="text-3xl font-black text-primary tracking-tight mb-4">Doctor is sharing an activity</h2>
              <p className="font-bold text-muted-foreground">The therapist is currently guiding Rahul through the Emotion Cards Game. You can assist Rahul if requested.</p>
            </div>
          </div>

          {/* Picture in Picture (Self) - Always visible */}
          <div className="absolute bottom-6 right-6 w-56 aspect-video bg-card rounded-xl overflow-hidden border-2 border-foreground z-30 shadow-pop hover:scale-105 transition-transform cursor-move">
             <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
               {isVideoOff ? (
                 <div className="w-14 h-14 rounded-full bg-muted border-2 border-foreground flex items-center justify-center font-black text-lg">
                   You
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
               You (Caregiver)
             </div>
          </div>
          
          {/* Picture in Picture (Child) - If they are on a separate device */}
          <div className="absolute bottom-32 right-6 w-40 aspect-video bg-card rounded-xl overflow-hidden border-2 border-foreground z-30 shadow-pop-sm hover:scale-105 transition-transform cursor-move">
             <div className="absolute inset-0 bg-blue-100 flex flex-col items-center justify-center text-blue-800">
               <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-blue-400 flex items-center justify-center font-black text-xs mb-1">
                 R
               </div>
               <span className="text-[10px] font-bold uppercase tracking-wider">Rahul</span>
             </div>
          </div>

        </div>

      </div>

      {/* Meet-style Control Bar */}
      <div className="h-20 px-6 flex items-center justify-between bg-card border-t-2 border-foreground shrink-0 z-20">
        
        {/* Left: Session Info */}
        <div className="flex-1 flex items-center gap-3">
          <span className="font-bold text-sm hidden md:inline-block px-3 py-1.5 bg-muted rounded-lg border-2 border-foreground/10">Assist Mode</span>
        </div>

        {/* Center: Core Call Controls */}
        <div className="flex-1 flex justify-center items-center gap-3">
          <Button 
            onClick={() => setIsMuted(!isMuted)}
            className={`h-12 w-12 rounded-full border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform ${isMuted ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-foreground hover:bg-muted'}`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          
          <Button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`h-12 w-12 rounded-full border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform ${isVideoOff ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-foreground hover:bg-muted'}`}
            title={isVideoOff ? "Turn on camera" : "Turn off camera"}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </Button>
          
          <div className="w-px h-8 bg-border mx-1"></div>

          <Button className="h-12 w-12 rounded-full bg-white text-foreground border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform hover:bg-muted" title="Reactions">
            <SmilePlus className="w-5 h-5" />
          </Button>

          <Button className="h-12 w-12 rounded-full bg-white text-foreground border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform hover:bg-muted" title="Turn on captions">
            <Type className="w-5 h-5" />
          </Button>

          <Button 
            onClick={handleLeaveSession}
            className="h-12 px-6 ml-2 bg-red-500 hover:bg-red-600 text-white font-black rounded-full border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all"
          >
            <PhoneOff className="w-5 h-5 mr-2" /> Leave
          </Button>
        </div>

        {/* Right: Chat etc. */}
        <div className="flex-1 flex justify-end gap-3">
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-2 border-foreground hover:bg-muted transition-colors relative">
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-2 border-foreground hover:bg-muted transition-colors hidden sm:flex">
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
