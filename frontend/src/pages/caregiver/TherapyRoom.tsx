/**
 * Caregiver — Therapy Room
 * Joins the virtual therapy session as a support caregiver.
 */
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchStreamToken, TherapySession } from "@/lib/therapyApi";
import CalmMeetProvider from "@/contexts/CalmMeetProvider";
import MeetingRoom from "@/components/MeetingRoom";
import { Loader2 } from "lucide-react";

const MOCK_SESSION: TherapySession = {
  id: 1,
  session_uid: "abc-defg-hij",
  title: "Follow-up Therapy Session",
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
    { id: 4, user_id: 4, role: "caregiver", invite_status: "accepted", user_name: "Caregiver" },
  ],
};

export default function CaregiverTherapyRoom() {
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
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-bold">Joining session…</p>
        </div>
      </div>
    );
  }

  return (
    <CalmMeetProvider
      session={session}
      userId={profile ? String(profile.id) : "caregiver_1"}
      userName={profile?.name || "Caregiver"}
      userRole="caregiver"
      userToken={streamToken}
    >
      <MeetingRoom
        session={session}
        role="caregiver"
        onLeave={() => navigate("/caregiver/therapy/summary", { state: { session } })}
      />
    </CalmMeetProvider>
  );
}
