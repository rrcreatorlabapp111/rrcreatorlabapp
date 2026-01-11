import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, ExternalLink } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface PlanComparisonTableProps {
  onContact: () => void;
}

const comparisonFeatures = [
  { category: "Content Strategy", features: [
    { name: "Content strategy & ideas", starter: true, growth: true, premium: true },
    { name: "Full growth strategy", starter: false, growth: true, premium: true },
    { name: "Advanced growth strategy", starter: false, growth: false, premium: true },
    { name: "Content planning + execution", starter: false, growth: false, premium: true },
  ]},
  { category: "Video Editing", features: [
    { name: "Reels/Shorts editing", starter: "8–10", growth: "12–20", premium: "20–25" },
    { name: "Long videos", starter: "1–2", growth: "2–4", premium: "4–5" },
  ]},
  { category: "Platform Management", features: [
    { name: "YouTube management", starter: "Basic", growth: true, premium: "Full" },
    { name: "Instagram management", starter: "Basic", growth: true, premium: "Full" },
    { name: "Uploading & scheduling", starter: true, growth: true, premium: true },
    { name: "Titles, descriptions & hashtags", starter: "Basic", growth: true, premium: true },
    { name: "Caption + hashtag support", starter: true, growth: true, premium: true },
  ]},
  { category: "Engagement & Community", features: [
    { name: "Engagement support", starter: false, growth: true, premium: true },
    { name: "Comment moderation", starter: false, growth: false, premium: true },
    { name: "Community building support", starter: false, growth: false, premium: true },
  ]},
  { category: "Reporting & Updates", features: [
    { name: "Progress updates", starter: "Weekly", growth: "Monthly report", premium: "Detailed monthly" },
    { name: "Analytics & roadmap", starter: false, growth: true, premium: true },
  ]},
];

const planDetails = [
  { 
    name: "Starter", 
    price: "₹2,000 – ₹8,000", 
    bestFor: "New Creators",
    isPopular: false 
  },
  { 
    name: "Growth", 
    price: "₹8,000 – ₹20,000", 
    bestFor: "Scaling Creators",
    isPopular: true 
  },
  { 
    name: "Premium", 
    price: "₹25,000 – ₹50,000", 
    bestFor: "Brands & Influencers",
    isPopular: false 
  },
];

const renderFeatureValue = (value: boolean | string) => {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-4 w-4 text-green-500" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground/50" />
    );
  }
  return <span className="text-xs text-foreground font-medium">{value}</span>;
};

export const PlanComparisonTable = ({ onContact }: PlanComparisonTableProps) => {
  return (
    <Card variant="gradient" className="p-4 overflow-hidden">
      <ScrollArea className="w-full">
        <div className="min-w-[500px]">
          {/* Header */}
          <div className="grid grid-cols-4 gap-2 mb-4 sticky top-0 bg-card z-10 pb-3 border-b border-border">
            <div className="text-sm font-semibold text-muted-foreground">Features</div>
            {planDetails.map((plan) => (
              <div key={plan.name} className="text-center relative">
                {plan.isPopular && (
                  <Badge className="absolute -top-1 left-1/2 -translate-x-1/2 gradient-primary border-0 text-foreground text-[10px] px-1.5 py-0">
                    Popular
                  </Badge>
                )}
                <h3 className={`font-bold text-sm ${plan.isPopular ? "mt-4 gradient-text" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <p className="text-xs text-primary font-semibold">{plan.price}</p>
                <p className="text-[10px] text-muted-foreground">{plan.bestFor}</p>
              </div>
            ))}
          </div>

          {/* Feature Categories */}
          {comparisonFeatures.map((category) => (
            <div key={category.category} className="mb-4">
              <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wide">
                {category.category}
              </div>
              {category.features.map((feature, idx) => (
                <div
                  key={feature.name}
                  className={`grid grid-cols-4 gap-2 py-2 ${
                    idx !== category.features.length - 1 ? "border-b border-border/50" : ""
                  }`}
                >
                  <div className="text-xs text-muted-foreground">{feature.name}</div>
                  <div className="flex justify-center items-center">
                    {renderFeatureValue(feature.starter)}
                  </div>
                  <div className="flex justify-center items-center">
                    {renderFeatureValue(feature.growth)}
                  </div>
                  <div className="flex justify-center items-center">
                    {renderFeatureValue(feature.premium)}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* CTA Buttons */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-border">
            <div></div>
            {planDetails.map((plan) => (
              <Button
                key={plan.name}
                variant={plan.isPopular ? "gradient" : "outline"}
                size="sm"
                className="text-xs"
                onClick={onContact}
              >
                <ExternalLink className="h-3 w-3" />
                Get {plan.name}
              </Button>
            ))}
          </div>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
};
