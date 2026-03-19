"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { PressConfQuestion, ResponseOption } from "@/lib/ai/press-conference-types";

type ResponseMode = "choice" | "text" | "voice";
type VoiceState = "idle" | "recording" | "processing" | "review" | "error";

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

// CSS keyframe for waveform bars injected once
const WAVEFORM_STYLE = `
@keyframes waveform {
  0%, 100% { transform: scaleY(0.25); }
  50% { transform: scaleY(1); }
}
`;

const WAVEFORM_DELAYS = [0, 0.1, 0.2, 0.15, 0.05, 0.2, 0.1, 0.25, 0.12, 0.18];
const WAVEFORM_DURATIONS = [0.5, 0.6, 0.4, 0.7, 0.5, 0.45, 0.65, 0.55, 0.4, 0.6];

function WaveformBars() {
  return (
    <>
      <style>{WAVEFORM_STYLE}</style>
      <div className="flex items-center gap-0.5" style={{ height: "28px" }}>
        {WAVEFORM_DELAYS.map((delay, i) => (
          <div
            key={i}
            className="w-1 rounded-full bg-dw-red origin-center"
            style={{
              height: "24px",
              animation: `waveform ${WAVEFORM_DURATIONS[i]}s ease-in-out ${delay}s infinite alternate`,
            }}
          />
        ))}
      </div>
    </>
  );
}

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

  // Voice recording state
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { displayText, isComplete } = useTypingAnimation(question.question);

  useEffect(() => {
    setHasAnswered(false);
    setTextAnswer("");
    setMode("choice");
    setVoiceState("idle");
    setTranscript("");
    setVoiceError(null);
    setRecordingSeconds(0);
  }, [question.question]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

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

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      setVoiceState("recording");
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => setRecordingSeconds((prev) => prev + 1), 1000);
    } catch {
      setVoiceError("Microphone access denied. Please allow microphone access and try again.");
      setVoiceState("error");
    }
  }, []);

  const stopRecordingAndTranscribe = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const audioBlob = await new Promise<Blob>((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) return resolve(new Blob());
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        recorder.stream.getTracks().forEach((t) => t.stop());
        resolve(blob);
      };
      recorder.stop();
    });

    setVoiceState("processing");

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const res = await fetch("/api/audio/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Transcription failed");

      const data = (await res.json()) as { transcript: string };
      setTranscript(data.transcript ?? "");
      setVoiceState("review");
    } catch {
      setVoiceError("Transcription failed. Please try typing your answer instead.");
      setVoiceState("error");
    }
  }, []);

  const handleReRecord = useCallback(() => {
    setVoiceState("idle");
    setTranscript("");
    setVoiceError(null);
    setRecordingSeconds(0);
  }, []);

  const handleSubmitVoice = useCallback(() => {
    if (!transcript.trim() || hasAnswered || isSubmitting) return;
    setHasAnswered(true);
    onAnswer(transcript.trim(), "honest", "voice");
  }, [transcript, hasAnswered, isSubmitting, onAnswer]);

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
            {isComplete && "\u201D"}
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
            <div className="flex flex-col items-center gap-4 rounded border border-dw-border bg-paper3 p-4 sm:p-8">

              {voiceState === "idle" && (
                <>
                  <button
                    onClick={() => void startRecording()}
                    className={cn(
                      "flex h-20 w-20 items-center justify-center rounded-full",
                      "border-2 border-dw-accent bg-paper transition-all",
                      "hover:bg-dw-accent/10 hover:shadow-lg"
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
                    Tap to Start Recording
                  </p>
                </>
              )}

              {voiceState === "recording" && (
                <>
                  <WaveformBars />
                  <p className="font-sans text-xs font-semibold uppercase tracking-wider text-dw-red">
                    Recording... {recordingSeconds}s
                  </p>
                  <button
                    onClick={() => void stopRecordingAndTranscribe()}
                    className={cn(
                      "rounded border border-dw-red bg-dw-red px-6 py-2",
                      "font-sans text-xs uppercase tracking-wider text-paper",
                      "transition-colors hover:opacity-90"
                    )}
                  >
                    Stop Recording
                  </button>
                </>
              )}

              {voiceState === "processing" && (
                <>
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent [animation-delay:200ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-dw-accent [animation-delay:400ms]" />
                  </div>
                  <p className="font-sans text-xs uppercase tracking-wider text-ink3">
                    Transcribing...
                  </p>
                </>
              )}

              {voiceState === "review" && (
                <div className="w-full space-y-3">
                  <p className="font-sans text-xs uppercase tracking-wider text-ink3">
                    Your Answer
                  </p>
                  <div className="rounded border border-dw-border bg-paper p-4">
                    <p className="font-serif text-sm leading-relaxed text-ink">{transcript}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReRecord}
                      className={cn(
                        "rounded border border-dw-border px-4 py-2",
                        "font-sans text-xs uppercase tracking-wider text-ink3",
                        "transition-colors hover:border-ink2 hover:text-ink2"
                      )}
                    >
                      Re-record
                    </button>
                    <button
                      onClick={handleSubmitVoice}
                      disabled={!transcript.trim() || isSubmitting}
                      className={cn(
                        "flex-1 rounded border border-dw-accent bg-dw-accent px-6 py-2",
                        "font-sans text-xs uppercase tracking-wider text-paper",
                        "transition-colors hover:bg-dw-accent2 hover:border-dw-accent2",
                        "disabled:cursor-not-allowed disabled:opacity-50"
                      )}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Answer"}
                    </button>
                  </div>
                </div>
              )}

              {voiceState === "error" && (
                <div className="w-full space-y-3 text-center">
                  <p className="font-serif text-sm text-dw-red">{voiceError}</p>
                  <button
                    onClick={handleReRecord}
                    className={cn(
                      "rounded border border-dw-border px-4 py-2",
                      "font-sans text-xs uppercase tracking-wider text-ink3",
                      "transition-colors hover:border-ink2 hover:text-ink2"
                    )}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {hasAnswered && showNextButton && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onNextQuestion}
            className={cn(
              "w-full sm:w-auto rounded border border-dw-accent bg-dw-accent px-6 py-3 sm:py-2",
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
