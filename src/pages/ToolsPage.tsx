import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Hash,
  FileText,
  MessageSquare,
  Lightbulb,
  Calendar,
  TrendingUp,
  Clock,
  BarChart3,
  Target,
  Flame,
  Search,
  Users,
  Sparkles,
  Timer,
  ChevronDown,
  Youtube,
  Instagram,
  Image,
  Palette,
  Heart,
  Zap,
  Video,
  Music,
  Camera,
  Edit3,
  BookOpen,
  Award,
  Eye,
  Share2,
  Megaphone,
  Layout,
  Type,
  Layers,
  Lock,
} from "lucide-react";
import { ToolCard } from "@/components/tools/ToolCard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToolAccess } from "@/hooks/useToolAccess";
import { useAuth } from "@/hooks/useAuth";

interface Tool {
  id: string;
  icon: typeof Hash;
  title: string;
  description: string;
  path: string;
  isNew?: boolean;
}

interface ToolCategory {
  title: string;
  description: string;
  tools: Tool[];
}

const youtubeTools: ToolCategory[] = [
  {
    title: "Content Creation",
    description: "AI-powered tools for YouTube content",
    tools: [
      {
        id: "tag-generator",
        icon: Hash,
        title: "Tag Generator",
        description: "Generate 25-30 SEO optimized tags for YouTube",
        path: "/tools/tags?platform=youtube",
      },
      {
        id: "script-generator",
        icon: FileText,
        title: "Script Generator",
        description: "AI-powered video scripts with hook, content & CTA",
        path: "/tools/script",
      },
      {
        id: "text-to-script",
        icon: MessageSquare,
        title: "Text to Script",
        description: "Convert any text or idea into spoken-style scripts",
        path: "/tools/text-script",
      },
      {
        id: "shorts-ideas",
        icon: Lightbulb,
        title: "YouTube Shorts Ideas",
        description: "Get viral short-form content ideas with hooks",
        path: "/tools/shorts-ideas?platform=youtube",
      },
      {
        id: "youtube-planner",
        icon: Calendar,
        title: "Content Planner",
        description: "Weekly content plan with video titles and ideas",
        path: "/tools/planner",
      },
      {
        id: "thumbnail-ideas",
        icon: Image,
        title: "Thumbnail Ideas",
        description: "Get AI-powered thumbnail concepts for higher CTR",
        path: "/tools/thumbnail-ideas",
        isNew: true,
      },
      {
        id: "video-hook",
        icon: Zap,
        title: "Video Hook Generator",
        description: "Create attention-grabbing first 5-second hooks",
        path: "/tools/video-hooks",
        isNew: true,
      },
    ],
  },
  {
    title: "Analytics & Growth",
    description: "Track and predict your YouTube growth",
    tools: [
      {
        id: "growth-calculator",
        icon: TrendingUp,
        title: "Growth Calculator",
        description: "Calculate subscriber growth rate and projections",
        path: "/tools/growth-calc",
      },
      {
        id: "watch-time",
        icon: Clock,
        title: "Watch Time Estimator",
        description: "Estimate total watch time & revenue potential",
        path: "/tools/watch-time",
      },
      {
        id: "engagement",
        icon: BarChart3,
        title: "Engagement Analyzer",
        description: "Analyze likes, comments & engagement rates",
        path: "/tools/engagement",
      },
      {
        id: "growth-predictor",
        icon: Target,
        title: "Milestone Predictor",
        description: "Predict when you'll hit subscriber milestones",
        path: "/tools/growth-predict",
      },
      {
        id: "trending",
        icon: Flame,
        title: "Trending Topics",
        description: "Discover what's trending on YouTube",
        path: "/tools/trending?platform=youtube",
      },
      {
        id: "revenue-calc",
        icon: Award,
        title: "Revenue Calculator",
        description: "Estimate earnings based on views & CPM",
        path: "/tools/revenue-calc",
        isNew: true,
      },
    ],
  },
  {
    title: "SEO & Optimization",
    description: "Optimize your YouTube content",
    tools: [
      {
        id: "seo-score",
        icon: Search,
        title: "SEO Score Analyzer",
        description: "Analyze title, description & tags for SEO",
        path: "/tools/seo",
      },
      {
        id: "competitor",
        icon: Users,
        title: "Competitor Analysis",
        description: "Compare your channel with competitors",
        path: "/tools/competitor",
      },
      {
        id: "title-tester",
        icon: Sparkles,
        title: "Title A/B Tester",
        description: "Generate & compare title variants for CTR",
        path: "/tools/title-test",
      },
      {
        id: "best-time",
        icon: Timer,
        title: "Best Upload Time",
        description: "Find the best times to upload videos",
        path: "/tools/best-time",
      },
      {
        id: "description-gen",
        icon: Edit3,
        title: "Description Generator",
        description: "Create SEO-optimized video descriptions",
        path: "/tools/description-gen",
        isNew: true,
      },
    ],
  },
];

