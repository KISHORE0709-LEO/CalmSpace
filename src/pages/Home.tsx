import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, LineChart, Sparkles, Heart, Shield, Users, CheckCircle2, MessageCircleHeart, Star, Baby, PersonStanding, Stethoscope, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import hero from "@/assets/hero-children.jpg";

const audiences = [
  { icon: Baby, title: "Children & Teens", text: "A safe, playful space to name feelings, calm down, and grow social skills at their own pace.", color: "bg-primary text-primary-foreground" },
  { icon: PersonStanding, title: "Parents & Families", text: "Stay connected to your child's emotional world with gentle insights and shared tools.", color: "bg-secondary text-secondary-foreground" },
  { icon: Stethoscope, title: "Therapists & Caregivers", text: "Track progress, spot patterns, and get ahead of difficult moments with smart caregiver dashboards.", color: "bg-accent text-accent-foreground" },
];

const features = [
  { icon: Heart, title: "Emotion Check-In", text: "Children tap how they feel right now. CalmSpace responds with personalised calming activities, breathing exercises, and comfort suggestions tailored to their mood.", tag: "Core" },
  { icon: Sparkles, title: "Mitra — AI Companion", text: "A warm, empathetic AI friend that listens without judgment, asks gentle questions, and helps children find words for big feelings.", tag: "AI-Powered" },
  { icon: Users, title: "Social Confidence Builder", text: "Step-by-step social scenarios — from saying hello to handling conflict — practiced safely before real life.", tag: "Skills" },
  { icon: LineChart, title: "Caregiver Dashboard", text: "Beautiful mood timelines, trigger patterns, and milestone celebrations so caregivers always know how to help.", tag: "Insights" },
  { icon: Shield, title: "Predictive Alerts", text: "CalmSpace learns each child's patterns and quietly alerts caregivers before a meltdown or difficult moment escalates.", tag: "Smart" },
  { icon: GraduationCap, title: "Daily Growth Check-ins", text: "Tiny, fun daily questions that build self-awareness, gratitude, and emotional vocabulary over time.", tag: "Habits" },
];

const steps = [
  { num: "01", icon: Heart, title: "Check in your feelings", text: "Start each session by tapping an emotion. No words needed — just a tap.", color: "bg-primary text-primary-foreground" },
  { num: "02", icon: Sparkles, title: "Talk to Mitra", text: "Mitra listens, reflects, and gently guides with empathy and zero judgment.", color: "bg-secondary text-secondary-foreground" },
  { num: "03", icon: GraduationCap, title: "Practice & grow", text: "Try a calming activity, social scenario, or daily check-in to build skills.", color: "bg-accent text-accent-foreground" },
  { num: "04", icon: LineChart, title: "Caregivers stay in the loop", text: "Parents and therapists see progress, patterns, and wins — all in one place.", color: "bg-primary text-primary-foreground" },
];

const testimonials = [
  { name: "Sarah M.", role: "Parent of a 7-year-old", text: "CalmSpace gave my daughter a way to express feelings she couldn't put into words. The change in just 3 weeks was remarkable.", stars: 5 },
  { name: "Dr. Priya K.", role: "Child Therapist", text: "I recommend CalmSpace to every family I work with. The caregiver dashboard saves hours of guesswork and helps me tailor sessions perfectly.", stars: 5 },
  { name: "James & Lena T.", role: "Parents of twins with autism", text: "Both our boys use Mitra every evening. It's become part of their routine and they actually look forward to it.", stars: 5 },
];

