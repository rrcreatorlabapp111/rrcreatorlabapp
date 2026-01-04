import { LucideIcon, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

export const ToolCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  className,
}: ToolCardProps) => {
  return (
    <Card
      variant="gradient"
      className={cn(
        "cursor-pointer hover:border-primary/50 hover:shadow-glow",
        "transition-all duration-300 active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="p-3 rounded-xl gradient-primary shrink-0">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </div>
    </Card>
  );
};
