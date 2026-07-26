import { useState } from "react";
import { UserCircle2, Calendar, Trophy, Settings, Sparkles, CheckCircle2, BookOpen, Utensils, Edit3, ArrowRight, Star, Bell, Mic, Palette, Play } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const CheckIns = () => {
  const [checkInState, setCheckInState] = useState<0 | 1 | 2>(0); 
  // 0: Start screen, 1: Mood selection, 2: Response
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("Check-in");

  const handleStartCheckIn = () => setCheckInState(1);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    setCheckInState(2);
  };

  const navItems = [
    { label: "Check-in", icon: Sparkles },
    { label: "My Plan", icon: Calendar },
    { label: "Rewards", icon: Trophy },
    { label: "Settings", icon: Settings },
  ];

  const moodOptions = [
    { text: "Great", colorClass: "bg-[#e8f5e9] border-[#a5d6a7] text-[#2e7d32] hover:bg-[#c8e6c9]" },
    { text: "Good", colorClass: "bg-[#e3f2fd] border-[#90caf9] text-[#1565c0] hover:bg-[#bbdefb]" },
    { text: "Okay", colorClass: "bg-[#fff3e0] border-[#ffcc80] text-[#ef6c00] hover:bg-[#ffe0b2]" },
    { text: "Meh", colorClass: "bg-[#f3e5f5] border-[#ce93d8] text-[#7b1fa2] hover:bg-[#e1bee7]" },
    { text: "Sad", colorClass: "bg-[#ffebee] border-[#ef9a9a] text-[#c62828] hover:bg-[#ffcdd2]" }
  ];

  const renderCheckInTab = () => {
    if (checkInState === 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-fade-up min-h-[500px] relative overflow-hidden">
          
          {/* Animated decorative shapes for Start Screen */}
          <div className="absolute top-10 left-10 text-secondary animate-float-slow opacity-60">
            <Star fill="currentColor" size={48} />
          </div>
          <div className="absolute bottom-20 right-10 text-primary animate-float-fast opacity-60">
            <Sparkles fill="currentColor" size={56} />
          </div>
          <div className="absolute top-20 right-20 text-accent animate-float-slow opacity-60" style={{ animationDelay: '1s' }}>
            <div className="w-12 h-12 rounded-full bg-accent/40 border-4 border-accent border-dashed animate-[spin_10s_linear_infinite]" />
          </div>
          <div className="absolute bottom-10 left-20 text-muted-foreground animate-float-fast opacity-40" style={{ animationDelay: '0.5s' }}>
            <div className="w-16 h-16 rounded-[2rem] bg-foreground/5 border-4 border-foreground/10 rotate-12" />
          </div>

          <div className="w-32 h-32 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-8 shadow-pop-sm relative z-10 animate-pulse-glow">
            <Sparkles size={64} className="text-primary" />
          </div>
          <h1 className="text-5xl font-black text-foreground mb-4 relative z-10">Time to Check-in!</h1>
          <p className="text-xl text-muted-foreground font-bold mb-10 max-w-lg leading-relaxed relative z-10">
            Let's take a quick moment to see how you're feeling and plan the rest of your day.
          </p>
          <button 
            onClick={handleStartCheckIn}
            className="px-12 py-5 rounded-full border-2 border-foreground font-black text-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-pop hover:-translate-y-2 hover:shadow-pop-md transition-all active:scale-95 flex items-center gap-4 relative z-10"
          >
            Start Check-in <Play size={24} fill="currentColor" />
          </button>
        </div>
      );
    }

    if (checkInState === 1) {
      return (
        <div className="animate-fade-up flex flex-col h-full">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-black text-primary mb-2 tracking-tight">Hey Buddy!</h1>
            <h2 className="text-3xl font-bold text-foreground">How was your school day?</h2>
          </div>

          <div className="calm-card p-8 md:p-12 bg-background/80 backdrop-blur-sm border-2 border-foreground shadow-pop mb-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {moodOptions.map((mood, index) => (
                <button
                  key={mood.text}
                  onClick={() => handleMoodSelect(mood.text)}
                  className={`py-8 px-4 rounded-2xl border-2 shadow-pop-sm hover:-translate-y-2 hover:shadow-pop active:scale-95 transition-all flex items-center justify-center group ${mood.colorClass}`}
                  style={{ animation: `fade-up 0.4s ease ${index * 80}ms forwards`, opacity: 0 }}
                >
                  <span className="font-black text-2xl md:text-3xl transition-transform group-hover:scale-110">{mood.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-auto">
            <div className="calm-card p-6 border-2 border-foreground shadow-pop-sm bg-background/80 backdrop-blur-sm flex flex-col justify-center items-center">
              <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4">Daily Progress</h3>
              <div className="flex gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-foreground shadow-sm ${i <= 2 ? 'bg-secondary scale-110' : 'bg-muted'}`} />
                ))}
              </div>
              <p className="font-bold text-muted-foreground text-sm">2 out of 5 bubbles filled!</p>
            </div>
            
            <div className="calm-card p-6 border-2 border-foreground shadow-pop-sm bg-background/80 backdrop-blur-sm flex items-center gap-6">
              <div className="w-16 h-16 shrink-0 rounded-full bg-secondary border-2 border-foreground flex items-center justify-center shadow-sm">
                <Trophy size={28} className="text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-black mb-1">Almost there!</h3>
                <p className="text-sm font-bold text-muted-foreground leading-snug">Check-in today to earn 50 Stars for your collection.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="animate-fade-up">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-primary mb-2 tracking-tight">
            {selectedMood === 'Great' || selectedMood === 'Good' 
              ? "I'm so glad you're feeling happy!" 
              : selectedMood === 'Okay' 
                ? "Thanks for sharing!" 
                : "I'm sorry you had a tough day."}
          </h1>
          <h2 className="text-3xl font-bold text-foreground">
            {selectedMood === 'Great' || selectedMood === 'Good' 
              ? "Let's make today awesome." 
              : "Take some time to rest and reset."}
          </h2>
          
          <div className="mt-6 inline-flex items-center gap-4 bg-background px-6 py-3 rounded-[2rem] border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-2 border-foreground shrink-0">
              <Sparkles size={20} className="text-primary-foreground" />
            </div>
            <p className="font-bold italic text-muted-foreground text-sm pr-4">"If you need help planning, just click the button!"</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="calm-card border-2 border-foreground shadow-pop flex flex-col bg-background overflow-hidden group hover:-translate-y-2 transition-all">
            <div className="h-32 bg-secondary/20 flex items-center justify-center border-b-2 border-foreground relative overflow-hidden">
              <div className="absolute inset-0 bg-secondary/10 group-hover:bg-secondary/30 transition-colors" />
              <Utensils size={48} className="text-secondary-foreground/40 transform group-hover:scale-110 transition-transform" />
              <div className="absolute top-4 right-4 w-10 h-10 bg-secondary rounded-full border-2 border-foreground flex items-center justify-center shadow-sm">
                <Utensils size={20} className="text-secondary-foreground" />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-black mb-2 text-primary">Snack Time</h3>
              <p className="text-sm font-bold text-muted-foreground mb-6 leading-relaxed">Fuel your brain and body with something yummy and healthy!</p>
              <button className="mt-auto w-full py-3 rounded-full border-2 border-foreground font-black bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shadow-sm">
                I'm munching!
              </button>
            </div>
          </div>

          <div className="calm-card border-2 border-foreground shadow-pop flex flex-col bg-background overflow-hidden group hover:-translate-y-2 transition-all">
            <div className="h-32 bg-accent/20 flex items-center justify-center border-b-2 border-foreground relative overflow-hidden">
              <div className="absolute inset-0 bg-accent/10 group-hover:bg-accent/30 transition-colors" />
              <BookOpen size={48} className="text-accent-foreground/40 transform group-hover:scale-110 transition-transform" />
              <div className="absolute top-4 right-4 w-10 h-10 bg-accent rounded-full border-2 border-foreground flex items-center justify-center shadow-sm">
                <Edit3 size={20} className="text-accent-foreground" />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-black mb-2 text-accent">Homework Hero</h3>
              <p className="text-sm font-bold text-muted-foreground mb-6 leading-relaxed">You're feeling {selectedMood?.toLowerCase() || 'ready'}, which is the perfect time to knock out some tasks!</p>
              <button className="mt-auto w-full py-3 rounded-full border-2 border-foreground font-black bg-accent text-accent-foreground hover:bg-accent/90 transition-colors shadow-sm">
                Let's do this!
              </button>
            </div>
          </div>

          <div className="calm-card border-2 border-foreground shadow-pop flex flex-col bg-background overflow-hidden group hover:-translate-y-2 transition-all">
            <div className="h-32 bg-primary/20 flex items-center justify-center border-b-2 border-foreground relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/30 transition-colors" />
              <Calendar size={48} className="text-primary/40 transform group-hover:scale-110 transition-transform" />
              <div className="absolute top-4 right-4 w-10 h-10 bg-background rounded-full border-2 border-foreground flex items-center justify-center shadow-sm">
                <Calendar size={20} className="text-foreground" />
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-black mb-2 text-primary">Day Planner</h3>
              <p className="text-sm font-bold text-muted-foreground mb-6 leading-relaxed">See what else is coming up today and stay ahead of the game!</p>
              <button className="mt-auto w-full py-3 rounded-full border-2 border-foreground font-black bg-background hover:bg-muted transition-colors shadow-sm">
                Help me plan
              </button>
            </div>
          </div>
        </div>

        <div className="calm-card p-8 border-2 border-foreground shadow-pop-sm bg-background/80 backdrop-blur-sm mt-auto max-w-2xl mx-auto w-full">
          <h3 className="text-center font-black text-xl mb-6">Afternoon Progress</h3>
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center w-full">
              <div className="w-12 h-12 rounded-full bg-secondary border-2 border-foreground flex items-center justify-center z-10 shadow-sm shrink-0">
                <CheckCircle2 size={28} className="text-secondary-foreground" />
              </div>
              <div className="flex-1 h-2 bg-foreground -mx-1" />
              <div className="w-12 h-12 rounded-full bg-background border-2 border-foreground flex items-center justify-center z-10 text-muted-foreground font-black text-lg shrink-0">
                2
              </div>
              <div className="flex-1 h-2 bg-muted border-y-2 border-foreground/20 -mx-1" />
              <div className="w-12 h-12 rounded-full bg-background border-2 border-foreground flex items-center justify-center z-10 text-muted-foreground font-black text-lg shrink-0">
                3
              </div>
            </div>
          </div>
          <p className="text-center text-sm font-bold text-muted-foreground">1 of 3 afternoon goals completed. Keep that {selectedMood === 'Great' || selectedMood === 'Good' ? 'happy' : 'steady'} energy going!</p>
        </div>
        
        <div className="flex justify-center mt-8">
          <button 
            onClick={() => { setCheckInState(0); setSelectedMood(null); }}
            className="text-sm font-black text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Restart Check-in flow (Demo)
          </button>
        </div>
      </div>
    );
  };

  const renderMyPlan = () => (
    <div className="animate-fade-up max-w-4xl mx-auto w-full h-full flex flex-col">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-accent border-2 border-foreground flex items-center justify-center shadow-pop-sm">
          <Calendar size={32} className="text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-foreground mb-1">My Plan</h1>
          <p className="text-lg font-bold text-muted-foreground">Here is what is coming up today.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="calm-card p-6 flex items-center gap-6 bg-background border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-secondary border-2 border-foreground flex items-center justify-center shrink-0">
            <Utensils size={32} className="text-secondary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black mb-1">Snack Time</h3>
            <p className="font-bold text-muted-foreground">4:00 PM • Kitchen</p>
          </div>
          <button className="w-12 h-12 rounded-full border-2 border-foreground bg-primary flex items-center justify-center shadow-sm">
            <CheckCircle2 size={24} className="text-primary-foreground" />
          </button>
        </div>

        <div className="calm-card p-6 flex items-center gap-6 bg-background border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-accent border-2 border-foreground flex items-center justify-center shrink-0">
            <BookOpen size={32} className="text-accent-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black mb-1">Reading 15 Mins</h3>
            <p className="font-bold text-muted-foreground">4:30 PM • Living Room</p>
          </div>
          <button className="w-12 h-12 rounded-full border-2 border-foreground bg-muted flex items-center justify-center shadow-sm text-muted-foreground hover:bg-background">
            <ArrowRight size={24} />
          </button>
        </div>

        <div className="calm-card p-6 flex items-center gap-6 bg-background border-2 border-foreground shadow-pop-sm hover:-translate-y-1 transition-all">
          <div className="w-16 h-16 rounded-2xl bg-primary border-2 border-foreground flex items-center justify-center shrink-0">
            <Edit3 size={32} className="text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black mb-1">Math Exercises</h3>
            <p className="font-bold text-muted-foreground">5:00 PM • Desk</p>
          </div>
          <button className="w-12 h-12 rounded-full border-2 border-foreground bg-muted flex items-center justify-center shadow-sm text-muted-foreground hover:bg-background">
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderRewards = () => (
    <div className="animate-fade-up max-w-4xl mx-auto w-full">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-secondary border-2 border-foreground flex items-center justify-center shadow-pop-sm">
          <Trophy size={32} className="text-secondary-foreground" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-foreground mb-1">Rewards</h1>
          <p className="text-lg font-bold text-muted-foreground">Keep checking in to earn more stars!</p>
        </div>
      </div>

      <div className="calm-card p-8 bg-background border-2 border-foreground shadow-pop mb-8 flex flex-col items-center justify-center py-12">
        <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mb-6 border-4 border-primary">
          <Star size={64} className="text-primary fill-primary" />
        </div>
        <h2 className="text-6xl font-black mb-4 text-foreground">350</h2>
        <p className="text-xl font-bold text-muted-foreground">Total Stars Collected</p>
      </div>

      <h3 className="text-2xl font-black mb-6">Badges</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map((i) => (
          <div key={i} className="calm-card p-6 bg-background border-2 border-foreground shadow-pop-sm flex flex-col items-center justify-center text-center">
            <div className={`w-16 h-16 rounded-full border-2 border-foreground flex items-center justify-center mb-3 shadow-sm ${i === 1 ? 'bg-secondary' : 'bg-muted'}`}>
              <Trophy size={28} className={i === 1 ? 'text-secondary-foreground' : 'text-muted-foreground'} />
            </div>
            <h4 className="font-bold text-sm">{i === 1 ? '7-Day Streak' : 'Locked Badge'}</h4>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="animate-fade-up max-w-4xl mx-auto w-full">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-foreground border-2 border-foreground flex items-center justify-center shadow-pop-sm">
          <Settings size={32} className="text-background" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-foreground mb-1">Settings</h1>
          <p className="text-lg font-bold text-muted-foreground">Customize your experience.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="calm-card p-6 bg-background border-2 border-foreground shadow-pop-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black">Check-in Reminders</h3>
              <p className="text-sm font-bold text-muted-foreground">Get notified when it's time to check-in.</p>
            </div>
          </div>
          <div className="w-14 h-8 rounded-full bg-primary border-2 border-foreground relative cursor-pointer shadow-inner">
            <div className="absolute right-1 top-1 w-5 h-5 rounded-full bg-background border-2 border-foreground" />
          </div>
        </div>

        <div className="calm-card p-6 bg-background border-2 border-foreground shadow-pop-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
              <Mic size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black">Voice Assistant</h3>
              <p className="text-sm font-bold text-muted-foreground">Allow Buddy to read questions out loud.</p>
            </div>
          </div>
          <div className="w-14 h-8 rounded-full bg-primary border-2 border-foreground relative cursor-pointer shadow-inner">
            <div className="absolute right-1 top-1 w-5 h-5 rounded-full bg-background border-2 border-foreground" />
          </div>
        </div>

        <div className="calm-card p-6 bg-background border-2 border-foreground shadow-pop-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <Palette size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black">Dark Mode</h3>
              <p className="text-sm font-bold text-muted-foreground">Switch to a darker theme.</p>
            </div>
          </div>
          <div className="w-14 h-8 rounded-full bg-muted border-2 border-foreground relative cursor-pointer shadow-inner">
            <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-background border-2 border-foreground" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AppShell fullWidth>
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-30px) rotate(-15deg) scale(1.1); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); box-shadow: 0 0 0 0 rgba(var(--primary), 0.4); }
          50% { opacity: 1; transform: scale(1.05); box-shadow: 0 0 30px 10px rgba(var(--primary), 0.2); }
        }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>
      <div className="flex flex-col lg:flex-row gap-8 mt-4 lg:mt-6 h-[calc(100vh-200px)] min-h-[750px]">
        
        {/* Left Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0 calm-card p-6 flex flex-col items-center bg-background border-2 border-foreground shadow-pop relative z-20 h-full">
          <div className="w-24 h-24 rounded-full bg-secondary border-2 border-foreground shadow-pop-sm flex items-center justify-center mb-4">
            <UserCircle2 size={48} className="text-secondary-foreground" />
          </div>
          <h2 className="text-2xl font-black text-center mb-1">Hey Buddy!</h2>
          <p className="text-muted-foreground font-bold text-sm mb-8">Ready for fun?</p>

          <nav className="w-full space-y-3">
            {navItems.map((item) => (
              <button 
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center gap-3 px-5 py-3 rounded-full border-2 font-bold transition-all ${
                  activeTab === item.label 
                    ? "bg-primary border-foreground text-primary-foreground shadow-pop-sm translate-x-1" 
                    : "bg-background border-transparent hover:border-foreground/20 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-6 relative w-full rounded-[2.5rem] border-2 border-transparent lg:border-foreground/10 lg:bg-background/40 lg:shadow-inner lg:p-8 overflow-y-auto overflow-x-hidden backdrop-blur-sm h-full scrollbar-hide">
          
          {/* Abstract background elements */}
          <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-20 animate-pulse-glow" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl pointer-events-none -z-20 animate-pulse-glow" style={{ animationDuration: '6s', animationDelay: '2s' }} />
          
          {/* Dynamic Grid Pattern Background */}
          <div className="absolute inset-0 pointer-events-none -z-30 opacity-30" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.1) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          {/* Cute Floating Background Icons */}
          <div className="absolute top-[5%] right-[5%] w-48 h-48 opacity-40 pointer-events-none -z-10 animate-float-slow">
            <img src="/icons/cloud.png" alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
          </div>
          <div className="absolute bottom-[10%] left-[8%] w-32 h-32 opacity-50 pointer-events-none -z-10 animate-float-fast">
            <img src="/icons/star.png" alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
          </div>
          <div className="absolute top-[45%] right-[25%] w-40 h-40 opacity-25 pointer-events-none -z-10 animate-float-slow" style={{ animationDelay: '2s' }}>
            <img src="/icons/owl.png" alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
          </div>
          <div className="absolute top-[25%] left-[15%] w-36 h-36 opacity-30 pointer-events-none -z-10 animate-float-fast" style={{ animationDelay: '1s' }}>
            <img src="/icons/cloud.png" alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply', transform: 'scaleX(-1)' }} />
          </div>
          
          {/* Duplicated Icons */}
          <div className="absolute bottom-[25%] right-[10%] w-24 h-24 opacity-40 pointer-events-none -z-10 animate-float-slow" style={{ animationDelay: '3s' }}>
            <img src="/icons/star.png" alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply', transform: 'rotate(15deg)' }} />
          </div>
          <div className="absolute top-[15%] left-[40%] w-28 h-28 opacity-20 pointer-events-none -z-10 animate-float-fast" style={{ animationDelay: '1.5s' }}>
            <img src="/icons/owl.png" alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply', transform: 'scaleX(-1)' }} />
          </div>
          <div className="absolute bottom-[40%] left-[2%] w-40 h-40 opacity-25 pointer-events-none -z-10 animate-float-slow" style={{ animationDelay: '4s' }}>
            <img src="/icons/cloud.png" alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply' }} />
          </div>
          <div className="absolute top-[60%] left-[30%] w-20 h-20 opacity-45 pointer-events-none -z-10 animate-float-fast" style={{ animationDelay: '2.5s' }}>
            <img src="/icons/star.png" alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply', transform: 'rotate(-20deg)' }} />
          </div>
          <div className="absolute bottom-[5%] right-[40%] w-32 h-32 opacity-30 pointer-events-none -z-10 animate-float-slow" style={{ animationDelay: '0.5s' }}>
            <img src="/icons/cloud.png" alt="" className="w-full h-full object-contain" style={{ mixBlendMode: 'multiply', transform: 'scaleX(-1)' }} />
          </div>

          {activeTab === "Check-in" && renderCheckInTab()}
          {activeTab === "My Plan" && renderMyPlan()}
          {activeTab === "Rewards" && renderRewards()}
          {activeTab === "Settings" && renderSettings()}
        </div>
      </div>
    </AppShell>
  );
};

export default CheckIns;
