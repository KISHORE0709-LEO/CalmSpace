import { ParentShell } from "@/components/ParentShell";
import { WhatsAppClone, ThreadType, MessageType } from "@/components/chat/WhatsAppClone";

const mockThreads: ThreadType[] = [
  { id: "parent_caregiver", name: "Sarah Jenkins", role: "caregiver", unreadCount: 0, avatarColor: "bg-secondary text-secondary-foreground", lastMessageTime: new Date(Date.now() - 3500000) },
  { id: "parent_doctor", name: "Dr. Mehta", role: "doctor", unreadCount: 2, avatarColor: "bg-accent text-accent-foreground", lastMessageTime: new Date(Date.now() - 7100000) },
];

const mockInitialMessages: Record<string, MessageType[]> = {
  "parent_caregiver": [
    { id: "1", senderName: "Sarah Jenkins", senderRole: "caregiver", content: "Hi! The session went really well today. We focused on emotional regulation.", timestamp: new Date(Date.now() - 3600000), isSelf: false, status: "read" },
    { id: "2", senderName: "You", senderRole: "parent", content: "That's great to hear! Did any specific triggers come up?", timestamp: new Date(Date.now() - 3500000), isSelf: true, status: "read" },
  ],
  "parent_doctor": [
    { id: "3", senderName: "Dr. Mehta", senderRole: "doctor", content: "I've reviewed the latest LSTM risk scores. Everything looks stable.", timestamp: new Date(Date.now() - 7200000), isSelf: false, status: "read" },
    { id: "4", senderName: "You", senderRole: "parent", content: "Thank you doctor. Should we adjust any routines?", timestamp: new Date(Date.now() - 7100000), isSelf: true, status: "read" },
    { id: "5", senderName: "Dr. Mehta", senderRole: "doctor", content: "Not at this moment, but let's keep an eye on sleep patterns.", timestamp: new Date(Date.now() - 3600000), isSelf: false, status: "delivered" },
    { id: "6", senderName: "Dr. Mehta", senderRole: "doctor", content: "I will check in again tomorrow.", timestamp: new Date(Date.now() - 3500000), isSelf: false, status: "delivered" },
  ],
};

const Chat = () => {
  return (
    <ParentShell fullWidth>
      <div className="animate-fade-up w-full">
        <WhatsAppClone 
          currentRole="parent" 
          threads={mockThreads} 
          initialMessages={mockInitialMessages} 
        />
      </div>
    </ParentShell>
  );
};

export default Chat;
