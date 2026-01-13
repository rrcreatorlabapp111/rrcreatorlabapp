import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Type, Sparkles, Copy, Check, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Caption {
  text: string;
  style: string;
  hashtags: string[];
  cta: string;
}

export const CaptionGeneratorPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<string>("engaging");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const tones = [
    { id: "engaging", label: "Engaging" },
    { id: "funny", label: "Funny" },
    { id: "inspirational", label: "Inspirational" },
    { id: "professional", label: "Professional" },
    { id: "casual", label: "Casual" },
  ];

  const generateCaptions = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a post topic");
      return;
    }

    setIsLoading(true);
    setCaptions([]);

    try {
      const response = await supabase.functions.invoke("ai-generator", {
        body: {
          type: "instagram-captions",
          topic,
          tone,
        },
      });

      if (response.error) throw response.error;

      const rawContent = response.data?.content || response.data?.generatedText || "";
      
      // Parse the AI response
      const parsedCaptions: Caption[] = [];
      const captionBlocks = rawContent.split(/(?=Caption \d|\d\.|Option \d)/gi).filter((block: string) => block.trim().length > 20);
      
      for (const block of captionBlocks.slice(0, 5)) {
        const lines = block.split('\n').filter((l: string) => l.trim());
        const mainText = lines.find((l: string) => l.length > 30 && !l.startsWith('#'))?.replace(/^\d+\.\s*|^Caption\s*\d*:\s*/i, '').trim() || "";
        const hashtagLine = lines.find((l: string) => l.includes('#')) || "";
        const hashtags = hashtagLine.match(/#\w+/g) || [];
        
        if (mainText) {
          const ctaLine = lines.find((l: string) => l.toLowerCase().includes('cta'))?.replace(/cta:\s*/i, '');
          parsedCaptions.push({
            text: mainText,
            style: tone,
            hashtags: hashtags.slice(0, 10),
            cta: ctaLine || "Link in bio 👆",
          });
        }
      }

      if (parsedCaptions.length === 0) {
        // Fallback
        parsedCaptions.push({
          text: `${topic} just hits different ✨ Drop a 🔥 if you agree!`,
          style: tone,
          hashtags: ["#viral", "#fyp", "#trending", "#instagram", "#reels"],
          cta: "Link in bio 👆",
        });
      }

      setCaptions(parsedCaptions);
      toast.success(`Generated ${parsedCaptions.length} captions!`);
    } catch (error: any) {
      console.error("Error generating captions:", error);
      toast.error("Failed to generate captions");
    } finally {
      setIsLoading(false);
    }
  };

  const copyCaption = (caption: Caption, index: number) => {
    const fullCaption = `${caption.text}\n\n${caption.cta}\n\n${caption.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullCaption);
    setCopiedIndex(index);
    toast.success("Caption copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
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
          <h1 className="text-xl font-bold text-foreground">Caption Generator</h1>
          <p className="text-sm text-muted-foreground">AI-powered Instagram captions with hooks & CTAs</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Post Topic / Idea</Label>
          <Textarea
            id="topic"
            placeholder="e.g., Sharing my morning routine for productivity"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Tone</Label>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <Button
                key={t.id}
                variant={tone === t.id ? "default" : "outline"}
                size="sm"
                onClick={() => setTone(t.id)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={generateCaptions} className="w-full gap-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating Captions...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Captions
            </>
          )}
        </Button>
      </Card>

      {captions.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Type className="h-4 w-4 text-pink-500" />
            Generated Captions ({captions.length})
          </h3>

          {captions.map((caption, index) => (
            <Card key={index} variant="gradient" className="p-4 space-y-3 animate-fade-in">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{caption.text}</p>
              
              <p className="text-primary font-medium">{caption.cta}</p>

              <div className="flex flex-wrap gap-1.5">
                {caption.hashtags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs text-pink-400">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => copyCaption(caption, index)}
              >
                {copiedIndex === index ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy Full Caption
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
