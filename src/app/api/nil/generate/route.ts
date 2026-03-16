import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateNILOffers,
  generatePortalDrama,
  generateNILSocialReactions,
} from "@/lib/nil/generators";
import { buildContext } from "@/lib/ai/context-builder";
import { getSeasonState } from "@/lib/state/season-service";
import type { NILPageContent } from "@/lib/nil/types";
import type { SocialPost } from "@/lib/social/types";

interface RequestBody {
  dynastyId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { dynastyId } = body;

    if (!dynastyId) {
      return NextResponse.json(
        { error: "Missing dynastyId" },
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
      .select("id, current_week, narrative_memory, season_state")
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

    const seasonId = season.id as string;
    const currentWeek = season.current_week as number;
    const state = await getSeasonState(seasonId);
    const narrativeMemory = (season.narrative_memory as string) ?? "";

    const dummyInput = {
      week: currentWeek,
      opponent: "TBD",
      opponentRanking: null,
      homeAway: "home" as const,
      userScore: 0,
      opponentScore: 0,
      gameVibe: "close_win" as const,
      notableMoment: null,
      statLeaders: [],
      recruitUpdates: [],
      newRanking: null,
    };

    const ctx = buildContext(dummyInput, state, narrativeMemory, {
      school: dynasty.school as string,
      conference: dynasty.conference as string,
      coachName: dynasty.coach_name as string,
      prestige: dynasty.prestige as string,
    });

    const [nilResult, portalResult] = await Promise.all([
      generateNILOffers(ctx),
      generatePortalDrama(ctx),
    ]);

    const socialPosts: SocialPost[] = await generateNILSocialReactions(
      nilResult.offers,
      nilResult.drama,
      dynasty.school as string
    );

    const nilContent: NILPageContent = {
      nilOffers: nilResult.offers,
      nilDrama: nilResult.drama,
      portalEntries: portalResult.entries,
      portalDrama: portalResult.drama,
    };

    // Find latest complete submission to attach cached content
    const { data: latestSub } = await supabase
      .from("weekly_submissions")
      .select("id")
      .eq("season_id", seasonId)
      .eq("status", "complete")
      .order("week", { ascending: false })
      .limit(1)
      .single();

    if (latestSub) {
      const subId = latestSub.id as string;
      const cacheInserts = [
        {
          weekly_submission_id: subId,
          content_type: "nil_offers",
          content: nilContent,
        },
        {
          weekly_submission_id: subId,
          content_type: "nil_social",
          content: { posts: socialPosts },
        },
      ];

      const { error: cacheError } = await supabase
        .from("content_cache")
        .insert(cacheInserts);

      if (cacheError) {
        console.error("Failed to cache NIL content:", cacheError.message);
      }
    }

    return NextResponse.json({
      nilContent,
      socialPosts,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    console.error("NIL generate error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
