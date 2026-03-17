"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { WeeklyInputForm } from "@/lib/weekly/validation";
import { submitWeeklyData } from "@/lib/weekly/actions";
import StepScore from "./step-score";
import StepVibe from "./step-vibe";
import StepStars from "./step-stars";
import StepRecruiting from "./step-recruiting";

interface WeeklyFormProps {
  dynastyId: string;
  currentWeek: number;
  school: string;
}

function getDefaultForm(week: number): WeeklyInputForm {
  return {
    week,
    opponent: "",
    opponentRanking: null,
    homeAway: "home",
    userScore: 0,
    opponentScore: 0,
    gameVibe: "dominant_win",
    notableMoment: null,
    statLeaders: [{ name: "", position: "", stat: "" }],
    recruitUpdates: [],
    newRanking: null,
  };
}

function getDraftKey(dynastyId: string): string {
  return `dynastywire-draft-${dynastyId}`;
}

function loadDraft(dynastyId: string, week: number): WeeklyInputForm {
  if (typeof window === "undefined") return getDefaultForm(week);
  try {
    const stored = localStorage.getItem(getDraftKey(dynastyId));
    if (stored) {
      const parsed = JSON.parse(stored) as WeeklyInputForm;
      if (parsed.week === week) return parsed;
    }
  } catch {
    // Ignore parse errors
  }
  return getDefaultForm(week);
}

function saveDraft(dynastyId: string, form: WeeklyInputForm): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getDraftKey(dynastyId), JSON.stringify(form));
  } catch {
    // Ignore storage errors
  }
}

function clearDraft(dynastyId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getDraftKey(dynastyId));
  } catch {
    // Ignore storage errors
  }
}

