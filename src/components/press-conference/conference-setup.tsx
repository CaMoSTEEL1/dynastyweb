"use client";

import { cn } from "@/lib/utils";
import type { PressConfQuestion } from "@/lib/ai/press-conference-types";

interface ConferenceSetupProps {
  questions: PressConfQuestion[];
  week: number;
  coachName: string;
  school: string;
  onStart: () => void;
}

export default function ConferenceSetup({
  questions,
  week,
  coachName,
  school,
  onStart,
}: ConferenceSetupProps) {
  const reporterCount = questions.length;
  const topicPreview = questions
    .slice(0, 3)
    .map((q) => {
      const words = q.question.split(" ").slice(0, 6).join(" ");
      return words + (q.question.split(" ").length > 6 ? "..." : "");
    });

  const toneBreakdown = questions.reduce(
    (acc, q) => {
      acc[q.tone] = (acc[q.tone] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded border border-dw-border bg-paper2 p-8">
        <div className="mb-6 text-center">
          <p className="font-sans text-xs uppercase tracking-widest text-ink3">
            Week {week} Postgame
          </p>
          <h2 className="mt-2 font-headline text-2xl uppercase tracking-wide text-ink">
            Press Conference
          </h2>
          <div className="mx-auto mt-2 h-px w-24 bg-dw-accent" />
        </div>

        <div className="mb-6 space-y-4 font-serif text-sm text-ink2">
          <p>
            Coach <span className="font-semibold text-ink">{coachName}</span> of{" "}
            <span className="font-semibold text-ink">{school}</span> is about to
            address the media following Week {week}.
          </p>

          <div className="rounded border border-dw-border bg-paper3 p-4">
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-ink3">
              Media Room Details
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-ink3">Reporters present:</span>{" "}
                <span className="font-semibold text-ink">{reporterCount}</span>
              </div>
              <div>
                <span className="text-ink3">Expected mood:</span>{" "}
                <span
                  className={cn(
                    "font-semibold",
                    toneBreakdown["hostile"] || toneBreakdown["gotcha"]
                      ? "text-dw-red"
                      : toneBreakdown["friendly"]
                        ? "text-dw-green"
                        : "text-ink"
                  )}
                >
                  {toneBreakdown["hostile"] || toneBreakdown["gotcha"]
                    ? "Tense"
                    : toneBreakdown["friendly"]
                      ? "Friendly"
                      : "Business-like"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded border border-dw-border bg-paper3 p-4">
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wider text-ink3">
              Expected Topics
            </p>
            <ul className="space-y-1.5">
              {topicPreview.map((topic, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 text-dw-accent">&bull;</span>
                  <span className="text-ink2 italic">{topic}</span>
                </li>
              ))}
              {questions.length > 3 && (
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-dw-accent">&bull;</span>
                  <span className="text-ink3">
                    ...and {questions.length - 3} more
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <button
          onClick={onStart}
          className={cn(
            "w-full rounded border border-dw-accent bg-dw-accent px-6 py-3",
            "font-headline text-sm uppercase tracking-wider text-paper",
            "transition-colors hover:bg-dw-accent2 hover:border-dw-accent2",
            "focus:outline-none focus:ring-2 focus:ring-dw-accent focus:ring-offset-2 focus:ring-offset-paper2"
          )}
        >
          Step to the Podium
        </button>
      </div>
    </div>
  );
}
