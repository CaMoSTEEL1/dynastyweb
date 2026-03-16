import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

interface RankingEntry {
  rank: number;
  team: string;
  record: string;
}

interface RankingsResponse {
  success: boolean;
  rankings: RankingEntry[] | null;
  userRanking: number | null;
  error?: string;
}

const RANKINGS_SYSTEM_PROMPT = `You are analyzing a College Football 26 video game screenshot showing the Top 25 rankings.

Extract every visible ranked team from the screenshot. For each team, provide:
- rank: the numerical ranking (1-25)
- team: the full team name (e.g., "Ohio State", not "OSU" or abbreviations)
- record: the win-loss record as displayed (e.g., "8-0", "7-1")

Also identify if a specific team (I'll tell you which one) appears in the rankings.

Return a single JSON object (no markdown fencing) with this exact structure:
{
  "rankings": [
    { "rank": 1, "team": "Georgia", "record": "9-0" },
    { "rank": 2, "team": "Ohio State", "record": "9-0" }
  ],
  "userRanking": null
}

Set "userRanking" to the rank number if the user's team appears in the rankings, or null if they don't.

Rules:
- Extract ALL visible rankings, not just the top few
- Use official FBS team names
- If a record is not visible for a team, use an empty string
- If the rankings are partially visible, extract what you can see
- Return ONLY the JSON object, no other text`;

interface RawRankingsResponse {
  rankings: unknown;
  userRanking: unknown;
}

function safeNumber(value: unknown): number {
  if (typeof value === "number" && !isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

function safeNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const num = safeNumber(value);
  return num > 0 ? num : null;
}

function safeString(value: unknown, fallback: string): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function parseRankings(raw: unknown): RankingEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (item): item is { rank: unknown; team: unknown; record: unknown } =>
        typeof item === "object" && item !== null
    )
    .map((item) => ({
      rank: safeNumber(item.rank),
      team: safeString(item.team, "Unknown"),
      record: safeString(item.record, ""),
    }))
    .filter((item) => item.rank > 0 && item.rank <= 25 && item.team !== "Unknown")
    .sort((a, b) => a.rank - b.rank);
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<RankingsResponse>> {
  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          rankings: null,
          userRanking: null,
          error: "Image exceeds 10MB size limit",
        },
        { status: 413 }
      );
    }

    const formData = await request.formData();

    const imageFile = formData.get("image");
    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          rankings: null,
          userRanking: null,
          error: "Missing required field: image",
        },
        { status: 400 }
      );
    }

    if (!ACCEPTED_MIME_TYPES.has(imageFile.type)) {
      return NextResponse.json(
        {
          success: false,
          rankings: null,
          userRanking: null,
          error: `Invalid image type: ${imageFile.type}. Accepted: png, jpeg, webp`,
        },
        { status: 400 }
      );
    }

    if (imageFile.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          rankings: null,
          userRanking: null,
          error: "Image exceeds 10MB size limit",
        },
        { status: 413 }
      );
    }

    const school = formData.get("school");
    if (typeof school !== "string" || !school.trim()) {
      return NextResponse.json(
        {
          success: false,
          rankings: null,
          userRanking: null,
          error: "Missing required field: school",
        },
        { status: 400 }
      );
    }

    const validMimeTypes = ["image/png", "image/jpeg", "image/webp"] as const;
    type ValidMimeType = (typeof validMimeTypes)[number];

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: RANKINGS_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imageFile.type as ValidMimeType,
                data: base64,
              },
            },
            {
              type: "text",
              text: `Extract the Top 25 rankings from this screenshot. The user's team is ${school}. Check if ${school} appears in the rankings and report their rank.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        {
          success: false,
          rankings: null,
          userRanking: null,
          error: "Failed to extract rankings from image",
        },
        { status: 500 }
      );
    }

    const jsonText = textBlock.text.trim();
    const parsed: RawRankingsResponse = JSON.parse(jsonText);

    const rankings = parseRankings(parsed.rankings);
    const userRanking = safeNullableNumber(parsed.userRanking);

    return NextResponse.json({
      success: true,
      rankings: rankings.length > 0 ? rankings : null,
      userRanking,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        rankings: null,
        userRanking: null,
        error: "Internal server error during rankings extraction",
      },
      { status: 500 }
    );
  }
}