const instagramTools: ToolCategory[] = [
  {
    title: "Content Creation",
    description: "AI-powered tools for Instagram content",
    tools: [
      {
        id: "hashtag-generator",
        icon: Hash,
        title: "Hashtag Generator",
        description: "Generate 30 optimized hashtags for Instagram",
        path: "/tools/tags?platform=instagram",
      },
      {
        id: "caption-generator",
        icon: Type,
        title: "Caption Generator",
        description: "AI-powered captions with hooks & CTAs",
        path: "/tools/caption-gen",
        isNew: true,
      },
      {
        id: "reels-ideas",
        icon: Video,
        title: "Reels Ideas",
        description: "Get viral Reels content ideas with audio suggestions",
        path: "/tools/shorts-ideas?platform=instagram",
      },
      {
        id: "story-ideas",
        icon: Layers,
        title: "Story Ideas",
        description: "Interactive story content ideas for engagement",
        path: "/tools/story-ideas",
        isNew: true,
      },
      {
        id: "carousel-planner",
        icon: Layout,
        title: "Carousel Planner",
        description: "Plan multi-slide carousel posts",
        path: "/tools/carousel-planner",
        isNew: true,
      },
      {
        id: "bio-generator",
        icon: BookOpen,
        title: "Bio Generator",
        description: "Create compelling Instagram bios",
        path: "/tools/bio-gen",
        isNew: true,
      },
    ],
  },
  {
    title: "Analytics & Growth",
    description: "Track and grow your Instagram",
    tools: [
      {
        id: "ig-growth-calc",
        icon: TrendingUp,
        title: "Follower Growth",
        description: "Calculate follower growth rate and projections",
        path: "/tools/growth-calc",
      },
      {
        id: "ig-engagement",
        icon: Heart,
        title: "Engagement Rate",
        description: "Calculate your engagement rate vs benchmarks",
        path: "/tools/ig-engagement",
        isNew: true,
      },
      {
        id: "ig-trending",
        icon: Flame,
        title: "Trending Audio",
        description: "Discover trending sounds for Reels",
        path: "/tools/trending-audio",
        isNew: true,
      },
      {
        id: "reach-estimator",
        icon: Eye,
        title: "Reach Estimator",
        description: "Estimate potential reach for your posts",
        path: "/tools/reach-estimator",
        isNew: true,
      },
    ],
  },
  {
    title: "Strategy & Optimization",
    description: "Optimize your Instagram strategy",
    tools: [
      {
        id: "content-calendar",
        icon: Calendar,
        title: "Content Calendar",
        description: "Plan and schedule your Instagram content",
        path: "/content-calendar",
      },
      {
        id: "ig-best-time",
        icon: Timer,
        title: "Best Posting Time",
        description: "Find optimal times to post on Instagram",
        path: "/tools/best-time",
      },
      {
        id: "collab-finder",
        icon: Share2,
        title: "Collab Ideas",
        description: "Find collaboration ideas in your niche",
        path: "/tools/collab-ideas",
        isNew: true,
      },
      {
        id: "content-pillars",
        icon: Megaphone,
        title: "Content Pillars",
        description: "Define your content strategy pillars",
        path: "/tools/content-pillars",
        isNew: true,
      },
    ],
  },
];

export const ToolsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasAccess, toolsLocked, loading: accessLoading } = useToolAccess();
  const [activeTab, setActiveTab] = useState("youtube");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    "Content Creation": true,
    "Analytics & Growth": true,
    "SEO & Optimization": true,
    "Strategy & Optimization": true,
  });

  const toggleCategory = (title: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const currentTools = activeTab === "youtube" ? youtubeTools : instagramTools;

  const isToolLocked = (toolId: string) => {
    if (!user) return true; // Not logged in = locked
    return !hasAccess(toolId);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="space-y-1 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Creator Tools</h1>
        <p className="text-muted-foreground">AI-powered tools for content creators</p>
      </div>

      {/* Platform Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-14 p-1 bg-muted/50 border border-border/50">
          <TabsTrigger 
            value="youtube" 
            className="h-full gap-2 data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive data-[state=active]:border-destructive/30 transition-all"
          >
            <Youtube className="h-5 w-5" />
            <span className="font-semibold">YouTube</span>
          </TabsTrigger>
          <TabsTrigger 
            value="instagram" 
            className="h-full gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-pink-500 transition-all"
          >
            <Instagram className="h-5 w-5" />
            <span className="font-semibold">Instagram</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="youtube" className="mt-4 space-y-4" />
        <TabsContent value="instagram" className="mt-4 space-y-4" />
      </Tabs>

      {/* Tool Categories */}
      <div className="space-y-4">
        {currentTools.map((category, catIndex) => (
          <Collapsible
            key={category.title}
            open={openCategories[category.title]}
            onOpenChange={() => toggleCategory(category.title)}
          >
            <CollapsibleTrigger className="w-full">
              <div
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-all duration-300 animate-fade-in cursor-pointer"
                style={{ animationDelay: `${catIndex * 0.1}s` }}
              >
                <div className="text-left">
                  <h2 className="text-lg font-semibold text-foreground">{category.title}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform duration-300",
                    openCategories[category.title] && "rotate-180"
                  )}
                />
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="pt-3 space-y-2">
              {category.tools.map((tool, toolIndex) => (
                <div
                  key={tool.id}
                  className="animate-slide-up relative"
                  style={{ animationDelay: `${catIndex * 0.1 + toolIndex * 0.03}s` }}
                >
                  {tool.isNew && (
                    <Badge className="absolute -top-1 -right-1 z-10 text-[9px] px-1.5 py-0.5 bg-gradient-to-r from-primary to-accent text-white border-0">
                      New
                    </Badge>
                  )}
                  <ToolCard
                    icon={tool.icon}
                    title={tool.title}
                    description={tool.description}
                    onClick={() => navigate(tool.path)}
                    isLocked={isToolLocked(tool.id)}
                  />
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};
