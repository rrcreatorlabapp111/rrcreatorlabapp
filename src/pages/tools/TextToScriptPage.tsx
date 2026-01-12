import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Copy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const tones = ["Professional", "Casual", "Energetic", "Educational"];
const platforms = ["YouTube", "TikTok", "Instagram Reels"];

export const TextToScriptPage = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [tone, setTone] = useState("Professional");
  const [script, setScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateScript = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text");
      return;
    }

    setIsLoading(true);
    setScript("");

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
            type: "script",
            data: { text: inputText, platform, tone },
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
        throw new Error("Failed to generate script");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullScript = "";

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
                fullScript += content;
                setScript(fullScript);
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      toast.success("Script generated successfully!");
    } catch (error) {
      console.error("Error generating script:", error);
      toast.error("Failed to generate script. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast.success("Script copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 py-6 space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Text to Script</h1>
          <p className="text-sm text-muted-foreground">AI-powered script writer</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="input">Your Text or Idea</Label>
          <Textarea
            id="input"
            placeholder="Paste any text, article, or write your idea here. The AI will convert it into an engaging video script..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="bg-muted border-border min-h-[150px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Platform</Label>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <Button
                key={p}
                variant={platform === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPlatform(p)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tone</Label>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <Button
                key={t}
                variant={tone === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTone(t)}
              >
                {t}
              </Button>
            ))}
          </div>
        </div>

        <Button
          variant="gradient"
          className="w-full"
          onClick={generateScript}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-foreground border-t-transparent rounded-full" />
              Writing script...
            </div>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Script
            </>
          )}
        </Button>
      </Card>

      {script && (
        <Card variant="glow" className="p-5 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Your Video Script
            </h2>
            <Button variant="ghost" size="sm" onClick={copyScript}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-foreground whitespace-pre-line leading-relaxed text-sm">{script}</p>
          </div>
        </Card>
      )}
    </div>
  );
};
