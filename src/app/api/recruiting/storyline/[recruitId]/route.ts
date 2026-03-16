import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

interface StorylineRequestBody {
  school: string;
  coachName: string;
  week: number;
  seasonState: {
    record: { wins: number; losses: number };
    ranking: number | null;
    fanSentiment: string;
  };
  recruit: {
    name: string;
    position: string;
    stars: number;
    status: string;
    backstory: string;
  };
}

interface StorylineResponse {
  storyline: string;
  suggestedTrend: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ recruitId: string }> }
): Promise<NextResponse<StorylineResponse | { error: string }>> {
  try {
    const { recruitId } = await params;

    if (!recruitId) {
      return NextResponse.json(
        { error: "Missing recruitId" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as StorylineRequestBody;
    const { school, coachName, week, seasonState, recruit } = body;

    if (!school || !coachName || !week || !recruit) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const anthropic = new Anthropic();

    const systemPrompt = `You are a college football recruiting insider generating narrative updates about recruits. Write vivid, punchy insider-style updates. You must respond with valid JSON only, no markdown formatting.`;

    const userPrompt = [
      `Generate a recruiting narrative update for ${recruit.name}, a ${recruit.stars}-star ${recruit.position}.`,
      `Current status: ${recruit.status}`,
      `School: ${school} (Coach ${coachName})`,
      `Week: ${week}`,
      `Season record: ${seasonState.record.wins}-${seasonState.record.losses}`,
      seasonState.ranking
        ? `Current ranking: #${seasonState.ranking}`
        : "Currently unranked",
      `Fan sentiment: ${seasonState.fanSentiment}`,
      `Backstory: ${recruit.backstory}`,
      "",
      "Based on the season context, generate a brief narrative update (2-3 sentences) about where this recruit stands.",
      "Also suggest a trend based on the season performance and recruit's current status.",
      "",
      "Respond with this exact JSON structure:",
      '{"storyline": "narrative text here", "suggestedTrend": "hot"|"warm"|"stable"|"cooling"|"cold"}',
    ].join("\n");

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 500 }
      );
    }

    const rawText = textBlock.text.trim();
    const jsonStart = rawText.indexOf("{");
    const jsonEnd = rawText.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      return NextResponse.json({
        storyline: rawText,
        suggestedTrend: "stable",
      });
    }

    const parsed = JSON.parse(
      rawText.slice(jsonStart, jsonEnd + 1)
    ) as StorylineResponse;

    const validTrends = new Set(["hot", "warm", "stable", "cooling", "cold"]);
    const suggestedTrend = validTrends.has(parsed.suggestedTrend)
      ? parsed.suggestedTrend
      : "stable";

    return NextResponse.json({
      storyline: parsed.storyline || rawText,
      suggestedTrend,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Recruiting storyline error:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
