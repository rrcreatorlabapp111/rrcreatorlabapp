import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, Sparkles, Copy, Check, Star, Rocket, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MonetizationMethod {
  name: string;
  description: string;
  pricing: string;
  difficulty: string;
}

interface MonetizationIdeas {
  beginner: MonetizationMethod[];
  intermediate: MonetizationMethod[];
  advanced: MonetizationMethod[];
}

export const IGMonetizationPage = () => {
  const navigate = useNavigate();
  const [niche, setNiche] = useState("");
  const [followers, setFollowers] = useState("");
  const [engagement, setEngagement] = useState("average");
  const [goal, setGoal] = useState("start earning");
  const [ideas, setIdeas] = useState<MonetizationIdeas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const engagementLevels = ["low (1-2%)", "average (3-5%)", "high (6-10%)", "viral (10%+)"];
  const goals = ["start earning", "side income", "full-time income", "scale business"];

  const generateIdeas = async () => {
    if (!niche.trim()) {
      toast.error("Please enter your niche");
      return;
    }

    setIsLoading(true);
    setIdeas(null);

    try {
      const response = await supabase.functions.invoke("ai-generator", {
        body: {
          type: "instagram-monetization",
          niche,
          followers,
          engagement,
          goal,
        },
      });

      if (response.error) throw response.error;

      const rawContent = response.data?.content || response.data?.generatedText || "";
      
      // Parse monetization ideas
      const parseSection = (content: string, section: string): MonetizationMethod[] => {
        const sectionMatch = content.match(new RegExp(`${section}[\\s\\S]*?(?=(?:intermediate|advanced|$))`, 'i'));
        if (!sectionMatch) return [];
        
        const methods: MonetizationMethod[] = [];
        const lines = sectionMatch[0].split('\n').filter((l: string) => l.trim().length > 5);
        
        let currentMethod: Partial<MonetizationMethod> = {};
        for (const line of lines) {
          if (line.match(/^\d+[\.\)]|^[-•]\s*\*\*|^###/)) {
            if (currentMethod.name) {
              methods.push({
                name: currentMethod.name,
                description: currentMethod.description || "Start today and scale over time.",
                pricing: currentMethod.pricing || "$50-500+",
                difficulty: currentMethod.difficulty || "Medium",
              });
            }
            currentMethod = { name: line.replace(/^\d+[\.\)]\s*|^[-•]\s*\*\*|^###\s*|\*\*/g, '').trim() };
          } else if (line.toLowerCase().includes('price') || line.toLowerCase().includes('earn') || line.includes('$')) {
            currentMethod.pricing = line.replace(/^[-•]\s*|price:?\s*|earn:?\s*/i, '').trim();
          } else if (line.toLowerCase().includes('difficulty') || line.toLowerCase().includes('level')) {
            currentMethod.difficulty = line.replace(/^[-•]\s*|difficulty:?\s*|level:?\s*/i, '').trim();
          } else if (line.length > 20) {
            currentMethod.description = (currentMethod.description || '') + ' ' + line.replace(/^[-•]\s*/, '').trim();
          }
        }
        if (currentMethod.name) {
          methods.push({
            name: currentMethod.name,
            description: currentMethod.description?.trim() || "Great way to monetize your audience.",
            pricing: currentMethod.pricing || "$50-500+",
            difficulty: currentMethod.difficulty || "Medium",
          });
        }
        
        return methods.slice(0, 5);
      };

      const beginnerMethods = parseSection(rawContent, 'beginner');
      const intermediateMethods = parseSection(rawContent, 'intermediate');
      const advancedMethods = parseSection(rawContent, 'advanced');

      // Fallbacks
      const fallbackBeginner: MonetizationMethod[] = [
        { name: "Affiliate Marketing", description: "Promote products you love and earn commission", pricing: "$50-500/month", difficulty: "Easy" },
        { name: "Shoutouts", description: "Promote other accounts in your stories", pricing: "$10-50 per shoutout", difficulty: "Easy" },
      ];
      const fallbackIntermediate: MonetizationMethod[] = [
        { name: "Sponsored Posts", description: "Partner with brands for paid content", pricing: "$200-2000 per post", difficulty: "Medium" },
        { name: "Digital Products", description: "Sell ebooks, templates, presets", pricing: "$10-100 per sale", difficulty: "Medium" },
      ];
      const fallbackAdvanced: MonetizationMethod[] = [
        { name: "Online Course", description: "Create and sell comprehensive courses", pricing: "$100-1000+ per student", difficulty: "Hard" },
        { name: "Brand Ambassador", description: "Long-term partnerships with brands", pricing: "$1000-10000/month", difficulty: "Hard" },
      ];

      setIdeas({
        beginner: beginnerMethods.length > 0 ? beginnerMethods : fallbackBeginner,
        intermediate: intermediateMethods.length > 0 ? intermediateMethods : fallbackIntermediate,
        advanced: advancedMethods.length > 0 ? advancedMethods : fallbackAdvanced,
      });

      toast.success("Monetization ideas generated!");
    } catch (error: any) {
      console.error("Error generating ideas:", error);
      toast.error("Failed to generate ideas");
    } finally {
      setIsLoading(false);
    }
  };

  const copyAll = () => {
    if (!ideas) return;
    const text = `
INSTAGRAM MONETIZATION IDEAS

🌱 BEGINNER (0-10K followers)
${ideas.beginner.map(m => `• ${m.name}: ${m.description} (${m.pricing})`).join('\n')}

🚀 INTERMEDIATE (10K-50K followers)
${ideas.intermediate.map(m => `• ${m.name}: ${m.description} (${m.pricing})`).join('\n')}

👑 ADVANCED (50K+ followers)
${ideas.advanced.map(m => `• ${m.name}: ${m.description} (${m.pricing})`).join('\n')}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("All ideas copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const renderMethodCard = (method: MonetizationMethod, index: number) => (
    <Card key={index} variant="gradient" className="p-3 space-y-2">
      <div className="flex items-start justify-between">
        <h4 className="font-medium text-foreground">{method.name}</h4>
        <Badge variant="secondary" className="text-xs">{method.difficulty}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{method.description}</p>
      <div className="flex items-center gap-1 text-green-500">
        <DollarSign className="h-3 w-3" />
        <span className="text-sm font-medium">{method.pricing}</span>
      </div>
    </Card>
  );

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Monetization Ideas</h1>
          <p className="text-sm text-muted-foreground">Ways to earn from Instagram</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Your Niche *</Label>
          <Input
            id="niche"
            placeholder="e.g., Fitness, Travel, Business"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="followers">Follower Count</Label>
            <Input
              id="followers"
              placeholder="e.g., 5K, 50K"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Engagement</Label>
            <Select value={engagement} onValueChange={setEngagement}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {engagementLevels.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Your Goal</Label>
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {goals.map((g) => (
                <SelectItem key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generateIdeas} className="w-full gap-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating Ideas...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Monetization Ideas
            </>
          )}
        </Button>
      </Card>

      {ideas && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Your Monetization Roadmap
            </h3>
            <Button variant="outline" size="sm" onClick={copyAll}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* Beginner */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-foreground">Beginner (0-10K followers)</span>
            </div>
            <div className="space-y-2">
              {ideas.beginner.map((method, i) => renderMethodCard(method, i))}
            </div>
          </div>

          {/* Intermediate */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-foreground">Intermediate (10K-50K)</span>
            </div>
            <div className="space-y-2">
              {ideas.intermediate.map((method, i) => renderMethodCard(method, i))}
            </div>
          </div>

          {/* Advanced */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-foreground">Advanced (50K+)</span>
            </div>
            <div className="space-y-2">
              {ideas.advanced.map((method, i) => renderMethodCard(method, i))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
