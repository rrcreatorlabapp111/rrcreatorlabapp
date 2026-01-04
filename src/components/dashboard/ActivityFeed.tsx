import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Eye, ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "follower" | "view" | "like" | "comment" | "share" | "milestone";
  message: string;
  time: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const activityIcons = {
  follower: Users,
  view: Eye,
  like: ThumbsUp,
  comment: MessageCircle,
  share: Share2,
  milestone: TrendingUp,
};

const activityColors = {
  follower: "bg-blue-500/20 text-blue-400",
  view: "bg-cyan-500/20 text-cyan-400",
  like: "bg-pink-500/20 text-pink-400",
  comment: "bg-amber-500/20 text-amber-400",
  share: "bg-green-500/20 text-green-400",
  milestone: "bg-purple-500/20 text-purple-400",
};

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  if (activities.length === 0) {
    return (
      <Card variant="gradient" className="p-6 text-center">
        <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No recent activity</p>
      </Card>
    );
  }

  return (
    <Card variant="gradient" className="p-4">
      <div className="space-y-3">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg shrink-0", activityColors[activity.type])}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
