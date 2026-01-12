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
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "tags":
        systemPrompt = `You are an expert SEO and social media strategist. Generate highly optimized tags/keywords for content creators.
For each request, provide:
1. Primary tags (high search volume, directly relevant)
2. LSI (Latent Semantic Indexing) tags (related terms search engines associate)
3. Long-tail keywords (specific phrases with buyer intent)
4. Trending variations (current trends in the niche)
5. Related topics to explore

Format your response as a JSON object with these keys:
- primaryTags: array of 10-15 main tags
- lsiTags: array of 8-10 semantic tags
- longTailKeywords: array of 5-8 long phrases
- trendingTags: array of 5-8 trending variations
- relatedTopics: array of 5 related content topics with brief descriptions`;
        
        userPrompt = `Generate SEO-optimized ${data.platform} tags for the topic: "${data.topic}"
Focus on:
- High search volume keywords
- Low competition opportunities
- Current trends in 2024
- Engagement-driving tags`;
        break;

      case "script":
        systemPrompt = `You are a professional video scriptwriter who creates engaging, conversational scripts for content creators.
Your scripts should:
- Have a strong hook in the first 5 seconds
- Use natural, spoken language (not formal writing)
- Include pauses, emphasis markers, and emotion cues
- Have clear sections: Hook, Problem, Solution, Call-to-Action
- Be optimized for viewer retention`;
        
        userPrompt = `Convert this text into an engaging ${data.platform || "YouTube"} video script with a ${data.tone || "professional"} tone:

"${data.text}"

Create a complete script with:
[HOOK] - Attention-grabbing opening (5-10 seconds)
[INTRO] - Brief context setting
[MAIN CONTENT] - Key points in spoken style with transitions
[OUTRO] - Summary and call-to-action

Add emotion cues like (pause), (emphasize), (energetic) where appropriate.`;
        break;

      case "shorts-ideas":
        systemPrompt = `You are a viral short-form content expert who understands TikTok, YouTube Shorts, and Instagram Reels algorithms.
Generate ideas that:
- Have scroll-stopping hooks
- Follow trending formats
- Are highly shareable
- Drive engagement and follows`;
        
        userPrompt = `Generate 6 viral short-form video ideas for the niche: "${data.niche}"
Platform: ${data.platform}

For each idea provide:
1. Title (engaging, curiosity-driven)
2. Hook (first 3 seconds - what stops the scroll)
3. Content flow (15-60 second breakdown)
4. Trending audio/format suggestion
5. Estimated engagement potential (high/medium)`;
        break;

      case "trending-topics":
        systemPrompt = `You are a trend analyst who identifies emerging content opportunities for creators.
Analyze and provide topics that:
- Are currently gaining momentum
- Have growing search interest
- Offer low competition opportunities
- Align with algorithm preferences`;
        
        userPrompt = `Discover trending topics in the "${data.niche}" niche.

For each topic provide:
- Topic name
- Category (educational, entertainment, news, tutorial)
- Heat level (Hot, Rising, Emerging)
- Search volume estimate (High, Medium, Growing)
- Opportunity score (why now is the time to create this content)
- Content angle suggestion`;
        break;

      case "title-variants":
        systemPrompt = `You are a YouTube title optimization expert who creates high-CTR titles.
Your titles should:
- Trigger curiosity or emotion
- Include power words and numbers when appropriate
- Be optimized for search AND click-through
- Vary in style for A/B testing`;
        
        userPrompt = `Generate 5 high-CTR title variants for a video about: "${data.topic}"
${data.keyword ? `Target keyword: "${data.keyword}"` : ""}

For each title provide:
1. The title (50-60 characters max)
2. Style (curiosity-gap, how-to, listicle, emotional, contrarian)
3. Predicted CTR potential (as percentage range)
4. Strengths (what makes it work)`;
        break;

      case "content-schedule":
        systemPrompt = `You are a content strategist who creates optimal posting schedules for maximum growth.
Consider:
- Platform-specific best times
- Content variety and pacing
- Audience engagement patterns
- Sustainable creator workflow`;
        
        userPrompt = `Create a 2-week content calendar for a ${data.niche} creator.
Goal: ${data.goal || "balanced growth"}
Platform focus: ${data.platform || "YouTube"}

Include:
- Recommended posting days and times
- Content type for each slot (long-form, shorts, community)
- Topic suggestions for each
- Engagement activities to do between posts`;
        break;

      default:
        throw new Error("Unknown generation type");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
      throw new Error("Failed to generate content");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI generator error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate content" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
