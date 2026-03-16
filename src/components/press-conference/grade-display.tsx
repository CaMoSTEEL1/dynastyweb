"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { PressConfGrade } from "@/lib/ai/press-conference-types";

interface GradeDisplayProps {
  grade: PressConfGrade;
  coachName: string;
}

function getGradeColor(grade: string): string {
  const letter = grade.charAt(0).toUpperCase();
  if (letter === "A") return "text-dw-green";
  if (letter === "B") return "text-dw-accent2";
  if (letter === "C") return "text-ink2";
  if (letter === "D") return "text-dw-yellow";
  return "text-dw-red";
}

function getBarColor(score: number): string {
  if (score >= 80) return "bg-dw-green";
  if (score >= 60) return "bg-dw-accent2";
  if (score >= 40) return "bg-dw-yellow";
  return "bg-dw-red";
}

interface ScoreBarProps {
  label: string;
  score: number;
  delay: number;
}

function ScoreBar({ label, score, delay }: ScoreBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-sans text-xs uppercase tracking-wider text-ink3">
          {label}
        </span>
        <span className="font-headline text-sm text-ink">{score}</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-paper3">
        <motion.div
          className={cn("h-full rounded-full", getBarColor(score))}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function GradeDisplay({ grade, coachName }: GradeDisplayProps) {
  return (
    <motion.div
      className="mx-auto max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="rounded border border-dw-border bg-paper2 p-8">
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="font-sans text-xs uppercase tracking-widest text-ink3">
            Performance Review
          </p>
          <h2 className="mt-2 font-headline text-xl uppercase tracking-wide text-ink">
            Coach {coachName}&apos;s Press Conference Grades
          </h2>
          <div className="mx-auto mt-2 h-px w-24 bg-dw-accent" />
        </motion.div>

        <motion.div
          className="mb-8 flex justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 15 }}
        >
          <div
            className={cn(
              "flex h-24 w-24 items-center justify-center rounded-full border-4",
              grade.overall.charAt(0) === "A"
                ? "border-dw-green"
                : grade.overall.charAt(0) === "B"
                  ? "border-dw-accent2"
                  : grade.overall.charAt(0) === "C"
                    ? "border-ink3"
                    : grade.overall.charAt(0) === "D"
                      ? "border-dw-yellow"
                      : "border-dw-red"
            )}
          >
            <span className={cn("font-headline text-4xl", getGradeColor(grade.overall))}>
              {grade.overall}
            </span>
          </div>
        </motion.div>

        <motion.div
          className="mb-8 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <ScoreBar label="Composure" score={grade.composure} delay={0.7} />
          <ScoreBar label="Authenticity" score={grade.authenticity} delay={0.8} />
          <ScoreBar label="Deflection Skill" score={grade.deflectionSkill} delay={0.9} />
          <ScoreBar label="Headline Management" score={grade.headlineManagement} delay={1.0} />
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <div className="rounded border border-dw-border bg-paper3 p-4">
            <p className="font-serif text-sm leading-relaxed text-ink2">
              {grade.summary}
            </p>
          </div>
        </motion.div>

        <motion.div
          className="grid gap-4 sm:grid-cols-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <div className="rounded border border-dw-green/30 bg-dw-green/5 p-4">
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-dw-green">
              Best Moment
            </p>
            <p className="font-serif text-sm italic leading-relaxed text-ink2">
              {grade.bestMoment}
            </p>
          </div>
          <div className="rounded border border-dw-red/30 bg-dw-red/5 p-4">
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-dw-red">
              Worst Moment
            </p>
            <p className="font-serif text-sm italic leading-relaxed text-ink2">
              {grade.worstMoment}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
