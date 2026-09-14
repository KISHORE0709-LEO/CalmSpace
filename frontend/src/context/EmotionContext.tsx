import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";

export type EmotionState = "Calm" | "Mildly_Stressed" | "Anxious" | "Overloaded" | "Unknown";

export interface GracefulDegradationInfo {
  active: boolean;
  reason?: string;
  recommendation?: string;
}

export interface AutismConsiderations {
  isAtypical: boolean;
  entropy: number;
  reviewRecommended: boolean;
  domainShiftNotice?: string;
}

export interface FaceBoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MultiFaceEvent {
  timestamp: number;
  iso_time: string;
  frame_id: number;
  face_count: number;
  bboxes: FaceBoundingBox[];
  description: string;
}

export interface FacialTelemetryPacket {
  timestamp: number;
  frame_id: number;
  face_detected: boolean;
  face_count?: number;
  multiple_faces_detected?: boolean;
  face_bbox: FaceBoundingBox | null;
  all_face_bboxes?: FaceBoundingBox[];
  multiple_faces_events_count?: number;
  quality_score: number;
  quality_diagnostics: Record<string, any>;
  raw_emotion_probabilities: Record<string, number>;
  calmspace_mapped_probabilities: {
    Calm: number;
    Mildly_Stressed: number;
    Anxious: number;
    Overloaded: number;
    [key: string]: number;
  };
  dominant_emotion: string;
  calmspace_state: EmotionState;
  detection_confidence: number;
  graceful_degradation: GracefulDegradationInfo;
  autism_considerations: {
    is_atypical_or_ambiguous: boolean;
    entropy: number;
    review_recommended: boolean;
    domain_shift_notice: string;
  };
  latency_ms: number;
}

export interface EmotionContextType {
  emotion: EmotionState;
  setEmotion: (e: EmotionState) => void;
  calmspaceMappedProbabilities: Record<string, number>;
  rawEmotionProbabilities: Record<string, number>;
  dominantEmotion: string;
  detectionConfidence: number;
  qualityScore: number;
  gracefulDegradation: GracefulDegradationInfo;
  autismConsiderations: AutismConsiderations;
  latencyMs: number;
  faceDetected: boolean;
  faceCount: number;
  multipleFacesDetected: boolean;
  faceBbox: FaceBoundingBox | null;
  allFaceBboxes: FaceBoundingBox[];
  multipleFacesEventsCount: number;
  connectionStatus: "connecting" | "connected" | "disconnected" | "error";
  isLive: boolean;
  lastPacketTime: number | null;
  sendFrame: (base64Data: string) => boolean;
}

const defaultMappedProbabilities = {
  Calm: 0.25,
  Mildly_Stressed: 0.25,
  Anxious: 0.25,
  Overloaded: 0.25,
};

const defaultRawProbabilities = {
  anger: 0.125,
  contempt: 0.125,
  disgust: 0.125,
  fear: 0.125,
  happy: 0.125,
  neutral: 0.125,
  sad: 0.125,
  surprise: 0.125,
};

const EmotionContext = createContext<EmotionContextType | undefined>(undefined);

