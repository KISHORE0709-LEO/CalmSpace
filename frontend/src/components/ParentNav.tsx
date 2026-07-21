import { Link, NavLink } from "react-router-dom";
import { Heart, Bell, MessageCircle, TrendingUp, AlertTriangle, FileText, Activity, History, Users } from "lucide-react";

const links = [
  { to: "/parent/care-circle", label: "Care Circle", icon: Users },
  { to: "/parent/chat", label: "Chat", icon: MessageCircle },
  { to: "/parent/emotional-trend", label: "Emotional Trend", icon: TrendingUp },
  { to: "/parent/crisis-alerts", label: "Crisis Alerts", icon: AlertTriangle },
  { to: "/parent/session-reports", label: "Session Reports", icon: FileText },
  { to: "/parent/social-confidence", label: "Social Confidence", icon: Activity },
  { to: "/parent/history", label: "Historical Access", icon: History },
];

export const ParentNav = () => {
  return (
    <header className="fixed top-6 left-0 right-0 z-50">
      <div className="w-full px-6 md:px-12 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center gap-3 px-2 py-2 transition-transform hover:-translate-y-[2px] shrink-0">
            <span className="w-10 h-10 rounded-full bg-secondary border-2 border-foreground flex items-center justify-center shadow-pop-sm">
              <Heart className="w-5 h-5 text-secondary-foreground" fill="currentColor" />
            </span>
            <span className="hidden xl:inline text-2xl tracking-tight text-foreground font-black">CalmSpace Parent</span>
          </Link>
        </div>

        {/* Center: Nav Links */}
        <nav className="flex items-center justify-center pill-nav overflow-x-auto scrollbar-none !p-1.5 shrink-0">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `pill-nav-item flex items-center gap-2 px-3 lg:px-4 py-2 text-xs lg:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive ? "bg-secondary text-secondary-foreground border-2 border-foreground shadow-pop-sm" : "border-2 border-transparent hover:bg-accent"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xl:inline">{l.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Notifications */}
        <div className="flex-1 flex justify-end">
          <button className="w-12 h-12 rounded-full bg-background border-2 border-foreground shadow-pop-sm hover:bg-accent hover:-translate-y-[2px] hover:shadow-pop flex items-center justify-center shrink-0 transition-all">
            <Bell className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
};
