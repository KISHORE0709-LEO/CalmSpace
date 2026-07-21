import { CaregiverShell } from "@/components/CaregiverShell";
import { CheckSquare } from "lucide-react";

const AssignedTasks = () => {
  return (
    <CaregiverShell title="Assigned Tasks" subtitle="Tasks and goals for the current session">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <CheckSquare size={40} className="text-secondary-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">Assigned Tasks/Goals</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for assigned tasks and goals for this session.
        </p>
      </div>
    </CaregiverShell>
  );
};

export default AssignedTasks;
