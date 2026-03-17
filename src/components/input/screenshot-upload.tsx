"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  X,
  Loader2,
  AlertCircle,
  RotateCcw,
  Smartphone,
  Plus,
  CheckCircle,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExtractionResult } from "@/lib/extraction/types";

interface ScreenshotUploadProps {
  onExtracted: (result: ExtractionResult) => void;
  week: number;
  school: string;
  conference: string;
  label?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_FILES = 6;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

const UPLOAD_TIPS = [
  { label: "Box Score", description: "Final score with quarter-by-quarter breakdown" },
  { label: "Player Stats", description: "Individual stat leaders, MVP screen, or stat summary" },
  { label: "Rankings", description: "AP Top 25 or CFP rankings screen" },
  { label: "Recruiting", description: "Recruit offers, commitments, or decommitments" },
  { label: "Post-Game", description: "Game recap, highlights, or notable moments" },
  { label: "Roster", description: "Depth chart or roster screen for star player names" },
] as const;

interface FileEntry {
  id: string;
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "done" | "error";
  errorMessage?: string;
}

export default function ScreenshotUpload({
  onExtracted,
  week,
  school,
  conference,
}: ScreenshotUploadProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    );
  }, []);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `${file.name}: Must be PNG, JPEG, or WebP`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: Exceeds 10MB limit`;
    }
    return null;
  }, []);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      setGlobalError(null);
      const remaining = MAX_FILES - files.length;

      if (remaining <= 0) {
        setGlobalError(`Maximum ${MAX_FILES} screenshots allowed`);
        return;
      }

      const toAdd = newFiles.slice(0, remaining);
      if (newFiles.length > remaining) {
        setGlobalError(
          `Only ${remaining} more screenshot${remaining === 1 ? "" : "s"} allowed (max ${MAX_FILES})`
        );
      }

      const errors: string[] = [];
      const validEntries: FileEntry[] = [];

      for (const file of toAdd) {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
          continue;
        }
        validEntries.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          status: "pending",
        });
      }

      if (errors.length > 0) {
        setGlobalError(errors.join(". "));
      }

      if (validEntries.length > 0) {
        setFiles((prev) => [...prev, ...validEntries]);
      }
    },
    [files.length, validateFile]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const entry = prev.find((f) => f.id === id);
      if (entry) URL.revokeObjectURL(entry.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleExtractAll = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsExtracting(true);
    setGlobalError(null);

    // Mark all pending as uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "pending" ? { ...f, status: "uploading" as const } : f
      )
    );

    let mergedResult: ExtractionResult | null = null;
    let anySuccess = false;

    // Process files sequentially to avoid overwhelming the API
    for (const entry of pendingFiles) {
      try {
        const formData = new FormData();
        formData.append("image", entry.file);
        formData.append("week", String(week));
        formData.append("school", school);
        formData.append("conference", conference);

        const response = await fetch("/api/extract/image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const body = await response
            .json()
            .catch(() => ({ error: "Upload failed" }));
          throw new Error(
            (body as { error?: string }).error ||
              `Server error ${response.status}`
          );
        }

        const data = (await response.json()) as {
          success: boolean;
          result: ExtractionResult | null;
          error?: string;
        };

        if (!data.success || !data.result) {
          throw new Error(data.error || "Extraction failed");
        }

        // Merge this result with accumulated results
        if (!mergedResult) {
          mergedResult = data.result;
        } else {
          mergedResult = mergeResults(mergedResult, data.result);
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id ? { ...f, status: "done" as const } : f
          )
        );
        anySuccess = true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: "error" as const, errorMessage: message }
              : f
          )
        );
      }
    }

    setIsExtracting(false);

    if (anySuccess && mergedResult) {
      onExtracted(mergedResult);
    } else if (!anySuccess) {
      setGlobalError("All extractions failed. Try again or use text input.");
    }
  }, [files, week, school, conference, onExtracted]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        addFiles(droppedFiles);
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files ?? []);
      if (selected.length > 0) {
        addFiles(selected);
      }
      e.target.value = "";
    },
    [addFiles]
  );

  const handleClickZone = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleTakePhoto = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    cameraInputRef.current?.click();
  }, []);

  const handleRetryFailed = useCallback(() => {
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "error"
          ? { ...f, status: "pending" as const, errorMessage: undefined }
          : f
      )
    );
  }, []);

  const handleClearAll = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setGlobalError(null);
  }, [files]);

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const canAddMore = files.length < MAX_FILES;

  return (
    <div className="space-y-4">
      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload screenshots"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Take a photo"
      />

      {/* Upload guidance */}
      <div className="rounded border border-dw-border bg-paper2 p-4">
        <h4 className="font-headline text-xs uppercase tracking-wider text-ink3">
          What to Upload
        </h4>
        <p className="mt-1 font-serif text-xs italic text-ink3">
          The more you provide, the richer your media cycle. Upload up to{" "}
          {MAX_FILES} screenshots.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {UPLOAD_TIPS.map((tip) => (
            <div key={tip.label} className="flex items-start gap-2">
              <ImageIcon className="mt-0.5 h-3 w-3 shrink-0 text-dw-accent" />
              <div>
                <p className="font-sans text-xs font-medium text-ink">
                  {tip.label}
                </p>
                <p className="font-serif text-[10px] leading-tight text-ink3">
                  {tip.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drop zone — shown when no files or can still add */}
      {canAddMore && (
        <div className="space-y-2">
          <div
            role="button"
            tabIndex={0}
            onClick={handleClickZone}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleClickZone();
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded border-2 border-dashed p-6 transition-colors",
              files.length > 0 ? "min-h-[100px]" : "min-h-[160px]",
              isDragOver
                ? "border-dw-accent bg-dw-accent/5"
                : "border-dw-border bg-paper3 hover:border-ink3"
            )}
          >
            {files.length === 0 ? (
              <Camera className="h-8 w-8 text-ink3" />
            ) : (
              <Plus className="h-6 w-6 text-ink3" />
            )}
            <div className="text-center">
              <p className="hidden font-sans text-sm text-ink2 sm:block">
                {files.length === 0
                  ? "Drop your screenshots here or click to browse"
                  : "Add more screenshots"}
              </p>
              <p className="font-sans text-sm text-ink2 sm:hidden">
                {files.length === 0
                  ? "Tap to upload or take a photo"
                  : "Tap to add more"}
              </p>
              <p className="mt-1 font-sans text-xs text-ink3">
                PNG, JPEG, or WebP — max 10MB each —{" "}
                {files.length}/{MAX_FILES} uploaded
              </p>
            </div>
          </div>

          {isTouchDevice && files.length === 0 && (
            <button
              type="button"
              onClick={handleTakePhoto}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded border border-dw-border bg-paper2 px-4 py-3 transition-colors",
                "hover:bg-paper3"
              )}
            >
              <Smartphone className="h-4 w-4 text-ink3" />
              <span className="font-sans text-sm text-ink2">Take a Photo</span>
            </button>
          )}
        </div>
      )}

      {/* File thumbnails grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {files.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "relative overflow-hidden rounded border bg-paper3",
                entry.status === "done"
                  ? "border-green-500/40"
                  : entry.status === "error"
                    ? "border-dw-red/40"
                    : "border-dw-border"
              )}
            >
              <img
                src={entry.previewUrl}
                alt={entry.file.name}
                className={cn(
                  "aspect-square w-full object-cover",
                  entry.status === "uploading" && "opacity-40"
                )}
              />

              {/* Status overlay */}
              {entry.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-paper/50">
                  <Loader2 className="h-5 w-5 animate-spin text-dw-accent" />
                </div>
              )}
              {entry.status === "done" && (
                <div className="absolute inset-0 flex items-center justify-center bg-paper/30">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
              )}
              {entry.status === "error" && (
                <div className="absolute inset-0 flex items-center justify-center bg-paper/50">
                  <AlertCircle className="h-5 w-5 text-dw-red" />
                </div>
              )}

              {/* Remove button — only when not extracting */}
              {!isExtracting && entry.status !== "uploading" && (
                <button
                  type="button"
                  onClick={() => removeFile(entry.id)}
                  className="absolute right-1 top-1 rounded-full bg-paper/80 p-0.5 text-ink3 transition-colors hover:text-ink"
                  aria-label={`Remove ${entry.file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Error tooltip */}
              {entry.status === "error" && entry.errorMessage && (
                <div className="absolute bottom-0 left-0 right-0 bg-dw-red/90 px-1.5 py-1">
                  <p className="truncate font-sans text-[9px] text-white">
                    {entry.errorMessage}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Add more button in grid */}
          {canAddMore && files.length > 0 && (
            <button
              type="button"
              onClick={handleClickZone}
              className={cn(
                "flex aspect-square items-center justify-center rounded border-2 border-dashed border-dw-border bg-paper3",
                "transition-colors hover:border-ink3"
              )}
              aria-label="Add more screenshots"
            >
              <Plus className="h-6 w-6 text-ink3" />
            </button>
          )}
        </div>
      )}

      {/* Mobile camera for additional photos */}
      {isTouchDevice && files.length > 0 && canAddMore && (
        <button
          type="button"
          onClick={handleTakePhoto}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded border border-dw-border bg-paper2 px-4 py-2.5 transition-colors",
            "hover:bg-paper3"
          )}
        >
          <Smartphone className="h-4 w-4 text-ink3" />
          <span className="font-sans text-xs text-ink2">Take Another Photo</span>
        </button>
      )}

      {/* Global error */}
      {globalError && (
        <div className="rounded border border-dw-red/30 bg-dw-red/10 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-dw-red" />
            <p className="font-sans text-sm text-dw-red">{globalError}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {files.length > 0 && (
        <div className="flex gap-3">
          {errorCount > 0 && !isExtracting && (
            <button
              type="button"
              onClick={handleRetryFailed}
              className={cn(
                "flex items-center gap-2 rounded border border-dw-border bg-paper2 px-4 py-2.5",
                "font-sans text-xs font-medium text-ink2 transition-colors hover:bg-paper3"
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retry Failed
            </button>
          )}

          {!isExtracting && doneCount === 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className={cn(
                "rounded border border-dw-border bg-paper2 px-4 py-2.5",
                "font-sans text-xs font-medium text-ink2 transition-colors hover:bg-paper3"
              )}
            >
              Clear All
            </button>
          )}

          {pendingCount > 0 && !isExtracting && (
            <button
              type="button"
              onClick={handleExtractAll}
              className={cn(
                "ml-auto flex-1 rounded bg-dw-accent px-4 py-2.5",
                "font-sans text-sm font-semibold uppercase tracking-wider text-white",
                "transition-colors hover:bg-dw-accent2"
              )}
            >
              Extract from {pendingCount} Screenshot
              {pendingCount !== 1 ? "s" : ""}
            </button>
          )}

          {isExtracting && (
            <div className="ml-auto flex items-center gap-2 px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-dw-accent" />
              <span className="font-serif text-xs italic text-ink2">
                Processing {files.filter((f) => f.status === "uploading").length > 0
                  ? `${doneCount + 1} of ${pendingCount + doneCount}`
                  : "..."}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Merges two extraction results, keeping the higher-confidence value for each field.
 */
function mergeResults(
  a: ExtractionResult,
  b: ExtractionResult
): ExtractionResult {
  const confidenceRank: Record<string, number> = {
    high: 4,
    medium: 3,
    low: 2,
    missing: 1,
  };

  const merged = { ...a };
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
    const aField = a[key];
    const bField = b[key];

    if (bField === null) continue;
    if (aField === null) {
      (merged as Record<string, unknown>)[key] = bField;
      continue;
    }

    if (
      typeof aField === "object" &&
      "confidence" in aField &&
      typeof bField === "object" &&
      "confidence" in bField
    ) {
      const aRank = confidenceRank[aField.confidence] || 0;
      const bRank = confidenceRank[bField.confidence] || 0;

      // For arrays (statLeaders, recruitUpdates), merge rather than replace
      if (key === "statLeaders" || key === "recruitUpdates") {
        if (Array.isArray(aField.value) && Array.isArray(bField.value)) {
          const combinedValue = [...aField.value, ...bField.value];
          (merged as Record<string, unknown>)[key] = {
            value: combinedValue,
            confidence: bRank >= aRank ? bField.confidence : aField.confidence,
            source: bField.source,
          };
          continue;
        }
      }

      if (bRank > aRank) {
        (merged as Record<string, unknown>)[key] = bField;
      }
    }
  }

  return merged;
}
