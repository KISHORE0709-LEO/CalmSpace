import { UserPlus, Smile, MessageCircle, LineChart, Sparkles } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";

const steps = [
  { icon: UserPlus, title: "Create a gentle profile", text: "Tell us a little about likes, dislikes, and sensory preferences." },
  { icon: Smile, title: "Check in with feelings", text: "Tap a feeling card. CalmSpace responds with comfort, not judgement." },
  { icon: MessageCircle, title: "Talk to Mitra", text: "An empathetic AI companion that listens and adapts to mood." },
  { icon: Sparkles, title: "Practice social moments", text: "Safe scenarios build confidence at your own pace." },
  { icon: LineChart, title: "Caregivers stay close", text: "See patterns, celebrate wins, and prepare for tough moments." },
];

const HowItWorks = () => (
  <div className="min-h-screen bg-background">
    <PublicNav />
    <section className="pt-32 pb-12 bg-gradient-hero">
      <div className="container max-w-3xl text-center">
        <p className="text-sm font-medium text-primary mb-3">How it works</p>
        <h1 className="text-4xl md:text-5xl mb-4">Simple steps. Real support.</h1>
        <p className="text-muted-foreground text-lg">A few gentle taps is all it takes to feel understood.</p>
      </div>
    </section>
    <section className="container py-16">
      <div className="max-w-3xl mx-auto space-y-5">
        {steps.map((s, i) => (
          <div key={s.title} className="calm-card flex items-start gap-5">
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center">
              <s.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-xs font-semibold text-accent-foreground bg-accent-soft inline-block px-2 py-0.5 rounded-full mb-2">
                Step {i + 1}
              </div>
              <h3 className="text-xl mb-1">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
    <Footer />
  </div>
);

export default HowItWorks;
