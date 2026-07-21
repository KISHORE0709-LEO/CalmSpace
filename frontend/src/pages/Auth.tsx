import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { Smile, Stethoscope, Heart, HandHeart, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, setPersistence, browserLocalPersistence, browserSessionPersistence, sendPasswordResetEmail } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

type Role = "child" | "doctor" | "parent" | "caregiver" | null;

const floatingEmojis = [
  // Top section
  { emoji: "🌈", top: "8%",  left: "4%",  anim: "animate-float" },
  { emoji: "🪁", top: "12%", left: "45%", anim: "animate-float-delay" },
  { emoji: "🌸", top: "15%", left: "85%", anim: "animate-float-slow" },
  { emoji: "🦋", top: "10%", left: "65%", anim: "animate-bounce-slow" },
  
  // Middle-top section
  { emoji: "✨", top: "25%", left: "15%", anim: "animate-float" },
  { emoji: "🧸", top: "30%", left: "90%", anim: "animate-bounce-slow" },
  { emoji: "🌻", top: "35%", left: "35%", anim: "animate-float-delay" },
  { emoji: "⭐", top: "40%", left: "75%", anim: "animate-float" },
  
  // Middle-bottom section
  { emoji: "🕊️", top: "50%", left: "10%", anim: "animate-float-slow" },
  { emoji: "🎨", top: "55%", left: "55%", anim: "animate-bounce-slow" },
  { emoji: "🦋", top: "60%", left: "88%", anim: "animate-float-delay" },
  { emoji: "🍀", top: "65%", left: "25%", anim: "animate-float" },

  // Bottom section
  { emoji: "🌼", top: "75%", left: "70%", anim: "animate-bounce-slow" },
  { emoji: "🌙", top: "85%", left: "15%", anim: "animate-float-slow" },
  { emoji: "🫧", top: "88%", left: "45%", anim: "animate-float-delay" },
  { emoji: "🎈", top: "90%", left: "85%", anim: "animate-float" },

  // Extra sprinkled section 1
  { emoji: "🧩", top: "5%", left: "20%", anim: "animate-float-delay" },
  { emoji: "🪴", top: "18%", left: "25%", anim: "animate-float" },
  { emoji: "🌼", top: "22%", left: "70%", anim: "animate-float-slow" },
  { emoji: "🍄", top: "28%", left: "50%", anim: "animate-bounce-slow" },
  
  // Extra sprinkled section 2
  { emoji: "🪴", top: "45%", left: "5%", anim: "animate-float-delay" },
  { emoji: "✨", top: "48%", left: "95%", anim: "animate-float" },
  { emoji: "🌻", top: "65%", left: "60%", anim: "animate-float-slow" },
  { emoji: "🌸", top: "70%", left: "40%", anim: "animate-bounce-slow" },
  
  // Extra sprinkled section 3
  { emoji: "🌈", top: "82%", left: "30%", anim: "animate-float" },
  { emoji: "🧸", top: "95%", left: "10%", anim: "animate-float-delay" },
  { emoji: "🍀", top: "92%", left: "60%", anim: "animate-float-slow" },
  { emoji: "🕊️", top: "78%", left: "92%", anim: "animate-bounce-slow" },
];

