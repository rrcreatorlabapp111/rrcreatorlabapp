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
    const requestBody = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Support both old format { type, data } and new format with direct properties
    const type = requestBody.type;
    const data = requestBody.data || requestBody;

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

      // Instagram-specific tools
      case "instagram-bio":
        systemPrompt = `You are an Instagram growth expert specializing in profile optimization.
Create bios that:
- Have a clear value proposition
- Are max 150 characters each
- Include a compelling CTA
- Use emojis strategically if requested
- Are instantly understandable`;
        
        userPrompt = `Generate 5 Instagram bio options for a ${data.niche} creator.
${data.keywords ? `Include keywords: ${data.keywords}` : ""}
Style: ${data.style || "professional"}
Use emojis: ${data.emoji !== false ? "yes" : "no"}

Each bio should:
- Be max 150 characters
- Have a clear value proposition
- Include a CTA like "Follow for more" or "DM for collabs"
- Be unique and memorable`;
        break;

      case "instagram-reel-ideas":
        systemPrompt = `You are a viral Instagram Reels expert who understands what makes content go viral.
Generate ideas that:
- Have scroll-stopping hooks in first 3 seconds
- Follow trending formats and sounds
- Are highly shareable and saveable
- Drive engagement and follows
- Work with the Instagram algorithm`;
        
        userPrompt = `Generate 30 viral Instagram Reel ideas for the niche: "${data.niche}"
Target audience: ${data.audience || "general"}
Tone: ${data.tone || "engaging"}
Goal: ${data.goal || "growth and engagement"}

For each idea provide:
1. Reel idea (the concept)
2. Strong hook (first 3 seconds - what stops the scroll)
3. Suggested length (7-30 seconds)

Format each idea clearly with numbers.`;
        break;

      case "instagram-reel-script":
        systemPrompt = `You are a professional Instagram Reels scriptwriter who creates viral, engaging scripts.
Your scripts should:
- Have an irresistible hook in the first 2 seconds
- Use punchy, short sentences
- Be designed for vertical video
- Include clear direction for visuals/actions
- End with a strong CTA`;
        
        userPrompt = `Create a full Instagram Reel script for the topic: "${data.topic}"
Niche: ${data.niche || "general"}
Tone: ${data.tone || "engaging"}
Duration: ${data.duration || "15-30 seconds"}
${data.cta ? "Include CTA: yes" : ""}

Structure:
[HOOK] - First 2 seconds (what stops scrolling)
[MAIN CONTENT] - Short punchy lines with visual cues
[CTA] - Strong call-to-action (follow/save/share/comment)

Keep it conversational and add action cues like (point to text), (zoom in), (transition).`;
        break;

      case "instagram-caption":
        systemPrompt = `You are an Instagram copywriting expert who creates high-converting captions.
Your captions should:
- Have a scroll-stopping first line
- Use short paragraphs for readability
- Include strategic line breaks
- Drive engagement (saves, shares, comments)
- NOT include hashtags`;
        
        userPrompt = `Generate 5 Instagram caption options for the topic: "${data.topic}"
Niche: ${data.niche || "general"}
Tone: ${data.tone || "engaging"}
Post type: ${data.postType || "general post"}
${data.cta ? "Include CTA: yes" : "No CTA needed"}
${data.emoji ? "Use emojis: yes" : "Minimal emojis"}

Each caption should:
- Have a first line that stops scrolling
- Use short paragraphs
- Drive engagement
- DO NOT include hashtags`;
        break;

      case "instagram-hashtags":
        systemPrompt = `You are an Instagram hashtag expert who understands hashtag strategy for maximum reach.
Generate hashtags that:
- Mix small (under 100K), medium (100K-1M), and large (1M+) hashtags
- Are relevant to the content
- Avoid banned or spammy hashtags
- Help with discoverability`;
        
        userPrompt = `Generate exactly 30 Instagram hashtags for the topic: "${data.topic}"
Niche: ${data.niche || "general"}

Mix of:
- 10 small hashtags (under 100K posts)
- 10 medium hashtags (100K-1M posts)
- 10 large hashtags (1M+ posts)

Output all 30 hashtags in ONE single line separated by spaces. No explanations, just hashtags.`;
        break;

      case "instagram-content-calendar":
        systemPrompt = `You are an Instagram content strategist who creates comprehensive 30-day content calendars.
Consider:
- Optimal posting frequency
- Content variety (reels, posts, stories, carousels)
- Engagement and growth balance
- Algorithm-friendly scheduling`;
        
        userPrompt = `Create a 30-day Instagram content calendar for a ${data.niche} creator.
Target audience: ${data.audience || "general"}
Goal: ${data.goal || "growth and engagement"}
Posting frequency: ${data.frequency || "daily"}
Follower count: ${data.followers || "growing"}

For each day include:
- Day number
- Content type (reel/post/carousel/story)
- Topic idea
- Purpose (growth/engagement/trust/sales)

Format as a clear calendar with all 30 days.`;
        break;

      case "instagram-hooks":
        systemPrompt = `You are a viral content expert who specializes in scroll-stopping hooks for Instagram.
Your hooks should:
- Be max 12 words
- Create instant curiosity
- NOT be clickbait
- Work for various content types
- Stop the scroll immediately`;
        
        userPrompt = `Generate 20 scroll-stopping Instagram hooks for the niche: "${data.niche}"
Target audience: ${data.audience || "general"}
Tone: ${data.tone || "engaging"}
Post type: ${data.postType || "reels"}

Each hook should:
- Be max 12 words
- Create curiosity without clickbait
- Work as an opening line or text overlay
- Stop people from scrolling

Number each hook 1-20.`;
        break;

      case "instagram-growth-strategy":
        systemPrompt = `You are an Instagram growth strategist who has helped accounts go from 0 to 100K+ followers.
Provide strategies that:
- Are actionable and practical
- Work with current algorithm
- Are sustainable long-term
- Include specific tactics`;
        
        userPrompt = `Create a comprehensive Instagram growth strategy for a ${data.niche} creator.
Current followers: ${data.followers || "starting out"}
Target audience: ${data.audience || "general"}
Goal: ${data.goal || "grow followers and engagement"}
Available time: ${data.time || "moderate"}

Include:
1. Content Strategy (what to post, formats, frequency)
2. Posting Schedule (best times, how often)
3. Engagement Tactics (how to grow organically)
4. Common Mistakes to Avoid
5. 30-day Action Plan

Be specific and actionable.`;
        break;

      case "instagram-monetization":
        systemPrompt = `You are an Instagram monetization expert who helps creators earn money from their accounts.
Provide strategies that:
- Are realistic for different follower counts
- Include specific tactics and examples
- Cover multiple income streams
- Include example pricing`;
        
        userPrompt = `Generate Instagram monetization ideas for a ${data.niche} creator.
Follower count: ${data.followers || "growing"}
Engagement rate: ${data.engagement || "average"}
Goal: ${data.goal || "start earning"}

Separate into:
1. Beginner Methods (0-10K followers)
2. Intermediate Methods (10K-50K followers)
3. Advanced Methods (50K+ followers)

For each method include:
- What it is
- How to start
- Example pricing/earnings
- Difficulty level`;
        break;

      // YouTube tools
      case "thumbnail-ideas":
        systemPrompt = `You are a YouTube thumbnail expert who understands what makes thumbnails get clicks.
Generate ideas that:
- Are visually compelling
- Create curiosity or emotion
- Follow proven CTR patterns
- Stand out in the feed`;
        
        userPrompt = `Generate 5 high-CTR thumbnail concepts for a video about: "${data.topic}"
Niche: ${data.niche || "general"}

For each thumbnail provide:
1. Main visual concept
2. Text overlay suggestion (3-5 words max)
3. Color scheme recommendation
4. Facial expression/emotion if applicable
5. Why it would work (CTR psychology)`;
        break;

      case "video-hooks":
        systemPrompt = `You are a YouTube hook expert who creates the first 5-10 seconds that keep viewers watching.
Your hooks should:
- Grab attention immediately
- Create a reason to keep watching
- Set up the video's promise
- Work for the specific content type`;
        
        userPrompt = `Generate 10 attention-grabbing video hooks for a video about: "${data.topic}"
Style: ${data.style || "educational"}

For each hook provide:
1. The exact opening words (5-10 second script)
2. Why it works (psychology)
3. Best video type it fits`;
        break;

      case "description-gen":
        systemPrompt = `You are a YouTube SEO expert who creates optimized video descriptions.
Your descriptions should:
- Include primary keywords naturally
- Have a compelling first 2 lines
- Include timestamps if applicable
- Have proper structure for SEO`;
        
        userPrompt = `Create an SEO-optimized YouTube description for a video about: "${data.topic}"
Keywords: ${data.keywords || data.topic}

Include:
1. Hook line (appears in search)
2. Brief summary (2-3 sentences)
3. Key points covered
4. Call-to-action
5. Suggested timestamps format`;
        break;

      default:
        throw new Error(`Unknown generation type: ${type}`);
    }

    console.log(`Processing request type: ${type}`);

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
