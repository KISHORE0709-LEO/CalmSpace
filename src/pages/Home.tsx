import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, LineChart, Sparkles, Heart, Shield, Users, CheckCircle2, MessageCircleHeart, Star, Baby, PersonStanding, Stethoscope, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";
import hero from "@/assets/hero-children.jpg";

const bubbles = [
  { emoji: "🌈", size: "text-4xl", top: "15%", left: "8%",  anim: "animate-float" },
  { emoji: "⭐", size: "text-3xl", top: "25%", left: "88%", anim: "animate-float-delay" },
  { emoji: "🦋", size: "text-3xl", top: "60%", left: "5%",  anim: "animate-bounce-slow" },
  { emoji: "🌸", size: "text-4xl", top: "70%", left: "90%", anim: "animate-float-slow" },
  { emoji: "🎈", size: "text-3xl", top: "40%", left: "92%", anim: "animate-float" },
  { emoji: "☁️", size: "text-5xl", top: "10%", left: "75%", anim: "animate-float-slow" },
  { emoji: "🌻", size: "text-3xl", top: "80%", left: "12%", anim: "animate-float-delay" },
  { emoji: "✨", size: "text-2xl", top: "50%", left: "3%",  anim: "animate-pulse-soft" },
];

const audiences = [
  { icon: Baby,           title: "Children & Teens",        text: "A safe, playful space to name feelings, calm down, and grow social skills at their own pace.",                color: "bg-primary text-primary-foreground",    emoji: "🧒" },
  { icon: PersonStanding, title: "Parents & Families",      text: "Stay connected to your child's emotional world with gentle insights and shared tools.",                      color: "bg-secondary text-secondary-foreground", emoji: "👨👩👧" },
  { icon: Stethoscope,    title: "Therapists & Caregivers", text: "Track progress, spot patterns, and get ahead of difficult moments with smart caregiver dashboards.",         color: "bg-accent text-accent-foreground",       emoji: "🩺" },
];

const features = [
  { icon: Heart,         title: "Emotion Check-In",          text: "Children tap how they feel right now. CalmSpace responds with personalised calming activities and comfort suggestions.", tag: "Core",       emoji: "💛" },
  { icon: Sparkles,      title: "Mitra — AI Companion",      text: "A warm, empathetic AI friend that listens without judgment and helps children find words for big feelings.",             tag: "AI-Powered", emoji: "🤖" },
  { icon: Users,         title: "Social Confidence Builder", text: "Step-by-step social scenarios — from saying hello to handling conflict — practiced safely before real life.",            tag: "Skills",     emoji: "🤝" },
  { icon: LineChart,     title: "Caregiver Dashboard",       text: "Beautiful mood timelines, trigger patterns, and milestone celebrations so caregivers always know how to help.",          tag: "Insights",   emoji: "📊" },
  { icon: Shield,        title: "Predictive Alerts",         text: "CalmSpace learns each child's patterns and quietly alerts caregivers before a difficult moment escalates.",              tag: "Smart",      emoji: "🛡️" },
  { icon: GraduationCap, title: "Daily Growth Check-ins",    text: "Tiny, fun daily questions that build self-awareness, gratitude, and emotional vocabulary over time.",                    tag: "Habits",     emoji: "🌱" },
];

const steps = [
  { num: "01", icon: Heart,         title: "Check in your feelings",      text: "Start each session by tapping an emotion. No words needed — just a tap.",      color: "bg-primary text-primary-foreground",    emoji: "💙" },
  { num: "02", icon: Sparkles,      title: "Talk to Mitra",               text: "Mitra listens, reflects, and gently guides with empathy and zero judgment.",    color: "bg-secondary text-secondary-foreground", emoji: "✨" },
  { num: "03", icon: GraduationCap, title: "Practice & grow",             text: "Try a calming activity, social scenario, or daily check-in to build skills.",  color: "bg-accent text-accent-foreground",       emoji: "🌱" },
  { num: "04", icon: LineChart,     title: "Caregivers stay in the loop", text: "Parents and therapists see progress, patterns, and wins — all in one place.", color: "bg-primary text-primary-foreground",    emoji: "📈" },
];

