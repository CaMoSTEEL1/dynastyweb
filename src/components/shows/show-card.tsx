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
  featured?: boolean;
  onSelect: () => void;
}

export function ShowCard({ config, available, week, featured = false, onSelect }: ShowCardProps) {
  const Icon = ICON_MAP[config.icon];

  // Featured card — full-width, broadcast-marquee treatment
  if (featured) {
    return (
      <button
        type="button"
        onClick={onSelect}
        disabled={!available}
        className={cn(
          "group w-full rounded border text-left transition-all",
          available
            ? "cursor-pointer border-dw-accent/40 bg-paper2 hover:border-dw-accent hover:bg-paper3"
            : "cursor-not-allowed border-dw-border bg-paper2 opacity-50"
        )}
      >
        <div className="flex items-stretch">
          {/* Left accent bar */}
          <div className={cn(
            "w-1 shrink-0 rounded-l",
            available ? "bg-dw-accent" : "bg-dw-border"
          )} />

          <div className="flex flex-1 items-center gap-5 p-5 sm:p-6">
            {/* Icon — larger for featured */}
            <div className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded border",
              available
                ? "border-dw-accent/30 bg-dw-accent/10 text-dw-accent"
                : "border-dw-border bg-paper3 text-ink3"
            )}>
              {Icon && <Icon className="h-7 w-7" />}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <h3 className={cn(
                  "font-headline text-base uppercase tracking-wider",
                  available ? "text-ink" : "text-ink3"
                )}>
                  {config.title}
                </h3>
                {available && (
                  <span className="font-sans text-[10px] uppercase tracking-widest text-dw-accent">
                    Week {week}
                  </span>
                )}
              </div>
              <p className={cn(
                "mt-0.5 font-serif text-sm italic",
                available ? "text-ink2" : "text-ink3"
              )}>
                {config.subtitle}
              </p>
              <p className={cn(
                "mt-2 text-sm leading-relaxed",
                available ? "text-ink2" : "text-ink3"
              )}>
                {config.description}
              </p>
            </div>

            {/* CTA chevron */}
            {available && (
              <span className="shrink-0 font-headline text-xl text-dw-accent/50 transition-colors group-hover:text-dw-accent">
                &rarr;
              </span>
            )}
          </div>
        </div>
      </button>
    );
  }

  // Standard compact card
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
