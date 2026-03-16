import type { WeeklyInputForm } from "@/lib/weekly/validation";

export type ConfidenceLevel = "high" | "medium" | "low" | "missing";

export interface ExtractedField<T> {
  value: T;
  confidence: ConfidenceLevel;
  source: "screenshot" | "text" | "user_corrected";
}

export interface ExtractionResult {
  opponent: ExtractedField<string>;
  opponentRanking: ExtractedField<number | null>;
  homeAway: ExtractedField<"home" | "away">;
  userScore: ExtractedField<number>;
  opponentScore: ExtractedField<number>;
  gameVibe: ExtractedField<string>;
  notableMoment: ExtractedField<string | null>;
  statLeaders: ExtractedField<
    Array<{ name: string; position: string; stat: string }>
  >;
  recruitUpdates: ExtractedField<
    Array<{ action: string; name: string; position: string; stars: number }>
  >;
  newRanking: ExtractedField<number | null>;
  top25: ExtractedField<
    Array<{ rank: number; team: string; record: string }>
  > | null;
}

export interface ExtractionRequest {
  type: "screenshot" | "text";
  imageData?: string;
  imageMimeType?: string;
  rawText?: string;
  week: number;
  school: string;
  conference: string;
}

export interface ExtractionResponse {
  success: boolean;
  result: ExtractionResult | null;
  error?: string;
  extractionType: "screenshot" | "text";
}

const VALID_GAME_VIBES = [
  "dominant_win",
  "close_win",
  "blowout_win",
  "close_loss",
  "dominant_loss",
  "blowout_loss",
] as const;

type GameVibe = (typeof VALID_GAME_VIBES)[number];

function isValidGameVibe(value: string): value is GameVibe {
  return (VALID_GAME_VIBES as readonly string[]).includes(value);
}

const VALID_RECRUIT_ACTIONS = [
  "offer",
  "commit",
  "decommit",
  "portal_loss",
] as const;

type RecruitAction = (typeof VALID_RECRUIT_ACTIONS)[number];

function isValidRecruitAction(value: string): value is RecruitAction {
  return (VALID_RECRUIT_ACTIONS as readonly string[]).includes(value);
}

function isUsableConfidence(confidence: ConfidenceLevel): boolean {
  return confidence === "high" || confidence === "medium";
}

export function extractionToWeeklyInput(
  result: ExtractionResult,
  week: number
): Partial<WeeklyInputForm> {
  const partial: Partial<WeeklyInputForm> = { week };

  if (isUsableConfidence(result.opponent.confidence)) {
    partial.opponent = result.opponent.value;
  }

  if (isUsableConfidence(result.opponentRanking.confidence)) {
    partial.opponentRanking = result.opponentRanking.value;
  }

  if (isUsableConfidence(result.homeAway.confidence)) {
    partial.homeAway = result.homeAway.value;
  }

  if (isUsableConfidence(result.userScore.confidence)) {
    partial.userScore = result.userScore.value;
  }

  if (isUsableConfidence(result.opponentScore.confidence)) {
    partial.opponentScore = result.opponentScore.value;
  }

  if (
    isUsableConfidence(result.gameVibe.confidence) &&
    isValidGameVibe(result.gameVibe.value)
  ) {
    partial.gameVibe = result.gameVibe.value;
  }

  if (isUsableConfidence(result.notableMoment.confidence)) {
    partial.notableMoment = result.notableMoment.value;
  }

  if (isUsableConfidence(result.statLeaders.confidence)) {
    partial.statLeaders = result.statLeaders.value;
  }

  if (isUsableConfidence(result.recruitUpdates.confidence)) {
    partial.recruitUpdates = result.recruitUpdates.value
      .filter((r) => isValidRecruitAction(r.action))
      .map((r) => ({
        action: r.action as RecruitAction,
        name: r.name,
        position: r.position,
        stars: Math.max(1, Math.min(5, r.stars)),
      }));
  }

  if (isUsableConfidence(result.newRanking.confidence)) {
    partial.newRanking = result.newRanking.value;
  }

  return partial;
}

const REQUIRED_FIELDS: Array<{
  key: keyof ExtractionResult;
  label: string;
}> = [
  { key: "opponent", label: "Opponent" },
  { key: "userScore", label: "Your Score" },
  { key: "opponentScore", label: "Opponent Score" },
  { key: "homeAway", label: "Home/Away" },
  { key: "gameVibe", label: "Game Vibe" },
];

const ALL_SCORED_FIELDS: Array<keyof ExtractionResult> = [
  "opponent",
  "opponentRanking",
  "homeAway",
  "userScore",
  "opponentScore",
  "gameVibe",
  "notableMoment",
  "statLeaders",
  "recruitUpdates",
  "newRanking",
];

export function getExtractionQuality(result: ExtractionResult): {
  score: number;
  missingRequired: string[];
} {
  const missingRequired: string[] = [];

  for (const { key, label } of REQUIRED_FIELDS) {
    const field = result[key];
    if (field === null || !isUsableConfidence(field.confidence)) {
      missingRequired.push(label);
    }
  }

  let usableCount = 0;
  for (const key of ALL_SCORED_FIELDS) {
    const field = result[key];
    if (field !== null && isUsableConfidence(field.confidence)) {
      usableCount++;
    }
  }

  const score = Math.round((usableCount / ALL_SCORED_FIELDS.length) * 100);

  return { score, missingRequired };
}
