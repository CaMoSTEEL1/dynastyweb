"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "./settings-context";
import { createClient } from "@/lib/supabase/client";
import type { SeasonState } from "@/lib/state/schema";

type Step = "summary" | "confirm" | "transitioning";

export default function NewSeasonFlow({ onCancel }: { onCancel: () => void }) {
  const { dynasty, season, close, setSeason } = useSettings();
  const router = useRouter();

  const [step, setStep] = useState<Step>("summary");
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [seasonState, setSeasonState] = useState<SeasonState | null>(null);
  const [loading, setLoading] = useState(!!season);

  // Fetch full season state for summary
  useEffect(() => {
    if (!season) return;

    let cancelled = false;
    const supabase = createClient();

    supabase
      .from("seasons")
      .select("season_state")
      .eq("id", season.id)
      .single()
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (!err && data) {
          setSeasonState(data.season_state as SeasonState);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [season]);

  const schoolLower = dynasty.school.toLowerCase();
  const isConfirmValid = confirmText.toLowerCase().trim() === schoolLower;

  const handleTransition = useCallback(async () => {
    if (!season) return;
    setStep("transitioning");
    setError(null);

    try {
      const res = await fetch("/api/offseason/transition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dynastyId: dynasty.id,
          seasonId: season.id,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        newSeasonId?: string;
        error?: string;
      };

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Failed to start new season");
      }

      const newYear = (season.year ?? 0) + 1;
      setSeason({
        id: data.newSeasonId!,
        year: newYear,
        currentWeek: 1,
        record: { wins: 0, losses: 0 },
      });

      close();
      router.push(`/${dynasty.id}/submit`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("confirm");
    }
  }, [season, dynasty.id, close, router, setSeason]);

  if (!season) {
    return (
      <div className="space-y-4">
        <p className="font-serif text-sm text-ink2">
          No active season found. Create a dynasty first.
        </p>
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            "w-full rounded border border-dw-border bg-paper2 px-4 py-2.5",
            "font-sans text-xs font-medium uppercase tracking-wider text-ink2",
            "transition-colors hover:bg-paper3"
          )}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-ink3" />
      </div>
    );
  }

  const record = seasonState
    ? `${seasonState.record.wins}-${seasonState.record.losses}`
    : `${season.record.wins}-${season.record.losses}`;

  /* ── Step 1: Summary ──────────────────────────────────── */
  if (step === "summary") {
    return (
      <div className="space-y-4">
        <div className="rounded border border-dw-border bg-paper2 p-4">
          <h4 className="font-headline text-xs uppercase tracking-wider text-ink3">
            Current Season Summary
          </h4>

          <div className="mt-3 space-y-2">
            <Row label="School" value={dynasty.school} />
            <Row label="Season" value={String(season.year)} />
            <Row label="Record" value={record} />
            {seasonState?.ranking && (
              <Row label="Ranking" value={`#${seasonState.ranking}`} />
            )}
            {seasonState?.biggestWin && (
              <Row label="Biggest Win" value={seasonState.biggestWin} />
            )}
            {seasonState?.worstLoss && (
              <Row label="Worst Loss" value={seasonState.worstLoss} />
            )}
            <Row
              label="Fan Sentiment"
              value={seasonState?.fanSentiment ?? "—"}
            />
            <Row label="Week" value={String(season.currentWeek)} />
          </div>
        </div>

        <div className="flex items-start gap-3 rounded border border-amber-500/30 bg-amber-500/10 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="font-serif text-xs leading-relaxed text-amber-200/80">
            Starting a new season will archive your current season. This action
            cannot be undone. Your season history and content will be preserved
            in the Trophy Room.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              "flex-1 rounded border border-dw-border bg-paper2 px-4 py-2.5",
              "font-sans text-xs font-medium uppercase tracking-wider text-ink2",
              "transition-colors hover:bg-paper3"
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setStep("confirm")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded bg-dw-accent px-4 py-2.5",
              "font-sans text-xs font-semibold uppercase tracking-wider text-white",
              "transition-opacity hover:opacity-90"
            )}
          >
            Continue
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  /* ── Step 2: Type to Confirm ──────────────────────────── */
  if (step === "confirm") {
    return (
      <div className="space-y-4">
        <p className="font-serif text-sm leading-relaxed text-ink2">
          To confirm, type{" "}
          <span className="font-sans font-semibold text-ink">
            {schoolLower}
          </span>{" "}
          below:
        </p>

        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={schoolLower}
          autoFocus
          className={cn(
            "w-full rounded border border-dw-border bg-paper2 px-4 py-3",
            "font-sans text-sm text-ink placeholder:text-ink3/50",
            "outline-none transition-colors",
            "focus:border-dw-accent"
          )}
        />

        {error && <p className="font-sans text-xs text-dw-red">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setStep("summary");
              setConfirmText("");
              setError(null);
            }}
            className={cn(
              "flex-1 rounded border border-dw-border bg-paper2 px-4 py-2.5",
              "font-sans text-xs font-medium uppercase tracking-wider text-ink2",
              "transition-colors hover:bg-paper3"
            )}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleTransition}
            disabled={!isConfirmValid}
            className={cn(
              "flex-1 rounded bg-dw-accent px-4 py-2.5",
              "font-sans text-xs font-semibold uppercase tracking-wider text-white",
              "transition-opacity hover:opacity-90",
              "disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            Start New Season
          </button>
        </div>
      </div>
    );
  }

  /* ── Step 3: Transitioning ────────────────────────────── */
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <Loader2 className="h-8 w-8 animate-spin text-dw-accent" />
      <p className="font-serif text-sm italic text-ink2">
        Archiving season and compressing narrative memory...
      </p>
      <p className="font-sans text-xs text-ink3">This may take a moment</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-serif text-sm text-ink2">{label}</span>
      <span className="font-sans text-sm font-medium capitalize text-ink">
        {value}
      </span>
    </div>
  );
}
