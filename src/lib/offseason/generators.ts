import Anthropic from "@anthropic-ai/sdk";
import type {
  BowlRecapContent,
  AwardsContent,
  PortalContent,
  CarouselContent,
  SigningDayContent,
  SpringPreviewContent,
} from "./types";

const client = new Anthropic();

export interface OffseasonContext {
  school: string;
  coachName: string;
  conference: string;
  prestige: string;
  seasonState: string;
  narrativeMemory: string;
}

function parseJSON<T>(raw: string): T | null {
  try {
    const trimmed = raw.trim();
    const jsonStart = trimmed.indexOf("{");
    const jsonEnd = trimmed.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) return null;
    return JSON.parse(trimmed.slice(jsonStart, jsonEnd + 1)) as T;
  } catch {
    return null;
  }
}

async function callClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "";
}

function buildSystemPrompt(ctx: OffseasonContext): string {
  return [
    `You are a college football beat writer and insider covering ${ctx.school} in the ${ctx.conference}.`,
    `The head coach is ${ctx.coachName}. The program prestige level is ${ctx.prestige}.`,
    "Write in a vivid, editorial style befitting a premium sports publication.",
    "All output must be valid JSON matching the requested schema exactly.",
    "Do not include any text outside the JSON object.",
  ].join("\n");
}

export async function generateBowlRecap(
  ctx: OffseasonContext
): Promise<BowlRecapContent> {
  try {
    const prompt = [
      "Write a season-ending bowl recap article as JSON with this exact schema:",
      '{"headline": "string", "body": "string (300-400 words)", "socialReactions": [{"handle": "string", "body": "string", "type": "fan"|"analyst"|"rival"}]}',
      "",
      "Include 5-6 social reactions with a mix of fan, analyst, and rival perspectives.",
      "The article should reflect on the entire season arc, not just the final game.",
      "Reference the coach by name and reflect on how the season met or defied expectations.",
      "",
      "Season context:",
      ctx.seasonState,
      "",
      "Narrative memory:",
      ctx.narrativeMemory,
    ].join("\n");

    const raw = await callClaude(buildSystemPrompt(ctx), prompt);
    const parsed = parseJSON<BowlRecapContent>(raw);

    if (
      parsed &&
      typeof parsed.headline === "string" &&
      typeof parsed.body === "string" &&
      Array.isArray(parsed.socialReactions) &&
      parsed.socialReactions.length >= 1 &&
      parsed.socialReactions.every(
        (r) =>
          typeof r.handle === "string" &&
          typeof r.body === "string" &&
          typeof r.type === "string"
      )
    ) {
      return parsed;
    }

    return buildFallbackBowlRecap(ctx);
  } catch {
    return buildFallbackBowlRecap(ctx);
  }
}

function buildFallbackBowlRecap(ctx: OffseasonContext): BowlRecapContent {
  return {
    headline: `${ctx.school} Wraps Up the Season`,
    body: `The ${ctx.school} program has closed the book on another season under head coach ${ctx.coachName}. The campaign brought its share of highs and lows, leaving the fanbase looking ahead to what comes next. With the final whistle blown, attention now turns to the offseason and the work required to build toward next year's goals.`,
    socialReactions: [
      {
        handle: "@DynastyWireStaff",
        body: `Another season in the books for ${ctx.school}. Time to evaluate and reload.`,
        type: "analyst",
      },
      {
        handle: "@BigFan2026",
        body: `What a ride this season was. Proud of our guys no matter what.`,
        type: "fan",
      },
    ],
  };
}

