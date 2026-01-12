import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lightbulb, Copy, Check, Sparkles, Film, Zap, Music, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const platforms = ["YouTube Shorts", "Instagram Reels", "TikTok"];

interface Idea {
  title: string;
  hook: string;
  contentFlow?: string;
  audioSuggestion?: string;
  engagementPotential?: string;
}

export const ShortsIdeasPage = () => {
  const navigate = useNavigate();
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("YouTube Shorts");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [rawContent, setRawContent] = useState("");

  const generateIdeas = async () => {
    if (!niche.trim()) {
      toast.error("Please enter your niche");
      return;
    }

    setIsLoading(true);
    setIdeas([]);
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
            type: "shorts-ideas",
            data: { niche, platform },
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
        throw new Error("Failed to generate ideas");
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

      // Parse ideas from the response
      const parsedIdeas: Idea[] = [];
      
      // Try to find numbered items in the response
      const ideaMatches = fullContent.split(/(?:\d+\.|##?\s*(?:Idea\s*)?\d+)/i).filter(s => s.trim());
      
      for (const ideaText of ideaMatches) {
        const titleMatch = ideaText.match(/(?:Title|Video)[:*]*\s*["""]?(.+?)["""]?(?:\n|$)/i);
        const hookMatch = ideaText.match(/(?:Hook|Opening|First\s*\d*\s*seconds?)[:*]*\s*["""]?(.+?)["""]?(?:\n|$)/i);
        const flowMatch = ideaText.match(/(?:Content\s*flow|Flow|Content|Breakdown)[:*]*\s*(.+?)(?=\n(?:[A-Z]|\d+\.|Trend|Audio|Engagement|$))/is);
        const audioMatch = ideaText.match(/(?:Trend|Audio|Sound|Format)[:*]*\s*(.+?)(?:\n|$)/i);
        const engagementMatch = ideaText.match(/(?:Engagement|Potential|Estimated)[:*]*\s*(.+?)(?:\n|$)/i);

        if (titleMatch || hookMatch) {
          parsedIdeas.push({
            title: titleMatch?.[1]?.trim() || "Untitled",
            hook: hookMatch?.[1]?.trim() || "",
            contentFlow: flowMatch?.[1]?.trim(),
            audioSuggestion: audioMatch?.[1]?.trim(),
            engagementPotential: engagementMatch?.[1]?.trim(),
          });
        }
      }

      if (parsedIdeas.length > 0) {
        setIdeas(parsedIdeas);
      } else {
        // Fallback: split by double newlines
        const lines = fullContent.split(/\n\n+/).filter(l => l.trim().length > 20);
        setIdeas(lines.slice(0, 6).map((line, i) => ({
          title: line.split('\n')[0]?.replace(/^[\d\.\-\*]+\s*/, '').trim() || `Idea ${i + 1}`,
          hook: line.split('\n').slice(1).join(' ').substring(0, 150) || "",
        })));
      }

      toast.success("Ideas generated successfully!");
    } catch (error) {
      console.error("Error generating ideas:", error);
      toast.error("Failed to generate ideas. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyIdea = (index: number) => {
    const idea = ideas[index];
    const text = `Title: ${idea.title}\nHook: ${idea.hook}${idea.contentFlow ? `\nContent: ${idea.contentFlow}` : ''}${idea.audioSuggestion ? `\nAudio: ${idea.audioSuggestion}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Idea copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Shorts / Reels Ideas</h1>
          <p className="text-sm text-muted-foreground">AI-powered viral content ideas</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Your Niche</Label>
          <Input
            id="niche"
            placeholder="e.g., Fitness, Cooking, Tech, Gaming"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="bg-muted border-border"
          />
        </div>

        <div className="space-y-2">
          <Label>Platform</Label>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <Button
                key={p}
                variant={platform === p ? "default" : "outline"}
                onClick={() => setPlatform(p)}
                size="sm"
              >
                {p}
              </Button>
            ))}
          </div>
        </div>

        <Button
          variant="gradient"
          className="w-full"
          onClick={generateIdeas}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-foreground border-t-transparent rounded-full" />
              Generating viral ideas...
            </div>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Ideas
            </>
          )}
        </Button>
      </Card>

      {isLoading && rawContent && (
        <Card className="p-4">
          <p className="text-xs text-muted-foreground animate-pulse">Creating viral concepts...</p>
        </Card>
      )}

      {ideas.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            Content Ideas ({ideas.length})
          </h2>
          {ideas.map((idea, index) => (
            <Card
              key={index}
              variant="gradient"
              className="p-4 space-y-3 animate-slide-up cursor-pointer hover:border-primary/50 transition-all"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => copyIdea(index)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Idea #{index + 1}</span>
                    {idea.engagementPotential && (
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {idea.engagementPotential}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground">{idea.title}</h3>
                  
                  {idea.hook && (
                    <p className="text-sm text-muted-foreground">
                      <Zap className="h-3 w-3 inline mr-1 text-yellow-500" />
                      <span className="text-primary font-medium">Hook:</span> {idea.hook}
                    </p>
                  )}
                  
                  {idea.contentFlow && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      📋 {idea.contentFlow}
                    </p>
                  )}
                  
                  {idea.audioSuggestion && (
                    <p className="text-xs text-muted-foreground">
                      <Music className="h-3 w-3 inline mr-1 text-purple-500" />
                      {idea.audioSuggestion}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
