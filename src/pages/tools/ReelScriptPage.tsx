import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Sparkles, Copy, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface Script {
  hook: string;
  content: string;
  cta: string;
}

export const ReelScriptPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [tone, setTone] = useState("engaging");
  const [duration, setDuration] = useState("15-30");
  const [includeCta, setIncludeCta] = useState(true);
  const [script, setScript] = useState<Script | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const tones = ["engaging", "funny", "educational", "inspirational", "bold", "casual"];
  const durations = ["7-15", "15-30", "30-60", "60-90"];

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user || !script) throw new Error("Not authenticated or no script");
      const fullScript = `[HOOK]\n${script.hook}\n\n[CONTENT]\n${script.content}\n\n[CTA]\n${script.cta}`;
      const { error } = await supabase.from("saved_content").insert({
        user_id: user.id,
        type: "reel-script",
        title: `Reel Script: ${topic}`,
        content: fullScript,
        preview: script.hook,
      });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Script saved!"),
    onError: () => toast.error("Failed to save"),
  });

  const generateScript = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsLoading(true);
    setScript(null);

    try {
      const response = await supabase.functions.invoke("ai-generator", {
        body: {
          type: "instagram-reel-script",
          topic,
          niche,
          tone,
          duration: `${duration} seconds`,
          cta: includeCta,
        },
      });

      if (response.error) throw response.error;

      const rawContent = response.data?.content || response.data?.generatedText || "";
      
      // Parse script sections
      const hookMatch = rawContent.match(/\[HOOK\][\s\S]*?(?=\[|$)/i);
      const contentMatch = rawContent.match(/\[(?:MAIN\s*)?CONTENT\][\s\S]*?(?=\[CTA\]|\[OUTRO\]|$)/i);
      const ctaMatch = rawContent.match(/\[(?:CTA|OUTRO)\][\s\S]*$/i);
      
      const hook = hookMatch?.[0]?.replace(/\[HOOK\]\s*/i, '').trim() || "Wait... you need to see this";
      const content = contentMatch?.[0]?.replace(/\[(?:MAIN\s*)?CONTENT\]\s*/i, '').trim() || rawContent.slice(0, 300);
      const cta = ctaMatch?.[0]?.replace(/\[(?:CTA|OUTRO)\]\s*/i, '').trim() || "Follow for more!";

      setScript({ hook, content, cta });
      toast.success("Script generated!");
    } catch (error: any) {
      console.error("Error generating script:", error);
      toast.error("Failed to generate script");
    } finally {
      setIsLoading(false);
    }
  };

  const copyScript = () => {
    if (!script) return;
    const fullScript = `[HOOK]\n${script.hook}\n\n[CONTENT]\n${script.content}\n\n[CTA]\n${script.cta}`;
    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    toast.success("Script copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Reel Script Generator</h1>
          <p className="text-sm text-muted-foreground">Create viral reel scripts with AI</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Reel Topic *</Label>
          <Input
            id="topic"
            placeholder="e.g., 5 morning habits that changed my life"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="niche">Your Niche</Label>
          <Input
            id="niche"
            placeholder="e.g., Productivity, Fitness"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
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
            <Label>Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durations.map((d) => (
                  <SelectItem key={d} value={d}>{d} seconds</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="cta">Include Call-to-Action</Label>
          <Switch id="cta" checked={includeCta} onCheckedChange={setIncludeCta} />
        </div>

        <Button onClick={generateScript} className="w-full gap-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Writing Script...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Script
            </>
          )}
        </Button>
      </Card>

      {script && (
        <Card variant="gradient" className="p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-pink-500" />
              Your Reel Script
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyScript}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
              <p className="text-xs font-medium text-pink-500 mb-1">[HOOK] - First 2 seconds</p>
              <p className="text-foreground">{script.hook}</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-medium text-muted-foreground mb-1">[MAIN CONTENT]</p>
              <p className="text-foreground whitespace-pre-wrap">{script.content}</p>
            </div>

            {script.cta && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-xs font-medium text-primary mb-1">[CTA]</p>
                <p className="text-foreground">{script.cta}</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
