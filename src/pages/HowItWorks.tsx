import React, { useEffect, useRef, useState } from "react";
import { UserPlus, Smile, MessageCircle, LineChart, Sparkles, Rocket, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";

const steps = [
  { num: "01", icon: UserPlus,      title: "Create a gentle profile",    desc: "Tell us a little about likes, dislikes, and sensory preferences.",                    accent: "bg-primary",   emoji: "👤" },
  { num: "02", icon: Smile,         title: "Check in with feelings",     desc: "Tap a feeling card. CalmSpace responds with comfort, not judgement.",                 accent: "bg-secondary", emoji: "😊" },
  { num: "03", icon: MessageCircle, title: "Talk to Mitra",              desc: "An empathetic AI companion that listens and adapts to mood.",                         accent: "bg-accent",    emoji: "💬" },
  { num: "04", icon: Sparkles,      title: "Practice social moments",    desc: "Safe scenarios build confidence at your own pace.",                                   accent: "bg-primary",   emoji: "🌟" },
  { num: "05", icon: LineChart,     title: "Caregivers stay close",      desc: "See patterns, celebrate wins, and prepare for tough moments.",                        accent: "bg-secondary", emoji: "📊" },
];

const floatingEmojis = [
  { emoji: "🌈", top: "8%",  left: "4%",  anim: "animate-float" },
  { emoji: "⭐", top: "15%", left: "93%", anim: "animate-float-delay" },
  { emoji: "🦋", top: "55%", left: "2%",  anim: "animate-bounce-slow" },
  { emoji: "🌸", top: "75%", left: "95%", anim: "animate-float-slow" },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(36px)", transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

const DesktopConnector = ({ fromSide }: { fromSide: "left" | "right" }) => {
  const isLeft = fromSide === "left";
  return (
    <div className="hidden md:block w-full h-28 lg:h-36 relative z-10 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
        <path
          d={isLeft ? "M 25,0 L 25,15 C 25,60 75,40 75,85 L 75,100" : "M 75,0 L 75,15 C 75,60 25,40 25,85 L 25,100"}
          fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" vectorEffect="non-scaling-stroke"
          className="opacity-90"
        />
      </svg>
      <div className="absolute bottom-0 w-0 h-0" style={{ left: isLeft ? "75%" : "25%" }}>
        <div className="absolute -left-4 -top-3 text-primary animate-bounce-slow">
          <ChevronDown size={32} strokeWidth={3.5} />
        </div>
      </div>
    </div>
  );
};

const MobileConnector = ({ fromSide }: { fromSide: "left" | "right" }) => {
  const isLeft = fromSide === "left";
  return (
    <div className="block md:hidden w-full h-16 relative z-10 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
        <path
          d={isLeft ? "M 50,0 C 40,40 60,60 50,100" : "M 50,0 C 60,40 40,60 50,100"}
          fill="none" stroke="hsl(var(--primary))" strokeWidth="3.5" strokeDasharray="6 8" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="opacity-90"
        />
      </svg>
      <div className="absolute bottom-0 left-[50%] w-0 h-0">
        <div className="absolute -left-[14px] -top-3 text-primary animate-bounce-slow">
          <ChevronDown size={28} strokeWidth={3.5} />
        </div>
      </div>
    </div>
  );
};

const StepCard = ({ step, Icon, delay }: { step: typeof steps[0]; Icon: React.ElementType; delay: number }) => {
  const { ref, inView } = useInView(0.1);
  return (
    <article
      ref={ref}
      className="group w-full max-w-sm md:max-w-none mx-auto bg-card border-2 border-foreground rounded-[2rem] p-6 lg:p-8 shadow-pop hover:shadow-pop-lg hover:-translate-y-2 transition-all duration-300 relative overflow-hidden z-20"
      style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)", transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms` }}
    >
      <div className={cn("absolute -z-10 w-64 h-64 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none -top-20 -right-20", step.accent)} />

      {/* floating emoji */}
      <span className="absolute top-4 right-5 text-2xl opacity-50 group-hover:opacity-100 group-hover:animate-wiggle transition-all">{step.emoji}</span>

      <div className="flex flex-col items-start gap-6">
        <div className="flex w-full items-start justify-between">
          <div className={cn("grid place-items-center rounded-2xl border-2 border-foreground shadow-pop-sm shrink-0 w-16 h-16 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300", step.accent, "text-foreground")}>
            <Icon size={28} strokeWidth={2.25} />
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-foreground text-background font-black text-xl rounded-[1rem] shadow-pop-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
            {step.num}
          </div>
        </div>
        <div className="mt-2 text-left">
          <h3 className="text-2xl sm:text-[1.75rem] leading-tight font-black text-foreground tracking-tight mb-3">{step.title}</h3>
          <p className="text-[15px] sm:text-[1.05rem] text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
        </div>
      </div>
    </article>
  );
};

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background pb-24 overflow-hidden relative">
      <PublicNav />

      {floatingEmojis.map((b, i) => (
        <span key={i} className={`fixed select-none pointer-events-none text-4xl ${b.anim} opacity-20 z-0`} style={{ top: b.top, left: b.left }}>{b.emoji}</span>
      ))}

      <div className="container mx-auto pt-16 pb-6 mt-16 md:mt-24 relative z-10">

        {/* header */}
        <FadeIn className="text-center mb-16 md:mb-24 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-6 animate-pulse-soft">
            🗺️ The Journey
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight text-foreground max-w-4xl text-balance">
            Five steps to{" "}
            <span className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl border-2 border-foreground shadow-pop inline-block -rotate-1 animate-wiggle">
              inner calm
            </span>.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
            From checking in with feelings to practicing social moments — everything happens in one safe space. Gentle support, delivered beautifully.
          </p>
          {/* step preview pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {steps.map((s) => (
              <span key={s.num} className={cn("px-3 py-1.5 rounded-full border-2 border-foreground text-xs font-black shadow-pop-sm hover:-translate-y-1 transition-all cursor-default", s.accent, "text-foreground")}>
                {s.emoji} {s.title}
              </span>
            ))}
          </div>
        </FadeIn>

        {/* roadmap */}
        <div className="w-full max-w-5xl mx-auto flex flex-col px-4 md:px-0">
          {steps.map((step, i) => {
            const isLeft = i % 2 === 0;
            const isLast = i === steps.length - 1;
            return (
              <React.Fragment key={step.num}>
                <div className={cn("w-full md:w-1/2 px-2 sm:px-4 lg:px-8 relative z-20", isLeft ? "md:mr-auto" : "md:ml-auto")}>
                  <StepCard step={step} Icon={step.icon} delay={i * 100} />
                </div>
                {!isLast && (
                  <>
                    <DesktopConnector fromSide={isLeft ? "left" : "right"} />
                    <MobileConnector fromSide={isLeft ? "left" : "right"} />
                  </>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* CTA */}
        <FadeIn className="mt-24 md:mt-32 text-center pb-12">
          <div className="bg-card border-2 border-foreground rounded-[2rem] shadow-pop p-10 max-w-lg mx-auto relative overflow-hidden">
            <div className="absolute top-3 right-5 text-3xl animate-float opacity-40">🚀</div>
            <div className="absolute bottom-3 left-5 text-2xl animate-bounce-slow opacity-40">🌟</div>
            <p className="text-lg text-muted-foreground font-semibold mb-6">Ready to find your calm space?</p>
            <a href="/app/feelings" className="group inline-flex items-center gap-3 bg-foreground text-background text-lg font-black px-10 py-5 rounded-2xl border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 active:translate-y-0 transition-all">
              Get Started <Rocket size={20} className="group-hover:rotate-12 group-hover:scale-110 transition-transform animate-bounce-slow" />
            </a>
          </div>
        </FadeIn>
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorks;
