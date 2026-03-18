"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const MAX_CHARS = 280;

export interface CoachPostRow {
  id: string;
  body: string;
  likes: number;
  reposts: number;
  created_at: string;
  week: number;
}

interface CoachComposeProps {
  coachName: string;
  dynastyId: string;
  seasonId: string;
  week: number;
  onPost: (post: CoachPostRow) => void;
}

function getCoachHandle(coachName: string): string {
  const lastName = coachName.trim().split(" ").pop() ?? coachName;
  return `@Coach${lastName}`;
}

function getInitials(coachName: string): string {
  const parts = coachName.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return (parts[0]?.[0] ?? "C").toUpperCase();
}

export function CoachCompose({ coachName, dynastyId, seasonId, week, onPost }: CoachComposeProps) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = getCoachHandle(coachName);
  const initials = getInitials(coachName);
  const charsLeft = MAX_CHARS - body.length;
  const isOverLimit = charsLeft < 0;

  const handleSubmit = useCallback(async () => {
    if (!body.trim() || isOverLimit || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/social/coach-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim(), dynastyId, seasonId, week }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Post failed");
      }

      const post = await res.json() as CoachPostRow;
      setBody("");
      onPost(post);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post. Try again.");
    } finally {
      setSubmitting(false);
    }
  }, [body, isOverLimit, submitting, dynastyId, seasonId, week, onPost]);

  return (
    <div className="rounded border border-dw-border bg-paper2 p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dw-accent2 text-sm font-bold text-paper">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-baseline gap-2">
            <span className="font-sans text-sm font-bold text-ink">{coachName}</span>
            <span className="font-sans text-xs text-ink3">{handle}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-wide",
                "bg-dw-accent2/20 text-dw-accent2"
              )}
            >
              Coach
            </span>
          </div>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind, Coach?"
            rows={3}
            className={cn(
              "w-full rounded border border-dw-border bg-paper p-3",
              "font-serif text-sm text-ink placeholder:text-ink3",
              "resize-none focus:border-dw-accent focus:outline-none focus:ring-1 focus:ring-dw-accent"
            )}
          />

          <div className="mt-2 flex items-center justify-between">
            <span
              className={cn(
                "font-sans text-xs",
                isOverLimit ? "text-dw-red" : charsLeft <= 20 ? "text-dw-yellow" : "text-ink3"
              )}
            >
              {charsLeft}
            </span>

            <button
              onClick={() => void handleSubmit()}
              disabled={!body.trim() || isOverLimit || submitting}
              className={cn(
                "rounded border border-dw-accent2 bg-dw-accent2 px-4 py-1.5",
                "font-sans text-xs uppercase tracking-wider text-paper",
                "transition-colors hover:opacity-90",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>

          {error && (
            <p className="mt-1 font-sans text-xs text-dw-red">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
