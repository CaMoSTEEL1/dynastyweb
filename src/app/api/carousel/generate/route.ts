import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateStaffProfiles,
  generateCoachingRumors,
} from "@/lib/carousel/generators";
import { getSeasonState } from "@/lib/state/season-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dynastyId = body.dynastyId as string | undefined;

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
      .select("id")
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

    const seasonState = await getSeasonState(season.id as string);

    const staff = await generateStaffProfiles({
      school: dynasty.school as string,
      coachName: dynasty.coach_name as string,
      prestige: dynasty.prestige as string,
      coachYear: seasonState.coachYear,
    });

    const rumors = await generateCoachingRumors({
      school: dynasty.school as string,
      coachName: dynasty.coach_name as string,
      staff,
      seasonState,
      prestige: dynasty.prestige as string,
    });

    return NextResponse.json({ staff, rumors });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    console.error("Carousel generate error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
