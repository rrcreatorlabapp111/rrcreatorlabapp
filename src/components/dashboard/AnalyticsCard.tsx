import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  className?: string;
}

export const AnalyticsCard = ({
  icon: Icon,
  label,
  value,
  change,
  changeType,
  className,
}: AnalyticsCardProps) => {
  const changeColors = {
    positive: "text-green-400",
    negative: "text-red-400",
    neutral: "text-muted-foreground",
  };

  return (
    <Card variant="gradient" className={cn("p-4", className)}>
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-lg gradient-primary">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
        <span className={cn("text-xs font-medium", changeColors[changeType])}>
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
};
