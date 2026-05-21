import { Sparkles, Gamepad2, Zap, Shield, Heart, Brain, Trophy, Star, Target, Users, Flame, MessageCircle, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onComplete: () => void;
}

const floatingItems = [
  { icon: Gamepad2,       top: "8%",   left: "6%",   bg: "bg-primary",   color: "text-primary-foreground",   size: 56, rotate: "rotate-12",  delay: "0s"   },
  { icon: Trophy,         top: "7%",   left: "78%",  bg: "bg-secondary", color: "text-secondary-foreground", size: 52, rotate: "-rotate-12", delay: "0.4s" },
  { icon: Zap,            top: "22%",  left: "3%",   bg: "bg-secondary", color: "text-secondary-foreground", size: 40, rotate: "-rotate-6",  delay: "0.8s" },
  { icon: Brain,          top: "20%",  left: "85%",  bg: "bg-primary",   color: "text-primary-foreground",   size: 44, rotate: "rotate-8",   delay: "1.2s" },
  { icon: Heart,          top: "36%",  left: "7%",   bg: "bg-card",      color: "text-primary",              size: 44, rotate: "rotate-6",   delay: "0.6s" },
  { icon: Star,           top: "38%",  left: "82%",  bg: "bg-secondary", color: "text-secondary-foreground", size: 36, rotate: "-rotate-3",  delay: "1s"   },
  { icon: Target,         top: "54%",  left: "3%",   bg: "bg-primary",   color: "text-primary-foreground",   size: 40, rotate: "-rotate-9",  delay: "1.4s" },
  { icon: Shield,         top: "52%",  left: "86%",  bg: "bg-card",      color: "text-primary",              size: 44, rotate: "rotate-6",   delay: "0.2s" },
  { icon: Flame,          top: "68%",  left: "7%",   bg: "bg-secondary", color: "text-secondary-foreground", size: 36, rotate: "rotate-3",   delay: "0.9s" },
  { icon: Users,          top: "66%",  left: "80%",  bg: "bg-primary",   color: "text-primary-foreground",   size: 40, rotate: "-rotate-6",  delay: "0.5s" },
  { icon: MessageCircle,  top: "82%",  left: "5%",   bg: "bg-card",      color: "text-primary",              size: 36, rotate: "-rotate-3",  delay: "1.1s" },
  { icon: Award,          top: "80%",  left: "83%",  bg: "bg-secondary", color: "text-secondary-foreground", size: 40, rotate: "rotate-9",   delay: "0.7s" },
  { icon: Sparkles,       top: "92%",  left: "15%",  bg: "bg-primary",   color: "text-primary-foreground",   size: 32, rotate: "rotate-12",  delay: "1.3s" },
  { icon: Star,           top: "90%",  left: "72%",  bg: "bg-card",      color: "text-secondary",            size: 36, rotate: "-rotate-6",  delay: "0.3s" },
];

export const OnboardingSequence = ({ onComplete }: Props) => {
  return (
    <div className="w-full min-h-[calc(100vh-8rem)] flex items-center justify-center relative overflow-hidden animate-fade-up">

      {/* Dynamic floating boxed icons scattered all over the page */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingItems.map(({ icon: Icon, top, left, bg, color, size, rotate, delay }, i) => (
          <div
            key={i}
            className={`absolute animate-float ${rotate}`}
            style={{ top, left, animationDelay: delay }}
          >
            <div
              className={`${bg} border-2 border-foreground shadow-pop rounded-2xl flex items-center justify-center`}
              style={{ width: size, height: size }}
            >
              <Icon className={`${color}`} style={{ width: size * 0.5, height: size * 0.5 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Center Content — clean text only */}
      <div className="flex flex-col items-center text-center px-8 max-w-2xl relative z-10 gap-8">

        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none text-foreground">
          Calm<span className="text-primary">Quest</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed">
          Master real-world social situations in a safe, interactive world built for you.
        </p>

        <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed max-w-lg">
          Practice conversations, navigate teamwork challenges, and unlock social confidence — one adventure at a time.
        </p>

        <p className="text-base text-muted-foreground/70 leading-relaxed max-w-md">
          Three unique worlds. Fifteen real-life scenarios. Designed to feel safe, fun, and rewarding.
        </p>

        <Button
          onClick={onComplete}
          size="lg"
          className="rounded-full text-xl font-black px-14 py-8 bg-secondary text-secondary-foreground border-4 border-foreground shadow-pop-lg hover:-translate-y-1 hover:shadow-[8px_8px_0px_hsl(var(--foreground))] transition-all duration-300 group mt-2"
        >
          Enter the World
          <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
        </Button>

      </div>
    </div>
  );
};
