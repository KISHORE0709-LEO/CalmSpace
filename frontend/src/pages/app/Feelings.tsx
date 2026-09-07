import { useState, useEffect, useRef } from "react";
import { 
  Wind, 
  Lightbulb, 
  Phone, 
  Shield, 
  Music, 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Settings, 
  User, 
  ToggleRight, 
  ToggleLeft,
  AlertTriangle,
  AlertCircle,
  Activity,
  Users,
  History,
  Clock,
  X,
  Eye
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useEmotion } from "@/context/EmotionContext";

const emotionEmojis: Record<string, string> = {
  Calm: "😌",
  Mildly_Stressed: "😐",
  Anxious: "😰",
  Overloaded: "🤯",
  Unknown: "🌫️",
};

const getDynamicInsightText = (
  state: string,
  isDegraded: boolean,
  confidence: number,
  autism: { isAtypical: boolean; entropy: number }
) => {
  if (isDegraded) {
    return "Facial signal is currently degraded or face is out of frame. CalmSpace has gracefully suspended facial regulation triggers and is awaiting a stable facial lock.";
  }
  if (autism?.isAtypical) {
    return `Model detected high affective entropy (${autism.entropy.toFixed(2)}). Expression patterns indicate atypical or blended affective presentation, triggering conservative multi-class confidence calibration.`;
  }
  switch (state) {
    case "Calm":
      return `Facial affect analysis shows balanced neuromuscular tension (${(confidence * 100).toFixed(0)}% confidence). Ocular and zygomatic features align with emotional equilibrium and low sensory distress.`;
    case "Mildly_Stressed":
      return `Subtle brow furrowing and micro-expressive tension detected. Early affective elevation observed; proactive sensory adjustments can prevent transition to anxiety.`;
    case "Anxious":
      return `Elevated autonomic facial tension and sustained affective strain detected. Emotional arousal is elevated above baseline regulation threshold.`;
    case "Overloaded":
      return `Acute sensory overload patterns detected across facial landmark analysis. Immediate stimulus dampening and calming protocols recommended.`;
    default:
      return "Analyzing live facial expression stream. Awaiting model convergence.";
  }
};

const getDynamicSuggestion = (state: string, isDegraded: boolean) => {
  if (isDegraded) {
    return "Ensure face is centered in camera view with adequate ambient lighting.";
  }
  switch (state) {
    case "Calm":
      return "Maintain current environmental lighting and auditory settings.";
    case "Mildly_Stressed":
      return "Consider soft background music or dimming bright screen contrasts.";
    case "Anxious":
      return "Engage guided 4-7-8 breathing or activate cool air purifying.";
    case "Overloaded":
      return "Sanctuary Mode recommended: reduce sensory stimuli and rest.";
    default:
      return "Monitoring active expression stream.";
  }
};

