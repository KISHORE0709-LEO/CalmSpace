/**
 * Child — Therapy Room
 * A friendly, simplified version of the meeting room for children.
 * Uses the shared MeetingRoom core but wrapped in a child-friendly shell.
 */
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchStreamToken, TherapySession } from "@/lib/therapyApi";
import CalmMeetProvider from "@/contexts/CalmMeetProvider";
import MeetingRoom from "@/components/MeetingRoom";
import { Loader2, Sparkles } from "lucide-react";

const MOCK_SESSION: TherapySession = {
  id: 1,
  session_uid: "abc-defg-hij",
  title: "Therapy Session",
  session_type: "follow-up",
  status: "live",
  duration_minutes: 45,
  doctor_user_id: 1,
  child_user_id: 2,
  created_at: new Date().toISOString(),
  doctor_name: "Dr. Arya Sharma",
  child_name: "Rahul Kumar",
  participants: [
    { id: 1, user_id: 1, role: "doctor", invite_status: "accepted", user_name: "Dr. Arya Sharma" },
    { id: 2, user_id: 2, role: "child", invite_status: "accepted", user_name: "Rahul Kumar" },
  ],
};

export default function ChildTherapyRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const [streamToken, setStreamToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const session: TherapySession = location.state?.session || MOCK_SESSION;

  useEffect(() => {
    if (!user) return;
    fetchStreamToken(user.uid)
      .then((data) => setStreamToken(data.token))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-sky-100 gap-6">
        <div className="w-32 h-32 bg-white rounded-full border-4 border-foreground shadow-pop flex items-center justify-center">
          <Sparkles className="w-16 h-16 text-yellow-400 animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black mb-2">Almost there!</h2>
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <CalmMeetProvider
      session={session}
      userId={profile ? String(profile.id) : "child_1"}
      userName={profile?.name || "Me"}
      userRole="child"
      userToken={streamToken}
    >
      <MeetingRoom
        session={session}
        role="child"
        onLeave={() => navigate("/app/therapy/summary", { state: { session } })}
      />
    </CalmMeetProvider>
  );
}
