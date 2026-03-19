"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { SectionHeader } from "@/components/ui/section-header";
import { useSettings } from "@/components/settings/settings-context";
import type { SeasonState, WeekResult } from "@/lib/state/schema";

// ── Display helpers ──────────────────────────────────────────────────────────

const PRESTIGE_CONFIG: Record<string, { label: string; badge: string; desc: string }> = {
  blue_blood:    { label: "Blue Blood",    badge: "border-dw-red text-dw-red bg-dw-red/10",     desc: "Historic program with generational expectations." },
  rising_power:  { label: "Rising Power",  badge: "border-dw-accent2 text-dw-accent2 bg-dw-accent2/10", desc: "Building toward elite status with momentum." },
  rebuild:       { label: "Rebuild",       badge: "border-ink3 text-ink3 bg-ink3/10",            desc: "Starting from scratch. Every win matters." },
};

const SENTIMENT_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  ecstatic: { label: "Ecstatic",  color: "text-dw-green",  dot: "bg-dw-green" },
  happy:    { label: "Happy",     color: "text-dw-green",  dot: "bg-dw-green" },
  content:  { label: "Content",   color: "text-ink2",      dot: "bg-ink2" },
  restless: { label: "Restless",  color: "text-dw-yellow", dot: "bg-dw-yellow" },
  furious:  { label: "FURIOUS",   color: "text-dw-red",    dot: "bg-dw-red" },
};

const HOTSEAT_CONFIG: Record<string, { label: string; color: string; bar: string }> = {
  none:     { label: "Cool",      color: "text-dw-green",  bar: "bg-dw-green" },
  warm:     { label: "Warm",      color: "text-dw-yellow", bar: "bg-dw-yellow" },
  hot:      { label: "HOT",       color: "text-dw-accent2",bar: "bg-dw-accent2" },
  volcanic: { label: "VOLCANIC",  color: "text-dw-red",    bar: "bg-dw-red" },
};

const HOTSEAT_FILL: Record<string, string> = {
  none: "w-1/4", warm: "w-2/4", hot: "w-3/4", volcanic: "w-full",
};

const PROJECTION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  in:     { label: "IN THE FIELD",    color: "text-dw-green",  bg: "bg-dw-green/10 border-dw-green/40" },
  bubble: { label: "ON THE BUBBLE",   color: "text-dw-yellow", bg: "bg-dw-yellow/10 border-dw-yellow/40" },
  out:    { label: "OUT",             color: "text-ink3",      bg: "bg-paper3 border-dw-border" },
};

const MOMENTUM_CONFIG: Record<string, { label: string; color: string; arrow: string }> = {
  surging:  { label: "Surging",  color: "text-dw-green",  arrow: "↑↑" },
  steady:   { label: "Steady",   color: "text-ink2",      arrow: "→" },
  sliding:  { label: "Sliding",  color: "text-dw-yellow", arrow: "↓" },
  freefall: { label: "Freefall", color: "text-dw-red",    arrow: "↓↓" },
};

function StatBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded border border-dw-border bg-paper2 px-4 py-3 text-center">
      <p className="font-sans text-[10px] uppercase tracking-widest text-ink3">{label}</p>
      <p className="mt-1 font-headline text-2xl font-bold text-ink">{value}</p>
      {sub && <p className="mt-0.5 font-sans text-xs text-ink3">{sub}</p>}
    </div>
  );
}

function PulseRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-dw-border py-3 last:border-b-0">
      <span className="font-sans text-xs uppercase tracking-wider text-ink3">{label}</span>
      {children}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

interface CoachPageProps {
  params: Promise<{ dynastyId: string }>;
}

