import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Globe, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface TimeSlot {
  day: string;
  time: string;
  rating: "best" | "good" | "okay";
  reason: string;
}

interface NicheData {
  niche: string;
  bestTimes: TimeSlot[];
  insights: string[];
}

const nicheTimeData: Record<string, NicheData> = {
  gaming: {
    niche: "Gaming",
    bestTimes: [
      { day: "Friday", time: "3:00 PM", rating: "best", reason: "Weekend starts, peak gaming time" },
      { day: "Saturday", time: "11:00 AM", rating: "best", reason: "Weekend morning gamers active" },
      { day: "Sunday", time: "2:00 PM", rating: "good", reason: "Lazy Sunday gaming sessions" },
      { day: "Wednesday", time: "4:00 PM", rating: "okay", reason: "Mid-week break for students" },
    ],
    insights: ["Gaming audience peaks on weekends", "Avoid Monday mornings", "School hours = dead zone"],
  },
  tech: {
    niche: "Tech Reviews",
    bestTimes: [
      { day: "Tuesday", time: "10:00 AM", rating: "best", reason: "Work break, tech professionals active" },
      { day: "Thursday", time: "9:00 AM", rating: "best", reason: "Pre-weekend tech research" },
      { day: "Saturday", time: "10:00 AM", rating: "good", reason: "Weekend hobbyist browsing" },
      { day: "Monday", time: "12:00 PM", rating: "okay", reason: "Lunch break browsing" },
    ],
    insights: ["Tech audience is most active during work hours", "Tuesday-Thursday are peak days", "Avoid late nights"],
  },
  fitness: {
    niche: "Fitness",
    bestTimes: [
      { day: "Monday", time: "6:00 AM", rating: "best", reason: "New week motivation peak" },
      { day: "Sunday", time: "8:00 AM", rating: "best", reason: "Meal prep & planning day" },
      { day: "Wednesday", time: "5:00 PM", rating: "good", reason: "Mid-week workout planning" },
      { day: "Saturday", time: "7:00 AM", rating: "good", reason: "Weekend warrior time" },
    ],
    insights: ["Early morning performs best", "Monday = fresh start mentality", "Avoid Friday evenings"],
  },
  cooking: {
    niche: "Cooking/Food",
    bestTimes: [
      { day: "Saturday", time: "10:00 AM", rating: "best", reason: "Weekend cooking preparation" },
      { day: "Sunday", time: "11:00 AM", rating: "best", reason: "Brunch & meal prep time" },
      { day: "Friday", time: "5:00 PM", rating: "good", reason: "Weekend dinner planning" },
      { day: "Wednesday", time: "6:00 PM", rating: "okay", reason: "Dinner inspiration time" },
    ],
    insights: ["Weekends are prime for food content", "Meal prep Sunday is huge", "Evenings work for quick recipes"],
  },
  education: {
    niche: "Education/Tutorial",
    bestTimes: [
      { day: "Tuesday", time: "3:00 PM", rating: "best", reason: "After school/work learning" },
      { day: "Thursday", time: "4:00 PM", rating: "best", reason: "Pre-weekend skill building" },
      { day: "Saturday", time: "9:00 AM", rating: "good", reason: "Dedicated weekend learning" },
      { day: "Sunday", time: "7:00 PM", rating: "okay", reason: "Week preparation time" },
    ],
    insights: ["Afternoon posts perform best", "Avoid Monday (too busy)", "Weekend mornings = motivated learners"],
  },
  entertainment: {
    niche: "Entertainment/Vlogs",
    bestTimes: [
      { day: "Friday", time: "6:00 PM", rating: "best", reason: "Weekend entertainment begins" },
      { day: "Saturday", time: "12:00 PM", rating: "best", reason: "Peak leisure time" },
      { day: "Sunday", time: "3:00 PM", rating: "good", reason: "Lazy afternoon watching" },
      { day: "Thursday", time: "7:00 PM", rating: "okay", reason: "Weekend anticipation" },
    ],
    insights: ["Weekends dominate entertainment", "Friday evening is golden hour", "Avoid work hours"],
  },
};

export const BestPostingTimePage = () => {
  const navigate = useNavigate();
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [timezone, setTimezone] = useState("local");

  const niches = Object.keys(nicheTimeData);

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case "best":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">🔥 Best</Badge>;
      case "good":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">👍 Good</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Okay</Badge>;
    }
  };

  const selectedData = selectedNiche ? nicheTimeData[selectedNiche] : null;

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
          <h1 className="text-xl font-bold text-foreground">Best Posting Times</h1>
          <p className="text-sm text-muted-foreground">Optimize your upload schedule</p>
        </div>
      </div>

      <Card variant="gradient" className="p-5 space-y-4">
        <div className="space-y-2">
          <Label>Select Your Niche</Label>
          <div className="grid grid-cols-2 gap-2">
            {niches.map((niche) => (
              <Button
                key={niche}
                variant={selectedNiche === niche ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedNiche(niche)}
                className="justify-start"
              >
                {nicheTimeData[niche].niche}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Timezone</Label>
          <div className="flex gap-2">
            <Button
              variant={timezone === "local" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimezone("local")}
              className="gap-2"
            >
              <Globe className="h-4 w-4" /> Local Time
            </Button>
            <Button
              variant={timezone === "est" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimezone("est")}
            >
              EST
            </Button>
            <Button
              variant={timezone === "pst" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimezone("pst")}
            >
              PST
            </Button>
          </div>
        </div>
      </Card>

      {selectedData && (
        <div className="space-y-4 animate-fade-in">
          <Card variant="gradient" className="p-5 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Best Times for {selectedData.niche}
            </h3>

            <div className="space-y-3">
              {selectedData.bestTimes.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">{slot.day}</p>
                      <p className="text-lg font-bold text-primary">{slot.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getRatingBadge(slot.rating)}
                    <p className="text-xs text-muted-foreground mt-1">{slot.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="gradient" className="p-5 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Insights for {selectedData.niche}
            </h3>
            {selectedData.insights.map((insight, i) => (
              <p key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                {insight}
              </p>
            ))}
          </Card>

          <Card variant="gradient" className="p-4">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Pro tip:</strong> Schedule uploads 1-2 hours before peak times so YouTube has time to process and recommend your video.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};
