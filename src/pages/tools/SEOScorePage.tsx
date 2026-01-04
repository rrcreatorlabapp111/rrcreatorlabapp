import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

interface SEOResult {
  score: number;
  titleScore: { score: number; issues: string[]; passed: string[] };
  descriptionScore: { score: number; issues: string[]; passed: string[] };
  tagsScore: { score: number; issues: string[]; passed: string[] };
  overallTips: string[];
}

export const SEOScorePage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SEOResult | null>(null);

  const analyzeSEO = () => {
    const titleIssues: string[] = [];
    const titlePassed: string[] = [];
    const descIssues: string[] = [];
    const descPassed: string[] = [];
    const tagsIssues: string[] = [];
    const tagsPassed: string[] = [];
    const overallTips: string[] = [];

    let titleScore = 100;
    let descScore = 100;
    let tagsScore = 100;

    // Title analysis
    if (title.length < 30) {
      titleIssues.push("Title is too short (aim for 50-60 characters)");
      titleScore -= 20;
    } else if (title.length > 70) {
      titleIssues.push("Title is too long (may get truncated)");
      titleScore -= 15;
    } else {
      titlePassed.push("Title length is optimal");
    }

    if (keyword && !title.toLowerCase().includes(keyword.toLowerCase())) {
      titleIssues.push("Main keyword not in title");
      titleScore -= 25;
    } else if (keyword) {
      titlePassed.push("Contains main keyword");
    }

    if (/[0-9]/.test(title)) {
      titlePassed.push("Contains numbers (increases CTR)");
    } else {
      overallTips.push("Consider adding numbers to your title for higher CTR");
    }

    // Description analysis
    if (description.length < 100) {
      descIssues.push("Description is too short (aim for 150-200 characters)");
      descScore -= 25;
    } else if (description.length > 300) {
      descIssues.push("Description is too long");
      descScore -= 10;
    } else {
      descPassed.push("Description length is good");
    }

    if (keyword && !description.toLowerCase().includes(keyword.toLowerCase())) {
      descIssues.push("Main keyword not in first 2 lines");
      descScore -= 20;
    } else if (keyword) {
      descPassed.push("Contains main keyword");
    }

    if (!description.includes("http")) {
      descIssues.push("No links in description");
      descScore -= 10;
    } else {
      descPassed.push("Contains links");
    }

    // Tags analysis
    const tagsList = tags.split(",").map(t => t.trim()).filter(t => t);
    if (tagsList.length < 5) {
      tagsIssues.push("Add more tags (aim for 10-15)");
      tagsScore -= 25;
    } else if (tagsList.length >= 10) {
      tagsPassed.push("Good number of tags");
    }

    if (keyword && !tagsList.some(t => t.toLowerCase().includes(keyword.toLowerCase()))) {
      tagsIssues.push("Main keyword not in tags");
      tagsScore -= 20;
    } else if (keyword) {
      tagsPassed.push("Main keyword included in tags");
    }

    const avgTagLength = tagsList.reduce((a, t) => a + t.length, 0) / (tagsList.length || 1);
    if (avgTagLength > 20) {
      tagsPassed.push("Good mix of long-tail keywords");
    } else if (tagsList.length > 0) {
      overallTips.push("Include some longer, more specific keyword phrases");
    }

    const overall = Math.round((titleScore + descScore + tagsScore) / 3);

    setResults({
      score: overall,
      titleScore: { score: titleScore, issues: titleIssues, passed: titlePassed },
      descriptionScore: { score: descScore, issues: descIssues, passed: descPassed },
      tagsScore: { score: tagsScore, issues: tagsIssues, passed: tagsPassed },
      overallTips,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
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
          <h1 className="text-xl font-bold text-foreground">SEO Score</h1>
          <p className="text-sm text-muted-foreground">Analyze your video SEO</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="keyword">Main Keyword</Label>
          <Input
            id="keyword"
            placeholder="e.g., how to edit videos"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Video Title</Label>
          <Input
            id="title"
            placeholder="Your video title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{title.length}/70 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (first 2-3 lines)</Label>
          <Textarea
            id="description"
            placeholder="Your video description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">{description.length}/300 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma separated)</Label>
          <Textarea
            id="tags"
            placeholder="tag1, tag2, tag3..."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            rows={2}
          />
        </div>

        <Button onClick={analyzeSEO} className="w-full gap-2">
          <Search className="h-4 w-4" />
          Analyze SEO
        </Button>
      </Card>

      {results && (
        <div className="space-y-4 animate-fade-in">
          <Card variant="gradient" className="p-5 text-center">
            <p className="text-sm text-muted-foreground mb-2">Overall SEO Score</p>
            <p className={`text-5xl font-bold ${getScoreColor(results.score)}`}>
              {results.score}
            </p>
            <Progress 
              value={results.score} 
              className={`h-2 mt-3 ${getProgressColor(results.score)}`} 
            />
          </Card>

          {[
            { label: "Title", data: results.titleScore },
            { label: "Description", data: results.descriptionScore },
            { label: "Tags", data: results.tagsScore },
          ].map((section) => (
            <Card key={section.label} variant="gradient" className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-foreground">{section.label}</h4>
                <span className={`font-bold ${getScoreColor(section.data.score)}`}>
                  {section.data.score}/100
                </span>
              </div>
              {section.data.passed.map((item, i) => (
                <p key={i} className="text-sm text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> {item}
                </p>
              ))}
              {section.data.issues.map((item, i) => (
                <p key={i} className="text-sm text-red-400 flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> {item}
                </p>
              ))}
            </Card>
          ))}

          {results.overallTips.length > 0 && (
            <Card variant="gradient" className="p-4 space-y-2">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                Additional Tips
              </h4>
              {results.overallTips.map((tip, i) => (
                <p key={i} className="text-sm text-muted-foreground">• {tip}</p>
              ))}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
