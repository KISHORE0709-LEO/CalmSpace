import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { Smile, Stethoscope, Heart, HandHeart, ArrowRight, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Role = "child" | "doctor" | "parent" | "caregiver" | null;

const ROLE_REDIRECT: Record<string, string> = {
  child: "/app/feelings",
  parent: "/parent/live-emotion",
  caregiver: "/caregiver/live-emotion",
  doctor: "/doctor/patients",
};

const floatingEmojis = [
  { emoji: "🌈", top: "8%",  left: "4%",  anim: "animate-float" },
  { emoji: "🪁", top: "12%", left: "45%", anim: "animate-float-delay" },
  { emoji: "🌸", top: "15%", left: "85%", anim: "animate-float-slow" },
  { emoji: "🦋", top: "10%", left: "65%", anim: "animate-bounce-slow" },
  { emoji: "✨", top: "25%", left: "15%", anim: "animate-float" },
  { emoji: "🧸", top: "30%", left: "90%", anim: "animate-bounce-slow" },
  { emoji: "🌻", top: "35%", left: "35%", anim: "animate-float-delay" },
  { emoji: "⭐", top: "40%", left: "75%", anim: "animate-float" },
  { emoji: "🕊️", top: "50%", left: "10%", anim: "animate-float-slow" },
  { emoji: "🎨", top: "55%", left: "55%", anim: "animate-bounce-slow" },
  { emoji: "🦋", top: "60%", left: "88%", anim: "animate-float-delay" },
  { emoji: "🍀", top: "65%", left: "25%", anim: "animate-float" },
  { emoji: "🌼", top: "75%", left: "70%", anim: "animate-bounce-slow" },
  { emoji: "🌙", top: "85%", left: "15%", anim: "animate-float-slow" },
  { emoji: "🫧", top: "88%", left: "45%", anim: "animate-float-delay" },
  { emoji: "🎈", top: "90%", left: "85%", anim: "animate-float" },
  { emoji: "🧩", top: "5%",  left: "20%", anim: "animate-float-delay" },
  { emoji: "🪴", top: "18%", left: "25%", anim: "animate-float" },
  { emoji: "🌼", top: "22%", left: "70%", anim: "animate-float-slow" },
  { emoji: "🍄", top: "28%", left: "50%", anim: "animate-bounce-slow" },
  { emoji: "🪴", top: "45%", left: "5%",  anim: "animate-float-delay" },
  { emoji: "✨", top: "48%", left: "95%", anim: "animate-float" },
  { emoji: "🌻", top: "65%", left: "60%", anim: "animate-float-slow" },
  { emoji: "🌸", top: "70%", left: "40%", anim: "animate-bounce-slow" },
  { emoji: "🌈", top: "82%", left: "30%", anim: "animate-float" },
  { emoji: "🧸", top: "95%", left: "10%", anim: "animate-float-delay" },
  { emoji: "🍀", top: "92%", left: "60%", anim: "animate-float-slow" },
  { emoji: "🕊️", top: "78%", left: "92%", anim: "animate-bounce-slow" },
];

const roles = [
  { id: "child",    title: "I am a Child",       icon: Smile,       color: "bg-primary text-primary-foreground",   description: "Play, learn, and explore your feelings!" },
  { id: "parent",   title: "Parent",              icon: Heart,       color: "bg-secondary text-secondary-foreground", description: "Monitor progress and provide support." },
  { id: "caregiver",title: "Caregiver",           icon: HandHeart,   color: "bg-secondary text-secondary-foreground", description: "Assist with daily care and monitoring." },
  { id: "doctor",   title: "Doctor / Therapist",  icon: Stethoscope, color: "bg-accent text-accent-foreground",     description: "Manage patients and track development." },
];

// ─── helper: register user in backend then return profile ────────────────────
async function registerInBackend(payload: {
  firebase_uid: string; name: string; email: string;
  role: string; child_email?: string | null; age?: number | null;
}) {
  if (!API_BASE_URL) throw new Error("Backend URL not configured.");
  const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Signup failed" }));
    throw new Error(err.detail || "Signup failed");
  }
  return res.json();
}

