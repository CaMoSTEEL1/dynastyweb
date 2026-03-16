"use client";

import { cn } from "@/lib/utils";
import type { WeeklyInputForm } from "@/lib/weekly/validation";
import type { RecruitUpdate } from "@/lib/state/schema";

interface StepRecruitingProps {
  form: WeeklyInputForm;
  onChange: (updates: Partial<WeeklyInputForm>) => void;
  errors: Record<string, string>;
  newRanking: number | null;
  onRankingChange: (ranking: number | null) => void;
}

const POSITIONS = [
  "QB",
  "RB",
  "WR",
  "TE",
  "OL",
  "DL",
  "LB",
  "DB",
  "K",
  "P",
  "ATH",
] as const;

const ACTION_LABELS: Record<RecruitUpdate["action"], string> = {
  offer: "Offered",
  commit: "Committed",
  decommit: "Decommitted",
  portal_loss: "Portal Loss",
};

function emptyRecruit(): RecruitUpdate {
  return { action: "offer", name: "", position: "", stars: 3 };
}

function StarRating({
  value,
  onSelect,
}: {
  value: number;
  onSelect: (stars: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onSelect(star)}
          className={cn(
            "text-lg transition-colors",
            star <= value ? "text-dw-accent" : "text-ink3/30"
          )}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          &#9733;
        </button>
      ))}
    </div>
  );
}

export default function StepRecruiting({
  form,
  onChange,
  errors,
  newRanking,
  onRankingChange,
}: StepRecruitingProps) {
  const recruits = form.recruitUpdates;
  const unrankedChecked = newRanking === null;

  function updateRecruit(index: number, updates: Partial<RecruitUpdate>) {
    const updated = recruits.map((recruit, i) =>
      i === index ? { ...recruit, ...updates } : recruit
    );
    onChange({ recruitUpdates: updated });
  }

  function addRecruit() {
    if (recruits.length >= 5) return;
    onChange({ recruitUpdates: [...recruits, emptyRecruit()] });
  }

  function removeRecruit(index: number) {
    const updated = recruits.filter((_, i) => i !== index);
    onChange({ recruitUpdates: updated });
  }

  return (
    <div className="space-y-8">
      {/* Section 1: Rankings */}
      <div className="space-y-4">
        <div>
          <h3 className="font-headline text-base uppercase tracking-wider text-ink">
            Recruiting &amp; Rankings
          </h3>
          <div className="mt-1 h-px w-full bg-dw-border" />
        </div>

        <div>
          <label className="block font-sans text-sm font-medium text-ink2 mb-2">
            Your new ranking
          </label>
          <div className="flex items-center gap-4">
            {!unrankedChecked && (
              <input
                type="number"
                min={1}
                max={25}
                value={newRanking ?? ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onRankingChange(
                    isNaN(val) ? null : Math.min(25, Math.max(1, val))
                  );
                }}
                placeholder="1-25"
                className={cn(
                  "w-24 rounded border bg-paper3 px-3 py-2 text-ink text-center placeholder:text-ink3",
                  "border-dw-border focus:outline-none focus:ring-2 focus:ring-dw-accent",
                  errors.newRanking && "border-dw-red"
                )}
              />
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="unranked-check"
                checked={unrankedChecked}
                onChange={(e) => {
                  onRankingChange(e.target.checked ? null : 25);
                }}
                className="h-4 w-4 rounded border-dw-border bg-paper3 text-dw-accent focus:ring-dw-accent"
              />
              <label
                htmlFor="unranked-check"
                className="font-sans text-sm text-ink2"
              >
                We dropped out / stayed unranked
              </label>
            </div>
          </div>
          {errors.newRanking && (
            <p className="mt-1 text-sm text-dw-red">{errors.newRanking}</p>
          )}
        </div>
      </div>

      {/* Section 2: Recruit Updates */}
      <div className="space-y-4">
        <div>
          <h4 className="font-sans text-sm font-medium text-ink2">
            Any recruiting news this week?
          </h4>
        </div>

        {recruits.length > 0 && (
          <div className="space-y-4">
            {recruits.map((recruit, index) => (
              <div
                key={index}
                className="rounded border border-dw-border bg-paper2 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-sans text-xs font-medium uppercase tracking-wider text-ink3">
                    Recruit {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRecruit(index)}
                    className="text-ink3 hover:text-dw-red transition-colors text-sm font-sans"
                    aria-label={`Remove recruit ${index + 1}`}
                  >
                    &times;
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Action */}
                  <div>
                    <label className="block text-xs text-ink3 mb-1">
                      Action
                    </label>
                    <select
                      value={recruit.action}
                      onChange={(e) =>
                        updateRecruit(index, {
                          action: e.target.value as RecruitUpdate["action"],
                        })
                      }
                      className={cn(
                        "w-full rounded border bg-paper3 px-3 py-2 text-sm text-ink",
                        "border-dw-border focus:outline-none focus:ring-2 focus:ring-dw-accent"
                      )}
                    >
                      {(
                        Object.entries(ACTION_LABELS) as [
                          RecruitUpdate["action"],
                          string,
                        ][]
                      ).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs text-ink3 mb-1">Name</label>
                    <input
                      type="text"
                      value={recruit.name}
                      onChange={(e) =>
                        updateRecruit(index, { name: e.target.value })
                      }
                      placeholder="Recruit name"
                      className={cn(
                        "w-full rounded border bg-paper3 px-3 py-2 text-sm text-ink placeholder:text-ink3",
                        "border-dw-border focus:outline-none focus:ring-2 focus:ring-dw-accent",
                        errors[`recruitUpdates.${index}.name`] &&
                          "border-dw-red"
                      )}
                    />
                    {errors[`recruitUpdates.${index}.name`] && (
                      <p className="mt-1 text-xs text-dw-red">
                        {errors[`recruitUpdates.${index}.name`]}
                      </p>
                    )}
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-xs text-ink3 mb-1">
                      Position
                    </label>
                    <select
                      value={recruit.position}
                      onChange={(e) =>
                        updateRecruit(index, { position: e.target.value })
                      }
                      className={cn(
                        "w-full rounded border bg-paper3 px-3 py-2 text-sm text-ink",
                        "border-dw-border focus:outline-none focus:ring-2 focus:ring-dw-accent",
                        errors[`recruitUpdates.${index}.position`] &&
                          "border-dw-red"
                      )}
                    >
                      <option value="">Select</option>
                      {POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                    {errors[`recruitUpdates.${index}.position`] && (
                      <p className="mt-1 text-xs text-dw-red">
                        {errors[`recruitUpdates.${index}.position`]}
                      </p>
                    )}
                  </div>

                  {/* Stars */}
                  <div>
                    <label className="block text-xs text-ink3 mb-1">
                      Stars
                    </label>
                    <StarRating
                      value={recruit.stars}
                      onSelect={(stars) => updateRecruit(index, { stars })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {recruits.length < 5 && (
          <button
            type="button"
            onClick={addRecruit}
            className={cn(
              "w-full rounded border border-dashed border-dw-border px-4 py-3",
              "font-sans text-sm text-ink3 hover:text-dw-accent hover:border-dw-accent transition-colors"
            )}
          >
            + Add recruit update
          </button>
        )}
      </div>
    </div>
  );
}
