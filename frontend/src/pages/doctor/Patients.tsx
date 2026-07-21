import { DoctorShell } from "@/components/DoctorShell";
import { Users } from "lucide-react";

const Patients = () => {
  return (
    <DoctorShell title="Multi-Patient View" subtitle="Overview of all assigned patients">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <Users size={40} className="text-accent-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">Multi-Patient List View</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for the multi-patient list and overview.
        </p>
      </div>
    </DoctorShell>
  );
};

export default Patients;
