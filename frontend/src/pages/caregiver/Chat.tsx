import { CaregiverShell } from "@/components/CaregiverShell";
import { WhatsAppClone } from "@/components/chat/WhatsAppClone";
import { RoleOnboardingModal } from "@/components/RoleOnboardingModal";

const Chat = () => {
  return (
    <CaregiverShell fullWidth>
      <RoleOnboardingModal role="caregiver" />
      <div className="animate-fade-up w-full">
        <WhatsAppClone currentRole="caregiver" />
      </div>
    </CaregiverShell>
  );
};

export default Chat;
