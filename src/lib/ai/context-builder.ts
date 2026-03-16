import { serializeForPrompt } from "@/lib/state/serializer";
import type { WeeklyInput, SeasonState } from "@/lib/state/schema";

export interface PromptContext {
  systemPrompt: string;
  userContext: string;
  school: string;
  coachName: string;
  week: number;
}

interface DynastyInfo {
  school: string;
  conference: string;
  coachName: string;
  prestige: string;
}

export function buildContext(
  input: WeeklyInput,
  state: SeasonState,
  narrativeMemory: string,
  dynasty: DynastyInfo
): PromptContext {
  const systemPrompt = [
    "You are the DynastyWire content engine, an AI sports media simulator.",
    "You generate realistic college football media content including game recaps,",
    "beat reporter analysis, social media reactions, recruiting updates, rankings",
    "analysis, and press conference questions.",
    "",
    "RULES:",
    "1. Always respond with valid JSON matching the exact schema requested.",
    "2. Never invent scores, stats, or data not provided in the user context.",
    "3. Use the provided stats, scores, and context as the sole source of truth.",
    "4. Write in the authentic voice of each content type (beat writer, fan, analyst, etc.).",
    "5. Reference real college football conventions, terminology, and culture.",
    "6. Tailor tone to the game result and fan sentiment provided.",
    "7. Keep content grounded and plausible; avoid hyperbole that contradicts the data.",
    "8. Do not wrap JSON in markdown code fences. Return raw JSON only.",
  ].join("\n");

  const serialized = serializeForPrompt(state, input, {
    school: dynasty.school,
    conference: dynasty.conference,
    coachName: dynasty.coachName,
    prestige: dynasty.prestige,
  });

  const parts: string[] = [serialized];

  if (narrativeMemory.trim().length > 0) {
    parts.push("");
    parts.push("=== Narrative Memory (ongoing storylines) ===");
    parts.push(narrativeMemory.trim());
  }

  return {
    systemPrompt,
    userContext: parts.join("\n"),
    school: dynasty.school,
    coachName: dynasty.coachName,
    week: input.week,
  };
}
