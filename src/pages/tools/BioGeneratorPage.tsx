import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles, Copy, Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Bio {
  text: string;
  style: string;
  charCount: number;
}

export const BioGeneratorPage = () => {
  const navigate = useNavigate();
  const [niche, setNiche] = useState("");
  const [keywords, setKeywords] = useState("");
  const [style, setStyle] = useState<string>("professional");
  const [bios, setBios] = useState<Bio[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const styles = [
    { id: "professional", label: "Professional" },
    { id: "creative", label: "Creative" },
    { id: "minimal", label: "Minimal" },
    { id: "funny", label: "Funny" },
    { id: "bold", label: "Bold" },
  ];

  const generateBios = async () => {
    if (!niche.trim()) {
      toast.error("Please enter your niche");
      return;
    }

    setIsLoading(true);
    setBios([]);

    try {
      const response = await supabase.functions.invoke("ai-generator", {
        body: {
          type: "instagram-bio",
          niche,
          keywords,
          style,
        },
      });

      if (response.error) throw response.error;

      const rawContent = response.data?.content || response.data?.generatedText || "";
      
      // Parse the AI response
      const parsedBios: Bio[] = [];
      const bioBlocks = rawContent.split(/(?=\d+\.|\*\*|Bio \d)/gi).filter((block: string) => block.trim().length > 10);
      
      for (const block of bioBlocks.slice(0, 6)) {
        const text = block.replace(/^\d+\.\s*|\*\*|^Bio\s*\d*:\s*/gi, '').trim();
        if (text.length > 10 && text.length <= 160) {
          parsedBios.push({
            text,
            style,
            charCount: text.length,
          });
        }
      }

      if (parsedBios.length === 0) {
        // Fallback bios
        parsedBios.push(
          { text: `${niche} creator ✨\nSharing tips & inspiration\n📩 DM for collabs`, style, charCount: 0 },
          { text: `Your go-to ${niche} guide 🎯\nDaily content • Real results\n👇 Free resources`, style, charCount: 0 },
        );
        parsedBios.forEach(b => b.charCount = b.text.length);
      }

      setBios(parsedBios);
      toast.success(`Generated ${parsedBios.length} bios!`);
    } catch (error: any) {
      console.error("Error generating bios:", error);
      toast.error("Failed to generate bios");
    } finally {
      setIsLoading(false);
    }
  };

  const copyBio = (bio: Bio, index: number) => {
    navigator.clipboard.writeText(bio.text);
    setCopiedIndex(index);
    toast.success("Bio copied!");
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
          <h1 className="text-xl font-bold text-foreground">Bio Generator</h1>
          <p className="text-sm text-muted-foreground">Create compelling Instagram bios</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Your Niche / What You Do</Label>
          <Input
            id="niche"
            placeholder="e.g., Fitness Coach, Travel Blogger"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords to Include (optional)</Label>
          <Input
            id="keywords"
            placeholder="e.g., health, wellness, motivation"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Bio Style</Label>
          <div className="flex flex-wrap gap-2">
            {styles.map((s) => (
              <Button
                key={s.id}
                variant={style === s.id ? "default" : "outline"}
                size="sm"
                onClick={() => setStyle(s.id)}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </div>

        <Button onClick={generateBios} className="w-full gap-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating Bios...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Bios
            </>
          )}
        </Button>
      </Card>

      {bios.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-pink-500" />
            Generated Bios ({bios.length})
          </h3>

          {bios.map((bio, index) => (
            <Card key={index} variant="gradient" className="p-4 space-y-3 animate-fade-in">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">{bio.text}</p>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {bio.charCount}/150 chars
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => copyBio(bio, index)}
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
