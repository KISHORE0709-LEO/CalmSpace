import { Link, NavLink } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "How it Works" },
  { to: "/about", label: "About" },
];

export const PublicNav = () => {
  return (
    <header className="fixed top-4 left-0 right-0 z-50">
      <div className="container max-w-7xl flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 px-2 py-2 transition-transform hover:-translate-y-[2px]">
          <span className="w-8 h-8 rounded-full bg-primary border-2 border-foreground flex items-center justify-center shadow-pop-sm">
            <Heart className="w-4 h-4 text-primary-foreground" fill="currentColor" />
          </span>
          <span className="text-xl tracking-tight text-foreground font-semibold">CalmSpace</span>
        </Link>

        <nav className="hidden md:flex pill-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => `pill-nav-item ${isActive ? "bg-primary text-primary-foreground border-2 border-foreground shadow-pop-sm" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Button asChild size="sm" className="rounded-full px-6 h-11">
          <Link to="/app/feelings">Sign In</Link>
        </Button>
      </div>
    </header>
  );
};
