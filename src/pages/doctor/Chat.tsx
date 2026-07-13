import { DoctorShell } from "@/components/DoctorShell";
import { WhatsAppClone, ThreadType, MessageType } from "@/components/chat/WhatsAppClone";
import { RoleOnboardingModal } from "@/components/RoleOnboardingModal";

const mockThreads: ThreadType[] = [
  { id: "parent_doctor", name: "The Jenkins Family", role: "parent", unreadCount: 0, avatarColor: "bg-primary text-primary-foreground", lastMessageTime: new Date(Date.now() - 3500000) },
];

const mockInitialMessages: Record<string, MessageType[]> = {
  "parent_doctor": [
    { id: "1", senderName: "You", senderRole: "doctor", content: "I've reviewed the latest LSTM risk scores. Everything looks stable.", timestamp: new Date(Date.now() - 7200000), isSelf: true, status: "read" },
    { id: "2", senderName: "Mr. Jenkins", senderRole: "parent", content: "Thank you doctor. Should we adjust any routines?", timestamp: new Date(Date.now() - 7100000), isSelf: false, status: "read" },
    { id: "3", senderName: "You", senderRole: "doctor", content: "Not at this moment, but let's keep an eye on sleep patterns.", timestamp: new Date(Date.now() - 3600000), isSelf: true, status: "read" },
    { id: "4", senderName: "You", senderRole: "doctor", content: "I will check in again tomorrow.", timestamp: new Date(Date.now() - 3500000), isSelf: true, status: "delivered" },
  ],
};

const Chat = () => {
  return (
    <DoctorShell title="Chat Space" subtitle="WhatsApp-style communication with the parents">
      <RoleOnboardingModal role="doctor" />
      <div className="animate-fade-up max-w-[1200px] mx-auto w-full">
        <WhatsAppClone 
          currentRole="doctor" 
          threads={mockThreads} 
          initialMessages={mockInitialMessages} 
        />
      </div>
    </DoctorShell>
  );
};

export default Chat;
