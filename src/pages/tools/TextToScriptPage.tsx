import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const TextToScriptPage = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [script, setScript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateScript = () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text");
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      // Simulate conversion to spoken-style script
      const sentences = inputText.split(/[.!?]+/).filter(s => s.trim());
      const spokenScript = sentences.map((sentence, index) => {
        const trimmed = sentence.trim();
        if (index === 0) {
          return `Alright, so here's the thing - ${trimmed.toLowerCase()}.`;
        } else if (index === sentences.length - 1) {
          return `And most importantly, ${trimmed.toLowerCase()}.`;
        } else if (index % 3 === 0) {
          return `Now, ${trimmed.toLowerCase()}.`;
        } else if (index % 3 === 1) {
          return `Let me tell you, ${trimmed.toLowerCase()}.`;
        } else {
          return `Here's what you need to know - ${trimmed.toLowerCase()}.`;
        }
      }).join('\n\n');

      const fullScript = `[INTRO]\nHey everyone! Today I want to share something really important with you.\n\n[MAIN CONTENT]\n${spokenScript}\n\n[OUTRO]\nSo that's what I wanted to share with you today. If you found this valuable, make sure to like and subscribe for more content like this. See you in the next one!`;

      setScript(fullScript);
      setIsLoading(false);
      toast.success("Script converted successfully!");
    }, 1500);
  };

  const copyScript = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast.success("Script copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Text to Script</h1>
          <p className="text-sm text-muted-foreground">Convert text to spoken-style</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="input">Your Text or Idea</Label>
          <Textarea
            id="input"
            placeholder="Paste any text or write your idea here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="bg-muted border-border min-h-[150px]"
          />
        </div>

        <Button
          variant="gradient"
          className="w-full"
          onClick={generateScript}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-foreground border-t-transparent rounded-full" />
          ) : (
            <>
              <MessageSquare className="h-4 w-4" />
              Convert to Script
            </>
          )}
        </Button>
      </Card>

      {script && (
        <Card variant="glow" className="p-5 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Spoken-Style Script</h2>
            <Button variant="ghost" size="sm" onClick={copyScript}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="text-foreground whitespace-pre-line leading-relaxed">{script}</p>
        </Card>
      )}
    </div>
  );
};
