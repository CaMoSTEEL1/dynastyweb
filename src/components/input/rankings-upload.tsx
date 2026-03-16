"use client";

import { useState, useRef, useCallback } from "react";
import { Trophy, Loader2, AlertCircle, RotateCcw, X } from "lucide-react";
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

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; previewUrl: string }
  | { status: "error"; message: string }
  | {
      status: "done";
      rankings: Array<{ rank: number; team: string; record: string }>;
      userRanking: number | null;
    };

export default function RankingsUpload({
  onRankingsExtracted,
  school,
}: RankingsUploadProps) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setState({
          status: "error",
          message: "Please upload a PNG, JPEG, or WebP image.",
        });
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setState({ status: "error", message: "File is too large. Maximum size is 10MB." });
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setState({ status: "uploading", previewUrl });

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
          throw new Error(
            (body as { error?: string }).error || `Server error ${response.status}`
          );
        }

        const data = (await response.json()) as {
          success: boolean;
          rankings: Array<{ rank: number; team: string; record: string }>;
          userRanking: number | null;
          error?: string;
        };

        if (!data.success) {
          throw new Error(data.error || "Could not extract rankings");
        }

        URL.revokeObjectURL(previewUrl);
        setState({
          status: "done",
          rankings: data.rankings,
          userRanking: data.userRanking,
        });
        onRankingsExtracted(data.rankings, data.userRanking);
      } catch (err) {
        URL.revokeObjectURL(previewUrl);
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        setState({ status: "error", message });
      }
    },
    [school, onRankingsExtracted]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleReset = useCallback(() => {
    setState({ status: "idle" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload rankings screenshot"
      />

      {state.status === "idle" && (
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

      {state.status === "uploading" && (
        <div className="flex items-center gap-3 rounded border border-dw-border bg-paper3 px-4 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-dw-accent" />
          <span className="font-serif text-xs italic text-ink2">
            Reading rankings...
          </span>
        </div>
      )}

      {state.status === "error" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded border border-dw-red/30 bg-dw-red/10 px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-dw-red" />
            <span className="font-sans text-xs text-dw-red">{state.message}</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 font-sans text-xs text-ink3 underline hover:text-ink2"
          >
            <RotateCcw className="h-3 w-3" />
            Try again
          </button>
        </div>
      )}

      {state.status === "done" && (
        <div className="space-y-2">
          <div className="rounded border border-dw-green/30 bg-dw-green/10 px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-dw-green" />
                <span className="font-sans text-xs text-dw-green">
                  {state.rankings.length} teams extracted
                  {state.userRanking !== null && ` — ${school} ranked #${state.userRanking}`}
                </span>
              </div>
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
          {state.rankings.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded border border-dw-border bg-paper3 p-2">
              <div className="grid grid-cols-[2rem_1fr_4rem] gap-x-2 gap-y-0.5">
                {state.rankings.map((entry) => (
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
          )}
        </div>
      )}
    </div>
  );
}
