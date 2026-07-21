import { DoctorShell } from "@/components/DoctorShell";
import { ActivitySquare } from "lucide-react";

const RiskScore = () => {
  return (
    <DoctorShell title="LSTM Risk Score" subtitle="AI-powered predictive risk analysis">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <ActivitySquare size={40} className="text-accent-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">LSTM Risk Score Visualization</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for the LSTM model risk score visualizations.
        </p>
      </div>
    </DoctorShell>
  );
};

export default RiskScore;
