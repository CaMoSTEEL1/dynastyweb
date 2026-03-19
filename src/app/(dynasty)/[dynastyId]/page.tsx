"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/section-header";
import { FrontPageSkeleton } from "@/components/ui/front-page-skeleton";
import { ScoreCard } from "@/components/ui/score-card";
import { StatStrip } from "@/components/ui/stat-strip";
import { LeadStory } from "@/components/front-page/lead-story";
import { SecondaryStories } from "@/components/front-page/secondary-stories";
import { useWeeklyStream } from "@/hooks/use-weekly-stream";
import { createClient } from "@/lib/supabase/client";
import { useSettings } from "@/components/settings/settings-context";
import type { RecapContent, BeatTakesContent, RankingsTakeContent, RecruitingNoteContent } from "@/lib/ai/generators";

interface ScoreCardData {
  week: number;
  opponent: string;
  opponentRanking: number | null;
  homeAway: "home" | "away";
  userScore: number;
  opponentScore: number;
  result: "W" | "L";
  error?: boolean;
}

interface CachedContent {
  score_card: ScoreCardData | null;
  recap: RecapContent | null;
  beat_takes: BeatTakesContent | null;
  rankings_take: RankingsTakeContent | null;
  recruiting_note: RecruitingNoteContent | null;
}

function buildStatStrip(scoreCard: ScoreCardData | null): Array<{ label: string; value: string | number }> {
  if (!scoreCard) return [];
  const margin = Math.abs(scoreCard.userScore - scoreCard.opponentScore);
  return [
    { label: "Result", value: scoreCard.result },
    { label: "Score", value: `${scoreCard.userScore}-${scoreCard.opponentScore}` },
    { label: "Margin", value: margin },
    { label: "Week", value: scoreCard.week },
  ];
}

