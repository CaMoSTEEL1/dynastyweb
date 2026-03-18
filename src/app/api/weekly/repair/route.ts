import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateSeasonState } from "@/lib/state/updater";
import type { SeasonState, WeeklyInput } from "@/lib/state/schema";

// Repairs a season where current_week was not incremented due to a dropped
// stream connection. Safe to call multiple times — only updates if behind.
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as { dynastyId: string };
    const { dynastyId } = body;

    if (!dynastyId) return NextResponse.json({ error: "Missing dynastyId" }, { status: 400 });

    // Verify ownership
    const { data: dynasty } = await supabase
      .from("dynasties")
      .select("id")
      .eq("id", dynastyId)
      .eq("user_id", user.id)
      .single();

    if (!dynasty) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Get current season
    const { data: season } = await supabase
      .from("seasons")
      .select("id, current_week, season_state")
      .eq("dynasty_id", dynastyId)
      .order("year", { ascending: false })
      .limit(1)
      .single();

    if (!season) return NextResponse.json({ error: "No season found" }, { status: 404 });

    // Get latest complete submission
    const { data: submission } = await supabase
      .from("weekly_submissions")
      .select("id, week, raw_input")
      .eq("season_id", season.id as string)
      .eq("status", "complete")
      .order("week", { ascending: false })
      .limit(1)
      .single();

    if (!submission) return NextResponse.json({ repaired: false, reason: "No complete submission" });

    const submissionWeek = submission.week as number;
    const currentWeek = season.current_week as number;

    // Only repair if current_week is behind the latest submission
    if (currentWeek > submissionWeek) {
      return NextResponse.json({ repaired: false, reason: "Season state already up to date" });
    }

    const rawInput = submission.raw_input as WeeklyInput;
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

    const updatedState = updateSeasonState(seasonState, rawInput);

    await supabase
      .from("seasons")
      .update({
        season_state: updatedState as unknown as Record<string, unknown>,
        current_week: submissionWeek + 1,
      })
      .eq("id", season.id as string);

    return NextResponse.json({
      repaired: true,
      oldWeek: currentWeek,
      newWeek: submissionWeek + 1,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Repair failed";
    console.error("[weekly/repair]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
