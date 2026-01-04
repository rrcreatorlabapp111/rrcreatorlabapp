import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  bestFor?: string;
  onContact: () => void;
}

export const PricingCard = ({
  title,
  price,
  features,
  buttonText,
  isPopular,
  bestFor,
  onContact,
}: PricingCardProps) => {
  return (
    <Card
      variant={isPopular ? "glow" : "gradient"}
      className={cn(
        "relative overflow-hidden",
        isPopular && "border-primary/50"
      )}
    >
      {isPopular && (
        <div className="absolute top-0 right-0">
          <Badge className="rounded-none rounded-bl-lg gradient-primary border-0 text-foreground">
            Most Popular
          </Badge>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <CardTitle className="text-xl">{title}</CardTitle>
          {bestFor && (
            <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-border/50">
              Best for: {bestFor}
            </Badge>
          )}
        </div>
        <p className="text-2xl font-bold gradient-text">{price}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="p-1 rounded-full gradient-primary shrink-0 mt-0.5">
              <Check className="h-3 w-3 text-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">{feature}</span>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button
          variant={isPopular ? "gradient" : "outline"}
          className="w-full"
          onClick={onContact}
        >
          <MessageCircle className="h-4 w-4" />
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};
