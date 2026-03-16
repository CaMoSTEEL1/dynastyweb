import { cn } from "@/lib/utils";

interface StatStripProps {
  stats: Array<{ label: string; value: string | number }>;
  className?: string;
}

export function StatStrip({ stats, className }: StatStripProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap bg-paper3 rounded-sm",
        className
      )}
    >
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            "flex-1 min-w-[80px] px-4 py-3 text-center",
            i !== 0 && "border-l border-dw-border"
          )}
        >
          <p className="font-headline text-xl font-bold text-ink leading-none">
            {stat.value}
          </p>
          <p className="mt-1 font-sans text-xs uppercase tracking-wide text-ink3">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
