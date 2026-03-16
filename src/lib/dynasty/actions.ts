"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FBS_TEAMS } from "@/lib/data/fbs-teams";
import { createDefaultSeasonState } from "@/lib/state/schema";

const createDynastySchema = z.object({
  school: z.string().min(1, "School is required"),
  coachName: z.string().min(1, "Coach name is required").max(50, "Coach name too long"),
  prestige: z.enum(["blue_blood", "rising_power", "rebuild"], {
    message: "Invalid prestige selection",
  }),
  seasonYear: z.coerce
    .number()
    .int()
    .min(2020, "Year must be 2020 or later")
    .max(2050, "Year must be 2050 or earlier"),
});

export async function createDynasty(
  formData: FormData
): Promise<{ error: string } | undefined> {
  const raw = {
    school: formData.get("school"),
    coachName: formData.get("coachName"),
    prestige: formData.get("prestige"),
    seasonYear: formData.get("seasonYear"),
  };

  const parsed = createDynastySchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return { error: firstError?.message ?? "Invalid form data" };
  }

  const { school, coachName, prestige, seasonYear } = parsed.data;

  const team = FBS_TEAMS.find((t) => t.name === school);
  if (!team) {
    return { error: "Selected school is not a valid FBS team" };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be signed in to create a dynasty" };
  }

  const { data: dynasty, error: dynastyError } = await supabase
    .from("dynasties")
    .insert({
      user_id: user.id,
      school,
      conference: team.conference,
      coach_name: coachName,
      prestige,
    })
    .select("id")
    .single();

  if (dynastyError || !dynasty) {
    return { error: dynastyError?.message ?? "Failed to create dynasty" };
  }

  const defaultState = createDefaultSeasonState(1);

  const { error: seasonError } = await supabase.from("seasons").insert({
    dynasty_id: dynasty.id,
    year: seasonYear,
    current_week: 1,
    season_state: defaultState,
    narrative_memory: "",
  });

  if (seasonError) {
    // Clean up the dynasty if season creation fails
    await supabase.from("dynasties").delete().eq("id", dynasty.id);
    return { error: seasonError.message ?? "Failed to create season" };
  }

  redirect(`/${dynasty.id}/submit`);
}