const testimonials = [
  { name: "Sarah M.",        role: "Parent of a 7-year-old",       text: "CalmSpace gave my daughter a way to express feelings she couldn't put into words. The change in just 3 weeks was remarkable.", stars: 5 },
  { name: "Dr. Priya K.",    role: "Child Therapist",              text: "I recommend CalmSpace to every family I work with. The caregiver dashboard saves hours of guesswork and helps me tailor sessions perfectly.", stars: 5 },
  { name: "James & Lena T.", role: "Parents of twins with autism", text: "Both our boys use Mitra every evening. It's become part of their routine and they actually look forward to it.", stars: 5 },
];

const rawStats = [
  { target: 12000, suffix: "+",   l: "Children supported",    sub: "across 40+ countries",     emoji: "🌍" },
  { target: 94,    suffix: "%",   l: "Caregiver satisfaction", sub: "in independent surveys",   emoji: "💚" },
  { target: 3,     suffix: ".2×", l: "Faster regulation",     sub: "vs. no intervention",      emoji: "⚡" },
  { target: 24,    suffix: "/7",  l: "Gentle support",        sub: "always there when needed", emoji: "🌙" },
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

function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(40px)", transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

function StatCard({ target, suffix, l, sub, emoji }: typeof rawStats[0]) {
  const { ref, inView } = useInView(0.3);
  const count = useCounter(target, 1800, inView);
  return (
    <div ref={ref} className="text-center group">
      <div className="text-4xl mb-2 animate-bounce-slow">{emoji}</div>
      <div className="text-4xl md:text-5xl font-black tracking-tight text-primary-foreground">
        {target === 12000 ? `${(count / 1000).toFixed(count >= 12000 ? 0 : 1)}k` : count}{suffix}
      </div>
      <div className="text-sm font-black mt-1 text-primary-foreground">{l}</div>
      <div className="text-xs font-medium opacity-60 mt-0.5 text-primary-foreground">{sub}</div>
    </div>
  );
}

const Home = () => {
  const [activeEmoji, setActiveEmoji] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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

        {bubbles.map((b, i) => {
          const speed = (i % 3 + 1) * 0.15 * (i % 2 === 0 ? 1 : -0.7);
          return (
            <div key={i} className="absolute z-10" style={{ top: b.top, left: b.left, transform: `translateY(${scrollY * speed}px)` }}>
              <span className={`block select-none cursor-pointer ${b.size} ${b.anim} hover:scale-150 transition-transform duration-200`}
                onClick={() => setActiveEmoji(b.emoji)}>
                {b.emoji}
              </span>
            </div>
          );
        })}

        {activeEmoji && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none" onAnimationEnd={() => setActiveEmoji(null)}>
            <span className="text-8xl animate-scale-in">{activeEmoji}</span>
          </div>
        )}

        <div className="container relative z-10 pb-24 flex flex-col items-center text-center">
          <h1 className="font-black tracking-tight animate-fade-up mb-10 text-center">
            <span className="block text-5xl md:text-7xl leading-[1.3] mb-6">
              Understanding{" "}
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-2xl border-2 border-foreground shadow-pop inline-block -rotate-1 animate-wiggle">feelings</span>.
            </span>
            <span className="block text-5xl md:text-7xl leading-[1.3]">
              <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-2xl border-2 border-foreground shadow-pop inline-block rotate-1 animate-bounce-slow">Supporting</span>{" "}
              every moment.
            </span>
          </h1>
          <div className="flex flex-wrap justify-center gap-3 animate-fade-up-delay-1">
            <Button asChild size="lg" className="rounded-2xl px-8 h-14 text-base font-black border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all">
              <Link to="/auth">Get Started <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-2xl px-8 h-14 text-base font-black bg-background/90 backdrop-blur border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all">
              <Link to="/how-it-works">See how it works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="bg-primary py-3 overflow-hidden">
        <div className="flex gap-8 animate-[marquee_18s_linear_infinite] whitespace-nowrap w-max">
          {["🌈 Emotions", "💛 Kindness", "🦋 Growth", "⭐ Confidence", "🌸 Calm", "🎈 Joy", "🌻 Strength", "✨ Progress",
            "🌈 Emotions", "💛 Kindness", "🦋 Growth", "⭐ Confidence", "🌸 Calm", "🎈 Joy", "🌻 Strength", "✨ Progress"].map((t, i) => (
            <span key={i} className="text-primary-foreground font-black text-sm px-4">{t}</span>
          ))}
        </div>
      </div>

      {/* ── Who it's for ── */}
      <section className="container pt-24 pb-24">
        <FadeIn className="text-center mb-14">
          <p className="text-sm font-black text-primary uppercase tracking-widest mb-3">Built for everyone who cares</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Who is CalmSpace for?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto font-medium leading-relaxed">
            Whether you're a child finding your words, a parent seeking connection, or a therapist tracking progress — CalmSpace meets you where you are.
          </p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {audiences.map((a, i) => (
            <FadeIn key={a.title} delay={i * 120}>
              <div className={`group rounded-[2rem] border-2 border-foreground shadow-pop p-8 hover:shadow-pop-lg hover:-translate-y-3 transition-all duration-300 cursor-pointer ${a.color}`}>
                <div className="text-5xl mb-4 group-hover:animate-bounce-slow">{a.emoji}</div>
                <div className="w-14 h-14 rounded-2xl border-2 border-foreground bg-background/20 flex items-center justify-center mb-5 shadow-pop-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                  <a.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black mb-3 tracking-tight">{a.title}</h3>
                <p className="text-sm leading-relaxed font-medium opacity-90">{a.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-card rounded-[3rem] mx-4 md:mx-8 py-24 px-6 md:px-16 mb-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
        <FadeIn className="text-center mb-14 relative z-10">
          <p className="text-sm font-black text-primary uppercase tracking-widest mb-3">Inside CalmSpace</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Everything in one calm space.</h2>
          <p className="text-muted-foreground max-w-lg mx-auto font-medium leading-relaxed">Six powerful tools working together to support emotional wellbeing every single day.</p>
        </FadeIn>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
          {features.map((f, i) => (
            <FadeIn key={f.title} delay={i * 100}>
              <div className="group bg-background border-2 border-foreground rounded-[1.5rem] p-6 shadow-pop hover:shadow-pop-lg hover:-translate-y-2 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl border-2 border-foreground bg-accent flex items-center justify-center shadow-pop-sm group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                      <f.icon className="w-5 h-5 text-foreground" />
                    </div>
                    <span className="text-2xl group-hover:animate-wiggle">{f.emoji}</span>
                  </div>
                  <span className="text-xs font-black bg-primary text-primary-foreground px-3 py-1 rounded-full border border-foreground">{f.tag}</span>
                </div>
                <h3 className="text-lg font-black mb-2 tracking-tight">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{f.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="container py-24">
        <FadeIn className="text-center mb-14">
          <p className="text-sm font-black text-primary uppercase tracking-widest mb-3">Simple by design</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">How CalmSpace works</h2>
          <p className="text-muted-foreground max-w-lg mx-auto font-medium leading-relaxed">Four gentle steps that fit naturally into any family's daily routine.</p>
        </FadeIn>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <FadeIn key={s.num} delay={i * 130}>
              <div className={`group rounded-[2rem] border-2 border-foreground shadow-pop p-7 h-full hover:shadow-pop-lg hover:-translate-y-2 transition-all duration-300 ${s.color}`}>
                <div className="text-5xl font-black opacity-15 mb-2 leading-none">{s.num}</div>
                <div className="text-4xl mb-3 group-hover:animate-bounce-slow">{s.emoji}</div>
                <div className="w-11 h-11 rounded-xl border-2 border-foreground bg-background/20 flex items-center justify-center mb-4 shadow-pop-sm group-hover:rotate-12 transition-transform duration-300">
                  <s.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black mb-2 tracking-tight">{s.title}</h3>
                <p className="text-sm leading-relaxed font-medium opacity-90">{s.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-primary rounded-[3rem] mx-4 md:mx-8 py-20 px-6 md:px-16 mb-8 relative overflow-hidden">
        <div className="absolute top-4 right-8 text-6xl animate-spin-slow opacity-20 pointer-events-none">⭐</div>
        <div className="absolute bottom-4 left-8 text-5xl animate-float opacity-20 pointer-events-none">🌈</div>
        <FadeIn className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-primary-foreground mb-2">Trusted by thousands of families</h2>
          <p className="text-primary-foreground/70 font-medium">Real results from real families around the world.</p>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {rawStats.map((s) => <StatCard key={s.l} {...s} />)}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="container py-24">
        <FadeIn className="text-center mb-14">
          <p className="text-sm font-black text-primary uppercase tracking-widest mb-3">Real stories</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Families love CalmSpace 💛</h2>
          <p className="text-muted-foreground max-w-lg mx-auto font-medium leading-relaxed">Hear from the parents, therapists, and caregivers who use CalmSpace every day.</p>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeIn key={t.name} delay={i * 120}>
              <div className="bg-card border-2 border-foreground rounded-[2rem] p-8 shadow-pop hover:shadow-pop-lg hover:-translate-y-2 transition-all duration-300 flex flex-col h-full">
                <Quote className="w-8 h-8 text-primary mb-4 opacity-60 animate-pulse-soft" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-secondary text-secondary animate-pulse-soft" style={{ animationDelay: `${i * 0.15}s` }} />
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
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── What's included ── */}
      <section className="bg-card rounded-[3rem] mx-4 md:mx-8 py-24 px-6 md:px-16 mb-8 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary/10 rounded-full blur-2xl animate-pulse-soft pointer-events-none" />
        <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
          <FadeIn>
            <p className="text-sm font-black text-primary uppercase tracking-widest mb-3">Everything included</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">No hidden extras.<br />No complexity.</h2>
            <p className="text-muted-foreground font-medium mb-8 leading-relaxed">Every CalmSpace account comes with the full suite of tools — no tiers, no paywalls on core features.</p>
            <ul className="space-y-3">
              {[
                { text: "Emotion check-ins & calming activities", emoji: "💛" },
                { text: "Mitra AI companion (unlimited chats)",    emoji: "🤖" },
                { text: "Social confidence scenarios",             emoji: "🤝" },
                { text: "Caregiver dashboard & mood timeline",     emoji: "📊" },
                { text: "Predictive alerts & pattern insights",    emoji: "🛡️" },
                { text: "Daily growth check-ins",                  emoji: "🌱" },
                { text: "Multi-child family profiles",             emoji: "👨👩👧" },
                { text: "Therapist collaboration mode",            emoji: "🩺" },
              ].map((item, i) => (
                <FadeIn key={item.text} delay={i * 60}>
                  <li className="flex items-center gap-3 group">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 group-hover:scale-125 transition-transform" />
                    <span className="font-medium text-sm">{item.text}</span>
                    <span className="ml-auto text-lg group-hover:animate-wiggle">{item.emoji}</span>
                  </li>
                </FadeIn>
              ))}
            </ul>
          </FadeIn>
          <FadeIn delay={200}>
            <div className="rounded-[2rem] bg-primary text-primary-foreground border-2 border-foreground shadow-pop-lg p-10 text-center relative overflow-hidden">
              <div className="absolute top-3 right-4 text-3xl animate-float opacity-40">🌟</div>
              <div className="absolute bottom-3 left-4 text-2xl animate-bounce-slow opacity-40">🎈</div>
              <MessageCircleHeart className="w-16 h-16 mx-auto mb-5 opacity-80 animate-pulse-soft" />
              <h3 className="text-2xl font-black mb-3">Start free today</h3>
              <p className="text-primary-foreground/80 font-medium mb-8 text-sm leading-relaxed">No credit card required. Set up your family's calm space in under 2 minutes.</p>
              <Button asChild size="lg" variant="secondary" className="rounded-2xl px-7 h-12 bg-background text-foreground hover:bg-background/90 border-2 border-foreground shadow-pop font-black hover:shadow-pop-lg hover:-translate-y-1 transition-all w-full">
                <Link to="/app/feelings">Create your free space <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="container py-24">
        <FadeIn>
          <div className="rounded-[2rem] bg-secondary text-secondary-foreground border-2 border-foreground shadow-pop-lg p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-4 left-8 text-4xl animate-float opacity-30">🌈</div>
            <div className="absolute top-4 right-8 text-3xl animate-bounce-slow opacity-30">⭐</div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-3xl animate-float-slow opacity-30">🦋</div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 relative z-10">Ready to bring calm to your day? 🌸</h2>
            <p className="text-secondary-foreground/80 mb-10 max-w-xl mx-auto font-medium leading-relaxed relative z-10">
              Join thousands of families finding gentler routines, deeper understanding, and brighter moments — every day.
            </p>
            <div className="flex flex-wrap justify-center gap-3 relative z-10">
              <Button asChild size="lg" className="rounded-2xl px-8 h-14 text-base font-black border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all">
                <Link to="/auth">Get Started Free <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl px-8 h-14 text-base font-black bg-background/80 border-2 border-foreground shadow-pop hover:shadow-pop-lg hover:-translate-y-1 transition-all">
                <Link to="/how-it-works">Learn more</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
