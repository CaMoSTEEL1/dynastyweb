"use client";

import { cn } from "@/lib/utils";
import type { SeasonArchive } from "@/lib/trophy/types";

interface SeasonArchiveCardProps {
  archive: SeasonArchive;
  className?: string;
}

export function SeasonArchiveCard({ archive, className }: SeasonArchiveCardProps) {
  const isWinningSeason = archive.record.wins > archive.record.losses;
  const isUndefeated = archive.record.losses === 0 && archive.record.wins > 0;

  return (
    <article
      className={cn(
        "rounded border border-dw-border bg-paper2 p-6",
        className
      )}
    >
      {/* Header: Year + Record */}
      <header className="mb-4 border-b border-dw-border pb-4">
        <div className="flex items-baseline justify-between">
          <h3 className="font-headline text-3xl tracking-tight text-ink">
            {archive.year}
          </h3>
          <div className="text-right">
            <span
              className={cn(
                "font-headline text-2xl",
                isUndefeated
                  ? "text-dw-accent"
                  : isWinningSeason
                    ? "text-dw-green"
                    : "text-dw-red"
              )}
            >
              {archive.record.wins}-{archive.record.losses}
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 font-sans text-xs uppercase tracking-wider text-ink3">
          <span>
            Conference: {archive.conferenceRecord.wins}-
            {archive.conferenceRecord.losses}
          </span>
          <span>
            {archive.finalRanking !== null
              ? `Final Ranking: #${archive.finalRanking}`
              : "Unranked"}
          </span>
          <span>Coach Year {archive.coachYear}</span>
          <span>Win Streak: {archive.longestWinStreak}</span>
        </div>
      </header>

      {/* Biggest Win / Worst Loss */}
      {(archive.biggestWin || archive.worstLoss) && (
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {archive.biggestWin && (
            <div className="rounded bg-paper3 px-3 py-2">
              <p className="font-sans text-[10px] uppercase tracking-widest text-ink3">
                Biggest Win
              </p>
              <p className="mt-0.5 font-serif text-sm text-dw-green">
                {archive.biggestWin}
              </p>
            </div>
          )}
          {archive.worstLoss && (
            <div className="rounded bg-paper3 px-3 py-2">
              <p className="font-sans text-[10px] uppercase tracking-widest text-ink3">
                Worst Loss
              </p>
              <p className="mt-0.5 font-serif text-sm text-dw-red">
                {archive.worstLoss}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Highlights */}
      {archive.highlights.length > 0 && (
        <div className="mb-4">
          <p className="mb-1.5 font-sans text-[10px] uppercase tracking-widest text-ink3">
            Season Highlights
          </p>
          <ul className="space-y-1">
            {archive.highlights.map((highlight, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 font-serif text-sm text-ink2"
              >
                <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-dw-accent" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Awards */}
      {archive.awards.length > 0 && (
        <div className="mb-4">
          <p className="mb-1.5 font-sans text-[10px] uppercase tracking-widest text-ink3">
            Awards & Honors
          </p>
          <div className="flex flex-wrap gap-2">
            {archive.awards.map((award, idx) => (
              <span
                key={idx}
                className="rounded-sm border border-dw-accent/30 bg-dw-accent/10 px-2 py-0.5 font-sans text-xs text-dw-accent"
              >
                {award}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Playoff Result */}
      {archive.playoffResult && (
        <div className="mb-4 rounded bg-paper3 px-3 py-2">
          <p className="font-sans text-[10px] uppercase tracking-widest text-ink3">
            Playoff Result
          </p>
          <p className="mt-0.5 font-headline text-sm text-dw-accent">
            {archive.playoffResult}
          </p>
        </div>
      )}

      {/* Fan Sentiment */}
      <div className="mb-4">
        <p className="font-sans text-[10px] uppercase tracking-widest text-ink3">
          Fan Sentiment
        </p>
        <p className="mt-0.5 font-serif text-sm italic text-ink2">
          {archive.fanSentiment}
        </p>
      </div>

      {/* Recap with drop cap */}
      {archive.recap && (
        <div className="border-t border-dw-border pt-4">
          <p className="mb-2 font-sans text-[10px] uppercase tracking-widest text-ink3">
            Season Recap
          </p>
          <div className="font-serif text-sm leading-relaxed text-ink2">
            {archive.recap.length > 0 && (
              <p>
                <span className="float-left mr-1 mt-0.5 font-headline text-4xl leading-none text-ink">
                  {archive.recap[0]}
                </span>
                {archive.recap.slice(1)}
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
