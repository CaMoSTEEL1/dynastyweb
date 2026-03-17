import { SectionHeader } from "@/components/ui/section-header";

export default function RankingsPage() {
  return (
    <div>
      <SectionHeader
        title="RANKINGS"
        subtitle="Where you stand in the national conversation"
        variant="rankings"
      />
      <div className="mt-8 rounded border border-dw-border bg-paper2 px-6 py-12 text-center">
        <p className="font-serif text-ink2">
          The polls haven&apos;t dropped yet. Play a few games and see where the
          committee places you — and what the analysts think about it.
        </p>
      </div>
    </div>
  );
}
