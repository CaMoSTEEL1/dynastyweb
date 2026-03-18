import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as {
      body: string;
      dynastyId: string;
      seasonId: string;
      week: number;
    };

    const { body: postBody, dynastyId, seasonId, week } = body;

    if (!postBody || typeof postBody !== "string" || postBody.trim().length === 0) {
      return NextResponse.json({ error: "Post body is required" }, { status: 400 });
    }
    if (postBody.trim().length > 280) {
      return NextResponse.json({ error: "Post body exceeds 280 characters" }, { status: 400 });
    }
    if (!dynastyId || !seasonId || typeof week !== "number") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify user owns this dynasty
    const { data: dynasty } = await supabase
      .from("dynasties")
      .select("id")
      .eq("id", dynastyId)
      .eq("user_id", user.id)
      .single();

    if (!dynasty) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    // Scale engagement by a simple random formula
    const likes = Math.floor(Math.random() * 1800) + 200;
    const reposts = Math.floor(Math.random() * 550) + 50;

    const { data: inserted, error: insertError } = await supabase
      .from("coach_posts")
      .insert({
        dynasty_id: dynastyId,
        season_id: seasonId,
        week,
        body: postBody.trim(),
        likes,
        reposts,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[coach-post] Insert error:", insertError.message);
      return NextResponse.json({ error: "Failed to save post" }, { status: 500 });
    }

    return NextResponse.json(inserted);
  } catch (err) {
    console.error("[coach-post] Error:", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
