/**
 * Doctor — Therapy Room
 * Joins the virtual session as the host/doctor.
 */
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchStreamToken, updateSessionStatus, TherapySession } from "@/lib/therapyApi";
import CalmMeetProvider from "@/contexts/CalmMeetProvider";
import MeetingRoom from "@/components/MeetingRoom";
import { Loader2 } from "lucide-react";

// Fallback mock session when navigated without state
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

export default function DoctorTherapyRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const [streamToken, setStreamToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);

  const session: TherapySession = location.state?.session || MOCK_SESSION;

  useEffect(() => {
    if (!user) {
      // No Firebase user — proceed in guest/dev mode (no token)
      setTokenLoading(false);
      return;
    }
    fetchStreamToken(user.uid)
      .then((data) => setStreamToken(data.token))
      .catch(() => {}) // silent — will join as guest
      .finally(() => setTokenLoading(false));
  }, [user]);

  const handleEndSession = async () => {
    if (user) {
      await updateSessionStatus(session.id, user.uid, "completed").catch(console.error);
    }
    navigate("/doctor/therapy/report", { state: { session } });
  };

  if (tokenLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-bold">Preparing your session…</p>
        </div>
      </div>
    );
  }

  const userId = profile ? String(profile.id) : (user?.uid || "doctor_demo");
  const userName = profile?.name || user?.displayName || "Doctor";

  return (
    <CalmMeetProvider
      session={session}
      userId={userId}
      userName={userName}
      userRole="doctor"
      userToken={streamToken}
    >
      <MeetingRoom
        session={session}
        role="doctor"
        onLeave={() => navigate("/doctor/therapy/setup")}
        onEndSession={handleEndSession}
      />
    </CalmMeetProvider>
  );
}
