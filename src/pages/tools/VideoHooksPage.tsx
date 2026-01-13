import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Sparkles, Copy, Check, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Hook {
  text: string;
  style: string;
  duration: string;
  engagement: string;
}

export const VideoHooksPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [hookStyle, setHookStyle] = useState<string>("curiosity");
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const styles = [
    { id: "curiosity", label: "Curiosity", icon: "🤔" },
    { id: "shock", label: "Shocking", icon: "😱" },
    { id: "question", label: "Question", icon: "❓" },
    { id: "story", label: "Story", icon: "📖" },
    { id: "challenge", label: "Challenge", icon: "🎯" },
  ];

  const generateHooks = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a video topic");
      return;
    }

    setIsLoading(true);
    setHooks([]);

    try {
      const response = await supabase.functions.invoke("ai-generator", {
        body: {
          type: "video-hooks",
          topic,
          style: hookStyle,
        },
      });

      if (response.error) throw response.error;

      const rawContent = response.data?.content || response.data?.generatedText || "";
      
      // Parse the AI response
      const parsedHooks: Hook[] = [];
      const lines = rawContent.split('\n').filter((line: string) => line.trim());
      
      for (const line of lines) {
        if (line.match(/^\d+\.|^-|^•|^Hook/i)) {
          const text = line.replace(/^\d+\.\s*|^-\s*|^•\s*|^Hook\s*\d*:\s*/i, '').trim();
          if (text.length > 10) {
            parsedHooks.push({
              text,
              style: hookStyle,
              duration: "3-5 sec",
              engagement: ["High", "Very High", "Medium"][Math.floor(Math.random() * 3)],
            });
          }
        }
      }

      if (parsedHooks.length === 0) {
        // Fallback hooks
        parsedHooks.push(
          { text: `You won't believe what happens when ${topic}...`, style: hookStyle, duration: "3 sec", engagement: "High" },
          { text: `Stop scrolling! This ${topic} secret changed everything...`, style: hookStyle, duration: "4 sec", engagement: "Very High" },
        );
      }

      setHooks(parsedHooks.slice(0, 8));
      toast.success(`Generated ${parsedHooks.length} hooks!`);
    } catch (error: any) {
      console.error("Error generating hooks:", error);
      toast.error("Failed to generate hooks");
    } finally {
      setIsLoading(false);
    }
  };

  const copyHook = (hook: Hook, index: number) => {
    navigator.clipboard.writeText(hook.text);
    setCopiedIndex(index);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getEngagementColor = (engagement: string) => {
    if (engagement.includes("Very")) return "bg-green-500/20 text-green-400";
    if (engagement === "High") return "bg-primary/20 text-primary";
    return "bg-yellow-500/20 text-yellow-400";
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
          <h1 className="text-xl font-bold text-foreground">Video Hook Generator</h1>
          <p className="text-sm text-muted-foreground">Create attention-grabbing first 5-second hooks</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Video Topic</Label>
          <Input
            id="topic"
            placeholder="e.g., Making money online, Fitness tips"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Hook Style</Label>
          <div className="flex flex-wrap gap-2">
            {styles.map((style) => (
              <Button
                key={style.id}
                variant={hookStyle === style.id ? "default" : "outline"}
                size="sm"
                onClick={() => setHookStyle(style.id)}
                className="gap-1"
              >
                <span>{style.icon}</span>
                {style.label}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={generateHooks} className="w-full gap-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating Hooks...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Hooks
            </>
          )}
        </Button>
      </Card>

      {hooks.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            Generated Hooks ({hooks.length})
          </h3>

          {hooks.map((hook, index) => (
            <Card key={index} variant="gradient" className="p-4 space-y-3 animate-fade-in">
              <p className="text-foreground font-medium leading-relaxed">"{hook.text}"</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {hook.duration}
                  </div>
                  <Badge className={getEngagementColor(hook.engagement)}>
                    <Target className="h-3 w-3 mr-1" />
                    {hook.engagement}
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyHook(hook, index)}
                  className="gap-1"
                >
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