export async function generateAwards(
  ctx: OffseasonContext
): Promise<AwardsContent> {
  try {
    const prompt = [
      "Generate end-of-season awards as JSON with this exact schema:",
      '{"awards": [{"name": "string", "winner": "string", "description": "string"}], "allConference": [{"name": "string", "position": "string"}], "narrative": "string (100-150 words)"}',
      "",
      "Include 4-6 awards (e.g., Team MVP, Offensive Player of the Year, Defensive Player of the Year, Freshman of the Year, Most Improved, Unsung Hero).",
      "Include 6-8 all-conference team selections with fictional player names and positions.",
      "The narrative should summarize what the award winners meant to the season.",
      `Use fictional player names that fit the ${ctx.school} program.`,
      "",
      "Season context:",
      ctx.seasonState,
      "",
      "Narrative memory:",
      ctx.narrativeMemory,
    ].join("\n");

    const raw = await callClaude(buildSystemPrompt(ctx), prompt);
    const parsed = parseJSON<AwardsContent>(raw);

    if (
      parsed &&
      Array.isArray(parsed.awards) &&
      parsed.awards.length >= 1 &&
      parsed.awards.every(
        (a) =>
          typeof a.name === "string" &&
          typeof a.winner === "string" &&
          typeof a.description === "string"
      ) &&
      Array.isArray(parsed.allConference) &&
      parsed.allConference.every(
        (p) => typeof p.name === "string" && typeof p.position === "string"
      ) &&
      typeof parsed.narrative === "string"
    ) {
      return parsed;
    }

    return buildFallbackAwards(ctx);
  } catch {
    return buildFallbackAwards(ctx);
  }
}

function buildFallbackAwards(ctx: OffseasonContext): AwardsContent {
  return {
    awards: [
      {
        name: "Team MVP",
        winner: "Season Standout",
        description: `Led ${ctx.school} through a memorable campaign with consistent production on both sides of the ball.`,
      },
    ],
    allConference: [
      { name: "Marcus Williams", position: "QB" },
      { name: "DeShawn Carter", position: "WR" },
    ],
    narrative: `The ${ctx.school} awards ceremony capped off a season that tested Coach ${ctx.coachName}'s roster in every conceivable way. The honorees represent the heart and soul of a program still finding its identity under the current regime.`,
  };
}

export async function generatePortalWindow(
  ctx: OffseasonContext
): Promise<PortalContent> {
  try {
    const prompt = [
      "Generate transfer portal activity as JSON with this exact schema:",
      '{"entries": [{"name": "string", "position": "string", "direction": "in"|"out", "reason": "string", "impact": "string"}], "narrative": "string (100-150 words)"}',
      "",
      "Include 6-10 portal entries with a realistic mix of incoming and outgoing players.",
      "Players leaving should have reasons like 'seeking more playing time', 'closer to home', 'fresh start'.",
      "Incoming players should have reasons like 'drawn to Coach's system', 'reuniting with former teammate', 'upgrade in competition level'.",
      "Impact should describe what the move means for the roster (e.g., 'Leaves a gap at left tackle', 'Adds depth at cornerback').",
      `Base the portal activity on the season results — a bad season means more departures.`,
      "",
      "Season context:",
      ctx.seasonState,
      "",
      "Narrative memory:",
      ctx.narrativeMemory,
    ].join("\n");

    const raw = await callClaude(buildSystemPrompt(ctx), prompt);
    const parsed = parseJSON<PortalContent>(raw);

    if (
      parsed &&
      Array.isArray(parsed.entries) &&
      parsed.entries.length >= 1 &&
      parsed.entries.every(
        (e) =>
          typeof e.name === "string" &&
          typeof e.position === "string" &&
          (e.direction === "in" || e.direction === "out") &&
          typeof e.reason === "string" &&
          typeof e.impact === "string"
      ) &&
      typeof parsed.narrative === "string"
    ) {
      return parsed;
    }

    return buildFallbackPortal(ctx);
  } catch {
    return buildFallbackPortal(ctx);
  }
}

function buildFallbackPortal(ctx: OffseasonContext): PortalContent {
  return {
    entries: [
      {
        name: "Jordan Mitchell",
        position: "LB",
        direction: "out",
        reason: "Seeking a starting role elsewhere",
        impact: "Thins the linebacker depth chart heading into spring",
      },
      {
        name: "Caleb Torres",
        position: "WR",
        direction: "in",
        reason: `Drawn to ${ctx.coachName}'s offensive system`,
        impact: "Adds a much-needed vertical threat to the passing game",
      },
    ],
    narrative: `The transfer portal window has opened, and ${ctx.school} is navigating the new reality of roster management. Coach ${ctx.coachName} and staff are working the phones to shore up weaknesses while managing departures from players seeking greener pastures.`,
  };
}

