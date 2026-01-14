import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Sparkles, Copy, Check, Video, Image, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CalendarDay {
  day: number;
  type: string;
  topic: string;
  purpose: string;
}

export const IGContentCalendarPage = () => {
  const navigate = useNavigate();
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("growth");
  const [frequency, setFrequency] = useState("daily");
  const [followers, setFollowers] = useState("");
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const goals = ["growth", "engagement", "sales", "brand building", "community"];
  const frequencies = ["daily", "5x per week", "3x per week", "2x per week"];

  const generateCalendar = async () => {
    if (!niche.trim()) {
      toast.error("Please enter your niche");
      return;
    }

    setIsLoading(true);
    setCalendar([]);

    try {
      const response = await supabase.functions.invoke("ai-generator", {
        body: {
          type: "instagram-content-calendar",
          niche,
          audience,
          goal,
          frequency,
          followers,
        },
      });

      if (response.error) throw response.error;

      const rawContent = response.data?.content || response.data?.generatedText || "";
      
      // Parse calendar days
      const parsedDays: CalendarDay[] = [];
      const dayBlocks = rawContent.split(/(?=Day\s*\d+|#\d+|\d+\.)/gi).filter((block: string) => block.trim().length > 10);
      
      for (let i = 0; i < Math.min(dayBlocks.length, 30); i++) {
        const block = dayBlocks[i];
        const dayNum = i + 1;
        
        const typeMatch = block.match(/(?:type|content|format):\s*(reel|post|carousel|story)/i);
        const topicMatch = block.match(/(?:topic|idea|content):\s*([^\n]+)/i);
        const purposeMatch = block.match(/(?:purpose|goal|focus):\s*(growth|engagement|trust|sales|community|awareness)/i);
        
        const type = typeMatch?.[1]?.toLowerCase() || 
                     (block.toLowerCase().includes('reel') ? 'reel' : 
                      block.toLowerCase().includes('carousel') ? 'carousel' : 
                      block.toLowerCase().includes('story') ? 'story' : 'post');
        
        const topic = topicMatch?.[1]?.trim() || 
                      block.split('\n').find((l: string) => l.length > 20 && !l.match(/^day|type|purpose/i))?.trim() || 
                      `${niche} content idea`;
        
        const purpose = purposeMatch?.[1]?.toLowerCase() || 
                       (i % 3 === 0 ? 'growth' : i % 3 === 1 ? 'engagement' : 'trust');

        parsedDays.push({ day: dayNum, type, topic, purpose });
      }

      // Fill remaining days if needed
      while (parsedDays.length < 30) {
        const i = parsedDays.length;
        parsedDays.push({
          day: i + 1,
          type: i % 3 === 0 ? 'reel' : i % 3 === 1 ? 'carousel' : 'post',
          topic: `${niche} tip #${i + 1}`,
          purpose: i % 3 === 0 ? 'growth' : i % 3 === 1 ? 'engagement' : 'trust',
        });
      }

      setCalendar(parsedDays);
      toast.success("30-day calendar generated!");
    } catch (error: any) {
      console.error("Error generating calendar:", error);
      toast.error("Failed to generate calendar");
    } finally {
      setIsLoading(false);
    }
  };

  const copyDay = (day: CalendarDay, index: number) => {
    const text = `Day ${day.day}: ${day.type.toUpperCase()}\nTopic: ${day.topic}\nPurpose: ${day.purpose}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Copied!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'reel': return <Video className="h-3 w-3" />;
      case 'story': return <MessageSquare className="h-3 w-3" />;
      default: return <Image className="h-3 w-3" />;
    }
  };

  const getPurposeColor = (purpose: string) => {
    switch (purpose.toLowerCase()) {
      case 'growth': return 'bg-green-500/20 text-green-500';
      case 'engagement': return 'bg-blue-500/20 text-blue-500';
      case 'trust': return 'bg-purple-500/20 text-purple-500';
      case 'sales': return 'bg-orange-500/20 text-orange-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")} className="shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">30-Day Content Calendar</h1>
          <p className="text-sm text-muted-foreground">Plan your Instagram content</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Your Niche *</Label>
          <Input
            id="niche"
            placeholder="e.g., Fitness, Travel, Business"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience">Target Audience</Label>
          <Input
            id="audience"
            placeholder="e.g., Women 25-35, entrepreneurs"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          />
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
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frequencies.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="followers">Current Followers</Label>
          <Input
            id="followers"
            placeholder="e.g., 1000, 10K"
            value={followers}
            onChange={(e) => setFollowers(e.target.value)}
          />
        </div>

        <Button onClick={generateCalendar} className="w-full gap-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating Calendar...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate 30-Day Calendar
            </>
          )}
        </Button>
      </Card>

      {calendar.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-pink-500" />
            Your 30-Day Calendar
          </h3>

          <div className="grid gap-2">
            {calendar.map((day, index) => (
              <Card 
                key={index} 
                variant="gradient" 
                className="p-3 animate-fade-in cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => copyDay(day, index)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {day.day}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs gap-1">
                        {getTypeIcon(day.type)}
                        {day.type}
                      </Badge>
                      <Badge className={`text-xs ${getPurposeColor(day.purpose)}`}>
                        {day.purpose}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground truncate">{day.topic}</p>
                  </div>
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
