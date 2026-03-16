import { cn } from "@/lib/utils";
import type { AllTimeRecords as AllTimeRecordsType } from "@/lib/trophy/types";

interface RecordCardProps {
  label: string;
  value: string | number;
  context?: string;
}

function RecordCard({ label, value, context }: RecordCardProps) {
  return (
    <div className="rounded border border-dw-border bg-paper2 px-4 py-3">
      <p className="font-sans text-[10px] uppercase tracking-widest text-ink3">
        {label}
      </p>
      <p className="mt-1 font-headline text-2xl text-ink">{value}</p>
      {context && (
        <p className="mt-0.5 font-sans text-xs text-ink3">{context}</p>
      )}
    </div>
  );
}

interface AllTimeRecordsProps {
  records: AllTimeRecordsType;
  className?: string;
}

export function AllTimeRecords({ records, className }: AllTimeRecordsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", className)}>
      <RecordCard
        label="All-Time Record"
        value={`${records.totalWins}-${records.totalLosses}`}
        context={
          records.totalWins + records.totalLosses > 0
            ? `${Math.round((records.totalWins / (records.totalWins + records.totalLosses)) * 1000) / 10}% win rate`
            : undefined
        }
      />

      {records.bestSeason && (
        <RecordCard
          label="Best Season"
          value={records.bestSeason.record}
          context={`${records.bestSeason.year}`}
        />
      )}

      {records.longestWinStreak && (
        <RecordCard
          label="Longest Win Streak"
          value={records.longestWinStreak.count}
          context={`${records.longestWinStreak.year} season`}
        />
      )}

      <RecordCard
        label="National Championships"
        value={records.nationalChampionships}
      />

      <RecordCard
        label="Conference Championships"
        value={records.conferenceChampionships}
      />

      <RecordCard
        label="Playoff Appearances"
        value={records.playoffAppearances}
      />

      {records.biggestUpset && (
        <RecordCard
          label="Biggest Upset"
          value={records.biggestUpset}
        />
      )}

      <RecordCard
        label="Total Wins"
        value={records.totalWins}
      />
    </div>
  );
}
