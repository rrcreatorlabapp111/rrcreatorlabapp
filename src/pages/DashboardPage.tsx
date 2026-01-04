import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Users,
  Eye,
  TrendingUp,
  ThumbsUp,
  BarChart3,
  FileText,
  Zap,
  LogOut,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import { GrowthChart } from "@/components/dashboard/GrowthChart";
import { SavedContentList } from "@/components/dashboard/SavedContentList";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  getSavedContent,
  deleteSavedContent,
  getGrowthStats,
  getActivityLog,
  addGrowthStats,
} from "@/lib/database";
import { format, subDays } from "date-fns";

const tabs = ["Overview", "Content", "Activity"];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("Overview");

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Fetch saved content
  const { data: savedContent = [], isLoading: contentLoading } = useQuery({
    queryKey: ["saved_content", user?.id],
    queryFn: () => getSavedContent(user!.id),
    enabled: !!user,
  });

  // Fetch growth stats
  const { data: growthStats = [], isLoading: statsLoading } = useQuery({
    queryKey: ["growth_stats", user?.id],
    queryFn: () => getGrowthStats(user!.id),
    enabled: !!user,
  });

  // Fetch activity log
  const { data: activityLog = [], isLoading: activityLoading } = useQuery({
    queryKey: ["activity_log", user?.id],
    queryFn: () => getActivityLog(user!.id),
    enabled: !!user,
  });

  // Delete content mutation
  const deleteContentMutation = useMutation({
    mutationFn: deleteSavedContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved_content"] });
      toast.success("Content deleted");
    },
    onError: () => {
      toast.error("Failed to delete content");
    },
  });

  // Add sample growth data mutation
  const addSampleDataMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        await addGrowthStats({
          user_id: user.id,
          date: format(date, "yyyy-MM-dd"),
          followers: Math.floor(1000 + Math.random() * 500 + i * 100),
          views: Math.floor(5000 + Math.random() * 3000 + i * 500),
          likes: Math.floor(200 + Math.random() * 100 + i * 20),
          comments: Math.floor(50 + Math.random() * 30 + i * 5),
          engagement_rate: parseFloat((3 + Math.random() * 2).toFixed(2)),
          platform: "all",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["growth_stats"] });
      toast.success("Sample data added!");
    },
    onError: () => {
      toast.error("Failed to add sample data");
    },
  });

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleDeleteContent = (id: string) => {
    deleteContentMutation.mutate(id);
  };

  const handleViewContent = (id: string) => {
    toast.info("Opening content...");
  };

  // Format saved content for display
  const formattedContent = savedContent.map((item) => ({
    id: item.id,
    type: item.type as "script" | "tags" | "ideas" | "plan",
    title: item.title,
    preview: item.preview || item.content.substring(0, 100) + "...",
    createdAt: new Date(item.created_at).toLocaleDateString(),
  }));

  // Format growth data for chart
  const chartData = growthStats.map((stat) => ({
    date: format(new Date(stat.date), "MMM d"),
    followers: stat.followers || 0,
    views: Math.round((stat.views || 0) / 1000),
  }));

  // Format activity for display
  const formattedActivity = activityLog.map((item) => ({
    id: item.id,
    type: item.type as "follower" | "view" | "like" | "comment" | "share" | "milestone",
    message: item.message,
    time: new Date(item.created_at).toLocaleDateString(),
  }));

  // Calculate totals
  const latestStats = growthStats[growthStats.length - 1];
  const previousStats = growthStats[growthStats.length - 2];

  const totalFollowers = latestStats?.followers || 0;
  const totalViews = latestStats?.views || 0;
  const engagementRate = latestStats?.engagement_rate || 0;

  const followerChange = previousStats
    ? (((totalFollowers - previousStats.followers!) / previousStats.followers!) * 100).toFixed(1)
    : "0";
  const viewChange = previousStats
    ? (((totalViews - previousStats.views!) / previousStats.views!) * 100).toFixed(1)
    : "0";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Creator Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track your growth</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
        <div className="p-2 rounded-lg gradient-primary">
          <BarChart3 className="h-5 w-5 text-foreground" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
              activeTab === tab
                ? "gradient-primary text-foreground shadow-button"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "Overview" && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <AnalyticsCard
              icon={Users}
              label="Total Followers"
              value={totalFollowers.toLocaleString()}
              change={`${Number(followerChange) >= 0 ? "+" : ""}${followerChange}%`}
              changeType={Number(followerChange) >= 0 ? "positive" : "negative"}
            />
            <AnalyticsCard
              icon={Eye}
              label="Total Views"
              value={totalViews.toLocaleString()}
              change={`${Number(viewChange) >= 0 ? "+" : ""}${viewChange}%`}
              changeType={Number(viewChange) >= 0 ? "positive" : "negative"}
            />
            <AnalyticsCard
              icon={ThumbsUp}
              label="Engagement Rate"
              value={`${engagementRate}%`}
              change="This month"
              changeType="neutral"
            />
            <AnalyticsCard
              icon={TrendingUp}
              label="Saved Content"
              value={savedContent.length.toString()}
              change="items"
              changeType="neutral"
            />
          </div>

          {/* Growth Chart */}
          {chartData.length > 0 ? (
            <GrowthChart data={chartData} title="Growth Over Time" />
          ) : (
            <Card variant="gradient" className="p-6 text-center">
              <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No growth data yet</p>
              <Button
                variant="gradient"
                onClick={() => addSampleDataMutation.mutate()}
                disabled={addSampleDataMutation.isPending}
              >
                <Plus className="h-4 w-4" />
                Add Sample Data
              </Button>
            </Card>
          )}

          {/* Quick Insights */}
          <Card variant="glow" className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg gradient-primary">
                <Zap className="h-4 w-4 text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Quick Insights</h3>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                📈 <span className="text-foreground">Content saved:</span> {savedContent.length} items
              </p>
              <p className="text-sm text-muted-foreground">
                ⏰ <span className="text-foreground">Data points:</span> {growthStats.length} records
              </p>
              <p className="text-sm text-muted-foreground">
                🎯 <span className="text-foreground">Activities logged:</span> {activityLog.length} events
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === "Content" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">Saved Content</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {formattedContent.length} items
            </span>
          </div>
          {contentLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <SavedContentList
              content={formattedContent}
              onDelete={handleDeleteContent}
              onView={handleViewContent}
            />
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "Activity" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Recent Activity</h2>
          </div>
          {activityLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <ActivityFeed activities={formattedActivity} />
          )}

          {/* Milestones */}
          <Card variant="gradient" className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Milestones</h3>
            <div className="space-y-3">
              {[
                { target: 5000, current: totalFollowers, label: "Next: 5K Followers" },
                { target: 100000, current: totalViews, label: "Next: 100K Views" },
              ].map((milestone, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{milestone.label}</span>
                    <span className="text-foreground font-medium">
                      {Math.min(Math.round((milestone.current / milestone.target) * 100), 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((milestone.current / milestone.target) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
