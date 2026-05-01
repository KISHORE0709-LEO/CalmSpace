import { Heart, Users, Sparkles } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";

const About = () => (
  <div className="min-h-screen bg-background">
    <PublicNav />
    <section className="pt-32 pb-12 bg-gradient-hero">
      <div className="container max-w-3xl text-center">
        <p className="text-sm font-medium text-primary mb-3">About CalmSpace</p>
        <h1 className="text-4xl md:text-5xl mb-4">Built with empathy. Designed for everyone.</h1>
        <p className="text-muted-foreground text-lg">
          We believe every child deserves a space where their feelings are seen,
          their pace is respected, and their growth is gently celebrated.
        </p>
      </div>
    </section>
    <section className="container py-16 grid md:grid-cols-3 gap-6">
      {[
        { icon: Heart, t: "Our purpose", d: "To turn overwhelming moments into manageable ones — through tools that listen first." },
        { icon: Users, t: "Who we help", d: "Autistic children, parents, caregivers, and educators looking for kinder routines." },
        { icon: Sparkles, t: "Our vision", d: "A world where neurodivergent minds thrive with the right support, every single day." },
      ].map((b) => (
        <div key={b.t} className="calm-card">
          <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center mb-4">
            <b.icon className="w-5 h-5 text-accent-foreground" />
          </div>
          <h3 className="text-lg mb-2">{b.t}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{b.d}</p>
        </div>
      ))}
    </section>
    <Footer />
  </div>
);

export default About;
