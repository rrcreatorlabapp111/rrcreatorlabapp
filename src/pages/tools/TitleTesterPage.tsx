import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Copy, Check, RefreshCw, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface TitleVariant {
  title: string;
  style: string;
  predictedCTR: string;
  strengths: string[];
}

export const TitleTesterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [variants, setVariants] = useState<TitleVariant[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const generateVariants = async () => {
    if (!topic.trim()) {
      toast({ title: "Enter your video topic", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));

    const titleVariants: TitleVariant[] = [
      {
        title: `How to ${topic} (Step-by-Step Guide)`,
        style: "Tutorial",
        predictedCTR: "4.2%",
        strengths: ["Clear value proposition", "Beginner-friendly", "Searchable format"],
      },
      {
        title: `I Tried ${topic} for 30 Days - Here's What Happened`,
        style: "Story/Challenge",
        predictedCTR: "5.8%",
        strengths: ["Creates curiosity", "Personal angle", "Time-bound hook"],
      },
      {
        title: `${topic}: The ONLY Guide You'll Ever Need`,
        style: "Authority",
        predictedCTR: "4.5%",
        strengths: ["Positions as definitive", "Bold claim", "Implies completeness"],
      },
      {
        title: `Why ${topic} is HARDER Than You Think`,
        style: "Contrarian",
        predictedCTR: "5.1%",
        strengths: ["Pattern interrupt", "Creates tension", "Appeals to experienced viewers"],
      },
      {
        title: `${topic} for Beginners (2025 Complete Guide)`,
        style: "Evergreen",
        predictedCTR: "3.9%",
        strengths: ["SEO optimized", "Year-stamped freshness", "Clear audience targeting"],
      },
      {
        title: `Watch This Before You Try ${topic}`,
        style: "Warning/Advice",
        predictedCTR: "5.4%",
        strengths: ["Creates urgency", "Implies insider knowledge", "Protective tone"],
      },
    ];

    // Add keyword to variants if provided
    if (keyword) {
      titleVariants.forEach((v, i) => {
        if (i < 3 && !v.title.toLowerCase().includes(keyword.toLowerCase())) {
          v.title = v.title.replace(topic, `${topic} ${keyword}`);
        }
      });
    }

    setVariants(titleVariants);
    setIsLoading(false);
    toast({ title: "Generated 6 title variants!" });
  };

  const copyTitle = (title: string, index: number) => {
    navigator.clipboard.writeText(title);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const selectWinner = (index: number) => {
    setSelectedIndex(index);
    toast({ title: "Winner selected!", description: "Use this title for your video" });
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
          <h1 className="text-xl font-bold text-foreground">Title Tester</h1>
          <p className="text-sm text-muted-foreground">Generate & compare title variants</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Video Topic</Label>
          <Input
            id="topic"
            placeholder="e.g., meal prep, learn guitar, build a website"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="keyword">Target Keyword (optional)</Label>
          <Input
            id="keyword"
            placeholder="e.g., for beginners, fast, easy"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <Button onClick={generateVariants} disabled={isLoading} className="w-full gap-2">
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isLoading ? "Generating..." : "Generate Variants"}
        </Button>
      </Card>

      {variants.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Title Variants</h3>
            <p className="text-xs text-muted-foreground">Tap ❤️ to select winner</p>
          </div>

          {variants.map((variant, index) => (
            <Card
              key={index}
              variant="gradient"
              className={`p-4 space-y-3 transition-all ${
                selectedIndex === index ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground leading-tight">{variant.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {variant.style}
                    </Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      {variant.predictedCTR} CTR
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => selectWinner(index)}
                    className={selectedIndex === index ? "text-red-400" : ""}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyTitle(variant.title, index)}
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                {variant.strengths.map((s, i) => (
                  <span key={i} className="inline-block mr-2">✓ {s}</span>
                ))}
              </div>
            </Card>
          ))}

          <Card variant="gradient" className="p-4">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Pro tip:</strong> Test your top 2-3 titles as community posts before uploading to see which gets more engagement.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};
