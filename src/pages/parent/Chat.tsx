import { ParentShell } from "@/components/ParentShell";
import { MessageCircle } from "lucide-react";

const Chat = () => {
  return (
    <ParentShell title="Chat" subtitle="Communicate with Doctors and Caregivers">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <MessageCircle size={40} className="text-secondary-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">Chat Space</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for the WhatsApp-like chat space where parents can communicate with doctors and caregivers.
        </p>
      </div>
    </ParentShell>
  );
};

export default Chat;
