import { Link } from "react-router-dom";
import { ArrowRight, Brain, HandHeart, GraduationCap, LineChart, Sparkles, Heart, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import hero from "@/assets/hero-children.jpg";

const problems = [
  { icon: Brain, title: "Sensory overwhelm", text: "Loud spaces and bright lights can quickly become too much to handle." },
  { icon: HandHeart, title: "Hard to express feelings", text: "Words don't always come easily when emotions feel big and tangled." },
  { icon: Users, title: "Social uncertainty", text: "New situations and conversations can feel unpredictable and stressful." },
];

const flow = [
  { icon: Brain, label: "Understand", color: "bg-primary-soft text-primary" },
  { icon: HandHeart, label: "Support", color: "bg-accent-soft text-accent-foreground" },
  { icon: GraduationCap, label: "Teach", color: "bg-primary-soft text-primary" },
  { icon: LineChart, label: "Track", color: "bg-accent-soft text-accent-foreground" },
  { icon: Sparkles, label: "Predict", color: "bg-primary-soft text-primary" },
];

const features = [
  { icon: Heart, title: "Feelings & Comfort", text: "Real-time emotion check with calming environment suggestions." },
  { icon: Sparkles, title: "Mitra Companion", text: "A gentle AI friend that listens and replies with empathy." },
  { icon: Users, title: "Social Practice", text: "Safe scenarios that build confidence step by step." },
  { icon: LineChart, title: "Caregiver Insights", text: "Beautiful timelines of mood, triggers, and wins." },
  { icon: Shield, title: "Smart Alerts", text: "Predict difficult moments before they escalate." },
  { icon: GraduationCap, title: "Daily Check-ins", text: "Tiny questions that build big self-awareness." },
];

const stats = [
  { v: "12k+", l: "Children supported" },
  { v: "94%", l: "Caregiver satisfaction" },
  { v: "3.2x", l: "Faster regulation" },
  { v: "24/7", l: "Gentle support" },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-60">
          <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-accent-soft blur-3xl" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 rounded-full bg-primary-soft blur-3xl" />
        </div>
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent-foreground text-xs font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Built with care for autistic minds
            </span>
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.05] mb-5">
              Understanding feelings.
              <span className="block text-primary">Supporting every moment.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">
              CalmSpace is a gentle companion that helps children, families, and caregivers
              navigate emotions, build social confidence, and feel safe — together.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7 h-12">
                <Link to="/app/feelings">Get Started <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-7 h-12 bg-card">
                <Link to="/how-it-works">See how it works</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-warm rounded-[2.5rem] -rotate-2 opacity-70" />
            <img
              src={hero}
              alt="Happy children playing together in a sunny meadow"
              width={1536}
              height={1024}
              className="relative rounded-[2rem] shadow-soft border border-border w-full"
            />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="container py-20">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-medium text-primary mb-2">The challenge</p>
          <h2 className="text-3xl md:text-4xl">Big emotions deserve gentle tools.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {problems.map((p) => (
            <div key={p.title} className="calm-card">
              <div className="w-11 h-11 rounded-xl bg-primary-soft flex items-center justify-center mb-4">
                <p.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution flow */}
      <section className="bg-card border-y border-border py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-sm font-medium text-primary mb-2">How CalmSpace helps</p>
            <h2 className="text-3xl md:text-4xl">A calm path from feeling to flourishing.</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            {flow.map((s, i) => (
              <div key={s.label} className="flex items-center gap-3 md:gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-7 h-7 md:w-8 md:h-8" />
                  </div>
                  <span className="font-medium text-sm">{s.label}</span>
                </div>
                {i < flow.length - 1 && <ArrowRight className="w-5 h-5 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature preview */}
      <section className="container py-20">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-medium text-primary mb-2">Inside the dashboard</p>
          <h2 className="text-3xl md:text-4xl">Everything in one calm space.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="calm-card group">
              <div className="w-11 h-11 rounded-xl bg-accent-soft flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
                <f.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container pb-20">
        <div className="rounded-3xl bg-gradient-warm p-10 md:p-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.l}>
                <div className="text-4xl md:text-5xl font-bold text-foreground">{s.v}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl mb-4">Ready to bring calm to your day?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join families finding gentler routines, deeper understanding, and brighter moments.
          </p>
          <Button asChild size="lg" variant="secondary" className="rounded-full px-7 h-12 bg-card text-foreground hover:bg-card/90">
            <Link to="/app/feelings">Start your free space <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
