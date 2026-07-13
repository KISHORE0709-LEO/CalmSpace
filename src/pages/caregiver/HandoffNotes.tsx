import { CaregiverShell } from "@/components/CaregiverShell";
import { NotebookPen } from "lucide-react";

const HandoffNotes = () => {
  return (
    <CaregiverShell title="Handoff Notes" subtitle="Notes for the next caregiver or parent">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <NotebookPen size={40} className="text-secondary-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">Handoff Notes</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for session handoff notes and summaries.
        </p>
      </div>
    </CaregiverShell>
  );
};

export default HandoffNotes;
