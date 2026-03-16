import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { OffseasonPhase } from "@/lib/offseason/types";
import type { OffseasonContext } from "@/lib/offseason/generators";
import type { SeasonState } from "@/lib/state/schema";
import {
  generateBowlRecap,
  generateAwards,
  generatePortalWindow,
  generateCarousel,
  generateSigningDay,
  generateSpringPreview,
} from "@/lib/offseason/generators";

const VALID_PHASES: OffseasonPhase[] = [
  "bowl_recap",
  "awards",
  "portal_window",
  "coaching_carousel",
  "signing_day",
  "spring_preview",
];

function isValidPhase(phase: string): phase is OffseasonPhase {
  return (VALID_PHASES as string[]).includes(phase);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ phase: string }> }
) {
  try {
    const { phase } = await params;

    if (!isValidPhase(phase)) {
      return NextResponse.json(
        { error: `Invalid offseason phase: ${phase}` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const dynastyId = body.dynastyId as string | undefined;
    const seasonId = body.seasonId as string | undefined;

    if (!dynastyId || !seasonId) {
      return NextResponse.json(
        { error: "Missing dynastyId or seasonId" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: dynasty, error: dynastyError } = await supabase
      .from("dynasties")
      .select("id, user_id, school, conference, coach_name, prestige")
      .eq("id", dynastyId)
      .single();

    if (dynastyError || !dynasty) {
      return NextResponse.json(
        { error: "Dynasty not found" },
        { status: 404 }
      );
    }

    if ((dynasty.user_id as string) !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: season, error: seasonError } = await supabase
      .from("seasons")
      .select("id, season_state, narrative_memory")
      .eq("id", seasonId)
      .single();

    if (seasonError || !season) {
      return NextResponse.json(
        { error: "Season not found" },
        { status: 404 }
      );
    }

    const seasonState = season.season_state as SeasonState;

    const ctx: OffseasonContext = {
      school: dynasty.school as string,
      coachName: dynasty.coach_name as string,
      conference: dynasty.conference as string,
      prestige: dynasty.prestige as string,
      seasonState: JSON.stringify(seasonState),
      narrativeMemory: (season.narrative_memory as string) ?? "",
    };

    let content: unknown;

    switch (phase) {
      case "bowl_recap":
        content = await generateBowlRecap(ctx);
        break;
      case "awards":
        content = await generateAwards(ctx);
        break;
      case "portal_window":
        content = await generatePortalWindow(ctx);
        break;
      case "coaching_carousel":
        content = await generateCarousel(ctx);
        break;
      case "signing_day": {
        const { data: recruits } = await supabase
          .from("recruits")
          .select("name, position, stars")
          .eq("dynasty_id", dynastyId)
          .eq("season_id", seasonId)
          .in("status", ["offered", "visited", "leader"]);

        const recruitList = (recruits ?? []).map((r) => ({
          name: r.name as string,
          position: r.position as string,
          stars: r.stars as number,
        }));

        content = await generateSigningDay(ctx, recruitList);
        break;
      }
      case "spring_preview":
        content = await generateSpringPreview(ctx);
        break;
    }

    const contentType = `offseason_${phase}`;

    let submissionId: string;

    const { data: existingSub } = await supabase
      .from("weekly_submissions")
      .select("id")
      .eq("season_id", seasonId)
      .eq("week", 99)
      .single();

    if (existingSub) {
      submissionId = existingSub.id as string;
    } else {
      const { data: newSub, error: subError } = await supabase
        .from("weekly_submissions")
        .insert({
          season_id: seasonId,
          week: 99,
          raw_input: { type: "offseason" },
          status: "complete",
          generated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (subError || !newSub) {
        console.error(
          "Failed to create offseason submission:",
          subError?.message
        );
        return NextResponse.json({ content }, { status: 200 });
      }

      submissionId = newSub.id as string;
    }

    const { data: existingCache } = await supabase
      .from("content_cache")
      .select("id")
      .eq("weekly_submission_id", submissionId)
      .eq("content_type", contentType)
      .single();

    if (existingCache) {
      await supabase
        .from("content_cache")
        .update({ content: content as Record<string, unknown> })
        .eq("id", existingCache.id as string);
    } else {
      await supabase.from("content_cache").insert({
        weekly_submission_id: submissionId,
        content_type: contentType,
        content: content as Record<string, unknown>,
      });
    }

    return NextResponse.json({ content }, { status: 200 });
  } catch (err) {
    console.error("Offseason generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate offseason content" },
      { status: 500 }
    );
  }
}
