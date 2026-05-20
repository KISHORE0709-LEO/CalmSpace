import { useEmotion, EmotionState } from "@/context/EmotionContext";
import { Smile, Frown, AlertCircle, LucideIcon } from "lucide-react";

export const EmotionSelector = () => {
  const { emotion, setEmotion } = useEmotion();

  const options: { value: EmotionState; icon: LucideIcon; label: string; color: string } = [
    { value: "Calm", icon: Smile, label: "Calm", color: "text-green-500" },
    { value: "Anxious", icon: Frown, label: "Anxious", color: "text-amber-500" },
    { value: "Overloaded", icon: AlertCircle, label: "Overloaded", color: "text-red-500" },
  ];

  return (
    <div className="absolute top-4 right-4 z-50 bg-card border-2 border-foreground rounded-full shadow-pop-sm flex items-center p-1 gap-1">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = emotion === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setEmotion(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              isActive ? "bg-primary text-primary-foreground shadow-inner" : "hover:bg-accent text-muted-foreground"
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "" : opt.color}`} />
            <span className={`${isActive ? "block" : "hidden md:block"}`}>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
