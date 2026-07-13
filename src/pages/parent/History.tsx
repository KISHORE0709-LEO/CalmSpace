import { ParentShell } from "@/components/ParentShell";
import { History as HistoryIcon } from "lucide-react";

const History = () => {
  return (
    <ParentShell title="Historical Access" subtitle="Review past interactions and data">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <HistoryIcon size={40} className="text-secondary-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">Historical Access</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for accessing historical data of the child.
        </p>
      </div>
    </ParentShell>
  );
};

export default History;
