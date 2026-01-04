import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TipCardProps {
  category: string;
  title: string;
  content: string;
  categoryColor?: string;
}

const categoryColors: Record<string, string> = {
  "YouTube Growth": "bg-red-500/20 text-red-400 border-red-500/30",
  "Instagram Growth": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Content Strategy": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Mistakes to Avoid": "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

export const TipCard = ({ category, title, content }: TipCardProps) => {
  return (
    <Card variant="gradient" className="p-4 animate-fade-in">
      <Badge
        variant="outline"
        className={`mb-3 ${categoryColors[category] || "bg-primary/20 text-primary border-primary/30"}`}
      >
        {category}
      </Badge>
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
    </Card>
  );
};
