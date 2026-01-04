import { useNavigate } from "react-router-dom";
import {
  Hash,
  FileText,
  MessageSquare,
  Lightbulb,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { ToolCard } from "@/components/tools/ToolCard";

const tools = [
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
  {
    id: "growth-calculator",
    icon: TrendingUp,
    title: "Growth Calculator",
    description: "Calculate growth rate and monthly projections",
    path: "/tools/growth-calc",
  },
];

export const ToolsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="space-y-1 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Creator Tools</h1>
        <p className="text-muted-foreground">AI-powered tools for content creators</p>
      </div>

      <div className="space-y-3">
        {tools.map((tool, index) => (
          <div
            key={tool.id}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
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
  );
};
