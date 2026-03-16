import { z } from "zod";

export const statLeaderSchema = z.object({
  name: z.string().min(1, "Name required"),
  position: z.string().min(1, "Position required"),
  stat: z.string().min(1, "Stat required"),
});

export const recruitUpdateSchema = z.object({
  action: z.enum(["offer", "commit", "decommit", "portal_loss"]),
  name: z.string().min(1, "Name required"),
  position: z.string().min(1, "Position required"),
  stars: z.number().min(1).max(5),
});

export const weeklyInputSchema = z.object({
  week: z.number().min(1).max(16),
  opponent: z.string().min(1, "Opponent required"),
  opponentRanking: z.number().min(1).max(25).nullable(),
  homeAway: z.enum(["home", "away"]),
  userScore: z.number().min(0, "Score required"),
  opponentScore: z.number().min(0, "Score required"),
  gameVibe: z.enum([
    "dominant_win",
    "close_win",
    "blowout_win",
    "close_loss",
    "dominant_loss",
    "blowout_loss",
  ]),
  notableMoment: z.string().nullable(),
  statLeaders: z.array(statLeaderSchema).max(3),
  recruitUpdates: z.array(recruitUpdateSchema).max(5),
  newRanking: z.number().min(1).max(25).nullable(),
});

export type WeeklyInputForm = z.infer<typeof weeklyInputSchema>;

/** Calculate data richness score (0-3) based on optional fields filled */
export function calculateDataRichness(input: WeeklyInputForm): number {
  let score = 0;
  if (input.notableMoment && input.notableMoment.length > 10) score++;
  if (input.statLeaders.length > 0) score++;
  if (input.recruitUpdates.length > 0) score++;
  return score;
}
