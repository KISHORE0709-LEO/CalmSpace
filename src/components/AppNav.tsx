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
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1240px,calc(100%-2rem))]">
      <div className="flex items-center justify-between gap-3 bg-card/85 backdrop-blur-xl border border-border rounded-full pl-4 pr-3 py-2 shadow-pill">
        <Link to="/" className="flex items-center gap-2 font-semibold shrink-0">
          <span className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" fill="currentColor" />
          </span>
          <span className="hidden sm:inline">CalmSpace</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{l.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <button className="w-9 h-9 rounded-full bg-accent-soft hover:bg-accent/40 flex items-center justify-center shrink-0 transition-colors">
          <Bell className="w-4 h-4 text-accent-foreground" />
        </button>
      </div>
    </header>
  );
};
