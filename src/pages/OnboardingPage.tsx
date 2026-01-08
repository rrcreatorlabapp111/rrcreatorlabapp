import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Youtube, Instagram, ArrowRight, Sparkles } from "lucide-react";

export const OnboardingPage = () => {
  const [youtubeChannelId, setYoutubeChannelId] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          youtube_channel_id: youtubeChannelId.trim() || null,
          instagram_handle: instagramHandle.trim().replace("@", "") || null,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Welcome aboard! 🎉",
        description: "Your profile has been set up successfully.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save your details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", user.id);

      if (error) throw error;

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/20 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Let's personalize your experience</CardTitle>
          <CardDescription>
            Connect your social accounts to get personalized insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="youtube" className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                YouTube Channel ID
              </Label>
              <Input
                id="youtube"
                placeholder="e.g., UCxxxxxxxxxxxxxxxx"
                value={youtubeChannelId}
                onChange={(e) => setYoutubeChannelId(e.target.value)}
                className="border-muted-foreground/20"
              />
              <p className="text-xs text-muted-foreground">
                Find it in your YouTube channel URL or settings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                Instagram Handle
              </Label>
              <Input
                id="instagram"
                placeholder="@yourusername"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="border-muted-foreground/20"
              />
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button type="submit" disabled={saving} className="w-full gap-2">
                {saving ? "Saving..." : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                disabled={saving}
                className="text-muted-foreground"
              >
                Skip for now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
