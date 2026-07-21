import { Link, NavLink, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/how-it-works", label: "How it Works" },
  { to: "/about", label: "About" },
];

export const PublicNav = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/auth";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "top-0 bg-background/90 backdrop-blur-lg shadow-sm py-4" : "top-6 py-0"}`}>
      <div className="w-full px-6 md:px-12 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center gap-3 px-2 py-2 transition-transform hover:-translate-y-[2px]">
            <span className="w-10 h-10 rounded-full bg-primary border-2 border-foreground flex items-center justify-center shadow-pop-sm">
              <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
            </span>
            <span className="text-2xl tracking-tight text-foreground font-black">CalmSpace</span>
          </Link>
        </div>

        {/* Center: Nav Links */}
        {!isAuthPage && (
          <nav className="hidden md:flex pill-nav !p-2">
            {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => `pill-nav-item !text-base !px-6 !py-2.5 ${isActive ? "bg-primary text-primary-foreground border-2 border-foreground shadow-pop-sm" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
          </nav>
        )}

        {/* Right: Button */}
        <div className="flex-1 flex justify-end">
          <Button asChild className="rounded-full px-8 h-12 text-base font-bold border-2 border-foreground shadow-pop-sm hover:shadow-pop hover:-translate-y-1 transition-all">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
