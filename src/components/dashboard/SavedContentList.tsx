import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Hash, Lightbulb, Calendar, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface SavedContent {
  id: string;
  type: "script" | "tags" | "ideas" | "plan";
  title: string;
  preview: string;
  createdAt: string;
}

interface SavedContentListProps {
  content: SavedContent[];
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

const typeIcons = {
  script: FileText,
  tags: Hash,
  ideas: Lightbulb,
  plan: Calendar,
};

const typeColors = {
  script: "bg-blue-500/20 text-blue-400",
  tags: "bg-pink-500/20 text-pink-400",
  ideas: "bg-amber-500/20 text-amber-400",
  plan: "bg-green-500/20 text-green-400",
};

export const SavedContentList = ({
  content,
  onDelete,
  onView,
}: SavedContentListProps) => {
  if (content.length === 0) {
    return (
      <Card variant="gradient" className="p-6 text-center">
        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No saved content yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Generate scripts, tags, or plans to save them here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {content.map((item) => {
        const Icon = typeIcons[item.type];
        return (
          <Card
            key={item.id}
            variant="gradient"
            className="p-4 hover:border-primary/50 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg shrink-0", typeColors[item.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-medium text-foreground text-sm truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {item.preview}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onView(item.id)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{item.createdAt}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
