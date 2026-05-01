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
        <Link to="/" className="flex items-center gap-2 font-semibold bg-card/85 backdrop-blur-xl border border-border rounded-full pl-3 pr-5 py-2 shadow-pill">
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary-foreground" fill="currentColor" />
          </span>
          <span>CalmSpace</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-card/85 backdrop-blur-xl border border-border rounded-full p-1.5 shadow-pill">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Button asChild size="sm" className="rounded-full px-6 h-11 shadow-pill">
          <Link to="/app/feelings">Sign In</Link>
        </Button>
      </div>
    </header>
  );
};
