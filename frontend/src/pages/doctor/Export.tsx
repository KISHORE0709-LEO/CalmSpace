import { DoctorShell } from "@/components/DoctorShell";
import { Download } from "lucide-react";

const Export = () => {
  return (
    <DoctorShell title="Export Reports" subtitle="Generate and download full session reports">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <Download size={40} className="text-accent-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">Full Session/Report Export</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for exporting patient data and session summaries.
        </p>
      </div>
    </DoctorShell>
  );
};

export default Export;
