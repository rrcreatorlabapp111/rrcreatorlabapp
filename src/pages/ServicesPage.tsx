import { PricingCard } from "@/components/services/PricingCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Search, Image } from "lucide-react";

const WHATSAPP_MESSAGE = encodeURIComponent("Hi RR Creator Labs, I want to grow my channel.");
const WHATSAPP_LINK = `https://wa.me/919999999999?text=${WHATSAPP_MESSAGE}`;

const plans = [
  {
    title: "Starter Creator Plan",
    price: "₹2,000 – ₹8,000 / month",
    features: [
      "Content strategy & ideas",
      "8–10 reels / shorts editing",
      "Caption & hashtag support",
      "Weekly progress update",
    ],
    buttonText: "Start Growing",
    isPopular: false,
  },
  {
    title: "Growth Plan",
    price: "₹8,000 – ₹20,000 / month",
    features: [
      "Complete growth strategy",
      "12–20 reels / shorts editing",
      "YouTube & Instagram management",
      "Engagement & analytics tracking",
    ],
    buttonText: "Choose Plan",
    isPopular: true,
  },
  {
    title: "Premium Management",
    price: "₹25,000 – ₹50,000 / month",
    features: [
      "End-to-end account management",
      "Advanced growth execution",
      "Community building",
      "Priority support 24/7",
    ],
    buttonText: "Talk to Expert",
    isPopular: false,
  },
];

const additionalServices = [
  {
    icon: Search,
    title: "Channel Audit",
    price: "₹999",
    description: "Complete analysis of your channel",
  },
  {
    icon: Image,
    title: "Thumbnails / Creatives",
    price: "₹299",
    description: "Eye-catching designs that convert",
  },
];

export const ServicesPage = () => {
  const handleContact = () => {
    window.open(WHATSAPP_LINK, "_blank");
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="space-y-1 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Our Services</h1>
        <p className="text-muted-foreground">Professional creator growth services</p>
      </div>

      {/* Pricing Cards */}
      <div className="space-y-4">
        {plans.map((plan, index) => (
          <div
            key={plan.title}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <PricingCard
              title={plan.title}
              price={plan.price}
              features={plan.features}
              buttonText={plan.buttonText}
              isPopular={plan.isPopular}
              onContact={handleContact}
            />
          </div>
        ))}
      </div>

      {/* Additional Services */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <h2 className="text-lg font-semibold text-foreground">Additional Services</h2>
        <div className="grid grid-cols-2 gap-3">
          {additionalServices.map((service) => (
            <Card key={service.title} variant="gradient" className="p-4">
              <div className="p-2 rounded-lg gradient-primary w-fit mb-3">
                <service.icon className="h-4 w-4 text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{service.title}</h3>
              <p className="text-lg font-bold gradient-text">{service.price}</p>
              <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <Card variant="glow" className="p-5 text-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Ready to Grow?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Let's discuss your creator journey
        </p>
        <Button variant="whatsapp" size="lg" onClick={handleContact} className="w-full">
          <MessageCircle className="h-5 w-5" />
          Contact on WhatsApp
        </Button>
      </Card>
    </div>
  );
};
