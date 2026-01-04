import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channelData, videos, suggestionType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const channelContext = `
Channel: ${channelData.title}
Subscribers: ${channelData.subscriberCount.toLocaleString()}
Total Views: ${channelData.viewCount.toLocaleString()}
Total Videos: ${channelData.videoCount}
Channel Age: Created ${new Date(channelData.publishedAt).toLocaleDateString()}

Recent Videos Performance:
${videos.slice(0, 5).map((v: any) => `- "${v.title}" - ${v.viewCount.toLocaleString()} views, ${v.likeCount.toLocaleString()} likes`).join("\n")}
`;

    let systemPrompt = "";
    let userPrompt = "";

    switch (suggestionType) {
      case "scripts":
        systemPrompt = "You are an expert YouTube content strategist. Analyze channel data and provide personalized video script ideas that match the channel's style and audience.";
        userPrompt = `Based on this channel's performance data, suggest 5 detailed video script ideas that would resonate with their audience. For each idea, provide:
1. Video Title (optimized for CTR)
2. Hook (first 30 seconds)
3. Key talking points (3-5 bullet points)
4. Call to action

${channelContext}`;
        break;

      case "shorts":
        systemPrompt = "You are a YouTube Shorts specialist. You understand viral short-form content and trending formats.";
        userPrompt = `Based on this channel's content style, suggest 5 YouTube Shorts ideas that could go viral. For each, provide:
1. Short title
2. Hook (first 3 seconds)
3. Content flow (15-60 seconds)
4. Trending sound/format suggestion

${channelContext}`;
        break;

      case "schedule":
        systemPrompt = "You are a YouTube growth strategist specializing in content calendars and upload schedules.";
        userPrompt = `Create a 2-week content calendar for this channel. Include:
1. Recommended upload frequency based on their current pace
2. Best days/times to post (based on typical audience behavior)
3. Content mix (long-form, shorts, community posts)
4. Themed content days if applicable

${channelContext}`;
        break;

      case "growth":
        systemPrompt = "You are a YouTube growth expert who has helped channels scale from 0 to 1M+ subscribers.";
        userPrompt = `Analyze this channel and provide 5 actionable growth tips. For each tip:
1. What to improve
2. Why it matters for growth
3. Specific action steps
4. Expected impact

${channelContext}`;
        break;

      default:
        systemPrompt = "You are a helpful YouTube content assistant.";
        userPrompt = `Provide helpful suggestions for this YouTube channel: ${channelContext}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate suggestions");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("YouTube suggestions error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate suggestions" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
