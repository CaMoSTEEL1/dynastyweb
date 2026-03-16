"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/section-header";
import { OffseasonPhaseCard } from "@/components/offseason/offseason-phase-card";
import { PhaseContentViewer } from "@/components/offseason/phase-content-viewer";
import {
  OFFSEASON_PHASES,
  type OffseasonPhase,
  type OffseasonPhaseConfig,
} from "@/lib/offseason/types";

interface SeasonData {
  id: string;
  year: number;
  currentWeek: number;
}

type PhaseState = "locked" | "available" | "completed" | "loading";

type CompletedContent = Partial<
  Record<OffseasonPhase, Record<string, unknown>>
>;

interface OffseasonPageProps {
  params: Promise<{ dynastyId: string }>;
}

export default function OffseasonPage({ params }: OffseasonPageProps) {
  const { dynastyId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [season, setSeason] = useState<SeasonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedContent, setCompletedContent] = useState<CompletedContent>(
    {}
  );
  const [loadingPhase, setLoadingPhase] = useState<OffseasonPhase | null>(null);
  const [viewingPhase, setViewingPhase] = useState<OffseasonPhase | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: seasonRow, error: seasonError } = await supabase
      .from("seasons")
      .select("id, year, current_week")
      .eq("dynasty_id", dynastyId)
      .order("year", { ascending: false })
      .limit(1)
      .single();

    if (seasonError || !seasonRow) {
      setError("No active season found.");
      setLoading(false);
      return;
    }

    setSeason({
      id: seasonRow.id as string,
      year: seasonRow.year as number,
      currentWeek: seasonRow.current_week as number,
    });

    const { data: offseasonSub } = await supabase
      .from("weekly_submissions")
      .select("id")
      .eq("season_id", seasonRow.id as string)
      .eq("week", 99)
      .single();

    if (offseasonSub) {
      const { data: cached } = await supabase
        .from("content_cache")
        .select("content_type, content")
        .eq("weekly_submission_id", offseasonSub.id as string);

      if (cached && cached.length > 0) {
        const loaded: CompletedContent = {};
        for (const row of cached) {
          const ct = row.content_type as string;
          if (ct.startsWith("offseason_")) {
            const phase = ct.replace("offseason_", "") as OffseasonPhase;
            loaded[phase] = row.content as Record<string, unknown>;
          }
        }
        setCompletedContent(loaded);
      }
    }

    setLoading(false);
  }, [dynastyId, supabase]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dynastyId]);

  const getPhaseStatus = useCallback(
    (phase: OffseasonPhase, index: number): PhaseState => {
      if (loadingPhase === phase) return "loading";
      if (completedContent[phase]) return "completed";

      if (index === 0) return "available";

      const previousPhase = OFFSEASON_PHASES[index - 1];
      if (previousPhase && completedContent[previousPhase.phase]) {
        return "available";
      }

      return "locked";
    },
    [completedContent, loadingPhase]
  );

  const handlePhaseClick = useCallback(
    async (config: OffseasonPhaseConfig) => {
      if (completedContent[config.phase]) {
        setViewingPhase(config.phase);
        return;
      }

      if (!season) return;

      setLoadingPhase(config.phase);

      try {
        const response = await fetch(
          `/api/offseason/generate/${config.phase}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dynastyId,
              seasonId: season.id,
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(
            (data as { error?: string }).error ?? "Generation failed"
          );
        }

        const data = await response.json();
        const content = (data as { content: Record<string, unknown> }).content;

        setCompletedContent((prev) => ({
          ...prev,
          [config.phase]: content,
        }));
        setViewingPhase(config.phase);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate content"
        );
      } finally {
        setLoadingPhase(null);
      }
    },
    [completedContent, dynastyId, season]
  );

  const handleBeginNextSeason = useCallback(async () => {
    if (!season) return;

    setTransitioning(true);
    setError(null);

    try {
      const response = await fetch("/api/offseason/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dynastyId,
          seasonId: season.id,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(
          errorData.error ?? "Failed to transition to new season"
        );
      }

      router.push(`/${dynastyId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to transition to new season"
      );
      setTransitioning(false);
    }
  }, [dynastyId, season, router]);

  const allPhasesComplete = OFFSEASON_PHASES.every(
    (p) => completedContent[p.phase]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <SectionHeader title="OFFSEASON" subtitle="Loading..." />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-sm bg-paper2 border border-dw-border skeleton-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!season) {
    return (
      <div>
        <SectionHeader title="OFFSEASON" />
        <p className="mt-4 font-serif text-sm text-ink2">
          {error ?? "No active season found for this dynasty."}
        </p>
      </div>
    );
  }

  if (season.currentWeek < 15 && season.currentWeek !== -1) {
    return (
      <div>
        <SectionHeader
          title="OFFSEASON"
          subtitle="The offseason hasn't arrived yet"
        />
        <div className="mt-6 rounded-sm border border-dw-border bg-paper2 p-6 text-center">
          <p className="font-serif text-base text-ink2 leading-relaxed">
            The regular season is still underway. Complete at least 15 weeks
            before the offseason begins.
          </p>
          <p className="mt-3 font-sans text-sm text-ink3">
            Current week: {season.currentWeek} / 15
          </p>
          <div className="mt-4 h-2 w-full max-w-xs mx-auto rounded-full bg-paper3 overflow-hidden">
            <div
              className="h-full rounded-full bg-dw-accent transition-all duration-300"
              style={{
                width: `${Math.min(100, (season.currentWeek / 15) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (viewingPhase && completedContent[viewingPhase]) {
    return (
      <div className="space-y-4">
        <SectionHeader
          title="OFFSEASON"
          subtitle={`Year ${season.year} — ${
            OFFSEASON_PHASES.find((p) => p.phase === viewingPhase)?.title ?? ""
          }`}
        />
        <PhaseContentViewer
          phase={viewingPhase}
          content={completedContent[viewingPhase]}
          onClose={() => setViewingPhase(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="OFFSEASON"
        subtitle={`Year ${season.year} — Navigate the offseason gauntlet`}
      />

      {error && (
        <div className="rounded-sm border border-dw-red bg-paper2 px-4 py-3">
          <p className="font-sans text-sm text-dw-red">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {OFFSEASON_PHASES.map((config, index) => (
          <OffseasonPhaseCard
            key={config.phase}
            config={config}
            status={getPhaseStatus(config.phase, index)}
            onClick={() => handlePhaseClick(config)}
          />
        ))}
      </div>

      {allPhasesComplete && (
        <div className="rounded-sm border border-dw-accent bg-paper2 p-6 text-center space-y-4">
          <h3 className="font-headline text-lg uppercase tracking-wider text-ink">
            Offseason Complete
          </h3>
          <p className="font-serif text-sm text-ink2 leading-relaxed">
            All offseason phases are finished. Ready to begin Year{" "}
            {season.year + 1}?
          </p>
          <button
            type="button"
            disabled={transitioning}
            onClick={handleBeginNextSeason}
            className={cn(
              "inline-flex items-center gap-2 rounded-sm px-6 py-3 font-sans text-sm uppercase tracking-wider transition-all duration-200",
              transitioning
                ? "bg-ink3 text-paper cursor-wait"
                : "bg-dw-accent text-paper hover:bg-dw-accent2"
            )}
          >
            {transitioning ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Transitioning...
              </>
            ) : (
              `Begin Year ${season.year + 1}`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
