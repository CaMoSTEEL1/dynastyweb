"use client";

import { cn } from "@/lib/utils";
import type { OffseasonPhaseConfig } from "@/lib/offseason/types";

type PhaseStatus = "locked" | "available" | "completed" | "loading";

interface OffseasonPhaseCardProps {
  config: OffseasonPhaseConfig;
  status: PhaseStatus;
  onClick: () => void;
}

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-dw-accent"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5 text-dw-green"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="h-5 w-5 text-ink3"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

export function OffseasonPhaseCard({
  config,
  status,
  onClick,
}: OffseasonPhaseCardProps) {
  const isClickable = status === "available" || status === "completed";

  return (
    <button
      type="button"
      disabled={status === "locked" || status === "loading"}
      onClick={onClick}
      className={cn(
        "w-full rounded-sm border px-5 py-4 text-left transition-all duration-200",
        "bg-paper2",
        status === "locked" && "border-dw-border opacity-50 cursor-not-allowed",
        status === "available" &&
          "border-dw-accent hover:border-dw-accent2 cursor-pointer hover:shadow-md",
        status === "completed" &&
          "border-dw-green/40 cursor-pointer hover:shadow-sm",
        status === "loading" && "border-dw-accent/50 cursor-wait"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-headline text-sm uppercase tracking-wider",
              status === "locked" ? "text-ink3" : "text-ink"
            )}
          >
            {config.title}
          </h3>
          <p
            className={cn(
              "mt-0.5 font-serif text-xs italic",
              status === "locked" ? "text-ink3" : "text-ink2"
            )}
          >
            {config.subtitle}
          </p>
          <p
            className={cn(
              "mt-2 font-sans text-sm leading-relaxed",
              status === "locked" ? "text-ink3" : "text-ink2"
            )}
          >
            {config.description}
          </p>
        </div>

        <div className="flex-shrink-0 mt-1">
          {status === "locked" && <LockIcon />}
          {status === "available" && (
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-dw-accent animate-pulse" />
          )}
          {status === "completed" && <CheckIcon />}
          {status === "loading" && <Spinner />}
        </div>
      </div>

      {isClickable && status === "available" && (
        <div className="mt-3 pt-3 border-t border-dw-border">
          <span className="font-sans text-xs uppercase tracking-wider text-dw-accent">
            Generate Content
          </span>
        </div>
      )}

      {status === "completed" && (
        <div className="mt-3 pt-3 border-t border-dw-border">
          <span className="font-sans text-xs uppercase tracking-wider text-dw-green">
            View Content
          </span>
        </div>
      )}
    </button>
  );
}
