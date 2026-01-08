import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Youtube } from "lucide-react";

export const YouTubeAssistantPage = () => {
  useEffect(() => {
    // Load JotForm embed script
    const script = document.createElement("script");
    script.src = "https://cdn.jotfor.ms/agent/embedjs/019b8a9ef4a2706a97010c77b5fad0244ed8/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/tools">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Youtube className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">YouTube Assistant</h1>
              <p className="text-xs text-muted-foreground">AI-powered channel insights</p>
            </div>
          </div>
        </div>

        {/* JotForm embed will be injected here by the script */}
        <div id="jotform-embed" className="min-h-[600px]" />
      </div>
    </div>
  );
};
