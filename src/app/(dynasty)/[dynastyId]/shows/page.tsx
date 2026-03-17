"use client";

import { useEffect, useState, useCallback, use } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { ShowCard } from "@/components/shows/show-card";
import { TranscriptViewer } from "@/components/shows/transcript-viewer";
import { ShowArchive } from "@/components/shows/show-archive";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  SHOW_CONFIGS,
  type ShowTranscript,
  type ShowType,
  type ShowConfig,
} from "@/lib/shows/types";
import type { SeasonState } from "@/lib/state/schema";

type ViewState = "lineup" | "viewing" | "archive";
type TabState = "this-week" | "archive";

interface ArchivedShow {
  week: number;
  showType: ShowType;
  transcript: ShowTranscript;
}

interface SeasonRow {
  id: string;
  current_week: number;
  season_state: SeasonState;
  narrative_memory: string;
}

interface DynastyRow {
  school: string;
  conference: string;
  coach_name: string;
}

interface ContentCacheRow {
  content_type: string;
  content: ShowTranscript;
}

interface SubmissionRow {
  id: string;
  week: number;
}

export default function ShowsPage({
  params,
}: {
  params: Promise<{ dynastyId: string }>;
}) {
  const { dynastyId } = use(params);

  const [viewState, setViewState] = useState<ViewState>("lineup");
  const [activeTab, setActiveTab] = useState<TabState>("this-week");
  const [activeTranscript, setActiveTranscript] = useState<ShowTranscript | null>(null);
  const [generatingShow, setGeneratingShow] = useState<ShowType | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [seasonState, setSeasonState] = useState<SeasonState | null>(null);
  const [narrativeMemory, setNarrativeMemory] = useState<string>("");
  const [dynasty, setDynasty] = useState<DynastyRow | null>(null);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [weekTranscripts, setWeekTranscripts] = useState<Map<ShowType, ShowTranscript>>(new Map());
  const [archivedShows, setArchivedShows] = useState<ArchivedShow[]>([]);
  const [latestSubmissionId, setLatestSubmissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    const { data: dynastyData } = await supabase
      .from("dynasties")
      .select("school, conference, coach_name")
      .eq("id", dynastyId)
      .single();

    if (!dynastyData) {
      setLoading(false);
      return;
    }
    setDynasty(dynastyData as DynastyRow);

    const { data: season } = await supabase
      .from("seasons")
      .select("id, current_week, season_state, narrative_memory")
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
    // current_week is already incremented, so display the last completed week
    setCurrentWeek(typedSeason.current_week - 1);
    setSeasonState(typedSeason.season_state);
    setNarrativeMemory(typedSeason.narrative_memory ?? "");

    // Get all complete submissions for this season to find cached shows
    const { data: submissions } = await supabase
      .from("weekly_submissions")
      .select("id, week")
      .eq("season_id", typedSeason.id)
      .eq("status", "complete")
      .order("week", { ascending: false });

    if (submissions && submissions.length > 0) {
      setLatestSubmissionId((submissions as SubmissionRow[])[0].id);
      const subIds = (submissions as SubmissionRow[]).map((s) => s.id);
      const weekBySubId = new Map(
        (submissions as SubmissionRow[]).map((s) => [s.id, s.week])
      );

      const { data: cachedContent } = await supabase
        .from("content_cache")
        .select("content_type, content, weekly_submission_id")
        .in("weekly_submission_id", subIds)
        .like("content_type", "show_%");

      if (cachedContent && cachedContent.length > 0) {
        const thisWeekMap = new Map<ShowType, ShowTranscript>();
        const archived: ArchivedShow[] = [];

        for (const row of cachedContent as (ContentCacheRow & { weekly_submission_id: string })[]) {
          const showType = row.content_type.replace("show_", "") as ShowType;
          const transcript = row.content;
          const week = weekBySubId.get(row.weekly_submission_id) ?? 0;

          // current_week is already incremented by advanceWeek, so the
          // most recently completed week is current_week - 1
          if (week === typedSeason.current_week - 1) {
            thisWeekMap.set(showType, transcript);
          }

          archived.push({ week, showType, transcript });
        }

        setWeekTranscripts(thisWeekMap);
        setArchivedShows(archived.sort((a, b) => b.week - a.week));
      }
    }

    setLoading(false);
  }, [dynastyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleGenerateShow(config: ShowConfig) {
    if (!dynasty || !seasonState || !seasonId || !latestSubmissionId || generatingShow) return;

    setGeneratingShow(config.type);

    try {
      const response = await fetch(`/api/shows/generate/${config.type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school: dynasty.school,
          coachName: dynasty.coach_name,
          conference: dynasty.conference,
          week: currentWeek,
          seasonState: JSON.stringify(seasonState),
          narrativeMemory,
        }),
      });

      const transcript: ShowTranscript = await response.json();

      if (!transcript.error) {
        const supabase = createClient();
        await supabase.from("content_cache").insert({
          weekly_submission_id: latestSubmissionId,
          content_type: `show_${config.type}`,
          content: transcript,
        });

        setWeekTranscripts((prev) => {
          const next = new Map(prev);
          next.set(config.type, transcript);
          return next;
        });

        setArchivedShows((prev) => {
          const filtered = prev.filter(
            (s) => !(s.week === currentWeek && s.showType === config.type)
          );
          return [
            { week: currentWeek, showType: config.type, transcript },
            ...filtered,
          ].sort((a, b) => b.week - a.week);
        });

        setActiveTranscript(transcript);
        setViewState("viewing");
      }
    } catch (err) {
      console.error("Failed to generate show:", err);
    } finally {
      setGeneratingShow(null);
    }
  }

  function handleSelectShow(config: ShowConfig) {
    const existing = weekTranscripts.get(config.type);
    if (existing) {
      setActiveTranscript(existing);
      setViewState("viewing");
    } else {
      handleGenerateShow(config);
    }
  }

  function handleViewArchived(transcript: ShowTranscript) {
    setActiveTranscript(transcript);
    setViewState("viewing");
  }

  function handleBack() {
    setActiveTranscript(null);
    setViewState("lineup");
  }

  const hasGamesPlayed = seasonState !== null && seasonState.weekResults.length > 0;

  const visibleConfigs = SHOW_CONFIGS.filter((config) => {
    if (!config.condition) return true;
    if (!seasonState) return false;
    return config.condition({ hotSeatLevel: seasonState.hotSeatLevel });
  });

  if (loading) {
    return (
      <div>
        <SectionHeader
          title="SHOWS"
          subtitle="Broadcast coverage of your dynasty"
        />
        <div className="mt-8 flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-ink3" />
        </div>
      </div>
    );
  }

  if (viewState === "viewing" && activeTranscript) {
    return (
      <div>
        <SectionHeader
          title="SHOWS"
          subtitle="Broadcast coverage of your dynasty"
        />
        <div className="mt-6">
          <TranscriptViewer
            transcript={activeTranscript}
            onBack={handleBack}
            submissionId={latestSubmissionId ?? undefined}
            dynastyId={dynastyId}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="SHOWS"
        subtitle="Broadcast coverage of your dynasty"
        variant="shows"
      />

      <div className="mt-6 flex gap-4 border-b border-dw-border">
        <button
          type="button"
          onClick={() => {
            setActiveTab("this-week");
            setViewState("lineup");
          }}
          className={cn(
            "pb-2 font-sans text-sm font-medium transition-colors",
            activeTab === "this-week"
              ? "border-b-2 border-dw-accent text-dw-accent"
              : "text-ink3 hover:text-ink2"
          )}
        >
          This Week
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("archive");
            setViewState("archive");
          }}
          className={cn(
            "pb-2 font-sans text-sm font-medium transition-colors",
            activeTab === "archive"
              ? "border-b-2 border-dw-accent text-dw-accent"
              : "text-ink3 hover:text-ink2"
          )}
        >
          Archive
        </button>
      </div>

      <div className="mt-6">
        {activeTab === "archive" ? (
          <ShowArchive shows={archivedShows} onSelect={handleViewArchived} />
        ) : !hasGamesPlayed ? (
          <div className="rounded border border-dw-border bg-paper2 px-6 py-12 text-center">
            <p className="font-headline text-sm uppercase tracking-wider text-ink3">
              Broadcast Schedule Pending
            </p>
            <p className="mt-3 font-serif text-sm text-ink2">
              The studio lights are off. Submit your first weekly game results to
              unlock DynastyWire GameDay, The Rankings Report, and more. Your
              media universe awaits.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visibleConfigs.map((config, index) => {
              const hasTranscript = weekTranscripts.has(config.type);
              const isGenerating = generatingShow === config.type;
              // First show is the featured flagship — full-width treatment
              const isFeatured = index === 0;

              return (
                <div
                  key={config.type}
                  className={cn("relative", !isFeatured && "sm:col-span-1")}
                >
                  {isGenerating && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded border border-dw-accent/20 bg-paper/80 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-dw-accent" />
                        <p className="font-sans text-xs text-ink2">
                          Going live...
                        </p>
                      </div>
                    </div>
                  )}
                  <ShowCard
                    config={config}
                    available={hasTranscript || hasGamesPlayed}
                    week={currentWeek}
                    featured={isFeatured}
                    onSelect={() => handleSelectShow(config)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
