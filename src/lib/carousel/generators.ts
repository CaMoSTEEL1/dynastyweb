import Anthropic from "@anthropic-ai/sdk";
import type {
  StaffMember,
  CoachingRumor,
  CarouselDecision,
  CarouselOutcome,
} from "./types";
import type { SeasonState } from "@/lib/state/schema";

const client = new Anthropic();

function parseJSON<T>(raw: string): T | null {
  try {
    const trimmed = raw.trim();
    const arrayStart = trimmed.indexOf("[");
    const arrayEnd = trimmed.lastIndexOf("]");
    const objStart = trimmed.indexOf("{");
    const objEnd = trimmed.lastIndexOf("}");

    if (arrayStart !== -1 && (arrayStart < objStart || objStart === -1)) {
      return JSON.parse(trimmed.slice(arrayStart, arrayEnd + 1)) as T;
    }
    if (objStart !== -1) {
      return JSON.parse(trimmed.slice(objStart, objEnd + 1)) as T;
    }
    return null;
  } catch {
    return null;
  }
}

async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number = 1200
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "";
}

const SYSTEM_PROMPT =
  "You are a college football narrative engine for DynastyWire, generating realistic coaching staff drama and carousel scenarios. Always respond with valid JSON only, no markdown fences.";

interface StaffProfileContext {
  school: string;
  coachName: string;
  prestige: string;
  coachYear: number;
}

export async function generateStaffProfiles(
  ctx: StaffProfileContext
): Promise<StaffMember[]> {
  const prompt = [
    "Generate 2-3 coaching staff members for a college football program as a JSON array.",
    "Each object must match this schema exactly:",
    '{"id": "unique_string", "name": "Full Name", "role": "OC"|"DC"|"ST"|"Position Coach", "hotSeatLevel": "secure"|"lukewarm"|"hot", "yearsOnStaff": number, "reputation": "one sentence description"}',
    "",
    "Requirements:",
    "- At least one OC and one DC",
    "- Names should be realistic but fictional",
    "- Reputations should feel authentic (e.g., 'Up-and-coming play-caller who turned heads at the Sun Belt level')",
    `- Hot seat levels should vary based on prestige (${ctx.prestige}) and coach year (${ctx.coachYear})`,
    "- yearsOnStaff should be between 1 and the coach's tenure length",
    "",
    `School: ${ctx.school}`,
    `Head Coach: ${ctx.coachName}`,
    `Prestige: ${ctx.prestige}`,
    `Coach Year: ${ctx.coachYear}`,
  ].join("\n");

  try {
    const raw = await callClaude(SYSTEM_PROMPT, prompt);
    const parsed = parseJSON<StaffMember[]>(raw);

    if (
      Array.isArray(parsed) &&
      parsed.length >= 2 &&
      parsed.every(
        (s) =>
          typeof s.id === "string" &&
          typeof s.name === "string" &&
          typeof s.role === "string" &&
          typeof s.hotSeatLevel === "string" &&
          typeof s.yearsOnStaff === "number" &&
          typeof s.reputation === "string"
      )
    ) {
      return parsed;
    }

    return [
      {
        id: "oc-fallback",
        name: "Mike Callahan",
        role: "OC",
        hotSeatLevel: "lukewarm",
        yearsOnStaff: 2,
        reputation: "Veteran coordinator known for conservative play-calling under pressure.",
      },
      {
        id: "dc-fallback",
        name: "Ray Dawkins",
        role: "DC",
        hotSeatLevel: "secure",
        yearsOnStaff: 1,
        reputation: "Former NFL linebackers coach who brings an aggressive, blitz-heavy scheme.",
      },
    ];
  } catch {
    return [
      {
        id: "oc-fallback",
        name: "Mike Callahan",
        role: "OC",
        hotSeatLevel: "lukewarm",
        yearsOnStaff: 2,
        reputation: "Veteran coordinator known for conservative play-calling under pressure.",
      },
      {
        id: "dc-fallback",
        name: "Ray Dawkins",
        role: "DC",
        hotSeatLevel: "secure",
        yearsOnStaff: 1,
        reputation: "Former NFL linebackers coach who brings an aggressive, blitz-heavy scheme.",
      },
    ];
  }
}

interface RumorContext {
  school: string;
  coachName: string;
  staff: StaffMember[];
  seasonState: SeasonState;
  prestige: string;
}

