"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type VoiceState = "idle" | "loading" | "playing" | "done" | "error";

interface ReporterVoiceButtonProps {
  questionText: string;
  reporterName: string;
  autoPlay?: boolean;
  className?: string;
}

export function ReporterVoiceButton({
  questionText,
  reporterName,
  autoPlay = false,
  className,
}: ReporterVoiceButtonProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const hasAutoPlayedRef = useRef(false);

  const cleanupAudio = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  const playQuestion = useCallback(async () => {
    if (state === "loading") return;

    // Resume if already loaded
    if (state === "playing" && audioRef.current) {
      audioRef.current.pause();
      setState("done");
      return;
    }

    setState("loading");
    cleanupAudio();

    try {
      const res = await fetch("/api/audio/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionText, reporterName }),
      });

      if (!res.ok) {
        // Silently fail — audio is optional enhancement
        setState("error");
        return;
      }

      const buffer = await res.arrayBuffer();
      const blob = new Blob([buffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setState("done");
        cleanupAudio();
      };
      audio.onerror = () => {
        setState("error");
        cleanupAudio();
      };

      await audio.play();
      setState("playing");
    } catch {
      setState("error");
    }
  }, [state, questionText, reporterName, cleanupAudio]);

  // Auto-play when question changes
  useEffect(() => {
    hasAutoPlayedRef.current = false;
    setState("idle");
    cleanupAudio();
  }, [questionText, cleanupAudio]);

  useEffect(() => {
    if (autoPlay && !hasAutoPlayedRef.current && state === "idle") {
      hasAutoPlayedRef.current = true;
      void playQuestion();
    }
  }, [autoPlay, state, playQuestion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => cleanupAudio();
  }, [cleanupAudio]);

  if (state === "error") return null; // Silently hide if unavailable

  return (
    <button
      type="button"
      onClick={() => void playQuestion()}
      disabled={state === "loading"}
      title={state === "playing" ? "Stop" : `Hear ${reporterName} ask this question`}
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-sans text-[10px] uppercase tracking-wider transition-colors",
        "border border-dw-border text-ink3",
        state === "playing"
          ? "border-dw-accent/40 bg-dw-accent/10 text-dw-accent"
          : "hover:border-dw-accent/30 hover:text-ink2",
        "disabled:opacity-50",
        className
      )}
      aria-label={state === "playing" ? "Stop audio" : "Play reporter voice"}
    >
      {state === "loading" ? (
        <Loader2 className="h-2.5 w-2.5 animate-spin" />
      ) : state === "playing" ? (
        <>
          <VolumeX className="h-2.5 w-2.5" />
          <span>Stop</span>
          {/* Animated dot */}
          <span className="h-1 w-1 rounded-full bg-dw-accent animate-pulse" />
        </>
      ) : (
        <>
          <Volume2 className="h-2.5 w-2.5" />
          <span>Hear it</span>
        </>
      )}
    </button>
  );
}
