import { createClient } from "../supabase/server";
import {
  SeasonState,
  WeeklyInput,
  createDefaultSeasonState,
} from "./schema";
import { updateSeasonState } from "./updater";

/**
 * Fetch the current season state from the seasons table.
 */
export async function getSeasonState(
  seasonId: string
): Promise<SeasonState> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seasons")
    .select("season_state")
    .eq("id", seasonId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch season state: ${error.message}`);
  }

  if (!data || !data.season_state) {
    return createDefaultSeasonState();
  }

  return data.season_state as SeasonState;
}

/**
 * Save updated season state back to the seasons table.
 */
export async function saveSeasonState(
  seasonId: string,
  state: SeasonState
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("seasons")
    .update({
      season_state: state as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq("id", seasonId);

  if (error) {
    throw new Error(`Failed to save season state: ${error.message}`);
  }
}

/**
 * Advance the season by one week:
 * 1. Fetch current state
 * 2. Apply weekly input via pure updateSeasonState
 * 3. Save new state and bump current_week
 * 4. Return the new state
 */
export async function advanceWeek(
  seasonId: string,
  input: WeeklyInput
): Promise<SeasonState> {
  const supabase = await createClient();

  // Fetch current state
  const currentState = await getSeasonState(seasonId);

  // Compute new state (pure function)
  const newState = updateSeasonState(currentState, input);

  // Save new state and advance week in a single update
  const { error } = await supabase
    .from("seasons")
    .update({
      season_state: newState as unknown as Record<string, unknown>,
      current_week: input.week + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", seasonId);

  if (error) {
    throw new Error(`Failed to advance week: ${error.message}`);
  }

  return newState;
}

/**
 * Get the current (latest) season for a dynasty.
 * Returns null if no seasons exist.
 */
export async function getCurrentSeason(
  dynastyId: string
): Promise<{
  id: string;
  year: number;
  currentWeek: number;
  state: SeasonState;
  narrativeMemory: string;
} | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seasons")
    .select("id, year, current_week, season_state, narrative_memory")
    .eq("dynasty_id", dynastyId)
    .order("year", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // PGRST116 = no rows found, which is a valid "no season" case
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`Failed to fetch current season: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id as string,
    year: data.year as number,
    currentWeek: data.current_week as number,
    state: (data.season_state as SeasonState) ?? createDefaultSeasonState(),
    narrativeMemory: (data.narrative_memory as string) ?? "",
  };
}

/**
 * Initialize a new season for a dynasty.
 * Returns the new season's ID.
 */
export async function initializeSeason(
  dynastyId: string,
  year: number,
  coachYear: number = 1
): Promise<string> {
  const supabase = await createClient();

  const defaultState = createDefaultSeasonState(coachYear);

  const { data, error } = await supabase
    .from("seasons")
    .insert({
      dynasty_id: dynastyId,
      year,
      current_week: 1,
      season_state: defaultState as unknown as Record<string, unknown>,
      narrative_memory: "",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to initialize season: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to initialize season: no data returned");
  }

  return data.id as string;
}
