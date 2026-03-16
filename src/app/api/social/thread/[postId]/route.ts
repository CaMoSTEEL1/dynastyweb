import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { SocialPost } from "@/lib/social/types";

interface ThreadRequestBody {
  post: SocialPost;
  sessionContext: {
    school: string;
    coachName: string;
    week: number;
  };
}

interface ThreadResponse {
  replies: SocialPost[];
}

const TIMESTAMPS = ["12m ago", "18m ago", "24m ago", "31m ago", "38m ago", "45m ago"];

function generateId(): string {
  return `reply_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
): Promise<NextResponse<ThreadResponse | { error: string }>> {
  const { postId } = await params;

  try {
    const body = (await request.json()) as ThreadRequestBody;
    const { post, sessionContext } = body;

    if (!post || !sessionContext || !postId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const anthropic = new Anthropic();

    const systemPrompt = [
      "You are a college football social media simulator.",
      "You generate realistic reply posts to social media threads about college football.",
      "You must respond with valid JSON only, no markdown formatting or code fences.",
    ].join("\n");

    const userPrompt = [
      `Generate 4-6 reply posts to this social media post about ${sessionContext.school} football (Week ${sessionContext.week}, Coach ${sessionContext.coachName}).`,
      "",
      `Original post by ${post.displayName} (${post.handle}, type: ${post.type}):`,
      `"${post.body}"`,
      "",
      "Generate replies as JSON with this exact schema:",
      '{"replies": [{"handle": "string", "displayName": "string", "type": "fan"|"rival"|"analyst"|"insider"|"reddit", "body": "string", "likes": number, "reposts": number, "verified": boolean}]}',
      "",
      "Rules:",
      "- Mix of reply types: fans agreeing/disagreeing, analysts adding context, rival fans trolling, etc.",
      "- Fan replies: casual, emotional, 10-100 likes, 0-10 reposts",
      "- Analyst replies: measured, add stats or context, 50-500 likes, 5-50 reposts",
      "- Rival replies: snarky or dismissive, 5-80 likes, 0-5 reposts",
      "- Reddit replies: humorous, self-deprecating, or meme-like, 20-300 likes, 2-20 reposts",
      "- Insider replies: hints at knowledge, 100-1000 likes, 10-100 reposts",
      "- Make handles realistic (e.g., @CFBTake, @BuckeyeNation22, @SECInsider)",
      "- verified should be true only for analyst and insider types",
      "- Keep each reply under 200 characters",
    ].join("\n");

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No text response from AI" }, { status: 500 });
    }

    const raw = textBlock.text.trim();
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as {
      replies: Array<{
        handle: string;
        displayName: string;
        type: "fan" | "rival" | "analyst" | "insider" | "reddit";
        body: string;
        likes: number;
        reposts: number;
        verified: boolean;
      }>;
    };

    const validTypes = new Set(["fan", "rival", "analyst", "insider", "reddit"]);

    const replies: SocialPost[] = parsed.replies
      .filter(
        (r) =>
          typeof r.handle === "string" &&
          typeof r.displayName === "string" &&
          validTypes.has(r.type) &&
          typeof r.body === "string" &&
          typeof r.likes === "number" &&
          typeof r.reposts === "number"
      )
      .map((r, i) => ({
        id: generateId(),
        handle: r.handle,
        displayName: r.displayName,
        type: r.type,
        body: r.body,
        likes: r.likes,
        reposts: r.reposts,
        timestamp: TIMESTAMPS[i] ?? `${50 + i * 7}m ago`,
        verified: r.verified ?? (r.type === "analyst" || r.type === "insider"),
        avatarInitial: r.displayName.charAt(0).toUpperCase(),
      }));

    return NextResponse.json({ replies });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Social thread error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
