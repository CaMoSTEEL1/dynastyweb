import Anthropic from "@anthropic-ai/sdk";
import type { PromptContext } from "./context-builder";
import type { RecruitUpdate } from "@/lib/state/schema";
import { PRESS_CONFERENCE_DB } from "@/lib/data/press-conference-db";
import { SOCIAL_MEDIA_DB } from "@/lib/data/social-media-db";

const client = new Anthropic();

export type RecapContent = {
  headline: string;
  byline: string;
  body: string;
  pullQuote: string;
  error?: boolean;
};

export type BeatTakesContent = {
  headline: string;
  takes: Array<{ number: number; title: string; body: string }>;
  error?: boolean;
};

export type SocialPostsContent = {
  posts: Array<{
    handle: string;
    displayName: string;
    type: "fan" | "rival" | "analyst" | "insider" | "reddit";
    body: string;
    likes: number;
    reposts: number;
  }>;
  error?: boolean;
};

export type RankingsTakeContent = {
  headline: string;
  body: string;
  movement: string;
  error?: boolean;
};

export type RecruitingNoteContent = {
  headline: string;
  body: string;
  targets: string[];
  error?: boolean;
};

export type PressConfContent = {
  questions: Array<{
    reporterName: string;
    outlet: string;
    question: string;
    tone: "friendly" | "neutral" | "hostile" | "gotcha";
  }>;
  error?: boolean;
};

export type RecruitSocialPost = {
  handle: string;
  displayName: string;
  body: string;
  likes: number;
  reposts: number;
  position: string;
  stars: number;
  recruitName: string;
};

export type RecruitSocialPostsContent = {
  posts: RecruitSocialPost[];
  error?: boolean;
};

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
  userMessage: string,
  maxTokens: number = 1000
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

export async function generateRecap(ctx: PromptContext): Promise<RecapContent> {
  try {
    const prompt = [
      "Write a 150-word beat reporter game recap as JSON with this exact schema:",
      '{"headline": "string", "byline": "string", "body": "string", "pullQuote": "string"}',
      "",
      `The byline should be from a fictional beat reporter covering ${ctx.school}.`,
      "The body should read like a professional newspaper game recap.",
      "The pullQuote should be a compelling quote attributed to Coach " + ctx.coachName + " or a player.",
      "",
      "Context:",
      ctx.userContext,
    ].join("\n");

    const raw = await callClaude(ctx.systemPrompt, prompt);
    const parsed = parseJSON<RecapContent>(raw);

    if (
      parsed &&
      typeof parsed.headline === "string" &&
      typeof parsed.byline === "string" &&
      typeof parsed.body === "string" &&
      typeof parsed.pullQuote === "string"
    ) {
      return parsed;
    }

    return {
      headline: `Week ${ctx.week} Recap`,
      byline: "DynastyWire Staff",
      body: "Content generation encountered a formatting issue. Please try again.",
      pullQuote: "We just have to keep working.",
      error: true,
    };
  } catch {
    return {
      headline: `Week ${ctx.week} Recap`,
      byline: "DynastyWire Staff",
      body: "Content generation failed. Please try again.",
      pullQuote: "No comment at this time.",
      error: true,
    };
  }
}

export async function generateBeatTakes(
  ctx: PromptContext
): Promise<BeatTakesContent> {
  try {
    const prompt = [
      "Write '3 Things We Learned' as JSON with this exact schema:",
      '{"headline": "string", "takes": [{"number": 1, "title": "string", "body": "string"}, {"number": 2, "title": "string", "body": "string"}, {"number": 3, "title": "string", "body": "string"}]}',
      "",
      `Write about ${ctx.school} Week ${ctx.week} from a beat reporter's perspective.`,
      "Each take should be 40-60 words with an insightful, analytical tone.",
      "",
      "Context:",
      ctx.userContext,
    ].join("\n");

    const raw = await callClaude(ctx.systemPrompt, prompt);
    const parsed = parseJSON<BeatTakesContent>(raw);

    if (
      parsed &&
      typeof parsed.headline === "string" &&
      Array.isArray(parsed.takes) &&
      parsed.takes.length >= 1 &&
      parsed.takes.every(
        (t) =>
          typeof t.number === "number" &&
          typeof t.title === "string" &&
          typeof t.body === "string"
      )
    ) {
      return parsed;
    }

    return {
      headline: `3 Things We Learned: Week ${ctx.week}`,
      takes: [
        { number: 1, title: "Content unavailable", body: "Generation encountered a formatting issue." },
        { number: 2, title: "Content unavailable", body: "Generation encountered a formatting issue." },
        { number: 3, title: "Content unavailable", body: "Generation encountered a formatting issue." },
      ],
      error: true,
    };
  } catch {
    return {
      headline: `3 Things We Learned: Week ${ctx.week}`,
      takes: [
        { number: 1, title: "Error", body: "Content generation failed." },
        { number: 2, title: "Error", body: "Content generation failed." },
        { number: 3, title: "Error", body: "Content generation failed." },
      ],
      error: true,
    };
  }
}