const stats = [
  { v: "12k+", l: "Children supported", sub: "across 40+ countries" },
  { v: "94%", l: "Caregiver satisfaction", sub: "in independent surveys" },
  { v: "3.2×", l: "Faster regulation", sub: "vs. no intervention" },
  { v: "24/7", l: "Gentle support", sub: "always there when needed" },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <img
          src={hero}
          alt="Joyful diverse children playing in a sunny meadow with rainbow and balloons"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-background/20" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        <div className="container relative z-10 pt-0 pb-24 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-black leading-[1.02] mb-6 tracking-tight max-w-4xl">
            Understanding <span className="bg-primary text-primary-foreground px-3 py-1 rounded-2xl border-2 border-foreground shadow-pop inline-block -rotate-1">feelings</span>.
            <span className="block mt-2">Supporting every <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-2xl border-2 border-foreground shadow-pop inline-block rotate-1">moment</span>.</span>
          </h1>
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

      {/* ── Who it's for ── */}
      <section className="container pt-24 pb-24">
        <div className="text-center mb-14">
          <p className="text-sm font-black text-primary uppercase tracking-widest mb-3">Built for everyone who cares</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Who is CalmSpace for?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto font-medium leading-relaxed">
            Whether you're a child finding your words, a parent seeking connection, or a therapist tracking progress — CalmSpace meets you where you are.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {audiences.map((a) => (
            <div key={a.title} className={`group rounded-[2rem] border-2 border-foreground shadow-pop p-8 hover:shadow-pop-lg hover:-translate-y-2 transition-all duration-300 ${a.color}`}>
              <div className="w-14 h-14 rounded-2xl border-2 border-foreground bg-background/20 flex items-center justify-center mb-5 shadow-pop-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                <a.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black mb-3 tracking-tight">{a.title}</h3>
              <p className="text-sm leading-relaxed font-medium opacity-90">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-card rounded-[3rem] mx-4 md:mx-8 py-24 px-6 md:px-16 mb-8">
        <div className="text-center mb-14">
          <p className="text-sm font-black text-primary uppercase tracking-widest mb-3">Inside CalmSpace</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Everything in one calm space.</h2>
          <p className="text-muted-foreground max-w-lg mx-auto font-medium leading-relaxed">
            Six powerful tools working together to support emotional wellbeing every single day.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="group bg-background border-2 border-foreground rounded-[1.5rem] p-6 shadow-pop hover:shadow-pop-lg hover:-translate-y-2 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl border-2 border-foreground bg-accent flex items-center justify-center shadow-pop-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                  <f.icon className="w-5 h-5 text-foreground" />
                </div>
                <span className="text-xs font-black bg-primary text-primary-foreground px-3 py-1 rounded-full border border-foreground">{f.tag}</span>
              </div>
              <h3 className="text-lg font-black mb-2 tracking-tight">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="container py-24">
        <div className="text-center mb-14">
          <p className="text-sm font-black text-primary uppercase tracking-widest mb-3">Simple by design</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">How CalmSpace works</h2>
          <p className="text-muted-foreground max-w-lg mx-auto font-medium leading-relaxed">
            Four gentle steps that fit naturally into any family's daily routine.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => (
            <div key={s.num} className={`rounded-[2rem] border-2 border-foreground shadow-pop p-7 h-full ${s.color}`}>
              <div className="text-5xl font-black opacity-15 mb-3 leading-none">{s.num}</div>
              <div className="w-11 h-11 rounded-xl border-2 border-foreground bg-background/20 flex items-center justify-center mb-4 shadow-pop-sm">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black mb-2 tracking-tight">{s.title}</h3>
              <p className="text-sm leading-relaxed font-medium opacity-90">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-primary rounded-[3rem] mx-4 md:mx-8 py-20 px-6 md:px-16 mb-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-primary-foreground mb-2">Trusted by thousands of families</h2>
          <p className="text-primary-foreground/70 font-medium">Real results from real families around the world.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-4xl md:text-5xl font-black tracking-tight text-primary-foreground">{s.v}</div>
              <div className="text-sm font-black mt-1 text-primary-foreground">{s.l}</div>
              <div className="text-xs font-medium opacity-60 mt-0.5 text-primary-foreground">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="container py-24">
        <div className="text-center mb-14">
          <p className="text-sm font-black text-primary uppercase tracking-widest mb-3">Real stories</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Families love CalmSpace</h2>
          <p className="text-muted-foreground max-w-lg mx-auto font-medium leading-relaxed">
            Hear from the parents, therapists, and caregivers who use CalmSpace every day.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-card border-2 border-foreground rounded-[2rem] p-8 shadow-pop hover:shadow-pop-lg hover:-translate-y-2 transition-all duration-300 flex flex-col">
              <Quote className="w-8 h-8 text-primary mb-4 opacity-60" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                ))}
              </div>
              <p className="text-sm leading-relaxed font-medium text-foreground mb-6 flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary border-2 border-foreground flex items-center justify-center shadow-pop-sm flex-shrink-0">
                  <span className="text-primary-foreground font-black text-sm">{t.name[0]}</span>
                </div>
                <div>
                  <div className="font-black text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground font-medium">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What's included ── */}
      <section className="bg-card rounded-[3rem] mx-4 md:mx-8 py-24 px-6 md:px-16 mb-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-black text-primary uppercase tracking-widest mb-3">Everything included</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">No hidden extras.<br />No complexity.</h2>
            <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
              Every CalmSpace account comes with the full suite of tools — no tiers, no paywalls on core features.
            </p>
            <ul className="space-y-3">
              {[
                "Emotion check-ins & calming activities",
                "Mitra AI companion (unlimited chats)",
                "Social confidence scenarios",
                "Caregiver dashboard & mood timeline",
                "Predictive alerts & pattern insights",
                "Daily growth check-ins",
                "Multi-child family profiles",
                "Therapist collaboration mode",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-medium text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[2rem] bg-primary text-primary-foreground border-2 border-foreground shadow-pop-lg p-10 text-center">
            <MessageCircleHeart className="w-16 h-16 mx-auto mb-5 opacity-80" />
            <h3 className="text-2xl font-black mb-3">Start free today</h3>
            <p className="text-primary-foreground/80 font-medium mb-8 text-sm leading-relaxed">
              No credit card required. Set up your family's calm space in under 2 minutes.
            </p>
            <Button asChild size="lg" variant="secondary" className="rounded-2xl px-7 h-12 bg-background text-foreground hover:bg-background/90 border-2 border-foreground shadow-pop font-black hover:shadow-pop-lg hover:-translate-y-1 transition-all w-full">
              <Link to="/app/feelings">Create your free space <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="container py-24">
        <div className="rounded-[2rem] bg-secondary text-secondary-foreground border-2 border-foreground shadow-pop-lg p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Ready to bring calm to your day?</h2>
          <p className="text-secondary-foreground/80 mb-10 max-w-xl mx-auto font-medium leading-relaxed">
            Join thousands of families finding gentler routines, deeper understanding, and brighter moments — every day.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-2xl px-8 h-14 text-base font-black border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all">
              <Link to="/app/feelings">Get Started Free <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl px-8 h-14 text-base font-black bg-background/80 border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all">
              <Link to="/how-it-works">Learn more</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