export const EmotionProvider = ({ children }: { children: ReactNode }) => {
  const [emotion, setEmotion] = useState<EmotionState>("Calm");
  const [calmspaceMappedProbabilities, setCalmspaceMappedProbabilities] = useState<Record<string, number>>(defaultMappedProbabilities);
  const [rawEmotionProbabilities, setRawEmotionProbabilities] = useState<Record<string, number>>(defaultRawProbabilities);
  const [dominantEmotion, setDominantEmotion] = useState<string>("neutral");
  const [detectionConfidence, setDetectionConfidence] = useState<number>(0.0);
  const [qualityScore, setQualityScore] = useState<number>(0.0);
  const [gracefulDegradation, setGracefulDegradation] = useState<GracefulDegradationInfo>({ active: true, reason: "Awaiting video stream." });
  const [autismConsiderations, setAutismConsiderations] = useState<AutismConsiderations>({
    isAtypical: false,
    entropy: 0.0,
    reviewRecommended: false,
  });
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [faceCount, setFaceCount] = useState<number>(0);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState<boolean>(false);
  const [faceBbox, setFaceBbox] = useState<FaceBoundingBox | null>(null);
  const [allFaceBboxes, setAllFaceBboxes] = useState<FaceBoundingBox[]>([]);
  const [multipleFacesEventsCount, setMultipleFacesEventsCount] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("connecting");
  const [lastPacketTime, setLastPacketTime] = useState<number | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const lastPacketTimeRef = useRef<number | null>(null);

  const getWsUrl = () => {
    if (import.meta.env.VITE_WS_URL) {
      return import.meta.env.VITE_WS_URL;
    }
    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (isLocal) {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${window.location.hostname}:8000/ws/facial-sensing`;
    }
    // In production (e.g. Vercel) without VITE_WS_URL, avoid connecting to vercel.app:8000
    return null;
  };

  const connectWebSocket = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const wsUrl = getWsUrl();
    if (!wsUrl) {
      setConnectionStatus("disconnected");
      return;
    }

    setConnectionStatus("connecting");

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const packet: FacialTelemetryPacket = JSON.parse(event.data);

          if (packet.calmspace_state) {
            setEmotion(packet.calmspace_state);
          }
          if (packet.calmspace_mapped_probabilities) {
            setCalmspaceMappedProbabilities(packet.calmspace_mapped_probabilities);
          }
          if (packet.raw_emotion_probabilities) {
            setRawEmotionProbabilities(packet.raw_emotion_probabilities);
          }
          if (packet.dominant_emotion) {
            setDominantEmotion(packet.dominant_emotion);
          }
          if (typeof packet.detection_confidence === "number") {
            setDetectionConfidence(packet.detection_confidence);
          }
          if (typeof packet.quality_score === "number") {
            setQualityScore(packet.quality_score);
          }
          if (packet.graceful_degradation) {
            setGracefulDegradation(packet.graceful_degradation);
          }
          if (packet.autism_considerations) {
            setAutismConsiderations({
              isAtypical: packet.autism_considerations.is_atypical_or_ambiguous,
              entropy: packet.autism_considerations.entropy,
              reviewRecommended: packet.autism_considerations.review_recommended,
              domainShiftNotice: packet.autism_considerations.domain_shift_notice,
            });
          }
          if (typeof packet.face_detected === "boolean") {
            setFaceDetected(packet.face_detected);
          }
          if (typeof packet.face_count === "number") {
            setFaceCount(packet.face_count);
          }
          if (typeof packet.multiple_faces_detected === "boolean") {
            setMultipleFacesDetected(packet.multiple_faces_detected);
          }
          if (packet.face_bbox !== undefined) {
            setFaceBbox(packet.face_bbox);
          }
          if (Array.isArray(packet.all_face_bboxes)) {
            setAllFaceBboxes(packet.all_face_bboxes);
          }
          if (typeof packet.multiple_faces_events_count === "number") {
            setMultipleFacesEventsCount(packet.multiple_faces_events_count);
          }
          if (typeof packet.latency_ms === "number") {
            setLatencyMs(packet.latency_ms);
          }

          const now = Date.now();
          lastPacketTimeRef.current = now;
          setLastPacketTime(now);
          setIsLive(true);
        } catch (err) {
          console.error("[EmotionContext] Failed to parse telemetry packet:", err);
        }
      };

      ws.onerror = () => {
        setConnectionStatus("error");
      };

      ws.onclose = () => {
        setConnectionStatus("disconnected");
        setIsLive(false);
        socketRef.current = null;

        if (!getWsUrl()) {
          return;
        }

        // Exponential backoff reconnect: 2s -> 3s -> 4.5s -> max 10s
        const delay = Math.min(10000, 2000 * Math.pow(1.5, reconnectAttemptsRef.current));
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, delay);
      };
    } catch (e) {
      console.error("[EmotionContext] Failed to initialize WebSocket:", e);
      setConnectionStatus("error");
    }
  }, []);

  useEffect(() => {
    connectWebSocket();

    // Liveness heartbeat monitor
    const heartbeatTimer = setInterval(() => {
      if (lastPacketTimeRef.current && Date.now() - lastPacketTimeRef.current > 4000) {
        setIsLive(false);
      }
    }, 2000);

    return () => {
      clearInterval(heartbeatTimer);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connectWebSocket]);

  const sendFrame = useCallback((base64Data: string): boolean => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        socketRef.current.send(JSON.stringify({ frame: base64Data }));
        return true;
      } catch (err) {
        console.error("[EmotionContext] Error sending frame:", err);
        return false;
      }
    }
    return false;
  }, []);

  return (
    <EmotionContext.Provider
      value={{
        emotion,
        setEmotion,
        calmspaceMappedProbabilities,
        rawEmotionProbabilities,
        dominantEmotion,
        detectionConfidence,
        qualityScore,
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
        lastPacketTime,
        sendFrame,
      }}
    >
      <div
        className={`transition-all duration-700 ease-in-out w-full h-full ${
          emotion === "Overloaded"
            ? "grayscale-[30%] opacity-90 backdrop-blur-[2px]"
            : emotion === "Anxious"
            ? "saturate-50 bg-background/50"
            : ""
        }`}
      >
        {children}
      </div>
    </EmotionContext.Provider>
  );
};

export const useEmotion = () => {
  const context = useContext(EmotionContext);
  if (!context) throw new Error("useEmotion must be used within an EmotionProvider");
  return context;
};
