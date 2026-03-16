"use client";

import { cn } from "@/lib/utils";
import type { ShowConfig } from "@/lib/shows/types";
import {
  Tv,
  Trophy,
  ArrowRightLeft,
  Target,
  Flame,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Tv,
  Trophy,
  ArrowRightLeft,
  Target,
  Flame,
};

interface ShowCardProps {
  config: ShowConfig;
  available: boolean;
  week: number;
  onSelect: () => void;
}

export function ShowCard({ config, available, week, onSelect }: ShowCardProps) {
  const Icon = ICON_MAP[config.icon];

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!available}
      className={cn(
        "group w-full rounded border border-dw-border bg-paper2 p-5 text-left transition-all",
        available
          ? "cursor-pointer hover:border-dw-accent hover:bg-paper3"
          : "cursor-not-allowed opacity-50"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded border",
            available
              ? "border-dw-accent/30 bg-dw-accent/10 text-dw-accent"
              : "border-dw-border bg-paper3 text-ink3"
          )}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "font-headline text-sm uppercase tracking-wider",
              available ? "text-ink" : "text-ink3"
            )}
          >
            {config.title}
          </h3>
          <p
            className={cn(
              "mt-0.5 font-serif text-xs italic",
              available ? "text-ink2" : "text-ink3"
            )}
          >
            {config.subtitle}
          </p>
          <p
            className={cn(
              "mt-2 text-xs leading-relaxed",
              available ? "text-ink2" : "text-ink3"
            )}
          >
            {config.description}
          </p>
          {available ? (
            <p className="mt-3 font-sans text-xs font-medium text-dw-accent transition-colors group-hover:text-dw-accent2">
              Watch Week {week} &rarr;
            </p>
          ) : (
            <p className="mt-3 font-sans text-xs text-ink3">
              Tune in after your next game
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