export async function generateSocialPosts(
  ctx: PromptContext
): Promise<SocialPostsContent> {
  try {
    // Sample 8 random patterns from the DB as few-shot examples
    const socialShuffled = [...SOCIAL_MEDIA_DB].sort(() => Math.random() - 0.5);
    const socialExamples = socialShuffled.slice(0, 8);
    const socialExampleBlock = socialExamples
      .map(
        (e) =>
          `- [${e.type.toUpperCase()}] "${e.body}" (likes: ${e.engagement.likes[0]}-${e.engagement.likes[1]})`
      )
      .join("\n");

    const prompt = [
      "Generate 10 social media posts reacting to this game as JSON with this exact schema:",
      '{"posts": [{"handle": "string", "displayName": "string", "type": "fan"|"rival"|"analyst"|"insider"|"reddit", "body": "string", "likes": number, "reposts": number}]}',
      "",
      `Posts should react to ${ctx.school}'s Week ${ctx.week} result.`,
      "IMPORTANT: The type field MUST be one of exactly these 5 values: fan, rival, analyst, insider, reddit.",
      "Include a diverse mix: at least 3 fan posts, 1 rival fan (use type 'rival'), 2 analysts, 1 insider, and 2 reddit posts (funny/viral energy should go into the 'reddit' type).",
      "",
      "Here are examples of the VOICE and ENERGY to aim for (adapt to this specific game, don't copy verbatim):",
      socialExampleBlock,
      "",
      "Key style notes for each type:",
      "- fan: Emotional, ALL CAPS energy, overreactions, heart-on-sleeve. Self-deprecating after losses, euphoric after wins.",
      "- rival: Snarky, schadenfreude, 'scoreboard' energy, mocking. Reference the actual opponent.",
      "- analyst: Film references, stats, scheme observations. Measured but with a clear take. Think ESPN or 247Sports voice.",
      "- insider: 'Sources tell me...' energy. Locker room mood, coaching staff reactions, recruiting implications.",
      "- reddit: Self-deprecating humor, absurd comparisons, copypasta energy, therapy jokes, funny/viral takes.",
      "",
      "IMPORTANT:",
      "- Use the ACTUAL score, opponent name, and game events from the context below",
      `- Make handles feel real: @CFBTakesMachine, @BigGameBaker, @${ctx.school.replace(/\s/g, "")}Insider, etc.`,
      "- Vary engagement realistically: high-energy fan posts get 500-2000 likes, analyst posts get 100-500",
      "- The 'reposts' field is required (not retweets) — use a realistic number",
      "- NO HTML entities. Use plain text quotes and punctuation.",
      "",
      "Context:",
      ctx.userContext,
    ].join("\n");

    const raw = await callClaude(ctx.systemPrompt, prompt, 2000);
    const parsed = parseJSON<SocialPostsContent>(raw);

    const validTypes = new Set(["fan", "rival", "analyst", "insider", "reddit"]);

    // Normalize posts: coerce invalid types and fill missing reposts rather than failing the whole batch
    if (parsed && Array.isArray(parsed.posts) && parsed.posts.length >= 1) {
      const normalized = parsed.posts
        .filter((p) => typeof p.handle === "string" && typeof p.body === "string")
        .map((p) => ({
          handle: String(p.handle),
          displayName: typeof p.displayName === "string" ? p.displayName : String(p.handle),
          type: validTypes.has(p.type) ? p.type : "fan",
          body: String(p.body),
          likes: typeof p.likes === "number" ? p.likes : 0,
          // Accept retweets as reposts fallback
          reposts: typeof p.reposts === "number" ? p.reposts : typeof (p as Record<string, unknown>).retweets === "number" ? (p as Record<string, unknown>).retweets as number : 0,
        })) as SocialPostsContent["posts"];

      if (normalized.length >= 1) {
        return { posts: normalized };
      }
    }

    return {
      posts: [
        {
          handle: "@DynastyWireBot",
          displayName: "DynastyWire",
          type: "analyst",
          body: "Content generation encountered a formatting issue. Please try again.",
          likes: 0,
          reposts: 0,
        },
      ],
      error: true,
    };
  } catch {
    return {
      posts: [
        {
          handle: "@DynastyWireBot",
          displayName: "DynastyWire",
          type: "analyst",
          body: "Content generation failed. Please try again.",
          likes: 0,
          reposts: 0,
        },
      ],
      error: true,
    };
  }
}