const Auth = () => {
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [childEmail, setChildEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  const roleRedirect: Record<string, string> = {
    child:  "/app/feelings",
    parent: "/parent/chat",
    caregiver: "/caregiver/chat",
    doctor: "/doctor/chat",
  };

  useEffect(() => {
    if (!loading && user && profile) {
      toast.success(`Welcome back, ${profile.name}!`);
      navigate(roleRedirect[profile.role] || "/");
    }
  }, [user, profile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in successfully!");
        navigate(roleRedirect[selectedRole]);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        
        // Send data to our new FastAPI backend to create user & link child
        const payload = {
          firebase_uid: userCred.user.uid,
          name,
          email,
          role: selectedRole,
          child_email: (selectedRole === "parent" || selectedRole === "caregiver") ? childEmail : null
        };
        
        const response = await fetch("http://localhost:8000/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Signup failed on backend");
        }

        toast.success("Account created successfully!");
        navigate(roleRedirect[selectedRole]);
      }
    } catch (error: any) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        toast.error("Could not connect to the server. Please ensure the Python backend is running.");
      } else if (error.code === "auth/invalid-credential") {
        toast.error("Invalid email or password. If you signed up with Google, please click 'Continue with Google' or use 'Forgot Password' to set a password.");
      } else {
        toast.error(error.message || "An error occurred");
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    }
  };

  const handleGoogleSignIn = async () => {
    if (!selectedRole) return;

    if (!isLogin && (selectedRole === "parent" || selectedRole === "caregiver")) {
      if (!childEmail || !childEmail.trim()) {
        toast.error("Please enter your child's email address in the form before continuing with Google.");
        return;
      }
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (!isLogin) {
        const payload = {
          firebase_uid: user.uid,
          name: user.displayName || name || "Google User",
          email: user.email || email,
          role: selectedRole,
          child_email: (selectedRole === "parent" || selectedRole === "caregiver") ? childEmail : null
        };
        
        const response = await fetch("http://localhost:8000/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          // It's okay if email is already registered since they are signing in with Google
          if (errorData.detail !== "Email already registered") {
            throw new Error(errorData.detail || "Signup failed on backend");
          }
        }
        toast.success("Account created successfully with Google!");
      } else {
        toast.success("Logged in successfully with Google!");
      }
      
      navigate(roleRedirect[selectedRole]);
    } catch (error: any) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        toast.error("Could not connect to the server. Please ensure the Python backend is running.");
      } else {
        toast.error(error.message || "An error occurred with Google Sign In");
      }
    }
  };

  const roles = [
    {
      id: "child",
      title: "I am a Child",
      icon: Smile,
      color: "bg-primary text-primary-foreground",
      description: "Play, learn, and explore your feelings!",
    },
    {
      id: "parent",
      title: "Parent",
      icon: Heart,
      color: "bg-secondary text-secondary-foreground",
      description: "Monitor progress and provide support.",
    },
    {
      id: "caregiver",
      title: "Caregiver",
      icon: HandHeart,
      color: "bg-secondary text-secondary-foreground",
      description: "Monitor progress and provide support.",
    },
    {
      id: "doctor",
      title: "Doctor / Therapist",
      icon: Stethoscope,
      color: "bg-accent text-accent-foreground",
      description: "Manage patients and track development.",
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-36 pb-16 relative overflow-hidden">
      <PublicNav />

      {floatingEmojis.map((b, i) => (
        <span key={i} className={`fixed select-none pointer-events-none text-4xl ${b.anim} opacity-20 z-0`} style={{ top: b.top, left: b.left }}>
          {b.emoji}
        </span>
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
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id as Role)}
                      className={`calm-card flex flex-col items-center text-center p-10 min-h-[340px] justify-center transition-all hover:-translate-y-2 group animate-fade-up-delay-${index + 1}`}
                    >
                      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-8 border-2 border-foreground shadow-pop-sm group-hover:scale-110 transition-transform ${role.color}`}>
                        <Icon size={48} />
                      </div>
                      <h3 className="text-3xl font-black mb-4">{role.title}</h3>
                      <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                        {role.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="max-w-xl mx-auto w-full">
              <div className="calm-card p-10 md:p-14 animate-scale-in relative overflow-hidden">
                {/* Decorative element based on role */}
                <div className={`absolute top-0 right-0 w-48 h-48 -mr-24 -mt-24 rounded-full opacity-20 ${roles.find(r => r.id === selectedRole)?.color}`} />
                
                <div className="flex items-center mb-3 relative z-10 gap-4 -ml-2">
                  <button 
                    onClick={() => setSelectedRole(null)}
                    className="p-2 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors group"
                    aria-label="Back to role selection"
                    title="Back to role selection"
                  >
                    <ArrowLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <h2 className="text-4xl font-black">
                    {isLogin ? "Welcome Back!" : "Create Account"}
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground font-medium mb-10">
                  {isLogin 
                    ? "Enter your details to continue your journey."
                    : "Join us and start exploring a calmer space."}
                </p>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="space-y-3 text-left">
                      <label className="text-base font-bold ml-1">Full Name</label>
                      <Input 
                        type="text" 
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-14 text-lg border-2 border-foreground shadow-pop-sm focus-visible:ring-primary rounded-xl"
                      />
                    </div>
                  )}

                  {!isLogin && (selectedRole === "parent" || selectedRole === "caregiver") && (
                    <div className="space-y-3 text-left">
                      <label className="text-base font-bold ml-1">Child's Email ID</label>
                      <Input 
                        type="email" 
                        placeholder="child@example.com"
                        value={childEmail}
                        onChange={(e) => setChildEmail(e.target.value)}
                        required
                        className="h-14 text-lg border-2 border-foreground shadow-pop-sm focus-visible:ring-primary rounded-xl"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3 text-left">
                    <label className="text-base font-bold ml-1">Email Address</label>
                    <Input 
                      type="email" 
                      placeholder="hello@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-14 text-lg border-2 border-foreground shadow-pop-sm focus-visible:ring-primary rounded-xl"
                    />
                  </div>

                  <div className="space-y-3 text-left">
                    <label className="text-base font-bold ml-1">Password</label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-14 text-lg border-2 border-foreground shadow-pop-sm focus-visible:ring-primary rounded-xl pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {isLogin && (
                      <div className="flex justify-end mt-2">
                        <button 
                          type="button" 
                          onClick={handleForgotPassword}
                          className="text-sm font-bold text-primary hover:underline underline-offset-4"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-left">
                    <input 
                      type="checkbox" 
                      id="rememberMe" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-5 h-5 rounded border-2 border-foreground accent-primary" 
                    />
                    <label htmlFor="rememberMe" className="text-sm font-bold cursor-pointer">
                      Remember me
                    </label>
                  </div>

                  <Button 
                    className="w-full h-14 text-xl font-black border-2 border-foreground shadow-pop-sm hover:shadow-pop-lg hover:-translate-y-1 transition-all rounded-xl mt-8 bg-primary text-primary-foreground hover:bg-primary-hover"
                  >
                    {isLogin ? "Sign In" : "Sign Up"} 
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </form>

                <div className="mt-6 flex items-center justify-center space-x-4">
                  <div className="h-px bg-border flex-1"></div>
                  <span className="text-muted-foreground font-medium text-sm">OR</span>
                  <div className="h-px bg-border flex-1"></div>
                </div>

                <Button 
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full h-14 text-lg font-bold border-2 border-foreground shadow-pop-sm hover:shadow-pop-lg hover:-translate-y-1 transition-all rounded-xl mt-6 bg-white text-foreground hover:bg-gray-50 flex items-center justify-center gap-3"
                >
                  <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>

                <div className="mt-10 text-center">
                  <p className="text-lg text-muted-foreground font-medium">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button 
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-foreground font-black hover:underline decoration-4 underline-offset-4"
                    >
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