export async function generateCarousel(
  ctx: OffseasonContext
): Promise<CarouselContent> {
  try {
    const prompt = [
      "Generate coaching carousel rumors as JSON with this exact schema:",
      '{"rumors": [{"staffName": "string", "role": "string", "school": "string", "likelihood": "confirmed"|"likely"|"rumored"|"unlikely", "narrative": "string"}], "headline": "string"}',
      "",
      "Include 3-5 coaching staff rumors involving coordinators and position coaches.",
      "At least one should involve a staff member being poached by another school.",
      "At least one should involve a potential hire coming in.",
      "The headline should be attention-grabbing and reflect the biggest rumor.",
      `Rumors should feel realistic for a ${ctx.prestige} program in the ${ctx.conference}.`,
      "",
      "Season context:",
      ctx.seasonState,
      "",
      "Narrative memory:",
      ctx.narrativeMemory,
    ].join("\n");

    const raw = await callClaude(buildSystemPrompt(ctx), prompt);
    const parsed = parseJSON<CarouselContent>(raw);

    const validLikelihoods = new Set([
      "confirmed",
      "likely",
      "rumored",
      "unlikely",
    ]);

    if (
      parsed &&
      Array.isArray(parsed.rumors) &&
      parsed.rumors.length >= 1 &&
      parsed.rumors.every(
        (r) =>
          typeof r.staffName === "string" &&
          typeof r.role === "string" &&
          typeof r.school === "string" &&
          validLikelihoods.has(r.likelihood) &&
          typeof r.narrative === "string"
      ) &&
      typeof parsed.headline === "string"
    ) {
      return parsed;
    }

    return buildFallbackCarousel(ctx);
  } catch {
    return buildFallbackCarousel(ctx);
  }
}

function buildFallbackCarousel(ctx: OffseasonContext): CarouselContent {
  return {
    rumors: [
      {
        staffName: "Mike Reynolds",
        role: "Offensive Coordinator",
        school: ctx.school,
        likelihood: "rumored",
        narrative: `Multiple sources indicate Reynolds has drawn interest from programs in the ${ctx.conference} after his work with the offense this season.`,
      },
      {
        staffName: "Anthony Brooks",
        role: "Defensive Line Coach",
        school: ctx.school,
        likelihood: "likely",
        narrative: `Brooks is expected to remain on Coach ${ctx.coachName}'s staff, citing loyalty and a desire to see the defensive rebuild through.`,
      },
    ],
    headline: `Staff Shakeup? ${ctx.school} Coaching Carousel Heating Up`,
  };
}

export async function generateSigningDay(
  ctx: OffseasonContext,
  recruits: Array<{ name: string; position: string; stars: number }>
): Promise<SigningDayContent> {
  try {
    const recruitList =
      recruits.length > 0
        ? recruits
            .map((r) => `${r.name} (${r.position}, ${r.stars}-star)`)
            .join(", ")
        : "No specific uncommitted recruits on the board";

    const prompt = [
      "Generate signing day results as JSON with this exact schema:",
      '{"decisions": [{"name": "string", "position": "string", "stars": number, "decision": "committed"|"flipped"|"decommitted"|"surprise", "narrative": "string"}], "classGrade": "string (e.g. A-, B+, C)", "summary": "string (100-150 words)"}',
      "",
      recruits.length > 0
        ? `These uncommitted recruits need decisions: ${recruitList}`
        : "Generate 4-6 fictional recruits making their signing day decisions.",
      "Include a mix of decisions — not everyone should commit.",
      "At least one surprise (an unexpected commit or flip from another school).",
      "The classGrade should realistically reflect the program's prestige and season results.",
      "The summary should read like a signing day wrap-up article.",
      "",
      "Season context:",
      ctx.seasonState,
      "",
      "Narrative memory:",
      ctx.narrativeMemory,
    ].join("\n");

    const raw = await callClaude(buildSystemPrompt(ctx), prompt);
    const parsed = parseJSON<SigningDayContent>(raw);

    const validDecisions = new Set([
      "committed",
      "flipped",
      "decommitted",
      "surprise",
    ]);

    if (
      parsed &&
      Array.isArray(parsed.decisions) &&
      parsed.decisions.length >= 1 &&
      parsed.decisions.every(
        (d) =>
          typeof d.name === "string" &&
          typeof d.position === "string" &&
          typeof d.stars === "number" &&
          validDecisions.has(d.decision) &&
          typeof d.narrative === "string"
      ) &&
      typeof parsed.classGrade === "string" &&
      typeof parsed.summary === "string"
    ) {
      return parsed;
    }

    return buildFallbackSigningDay(ctx);
  } catch {
    return buildFallbackSigningDay(ctx);
  }
}

