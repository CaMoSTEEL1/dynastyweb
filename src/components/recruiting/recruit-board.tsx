"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  STATUS_COLORS,
  STATUS_TRANSITIONS,
  TREND_CONFIG,
} from "@/lib/recruiting/types";
import type { Recruit, StorylineEntry } from "@/lib/recruiting/types";
import { updateRecruitStatus, removeRecruit } from "@/lib/recruiting/actions";

interface RecruitBoardProps {
  recruits: Recruit[];
  dynastyId: string;
  seasonId: string;
  onUpdate: () => void;
}

function StarDisplay({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={cn(
            "h-4 w-4",
            i < count ? "fill-dw-yellow text-dw-yellow" : "fill-none text-ink3"
          )}
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      ))}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] ?? "text-ink2 border-ink2";
  return (
    <span
      className={cn(
        "inline-block rounded border px-2 py-0.5 font-sans text-xs uppercase tracking-wide",
        colorClass
      )}
    >
      {status}
    </span>
  );
}

function TrendIndicator({ trend }: { trend: string }) {
  const config = TREND_CONFIG[trend] ?? TREND_CONFIG.stable;
  return (
    <span
      className={cn("inline-flex items-center gap-1 font-sans text-xs", config.color)}
      title={config.label}
    >
      <span className="text-sm leading-none">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

function StorylineTimeline({ entries }: { entries: StorylineEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="font-serif text-sm italic text-ink3">
        No storyline updates yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry, idx) => (
        <div
          key={idx}
          className="border-l-2 border-dw-border pl-3"
        >
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs font-medium text-ink3">
              Week {entry.week}
            </span>
            {entry.statusChange && (
              <span className="font-sans text-xs text-dw-accent2">
                {entry.statusChange}
              </span>
            )}
          </div>
          <p className="mt-0.5 font-serif text-sm text-ink2">{entry.text}</p>
        </div>
      ))}
    </div>
  );
}

function RecruitRow({
  recruit,
  onUpdate,
}: {
  recruit: Recruit;
  onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [statusError, setStatusError] = useState<string | null>(null);

  const validTransitions = STATUS_TRANSITIONS[recruit.status] ?? [];

  function handleStatusChange(newStatus: string) {
    setStatusError(null);
    startTransition(async () => {
      const result = await updateRecruitStatus(recruit.id, newStatus, 1);
      if (result.success) {
        onUpdate();
      } else {
        setStatusError(result.error ?? "Failed to update status");
      }
    });
  }

  function handleRemove() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    startTransition(async () => {
      const result = await removeRecruit(recruit.id);
      if (result.success) {
        onUpdate();
      } else {
        setStatusError(result.error ?? "Failed to remove recruit");
      }
      setConfirmDelete(false);
    });
  }

  return (
    <div className="border-b border-dw-border last:border-b-0">
      <div
        className={cn(
          "flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors hover:bg-paper2",
          expanded && "bg-paper2"
        )}
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        <div className="w-24 shrink-0">
          <StarDisplay count={recruit.stars} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-headline text-sm uppercase tracking-wide text-ink">
            {recruit.name}
          </span>
        </div>
        <div className="w-12 shrink-0 text-center">
          <span className="font-sans text-xs text-ink2">{recruit.position}</span>
        </div>
        <div className="w-28 shrink-0 text-center">
          <StatusBadge status={recruit.status} />
        </div>
        <div className="w-20 shrink-0 text-center">
          <TrendIndicator trend={recruit.trend} />
        </div>
        <div className="flex w-8 shrink-0 items-center justify-center">
          <svg
            className={cn(
              "h-4 w-4 text-ink3 transition-transform",
              expanded && "rotate-180"
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-dw-border bg-paper3 px-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-headline text-xs uppercase tracking-wider text-ink3">
                Backstory
              </h4>
              <p className="font-serif text-sm leading-relaxed text-ink2">
                {recruit.backstory || "No backstory generated yet."}
              </p>
            </div>
            <div>
              <h4 className="mb-2 font-headline text-xs uppercase tracking-wider text-ink3">
                Storyline
              </h4>
              <StorylineTimeline entries={recruit.storylineHistory} />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-dw-border pt-3">
            {validTransitions.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-sans text-xs text-ink3">
                  Update status:
                </span>
                {validTransitions.map((status) => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(status);
                    }}
                    disabled={isPending}
                    className={cn(
                      "rounded border px-2 py-1 font-sans text-xs uppercase tracking-wide transition-colors hover:bg-paper4 disabled:opacity-50",
                      STATUS_COLORS[status] ?? "border-ink3 text-ink3"
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}

            <div className="ml-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={isPending}
                className={cn(
                  "rounded px-2 py-1 font-sans text-xs transition-colors disabled:opacity-50",
                  confirmDelete
                    ? "bg-dw-red text-paper font-medium"
                    : "text-ink3 hover:text-dw-red"
                )}
              >
                {confirmDelete ? "Confirm Remove" : "\u00D7 Remove"}
              </button>
            </div>
          </div>

          {statusError && (
            <p className="mt-2 font-sans text-xs text-dw-red">{statusError}</p>
          )}

          {isPending && (
            <p className="mt-2 font-sans text-xs italic text-ink3">
              Updating...
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function RecruitBoard({
  recruits,
  dynastyId,
  seasonId,
  onUpdate,
}: RecruitBoardProps) {
  if (recruits.length === 0) {
    return (
      <div className="rounded border border-dw-border bg-paper2 px-6 py-12 text-center">
        <p className="font-serif text-ink2">
          Your recruiting board is clean. Add prospects above to start tracking
          their storylines.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-dw-border bg-paper">
      <div className="flex items-center gap-4 border-b border-dw-border bg-paper2 px-4 py-2">
        <div className="w-24 shrink-0">
          <span className="font-headline text-xs uppercase tracking-wider text-ink3">
            Stars
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <span className="font-headline text-xs uppercase tracking-wider text-ink3">
            Name
          </span>
        </div>
        <div className="w-12 shrink-0 text-center">
          <span className="font-headline text-xs uppercase tracking-wider text-ink3">
            Pos
          </span>
        </div>
        <div className="w-28 shrink-0 text-center">
          <span className="font-headline text-xs uppercase tracking-wider text-ink3">
            Status
          </span>
        </div>
        <div className="w-20 shrink-0 text-center">
          <span className="font-headline text-xs uppercase tracking-wider text-ink3">
            Trend
          </span>
        </div>
        <div className="w-8 shrink-0" />
      </div>

      {recruits.map((recruit) => (
        <RecruitRow
          key={recruit.id}
          recruit={recruit}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
