import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Plus, Trash2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Competitor {
  name: string;
  subscribers: number;
  avgViews: number;
  uploadFrequency: string;
  engagement: number;
}

interface Analysis {
  yourPosition: string;
  opportunities: string[];
  threats: string[];
  recommendations: string[];
}

export const CompetitorAnalysisPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [yourChannel, setYourChannel] = useState({ subs: "", avgViews: "" });
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [newCompetitor, setNewCompetitor] = useState({ name: "", subs: "", views: "", frequency: "weekly" });
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const addCompetitor = () => {
    if (!newCompetitor.name || !newCompetitor.subs) {
      toast({ title: "Fill in competitor details", variant: "destructive" });
      return;
    }

    const subs = parseInt(newCompetitor.subs) || 0;
    const views = parseInt(newCompetitor.views) || 0;
    const engagement = subs > 0 ? (views / subs) * 100 : 0;

    setCompetitors([...competitors, {
      name: newCompetitor.name,
      subscribers: subs,
      avgViews: views,
      uploadFrequency: newCompetitor.frequency,
      engagement: Math.min(engagement, 100),
    }]);

    setNewCompetitor({ name: "", subs: "", views: "", frequency: "weekly" });
  };

  const removeCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const analyze = () => {
    if (competitors.length === 0) {
      toast({ title: "Add at least one competitor", variant: "destructive" });
      return;
    }

    const yourSubs = parseInt(yourChannel.subs) || 0;
    const yourViews = parseInt(yourChannel.avgViews) || 0;
    const avgCompSubs = competitors.reduce((a, c) => a + c.subscribers, 0) / competitors.length;
    const avgCompViews = competitors.reduce((a, c) => a + c.avgViews, 0) / competitors.length;

    const opportunities: string[] = [];
    const threats: string[] = [];
    const recommendations: string[] = [];

    // Position analysis
    let position = "Mid-tier";
    if (yourSubs > avgCompSubs * 1.5) position = "Leader";
    else if (yourSubs < avgCompSubs * 0.5) position = "Challenger";

    // Opportunities
    if (yourViews / (yourSubs || 1) > avgCompViews / (avgCompSubs || 1)) {
      opportunities.push("Your engagement rate is higher than average - leverage this");
    }
    
    const infrequentCompetitors = competitors.filter(c => c.uploadFrequency === "monthly");
    if (infrequentCompetitors.length > 0) {
      opportunities.push(`${infrequentCompetitors.length} competitor(s) post infrequently - you can outpace them`);
    }

    if (yourSubs < avgCompSubs) {
      opportunities.push("Room for growth - focus on consistency and collaboration");
    }

    // Threats
    const biggerCompetitors = competitors.filter(c => c.subscribers > yourSubs * 2);
    if (biggerCompetitors.length > 0) {
      threats.push(`${biggerCompetitors.length} competitor(s) have 2x+ your audience`);
    }

    const highEngagementComp = competitors.filter(c => c.engagement > 50);
    if (highEngagementComp.length > 0) {
      threats.push("Some competitors have very high engagement - study their content");
    }

    // Recommendations
    if (yourViews < avgCompViews) {
      recommendations.push("Focus on improving thumbnails and titles to boost views");
    }
    recommendations.push("Analyze top-performing videos from your competitors");
    recommendations.push("Find content gaps - topics they haven't covered well");
    if (competitors.some(c => c.uploadFrequency === "daily")) {
      recommendations.push("Consider increasing your upload frequency to stay competitive");
    }

    setAnalysis({
      yourPosition: position,
      opportunities,
      threats,
      recommendations,
    });

    toast({ title: "Analysis complete!" });
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
          <h1 className="text-xl font-bold text-foreground">Competitor Analysis</h1>
          <p className="text-sm text-muted-foreground">Compare your channel with competitors</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <h3 className="font-medium text-foreground">Your Channel</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Your Subscribers</Label>
            <Input
              type="number"
              placeholder="e.g., 5000"
              value={yourChannel.subs}
              onChange={(e) => setYourChannel({ ...yourChannel, subs: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Avg Views/Video</Label>
            <Input
              type="number"
              placeholder="e.g., 1000"
              value={yourChannel.avgViews}
              onChange={(e) => setYourChannel({ ...yourChannel, avgViews: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card variant="gradient" className="p-5 space-y-4">
        <h3 className="font-medium text-foreground">Add Competitor</h3>
        <div className="space-y-3">
          <Input
            placeholder="Channel name"
            value={newCompetitor.name}
            onChange={(e) => setNewCompetitor({ ...newCompetitor, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Subscribers"
              value={newCompetitor.subs}
              onChange={(e) => setNewCompetitor({ ...newCompetitor, subs: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Avg views"
              value={newCompetitor.views}
              onChange={(e) => setNewCompetitor({ ...newCompetitor, views: e.target.value })}
            />
          </div>
          <select
            className="w-full p-2 rounded-md bg-background border border-border text-foreground"
            value={newCompetitor.frequency}
            onChange={(e) => setNewCompetitor({ ...newCompetitor, frequency: e.target.value })}
          >
            <option value="daily">Daily uploads</option>
            <option value="weekly">Weekly uploads</option>
            <option value="biweekly">2x per week</option>
            <option value="monthly">Monthly uploads</option>
          </select>
          <Button onClick={addCompetitor} variant="outline" className="w-full gap-2">
            <Plus className="h-4 w-4" /> Add Competitor
          </Button>
        </div>
      </Card>

      {competitors.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-foreground">Competitors ({competitors.length})</h3>
          {competitors.map((comp, i) => (
            <Card key={i} variant="gradient" className="p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{comp.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(comp.subscribers)} subs • {formatNumber(comp.avgViews)} avg views
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeCompetitor(i)}>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Card>
          ))}
          <Button onClick={analyze} className="w-full gap-2">
            <BarChart3 className="h-4 w-4" /> Analyze Competition
          </Button>
        </div>
      )}

      {analysis && (
        <div className="space-y-4 animate-fade-in">
          <Card variant="gradient" className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Your Position</p>
            <p className="text-2xl font-bold text-primary">{analysis.yourPosition}</p>
          </Card>

          <Card variant="gradient" className="p-4 space-y-2">
            <h4 className="font-medium text-green-400">💡 Opportunities</h4>
            {analysis.opportunities.map((o, i) => (
              <p key={i} className="text-sm text-muted-foreground">• {o}</p>
            ))}
          </Card>

          <Card variant="gradient" className="p-4 space-y-2">
            <h4 className="font-medium text-red-400">⚠️ Threats</h4>
            {analysis.threats.map((t, i) => (
              <p key={i} className="text-sm text-muted-foreground">• {t}</p>
            ))}
          </Card>

          <Card variant="gradient" className="p-4 space-y-2">
            <h4 className="font-medium text-foreground">📋 Recommendations</h4>
            {analysis.recommendations.map((r, i) => (
              <p key={i} className="text-sm text-muted-foreground">• {r}</p>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
};
