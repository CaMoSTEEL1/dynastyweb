export interface Recruit {
  id: string;
  dynastyId: string;
  seasonId: string;
  name: string;
  position: string;
  stars: number;
  status:
    | "offered"
    | "visited"
    | "leader"
    | "committed"
    | "decommitted"
    | "lost"
    | "flipped";
  trend: "hot" | "warm" | "stable" | "cooling" | "cold";
  backstory: string;
  storylineHistory: StorylineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface StorylineEntry {
  week: number;
  text: string;
  statusChange: string | null;
}

export type RecruitPersonality =
  | "hometown_kid"
  | "prestige_seeker"
  | "rankings_climber"
  | "program_builder"
  | "nfl_dreamer"
  | "family_first";

export const POSITIONS = [
  "QB",
  "RB",
  "WR",
  "TE",
  "OT",
  "OG",
  "C",
  "DE",
  "DT",
  "LB",
  "CB",
  "S",
  "K",
  "P",
  "ATH",
] as const;

export type Position = (typeof POSITIONS)[number];

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  offered: ["visited", "lost"],
  visited: ["leader", "lost"],
  leader: ["committed", "lost"],
  committed: ["decommitted"],
  decommitted: ["leader", "lost", "flipped"],
  lost: [],
  flipped: [],
};

export const STATUS_COLORS: Record<string, string> = {
  offered: "text-ink2 border-ink2",
  visited: "text-dw-accent2 border-dw-accent2",
  leader: "text-dw-yellow border-dw-yellow",
  committed: "text-dw-green border-dw-green",
  decommitted: "text-dw-red border-dw-red",
  lost: "text-ink3 border-ink3",
  flipped: "text-dw-red border-dw-red",
};

export const TREND_CONFIG: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  hot: { icon: "\u2191\u2191", color: "text-dw-green", label: "Hot" },
  warm: { icon: "\u2191", color: "text-dw-yellow", label: "Warm" },
  stable: { icon: "\u2014", color: "text-ink2", label: "Stable" },
  cooling: { icon: "\u2193", color: "text-dw-yellow", label: "Cooling" },
  cold: { icon: "\u2193\u2193", color: "text-dw-red", label: "Cold" },
};

function mapRowToRecruit(row: Record<string, unknown>): Recruit {
  return {
    id: row.id as string,
    dynastyId: row.dynasty_id as string,
    seasonId: row.season_id as string,
    name: row.name as string,
    position: row.position as string,
    stars: row.stars as number,
    status: row.status as Recruit["status"],
    trend: row.trend as Recruit["trend"],
    backstory: row.backstory as string,
    storylineHistory: (row.storyline_history ?? []) as StorylineEntry[],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export { mapRowToRecruit };
