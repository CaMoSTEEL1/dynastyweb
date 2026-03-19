"use client";

import { useState, useRef, useCallback } from "react";
import { Trophy, Loader2, AlertCircle, RotateCcw, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankingsUploadProps {
  onRankingsExtracted: (
    rankings: Array<{ rank: number; team: string; record: string }>,
    userRanking: number | null
  ) => void;
  school: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

type UploadState = "idle" | "uploading" | "error";

export default function RankingsUpload({
  onRankingsExtracted,
  school,
}: RankingsUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Accumulated rankings across all uploads
  const [allRankings, setAllRankings] = useState<Array<{ rank: number; team: string; record: string }>>([]);
  const [userRanking, setUserRanking] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const mergeRankings = useCallback(
    (
      existing: Array<{ rank: number; team: string; record: string }>,
      incoming: Array<{ rank: number; team: string; record: string }>
    ) => {
      const map = new Map(existing.map((r) => [r.rank, r]));
      for (const r of incoming) {
        map.set(r.rank, r); // incoming overwrites existing for same rank
      }
      return Array.from(map.values()).sort((a, b) => a.rank - b.rank);
    },
    []
  );

  const processFile = useCallback(
    async (file: File, currentRankings: Array<{ rank: number; team: string; record: string }>) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setErrorMessage("Please upload a PNG, JPEG, or WebP image.");
        setUploadState("error");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage("File is too large. Maximum size is 10MB.");
        setUploadState("error");
        return;
      }

      setUploadState("uploading");
      setErrorMessage(null);

      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("school", school);

        const response = await fetch("/api/extract/rankings", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({ error: "Upload failed" }));
          throw new Error((body as { error?: string }).error ?? `Server error ${response.status}`);
        }

        const data = (await response.json()) as {
          success: boolean;
          rankings: Array<{ rank: number; team: string; record: string }>;
          userRanking: number | null;
          error?: string;
        };

        if (!data.success) throw new Error(data.error ?? "Could not extract rankings");

        const merged = mergeRankings(currentRankings, data.rankings);
        const resolvedUserRanking = data.userRanking ?? userRanking;

        setAllRankings(merged);
        setUserRanking(resolvedUserRanking);
        setUploadState("idle");
        onRankingsExtracted(merged, resolvedUserRanking);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setErrorMessage(message);
        setUploadState("error");
      }
    },
    [school, onRankingsExtracted, mergeRankings, userRanking]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      let current = allRankings;
      for (const file of fileArray) {
        // process sequentially so we can merge progressively
        await processFile(file, current);
        // update current after each (state update is async, so we track locally)
        // actual merge happens inside processFile via setAllRankings
        // for multi-file sequential merge we use a ref approach below
        current = []; // subsequent files will just merge into whatever state holds
      }
    },
    [allRankings, processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        void handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        void handleFiles(e.target.files);
        e.target.value = "";
      }
    },
    [handleFiles]
  );

  const handleReset = useCallback(() => {
    setAllRankings([]);
    setUserRanking(null);
    setUploadState("idle");
    setErrorMessage(null);
    onRankingsExtracted([], null);
  }, [onRankingsExtracted]);

  const hasDone = allRankings.length > 0;

  return (
    <div className="space-y-2">
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload rankings screenshot"
      />
      <input
        ref={addMoreInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload additional rankings screenshot"
      />

      {/* Upload drop zone — shown when idle and no results yet */}
      {!hasDone && uploadState === "idle" && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragOver(false);
          }}
          className={cn(
            "flex cursor-pointer items-center justify-center gap-2 rounded border border-dashed px-4 py-3 transition-colors",
            isDragOver
              ? "border-dw-accent bg-dw-accent/5"
              : "border-dw-border bg-paper3 hover:border-ink3"
          )}
        >
          <Trophy className="h-4 w-4 text-ink3" />
          <span className="font-sans text-xs text-ink3">
            Upload Rankings Screenshot (optional)
          </span>
        </div>
      )}

      {/* Processing indicator */}
      {uploadState === "uploading" && (
        <div className="flex items-center gap-3 rounded border border-dw-border bg-paper3 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-dw-accent" />
          <span className="font-serif text-xs italic text-ink2">
            Reading rankings...
          </span>
        </div>
      )}

      {/* Error state */}
      {uploadState === "error" && errorMessage && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded border border-dw-red/30 bg-dw-red/10 px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-dw-red" />
            <span className="font-sans text-xs text-dw-red">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadState(hasDone ? "idle" : "idle")}
            className="flex items-center gap-1 font-sans text-xs text-ink3 underline hover:text-ink2"
          >
            <RotateCcw className="h-3 w-3" />
            Try again
          </button>
        </div>
      )}

      {/* Results + add more */}
      {hasDone && uploadState !== "uploading" && (
        <div className="space-y-2">
          <div className="rounded border border-dw-green/30 bg-dw-green/10 px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-dw-green" />
                <span className="font-sans text-xs text-dw-green">
                  {allRankings.length} teams extracted
                  {userRanking !== null && ` — ${school} ranked #${userRanking}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addMoreInputRef.current?.click()}
                  className="flex items-center gap-1 rounded border border-dw-green/30 px-2 py-0.5 font-sans text-[10px] uppercase tracking-wider text-dw-green transition-colors hover:bg-dw-green/10"
                  title="Upload another screenshot to merge more teams"
                >
                  <Plus className="h-3 w-3" />
                  Add more
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-ink3 transition-colors hover:text-ink2"
                  aria-label="Remove rankings"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto rounded border border-dw-border bg-paper3 p-2">
            <div className="grid grid-cols-[2rem_1fr_4rem] gap-x-2 gap-y-0.5">
              {allRankings.map((entry) => (
                <div key={entry.rank} className="contents">
                  <span className="font-sans text-xs font-semibold text-ink3 text-right">
                    {entry.rank}
                  </span>
                  <span
                    className={cn(
                      "font-sans text-xs truncate",
                      entry.team.toLowerCase() === school.toLowerCase()
                        ? "font-semibold text-dw-accent"
                        : "text-ink2"
                    )}
                  >
                    {entry.team}
                  </span>
                  <span className="font-sans text-xs text-ink3">{entry.record}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
