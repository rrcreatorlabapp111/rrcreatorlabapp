import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flame, RefreshCw, Copy, Check, Sparkles, TrendingUp, Search, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TrendingTopic {
  topic: string;
  category: string;
  heatLevel: "Hot" | "Rising" | "Emerging";
  searchVolume: string;
  opportunity: string;
  contentAngle?: string;
}

export const TrendingTopicsPage = () => {
  const navigate = useNavigate();
  const [niche, setNiche] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [rawContent, setRawContent] = useState("");

  const discoverTrends = async () => {
    if (!niche.trim()) {
      toast.error("Please enter your niche");
      return;
    }

    setIsLoading(true);
    setTopics([]);
    setRawContent("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generator`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            type: "trending-topics",
            data: { niche },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again later.");
          return;
        }
        if (response.status === 402) {
          toast.error("Credits exhausted. Please add more credits.");
          return;
        }
        throw new Error("Failed to discover trends");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                setRawContent(fullContent);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      // Parse topics from the response
      const parsedTopics: TrendingTopic[] = [];
      
      const topicSections = fullContent.split(/(?:\d+\.|##?\s*(?:Topic\s*)?\d+|---)/i).filter(s => s.trim().length > 20);
      
      for (const section of topicSections) {
        const topicMatch = section.match(/(?:Topic\s*(?:name)?|Title)[:*]*\s*["""]?(.+?)["""]?(?:\n|$)/i) 
          || section.match(/^\s*[*-]?\s*(.+?)(?:\n|$)/);
        const categoryMatch = section.match(/(?:Category|Type)[:*]*\s*(.+?)(?:\n|$)/i);
        const heatMatch = section.match(/(?:Heat|Level|Status)[:*]*\s*(.+?)(?:\n|$)/i);
        const volumeMatch = section.match(/(?:Search\s*Volume|Volume)[:*]*\s*(.+?)(?:\n|$)/i);
        const opportunityMatch = section.match(/(?:Opportunity|Score|Why)[:*]*\s*(.+?)(?:\n|$)/i);
        const angleMatch = section.match(/(?:Content\s*Angle|Angle|Suggestion)[:*]*\s*(.+?)(?:\n|$)/i);

        if (topicMatch) {
          const heatLevel = heatMatch?.[1]?.trim().toLowerCase() || '';
          parsedTopics.push({
            topic: topicMatch[1].replace(/^[*-]\s*/, '').trim(),
            category: categoryMatch?.[1]?.trim() || "General",
            heatLevel: heatLevel.includes('hot') ? 'Hot' : heatLevel.includes('rising') ? 'Rising' : 'Emerging',
            searchVolume: volumeMatch?.[1]?.trim() || "Growing",
            opportunity: opportunityMatch?.[1]?.trim() || "",
            contentAngle: angleMatch?.[1]?.trim(),
          });
        }
      }

      if (parsedTopics.length > 0) {
        setTopics(parsedTopics.slice(0, 8));
      }

      toast.success(`Found ${parsedTopics.length} trending topics!`);
    } catch (error) {
      console.error("Error discovering trends:", error);
      toast.error("Failed to discover trends. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyTopic = (topic: string, index: number) => {
    navigator.clipboard.writeText(topic);
    setCopiedIndex(index);
    toast.success("Topic copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getHeatBadge = (level: string) => {
    switch (level) {
      case "Hot":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">🔥 Hot</Badge>;
      case "Rising":
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">📈 Rising</Badge>;
      default:
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">✨ Emerging</Badge>;
    }
  };

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Trending Topics</h1>
          <p className="text-sm text-muted-foreground">AI-powered trend discovery</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Your Niche</Label>
          <Input
            id="niche"
            placeholder="e.g., fitness, cooking, tech reviews, gaming"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="bg-muted border-border"
          />
        </div>

        <Button 
          variant="gradient"
          onClick={discoverTrends} 
          disabled={isLoading} 
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Discovering trends...
            </div>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Discover Trends
            </>
          )}
        </Button>
      </Card>

      {isLoading && rawContent && (
        <Card className="p-4">
          <p className="text-xs text-muted-foreground animate-pulse">Analyzing trending topics...</p>
        </Card>
      )}

      {topics.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Trending in {niche}
          </h3>
          {topics.map((topic, index) => (
            <Card
              key={index}
              variant="gradient"
              className="p-4 space-y-3 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 space-y-2">
                  <p className="font-medium text-foreground">{topic.topic}</p>
                  <div className="flex items-center gap-2 flex-wrap">
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
                <p className="flex items-center gap-1">
                  <Search className="h-3 w-3" />
                  Search Volume: {topic.searchVolume}
                </p>
                {topic.opportunity && (
                  <p className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    {topic.opportunity}
                  </p>
                )}
                {topic.contentAngle && (
                  <p className="flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-yellow-500" />
                    {topic.contentAngle}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
