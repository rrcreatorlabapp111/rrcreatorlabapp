import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Hash, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const platforms = ["YouTube", "Instagram"];

export const TagGeneratorPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateTags = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsLoading(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const baseTags = platform === "YouTube" 
        ? [topic, `${topic} tutorial`, `${topic} tips`, `${topic} guide`, `how to ${topic}`, 
           `${topic} 2024`, `best ${topic}`, `${topic} for beginners`, `${topic} tricks`,
           `learn ${topic}`, `${topic} explained`, `${topic} course`, `${topic} masterclass`,
           `${topic} secrets`, `${topic} hacks`, `pro ${topic}`, `${topic} basics`,
           `${topic} advanced`, `${topic} techniques`, `${topic} examples`, `${topic} ideas`,
           `${topic} inspiration`, `${topic} motivation`, `${topic} success`, `${topic} growth`]
        : [`#${topic.replace(/\s/g, '')}`, `#${topic.replace(/\s/g, '')}tips`, 
           `#${topic.replace(/\s/g, '')}2024`, `#${topic.replace(/\s/g, '')}life`,
           `#${topic.replace(/\s/g, '')}inspo`, `#${topic.replace(/\s/g, '')}goals`,
           `#${topic.replace(/\s/g, '')}vibes`, `#${topic.replace(/\s/g, '')}daily`,
           `#${topic.replace(/\s/g, '')}love`, `#${topic.replace(/\s/g, '')}gram`,
           `#creator`, `#contentcreator`, `#viral`, `#trending`, `#fyp`,
           `#explore`, `#reels`, `#reelsinstagram`, `#instagood`, `#instadaily`,
           `#growth`, `#motivation`, `#success`, `#lifestyle`, `#follow`];
      
      setTags(baseTags);
      setIsLoading(false);
      toast.success("Tags generated successfully!");
    }, 1500);
  };

  const copyTags = () => {
    navigator.clipboard.writeText(tags.join(platform === "YouTube" ? ", " : " "));
    setCopied(true);
    toast.success("Tags copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Tag Generator</h1>
          <p className="text-sm text-muted-foreground">Generate optimized tags</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic / Keyword</Label>
          <Input
            id="topic"
            placeholder="e.g., Photography tips"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
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
              >
                {p}
              </Button>
            ))}
          </div>
        </div>

        <Button
          variant="gradient"
          className="w-full"
          onClick={generateTags}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-foreground border-t-transparent rounded-full" />
          ) : (
            <>
              <Hash className="h-4 w-4" />
              Generate Tags
            </>
          )}
        </Button>
      </Card>

      {tags.length > 0 && (
        <Card variant="glow" className="p-5 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Generated Tags ({tags.length})</h2>
            <Button variant="ghost" size="sm" onClick={copyTags}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy All"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-full text-sm bg-muted text-foreground border border-border/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
