import { DoctorShell } from "@/components/DoctorShell";
import { MessageCircle } from "lucide-react";

const Chat = () => {
  return (
    <DoctorShell title="Chat" subtitle="Communicate with Caregivers and Parents">
      <div className="calm-card p-10 text-center animate-fade-up">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-pop-sm">
          <MessageCircle size={40} className="text-accent-foreground" />
        </div>
        <h2 className="text-2xl font-black mb-4">Chat Space</h2>
        <p className="text-muted-foreground text-lg">
          This is a placeholder for the WhatsApp-like chat space for doctors to communicate with parents and caregivers.
        </p>
      </div>
    </DoctorShell>
  );
};

export default Chat;
