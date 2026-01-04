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
} from "lucide-react";
import { ToolCard } from "@/components/tools/ToolCard";

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

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="space-y-1 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Creator Tools</h1>
        <p className="text-muted-foreground">AI-powered tools for content creators</p>
      </div>

      {toolCategories.map((category, catIndex) => (
        <div key={category.title} className="space-y-3">
          <div
            className="animate-fade-in"
            style={{ animationDelay: `${catIndex * 0.1}s` }}
          >
            <h2 className="text-lg font-semibold text-foreground">{category.title}</h2>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>

          <div className="space-y-2">
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
          </div>
        </div>
      ))}
    </div>
  );
};
