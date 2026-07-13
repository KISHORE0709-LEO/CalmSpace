import { ReactNode } from "react";
import { CaregiverNav } from "./CaregiverNav";

interface Props {
  title?: string;
  subtitle?: string;
  fullWidth?: boolean;
  children: ReactNode;
}

export const CaregiverShell = ({ title, subtitle, fullWidth = false, children }: Props) => (
  <div className="min-h-screen bg-background">
    <CaregiverNav />
    <main className="pt-28 pb-16">
      <div className={`container ${fullWidth ? "max-w-[1800px]" : "max-w-6xl"}`}>
        {title && (
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">{title}</h1>
            {subtitle && <p className="text-muted-foreground font-medium">{subtitle}</p>}
          </header>
        )}
        {children}
      </div>
    </main>
  </div>
);
