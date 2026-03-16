"use client";

import { useState, useCallback } from "react";
import { Loader2, Send, AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExtractionResult } from "@/lib/extraction/types";

interface TextInputProps {
  onExtracted: (result: ExtractionResult) => void;
  week: number;
  school: string;
  conference: string;
}

const MAX_CHARS = 5000;

const PLACEHOLDER = `Just tell us what happened... "Beat Alabama 35-28 at home, close game, our QB threw for 300 yards and 3 TDs. We moved up to #8 in the rankings."`;

type InputState =
  | { status: "idle" }
  | { status: "extracting" }
  | { status: "error"; message: string }
  | { status: "done" };

export default function TextInput({
  onExtracted,
  week,
  school,
  conference,
}: TextInputProps) {
  const [text, setText] = useState("");
  const [state, setState] = useState<InputState>({ status: "idle" });

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSubmit =
    text.trim().length > 10 && !isOverLimit && state.status !== "extracting";

  const handleExtract = useCallback(async () => {
    if (!canSubmit) return;

    setState({ status: "extracting" });

    try {
      const response = await fetch("/api/extract/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), week, school, conference }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: "Request failed" }));
        throw new Error(
          (body as { error?: string }).error || `Server error ${response.status}`
        );
      }

      const data = (await response.json()) as {
        success: boolean;
        result: ExtractionResult | null;
        error?: string;
      };

      if (!data.success || !data.result) {
        throw new Error(data.error || "Could not extract data from your text");
      }

      setState({ status: "done" });
      onExtracted(data.result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setState({ status: "error", message });
    }
  }, [canSubmit, text, week, school, conference, onExtracted]);

  const handleReset = useCallback(() => {
    setState({ status: "idle" });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && canSubmit) {
        e.preventDefault();
        handleExtract();
      }
    },
    [canSubmit, handleExtract]
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (state.status === "error") setState({ status: "idle" });
          }}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDER}
          disabled={state.status === "extracting"}
          rows={6}
          className={cn(
            "w-full resize-none rounded border bg-paper3 px-4 py-3",
            "font-serif text-sm leading-relaxed text-ink placeholder:text-ink3/60",
            "transition-colors focus:outline-none focus:ring-1",
            isOverLimit
              ? "border-dw-red focus:border-dw-red focus:ring-dw-red/30"
              : "border-dw-border focus:border-dw-accent focus:ring-dw-accent/30",
            state.status === "extracting" && "opacity-60"
          )}
        />
        {state.status === "extracting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded bg-paper/50">
            <Loader2 className="h-6 w-6 animate-spin text-dw-accent" />
            <p className="font-serif text-sm italic text-ink2">
              Parsing your report...
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-sans text-xs",
            isOverLimit ? "text-dw-red" : "text-ink3"
          )}
        >
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>

        {state.status === "error" && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-dw-red" />
              <span className="font-sans text-xs text-dw-red">{state.message}</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 font-sans text-xs text-ink3 underline hover:text-ink2"
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}
      </div>

      {state.status === "done" ? (
        <div className="rounded border border-dw-green/30 bg-dw-green/10 px-4 py-3">
          <p className="font-sans text-sm text-dw-green">
            Data extracted from your report.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleExtract}
          disabled={!canSubmit}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded bg-dw-accent px-4 py-2.5",
            "font-sans text-sm font-semibold uppercase tracking-wider text-white",
            "transition-opacity hover:opacity-90",
            "disabled:cursor-not-allowed disabled:opacity-40"
          )}
        >
          <Send className="h-4 w-4" />
          Extract Data
        </button>
      )}
    </div>
  );
}
