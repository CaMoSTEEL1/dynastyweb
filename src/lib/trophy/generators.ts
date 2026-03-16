import Anthropic from "@anthropic-ai/sdk";
import type { SeasonArchive, DynastyRetrospective } from "./types";

const client = new Anthropic();

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
  maxTokens: number = 1500
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

export async function generateSeasonRecap(
  archive: SeasonArchive,
  dynasty: { school: string; coachName: string }
): Promise<string> {
  const systemPrompt = [
    "You are a veteran college football beat writer with decades of experience.",
    "You write in the style of a year-end newspaper column: vivid, authoritative, evocative.",
    "Your recaps capture the full arc of a season — the highs, the lows, the turning points.",
    "Write in past tense. Never use bullet points. Write flowing prose paragraphs.",
    "Return ONLY the recap text, no JSON wrapping, no headers. 200-300 words.",
  ].join(" ");

  const highlightsStr =
    archive.highlights.length > 0
      ? archive.highlights.join("; ")
      : "No standout highlights";

  const awardsStr =
    archive.awards.length > 0
      ? archive.awards.join(", ")
      : "None";

  const prompt = [
    `Write a newspaper-style year-end recap for the ${archive.year} ${dynasty.school} football season.`,
    "",
    `Coach: ${dynasty.coachName} (Year ${archive.coachYear})`,
    `Record: ${archive.record.wins}-${archive.record.losses}`,
    `Conference Record: ${archive.conferenceRecord.wins}-${archive.conferenceRecord.losses}`,
    `Final Ranking: ${archive.finalRanking !== null ? `#${archive.finalRanking}` : "Unranked"}`,
    `Longest Win Streak: ${archive.longestWinStreak} games`,
    `Fan Sentiment: ${archive.fanSentiment}`,
    `Biggest Win: ${archive.biggestWin ?? "None"}`,
    `Worst Loss: ${archive.worstLoss ?? "None"}`,
    `Highlights: ${highlightsStr}`,
    `Playoff Result: ${archive.playoffResult ?? "Did not qualify"}`,
    `Awards: ${awardsStr}`,
    "",
    "Write 200-300 words of flowing newspaper prose. Capture the narrative arc of the season.",
    "Reference specific results and moments. Make it read like a Sunday column.",
  ].join("\n");

  try {
    const raw = await callClaude(systemPrompt, prompt);
    return raw.trim() || "The season concluded without fanfare, another chapter written in the long history of the program.";
  } catch {
    return "The season concluded without fanfare, another chapter written in the long history of the program.";
  }
}

export async function generateDynastyRetrospective(
  archives: SeasonArchive[],
  dynasty: { school: string; coachName: string; prestige: string }
): Promise<DynastyRetrospective> {
  const systemPrompt = [
    "You are a prestigious sports journalist writing a long-form retrospective on a college football coaching tenure.",
    "Your style is literary, sweeping, and authoritative — think Wright Thompson or Dan Jenkins.",
    "Return valid JSON matching the exact schema provided. No markdown, no code fences.",
  ].join(" ");

  const sortedArchives = [...archives].sort((a, b) => a.year - b.year);

  const seasonsContext = sortedArchives
    .map(
      (a) =>
        `${a.year}: ${a.record.wins}-${a.record.losses}, ` +
        `Ranked ${a.finalRanking !== null ? `#${a.finalRanking}` : "Unranked"}, ` +
        `Fan Sentiment: ${a.fanSentiment}, ` +
        `Playoff: ${a.playoffResult ?? "None"}, ` +
        `Awards: ${a.awards.length > 0 ? a.awards.join(", ") : "None"}, ` +
        `Biggest Win: ${a.biggestWin ?? "None"}, ` +
        `Worst Loss: ${a.worstLoss ?? "None"}`
    )
    .join("\n");

  const prestigeLabel =
    dynasty.prestige === "blue_blood"
      ? "a blue blood powerhouse"
      : dynasty.prestige === "rising_power"
        ? "a rising power"
        : "a rebuilding program";

  const prompt = [
    `Write a multi-chapter retrospective on Coach ${dynasty.coachName}'s tenure at ${dynasty.school}, ${prestigeLabel}.`,
    "",
    "Season-by-season data:",
    seasonsContext,
    "",
    "Return JSON with this exact schema:",
    '{',
    '  "headline": "A sweeping headline for the retrospective (newspaper style)",',
    '  "body": "A 100-150 word introduction setting the scene for the entire tenure",',
    '  "chapters": [',
    '    {',
    '      "title": "Chapter title referencing the season narrative",',
    '      "body": "150-200 words covering this season as a chapter in the larger story",',
    '      "year": 2026',
    '    }',
    '  ]',
    '}',
    "",
    `Include exactly ${sortedArchives.length} chapter(s), one per season, in chronological order.`,
    "Each chapter should connect to the larger narrative arc. The tone should be literary and evocative.",
    "The headline should be memorable — the kind you'd see on a longform feature.",
  ].join("\n");

  const fallback: DynastyRetrospective = {
    headline: `The ${dynasty.coachName} Era at ${dynasty.school}`,
    body: `Coach ${dynasty.coachName} arrived at ${dynasty.school} with a vision and a plan. What followed was a tenure that would reshape the program and leave its mark on the record books.`,
    chapters: sortedArchives.map((a) => ({
      title: `Year ${a.coachYear}: The ${a.year} Season`,
      body: `The ${a.year} campaign saw ${dynasty.school} finish ${a.record.wins}-${a.record.losses}. ${a.finalRanking !== null ? `A final ranking of #${a.finalRanking} validated the season's work.` : "The team finished outside the rankings, leaving questions for the offseason."} ${a.playoffResult ? `The playoff journey ended with a ${a.playoffResult}.` : "The playoffs remained out of reach."} Fan sentiment settled at "${a.fanSentiment}" as the curtain fell on another chapter.`,
      year: a.year,
    })),
  };

  try {
    const raw = await callClaude(systemPrompt, prompt, 3000);
    const parsed = parseJSON<DynastyRetrospective>(raw);

    if (
      parsed &&
      typeof parsed.headline === "string" &&
      typeof parsed.body === "string" &&
      Array.isArray(parsed.chapters)
    ) {
      return {
        headline: parsed.headline,
        body: parsed.body,
        chapters: parsed.chapters.map((ch) => ({
          title: typeof ch.title === "string" ? ch.title : "Untitled Chapter",
          body: typeof ch.body === "string" ? ch.body : "",
          year: typeof ch.year === "number" ? ch.year : 0,
        })),
      };
    }

    return fallback;
  } catch {
    return fallback;
  }
}
