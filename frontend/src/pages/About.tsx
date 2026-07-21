import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Github, Linkedin, Globe, Twitter, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";

const team = [
  {
    name: "M KISHORE",
    role: "Developer",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=transparent",
    socials: { github: "https://github.com/KISHORE0709-LEO", linkedin: "https://www.linkedin.com/in/m-kishore-417b8b193/", portfolio: "https://portfolio-gray-delta-20.vercel.app/", twitter: "https://x.com/Kishore_0709", email: "kishoremurali0726@gmail.com" },
    accent: "bg-primary", emoji: "💙",
  },
  {
    name: "CH V SNEHA",
    role: "Developer",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Mia&backgroundColor=transparent",
    socials: { github: "https://github.com/chv-sneha", linkedin: "https://www.linkedin.com/in/ch-v-sneha-6ba7792a0/", portfolio: "https://sneha-s-digital-canvas.vercel.app/", twitter: "https://x.com/chvsneha2310", email: "chvsneha2310@gmail.com" },
    accent: "bg-secondary", emoji: "✨",
  },
];

const floatingEmojis = [
  { emoji: "💙", top: "10%", left: "5%",  anim: "animate-float" },
  { emoji: "✨", top: "20%", left: "92%", anim: "animate-float-delay" },
  { emoji: "🌸", top: "70%", left: "3%",  anim: "animate-bounce-slow" },
  { emoji: "🌈", top: "80%", left: "90%", anim: "animate-float-slow" },
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

const About = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      setTimeout(() => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <PublicNav />

      {/* floating bg emojis */}
      {floatingEmojis.map((b, i) => (
        <span key={i} className={`fixed select-none pointer-events-none text-4xl ${b.anim} opacity-20 z-0`} style={{ top: b.top, left: b.left }}>{b.emoji}</span>
      ))}

      <div className="container mx-auto pt-24 mt-16 md:mt-20 space-y-32 pb-32 relative z-10">

        

        {/* ── TEAM ── */}
        <section id="team" className="scroll-mt-32">
          <FadeIn className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-4">
              👥 The Team
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">Meet the Developers</h2>
            <p className="text-xl text-muted-foreground font-medium">The engineers behind the platform.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <FadeIn key={index} delay={index * 150}>
                <article className="group bg-card border-2 border-foreground rounded-[2rem] p-10 md:p-14 shadow-pop hover:shadow-pop-lg hover:-translate-y-3 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden">
                  {/* bg blob */}
                  <div className={cn("absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none", member.accent)} />

                  {/* floating emoji */}
                  <span className="absolute top-4 right-6 text-3xl animate-float opacity-60">{member.emoji}</span>

                  <div className="relative mb-8">
                    <div className={cn("w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-foreground shadow-pop overflow-hidden grid place-items-center group-hover:scale-105 transition-transform duration-300", member.accent)}>
                      <img src={member.avatar} alt={member.name} className="w-[120%] h-[120%] object-cover group-hover:scale-110 transition-transform duration-300 translate-y-2" />
                    </div>
                    {/* pulse ring */}
                    <div className={cn("absolute inset-0 rounded-full border-4 border-foreground opacity-0 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500", member.accent)} />
                  </div>

                  <h3 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{member.name}</h3>
                  <p className="text-base md:text-lg font-bold text-muted-foreground mt-2 mb-8 uppercase tracking-widest">{member.role}</p>

                  <div className="flex flex-wrap justify-center gap-4 lg:gap-5 mt-auto">
                    {[
                      { href: member.socials.github,    Icon: Github,   label: "GitHub" },
                      { href: member.socials.linkedin,  Icon: Linkedin, label: "LinkedIn" },
                      { href: member.socials.portfolio, Icon: Globe,    label: "Portfolio" },
                      { href: member.socials.twitter,   Icon: Twitter,  label: "Twitter" },
                      { href: `https://mail.google.com/mail/?view=cm&fs=1&to=${member.socials.email}`, Icon: Mail, label: "Email" },
                    ].map(({ href, Icon, label }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-foreground bg-background shadow-pop-sm flex items-center justify-center hover:-translate-y-2 hover:shadow-pop hover:bg-primary hover:text-primary-foreground transition-all duration-200 text-foreground">
                        <Icon size={22} strokeWidth={2.5} />
                      </a>
                    ))}
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default About;
