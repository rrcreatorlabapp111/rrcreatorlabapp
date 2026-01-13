import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Calculator, TrendingUp, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface EngagementResult {
  rate: number;
  rating: string;
  benchmark: string;
  tips: string[];
}

export const IGEngagementPage = () => {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [saves, setSaves] = useState("");
  const [result, setResult] = useState<EngagementResult | null>(null);

  const calculateEngagement = () => {
    const followersNum = parseInt(followers.replace(/,/g, '')) || 0;
    const likesNum = parseInt(likes.replace(/,/g, '')) || 0;
    const commentsNum = parseInt(comments.replace(/,/g, '')) || 0;
    const savesNum = parseInt(saves.replace(/,/g, '')) || 0;

    if (followersNum === 0) return;

    const totalEngagement = likesNum + commentsNum + savesNum;
    const rate = (totalEngagement / followersNum) * 100;

    let rating = "Low";
    let benchmark = "Below average";
    const tips: string[] = [];

    if (rate >= 6) {
      rating = "Excellent";
      benchmark = "Top 10% of creators";
      tips.push("Keep up the great work!");
      tips.push("Consider brand partnerships");
    } else if (rate >= 3) {
      rating = "Good";
      benchmark = "Above average";
      tips.push("Focus on more carousel posts");
      tips.push("Increase story engagement");
    } else if (rate >= 1) {
      rating = "Average";
      benchmark = "Industry standard";
      tips.push("Try posting Reels more often");
      tips.push("Use more engaging CTAs");
      tips.push("Optimize posting times");
    } else {
      rating = "Low";
      benchmark = "Needs improvement";
      tips.push("Analyze your best performing posts");
      tips.push("Engage more with your audience");
      tips.push("Post more consistently");
      tips.push("Try different content formats");
    }

    setResult({ rate, rating, benchmark, tips });
  };

  const formatNumber = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Excellent": return "bg-green-500/20 text-green-400";
      case "Good": return "bg-primary/20 text-primary";
      case "Average": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-red-500/20 text-red-400";
    }
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
          <h1 className="text-xl font-bold text-foreground">Engagement Rate</h1>
          <p className="text-sm text-muted-foreground">Calculate your Instagram engagement rate</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="followers">Total Followers</Label>
            <Input
              id="followers"
              type="text"
              placeholder="e.g., 10,000"
              value={followers}
              onChange={(e) => setFollowers(formatNumber(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="likes">Avg Likes/Post</Label>
            <Input
              id="likes"
              type="text"
              placeholder="e.g., 500"
              value={likes}
              onChange={(e) => setLikes(formatNumber(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Avg Comments</Label>
            <Input
              id="comments"
              type="text"
              placeholder="e.g., 25"
              value={comments}
              onChange={(e) => setComments(formatNumber(e.target.value))}
            />
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="saves">Avg Saves (optional)</Label>
            <Input
              id="saves"
              type="text"
              placeholder="e.g., 50"
              value={saves}
              onChange={(e) => setSaves(formatNumber(e.target.value))}
            />
          </div>
        </div>

        <Button onClick={calculateEngagement} className="w-full gap-2">
          <Calculator className="h-4 w-4" />
          Calculate Engagement
        </Button>
      </Card>

      {result && (
        <Card variant="gradient" className="p-5 space-y-4 animate-fade-in">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Heart className="h-6 w-6 text-pink-500" />
              <span className="text-3xl font-bold text-foreground">{result.rate.toFixed(2)}%</span>
            </div>
            <Badge className={getRatingColor(result.rating)}>{result.rating}</Badge>
            <p className="text-sm text-muted-foreground">{result.benchmark}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Engagement Level</span>
              <span className="text-foreground">{Math.min(result.rate * 10, 100).toFixed(0)}%</span>
            </div>
            <Progress value={Math.min(result.rate * 10, 100)} className="h-2" />
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Tips to Improve
            </h4>
            <ul className="space-y-1.5">
              {result.tips.map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-xs text-muted-foreground">
              <strong>Benchmarks:</strong> 1-3% average, 3-6% good, 6%+ excellent
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};