export async function generateRankingsTake(
  ctx: PromptContext
): Promise<RankingsTakeContent> {
  try {
    const prompt = [
      "Write a 100-word CFP analyst take about this team's ranking movement as JSON with this exact schema:",
      '{"headline": "string", "body": "string", "movement": "string"}',
      "",
      `Analyze ${ctx.school}'s playoff and ranking picture after Week ${ctx.week}.`,
      "The movement field should be a short phrase like 'Up 3 spots', 'Holds steady at #8', 'Drops out', 'On the bubble', etc.",
      "Write in the voice of a TV studio analyst breaking down the CFP picture.",
      "",
      "Context:",
      ctx.userContext,
    ].join("\n");

    const raw = await callClaude(ctx.systemPrompt, prompt);
    const parsed = parseJSON<RankingsTakeContent>(raw);

    if (
      parsed &&
      typeof parsed.headline === "string" &&
      typeof parsed.body === "string" &&
      typeof parsed.movement === "string"
    ) {
      return parsed;
    }

    return {
      headline: `Rankings Watch: Week ${ctx.week}`,
      body: "Content generation encountered a formatting issue.",
      movement: "TBD",
      error: true,
    };
  } catch {
    return {
      headline: `Rankings Watch: Week ${ctx.week}`,
      body: "Content generation failed.",
      movement: "TBD",
      error: true,
    };
  }
}

export async function generateRecruitingNote(
  ctx: PromptContext
): Promise<RecruitingNoteContent> {
  try {
    const prompt = [
      "Write a recruiting insider update as JSON with this exact schema:",
      '{"headline": "string", "body": "string", "targets": ["string", "string", "string"]}',
      "",
      `Write about ${ctx.school}'s recruiting situation after Week ${ctx.week}.`,
      "The body should be 80-120 words in the voice of a recruiting insider.",
      "The targets array should list 2-4 recruit names or position groups being targeted.",
      "If recruit updates are mentioned in the context, reference them specifically.",
      "If no recruiting activity is noted, write about how on-field performance affects the recruiting pitch.",
      "",
      "Context:",
      ctx.userContext,
    ].join("\n");

    const raw = await callClaude(ctx.systemPrompt, prompt);
    const parsed = parseJSON<RecruitingNoteContent>(raw);

    if (
      parsed &&
      typeof parsed.headline === "string" &&
      typeof parsed.body === "string" &&
      Array.isArray(parsed.targets) &&
      parsed.targets.every((t) => typeof t === "string")
    ) {
      return parsed;
    }

    return {
      headline: `Recruiting Notebook: Week ${ctx.week}`,
      body: "Content generation encountered a formatting issue.",
      targets: [],
      error: true,
    };
  } catch {
    return {
      headline: `Recruiting Notebook: Week ${ctx.week}`,
      body: "Content generation failed.",
      targets: [],
      error: true,
    };
  }
}

