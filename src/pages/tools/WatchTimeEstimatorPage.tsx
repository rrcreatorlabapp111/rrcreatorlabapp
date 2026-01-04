import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Results {
  totalWatchTime: string;
  avgViewDuration: string;
  completionRate: string;
  revenueEstimate: string;
}

export const WatchTimeEstimatorPage = () => {
  const navigate = useNavigate();
  const [views, setViews] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [avgRetention, setAvgRetention] = useState("50");
  const [results, setResults] = useState<Results | null>(null);

  const calculateWatchTime = () => {
    const viewsNum = parseInt(views) || 0;
    const durationMins = parseFloat(videoDuration) || 0;
    const retentionPercent = parseFloat(avgRetention) || 50;

    const avgViewDurationMins = durationMins * (retentionPercent / 100);
    const totalWatchTimeHours = (viewsNum * avgViewDurationMins) / 60;
    const completionRate = retentionPercent;
    // Rough estimate: $2-4 CPM for monetized channels
    const revenueEstimate = (viewsNum / 1000) * 3 * (retentionPercent / 50);

    setResults({
      totalWatchTime: totalWatchTimeHours >= 1000 
        ? `${(totalWatchTimeHours / 1000).toFixed(1)}K hours`
        : `${totalWatchTimeHours.toFixed(1)} hours`,
      avgViewDuration: `${avgViewDurationMins.toFixed(1)} mins`,
      completionRate: `${completionRate.toFixed(0)}%`,
      revenueEstimate: `$${revenueEstimate.toFixed(2)}`,
    });
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
          <h1 className="text-xl font-bold text-foreground">Watch Time Estimator</h1>
          <p className="text-sm text-muted-foreground">Calculate total watch time & revenue</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="views">Expected Views</Label>
          <Input
            id="views"
            type="number"
            placeholder="e.g., 10000"
            value={views}
            onChange={(e) => setViews(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Video Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            placeholder="e.g., 10"
            value={videoDuration}
            onChange={(e) => setVideoDuration(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retention">Average Retention %</Label>
          <Input
            id="retention"
            type="number"
            placeholder="e.g., 50"
            value={avgRetention}
            onChange={(e) => setAvgRetention(e.target.value)}
          />
        </div>

        <Button onClick={calculateWatchTime} className="w-full gap-2">
          <Calculator className="h-4 w-4" />
          Calculate Watch Time
        </Button>
      </Card>

      {results && (
        <Card variant="gradient" className="p-5 space-y-4 animate-fade-in">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Results
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground">Total Watch Time</p>
              <p className="text-lg font-bold text-foreground">{results.totalWatchTime}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground">Avg View Duration</p>
              <p className="text-lg font-bold text-foreground">{results.avgViewDuration}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground">Completion Rate</p>
              <p className="text-lg font-bold text-foreground">{results.completionRate}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground">Est. Revenue</p>
              <p className="text-lg font-bold text-foreground">{results.revenueEstimate}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            * Revenue estimate based on ~$3 CPM average
          </p>
        </Card>
      )}
    </div>
  );
};
