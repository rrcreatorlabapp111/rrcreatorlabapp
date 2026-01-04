import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, RefreshCw, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface TrendingTopic {
  topic: string;
  category: string;
  heatLevel: "hot" | "rising" | "new";
  searchVolume: string;
  opportunity: string;
}

export const TrendingTopicsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [niche, setNiche] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const discoverTrends = async () => {
    if (!niche.trim()) {
      toast({ title: "Enter your niche", description: "We need to know your niche to find trends", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    // Simulated trending topics based on niche
    await new Promise(r => setTimeout(r, 1500));

    const trendingTopics: TrendingTopic[] = [
      {
        topic: `${niche} for beginners 2025`,
        category: "Tutorial",
        heatLevel: "hot",
        searchVolume: "50K+",
        opportunity: "High - Many searching, moderate competition",
      },
      {
        topic: `Best ${niche} tips nobody talks about`,
        category: "Tips",
        heatLevel: "rising",
        searchVolume: "20K+",
        opportunity: "Medium - Growing interest, good for early content",
      },
      {
        topic: `${niche} mistakes to avoid`,
        category: "Educational",
        heatLevel: "hot",
        searchVolume: "35K+",
        opportunity: "High - Evergreen topic with consistent searches",
      },
      {
        topic: `How I mastered ${niche} in 30 days`,
        category: "Story",
        heatLevel: "new",
        searchVolume: "10K+",
        opportunity: "Medium - Personal stories perform well",
      },
      {
        topic: `${niche} trends to watch in 2025`,
        category: "Trend",
        heatLevel: "rising",
        searchVolume: "25K+",
        opportunity: "High - Time-sensitive, act fast",
      },
      {
        topic: `${niche} vs alternatives - honest comparison`,
        category: "Comparison",
        heatLevel: "hot",
        searchVolume: "40K+",
        opportunity: "High - Decision-making content gets high engagement",
      },
    ];

    setTopics(trendingTopics);
    setIsLoading(false);
    toast({ title: "Trends discovered!", description: "Found 6 trending topics for your niche" });
  };

  const copyTopic = (topic: string, index: number) => {
    navigator.clipboard.writeText(topic);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getHeatBadge = (level: string) => {
    switch (level) {
      case "hot":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">🔥 Hot</Badge>;
      case "rising":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">📈 Rising</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">✨ New</Badge>;
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/tools")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Trending Topics</h1>
          <p className="text-sm text-muted-foreground">Discover what's trending in your niche</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Your Niche</Label>
          <Input
            id="niche"
            placeholder="e.g., fitness, cooking, tech reviews"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
        </div>

        <Button onClick={discoverTrends} disabled={isLoading} className="w-full gap-2">
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Flame className="h-4 w-4" />
          )}
          {isLoading ? "Discovering..." : "Discover Trends"}
        </Button>
      </Card>

      {topics.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="font-semibold text-foreground">Trending in {niche}</h3>
          {topics.map((topic, index) => (
            <Card
              key={index}
              variant="gradient"
              className="p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{topic.topic}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {topic.category}
                    </Badge>
                    {getHeatBadge(topic.heatLevel)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyTopic(topic.topic, index)}
                  className="shrink-0"
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>📊 Search Volume: {topic.searchVolume}</p>
                <p>💡 {topic.opportunity}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
