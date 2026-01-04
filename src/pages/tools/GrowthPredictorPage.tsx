import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Predictions {
  oneMonth: number;
  threeMonths: number;
  sixMonths: number;
  oneYear: number;
  growthRate: number;
  milestone: string;
  milestoneDate: string;
}

export const GrowthPredictorPage = () => {
  const navigate = useNavigate();
  const [currentSubs, setCurrentSubs] = useState("");
  const [lastMonthSubs, setLastMonthSubs] = useState("");
  const [targetSubs, setTargetSubs] = useState("");
  const [predictions, setPredictions] = useState<Predictions | null>(null);

  const predict = () => {
    const current = parseInt(currentSubs) || 0;
    const lastMonth = parseInt(lastMonthSubs) || current;
    const target = parseInt(targetSubs) || current * 2;

    const monthlyGrowth = current - lastMonth;
    const growthRate = lastMonth > 0 ? ((current - lastMonth) / lastMonth) * 100 : 0;

    // Project future growth with compound effect
    const monthlyRate = 1 + (growthRate / 100);
    const oneMonth = Math.round(current * monthlyRate);
    const threeMonths = Math.round(current * Math.pow(monthlyRate, 3));
    const sixMonths = Math.round(current * Math.pow(monthlyRate, 6));
    const oneYear = Math.round(current * Math.pow(monthlyRate, 12));

    // Calculate milestone
    let milestoneDate = "N/A";
    let milestone = "10K";
    const milestones = [1000, 10000, 100000, 1000000];
    const nextMilestone = milestones.find(m => m > current) || 1000000;
    
    if (nextMilestone === 1000) milestone = "1K";
    else if (nextMilestone === 10000) milestone = "10K";
    else if (nextMilestone === 100000) milestone = "100K";
    else milestone = "1M";

    if (monthlyGrowth > 0) {
      const monthsNeeded = Math.ceil((nextMilestone - current) / monthlyGrowth);
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + monthsNeeded);
      milestoneDate = futureDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }

    setPredictions({
      oneMonth,
      threeMonths,
      sixMonths,
      oneYear,
      growthRate,
      milestone,
      milestoneDate,
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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
          <h1 className="text-xl font-bold text-foreground">Growth Predictor</h1>
          <p className="text-sm text-muted-foreground">Predict your channel growth</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current">Current Subscribers</Label>
          <Input
            id="current"
            type="number"
            placeholder="e.g., 5000"
            value={currentSubs}
            onChange={(e) => setCurrentSubs(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastMonth">Subscribers 30 Days Ago</Label>
          <Input
            id="lastMonth"
            type="number"
            placeholder="e.g., 4500"
            value={lastMonthSubs}
            onChange={(e) => setLastMonthSubs(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="target">Target Subscribers (optional)</Label>
          <Input
            id="target"
            type="number"
            placeholder="e.g., 10000"
            value={targetSubs}
            onChange={(e) => setTargetSubs(e.target.value)}
          />
        </div>

        <Button onClick={predict} className="w-full gap-2">
          <TrendingUp className="h-4 w-4" />
          Predict Growth
        </Button>
      </Card>

      {predictions && (
        <div className="space-y-4 animate-fade-in">
          <Card variant="gradient" className="p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Growth Predictions
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/5 border border-primary/10">
                <span className="text-sm text-muted-foreground">1 Month</span>
                <span className="font-bold text-foreground">{formatNumber(predictions.oneMonth)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-sm text-muted-foreground">3 Months</span>
                <span className="font-bold text-foreground">{formatNumber(predictions.threeMonths)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/15 border border-primary/30">
                <span className="text-sm text-muted-foreground">6 Months</span>
                <span className="font-bold text-foreground">{formatNumber(predictions.sixMonths)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/20 border border-primary/40">
                <span className="text-sm text-muted-foreground">1 Year</span>
                <span className="font-bold text-lg text-foreground">{formatNumber(predictions.oneYear)}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Based on {predictions.growthRate.toFixed(1)}% monthly growth rate
            </p>
          </Card>

          <Card variant="gradient" className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl gradient-primary">
                <Target className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Milestone: {predictions.milestone}</p>
                <p className="font-bold text-foreground">
                  {predictions.milestoneDate !== "N/A" 
                    ? `Estimated: ${predictions.milestoneDate}`
                    : "Keep growing to see estimate!"}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
