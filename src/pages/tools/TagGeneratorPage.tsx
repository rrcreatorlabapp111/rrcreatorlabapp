import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Hash, Copy, Check, Sparkles, Target, TrendingUp, Search, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const platforms = ["YouTube", "Instagram"];

interface TagResults {
  primaryTags: string[];
  lsiTags: string[];
  longTailKeywords: string[];
  trendingTags: string[];
  relatedTopics: { topic: string; description: string }[];
}

export const TagGeneratorPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [results, setResults] = useState<TagResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState("");

  const generateTags = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsLoading(true);
    setResults(null);
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
            type: "tags",
            data: { topic, platform },
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
        throw new Error("Failed to generate tags");
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

      // Parse the JSON from the response
      const jsonMatch = fullContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          setResults({
            primaryTags: parsed.primaryTags || [],
            lsiTags: parsed.lsiTags || [],
            longTailKeywords: parsed.longTailKeywords || [],
            trendingTags: parsed.trendingTags || [],
            relatedTopics: Array.isArray(parsed.relatedTopics) 
              ? parsed.relatedTopics.map((t: any) => 
                  typeof t === 'string' ? { topic: t, description: '' } : t
                )
              : [],
          });
        } catch {
          // If JSON parsing fails, extract tags from text
          const allTags = fullContent.match(/#?\w+(?:\s+\w+)*/g) || [];
          setResults({
            primaryTags: allTags.slice(0, 15),
            lsiTags: [],
            longTailKeywords: [],
            trendingTags: [],
            relatedTopics: [],
          });
        }
      }
      
      toast.success("SEO tags generated successfully!");
    } catch (error) {
      console.error("Error generating tags:", error);
      toast.error("Failed to generate tags. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyTags = (tags: string[], section: string) => {
    const formattedTags = platform === "Instagram" 
      ? tags.map(t => t.startsWith('#') ? t : `#${t.replace(/\s+/g, '')}`).join(" ")
      : tags.join(", ");
    navigator.clipboard.writeText(formattedTags);
    setCopied(section);
    toast.success(`${section} copied to clipboard!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAllTags = () => {
    if (!results) return;
    const allTags = [
      ...results.primaryTags,
      ...results.lsiTags,
      ...results.longTailKeywords,
      ...results.trendingTags,
    ];
    const formattedTags = platform === "Instagram"
      ? allTags.map(t => t.startsWith('#') ? t : `#${t.replace(/\s+/g, '')}`).join(" ")
      : allTags.join(", ");
    navigator.clipboard.writeText(formattedTags);
    setCopied("all");
    toast.success("All tags copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const renderTagSection = (
    title: string,
    tags: string[],
    icon: React.ReactNode,
    sectionKey: string,
    color: string
  ) => {
    if (tags.length === 0) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium text-sm">{title}</span>
            <Badge variant="secondary" className="text-xs">{tags.length}</Badge>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => copyTags(tags, sectionKey)}
            className="h-7 text-xs"
          >
            {copied === sectionKey ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <span
              key={index}
              className={`px-2.5 py-1 rounded-full text-xs ${color} border border-border/50`}
            >
              {platform === "Instagram" && !tag.startsWith('#') ? `#${tag.replace(/\s+/g, '')}` : tag}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">SEO Tag Generator</h1>
          <p className="text-sm text-muted-foreground">AI-powered keyword research</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic / Keyword</Label>
          <Input
            id="topic"
            placeholder="e.g., Photography tips, Cooking recipes, Tech reviews"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-muted border-border"
          />
        </div>

        <div className="space-y-2">
          <Label>Platform</Label>
          <div className="flex gap-2">
            {platforms.map((p) => (
              <Button
                key={p}
                variant={platform === p ? "default" : "outline"}
                onClick={() => setPlatform(p)}
                className="flex-1"
              >
                {p}
              </Button>
            ))}
          </div>
        </div>

        <Button
          variant="gradient"
          className="w-full"
          onClick={generateTags}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-foreground border-t-transparent rounded-full" />
              Researching keywords...
            </div>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate SEO Tags
            </>
          )}
        </Button>
      </Card>

      {isLoading && rawContent && (
        <Card className="p-4">
          <p className="text-xs text-muted-foreground animate-pulse">Analyzing keywords...</p>
        </Card>
      )}

      {results && (
        <div className="space-y-4 animate-slide-up">
          <Card variant="glow" className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Hash className="h-5 w-5 text-primary" />
                Generated Tags
              </h2>
              <Button variant="outline" size="sm" onClick={copyAllTags}>
                {copied === "all" ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                Copy All
              </Button>
            </div>

            <div className="space-y-5">
              {renderTagSection(
                "Primary Tags",
                results.primaryTags,
                <Target className="h-4 w-4 text-primary" />,
                "primary",
                "bg-primary/10 text-primary"
              )}
              
              {renderTagSection(
                "LSI Keywords",
                results.lsiTags,
                <Search className="h-4 w-4 text-blue-500" />,
                "lsi",
                "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              )}
              
              {renderTagSection(
                "Long-tail Keywords",
                results.longTailKeywords,
                <Hash className="h-4 w-4 text-green-500" />,
                "longtail",
                "bg-green-500/10 text-green-600 dark:text-green-400"
              )}
              
              {renderTagSection(
                "Trending Tags",
                results.trendingTags,
                <TrendingUp className="h-4 w-4 text-orange-500" />,
                "trending",
                "bg-orange-500/10 text-orange-600 dark:text-orange-400"
              )}
            </div>
          </Card>

          {results.relatedTopics.length > 0 && (
            <Card className="p-5 space-y-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Related Topics to Explore
              </h2>
              <div className="space-y-3">
                {results.relatedTopics.map((item, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">{item.topic}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
