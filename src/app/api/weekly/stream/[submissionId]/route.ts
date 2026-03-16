import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildContext } from "@/lib/ai/context-builder";
import {
  generateRecap,
  generateBeatTakes,
  generateSocialPosts,
  generateRankingsTake,
  generateRecruitingNote,
  generatePressConference,
} from "@/lib/ai/generators";
import type { SeasonState, WeeklyInput } from "@/lib/state/schema";

function sseEvent(data: {
  type: string;
  content: unknown;
  timestamp: number;
}): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const { submissionId } = await params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(type: string, content: unknown) {
        controller.enqueue(
          encoder.encode(sseEvent({ type, content, timestamp: Date.now() }))
        );
      }

      try {
        const supabase = await createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          send("error", "Not authenticated");
          controller.close();
          return;
        }

        // Fetch submission
        const { data: submission, error: subError } = await supabase
          .from("weekly_submissions")
          .select("id, raw_input, status, season_id")
          .eq("id", submissionId)
          .single();

        if (subError || !submission) {
          send("error", "Submission not found");
          controller.close();
          return;
        }

        const rawInput = submission.raw_input as WeeklyInput | null;
        if (!rawInput) {
          send("error", "No input data found");
          controller.close();
          return;
        }

        // Send score card immediately from raw input
        const scoreCard = {
          week: rawInput.week,
          opponent: rawInput.opponent,
          opponentRanking: rawInput.opponentRanking,
          homeAway: rawInput.homeAway,
          userScore: rawInput.userScore,
          opponentScore: rawInput.opponentScore,
          result: rawInput.userScore > rawInput.opponentScore ? "W" : "L",
        };
        send("score_card", scoreCard);

        // Fetch season + dynasty info for context building
        const { data: season } = await supabase
          .from("seasons")
          .select("id, year, current_week, season_state, narrative_memory, dynasty_id")
          .eq("id", submission.season_id as string)
          .single();

        if (!season) {
          send("error", "Season not found");
          send("done", null);
          controller.close();
          return;
        }

        const { data: dynasty } = await supabase
          .from("dynasties")
          .select("school, conference, coach_name, prestige")
          .eq("id", season.dynasty_id as string)
          .single();

        if (!dynasty) {
          send("error", "Dynasty not found");
          send("done", null);
          controller.close();
          return;
        }

        const seasonState = (season.season_state as SeasonState) ?? {
          record: { wins: 0, losses: 0 },
          ranking: null,
          previousRanking: null,
          streak: { type: "W", count: 0 },
          longestWinStreak: 0,
          conferenceRecord: { wins: 0, losses: 0 },
          pointsFor: 0,
          pointsAgainst: 0,
          fanSentiment: "content",
          hotSeatLevel: "none",
          playoffProjection: "out",
          seasonMomentum: "steady",
          coachYear: 1,
          biggestWin: null,
          worstLoss: null,
          weekResults: [],
        };

        const ctx = buildContext(rawInput, seasonState, (season.narrative_memory as string) ?? "", {
          school: dynasty.school as string,
          conference: dynasty.conference as string,
          coachName: dynasty.coach_name as string,
          prestige: dynasty.prestige as string,
        });

        // Mark submission as generating
        await supabase
          .from("weekly_submissions")
          .update({ status: "generating" })
          .eq("id", submissionId);

        // Generate and stream content in sequence, caching as we go
        const contentTypes = [
          { type: "recap", generate: () => generateRecap(ctx) },
          { type: "beat_takes", generate: () => generateBeatTakes(ctx) },
          { type: "social_posts", generate: () => generateSocialPosts(ctx) },
          { type: "rankings_take", generate: () => generateRankingsTake(ctx) },
          { type: "recruiting_note", generate: () => generateRecruitingNote(ctx) },
          { type: "press_conf", generate: () => generatePressConference(ctx) },
        ] as const;

        for (const { type, generate } of contentTypes) {
          try {
            const content = await generate();
            send(type, content);

            // Cache for future loads
            await supabase.from("content_cache").insert({
              weekly_submission_id: submissionId,
              content_type: type,
              content: content as unknown as Record<string, unknown>,
            });
          } catch {
            send(type, { error: true, message: `Failed to generate ${type}` });
          }
        }

        // Mark submission as complete
        await supabase
          .from("weekly_submissions")
          .update({ status: "complete", generated_at: new Date().toISOString() })
          .eq("id", submissionId);

        send("done", null);
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream error";
        try {
          controller.enqueue(
            encoder.encode(
              sseEvent({ type: "error", content: message, timestamp: Date.now() })
            )
          );
        } catch {
          // Controller may already be closed
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
