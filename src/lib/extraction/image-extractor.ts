import Anthropic from "@anthropic-ai/sdk";
import type { ExtractionResult, ConfidenceLevel } from "./types";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are analyzing a College Football 26 video game screenshot. Extract game data into structured JSON.

For EACH field, provide:
- "value": the extracted value
- "confidence": one of "high" (clearly visible and unambiguous), "medium" (partially visible or inferred from context), "low" (guessing based on limited info), "missing" (not present in the image at all)

Screenshot types you may encounter:
- Box score: Shows team names, quarter-by-quarter scores, final scores, and player stats
- Final score screen: Shows the final score with team logos/names
- Rankings screen: Shows the Top 25 rankings with team names and records
- Post-game summary: May show stats, highlights, MVP info
- Recruiting screen: Shows recruit offers, commitments, or decommitments

When you see a box score or final score:
1. Identify which team is the user's team (I'll tell you their school name)
2. Extract the opponent team name (match to known FBS team names)
3. Extract both scores
4. Determine home/away from team order or indicators (home team is typically listed second or on the right)
5. Infer gameVibe from the score differential:
   - Win by 21+: "blowout_win"
   - Win by 11-20: "dominant_win"
   - Win by 1-10: "close_win"
   - Loss by 1-10: "close_loss"
   - Loss by 11-20: "dominant_loss"
   - Loss by 21+: "blowout_loss"
6. Extract any visible stat leaders (player name, position, key stat line)

For rankings screenshots:
- Extract all visible ranked teams with their rank number, team name, and record
- Check if the user's school appears in the rankings

Return a single JSON object (no markdown fencing) with this exact structure:
{
  "opponent": { "value": "TeamName", "confidence": "high" },
  "opponentRanking": { "value": null, "confidence": "missing" },
  "homeAway": { "value": "home", "confidence": "medium" },
  "userScore": { "value": 35, "confidence": "high" },
  "opponentScore": { "value": 28, "confidence": "high" },
  "gameVibe": { "value": "close_win", "confidence": "medium" },
  "notableMoment": { "value": null, "confidence": "missing" },
  "statLeaders": { "value": [], "confidence": "missing" },
  "recruitUpdates": { "value": [], "confidence": "missing" },
  "newRanking": { "value": null, "confidence": "missing" },
  "top25": { "value": null, "confidence": "missing" }
}

