import { SeasonState, WeeklyInput } from "./schema";

interface DynastyContext {
  school: string;
  conference: string;
  coachName: string;
  prestige: string;
}

function formatRanking(r: number | null): string {
  return r !== null ? `#${r}` : "NR";
}

function formatRecord(rec: { wins: number; losses: number }): string {
  return `${rec.wins}-${rec.losses}`;
}

function formatPrestige(prestige: string): string {
  switch (prestige) {
    case "blue_blood":
      return "Blue Blood";
    case "rising_power":
      return "Rising Power";
    case "rebuild":
      return "Rebuild";
    default:
      return prestige;
  }
}

function formatRankingMovement(
  current: number | null,
  previous: number | null
): string {
  if (current === null && previous === null) return "Unranked";
  if (current === null && previous !== null)
    return `Dropped out (was #${previous})`;
  if (current !== null && previous === null)
    return `NEW at #${current}`;
  if (current !== null && previous !== null) {
    const diff = previous - current;
    if (diff > 0) return `#${current} (+${diff})`;
    if (diff < 0) return `#${current} (${diff})`;
    return `#${current} (=)`;
  }
  return "Unranked";
}

function summarizeRecentResults(state: SeasonState, count: number): string {
  const recent = state.weekResults.slice(-count);
  if (recent.length === 0) return "No games played yet";

  return recent
    .map((r) => {
      const oppLabel = r.opponentRanking
        ? `#${r.opponentRanking} ${r.opponent}`
        : r.opponent;
      const loc = r.homeAway === "home" ? "vs" : "@";
      return `W${r.week}: ${r.result} ${loc} ${oppLabel} ${r.userScore}-${r.opponentScore}`;
    })
    .join(" | ");
}

function formatGameVibe(vibe: string): string {
  switch (vibe) {
    case "dominant_win":
      return "Dominant Win";
    case "close_win":
      return "Close Win";
    case "blowout_win":
      return "Blowout Win";
    case "close_loss":
      return "Close Loss";
    case "dominant_loss":
      return "Dominant Loss";
    case "blowout_loss":
      return "Blowout Loss";
    default:
      return vibe;
  }
}

/**
 * Serialize season state and weekly input into a compact prompt context.
 * Targets under ~1,200 tokens for efficient AI consumption.
 */
export function serializeForPrompt(
  state: SeasonState,
  input: WeeklyInput,
  dynasty: DynastyContext
): string {
  const result: "W" | "L" =
    input.userScore > input.opponentScore ? "W" : "L";
  const margin = Math.abs(input.userScore - input.opponentScore);
  const oppLabel = input.opponentRanking
    ? `#${input.opponentRanking} ${input.opponent}`
    : input.opponent;
  const location = input.homeAway === "home" ? "vs" : "@";

  const lines: string[] = [];

  // Dynasty identity block
  lines.push(
    `=== ${dynasty.school} (${dynasty.conference}) ===`
  );
  lines.push(
    `Coach: ${dynasty.coachName} | Year ${state.coachYear} | ${formatPrestige(dynasty.prestige)}`
  );

  // Season snapshot
  lines.push(
    `Record: ${formatRecord(state.record)} | Conf: ${formatRecord(state.conferenceRecord)} | Ranking: ${formatRankingMovement(state.ranking, state.previousRanking)}`
  );
  lines.push(
    `PF/PA: ${state.pointsFor}-${state.pointsAgainst} (${(state.pointsFor / Math.max(1, state.record.wins + state.record.losses)).toFixed(1)} ppg / ${(state.pointsAgainst / Math.max(1, state.record.wins + state.record.losses)).toFixed(1)} opp ppg)`
  );
  lines.push(
    `Streak: ${state.streak.count > 0 ? `${state.streak.count}${state.streak.type}` : "none"} | Best W-Streak: ${state.longestWinStreak}`
  );

  // Narrative state
  lines.push(
    `Sentiment: ${state.fanSentiment} | Hot Seat: ${state.hotSeatLevel} | Momentum: ${state.seasonMomentum} | Playoff: ${state.playoffProjection}`
  );

  // Notable records
  if (state.biggestWin) {
    lines.push(`Biggest Win: ${state.biggestWin}`);
  }
  if (state.worstLoss) {
    lines.push(`Worst Loss: ${state.worstLoss}`);
  }

  // Recent results (last 3)
  lines.push(`Recent: ${summarizeRecentResults(state, 3)}`);

  // Current week details
  lines.push("");
  lines.push(`--- Week ${input.week} Result ---`);
  lines.push(
    `${result} ${location} ${oppLabel} | ${input.userScore}-${input.opponentScore} (margin: ${margin})`
  );
  lines.push(`Vibe: ${formatGameVibe(input.gameVibe)}`);

  if (input.notableMoment) {
    lines.push(`Notable: ${input.notableMoment}`);
  }

  // Stat leaders
  if (input.statLeaders.length > 0) {
    const leaders = input.statLeaders
      .map((s) => `${s.name} (${s.position}): ${s.stat}`)
      .join(", ");
    lines.push(`Leaders: ${leaders}`);
  }

  // Recruit updates
  if (input.recruitUpdates.length > 0) {
    const recruits = input.recruitUpdates
      .map(
        (r) =>
          `${r.action.toUpperCase()}: ${r.name} (${r.stars}* ${r.position})`
      )
      .join(", ");
    lines.push(`Recruiting: ${recruits}`);
  }

  // New ranking
  lines.push(
    `New Ranking: ${formatRanking(input.newRanking)}`
  );

  return lines.join("\n");
}
