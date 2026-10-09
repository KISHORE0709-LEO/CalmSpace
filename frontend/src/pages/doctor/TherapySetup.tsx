/**
 * Doctor — Therapy Session Schedule & Management
 * Schedule new sessions, view all sessions, start live sessions.
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorShell } from "@/components/DoctorShell";
import {
  Calendar, Clock, Users, Target, Video, Link as LinkIcon,
  CheckCircle2, Activity, FileText, ClipboardList, Plus,
  Brain, MessageCircle, Heart, PenTool, Wind, Copy, Check,
  AlertCircle, Loader2, X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchSessions, createSession, updateSessionStatus,
  TherapySession
} from "@/lib/therapyApi";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending_acceptance: "bg-amber-100 text-amber-700 border-amber-300",
  accepted: "bg-green-100 text-green-700 border-green-300",
  live: "bg-red-100 text-red-700 border-red-300",
  completed: "bg-blue-100 text-blue-700 border-blue-300",
  declined: "bg-rose-100 text-rose-700 border-rose-300",
  cancelled: "bg-gray-100 text-gray-600 border-gray-300",
  scheduled: "bg-purple-100 text-purple-700 border-purple-300",
};

const STATUS_LABELS: Record<string, string> = {
  pending_acceptance: "Awaiting Acceptance",
  accepted: "Accepted ✓",
  live: "🔴 LIVE",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Cancelled",
  scheduled: "Scheduled",
};

export default function TherapySetup() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<"schedule" | "sessions">("sessions");
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Form state
  const [childUserId, setChildUserId] = useState("2");  // default to first child
  const [sessionType, setSessionType] = useState("follow-up");
  const [duration, setDuration] = useState("45");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [goals, setGoals] = useState("• Emotional Regulation\n• Eye Contact\n• Social Communication");
  const [notes, setNotes] = useState("");
  const [inviteParent, setInviteParent] = useState(true);
  const [inviteCaregiver, setInviteCaregiver] = useState(false);
  const [title, setTitle] = useState("");
  const [createdSession, setCreatedSession] = useState<TherapySession | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchSessions(user.uid)
      .then(setSessions)
      .finally(() => setLoadingSessions(false));
  }, [user]);

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    try {
      let scheduledTimeISO: string | undefined;
      if (scheduledDate) {
        scheduledTimeISO = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      }
      const session = await createSession({
        firebase_uid: user.uid,
        child_user_id: parseInt(childUserId),
        title: title || undefined,
        session_type: sessionType,
        scheduled_time: scheduledTimeISO,
        duration_minutes: parseInt(duration),
        goals,
        notes,
        invite_parent: inviteParent,
        invite_caregiver: inviteCaregiver,
      });
      setCreatedSession(session);
      setSessions((prev) => [session, ...prev]);
      toast.success("Session created! Link generated.");
    } catch (err) {
      toast.error("Failed to create session. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleStartSession = async (session: TherapySession) => {
    if (!user) return;
    try {
      await updateSessionStatus(session.id, user.uid, "live");
      navigate("/doctor/therapy/room", { state: { session } });
    } catch {
      // Navigate anyway — status update is non-critical
      navigate("/doctor/therapy/room", { state: { session } });
    }
  };

  const copyLink = (uid: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/therapy/join/${uid}`);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  return (
    <DoctorShell title="Therapy Sessions" subtitle="Schedule and manage virtual therapy sessions" fullWidth>
      <div className="mt-6 pb-16">

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(["sessions", "schedule"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-black text-sm border-2 transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground border-foreground shadow-pop-sm -translate-y-0.5"
                  : "bg-background border-foreground/30 text-muted-foreground hover:border-foreground/60"
              }`}
            >
              {tab === "sessions" ? (
                <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> My Sessions</span>
              ) : (
                <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Schedule New</span>
              )}
            </button>
          ))}
        </div>

        {/* ── SESSIONS LIST ── */}
        {activeTab === "sessions" && (
          <div className="space-y-4 animate-fade-up">
            {loadingSessions ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="calm-card text-center py-20">
                <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="text-xl font-black text-muted-foreground mb-2">No sessions yet</h3>
                <p className="text-muted-foreground font-bold mb-6">Schedule your first therapy session with a patient.</p>
                <Button onClick={() => setActiveTab("schedule")} className="font-black">
                  <Plus className="w-4 h-4 mr-2" /> Schedule a Session
                </Button>
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="calm-card border-2 border-foreground/10 hover:border-foreground/30 transition-all group">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Status badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-black border self-start ${STATUS_COLORS[session.status] || STATUS_COLORS.scheduled}`}>
                      {STATUS_LABELS[session.status] || session.status}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-lg truncate">{session.title}</h3>
                      <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground font-bold">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-primary" />
                          {session.child_name || `Child #${session.child_user_id}`}
                        </span>
                        {session.scheduled_time && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-primary" />
                            {new Date(session.scheduled_time).toLocaleString([], {
                              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                            })}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-primary" />
                          {session.duration_minutes} min
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Copy link */}
                      <button
                        onClick={() => copyLink(session.session_uid)}
                        className="h-10 px-4 rounded-xl border-2 border-foreground/20 bg-muted hover:bg-accent font-bold text-xs flex items-center gap-2 transition-all"
                        title="Copy meeting link"
                      >
                        {copiedUid === session.session_uid ? (
                          <><Check className="w-3.5 h-3.5 text-green-600" /> Copied</>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /> Copy Link</>
                        )}
                      </button>

                      {/* Start / Enter */}
                      {["accepted", "pending_acceptance", "scheduled"].includes(session.status) && (
                        <Button
                          onClick={() => handleStartSession(session)}
                          className="font-black h-10 rounded-xl"
                        >
                          <Video className="w-4 h-4 mr-2" /> Start Session
                        </Button>
                      )}
                      {session.status === "live" && (
                        <Button
                          onClick={() => navigate("/doctor/therapy/room", { state: { session } })}
                          className="font-black h-10 rounded-xl bg-red-500 hover:bg-red-600"
                        >
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" />
                          Rejoin Live
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Participants chips */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {session.participants.map((p) => (
                      <span key={p.id} className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        p.invite_status === "accepted" ? "bg-green-50 text-green-700 border-green-300" :
                        p.invite_status === "declined" ? "bg-red-50 text-red-600 border-red-300" :
                        "bg-muted text-muted-foreground border-foreground/10"
                      }`}>
                        {p.user_name || p.role} ({p.role}) · {p.invite_status}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── SCHEDULE NEW ── */}
        {activeTab === "schedule" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-up">

            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">

              {/* Patient & Title */}
              <div className="calm-card space-y-5">
                <label className="text-xl font-black flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" /> Session Details
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-muted-foreground">Patient (Child ID)</label>
                    <Input
                      type="number"
                      value={childUserId}
                      onChange={(e) => setChildUserId(e.target.value)}
                      className="border-2 border-foreground/20 font-bold h-12 rounded-xl"
                      placeholder="Child user ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-muted-foreground">Session Title (optional)</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="border-2 border-foreground/20 font-bold h-12 rounded-xl"
                      placeholder="e.g. Follow-up with Rahul"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-muted-foreground flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Session Type
                    </label>
                    <Select value={sessionType} onValueChange={setSessionType}>
                      <SelectTrigger className="border-2 border-foreground/20 font-bold h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initial">Initial Assessment</SelectItem>
                        <SelectItem value="follow-up">Follow-up Therapy</SelectItem>
                        <SelectItem value="speech">Speech Therapy</SelectItem>
                        <SelectItem value="behavioral">Behavioral Therapy</SelectItem>
                        <SelectItem value="social">Social Skills Training</SelectItem>
                        <SelectItem value="parent">Parent Counseling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Duration
                    </label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="border-2 border-foreground/20 font-bold h-12 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Schedule Date/Time */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Schedule Date & Time (leave blank for instant)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="border-2 border-foreground/20 font-bold h-12 rounded-xl"
                    />
                    <Input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="border-2 border-foreground/20 font-bold h-12 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Goals */}
              <div className="calm-card space-y-3 bg-accent/30">
                <label className="text-lg font-black flex items-center gap-3">
                  <Target className="w-5 h-5 text-primary" /> Therapy Goals
                </label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="w-full h-28 border-2 border-foreground/20 rounded-xl p-4 font-bold text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="• Goal 1&#10;• Goal 2"
                />
              </div>

              {/* Notes */}
              <div className="calm-card space-y-3">
                <label className="text-lg font-black flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" /> Pre-session Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-20 border-2 border-foreground/20 rounded-xl p-4 font-bold text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="Any notes for this session…"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 space-y-6">

              {/* Participants */}
              <div className="calm-card space-y-4">
                <label className="text-lg font-black flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" /> Invite Participants
                </label>
                {[
                  { key: "parent", label: "Parent", desc: "Receives invite, can accept/decline and join", state: inviteParent, set: setInviteParent },
                  { key: "caregiver", label: "Caregiver", desc: "Assigned caregiver can join the session", state: inviteCaregiver, set: setInviteCaregiver },
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => p.set(!p.state)}
                    className={`w-full p-4 rounded-xl border-2 font-bold transition-all text-left flex items-start gap-3 ${
                      p.state ? "border-primary bg-primary/10 text-primary" : "border-foreground/10 bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {p.state ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/40 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-black">{p.label}</div>
                      <div className="text-xs mt-0.5 opacity-70">{p.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* CTA */}
              <div className="pt-2">
                {!createdSession ? (
                  <Button
                    onClick={handleCreate}
                    disabled={creating}
                    className="w-full h-16 text-xl font-black rounded-2xl shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all"
                  >
                    {creating ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Creating…</>
                    ) : (
                      <><LinkIcon className="w-6 h-6 mr-3" /> Generate Session Link</>
                    )}
                  </Button>
                ) : (
                  <div className="calm-card bg-primary/10 border-primary border-2 space-y-5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-xl text-primary">Ready to Start!</h3>
                      <span className="bg-background text-foreground px-3 py-1.5 rounded-full text-sm font-bold border-2 border-foreground flex items-center gap-2 shadow-pop-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600" /> Link Ready
                      </span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Meeting ID</label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={createdSession.session_uid}
                          className="flex-1 font-mono text-base font-bold border-2 border-foreground shadow-pop-sm rounded-xl h-12 bg-background"
                        />
                        <Button
                          variant="outline"
                          onClick={() => copyLink(createdSession.session_uid)}
                          className="h-12 px-4 border-2 border-foreground shadow-pop-sm rounded-xl font-black"
                        >
                          {copiedUid === createdSession.session_uid ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleStartSession(createdSession)}
                      className="w-full h-14 text-xl font-black rounded-2xl bg-secondary text-secondary-foreground border-2 border-foreground shadow-pop hover:-translate-y-1 transition-all"
                    >
                      <Video className="w-7 h-7 mr-3" /> Enter Therapy Room
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setCreatedSession(null); setActiveTab("sessions"); }}
                      className="w-full font-black border-2 border-foreground/20"
                    >
                      View All Sessions
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorShell>
  );
}
