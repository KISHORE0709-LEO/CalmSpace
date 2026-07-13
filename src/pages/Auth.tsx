import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { Smile, Stethoscope, Heart, HandHeart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const navigate = useNavigate();

  const roleRedirect: Record<string, string> = {
    child:  "/app/feelings",
    parent: "/app/feelings",
    caregiver: "/app/feelings",
    doctor: "/app/feelings",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole) navigate(roleRedirect[selectedRole]);
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
              <button 
                onClick={() => setSelectedRole(null)}
                className="mb-8 text-base font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center w-full"
              >
                ← Back to role selection
              </button>

              <div className="calm-card p-10 md:p-14 animate-scale-in relative overflow-hidden">
                {/* Decorative element based on role */}
                <div className={`absolute top-0 right-0 w-48 h-48 -mr-24 -mt-24 rounded-full opacity-20 ${roles.find(r => r.id === selectedRole)?.color}`} />
                
                <h2 className="text-4xl font-black mb-3">
                  {isLogin ? "Welcome Back!" : "Create Account"}
                </h2>
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
                        className="h-14 text-lg border-2 border-foreground shadow-pop-sm focus-visible:ring-primary rounded-xl"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3 text-left">
                    <label className="text-base font-bold ml-1">Email Address</label>
                    <Input 
                      type="email" 
                      placeholder="hello@example.com"
                      className="h-14 text-lg border-2 border-foreground shadow-pop-sm focus-visible:ring-primary rounded-xl"
                    />
                  </div>

                  <div className="space-y-3 text-left">
                    <label className="text-base font-bold ml-1">Password</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      className="h-14 text-lg border-2 border-foreground shadow-pop-sm focus-visible:ring-primary rounded-xl"
                    />
                  </div>

                  <Button 
                    className="w-full h-14 text-xl font-black border-2 border-foreground shadow-pop-sm hover:shadow-pop-lg hover:-translate-y-1 transition-all rounded-xl mt-8 bg-primary text-primary-foreground hover:bg-primary-hover"
                  >
                    {isLogin ? "Sign In" : "Sign Up"} 
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </form>

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