function buildFallbackSigningDay(ctx: OffseasonContext): SigningDayContent {
  return {
    decisions: [
      {
        name: "Jaylen Brooks",
        position: "QB",
        stars: 4,
        decision: "committed",
        narrative: `Brooks chose ${ctx.school} after an official visit last month, citing Coach ${ctx.coachName}'s development track record.`,
      },
      {
        name: "Marcus Thompson",
        position: "DE",
        stars: 3,
        decision: "flipped",
        narrative: `In a late surprise, Thompson flipped his commitment away from ${ctx.school} to a rival program.`,
      },
    ],
    classGrade: "B",
    summary: `${ctx.school}'s signing day brought a mix of elation and disappointment as Coach ${ctx.coachName} put the finishing touches on the recruiting class. The class addresses several key roster needs while leaving a few positions still in flux heading into spring practice.`,
  };
}

export async function generateSpringPreview(
  ctx: OffseasonContext
): Promise<SpringPreviewContent> {
  try {
    const prompt = [
      "Generate a spring preview article as JSON with this exact schema:",
      '{"headline": "string", "body": "string (250-350 words)", "keyStorylines": ["string", "string", "string", "string", "string"], "preseasonRanking": number|null}',
      "",
      "Write a forward-looking preview article about what to expect from the upcoming season.",
      "Include exactly 5 key storylines as brief sentences (15-25 words each).",
      "The preseasonRanking should be a realistic number 1-25, or null if the team is unranked.",
      `Base the ranking on the ${ctx.prestige} prestige level and previous season results.`,
      "The body should discuss roster changes, coaching developments, and expectations.",
      "",
      "Season context (previous season):",
      ctx.seasonState,
      "",
      "Narrative memory:",
      ctx.narrativeMemory,
    ].join("\n");

    const raw = await callClaude(buildSystemPrompt(ctx), prompt);
    const parsed = parseJSON<SpringPreviewContent>(raw);

    if (
      parsed &&
      typeof parsed.headline === "string" &&
      typeof parsed.body === "string" &&
      Array.isArray(parsed.keyStorylines) &&
      parsed.keyStorylines.length >= 1 &&
      parsed.keyStorylines.every((s) => typeof s === "string") &&
      (parsed.preseasonRanking === null ||
        typeof parsed.preseasonRanking === "number")
    ) {
      return parsed;
    }

    return buildFallbackSpringPreview(ctx);
  } catch {
    return buildFallbackSpringPreview(ctx);
  }
}

function buildFallbackSpringPreview(
  ctx: OffseasonContext
): SpringPreviewContent {
  return {
    headline: `${ctx.school} Spring Preview: What to Watch Under Coach ${ctx.coachName}`,
    body: `As spring practice opens, ${ctx.school} enters a pivotal period under head coach ${ctx.coachName}. The roster has undergone significant turnover through the transfer portal and graduation, creating both challenges and opportunities for the coaching staff. Position battles will define the spring, particularly at quarterback and along both lines. The coaching staff has emphasized physicality and culture-building as the foundations for the upcoming campaign. Fan expectations are calibrated by last season's results, but the staff believes the program is trending in the right direction. Spring practice will provide the first real glimpse at how the new-look roster fits together.`,
    keyStorylines: [
      "Quarterback competition headlines spring practice with multiple candidates vying for the starting role",
      "Transfer portal additions must integrate quickly into the defensive scheme",
      "Offensive line depth remains a concern after losing multiple starters to graduation",
      "Young receivers could emerge as breakout candidates with expanded roles",
      "Special teams overhaul aims to fix the coverage unit struggles from last season",
    ],
    preseasonRanking: null,
  };
}