export default function FrontPage({
  params,
}: {
  params: Promise<{ dynastyId: string }>;
}) {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get("submissionId");
  const { dynasty } = useSettings();
  const schoolName = dynasty.school;

  const [dynastyId, setDynastyId] = useState<string | null>(null);
  const [cachedContent, setCachedContent] = useState<CachedContent | null>(null);
  const [loadingCached, setLoadingCached] = useState(false);
  const [hasNoContent, setHasNoContent] = useState(false);

  const { content: streamContent, isStreaming, error: streamError } =
    useWeeklyStream(submissionId);

  useEffect(() => {
    params.then((p) => setDynastyId(p.dynastyId));
  }, [params]);

  const fetchLatestContent = useCallback(async (dynId: string) => {
    setLoadingCached(true);
    try {
      const supabase = createClient();

      const { data: latestSub } = await supabase
        .from("weekly_submissions")
        .select("id, raw_input, season_id")
        .eq("status", "complete")
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestSub) {
        setHasNoContent(true);
        setLoadingCached(false);
        return;
      }

      const [{ data: season }, { data: cached }] = await Promise.all([
        supabase
          .from("seasons")
          .select("dynasty_id")
          .eq("id", latestSub.season_id as string)
          .maybeSingle(),
        supabase
          .from("content_cache")
          .select("content_type, content")
          .eq("weekly_submission_id", latestSub.id as string),
      ]);

      if (!season || (season.dynasty_id as string) !== dynId) {
        setHasNoContent(true);
        setLoadingCached(false);
        return;
      }

      if (!cached || cached.length === 0) {
        setHasNoContent(true);
        setLoadingCached(false);
        return;
      }

      const rawInput = latestSub.raw_input as Record<string, unknown> | null;

      const result: CachedContent = {
        score_card: rawInput
          ? {
              week: rawInput.week as number,
              opponent: rawInput.opponent as string,
              opponentRanking: rawInput.opponentRanking as number | null,
              homeAway: rawInput.homeAway as "home" | "away",
              userScore: rawInput.userScore as number,
              opponentScore: rawInput.opponentScore as number,
              result:
                (rawInput.userScore as number) > (rawInput.opponentScore as number)
                  ? "W"
                  : "L",
            }
          : null,
        recap: null,
        beat_takes: null,
        rankings_take: null,
        recruiting_note: null,
      };

      for (const row of cached) {
        const ct = row.content_type as string;
        if (ct === "recap") result.recap = row.content as RecapContent;
        if (ct === "beat_takes") result.beat_takes = row.content as BeatTakesContent;
        if (ct === "rankings_take") result.rankings_take = row.content as RankingsTakeContent;
        if (ct === "recruiting_note") result.recruiting_note = row.content as RecruitingNoteContent;
      }

      setCachedContent(result);
      setHasNoContent(false);
    } catch {
      setHasNoContent(true);
    } finally {
      setLoadingCached(false);
    }
  }, []);

  useEffect(() => {
    if (!submissionId && dynastyId) {
      fetchLatestContent(dynastyId);
    }
  }, [submissionId, dynastyId, fetchLatestContent]);

  // After a fresh stream completes, auto-repair season state if it fell behind
  // (can happen if an old submission dropped the connection before the state update)
  useEffect(() => {
    if (!isStreaming && submissionId && dynastyId && !streamError) {
      void fetch("/api/weekly/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dynastyId }),
      });
    }
  }, [isStreaming, submissionId, dynastyId, streamError]);

  const scoreCard = submissionId
    ? (streamContent.score_card as ScoreCardData | undefined) ?? null
    : cachedContent?.score_card ?? null;

  const recap = submissionId
    ? (streamContent.recap as RecapContent | undefined) ?? null
    : cachedContent?.recap ?? null;

  const beatTakes = submissionId
    ? (streamContent.beat_takes as BeatTakesContent | undefined) ?? null
    : cachedContent?.beat_takes ?? null;

  const rankingsTake = submissionId
    ? (streamContent.rankings_take as RankingsTakeContent | undefined) ?? null
    : cachedContent?.rankings_take ?? null;

  const recruitingNote = submissionId
    ? (streamContent.recruiting_note as RecruitingNoteContent | undefined) ?? null
    : cachedContent?.recruiting_note ?? null;

  const hasAnyContent = scoreCard || recap || beatTakes || rankingsTake || recruitingNote;
  const showSkeleton = submissionId ? !scoreCard && isStreaming : loadingCached;

  if (!hasAnyContent && !showSkeleton && hasNoContent && !submissionId) {
    return (
      <div>
        <SectionHeader
          title="FRONT PAGE"
          subtitle="The day's top stories from your dynasty"
        />
        <FrontPageSkeleton />
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="font-serif text-sm text-ink3">
            Your game is over. The media universe is waiting. Run the Wire to generate your first story.
          </p>
          <Link
            href={`/${dynastyId}/submit`}
            className={cn(
              "rounded bg-dw-accent px-8 py-3",
              "font-sans text-sm font-semibold uppercase tracking-wider text-white",
              "transition-colors hover:bg-dw-accent2"
            )}
          >
            Run the Wire
          </Link>
        </div>
      </div>
    );
  }

  if (showSkeleton && !hasAnyContent) {
    return (
      <div>
        <SectionHeader
          title="FRONT PAGE"
          subtitle="The day's top stories from your dynasty"
        />
        <FrontPageSkeleton />
      </div>
    );
  }

  const statStripData = buildStatStrip(scoreCard);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <SectionHeader
          title="FRONT PAGE"
          subtitle="The day's top stories from your dynasty"
        />
        {!isStreaming && dynastyId && (
          <Link
            href={`/${dynastyId}/submit`}
            className={cn(
              "rounded bg-dw-accent px-6 py-2",
              "font-sans text-xs font-semibold uppercase tracking-wider text-white",
              "transition-colors hover:bg-dw-accent2"
            )}
          >
            File This Week
          </Link>
        )}
      </div>

      {streamError && (
        <div className="rounded-sm border border-dw-red bg-paper2 px-4 py-3">
          <p className="font-sans text-sm text-dw-red">{streamError}</p>
        </div>
      )}

      {scoreCard && !scoreCard.error && (
        <div className="space-y-0">
          {/* Emotional result stripe — green for W, crimson for L */}
          <div className={cn(
            "h-0.5 w-full rounded-t",
            scoreCard.result === "W" ? "bg-dw-green" : "bg-dw-accent"
          )} />
          <ScoreCard
            homeTeam={scoreCard.homeAway === "home" ? schoolName : scoreCard.opponent}
            awayTeam={scoreCard.homeAway === "away" ? schoolName : scoreCard.opponent}
            homeScore={scoreCard.homeAway === "home" ? scoreCard.userScore : scoreCard.opponentScore}
            awayScore={scoreCard.homeAway === "away" ? scoreCard.userScore : scoreCard.opponentScore}
            homeRank={scoreCard.homeAway === "home" ? undefined : scoreCard.opponentRanking ?? undefined}
            awayRank={scoreCard.homeAway === "away" ? undefined : scoreCard.opponentRanking ?? undefined}
            week={`Week ${scoreCard.week}`}
            result={scoreCard.result}
          />
        </div>
      )}

      {statStripData.length > 0 && <StatStrip stats={statStripData} />}

      <LeadStory recap={recap} />

      <div className="h-px w-full bg-dw-border" />

      <SecondaryStories
        beatTakes={beatTakes}
        rankingsTake={rankingsTake}
        recruitingNote={recruitingNote}
      />

      {isStreaming && (
        <div className="flex items-center justify-center gap-3 py-6 border-t border-dw-border">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-dw-accent animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
          <p className="font-headline text-xs uppercase tracking-widest text-ink3">
            The Wire is running your story
          </p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-dw-accent animate-pulse"
                style={{ animationDelay: `${(i + 3) * 150}ms` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
