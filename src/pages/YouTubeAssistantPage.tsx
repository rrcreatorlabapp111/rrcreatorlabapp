import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Youtube,
  Users,
  Eye,
  Video,
  Search,
  Sparkles,
  FileText,
  CalendarDays,
  TrendingUp,
  Loader2,
  Play,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";

interface ChannelData {
  channelId: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  publishedAt: string;
}

interface VideoData {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
}

type SuggestionType = "scripts" | "shorts" | "schedule" | "growth";

export const YouTubeAssistantPage = () => {
  const { toast } = useToast();
  const [channelInput, setChannelInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [suggestions, setSuggestions] = useState<Record<SuggestionType, string>>({
    scripts: "",
    shorts: "",
    schedule: "",
    growth: "",
  });
  const [loadingSuggestion, setLoadingSuggestion] = useState<SuggestionType | null>(null);

  const fetchChannel = async () => {
    if (!channelInput.trim()) {
      toast({
        title: "Enter a channel",
        description: "Please enter a YouTube channel URL or ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setChannelData(null);
    setVideos([]);
    setSuggestions({ scripts: "", shorts: "", schedule: "", growth: "" });

    try {
      const { data, error } = await supabase.functions.invoke("youtube-channel", {
        body: { channelInput: channelInput.trim() },
      });

      if (error) throw error;
      if (data.error) {
        toast({
          title: "Channel not found",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setChannelData(data.channel);
      setVideos(data.videos || []);
      
      toast({
        title: "Channel found!",
        description: `Loaded ${data.channel.title}`,
      });
    } catch (error) {
      console.error("Error fetching channel:", error);
      toast({
        title: "Error",
        description: "Failed to fetch channel data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = async (type: SuggestionType) => {
    if (!channelData) return;

    setLoadingSuggestion(type);
    setSuggestions((prev) => ({ ...prev, [type]: "" }));

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-suggestions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            channelData,
            videos,
            suggestionType: type,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate suggestions");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
              setSuggestions((prev) => ({ ...prev, [type]: content }));
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate suggestions",
        variant: "destructive",
      });
    } finally {
      setLoadingSuggestion(null);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const suggestionTabs: { type: SuggestionType; label: string; icon: React.ReactNode }[] = [
    { type: "scripts", label: "Script Ideas", icon: <FileText className="h-4 w-4" /> },
    { type: "shorts", label: "Shorts Ideas", icon: <Play className="h-4 w-4" /> },
    { type: "schedule", label: "Content Plan", icon: <CalendarDays className="h-4 w-4" /> },
    { type: "growth", label: "Growth Tips", icon: <TrendingUp className="h-4 w-4" /> },
  ];

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

        {/* Search Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter YouTube channel URL, @handle, or ID..."
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchChannel()}
                className="flex-1"
              />
              <Button onClick={fetchChannel} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Examples: @MrBeast, youtube.com/channel/UC..., or just paste the channel URL
            </p>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Channel Data */}
        {channelData && (
          <>
            {/* Channel Header */}
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={channelData.thumbnailUrl}
                    alt={channelData.title}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-border"
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-foreground truncate">
                      {channelData.title}
                    </h2>
                    {channelData.customUrl && (
                      <p className="text-sm text-muted-foreground">@{channelData.customUrl.replace("@", "")}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {channelData.description || "No description"}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Users className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold text-foreground">
                      {formatNumber(channelData.subscriberCount)}
                    </p>
                    <p className="text-xs text-muted-foreground">Subscribers</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Eye className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold text-foreground">
                      {formatNumber(channelData.viewCount)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Views</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <Video className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-lg font-bold text-foreground">
                      {formatNumber(channelData.videoCount)}
                    </p>
                    <p className="text-xs text-muted-foreground">Videos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Videos */}
            {videos.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Play className="h-5 w-5 text-primary" />
                    Recent Videos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {videos.slice(0, 5).map((video) => (
                    <a
                      key={video.videoId}
                      href={`https://youtube.com/watch?v=${video.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-24 h-14 object-cover rounded-md flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {video.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {formatNumber(video.viewCount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {formatNumber(video.likeCount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {formatNumber(video.commentCount)}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* AI Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI-Powered Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="scripts" className="w-full">
                  <TabsList className="grid grid-cols-4 w-full">
                    {suggestionTabs.map((tab) => (
                      <TabsTrigger key={tab.type} value={tab.type} className="text-xs gap-1">
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {suggestionTabs.map((tab) => (
                    <TabsContent key={tab.type} value={tab.type} className="mt-4">
                      {!suggestions[tab.type] && loadingSuggestion !== tab.type && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">
                            Get AI-generated {tab.label.toLowerCase()} based on your channel's performance
                          </p>
                          <Button
                            onClick={() => generateSuggestions(tab.type)}
                            disabled={loadingSuggestion !== null}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate {tab.label}
                          </Button>
                        </div>
                      )}

                      {loadingSuggestion === tab.type && !suggestions[tab.type] && (
                        <div className="flex items-center justify-center py-8 gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <span className="text-muted-foreground">Generating suggestions...</span>
                        </div>
                      )}

                      {suggestions[tab.type] && (
                        <div className="prose prose-sm max-w-none text-foreground">
                          <div className="whitespace-pre-wrap">{suggestions[tab.type]}</div>
                          {loadingSuggestion === tab.type && (
                            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                          )}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!channelData && !isLoading && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Youtube className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Enter a YouTube Channel
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Paste a channel URL, @handle, or channel ID to get personalized insights, 
                content ideas, and growth tips powered by AI.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <Badge variant="secondary">Channel Analytics</Badge>
                <Badge variant="secondary">Script Ideas</Badge>
                <Badge variant="secondary">Shorts Ideas</Badge>
                <Badge variant="secondary">Growth Tips</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
