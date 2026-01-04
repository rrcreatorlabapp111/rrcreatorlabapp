import { useNavigate } from "react-router-dom";
import { FileText, Lightbulb, Calculator, MessageCircle, Sparkles, BarChart3, ChevronRight } from "lucide-react";
import { QuickActionButton } from "@/components/home/QuickActionButton";
import { Card } from "@/components/ui/card";

const WHATSAPP_MESSAGE = encodeURIComponent("Hi RR Creator Labs, I want to grow my channel.");
const WHATSAPP_LINK = `https://wa.me/919999999999?text=${WHATSAPP_MESSAGE}`;

export const HomePage = () => {
  const navigate = useNavigate();

  const quickActions = [
    { icon: FileText, label: "Script Generator", path: "/tools/script" },
    { icon: Lightbulb, label: "Short Ideas", path: "/tools/shorts-ideas" },
    { icon: Calculator, label: "Growth Calculator", path: "/tools/growth-calc" },
    { icon: MessageCircle, label: "WhatsApp", path: WHATSAPP_LINK, external: true },
  ];

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 pt-4 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground">Creator Growth Platform</span>
        </div>
        <h1 className="text-3xl font-bold gradient-text">RR Creator Labs</h1>
        <p className="text-muted-foreground text-lg">
          Grow Your Content. Build Your Brand.
        </p>
      </div>

      {/* Dashboard Card */}
      <Card
        variant="glow"
        className="p-4 cursor-pointer hover:shadow-glow transition-all duration-300 animate-slide-up"
        onClick={() => navigate("/dashboard")}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl gradient-primary">
            <BarChart3 className="h-6 w-6 text-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">Creator Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Analytics, saved content & growth tracking
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        {quickActions.map((action) => (
          <QuickActionButton
            key={action.label}
            icon={action.icon}
            label={action.label}
            onClick={() => {
              if (action.external) {
                window.open(action.path, "_blank");
              } else {
                navigate(action.path);
              }
            }}
          />
        ))}
      </div>

      {/* Highlight Section */}
      <Card variant="gradient" className="p-5 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg gradient-primary">
            <Sparkles className="h-5 w-5 text-foreground" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Creator Growth Tools</h2>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          AI-powered tools to help you create better content, grow faster, and build your personal brand.
        </p>
        <div className="flex flex-wrap gap-2">
          {["Tag Generator", "Script AI", "Content Planner", "Analytics"].map((tool) => (
            <span
              key={tool}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border/50"
            >
              {tool}
            </span>
          ))}
        </div>
      </Card>

      {/* Stats Preview */}
      <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        {[
          { value: "6+", label: "AI Tools" },
          { value: "100+", label: "Creators" },
          { value: "24/7", label: "Support" },
        ].map((stat) => (
          <Card key={stat.label} variant="gradient" className="p-4 text-center">
            <p className="text-2xl font-bold gradient-text">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
