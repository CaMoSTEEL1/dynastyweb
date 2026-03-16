export interface StatLeader {
  name: string;
  position: string;
  stat: string;
}

export interface WeekResult {
  week: number;
  opponent: string;
  opponentRanking: number | null;
  homeAway: "home" | "away";
  userScore: number;
  opponentScore: number;
  result: "W" | "L";
  gameVibe: string;
  notableMoment: string | null;
  statLeaders: StatLeader[];
}

export interface RecruitUpdate {
  action: "offer" | "commit" | "decommit" | "portal_loss";
  name: string;
  position: string;
  stars: number;
}

export interface WeeklyInput {
  week: number;
  opponent: string;
  opponentRanking: number | null;
  homeAway: "home" | "away";
  userScore: number;
  opponentScore: number;
  gameVibe:
    | "dominant_win"
    | "close_win"
    | "blowout_win"
    | "close_loss"
    | "dominant_loss"
    | "blowout_loss";
  notableMoment: string | null;
  statLeaders: StatLeader[];
  recruitUpdates: RecruitUpdate[];
  newRanking: number | null;
}

export interface SeasonState {
  record: { wins: number; losses: number };
  ranking: number | null;
  previousRanking: number | null;
  streak: { type: "W" | "L"; count: number };
  longestWinStreak: number;
  conferenceRecord: { wins: number; losses: number };
  pointsFor: number;
  pointsAgainst: number;
  fanSentiment: "ecstatic" | "happy" | "content" | "restless" | "furious";
  hotSeatLevel: "none" | "warm" | "hot" | "volcanic";
  playoffProjection: "in" | "bubble" | "out";
  seasonMomentum: "surging" | "steady" | "sliding" | "freefall";
  coachYear: number;
  biggestWin: string | null;
  worstLoss: string | null;
  weekResults: WeekResult[];
}

export function createDefaultSeasonState(coachYear: number = 1): SeasonState {
  return {
    record: { wins: 0, losses: 0 },
    ranking: null,
    previousRanking: null,
    streak: { type: "W", count: 0 },
    longestWinStreak: 0,
    conferenceRecord: { wins: 0, losses: 0 },
    pointsFor: 0,
    pointsAgainst: 0,
    fanSentiment: "content",
    hotSeatLevel: "none",
    playoffProjection: "out",
    seasonMomentum: "steady",
    coachYear,
    biggestWin: null,
    worstLoss: null,
    weekResults: [],
  };
}
