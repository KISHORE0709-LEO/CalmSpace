import { ParentShell } from "@/components/ParentShell";
import { WhatsAppClone } from "@/components/chat/WhatsAppClone";

const Chat = () => {
  return (
    <ParentShell fullWidth>
      <div className="animate-fade-up w-full">
        <WhatsAppClone currentRole="parent" />
      </div>
    </ParentShell>
  );
};

export default Chat;
