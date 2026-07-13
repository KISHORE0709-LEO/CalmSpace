import { DoctorShell } from "@/components/DoctorShell";
import { ClipboardEdit } from "lucide-react";

const CarePlan = () => {
  return (
    <DoctorShell title="Care Plan Editor" subtitle="Create and modify patient care plans">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <ClipboardEdit size={40} className="text-accent-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">Care Plan Editor</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for the care plan editing interface.
        </p>
      </div>
    </DoctorShell>
  );
};

export default CarePlan;
