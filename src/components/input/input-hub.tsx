"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Camera, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExtractionResult } from "@/lib/extraction/types";
import type { WeeklyInputForm } from "@/lib/weekly/validation";
import { submitWeeklyData } from "@/lib/weekly/actions";
import ScreenshotUpload from "./screenshot-upload";
import TextInput from "./text-input";
import RankingsUpload from "./rankings-upload";
import ConfidenceReview from "./confidence-review";

interface InputHubProps {
  dynastyId: string;
  currentWeek: number;
  school: string;
  conference: string;
}

type Stage =
  | { phase: "capture" }
  | { phase: "review"; result: ExtractionResult }
  | { phase: "submitting" };

function mergeExtractions(
  existing: ExtractionResult | null,
  incoming: ExtractionResult
): ExtractionResult {
  if (!existing) return incoming;

  const merged = { ...existing };
  const keys: Array<keyof ExtractionResult> = [
    "opponent",
    "opponentRanking",
    "homeAway",
    "userScore",
    "opponentScore",
    "gameVibe",
    "notableMoment",
    "statLeaders",
    "recruitUpdates",
    "newRanking",
    "top25",
  ];

  for (const key of keys) {
    const existingField = existing[key];
    const incomingField = incoming[key];

    if (incomingField === null) continue;
    if (existingField === null) {
      (merged as Record<string, unknown>)[key] = incomingField;
      continue;
    }

    if (
      typeof existingField === "object" &&
      "confidence" in existingField &&
      typeof incomingField === "object" &&
      "confidence" in incomingField
    ) {
      const confidenceRank: Record<string, number> = {
        high: 4,
        medium: 3,
        low: 2,
        missing: 1,
      };
      const existingRank = confidenceRank[existingField.confidence] || 0;
      const incomingRank = confidenceRank[incomingField.confidence] || 0;

      if (incomingRank > existingRank) {
        (merged as Record<string, unknown>)[key] = incomingField;
      }
    }
  }

  return merged;
}

