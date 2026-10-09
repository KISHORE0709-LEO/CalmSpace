import { Link, NavLink, useNavigate } from "react-router-dom";
import { HandHeart, Bell, MessageCircle, Activity, CheckSquare, ClipboardList, NotebookPen, Video, ShieldAlert, UserCircle, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { to: "/caregiver/chat", label: "Chat", icon: MessageCircle },
  { to: "/caregiver/live-emotion", label: "Live Emotion", icon: Activity },
  { to: "/caregiver/crisis-alerts", label: "Crisis Alerts", icon: ShieldAlert },
  { to: "/caregiver/tasks", label: "Assigned Tasks", icon: CheckSquare },
  { to: "/caregiver/therapy", label: "Therapy Session", icon: Video },
  { to: "/caregiver/handoff-notes", label: "Handoff Notes", icon: NotebookPen },
];

export const CaregiverNav = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="fixed top-6 left-0 right-0 z-50">
      <div className="w-full px-6 md:px-12 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center gap-3 px-2 py-2 transition-transform hover:-translate-y-[2px] shrink-0">
            <span className="w-10 h-10 rounded-full bg-secondary border-2 border-foreground flex items-center justify-center shadow-pop-sm">
              <HandHeart className="w-5 h-5 text-secondary-foreground" fill="currentColor" />
            </span>
            <span className="hidden xl:inline text-2xl tracking-tight text-foreground font-black">CalmSpace Caregiver</span>
          </Link>
        </div>

        {/* Center: Nav Links */}
        <nav className="flex items-center justify-center pill-nav overflow-x-auto scrollbar-none !p-1.5 shrink-0 max-w-full">
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

        {/* Right: Notifications & Profile */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <button className="w-12 h-12 rounded-full bg-background border-2 border-foreground shadow-pop-sm hover:bg-accent hover:-translate-y-[2px] hover:shadow-pop flex items-center justify-center shrink-0 transition-all">
            <Bell className="w-5 h-5 text-foreground" />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground border-2 border-foreground shadow-pop-sm hover:-translate-y-[2px] hover:shadow-pop flex items-center justify-center shrink-0 transition-all">
                <UserCircle className="w-6 h-6" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-2 border-foreground shadow-pop-sm">
              <DropdownMenuLabel className="font-black">{profile?.name || "Caregiver"}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-foreground/20" />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 font-bold focus:text-red-700 focus:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
