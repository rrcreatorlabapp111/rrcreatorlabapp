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
} from "lucide-react";
import { ToolCard } from "@/components/tools/ToolCard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Tool {
  id: string;
  icon: typeof Hash;
  title: string;
  description: string;
  path: string;
}

interface ToolCategory {
  title: string;
  description: string;
  tools: Tool[];
}

const toolCategories: ToolCategory[] = [
  {
    title: "Content Creation",
    description: "AI-powered tools to create content",
    tools: [
      {
        id: "tag-generator",
        icon: Hash,
        title: "Tag Generator",
        description: "Generate 25-30 optimized tags for YouTube or Instagram",
        path: "/tools/tags",
      },
      {
        id: "script-generator",
        icon: FileText,
        title: "Script Generator",
        description: "AI-powered scripts with hook, content & CTA",
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
        title: "Shorts / Reels Ideas",
        description: "Get 7-10 viral short-form content ideas with hooks",
        path: "/tools/shorts-ideas",
      },
      {
        id: "youtube-planner",
        icon: Calendar,
        title: "YouTube Planner",
        description: "Weekly content plan with video titles and ideas",
        path: "/tools/planner",
      },
    ],
  },
  {
    title: "Analytics & Growth",
    description: "Track and predict your growth",
    tools: [
      {
        id: "growth-calculator",
        icon: TrendingUp,
        title: "Growth Calculator",
        description: "Calculate growth rate and monthly projections",
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
        title: "Growth Predictor",
        description: "Predict subscriber milestones & growth rate",
        path: "/tools/growth-predict",
      },
      {
        id: "trending",
        icon: Flame,
        title: "Trending Topics",
        description: "Discover what's trending in your niche",
        path: "/tools/trending",
      },
    ],
  },
  {
    title: "Strategy & SEO",
    description: "Optimize your content strategy",
    tools: [
      {
        id: "seo-score",
        icon: Search,
        title: "SEO Score",
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
    ],
  },
  {
    title: "Optimization",
    description: "Test and optimize performance",
    tools: [
      {
        id: "title-tester",
        icon: Sparkles,
        title: "Title Tester",
        description: "Generate & compare title variants for CTR",
        path: "/tools/title-test",
      },
      {
        id: "best-time",
        icon: Timer,
        title: "Best Posting Time",
        description: "Find the best times to post in your niche",
        path: "/tools/best-time",
      },
    ],
  },
];

export const ToolsPage = () => {
  const navigate = useNavigate();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    "Content Creation": true,
    "Analytics & Growth": true,
    "Strategy & SEO": true,
    "Optimization": true,
  });

  const toggleCategory = (title: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="space-y-1 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Creator Tools</h1>
        <p className="text-muted-foreground">AI-powered tools for content creators</p>
      </div>

      {/* Featured: YouTube Assistant */}
      <Card 
        className="relative overflow-hidden cursor-pointer border-destructive/30 bg-gradient-to-br from-destructive/10 to-destructive/5 hover:border-destructive/50 transition-all animate-fade-in"
        onClick={() => navigate("/youtube-assistant")}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/20">
              <Youtube className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">YouTube Assistant</h3>
                <Badge variant="secondary" className="text-[10px]">AI-Powered</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Analyze any channel & get personalized scripts, shorts ideas, content plans & growth tips
              </p>
            </div>
            <Sparkles className="h-5 w-5 text-destructive" />
          </div>
        </CardContent>
      </Card>

      {toolCategories.map((category, catIndex) => (
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
                className="animate-slide-up"
                style={{ animationDelay: `${catIndex * 0.1 + toolIndex * 0.03}s` }}
              >
                <ToolCard
                  icon={tool.icon}
                  title={tool.title}
                  description={tool.description}
                  onClick={() => navigate(tool.path)}
                />
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};