Rules:
- For fields not visible in the screenshot, set value to null (or [] for arrays) and confidence to "missing"
- For statLeaders, each entry needs: { "name": "Player Name", "position": "QB", "stat": "300 yds, 3 TD" }
- For recruitUpdates, each entry needs: { "action": "offer|commit|decommit|portal_loss", "name": "Player Name", "position": "WR", "stars": 4 }
- For top25, each entry needs: { "rank": 1, "team": "Georgia", "record": "8-0" }
- Use real FBS team names, not abbreviations (e.g., "Ohio State" not "OSU")
- Return ONLY the JSON object, no other text`;

interface RawExtractedField {
  value: unknown;
  confidence: string;
}

interface RawExtractionResponse {
  opponent: RawExtractedField;
  opponentRanking: RawExtractedField;
  homeAway: RawExtractedField;
  userScore: RawExtractedField;
  opponentScore: RawExtractedField;
  gameVibe: RawExtractedField;
  notableMoment: RawExtractedField;
  statLeaders: RawExtractedField;
  recruitUpdates: RawExtractedField;
  newRanking: RawExtractedField;
  top25: RawExtractedField;
}

function normalizeConfidence(raw: string): ConfidenceLevel {
  const lower = raw.toLowerCase().trim();
  if (lower === "high") return "high";
  if (lower === "medium") return "medium";
  if (lower === "low") return "low";
  return "missing";
}

function safeString(value: unknown, fallback: string): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
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
  if (typeof value === "number" && !isNaN(value)) return value;
  if (typeof value === "string") {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return null;
}

function safeHomeAway(value: unknown): "home" | "away" {
  if (typeof value === "string") {
    const lower = value.toLowerCase().trim();
    if (lower === "away") return "away";
  }
  return "home";
}

function safeStatLeaders(
  value: unknown
): Array<{ name: string; position: string; stat: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is { name: unknown; position: unknown; stat: unknown } =>
        typeof item === "object" && item !== null
    )
    .map((item) => ({
      name: safeString(item.name, "Unknown"),
      position: safeString(item.position, "Unknown"),
      stat: safeString(item.stat, ""),
    }))
    .filter((item) => item.name !== "Unknown" && item.stat !== "");
}

function safeRecruitUpdates(
  value: unknown
): Array<{ action: string; name: string; position: string; stars: number }> {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is {
        action: unknown;
        name: unknown;
        position: unknown;
        stars: unknown;
      } => typeof item === "object" && item !== null
    )
    .map((item) => ({
      action: safeString(item.action, "offer"),
      name: safeString(item.name, "Unknown"),
      position: safeString(item.position, "Unknown"),
      stars: Math.max(1, Math.min(5, safeNumber(item.stars) || 3)),
    }))
    .filter((item) => item.name !== "Unknown");
}

function safeTop25(
  value: unknown
): Array<{ rank: number; team: string; record: string }> | null {
  if (value === null || value === undefined) return null;
  if (!Array.isArray(value)) return null;
  if (value.length === 0) return null;
  return value
    .filter(
      (item): item is { rank: unknown; team: unknown; record: unknown } =>
        typeof item === "object" && item !== null
    )
    .map((item) => ({
      rank: safeNumber(item.rank),
      team: safeString(item.team, "Unknown"),
      record: safeString(item.record, ""),
    }))
    .filter((item) => item.rank > 0 && item.team !== "Unknown");
}

function createMissingResult(source: "screenshot"): ExtractionResult {
  return {
    opponent: { value: "", confidence: "missing", source },
    opponentRanking: { value: null, confidence: "missing", source },
    homeAway: { value: "home", confidence: "missing", source },
    userScore: { value: 0, confidence: "missing", source },
    opponentScore: { value: 0, confidence: "missing", source },
    gameVibe: { value: "", confidence: "missing", source },
    notableMoment: { value: null, confidence: "missing", source },
    statLeaders: { value: [], confidence: "missing", source },
    recruitUpdates: { value: [], confidence: "missing", source },
    newRanking: { value: null, confidence: "missing", source },
    top25: null,
  };
}

function mapRawToExtractionResult(raw: RawExtractionResponse): ExtractionResult {
  const source = "screenshot" as const;

  const top25Value = safeTop25(raw.top25?.value);
  const top25Confidence = normalizeConfidence(raw.top25?.confidence ?? "missing");

  return {
    opponent: {
      value: safeString(raw.opponent?.value, ""),
      confidence: normalizeConfidence(raw.opponent?.confidence ?? "missing"),
      source,
    },
    opponentRanking: {
      value: safeNullableNumber(raw.opponentRanking?.value),
      confidence: normalizeConfidence(raw.opponentRanking?.confidence ?? "missing"),
      source,
    },
    homeAway: {
      value: safeHomeAway(raw.homeAway?.value),
      confidence: normalizeConfidence(raw.homeAway?.confidence ?? "missing"),
      source,
    },
    userScore: {
      value: safeNumber(raw.userScore?.value),
      confidence: normalizeConfidence(raw.userScore?.confidence ?? "missing"),
      source,
    },
    opponentScore: {
      value: safeNumber(raw.opponentScore?.value),
      confidence: normalizeConfidence(raw.opponentScore?.confidence ?? "missing"),
      source,
    },
    gameVibe: {
      value: safeString(raw.gameVibe?.value, ""),
      confidence: normalizeConfidence(raw.gameVibe?.confidence ?? "missing"),
      source,
    },
    notableMoment: {
      value:
        raw.notableMoment?.value === null || raw.notableMoment?.value === undefined
          ? null
          : safeString(raw.notableMoment.value, ""),
      confidence: normalizeConfidence(raw.notableMoment?.confidence ?? "missing"),
      source,
    },
    statLeaders: {
      value: safeStatLeaders(raw.statLeaders?.value),
      confidence: normalizeConfidence(raw.statLeaders?.confidence ?? "missing"),
      source,
    },
    recruitUpdates: {
      value: safeRecruitUpdates(raw.recruitUpdates?.value),
      confidence: normalizeConfidence(raw.recruitUpdates?.confidence ?? "missing"),
      source,
    },
    newRanking: {
      value: safeNullableNumber(raw.newRanking?.value),
      confidence: normalizeConfidence(raw.newRanking?.confidence ?? "missing"),
      source,
    },
    top25:
      top25Value !== null
        ? { value: top25Value, confidence: top25Confidence, source }
        : top25Confidence !== "missing"
          ? { value: [], confidence: top25Confidence, source }
          : null,
  };
}

export async function extractFromScreenshot(
  imageBase64: string,
  mimeType: string,
  context: { week: number; school: string; conference: string }
): Promise<ExtractionResult> {
  const validMimeTypes = ["image/png", "image/jpeg", "image/webp"] as const;
  type ValidMimeType = (typeof validMimeTypes)[number];

  if (!validMimeTypes.includes(mimeType as ValidMimeType)) {
    return createMissingResult("screenshot");
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as ValidMimeType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `This is a Week ${context.week} screenshot. The user's team is ${context.school} (${context.conference}). Extract all visible game data.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return createMissingResult("screenshot");
    }

    const jsonText = textBlock.text.trim();
    const parsed: RawExtractionResponse = JSON.parse(jsonText);
    return mapRawToExtractionResult(parsed);
  } catch {
    return createMissingResult("screenshot");
  }
}
