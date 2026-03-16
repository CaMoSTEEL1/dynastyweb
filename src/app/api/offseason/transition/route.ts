import { NextResponse } from "next/server";
import { transitionToNewSeason } from "@/lib/offseason/season-transition";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      dynastyId?: string;
      seasonId?: string;
    };

    const { dynastyId, seasonId } = body;

    if (!dynastyId || !seasonId) {
      return NextResponse.json(
        { error: "dynastyId and seasonId are required" },
        { status: 400 }
      );
    }

    const newSeasonId = await transitionToNewSeason(dynastyId, seasonId);

    return NextResponse.json({ success: true, newSeasonId });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to transition season";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
