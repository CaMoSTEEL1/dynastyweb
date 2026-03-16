import { cn } from "@/lib/utils";

interface RankingsBoxProps {
  rankings: Array<{ rank: number; team: string; record: string }>;
  title?: string;
  className?: string;
}

export function RankingsBox({
  rankings,
  title = "AP Top 25",
  className,
}: RankingsBoxProps) {
  return (
    <div
      className={cn(
        "bg-paper2 border border-dw-border rounded-sm overflow-hidden",
        className
      )}
    >
      {/* Title */}
      <div className="px-4 py-3 border-b border-dw-border">
        <h3 className="font-headline text-base text-ink">{title}</h3>
      </div>

      {/* Rankings list */}
      <div className="max-h-[400px] overflow-y-auto">
        {rankings.map((entry, i) => (
          <div
            key={entry.rank}
            className={cn(
              "flex items-center gap-3 px-4 py-2 text-sm",
              i % 2 === 0 ? "bg-paper2" : "bg-paper3"
            )}
          >
            <span className="font-headline font-bold text-dw-accent w-6 text-right shrink-0">
              {entry.rank}
            </span>
            <span className="font-serif text-ink flex-1 truncate">
              {entry.team}
            </span>
            <span className="font-sans text-xs text-ink3 shrink-0">
              {entry.record}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
