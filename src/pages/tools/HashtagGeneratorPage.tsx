import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Hash, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const HashtagGeneratorPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateHashtags = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsLoading(true);
    setHashtags([]);

    try {
      const response = await supabase.functions.invoke("ai-generator", {
        body: {
          type: "instagram-hashtags",
          topic,
          niche,
        },
      });

      if (response.error) throw response.error;

      const rawContent = response.data?.content || response.data?.generatedText || "";
      
      // Extract hashtags
      const extractedHashtags: string[] = rawContent.match(/#\w+/g) || [];
      const uniqueHashtags = [...new Set(extractedHashtags)].slice(0, 30) as string[];

      if (uniqueHashtags.length === 0) {
        // Fallback
        const fallback = [
          `#${topic.replace(/\s+/g, '')}`,
          `#${niche || 'content'}creator`,
          '#viral', '#trending', '#fyp', '#explore',
          '#instagood', '#instagram', '#reels', '#contentcreator'
        ];
        setHashtags(fallback);
      } else {
        setHashtags(uniqueHashtags);
      }

      toast.success(`Generated ${uniqueHashtags.length || 10} hashtags!`);
    } catch (error: any) {
      console.error("Error generating hashtags:", error);
      toast.error("Failed to generate hashtags");
    } finally {
      setIsLoading(false);
    }
  };

  const copyAllHashtags = () => {
    navigator.clipboard.writeText(hashtags.join(' '));
    setCopied(true);
    toast.success("All hashtags copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyHashtag = (hashtag: string) => {
    navigator.clipboard.writeText(hashtag);
    toast.success("Hashtag copied!");
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Hashtag Generator</h1>
          <p className="text-sm text-muted-foreground">Get 30 optimized Instagram hashtags</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Post Topic *</Label>
          <Input
            id="topic"
            placeholder="e.g., Morning workout routine"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="niche">Your Niche</Label>
          <Input
            id="niche"
            placeholder="e.g., Fitness, Travel"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
        </div>

        <Button onClick={generateHashtags} className="w-full gap-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating Hashtags...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate 30 Hashtags
            </>
          )}
        </Button>
      </Card>

      {hashtags.length > 0 && (
        <Card variant="gradient" className="p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Hash className="h-4 w-4 text-pink-500" />
              Your Hashtags ({hashtags.length})
            </h3>
            <Button variant="outline" size="sm" onClick={copyAllHashtags} className="gap-1">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              Copy All
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {hashtags.map((hashtag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-primary/20 transition-colors text-sm py-1 px-2"
                onClick={() => copyHashtag(hashtag)}
              >
                {hashtag}
              </Badge>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm text-muted-foreground break-all">
              {hashtags.join(' ')}
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Tap any hashtag to copy • Mix of small, medium & large hashtags for best reach
          </p>
        </Card>
      )}
    </div>
  );
};