export default function WeeklyForm({
  dynastyId,
  currentWeek,
  school,
}: WeeklyFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<WeeklyInputForm>(() =>
    getDefaultForm(currentWeek)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Optional sections expand/collapse
  const [showVibe, setShowVibe] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [showRecruiting, setShowRecruiting] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft(dynastyId, currentWeek);
    setForm(draft);

    // Auto-expand sections that have data
    if (draft.notableMoment || draft.gameVibe !== "dominant_win") {
      setShowVibe(true);
    }
    if (draft.statLeaders.some((s) => s.name)) setShowStars(true);
    if (draft.recruitUpdates.length > 0 || draft.newRanking) {
      setShowRecruiting(true);
    }

    setMounted(true);
  }, [dynastyId, currentWeek]);

  const handleChange = useCallback(
    (updates: Partial<WeeklyInputForm>) => {
      setForm((prev) => {
        const next = { ...prev, ...updates };
        saveDraft(dynastyId, next);
        return next;
      });
      const updatedKeys = Object.keys(updates);
      if (updatedKeys.length > 0) {
        setErrors((prev) => {
          const next = { ...prev };
          for (const key of updatedKeys) {
            delete next[key];
          }
          return next;
        });
      }
    },
    [dynastyId]
  );

  function handleRankingChange(ranking: number | null) {
    handleChange({ newRanking: ranking });
  }

  async function handleSubmit() {
    // Require opponent and scores
    if (!form.opponent) {
      setErrors({ opponent: "Opponent required" });
      return;
    }

    // Auto-detect vibe from scores if user didn't expand the section
    const isWin = form.userScore > form.opponentScore;
    const margin = Math.abs(form.userScore - form.opponentScore);
    let finalForm = { ...form };
    if (!showVibe) {
      // Auto-set vibe based on score
      if (isWin) {
        finalForm.gameVibe =
          margin >= 21 ? "blowout_win" : margin <= 7 ? "close_win" : "dominant_win";
      } else {
        finalForm.gameVibe =
          margin >= 21
            ? "blowout_loss"
            : margin <= 7
              ? "close_loss"
              : "dominant_loss";
      }
    }

    // Clean empty stat leaders and recruit updates
    const cleanedForm: WeeklyInputForm = {
      ...finalForm,
      statLeaders: finalForm.statLeaders.filter(
        (sl) => sl.name.trim() || sl.position.trim() || sl.stat.trim()
      ),
      recruitUpdates: finalForm.recruitUpdates.filter(
        (ru) => ru.name.trim() || ru.position.trim()
      ),
    };

    // Validate non-empty stat leaders
    const leaderErrors: Record<string, string> = {};
    for (let i = 0; i < cleanedForm.statLeaders.length; i++) {
      const sl = cleanedForm.statLeaders[i];
      if (!sl.name) leaderErrors[`statLeaders.${i}.name`] = "Name required";
      if (!sl.position)
        leaderErrors[`statLeaders.${i}.position`] = "Position required";
      if (!sl.stat) leaderErrors[`statLeaders.${i}.stat`] = "Stat required";
    }

    const recruitErrors: Record<string, string> = {};
    for (let i = 0; i < cleanedForm.recruitUpdates.length; i++) {
      const ru = cleanedForm.recruitUpdates[i];
      if (!ru.name)
        recruitErrors[`recruitUpdates.${i}.name`] = "Name required";
      if (!ru.position)
        recruitErrors[`recruitUpdates.${i}.position`] = "Position required";
    }

    const allErrors = { ...leaderErrors, ...recruitErrors };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const result = await submitWeeklyData(dynastyId, cleanedForm);

    if (result.success) {
      clearDraft(dynastyId);
      router.push(`/${dynastyId}`);
    } else {
      setSubmitError(result.error);
      setIsSubmitting(false);
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="font-serif text-sm italic text-ink3">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Required: Game Result */}
      <div className="rounded border border-dw-border bg-paper2 p-6">
        <h3 className="mb-1 font-headline text-sm uppercase tracking-wider text-ink">
          Game Result
        </h3>
        <p className="mb-4 font-serif text-xs italic text-ink3">
          Required — enter your score and opponent
        </p>
        <StepScore form={form} onChange={handleChange} errors={errors} />
      </div>

      {/* Optional: Game Vibe */}
      <div className="rounded border border-dw-border bg-paper2">
        <button
          type="button"
          onClick={() => setShowVibe(!showVibe)}
          className="flex w-full items-center justify-between px-6 py-4 text-left"
        >
          <div>
            <h3 className="font-headline text-sm uppercase tracking-wider text-ink">
              Game Vibe
            </h3>
            <p className="font-serif text-xs italic text-ink3">
              Optional — describe how the game felt
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-paper3 px-2 py-0.5 font-sans text-[10px] uppercase tracking-wider text-ink3">
              Optional
            </span>
            {showVibe ? (
              <ChevronUp className="h-4 w-4 text-ink3" />
            ) : (
              <ChevronDown className="h-4 w-4 text-ink3" />
            )}
          </div>
        </button>
        {showVibe && (
          <div className="border-t border-dw-border px-6 pb-6 pt-4">
            <StepVibe form={form} onChange={handleChange} errors={errors} />
          </div>
        )}
      </div>

      {/* Optional: Star Performers */}
      <div className="rounded border border-dw-border bg-paper2">
        <button
          type="button"
          onClick={() => setShowStars(!showStars)}
          className="flex w-full items-center justify-between px-6 py-4 text-left"
        >
          <div>
            <h3 className="font-headline text-sm uppercase tracking-wider text-ink">
              Star Performers
            </h3>
            <p className="font-serif text-xs italic text-ink3">
              Optional — who stood out? Richer content when filled
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-paper3 px-2 py-0.5 font-sans text-[10px] uppercase tracking-wider text-ink3">
              Optional
            </span>
            {showStars ? (
              <ChevronUp className="h-4 w-4 text-ink3" />
            ) : (
              <ChevronDown className="h-4 w-4 text-ink3" />
            )}
          </div>
        </button>
        {showStars && (
          <div className="border-t border-dw-border px-6 pb-6 pt-4">
            <StepStars form={form} onChange={handleChange} errors={errors} />
          </div>
        )}
      </div>

      {/* Optional: Recruiting & Rankings */}
      <div className="rounded border border-dw-border bg-paper2">
        <button
          type="button"
          onClick={() => setShowRecruiting(!showRecruiting)}
          className="flex w-full items-center justify-between px-6 py-4 text-left"
        >
          <div>
            <h3 className="font-headline text-sm uppercase tracking-wider text-ink">
              Recruiting & Rankings
            </h3>
            <p className="font-serif text-xs italic text-ink3">
              Optional — update your ranking and recruiting board
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-paper3 px-2 py-0.5 font-sans text-[10px] uppercase tracking-wider text-ink3">
              Optional
            </span>
            {showRecruiting ? (
              <ChevronUp className="h-4 w-4 text-ink3" />
            ) : (
              <ChevronDown className="h-4 w-4 text-ink3" />
            )}
          </div>
        </button>
        {showRecruiting && (
          <div className="border-t border-dw-border px-6 pb-6 pt-4">
            <StepRecruiting
              form={form}
              onChange={handleChange}
              errors={errors}
              newRanking={form.newRanking}
              onRankingChange={handleRankingChange}
            />
          </div>
        )}
      </div>

      {/* Error Display */}
      {submitError && (
        <div className="rounded border border-dw-red/30 bg-dw-red/10 px-4 py-3">
          <p className="font-sans text-sm text-dw-red">{submitError}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between">
        <p className="font-serif text-xs italic text-ink3">
          {school} — Week {currentWeek}
        </p>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={cn(
            "rounded bg-dw-accent px-8 py-2.5",
            "font-sans text-sm font-semibold uppercase tracking-wider text-white",
            "transition-colors hover:bg-dw-accent2",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          {isSubmitting ? "Filing report..." : "File Weekly Report"}
        </button>
      </div>
    </div>
  );
}
