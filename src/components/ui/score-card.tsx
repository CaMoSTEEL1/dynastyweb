import { cn } from "@/lib/utils";

interface ScoreCardProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  homeRank?: number;
  awayRank?: number;
  week: string;
  result: "W" | "L";
  className?: string;
}

export function ScoreCard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  homeRank,
  awayRank,
  week,
  result,
  className,
}: ScoreCardProps) {
  return (
    <div
      className={cn(
        "relative bg-paper2 border border-dw-border rounded-sm p-4",
        className
      )}
    >
      {/* Week label */}
      <span className="font-sans text-xs text-ink3 uppercase tracking-wide">
        {week}
      </span>

      {/* Result badge */}
      <span
        className={cn(
          "absolute top-3 right-3 font-sans text-xs font-bold px-2 py-0.5 rounded-sm text-paper",
          result === "W" ? "bg-dw-green" : "bg-dw-red"
        )}
      >
        {result}
      </span>

      {/* Matchup */}
      <div className="mt-3 flex items-center justify-between gap-4">
        {/* Away team */}
        <div className="flex-1 text-center">
          <p className="font-headline text-sm text-ink leading-tight">
            {awayRank != null && (
              <span className="text-dw-accent mr-1">#{awayRank}</span>
            )}
            {awayTeam}
          </p>
          <p className="font-headline text-3xl font-bold text-ink mt-1">
            {awayScore}
          </p>
        </div>

        <span className="font-sans text-xs text-ink3 uppercase">at</span>

        {/* Home team */}
        <div className="flex-1 text-center">
          <p className="font-headline text-sm text-ink leading-tight">
            {homeRank != null && (
              <span className="text-dw-accent mr-1">#{homeRank}</span>
            )}
            {homeTeam}
          </p>
          <p className="font-headline text-3xl font-bold text-ink mt-1">
            {homeScore}
          </p>
        </div>
      </div>
    </div>
  );
}
