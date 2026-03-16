"use client";

import { useEffect, useState, useCallback } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { SeasonArchiveCard } from "@/components/trophy/season-archive-card";
import { LegacyScoreDisplay } from "@/components/trophy/legacy-score-display";
import { AllTimeRecords } from "@/components/trophy/all-time-records";
import { DynastyRetrospective } from "@/components/trophy/dynasty-retrospective";
import { createClient } from "@/lib/supabase/client";
import {
  calculateLegacyScore,
  calculateAllTimeRecords,
  archiveSeason,
} from "@/lib/trophy/legacy-calculator";
import type { SeasonState } from "@/lib/state/schema";
import type {
  SeasonArchive,
  LegacyScore,
  AllTimeRecords as AllTimeRecordsType,
  DynastyRetrospective as DynastyRetrospectiveType,
} from "@/lib/trophy/types";

interface DynastyInfo {
  school: string;
  coachName: string;
  prestige: string;
}

export default function TrophyRoomPage({
  params,
}: {
  params: Promise<{ dynastyId: string }>;
}) {
  const [dynastyId, setDynastyId] = useState<string | null>(null);
  const [archives, setArchives] = useState<SeasonArchive[]>([]);
  const [dynasty, setDynasty] = useState<DynastyInfo | null>(null);
  const [legacyScore, setLegacyScore] = useState<LegacyScore | null>(null);
  const [allTimeRecords, setAllTimeRecords] = useState<AllTimeRecordsType | null>(null);
  const [retrospective, setRetrospective] = useState<DynastyRetrospectiveType | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingRetrospective, setGeneratingRetrospective] = useState(false);
  const [retroError, setRetroError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setDynastyId(p.dynastyId));
  }, [params]);

  const fetchTrophyData = useCallback(async (dynId: string) => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch dynasty info
      const { data: dynastyData } = await supabase
        .from("dynasties")
        .select("school, coach_name, prestige")
        .eq("id", dynId)
        .single();

      if (!dynastyData) {
        setLoading(false);
        return;
      }

      const dynInfo: DynastyInfo = {
        school: dynastyData.school as string,
        coachName: dynastyData.coach_name as string,
        prestige: dynastyData.prestige as string,
      };
      setDynasty(dynInfo);

      // Fetch all seasons for this dynasty
      const { data: seasons } = await supabase
        .from("seasons")
        .select("id, year, season_state")
        .eq("dynasty_id", dynId)
        .order("year", { ascending: false });

      if (!seasons || seasons.length === 0) {
        setLoading(false);
        return;
      }

      // Convert seasons to archives
      const seasonArchives: SeasonArchive[] = [];

      for (const season of seasons) {
        const state = season.season_state as unknown as SeasonState;
        if (!state || !state.record) continue;

        // Only include seasons that have at least one game played
        const totalGames = state.record.wins + state.record.losses;
        if (totalGames === 0) continue;

        const archive = archiveSeason(
          state,
          season.year as number,
          state.coachYear ?? 1
        );
        archive.seasonId = season.id as string;

        // Check for cached recap in content_cache via weekly submissions
        const { data: submissions } = await supabase
          .from("weekly_submissions")
          .select("id")
          .eq("season_id", season.id as string)
          .order("week", { ascending: false })
          .limit(1);

        if (submissions && submissions.length > 0) {
          const { data: cachedRecap } = await supabase
            .from("content_cache")
            .select("content")
            .eq("weekly_submission_id", submissions[0].id as string)
            .eq("content_type", "season_recap")
            .limit(1)
            .single();

          if (cachedRecap && cachedRecap.content) {
            const content = cachedRecap.content as Record<string, unknown>;
            if (typeof content === "string") {
              archive.recap = content;
            } else if (typeof content.recap === "string") {
              archive.recap = content.recap;
            }
          }
        }

        seasonArchives.push(archive);
      }

      setArchives(seasonArchives);

      // Calculate legacy score and records
      if (seasonArchives.length > 0) {
        const score = calculateLegacyScore(seasonArchives, dynInfo.prestige);
        setLegacyScore(score);

        const records = calculateAllTimeRecords(seasonArchives);
        setAllTimeRecords(records);
      }
    } catch (err) {
      console.error("Failed to fetch trophy data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dynastyId) {
      fetchTrophyData(dynastyId);
    }
  }, [dynastyId, fetchTrophyData]);

  const handleGenerateRetrospective = async () => {
    if (!dynasty || archives.length === 0) return;

    setGeneratingRetrospective(true);
    setRetroError(null);

    try {
      const response = await fetch("/api/trophy/retrospective", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archives,
          dynasty: {
            school: dynasty.school,
            coachName: dynasty.coachName,
            prestige: dynasty.prestige,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate retrospective");
      }

      const data = (await response.json()) as DynastyRetrospectiveType;
      setRetrospective(data);
    } catch {
      setRetroError("Failed to generate retrospective. Please try again.");
    } finally {
      setGeneratingRetrospective(false);
    }
  };

  if (loading) {
    return (
      <div>
        <SectionHeader
          title="TROPHY ROOM"
          subtitle="The legacy you're building"
        />
        <div className="mt-8 space-y-4">
          <div className="h-36 animate-pulse rounded border border-dw-border bg-paper2" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded border border-dw-border bg-paper2"
              />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded border border-dw-border bg-paper2" />
        </div>
      </div>
    );
  }

  if (archives.length === 0) {
    return (
      <div>
        <SectionHeader
          title="TROPHY ROOM"
          subtitle="The legacy you're building"
        />
        <div className="mt-8 rounded border border-dw-border bg-paper2 px-6 py-12 text-center">
          <p className="font-headline text-xl text-ink">
            Every dynasty starts with a blank trophy case.
          </p>
          <div className="mx-auto mt-3 h-px w-16 bg-dw-accent" />
          <p className="mt-4 font-serif text-sm leading-relaxed text-ink2">
            Complete a season to see your legacy take shape — records, awards,
            and the story of how you built something that mattered. The first
            chapter is waiting to be written.
          </p>
          <p className="mt-6 font-sans text-xs uppercase tracking-wider text-ink3">
            Submit weekly results to build your dynasty&apos;s history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="TROPHY ROOM"
        subtitle="The legacy you're building"
      />

      {/* Legacy Score */}
      {legacyScore && <LegacyScoreDisplay score={legacyScore} />}

      {/* All-Time Records */}
      {allTimeRecords && <AllTimeRecords records={allTimeRecords} />}

      {/* Retrospective section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-sm uppercase tracking-wider text-ink">
            Dynasty Retrospective
          </h3>
          {!retrospective && (
            <button
              onClick={handleGenerateRetrospective}
              disabled={generatingRetrospective}
              className="rounded border border-dw-accent bg-dw-accent/10 px-4 py-1.5 font-sans text-xs uppercase tracking-wider text-dw-accent transition-colors hover:bg-dw-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generatingRetrospective
                ? "Generating..."
                : "Generate Retrospective"}
            </button>
          )}
        </div>

        {generatingRetrospective && (
          <div className="flex items-center justify-center rounded border border-dw-border bg-paper2 px-6 py-12">
            <div className="text-center">
              <div className="mx-auto mb-3 h-2 w-2 animate-pulse rounded-full bg-dw-accent" />
              <p className="font-serif text-sm italic text-ink3">
                Our writers are composing your dynasty&apos;s story...
              </p>
            </div>
          </div>
        )}

        {retroError && (
          <div className="rounded border border-dw-red bg-paper2 px-4 py-3">
            <p className="font-sans text-sm text-dw-red">{retroError}</p>
          </div>
        )}

        {retrospective && <DynastyRetrospective retrospective={retrospective} />}
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-dw-border" />

      {/* Season Archives - Reverse Chronological */}
      <div className="space-y-4">
        <h3 className="font-headline text-sm uppercase tracking-wider text-ink">
          Season Archives
        </h3>
        <div className="space-y-6">
          {archives.map((archive) => (
            <SeasonArchiveCard key={archive.seasonId} archive={archive} />
          ))}
        </div>
      </div>
    </div>
  );
}
