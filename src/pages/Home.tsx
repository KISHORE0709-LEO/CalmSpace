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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden mb-0">
        <img
          src={hero}
          alt="Joyful diverse children playing in a sunny meadow with rainbow and balloons"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover opacity-100"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-background/20" />
        {/* Bottom blend into next section */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="container relative z-10 pt-32 pb-10 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-black leading-[1.02] mb-6 tracking-tight max-w-4xl">
            Understanding <span className="bg-primary text-primary-foreground px-3 py-1 rounded-2xl border-2 border-foreground shadow-pop inline-block -rotate-1">feelings</span>.
            <span className="block mt-2">Supporting every <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-2xl border-2 border-foreground shadow-pop inline-block rotate-1">moment</span>.</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground max-w-2xl mb-8 leading-relaxed font-semibold">
            CalmSpace is a gentle, joyful companion that helps children, families,
            and caregivers navigate emotions, build social confidence, and feel safe — together.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-2xl px-8 h-14 text-base font-black border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all">
              <Link to="/app/feelings">Get Started <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl px-8 h-14 text-base font-black bg-background/90 backdrop-blur border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all">
              <Link to="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>
      </section>


      {/* Feature preview */}
      <section className="container mt-0 pt-10 pb-20">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-black text-primary mb-2 uppercase tracking-widest">Inside the dashboard</p>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">Everything in one calm space.</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="group bg-card border-2 border-foreground rounded-[1.5rem] p-6 shadow-pop hover:shadow-pop-lg hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 rounded-2xl border-2 border-foreground bg-accent flex items-center justify-center mb-4 shadow-pop-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                <f.icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="text-lg font-black mb-2 tracking-tight">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="container pb-20">
        <div className="rounded-[2rem] bg-card border-2 border-foreground shadow-pop p-10 md:p-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.l}>
                <div className="text-4xl md:text-5xl font-black text-foreground tracking-tight">{s.v}</div>
                <div className="text-sm font-medium text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-24">
        <div className="rounded-[2rem] bg-primary text-primary-foreground border-2 border-foreground shadow-pop-lg p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Ready to bring calm to your day?</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto font-medium">
            Join families finding gentler routines, deeper understanding, and brighter moments.
          </p>
          <Button asChild size="lg" variant="secondary" className="rounded-2xl px-7 h-12 bg-card text-foreground hover:bg-card/90 border-2 border-foreground shadow-pop font-black hover:shadow-pop-lg hover:-translate-y-1 transition-all">
            <Link to="/app/feelings">Start your free space <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
