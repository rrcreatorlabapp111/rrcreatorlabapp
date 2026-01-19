import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image, Sparkles, Copy, Check, Palette, Type, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";


interface ThumbnailIdea {
  concept: string;
  colorScheme: string;
  textOverlay: string;
  emotion: string;
  elements: string[];
  ctrPotential: string;
}

export const ThumbnailIdeasPage = () => {
  const navigate = useNavigate();
  const [videoTitle, setVideoTitle] = useState("");
  const [niche, setNiche] = useState("");
  const [ideas, setIdeas] = useState<ThumbnailIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateIdeas = async () => {
    if (!videoTitle.trim()) {
      toast.error("Please enter a video title");
      return;
    }

    setIsLoading(true);
    setIdeas([]);

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
            type: "thumbnail-ideas",
            data: { topic: videoTitle, niche: niche || "general" },
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
              if (content) fullContent += content;
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      // Parse the AI response
      const parsedIdeas: ThumbnailIdea[] = [];
      const ideaBlocks = fullContent.split(/(?=Concept \d|Idea \d|\d\.)/g).filter((block: string) => block.trim());
      
      for (const block of ideaBlocks.slice(0, 5)) {
        const idea: ThumbnailIdea = {
          concept: "",
          colorScheme: "",
          textOverlay: "",
          emotion: "",
          elements: [],
          ctrPotential: "Medium",
        };

        const conceptMatch = block.match(/(?:concept|visual|main)[:\s]*([^\n]+)/i);
        const colorMatch = block.match(/color[s]?[:\s]*([^\n]+)/i);
        const textMatch = block.match(/(?:text|overlay)[:\s]*([^\n]+)/i);
        const emotionMatch = block.match(/(?:emotion|expression)[:\s]*([^\n]+)/i);
        const elementsMatch = block.match(/element[s]?[:\s]*([^\n]+)/i);
        const ctrMatch = block.match(/(?:ctr|potential|why)[:\s]*([^\n]+)/i);

        idea.concept = conceptMatch?.[1]?.trim() || block.split('\n')[0]?.replace(/^\d+\.\s*/, '').trim() || "";
        idea.colorScheme = colorMatch?.[1]?.trim() || "Bold contrasting colors";
        idea.textOverlay = textMatch?.[1]?.trim() || "Short, impactful text";
        idea.emotion = emotionMatch?.[1]?.trim() || "Curiosity";
        idea.elements = elementsMatch?.[1]?.split(',').map(e => e.trim()) || ["Face close-up", "Bright background"];
        idea.ctrPotential = ctrMatch?.[1]?.trim() || "High";

        if (idea.concept && idea.concept.length > 5) {
          parsedIdeas.push(idea);
        }
      }

      if (parsedIdeas.length === 0) {
        parsedIdeas.push({
          concept: `Shocked face looking at "${videoTitle}" result`,
          colorScheme: "Yellow and red gradient",
          textOverlay: "SHOCKING!",
          emotion: "Surprise",
          elements: ["Close-up face", "Bold text", "Arrow pointing"],
          ctrPotential: "High",
        });
      }

      setIdeas(parsedIdeas);
      toast.success(`Generated ${parsedIdeas.length} thumbnail ideas!`);
    } catch (error: any) {
      console.error("Error generating ideas:", error);
      toast.error("Failed to generate ideas");
    } finally {
      setIsLoading(false);
    }
  };

  const copyIdea = (idea: ThumbnailIdea, index: number) => {
    const text = `Thumbnail Concept: ${idea.concept}\nColor Scheme: ${idea.colorScheme}\nText: ${idea.textOverlay}\nEmotion: ${idea.emotion}\nElements: ${idea.elements.join(", ")}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getCtrColor = (ctr: string) => {
    if (ctr.toLowerCase().includes("high")) return "bg-green-500/20 text-green-400";
    if (ctr.toLowerCase().includes("medium")) return "bg-yellow-500/20 text-yellow-400";
    return "bg-red-500/20 text-red-400";
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
          <h1 className="text-xl font-bold text-foreground">Thumbnail Ideas</h1>
          <p className="text-sm text-muted-foreground">AI-powered thumbnail concepts for higher CTR</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Video Title</Label>
          <Input
            id="title"
            placeholder="e.g., How I Made $10K in 30 Days"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="niche">Niche (optional)</Label>
          <Input
            id="niche"
            placeholder="e.g., Business, Gaming, Tech"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
        </div>

        <Button onClick={generateIdeas} className="w-full gap-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating Ideas...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Thumbnail Ideas
            </>
          )}
        </Button>
      </Card>

      {ideas.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Image className="h-4 w-4 text-primary" />
            Thumbnail Concepts ({ideas.length})
          </h3>

          {ideas.map((idea, index) => (
            <Card key={index} variant="gradient" className="p-4 space-y-3 animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-foreground flex-1">{idea.concept}</h4>
                <Badge className={getCtrColor(idea.ctrPotential)}>
                  {idea.ctrPotential} CTR
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{idea.colorScheme}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{idea.textOverlay}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{idea.emotion}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {idea.elements.map((element, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {element}
                  </Badge>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => copyIdea(idea, index)}
              >
                {copiedIndex === index ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy Concept
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
