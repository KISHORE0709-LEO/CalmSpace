/**
 * CalmSpace Meet Provider
 * Wraps Stream Video SDK for real therapy video sessions.
 * - When a valid token is provided (backend online): uses authenticated user
 * - When no token (dev/demo mode): uses Stream guest user (no token needed)
 *   This mirrors how the google-meet-clone works for unauthenticated access.
 */
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  Call,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  User as StreamUser,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { TherapySession } from "@/lib/therapyApi";

// ─── Stream API key from env ─────────────────────────────────────────────────
export const STREAM_API_KEY = (import.meta.env.VITE_STREAM_API_KEY as string) || "";
export const CALL_TYPE = "default";

interface MeetContextType {
  call: Call | null;
  isLoading: boolean;
  error: string | null;
}

const MeetContext = createContext<MeetContextType>({
  call: null,
  isLoading: true,
  error: null,
});

export const useMeet = () => useContext(MeetContext);

interface CalmMeetProviderProps {
  session: TherapySession;
  userId: string;
  userName: string;
  userRole: string;
  userToken?: string | null;
  children: React.ReactNode;
}

/**
 * Build a safe Stream user ID: Stream IDs must match [a-zA-Z0-9@_-]{1,255}
 * and cannot contain spaces or dots.
 */
function toStreamUserId(id: string): string {
  return id.replace(/[^a-zA-Z0-9@_-]/g, "_").slice(0, 100) || "guest_user";
}

const CalmMeetProvider: React.FC<CalmMeetProviderProps> = ({
  session,
  userId,
  userName,
  userToken,
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!STREAM_API_KEY) {
      setError("Stream API key not configured — add VITE_STREAM_API_KEY to frontend/.env");
      setLoading(false);
      return;
    }

    let _client: StreamVideoClient | null = null;
    let _call: Call | null = null;
    let cancelled = false;

    const safeUserId = toStreamUserId(userId);

    const init = async () => {
      try {
        let user: StreamUser;

        if (userToken) {
          // ── Authenticated mode (backend online) ──────────────────────────
          user = {
            id: safeUserId,
            name: userName,
          };
          _client = new StreamVideoClient({
            apiKey: STREAM_API_KEY,
            user,
            token: userToken,
          });
        } else {
          // ── Guest / dev mode (backend offline or no token) ───────────────
          // Use Stream guest user type — no token required.
          // This is exactly how the google-meet-clone works for unauthenticated users.
          user = {
            id: `guest_${safeUserId}`,
            type: "guest",
            name: userName,
          };
          _client = new StreamVideoClient({
            apiKey: STREAM_API_KEY,
            user,
          });
        }

        // Use the session_uid as the Stream room ID.
        // create: true so the first joiner creates the room.
        _call = _client.call(CALL_TYPE, session.session_uid);
        await _call.join({ create: true });

        if (!cancelled) {
          setVideoClient(_client);
          setCall(_call);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : "Failed to connect to meeting";
          console.error("[CalmMeet] Error joining:", msg);
          setError(msg);
          setLoading(false);
        }
      }
    };

    init();

    cleanupRef.current = () => {
      cancelled = true;
      _call?.leave().catch(() => {});
      _client?.disconnectUser().catch(() => {});
    };

    return () => {
      cleanupRef.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.session_uid, userId, userToken]);

  // While loading, still render children wrapped in context (so loading state is accessible)
  if (!videoClient || !call) {
    return (
      <MeetContext.Provider value={{ call: null, isLoading: loading, error }}>
        {children}
      </MeetContext.Provider>
    );
  }

  return (
    <MeetContext.Provider value={{ call, isLoading: false, error: null }}>
      <StreamVideo client={videoClient}>
        <StreamCall call={call}>
          <StreamTheme className="calm-stream-theme">
            {children}
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </MeetContext.Provider>
  );
};

export default CalmMeetProvider;
