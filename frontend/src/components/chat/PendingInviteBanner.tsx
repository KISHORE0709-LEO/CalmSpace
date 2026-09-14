import { useState } from "react";
import { Mail, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CareCircle, acceptInvite, declineInvite, fetchCircleMembers } from "@/lib/careCircleApi";
import { toast } from "sonner";

interface Props {
  pendingCircles: CareCircle[];
  authToken?: string | null;
  currentUserEmail?: string | null;
  onInviteResponded: () => void;
}

export const PendingInviteBanner = ({
  pendingCircles,
  authToken,
  currentUserEmail,
  onInviteResponded,
}: Props) => {
  const [processingId, setProcessingId] = useState<number | null>(null);

  if (!pendingCircles || pendingCircles.length === 0) {
    return null;
  }

  const handleAction = async (circle: CareCircle, action: "accept" | "decline") => {
    setProcessingId(circle.id);
    try {
      // Find the member record for this user
      const members = await fetchCircleMembers(circle.id, authToken);
      const myMember = members.find(
        (m) =>
          (currentUserEmail && m.invited_email.toLowerCase() === currentUserEmail.toLowerCase()) ||
          m.status === "pending"
      );

      if (!myMember) {
        throw new Error("Could not find your invite record for this Care Circle");
      }

      if (action === "accept") {
        await acceptInvite(circle.id, myMember.id, authToken);
        toast.success(`You have joined "${circle.name}"!`);
      } else {
        await declineInvite(circle.id, myMember.id, authToken);
        toast.info(`Declined invite to "${circle.name}".`);
      }

      onInviteResponded();
    } catch (err: any) {
      toast.error(err.message || `Failed to ${action} invite`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-3 mb-4 animate-fade-down">
      {pendingCircles.map((circle) => (
        <div
          key={circle.id}
          className="calm-card p-4 bg-primary/10 border-2 border-primary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-pop-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <h4 className="font-black text-base text-foreground">
                Invite from {circle.owner_name || "Parent"}
              </h4>
              <p className="text-sm font-medium text-muted-foreground">
                You've been invited to join{" "}
                <span className="font-bold text-foreground">{circle.name}</span> for child{" "}
                <span className="font-bold text-foreground">{circle.child_name}</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              onClick={() => handleAction(circle, "accept")}
              disabled={processingId === circle.id}
              className="flex-1 sm:flex-initial bg-primary text-primary-foreground font-black border-2 border-foreground shadow-pop-sm hover:-translate-y-0.5 transition-transform"
            >
              {processingId === circle.id ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : (
                <Check size={16} className="mr-1" />
              )}
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction(circle, "decline")}
              disabled={processingId === circle.id}
              className="flex-1 sm:flex-initial font-bold border-2 border-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
            >
              <X size={16} className="mr-1" />
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