export async function generateCoachingRumors(
  ctx: RumorContext
): Promise<CoachingRumor[]> {
  const record = `${ctx.seasonState.record.wins}-${ctx.seasonState.record.losses}`;
  const isLosingRecord = ctx.seasonState.record.losses > ctx.seasonState.record.wins;
  const rumorCount = isLosingRecord ? "2-3" : "1-2";

  const staffDescriptions = ctx.staff
    .map(
      (s) =>
        `${s.name} (${s.role}, hot seat: ${s.hotSeatLevel}, ${s.yearsOnStaff}yr, reputation: ${s.reputation})`
    )
    .join("\n  ");

  const prompt = [
    `Generate ${rumorCount} coaching carousel rumors as a JSON array.`,
    "Each object must match this schema exactly:",
    '{"id": "unique_string", "staffMember": <full StaffMember object>, "type": "interview_request"|"poaching_attempt"|"forced_departure"|"loyalty_test", "suitor": "School Name", "narrative": "2-3 sentence insider report", "urgency": "low"|"medium"|"high"}',
    "",
    "StaffMember schema: {id, name, role, hotSeatLevel, yearsOnStaff, reputation}",
    "",
    "Rules:",
    "- Rumors should reference ONLY the provided staff members",
    "- Losing seasons generate more forced_departure and interview_request rumors",
    "- Winning seasons generate more poaching_attempt and loyalty_test rumors",
    "- High-prestige suitor schools should create higher urgency",
    "- Narratives should read like insider reports from a coaching source",
    `- The suitor school must be different from ${ctx.school}`,
    "",
    `School: ${ctx.school}`,
    `Head Coach: ${ctx.coachName}`,
    `Season Record: ${record}`,
    `Fan Sentiment: ${ctx.seasonState.fanSentiment}`,
    `Hot Seat Level: ${ctx.seasonState.hotSeatLevel}`,
    `Momentum: ${ctx.seasonState.seasonMomentum}`,
    `Prestige: ${ctx.prestige}`,
    `Staff:\n  ${staffDescriptions}`,
  ].join("\n");

  try {
    const raw = await callClaude(SYSTEM_PROMPT, prompt, 1500);
    const parsed = parseJSON<CoachingRumor[]>(raw);

    if (
      Array.isArray(parsed) &&
      parsed.length >= 1 &&
      parsed.every(
        (r) =>
          typeof r.id === "string" &&
          r.staffMember &&
          typeof r.staffMember.name === "string" &&
          typeof r.type === "string" &&
          typeof r.suitor === "string" &&
          typeof r.narrative === "string" &&
          typeof r.urgency === "string"
      )
    ) {
      return parsed;
    }

    return [
      {
        id: "rumor-fallback-1",
        staffMember: ctx.staff[0],
        type: "interview_request",
        suitor: "Alabama",
        narrative: `Sources close to the program indicate that ${ctx.staff[0].name} has drawn interest from Alabama's coaching search. The interview is expected to happen sometime this week.`,
        urgency: "medium",
      },
    ];
  } catch {
    return [
      {
        id: "rumor-fallback-1",
        staffMember: ctx.staff[0],
        type: "interview_request",
        suitor: "Alabama",
        narrative: `Sources close to the program indicate that ${ctx.staff[0].name} has drawn interest from Alabama's coaching search. The interview is expected to happen sometime this week.`,
        urgency: "medium",
      },
    ];
  }
}

interface DecisionContext {
  school: string;
  coachName: string;
  prestige: string;
  seasonRecord: string;
}

export async function resolveCarouselDecision(
  rumor: CoachingRumor,
  decision: CarouselDecision,
  ctx: DecisionContext
): Promise<CarouselOutcome> {
  const prompt = [
    "Determine the outcome of a coaching carousel decision. Return JSON matching this schema exactly:",
    '{"staffMember": <full StaffMember object>, "decision": "string describing what the coach decided", "result": "stayed"|"departed"|"fired", "narrative": "2-3 sentence outcome narrative", "impactOnNextSeason": "1 sentence about how this affects next season"}',
    "",
    "StaffMember schema: {id, name, role, hotSeatLevel, yearsOnStaff, reputation}",
    "",
    "Rules:",
    "- If decision is 'retain': high urgency rumors have a ~40% chance the coach leaves anyway. Medium ~20%. Low ~5%.",
    "- If decision is 'release': the coach always departs. Narrative should address the fallout.",
    "- If decision is 'counter_offer': depends on urgency. High urgency = 50% stays. Medium = 70%. Low = 90%.",
    "- If bonusOffered is true with counter_offer, increase stay chance by 15%.",
    "- The result should feel realistic and narratively satisfying.",
    "- impactOnNextSeason should reference recruiting, scheme continuity, or player development.",
    "",
    `School: ${ctx.school}`,
    `Head Coach: ${ctx.coachName}`,
    `Prestige: ${ctx.prestige}`,
    `Season Record: ${ctx.seasonRecord}`,
    `Staff Member: ${rumor.staffMember.name} (${rumor.staffMember.role})`,
    `Rumor Type: ${rumor.type}`,
    `Suitor: ${rumor.suitor}`,
    `Urgency: ${rumor.urgency}`,
    `Decision: ${decision.decision}`,
    `Bonus Offered: ${decision.bonusOffered}`,
    `Original Narrative: ${rumor.narrative}`,
  ].join("\n");

  try {
    const raw = await callClaude(SYSTEM_PROMPT, prompt, 800);
    const parsed = parseJSON<CarouselOutcome>(raw);

    if (
      parsed &&
      parsed.staffMember &&
      typeof parsed.staffMember.name === "string" &&
      typeof parsed.decision === "string" &&
      typeof parsed.result === "string" &&
      typeof parsed.narrative === "string" &&
      typeof parsed.impactOnNextSeason === "string"
    ) {
      return parsed;
    }

    const fallbackResult =
      decision.decision === "release" ? "fired" as const : "stayed" as const;

    return {
      staffMember: rumor.staffMember,
      decision: `Head coach chose to ${decision.decision} ${rumor.staffMember.name}.`,
      result: fallbackResult,
      narrative: `After deliberation, ${rumor.staffMember.name} ${fallbackResult === "stayed" ? "will remain on staff" : "has been let go"} heading into the offseason.`,
      impactOnNextSeason: "The coaching staff changes will affect scheme continuity heading into spring practice.",
    };
  } catch {
    const fallbackResult =
      decision.decision === "release" ? "fired" as const : "stayed" as const;

    return {
      staffMember: rumor.staffMember,
      decision: `Head coach chose to ${decision.decision} ${rumor.staffMember.name}.`,
      result: fallbackResult,
      narrative: `After deliberation, ${rumor.staffMember.name} ${fallbackResult === "stayed" ? "will remain on staff" : "has been let go"} heading into the offseason.`,
      impactOnNextSeason: "The coaching staff changes will affect scheme continuity heading into spring practice.",
    };
  }
}
