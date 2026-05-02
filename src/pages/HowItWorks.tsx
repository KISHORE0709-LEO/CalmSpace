import React from "react";
import { UserPlus, Smile, MessageCircle, LineChart, Sparkles, Rocket, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";

const steps = [
  {
    num: "01",
    icon: UserPlus,
    title: "Create a gentle profile",
    desc: "Tell us a little about likes, dislikes, and sensory preferences.",
    accent: "bg-primary",
  },
  {
    num: "02",
    icon: Smile,
    title: "Check in with feelings",
    desc: "Tap a feeling card. CalmSpace responds with comfort, not judgement.",
    accent: "bg-secondary",
  },
  {
    num: "03",
    icon: MessageCircle,
    title: "Talk to Mitra",
    desc: "An empathetic AI companion that listens and adapts to mood.",
    accent: "bg-accent",
  },
  {
    num: "04",
    icon: Sparkles,
    title: "Practice social moments",
    desc: "Safe scenarios build confidence at your own pace.",
    accent: "bg-primary",
  },
  {
    num: "05",
    icon: LineChart,
    title: "Caregivers stay close",
    desc: "See patterns, celebrate wins, and prepare for tough moments.",
    accent: "bg-secondary",
  },
];

const DesktopConnector = ({ fromSide }: { fromSide: "left" | "right" }) => {
  const isLeft = fromSide === "left";

  return (
    <div className="hidden md:block w-full h-28 lg:h-36 relative z-10 pointer-events-none">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <path
          d={isLeft
            ? "M 25,0 L 25,15 C 25,60 75,40 75,85 L 75,100"
            : "M 75,0 L 75,15 C 75,60 25,40 25,85 L 25,100"}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeDasharray="8 8"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="opacity-90 drop-shadow-sm"
        />
      </svg>
      <div
        className="absolute text-primary translate-x-[-50%] bottom-[-10px]"
        style={{ left: isLeft ? "75%" : "25%" }}
      >
        <ChevronDown size={32} strokeWidth={3.5} className="opacity-100" />
      </div>
    </div>
  );
};

const MobileConnector = ({ fromSide }: { fromSide: "left" | "right" }) => {
  const isLeft = fromSide === "left";

  return (
    <div className="block md:hidden w-full h-16 relative z-10 pointer-events-none">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <path
          d={isLeft
            ? "M 50,0 C 40,40 60,60 50,100"
            : "M 50,0 C 60,40 40,60 50,100"}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3.5"
          strokeDasharray="6 8"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="opacity-90 drop-shadow-sm"
        />
      </svg>
      <div className="absolute text-primary bottom-[-12px] left-[50%] -translate-x-1/2">
        <ChevronDown size={28} strokeWidth={3.5} className="opacity-100" />
      </div>
    </div>
  );
};

const StepCard = ({ step, Icon }: { step: { num: string; title: string; desc: string; accent: string }; Icon: React.ElementType }) => (
  <article className="group w-full max-w-sm md:max-w-none mx-auto bg-card border-2 border-foreground rounded-[2rem] p-6 lg:p-8 shadow-[4px_4px_0_0_hsl(0,0%,8%)] hover:shadow-[6px_6px_0_0_hsl(0,0%,8%)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden z-20 block">
    {/* Subtle background decoration */}
    <div className={cn(
      "absolute -z-10 w-64 h-64 rounded-full blur-3xl opacity-20 group-hover:opacity-45 transition-opacity duration-500 pointer-events-none",
      step.accent,
      "-top-20 -right-20"
    )} />

    <div className="flex flex-col items-start gap-6">
      <div className="flex w-full items-start justify-between">
        <div className={cn(
          "grid place-items-center rounded-2xl border-2 border-foreground shadow-[3px_3px_0_0_hsl(0,0%,8%)] group-hover:shadow-[5px_5px_0_0_hsl(0,0%,8%)] shrink-0 w-16 h-16 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
          step.accent,
          step.accent === 'bg-foreground' ? 'text-background' : 'text-foreground'
        )}>
          <Icon size={28} strokeWidth={2.25} />
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-foreground text-background font-black text-xl rounded-[1rem] shadow-pop-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
          {step.num}
        </div>
      </div>

      <div className="mt-2 text-left">
        <h3 className="text-2xl sm:text-[1.75rem] leading-tight font-black text-foreground tracking-tight mb-3">
          {step.title}
        </h3>
        <p className="text-[15px] sm:text-[1.05rem] text-muted-foreground leading-relaxed font-medium">
          {step.desc}
        </p>
      </div>
    </div>
  </article>
);


const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background pb-24 overflow-hidden">
      <PublicNav />
      <div className="container-tight mx-auto pt-16 pb-6 mt-16 md:mt-24">

        {/* ── Section header ─────────────────────────────────── */}
        <div className="text-center mb-16 md:mb-24 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight text-foreground max-w-4xl text-balance">
            Five steps to{" "}
            <span className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl border-2 border-foreground shadow-pop inline-block -rotate-1 hover:rotate-3 transition-transform duration-300">
              inner calm
            </span>
            .
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
            From checking in with feelings to practicing social moments — everything happens in one safe space. Gentle support, delivered beautifully.
          </p>
        </div>

        {/* ── Visual Roadmap ───────────────────────────────────── */}
        <div className="w-full max-w-5xl mx-auto flex flex-col px-4 md:px-0">
          {steps.map((step, i) => {
            const isLeft = i % 2 === 0;
            const isLast = i === steps.length - 1;

            return (
              <React.Fragment key={step.num}>
                {/* Card Container */}
                <div className={cn(
                  "w-full md:w-1/2 px-2 sm:px-4 lg:px-8 relative z-20",
                  isLeft ? "md:mr-auto" : "md:ml-auto"
                )}>
                  <StepCard step={step} Icon={step.icon} />
                </div>

                {/* Connectors */}
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

        {/* ── CTA ────────────────────────────────────────────── */}
        <div className="mt-24 md:mt-32 text-center pb-12">
          <p className="text-lg text-muted-foreground font-semibold mb-6">
            Ready to find your calm space?
          </p>
          <a
            href="/app/feelings"
            className="group inline-flex items-center gap-3 bg-foreground text-background text-lg font-black px-10 py-5 rounded-2xl border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 active:translate-y-0 transition-all"
          >
            Get Started <Rocket size={20} className="group-hover:rotate-12 group-hover:scale-110 transition-transform" />
          </a>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default HowItWorks;
