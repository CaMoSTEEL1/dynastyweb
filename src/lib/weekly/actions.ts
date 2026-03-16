"use server";

import { createClient } from "@/lib/supabase/server";
import { weeklyInputSchema, type WeeklyInputForm } from "./validation";
import { advanceWeek } from "@/lib/state/season-service";
import type { SeasonState } from "@/lib/state/schema";

interface SubmitSuccess {
  success: true;
  submissionId: string;
  newState: SeasonState;
}

interface SubmitFailure {
  success: false;
  error: string;
}

type SubmitResult = SubmitSuccess | SubmitFailure;

export async function submitWeeklyData(
  dynastyId: string,
  formData: WeeklyInputForm
): Promise<SubmitResult> {
  try {
    const parsed = weeklyInputSchema.safeParse(formData);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return {
        success: false,
        error: firstError?.message ?? "Invalid form data",
      };
    }

    const validatedInput = parsed.data;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the current (active) season for the dynasty
    const { data: season, error: seasonError } = await supabase
      .from("seasons")
      .select("id, dynasty_id, year, current_week, season_state")
      .eq("dynasty_id", dynastyId)
      .neq("current_week", -1)
      .order("year", { ascending: false })
      .limit(1)
      .single();

    if (seasonError || !season) {
      return { success: false, error: "No active season found" };
    }

    // Cost guard: max 20 submissions per season
    const { count, error: countError } = await supabase
      .from("weekly_submissions")
      .select("id", { count: "exact", head: true })
      .eq("season_id", season.id);

    if (countError) {
      return { success: false, error: "Failed to check submission count" };
    }

    if ((count ?? 0) >= 20) {
      return {
        success: false,
        error: "Maximum 20 submissions per season reached",
      };
    }

    // Insert the weekly submission
    const { data: submission, error: insertError } = await supabase
      .from("weekly_submissions")
      .insert({
        season_id: season.id,
        week: validatedInput.week,
        raw_input: validatedInput,
        status: "submitted",
      })
      .select("id")
      .single();

    if (insertError || !submission) {
      return {
        success: false,
        error: insertError?.message ?? "Failed to save submission",
      };
    }

    // Advance the season state
    const newState = await advanceWeek(season.id, validatedInput);

    return {
      success: true,
      submissionId: submission.id as string,
      newState,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}
