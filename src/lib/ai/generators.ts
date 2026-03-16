import Anthropic from "@anthropic-ai/sdk";
import type { PromptContext } from "./context-builder";

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
    max_tokens: 1000,
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
    const prompt = [
      "Generate 8 social media posts reacting to this game as JSON with this exact schema:",
      '{"posts": [{"handle": "string", "displayName": "string", "type": "fan"|"rival"|"analyst"|"insider"|"reddit", "body": "string", "likes": number, "reposts": number}]}',
      "",
      `Posts should react to ${ctx.school}'s Week ${ctx.week} result.`,
      "Include a mix of types: at least 2 fan posts, 1 rival fan, 2 analysts, 1 insider, and 2 reddit-style posts.",
      "Fan posts should be emotional and use casual language or all caps.",
      "Rival posts should be snarky or dismissive.",
      "Analyst posts should be measured and use stats from the context.",
      "Insider posts should hint at behind-the-scenes knowledge.",
      "Reddit posts should use reddit-style formatting and humor.",
      "Vary the likes/reposts realistically (fans: 5-200, analysts: 100-2000, insiders: 500-5000).",
      "",
      "Context:",
      ctx.userContext,
    ].join("\n");

    const raw = await callClaude(ctx.systemPrompt, prompt);
    const parsed = parseJSON<SocialPostsContent>(raw);

    const validTypes = new Set(["fan", "rival", "analyst", "insider", "reddit"]);

    if (
      parsed &&
      Array.isArray(parsed.posts) &&
      parsed.posts.length >= 1 &&
      parsed.posts.every(
        (p) =>
          typeof p.handle === "string" &&
          typeof p.displayName === "string" &&
          validTypes.has(p.type) &&
          typeof p.body === "string" &&
          typeof p.likes === "number" &&
          typeof p.reposts === "number"
      )
    ) {
      return parsed;
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
      "",
      "Context:",
      ctx.userContext,
    ].join("\n");

    const raw = await callClaude(ctx.systemPrompt, prompt);
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
