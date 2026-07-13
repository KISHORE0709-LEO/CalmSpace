import { CaregiverShell } from "@/components/CaregiverShell";
import { Activity } from "lucide-react";

const LiveEmotion = () => {
  return (
    <CaregiverShell title="Live Emotion State" subtitle="Monitor the child's current emotional state">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <Activity size={40} className="text-secondary-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">Live Emotion State</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for tracking the live emotion state of the child.
        </p>
      </div>
    </CaregiverShell>
  );
};

export default LiveEmotion;