const Feelings = () => {
  const [musicOn, setMusicOn] = useState(true);
  const [airOn, setAirOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const [showMultiFaceModal, setShowMultiFaceModal] = useState(false);
  const [multiFaceHistory, setMultiFaceHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    emotion,
    calmspaceMappedProbabilities,
    detectionConfidence,
    gracefulDegradation,
    autismConsiderations,
    latencyMs,
    faceDetected,
    faceCount,
    multipleFacesDetected,
    faceBbox,
    allFaceBboxes,
    multipleFacesEventsCount,
    connectionStatus,
    isLive,
    sendFrame,
  } = useEmotion();

  const fetchMultiFaceHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("http://localhost:8000/api/sensing/multiple-faces-history");
      if (res.ok) {
        const data = await res.json();
        setMultiFaceHistory(data.events || []);
      }
    } catch (err) {
      console.warn("Could not fetch multi-face history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // 1. Initialize and control webcam stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      if (!cameraOn) {
        if (videoRef.current) videoRef.current.srcObject = null;
        setCameraError(null);
        return;
      }
      try {
        setCameraError(null);
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 }, 
            facingMode: "user" 
          } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(err => console.warn("Video play exception:", err));
          };
          videoRef.current.play().catch(() => {});
        }
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setCameraError("Camera permission denied. Please allow camera access in browser.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setCameraError("No camera found on this device.");
        } else {
          setCameraError("Unable to access camera: " + (err.message || "Unknown error"));
        }
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraOn]);

  // 2. Continuous frame capture loop (every 250ms ~ 4 FPS for real-time responsiveness)
  useEffect(() => {
    if (!cameraOn || cameraError) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      canvasRef.current.width = 320;
      canvasRef.current.height = 240;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const intervalId = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;

      // Ensure video is playing and has non-zero frame dimensions
      if (video.videoWidth === 0 || video.paused) {
        if (video.srcObject && video.paused) {
          video.play().catch(() => {});
        }
        return;
      }

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // JPEG compression 0.6 produces lightweight ~15KB frames
        const base64Data = canvas.toDataURL("image/jpeg", 0.6);
        sendFrame(base64Data);
      }
    }, 250);

    return () => clearInterval(intervalId);
  }, [cameraOn, cameraError, sendFrame]);

  const isDegraded = !isLive || !faceDetected || gracefulDegradation.active || emotion === "Unknown";

  return (
    <AppShell fullWidth>
      {/* 2-Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8 mb-6 h-full items-stretch">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="flex flex-col gap-6">
          
          <div className="grid sm:grid-cols-2 gap-6">
          {/* 1. Biometric Stream (Untouched - Out of scope) */}
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

          {/* 2. Emotion Map (Live facial sensing) */}
          <div className="calm-card relative overflow-hidden bg-gradient-to-tr from-background to-primary/15 flex flex-col border-2 border-foreground shadow-pop p-4">
            <div className="flex items-center justify-between mb-3 relative z-10">
              <h3 className="text-sm font-black tracking-widest text-muted-foreground uppercase">Emotion Map</h3>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase">
                {isLive ? (
                  <span className="flex items-center gap-1 text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Live Facial AI
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    {connectionStatus === "connecting" ? "Connecting..." : "Offline"}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

            {/* If degraded or face not detected, display honest degraded state */}
            {isDegraded ? (
              <div className="flex flex-col items-center justify-center flex-1 py-4 gap-3 relative z-10">
                <div className="flex items-center justify-center shrink-0">
                  <span className="text-[54px] leading-none opacity-50 grayscale">
                    {!isLive ? "📡" : "🌫️"}
                  </span>
                </div>
                <div className="w-full bg-accent/90 border-2 border-foreground/20 rounded-xl p-3 text-center">
                  <div className="text-xs font-black uppercase text-amber-500 flex items-center justify-center gap-1.5 mb-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Facial Signal Unavailable
                  </div>
                  <p className="text-[11px] text-muted-foreground font-semibold">
                    {!cameraOn
                      ? "Camera is turned off."
                      : cameraError
                      ? cameraError
                      : !isLive
                      ? "Awaiting connection to sensing server..."
                      : !faceDetected
                      ? "No face detected in camera view."
                      : gracefulDegradation.reason || "Signal quality degraded / occluded."}
                  </p>
                </div>
              </div>
            ) : (
              /* When live and face detected, show real operational probabilities */
              <div className="flex flex-col items-center gap-3 relative z-10 mt-1">
                <div className="flex items-center justify-center shrink-0">
                  <span className="text-[72px] leading-none animate-bounce-slow drop-shadow-xl" style={{ filter: 'drop-shadow(0px 10px 8px rgba(0,0,0,0.2))' }}>
                    {emotionEmojis[emotion] || "😌"}
                  </span>
                </div>
                <div className="text-center -mt-2 mb-1">
                  <span className="text-xs font-black uppercase tracking-wider text-foreground">
                    {emotion.replace("_", " ")}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground ml-1.5">
                    ({Math.round(detectionConfidence * 100)}% conf)
                  </span>
                </div>

                <div className="space-y-2.5 w-full">
                  {/* Calm */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Calm</span>
                      <span className="text-primary">{Math.round((calmspaceMappedProbabilities.Calm || 0) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-accent rounded-full overflow-hidden border border-foreground/10">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300" 
                        style={{ width: `${Math.round((calmspaceMappedProbabilities.Calm || 0) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Mildly Stressed */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Mild Stress</span>
                      <span className="text-amber-500">{Math.round((calmspaceMappedProbabilities.Mildly_Stressed || 0) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-accent rounded-full overflow-hidden border border-foreground/10">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.round((calmspaceMappedProbabilities.Mildly_Stressed || 0) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Anxious */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Anxious</span>
                      <span className="text-orange-500">{Math.round((calmspaceMappedProbabilities.Anxious || 0) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-accent rounded-full overflow-hidden border border-foreground/10">
                      <div 
                        className="h-full bg-orange-500 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.round((calmspaceMappedProbabilities.Anxious || 0) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Overloaded */}
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span>Overloaded</span>
                      <span className="text-destructive">{Math.round((calmspaceMappedProbabilities.Overloaded || 0) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-accent rounded-full overflow-hidden border border-foreground/10">
                      <div 
                        className="h-full bg-destructive rounded-full transition-all duration-300" 
                        style={{ width: `${Math.round((calmspaceMappedProbabilities.Overloaded || 0) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          </div>

          {/* 3. Deep Insight (Live State Adaptive) */}
          <div className="calm-card relative overflow-hidden bg-gradient-to-tl from-background via-background to-primary/10 flex-1 flex flex-col border-2 border-foreground shadow-pop border-l-8 border-l-primary p-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-black tracking-widest text-foreground uppercase">Deep Insight</h3>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Live State Adaptive
              </span>
            </div>
            
            <p className="text-sm font-medium leading-relaxed mb-4 relative z-10 flex-1">
              {getDynamicInsightText(emotion, isDegraded, detectionConfidence, autismConsiderations)}
            </p>

            <div className="bg-accent p-3 rounded-lg border-2 border-foreground relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">Adaptive Suggestion</div>
                  <div className="text-xs font-bold">
                    {getDynamicSuggestion(emotion, isDegraded)}
                  </div>
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
              {/* Camera UI corners */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-foreground/30 z-20" />
              <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-foreground/30 z-20" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-foreground/30 z-20" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-foreground/30 z-20" />
              
              {/* Mesh Lock and Multi-Face Detection Badge */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
                <div className="bg-foreground text-background text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-widest shadow-pop-sm flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    !cameraOn ? 'bg-muted-foreground' : faceDetected && isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'
                  }`} />
                  Facial_Mesh_Lock: {!cameraOn ? 'OFF' : faceDetected && isLive ? (faceCount > 1 ? `LOCKED (${faceCount} FACES)` : 'LOCKED') : 'SEARCHING'}
                </div>

                {/* Multiple Faces Detected Alert Badge */}
                {faceCount > 1 && isLive && (
                  <div className="bg-purple-600 text-white text-[10px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-pop-sm flex items-center gap-1.5 animate-bounce-slow">
                    <Users className="w-3 h-3" />
                    <span>Multiple Faces In View ({faceCount})</span>
                  </div>
                )}
              </div>

              {/* Camera Permission / Device Error Banner */}
              {cameraError && (
                <div className="absolute inset-0 z-30 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-destructive mb-3" />
                  <div className="text-base font-black text-foreground mb-1">Camera Access Blocked</div>
                  <p className="text-xs text-muted-foreground max-w-xs mb-4">{cameraError}</p>
                  <button 
                    onClick={() => { setCameraOn(false); setTimeout(() => setCameraOn(true), 250); }}
                    className="px-4 py-2 bg-primary text-primary-foreground font-black text-xs uppercase rounded-lg border-2 border-foreground shadow-pop-sm hover:-translate-y-0.5 transition-all"
                  >
                    Retry Camera
                  </button>
                </div>
              )}

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

              {/* Dynamic Tracking Overlay (scans faces dynamically, handles multiple faces) */}
              {cameraOn && !cameraError && (
                <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
                  {faceDetected && isLive ? (
                    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                      {/* 1. Primary Face Scan Lock (User) */}
                      <div className="w-56 h-64 border-2 border-emerald-400/90 rounded-2xl relative shadow-[0_0_25px_rgba(52,211,153,0.35)] animate-pulse-soft flex flex-col justify-between p-3 pointer-events-none">
                        <div className="flex justify-between items-start">
                          <span className="bg-emerald-400 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                            {faceCount > 1 ? "PRIMARY USER" : "FACE DETECTED"}
                          </span>
                          <span className="bg-background/90 text-primary border border-primary/40 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">
                            {Math.round(detectionConfidence * 100)}% CONF
                          </span>
                        </div>

                        {/* Scanning crosshairs */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-16 h-16 border border-emerald-400/30 rounded-full" />
                          <div className="absolute w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                          <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                          <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }} />
                        </div>

                        {/* Real-time Dynamic Emotion Banner directly on the primary scanning frame */}
                        <div className="bg-foreground text-background text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider flex items-center justify-between shadow-pop-sm z-20">
                          <span className="flex items-center gap-1.5">
                            <span className="text-base leading-none">{emotionEmojis[emotion] || "😌"}</span>
                            <span>{emotion.replace("_", " ")}</span>
                          </span>
                          <span className="text-[10px] text-primary font-bold">
                            {Math.round((calmspaceMappedProbabilities[emotion] || 0) * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* 2. Secondary Face Companion Box when multiple faces are detected */}
                      {faceCount > 1 && (
                        <div className="absolute right-8 top-16 w-36 h-44 border-2 border-purple-400/90 bg-purple-950/20 backdrop-blur-[1px] rounded-xl relative shadow-[0_0_20px_rgba(192,132,252,0.4)] animate-pulse flex flex-col justify-between p-2 pointer-events-none">
                          <div className="flex items-center justify-between">
                            <span className="bg-purple-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                              <Users className="w-2.5 h-2.5" />
                              COMPANION
                            </span>
                            <span className="text-[9px] font-bold text-purple-200">
                              FACE #2
                            </span>
                          </div>
                          <div className="text-center py-2">
                            <div className="text-[10px] font-black text-purple-200 uppercase tracking-wider bg-black/60 px-1 py-0.5 rounded">
                              Caregiver / Peer
                            </div>
                          </div>
                          <div className="text-[8px] font-bold text-purple-300 text-center uppercase tracking-tight">
                            Logged in History
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Dynamic Scanning state awaiting face lock */
                    <div className="flex flex-col items-center justify-center relative">
                      <div className="w-52 h-60 border-2 border-dashed border-amber-400/40 rounded-2xl flex flex-col items-center justify-center relative bg-accent/10">
                        <User className="w-28 h-28 text-foreground/20" strokeWidth={1} />
                        <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest mt-2 px-2.5 py-0.5 bg-amber-400/15 rounded border border-amber-400/30 animate-pulse">
                          Scanning for Face...
                        </span>
                      </div>
                    </div>
                  )}
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
                  <button 
                    onClick={() => {
                      fetchMultiFaceHistory();
                      setShowMultiFaceModal(true);
                    }}
                    title="View Multi-Face Detection History"
                    className="p-2 rounded-lg bg-accent border-2 border-foreground hover:-translate-y-0.5 transition-all shadow-pop-sm text-foreground flex items-center gap-1.5"
                  >
                    <History className="w-4 h-4 text-purple-500" />
                    {multipleFacesEventsCount > 0 && (
                      <span className="bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                        {multipleFacesEventsCount}
                      </span>
                    )}
                  </button>
                  <button className="p-2 rounded-lg bg-accent border-2 border-foreground hover:-translate-y-0.5 transition-all shadow-pop-sm text-foreground">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-[10px] font-bold text-muted-foreground text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
                  <span>CADENCE: {cameraOn && isLive ? '4.0 FPS' : '0 FPS'}</span>
                </div>
                <div>DELAY: {cameraOn && isLive && latencyMs ? `${latencyMs}ms` : cameraOn && isLive ? '<100ms' : '--'}</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================= MULTI-FACE DETECTION HISTORY MODAL ================= */}
      {showMultiFaceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border-4 border-foreground shadow-pop rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b-2 border-foreground bg-accent flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-500 text-white rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground uppercase tracking-wider">Multi-Face Event History</h3>
                  <p className="text-[11px] font-bold text-muted-foreground">Stored records of multiple individuals detected in camera view</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMultiFaceModal(false)}
                className="p-1 rounded-lg hover:bg-background border border-foreground/20 text-foreground transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-2">
                <span>Total Multi-Face Events: {multiFaceHistory.length}</span>
                <button 
                  onClick={fetchMultiFaceHistory} 
                  className="text-primary hover:underline text-[11px] font-black uppercase"
                >
                  Refresh Log
                </button>
              </div>

              {loadingHistory ? (
                <div className="py-12 text-center text-sm font-bold text-muted-foreground">
                  Loading multi-face event records...
                </div>
              ) : multiFaceHistory.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                  <Users className="w-10 h-10 text-muted-foreground/40" />
                  <div className="text-sm font-black text-foreground">No Multi-Face Events Yet</div>
                  <p className="text-xs text-muted-foreground max-w-xs">
                    When multiple people (e.g. user and companion/caregiver) are in front of the camera, CalmSpace automatically timestamps and logs each occurrence here.
                  </p>
                </div>
              ) : (
                multiFaceHistory.slice().reverse().map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-3 bg-accent/40 border-2 border-foreground rounded-xl shadow-pop-sm flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {item.face_count} Faces Detected
                      </span>
                      <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        {item.iso_time ? new Date(item.iso_time).toLocaleTimeString() : new Date(item.timestamp * 1000).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-foreground">
                      {item.description}
                    </p>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      Frame #{item.frame_id} • BBoxes: {item.bboxes?.map((b: any, bi: number) => `Face ${bi + 1} (${b.w}x${b.h})`).join(", ")}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t-2 border-foreground bg-accent/50 flex justify-end">
              <button 
                onClick={() => setShowMultiFaceModal(false)}
                className="px-4 py-1.5 bg-foreground text-background font-black text-xs uppercase rounded-lg border-2 border-foreground shadow-pop-sm hover:-translate-y-0.5 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
