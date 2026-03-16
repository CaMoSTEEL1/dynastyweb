import type { SeasonState } from "@/lib/state/schema";
import type { SeasonArchive, LegacyScore, AllTimeRecords } from "./types";

function assignGrade(score: number): string {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  if (score >= 45) return "C";
  if (score >= 30) return "D";
  return "F";
}

function buildNarrative(
  grade: string,
  totalSeasons: number,
  totalWins: number,
  championships: number,
  playoffAppearances: number
): string {
  if (grade === "S") {
    return `An all-time dynasty. Over ${totalSeasons} season${totalSeasons !== 1 ? "s" : ""}, this program amassed ${totalWins} wins, ${championships} championship${championships !== 1 ? "s" : ""}, and ${playoffAppearances} playoff appearance${playoffAppearances !== 1 ? "s" : ""}. The kind of run that gets immortalized in bronze.`;
  }
  if (grade === "A") {
    return `A powerhouse tenure. ${totalWins} wins across ${totalSeasons} season${totalSeasons !== 1 ? "s" : ""} with ${playoffAppearances} playoff appearance${playoffAppearances !== 1 ? "s" : ""}. This program was feared on Saturdays and respected in the boardroom.`;
  }
  if (grade === "B") {
    return `A strong era. ${totalWins} wins over ${totalSeasons} season${totalSeasons !== 1 ? "s" : ""} and consistent competitiveness. Not quite a dynasty, but a program any coach would be proud to claim.`;
  }
  if (grade === "C") {
    return `A middling run. ${totalWins} wins across ${totalSeasons} season${totalSeasons !== 1 ? "s" : ""}. Moments of brilliance mixed with stretches of mediocrity. The foundation is there, but the ceiling was never reached.`;
  }
  if (grade === "D") {
    return `A struggle. ${totalWins} wins over ${totalSeasons} season${totalSeasons !== 1 ? "s" : ""}. Fans grew restless, boosters grew impatient, and the trophy case gathered dust. Rebuild mode was never far away.`;
  }
  return `A tenure best forgotten. ${totalWins} wins in ${totalSeasons} season${totalSeasons !== 1 ? "s" : ""}. The hot seat was always warm, and the results never came. Sometimes the game just doesn't cooperate.`;
}

export function calculateLegacyScore(
  archives: SeasonArchive[],
  prestige: string
): LegacyScore {
  if (archives.length === 0) {
    return {
      total: 0,
      breakdown: { wins: 0, championships: 0, recruiting: 0, prestige: 0, playoffs: 0 },
      grade: "F",
      narrative: buildNarrative("F", 0, 0, 0, 0),
    };
  }

  const totalSeasons = archives.length;
  const totalWins = archives.reduce((sum, a) => sum + a.record.wins, 0);
  const totalLosses = archives.reduce((sum, a) => sum + a.record.losses, 0);
  const totalGames = totalWins + totalLosses;

  // Wins component (0-30): based on win percentage
  const winPct = totalGames > 0 ? totalWins / totalGames : 0;
  const winsScore = Math.round(winPct * 30);

  // Championships component (0-25): national championships + conference championships
  const nationalChampionships = archives.filter(
    (a) => a.playoffResult === "National Champion"
  ).length;
  const conferenceChampionships = archives.filter((a) =>
    a.awards.some((award) => award.toLowerCase().includes("conference champion"))
  ).length;
  const champScore = Math.min(
    25,
    nationalChampionships * 12 + conferenceChampionships * 5
  );

  // Recruiting component (0-15): based on awards mentioning recruiting
  const recruitingAwards = archives.reduce(
    (sum, a) =>
      sum +
      a.awards.filter((award) =>
        award.toLowerCase().includes("recruit")
      ).length,
    0
  );
  const recruitScore = Math.min(15, Math.round((recruitingAwards / totalSeasons) * 15));

  // Prestige component (0-15): base prestige + top rankings
  let prestigeBase = 0;
  if (prestige === "blue_blood") prestigeBase = 5;
  else if (prestige === "rising_power") prestigeBase = 8;
  else prestigeBase = 12; // rebuild gets more credit for same results

  const topFiveFinishes = archives.filter(
    (a) => a.finalRanking !== null && a.finalRanking <= 5
  ).length;
  const prestigeScore = Math.min(
    15,
    prestigeBase + topFiveFinishes * 2
  );

  // Playoffs component (0-15): playoff appearances and results
  const playoffAppearances = archives.filter(
    (a) => a.playoffResult !== null
  ).length;
  const playoffWins = archives.filter(
    (a) =>
      a.playoffResult === "National Champion" ||
      a.playoffResult === "Semifinal Win" ||
      a.playoffResult === "Quarterfinal Win"
  ).length;
  const playoffsScore = Math.min(
    15,
    playoffAppearances * 3 + playoffWins * 4
  );

  const total = Math.min(
    100,
    winsScore + champScore + recruitScore + prestigeScore + playoffsScore
  );
  const grade = assignGrade(total);

  return {
    total,
    breakdown: {
      wins: winsScore,
      championships: champScore,
      recruiting: recruitScore,
      prestige: prestigeScore,
      playoffs: playoffsScore,
    },
    grade,
    narrative: buildNarrative(
      grade,
      totalSeasons,
      totalWins,
      nationalChampionships,
      playoffAppearances
    ),
  };
}

