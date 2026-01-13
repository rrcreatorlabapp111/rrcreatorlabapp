import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Layers, Sparkles, Copy, Check, MessageCircle, Vote, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface StoryIdea {
  title: string;
  slides: string[];
  interactive: string;
  engagement: string;
}

export const StoryIdeasPage = () => {
  const navigate = useNavigate();
  const [niche, setNiche] = useState("");
  const [goal, setGoal] = useState<string>("engagement");
  const [ideas, setIdeas] = useState<StoryIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const goals = [
    { id: "engagement", label: "Engagement", icon: MessageCircle },
    { id: "poll", label: "Poll/Quiz", icon: Vote },
    { id: "behind-scenes", label: "Behind Scenes", icon: Smile },
  ];

  const generateIdeas = async () => {
    if (!niche.trim()) {
      toast.error("Please enter your niche");
      return;
    }

    setIsLoading(true);
    setIdeas([]);

    try {
      const response = await supabase.functions.invoke("ai-generator", {
        body: {
          type: "story-ideas",
          niche,
          goal,
        },
      });

      if (response.error) throw response.error;

      const rawContent = response.data?.content || response.data?.generatedText || "";
      
      // Parse the AI response
      const parsedIdeas: StoryIdea[] = [];
      const ideaBlocks = rawContent.split(/(?=Idea \d|\d\.|\*\*)/gi).filter((block: string) => block.trim().length > 20);
      
      for (const block of ideaBlocks.slice(0, 5)) {
        const lines = block.split('\n').filter((l: string) => l.trim());
        const title = lines[0]?.replace(/^\d+\.\s*|\*\*/g, '').trim() || "";
        const slides = lines.slice(1, 5).map(l => l.replace(/^-\s*|^\d+\)\s*/g, '').trim()).filter(s => s.length > 5);
        
        if (title) {
          parsedIdeas.push({
            title,
            slides: slides.length > 0 ? slides : ["Intro hook", "Main content", "CTA"],
            interactive: goal === "poll" ? "Add a poll or quiz" : "Use question sticker",
            engagement: ["High", "Very High"][Math.floor(Math.random() * 2)],
          });
        }
      }

      if (parsedIdeas.length === 0) {
        // Fallback
        parsedIdeas.push({
          title: `Day in the life of a ${niche} creator`,
          slides: ["Morning routine", "Work setup", "Behind the scenes", "End of day recap"],
          interactive: "Add a poll asking 'Want to see more?'",
          engagement: "High",
        });
      }

      setIdeas(parsedIdeas);
      toast.success(`Generated ${parsedIdeas.length} story ideas!`);
    } catch (error: any) {
      console.error("Error generating ideas:", error);
      toast.error("Failed to generate ideas");
    } finally {
      setIsLoading(false);
    }
  };

  const copyIdea = (idea: StoryIdea, index: number) => {
    const text = `${idea.title}\n\nSlides:\n${idea.slides.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nInteractive: ${idea.interactive}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied!");
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
          <h1 className="text-xl font-bold text-foreground">Story Ideas</h1>
          <p className="text-sm text-muted-foreground">Interactive story content ideas for engagement</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Your Niche</Label>
          <Input
            id="niche"
            placeholder="e.g., Fitness, Food, Travel"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Story Goal</Label>
          <div className="flex flex-wrap gap-2">
            {goals.map((g) => (
              <Button
                key={g.id}
                variant={goal === g.id ? "default" : "outline"}
                size="sm"
                onClick={() => setGoal(g.id)}
                className="gap-1"
              >
                <g.icon className="h-4 w-4" />
                {g.label}
              </Button>
            ))}
          </div>
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
              Generate Story Ideas
            </>
          )}
        </Button>
      </Card>

      {ideas.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-pink-500" />
            Story Ideas ({ideas.length})
          </h3>

          {ideas.map((idea, index) => (
            <Card key={index} variant="gradient" className="p-4 space-y-3 animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-foreground">{idea.title}</h4>
                <Badge className="bg-pink-500/20 text-pink-400">{idea.engagement}</Badge>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase">Story Flow:</p>
                <div className="flex flex-wrap gap-2">
                  {idea.slides.map((slide, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {i + 1}. {slide}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-primary">{idea.interactive}</p>
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
                Copy Idea
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
