import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { initializeSeason } from "@/lib/state/season-service";
import type { SeasonState } from "@/lib/state/schema";

const client = new Anthropic();

async function compressNarrativeMemory(
  narrativeMemory: string,
  seasonState: SeasonState,
  school: string,
  coachName: string
): Promise<string> {
  if (!narrativeMemory && seasonState.weekResults.length === 0) {
    return "";
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system:
        "You compress college football season narratives into concise summaries. Output only the compressed summary text, no JSON wrapping.",
      messages: [
        {
          role: "user",
          content: [
            "Compress the following season narrative into ~100 words of key facts.",
            "Focus on: final record, biggest wins/losses, key moments, coaching developments, recruiting highlights, and fan sentiment trajectory.",
            `School: ${school}, Coach: ${coachName}`,
            `Record: ${seasonState.record.wins}-${seasonState.record.losses}`,
            `Fan sentiment: ${seasonState.fanSentiment}`,
            `Hot seat: ${seasonState.hotSeatLevel}`,
            seasonState.biggestWin
              ? `Biggest win: ${seasonState.biggestWin}`
              : "",
            seasonState.worstLoss
              ? `Worst loss: ${seasonState.worstLoss}`
              : "",
            "",
            "Full narrative memory:",
            narrativeMemory || "(No narrative accumulated)",
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock ? textBlock.text.trim() : narrativeMemory.slice(0, 500);
  } catch {
    const fallback = [
      `Season ${seasonState.record.wins}-${seasonState.record.losses}.`,
      seasonState.biggestWin
        ? `Biggest win: ${seasonState.biggestWin}.`
        : "",
      seasonState.worstLoss
        ? `Worst loss: ${seasonState.worstLoss}.`
        : "",
      `Fan sentiment: ${seasonState.fanSentiment}.`,
      `Hot seat: ${seasonState.hotSeatLevel}.`,
    ]
      .filter(Boolean)
      .join(" ");
    return fallback;
  }
}

export async function transitionToNewSeason(
  dynastyId: string,
  currentSeasonId: string
): Promise<string> {
  const supabase = await createClient();

  const { data: currentSeason, error: seasonError } = await supabase
    .from("seasons")
    .select("id, year, current_week, season_state, narrative_memory")
    .eq("id", currentSeasonId)
    .single();

  if (seasonError || !currentSeason) {
    throw new Error(
      `Failed to fetch current season: ${seasonError?.message ?? "Not found"}`
    );
  }

  const { data: dynasty, error: dynastyError } = await supabase
    .from("dynasties")
    .select("id, school, coach_name, conference, prestige")
    .eq("id", dynastyId)
    .single();

  if (dynastyError || !dynasty) {
    throw new Error(
      `Failed to fetch dynasty: ${dynastyError?.message ?? "Not found"}`
    );
  }

  const seasonState = currentSeason.season_state as SeasonState;

  const { error: archiveError } = await supabase
    .from("seasons")
    .update({
      current_week: -1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", currentSeasonId);

  if (archiveError) {
    throw new Error(`Failed to archive season: ${archiveError.message}`);
  }

  const newCoachYear = (seasonState.coachYear ?? 1) + 1;

  const compressedMemory = await compressNarrativeMemory(
    (currentSeason.narrative_memory as string) ?? "",
    seasonState,
    dynasty.school as string,
    dynasty.coach_name as string
  );

  const newYear = (currentSeason.year as number) + 1;
  const newSeasonId = await initializeSeason(dynastyId, newYear, newCoachYear);

  if (compressedMemory) {
    const { error: memoryError } = await supabase
      .from("seasons")
      .update({
        narrative_memory: compressedMemory,
      })
      .eq("id", newSeasonId);

    if (memoryError) {
      console.error(
        "Failed to set narrative memory on new season:",
        memoryError.message
      );
    }
  }

  return newSeasonId;
}
