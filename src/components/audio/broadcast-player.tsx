"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AudioSegment {
  index: number;
  speaker: string;
  role: string;
  audioUrl: string;
}

type PlayerState = "idle" | "loading" | "ready" | "playing" | "paused" | "done" | "error";

interface BroadcastPlayerProps {
  submissionId: string;
  contentType: string;
  dynastyId: string;
  showTitle?: string;
  accentColor?: string; // tailwind text color class
}

// CSS waveform bars — purely decorative, no real audio data needed
function WaveformBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-4">
      {[0.4, 0.7, 1, 0.6, 0.85, 0.5, 0.9, 0.65, 0.45, 0.75].map((height, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] rounded-sm bg-dw-accent transition-all",
            active ? "animate-pulse" : "opacity-30"
          )}
          style={{
            height: `${height * 100}%`,
            animationDelay: active ? `${i * 80}ms` : "0ms",
            animationDuration: active ? `${600 + i * 60}ms` : "0ms",
          }}
        />
      ))}
    </div>
  );
}

export function BroadcastPlayer({
  submissionId,
  contentType,
  dynastyId,
  showTitle,
  accentColor = "text-dw-accent",
}: BroadcastPlayerProps) {
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null); // preloaded next segment
  const segmentsRef = useRef<AudioSegment[]>([]);
  const currentIndexRef = useRef(0);
  const stateRef = useRef<PlayerState>("idle");

  // Keep refs in sync
  segmentsRef.current = segments;
  currentIndexRef.current = currentSegmentIndex;
  stateRef.current = playerState;

  const playSegmentAt = useCallback((index: number, segs: AudioSegment[]) => {
    if (index >= segs.length) {
      setPlayerState("done");
      setCurrentSegmentIndex(0);
      nextAudioRef.current = null;
      return;
    }

    // Use preloaded audio if available (eliminates gap between segments)
    const audio = nextAudioRef.current ?? new Audio(segs[index].audioUrl);
    nextAudioRef.current = null;
    audioRef.current = audio;

    // Immediately preload the next segment so it's ready when this one ends
    if (index + 1 < segs.length) {
      const preloaded = new Audio(segs[index + 1].audioUrl);
      preloaded.preload = "auto";
      nextAudioRef.current = preloaded;
    }

    audio.onended = () => {
      if (stateRef.current === "playing") {
        const next = index + 1;
        setCurrentSegmentIndex(next);
        playSegmentAt(next, segmentsRef.current);
      }
    };

    audio.onerror = () => {
      setPlayerState("error");
      setError("Failed to play audio segment.");
    };

    setCurrentSegmentIndex(index);
    setPlayerState("playing");
    void audio.play();
  }, []);

  const handlePlay = useCallback(async () => {
    // Resume paused
    if (playerState === "paused" && audioRef.current) {
      void audioRef.current.play();
      setPlayerState("playing");
      return;
    }

    // Restart from done
    if (playerState === "done" && segments.length > 0) {
      playSegmentAt(0, segments);
      return;
    }

    // Already have segments (cached)
    if (playerState === "ready" && segments.length > 0) {
      playSegmentAt(0, segments);
      return;
    }

    // Need to generate
    setPlayerState("loading");
    setError(null);

    try {
      const res = await fetch("/api/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId, contentType, dynastyId }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Generation failed");
      }

      const data = (await res.json()) as { segments: AudioSegment[] };
      setSegments(data.segments);
      playSegmentAt(0, data.segments);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Audio generation failed";
      setError(msg);
      setPlayerState("error");
    }
  }, [playerState, segments, submissionId, contentType, dynastyId, playSegmentAt]);

  const handlePause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayerState("paused");
    }
  }, []);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    nextAudioRef.current = null;
    setPlayerState(segments.length > 0 ? "ready" : "idle");
    setCurrentSegmentIndex(0);
  }, [segments.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      nextAudioRef.current = null;
    };
  }, []);

  const currentSegment = segments[currentSegmentIndex];
  const isPlaying = playerState === "playing";
  const isLoading = playerState === "loading";
  const hasSegments = segments.length > 0;

  if (playerState === "error") {
    return (
      <div className="mb-6 rounded border border-dw-red/30 bg-dw-red/10 px-4 py-3">
        <p className="font-sans text-xs text-dw-red">
          {error ?? "Audio unavailable."}
          {error?.includes("not configured") && (
            <span className="ml-1 opacity-70">Set ELEVENLABS_API_KEY to enable broadcast audio.</span>
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded border border-dw-border bg-paper3/60 p-4">
      <div className="flex items-center gap-4">
        {/* Play/Pause/Stop controls */}
        <div className="flex items-center gap-2 shrink-0">
          {isPlaying ? (
            <>
              <button
                type="button"
                onClick={handlePause}
                className="flex h-9 w-9 items-center justify-center rounded border border-dw-accent bg-dw-accent/10 text-dw-accent transition-colors hover:bg-dw-accent/20"
                aria-label="Pause"
              >
                <Pause className="h-4 w-4 fill-current" />
              </button>
              <button
                type="button"
                onClick={handleStop}
                className="flex h-7 w-7 items-center justify-center rounded border border-dw-border text-ink3 transition-colors hover:border-dw-red/50 hover:text-dw-red"
                aria-label="Stop"
              >
                <Square className="h-3 w-3 fill-current" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handlePlay}
              disabled={isLoading}
              className="flex h-9 w-9 items-center justify-center rounded border border-dw-accent bg-dw-accent/10 text-dw-accent transition-colors hover:bg-dw-accent/20 disabled:opacity-40"
              aria-label="Play broadcast"
            >
              {isLoading ? (
                <span className="h-3 w-3 rounded-full border-2 border-dw-accent border-t-transparent animate-spin" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
            </button>
          )}
        </div>

        {/* On Air / Speaker info */}
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dw-accent" />
              <span className="font-sans text-xs text-ink3 uppercase tracking-wider">
                Preparing broadcast...
              </span>
            </div>
          ) : isPlaying || playerState === "paused" ? (
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full bg-dw-red",
                    isPlaying && "animate-pulse"
                  )}
                />
                <span className="font-sans text-[10px] uppercase tracking-widest text-ink3">
                  {isPlaying ? "On Air" : "Paused"}
                </span>
              </div>
              {currentSegment && (
                <p className={cn("font-headline text-sm font-medium truncate", accentColor)}>
                  {currentSegment.speaker}
                  <span className="ml-1.5 font-sans text-xs font-normal text-ink3 not-italic normal-case tracking-normal">
                    · {currentSegment.role}
                  </span>
                </p>
              )}
            </div>
          ) : playerState === "done" ? (
            <div>
              <p className="font-sans text-xs text-ink3">
                Broadcast complete.{" "}
                <button
                  type="button"
                  onClick={handlePlay}
                  className="text-dw-accent hover:underline"
                >
                  Play again
                </button>
              </p>
            </div>
          ) : (
            <div>
              <p className="font-sans text-xs font-medium uppercase tracking-wider text-ink2">
                {showTitle ?? "Listen to Broadcast"}
              </p>
              <p className="font-sans text-[10px] text-ink3">
                {hasSegments
                  ? `${segments.length} segments ready`
                  : "AI voice · Generated on demand"}
              </p>
            </div>
          )}
        </div>

        {/* Waveform */}
        <div className="shrink-0">
          <WaveformBars active={isPlaying} />
        </div>

        {/* Segment progress */}
        {hasSegments && (
          <div className="shrink-0 text-right">
            <p className="font-sans text-[10px] tabular-nums text-ink3">
              {isPlaying || playerState === "paused"
                ? `${currentSegmentIndex + 1} / ${segments.length}`
                : `${segments.length} lines`}
            </p>
          </div>
        )}
      </div>

      {/* Segment dots */}
      {hasSegments && (isPlaying || playerState === "paused" || playerState === "done") && (
        <div className="mt-3 flex gap-1 flex-wrap">
          {segments.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i < currentSegmentIndex
                  ? "w-2 bg-dw-accent/40"
                  : i === currentSegmentIndex
                    ? "w-3 bg-dw-accent"
                    : "w-2 bg-dw-border"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
