import { CaregiverShell } from "@/components/CaregiverShell";
import { ClipboardList } from "lucide-react";

const IncidentLogging = () => {
  return (
    <CaregiverShell title="Incident Logging" subtitle="Quickly log incidents or notable behaviors">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <ClipboardList size={40} className="text-secondary-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">Quick Incident Logging</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for the quick incident logging tool.
        </p>
      </div>
    </CaregiverShell>
  );
};

export default IncidentLogging;
