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
    };

    const { recruitId, name, stars, position, school } = body;

    const anthropic = new Anthropic();
    let backstory = "";

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system:
          "You are a college football recruiting insider. Write brief, vivid backstories for high school recruits. No JSON, just plain text. 2-3 sentences max.",
        messages: [
          {
            role: "user",
            content: `Write a brief backstory for ${name}, a ${stars}-star ${position} recruit who has been offered by ${school}. Include a hint about their personality and what motivates them as a recruit. Keep it to 2-3 sentences.`,
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