// ─── helper: fetch existing profile ─────────────────────────────────────────
async function fetchProfile(firebase_uid: string) {
  if (!API_BASE_URL) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/me?firebase_uid=${firebase_uid}`);
    if (res.ok) return res.json();
    return null;
  } catch {
    return null;
  }
}

// ─── helper: check if email is taken and what role ───────────────────────────
async function checkEmailRole(email: string): Promise<{ exists: boolean; role: string | null }> {
  if (!API_BASE_URL) return { exists: false, role: null };
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/check-email?email=${encodeURIComponent(email)}`);
    if (res.ok) return res.json();
    return { exists: false, role: null };
  } catch {
    return { exists: false, role: null };
  }
}

// ────────────────────────────────────────────────────────────────────────────
const Auth = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [childEmail, setChildEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Google new-user onboarding state
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleRole, setGoogleRole] = useState<Role>(null);
  const [googleChildEmail, setGoogleChildEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  // If already logged in with a profile, redirect immediately
  useEffect(() => {
    if (!loading && user && profile) {
      navigate(ROLE_REDIRECT[profile.role] || "/");
    }
  }, [user, profile, loading]);

  // ── EMAIL SIGN UP ──────────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setSubmitting(true);
    try {
      // Pre-check: email-role uniqueness
      if (selectedRole !== "child") {
        const emailCheck = await checkEmailRole(email.trim().toLowerCase());
        if (emailCheck.exists && emailCheck.role === "child") {
          throw new Error("This email is registered as a child account and cannot be used for another role.");
        }
        if (emailCheck.exists) {
          throw new Error(`This email is already registered as '${emailCheck.role}'. Please log in instead.`);
        }
      }

      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      const needsChildEmail = selectedRole === "parent";
      if (needsChildEmail && !childEmail.trim()) {
        throw new Error("Please enter your child's CalmSpace email address.");
      }

      await registerInBackend({
        firebase_uid: cred.user.uid,
        name,
        email,
        role: selectedRole,
        child_email: (selectedRole === "parent" || selectedRole === "caregiver") && childEmail.trim()
          ? childEmail.trim()
          : null,
      });

      toast.success("Account created! Welcome to CalmSpace 🌿");
      navigate(ROLE_REDIRECT[selectedRole]);
    } catch (err: any) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        toast.error("Cannot reach the server. Make sure the backend is running on port 8000.");
      } else if (err.code === "auth/weak-password") {
        toast.error("Password must be at least 6 characters.");
      } else if (err.code === "auth/email-already-in-use") {
        toast.error("An account with this email already exists. Please log in instead.");
      } else {
        toast.error(err.message || "Sign up failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── EMAIL LOGIN ────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setSubmitting(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // Fetch real role from DB — don't trust the role card clicked
      const p = await fetchProfile(cred.user.uid);
      if (!p) throw new Error("Account not found in CalmSpace. Please sign up first.");

      if (p.role !== selectedRole) {
        toast.info(`You are registered as '${p.role}' — redirecting to your dashboard.`);
      } else {
        toast.success(`Welcome back, ${p.name}! 👋`);
      }
      navigate(ROLE_REDIRECT[p.role] || "/");
    } catch (err: any) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        toast.error("Wrong email or password.");
      } else if (err instanceof TypeError && err.message === "Failed to fetch") {
        toast.error("Cannot reach the server. Make sure the backend is running on port 8000.");
      } else {
        toast.error(err.message || "Login failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── FORGOT PASSWORD ────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!email.trim()) { toast.error("Enter your email first."); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    }
  };

  // ── GOOGLE SIGN IN ─────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    if (!selectedRole) return;
    setSubmitting(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, googleProvider);
      const gUser = result.user;

      // Check if already registered in our backend
      let existing = null;
      try {
        existing = await fetchProfile(gUser.uid);
      } catch {
        // backend unreachable — will surface below
      }

      if (existing) {
        if (existing.role !== selectedRole) {
          toast.info(`You're registered as '${existing.role}'. Redirecting to your dashboard.`);
        } else {
          toast.success(`Welcome back, ${existing.name}! 👋`);
        }
        navigate(ROLE_REDIRECT[existing.role] || "/");
        return;
      }

      // Check if the Google email is already used for a different role
      const emailCheck = await checkEmailRole(gUser.email || "");
      if (emailCheck.exists && emailCheck.role === "child" && selectedRole !== "child") {
        toast.error("This Google account email is already a child account. Use a different Google account.");
        await auth.signOut();
        return;
      }
      if (emailCheck.exists && emailCheck.role !== null && emailCheck.role !== selectedRole) {
        toast.error(`This email is already registered as '${emailCheck.role}'. Log in with that role.`);
        await auth.signOut();
        return;
      }

      // For child: auto-register immediately
      if (selectedRole === "child") {
        await registerInBackend({
          firebase_uid: gUser.uid,
          name: gUser.displayName || gUser.email?.split("@")[0] || "Child",
          email: gUser.email || "",
          role: "child",
        });
        toast.success("Welcome to CalmSpace! 🌿 Your account is ready.");
        navigate(ROLE_REDIRECT["child"]);
        return;
      }

      // For parent / caregiver / doctor: show onboarding to collect child email etc.
      setGoogleUser(gUser);
      setGoogleRole(selectedRole);
      setGoogleName(gUser.displayName || "");
      setGoogleChildEmail("");
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") {
        // Dismissed — no-op
      } else if (err.code === "auth/popup-blocked") {
        toast.error("Popup was blocked. Allow popups for this site and try again.");
      } else if (err instanceof TypeError && err.message === "Failed to fetch") {
        toast.error("Cannot reach the server. Make sure the backend is running on port 8000.");
        await auth.signOut().catch(() => {});
      } else {
        toast.error(err.message || "Google sign-in failed");
        await auth.signOut().catch(() => {});
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── GOOGLE NEW USER COMPLETE REGISTRATION ──────────────────────────────────
  const handleGoogleComplete = async () => {
    if (!googleUser || !googleRole) return;
    if (googleRole === "parent" && !googleChildEmail.trim()) {
      toast.error("Please enter your child's CalmSpace email.");
      return;
    }
    setGoogleSubmitting(true);
    try {
      await registerInBackend({
        firebase_uid: googleUser.uid,
        name: googleName || googleUser.displayName || "User",
        email: googleUser.email,
        role: googleRole,
        child_email: (googleRole === "parent" || googleRole === "caregiver") && googleChildEmail.trim()
          ? googleChildEmail.trim()
          : null,
      });
      toast.success("Account created! Welcome to CalmSpace 🌿");
      navigate(ROLE_REDIRECT[googleRole]);
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  // ── GOOGLE NEW USER ONBOARDING SCREEN ─────────────────────────────────────
  if (googleUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="calm-card p-10 max-w-md w-full border-4 border-foreground shadow-pop animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/20 border-4 border-foreground shadow-pop-sm flex items-center justify-center text-3xl mx-auto mb-4">
              {googleUser.photoURL
                ? <img src={googleUser.photoURL} className="w-full h-full rounded-full object-cover" alt="avatar" />
                : "👤"}
            </div>
            <h2 className="text-2xl font-black">Almost there!</h2>
            <p className="text-muted-foreground font-bold mt-1">Complete your CalmSpace profile</p>
            <p className="text-sm text-muted-foreground mt-1">Signed in as <span className="font-bold text-foreground">{googleUser.email}</span></p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-black">Your Name</label>
              <Input value={googleName} onChange={e => setGoogleName(e.target.value)}
                placeholder="Full name" className="h-12 border-2 border-foreground rounded-xl font-bold" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {roles.filter(r => r.id !== "child").map(r => (
                  <button key={r.id} onClick={() => setGoogleRole(r.id as Role)}
                    className={`py-3 px-4 rounded-xl border-4 font-black text-sm transition-all ${googleRole === r.id ? "bg-primary text-primary-foreground border-foreground shadow-pop-sm" : "bg-background border-foreground/30 hover:border-foreground"}`}>
                    {r.title}
                  </button>
                ))}
              </div>
            </div>

            {googleRole === "parent" && (
              <div className="space-y-2">
                <label className="text-sm font-black">Child's CalmSpace Email <span className="text-destructive">*</span></label>
                <Input value={googleChildEmail} onChange={e => setGoogleChildEmail(e.target.value)}
                  placeholder="child@example.com" type="email"
                  className="h-12 border-2 border-foreground rounded-xl font-bold" />
                <p className="text-xs text-muted-foreground">The child must already have a CalmSpace account.</p>
              </div>
            )}

            {googleRole === "caregiver" && (
              <div className="space-y-2">
                <label className="text-sm font-black">Child's CalmSpace Email <span className="text-muted-foreground text-xs">(optional)</span></label>
                <Input value={googleChildEmail} onChange={e => setGoogleChildEmail(e.target.value)}
                  placeholder="child@example.com (skip if invited by parent)" type="email"
                  className="h-12 border-2 border-foreground rounded-xl font-bold" />
              </div>
            )}

            {googleRole === "doctor" && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm font-bold text-blue-800">
                  🩺 Families are linked to you when a parent invites you from their Manage Care Team page.
                </p>
              </div>
            )}

            <Button onClick={handleGoogleComplete} disabled={googleSubmitting || !googleRole || !googleName.trim()}
              className="w-full h-12 font-black border-2 border-foreground shadow-pop hover:-translate-y-1 transition-all rounded-xl mt-2">
              {googleSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration →"}
            </Button>

            <button onClick={() => { setGoogleUser(null); auth.signOut(); }}
              className="w-full text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN AUTH SCREEN ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pt-36 pb-16 relative overflow-hidden">
      <PublicNav />

      {floatingEmojis.map((b, i) => (
        <span key={i} className={`fixed select-none pointer-events-none text-4xl ${b.anim} opacity-20 z-0`}
          style={{ top: b.top, left: b.left }}>{b.emoji}</span>
      ))}

      <div className="py-12 md:py-16 flex flex-col items-center justify-center animate-fade-up relative z-10">
        <div className="max-w-[1600px] w-full px-6 text-center space-y-16">

          {!selectedRole ? (
            <>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black text-foreground">
                  Welcome to <span className="text-primary">Calm</span>Space
                </h1>
                <p className="text-xl text-muted-foreground font-medium">
                  Who is joining us today? Choose your role to begin.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10 pt-6">
                {roles.map((role, index) => {
                  const Icon = role.icon;
                  return (
                    <button key={role.id} onClick={() => setSelectedRole(role.id as Role)}
                      className={`calm-card flex flex-col items-center text-center p-10 min-h-[340px] justify-center transition-all hover:-translate-y-2 group animate-fade-up-delay-${index + 1}`}>
                      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-8 border-2 border-foreground shadow-pop-sm group-hover:scale-110 transition-transform ${role.color}`}>
                        <Icon size={48} />
                      </div>
                      <h3 className="text-3xl font-black mb-4">{role.title}</h3>
                      <p className="text-muted-foreground font-medium text-lg leading-relaxed">{role.description}</p>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="max-w-xl mx-auto w-full">
              <div className="calm-card p-10 md:p-14 animate-scale-in relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-48 h-48 -mr-24 -mt-24 rounded-full opacity-20 ${roles.find(r => r.id === selectedRole)?.color}`} />

                <div className="flex items-center mb-3 relative z-10 gap-4 -ml-2">
                  <button onClick={() => setSelectedRole(null)}
                    className="p-2 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <h2 className="text-4xl font-black">{isLogin ? "Welcome Back!" : "Create Account"}</h2>
                </div>

                <div className="mb-6 relative z-10">
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black border-2 border-foreground shadow-pop-sm ${roles.find(r => r.id === selectedRole)?.color}`}>
                    {selectedRole === "child" ? "👦" : selectedRole === "parent" ? "👪" : selectedRole === "caregiver" ? "🫂" : "🩺"}
                    {roles.find(r => r.id === selectedRole)?.title}
                  </span>
                </div>

                {selectedRole === "child" && !isLogin && (
                  <div className="mb-5 bg-primary/10 border-2 border-primary/30 rounded-xl p-4 relative z-10">
                    <p className="text-sm font-bold text-primary">
                      👦 Your email becomes your unique account. Parents use it to connect with you. Google sign-up is instant — no extra steps!
                    </p>
                  </div>
                )}

                <p className="text-lg text-muted-foreground font-medium mb-8 relative z-10">
                  {isLogin ? "Enter your details to continue your journey." : "Join us and start exploring a calmer space."}
                </p>

                <form className="space-y-5 relative z-10" onSubmit={isLogin ? handleLogin : handleSignUp}>
                  {!isLogin && (
                    <div className="space-y-2 text-left">
                      <label className="text-base font-bold ml-1">Full Name</label>
                      <Input type="text" placeholder="Enter your name" value={name}
                        onChange={e => setName(e.target.value)} required
                        className="h-14 text-lg border-2 border-foreground shadow-pop-sm focus-visible:ring-primary rounded-xl" />
                    </div>
                  )}

                  {!isLogin && selectedRole === "parent" && (
                    <div className="space-y-2 text-left">
                      <label className="text-base font-bold ml-1">Child's CalmSpace Email <span className="text-destructive">*</span></label>
                      <Input type="email" placeholder="child@example.com" value={childEmail}
                        onChange={e => setChildEmail(e.target.value)} required
                        className="h-14 text-lg border-2 border-foreground shadow-pop-sm focus-visible:ring-primary rounded-xl" />
                      <p className="text-xs text-muted-foreground font-bold ml-1">The child must already have a CalmSpace account.</p>
                    </div>
                  )}

                  {!isLogin && selectedRole === "caregiver" && (
                    <div className="space-y-2 text-left">
                      <label className="text-base font-bold ml-1">Child's CalmSpace Email <span className="text-muted-foreground text-sm font-medium">(optional)</span></label>
                      <Input type="email" placeholder="child@example.com (skip if invited by parent)" value={childEmail}
                        onChange={e => setChildEmail(e.target.value)}
                        className="h-14 text-lg border-2 border-foreground shadow-pop-sm focus-visible:ring-primary rounded-xl" />
                      <p className="text-xs text-muted-foreground font-bold ml-1">Leave blank if the parent will invite you from their dashboard.</p>
                    </div>
                  )}

                  {!isLogin && selectedRole === "doctor" && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-left">
                      <p className="text-sm font-bold text-blue-800">
                        🩺 Families are linked to you when a parent invites you from their Manage Care Team page.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 text-left">
                    <label className="text-base font-bold ml-1">Email Address</label>
                    <Input type="email" placeholder="hello@example.com" value={email}
                      onChange={e => setEmail(e.target.value)} required
                      className="h-14 text-lg border-2 border-foreground shadow-pop-sm focus-visible:ring-primary rounded-xl" />
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-base font-bold ml-1">Password</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder={isLogin ? "Enter password" : "Min. 6 characters"}
                        value={password} onChange={e => setPassword(e.target.value)} required
                        minLength={6}
                        className="h-14 text-lg border-2 border-foreground shadow-pop-sm focus-visible:ring-primary rounded-xl pr-12" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {isLogin && (
                      <div className="flex justify-end mt-1">
                        <button type="button" onClick={handleForgotPassword}
                          className="text-sm font-bold text-primary hover:underline underline-offset-4">
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-left">
                    <input type="checkbox" id="rememberMe" checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-foreground accent-primary" />
                    <label htmlFor="rememberMe" className="text-sm font-bold cursor-pointer">Remember me</label>
                  </div>

                  <Button disabled={submitting}
                    className="w-full h-14 text-xl font-black border-2 border-foreground shadow-pop-sm hover:shadow-pop-lg hover:-translate-y-1 transition-all rounded-xl mt-4 bg-primary text-primary-foreground">
                    {submitting
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <>{isLogin ? "Sign In" : "Sign Up"} <ArrowRight className="ml-2 w-6 h-6" /></>}
                  </Button>
                </form>

                <div className="mt-6 flex items-center justify-center space-x-4 relative z-10">
                  <div className="h-px bg-border flex-1" />
                  <span className="text-muted-foreground font-medium text-sm">OR</span>
                  <div className="h-px bg-border flex-1" />
                </div>

                <Button type="button" onClick={handleGoogleSignIn} disabled={submitting}
                  className="w-full h-14 text-lg font-bold border-2 border-foreground shadow-pop-sm hover:shadow-pop-lg hover:-translate-y-1 transition-all rounded-xl mt-6 bg-white text-foreground hover:bg-gray-50 flex items-center justify-center gap-3 relative z-10">
                  <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  {selectedRole === "child" ? "Sign up / Sign in with Google ⚡" : "Continue with Google"}
                </Button>

                {selectedRole === "child" && (
                  <p className="text-xs text-muted-foreground font-medium text-center mt-2 relative z-10">
                    ✨ For children, Google sign-up is instant — your account is automatically created!
                  </p>
                )}

                <div className="mt-8 text-center relative z-10">
                  <p className="text-lg text-muted-foreground font-medium">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button onClick={() => { setIsLogin(!isLogin); setChildEmail(""); }}
                      className="text-foreground font-black hover:underline decoration-4 underline-offset-4">
                      {isLogin ? "Sign up" : "Log in"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
