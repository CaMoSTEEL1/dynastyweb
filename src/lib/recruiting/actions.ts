"use server";

import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { mapRowToRecruit, STATUS_TRANSITIONS } from "./types";
import type { Recruit, StorylineEntry } from "./types";

const addRecruitSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(60, "Name must be 60 characters or less"),
  position: z.string().min(1, "Position is required"),
  stars: z.coerce.number().int().min(1).max(5),
});

export async function addRecruit(
  dynastyId: string,
  seasonId: string,
  formData: FormData
): Promise<{ success: boolean; recruit?: Recruit; school?: string; error?: string }> {
  try {
    const raw = {
      name: formData.get("name"),
      position: formData.get("position"),
      stars: formData.get("stars"),
    };

    const parsed = addRecruitSchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Invalid form data",
      };
    }

    const { name, position, stars } = parsed.data;

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: dynasty } = await supabase
      .from("dynasties")
      .select("school, coach_name")
      .eq("id", dynastyId)
      .single();

    if (!dynasty) {
      return { success: false, error: "Dynasty not found" };
    }

    const { data: insertedRow, error: insertError } = await supabase
      .from("recruits")
      .insert({
        dynasty_id: dynastyId,
        season_id: seasonId,
        name,
        position,
        stars,
        status: "offered",
        trend: "stable",
        backstory: "",
        storyline_history: [],
      })
      .select("*")
      .single();

    if (insertError || !insertedRow) {
      return {
        success: false,
        error: insertError?.message ?? "Failed to add recruit",
      };
    }

    const recruit = mapRowToRecruit(insertedRow as Record<string, unknown>);
    // Backstory is generated async via /api/recruits/backstory after this returns
    return { success: true, recruit, school: dynasty.school as string };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

function inferTrend(
  newStatus: string
): "hot" | "warm" | "stable" | "cooling" | "cold" {
  switch (newStatus) {
    case "committed":
      return "hot";
    case "leader":
      return "warm";
    case "visited":
      return "warm";
    case "decommitted":
      return "cold";
    case "lost":
      return "cold";
    case "flipped":
      return "cold";
    default:
      return "stable";
  }
}

export async function updateRecruitStatus(
  recruitId: string,
  newStatus: string,
  week: number
): Promise<{ success: boolean; storyline?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: recruit, error: fetchError } = await supabase
      .from("recruits")
      .select("*, dynasties!inner(school, coach_name)")
      .eq("id", recruitId)
      .single();

    if (fetchError || !recruit) {
      return { success: false, error: "Recruit not found" };
    }

    const currentStatus = recruit.status as string;
    const validTransitions = STATUS_TRANSITIONS[currentStatus] ?? [];
    if (!validTransitions.includes(newStatus)) {
      return {
        success: false,
        error: `Cannot transition from ${currentStatus} to ${newStatus}`,
      };
    }

    const dynastyData = recruit.dynasties as Record<string, unknown>;
    const school = dynastyData.school as string;
    const coachName = dynastyData.coach_name as string;

    let storylineText = "";
    const anthropic = new Anthropic();
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        system:
          "You are a college football recruiting insider writing brief narrative updates about recruit status changes. Write in a punchy, insider-report style. 2-3 sentences. No JSON, just plain text.",
        messages: [
          {
            role: "user",
            content: `Write a recruiting storyline update for ${recruit.name}, a ${recruit.stars}-star ${recruit.position} whose status just changed from "${currentStatus}" to "${newStatus}" with ${school} (Coach ${coachName}) during week ${week}. Backstory: ${recruit.backstory}`,
          },
        ],
      });

      const textBlock = response.content.find(
        (block: { type: string }) => block.type === "text"
      );
      storylineText =
        textBlock?.type === "text" ? textBlock.text.trim() : "";
    } catch {
      storylineText = `${recruit.name}'s status has changed from ${currentStatus} to ${newStatus} in week ${week}.`;
    }

    const newEntry: StorylineEntry = {
      week,
      text: storylineText,
      statusChange: `${currentStatus} → ${newStatus}`,
    };

    const existingHistory = (recruit.storyline_history ??
      []) as StorylineEntry[];
    const updatedHistory = [...existingHistory, newEntry];
    const newTrend = inferTrend(newStatus);

    const { error: updateError } = await supabase
      .from("recruits")
      .update({
        status: newStatus,
        trend: newTrend,
        storyline_history: updatedHistory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recruitId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, storyline: storylineText };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

export async function removeRecruit(
  recruitId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("recruits")
      .delete()
      .eq("id", recruitId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

export async function getRecruits(
  dynastyId: string,
  seasonId: string
): Promise<Recruit[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recruits")
    .select("*")
    .eq("dynasty_id", dynastyId)
    .eq("season_id", seasonId)
    .order("stars", { ascending: false })
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((row) => mapRowToRecruit(row as Record<string, unknown>));
}
