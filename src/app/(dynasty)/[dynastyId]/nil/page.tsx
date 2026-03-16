"use client";

import { useEffect, useState, useCallback, use } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { NILBoard } from "@/components/nil/nil-board";
import { PortalTracker } from "@/components/nil/portal-tracker";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { NILPageContent } from "@/lib/nil/types";

interface SeasonRow {
  id: string;
  current_week: number;
}

interface ContentCacheRow {
  content_type: string;
  content: NILPageContent;
}

export default function NILPage({
  params,
}: {
  params: Promise<{ dynastyId: string }>;
}) {
  const { dynastyId } = use(params);

  const [content, setContent] = useState<NILPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(1);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const { data: season } = await supabase
      .from("seasons")
      .select("id, current_week")
      .eq("dynasty_id", dynastyId)
      .order("year", { ascending: false })
      .limit(1)
      .single();

    if (!season) {
      setLoading(false);
      return;
    }

    const typedSeason = season as SeasonRow;
    setSeasonId(typedSeason.id);
    setCurrentWeek(typedSeason.current_week);

    // Find latest complete submission to look up cached NIL content
    const { data: submission } = await supabase
      .from("weekly_submissions")
      .select("id")
      .eq("season_id", typedSeason.id)
      .eq("status", "complete")
      .order("week", { ascending: false })
      .limit(1)
      .single();

    if (submission) {
      const { data: cachedRows } = await supabase
        .from("content_cache")
        .select("content_type, content")
        .eq("weekly_submission_id", submission.id as string)
        .eq("content_type", "nil_offers")
        .limit(1);

      if (cachedRows && cachedRows.length > 0) {
        const row = cachedRows[0] as ContentCacheRow;
        setContent(row.content);
      }
    }

    setLoading(false);
  }, [dynastyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleGenerate() {
    if (generating) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/nil/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dynastyId }),
      });

      if (!response.ok) {
        const errBody = await response.json();
        throw new Error(
          (errBody as { error?: string }).error ?? "Failed to generate NIL report"
        );
      }

      const data = await response.json() as {
        nilContent: NILPageContent;
      };

      setContent(data.nilContent);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div>
        <SectionHeader
          title="NIL & PORTAL"
          subtitle="Money moves and roster drama"
        />
        <div className="mt-8 flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-ink3" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="NIL & PORTAL"
        subtitle="Money moves and roster drama"
      />

      {!content ? (
        <div className="mt-8 rounded border border-dw-border bg-paper2 px-6 py-12 text-center">
          <p className="font-headline text-sm uppercase tracking-wider text-ink3">
            No NIL Intelligence Available
          </p>
          <p className="mt-3 font-serif text-sm text-ink2">
            Generate a report to see the latest NIL offers, transfer portal
            activity, and the drama shaping your roster.
          </p>

          {error && (
            <p className="mt-3 font-sans text-sm text-dw-red">{error}</p>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className={cn(
              "mt-6 inline-flex items-center gap-2 rounded border border-dw-accent bg-dw-accent/10 px-5 py-2.5",
              "font-headline text-sm uppercase tracking-wider text-dw-accent",
              "transition-colors hover:bg-dw-accent/20",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {generating && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {generating ? "Generating..." : "Generate NIL Report"}
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <NILBoard
              offers={content.nilOffers}
              drama={content.nilDrama}
            />
            <PortalTracker
              entries={content.portalEntries}
              drama={content.portalDrama}
            />
          </div>

          <div className="border-t border-dw-border pt-4">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className={cn(
                "inline-flex items-center gap-2 rounded border border-dw-border bg-paper2 px-4 py-2",
                "font-sans text-xs text-ink3",
                "transition-colors hover:border-dw-accent hover:text-dw-accent",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {generating && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              {generating ? "Regenerating..." : "Regenerate Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
