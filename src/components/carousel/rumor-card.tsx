"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { CoachingRumor, CarouselOutcome } from "@/lib/carousel/types";
import { OutcomeDisplay } from "./outcome-display";

interface RumorCardProps {
  rumor: CoachingRumor;
  dynastyId: string;
  onResolved: (outcome: CarouselOutcome) => void;
  className?: string;
}

const TYPE_LABELS: Record<CoachingRumor["type"], string> = {
  interview_request: "Interview Request",
  poaching_attempt: "Poaching Attempt",
  forced_departure: "Forced Departure",
  loyalty_test: "Loyalty Test",
};

const TYPE_STYLES: Record<CoachingRumor["type"], string> = {
  interview_request: "bg-dw-accent/20 text-dw-accent border-dw-accent/40",
  poaching_attempt: "bg-dw-yellow/20 text-dw-yellow border-dw-yellow/40",
  forced_departure: "bg-dw-red/20 text-dw-red border-dw-red/40",
  loyalty_test: "bg-dw-green/20 text-dw-green border-dw-green/40",
};

const URGENCY_STYLES: Record<CoachingRumor["urgency"], { label: string; dot: string }> = {
  low: { label: "Low Urgency", dot: "bg-dw-green" },
  medium: { label: "Medium Urgency", dot: "bg-dw-yellow" },
  high: { label: "High Urgency", dot: "bg-dw-red" },
};

export function RumorCard({
  rumor,
  dynastyId,
  onResolved,
  className,
}: RumorCardProps) {
  const [resolving, setResolving] = useState(false);
  const [outcome, setOutcome] = useState<CarouselOutcome | null>(null);
  const [error, setError] = useState<string | null>(null);

  const typeStyle = TYPE_STYLES[rumor.type];
  const urgency = URGENCY_STYLES[rumor.urgency];

  async function handleDecision(
    decision: "retain" | "release" | "counter_offer",
    bonusOffered: boolean
  ) {
    setResolving(true);
    setError(null);

    try {
      const res = await fetch("/api/carousel/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dynastyId,
          rumor,
          decision: {
            rumorId: rumor.id,
            decision,
            bonusOffered,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error((data as { error?: string }).error ?? "Failed to resolve decision");
      }

      const data = await res.json();
      const resolved = (data as { outcome: CarouselOutcome }).outcome;
      setOutcome(resolved);
      onResolved(resolved);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setResolving(false);
    }
  }

  if (outcome) {
    return <OutcomeDisplay outcome={outcome} className={className} />;
  }

  return (
    <div
      className={cn(
        "rounded border border-dw-border bg-paper2 p-4",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded border px-2 py-0.5 text-xs font-sans font-medium uppercase tracking-wider",
            typeStyle
          )}
        >
          {TYPE_LABELS[rumor.type]}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={cn("inline-block h-2 w-2 rounded-full", urgency.dot)} />
          <span className="font-sans text-xs text-ink3">{urgency.label}</span>
        </div>
      </div>

      <div className="mt-3">
        <p className="font-headline text-sm uppercase tracking-wide text-ink">
          {rumor.staffMember.name}{" "}
          <span className="font-sans text-xs normal-case tracking-normal text-ink3">
            ({rumor.staffMember.role})
          </span>
        </p>
        <p className="mt-1 font-sans text-xs text-ink3">
          Suitor:{" "}
          <span className="font-medium text-ink2">{rumor.suitor}</span>
        </p>
      </div>

      <p className="mt-3 font-serif text-sm leading-relaxed text-ink2">
        {rumor.narrative}
      </p>

      {error && (
        <p className="mt-3 font-serif text-sm text-dw-red">{error}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleDecision("retain", false)}
          disabled={resolving}
          className={cn(
            "rounded border border-dw-green/40 bg-dw-green/10 px-3 py-1.5 font-sans text-xs font-medium uppercase tracking-wider text-dw-green transition-colors",
            "hover:bg-dw-green/20 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {resolving ? "Resolving..." : "Retain"}
        </button>
        <button
          onClick={() => handleDecision("release", false)}
          disabled={resolving}
          className={cn(
            "rounded border border-dw-red/40 bg-dw-red/10 px-3 py-1.5 font-sans text-xs font-medium uppercase tracking-wider text-dw-red transition-colors",
            "hover:bg-dw-red/20 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {resolving ? "Resolving..." : "Release"}
        </button>
        <button
          onClick={() => handleDecision("counter_offer", true)}
          disabled={resolving}
          className={cn(
            "rounded border border-dw-accent/40 bg-dw-accent/10 px-3 py-1.5 font-sans text-xs font-medium uppercase tracking-wider text-dw-accent transition-colors",
            "hover:bg-dw-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {resolving ? "Resolving..." : "Counter Offer"}
        </button>
      </div>
    </div>
  );
}
