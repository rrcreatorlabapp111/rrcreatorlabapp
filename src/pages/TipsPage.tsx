import { useState } from "react";
import { TipCard } from "@/components/tips/TipCard";
import { cn } from "@/lib/utils";

const categories = [
  "All",
  "YouTube Growth",
  "Instagram Growth",
  "Content Strategy",
  "Mistakes to Avoid",
];

const tips = [
  {
    category: "YouTube Growth",
    title: "Post at the Right Time",
    content: "Upload when your audience is most active. Check your analytics to find the best posting times for your channel.",
  },
  {
    category: "Instagram Growth",
    title: "Use Story Stickers",
    content: "Polls, questions, and quizzes in stories boost engagement and help you connect with your audience.",
  },
  {
    category: "Content Strategy",
    title: "Hook in First 3 Seconds",
    content: "Your first 3 seconds determine if viewers stay or leave. Start with a bold statement or question.",
  },
  {
    category: "Mistakes to Avoid",
    title: "Don't Chase Trends Blindly",
    content: "Trends can boost views, but stay true to your niche. Irrelevant content confuses your audience.",
  },
  {
    category: "YouTube Growth",
    title: "Optimize Thumbnails",
    content: "Bright colors, bold text, and expressive faces increase click-through rates significantly.",
  },
  {
    category: "Instagram Growth",
    title: "Carousel Posts Perform Best",
    content: "Carousel posts get 3x more engagement. Use them to share tips, tutorials, or before/after content.",
  },
  {
    category: "Content Strategy",
    title: "Batch Create Content",
    content: "Film multiple videos in one session. This saves time and keeps your content consistent.",
  },
  {
    category: "Mistakes to Avoid",
    title: "Ignoring Analytics",
    content: "Data tells you what works. Check your analytics weekly to understand your audience better.",
  },
  {
    category: "YouTube Growth",
    title: "End Screens Matter",
    content: "Add end screens to every video. They can increase watch time by directing viewers to more content.",
  },
  {
    category: "Instagram Growth",
    title: "Reels Get More Reach",
    content: "Instagram prioritizes Reels in the algorithm. Post at least 3-5 Reels per week for maximum growth.",
  },
];

export const TipsPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredTips =
    activeCategory === "All"
      ? tips
      : tips.filter((tip) => tip.category === activeCategory);

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="space-y-1 animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground">Tips to Grow</h1>
        <p className="text-muted-foreground">Proven strategies for creators</p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300",
              activeCategory === category
                ? "gradient-primary text-foreground shadow-button"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Tips List */}
      <div className="space-y-3">
        {filteredTips.map((tip, index) => (
          <div
            key={index}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <TipCard
              category={tip.category}
              title={tip.title}
              content={tip.content}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
