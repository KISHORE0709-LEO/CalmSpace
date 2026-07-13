import { useState, useEffect } from "react";
import { X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  role: "caregiver" | "doctor";
}

export const RoleOnboardingModal = ({ role }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // In a real app, check localStorage or user profile to see if this is their first login
    const hasSeenOnboarding = localStorage.getItem(`has_seen_onboarding_${role}`);
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, [role]);

  const handleClose = () => {
    localStorage.setItem(`has_seen_onboarding_${role}`, "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="calm-card p-8 max-w-lg w-full relative animate-scale-in border-2 border-primary">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6 shadow-pop-sm">
          <ShieldCheck size={32} className="text-primary-foreground" />
        </div>
        
        <h2 className="text-2xl font-black mb-4">Welcome to the Care Circle</h2>
        
        <div className="space-y-4 mb-8">
          <p className="text-lg text-muted-foreground font-medium">
            You've successfully joined as a {role === 'doctor' ? 'Doctor / Therapist' : 'Caregiver'}.
          </p>
          
          <div className="bg-muted p-4 rounded-xl border-2 border-foreground/10 text-sm font-medium">
            {role === "caregiver" ? (
              <p>You have access to the live emotion state and incident logging. Your chat space is private between you and the parents (unless explicitly enabled for doctors).</p>
            ) : (
              <p>You have access to historical analytics, LSTM risk scores, and the care plan editor. Your chat space is private between you and the parents.</p>
            )}
          </div>
        </div>
        
        <Button 
          onClick={handleClose}
          className="w-full h-12 text-lg font-black border-2 border-foreground shadow-pop-sm"
        >
          I Understand
        </Button>
      </div>
    </div>
  );
};
