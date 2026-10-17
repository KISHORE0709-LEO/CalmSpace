/**
 * useMitraVoice
 * - ElevenLabs TTS: Mitra speaks her replies aloud
 * - Web Speech API STT: child speaks, tolerant of pauses / slow speech / mistakes
 */
import { useRef, useState, useCallback, useEffect } from "react";

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY ?? "";
const VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID ?? "EXAVITQu4vr4xnSDxMaL";

export type VoiceStatus = "idle" | "listening" | "processing" | "speaking";

interface UseMitraVoiceOptions {
  onTranscript: (text: string) => void;
  enabled: boolean;
}

export function useMitraVoice({ onTranscript, enabled }: UseMitraVoiceOptions) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const listeningRef = useRef(false);

  // ── Use refs so callbacks never have stale closures ───────────────────────
  const enabledRef = useRef(enabled);
  const sttSupportedRef = useRef(false);
  const ttsReadyRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);

  // Pre-load voices so they're ready when needed
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // Check browser support once on mount
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const supported = !!SR;
    const ready = !!ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== "your_elevenlabs_api_key_here";
    setSttSupported(supported);
    setTtsReady(ready);
    sttSupportedRef.current = supported;
    ttsReadyRef.current = ready;
  }, []);

  // ── Browser SpeechSynthesis fallback (always available) ─────────────────
  const speakBrowser = useCallback((text: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel(); // stop anything already speaking

      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.92;   // slightly slower — warm, clear for children
      utter.pitch = 1.1;   // slightly higher — friendly female tone
      utter.volume = 1.0;

      // Pick a female English voice if available
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v =>
        v.lang.startsWith("en") && /female|woman|girl|samantha|karen|victoria|moira|fiona|tessa/i.test(v.name)
      ) || voices.find(v => v.lang.startsWith("en")) || null;
      if (femaleVoice) utter.voice = femaleVoice;

      utter.onend = () => { setIsSpeaking(false); setStatus("idle"); resolve(); };
      utter.onerror = () => { setIsSpeaking(false); setStatus("idle"); resolve(); };

      setStatus("speaking");
      setIsSpeaking(true);
      window.speechSynthesis.speak(utter);
    });
  }, []);

  // ── ElevenLabs TTS (premium) with browser fallback ────────────────────────
  const speak = useCallback(async (text: string): Promise<void> => {
    if (!text.trim()) return;

    // Stop any ongoing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();

    // Try ElevenLabs first if key is available
    if (ttsReadyRef.current) {
      setStatus("speaking");
      setIsSpeaking(true);

      try {
        const res = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
          {
            method: "POST",
            headers: { "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
              text,
              model_id: "eleven_turbo_v2",
              voice_settings: { stability: 0.65, similarity_boost: 0.80, style: 0.35, use_speaker_boost: true },
            }),
          }
        );

        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;

          return new Promise<void>((resolve) => {
            audio.onended = () => { URL.revokeObjectURL(url); audioRef.current = null; setIsSpeaking(false); setStatus("idle"); resolve(); };
            audio.onerror = () => { setIsSpeaking(false); setStatus("idle"); resolve(); };
            audio.play().catch(() => speakBrowser(text).then(resolve));
          });
        }
        // ElevenLabs failed — fall through to browser TTS
        setIsSpeaking(false);
        setStatus("idle");
      } catch {
        setIsSpeaking(false);
        setStatus("idle");
      }
    }

    // Always-available fallback: browser SpeechSynthesis
    return speakBrowser(text);
  }, [speakBrowser]); // stable

  // ── Web Speech API STT ────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!sttSupportedRef.current) return;

    // Stop any existing recognition first
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition: SpeechRecognition = new SR();
    recognition.lang = "en-US";
    recognition.continuous = true;       // keep listening through long pauses
    recognition.interimResults = true;   // show partial results live
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      listeningRef.current = true;
      setStatus("listening");
      setTranscript("");
    };

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(final || interim);
      if (final.trim()) {
        recognition.stop();
        onTranscriptRef.current(final.trim());
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "no-speech" && listeningRef.current) {
        // Very common with autism — child paused. Restart silently.
        try { recognition.stop(); } catch {}
        setTimeout(() => { if (listeningRef.current) startListening(); }, 400);
        return;
      }
      if (e.error === "aborted") return; // we stopped it intentionally
      listeningRef.current = false;
      setStatus("idle");
    };

    recognition.onend = () => {
      if (listeningRef.current) {
        // Auto-restart — handles Chrome's ~60s hard limit
        setTimeout(() => { if (listeningRef.current) startListening(); }, 200);
      } else {
        setStatus("idle");
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      // Already started — ignore
    }
  }, []); // stable — reads refs only

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setStatus("idle");
    setTranscript("");
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setStatus("idle");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      listeningRef.current = false;
      try { recognitionRef.current?.stop(); } catch {}
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
    };
  }, []);

  return {
    speak,
    startListening,
    stopListening,
    stopSpeaking,
    status,
    transcript,
    isSpeaking,
    sttSupported,
    ttsReady,
  };
}