export function calculateAllTimeRecords(
  archives: SeasonArchive[]
): AllTimeRecords {
  if (archives.length === 0) {
    return {
      bestSeason: null,
      longestWinStreak: null,
      biggestUpset: null,
      totalWins: 0,
      totalLosses: 0,
      conferenceChampionships: 0,
      playoffAppearances: 0,
      nationalChampionships: 0,
    };
  }

  const totalWins = archives.reduce((sum, a) => sum + a.record.wins, 0);
  const totalLosses = archives.reduce((sum, a) => sum + a.record.losses, 0);

  // Best season by win percentage, then total wins as tiebreaker
  let bestSeason: { year: number; record: string } | null = null;
  let bestWinPct = -1;
  let bestWinCount = -1;
  for (const a of archives) {
    const games = a.record.wins + a.record.losses;
    const pct = games > 0 ? a.record.wins / games : 0;
    if (pct > bestWinPct || (pct === bestWinPct && a.record.wins > bestWinCount)) {
      bestWinPct = pct;
      bestWinCount = a.record.wins;
      bestSeason = { year: a.year, record: `${a.record.wins}-${a.record.losses}` };
    }
  }

  // Longest win streak across all seasons
  let longestWinStreak: { count: number; year: number } | null = null;
  let maxStreak = 0;
  for (const a of archives) {
    if (a.longestWinStreak > maxStreak) {
      maxStreak = a.longestWinStreak;
      longestWinStreak = { count: a.longestWinStreak, year: a.year };
    }
  }

  // Biggest upset: pick the first non-null biggest win
  let biggestUpset: string | null = null;
  for (const a of archives) {
    if (a.biggestWin) {
      biggestUpset = `${a.biggestWin} (${a.year})`;
      break;
    }
  }

  const conferenceChampionships = archives.filter((a) =>
    a.awards.some((award) => award.toLowerCase().includes("conference champion"))
  ).length;

  const playoffAppearances = archives.filter(
    (a) => a.playoffResult !== null
  ).length;

  const nationalChampionships = archives.filter(
    (a) => a.playoffResult === "National Champion"
  ).length;

  return {
    bestSeason,
    longestWinStreak,
    biggestUpset,
    totalWins,
    totalLosses,
    conferenceChampionships,
    playoffAppearances,
    nationalChampionships,
  };
}

export function archiveSeason(
  state: SeasonState,
  year: number,
  coachYear: number
): SeasonArchive {
  const highlights: string[] = [];

  // Generate highlights from week results
  for (const week of state.weekResults) {
    if (week.result === "W" && week.opponentRanking !== null && week.opponentRanking <= 10) {
      highlights.push(
        `Upset of #${week.opponentRanking} ${week.opponent} (${week.userScore}-${week.opponentScore})`
      );
    } else if (week.notableMoment) {
      highlights.push(week.notableMoment);
    }
  }

  // Determine awards based on season performance
  const awards: string[] = [];
  const winPct =
    state.record.wins + state.record.losses > 0
      ? state.record.wins / (state.record.wins + state.record.losses)
      : 0;

  if (state.record.losses === 0 && state.record.wins > 0) {
    awards.push("Undefeated Season");
  }
  if (winPct >= 0.75 && state.record.wins >= 9) {
    awards.push("Elite Season");
  }
  if (state.conferenceRecord.wins >= 8) {
    awards.push("Conference Champion");
  }
  if (state.playoffProjection === "in") {
    awards.push("Playoff Contender");
  }
  if (state.longestWinStreak >= 8) {
    awards.push("Dominant Streak");
  }

  // Determine playoff result
  let playoffResult: string | null = null;
  if (state.playoffProjection === "in" && state.ranking !== null && state.ranking <= 12) {
    if (state.ranking <= 4 && state.record.losses === 0) {
      playoffResult = "National Champion";
    } else if (state.ranking <= 4) {
      playoffResult = "Semifinal Appearance";
    } else {
      playoffResult = "Quarterfinal Appearance";
    }
  }

  // Determine fan sentiment label
  const sentimentLabels: Record<string, string> = {
    ecstatic: "Ecstatic",
    happy: "Happy",
    content: "Content",
    restless: "Restless",
    furious: "Furious",
  };

  return {
    seasonId: "", // Will be set by the caller with the actual season ID
    year,
    record: { ...state.record },
    conferenceRecord: { ...state.conferenceRecord },
    finalRanking: state.ranking,
    coachYear,
    highlights: highlights.slice(0, 5),
    biggestWin: state.biggestWin,
    worstLoss: state.worstLoss,
    longestWinStreak: state.longestWinStreak,
    fanSentiment: sentimentLabels[state.fanSentiment] ?? state.fanSentiment,
    playoffResult,
    awards,
    recap: "", // Recap is generated separately via AI
  };
}
