"use client";

import { useState, use } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { StaffCard } from "@/components/carousel/staff-card";
import { RumorCard } from "@/components/carousel/rumor-card";
import { OutcomeDisplay } from "@/components/carousel/outcome-display";
import { cn } from "@/lib/utils";
import type {
  StaffMember,
  CoachingRumor,
  CarouselOutcome,
} from "@/lib/carousel/types";

interface CarouselPageProps {
  params: Promise<{ dynastyId: string }>;
}

export default function CarouselPage({ params }: CarouselPageProps) {
  const { dynastyId } = use(params);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [rumors, setRumors] = useState<CoachingRumor[]>([]);
  const [outcomes, setOutcomes] = useState<CarouselOutcome[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasGenerated = staff.length > 0;
  const allResolved = hasGenerated && rumors.length > 0 && outcomes.length === rumors.length;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setOutcomes([]);

    try {
      const res = await fetch("/api/carousel/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dynastyId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error((data as { error?: string }).error ?? "Failed to generate carousel");
      }

      const data = await res.json();
      const payload = data as { staff: StaffMember[]; rumors: CoachingRumor[] };
      setStaff(payload.staff);
      setRumors(payload.rumors);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleOutcome(outcome: CarouselOutcome) {
    setOutcomes((prev) => [...prev, outcome]);
  }

  return (
    <div>
      <SectionHeader
        title="COACHING CAROUSEL"
        subtitle="Staff changes and power moves"
      />

      {!hasGenerated && (
        <div className="mt-8 rounded border border-dw-border bg-paper2 px-6 py-12 text-center">
          {error && (
            <p className="mb-4 font-serif text-sm text-dw-red">{error}</p>
          )}
          <p className="mb-4 font-serif italic text-ink3">
            Generate your coaching staff and see who is drawing interest from other programs.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={cn(
              "rounded border border-dw-accent bg-dw-accent/10 px-5 py-2 font-headline text-sm uppercase tracking-wider text-dw-accent transition-colors",
              "hover:bg-dw-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? "Generating..." : "Generate Staff & Rumors"}
          </button>
        </div>
      )}

      {hasGenerated && (
        <div className="mt-6 space-y-8">
          <div>
            <h3 className="font-headline text-sm uppercase tracking-wider text-ink3">
              Coaching Staff
            </h3>
            <div className="mt-1 h-px w-full bg-dw-border" />
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {staff.map((member) => (
                <StaffCard key={member.id} staff={member} />
              ))}
            </div>
          </div>

          {rumors.length > 0 && !allResolved && (
            <div>
              <h3 className="font-headline text-sm uppercase tracking-wider text-ink3">
                Carousel Rumors
              </h3>
              <div className="mt-1 h-px w-full bg-dw-border" />
              <div className="mt-3 space-y-4">
                {rumors.map((rumor) => (
                  <RumorCard
                    key={rumor.id}
                    rumor={rumor}
                    dynastyId={dynastyId}
                    onResolved={handleOutcome}
                  />
                ))}
              </div>
            </div>
          )}

          {allResolved && (
            <div>
              <h3 className="font-headline text-sm uppercase tracking-wider text-ink3">
                Carousel Summary
              </h3>
              <div className="mt-1 h-px w-full bg-dw-border" />
              <div className="mt-3 space-y-4">
                {outcomes.map((outcome, idx) => (
                  <OutcomeDisplay key={`outcome-${idx}`} outcome={outcome} />
                ))}
              </div>

              <div className="mt-6 rounded border border-dw-border bg-paper2 px-6 py-4 text-center">
                <p className="font-serif italic text-sm text-ink3">
                  All carousel decisions have been resolved. These outcomes will shape your next season.
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className={cn(
                    "mt-3 rounded border border-dw-accent bg-dw-accent/10 px-5 py-2 font-headline text-sm uppercase tracking-wider text-dw-accent transition-colors",
                    "hover:bg-dw-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {loading ? "Generating..." : "Run New Carousel"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
