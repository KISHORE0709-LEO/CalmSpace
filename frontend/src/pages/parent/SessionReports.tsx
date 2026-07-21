import { ParentShell } from "@/components/ParentShell";
import { FileText } from "lucide-react";

const SessionReports = () => {
  return (
    <ParentShell title="Session Reports" subtitle="View details from recent sessions">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <FileText size={40} className="text-secondary-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">Session Reports</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for session reports and summaries.
        </p>
      </div>
    </ParentShell>
  );
};

export default SessionReports;
