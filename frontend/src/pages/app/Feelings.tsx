import { useState, useEffect, useRef } from "react";
import { Activity, Wind, Lightbulb, Phone, Shield, Music, Camera, CameraOff, Mic, MicOff, Settings, User, ToggleRight, ToggleLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const heartRateBars = [40, 55, 48, 62, 50, 70, 58, 65, 52, 60, 55, 50, 68, 55, 45, 60];

const Feelings = () => {
  const [musicOn, setMusicOn] = useState(true);
  const [airOn, setAirOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      if (!cameraOn) {
        if (videoRef.current) videoRef.current.srcObject = null;
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraOn]);

  return (
    <AppShell fullWidth>
      {/* 2-Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8 mb-6 h-full items-stretch">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="flex flex-col gap-6">
          
          <div className="grid sm:grid-cols-2 gap-6">
          {/* 1. Biometric Stream */}
          <div className="calm-card relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20 border-2 border-foreground shadow-pop p-4 flex flex-col">
            <div className="absolute -top-8 -left-8 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-sm font-black tracking-widest text-muted-foreground uppercase">Biometric Stream</h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                LIVE
              </div>
            </div>

            {/* Heartbeat visualization */}
            <style>{`
              @keyframes ecg-scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-ecg {
                animation: ecg-scroll 3s linear infinite;
              }
            `}</style>
            <div className="h-28 relative z-10 mb-2 overflow-hidden flex items-center bg-primary/5 rounded-xl border-2 border-primary/20 shadow-inner">
              <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="absolute left-0 h-[85%] w-[200%] stroke-primary fill-transparent stroke-[3px] animate-ecg drop-shadow-sm">
                <path d="M0 50 L10 50 L15 20 L20 80 L25 50 L40 50 L45 10 L55 90 L65 50 L80 50 L85 30 L90 70 L95 50 L110 50 
                         L125 50 L130 20 L135 80 L140 50 L155 50 L160 10 L170 90 L180 50 L195 50 L200 30 L205 70 L210 50 L220 50
                         M220 50 L230 50 L235 20 L240 80 L245 50 L260 50 L265 10 L275 90 L285 50 L300 50 L305 30 L310 70 L315 50 L330 50 
                         L345 50 L350 20 L355 80 L360 50 L375 50 L380 10 L390 90 L400 50 L415 50 L420 30 L425 70 L430 50 L440 50" 
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="absolute right-0 bottom-2 bg-background/95 backdrop-blur-md pl-4 pr-2 py-1 rounded-l-xl border-y-2 border-l-2 border-primary/20 shadow-sm">
                <div className="text-2xl font-black text-primary leading-none">72</div>
                <div className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">BPM</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10 mt-auto pt-2">
              <div className="p-2 rounded-lg bg-accent border-2 border-foreground shadow-pop-sm flex justify-between items-center">
                <div className="text-[10px] font-black uppercase text-muted-foreground">O2 SAT</div>
                <div className="text-base font-black">98%</div>
              </div>
              <div className="p-2 rounded-lg bg-accent border-2 border-foreground shadow-pop-sm flex justify-between items-center">
                <div className="text-[10px] font-black uppercase text-muted-foreground">STRESS</div>
                <div className="text-base font-black text-primary">LOW</div>
              </div>
            </div>
          </div>

          {/* 2. Emotion Map */}
          <div className="calm-card relative overflow-hidden bg-gradient-to-tr from-background to-primary/15 flex flex-col border-2 border-foreground shadow-pop p-4">
            <h3 className="text-sm font-black tracking-widest text-muted-foreground uppercase mb-4 relative z-10">Emotion Map</h3>
            
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col items-center gap-4 relative z-10 mt-2">
              <div className="w-20 h-20 shrink-0 rounded-full bg-accent border-4 border-background shadow-pop flex items-center justify-center">
                <span className="text-4xl animate-bounce-slow">😌</span>
              </div>
              
              <div className="space-y-3 w-full">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Calm</span>
                    <span className="text-primary">88%</span>
                  </div>
                  <div className="h-2 w-full bg-accent rounded-full overflow-hidden border border-foreground/10">
                    <div className="h-full bg-primary w-[88%] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Focus</span>
                    <span className="text-secondary">62%</span>
                  </div>
                  <div className="h-2 w-full bg-accent rounded-full overflow-hidden border border-foreground/10">
                    <div className="h-full bg-secondary w-[62%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          </div>

          {/* 3. Deep Insight */}
          <div className="calm-card relative overflow-hidden bg-gradient-to-tl from-background via-background to-primary/10 flex-1 flex flex-col border-2 border-foreground shadow-pop border-l-8 border-l-primary p-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <Lightbulb className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black tracking-widest text-foreground uppercase">Deep Insight</h3>
            </div>
            
            <p className="text-sm font-medium leading-relaxed mb-4 relative z-10 flex-1">
              Your micro-expressions suggest a transition from neutral to positive. The blue light filtering in the room is successfully reducing ocular strain. We noticed increased focus during the breathing exercise.
            </p>

            <div className="bg-accent p-3 rounded-lg border-2 border-foreground relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">Suggestion</div>
                  <div className="text-xs font-bold">Maintain current lighting levels for 20 mins.</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN (Full Camera) ================= */}
        <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
          
          {/* Neural Feed / Camera */}
          <div className="calm-card relative overflow-hidden bg-gradient-to-bl from-accent/30 to-background p-0 border-2 border-foreground shadow-pop h-full flex flex-col">
            <div className="flex-1 w-full bg-primary/5 relative flex flex-col items-center justify-center p-6 border-b-2 border-foreground overflow-hidden">
              {/* Fake camera UI corners */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-foreground/30 z-20" />
              <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-foreground/30 z-20" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-foreground/30 z-20" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-foreground/30 z-20" />
              
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-widest shadow-pop-sm z-30 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${cameraOn ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                Facial_Mesh_Lock: {cameraOn ? 'True' : 'False'}
              </div>

              {/* Live Video Feed */}
              <div className="absolute inset-0 z-0 bg-background rounded-t-xl overflow-hidden">
                {cameraOn ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CameraOff className="w-16 h-16 text-muted-foreground opacity-50" />
                  </div>
                )}
              </div>

              {cameraOn && (
                <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
                  <User className="w-40 h-40 text-foreground/10" strokeWidth={1} />
                  {/* Tracker dots */}
                  <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary rounded-full animate-ping shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                  <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-primary rounded-full animate-ping shadow-[0_0_10px_rgba(var(--primary),0.8)]" style={{ animationDelay: '0.2s' }} />
                  <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-primary rounded-full animate-ping shadow-[0_0_10px_rgba(var(--primary),0.8)]" style={{ animationDelay: '0.4s' }} />
                  <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-primary rounded-full animate-ping shadow-[0_0_10px_rgba(var(--primary),0.8)]" style={{ animationDelay: '0.6s' }} />
                </div>
              )}
            </div>
            
            <div className="p-4 flex items-center justify-between bg-background shrink-0 z-20 border-t-2 border-foreground">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-black text-primary uppercase tracking-wider hidden sm:block">Expression Check</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCameraOn(!cameraOn)}
                    className={`p-2 rounded-lg border-2 hover:-translate-y-0.5 transition-all shadow-pop-sm ${cameraOn ? 'bg-primary/20 border-primary text-primary' : 'bg-accent border-foreground text-foreground'}`}
                  >
                    {cameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setMicOn(!micOn)}
                    className={`p-2 rounded-lg border-2 hover:-translate-y-0.5 transition-all shadow-pop-sm ${micOn ? 'bg-primary/20 border-primary text-primary' : 'bg-accent border-foreground text-foreground'}`}
                  >
                    {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  <button className="p-2 rounded-lg bg-accent border-2 border-foreground hover:-translate-y-0.5 transition-all shadow-pop-sm text-foreground">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-[10px] font-bold text-muted-foreground text-right">
                <div>FPS: {cameraOn ? '60' : '0'}</div>
                <div>DELAY: {cameraOn ? '2ms' : '--'}</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= BOTTOM ROW ================= */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Soft Music */}
        <button 
          onClick={() => setMusicOn(!musicOn)}
          className={`calm-card flex items-center justify-between p-4 hover:-translate-y-1 hover:shadow-pop transition-all text-left group border-2 ${musicOn ? 'bg-primary/10 border-primary shadow-pop-sm' : 'bg-background border-foreground shadow-pop'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center border-2 border-transparent group-hover:scale-105 transition-transform">
              <Music className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <div className="text-sm font-black">Soft Music</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Weightless Ambient</div>
            </div>
          </div>
          {musicOn ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
        </button>

        {/* Cool Air */}
        <button 
          onClick={() => setAirOn(!airOn)}
          className={`calm-card flex items-center justify-between p-4 hover:-translate-y-1 hover:shadow-pop transition-all text-left group border-2 ${airOn ? 'bg-secondary/20 border-secondary shadow-pop-sm' : 'bg-background border-foreground shadow-pop'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center border-2 border-transparent group-hover:scale-105 transition-transform">
              <Wind className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <div className="text-sm font-black">Cool Air</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">22°C // Purifying</div>
            </div>
          </div>
          {airOn ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
        </button>

        {/* Caregiver */}
        <button className="calm-card bg-background flex items-center justify-between p-4 hover:-translate-y-1 hover:shadow-pop transition-all text-left group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center border-2 border-transparent group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <div className="text-sm font-black">Caregiver</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Contact Available</div>
            </div>
          </div>
          <Phone className="w-5 h-5 text-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Sanctuary Mode */}
        <button className="calm-card bg-primary text-primary-foreground flex items-center p-4 hover:-translate-y-1 hover:shadow-pop transition-all text-left group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-background/20 flex items-center justify-center border-2 border-transparent group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-primary-foreground" fill="currentColor" />
            </div>
            <div>
              <div className="text-sm font-black tracking-wide uppercase">Sanctuary Mode</div>
              <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Active Protection</div>
            </div>
          </div>
        </button>

      </div>
    </AppShell>
  );
};

export default Feelings;
