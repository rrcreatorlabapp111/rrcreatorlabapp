import { PricingCard } from "@/components/services/PricingCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Search, Image, Mail, Phone, Instagram, Video, FileText, Globe, Bot, Sparkles, BookOpen, Wrench } from "lucide-react";

const GOOGLE_FORM_LINK = "https://docs.google.com/forms/d/e/1FAIpQLSc7w7_crTXDPXa1Rz_2OOkAX7k_5jq88dEdLr8KiiaICcGh5g/viewform";

const plans = [
  {
    title: "Starter Creator Plan",
    price: "₹2,000 – ₹8,000 / month",
    bestFor: "New & Small Creators",
    features: [
      "Content strategy & ideas",
      "8–10 reels/shorts editing",
      "1–2 long videos",
      "Uploading & scheduling",
      "Caption + hashtag support",
      "Basic YouTube/Instagram optimization",
      "Weekly update",
    ],
    buttonText: "Get Started",
    isPopular: false,
  },
  {
    title: "Growth Plan",
    price: "₹8,000 – ₹20,000 / month",
    bestFor: "Full Content Growth Strategy",
    features: [
      "Full content growth strategy",
      "12–20 reels/shorts editing",
      "2–4 long videos",
      "YouTube or Instagram management",
      "Titles, descriptions & hashtags",
      "Uploading & scheduling",
      "Engagement support (likes/comments strategy)",
      "Monthly performance report",
    ],
    buttonText: "Choose Plan",
    isPopular: true,
  },
  {
    title: "Premium Management Plan",
    price: "₹25,000 – ₹50,000 / month",
    bestFor: "Serious Creators & Brands",
    features: [
      "End-to-end account management",
      "20–25 shorts/reels + 4–5 long videos",
      "YouTube + Instagram handled fully",
      "Content planning + execution",
      "Advanced growth strategy",
      "Comment moderation (basic)",
      "Community building support",
      "Detailed monthly analytics & roadmap",
    ],
    buttonText: "Talk to Expert",
    isPopular: false,
  },
];

const additionalPackages = [
  {
    icon: Video,
    title: "Shorts/Reels Editing",
    price: "₹300 – ₹500",
    unit: "per reel",
    description: "Bulk pricing available",
  },
  {
    icon: FileText,
    title: "Long Video Editing (Basic)",
    price: "₹1,000 – ₹3,000",
    unit: "per video",
    description: "Depending on length & complexity",
  },
  {
    icon: Search,
    title: "Channel Audit & Strategy",
    price: "₹999",
    unit: "one-time",
    description: "Complete channel analysis & growth roadmap",
  },
  {
    icon: Image,
    title: "Thumbnails / Creatives",
    price: "₹299",
    unit: "each",
    description: "Eye-catching designs that drive clicks",
  },
];

const ytServices = [
  {
    icon: BookOpen,
    title: "YT Complete Teaching",
    price: "₹2,999",
    unit: "one-time",
    description: "Webinar + One-to-one sessions for complete YouTube mastery",
    features: ["2-hour comprehensive webinar", "1-on-1 strategy call (30 mins)", "Lifetime access to recordings"],
    isBestValue: false,
  },
  {
    icon: Wrench,
    title: "Toolkit (6 Months)",
    price: "₹2,499",
    unit: "for 6 months",
    description: "Templates, systems, and creator resources bundle",
    features: ["Content calendar templates", "Script writing frameworks", "6 months of updates"],
    isBestValue: false,
  },
  {
    icon: Sparkles,
    title: "Toolkit (Yearly)",
    price: "₹3,999",
    unit: "per year",
    description: "Full year access with priority support included!",
    features: ["Everything in 6-month plan", "Full year of updates", "Priority support"],
    isBestValue: true,
  },
];

const oneTimeServices = [
  {
    icon: Globe,
    title: "Website Creation",
    price: "₹2,000 – ₹5,000",
    unit: "one-time",
    description: "Simple, mobile-friendly website with contact button",
    features: ["Basic: ₹2,000 – ₹3,000", "Standard: ₹3,000 – ₹5,000", "No monthly charges"],
    isBestValue: false,
  },
  {
    icon: Bot,
    title: "AI Chat Agent",
    price: "₹2,000 – ₹3,000",
    unit: "one-time",
    description: "Private AI assistant for content ideas, scripts & growth help",
    features: ["One-time setup", "No monthly charges", "Client-only access"],
    isBestValue: false,
  },
  {
    icon: Sparkles,
    title: "Website + AI Assistant",
    price: "₹3,999 – ₹4,999",
    unit: "one-time",
    description: "Website + private AI chat agent in one package",
    features: ["One-time setup", "No monthly charges", "Made for creators & brands"],
    isBestValue: true,
  },
];

