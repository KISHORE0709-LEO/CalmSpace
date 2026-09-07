import { ParentShell } from "@/components/ParentShell";
import { Activity } from "lucide-react";

const SocialConfidence = () => {
  return (
    <ParentShell title="Social Confidence" subtitle="Track social skills and confidence levels">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <Activity size={40} className="text-secondary-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">Social Confidence Report</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for the social confidence tracking dashboard.
        </p>
      </div>
    </ParentShell>
  );
};

export default SocialConfidence;
