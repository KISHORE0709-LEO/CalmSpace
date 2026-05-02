import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Github, Linkedin, Globe, Twitter, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";

const team = [
  {
    name: "M KISHORE",
    role: "Full Stack Developer",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=transparent",
    socials: { github: "https://github.com/KISHORE0709-LEO", linkedin: "https://www.linkedin.com/in/m-kishore-417b8b193/", portfolio: "https://portfolio-gray-delta-20.vercel.app/", twitter: "https://x.com/Kishore_0709", email: "kishoremurali0726@gmail.com" },
    accent: "bg-primary"
  },
  {
    name: "CH V SNEHA",
    role: "AI/ML Enthusiast",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Mia&backgroundColor=transparent",
    socials: { github: "https://github.com/chv-sneha", linkedin: "https://www.linkedin.com/in/ch-v-sneha-6ba7792a0/", portfolio: "https://sneha-s-digital-canvas.vercel.app/", twitter: "https://x.com/chvsneha2310", email: "chvsneha2310@gmail.com" },
    accent: "bg-secondary"
  }
];



const About = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <div className="container-tight mx-auto pt-24 mt-16 md:mt-20 space-y-32 pb-32">

        {/* ── MISSION SECTION ─────────────────────────────────── */}
        <section id="mission" className="scroll-mt-32 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-tight text-foreground text-balance">
            Understanding <span className="bg-primary text-primary-foreground px-4 py-1 rounded-2xl border-2 border-foreground shadow-pop inline-block -rotate-1">feelings</span>. Supporting every <span className="bg-secondary text-secondary-foreground px-4 py-1 rounded-2xl border-2 border-foreground shadow-pop inline-block rotate-2">moment</span>.
          </h1>
          <p className="mt-8 text-xl text-muted-foreground font-medium leading-relaxed">
            CalmSpace is a gentle, joyful companion that helps children, families, and caregivers navigate emotions, build social confidence, and feel safe — together. We provide a centralized dashboard for real-time emotion checking, AI companionship, and caregiver insights.
          </p>
        </section>

        {/* ── TEAM SECTION ───────────────────────────────────── */}
        <section id="team" className="scroll-mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
              Meet the Developers
            </h2>
            <p className="text-xl text-muted-foreground font-medium">The engineers behind the platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <article
                key={index}
                className="group bg-card border-2 border-foreground rounded-[2rem] p-10 md:p-14 shadow-pop hover:shadow-pop-lg hover:-translate-y-2 transition-all duration-300 flex flex-col items-center text-center"
              >
                {/* Avatar Size */}
                <div className="relative mb-8">
                  <div className={cn("w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-foreground shadow-pop-sm overflow-hidden grid place-items-center", member.accent)}>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-[120%] h-[120%] object-cover group-hover:scale-110 transition-transform duration-300 translate-y-2"
                    />
                  </div>
                </div>

                <h3 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{member.name}</h3>
                <p className="text-base md:text-lg font-bold text-muted-foreground mt-2 mb-8 uppercase tracking-widest">{member.role}</p>

                <div className="flex flex-wrap justify-center gap-4 lg:gap-5 mt-auto">
                  <a href={member.socials.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-foreground bg-background shadow-pop-sm flex items-center justify-center hover:-translate-y-1 hover:shadow-pop transition-all text-foreground">
                    <Github size={24} strokeWidth={2.5} />
                  </a>
                  <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-foreground bg-background shadow-pop-sm flex items-center justify-center hover:-translate-y-1 hover:shadow-pop transition-all text-foreground">
                    <Linkedin size={24} strokeWidth={2.5} />
                  </a>
                  <a href={member.socials.portfolio} target="_blank" rel="noopener noreferrer" aria-label="Portfolio" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-foreground bg-background shadow-pop-sm flex items-center justify-center hover:-translate-y-1 hover:shadow-pop transition-all text-foreground">
                    <Globe size={24} strokeWidth={2.5} />
                  </a>
                  <a href={member.socials.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-foreground bg-background shadow-pop-sm flex items-center justify-center hover:-translate-y-1 hover:shadow-pop transition-all text-foreground">
                    <Twitter size={24} strokeWidth={2.5} />
                  </a>
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${member.socials.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Email"
                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-foreground bg-background shadow-pop-sm flex items-center justify-center hover:-translate-y-1 hover:shadow-pop transition-all text-foreground"
                  >
                    <Mail size={24} strokeWidth={2.5} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
};

export default About;
