import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Eye,
  TrendingUp,
  ThumbsUp,
  BarChart3,
  FileText,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import { GrowthChart } from "@/components/dashboard/GrowthChart";
import { SavedContentList } from "@/components/dashboard/SavedContentList";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mock data - in production this would come from Supabase
const mockGrowthData = [
  { date: "Week 1", followers: 1200, views: 45 },
  { date: "Week 2", followers: 1350, views: 52 },
  { date: "Week 3", followers: 1420, views: 48 },
  { date: "Week 4", followers: 1680, views: 67 },
  { date: "Week 5", followers: 1890, views: 78 },
  { date: "Week 6", followers: 2100, views: 85 },
  { date: "Week 7", followers: 2450, views: 92 },
];

const mockSavedContent = [
  {
    id: "1",
    type: "script" as const,
    title: "How to Start a YouTube Channel in 2024",
    preview: "Hey everyone! Today I want to share the exact steps I used to grow my channel from 0 to 10K subscribers...",
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    type: "tags" as const,
    title: "Photography Tutorial Tags",
    preview: "#photography #phototips #camerasettings #photoedit #lightroom...",
    createdAt: "Yesterday",
  },
  {
    id: "3",
    type: "ideas" as const,
    title: "Fitness Shorts Ideas",
    preview: "5-minute ab workout, Protein shake recipes, Gym mistakes to avoid...",
    createdAt: "3 days ago",
  },
  {
    id: "4",
    type: "plan" as const,
    title: "Weekly Content Plan - Gaming",
    preview: "Monday: Tutorial, Tuesday: Shorts, Wednesday: Stream highlights...",
    createdAt: "1 week ago",
  },
];

const mockActivities = [
  {
    id: "1",
    type: "milestone" as const,
    message: "🎉 You hit 2,500 followers!",
    time: "1 hour ago",
  },
  {
    id: "2",
    type: "view" as const,
    message: "Your latest video reached 10K views",
    time: "3 hours ago",
  },
  {
    id: "3",
    type: "follower" as const,
    message: "+45 new followers today",
    time: "5 hours ago",
  },
  {
    id: "4",
    type: "like" as const,
    message: "Your reel received 500+ likes",
    time: "Yesterday",
  },
  {
    id: "5",
    type: "comment" as const,
    message: "12 new comments on your tutorial",
    time: "Yesterday",
  },
];

const tabs = ["Overview", "Content", "Activity"];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Overview");
  const [savedContent, setSavedContent] = useState(mockSavedContent);

  const handleDeleteContent = (id: string) => {
    setSavedContent((prev) => prev.filter((item) => item.id !== id));
    toast.success("Content deleted");
  };

  const handleViewContent = (id: string) => {
    toast.info("Opening content...");
  };

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
              value="2,450"
              change="+12.5%"
              changeType="positive"
            />
            <AnalyticsCard
              icon={Eye}
              label="Total Views"
              value="92K"
              change="+8.2%"
              changeType="positive"
            />
            <AnalyticsCard
              icon={ThumbsUp}
              label="Engagement Rate"
              value="4.8%"
              change="+0.3%"
              changeType="positive"
            />
            <AnalyticsCard
              icon={TrendingUp}
              label="Growth Rate"
              value="16.7%"
              change="This month"
              changeType="neutral"
            />
          </div>

          {/* Growth Chart */}
          <GrowthChart data={mockGrowthData} title="Growth Over Time" />

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
                📈 <span className="text-foreground">Best performing day:</span> Saturday (+23% views)
              </p>
              <p className="text-sm text-muted-foreground">
                ⏰ <span className="text-foreground">Peak engagement time:</span> 6-8 PM
              </p>
              <p className="text-sm text-muted-foreground">
                🎯 <span className="text-foreground">Top content type:</span> Tutorial videos
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
              {savedContent.length} items
            </span>
          </div>
          <SavedContentList
            content={savedContent}
            onDelete={handleDeleteContent}
            onView={handleViewContent}
          />
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === "Activity" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Recent Activity</h2>
          </div>
          <ActivityFeed activities={mockActivities} />

          {/* Milestones */}
          <Card variant="gradient" className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Milestones</h3>
            <div className="space-y-3">
              {[
                { target: 5000, current: 2450, label: "Next: 5K Followers" },
                { target: 100000, current: 92000, label: "Next: 100K Views" },
              ].map((milestone, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{milestone.label}</span>
                    <span className="text-foreground font-medium">
                      {Math.round((milestone.current / milestone.target) * 100)}%
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
