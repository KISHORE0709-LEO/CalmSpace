import { Sparkles, Gamepad2, Zap, Shield, Heart, Brain, Trophy, Star, Target, Users, Flame, MessageCircle, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  onComplete: () => void;
}

const leftItems = [
  { icon: Gamepad2,      top: "8vh",  left: "1vw",  bg: "bg-primary",   color: "text-primary-foreground",   delay: "0s",   size: 52, anim: "animate-float" },
  { icon: Zap,           top: "16vh", left: "10vw", bg: "bg-secondary", color: "text-secondary-foreground", delay: "0.5s", size: 40, anim: "animate-bounce-slow" },
  { icon: Heart,         top: "24vh", left: "3vw",  bg: "bg-primary",   color: "text-primary-foreground",   delay: "0.3s", size: 44, anim: "animate-pulse-soft" },
  { icon: Target,        top: "32vh", left: "12vw", bg: "bg-accent",    color: "text-accent-foreground",    delay: "0.8s", size: 40, anim: "animate-float-slow" },
  { icon: Flame,         top: "40vh", left: "2vw",  bg: "bg-secondary", color: "text-secondary-foreground", delay: "0.6s", size: 42, anim: "animate-float-delay" },
  { icon: MessageCircle, top: "48vh", left: "11vw", bg: "bg-primary",   color: "text-primary-foreground",   delay: "1s",   size: 44, anim: "animate-bounce-slow" },
  { icon: Sparkles,      top: "56vh", left: "1vw",  bg: "bg-accent",    color: "text-accent-foreground",    delay: "0.4s", size: 38, anim: "animate-float" },
  { icon: Star,          top: "64vh", left: "9vw",  bg: "bg-secondary", color: "text-secondary-foreground", delay: "1.2s", size: 42, anim: "animate-float-slow" },
  { icon: Brain,         top: "72vh", left: "3vw",  bg: "bg-primary",   color: "text-primary-foreground",   delay: "0.7s", size: 40, anim: "animate-bounce-slow" },
  { icon: Award,         top: "80vh", left: "13vw", bg: "bg-accent",    color: "text-accent-foreground",    delay: "0.9s", size: 44, anim: "animate-float-delay" },
  { icon: Users,         top: "88vh", left: "2vw",  bg: "bg-secondary", color: "text-secondary-foreground", delay: "1.4s", size: 38, anim: "animate-pulse-soft" },
];

const rightItems = [
  { icon: Trophy,        top: "8vh",  right: "2vw",  bg: "bg-secondary", color: "text-secondary-foreground", delay: "0.4s", size: 48, anim: "animate-float-delay" },
  { icon: Shield,        top: "16vh", right: "11vw", bg: "bg-primary",   color: "text-primary-foreground",   delay: "0.9s", size: 44, anim: "animate-float-slow" },
  { icon: Star,          top: "24vh", right: "1vw",  bg: "bg-secondary", color: "text-secondary-foreground", delay: "0.2s", size: 46, anim: "animate-spin-slow" },
  { icon: Users,         top: "32vh", right: "10vw", bg: "bg-accent",    color: "text-accent-foreground",    delay: "0.7s", size: 44, anim: "animate-bounce-slow" },
  { icon: Award,         top: "40vh", right: "2vw",  bg: "bg-secondary", color: "text-secondary-foreground", delay: "1.1s", size: 46, anim: "animate-float-slow" },
  { icon: Zap,           top: "48vh", right: "12vw", bg: "bg-primary",   color: "text-primary-foreground",   delay: "0.5s", size: 40, anim: "animate-float" },
  { icon: Heart,         top: "56vh", right: "1vw",  bg: "bg-accent",    color: "text-accent-foreground",    delay: "1.3s", size: 44, anim: "animate-float-delay" },
  { icon: Gamepad2,      top: "64vh", right: "9vw",  bg: "bg-primary",   color: "text-primary-foreground",   delay: "0.6s", size: 42, anim: "animate-bounce-slow" },
  { icon: Flame,         top: "72vh", right: "2vw",  bg: "bg-secondary", color: "text-secondary-foreground", delay: "0.8s", size: 40, anim: "animate-float-slow" },
  { icon: Brain,         top: "80vh", right: "11vw", bg: "bg-accent",    color: "text-accent-foreground",    delay: "1.5s", size: 44, anim: "animate-float" },
  { icon: Sparkles,      top: "88vh", right: "3vw",  bg: "bg-primary",   color: "text-primary-foreground",   delay: "0.3s", size: 38, anim: "animate-pulse-soft" },
];

const FloatingElements = () => (
  <>
    {leftItems.map(({ icon: Icon, top, left, bg, color, delay, size, anim }, i) => (
      <div
        key={`l-${i}`}
        className={`fixed ${anim} ${bg} ${color} rounded-2xl border-2 border-foreground shadow-pop flex items-center justify-center`}
        style={{ top, left, zIndex: 40, animationDelay: delay, width: size + 16, height: size + 16 }}
      >
        <Icon size={Math.round(size * 0.55)} strokeWidth={2} />
      </div>
    ))}
    {rightItems.map(({ icon: Icon, top, right, bg, color, delay, size, anim }, i) => (
      <div
        key={`r-${i}`}
        className={`fixed ${anim} ${bg} ${color} rounded-2xl border-2 border-foreground shadow-pop flex items-center justify-center`}
        style={{ top, right, zIndex: 40, animationDelay: delay, width: size + 16, height: size + 16 }}
      >
        <Icon size={Math.round(size * 0.55)} strokeWidth={2} />
      </div>
    ))}
  </>
);

export const OnboardingSequence = ({ onComplete }: Props) => {
  return (
    <div className="w-full min-h-[calc(100vh-8rem)] flex items-center justify-center relative overflow-hidden animate-fade-up py-16">
      {/* Portal: renders directly into document.body, bypasses all containers */}
      {createPortal(<FloatingElements />, document.body)}
      <div className="flex flex-col items-center text-center px-6 max-w-5xl w-full gap-7">
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none text-foreground">
          Calm<span className="text-primary">Quest</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed w-full">
          Master real-world social situations in a safe, interactive world built for you.
        </p>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed w-full">
          Practice conversations, navigate challenges, and build the confidence you need — one level at a time, in a world that celebrates every small win along the way.
        </p>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed w-full">
          With <span className="text-primary font-black">15+ real-world scenarios</span> spread across{' '}
          <span className="text-primary font-black">3 unique worlds</span>, every level is a safe step toward{' '}
          <span className="text-secondary font-black">unlimited growth</span> — at your own pace, in your own way.
        </p>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed w-full">
          Each world has its own story, characters, and challenges — from making new friends in the{' '}
          <span className="text-primary font-black">Friendship Forest</span>, to standing tall in the{' '}
          <span className="text-secondary font-black">Confidence Castle</span>, to understanding others in the{' '}
          <span className="text-primary font-black">Empathy Ocean</span>.
        </p>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed w-full">
          Every level you complete earns <span className="text-secondary font-black">stars and XP</span>. There are no wrong answers here — only learning moments. CalmSpace is a{' '}
          <span className="text-primary font-black">judgment-free zone</span> where every child is celebrated for showing up.
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
