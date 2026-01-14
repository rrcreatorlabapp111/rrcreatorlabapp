import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Sparkles, Copy, Check, Target, Clock, AlertTriangle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Strategy {
  contentStrategy: string;
  postingSchedule: string;
  engagementTactics: string;
  mistakes: string;
  actionPlan: string;
}

export const IGGrowthStrategyPage = () => {
  const navigate = useNavigate();
  const [niche, setNiche] = useState("");
  const [followers, setFollowers] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("grow followers");
  const [time, setTime] = useState("moderate");
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const goals = ["grow followers", "increase engagement", "build community", "monetize", "brand awareness"];
  const timeOptions = ["minimal (1hr/day)", "moderate (2-3hr/day)", "full-time", "agency/team"];

  const generateStrategy = async () => {
    if (!niche.trim()) {
      toast.error("Please enter your niche");
      return;
    }

    setIsLoading(true);
    setStrategy(null);

    try {
      const response = await supabase.functions.invoke("ai-generator", {
        body: {
          type: "instagram-growth-strategy",
          niche,
          followers,
          audience,
          goal,
          time,
        },
      });

      if (response.error) throw response.error;

      const rawContent = response.data?.content || response.data?.generatedText || "";
      
      // Parse strategy sections
      const contentMatch = rawContent.match(/(?:content strategy|what to post)[\s\S]*?(?=posting schedule|engagement|mistakes|$)/i);
      const scheduleMatch = rawContent.match(/(?:posting schedule|best times)[\s\S]*?(?=engagement|mistakes|action|$)/i);
      const engagementMatch = rawContent.match(/(?:engagement tactics|how to grow)[\s\S]*?(?=mistakes|action|$)/i);
      const mistakesMatch = rawContent.match(/(?:mistakes|avoid|don't do)[\s\S]*?(?=action|30.day|$)/i);
      const actionMatch = rawContent.match(/(?:action plan|30.day|first steps)[\s\S]*$/i);
      
      setStrategy({
        contentStrategy: contentMatch?.[0]?.replace(/^[#\*]*\s*content strategy:?\s*/i, '').trim() || "Focus on educational reels, behind-the-scenes content, and value-driven posts. Mix 70% value, 20% entertainment, 10% promotional.",
        postingSchedule: scheduleMatch?.[0]?.replace(/^[#\*]*\s*posting schedule:?\s*/i, '').trim() || "Post 1-2 reels daily, 3-5 stories, 2-3 carousel posts per week. Best times: 7-9am, 12-2pm, 7-9pm.",
        engagementTactics: engagementMatch?.[0]?.replace(/^[#\*]*\s*engagement:?\s*/i, '').trim() || "Reply to comments within 1 hour, engage with 30 accounts in your niche daily, use interactive story features, collaborate weekly.",
        mistakes: mistakesMatch?.[0]?.replace(/^[#\*]*\s*mistakes:?\s*/i, '').trim() || "Avoid inconsistent posting, buying followers, using banned hashtags, ignoring analytics, and copying competitors exactly.",
        actionPlan: actionMatch?.[0]?.replace(/^[#\*]*\s*action plan:?\s*/i, '').trim() || "Week 1: Audit profile, Week 2: Content batch, Week 3: Engagement focus, Week 4: Analyze and optimize.",
      });

      toast.success("Strategy generated!");
    } catch (error: any) {
      console.error("Error generating strategy:", error);
      toast.error("Failed to generate strategy");
    } finally {
      setIsLoading(false);
    }
  };

  const copyStrategy = () => {
    if (!strategy) return;
    const fullStrategy = `
INSTAGRAM GROWTH STRATEGY

📝 CONTENT STRATEGY
${strategy.contentStrategy}

📅 POSTING SCHEDULE
${strategy.postingSchedule}

💬 ENGAGEMENT TACTICS
${strategy.engagementTactics}

⚠️ MISTAKES TO AVOID
${strategy.mistakes}

🎯 30-DAY ACTION PLAN
${strategy.actionPlan}
    `.trim();
    navigator.clipboard.writeText(fullStrategy);
    setCopied(true);
    toast.success("Strategy copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Growth Strategy</h1>
          <p className="text-sm text-muted-foreground">Get a personalized growth plan</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Your Niche *</Label>
          <Input
            id="niche"
            placeholder="e.g., Fitness, Business, Travel"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="followers">Current Followers</Label>
            <Input
              id="followers"
              placeholder="e.g., 500, 10K"
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              placeholder="e.g., Women 25-35"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Goal</Label>
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

          <div className="space-y-2">
            <Label>Available Time</Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={generateStrategy} className="w-full gap-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Creating Strategy...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Growth Strategy
            </>
          )}
        </Button>
      </Card>

      {strategy && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Your Growth Strategy
            </h3>
            <Button variant="outline" size="sm" onClick={copyStrategy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <Card variant="gradient" className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Target className="h-4 w-4" />
              <span className="font-semibold">Content Strategy</span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{strategy.contentStrategy}</p>
          </Card>

          <Card variant="gradient" className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-blue-500">
              <Clock className="h-4 w-4" />
              <span className="font-semibold">Posting Schedule</span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{strategy.postingSchedule}</p>
          </Card>

          <Card variant="gradient" className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-pink-500">
              <TrendingUp className="h-4 w-4" />
              <span className="font-semibold">Engagement Tactics</span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{strategy.engagementTactics}</p>
          </Card>

          <Card variant="gradient" className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-orange-500">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold">Mistakes to Avoid</span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{strategy.mistakes}</p>
          </Card>

          <Card variant="gradient" className="p-4 space-y-2">
            <div className="flex items-center gap-2 text-green-500">
              <Calendar className="h-4 w-4" />
              <span className="font-semibold">30-Day Action Plan</span>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap">{strategy.actionPlan}</p>
          </Card>
        </div>
      )}
    </div>
  );
};
