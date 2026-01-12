import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Copy, Check, RefreshCw, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface TitleVariant {
  title: string;
  style: string;
  predictedCTR: string;
  strengths: string[];
}

export const TitleTesterPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [variants, setVariants] = useState<TitleVariant[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const generateVariants = async () => {
    if (!topic.trim()) {
      toast.error("Please enter your video topic");
      return;
    }

    setIsLoading(true);
    setVariants([]);

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
            type: "title-variants",
            data: { topic, keyword },
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again later.");
          return;
        }
        throw new Error("Failed to generate titles");
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
            } catch {}
          }
        }
      }

      // Parse variants
      const parsedVariants: TitleVariant[] = [];
      const sections = fullContent.split(/(?:\d+\.|##?\s*\d+)/i).filter(s => s.trim().length > 10);
      
      for (const section of sections) {
        const titleMatch = section.match(/(?:Title|Video)[:*]*\s*["""]?(.+?)["""]?(?:\n|$)/i);
        const styleMatch = section.match(/(?:Style|Type|Format)[:*]*\s*(.+?)(?:\n|$)/i);
        const ctrMatch = section.match(/(?:CTR|Predicted|Potential)[:*]*\s*(.+?)(?:\n|$)/i);
        const strengthsMatch = section.match(/(?:Strengths?|Why|What)[:*]*\s*(.+?)(?=\n\n|\n(?:\d|$)|$)/is);

        if (titleMatch) {
          parsedVariants.push({
            title: titleMatch[1].replace(/[""*]/g, '').trim(),
            style: styleMatch?.[1]?.trim() || "General",
            predictedCTR: ctrMatch?.[1]?.match(/[\d.]+%?/)?.[0] || "4-6%",
            strengths: strengthsMatch?.[1]?.split(/[,\n•\-]/).filter(s => s.trim()).slice(0, 3) || [],
          });
        }
      }

      if (parsedVariants.length > 0) {
        setVariants(parsedVariants.slice(0, 6));
      }
      toast.success(`Generated ${parsedVariants.length} title variants!`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate titles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyTitle = (title: string, index: number) => {
    navigator.clipboard.writeText(title);
    setCopiedIndex(index);
    toast.success("Title copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const selectWinner = (index: number) => {
    setSelectedIndex(index);
    toast.success("Winner selected!");
  };

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Title Tester</h1>
          <p className="text-sm text-muted-foreground">AI-powered title optimization</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Video Topic</Label>
          <Input id="topic" placeholder="e.g., meal prep, learn guitar" value={topic} onChange={(e) => setTopic(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="keyword">Target Keyword (optional)</Label>
          <Input id="keyword" placeholder="e.g., for beginners, fast" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <Button variant="gradient" onClick={generateVariants} disabled={isLoading} className="w-full">
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {isLoading ? "Generating..." : "Generate Variants"}
        </Button>
      </Card>

      {variants.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="font-semibold text-foreground">Title Variants</h3>
          {variants.map((variant, index) => (
            <Card key={index} variant="gradient" className={`p-4 space-y-3 ${selectedIndex === index ? "ring-2 ring-primary" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{variant.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{variant.style}</Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">{variant.predictedCTR} CTR</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => selectWinner(index)} className={selectedIndex === index ? "text-red-400" : ""}>
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => copyTitle(variant.title, index)}>
                    {copiedIndex === index ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{variant.strengths.map((s, i) => <span key={i} className="inline-block mr-2">✓ {s}</span>)}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
