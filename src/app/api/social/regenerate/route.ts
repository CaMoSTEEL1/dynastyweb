import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildContext } from "@/lib/ai/context-builder";
import { generateSocialPosts } from "@/lib/ai/generators";
import { getSeasonState } from "@/lib/state/season-service";
import type { WeeklyInput } from "@/lib/state/schema";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as { submissionId: string; dynastyId: string };
    const { submissionId, dynastyId } = body;

    if (!submissionId || !dynastyId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify ownership
    const { data: dynasty } = await supabase
      .from("dynasties")
      .select("school, conference, coach_name, prestige")
      .eq("id", dynastyId)
      .eq("user_id", user.id)
      .single();

    if (!dynasty) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Fetch submission
    const { data: submission } = await supabase
      .from("weekly_submissions")
      .select("id, season_id, raw_input")
      .eq("id", submissionId)
      .single();

    if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });

    // Fetch season
    const { data: season } = await supabase
      .from("seasons")
      .select("id, narrative_memory")
      .eq("id", submission.season_id as string)
      .single();

    if (!season) return NextResponse.json({ error: "Season not found" }, { status: 404 });

    const state = await getSeasonState(season.id as string);
    const narrativeMemory = (season.narrative_memory as string) ?? "";
    const rawInput = submission.raw_input as WeeklyInput;

    const ctx = buildContext(rawInput, state, narrativeMemory, {
      school: dynasty.school as string,
      conference: dynasty.conference as string,
      coachName: dynasty.coach_name as string,
      prestige: dynasty.prestige as string,
    });

    // Delete old cached entry so we can replace it
    await supabase
      .from("content_cache")
      .delete()
      .eq("weekly_submission_id", submissionId)
      .eq("content_type", "social_posts");

    // Regenerate
    const socialPosts = await generateSocialPosts(ctx);

    // Cache new result
    await supabase.from("content_cache").insert({
      weekly_submission_id: submissionId,
      content_type: "social_posts",
      content: socialPosts,
    });

    return NextResponse.json(socialPosts);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Regeneration failed";
    console.error("[social/regenerate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
