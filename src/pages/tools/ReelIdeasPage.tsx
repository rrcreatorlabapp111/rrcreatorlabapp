import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Video, Sparkles, Copy, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ReelIdea {
  title: string;
  hook: string;
  duration: string;
}

export const ReelIdeasPage = () => {
  const navigate = useNavigate();
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("engaging");
  const [goal, setGoal] = useState("growth");
  const [ideas, setIdeas] = useState<ReelIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const tones = ["engaging", "funny", "educational", "inspirational", "controversial"];
  const goals = ["growth", "engagement", "sales", "brand awareness", "community"];

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
          type: "instagram-reel-ideas",
          niche,
          audience,
          tone,
          goal,
        },
      });

      if (response.error) throw response.error;

      const rawContent = response.data?.content || response.data?.generatedText || "";
      
      // Parse the AI response
      const parsedIdeas: ReelIdea[] = [];
      const ideaBlocks = rawContent.split(/(?=\d+[\.\)])/g).filter((block: string) => block.trim().length > 10);
      
      for (const block of ideaBlocks.slice(0, 30)) {
        const lines = block.split('\n').filter((l: string) => l.trim());
        const ideaLine = lines.find((l: string) => l.toLowerCase().includes('idea') || l.match(/^\d+[\.\)]/));
        const hookLine = lines.find((l: string) => l.toLowerCase().includes('hook'));
        const durationLine = lines.find((l: string) => l.toLowerCase().includes('length') || l.toLowerCase().includes('duration') || l.toLowerCase().includes('sec'));
        
        const title = ideaLine?.replace(/^\d+[\.\)]\s*|reel idea:?\s*/gi, '').trim() || 
                      lines[0]?.replace(/^\d+[\.\)]\s*/g, '').trim() || "";
        const hook = hookLine?.replace(/hook:?\s*/gi, '').trim() || "";
        const duration = durationLine?.match(/\d+(-\d+)?\s*sec(ond)?s?/i)?.[0] || "15-30 sec";
        
        if (title && title.length > 5) {
          parsedIdeas.push({ title, hook, duration });
        }
      }

      if (parsedIdeas.length === 0) {
        // Fallback
        parsedIdeas.push(
          { title: `Day in the life of a ${niche} creator`, hook: "POV: You wake up at 5am to...", duration: "30 sec" },
          { title: `3 mistakes ${niche} beginners make`, hook: "Stop doing this immediately...", duration: "15 sec" },
          { title: `${niche} hack that changed everything`, hook: "I wish I knew this sooner...", duration: "20 sec" },
        );
      }

      setIdeas(parsedIdeas);
      toast.success(`Generated ${parsedIdeas.length} reel ideas!`);
    } catch (error: any) {
      console.error("Error generating ideas:", error);
      toast.error("Failed to generate ideas");
    } finally {
      setIsLoading(false);
    }
  };

  const copyIdea = (idea: ReelIdea, index: number) => {
    const text = `Reel Idea: ${idea.title}\nHook: ${idea.hook}\nDuration: ${idea.duration}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Reel Ideas Generator</h1>
          <p className="text-sm text-muted-foreground">Get 30 viral Instagram Reel ideas</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Your Niche *</Label>
          <Input
            id="niche"
            placeholder="e.g., Fitness, Travel, Business"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience">Target Audience</Label>
          <Input
            id="audience"
            placeholder="e.g., Women 25-35, entrepreneurs"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tones.map((t) => (
                  <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Goal</Label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {goals.map((g) => (
                  <SelectItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={generateIdeas} className="w-full gap-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating 30 Ideas...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate 30 Reel Ideas
            </>
          )}
        </Button>
      </Card>

      {ideas.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Video className="h-4 w-4 text-pink-500" />
            Generated Ideas ({ideas.length})
          </h3>

          {ideas.map((idea, index) => (
            <Card key={index} variant="gradient" className="p-4 space-y-2 animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {idea.duration}
                    </Badge>
                  </div>
                  <p className="font-medium text-foreground">{idea.title}</p>
                  {idea.hook && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="text-pink-500 font-medium">Hook:</span> {idea.hook}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => copyIdea(idea, index)}>
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
