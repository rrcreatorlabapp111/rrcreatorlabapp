import { useNavigate } from "react-router-dom";
import { FileText, Lightbulb, ExternalLink, Sparkles, BarChart3, ChevronRight, User, LogIn, ArrowRight, Hash, Search, Flame, Settings } from "lucide-react";
import { QuickActionButton } from "@/components/home/QuickActionButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const GOOGLE_FORM_LINK = "https://docs.google.com/forms/d/e/1FAIpQLSc7w7_crTXDPXa1Rz_2OOkAX7k_5jq88dEdLr8KiiaICcGh5g/viewform";

const quickActions = [
  { icon: FileText, label: "Script Generator", path: "/tools/script" },
  { icon: Lightbulb, label: "Short Ideas", path: "/tools/shorts-ideas" },
  { icon: ExternalLink, label: "Contact Us", path: GOOGLE_FORM_LINK, external: true },
];

const recommendedTools = [
  { icon: Hash, title: "Tag Generator", description: "Optimize your reach", path: "/tools/tags" },
  { icon: Search, title: "SEO Score", description: "Improve discoverability", path: "/tools/seo" },
  { icon: Flame, title: "Trending Topics", description: "Catch viral waves", path: "/tools/trending" },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

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
        {/* Primary CTA */}
        <Button
          variant="gradient"
          size="xl"
          className="mt-4 w-full max-w-xs"
          onClick={() => navigate("/tools")}
        >
          Start Creating
          <ArrowRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Auth Card - Show for logged out users */}
      {!loading && !user && (
        <Card
          variant="gradient"
          className="p-4 cursor-pointer hover:border-primary/50 transition-all duration-300 animate-slide-up"
          onClick={() => navigate("/auth")}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-muted">
              <LogIn className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">Sign In</h2>
              <p className="text-sm text-muted-foreground">
                Save your content & track growth
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
      )}

      {/* Profile Card - Show for logged in users */}
      {!loading && user && (
        <Card
          variant="gradient"
          className="p-4 cursor-pointer hover:border-primary/50 transition-all duration-300 animate-slide-up"
          onClick={() => navigate("/profile")}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl gradient-primary">
              <Settings className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">My Profile</h2>
              <p className="text-sm text-muted-foreground">
                Manage your account settings
              </p>
            </div>
            <div className="p-2 rounded-full bg-green-500/20">
              <User className="h-4 w-4 text-green-400" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
      )}

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
              {user ? "View analytics & saved content" : "Analytics, saved content & growth tracking"}
            </p>
          </div>
          {user && (
            <div className="p-2 rounded-full bg-green-500/20">
              <User className="h-4 w-4 text-green-400" />
            </div>
          )}
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </Card>

      {/* Quick Actions - Reduced to 3 */}
      <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
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

      {/* Recommended Tools Section */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recommended Tools</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/tools")} className="text-primary">
            View all
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {recommendedTools.map((tool) => (
            <Card
              key={tool.title}
              variant="gradient"
              className="p-3 cursor-pointer hover:border-primary/50 transition-all duration-300"
              onClick={() => navigate(tool.path)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg gradient-primary">
                  <tool.icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm">{tool.title}</h3>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Preview */}
      <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        {[
          { value: "14+", label: "AI Tools" },
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
