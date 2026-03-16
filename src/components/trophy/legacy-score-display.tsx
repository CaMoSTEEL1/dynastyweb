"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LegacyScore } from "@/lib/trophy/types";

interface LegacyScoreDisplayProps {
  score: LegacyScore;
  className?: string;
}

const gradeColors: Record<string, string> = {
  S: "text-dw-accent",
  A: "text-dw-green",
  B: "text-dw-green",
  C: "text-dw-yellow",
  D: "text-dw-red",
  F: "text-dw-red",
};

const gradeBgColors: Record<string, string> = {
  S: "bg-dw-accent/10 border-dw-accent/30",
  A: "bg-dw-green/10 border-dw-green/30",
  B: "bg-dw-green/10 border-dw-green/30",
  C: "bg-dw-yellow/10 border-dw-yellow/30",
  D: "bg-dw-red/10 border-dw-red/30",
  F: "bg-dw-red/10 border-dw-red/30",
};

interface BreakdownBarProps {
  label: string;
  value: number;
  max: number;
}

function BreakdownBar({ label, value, max }: BreakdownBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs uppercase tracking-wider text-ink3">
          {label}
        </span>
        <span className="font-sans text-xs text-ink2">
          {value}/{max}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-paper3">
        <motion.div
          className="h-full rounded-full bg-dw-accent"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}

export function LegacyScoreDisplay({ score, className }: LegacyScoreDisplayProps) {
  const gradeColor = gradeColors[score.grade] ?? "text-ink";
  const gradeBg = gradeBgColors[score.grade] ?? "bg-paper3 border-dw-border";

  return (
    <div
      className={cn(
        "rounded border border-dw-border bg-paper2 p-6",
        className
      )}
    >
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Grade circle */}
        <motion.div
          className={cn(
            "flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-2",
            gradeBg
          )}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <div className="text-center">
            <motion.span
              className={cn("block font-headline text-5xl", gradeColor)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {score.grade}
            </motion.span>
            <span className="block font-sans text-xs text-ink3">GRADE</span>
          </div>
        </motion.div>

        {/* Score and breakdown */}
        <div className="flex-1">
          <div className="mb-4 flex items-baseline gap-2">
            <span className="font-headline text-4xl text-ink">{score.total}</span>
            <span className="font-sans text-sm text-ink3">/ 100</span>
          </div>

          <div className="mb-4 space-y-2.5">
            <BreakdownBar label="Wins" value={score.breakdown.wins} max={30} />
            <BreakdownBar
              label="Championships"
              value={score.breakdown.championships}
              max={25}
            />
            <BreakdownBar
              label="Recruiting"
              value={score.breakdown.recruiting}
              max={15}
            />
            <BreakdownBar
              label="Prestige"
              value={score.breakdown.prestige}
              max={15}
            />
            <BreakdownBar
              label="Playoffs"
              value={score.breakdown.playoffs}
              max={15}
            />
          </div>

          <p className="font-serif text-sm italic leading-relaxed text-ink2">
            {score.narrative}
          </p>
        </div>
      </div>
    </div>
  );
}
