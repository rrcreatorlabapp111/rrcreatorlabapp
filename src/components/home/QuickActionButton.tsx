import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className?: string;
}

export const QuickActionButton = ({
  icon: Icon,
  label,
  onClick,
  className,
}: QuickActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl",
        "bg-muted/50 border border-border/50 hover:border-primary/50",
        "transition-all duration-300 hover:shadow-glow active:scale-95",
        className
      )}
    >
      <div className="p-3 rounded-lg gradient-primary">
        <Icon className="h-5 w-5 text-foreground" />
      </div>
      <span className="text-xs font-medium text-foreground text-center leading-tight">
        {label}
      </span>
    </button>
  );
};
