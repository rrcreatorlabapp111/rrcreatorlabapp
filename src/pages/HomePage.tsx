import { useNavigate } from "react-router-dom";
import { FileText, Lightbulb, ExternalLink, Sparkles, BarChart3, ChevronRight, User, LogIn, ArrowRight, Hash, Search, Flame, Settings, TrendingUp, Users, Zap, Star, Quote, Calendar, Youtube, Bot, Target, Rocket, Award } from "lucide-react";
import { QuickActionButton } from "@/components/home/QuickActionButton";
import { TutorialSection } from "@/components/home/TutorialSection";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import growthAnalytics from "@/assets/growth-analytics.png";
import creatorSuccess from "@/assets/creator-success.png";
import socialEngagement from "@/assets/social-engagement.png";
import rrLogo from "@/assets/rr-creator-lab-logo.png";
const GOOGLE_FORM_LINK = "https://docs.google.com/forms/d/e/1FAIpQLSc7w7_crTXDPXa1Rz_2OOkAX7k_5jq88dEdLr8KiiaICcGh5g/viewform";

const quickActions = [
  { icon: FileText, label: "Script Generator", path: "/tools/script" },
  { icon: Calendar, label: "Content Calendar", path: "/content-calendar" },
  { icon: ExternalLink, label: "Contact Us", path: GOOGLE_FORM_LINK, external: true },
];

const recommendedTools = [
  { icon: Hash, title: "Tag Generator", description: "Optimize your reach", path: "/tools/tags" },
  { icon: Bot, title: "YT Assistant", description: "AI-powered insights", path: "/youtube-assistant" },
  { icon: Flame, title: "Trending Topics", description: "Catch viral waves", path: "/tools/trending" },
  { icon: Search, title: "SEO Score", description: "Improve discoverability", path: "/tools/seo" },
];

