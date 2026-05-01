import { Heart } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border bg-card/50 mt-24">
    <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2 font-semibold text-foreground">
        <span className="w-7 h-7 rounded-full bg-primary-soft flex items-center justify-center">
          <Heart className="w-3.5 h-3.5 text-primary" fill="currentColor" />
        </span>
        CalmSpace
      </div>
      <p>© {new Date().getFullYear()} CalmSpace — Understanding feelings, every moment.</p>
    </div>
  </footer>
);
