import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lightbulb, Copy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const platforms = ["YouTube Shorts", "Instagram Reels"];

interface Idea {
  title: string;
  hook: string;
}

export const ShortsIdeasPage = () => {
  const navigate = useNavigate();
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("YouTube Shorts");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateIdeas = () => {
    if (!niche.trim()) {
      toast.error("Please enter your niche");
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const generatedIdeas: Idea[] = [
        {
          title: `3 ${niche} mistakes you're making right now`,
          hook: "Stop! You're probably doing this wrong...",
        },
        {
          title: `The ${niche} hack nobody talks about`,
          hook: "I can't believe this actually works...",
        },
        {
          title: `POV: You finally mastered ${niche}`,
          hook: "Day 1 vs Day 365 of my journey",
        },
        {
          title: `If you're into ${niche}, you NEED this`,
          hook: "This changed everything for me",
        },
        {
          title: `What I wish I knew about ${niche} earlier`,
          hook: "Nobody told me this when I started...",
        },
        {
          title: `Rating popular ${niche} tips (honest review)`,
          hook: "Some of these are actually terrible...",
        },
        {
          title: `${niche} in under 60 seconds`,
          hook: "Here's everything you need to know",
        },
        {
          title: `Why most people fail at ${niche}`,
          hook: "It's not what you think...",
        },
        {
          title: `My honest ${niche} routine`,
          hook: "No gatekeeping, just real advice",
        },
        {
          title: `The ${niche} trend you should try`,
          hook: "Everyone's doing this wrong",
        },
      ];

      setIdeas(generatedIdeas);
      setIsLoading(false);
      toast.success("Ideas generated successfully!");
    }, 1500);
  };

  const copyIdea = (index: number) => {
    const idea = ideas[index];
    navigator.clipboard.writeText(`Title: ${idea.title}\nHook: ${idea.hook}`);
    setCopiedIndex(index);
    toast.success("Idea copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Shorts / Reels Ideas</h1>
          <p className="text-sm text-muted-foreground">Viral content ideas</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Your Niche</Label>
          <Input
            id="niche"
            placeholder="e.g., Fitness, Cooking, Tech"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
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
            <div className="animate-spin h-5 w-5 border-2 border-foreground border-t-transparent rounded-full" />
          ) : (
            <>
              <Lightbulb className="h-4 w-4" />
              Generate Ideas
            </>
          )}
        </Button>
      </Card>

      {ideas.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground">
            Content Ideas ({ideas.length})
          </h2>
          {ideas.map((idea, index) => (
            <Card
              key={index}
              variant="gradient"
              className="p-4 animate-slide-up cursor-pointer hover:border-primary/50 transition-all"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => copyIdea(index)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Idea #{index + 1}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{idea.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="text-primary">Hook:</span> {idea.hook}
                  </p>
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