const featuredServices = [
  { icon: Target, title: "Channel Audit", description: "Get expert analysis", badge: "Popular" },
  { icon: Rocket, title: "Growth Package", description: "Accelerate your growth", badge: "Best Value" },
  { icon: Award, title: "Complete Toolkit", description: "Everything you need", badge: "New" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    role: "YouTube Creator",
    subscribers: "50K+",
    quote: "RR Creator Labs helped me grow from 5K to 50K subscribers in just 6 months. The script generator saves me hours every week!",
    rating: 5,
  },
  {
    name: "Rahul Verma",
    role: "Instagram Influencer",
    subscribers: "120K+",
    quote: "The trending topics tool is incredible. I always know what content will perform best. My engagement tripled!",
    rating: 5,
  },
  {
    name: "Sneha Patel",
    role: "Shorts Creator",
    subscribers: "200K+",
    quote: "Best investment for any creator. The tag generator and SEO tools are game changers for discoverability.",
    rating: 5,
  },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-4 animate-fade-in">
        <img src={rrLogo} alt="RR Creator Lab Logo" className="w-32 h-32 mx-auto rounded-full object-cover" />
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Creator Growth Platform</span>
        </div>
        <h1 className="text-4xl font-bold font-display gradient-text leading-tight">RR Creator Labs</h1>
        <p className="text-muted-foreground text-lg max-w-sm mx-auto">
          Grow Your Content. Build Your Brand.
        </p>
        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            variant="gradient"
            size="xl"
            className="w-full sm:w-auto animate-pulse-glow"
            onClick={() => navigate("/tools")}
          >
            Start Creating
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-primary/30 hover:border-primary/60"
            onClick={() => navigate("/content-calendar")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Content Calendar
          </Button>
        </div>
      </div>

      {/* Auth Card - Show for logged out users */}
      {!loading && !user && (
        <Card
          variant="gradient"
          className="p-4 cursor-pointer hover:border-primary/50 transition-all duration-300 animate-slide-up"
          onClick={() => navigate("/auth")}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-muted">
              <LogIn className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">Sign In</h2>
              <p className="text-sm text-muted-foreground">
                Save your content & track growth
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
      )}

      {/* Profile Card - Show for logged in users */}
      {!loading && user && (
        <Card
          variant="gradient"
          className="p-4 cursor-pointer hover:border-primary/50 transition-all duration-300 animate-slide-up"
          onClick={() => navigate("/profile")}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl gradient-primary">
              <Settings className="h-5 w-5 text-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">My Profile</h2>
              <p className="text-sm text-muted-foreground">
                Manage your account settings
              </p>
            </div>
            <div className="p-2 rounded-full bg-green-500/20">
              <User className="h-4 w-4 text-green-400" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
      )}

      {/* Dashboard Card */}
      <Card
        variant="glow"
        className="p-4 cursor-pointer hover:shadow-glow transition-all duration-300 animate-slide-up"
        onClick={() => navigate("/dashboard")}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl gradient-primary">
            <BarChart3 className="h-6 w-6 text-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground">Creator Dashboard</h2>
            <p className="text-sm text-muted-foreground">
              {user ? "View analytics & saved content" : "Analytics, saved content & growth tracking"}
            </p>
          </div>
          {user && (
            <div className="p-2 rounded-full bg-green-500/20">
              <User className="h-4 w-4 text-green-400" />
            </div>
          )}
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </Card>

      {/* Quick Actions - Reduced to 3 */}
      <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        {quickActions.map((action) => (
          <QuickActionButton
            key={action.label}
            icon={action.icon}
            label={action.label}
            onClick={() => {
              if (action.external) {
                window.open(action.path, "_blank");
              } else {
                navigate(action.path);
              }
            }}
          />
        ))}
      </div>

      {/* Recommended Tools Section */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.15s" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Recommended Tools</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/tools")} className="text-primary">
            View all
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {recommendedTools.map((tool) => (
            <Card
              key={tool.title}
              variant="gradient"
              className="p-3 cursor-pointer hover:border-primary/50 transition-all duration-300"
              onClick={() => navigate(tool.path)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg gradient-primary">
                  <tool.icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm">{tool.title}</h3>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Visual Showcase - Growth Gallery */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">See What's Possible</h2>
        </div>
        
        {/* Main Showcase Image */}
        <Card variant="gradient" className="overflow-hidden">
          <img 
            src={creatorSuccess} 
            alt="Content creator celebrating success with social media growth" 
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="font-semibold text-foreground">Grow Your Audience</h3>
            <p className="text-sm text-muted-foreground">Join creators who've scaled their channels with our tools</p>
          </div>
        </Card>

        {/* Two-column showcase */}
        <div className="grid grid-cols-2 gap-3">
          <Card variant="gradient" className="overflow-hidden">
            <img 
              src={growthAnalytics} 
              alt="Analytics dashboard showing channel growth metrics" 
              className="w-full h-24 object-cover"
            />
            <div className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Track Growth</span>
              </div>
              <p className="text-xs text-muted-foreground">Real-time analytics</p>
            </div>
          </Card>
          
          <Card variant="gradient" className="overflow-hidden">
            <img 
              src={socialEngagement} 
              alt="Social media engagement and followers growth" 
              className="w-full h-24 object-cover"
            />
            <div className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">Boost Engagement</span>
              </div>
              <p className="text-xs text-muted-foreground">Grow followers fast</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Featured Services */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.23s" }}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground font-display">Premium Services</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/services")} className="text-primary">
            View all
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {featuredServices.map((service) => (
            <Card 
              key={service.title} 
              variant="gradient" 
              className="p-3 cursor-pointer hover:border-primary/50 transition-all duration-300 border-gradient"
              onClick={() => navigate("/services")}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg gradient-primary">
                  <service.icon className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">{service.title}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">{service.badge}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tutorials Section */}
      <TutorialSection />

      {/* Why Choose Us Section */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.25s" }}>
        <h2 className="text-lg font-semibold text-foreground font-display">Why Creators Love Us</h2>
        <div className="grid grid-cols-1 gap-2">
          {[
            { icon: Zap, title: "AI-Powered Tools", desc: "Generate scripts, tags & ideas instantly" },
            { icon: Calendar, title: "Content Calendar", desc: "Plan & schedule your content weeks ahead" },
            { icon: TrendingUp, title: "Data-Driven Growth", desc: "Track what works and scale faster" },
            { icon: Users, title: "Expert Support", desc: "Get help from real content creators" },
          ].map((item) => (
            <Card key={item.title} variant="gradient" className="p-3 border-gradient">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="space-y-3 animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center gap-2">
          <Quote className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Creator Success Stories</h2>
        </div>
        <div className="space-y-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} variant="gradient" className="p-4">
              <div className="space-y-3">
                {/* Rating Stars */}
                <div className="flex gap-0.5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                
                {/* Author Info */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-primary/20">
                    <span className="text-xs font-medium text-primary">{testimonial.subscribers}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Preview */}
      <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: "0.35s" }}>
        {[
          { value: "14+", label: "AI Tools" },
          { value: "500+", label: "Creators" },
          { value: "24/7", label: "Support" },
        ].map((stat) => (
          <Card key={stat.label} variant="gradient" className="p-4 text-center border-gradient">
            <p className="text-2xl font-bold font-display gradient-text">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Content Calendar Promo */}
      <Card 
        variant="glow" 
        className="p-4 cursor-pointer hover:shadow-glow transition-all duration-300 animate-slide-up border-gradient" 
        style={{ animationDelay: "0.4s" }}
        onClick={() => navigate("/content-calendar")}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl gradient-primary animate-pulse">
            <Calendar className="h-6 w-6 text-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-foreground font-display">Content Calendar</h2>
            <p className="text-sm text-muted-foreground">
              Schedule & organize your content ideas
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </Card>
    </div>
  );
};
