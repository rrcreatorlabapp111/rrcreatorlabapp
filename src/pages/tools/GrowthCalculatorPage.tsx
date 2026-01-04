import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Results {
  growthPercentage: number;
  monthlyProjection: number;
  insight: string;
}

export const GrowthCalculatorPage = () => {
  const navigate = useNavigate();
  const [startFollowers, setStartFollowers] = useState("");
  const [endFollowers, setEndFollowers] = useState("");
  const [days, setDays] = useState("");
  const [results, setResults] = useState<Results | null>(null);

  const calculateGrowth = () => {
    const start = parseInt(startFollowers);
    const end = parseInt(endFollowers);
    const period = parseInt(days);

    if (!start || !end || !period || start < 0 || end < 0 || period <= 0) {
      toast.error("Please enter valid numbers");
      return;
    }

    const growthPercentage = ((end - start) / start) * 100;
    const dailyGrowth = (end - start) / period;
    const monthlyProjection = Math.round(end + (dailyGrowth * 30));

    let insight = "";
    if (growthPercentage > 50) {
      insight = "🚀 Incredible growth! You're crushing it! Keep doing what you're doing.";
    } else if (growthPercentage > 20) {
      insight = "📈 Great progress! Your content strategy is working well.";
    } else if (growthPercentage > 10) {
      insight = "👍 Solid growth! Consider optimizing your posting schedule for better results.";
    } else if (growthPercentage > 0) {
      insight = "📊 Steady growth. Try experimenting with new content formats to boost engagement.";
    } else {
      insight = "💡 Time to pivot! Analyze what's working and double down on that content.";
    }

    setResults({
      growthPercentage: Math.round(growthPercentage * 100) / 100,
      monthlyProjection,
      insight,
    });

    toast.success("Calculation complete!");
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Growth Calculator</h1>
          <p className="text-sm text-muted-foreground">Track your growth rate</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="start">Starting Followers</Label>
          <Input
            id="start"
            type="number"
            placeholder="e.g., 1000"
            value={startFollowers}
            onChange={(e) => setStartFollowers(e.target.value)}
            className="bg-muted border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end">Current Followers</Label>
          <Input
            id="end"
            type="number"
            placeholder="e.g., 1500"
            value={endFollowers}
            onChange={(e) => setEndFollowers(e.target.value)}
            className="bg-muted border-border"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="days">Time Period (days)</Label>
          <Input
            id="days"
            type="number"
            placeholder="e.g., 30"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="bg-muted border-border"
          />
        </div>

        <Button variant="gradient" className="w-full" onClick={calculateGrowth}>
          <Calculator className="h-4 w-4" />
          Calculate Growth
        </Button>
      </Card>

      {results && (
        <div className="space-y-4 animate-slide-up">
          <h2 className="font-semibold text-foreground">Your Results</h2>

          <div className="grid grid-cols-2 gap-3">
            <Card variant="glow" className="p-4 text-center">
              <TrendingUp className={`h-6 w-6 mx-auto mb-2 ${results.growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              <p className="text-2xl font-bold gradient-text">
                {results.growthPercentage >= 0 ? '+' : ''}{results.growthPercentage}%
              </p>
              <p className="text-xs text-muted-foreground">Growth Rate</p>
            </Card>

            <Card variant="gradient" className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold gradient-text">
                {results.monthlyProjection.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">30-Day Projection</p>
            </Card>
          </div>

          <Card variant="gradient" className="p-5">
            <h3 className="font-semibold text-foreground mb-2">Growth Insight</h3>
            <p className="text-muted-foreground">{results.insight}</p>
          </Card>
        </div>
      )}
    </div>
  );
};