export const ServicesPage = () => {
  const handleContact = () => {
    window.open(GOOGLE_FORM_LINK, "_blank");
  };

  return (
    <div className="px-4 py-6 space-y-8">
      <div className="space-y-1 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Our Services</h1>
        <p className="text-muted-foreground">Flexible packages designed for creators at every stage</p>
      </div>

      {/* Monthly Plans */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Monthly Plans</h2>
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
              bestFor={plan.bestFor}
              onContact={handleContact}
            />
          </div>
        ))}
      </div>

      {/* Additional Packages */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <h2 className="text-lg font-semibold text-foreground">Additional Packages</h2>
        <div className="grid grid-cols-2 gap-3">
          {additionalPackages.map((service) => (
            <Card key={service.title} variant="gradient" className="p-4">
              <div className="p-2 rounded-lg gradient-primary w-fit mb-3">
                <service.icon className="h-4 w-4 text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{service.title}</h3>
              <p className="text-lg font-bold gradient-text">{service.price}</p>
              <p className="text-xs text-primary/80 mb-1">{service.unit}</p>
              <p className="text-xs text-muted-foreground">{service.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* YouTube Growth Services */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <h2 className="text-lg font-semibold text-foreground">YouTube Growth Services</h2>
        <p className="text-sm text-muted-foreground">Learn, manage, and scale your YouTube channel</p>
        <div className="space-y-3">
          {ytServices.map((service) => (
            <Card key={service.title} variant={service.isBestValue ? "glow" : "gradient"} className="p-4 relative overflow-hidden">
              {service.isBestValue && (
                <Badge className="absolute top-2 right-2 gradient-primary border-0 text-foreground text-xs">
                  Best Value
                </Badge>
              )}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg gradient-primary shrink-0">
                  <service.icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{service.title}</h3>
                  <p className="text-lg font-bold gradient-text">{service.price} <span className="text-xs text-muted-foreground font-normal">{service.unit}</span></p>
                  <p className="text-xs text-muted-foreground mb-2">{service.description}</p>
                  <ul className="space-y-1">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary shrink-0"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3" onClick={handleContact}>
                <ExternalLink className="h-3 w-3" />
                Get Started
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* One-Time Services */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.5s" }}>
        <h2 className="text-lg font-semibold text-foreground">One-Time Services</h2>
        <p className="text-sm text-muted-foreground">Made for creators & brands • One-time setup • No monthly charges</p>
        <div className="space-y-3">
          {oneTimeServices.map((service) => (
            <Card key={service.title} variant={service.isBestValue ? "glow" : "gradient"} className="p-4 relative overflow-hidden">
              {service.isBestValue && (
                <Badge className="absolute top-2 right-2 gradient-primary border-0 text-foreground text-xs">
                  Best Value
                </Badge>
              )}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg gradient-primary shrink-0">
                  <service.icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{service.title}</h3>
                  <p className="text-lg font-bold gradient-text">{service.price} <span className="text-xs text-muted-foreground font-normal">{service.unit}</span></p>
                  <p className="text-xs text-muted-foreground mb-2">{service.description}</p>
                  <ul className="space-y-1">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-primary shrink-0"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3" onClick={handleContact}>
                <ExternalLink className="h-3 w-3" />
                Get Started
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <Card variant="glow" className="p-5 text-center animate-slide-up" style={{ animationDelay: "0.6s" }}>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Ready to Grow?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Fill out our form and we'll get back to you
        </p>
        <Button variant="gradient" size="lg" onClick={handleContact} className="w-full">
          <ExternalLink className="h-5 w-5" />
          Fill Contact Form
        </Button>
      </Card>

      {/* Contact Info */}
      <Card variant="gradient" className="p-5 animate-slide-up" style={{ animationDelay: "0.7s" }}>
        <h3 className="text-lg font-semibold text-foreground mb-4">Contact Us Directly</h3>
        <div className="space-y-3">
          <a
            href="mailto:rrcreatorlab@gmail.com"
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="p-2 rounded-lg bg-muted">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm">rrcreatorlab@gmail.com</span>
          </a>
          <a
            href="tel:+919483886270"
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="p-2 rounded-lg bg-muted">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm">+91 9483886270</span>
          </a>
          <a
            href="https://instagram.com/rrcreatorlab"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <div className="p-2 rounded-lg bg-muted">
              <Instagram className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm">@rrcreatorlab</span>
          </a>
        </div>
      </Card>
    </div>
  );
};
