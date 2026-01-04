import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

function extractChannelId(input: string): { type: "id" | "username" | "handle"; value: string } | null {
  const trimmed = input.trim();
  
  // Direct channel ID (starts with UC)
  if (/^UC[\w-]{22}$/.test(trimmed)) {
    return { type: "id", value: trimmed };
  }
  
  // Full URL patterns
  const channelIdMatch = trimmed.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
  if (channelIdMatch) {
    return { type: "id", value: channelIdMatch[1] };
  }
  
  // Handle (@username)
  const handleMatch = trimmed.match(/youtube\.com\/@([\w.-]+)/) || trimmed.match(/^@([\w.-]+)$/);
  if (handleMatch) {
    return { type: "handle", value: handleMatch[1] };
  }
  
  // Custom URL (youtube.com/c/name or youtube.com/name)
  const customMatch = trimmed.match(/youtube\.com\/(?:c\/)?([\w.-]+)$/);
  if (customMatch && !["watch", "channel", "playlist", "results", "feed"].includes(customMatch[1])) {
    return { type: "username", value: customMatch[1] };
  }
  
  // Just a username
  if (/^[\w.-]+$/.test(trimmed) && trimmed.length > 2) {
    return { type: "username", value: trimmed };
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelInput } = await req.json();
    const YOUTUBE_API_KEY = Deno.env.get("YOUTUBE_API_KEY");

    if (!YOUTUBE_API_KEY) {
      throw new Error("YouTube API key not configured");
    }

    const parsed = extractChannelId(channelInput);
    if (!parsed) {
      return new Response(
        JSON.stringify({ error: "Invalid channel URL or ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let channelId: string | null = null;

    // Resolve channel ID based on input type
    if (parsed.type === "id") {
      channelId = parsed.value;
    } else if (parsed.type === "handle") {
      // Search by handle
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=@${parsed.value}&key=${YOUTUBE_API_KEY}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      
      if (searchData.items && searchData.items.length > 0) {
        channelId = searchData.items[0].snippet.channelId;
      }
    } else {
      // Search by username/custom URL
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${parsed.value}&key=${YOUTUBE_API_KEY}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      
      if (searchData.items && searchData.items.length > 0) {
        channelId = searchData.items[0].snippet.channelId;
      }
    }

    if (!channelId) {
      return new Response(
        JSON.stringify({ error: "Channel not found, please check the URL or ID." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch channel details
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`;
    const channelRes = await fetch(channelUrl);
    const channelData = await channelRes.json();

    if (!channelData.items || channelData.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Channel not found, please check the URL or ID." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const channel = channelData.items[0];
    const channelInfo: ChannelData = {
      channelId: channel.id,
      title: channel.snippet.title,
      description: channel.snippet.description,
      customUrl: channel.snippet.customUrl || "",
      thumbnailUrl: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url || "",
      subscriberCount: parseInt(channel.statistics.subscriberCount || "0"),
      videoCount: parseInt(channel.statistics.videoCount || "0"),
      viewCount: parseInt(channel.statistics.viewCount || "0"),
      publishedAt: channel.snippet.publishedAt,
    };

    // Fetch recent videos
    const videosUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`;
    const videosRes = await fetch(videosUrl);
    const videosData = await videosRes.json();

    const videoIds = videosData.items?.map((v: any) => v.id.videoId).filter(Boolean).join(",") || "";
    
    let videos: VideoData[] = [];
    if (videoIds) {
      const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
      const statsRes = await fetch(statsUrl);
      const statsData = await statsRes.json();

      videos = statsData.items?.map((v: any) => ({
        videoId: v.id,
        title: v.snippet.title,
        description: v.snippet.description?.substring(0, 200) || "",
        thumbnailUrl: v.snippet.thumbnails?.medium?.url || "",
        publishedAt: v.snippet.publishedAt,
        viewCount: parseInt(v.statistics.viewCount || "0"),
        likeCount: parseInt(v.statistics.likeCount || "0"),
        commentCount: parseInt(v.statistics.commentCount || "0"),
        duration: v.contentDetails.duration,
      })) || [];
    }

    return new Response(
      JSON.stringify({ channel: channelInfo, videos }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("YouTube channel fetch error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to fetch channel data" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
