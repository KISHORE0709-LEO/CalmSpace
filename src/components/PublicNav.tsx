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
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1100px,calc(100%-2rem))]">
      <div className="flex items-center justify-between bg-card/85 backdrop-blur-xl border border-border rounded-full pl-5 pr-2 py-2 shadow-pill">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" fill="currentColor" />
          </span>
          <span>CalmSpace</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <Button asChild size="sm" className="rounded-full px-5">
          <Link to="/app/feelings">Sign In</Link>
        </Button>
      </div>
    </header>
  );
};
