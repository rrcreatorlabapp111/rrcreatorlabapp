import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const IGHookGeneratorPage = () => {
  const navigate = useNavigate();
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("engaging");
  const [postType, setPostType] = useState("reels");
  const [hooks, setHooks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const tones = ["engaging", "shocking", "curious", "funny", "controversial", "relatable"];
  const postTypes = ["reels", "posts", "carousels", "stories"];

  const generateHooks = async () => {
    if (!niche.trim()) {
      toast.error("Please enter your niche");
      return;
    }

    setIsLoading(true);
    setHooks([]);

    try {
      const response = await supabase.functions.invoke("ai-generator", {
        body: {
          type: "instagram-hooks",
          niche,
          audience,
          tone,
          postType,
        },
      });

      if (response.error) throw response.error;

      const rawContent = response.data?.content || response.data?.generatedText || "";
      
      // Parse hooks
      const parsedHooks: string[] = [];
      const lines = rawContent.split('\n').filter((line: string) => line.trim().length > 5);
      
      for (const line of lines) {
        const cleanedHook = line
          .replace(/^\d+[\.\)]\s*/, '')
          .replace(/^[-•]\s*/, '')
          .replace(/^["']|["']$/g, '')
          .trim();
        
        if (cleanedHook.length > 5 && cleanedHook.length < 100 && !cleanedHook.toLowerCase().includes('hook')) {
          parsedHooks.push(cleanedHook);
        }
      }

      if (parsedHooks.length === 0) {
        // Fallback hooks
        parsedHooks.push(
          "Stop scrolling if you want to...",
          "Nobody talks about this but...",
          "I was today years old when I learned...",
          "This is your sign to...",
          "POV: You finally discover...",
        );
      }

      setHooks(parsedHooks.slice(0, 20));
      toast.success(`Generated ${Math.min(parsedHooks.length, 20)} hooks!`);
    } catch (error: any) {
      console.error("Error generating hooks:", error);
      toast.error("Failed to generate hooks");
    } finally {
      setIsLoading(false);
    }
  };

  const copyHook = (hook: string, index: number) => {
    navigator.clipboard.writeText(hook);
    setCopiedIndex(index);
    toast.success("Hook copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllHooks = () => {
    navigator.clipboard.writeText(hooks.join('\n\n'));
    toast.success("All hooks copied!");
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Hook Generator</h1>
          <p className="text-sm text-muted-foreground">Create scroll-stopping hooks</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Your Niche *</Label>
          <Input
            id="niche"
            placeholder="e.g., Fitness, Productivity, Travel"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience">Target Audience</Label>
          <Input
            id="audience"
            placeholder="e.g., Entrepreneurs, Women 20-30"
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
            <Label>Post Type</Label>
            <Select value={postType} onValueChange={setPostType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {postTypes.map((p) => (
                  <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              Generate 20 Hooks
            </>
          )}
        </Button>
      </Card>

      {hooks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Scroll-Stopping Hooks ({hooks.length})
            </h3>
            <Button variant="outline" size="sm" onClick={copyAllHooks}>
              <Copy className="h-4 w-4 mr-1" />
              Copy All
            </Button>
          </div>

          <div className="space-y-2">
            {hooks.map((hook, index) => (
              <Card 
                key={index} 
                variant="gradient" 
                className="p-3 animate-fade-in cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => copyHook(hook, index)}
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="shrink-0">{index + 1}</Badge>
                  <p className="text-foreground flex-1">{hook}</p>
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
