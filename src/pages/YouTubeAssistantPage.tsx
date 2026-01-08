import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Youtube, Search, Users, Eye, Video, Calendar, ThumbsUp, MessageCircle, Sparkles, FileText, Film, CalendarDays, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export const YouTubeAssistantPage = () => {
  const [channelInput, setChannelInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [suggestion, setSuggestion] = useState("");
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const fetchChannelData = async () => {
    if (!channelInput.trim()) {
      toast.error("Please enter a channel URL or ID");
      return;
    }

    setIsLoading(true);
    setChannelData(null);
    setVideos([]);
    setSuggestion("");

    try {
      const { data, error } = await supabase.functions.invoke("youtube-channel", {
        body: { channelInput: channelInput.trim() },
      });

      if (error) throw error;
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setChannelData(data.channel);
      setVideos(data.videos || []);
      toast.success("Channel data loaded successfully!");
    } catch (error) {
      console.error("Error fetching channel:", error);
      toast.error("Failed to fetch channel data. Please check the URL/ID and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestion = async (type: string) => {
    if (!channelData) return;

    setSuggestionLoading(true);
    setActiveSuggestion(type);
    setSuggestion("");

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
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again later.");
          return;
        }
        if (response.status === 402) {
          toast.error("Credits exhausted. Please add more credits.");
          return;
        }
        throw new Error("Failed to get suggestions");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                setSuggestion((prev) => prev + content);
              }
            } catch {
              // Ignore parse errors for partial chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Error getting suggestion:", error);
      toast.error("Failed to generate suggestion. Please try again.");
    } finally {
      setSuggestionLoading(false);
    }
  };

  const suggestionTypes = [
    { id: "script", label: "Script Ideas", icon: FileText },
    { id: "shorts", label: "Shorts Ideas", icon: Film },
    { id: "schedule", label: "Content Schedule", icon: CalendarDays },
    { id: "growth", label: "Growth Tips", icon: TrendingUp },
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

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter YouTube channel URL or ID..."
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchChannelData()}
              />
              <Button onClick={fetchChannelData} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Loading..." : "Analyze"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Supports: @handle, channel URL, or channel ID
            </p>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Channel Data */}
        {channelData && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={channelData.thumbnailUrl}
                    alt={channelData.title}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-lg truncate">{channelData.title}</h2>
                    <p className="text-sm text-muted-foreground">{channelData.customUrl}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {channelData.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Users className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="font-bold">{formatNumber(channelData.subscriberCount)}</p>
                    <p className="text-xs text-muted-foreground">Subscribers</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Eye className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="font-bold">{formatNumber(channelData.viewCount)}</p>
                    <p className="text-xs text-muted-foreground">Total Views</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <Video className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="font-bold">{formatNumber(channelData.videoCount)}</p>
                    <p className="text-xs text-muted-foreground">Videos</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Channel created: {formatDate(channelData.publishedAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {suggestionTypes.map((type) => (
                    <Button
                      key={type.id}
                      variant={activeSuggestion === type.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => getSuggestion(type.id)}
                      disabled={suggestionLoading}
                    >
                      <type.icon className="h-4 w-4 mr-1" />
                      {type.label}
                    </Button>
                  ))}
                </div>

                {suggestionLoading && !suggestion && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                )}

                {suggestion && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{suggestion}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Videos */}
            {videos.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="list">
                    <TabsList className="w-full">
                      <TabsTrigger value="list" className="flex-1">List</TabsTrigger>
                      <TabsTrigger value="stats" className="flex-1">Stats</TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="mt-4 space-y-3">
                      {videos.map((video) => (
                        <div key={video.videoId} className="flex gap-3 p-2 bg-muted rounded-lg">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-24 h-14 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2">{video.title}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {formatNumber(video.viewCount)}
                              </span>
                              <span className="flex items-center gap-1">
                                <ThumbsUp className="h-3 w-3" />
                                {formatNumber(video.likeCount)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="stats" className="mt-4 space-y-2">
                      {videos.map((video) => (
                        <div key={video.videoId} className="flex items-center justify-between p-2 bg-muted rounded">
                          <p className="text-sm truncate flex-1 mr-4">{video.title}</p>
                          <div className="flex gap-2">
                            <Badge variant="secondary">
                              <Eye className="h-3 w-3 mr-1" />
                              {formatNumber(video.viewCount)}
                            </Badge>
                            <Badge variant="secondary">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {formatNumber(video.likeCount)}
                            </Badge>
                            <Badge variant="secondary">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {formatNumber(video.commentCount)}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};
