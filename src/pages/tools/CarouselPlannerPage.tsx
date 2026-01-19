import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Layout, Copy, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CarouselSlide {
  slideNumber: number;
  headline: string;
  content: string;
  visualTip: string;
}

export const CarouselPlannerPage = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [slideCount, setSlideCount] = useState("5");
  const [goal, setGoal] = useState("educate");
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateCarousel = async () => {
    if (!topic.trim() || !niche.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("ai-generator", {
        body: {
          type: "carousel-planner",
          data: { topic, niche, slideCount, goal }
        }
      });

      if (response.error) throw response.error;

      const text = response.data?.text || response.data;
      
      // Parse slides from response
      const parsedSlides: CarouselSlide[] = [];
      const slideMatches = text.match(/Slide\s*\d+[:\-]?\s*([^\n]+)\n([^]*?)(?=Slide\s*\d+|$)/gi);
      
      if (slideMatches) {
        slideMatches.forEach((match: string, index: number) => {
          const lines = match.split('\n').filter((l: string) => l.trim());
          parsedSlides.push({
            slideNumber: index + 1,
            headline: lines[0]?.replace(/Slide\s*\d+[:\-]?\s*/i, '').trim() || `Slide ${index + 1}`,
            content: lines.slice(1, -1).join(' ').trim() || "Content for this slide",
            visualTip: lines[lines.length - 1]?.replace(/visual|tip|design/gi, '').trim() || "Use bold text and clean design"
          });
        });
      }

      if (parsedSlides.length === 0) {
        // Fallback parsing
        for (let i = 1; i <= parseInt(slideCount); i++) {
          parsedSlides.push({
            slideNumber: i,
            headline: i === 1 ? `${topic} - Hook` : i === parseInt(slideCount) ? "Call to Action" : `Key Point ${i - 1}`,
            content: text.substring((i - 1) * 100, i * 100) || "Add your content here",
            visualTip: "Use contrasting colors and minimal text"
          });
        }
      }

      setSlides(parsedSlides);
      toast.success("Carousel plan generated!");
    } catch (error) {
      console.error("Error generating carousel:", error);
      toast.error("Failed to generate carousel plan");
    } finally {
      setIsLoading(false);
    }
  };

  const copySlide = (slide: CarouselSlide) => {
    const text = `Slide ${slide.slideNumber}: ${slide.headline}\n${slide.content}\nVisual Tip: ${slide.visualTip}`;
    navigator.clipboard.writeText(text);
    toast.success("Slide copied!");
  };

  const copyAll = () => {
    const text = slides.map(s => `Slide ${s.slideNumber}: ${s.headline}\n${s.content}\nVisual Tip: ${s.visualTip}`).join('\n\n');
    navigator.clipboard.writeText(text);
    toast.success("All slides copied!");
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/tools")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Carousel Planner</h1>
          <p className="text-sm text-muted-foreground">Plan multi-slide carousel posts</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Topic/Theme</Label>
            <Input
              placeholder="e.g., 5 Tips for Better Sleep"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Niche</Label>
            <Input
              placeholder="e.g., Health & Wellness"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of Slides</Label>
              <Select value={slideCount} onValueChange={setSlideCount}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 Slides</SelectItem>
                  <SelectItem value="7">7 Slides</SelectItem>
                  <SelectItem value="10">10 Slides</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Goal</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="educate">Educate</SelectItem>
                  <SelectItem value="inspire">Inspire</SelectItem>
                  <SelectItem value="entertain">Entertain</SelectItem>
                  <SelectItem value="sell">Sell/Promote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={generateCarousel}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Layout className="h-4 w-4 mr-2" />
                Generate Carousel
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {slides.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Carousel Plan</h2>
            <Button variant="outline" size="sm" onClick={copyAll}>
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
          </div>

          <div className="space-y-3">
            {slides.map((slide) => (
              <Card key={slide.slideNumber} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Slide {slide.slideNumber}</Badge>
                      <CardTitle className="text-base">{slide.headline}</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copySlide(slide)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-foreground">{slide.content}</p>
                  <p className="text-xs text-muted-foreground italic">💡 {slide.visualTip}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