export default function CoachPage({ params }: CoachPageProps) {
  const { dynastyId } = use(params);
  const { dynasty } = useSettings();

  const [state, setState] = useState<SeasonState | null>(null);
  const [seasonYear, setSeasonYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const { data: season } = await supabase
        .from("seasons")
        .select("year, season_state")
        .eq("dynasty_id", dynastyId)
        .order("year", { ascending: false })
        .limit(1)
        .single();

      if (season) {
        setState(season.season_state as SeasonState);
        setSeasonYear(season.year as number);
      }
      setLoading(false);
    })();
  }, [dynastyId]);

  const prestige = PRESTIGE_CONFIG[dynasty.prestige] ?? PRESTIGE_CONFIG.rebuild;
  const sentiment = state ? (SENTIMENT_CONFIG[state.fanSentiment] ?? SENTIMENT_CONFIG.content) : null;
  const hotseat = state ? (HOTSEAT_CONFIG[state.hotSeatLevel] ?? HOTSEAT_CONFIG.none) : null;
  const projection = state ? (PROJECTION_CONFIG[state.playoffProjection] ?? PROJECTION_CONFIG.out) : null;
  const momentum = state ? (MOMENTUM_CONFIG[state.seasonMomentum] ?? MOMENTUM_CONFIG.steady) : null;

  const ppg = state && state.weekResults.length > 0
    ? (state.pointsFor / state.weekResults.length).toFixed(1)
    : "—";
  const papg = state && state.weekResults.length > 0
    ? (state.pointsAgainst / state.weekResults.length).toFixed(1)
    : "—";
  const avgMargin = state && state.weekResults.length > 0
    ? ((state.pointsFor - state.pointsAgainst) / state.weekResults.length).toFixed(1)
    : "—";

  if (loading) {
    return (
      <div>
        <SectionHeader title="COACH PROFILE" subtitle="Your program at a glance" />
        <div className="mt-8 flex items-center justify-center py-16">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent [animation-delay:200ms]" />
            <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent [animation-delay:400ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="COACH PROFILE"
        subtitle={`${dynasty.school} — ${dynasty.conference}`}
      />

      {/* ── Identity Card ──────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded border border-dw-border bg-paper2">
        {/* Accent stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-dw-red via-dw-accent2 to-dw-accent" />
        <div className="px-6 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dw-red text-xl font-bold text-paper">
                  {dynasty.coachName.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-ink3">Head Coach</p>
                  <h1 className="font-headline text-2xl uppercase tracking-wide text-ink">
                    {dynasty.coachName}
                  </h1>
                  <p className="font-serif text-sm italic text-ink3">{dynasty.school}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
              <span className={cn(
                "inline-block rounded border px-3 py-1 font-sans text-xs font-semibold uppercase tracking-wider",
                prestige.badge
              )}>
                {prestige.label}
              </span>
              {state && (
                <span className="rounded border border-dw-border bg-paper3 px-3 py-1 font-sans text-xs text-ink3">
                  Year {state.coachYear} of Dynasty
                </span>
              )}
              {seasonYear && (
                <span className="rounded border border-dw-border bg-paper3 px-3 py-1 font-sans text-xs text-ink3">
                  {seasonYear} Season
                </span>
              )}
            </div>
          </div>
          <p className="mt-4 font-serif text-sm italic text-ink3">{prestige.desc}</p>
        </div>
      </div>

      {/* ── Season Snapshot ─────────────────────────────────────────────── */}
      {state ? (
        <>
          <div>
            <h3 className="mb-3 font-headline text-xs uppercase tracking-widest text-ink3">
              Season Snapshot
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox
                label="Record"
                value={`${state.record.wins}-${state.record.losses}`}
              />
              <StatBox
                label="Ranking"
                value={state.ranking ? `#${state.ranking}` : "NR"}
                sub={state.previousRanking ? `Prev: #${state.previousRanking}` : undefined}
              />
              <StatBox
                label="Conf Record"
                value={`${state.conferenceRecord.wins}-${state.conferenceRecord.losses}`}
                sub={dynasty.conference}
              />
              <StatBox
                label="Streak"
                value={state.streak.count > 0 ? `${state.streak.count}${state.streak.type}` : "—"}
                sub={state.streak.count >= 2
                  ? `Longest: ${state.longestWinStreak}W`
                  : undefined
                }
              />
            </div>
          </div>

          {/* ── Scoring Stats ─────────────────────────────────────────────── */}
          <div>
            <h3 className="mb-3 font-headline text-xs uppercase tracking-widest text-ink3">
              Scoring
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="Points/Game" value={ppg} />
              <StatBox label="Allowed/Game" value={papg} />
              <StatBox
                label="Avg Margin"
                value={typeof avgMargin === "string" && parseFloat(avgMargin) > 0
                  ? `+${avgMargin}`
                  : avgMargin
                }
              />
              <StatBox
                label="Total Points"
                value={state.pointsFor}
                sub={`Against: ${state.pointsAgainst}`}
              />
            </div>
          </div>

          {/* ── Program Pulse ─────────────────────────────────────────────── */}
          <div>
            <h3 className="mb-3 font-headline text-xs uppercase tracking-widest text-ink3">
              Program Pulse
            </h3>
            <div className="rounded border border-dw-border bg-paper2 px-5 py-1">
              {/* Fan Sentiment */}
              <PulseRow label="Fan Sentiment">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", sentiment?.dot)} />
                  <span className={cn("font-sans text-sm font-semibold uppercase tracking-wider", sentiment?.color)}>
                    {sentiment?.label}
                  </span>
                </div>
              </PulseRow>

              {/* Hot Seat */}
              <PulseRow label="Hot Seat Level">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-paper3">
                    <div className={cn("h-full rounded-full transition-all", hotseat?.bar, HOTSEAT_FILL[state.hotSeatLevel])} />
                  </div>
                  <span className={cn("font-sans text-sm font-semibold uppercase tracking-wider", hotseat?.color)}>
                    {hotseat?.label}
                  </span>
                </div>
              </PulseRow>

              {/* Playoff Projection */}
              <PulseRow label="CFP Projection">
                <span className={cn(
                  "rounded border px-2.5 py-1 font-sans text-xs font-bold uppercase tracking-wider",
                  projection?.color, projection?.bg
                )}>
                  {projection?.label}
                </span>
              </PulseRow>

              {/* Momentum */}
              <PulseRow label="Season Momentum">
                <div className="flex items-center gap-2">
                  <span className={cn("font-headline text-lg leading-none", momentum?.color)}>
                    {momentum?.arrow}
                  </span>
                  <span className={cn("font-sans text-sm font-semibold uppercase tracking-wider", momentum?.color)}>
                    {momentum?.label}
                  </span>
                </div>
              </PulseRow>
            </div>
          </div>

          {/* ── Notable Results ───────────────────────────────────────────── */}
          {(state.biggestWin || state.worstLoss) && (
            <div>
              <h3 className="mb-3 font-headline text-xs uppercase tracking-widest text-ink3">
                Notable Results
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {state.biggestWin && (
                  <div className="rounded border border-dw-green/30 bg-dw-green/5 px-4 py-3">
                    <p className="font-sans text-[10px] uppercase tracking-widest text-dw-green">
                      Signature Win
                    </p>
                    <p className="mt-1 font-headline text-sm uppercase tracking-wide text-ink">
                      {state.biggestWin}
                    </p>
                  </div>
                )}
                {state.worstLoss && (
                  <div className="rounded border border-dw-red/30 bg-dw-red/5 px-4 py-3">
                    <p className="font-sans text-[10px] uppercase tracking-widest text-dw-red">
                      Worst Loss
                    </p>
                    <p className="mt-1 font-headline text-sm uppercase tracking-wide text-ink">
                      {state.worstLoss}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Game Log ──────────────────────────────────────────────────── */}
          {state.weekResults.length > 0 && (
            <div>
              <h3 className="mb-3 font-headline text-xs uppercase tracking-widest text-ink3">
                Game Log
              </h3>
              <div className="overflow-hidden rounded border border-dw-border bg-paper">
                <div className="hidden grid-cols-[3rem_1fr_auto_auto_auto] gap-3 border-b border-dw-border bg-paper2 px-4 py-2 sm:grid">
                  <span className="font-sans text-[10px] uppercase tracking-wider text-ink3">Wk</span>
                  <span className="font-sans text-[10px] uppercase tracking-wider text-ink3">Opponent</span>
                  <span className="font-sans text-[10px] uppercase tracking-wider text-ink3">Site</span>
                  <span className="font-sans text-[10px] uppercase tracking-wider text-ink3 text-right">Score</span>
                  <span className="font-sans text-[10px] uppercase tracking-wider text-ink3 text-center">W/L</span>
                </div>
                {[...state.weekResults].reverse().map((result: WeekResult) => (
                  <div
                    key={result.week}
                    className="grid grid-cols-[3rem_1fr_auto_auto_auto] items-center gap-3 border-b border-dw-border px-4 py-2.5 last:border-b-0 hover:bg-paper2 transition-colors"
                  >
                    <span className="font-sans text-xs text-ink3">{result.week}</span>
                    <div className="min-w-0">
                      <span className="block font-sans text-sm text-ink truncate">
                        {result.opponentRanking ? `#${result.opponentRanking} ` : ""}
                        {result.opponent}
                      </span>
                    </div>
                    <span className="font-sans text-xs text-ink3">
                      {result.homeAway === "home" ? "Home" : "@"}
                    </span>
                    <span className="font-sans text-sm tabular-nums text-right text-ink">
                      {result.userScore}–{result.opponentScore}
                    </span>
                    <span className={cn(
                      "w-8 rounded text-center font-sans text-xs font-bold uppercase",
                      result.result === "W"
                        ? "bg-dw-green/15 text-dw-green"
                        : "bg-dw-red/15 text-dw-red"
                    )}>
                      {result.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded border border-dw-border bg-paper2 px-6 py-12 text-center">
          <p className="font-serif text-ink2">
            No season data yet. Submit your first week to start tracking your program.
          </p>
        </div>
      )}
    </div>
  );
}
