import { CaregiverShell } from "@/components/CaregiverShell";
import { WhatsAppClone, ThreadType, MessageType } from "@/components/chat/WhatsAppClone";
import { RoleOnboardingModal } from "@/components/RoleOnboardingModal";

const mockThreads: ThreadType[] = [
  { id: "parent_caregiver", name: "The Jenkins Family", role: "parent", unreadCount: 1, avatarColor: "bg-primary text-primary-foreground", lastMessageTime: new Date(Date.now() - 3500000) },
];

const mockInitialMessages: Record<string, MessageType[]> = {
  "parent_caregiver": [
    { id: "1", senderName: "You", senderRole: "caregiver", content: "Hi! The session went really well today. We focused on emotional regulation.", timestamp: new Date(Date.now() - 3600000), isSelf: true, status: "read" },
    { id: "2", senderName: "Mrs. Jenkins", senderRole: "parent", content: "That's great to hear! Did any specific triggers come up?", timestamp: new Date(Date.now() - 3500000), isSelf: false, status: "read" },
  ],
};

const Chat = () => {
  return (
    <CaregiverShell fullWidth>
      <RoleOnboardingModal role="caregiver" />
      <div className="animate-fade-up w-full">
        <WhatsAppClone 
          currentRole="caregiver" 
          threads={mockThreads} 
          initialMessages={mockInitialMessages} 
        />
      </div>
    </CaregiverShell>
  );
};

export default Chat;
