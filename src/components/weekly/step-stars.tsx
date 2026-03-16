"use client";

import { cn } from "@/lib/utils";
import type { WeeklyInputForm } from "@/lib/weekly/validation";
import type { StatLeader } from "@/lib/state/schema";

interface StepStarsProps {
  form: WeeklyInputForm;
  onChange: (updates: Partial<WeeklyInputForm>) => void;
  errors: Record<string, string>;
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

function emptyStatLeader(): StatLeader {
  return { name: "", position: "", stat: "" };
}

export default function StepStars({ form, onChange, errors }: StepStarsProps) {
  const leaders = form.statLeaders;

  function updateLeader(index: number, updates: Partial<StatLeader>) {
    const updated = leaders.map((leader, i) =>
      i === index ? { ...leader, ...updates } : leader
    );
    onChange({ statLeaders: updated });
  }

  function addLeader() {
    if (leaders.length >= 3) return;
    onChange({ statLeaders: [...leaders, emptyStatLeader()] });
  }

  function removeLeader(index: number) {
    const updated = leaders.filter((_, i) => i !== index);
    onChange({ statLeaders: updated });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-headline text-base uppercase tracking-wider text-ink">
          Star Performers
        </h3>
        <p className="mt-1 text-sm text-ink3 font-serif italic">
          Who made the difference? (Optional but gives richer content)
        </p>
      </div>

      <div className="space-y-4">
        {leaders.map((leader, index) => (
          <div
            key={index}
            className="rounded border border-dw-border bg-paper2 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-sans text-xs font-medium uppercase tracking-wider text-ink3">
                Player {index + 1}
              </span>
              {leaders.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLeader(index)}
                  className="text-ink3 hover:text-dw-red transition-colors text-sm font-sans"
                  aria-label={`Remove player ${index + 1}`}
                >
                  &times;
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Name */}
              <div>
                <label className="block text-xs text-ink3 mb-1">Name</label>
                <input
                  type="text"
                  value={leader.name}
                  onChange={(e) =>
                    updateLeader(index, { name: e.target.value })
                  }
                  placeholder="Player name"
                  className={cn(
                    "w-full rounded border bg-paper3 px-3 py-2 text-sm text-ink placeholder:text-ink3",
                    "border-dw-border focus:outline-none focus:ring-2 focus:ring-dw-accent",
                    errors[`statLeaders.${index}.name`] && "border-dw-red"
                  )}
                />
                {errors[`statLeaders.${index}.name`] && (
                  <p className="mt-1 text-xs text-dw-red">
                    {errors[`statLeaders.${index}.name`]}
                  </p>
                )}
              </div>

              {/* Position */}
              <div>
                <label className="block text-xs text-ink3 mb-1">
                  Position
                </label>
                <select
                  value={leader.position}
                  onChange={(e) =>
                    updateLeader(index, { position: e.target.value })
                  }
                  className={cn(
                    "w-full rounded border bg-paper3 px-3 py-2 text-sm text-ink",
                    "border-dw-border focus:outline-none focus:ring-2 focus:ring-dw-accent",
                    errors[`statLeaders.${index}.position`] && "border-dw-red"
                  )}
                >
                  <option value="">Select</option>
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
                {errors[`statLeaders.${index}.position`] && (
                  <p className="mt-1 text-xs text-dw-red">
                    {errors[`statLeaders.${index}.position`]}
                  </p>
                )}
              </div>

              {/* Key Stat */}
              <div>
                <label className="block text-xs text-ink3 mb-1">
                  Key Stat
                </label>
                <input
                  type="text"
                  value={leader.stat}
                  onChange={(e) =>
                    updateLeader(index, { stat: e.target.value })
                  }
                  placeholder="e.g. 325 yds, 4 TD"
                  className={cn(
                    "w-full rounded border bg-paper3 px-3 py-2 text-sm text-ink placeholder:text-ink3",
                    "border-dw-border focus:outline-none focus:ring-2 focus:ring-dw-accent",
                    errors[`statLeaders.${index}.stat`] && "border-dw-red"
                  )}
                />
                {errors[`statLeaders.${index}.stat`] && (
                  <p className="mt-1 text-xs text-dw-red">
                    {errors[`statLeaders.${index}.stat`]}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {leaders.length < 3 && (
        <button
          type="button"
          onClick={addLeader}
          className={cn(
            "w-full rounded border border-dashed border-dw-border px-4 py-3",
            "font-sans text-sm text-ink3 hover:text-dw-accent hover:border-dw-accent transition-colors"
          )}
        >
          + Add another player
        </button>
      )}
    </div>
  );
}
