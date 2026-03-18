import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { weeklyInputSchema } from "@/lib/weekly/validation";
import { buildContext } from "@/lib/ai/context-builder";
import {
  generateRecap,
  generateBeatTakes,
  generateSocialPosts,
  generateRankingsTake,
  generateRecruitingNote,
  generatePressConference,
  generateRecruitSocialPosts,
} from "@/lib/ai/generators";
import { updateNarrativeMemory } from "@/lib/ai/narrative-updater";
import { getSeasonState } from "@/lib/state/season-service";
import type { WeeklyInput } from "@/lib/state/schema";

interface ContentResult {
  type: string;
  content: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = weeklyInputSchema.safeParse(body.input);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const validatedInput: WeeklyInput = parsed.data;
    const dynastyId = body.dynastyId as string | undefined;
    const submissionId = body.submissionId as string | undefined;

    if (!dynastyId || !submissionId) {
      return NextResponse.json(
        { error: "Missing dynastyId or submissionId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: dynasty, error: dynastyError } = await supabase
      .from("dynasties")
      .select("school, conference, coach_name, prestige")
      .eq("id", dynastyId)
      .eq("user_id", user.id)
      .single();

    if (dynastyError || !dynasty) {
      return NextResponse.json(
        { error: "Dynasty not found" },
        { status: 404 }
      );
    }

    const { data: season, error: seasonError } = await supabase
      .from("seasons")
      .select("id, narrative_memory")
      .eq("dynasty_id", dynastyId)
      .order("year", { ascending: false })
      .limit(1)
      .single();

    if (seasonError || !season) {
      return NextResponse.json(
        { error: "No active season found" },
        { status: 404 }
      );
    }

    const state = await getSeasonState(season.id as string);
    const narrativeMemory = (season.narrative_memory as string) ?? "";

    const ctx = buildContext(validatedInput, state, narrativeMemory, {
      school: dynasty.school as string,
      conference: dynasty.conference as string,
      coachName: dynasty.coach_name as string,
      prestige: dynasty.prestige as string,
    });

    await supabase
      .from("weekly_submissions")
      .update({ status: "generating" })
      .eq("id", submissionId);

    const [recap, beatTakes, socialPosts, rankingsTake, recruitingNote, pressConf] =
      await Promise.all([
        generateRecap(ctx),
        generateBeatTakes(ctx),
        generateSocialPosts(ctx),
        generateRankingsTake(ctx),
        generateRecruitingNote(ctx),
        generatePressConference(ctx),
      ]);

    const results: ContentResult[] = [
      { type: "recap", content: recap },
      { type: "beat_takes", content: beatTakes },
      { type: "social_posts", content: socialPosts },
      { type: "rankings_take", content: rankingsTake },
      { type: "recruiting_note", content: recruitingNote },
      { type: "press_conf", content: pressConf },
    ];

    const cacheInserts = results.map((r) => ({
      weekly_submission_id: submissionId,
      content_type: r.type,
      content: r.content,
    }));

    const { error: cacheError } = await supabase
      .from("content_cache")
      .insert(cacheInserts);

    if (cacheError) {
      console.error("Failed to cache content:", cacheError.message);
    }

    await supabase
      .from("weekly_submissions")
      .update({ status: "complete", generated_at: new Date().toISOString() })
      .eq("id", submissionId);

    // Fire-and-forget: generate recruit social posts if there are recruit updates
    if (validatedInput.recruitUpdates.length > 0) {
      generateRecruitSocialPosts(validatedInput.recruitUpdates, ctx)
        .then(async (result) => {
          if (result.posts.length > 0) {
            const supa = await createClient();
            await supa.from("content_cache").insert({
              weekly_submission_id: submissionId,
              content_type: "recruit_social_posts",
              content: result,
            });
          }
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : "Unknown error";
          console.error("Failed to generate recruit social posts:", msg);
        });
    }

    updateNarrativeMemory(narrativeMemory, state, ctx)
      .then(async (updatedMemory) => {
        const supa = await createClient();
        await supa
          .from("seasons")
          .update({ narrative_memory: updatedMemory })
          .eq("id", season.id as string);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Unknown error";
        console.error("Failed to update narrative memory:", msg);
      });

    return NextResponse.json({ submissionId });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    console.error("Weekly submit error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
