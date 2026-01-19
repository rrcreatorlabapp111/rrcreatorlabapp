import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface ReachEstimate {
  estimatedReach: number;
  impressions: number;
  potentialEngagement: number;
  reachPercentage: number;
  tips: string[];
}

export const ReachEstimatorPage = () => {
  const navigate = useNavigate();
  const [followers, setFollowers] = useState("");
  const [engagementRate, setEngagementRate] = useState("");
  const [postType, setPostType] = useState("reel");
  const [hashtagCount, setHashtagCount] = useState("15");
  const [estimate, setEstimate] = useState<ReachEstimate | null>(null);

  const formatNumber = (value: string) => {
    const num = value.replace(/,/g, "");
    if (!isNaN(Number(num)) && num !== "") {
      return Number(num).toLocaleString();
    }
    return value;
  };

  const calculateReach = () => {
    const followerCount = parseInt(followers.replace(/,/g, "")) || 0;
    const engagement = parseFloat(engagementRate) || 3;

    if (followerCount <= 0) {
      toast.error("Please enter your follower count");
      return;
    }

    // Base reach multipliers by content type
    const typeMultipliers: Record<string, number> = {
      reel: 3.5,
      carousel: 1.8,
      static: 1.2,
      story: 0.6
    };

    // Hashtag boost (optimal is 20-30)
    const hashtags = parseInt(hashtagCount);
    const hashtagBoost = hashtags >= 20 && hashtags <= 30 ? 1.2 : hashtags >= 10 ? 1.1 : 1;

    // Engagement rate boost
    const engagementBoost = engagement > 5 ? 1.5 : engagement > 3 ? 1.2 : 1;

    const baseReach = followerCount * (typeMultipliers[postType] || 1.5);
    const estimatedReach = Math.round(baseReach * hashtagBoost * engagementBoost);
    const impressions = Math.round(estimatedReach * 1.5);
    const potentialEngagement = Math.round(estimatedReach * (engagement / 100));
    const reachPercentage = Math.min(Math.round((estimatedReach / followerCount) * 100), 500);

    const tips: string[] = [];
    if (postType !== "reel") tips.push("Reels typically get 2-3x more reach than other formats");
    if (hashtags < 20) tips.push("Use 20-30 relevant hashtags for optimal reach");
    if (engagement < 3) tips.push("Focus on engagement-driving CTAs to boost your rate");
    if (engagement > 5) tips.push("Great engagement rate! Keep creating valuable content");
    tips.push("Post during peak hours (12-3 PM and 7-9 PM) for better reach");

    setEstimate({
      estimatedReach,
      impressions,
      potentialEngagement,
      reachPercentage,
      tips
    });

    toast.success("Reach estimated!");
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Reach Estimator</h1>
          <p className="text-sm text-muted-foreground">Estimate potential reach for your posts</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Follower Count</Label>
            <Input
              placeholder="e.g., 10,000"
              value={followers}
              onChange={(e) => setFollowers(formatNumber(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label>Engagement Rate (%)</Label>
            <Input
              placeholder="e.g., 3.5"
              type="number"
              step="0.1"
              value={engagementRate}
              onChange={(e) => setEngagementRate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Post Type</Label>
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reel">Reel</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="static">Static Post</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Hashtag Count</Label>
              <Select value={hashtagCount} onValueChange={setHashtagCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 hashtags</SelectItem>
                  <SelectItem value="15">15 hashtags</SelectItem>
                  <SelectItem value="25">25 hashtags</SelectItem>
                  <SelectItem value="30">30 hashtags</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full" onClick={calculateReach}>
            <Calculator className="h-4 w-4 mr-2" />
            Estimate Reach
          </Button>
        </CardContent>
      </Card>

      {estimate && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Estimated Reach
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {estimate.estimatedReach.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">accounts reached</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Reach vs Followers</span>
                  <span className="font-medium">{estimate.reachPercentage}%</span>
                </div>
                <Progress value={Math.min(estimate.reachPercentage, 100)} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <p className="text-xl font-semibold">{estimate.impressions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Impressions</p>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <p className="text-xl font-semibold">{estimate.potentialEngagement.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Engagements</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tips to Increase Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {estimate.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