export async function generatePressConference(
  ctx: PromptContext
): Promise<PressConfContent> {
  try {
    // Sample 5 random patterns from the DB as few-shot examples
    const shuffled = [...PRESS_CONFERENCE_DB].sort(() => Math.random() - 0.5);
    const examples = shuffled.slice(0, 5);
    const exampleBlock = examples
      .map(
        (e) =>
          `- [${e.tone.toUpperCase()}] "${e.question}" (category: ${e.category})`
      )
      .join("\n");

    const prompt = [
      "Generate 6 press conference questions for the post-game presser as JSON with this exact schema:",
      '{"questions": [{"reporterName": "string", "outlet": "string", "question": "string", "tone": "friendly"|"neutral"|"hostile"|"gotcha"}]}',
      "",
      `These are questions directed at ${ctx.school} head coach ${ctx.coachName} after Week ${ctx.week}.`,
      "Use fictional but realistic reporter names and local/national outlet names.",
      "Vary the tones based on the game result and season context:",
      "- After a big win: mostly friendly/neutral with 1 challenging question",
      "- After a tough loss: mostly hostile/neutral with gotcha questions about the coach's future",
      "- Mid-season: mix based on overall season trajectory",
      "Questions should reference specific game events and stats from the context.",
      "Make questions sharp, specific, and authentic — the way real CFB reporters talk.",
      "",
      "Here are examples of the TONE and STYLE to aim for (adapt them to this specific game, don't copy verbatim):",
      exampleBlock,
      "",
      "Key style notes:",
      "- Hostile questions should put the coach on the spot: job security, play calling, staff changes",
      "- Gotcha questions should set up a trap: predecessor comparisons, social media criticism, rival trash talk",
      "- Friendly questions should give the coach a chance to praise players or celebrate",
      "- Neutral questions should probe for real analysis: adjustments, game plan, injury updates",
      "- Reference the ACTUAL opponent, score, and specific game events from the context below",
      "",
      "Context:",
      ctx.userContext,
    ].join("\n");

    const raw = await callClaude(ctx.systemPrompt, prompt, 1500);
    const parsed = parseJSON<PressConfContent>(raw);

    const validTones = new Set(["friendly", "neutral", "hostile", "gotcha"]);

    if (
      parsed &&
      Array.isArray(parsed.questions) &&
      parsed.questions.length >= 1 &&
      parsed.questions.every(
        (q) =>
          typeof q.reporterName === "string" &&
          typeof q.outlet === "string" &&
          typeof q.question === "string" &&
          validTones.has(q.tone)
      )
    ) {
      return parsed;
    }

    return {
      questions: [
        {
          reporterName: "Staff Reporter",
          outlet: "DynastyWire",
          question: "Coach, can you walk us through the key moments of today's game?",
          tone: "neutral",
        },
      ],
      error: true,
    };
  } catch {
    return {
      questions: [
        {
          reporterName: "Staff Reporter",
          outlet: "DynastyWire",
          question: "Coach, can you give us your overall thoughts on today's game?",
          tone: "neutral",
        },
      ],
      error: true,
    };
  }
}

export async function generateRecruitSocialPosts(
  updates: RecruitUpdate[],
  ctx: PromptContext
): Promise<RecruitSocialPostsContent> {
  if (updates.length === 0) return { posts: [] };

  try {
    const updateLines = updates
      .map((u) => `- ${u.action.toUpperCase()}: ${u.name} (${u.stars}★ ${u.position})`)
      .join("\n");

    const prompt = [
      "Generate 1-2 social media posts FROM THE RECRUITS' PERSPECTIVES as JSON with this exact schema:",
      '{"posts": [{"handle": "string", "displayName": "string", "body": "string", "likes": number, "reposts": number, "position": "string", "stars": number, "recruitName": "string"}]}',
      "",
      "Each post should be in the recruit's authentic voice — Gen-Z energy, emoji-heavy, vague hype.",
      "Handle format: @{FirstName}{LastName}_{Position}{GradYear} (e.g. @JordanEvans_QB25)",
      "",
      "Voice guidelines by action type:",
      "- offer: Cryptic, blessed energy. 'Humbled and grateful 🙏🙏' — never names the school directly.",
      "- commit: Official announcement. Hype, emojis, ALL CAPS moments. Clear and celebratory.",
      "- decommit: Vague and mysterious. 'Need to re-evaluate everything. Trust the process 🙏'",
      "- portal_loss: 'Time for a new chapter ✈️' or silent (return empty posts array for this action).",
      "",
      "Generate exactly 1 post per recruit update. For portal_loss, skip the recruit entirely.",
      "Engagement: offer posts get 500-3000 likes, commit posts get 2000-10000 likes, decommit gets 1000-5000.",
      "Reposts should be roughly 25-40% of likes.",
      "",
      `School context: ${ctx.school}. These recruits are associated with ${ctx.school}'s program.`,
      "",
      "Recruit updates to process:",
      updateLines,
    ].join("\n");

    const raw = await callClaude(ctx.systemPrompt, prompt, 1000);
    const parsed = parseJSON<RecruitSocialPostsContent>(raw);

    if (parsed && Array.isArray(parsed.posts)) {
      const valid = parsed.posts.filter(
        (p) =>
          typeof p.handle === "string" &&
          typeof p.displayName === "string" &&
          typeof p.body === "string" &&
          typeof p.recruitName === "string"
      );
      if (valid.length >= 1) {
        return {
          posts: valid.map((p) => ({
            handle: String(p.handle),
            displayName: String(p.displayName),
            body: String(p.body),
            likes: typeof p.likes === "number" ? p.likes : 500,
            reposts: typeof p.reposts === "number" ? p.reposts : 100,
            position: typeof p.position === "string" ? p.position : "ATH",
            stars: typeof p.stars === "number" ? p.stars : 3,
            recruitName: String(p.recruitName),
          })),
        };
      }
    }

    return { posts: [], error: true };
  } catch {
    return { posts: [], error: true };
  }
}
