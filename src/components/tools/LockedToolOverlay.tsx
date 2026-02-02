import { Lock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LockedToolOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toolName: string;
}

export const LockedToolOverlay = ({
  open,
  onOpenChange,
  toolName,
}: LockedToolOverlayProps) => {
  const handleContactAdmin = () => {
    // You can customize this to open WhatsApp, email, or your preferred contact method
    const message = encodeURIComponent(
      `Hi! I'd like to get access to the "${toolName}" tool in RR Creator Lab.`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader className="space-y-4">
          <div className="mx-auto p-4 rounded-full bg-muted/50 w-fit">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <DialogTitle className="text-xl">Tool Locked</DialogTitle>
          <DialogDescription className="text-base">
            The <span className="font-semibold text-foreground">{toolName}</span> tool is 
            available for premium users only. Contact an admin to get access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <Button
            variant="whatsapp"
            className="w-full"
            onClick={handleContactAdmin}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Admin
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
