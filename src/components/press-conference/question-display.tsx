"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { PressConfQuestion, ResponseOption } from "@/lib/ai/press-conference-types";

type ResponseMode = "choice" | "text" | "voice";

interface QuestionDisplayProps {
  question: PressConfQuestion;
  questionIndex: number;
  totalQuestions: number;
  responseOptions: ResponseOption[] | null;
  isFollowUp: boolean;
  onAnswer: (answer: string, tone: string, mode: ResponseMode) => void;
  onNextQuestion: () => void;
  showNextButton: boolean;
  isSubmitting: boolean;
}

function useTypingAnimation(text: string, speed: number = 30): { displayText: string; isComplete: boolean } {
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    setCharIndex(0);
  }, [text]);

  useEffect(() => {
    if (charIndex >= text.length) return;

    const timer = setTimeout(() => {
      setCharIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [charIndex, text, speed]);

  return {
    displayText: text.slice(0, charIndex),
    isComplete: charIndex >= text.length,
  };
}

const TONE_COLORS: Record<string, { border: string; bg: string; label: string; text: string }> = {
  honest: {
    border: "border-dw-green",
    bg: "bg-dw-green/10",
    label: "text-dw-green",
    text: "text-ink2",
  },
  deflect: {
    border: "border-dw-yellow",
    bg: "bg-dw-yellow/10",
    label: "text-dw-yellow",
    text: "text-ink2",
  },
  coachspeak: {
    border: "border-ink3",
    bg: "bg-ink3/10",
    label: "text-ink3",
    text: "text-ink2",
  },
  fiery: {
    border: "border-dw-red",
    bg: "bg-dw-red/10",
    label: "text-dw-red",
    text: "text-ink2",
  },
};

const TONE_LABELS: Record<string, string> = {
  honest: "Honest",
  deflect: "Deflect",
  coachspeak: "Coach-speak",
  fiery: "Fiery",
};

export default function QuestionDisplay({
  question,
  questionIndex,
  totalQuestions,
  responseOptions,
  isFollowUp,
  onAnswer,
  onNextQuestion,
  showNextButton,
  isSubmitting,
}: QuestionDisplayProps) {
  const [mode, setMode] = useState<ResponseMode>("choice");
  const [textAnswer, setTextAnswer] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);

  const { displayText, isComplete } = useTypingAnimation(question.question);

  useEffect(() => {
    setHasAnswered(false);
    setTextAnswer("");
    setMode("choice");
  }, [question.question]);

  const handleChoiceSelect = useCallback(
    (option: ResponseOption) => {
      if (hasAnswered || isSubmitting) return;
      setHasAnswered(true);
      onAnswer(option.text, option.tone, "choice");
    },
    [hasAnswered, isSubmitting, onAnswer]
  );

  const handleTextSubmit = useCallback(() => {
    if (!textAnswer.trim() || hasAnswered || isSubmitting) return;
    setHasAnswered(true);
    onAnswer(textAnswer.trim(), "honest", "text");
  }, [textAnswer, hasAnswered, isSubmitting, onAnswer]);

  const handleVoicePlaceholder = useCallback(() => {
    if (hasAnswered || isSubmitting) return;
    setHasAnswered(true);
    onAnswer("(Voice response recorded)", "honest", "voice");
  }, [hasAnswered, isSubmitting, onAnswer]);

  const questionToneColor =
    question.tone === "hostile" || question.tone === "gotcha"
      ? "text-dw-red"
      : question.tone === "friendly"
        ? "text-dw-green"
        : "text-ink3";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-sans text-xs uppercase tracking-widest text-ink3">
          {isFollowUp ? "Follow-up" : `Question ${questionIndex + 1} of ${totalQuestions}`}
        </p>
        <span className={cn("font-sans text-xs uppercase tracking-wider", questionToneColor)}>
          {question.tone}
        </span>
      </div>

      <div className="mb-6 rounded border border-dw-border bg-paper2 p-6">
        <div className="mb-3 flex items-baseline gap-2">
          <span className="font-headline text-sm uppercase tracking-wide text-ink">
            {question.reporterName}
          </span>
          <span className="font-serif text-xs italic text-ink3">
            {question.outlet}
          </span>
        </div>
        <div className="min-h-[3rem]">
          <p className="font-serif text-base leading-relaxed text-ink2">
            &ldquo;{displayText}
            {!isComplete && <span className="animate-pulse text-dw-accent">|</span>}
            {isComplete && "&rdquo;"}
          </p>
        </div>
      </div>

      {isComplete && !hasAnswered && (
        <div className="space-y-4">
          <div className="flex gap-1 rounded border border-dw-border bg-paper3 p-1">
            {(["choice", "text", "voice"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 rounded px-3 py-2 font-sans text-xs uppercase tracking-wider transition-colors",
                  mode === m
                    ? "bg-paper text-ink shadow-sm"
                    : "text-ink3 hover:text-ink2"
                )}
              >
                {m === "choice"
                  ? "Pick a Response"
                  : m === "text"
                    ? "Type Your Answer"
                    : "Speak"}
              </button>
            ))}
          </div>

          {mode === "choice" && responseOptions && (
            <div className="space-y-3">
              {responseOptions.map((option) => {
                const colors = TONE_COLORS[option.tone] ?? TONE_COLORS.coachspeak;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleChoiceSelect(option)}
                    disabled={isSubmitting}
                    className={cn(
                      "w-full rounded border p-4 text-left transition-all",
                      colors.border,
                      colors.bg,
                      "hover:shadow-md",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className={cn("font-sans text-xs font-semibold uppercase tracking-wider", colors.label)}>
                        {TONE_LABELS[option.tone] ?? option.tone}
                      </span>
                      <span className="font-sans text-xs text-ink3">&mdash; {option.label}</span>
                    </div>
                    <p className={cn("font-serif text-sm leading-relaxed", colors.text)}>
                      &ldquo;{option.text}&rdquo;
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {mode === "choice" && !responseOptions && (
            <div className="rounded border border-dw-border bg-paper3 p-6 text-center">
              <p className="font-serif text-sm text-ink3">
                No response options available. Switch to Type Your Answer mode.
              </p>
            </div>
          )}

          {mode === "text" && (
            <div className="space-y-3">
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Type your response as the coach..."
                rows={4}
                className={cn(
                  "w-full rounded border border-dw-border bg-paper p-4",
                  "font-serif text-sm text-ink placeholder:text-ink3",
                  "resize-none focus:border-dw-accent focus:outline-none focus:ring-1 focus:ring-dw-accent"
                )}
              />
              <button
                onClick={handleTextSubmit}
                disabled={!textAnswer.trim() || isSubmitting}
                className={cn(
                  "rounded border border-dw-accent bg-dw-accent px-6 py-2",
                  "font-sans text-xs uppercase tracking-wider text-paper",
                  "transition-colors hover:bg-dw-accent2 hover:border-dw-accent2",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          )}

          {mode === "voice" && (
            <div className="flex flex-col items-center gap-3 rounded border border-dw-border bg-paper3 p-8">
              <button
                onClick={handleVoicePlaceholder}
                disabled={isSubmitting}
                className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-full",
                  "border-2 border-dw-accent bg-paper transition-all",
                  "hover:bg-dw-accent/10 hover:shadow-lg",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-dw-accent"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </button>
              <p className="font-sans text-xs uppercase tracking-wider text-ink3">
                Hold to Speak
              </p>
              <p className="font-serif text-xs italic text-ink3">
                Voice integration coming soon. Tap to simulate a response.
              </p>
            </div>
          )}
        </div>
      )}

      {hasAnswered && showNextButton && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onNextQuestion}
            className={cn(
              "rounded border border-dw-accent bg-dw-accent px-6 py-2",
              "font-sans text-xs uppercase tracking-wider text-paper",
              "transition-colors hover:bg-dw-accent2 hover:border-dw-accent2"
            )}
          >
            Next Question
          </button>
        </div>
      )}

      {isSubmitting && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-dw-accent" />
          <p className="font-sans text-xs uppercase tracking-wider text-ink3">
            Reporters are reacting...
          </p>
        </div>
      )}
    </div>
  );
}
