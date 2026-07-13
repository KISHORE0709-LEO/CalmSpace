import { ParentShell } from "@/components/ParentShell";
import { AlertTriangle } from "lucide-react";

const CrisisAlerts = () => {
  return (
    <ParentShell title="Crisis Alerts" subtitle="Important alerts and notifications">
      <div className="calm-card p-10 text-center animate-fade-up border-red-200">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black mb-4">Crisis Alerts</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for the crisis alerts dashboard.
        </p>
      </div>
    </ParentShell>
  );
};

export default CrisisAlerts;
