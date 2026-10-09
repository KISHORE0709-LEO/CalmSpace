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
  session_uid: "calm-therapy-demo",
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
    { id: 3, user_id: 3, role: "parent", invite_status: "accepted", user_name: "Parent User" },
    { id: 4, user_id: 4, role: "caregiver", invite_status: "accepted", user_name: "Caregiver" },
  ],
};

export default function ChildTherapyRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const [streamToken, setStreamToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  const session: TherapySession = location.state?.session || MOCK_SESSION;

  useEffect(() => {
    if (!user) {
      setTokenLoading(false);
      return;
    }
    fetchStreamToken(user.uid)
      .then((data) => setStreamToken(data.token))
      .catch(() => {})
      .finally(() => setTokenLoading(false));
  }, [user]);

  if (tokenLoading) {
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

  const userId = profile ? String(profile.id) : (user?.uid || "child_demo");
  const userName = profile?.name || user?.displayName || "Me";

  return (
    <CalmMeetProvider
      session={session}
      userId={userId}
      userName={userName}
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
