/**
 * MeetingRoom — Full Google Meet-like Therapy Room
 * Uses real @stream-io/video-react-sdk components for live video/audio/screen-share/recording.
 * Styled with CalmSpace autism-friendly theme (soft blues, warm yellows, high contrast, gentle animations).
 * Adapted from google-meet-clone and blended into CalmSpace.
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  CallingState,
  hasScreenShare,
  isPinned,
  ParticipantView,
  RecordCallButton,
  StreamTheme,
  StreamVideoParticipant,
  useCall,
  useCallStateHooks,
  useConnectedUser,
  combineComparators,
  pinned,
  screenSharing,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare,
  MonitorUp, Users, Maximize, Minimize, Settings,
  MoreVertical, X, ChevronRight, Loader2, Wifi, WifiOff
} from "lucide-react";
import { TherapySession } from "@/lib/therapyApi";
import { useMeet } from "@/contexts/CalmMeetProvider";

// ─── Types ───────────────────────────────────────────────────────────────────
interface MeetingRoomProps {
  session: TherapySession;
  role: "doctor" | "parent" | "caregiver" | "child";
  onLeave: () => void;
  onEndSession?: () => void;
}

// ─── Participant Video Tile ───────────────────────────────────────────────────
const ParticipantTile = ({ participant }: { participant: StreamVideoParticipant }) => {
  const dominantColor = "#64b5f6";
  const initials = (participant.name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <ParticipantView
      participant={participant}
      ParticipantViewUI={() => (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            {participant.isSpeaking && (
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            )}
            <span className="text-white text-xs font-bold drop-shadow bg-black/50 px-2 py-0.5 rounded-full">
              {participant.name || "Participant"}
              {participant.isLocalParticipant && " (You)"}
            </span>
          </div>
          {participant.audioStream == null && (
            <div className="bg-red-500/80 rounded-full p-1">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      )}
      VideoPlaceholder={() => (
        <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-4"
              style={{ background: `${dominantColor}22`, borderColor: dominantColor, color: dominantColor }}
            >
              {initials}
            </div>
            <span className="text-white/60 text-sm font-semibold">
              {participant.name || "Participant"}
            </span>
          </div>
        </div>
      )}
    />
  );
};

// ─── Grid Layout ─────────────────────────────────────────────────────────────
const CalmGrid = () => {
  const call = useCall();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  useEffect(() => {
    if (!call) return;
    call.setSortParticipantsBy(combineComparators(screenSharing, pinned));
  }, [call]);

  const cols = participants.length <= 1 ? 1 : participants.length <= 4 ? 2 : 3;

  return (
    <div
      className="w-full h-full p-2"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "8px",
      }}
    >
      {participants.map((p) => (
        <div
          key={p.sessionId}
          className="relative rounded-2xl overflow-hidden border-2 border-white/10"
          style={{ minHeight: "120px" }}
        >
          <ParticipantTile participant={p} />
        </div>
      ))}
      {participants.length === 0 && (
        <div className="col-span-3 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-3" />
            <p className="text-white/50 font-semibold">Waiting for participants to join…</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Chat Panel ───────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
}

const ChatPanel = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "1", sender: "System", text: "Welcome to the therapy session. This chat is private and secure.", time: "Now" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "You", text: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setInput("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#0f1923] border-l border-white/10 flex flex-col z-40 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#141e2b]">
        <h3 className="font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span>In-call messages</span>
        </h3>
        <button onClick={onClose} className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.sender === "You" ? "items-end" : "items-start"}`}>
            <span className="text-[10px] text-white/40 mb-1 px-1">{m.sender} · {m.time}</span>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.sender === "You"
                  ? "bg-blue-500 text-white"
                  : m.sender === "System"
                  ? "bg-yellow-500/20 text-yellow-200 border border-yellow-500/30"
                  : "bg-[#1e2d3d] text-white/90 border border-white/5"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-white/10 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Send a message…"
          className="flex-1 bg-[#1e2d3d] text-white placeholder-white/30 rounded-xl px-3 py-2 text-sm border border-white/10 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <button
          onClick={send}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-3 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ─── Participants Panel ───────────────────────────────────────────────────────
const ParticipantsPanel = ({ session, onClose }: { session: TherapySession; onClose: () => void }) => {
  const { useParticipants } = useCallStateHooks();
  const liveParticipants = useParticipants();

  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#0f1923] border-l border-white/10 flex flex-col z-40 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#141e2b]">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <span>People ({liveParticipants.length})</span>
        </h3>
        <button onClick={onClose} className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Live participants from Stream */}
        {liveParticipants.map((p) => (
          <div key={p.sessionId} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1e2d3d] border border-white/5">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center text-blue-300 text-xs font-black">
              {(p.name || "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {p.name || "Participant"}
                {p.isLocalParticipant && " (You)"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-green-400/80 text-[10px]">Connected</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {p.isMuted && <MicOff className="w-3.5 h-3.5 text-red-400" />}
              {!p.isMuted && <Mic className="w-3.5 h-3.5 text-green-400" />}
            </div>
          </div>
        ))}
        {/* Invited but not yet joined */}
        {session.participants
          .filter((sp) => !liveParticipants.some((lp) => lp.userId === String(sp.user_id)))
          .map((sp) => (
            <div key={sp.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#1a2433] border border-white/5 opacity-60">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs font-black">
                {(sp.user_name || sp.role).charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-white/60 text-sm font-semibold">{sp.user_name || "Participant"}</p>
                <p className="text-white/30 text-[10px] capitalize">Invited · {sp.invite_status}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

// ─── Control Button ───────────────────────────────────────────────────────────
const CtrlBtn = ({
  onClick, isOff = false, danger = false, children, title,
}: {
  onClick?: () => void; isOff?: boolean; danger?: boolean; children: React.ReactNode; title?: string;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`h-12 w-12 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 ${
      danger
        ? "bg-red-600 hover:bg-red-700 text-white"
        : isOff
        ? "bg-[#3c4043] hover:bg-[#4a4d51] text-white"
        : "bg-[#3c4043] hover:bg-[#4a4d51] text-white"
    }`}
  >
    {children}
  </button>
);

// ─── Audio + Video Toggle using real Stream SDK hooks ─────────────────────────
const AudioToggle = () => {
  const { useMicrophoneState } = useCallStateHooks();
  const { microphone, optimisticIsMute, hasBrowserPermission } = useMicrophoneState();

  return (
    <CtrlBtn
      onClick={() => microphone.toggle().catch(console.error)}
      isOff={optimisticIsMute}
      title={optimisticIsMute ? "Unmute microphone" : "Mute microphone"}
    >
      {!hasBrowserPermission ? (
        <WifiOff className="w-5 h-5 text-yellow-400" />
      ) : optimisticIsMute ? (
        <MicOff className="w-5 h-5 text-red-400" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </CtrlBtn>
  );
};

const VideoToggle = () => {
  const { useCameraState } = useCallStateHooks();
  const { camera, optimisticIsMute, hasBrowserPermission } = useCameraState();

  return (
    <CtrlBtn
      onClick={() => camera.toggle().catch(console.error)}
      isOff={optimisticIsMute}
      title={optimisticIsMute ? "Turn on camera" : "Turn off camera"}
    >
      {!hasBrowserPermission ? (
        <WifiOff className="w-5 h-5 text-yellow-400" />
      ) : optimisticIsMute ? (
        <VideoOff className="w-5 h-5 text-red-400" />
      ) : (
        <Video className="w-5 h-5" />
      )}
    </CtrlBtn>
  );
};

const ScreenShareToggle = () => {
  const { useScreenShareState } = useCallStateHooks();
  const { screenShare, status } = useScreenShareState();
  const isSharing = status === "enabled";

  return (
    <CtrlBtn
      onClick={() => screenShare.toggle().catch(console.error)}
      title={isSharing ? "Stop sharing" : "Present now"}
    >
      <MonitorUp className={`w-5 h-5 ${isSharing ? "text-blue-400" : ""}`} />
    </CtrlBtn>
  );
};

// ─── Inner Room (inside StreamCall context) ───────────────────────────────────
const InnerRoom = ({
  session, role, onLeave, onEndSession
}: MeetingRoomProps) => {
  const call = useCall();
  const user = useConnectedUser();
  const { useCallCallingState, useParticipants, useScreenShareState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();
  const { screenShare } = useScreenShareState();

  const [sidePanel, setSidePanel] = useState<"chat" | "participants" | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDoctor = role === "doctor";
  const isCreator = call?.state.createdBy?.id === user?.id;

  // Detect speaker / grid layout
  const firstParticipant = participants[0];
  const isSpeakerLayout =
    firstParticipant &&
    (hasScreenShare(firstParticipant) || isPinned(firstParticipant));

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const toggleFullscreen = useCallback(() => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen((f) => !f);
  }, [isFullscreen]);

  const handleLeave = async () => {
    await call?.leave();
    onLeave();
  };

  const handleEnd = async () => {
    if (isCreator) await call?.endCall();
    onEndSession ? onEndSession() : onLeave();
  };

  if (callingState === CallingState.UNKNOWN || callingState === CallingState.IDLE) {
    return (
      <div className="h-screen w-screen bg-[#0a0f14] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-semibold">Connecting to session…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen w-screen bg-[#0a0f14] overflow-hidden relative select-none"
      style={{ fontFamily: "'Inter', 'Google Sans', sans-serif" }}
    >
      {/* ── Top Bar ── */}
      <div className="absolute top-0 left-0 right-0 h-14 flex items-center justify-between px-4 z-30 bg-gradient-to-b from-black/80 to-transparent">
        {/* Left: time + meeting ID */}
        <div className="flex items-center gap-3 text-white">
          <span className="font-semibold text-sm">
            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          <span className="text-white/30">|</span>
          <span className="text-white/60 text-sm font-medium hidden sm:block truncate max-w-[180px]">
            {session.title}
          </span>
        </div>

        {/* Right: connection badge + fullscreen */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 px-2.5 py-1 rounded-full">
            <Wifi className="w-3 h-3 text-green-400" />
            <span className="text-green-400 text-xs font-semibold">Live</span>
          </div>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white/70 text-xs font-semibold">{fmt(elapsed)}</span>
          </div>
          <span className="text-white/40 text-xs px-2 py-1 rounded-full bg-white/5 capitalize">
            {role}
          </span>
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-white/60" />
            ) : (
              <Maximize className="w-4 h-4 text-white/60" />
            )}
          </button>
        </div>
      </div>

      {/* ── Video Area ── */}
      <div
        className={`flex-1 pt-14 pb-[72px] transition-all duration-300 ${
          sidePanel ? "mr-72 sm:mr-80" : ""
        }`}
      >
        <CalmGrid />
      </div>

      {/* ── Side Panels ── */}
      {sidePanel === "chat" && <ChatPanel onClose={() => setSidePanel(null)} />}
      {sidePanel === "participants" && (
        <ParticipantsPanel session={session} onClose={() => setSidePanel(null)} />
      )}

      {/* ── Bottom Control Bar ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[72px] bg-[#0f1923] border-t border-white/5 flex items-center px-4 z-30">
        {/* Left: room code */}
        <div className="hidden sm:flex flex-col gap-0.5 flex-1">
          <span className="text-white/30 text-[10px] font-medium">Room</span>
          <span className="text-white/60 text-xs font-mono font-semibold">{session.session_uid}</span>
        </div>

        {/* Center: main controls */}
        <div className="flex items-center gap-2 sm:gap-3 mx-auto">
          <AudioToggle />
          <VideoToggle />
          <ScreenShareToggle />

          {/* Record — uses Stream's built-in RecordCallButton */}
          <div className="flex items-center">
            <RecordCallButton />
          </div>

          {/* Leave / End */}
          {isDoctor ? (
            <button
              onClick={handleEnd}
              className="h-12 px-5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <PhoneOff className="w-4 h-4" />
              End call
            </button>
          ) : (
            <button
              onClick={handleLeave}
              className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title="Leave call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Right: panels */}
        <div className="hidden sm:flex items-center gap-1 flex-1 justify-end">
          <button
            onClick={() => setSidePanel((p) => (p === "participants" ? null : "participants"))}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              sidePanel === "participants" ? "bg-blue-500/30 text-blue-400" : "text-white/60 hover:bg-white/10"
            }`}
            title="People"
          >
            <Users className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSidePanel((p) => (p === "chat" ? null : "chat"))}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              sidePanel === "chat" ? "bg-blue-500/30 text-blue-400" : "text-white/60 hover:bg-white/10"
            }`}
            title="Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:bg-white/10 transition-colors"
            title="More options"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Export — handles loading/error states before rendering InnerRoom ────
const MeetingRoom: React.FC<MeetingRoomProps> = (props) => {
  const { call, isLoading, error } = useMeet();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#0a0f14] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
          <p className="text-white/60 font-semibold">Joining therapy room…</p>
          <p className="text-white/30 text-sm">Connecting to {props.session.session_uid}</p>
        </div>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="h-screen w-screen bg-[#0a0f14] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-auto px-6">
          <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-400 flex items-center justify-center mx-auto">
            <WifiOff className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-white font-bold text-lg">Unable to join session</h2>
          <p className="text-white/50 text-sm">{error || "Could not connect to the meeting room."}</p>
          <button
            onClick={props.onLeave}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // Real Stream call is ready — render the full meeting UI
  return <InnerRoom {...props} />;
};

export default MeetingRoom;
