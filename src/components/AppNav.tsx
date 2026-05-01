import { Link, NavLink } from "react-router-dom";
import { Heart, Bell, Sparkles, Users, MessageCircle, ClipboardCheck, AlertTriangle } from "lucide-react";

const links = [
  { to: "/app/feelings", label: "Feelings & Comfort", icon: Sparkles },
  { to: "/app/mitra", label: "Mitra", icon: MessageCircle },
  { to: "/app/social", label: "Social Practice", icon: Users },
  { to: "/app/caregiver", label: "Caregiver View", icon: Heart },
  { to: "/app/checkins", label: "Check-ins", icon: ClipboardCheck },
  { to: "/app/alerts", label: "Alerts", icon: AlertTriangle },
];

export const AppNav = () => {
  return (
    <header className="fixed top-4 left-0 right-0 z-50">
      <div className="container max-w-[1400px] flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 px-2 py-2 transition-transform hover:-translate-y-[2px] shrink-0">
          <span className="w-8 h-8 rounded-full bg-primary border-2 border-foreground flex items-center justify-center shadow-pop-sm">
            <Heart className="w-4 h-4 text-primary-foreground" fill="currentColor" />
          </span>
          <span className="hidden sm:inline text-xl tracking-tight text-foreground font-semibold">CalmSpace</span>
        </Link>

        <nav className="flex items-center pill-nav overflow-x-auto scrollbar-none">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `pill-nav-item flex items-center gap-1.5 px-3 lg:px-4 text-xs lg:text-sm whitespace-nowrap ${
                    isActive ? "bg-primary text-primary-foreground border-2 border-foreground shadow-pop-sm" : ""
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{l.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button className="w-11 h-11 rounded-full bg-background border-2 border-foreground shadow-pop-sm hover:bg-accent hover:-translate-y-[2px] hover:shadow-pop flex items-center justify-center shrink-0 transition-all">
          <Bell className="w-5 h-5 text-foreground" />
        </button>
      </div>
    </header>
  );
};
