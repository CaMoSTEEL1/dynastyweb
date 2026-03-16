import Anthropic from "@anthropic-ai/sdk";
import type { ExtractionResult, ConfidenceLevel } from "./types";

const client = new Anthropic();

function buildSystemPrompt(
  school: string,
  conference: string,
  week: number
): string {
  return `You are parsing a college football game report written in natural language. Extract structured data from what the user tells you about their game.

Context:
- The user is the coach of ${school} (${conference})
- This is Week ${week} of their season
- This is the video game College Football 26

Extract the following from the user's text:
1. Opponent team name (use full FBS team names, e.g., "Ohio State" not "OSU")
2. Whether the game was home or away
3. The user's score and the opponent's score
4. Any opponent ranking mentioned
5. Game vibe based on the score and description:
   - Win by 21+: "blowout_win"
   - Win by 11-20: "dominant_win"
   - Win by 1-10: "close_win"
   - Loss by 1-10: "close_loss"
   - Loss by 11-20: "dominant_loss"
   - Loss by 21+: "blowout_loss"
6. Notable moments (big plays, records, milestones)
7. Stat leaders (player names, positions, stat lines)
8. Any recruiting news (offers, commits, decommits, portal losses)
9. New ranking after the game
10. Top 25 rankings if mentioned

For EACH field, assess confidence:
- "high": explicitly stated in the text (e.g., "We beat Alabama 35-28")
- "medium": strongly implied (e.g., "barely won" implies close_win)
- "low": weak inference (e.g., guessing home/away with no clue)
- "missing": not mentioned at all

Return a single JSON object (no markdown fencing) with this exact structure:
{
  "opponent": { "value": "TeamName", "confidence": "high" },
  "opponentRanking": { "value": null, "confidence": "missing" },
  "homeAway": { "value": "home", "confidence": "low" },
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
- For fields not mentioned, set value to null (or [] for arrays) and confidence to "missing"
- For statLeaders, each entry: { "name": "Player Name", "position": "QB", "stat": "300 yds, 3 TD" }
- For recruitUpdates, each entry: { "action": "offer|commit|decommit|portal_loss", "name": "Player Name", "position": "WR", "stars": 4 }
- For top25, each entry: { "rank": 1, "team": "Georgia", "record": "8-0" }
- If the user says "we won" or "beat", infer the score relationship accordingly
- If the user mentions a score like "35-28", the first number is typically ${school}'s score unless context says otherwise
- Return ONLY the JSON object, no other text`;
}

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

function createMissingResult(): ExtractionResult {
  const source = "text" as const;
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
  const source = "text" as const;

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

export async function extractFromText(
  rawText: string,
  context: { week: number; school: string; conference: string }
): Promise<ExtractionResult> {
  if (!rawText.trim()) {
    return createMissingResult();
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: buildSystemPrompt(context.school, context.conference, context.week),
      messages: [
        {
          role: "user",
          content: rawText,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return createMissingResult();
    }

    const jsonText = textBlock.text.trim();
    const parsed: RawExtractionResponse = JSON.parse(jsonText);
    return mapRawToExtractionResult(parsed);
  } catch {
    return createMissingResult();
  }
}
