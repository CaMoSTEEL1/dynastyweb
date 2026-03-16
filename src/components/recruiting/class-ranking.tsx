import { cn } from "@/lib/utils";
import type { Recruit } from "@/lib/recruiting/types";

interface ClassRankingProps {
  recruits: Recruit[];
}

function getClassGrade(totalStars: number): {
  grade: string;
  label: string;
  color: string;
} {
  if (totalStars >= 80) return { grade: "A+", label: "Elite", color: "text-dw-green" };
  if (totalStars >= 65) return { grade: "A", label: "Outstanding", color: "text-dw-green" };
  if (totalStars >= 50) return { grade: "B+", label: "Very Good", color: "text-dw-yellow" };
  if (totalStars >= 35) return { grade: "B", label: "Good", color: "text-dw-yellow" };
  if (totalStars >= 20) return { grade: "C+", label: "Average", color: "text-ink2" };
  if (totalStars >= 10) return { grade: "C", label: "Below Average", color: "text-ink3" };
  return { grade: "D", label: "Needs Work", color: "text-dw-red" };
}

export function ClassRanking({ recruits }: ClassRankingProps) {
  const committed = recruits.filter((r) => r.status === "committed");
  const totalCommittedStars = committed.reduce((sum, r) => sum + r.stars, 0);
  const avgStars =
    committed.length > 0
      ? (totalCommittedStars / committed.length).toFixed(1)
      : "0.0";

  const positionBreakdown = committed.reduce<Record<string, number>>(
    (acc, r) => {
      acc[r.position] = (acc[r.position] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const positionEntries = Object.entries(positionBreakdown).sort(
    ([, a], [, b]) => b - a
  );

  const classInfo = getClassGrade(totalCommittedStars);
  const totalOnBoard = recruits.length;
  const offered = recruits.filter((r) => r.status === "offered").length;
  const visited = recruits.filter((r) => r.status === "visited").length;
  const leaders = recruits.filter((r) => r.status === "leader").length;
  const lost = recruits.filter(
    (r) => r.status === "lost" || r.status === "flipped"
  ).length;

  return (
    <div className="rounded border border-dw-border bg-paper2 p-4">
      <div className="grid gap-4 sm:grid-cols-[auto_1fr_1fr]">
        <div className="flex flex-col items-center justify-center border-r border-dw-border pr-4">
          <span
            className={cn(
              "font-headline text-3xl font-bold",
              classInfo.color
            )}
          >
            {classInfo.grade}
          </span>
          <span className="mt-0.5 font-sans text-xs text-ink3">
            {classInfo.label}
          </span>
          <span className="mt-1 font-sans text-xs text-ink3">
            {totalCommittedStars} total stars
          </span>
        </div>

        <div className="space-y-2">
          <h4 className="font-headline text-xs uppercase tracking-wider text-ink3">
            Board Overview
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex justify-between font-sans text-sm">
              <span className="text-ink3">Total on board</span>
              <span className="text-ink">{totalOnBoard}</span>
            </div>
            <div className="flex justify-between font-sans text-sm">
              <span className="text-dw-green">Committed</span>
              <span className="text-ink">{committed.length}</span>
            </div>
            <div className="flex justify-between font-sans text-sm">
              <span className="text-ink3">Offered</span>
              <span className="text-ink">{offered}</span>
            </div>
            <div className="flex justify-between font-sans text-sm">
              <span className="text-dw-accent2">Visited</span>
              <span className="text-ink">{visited}</span>
            </div>
            <div className="flex justify-between font-sans text-sm">
              <span className="text-dw-yellow">Leaders</span>
              <span className="text-ink">{leaders}</span>
            </div>
            <div className="flex justify-between font-sans text-sm">
              <span className="text-dw-red">Lost/Flipped</span>
              <span className="text-ink">{lost}</span>
            </div>
          </div>
          <div className="font-sans text-sm">
            <span className="text-ink3">Avg stars (committed): </span>
            <span className="text-ink">{avgStars}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-headline text-xs uppercase tracking-wider text-ink3">
            Committed by Position
          </h4>
          {positionEntries.length === 0 ? (
            <p className="font-serif text-sm italic text-ink3">
              No commitments yet
            </p>
          ) : (
            <div className="space-y-1">
              {positionEntries.map(([pos, count]) => (
                <div key={pos} className="flex items-center gap-2">
                  <span className="w-8 font-sans text-xs font-medium text-ink2">
                    {pos}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-2 rounded-full bg-dw-accent"
                      style={{
                        width: `${Math.min(
                          (count / Math.max(committed.length, 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="w-4 text-right font-sans text-xs text-ink3">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
