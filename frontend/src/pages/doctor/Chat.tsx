import { DoctorShell } from "@/components/DoctorShell";
import { WhatsAppClone } from "@/components/chat/WhatsAppClone";
import { RoleOnboardingModal } from "@/components/RoleOnboardingModal";

const Chat = () => {
  return (
    <DoctorShell fullWidth>
      <RoleOnboardingModal role="doctor" />
      <div className="animate-fade-up w-full">
        <WhatsAppClone currentRole="doctor" />
      </div>
    </DoctorShell>
  );
};

export default Chat;
