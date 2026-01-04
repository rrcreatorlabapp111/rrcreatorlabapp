import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const platforms = ["YouTube", "Shorts", "Reels"];
const tones = ["Educational", "Viral", "Storytelling"];

interface Script {
  hook: string;
  content: string;
  cta: string;
}

export const ScriptGeneratorPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [tone, setTone] = useState("Educational");
  const [script, setScript] = useState<Script | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateScript = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const hooks = {
        Educational: `Did you know that most people get ${topic} completely wrong? Let me show you the right way.`,
        Viral: `Stop scrolling! This ${topic} hack will change everything you thought you knew.`,
        Storytelling: `Let me tell you about the time I discovered something incredible about ${topic}...`,
      };

      const contents = {
        Educational: `Here's the thing about ${topic} - it's not as complicated as people make it seem. First, you need to understand the basics. The key principle is simple: focus on what matters most and eliminate the rest.\n\nStep 1: Start with a clear goal in mind\nStep 2: Break it down into smaller, manageable pieces\nStep 3: Take consistent action every single day\n\nThe biggest mistake I see people make is trying to do everything at once. Instead, master one thing before moving to the next.`,
        Viral: `Okay, here's the truth about ${topic} that nobody talks about. The experts have been hiding this from you, but I'm about to reveal everything.\n\nThe secret is actually simpler than you think. It comes down to three things:\n1. Timing is everything\n2. Consistency beats perfection\n3. The algorithm rewards those who show up\n\nTrust me, once you understand this, everything changes.`,
        Storytelling: `So there I was, struggling with ${topic} just like you probably are right now. I had tried everything - the courses, the tutorials, the "expert" advice. Nothing seemed to work.\n\nThen one day, something clicked. I realized I had been approaching it all wrong. The solution wasn't about doing more - it was about doing less, but better.\n\nThat single shift in mindset changed everything for me, and it can change everything for you too.`,
      };

      const ctas = {
        Educational: `If you found this helpful, make sure to like and subscribe for more ${topic} tips. Drop a comment below with your biggest takeaway!`,
        Viral: `Follow for more game-changing content like this! Share this with someone who needs to hear it!`,
        Storytelling: `Want to hear more stories like this? Hit that subscribe button and turn on notifications so you never miss an upload!`,
      };

      setScript({
        hook: hooks[tone as keyof typeof hooks],
        content: contents[tone as keyof typeof contents],
        cta: ctas[tone as keyof typeof ctas],
      });
      setIsLoading(false);
      toast.success("Script generated successfully!");
    }, 2000);
  };

  const copyScript = () => {
    if (!script) return;
    const fullScript = `HOOK:\n${script.hook}\n\nMAIN SCRIPT:\n${script.content}\n\nCALL TO ACTION:\n${script.cta}`;
    navigator.clipboard.writeText(fullScript);
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
          <h1 className="text-xl font-bold text-foreground">Script Generator</h1>
          <p className="text-sm text-muted-foreground">AI-powered video scripts</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            placeholder="e.g., How to grow on YouTube"
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
                size="sm"
              >
                {p}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tone</Label>
          <div className="flex gap-2">
            {tones.map((t) => (
              <Button
                key={t}
                variant={tone === t ? "default" : "outline"}
                onClick={() => setTone(t)}
                className="flex-1"
                size="sm"
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
            <div className="animate-spin h-5 w-5 border-2 border-foreground border-t-transparent rounded-full" />
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Generate Script
            </>
          )}
        </Button>
      </Card>

      {script && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Your Script</h2>
            <Button variant="ghost" size="sm" onClick={copyScript}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <Card variant="glow" className="p-5 space-y-4">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Hook</span>
              <p className="text-foreground mt-1">{script.hook}</p>
            </div>
          </Card>

          <Card variant="gradient" className="p-5 space-y-4">
            <div>
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Main Script</span>
              <p className="text-foreground mt-1 whitespace-pre-line">{script.content}</p>
            </div>
          </Card>

          <Card variant="gradient" className="p-5 space-y-4">
            <div>
              <span className="text-xs font-semibold text-accent uppercase tracking-wider">Call to Action</span>
              <p className="text-foreground mt-1">{script.cta}</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
