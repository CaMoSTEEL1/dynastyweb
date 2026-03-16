"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { WeeklyInputForm } from "@/lib/weekly/validation";

interface StepVibeProps {
  form: WeeklyInputForm;
  onChange: (updates: Partial<WeeklyInputForm>) => void;
  errors: Record<string, string>;
}

type VibeOption = {
  value: WeeklyInputForm["gameVibe"];
  label: string;
  description: string;
};

const WIN_VIBES: VibeOption[] = [
  {
    value: "dominant_win",
    label: "Dominant Win",
    description: "Controlled it from start to finish",
  },
  {
    value: "close_win",
    label: "Close Win",
    description: "Had to fight for this one",
  },
  {
    value: "blowout_win",
    label: "Blowout Win",
    description: "Put up a statement",
  },
];

const LOSS_VIBES: VibeOption[] = [
  {
    value: "close_loss",
    label: "Close Loss",
    description: "Let one slip away",
  },
  {
    value: "dominant_loss",
    label: "Dominant Loss",
    description: "Outclassed from the start",
  },
  {
    value: "blowout_loss",
    label: "Blowout Loss",
    description: "Rather not talk about it",
  },
];

export default function StepVibe({ form, onChange, errors }: StepVibeProps) {
  const isWin = form.userScore > form.opponentScore;
  const margin = Math.abs(form.userScore - form.opponentScore);

  const availableVibes = useMemo(() => {
    return isWin ? WIN_VIBES : LOSS_VIBES;
  }, [isWin]);

  // Auto-detect suggestion based on margin
  const suggestedVibe = useMemo((): WeeklyInputForm["gameVibe"] => {
    if (isWin) {
      if (margin >= 21) return "blowout_win";
      if (margin <= 7) return "close_win";
      return "dominant_win";
    } else {
      if (margin >= 21) return "blowout_loss";
      if (margin <= 7) return "close_loss";
      return "dominant_loss";
    }
  }, [isWin, margin]);

  // Auto-select on first render if current vibe doesn't match win/loss state
  const currentVibeValid = availableVibes.some(
    (v) => v.value === form.gameVibe
  );
  if (!currentVibeValid && form.userScore !== form.opponentScore) {
    onChange({ gameVibe: suggestedVibe });
  }

  const momentLength = form.notableMoment?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Game Feel Selector */}
      <div>
        <label className="block font-sans text-sm font-medium text-ink2 mb-2">
          How did the game feel?
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {availableVibes.map((vibe) => (
            <button
              key={vibe.value}
              type="button"
              onClick={() => onChange({ gameVibe: vibe.value })}
              className={cn(
                "rounded border p-4 text-left transition-all",
                form.gameVibe === vibe.value
                  ? "border-dw-accent bg-dw-accent/10 ring-1 ring-dw-accent"
                  : "border-dw-border bg-paper3 hover:bg-paper4"
              )}
            >
              <span
                className={cn(
                  "block font-sans text-sm font-medium",
                  form.gameVibe === vibe.value ? "text-dw-accent" : "text-ink"
                )}
              >
                {vibe.label}
              </span>
              <span className="mt-1 block text-xs text-ink3">
                {vibe.description}
              </span>
            </button>
          ))}
        </div>
        {errors.gameVibe && (
          <p className="mt-1 text-sm text-dw-red">{errors.gameVibe}</p>
        )}
      </div>

      {/* Notable Moment */}
      <div>
        <label className="block font-sans text-sm font-medium text-ink2 mb-1">
          Notable Moment
        </label>
        <p className="mb-2 text-xs text-ink3">
          Anything stand out? A game-winning drive, a controversial call, a
          freshman breakout...
        </p>
        <textarea
          value={form.notableMoment ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onChange({
              notableMoment: val.length > 0 ? val.slice(0, 200) : null,
            });
          }}
          maxLength={200}
          rows={3}
          placeholder="Optional"
          className={cn(
            "w-full rounded border bg-paper3 px-3 py-2 text-ink placeholder:text-ink3",
            "border-dw-border focus:outline-none focus:ring-2 focus:ring-dw-accent",
            "resize-none font-serif text-sm"
          )}
        />
        <div className="mt-1 text-right text-xs text-ink3">
          {momentLength}/200
        </div>
      </div>
    </div>
  );
}
