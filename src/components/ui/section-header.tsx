import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      <h2 className="font-headline text-lg uppercase tracking-wider text-ink">
        {title}
      </h2>
      <div className="mt-1 h-px w-full bg-dw-border" />
      {subtitle && (
        <p className="mt-2 font-serif italic text-sm text-ink2">{subtitle}</p>
      )}
    </div>
  );
}
