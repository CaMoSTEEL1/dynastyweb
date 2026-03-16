export interface SeasonArchive {
  seasonId: string;
  year: number;
  record: { wins: number; losses: number };
  conferenceRecord: { wins: number; losses: number };
  finalRanking: number | null;
  coachYear: number;
  highlights: string[];
  biggestWin: string | null;
  worstLoss: string | null;
  longestWinStreak: number;
  fanSentiment: string;
  playoffResult: string | null;
  awards: string[];
  recap: string;
}

export interface LegacyScore {
  total: number;
  breakdown: {
    wins: number;
    championships: number;
    recruiting: number;
    prestige: number;
    playoffs: number;
  };
  grade: string;
  narrative: string;
}

export interface AllTimeRecords {
  bestSeason: { year: number; record: string } | null;
  longestWinStreak: { count: number; year: number } | null;
  biggestUpset: string | null;
  totalWins: number;
  totalLosses: number;
  conferenceChampionships: number;
  playoffAppearances: number;
  nationalChampionships: number;
}

export interface DynastyRetrospective {
  headline: string;
  body: string;
  chapters: Array<{ title: string; body: string; year: number }>;
}
