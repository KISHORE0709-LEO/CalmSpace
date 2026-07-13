import { DoctorShell } from "@/components/DoctorShell";
import { BarChart3 } from "lucide-react";

const Analytics = () => {
  return (
    <DoctorShell title="Clinical-Grade Analytics" subtitle="In-depth analysis and data visualization">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <BarChart3 size={40} className="text-accent-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">Clinical-Grade Analytics</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for clinical-grade analytics and patient progress metrics.
        </p>
      </div>
    </DoctorShell>
  );
};

export default Analytics;
