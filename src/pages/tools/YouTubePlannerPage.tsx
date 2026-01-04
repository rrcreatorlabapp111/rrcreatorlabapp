import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const goals = ["Growth", "Views"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface DayPlan {
  day: string;
  title: string;
  type: string;
}

export const YouTubePlannerPage = () => {
  const navigate = useNavigate();
  const [niche, setNiche] = useState("");
  const [goal, setGoal] = useState("Growth");
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePlan = () => {
    if (!niche.trim()) {
      toast.error("Please enter your channel niche");
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const growthPlan: DayPlan[] = [
        { day: "Monday", title: `Why Most People Fail at ${niche}`, type: "Educational" },
        { day: "Tuesday", title: `Quick ${niche} Tip #shorts`, type: "Shorts" },
        { day: "Wednesday", title: `My ${niche} Journey (Storytime)`, type: "Vlog" },
        { day: "Thursday", title: `${niche} Q&A - Your Questions Answered`, type: "Community" },
        { day: "Friday", title: `${niche} Tutorial for Beginners`, type: "Tutorial" },
        { day: "Saturday", title: `Behind the Scenes #shorts`, type: "Shorts" },
        { day: "Sunday", title: `Weekly ${niche} Roundup`, type: "Compilation" },
      ];

      const viewsPlan: DayPlan[] = [
        { day: "Monday", title: `I Tried ${niche} for 30 Days`, type: "Challenge" },
        { day: "Tuesday", title: `${niche} Hacks That Actually Work #shorts`, type: "Shorts" },
        { day: "Wednesday", title: `Reacting to ${niche} Content`, type: "Reaction" },
        { day: "Thursday", title: `Testing Viral ${niche} Trends`, type: "Trending" },
        { day: "Friday", title: `${niche} Battle: This vs That`, type: "Comparison" },
        { day: "Saturday", title: `Day in My Life as a ${niche} Creator`, type: "Vlog" },
        { day: "Sunday", title: `Top 10 ${niche} Moments This Week`, type: "Compilation" },
      ];

      setPlan(goal === "Growth" ? growthPlan : viewsPlan);
      setIsLoading(false);
      toast.success("Content plan generated!");
    }, 2000);
  };

  const copyPlan = () => {
    const planText = plan.map(p => `${p.day}: ${p.title} (${p.type})`).join('\n');
    navigator.clipboard.writeText(`Weekly Content Plan for ${niche}:\n\n${planText}`);
    setCopied(true);
    toast.success("Plan copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const typeColors: Record<string, string> = {
    Educational: "bg-blue-500/20 text-blue-400",
    Shorts: "bg-pink-500/20 text-pink-400",
    Vlog: "bg-green-500/20 text-green-400",
    Community: "bg-purple-500/20 text-purple-400",
    Tutorial: "bg-cyan-500/20 text-cyan-400",
    Compilation: "bg-orange-500/20 text-orange-400",
    Challenge: "bg-red-500/20 text-red-400",
    Reaction: "bg-yellow-500/20 text-yellow-400",
    Trending: "bg-indigo-500/20 text-indigo-400",
    Comparison: "bg-teal-500/20 text-teal-400",
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">YouTube Planner</h1>
          <p className="text-sm text-muted-foreground">Weekly content strategy</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Channel Niche</Label>
          <Input
            id="niche"
            placeholder="e.g., Gaming, Fitness, Tech Reviews"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="bg-muted border-border"
          />
        </div>

        <div className="space-y-2">
          <Label>Goal</Label>
          <div className="flex gap-2">
            {goals.map((g) => (
              <Button
                key={g}
                variant={goal === g ? "default" : "outline"}
                onClick={() => setGoal(g)}
                className="flex-1"
              >
                {g}
              </Button>
            ))}
          </div>
        </div>

        <Button
          variant="gradient"
          className="w-full"
          onClick={generatePlan}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="animate-spin h-5 w-5 border-2 border-foreground border-t-transparent rounded-full" />
          ) : (
            <>
              <Calendar className="h-4 w-4" />
              Generate Plan
            </>
          )}
        </Button>
      </Card>

      {plan.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Weekly Content Plan</h2>
            <Button variant="ghost" size="sm" onClick={copyPlan}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <div className="space-y-2">
            {plan.map((day, index) => (
              <Card
                key={day.day}
                variant="gradient"
                className="p-4 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-primary">{day.day}</span>
                    <h3 className="font-medium text-foreground text-sm truncate">{day.title}</h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${typeColors[day.type]}`}>
                    {day.type}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
