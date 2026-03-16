"use client";

import { cn } from "@/lib/utils";
import type { CarouselOutcome } from "@/lib/carousel/types";

interface OutcomeDisplayProps {
  outcome: CarouselOutcome;
  className?: string;
}

const RESULT_CONFIG: Record<
  CarouselOutcome["result"],
  { label: string; color: string; borderColor: string; bgColor: string }
> = {
  stayed: {
    label: "STAYING",
    color: "text-dw-green",
    borderColor: "border-dw-green/40",
    bgColor: "bg-dw-green/5",
  },
  departed: {
    label: "DEPARTED",
    color: "text-dw-yellow",
    borderColor: "border-dw-yellow/40",
    bgColor: "bg-dw-yellow/5",
  },
  fired: {
    label: "FIRED",
    color: "text-dw-red",
    borderColor: "border-dw-red/40",
    bgColor: "bg-dw-red/5",
  },
};

export function OutcomeDisplay({ outcome, className }: OutcomeDisplayProps) {
  const config = RESULT_CONFIG[outcome.result];

  return (
    <div
      className={cn(
        "rounded border p-4",
        config.borderColor,
        config.bgColor,
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-headline text-sm uppercase tracking-wide text-ink">
          {outcome.staffMember.name}
          <span className="ml-2 font-sans text-xs normal-case tracking-normal text-ink3">
            ({outcome.staffMember.role})
          </span>
        </h3>
        <span
          className={cn(
            "shrink-0 rounded border px-2 py-0.5 font-headline text-xs tracking-wider",
            config.color,
            config.borderColor
          )}
        >
          {config.label}
        </span>
      </div>

      <p className="mt-2 font-sans text-xs text-ink3">{outcome.decision}</p>

      <p className="mt-3 font-serif text-sm leading-relaxed text-ink2">
        {outcome.narrative}
      </p>

      <div className="mt-3 rounded border border-dw-border bg-paper3 px-3 py-2">
        <p className="font-sans text-xs uppercase tracking-wider text-ink3">
          Impact on Next Season
        </p>
        <p className="mt-1 font-serif italic text-sm text-ink2">
          {outcome.impactOnNextSeason}
        </p>
      </div>
    </div>
  );
}
