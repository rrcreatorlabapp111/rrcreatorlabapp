import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit3, Sparkles, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";


export const DescriptionGeneratorPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateDescription = async () => {
    if (!title.trim()) {
      toast.error("Please enter a video title");
      return;
    }

    setIsLoading(true);
    setDescription("");

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
            type: "description-gen",
            data: { topic: title, keywords },
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
        throw new Error("Failed to generate description");
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
              if (content) {
                fullContent += content;
                setDescription(fullContent);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      toast.success("Description generated!");
    } catch (error: any) {
      console.error("Error generating description:", error);
      toast.error("Failed to generate description");
    } finally {
      setIsLoading(false);
    }
  };

  const copyDescription = () => {
    navigator.clipboard.writeText(description);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
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
          <h1 className="text-xl font-bold text-foreground">Description Generator</h1>
          <p className="text-sm text-muted-foreground">Create SEO-optimized video descriptions</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Video Title</Label>
          <Input
            id="title"
            placeholder="e.g., How to Start a YouTube Channel in 2024"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Target Keywords (optional)</Label>
          <Input
            id="keywords"
            placeholder="e.g., youtube tips, grow channel, beginners"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        <Button onClick={generateDescription} className="w-full gap-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Description
            </>
          )}
        </Button>
      </Card>

      {description && (
        <Card variant="gradient" className="p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-primary" />
              Generated Description
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1"
              onClick={copyDescription}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copy
            </Button>
          </div>

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[300px] text-sm"
          />

          <p className="text-xs text-muted-foreground">
            {description.length}/5000 characters
          </p>
        </Card>
      )}
    </div>
  );
};