export default function InputHub({
  dynastyId,
  currentWeek,
  school,
  conference,
}: InputHubProps) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>({ phase: "capture" });
  const [extractionResult, setExtractionResult] =
    useState<ExtractionResult | null>(null);
  const [activeMode, setActiveMode] = useState<"screenshot" | "text" | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleExtracted = useCallback(
    (result: ExtractionResult) => {
      const merged = mergeExtractions(extractionResult, result);
      setExtractionResult(merged);
      setStage({ phase: "review", result: merged });
    },
    [extractionResult]
  );

  const handleRankingsExtracted = useCallback(
    (
      rankings: Array<{ rank: number; team: string; record: string }>,
      userRanking: number | null
    ) => {
      setExtractionResult((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        if (userRanking !== null) {
          updated.newRanking = {
            value: userRanking,
            confidence: "high",
            source: "screenshot",
          };
        }
        updated.top25 = {
          value: rankings,
          confidence: "high",
          source: "screenshot",
        };
        return updated;
      });
    },
    []
  );

  const handleConfirm = useCallback(
    async (finalData: WeeklyInputForm) => {
      setStage({ phase: "submitting" });
      setSubmitError(null);

      const result = await submitWeeklyData(dynastyId, finalData);

      if (result.success) {
        router.push(`/${dynastyId}?submissionId=${result.submissionId}`);
      } else {
        setSubmitError(result.error);
        // Always go back to review so the user can see the error and retry
        if (extractionResult) {
          setStage({ phase: "review", result: extractionResult });
        } else {
          setStage({ phase: "capture" });
        }
      }
    },
    [dynastyId, router, extractionResult]
  );

  const handleReExtract = useCallback(() => {
    setExtractionResult(null);
    setActiveMode(null);
    setStage({ phase: "capture" });
  }, []);

  if (stage.phase === "submitting") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-dw-accent" />
        <p className="font-serif text-sm italic text-ink2">
          Filing your report and generating the news cycle...
        </p>
        {submitError && (
          <div className="w-full rounded border border-dw-red/30 bg-dw-red/10 px-4 py-3">
            <p className="font-sans text-sm text-dw-red">{submitError}</p>
          </div>
        )}
      </div>
    );
  }

  if (stage.phase === "review") {
    return (
      <div className="space-y-4">
        {submitError && (
          <div className="rounded border border-dw-red/30 bg-dw-red/10 px-4 py-3">
            <p className="font-sans text-sm text-dw-red">{submitError}</p>
          </div>
        )}
        <ConfidenceReview
          result={stage.result}
          week={currentWeek}
          onConfirm={handleConfirm}
          onReExtract={handleReExtract}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {activeMode === null && (
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveMode("screenshot")}
            className={cn(
              "group flex flex-col items-center gap-4 rounded border-2 border-dw-border bg-paper2 p-8 transition-all",
              "hover:border-dw-accent hover:bg-paper3"
            )}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper3 transition-colors group-hover:bg-dw-accent/10">
              <Camera className="h-8 w-8 text-ink3 transition-colors group-hover:text-dw-accent" />
            </div>
            <div className="text-center">
              <h3 className="font-headline text-sm uppercase tracking-wider text-ink">
                Upload Screenshot
              </h3>
              <p className="mt-1 font-serif text-xs italic text-ink3">
                Drop in your box score, rankings, or game recap screen
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode("text")}
            className={cn(
              "group flex flex-col items-center gap-4 rounded border-2 border-dw-border bg-paper2 p-8 transition-all",
              "hover:border-dw-accent hover:bg-paper3"
            )}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper3 transition-colors group-hover:bg-dw-accent/10">
              <MessageSquare className="h-8 w-8 text-ink3 transition-colors group-hover:text-dw-accent" />
            </div>
            <div className="text-center">
              <h3 className="font-headline text-sm uppercase tracking-wider text-ink">
                Tell Us What Happened
              </h3>
              <p className="mt-1 font-serif text-xs italic text-ink3">
                Describe your game in your own words
              </p>
            </div>
          </button>
        </div>
      )}

      {activeMode === "screenshot" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-sm uppercase tracking-wider text-ink">
              Upload Screenshot
            </h3>
            <button
              type="button"
              onClick={() => setActiveMode(null)}
              className="font-sans text-xs text-ink3 underline transition-colors hover:text-ink2"
            >
              Back to options
            </button>
          </div>

          <ScreenshotUpload
            onExtracted={handleExtracted}
            week={currentWeek}
            school={school}
            conference={conference}
          />

          <div className="border-t border-dw-border pt-4">
            <RankingsUpload
              onRankingsExtracted={handleRankingsExtracted}
              school={school}
            />
          </div>

          <div className="border-t border-dw-border pt-4">
            <button
              type="button"
              onClick={() => setActiveMode("text")}
              className="flex items-center gap-2 font-sans text-xs text-ink3 transition-colors hover:text-ink2"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Want to add extra context? Switch to text input
            </button>
          </div>
        </div>
      )}

      {activeMode === "text" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-sm uppercase tracking-wider text-ink">
              Tell Us What Happened
            </h3>
            <button
              type="button"
              onClick={() => setActiveMode(null)}
              className="font-sans text-xs text-ink3 underline transition-colors hover:text-ink2"
            >
              Back to options
            </button>
          </div>

          <TextInput
            onExtracted={handleExtracted}
            week={currentWeek}
            school={school}
            conference={conference}
          />

          <div className="border-t border-dw-border pt-4">
            <RankingsUpload
              onRankingsExtracted={handleRankingsExtracted}
              school={school}
            />
          </div>

          <div className="border-t border-dw-border pt-4">
            <button
              type="button"
              onClick={() => setActiveMode("screenshot")}
              className="flex items-center gap-2 font-sans text-xs text-ink3 transition-colors hover:text-ink2"
            >
              <Camera className="h-3.5 w-3.5" />
              Have a screenshot? Switch to upload
            </button>
          </div>
        </div>
      )}

      {submitError && (
        <div className="rounded border border-dw-red/30 bg-dw-red/10 px-4 py-3">
          <p className="font-sans text-sm text-dw-red">{submitError}</p>
        </div>
      )}
    </div>
  );
}
