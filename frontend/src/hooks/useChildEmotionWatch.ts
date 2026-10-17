import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface LiveEmotionPacket {
  type: "live" | "latest";
  child_id: number;
  state: string;
  dominant_emotion: string;
  confidence: number;
  probs: { Calm: number; Happy: number; Distressed: number; Overwhelmed: number };
  is_crisis: boolean;
  logged_at: string;
}

export type WatchStatus = "connecting" | "connected" | "disconnected" | "error";

export function useChildEmotionWatch(childId: number | null) {
  const { user } = useAuth();
  const [packet, setPacket] = useState<LiveEmotionPacket | null>(null);
  const [status, setStatus] = useState<WatchStatus>("disconnected");
  const [reconnectTick, setReconnectTick] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const getWsUrl = useCallback(() => {
    if (!childId || !user) return null;
    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (!isLocal) return null;
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${window.location.hostname}:8000/ws/emotion-watch/${childId}?firebase_uid=${encodeURIComponent(user.uid)}`;
  }, [childId, user]);

  useEffect(() => {
    if (!childId || !user) return;
    const url = getWsUrl();
    if (!url) return;

    setStatus("connecting");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    let pingInterval: ReturnType<typeof setInterval> | null = null;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setStatus("connected");
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send("ping");
      }, 20000);
    };

    ws.onmessage = (e) => {
      if (e.data === "pong") return;
      try {
        const data: LiveEmotionPacket = JSON.parse(e.data);
        if (data.state && mountedRef.current) setPacket(data);
      } catch {}
    };

    ws.onerror = () => {
      if (mountedRef.current) setStatus("error");
    };

    ws.onclose = () => {
      if (pingInterval) clearInterval(pingInterval);
      if (!mountedRef.current) return;
      setStatus("disconnected");
      setTimeout(() => {
        if (mountedRef.current) setReconnectTick(t => t + 1);
      }, 3000);
    };

    return () => {
      if (pingInterval) clearInterval(pingInterval);
      ws.close();
      wsRef.current = null;
    };
  }, [childId, user, getWsUrl, reconnectTick]);

  return { packet, status };
}
