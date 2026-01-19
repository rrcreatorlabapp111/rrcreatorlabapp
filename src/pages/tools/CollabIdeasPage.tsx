import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, Copy, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CollabIdea {
  title: string;
  partnerType: string;
  format: string;
  benefit: string;
}

export const CollabIdeasPage = () => {
  const navigate = useNavigate();
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [followerCount, setFollowerCount] = useState("micro");
  const [ideas, setIdeas] = useState<CollabIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateIdeas = async () => {
    if (!niche.trim() || !audience.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("ai-generator", {
        body: {
          type: "collab-ideas",
          data: { niche, audience, followerCount }
        }
      });

      if (response.error) throw response.error;

      const text = response.data?.text || response.data;
      
      // Parse ideas from response
      const parsedIdeas: CollabIdea[] = [];
      const ideaMatches = text.match(/\d+[.)]\s*([^\n]+)\n([^]*?)(?=\d+[.)]|$)/gi);
      
      if (ideaMatches) {
        ideaMatches.slice(0, 10).forEach((match: string) => {
          const lines = match.split('\n').filter((l: string) => l.trim());
          parsedIdeas.push({
            title: lines[0]?.replace(/^\d+[.)]\s*/, '').trim() || "Collaboration Idea",
            partnerType: lines.find((l: string) => l.toLowerCase().includes('partner'))?.replace(/partner[s]?[:\s]*/i, '').trim() || "Content creators in similar niche",
            format: lines.find((l: string) => l.toLowerCase().includes('format'))?.replace(/format[:\s]*/i, '').trim() || "Joint content",
            benefit: lines.find((l: string) => l.toLowerCase().includes('benefit'))?.replace(/benefit[s]?[:\s]*/i, '').trim() || "Cross-promote to new audiences"
          });
        });
      }

      if (parsedIdeas.length === 0) {
        // Fallback ideas
        parsedIdeas.push(
          { title: "Instagram Live Q&A Together", partnerType: "Creators in complementary niche", format: "Live session", benefit: "Real-time engagement + audience sharing" },
          { title: "Content Swap Challenge", partnerType: "Similar follower count creators", format: "Reels/Posts", benefit: "Fresh content + new audience exposure" },
          { title: "Joint Giveaway", partnerType: "Brands or fellow creators", format: "Carousel post", benefit: "Rapid follower growth + engagement" },
          { title: "Expert Interview Series", partnerType: "Industry experts", format: "Stories/Reels", benefit: "Authority building + valuable content" },
          { title: "Behind-the-Scenes Takeover", partnerType: "Creators in your space", format: "Stories", benefit: "Authentic connection + audience swap" }
        );
      }

      setIdeas(parsedIdeas);
      toast.success("Collab ideas generated!");
    } catch (error) {
      console.error("Error generating ideas:", error);
      toast.error("Failed to generate collab ideas");
    } finally {
      setIsLoading(false);
    }
  };

  const copyIdea = (idea: CollabIdea) => {
    const text = `${idea.title}\nPartner Type: ${idea.partnerType}\nFormat: ${idea.format}\nBenefit: ${idea.benefit}`;
    navigator.clipboard.writeText(text);
    toast.success("Idea copied!");
  };

  const copyAll = () => {
    const text = ideas.map(i => `${i.title}\nPartner Type: ${i.partnerType}\nFormat: ${i.format}\nBenefit: ${i.benefit}`).join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    toast.success("All ideas copied!");
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Collab Ideas</h1>
          <p className="text-sm text-muted-foreground">Find collaboration ideas in your niche</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Your Niche</Label>
            <Input
              placeholder="e.g., Fitness, Fashion, Tech"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Input
              placeholder="e.g., Young professionals, Students"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Your Account Size</Label>
            <Select value={followerCount} onValueChange={setFollowerCount}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nano">Nano (1K-10K)</SelectItem>
                <SelectItem value="micro">Micro (10K-50K)</SelectItem>
                <SelectItem value="mid">Mid-tier (50K-500K)</SelectItem>
                <SelectItem value="macro">Macro (500K+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full" 
            onClick={generateIdeas}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 mr-2" />
                Generate Collab Ideas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {ideas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Collaboration Ideas</h2>
            <Button variant="outline" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
          </div>

          <div className="space-y-3">
            {ideas.map((idea, index) => (
              <Card key={index} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      {idea.title}
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => copyIdea(idea)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">👥 {idea.partnerType}</Badge>
                    <Badge variant="outline" className="text-xs">📱 {idea.format}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">✨ {idea.benefit}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
