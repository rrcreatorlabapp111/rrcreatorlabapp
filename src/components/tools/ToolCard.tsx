import { useState } from "react";
import { LucideIcon, ChevronRight, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LockedToolOverlay } from "./LockedToolOverlay";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
  isLocked?: boolean;
}

export const ToolCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  className,
  isLocked = false,
}: ToolCardProps) => {
  const [showLockedDialog, setShowLockedDialog] = useState(false);

  const handleClick = () => {
    if (isLocked) {
      setShowLockedDialog(true);
    } else {
      onClick();
    }
  };

  return (
    <>
      <Card
        variant="gradient"
        className={cn(
          "cursor-pointer transition-all duration-300 active:scale-[0.98]",
          isLocked 
            ? "opacity-70 hover:opacity-80" 
            : "hover:border-primary/50 hover:shadow-glow",
          className
        )}
        onClick={handleClick}
      >
        <div className="flex items-center gap-4 p-4">
          <div className={cn(
            "p-3 rounded-xl shrink-0",
            isLocked ? "bg-muted" : "gradient-primary"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              isLocked ? "text-muted-foreground" : "text-foreground"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold truncate",
              isLocked ? "text-muted-foreground" : "text-foreground"
            )}>{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
          {isLocked ? (
            <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
          )}
        </div>
      </Card>

      <LockedToolOverlay
        open={showLockedDialog}
        onOpenChange={setShowLockedDialog}
        toolName={title}
      />
    </>
  );
};
