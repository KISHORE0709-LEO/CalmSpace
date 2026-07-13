import { ReactNode } from "react";
import { DoctorNav } from "./DoctorNav";

interface Props {
  title?: string;
  subtitle?: string;
  fullWidth?: boolean;
  children: ReactNode;
}

export const DoctorShell = ({ title, subtitle, fullWidth = false, children }: Props) => (
  <div className="min-h-screen bg-background">
    <DoctorNav />
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
