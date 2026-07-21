import { ParentShell } from "@/components/ParentShell";
import { TrendingUp } from "lucide-react";

const EmotionalTrend = () => {
  return (
    <ParentShell title="Emotional Trend" subtitle="Monitor emotional changes over time">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <TrendingUp size={40} className="text-secondary-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">Emotional Trend</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for the emotional trend charts and data visualization.
        </p>
      </div>
    </ParentShell>
  );
};

export default EmotionalTrend;
