import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

interface EngagementResults {
  engagementRate: number;
  likeRatio: number;
  commentRatio: number;
  shareRatio: number;
  rating: string;
  tips: string[];
}

export const EngagementAnalyzerPage = () => {
  const navigate = useNavigate();
  const [views, setViews] = useState("");
  const [likes, setLikes] = useState("");
  const [comments, setComments] = useState("");
  const [shares, setShares] = useState("");
  const [results, setResults] = useState<EngagementResults | null>(null);

  const analyzeEngagement = () => {
    const v = parseInt(views) || 1;
    const l = parseInt(likes) || 0;
    const c = parseInt(comments) || 0;
    const s = parseInt(shares) || 0;

    const likeRatio = (l / v) * 100;
    const commentRatio = (c / v) * 100;
    const shareRatio = (s / v) * 100;
    const engagementRate = ((l + c + s) / v) * 100;

    const tips: string[] = [];
    let rating = "Average";

    if (engagementRate >= 8) {
      rating = "Excellent";
    } else if (engagementRate >= 5) {
      rating = "Good";
    } else if (engagementRate >= 2) {
      rating = "Average";
      tips.push("Add a strong CTA asking viewers to like and comment");
    } else {
      rating = "Needs Improvement";
      tips.push("Try asking a question at the end of your video");
      tips.push("Use pattern interrupts to keep viewers engaged");
    }

    if (likeRatio < 4) {
      tips.push("Consider adding a like reminder in your video");
    }
    if (commentRatio < 0.5) {
      tips.push("Ask viewers to share their opinion in comments");
    }
    if (shareRatio < 0.1) {
      tips.push("Create content worth sharing - make it emotional or useful");
    }

    setResults({
      engagementRate,
      likeRatio,
      commentRatio,
      shareRatio,
      rating,
      tips: tips.slice(0, 3),
    });
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Excellent": return "text-green-400";
      case "Good": return "text-emerald-400";
      case "Average": return "text-yellow-400";
      default: return "text-red-400";
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
          <h1 className="text-xl font-bold text-foreground">Engagement Analyzer</h1>
          <p className="text-sm text-muted-foreground">Analyze your video engagement metrics</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="views">Views</Label>
            <Input
              id="views"
              type="number"
              placeholder="10000"
              value={views}
              onChange={(e) => setViews(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="likes">Likes</Label>
            <Input
              id="likes"
              type="number"
              placeholder="500"
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comments">Comments</Label>
            <Input
              id="comments"
              type="number"
              placeholder="50"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shares">Shares</Label>
            <Input
              id="shares"
              type="number"
              placeholder="20"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={analyzeEngagement} className="w-full gap-2">
          <BarChart3 className="h-4 w-4" />
          Analyze Engagement
        </Button>
      </Card>

      {results && (
        <Card variant="gradient" className="p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Engagement Score</h3>
            <span className={`font-bold ${getRatingColor(results.rating)}`}>
              {results.rating}
            </span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" /> Like Rate
                </span>
                <span className="text-foreground">{results.likeRatio.toFixed(2)}%</span>
              </div>
              <Progress value={Math.min(results.likeRatio * 10, 100)} className="h-2" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> Comment Rate
                </span>
                <span className="text-foreground">{results.commentRatio.toFixed(2)}%</span>
              </div>
              <Progress value={Math.min(results.commentRatio * 50, 100)} className="h-2" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Share2 className="h-3 w-3" /> Share Rate
                </span>
                <span className="text-foreground">{results.shareRatio.toFixed(2)}%</span>
              </div>
              <Progress value={Math.min(results.shareRatio * 100, 100)} className="h-2" />
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-lg font-bold text-foreground">
              Overall: {results.engagementRate.toFixed(2)}%
            </p>
          </div>

          {results.tips.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-foreground">Tips to Improve:</p>
              {results.tips.map((tip, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  • {tip}
                </p>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
