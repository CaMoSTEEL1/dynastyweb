import { SeasonState, WeeklyInput, WeekResult } from "./schema";

type FanSentiment = SeasonState["fanSentiment"];
type HotSeatLevel = SeasonState["hotSeatLevel"];
type SeasonMomentum = SeasonState["seasonMomentum"];
type PlayoffProjection = SeasonState["playoffProjection"];

const SENTIMENT_LADDER: FanSentiment[] = [
  "furious",
  "restless",
  "content",
  "happy",
  "ecstatic",
];

function sentimentIndex(s: FanSentiment): number {
  return SENTIMENT_LADDER.indexOf(s);
}

function clampSentiment(idx: number): FanSentiment {
  const clamped = Math.max(0, Math.min(SENTIMENT_LADDER.length - 1, idx));
  return SENTIMENT_LADDER[clamped];
}

function inferFanSentiment(
  current: SeasonState,
  result: "W" | "L",
  margin: number,
  input: WeeklyInput,
  record: { wins: number; losses: number }
): FanSentiment {
  const currentIdx = sentimentIndex(current.fanSentiment);
  let shift = 0;

  if (result === "W") {
    // Base win boost
    shift = 1;

    // Blowout win (+1 extra)
    if (margin >= 21) {
      shift += 1;
    }

    // Beat a ranked opponent (+1 extra)
    if (input.opponentRanking !== null && input.opponentRanking <= 25) {
      shift += 1;
    }

    // Beat a top-10 opponent (+1 more on top)
    if (input.opponentRanking !== null && input.opponentRanking <= 10) {
      shift += 1;
    }
  } else {
    // Base loss drop
    shift = -1;

    // Blowout loss (-1 extra)
    if (margin >= 21) {
      shift -= 1;
    }

    // Loss when already restless or worse drops harder
    if (currentIdx <= 1) {
      shift -= 1;
    }

    // Losing record compounds frustration
    if (record.losses > record.wins) {
      shift -= 1;
    }
  }

  return clampSentiment(currentIdx + shift);
}

function inferHotSeat(
  current: SeasonState,
  record: { wins: number; losses: number },
  week: number
): HotSeatLevel {
  // Winning or even record = no hot seat
  if (record.wins >= record.losses) {
    return "none";
  }

  // 5+ losses at any point = volcanic
  if (record.losses >= 5) {
    return "volcanic";
  }

  // 3+ losses by week 8+ = hot
  if (record.losses >= 3 && week >= 8) {
    return "hot";
  }

  // Losing record by week 6+ = warm
  if (record.losses > record.wins && week >= 6) {
    return "warm";
  }

  return current.hotSeatLevel === "none" ? "none" : current.hotSeatLevel;
}

function inferMomentum(
  _current: SeasonState,
  result: "W" | "L",
  streak: { type: "W" | "L"; count: number }
): SeasonMomentum {
  if (streak.type === "W" && streak.count >= 3) {
    return "surging";
  }
  if (streak.type === "L" && streak.count >= 3) {
    return "freefall";
  }
  if (streak.type === "L" && streak.count >= 2) {
    return "sliding";
  }
  // Single win or single loss = steady
  return "steady";
}

function inferPlayoffProjection(ranking: number | null): PlayoffProjection {
  if (ranking === null || ranking > 12) {
    return "out";
  }
  if (ranking <= 4) {
    return "in";
  }
  return "bubble";
}

function extractRank(label: string): number {
  const match = label.match(/^#(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 999;
}

function extractMargin(label: string): number {
  const match = label.match(/\((\d+)-(\d+)\)/);
  if (match) {
    return Math.abs(parseInt(match[1], 10) - parseInt(match[2], 10));
  }
  return 0;
}

/**
 * Pure function to update season state based on weekly input.
 * Same input always produces the same output.
 */
export function updateSeasonState(
  current: SeasonState,
  input: WeeklyInput
): SeasonState {
  // Determine result
  const result: "W" | "L" = input.userScore > input.opponentScore ? "W" : "L";
  const isWin = result === "W";
  const margin = Math.abs(input.userScore - input.opponentScore);

  // Update record
  const record = {
    wins: current.record.wins + (isWin ? 1 : 0),
    losses: current.record.losses + (isWin ? 0 : 1),
  };

  // Conference record: weeks 1-3 are typically non-conference
  const isConferenceGame = input.week > 3;
  const conferenceRecord = isConferenceGame
    ? {
        wins: current.conferenceRecord.wins + (isWin ? 1 : 0),
        losses: current.conferenceRecord.losses + (isWin ? 0 : 1),
      }
    : current.conferenceRecord;

  // Update streak
  const streak: { type: "W" | "L"; count: number } =
    current.streak.count === 0 || current.streak.type === result
      ? { type: result, count: current.streak.count + 1 }
      : { type: result, count: 1 };

  // Longest win streak
  const longestWinStreak =
    isWin && streak.type === "W"
      ? Math.max(current.longestWinStreak, streak.count)
      : current.longestWinStreak;

  // Points
  const pointsFor = current.pointsFor + input.userScore;
  const pointsAgainst = current.pointsAgainst + input.opponentScore;

  // Ranking
  const ranking = input.newRanking;
  const previousRanking = current.ranking;

  // Fan sentiment
  const fanSentiment = inferFanSentiment(current, result, margin, input, record);

  // Hot seat
  const hotSeatLevel = inferHotSeat(current, record, input.week);

  // Momentum
  const seasonMomentum = inferMomentum(current, result, streak);

  // Playoff projection
  const playoffProjection = inferPlayoffProjection(ranking);

  // Biggest win / worst loss tracking
  const opponentLabel = input.opponentRanking
    ? `#${input.opponentRanking} ${input.opponent}`
    : input.opponent;
  const gameLabel = `${opponentLabel} (${input.userScore}-${input.opponentScore})`;

  let biggestWin = current.biggestWin;
  if (isWin && input.opponentRanking) {
    if (
      !current.biggestWin ||
      input.opponentRanking < extractRank(current.biggestWin)
    ) {
      biggestWin = gameLabel;
    }
  }

  let worstLoss = current.worstLoss;
  if (!isWin) {
    if (!current.worstLoss || margin > extractMargin(current.worstLoss)) {
      worstLoss = gameLabel;
    }
  }

  // Build week result
  const weekResult: WeekResult = {
    week: input.week,
    opponent: input.opponent,
    opponentRanking: input.opponentRanking,
    homeAway: input.homeAway,
    userScore: input.userScore,
    opponentScore: input.opponentScore,
    result,
    gameVibe: input.gameVibe,
    notableMoment: input.notableMoment,
    statLeaders: input.statLeaders,
  };

  return {
    record,
    ranking,
    previousRanking,
    streak,
    longestWinStreak,
    conferenceRecord,
    pointsFor,
    pointsAgainst,
    fanSentiment,
    hotSeatLevel,
    playoffProjection,
    seasonMomentum,
    coachYear: current.coachYear,
    biggestWin,
    worstLoss,
    weekResults: [...current.weekResults, weekResult],
  };
}
