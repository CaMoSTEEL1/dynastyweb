import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as {
      recruitId: string;
      name: string;
      stars: number;
      position: string;
      school: string;
      dynastyId: string;
      seasonId: string;
    };

    const { recruitId, name, stars, position, school, dynastyId, seasonId } = body;

    // Fetch existing backstories so Claude creates something distinct
    const { data: existingRecruits } = await supabase
      .from("recruits")
      .select("backstory")
      .eq("dynasty_id", dynastyId)
      .eq("season_id", seasonId)
      .neq("id", recruitId)
      .neq("backstory", "");

    const existingBackstories = (existingRecruits ?? [])
      .map((r: { backstory: string }) => r.backstory)
      .filter(Boolean);

    const avoidClause =
      existingBackstories.length > 0
        ? `\n\nOther recruits on this board already have these backstories — do NOT repeat their hometowns, personality types, family situations, or core motivations:\n${existingBackstories.map((b, i) => `${i + 1}. ${b}`).join("\n")}`
        : "";

    const anthropic = new Anthropic();
    let backstory = "";

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 220,
        system:
          "You are a college football recruiting insider. Write brief, vivid backstories for high school recruits. Every backstory must be completely unique — distinct hometown, background, personality, and motivation. Vary widely: small-town sleeper, big-city kid, military family, academic standout, underdog story, blue-chip primetime player, etc. No JSON, just plain text. 2-3 sentences max.",
        messages: [
          {
            role: "user",
            content: `Write a unique backstory for ${name}, a ${stars}-star ${position} recruit who has been offered by ${school}. Include a specific, concrete detail about their background or what drives them as a recruit. 2-3 sentences.${avoidClause}`,
          },
        ],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      backstory = textBlock?.type === "text" ? textBlock.text.trim() : "";
    } catch {
      backstory = `${name} is a ${stars}-star ${position} prospect with an offer from ${school}. The recruiting trail awaits.`;
    }

    if (!backstory) {
      backstory = `${name} is a ${stars}-star ${position} prospect with an offer from ${school}. The recruiting trail awaits.`;
    }

    await supabase
      .from("recruits")
      .update({ backstory, updated_at: new Date().toISOString() })
      .eq("id", recruitId);

    return NextResponse.json({ backstory });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate backstory";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
