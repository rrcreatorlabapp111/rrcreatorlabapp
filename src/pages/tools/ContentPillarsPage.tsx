import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Megaphone, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ContentPillar {
  name: string;
  description: string;
  contentIdeas: string[];
  postingFrequency: string;
}

export const ContentPillarsPage = () => {
  const navigate = useNavigate();
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("grow");
  const [pillars, setPillars] = useState<ContentPillar[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generatePillars = async () => {
    if (!niche.trim() || !audience.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("ai-generator", {
        body: {
          type: "content-pillars",
          data: { niche, audience, goal }
        }
      });

      if (response.error) throw response.error;

      const text = response.data?.text || response.data;
      
      // Parse pillars from response
      const parsedPillars: ContentPillar[] = [];
      const pillarMatches = text.match(/(?:Pillar|#)\s*\d*[:\-]?\s*([^\n]+)\n([^]*?)(?=(?:Pillar|#)\s*\d|$)/gi);
      
      if (pillarMatches) {
        pillarMatches.slice(0, 5).forEach((match: string) => {
          const lines = match.split('\n').filter((l: string) => l.trim());
          const ideas = lines.slice(2).filter((l: string) => l.match(/^[-•*\d]/)).map((l: string) => l.replace(/^[-•*\d.)\s]+/, '').trim());
          
          parsedPillars.push({
            name: lines[0]?.replace(/(?:Pillar|#)\s*\d*[:\-]?\s*/i, '').trim() || "Content Pillar",
            description: lines[1]?.trim() || "Strategy pillar for your content",
            contentIdeas: ideas.length > 0 ? ideas.slice(0, 5) : ["Post idea 1", "Post idea 2", "Post idea 3"],
            postingFrequency: "2-3 times/week"
          });
        });
      }

      if (parsedPillars.length === 0) {
        // Fallback pillars
        parsedPillars.push(
          { name: "Educational", description: "Teach your audience something valuable", contentIdeas: ["How-to guides", "Tips & tricks", "Tutorials"], postingFrequency: "3x/week" },
          { name: "Behind the Scenes", description: "Show your authentic journey", contentIdeas: ["Day in the life", "Process reveals", "Workspace tours"], postingFrequency: "2x/week" },
          { name: "Engagement", description: "Build community through interaction", contentIdeas: ["Q&A sessions", "Polls", "Challenges"], postingFrequency: "2x/week" },
          { name: "Promotional", description: "Showcase your products/services", contentIdeas: ["Product features", "Testimonials", "Offers"], postingFrequency: "1x/week" }
        );
      }

      setPillars(parsedPillars);
      toast.success("Content pillars generated!");
    } catch (error) {
      console.error("Error generating pillars:", error);
      toast.error("Failed to generate content pillars");
    } finally {
      setIsLoading(false);
    }
  };

  const copyPillar = (pillar: ContentPillar) => {
    const text = `${pillar.name}\n${pillar.description}\n\nContent Ideas:\n${pillar.contentIdeas.map(i => `• ${i}`).join('\n')}\n\nPosting: ${pillar.postingFrequency}`;
    navigator.clipboard.writeText(text);
    toast.success("Pillar copied!");
  };

  const copyAll = () => {
    const text = pillars.map(p => `${p.name}\n${p.description}\n\nContent Ideas:\n${p.contentIdeas.map(i => `• ${i}`).join('\n')}\n\nPosting: ${p.postingFrequency}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    toast.success("All pillars copied!");
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Content Pillars</h1>
          <p className="text-sm text-muted-foreground">Define your content strategy pillars</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Niche/Industry</Label>
            <Input
              placeholder="e.g., Fitness coaching, Tech reviews"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Input
              placeholder="e.g., Busy professionals, New moms"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Primary Goal</Label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grow">Grow Following</SelectItem>
                <SelectItem value="engage">Increase Engagement</SelectItem>
                <SelectItem value="sell">Drive Sales</SelectItem>
                <SelectItem value="authority">Build Authority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full" 
            onClick={generatePillars}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Megaphone className="h-4 w-4 mr-2" />
                Generate Pillars
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {pillars.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Content Pillars</h2>
            <Button variant="outline" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
          </div>

          <div className="space-y-3">
            {pillars.map((pillar, index) => (
              <Card key={index} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant="secondary">{index + 1}</Badge>
                      {pillar.name}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => copyPillar(pillar)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{pillar.description}</p>
                  <div>
                    <p className="text-xs font-medium mb-1">Content Ideas:</p>
                    <ul className="text-sm space-y-1">
                      {pillar.contentIdeas.map((idea, i) => (
                        <li key={i} className="text-foreground">• {idea}</li>
                      ))}
                    </ul>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    📅 {pillar.postingFrequency}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
